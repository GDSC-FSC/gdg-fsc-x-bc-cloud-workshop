#!/bin/bash

echo "Testing NYC Restaurants API"
echo "============================"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s http://localhost:8080/api/restaurants/health
echo -e "\n"

# Test 2: Search for restaurants in Manhattan
echo "2. Searching for restaurants in Manhattan..."
curl -s -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{
    "borough": "MANHATTAN",
    "limit": 5
  }' | python3 -m json.tool
echo -e "\n"

# Test 3: Search for pizza places
echo "3. Searching for pizza places..."
curl -s -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{
    "cuisine": "Pizza",
    "limit": 5
  }' | python3 -m json.tool
echo -e "\n"

# Test 4: Get restaurant details
echo "4. Getting restaurant details..."
curl -s -X POST http://localhost:8080/api/restaurants/details \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "PIZZA",
    "borough": "MANHATTAN"
  }' | python3 -m json.tool
echo -e "\n"

# Test 5: Get all boroughs
echo "5. Getting all boroughs..."
curl -s http://localhost:8080/api/restaurants/boroughs | python3 -m json.tool
echo -e "\n"

# Test 6: Get all cuisines (first 10)
echo "6. Getting cuisines (sample)..."
curl -s http://localhost:8080/api/restaurants/cuisines | python3 -m json.tool | head -20
echo -e "\n"

echo "Testing complete!"
