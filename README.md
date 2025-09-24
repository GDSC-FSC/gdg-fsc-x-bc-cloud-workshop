# NYC Restaurant Safety Finder

A Typer + Rich CLI that acts as an Agent2Agent client to query NYC health inspection data via a Cloud Run agent. Data is stored in GCS and queried via BigQuery. Users can filter by borough, cuisine, and minimum grade to receive ranked tables and optional map results, with agent chaining for geocoding or alerts.

## Features

- 🏢 **Borough Filtering**: Search restaurants by NYC borough (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- 🍕 **Cuisine Filtering**: Filter by cuisine type with partial matching
- 📊 **Grade Filtering**: Filter by minimum health inspection grade (A, B, C)
- 📋 **Rich Tables**: Beautiful table output with color-coded grades
- 🗺️ **Interactive Maps**: Generate HTML maps with restaurant locations
- 🚨 **Smart Alerts**: Agent chaining for alerts on concerning health grades
- 🔗 **Agent2Agent**: Seamless communication with Cloud Run services
- 📍 **Geocoding**: Location services via agent chaining

## Installation

```bash
# Clone the repository
git clone https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop.git
cd gdg-fsc-x-bc-cloud-workshop

# Install dependencies
pip install -r requirements.txt

# Install in development mode
pip install -e .
```

## Quick Start

```bash
# Search for pizza places in Manhattan with grade A or better
nyc-restaurants search --borough manhattan --cuisine pizza --min-grade A

# Get detailed information about a specific restaurant
nyc-restaurants details "Joe's Pizza"

# Search with map visualization
nyc-restaurants search --borough brooklyn --map

# Test agent connection
nyc-restaurants test-agent
```

## Configuration

Set your Cloud Run agent URL:

```bash
export NYC_RESTAURANTS_AGENT_URL="https://your-cloud-run-service.run.app"
```

Or pass it directly to commands:

```bash
nyc-restaurants search --agent-url https://your-service.run.app --borough manhattan
```

## Command Reference

### `search` - Search restaurants

```bash
nyc-restaurants search [OPTIONS]

Options:
  -b, --borough [MANHATTAN|BROOKLYN|QUEENS|BRONX|STATEN_ISLAND]
  -c, --cuisine TEXT          Filter by cuisine type
  -g, --min-grade [A|B|C|P|Z] Minimum grade (A is best)
  -l, --limit INTEGER         Max results (1-1000, default: 100)
  -m, --map                   Show map option
  --alert                     Send alerts for concerning results
  --agent-url TEXT            Cloud Run agent URL
```

### `details` - Get restaurant details

```bash
nyc-restaurants details RESTAURANT_NAME [OPTIONS]

Options:
  -b, --borough [MANHATTAN|BROOKLYN|QUEENS|BRONX|STATEN_ISLAND]
  --agent-url TEXT            Cloud Run agent URL
```

### `config` - Manage configuration

```bash
nyc-restaurants config [OPTIONS]

Options:
  --show                      Show current configuration
  --set-agent-url TEXT        Set the Cloud Run agent URL
```

### `test-agent` - Test agent connection

```bash
nyc-restaurants test-agent [OPTIONS]

Options:
  --agent-url TEXT            Cloud Run agent URL to test
```

## Examples

### Basic Search
```bash
# All restaurants in Manhattan
nyc-restaurants search --borough manhattan

# Pizza places with grade A
nyc-restaurants search --cuisine pizza --min-grade A

# Top 10 restaurants in Brooklyn
nyc-restaurants search --borough brooklyn --limit 10
```

### Advanced Features
```bash
# Search with map visualization
nyc-restaurants search --borough queens --map

# Search with alerts for concerning grades
nyc-restaurants search --borough bronx --alert

# Restaurant details
nyc-restaurants details "Katz's Delicatessen" --borough manhattan
```

### Configuration
```bash
# Show current settings
nyc-restaurants config --show

# Test your agent
nyc-restaurants test-agent --agent-url https://your-service.run.app
```

## Agent2Agent Architecture

This CLI acts as a client in an Agent2Agent architecture:

```
CLI Client ←→ Cloud Run Agent ←→ BigQuery ←→ GCS
     ↕
  Geocoding Agent
     ↕
  Alerting Agent
```

### Expected Agent Endpoints

Your Cloud Run agent should implement these endpoints:

- `POST /query` - Restaurant search queries
- `POST /geocode` - Address geocoding
- `POST /alert` - Alert notifications

### Request/Response Format

**Query Request:**
```json
{
  "borough": "MANHATTAN",
  "cuisine": "pizza",
  "min_grade": "A",
  "limit": 100
}
```

**Query Response:**
```json
{
  "restaurants": [...],
  "total_count": 150,
  "query_info": {
    "filters_applied": {...}
  }
}
```

## Development

### Project Structure
```
nyc_restaurant_finder/
├── __init__.py          # Package initialization
├── cli.py              # Main CLI application
├── models.py           # Pydantic data models
├── agent_client.py     # Agent2Agent client
└── display.py          # Rich display utilities
```

### Running Tests
```bash
# Install development dependencies
pip install -e .[dev]

# Run tests (when test suite is available)
pytest
```

### Mock Data

When the Cloud Run agent is not available, the CLI automatically switches to mock data mode for demonstration purposes. This allows you to test all features locally.

## Cloud Infrastructure

This application is designed to work with:

- **Google Cloud Storage (GCS)**: Raw NYC health inspection data
- **BigQuery**: Processed and queryable restaurant data
- **Cloud Run**: Serverless agent for data processing and API
- **Agent Chaining**: Geocoding and alerting services

### Deploying the Backend Agent

An example Cloud Run agent implementation is provided in the `examples/` directory:

```bash
# Deploy to Cloud Run
cd examples/
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/nyc-restaurants-agent
gcloud run deploy nyc-restaurants-agent \
  --image gcr.io/YOUR_PROJECT_ID/nyc-restaurants-agent \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Set the service URL
export NYC_RESTAURANTS_AGENT_URL="https://your-service-url.run.app"
```

See `examples/README.md` for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Open an issue on GitHub
- Contact GDSC FSC: gdg@fsc.edu
