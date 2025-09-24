"""Main CLI application using Typer."""

import os
from typing import Optional
import typer
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

from .models import Borough, Grade
from .agent_client import AgentClient
from .display import DisplayManager


app = typer.Typer(
    name="nyc-restaurants",
    help="NYC Restaurant Safety Finder - Query NYC health inspection data via Cloud Run agent",
    rich_markup_mode="rich"
)

console = Console()


@app.command()
def search(
    borough: Optional[Borough] = typer.Option(
        None,
        "--borough", "-b",
        help="Filter by NYC borough",
        case_sensitive=False
    ),
    cuisine: Optional[str] = typer.Option(
        None,
        "--cuisine", "-c",
        help="Filter by cuisine type (partial match)"
    ),
    min_grade: Optional[Grade] = typer.Option(
        None,
        "--min-grade", "-g",
        help="Minimum grade (A is best, C is worst)"
    ),
    limit: int = typer.Option(
        100,
        "--limit", "-l",
        help="Maximum number of results to return",
        min=1,
        max=1000
    ),
    show_map: bool = typer.Option(
        False,
        "--map", "-m",
        help="Show option to generate map of results"
    ),
    agent_url: Optional[str] = typer.Option(
        None,
        "--agent-url",
        help="Cloud Run agent URL (uses mock data if not provided)",
        envvar="NYC_RESTAURANTS_AGENT_URL"
    ),
    send_alert: bool = typer.Option(
        False,
        "--alert",
        help="Send alert for high-priority results via agent chaining"
    )
):
    """
    Search for NYC restaurants by health inspection data.
    
    Examples:
    
      Search for pizza places in Manhattan with grade A:
      $ nyc-restaurants search --borough manhattan --cuisine pizza --min-grade A
      
      Search for all restaurants in Brooklyn (with map):
      $ nyc-restaurants search --borough brooklyn --map
      
      Search with custom agent URL:
      $ nyc-restaurants search --agent-url https://your-service.run.app
    """
    
    # Initialize components
    client = AgentClient(agent_url or "https://demo-agent.run.app")
    display = DisplayManager()
    
    # Show search parameters
    search_params = []
    if borough:
        search_params.append(f"Borough: {borough.value}")
    if cuisine:
        search_params.append(f"Cuisine: {cuisine}")
    if min_grade:
        search_params.append(f"Min Grade: {min_grade.value}")
    
    if search_params:
        params_text = " | ".join(search_params)
        console.print(Panel(params_text, title="Search Parameters", border_style="blue"))
    
    try:
        # Query restaurants
        response = client.query_restaurants(
            borough=borough,
            cuisine=cuisine,
            min_grade=min_grade,
            limit=limit
        )
        
        # Display results
        display.show_restaurants_table(response)
        
        # Send alert if requested and there are concerning results
        if send_alert and response.restaurants:
            concerning_restaurants = [
                r for r in response.restaurants 
                if r.grade and r.grade.value in ["C", "P"] or (r.score and r.score > 25)
            ]
            
            if concerning_restaurants:
                alert_message = f"Found {len(concerning_restaurants)} restaurants with concerning health grades in your search"
                if client.send_alert(alert_message, "WARNING"):
                    console.print("[green]Alert sent successfully![/green]")
                else:
                    console.print("[yellow]Could not send alert - agent unavailable.[/yellow]")
        
        # Show map option if requested
        if show_map:
            display.show_map_option(response.restaurants)
            
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def details(
    restaurant_name: str = typer.Argument(
        help="Restaurant name to search for (partial match)"
    ),
    borough: Optional[Borough] = typer.Option(
        None,
        "--borough", "-b",
        help="Filter by NYC borough for more precise search"
    ),
    agent_url: Optional[str] = typer.Option(
        None,
        "--agent-url",
        help="Cloud Run agent URL",
        envvar="NYC_RESTAURANTS_AGENT_URL"
    )
):
    """
    Get detailed information about a specific restaurant.
    
    Examples:
    
      Get details for Joe's Pizza:
      $ nyc-restaurants details "Joe's Pizza"
      
      Get details for restaurants in Manhattan:
      $ nyc-restaurants details "Pizza" --borough manhattan
    """
    
    client = AgentClient(agent_url or "https://demo-agent.run.app")
    display = DisplayManager()
    
    try:
        # Search for restaurants (get all then filter by name)
        response = client.query_restaurants(
            borough=borough,
            limit=100  # Get more results to search through
        )
        
        # Filter by name more precisely
        matching_restaurants = [
            r for r in response.restaurants
            if restaurant_name.lower() in r.dba.lower()
        ]
        
        if not matching_restaurants:
            console.print(f"[yellow]No restaurants found matching '{restaurant_name}'[/yellow]")
            return
        
        if len(matching_restaurants) == 1:
            display.show_restaurant_details(matching_restaurants[0])
        else:
            console.print(f"[cyan]Found {len(matching_restaurants)} restaurants matching '{restaurant_name}':[/cyan]\n")
            for i, restaurant in enumerate(matching_restaurants, 1):
                console.print(f"{i}. {restaurant.dba} ({restaurant.boro.value})")
            
            choice = typer.prompt(
                "Enter number for details (or 0 to show all)",
                type=int,
                default=0
            )
            
            if choice == 0:
                for restaurant in matching_restaurants:
                    display.show_restaurant_details(restaurant)
                    console.print()
            elif 1 <= choice <= len(matching_restaurants):
                display.show_restaurant_details(matching_restaurants[choice - 1])
            else:
                console.print("[red]Invalid choice.[/red]")
                
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def config(
    show: bool = typer.Option(
        False,
        "--show",
        help="Show current configuration"
    ),
    set_agent_url: Optional[str] = typer.Option(
        None,
        "--set-agent-url",
        help="Set the Cloud Run agent URL"
    )
):
    """
    Manage configuration settings.
    
    Examples:
    
      Show current config:
      $ nyc-restaurants config --show
      
      Set agent URL:
      $ nyc-restaurants config --set-agent-url https://your-service.run.app
    """
    
    if show:
        agent_url = os.getenv("NYC_RESTAURANTS_AGENT_URL", "Not set")
        console.print(Panel(
            f"Agent URL: {agent_url}",
            title="Current Configuration",
            border_style="green"
        ))
    
    if set_agent_url:
        console.print(f"[yellow]To set agent URL permanently, add to your shell configuration:[/yellow]")
        console.print(f"export NYC_RESTAURANTS_AGENT_URL='{set_agent_url}'")


