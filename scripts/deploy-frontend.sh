#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"hackmit-2024-api"}
IMAGE_NAME="gdg-frontend"
VERSION=${VERSION:-"v1"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="gdg-fsc-frontend"
API_URL=${API_URL:-""}
GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY:-""}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deploying Frontend to Google Cloud Run${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo -e "${GREEN}Setting GCP project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Check required variables
if [ -z "$API_URL" ]; then
  echo -e "${RED}Error: API_URL is required${NC}"
  echo -e "${YELLOW}Set it with: export API_URL=https://your-api-url.run.app${NC}"
  exit 1
fi

if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
  echo -e "${YELLOW}Warning: GOOGLE_MAPS_API_KEY not set. Maps functionality will not work.${NC}"
  echo -e "${YELLOW}Set it with: export VITE_GOOGLE_MAPS_API_KEY=your_key${NC}"
  echo ""
fi

# Navigate to frontend directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")/frontend"
cd "$FRONTEND_DIR"

echo -e "${BLUE}Build Configuration:${NC}"
echo -e "  API URL: ${API_URL}"
echo -e "  Maps API Key: ${GOOGLE_MAPS_API_KEY:+***${GOOGLE_MAPS_API_KEY: -4}}"
echo ""

# Build Docker image with build args
echo -e "${GREEN}Building Docker image (this may take a few minutes)...${NC}"
BUILD_ARGS="--build-arg VITE_API_URL=${API_URL}"
if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
  BUILD_ARGS+=" --build-arg VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}"
fi

docker build $BUILD_ARGS -t ${IMAGE_NAME}:${VERSION} .

# Configure Docker to use gcloud as credential helper
echo -e "${GREEN}Configuring Docker authentication...${NC}"
gcloud auth configure-docker --quiet

# Tag the image for GCR
echo -e "${GREEN}Tagging image for Google Container Registry...${NC}"
docker tag ${IMAGE_NAME}:${VERSION} gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION}
docker tag ${IMAGE_NAME}:${VERSION} gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest

# Push to GCR
echo -e "${GREEN}Pushing image to GCR (this may take a few minutes)...${NC}"
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION}
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest

# List images to verify
echo -e "${GREEN}Verifying image in GCR...${NC}"
gcloud container images list-tags gcr.io/${PROJECT_ID}/${IMAGE_NAME} --limit=5

# Deploy to Cloud Run
echo -e "${GREEN}Deploying to Cloud Run...${NC}"

gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 3000 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60 \
  --concurrency 80 \
  --set-env-vars="NODE_ENV=production"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Frontend Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Service Details:${NC}"
echo -e "  URL:       ${SERVICE_URL}"
echo -e "  Image:     gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION}"
echo -e "  Region:    ${REGION}"
echo -e "  Memory:    256Mi"
echo -e "  CPU:       1"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo -e "  API URL:   ${API_URL}"
if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
  echo -e "  Maps API:  Configured ✓"
else
  echo -e "  Maps API:  ${YELLOW}Not configured ⚠${NC}"
fi
echo ""
echo -e "${GREEN}Your application is live at:${NC}"
echo -e "  ${BLUE}${SERVICE_URL}${NC}"
echo ""
