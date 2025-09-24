"""Rich-based display utilities for the CLI."""

import os
import tempfile
from typing import List, Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Confirm

from .models import Restaurant, QueryResponse


class DisplayManager:
    """Manages rich-based display output."""
    
    def __init__(self):
        self.console = Console()
    
    def show_restaurants_table(self, response: QueryResponse) -> None:
        """Display restaurants in a formatted table."""
        if not response.restaurants:
            self.console.print("[yellow]No restaurants found matching your criteria.[/yellow]")
            return
        
        # Create the table
        table = Table(title=f"NYC Restaurant Safety Results ({response.total_count} found)")
        
        table.add_column("Restaurant", style="cyan", no_wrap=True)
        table.add_column("Borough", style="magenta")
        table.add_column("Cuisine", style="green")
        table.add_column("Grade", justify="center")
        table.add_column("Score", justify="right")
        table.add_column("Address", style="dim")
        
        for restaurant in response.restaurants:
            # Style grade based on value
            grade_style = self._get_grade_style(restaurant.grade.value if restaurant.grade else "N/A")
            grade_text = Text(restaurant.grade.value if restaurant.grade else "N/A", style=grade_style)
            
            address = self._format_address(restaurant)
            
            table.add_row(
                restaurant.dba,
                restaurant.boro.value,
                restaurant.cuisine_description or "N/A",
                grade_text,
                str(restaurant.score) if restaurant.score else "N/A",
                address
            )
        
        self.console.print(table)
        
        # Show query info if available
        if response.query_info:
            self._show_query_info(response.query_info)
    
    def show_restaurant_details(self, restaurant: Restaurant) -> None:
        """Display detailed information for a single restaurant."""
        details = []
        
        details.append(f"[bold cyan]{restaurant.dba}[/bold cyan]")
        details.append(f"Borough: {restaurant.boro.value}")
        
        if restaurant.cuisine_description:
            details.append(f"Cuisine: {restaurant.cuisine_description}")
        
        address = self._format_address(restaurant)
        if address != "N/A":
            details.append(f"Address: {address}")
        
        if restaurant.phone:
            details.append(f"Phone: {restaurant.phone}")
        
        if restaurant.grade:
            grade_style = self._get_grade_style(restaurant.grade.value)
            details.append(f"Grade: [{grade_style}]{restaurant.grade.value}[/{grade_style}]")
        
        if restaurant.score is not None:
            details.append(f"Score: {restaurant.score}")
        
        if restaurant.inspection_date:
            details.append(f"Last Inspection: {restaurant.inspection_date}")
        
        if restaurant.violation_description:
            details.append(f"Recent Violation: {restaurant.violation_description}")
        
        panel = Panel("\n".join(details), title="Restaurant Details", border_style="blue")
        self.console.print(panel)
    
    def show_map_option(self, restaurants: List[Restaurant]) -> None:
        """Show option to generate a map and create one if requested."""
        restaurants_with_coords = [r for r in restaurants if r.latitude and r.longitude]
        
        if not restaurants_with_coords:
            self.console.print("[yellow]No restaurants have location data for mapping.[/yellow]")
            return
        
        if Confirm.ask(f"Generate map for {len(restaurants_with_coords)} restaurants with location data?"):
            self._generate_map(restaurants_with_coords)
    
    def _generate_map(self, restaurants: List[Restaurant]) -> None:
        """Generate an HTML map using folium."""
        try:
            import folium
            
            # Calculate center point
            lats = [r.latitude for r in restaurants if r.latitude]
            lons = [r.longitude for r in restaurants if r.longitude]
            
            center_lat = sum(lats) / len(lats)
            center_lon = sum(lons) / len(lons)
            
            # Create map
            m = folium.Map(location=[center_lat, center_lon], zoom_start=12)
            
            for restaurant in restaurants:
                if restaurant.latitude and restaurant.longitude:
                    # Color code by grade
                    color = self._get_marker_color(restaurant.grade.value if restaurant.grade else None)
                    
                    popup_text = f"""
                    <b>{restaurant.dba}</b><br>
                    Cuisine: {restaurant.cuisine_description or 'N/A'}<br>
                    Grade: {restaurant.grade.value if restaurant.grade else 'N/A'}<br>
                    Score: {restaurant.score if restaurant.score else 'N/A'}
                    """
                    
                    folium.Marker(
                        [restaurant.latitude, restaurant.longitude],
                        popup=folium.Popup(popup_text, max_width=300),
                        tooltip=restaurant.dba,
                        icon=folium.Icon(color=color)
                    ).add_to(m)
            
            # Save to temporary file and try to open
            with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
                m.save(f.name)
                map_path = f.name
            
            self.console.print(f"[green]Map saved to: {map_path}[/green]")
            
            # Try to open in browser
            try:
                import webbrowser
                webbrowser.open(f'file://{map_path}')
                self.console.print("[green]Map opened in your default browser.[/green]")
            except Exception:
                self.console.print(f"[yellow]Please open the map file manually: {map_path}[/yellow]")
                
        except ImportError:
            self.console.print("[red]Folium not available. Cannot generate map.[/red]")
        except Exception as e:
            self.console.print(f"[red]Error generating map: {e}[/red]")
    
    def _format_address(self, restaurant: Restaurant) -> str:
        """Format restaurant address."""
        parts = []
        if restaurant.building:
            parts.append(restaurant.building)
        if restaurant.street:
            parts.append(restaurant.street)
        if restaurant.zipcode:
            parts.append(restaurant.zipcode)
        
        return " ".join(parts) if parts else "N/A"
    
    def _get_grade_style(self, grade: Optional[str]) -> str:
        """Get Rich style for grade display."""
        if not grade:
            return "dim"
        
        grade_styles = {
            "A": "bold green",
            "B": "bold yellow",
            "C": "bold red",
            "P": "dim",
            "Z": "dim"
        }
        return grade_styles.get(grade, "dim")
    
    def _get_marker_color(self, grade: Optional[str]) -> str:
        """Get marker color for map based on grade."""
        if not grade:
            return "gray"
        
        color_map = {
            "A": "green",
            "B": "orange",
            "C": "red",
            "P": "gray",
            "Z": "gray"
        }
        return color_map.get(grade, "gray")
    
    def _show_query_info(self, query_info: dict) -> None:
        """Display information about the query."""
        if query_info.get("mock_data"):
            self.console.print("[yellow]Note: Using mock data for demonstration.[/yellow]")
        
        filters = query_info.get("filters_applied", {})
        if any(filters.values()):
            filter_text = []
            for key, value in filters.items():
                if value:
                    filter_text.append(f"{key}: {value}")
            
            if filter_text:
                self.console.print(f"[dim]Filters: {', '.join(filter_text)}[/dim]")