#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"hackmit-2024-api"}
VERSION=${VERSION:-"v1"}
REGION=${GCP_REGION:-"us-central1"}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deploying Full Stack to Google Cloud${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Step 1: Deploy API
echo -e "${GREEN}Step 1: Deploying API...${NC}"
echo ""
export GCP_PROJECT_ID=${PROJECT_ID}
export VERSION=${VERSION}
export GCP_REGION=${REGION}

"${SCRIPT_DIR}/deploy-api.sh"

# Get API URL
API_SERVICE_URL=$(gcloud run services describe gdg-fsc-api \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}API deployed at: ${BLUE}${API_SERVICE_URL}${NC}"
echo ""

# Wait a moment for API to be fully ready
echo -e "${YELLOW}Waiting 10 seconds for API to be fully ready...${NC}"
sleep 10

# Step 2: Deploy Frontend with API URL
echo -e "${GREEN}Step 2: Deploying Frontend...${NC}"
echo ""
export API_URL=${API_SERVICE_URL}

"${SCRIPT_DIR}/deploy-frontend.sh"

# Get Frontend URL
FRONTEND_SERVICE_URL=$(gcloud run services describe gdg-fsc-frontend \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Full Stack Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}API URL:${NC}      ${API_SERVICE_URL}"
echo -e "${BLUE}Frontend URL:${NC} ${FRONTEND_SERVICE_URL}"
echo ""
echo -e "${GREEN}Your application is now live!${NC}"
echo ""
