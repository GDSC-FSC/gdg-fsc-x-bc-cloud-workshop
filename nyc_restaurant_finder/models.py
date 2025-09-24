"""Data models for NYC Restaurant Safety Finder."""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel


class Borough(str, Enum):
    """NYC Boroughs."""
    MANHATTAN = "MANHATTAN"
    BROOKLYN = "BROOKLYN"
    QUEENS = "QUEENS"
    BRONX = "BRONX"
    STATEN_ISLAND = "STATEN ISLAND"


class Grade(str, Enum):
    """Health inspection grades."""
    A = "A"
    B = "B"
    C = "C"
    P = "P"  # Pending
    Z = "Z"  # Not yet graded


class Restaurant(BaseModel):
    """Restaurant data model."""
    dba: str  # Doing business as (restaurant name)
    boro: Borough
    building: Optional[str] = None
    street: Optional[str] = None
    zipcode: Optional[str] = None
    phone: Optional[str] = None
    cuisine_description: Optional[str] = None
    inspection_date: Optional[str] = None
    action: Optional[str] = None
    violation_code: Optional[str] = None
    violation_description: Optional[str] = None
    critical_flag: Optional[str] = None
    score: Optional[int] = None
    grade: Optional[Grade] = None
    grade_date: Optional[str] = None
    record_date: Optional[str] = None
    inspection_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class QueryRequest(BaseModel):
    """Request model for agent queries."""
    borough: Optional[Borough] = None
    cuisine: Optional[str] = None
    min_grade: Optional[Grade] = None
    limit: int = 100


class QueryResponse(BaseModel):
    """Response model for agent queries."""
    restaurants: List[Restaurant]
    total_count: int
    query_info: dict