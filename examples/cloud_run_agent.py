"""
Example Cloud Run agent implementation for NYC Restaurant Safety Finder

This is a sample implementation of the backend agent that the CLI communicates with.
Deploy this to Google Cloud Run to provide real data from BigQuery.
"""

from flask import Flask, request, jsonify
from google.cloud import bigquery
import logging
import os

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize BigQuery client
try:
    client = bigquery.Client()
    logger.info("BigQuery client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize BigQuery client: {e}")
    client = None


@app.route('/query', methods=['POST'])
def query_restaurants():
    """Query restaurants from BigQuery based on provided filters."""
    try:
        data = request.get_json()
        logger.info(f"Received query request: {data}")
        
        # Extract filters
        borough = data.get('borough')
        cuisine = data.get('cuisine')
        min_grade = data.get('min_grade')
        limit = data.get('limit', 100)
        
        # Build BigQuery query
        query = """
        SELECT 
            dba,
            boro,
            building,
            street,
            zipcode,
            phone,
            cuisine_description,
            inspection_date,
            action,
            violation_code,
            violation_description,
            critical_flag,
            score,
            grade,
            grade_date,
            record_date,
            inspection_type,
            latitude,
            longitude
        FROM `bigquery-public-data.new_york_city.restaurant_grades`
        WHERE 1=1
        """
        
        params = []
        
        if borough:
            query += " AND UPPER(boro) = ?"
            params.append(borough.upper())
            
        if cuisine:
            query += " AND UPPER(cuisine_description) LIKE ?"
            params.append(f"%{cuisine.upper()}%")
            
        if min_grade:
            # A=1, B=2, C=3 for comparison
            grade_values = {"A": ["A"], "B": ["A", "B"], "C": ["A", "B", "C"]}
            if min_grade in grade_values:
                query += f" AND grade IN UNNEST(?)"
                params.append(grade_values[min_grade])
        
        query += f" ORDER BY inspection_date DESC LIMIT {limit}"
        
        if client:
            # Execute query
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter(None, "STRING", p) if isinstance(p, str)
                    else bigquery.ArrayQueryParameter(None, "STRING", p)
                    for p in params
                ]
            )
            
            query_job = client.query(query, job_config=job_config)
            results = query_job.result()
            
            restaurants = []
            for row in results:
                restaurant = {
                    "dba": row.dba,
                    "boro": row.boro,
                    "building": row.building,
                    "street": row.street,
                    "zipcode": row.zipcode,
                    "phone": row.phone,
                    "cuisine_description": row.cuisine_description,
                    "inspection_date": row.inspection_date.isoformat() if row.inspection_date else None,
                    "action": row.action,
                    "violation_code": row.violation_code,
                    "violation_description": row.violation_description,
                    "critical_flag": row.critical_flag,
                    "score": row.score,
                    "grade": row.grade,
                    "grade_date": row.grade_date.isoformat() if row.grade_date else None,
                    "record_date": row.record_date.isoformat() if row.record_date else None,
                    "inspection_type": row.inspection_type,
                    "latitude": float(row.latitude) if row.latitude else None,
                    "longitude": float(row.longitude) if row.longitude else None,
                }
                restaurants.append(restaurant)
            
            response = {
                "restaurants": restaurants,
                "total_count": len(restaurants),
                "query_info": {
                    "filters_applied": {
                        "borough": borough,
                        "cuisine": cuisine,
                        "min_grade": min_grade
                    }
                }
            }
            
        else:
            # Fallback to mock data if BigQuery is unavailable
            response = _get_mock_response(data)
        
        logger.info(f"Returning {len(response['restaurants'])} restaurants")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/geocode', methods=['POST'])
def geocode_address():
    """Geocode an address using Google Maps API or similar service."""
    try:
        data = request.get_json()
        address = data.get('address')
        
        # TODO: Implement actual geocoding with Google Maps API
        # For now, return mock coordinates
        
        # Mock response
        response = {
            "latitude": 40.7589,
            "longitude": -73.9851,
            "formatted_address": address
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error geocoding address: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/alert', methods=['POST'])
def send_alert():
    """Send alert notification via email, SMS, or other service."""
    try:
        data = request.get_json()
        message = data.get('message')
        alert_type = data.get('type', 'INFO')
        
        # TODO: Implement actual alert sending (email, SMS, Slack, etc.)
        logger.info(f"Alert [{alert_type}]: {message}")
        
        return jsonify({"status": "sent", "message": message})
        
    except Exception as e:
        logger.error(f"Error sending alert: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "bigquery_available": client is not None
    })


def _get_mock_response(request_data):
    """Generate mock response for testing."""
    mock_restaurants = [
        {
            "dba": "Joe's Pizza",
            "boro": "MANHATTAN",
            "building": "123",
            "street": "Broadway",
            "zipcode": "10001",
            "cuisine_description": "Pizza",
            "grade": "A",
            "score": 12,
            "inspection_date": "2023-10-15",
            "latitude": 40.7589,
            "longitude": -73.9851
        }
    ]
    
    return {
        "restaurants": mock_restaurants,
        "total_count": len(mock_restaurants),
        "query_info": {
            "mock_data": True,
            "filters_applied": {
                "borough": request_data.get('borough'),
                "cuisine": request_data.get('cuisine'),
                "min_grade": request_data.get('min_grade')
            }
        }
    }


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)