@app.command()
def test_agent(
    agent_url: Optional[str] = typer.Option(
        None,
        "--agent-url",
        help="Cloud Run agent URL to test",
        envvar="NYC_RESTAURANTS_AGENT_URL"
    )
):
    """
    Test connection to the Cloud Run agent.
    
    Examples:
    
      Test default agent:
      $ nyc-restaurants test-agent
      
      Test specific agent URL:
      $ nyc-restaurants test-agent --agent-url https://your-service.run.app
    """
    
    client = AgentClient(agent_url or "https://demo-agent.run.app")
    
    console.print(f"[cyan]Testing connection to: {client.agent_url}[/cyan]")
    
    try:
        # Test basic query
        response = client.query_restaurants(limit=1)
        
        if response.query_info.get("mock_data"):
            console.print("[yellow]✓ Connection test completed (using mock data)[/yellow]")
        else:
            console.print("[green]✓ Agent connection successful![/green]")
            
        console.print(f"[dim]Returned {len(response.restaurants)} restaurants[/dim]")
        
        # Test geocoding
        lat, lon = client.get_geocoding("123 Broadway, New York, NY")
        if lat and lon:
            console.print("[green]✓ Geocoding service available[/green]")
        else:
            console.print("[yellow]⚠ Geocoding service unavailable[/yellow]")
        
        # Test alerts
        if client.send_alert("Test alert", "INFO"):
            console.print("[green]✓ Alert service available[/green]")
        else:
            console.print("[yellow]⚠ Alert service unavailable[/yellow]")
            
    except Exception as e:
        console.print(f"[red]✗ Agent connection failed: {e}[/red]")
        raise typer.Exit(1)


def version_callback(value: bool):
    """Show version information."""
    if value:
        from . import __version__
        console.print(f"NYC Restaurant Safety Finder v{__version__}")
        raise typer.Exit()


@app.callback()
def main(
    version: Optional[bool] = typer.Option(
        None,
        "--version", "-v",
        callback=version_callback,
        is_eager=True,
        help="Show version and exit"
    )
):
    """
    NYC Restaurant Safety Finder
    
    A Typer + Rich CLI that acts as an Agent2Agent client to query NYC health 
    inspection data via a Cloud Run agent. Data is stored in GCS and queried 
    via BigQuery.
    
    Set your Cloud Run agent URL with:
    export NYC_RESTAURANTS_AGENT_URL="https://your-service.run.app"
    """
    pass


if __name__ == "__main__":
    app()