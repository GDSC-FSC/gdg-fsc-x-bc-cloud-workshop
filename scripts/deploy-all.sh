#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"hackmit-2024-api"}
VERSION=${VERSION:-"v1"}
REGION=${GCP_REGION:-"us-central1"}
DB_CONNECTION_NAME=${DB_CONNECTION_NAME:-""}
GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY:-""}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print separator
print_separator() {
  echo -e "${CYAN}========================================${NC}"
}

# Function to check command exists
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 is not installed${NC}"
    exit 1
  fi
}

# Print header
print_separator
echo -e "${CYAN}🚀 Full Stack Deployment to Google Cloud Run${NC}"
print_separator
echo ""

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
check_command gcloud
check_command docker
echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Display configuration
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Project:  ${PROJECT_ID}"
echo -e "  Region:   ${REGION}"
echo -e "  Version:  ${VERSION}"
if [ -n "$DB_CONNECTION_NAME" ]; then
  echo -e "  Database: ${DB_CONNECTION_NAME}"
else
  echo -e "  Database: ${YELLOW}Not configured (will use in-memory)${NC}"
fi
if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
  echo -e "  Maps API: ${GREEN}Configured ✓${NC}"
else
  echo -e "  Maps API: ${YELLOW}Not configured ⚠${NC}"
fi
echo ""

# Confirm deployment
read -p "$(echo -e ${YELLOW}Continue with deployment? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Deployment cancelled${NC}"
  exit 1
fi
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Export environment variables
export GCP_PROJECT_ID=${PROJECT_ID}
export VERSION=${VERSION}
export GCP_REGION=${REGION}
export DB_CONNECTION_NAME=${DB_CONNECTION_NAME}

# Step 1: Deploy API
print_separator
echo -e "${GREEN}📦 Step 1/2: Deploying API Backend${NC}"
print_separator
echo ""

"${SCRIPT_DIR}/deploy-api.sh"

# Get API URL
API_SERVICE_URL=$(gcloud run services describe gdg-fsc-api \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -z "$API_SERVICE_URL" ]; then
  echo -e "${RED}Error: Failed to get API URL${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✓ API deployed successfully${NC}"
echo -e "  URL: ${BLUE}${API_SERVICE_URL}${NC}"
echo ""

# Test API health
echo -e "${BLUE}Testing API health...${NC}"
for i in {1..10}; do
  if curl -sf "${API_SERVICE_URL}/actuator/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is healthy${NC}"
    break
  fi
  echo -n "."
  sleep 3
done
echo ""

# Step 2: Deploy Frontend with API URL
print_separator
echo -e "${GREEN}🎨 Step 2/2: Deploying Frontend${NC}"
print_separator
echo ""

export API_URL=${API_SERVICE_URL}
export VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

"${SCRIPT_DIR}/deploy-frontend.sh"

# Get Frontend URL
FRONTEND_SERVICE_URL=$(gcloud run services describe gdg-fsc-frontend \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -z "$FRONTEND_SERVICE_URL" ]; then
  echo -e "${RED}Error: Failed to get Frontend URL${NC}"
  exit 1
fi

# Final summary
echo ""
print_separator
echo -e "${GREEN}🎉 Full Stack Deployment Complete!${NC}"
print_separator
echo ""
echo -e "${CYAN}Service URLs:${NC}"
echo -e "  ${BLUE}Frontend:${NC}  ${FRONTEND_SERVICE_URL}"
echo -e "  ${BLUE}API:${NC}       ${API_SERVICE_URL}"
echo ""
echo -e "${CYAN}Useful Commands:${NC}"
echo -e "  View API logs:      ${YELLOW}gcloud run logs read ${SERVICE_NAME} --region ${REGION}${NC}"
echo -e "  View frontend logs: ${YELLOW}gcloud run logs read gdg-fsc-frontend --region ${REGION}${NC}"
echo -e "  Update API:         ${YELLOW}./scripts/deploy-api.sh${NC}"
echo -e "  Update frontend:    ${YELLOW}./scripts/deploy-frontend.sh${NC}"
echo ""
echo -e "${GREEN}✨ Your application is now live!${NC}"
echo -e "${GREEN}   Visit: ${BLUE}${FRONTEND_SERVICE_URL}${NC}"
echo ""

if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  Note: Google Maps API key was not configured.${NC}"
  echo -e "${YELLOW}   Maps functionality will not work.${NC}"
  echo ""
fi
