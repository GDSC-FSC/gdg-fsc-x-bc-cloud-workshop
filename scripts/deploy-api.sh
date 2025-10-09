#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"hackmit-2024-api"}
IMAGE_NAME="gdg-fsc-api"
VERSION=${VERSION:-"v1"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="gdg-fsc-api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Deploying API to Google Cloud Run${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Set the project
echo -e "${GREEN}Setting GCP project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Navigate to api directory
cd "$(dirname "$0")/../api"

# Build Docker image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${VERSION} .

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
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod"

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
echo ""
