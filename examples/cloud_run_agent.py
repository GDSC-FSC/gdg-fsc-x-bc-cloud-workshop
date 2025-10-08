import os
import logging
from typing import Any, Dict, List, Optional

from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import bigquery

app = Flask(__name__)
CORS(app)

# ---- Structured logging (Cloud Logging ingests JSON neatly)
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

# ---- Config / Env
BQ_TABLE = os.getenv(
    "BQ_TABLE", "bigquery-public-data.new_york.restaurant_grades"
)  # <-- set the right table for your project/dataset
DEFAULT_LIMIT = int(os.getenv("DEFAULT_LIMIT", "100"))
MAX_LIMIT = int(os.getenv("MAX_LIMIT", "500"))
ALLOW_UNAUTH = os.getenv("ALLOW_UNAUTH", "true").lower() == "true"

# ---- BigQuery client
try:
    bq_client = bigquery.Client()
    logger.info("BigQuery client initialized")
except Exception as e:
    logger.exception("Failed to initialize BigQuery client")
    bq_client = None

# ---- Grade filter map (A ⩾ A, B ⩾ B, etc.)
GRADE_LADDER = {
    "A": ["A"],
    "B": ["A", "B"],
    "C": ["A", "B", "C"],
}


def _coerce_limit(value: Optional[int]) -> int:
    if value is None:
        return DEFAULT_LIMIT
    try:
        value = int(value)
    except Exception:
        return DEFAULT_LIMIT
    return max(1, min(value, MAX_LIMIT))


def _build_query_and_params(payload: Dict[str, Any]):
    borough = payload.get("borough")
    cuisine = payload.get("cuisine")
    min_grade = payload.get("min_grade")
    limit = _coerce_limit(payload.get("limit"))

    where = ["1=1"]
    params: List[bigquery.ScalarQueryParameter] = []

    # Named parameters (@param) per BigQuery docs
    # https://cloud.google.com/bigquery/docs/parameterized-queries
    if borough:
        where.append("UPPER(boro) = @borough")
        params.append(
            bigquery.ScalarQueryParameter("borough", "STRING", borough.upper())
        )
    if cuisine:
        where.append("UPPER(cuisine_description) LIKE @cuisine")
        params.append(
            bigquery.ScalarQueryParameter("cuisine", "STRING", f"%{cuisine.upper()}%")
        )
    if min_grade:
        grades = GRADE_LADDER.get(str(min_grade).upper())
        if grades:
            where.append("grade IN UNNEST(@grades)")
            params.append(bigquery.ArrayQueryParameter("grades", "STRING", grades))

    # Safe, parameterized LIMIT
    params.append(bigquery.ScalarQueryParameter("limit", "INT64", limit))

    query = f"""
    SELECT
      dba, boro, building, street, zipcode, phone, cuisine_description,
      inspection_date, action, violation_code, violation_description,
      critical_flag, score, grade, grade_date, record_date,
      inspection_type, latitude, longitude
    FROM `{BQ_TABLE}`
    WHERE {' AND '.join(where)}
    ORDER BY inspection_date DESC
    LIMIT @limit
    """
    return (
        query,
        params,
        {
            "borough": borough,
            "cuisine": cuisine,
            "min_grade": min_grade,
            "limit": limit,
        },
    )


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "bigquery": bq_client is not None,
            "table": BQ_TABLE,
        }
    )


@app.get("/meta")
def meta():
    """Returns a small contract the CLI can use for self-describe."""
    return jsonify(
        {
            "service": "nyc-restaurant-safety-agent",
            "endpoints": ["/query", "/geocode", "/alert", "/health"],
            "requires_auth": not ALLOW_UNAUTH,
        }
    )


@app.post("/query")
def query_restaurants():
    try:
        if not bq_client:
            return jsonify(_mock_response(request.get_json(silent=True) or {}))

        data = request.get_json(force=True, silent=True) or {}
        logger.info("query request", extra={"payload": data})

        query, params, applied = _build_query_and_params(data)
        job_config = bigquery.QueryJobConfig(query_parameters=params)

        # Run parameterized query
        # https://cloud.google.com/bigquery/docs/parameterized-queries
        results = bq_client.query(query, job_config=job_config).result()

        rows: List[Dict[str, Any]] = []
        for row in results:
            rows.append(
                {
                    "dba": row.get("dba"),
                    "boro": row.get("boro"),
                    "building": row.get("building"),
                    "street": row.get("street"),
                    "zipcode": row.get("zipcode"),
                    "phone": row.get("phone"),
                    "cuisine_description": row.get("cuisine_description"),
                    "inspection_date": (
                        row.get("inspection_date").isoformat()
                        if row.get("inspection_date")
                        else None
                    ),
                    "action": row.get("action"),
                    "violation_code": row.get("violation_code"),
                    "violation_description": row.get("violation_description"),
                    "critical_flag": row.get("critical_flag"),
                    "score": row.get("score"),
                    "grade": row.get("grade"),
                    "grade_date": (
                        row.get("grade_date").isoformat()
                        if row.get("grade_date")
                        else None
                    ),
                    "record_date": (
                        row.get("record_date").isoformat()
                        if row.get("record_date")
                        else None
                    ),
                    "inspection_type": row.get("inspection_type"),
                    "latitude": (
                        float(row.get("latitude"))
                        if row.get("latitude") is not None
                        else None
                    ),
                    "longitude": (
                        float(row.get("longitude"))
                        if row.get("longitude") is not None
                        else None
                    ),
                }
            )

        resp = {
            "restaurants": rows,
            "total_count": len(rows),
            "query_info": {"filters_applied": applied, "table": BQ_TABLE},
        }
        logger.info("query response", extra={"count": len(rows)})
        return jsonify(resp)
    except Exception as e:
        logger.exception("query error")
        return jsonify({"error": str(e)}), 500


@app.post("/geocode")
def geocode_address():
    try:
        data = request.get_json(force=True, silent=True) or {}
        address = data.get("address") or "Times Square, New York, NY"
        # Mock coordinates; wire up Google Maps Geocoding API if needed
        return jsonify(
            {"latitude": 40.7589, "longitude": -73.9851, "formatted_address": address}
        )
    except Exception as e:
        logger.exception("geocode error")
        return jsonify({"error": str(e)}), 500


@app.post("/alert")
def send_alert():
    try:
        data = request.get_json(force=True, silent=True) or {}
        message = data.get("message") or "Hello from Cloud Run agent"
        alert_type = data.get("type", "INFO")
        logger.info("alert", extra={"type": alert_type, "message": message})
        return jsonify({"status": "sent", "message": message, "type": alert_type})
    except Exception as e:
        logger.exception("alert error")
        return jsonify({"error": str(e)}), 500


def _mock_response(payload: Dict[str, Any]):
    return {
        "restaurants": [
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
                "longitude": -73.9851,
            }
        ],
        "total_count": 1,
        "query_info": {
            "mock_data": True,
            "filters_applied": payload,
            "table": BQ_TABLE,
        },
    }


if __name__ == "__main__":
    # Cloud Run injects PORT; listen on 0.0.0.0 per container contract
    # https://cloud.google.com/run/docs/container-contract
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
