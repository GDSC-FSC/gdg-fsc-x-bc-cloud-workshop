#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"hackmit-2024-api"}
IMAGE_NAME="gdg-api"
VERSION=${VERSION:-"v1"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="gdg-fsc-api"
DB_CONNECTION_NAME=${DB_CONNECTION_NAME:-""}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"brooklyn"}
DB_NAME=${DB_NAME:-"postgres"}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deploying API to Google Cloud Run${NC}"
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

# Navigate to api directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")/api"
cd "$API_DIR"

echo -e "${GREEN}Building Docker image (this may take a few minutes)...${NC}"
docker build -t ${IMAGE_NAME}:${VERSION} .

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

# Base deployment command
DEPLOY_CMD="gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 768Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80"

# Add environment variables
ENV_VARS="SPRING_PROFILES_ACTIVE=prod"
ENV_VARS+=",JAVA_OPTS=-Xms256m -Xmx512m"

# Add database configuration if Cloud SQL connection provided
if [ -n "$DB_CONNECTION_NAME" ]; then
  echo -e "${YELLOW}Configuring Cloud SQL connection...${NC}"
  DEPLOY_CMD+=" --add-cloudsql-instances ${DB_CONNECTION_NAME}"
  ENV_VARS+=",SPRING_DATASOURCE_URL=jdbc:postgresql:///${DB_NAME}?cloudSqlInstance=${DB_CONNECTION_NAME}&socketFactory=com.google.cloud.sql.postgres.SocketFactory"
  ENV_VARS+=",SPRING_DATASOURCE_USERNAME=${DB_USER}"
  ENV_VARS+=",SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}"
else
  echo -e "${YELLOW}Warning: DB_CONNECTION_NAME not set. Using default in-memory database.${NC}"
  echo -e "${YELLOW}Set it with: export DB_CONNECTION_NAME=project:region:instance${NC}"
fi

DEPLOY_CMD+=" --set-env-vars=\"${ENV_VARS}\""

# Execute deployment
eval $DEPLOY_CMD

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}API Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Service Details:${NC}"
echo -e "  URL:    ${SERVICE_URL}"
echo -e "  Image:  gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${VERSION}"
echo -e "  Region: ${REGION}"
echo -e "  Memory: 768Mi"
echo -e "  CPU:    1"
echo ""
echo -e "${GREEN}Testing endpoints:${NC}"
echo -e "  Health: ${SERVICE_URL}/actuator/health"
echo -e "  API:    ${SERVICE_URL}/api/restaurants/search"
echo ""
if [ -z "$DB_CONNECTION_NAME" ]; then
  echo -e "${YELLOW}⚠️  Note: Using in-memory database. Data will not persist.${NC}"
  echo -e "${YELLOW}   For production, set DB_CONNECTION_NAME environment variable.${NC}"
  echo ""
fi
