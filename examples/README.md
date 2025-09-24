# Cloud Run Agent Example

This directory contains an example implementation of the backend agent for the NYC Restaurant Safety Finder CLI.

## Files

- `cloud_run_agent.py` - Flask application that serves as the Agent2Agent backend
- `requirements-agent.txt` - Python dependencies for the agent
- `Dockerfile` - Container configuration for Cloud Run deployment
- `README.md` - This file

## Features

The agent provides these endpoints:

- `POST /query` - Search restaurants in BigQuery
- `POST /geocode` - Geocode addresses (mock implementation)
- `POST /alert` - Send alerts (mock implementation)
- `GET /health` - Health check endpoint

## Local Development

1. Install dependencies:
```bash
pip install -r requirements-agent.txt
```

2. Set up Google Cloud credentials (optional, will use mock data if not available):
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

3. Run the agent:
```bash
python cloud_run_agent.py
```

The agent will be available at `http://localhost:8080`

## Deploy to Cloud Run

1. Build and push the container:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/nyc-restaurants-agent
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy nyc-restaurants-agent \
  --image gcr.io/YOUR_PROJECT_ID/nyc-restaurants-agent \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. Get the service URL and set it in your CLI:
```bash
export NYC_RESTAURANTS_AGENT_URL="https://your-service-url.run.app"
```

## Testing

Test the deployed agent:

```bash
# Health check
curl https://your-service-url.run.app/health

# Query restaurants
curl -X POST https://your-service-url.run.app/query \
  -H "Content-Type: application/json" \
  -d '{"borough": "MANHATTAN", "cuisine": "pizza", "limit": 5}'
```

## BigQuery Integration

The agent queries the public NYC restaurant grades dataset:
`bigquery-public-data.new_york_city.restaurant_grades`

Ensure your Cloud Run service has the necessary IAM permissions to access BigQuery.

## Extending the Agent

To add more features:

1. **Real Geocoding**: Integrate with Google Maps Geocoding API
2. **Alert System**: Add email/SMS notifications using SendGrid, Twilio, etc.
3. **Caching**: Add Redis for query caching
4. **Authentication**: Add API key authentication
5. **Rate Limiting**: Implement request rate limiting