#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"hackmit-2024-api"}
IMAGE_NAME="gdg-fsc-frontend"
VERSION=${VERSION:-"v1"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="gdg-fsc-frontend"
API_URL=${API_URL:-""}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Deploying Frontend to Google Cloud Run${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Set the project
echo -e "${GREEN}Setting GCP project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Check if API_URL is provided
if [ -z "$API_URL" ]; then
  echo -e "${YELLOW}Warning: API_URL not set. You may need to rebuild with the correct API URL later.${NC}"
  echo -e "${YELLOW}Set it with: export API_URL=https://your-api-url.run.app${NC}"
  echo ""
fi

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

# Build Docker image
echo -e "${GREEN}Building Docker image...${NC}"
if [ -n "$API_URL" ]; then
  docker build --build-arg VITE_API_URL=${API_URL} -t ${IMAGE_NAME}:${VERSION} .
else
  docker build -t ${IMAGE_NAME}:${VERSION} .
fi

# Tag the image for GCR
echo -e "${GREEN}Tagging image for Google Container Registry...${NC}"
docker tag ${IMAGE_NAME}:${VERSION} gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION}
docker tag ${IMAGE_NAME}:${VERSION} gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest

# Push to GCR
echo -e "${GREEN}Pushing image to GCR...${NC}"
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION}
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest

# List images to verify
echo -e "${GREEN}Verifying image in GCR...${NC}"
gcloud container images list-tags gcr.io/${PROJECT_ID}/${IMAGE_NAME}

# Deploy to Cloud Run
echo -e "${GREEN}Deploying to Cloud Run...${NC}"
if [ -n "$API_URL" ]; then
  gcloud run deploy ${SERVICE_NAME} \
    --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 80 \
    --memory 256Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars="VITE_API_URL=${API_URL}"
else
  gcloud run deploy ${SERVICE_NAME} \
    --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 80 \
    --memory 256Mi \
    --cpu 1 \
    --max-instances 10
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "Service URL: ${BLUE}${SERVICE_URL}${NC}"
echo -e "Image: gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION}"
if [ -n "$API_URL" ]; then
  echo -e "API URL: ${API_URL}"
fi
echo ""
