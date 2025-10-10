# ☁️ Google Cloud Run Deployment Guide

Complete guide for deploying the NYC Restaurants Inspector to Google Cloud Run.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Deployment Steps](#-deployment-steps)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [Monitoring](#-monitoring)
- [Troubleshooting](#-troubleshooting)
- [Cost Optimization](#-cost-optimization)

## 🔧 Prerequisites

### Required Tools

1. **Google Cloud SDK**
   ```bash
   # Install gcloud CLI
   # Visit: https://cloud.google.com/sdk/docs/install
   
   # Verify installation
   gcloud --version
   ```

2. **Docker**
   ```bash
   # Verify Docker is installed
   docker --version
   ```

3. **GCP Project**
   ```bash
   # Create a new project (or use existing)
   gcloud projects create gdg-fsc-restaurants
   
   # Set default project
   gcloud config set project gdg-fsc-restaurants
   ```

### Enable Required APIs

```bash
# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com
```

### Authenticate Docker

```bash
# Configure Docker to use gcloud credentials
gcloud auth configure-docker
```

## 🚀 Quick Start

### Environment Setup

1. **Set environment variables**:
   ```bash
   export GCP_PROJECT_ID="your-project-id"
   export GCP_REGION="us-central1"
   export VERSION="v1"
   export VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
   ```

2. **Optional: Configure Cloud SQL** (for persistent database):
   ```bash
   export DB_CONNECTION_NAME="project:region:instance"
   export DB_USER="postgres"
   export DB_PASSWORD="your_secure_password"
   export DB_NAME="restaurants"
   ```

### Deploy Everything

```bash
# Deploy both API and Frontend
./scripts/deploy-all.sh
```

### Deploy Individual Services

```bash
# Deploy only API
./scripts/deploy-api.sh

# Deploy only Frontend (requires API URL)
export API_URL="https://your-api-url.run.app"
./scripts/deploy-frontend.sh
```

## ⚙️ Configuration

### Project Configuration

Create a `.env.cloud` file (or export variables):

```bash
# GCP Configuration
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1
VERSION=v1

# Database (optional - uses in-memory if not set)
DB_CONNECTION_NAME=project:region:instance
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=restaurants

# Frontend Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Load Configuration

```bash
# Source the configuration
source .env.cloud
```

## 📦 Deployment Steps

### Step 1: Deploy API Backend

```bash
# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"

# Optional: Configure Cloud SQL
export DB_CONNECTION_NAME="project:region:instance"

# Deploy
./scripts/deploy-api.sh
```

**What happens:**
1. ✅ Builds Docker image from `api/Dockerfile`
2. ✅ Tags image as `gcr.io/{PROJECT_ID}/gdg-api:{VERSION}`
3. ✅ Pushes image to Google Container Registry
4. ✅ Deploys to Cloud Run with:
   - 768Mi memory
   - 1 CPU
   - Auto-scaling (0-10 instances)
   - Cloud SQL connection (if configured)

**Output:**
```
Service URL: https://gdg-fsc-api-xxx.run.app
```

### Step 2: Deploy Frontend

```bash
# Get API URL from previous step
export API_URL="https://gdg-fsc-api-xxx.run.app"
export VITE_GOOGLE_MAPS_API_KEY="your_key"

# Deploy
./scripts/deploy-frontend.sh
```

**What happens:**
1. ✅ Builds Docker image with environment variables baked in
2. ✅ Tags image as `gcr.io/{PROJECT_ID}/gdg-frontend:{VERSION}`
3. ✅ Pushes image to Google Container Registry
4. ✅ Deploys to Cloud Run with:
   - 256Mi memory
   - 1 CPU
   - Auto-scaling (0-10 instances)

**Output:**
```
Service URL: https://gdg-fsc-frontend-xxx.run.app
```

### Step 3: Test Deployment

```bash
# Test API health
curl https://gdg-fsc-api-xxx.run.app/actuator/health

# Test API endpoint
curl "https://gdg-fsc-api-xxx.run.app/api/restaurants/search?borough=MANHATTAN&limit=5"

# Visit frontend
open https://gdg-fsc-frontend-xxx.run.app
```

## 🗄️ Database Setup

### Option 1: In-Memory Database (Default)

No additional setup required. Data is not persisted.

**Pros:**
- ✅ Free
- ✅ No configuration needed
- ✅ Fast deployment

**Cons:**
- ❌ Data lost on restart
- ❌ Not suitable for production

### Option 2: Cloud SQL (Recommended for Production)

#### Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create restaurants-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=your_secure_password

# Create database
gcloud sql databases create restaurants \
  --instance=restaurants-db

# Get connection name
gcloud sql instances describe restaurants-db \
  --format='value(connectionName)'
# Output: project:region:restaurants-db
```

#### Deploy with Cloud SQL

```bash
export DB_CONNECTION_NAME="project:region:restaurants-db"
export DB_USER="postgres"
export DB_PASSWORD="your_secure_password"
export DB_NAME="restaurants"

./scripts/deploy-api.sh
```

#### Populate Database

```bash
# Connect to Cloud SQL
gcloud sql connect restaurants-db --user=postgres

# Run SQL commands or use data loader
# See docs/database/README.md for data population
```

## 🌍 Environment Variables

### API Environment Variables

Set in Cloud Run:

```bash
gcloud run services update gdg-fsc-api \
  --region=us-central1 \
  --set-env-vars="
SPRING_PROFILES_ACTIVE=prod,
JAVA_OPTS=-Xms256m -Xmx512m,
SPRING_DATASOURCE_URL=jdbc:postgresql:///restaurants?cloudSqlInstance=...,
SPRING_DATASOURCE_USERNAME=postgres,
SPRING_DATASOURCE_PASSWORD=your_password
"
```

### Frontend Environment Variables

These are **baked into the build** (not runtime):
- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

To update, rebuild and redeploy:
```bash
export API_URL="new_api_url"
export VITE_GOOGLE_MAPS_API_KEY="new_key"
./scripts/deploy-frontend.sh
```

## 📊 Monitoring

### View Logs

```bash
# API logs
gcloud run logs read gdg-fsc-api --region=us-central1 --limit=50

# Frontend logs
gcloud run logs read gdg-fsc-frontend --region=us-central1 --limit=50

# Follow logs in real-time
gcloud run logs tail gdg-fsc-api --region=us-central1
```

### View Metrics

```bash
# Open Cloud Run console
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format="value(status.url)" | xargs -I {} echo "Metrics: https://console.cloud.google.com/run"
```

### Check Service Status

```bash
# List all services
gcloud run services list --region=us-central1

# Describe service
gcloud run services describe gdg-fsc-api --region=us-central1
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Check Docker build locally
cd api
docker build -t test-api .

# Check logs
docker run --rm test-api
```

### Deployment Fails

```bash
# Check service logs
gcloud run services logs read gdg-fsc-api --region=us-central1

# Check revisions
gcloud run revisions list --service=gdg-fsc-api --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic gdg-fsc-api \
  --to-revisions=gdg-fsc-api-00001-abc=100 \
  --region=us-central1
```

### Service Not Responding

```bash
# Check health endpoint
curl https://gdg-fsc-api-xxx.run.app/actuator/health

# Check container logs
gcloud run logs tail gdg-fsc-api --region=us-central1

# Restart service (deploy same revision)
gcloud run deploy gdg-fsc-api \
  --image=gcr.io/PROJECT_ID/gdg-api:latest \
  --region=us-central1
```

### Database Connection Issues

```bash
# Verify Cloud SQL connection
gcloud sql instances describe restaurants-db

# Check Cloud SQL proxy
gcloud sql connect restaurants-db --user=postgres

# Verify Cloud Run has correct connection name
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format='value(spec.template.metadata.annotations)'
```

### Frontend Not Loading

```bash
# Check if API URL is correct
# View source of deployed frontend and check network requests

# Rebuild with correct API URL
export API_URL="https://correct-api-url.run.app"
./scripts/deploy-frontend.sh
```

## 💰 Cost Optimization

### Free Tier Limits

Cloud Run free tier (per month):
- 2 million requests
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds
- 1 GB network egress (Americas)

### Optimization Tips

1. **Use minimum instances = 0** (scale to zero)
   ```bash
   gcloud run services update gdg-fsc-api \
     --min-instances=0 \
     --region=us-central1
   ```

2. **Reduce memory if possible**
   ```bash
   gcloud run services update gdg-fsc-frontend \
     --memory=128Mi \
     --region=us-central1
   ```

3. **Set request timeout**
   ```bash
   gcloud run services update gdg-fsc-api \
     --timeout=60 \
     --region=us-central1
   ```

4. **Use Cloud SQL db-f1-micro** for database (free eligible)

5. **Set max instances** to prevent runaway costs
   ```bash
   gcloud run services update gdg-fsc-api \
     --max-instances=10 \
     --region=us-central1
   ```

### Monitor Costs

```bash
# View Cloud Run billing
# Visit: https://console.cloud.google.com/billing

# Set budget alerts
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Cloud Run Budget" \
  --budget-amount=50 \
  --threshold-rule=percent=50
```

## 🔒 Security Best Practices

### Use IAM for Authentication

```bash
# Remove --allow-unauthenticated
gcloud run services update gdg-fsc-api \
  --no-allow-unauthenticated \
  --region=us-central1

# Add service account
gcloud run services add-iam-policy-binding gdg-fsc-api \
  --member="serviceAccount:frontend@project.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region=us-central1
```

### Use Secret Manager

```bash
# Store secrets
echo -n "your_db_password" | gcloud secrets create db-password --data-file=-

# Use in Cloud Run
gcloud run services update gdg-fsc-api \
  --update-secrets=DB_PASSWORD=db-password:latest \
  --region=us-central1
```

### Enable Cloud Armor

```bash
# Configure Cloud Armor for DDoS protection
# See: https://cloud.google.com/armor/docs
```

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Container Registry](https://cloud.google.com/container-registry/docs)
- [Cloud Build](https://cloud.google.com/build/docs)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

## 🆘 Support

For issues specific to this workshop:
- Check [Troubleshooting](#-troubleshooting) section
- Review logs: `gcloud run logs read SERVICE_NAME`
- Check [GitHub Issues](https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop/issues)

---

**Ready to deploy?** Run `./scripts/deploy-all.sh` and you're live! 🚀
