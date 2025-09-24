"""Agent2Agent client for communicating with Cloud Run service."""

import requests
from typing import Optional, List
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from .models import QueryRequest, QueryResponse, Restaurant, Borough, Grade


class AgentClient:
    """Client for communicating with the Cloud Run agent."""
    
    def __init__(self, agent_url: str = "https://your-cloud-run-service-url.run.app", timeout: int = 30):
        self.agent_url = agent_url.rstrip('/')
        self.timeout = timeout
        self.console = Console()
        self.session = requests.Session()
        
    def query_restaurants(
        self,
        borough: Optional[Borough] = None,
        cuisine: Optional[str] = None,
        min_grade: Optional[Grade] = None,
        limit: int = 100
    ) -> QueryResponse:
        """Query restaurants via the Cloud Run agent."""
        
        request_data = QueryRequest(
            borough=borough,
            cuisine=cuisine,
            min_grade=min_grade,
            limit=limit
        )
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=self.console,
            transient=True,
        ) as progress:
            task = progress.add_task("Querying restaurants...", total=None)
            
            try:
                response = self.session.post(
                    f"{self.agent_url}/query",
                    json=request_data.model_dump(exclude_none=True),
                    timeout=self.timeout,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
                data = response.json()
                return QueryResponse(**data)
                
            except requests.exceptions.RequestException as e:
                # For demo purposes, return mock data when agent is not available
                self.console.print(f"[yellow]Warning: Could not connect to agent ({e}). Using mock data.[/yellow]")
                return self._get_mock_data(request_data)
    
    def get_geocoding(self, address: str) -> tuple[Optional[float], Optional[float]]:
        """Get geocoding information via agent chaining."""
        try:
            response = self.session.post(
                f"{self.agent_url}/geocode",
                json={"address": address},
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            return data.get("latitude"), data.get("longitude")
        except requests.exceptions.RequestException:
            # Return None for geocoding if service unavailable
            return None, None
    
    def send_alert(self, message: str, alert_type: str = "INFO") -> bool:
        """Send alert via agent chaining."""
        try:
            response = self.session.post(
                f"{self.agent_url}/alert",
                json={"message": message, "type": alert_type},
                timeout=self.timeout
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException:
            return False
    
    def _get_mock_data(self, request: QueryRequest) -> QueryResponse:
        """Generate mock data for demonstration purposes."""
        mock_restaurants = [
            Restaurant(
                dba="Joe's Pizza",
                boro=Borough.MANHATTAN,
                building="123",
                street="Broadway",
                zipcode="10001",
                cuisine_description="Pizza",
                grade=Grade.A,
                score=12,
                inspection_date="2023-10-15",
                latitude=40.7589,
                longitude=-73.9851
            ),
            Restaurant(
                dba="Brooklyn Deli",
                boro=Borough.BROOKLYN,
                building="456",
                street="Atlantic Ave",
                zipcode="11201",
                cuisine_description="Delicatessen",
                grade=Grade.B,
                score=18,
                inspection_date="2023-10-14",
                latitude=40.6892,
                longitude=-73.9442
            ),
            Restaurant(
                dba="Queens Bistro",
                boro=Borough.QUEENS,
                building="789",
                street="Northern Blvd",
                zipcode="11101",
                cuisine_description="American",
                grade=Grade.A,
                score=8,
                inspection_date="2023-10-13",
                latitude=40.7282,
                longitude=-73.9442
            ),
        ]
        
        # Filter mock data based on request
        filtered_restaurants = []
        for restaurant in mock_restaurants:
            if request.borough and restaurant.boro != request.borough:
                continue
            if request.cuisine and request.cuisine.lower() not in restaurant.cuisine_description.lower():
                continue
            if request.min_grade:
                grade_order = {"A": 1, "B": 2, "C": 3, "P": 4, "Z": 5}
                if (restaurant.grade and 
                    grade_order.get(restaurant.grade.value, 5) > grade_order.get(request.min_grade.value, 5)):
                    continue
            filtered_restaurants.append(restaurant)
        
        return QueryResponse(
            restaurants=filtered_restaurants[:request.limit],
            total_count=len(filtered_restaurants),
            query_info={
                "mock_data": True,
                "filters_applied": {
                    "borough": request.borough.value if request.borough else None,
                    "cuisine": request.cuisine,
                    "min_grade": request.min_grade.value if request.min_grade else None
                }
            }
        )