# ☁️ Cloud Run - Quick Reference

Quick commands and examples for Google Cloud Run deployment.

## 🚀 Quick Deploy

```bash
# Set environment
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export VITE_GOOGLE_MAPS_API_KEY="your_maps_key"

# Deploy everything
./scripts/deploy-all.sh
```

## 📦 Individual Deployments

### Deploy API Only

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"

# Optional: Add Cloud SQL
export DB_CONNECTION_NAME="project:region:instance"

./scripts/deploy-api.sh
```

### Deploy Frontend Only

```bash
export GCP_PROJECT_ID="your-project-id"
export API_URL="https://your-api-url.run.app"
export VITE_GOOGLE_MAPS_API_KEY="your_key"

./scripts/deploy-frontend.sh
```

## 🔧 Common Commands

### View Services

```bash
# List all services
gcloud run services list --region=us-central1

# Describe service
gcloud run services describe gdg-fsc-api --region=us-central1

# Get service URL
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format='value(status.url)'
```

### View Logs

```bash
# Recent logs
gcloud run logs read gdg-fsc-api --region=us-central1 --limit=50

# Follow logs
gcloud run logs tail gdg-fsc-api --region=us-central1

# Filter logs
gcloud run logs read gdg-fsc-api --region=us-central1 \
  --filter="severity>=ERROR"
```

### Update Service

```bash
# Update environment variables
gcloud run services update gdg-fsc-api \
  --region=us-central1 \
  --set-env-vars="KEY=value"

# Update memory
gcloud run services update gdg-fsc-api \
  --region=us-central1 \
  --memory=1Gi

# Update max instances
gcloud run services update gdg-fsc-api \
  --region=us-central1 \
  --max-instances=20
```

### Rollback

```bash
# List revisions
gcloud run revisions list --service=gdg-fsc-api --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic gdg-fsc-api \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

### Delete Service

```bash
# Delete service
gcloud run services delete gdg-fsc-api --region=us-central1

# Delete image from GCR
gcloud container images delete gcr.io/PROJECT_ID/gdg-api:v1
```

## 🗄️ Database Commands

### Cloud SQL

```bash
# Create instance
gcloud sql instances create restaurants-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create restaurants --instance=restaurants-db

# Connect
gcloud sql connect restaurants-db --user=postgres

# Get connection name
gcloud sql instances describe restaurants-db \
  --format='value(connectionName)'
```

## 🔍 Debugging

### Test Endpoints

```bash
# Health check
curl https://SERVICE_URL/actuator/health

# API endpoint
curl "https://SERVICE_URL/api/restaurants/search?borough=MANHATTAN&limit=5"

# Frontend
curl -I https://FRONTEND_URL
```

### Check Container

```bash
# View container details
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format=json

# Check health status
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format='get(status.conditions)'
```

## 🌍 Environment Variables

### Set Environment Variables

```bash
# Single variable
gcloud run services update gdg-fsc-api \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod" \
  --region=us-central1

# Multiple variables
gcloud run services update gdg-fsc-api \
  --set-env-vars="VAR1=value1,VAR2=value2" \
  --region=us-central1

# From file
gcloud run services update gdg-fsc-api \
  --env-vars-file=.env.cloud \
  --region=us-central1
```

### View Environment Variables

```bash
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format='value(spec.template.spec.containers[0].env)'
```

## 📊 Monitoring

### View Metrics

```bash
# Open in console
echo "https://console.cloud.google.com/run/detail/${GCP_REGION}/gdg-fsc-api/metrics?project=${GCP_PROJECT_ID}"

# Get request count
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gdg-fsc-api" \
  --limit=100 \
  --format="table(timestamp,severity,textPayload)"
```

### Set Alerts

```bash
# Create uptime check
gcloud monitoring uptime-checks create SERVICE_NAME \
  --display-name="API Health Check" \
  --http-check-path="/actuator/health"
```

## 💰 Cost Management

### View Current Costs

```bash
# List resource usage
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format='get(status.traffic[0].latestRevision)'
```

### Optimize Costs

```bash
# Scale to zero
gcloud run services update gdg-fsc-api \
  --min-instances=0 \
  --region=us-central1

# Reduce memory
gcloud run services update gdg-fsc-frontend \
  --memory=128Mi \
  --region=us-central1

# Set timeout
gcloud run services update gdg-fsc-api \
  --timeout=60s \
  --region=us-central1
```

## 🔒 Security

### Authentication

```bash
# Require authentication
gcloud run services update gdg-fsc-api \
  --no-allow-unauthenticated \
  --region=us-central1

# Add invoker role
gcloud run services add-iam-policy-binding gdg-fsc-api \
  --member="user:email@example.com" \
  --role="roles/run.invoker" \
  --region=us-central1
```

### Use Secrets

```bash
# Create secret
echo -n "secret_value" | gcloud secrets create my-secret --data-file=-

# Use in Cloud Run
gcloud run services update gdg-fsc-api \
  --update-secrets=MY_SECRET=my-secret:latest \
  --region=us-central1
```

## 🛠️ Troubleshooting One-Liners

```bash
# Check if service is healthy
curl -sf $(gcloud run services describe gdg-fsc-api --region=us-central1 --format='value(status.url)')/actuator/health

# Get latest error logs
gcloud run logs read gdg-fsc-api --region=us-central1 --limit=10 --filter="severity>=ERROR"

# Restart service (redeploy same image)
gcloud run deploy gdg-fsc-api --image=$(gcloud run services describe gdg-fsc-api --region=us-central1 --format='value(spec.template.spec.containers[0].image)') --region=us-central1

# Check quotas
gcloud compute project-info describe --project=${GCP_PROJECT_ID}

# View all revisions
gcloud run revisions list --service=gdg-fsc-api --region=us-central1 --sort-by="~metadata.creationTimestamp"
```

## 📋 npm Scripts

```bash
# Deploy with npm
npm run cloud:deploy              # Deploy everything
npm run cloud:deploy:api          # Deploy API only  
npm run cloud:deploy:frontend     # Deploy frontend only
```

## 🔗 Useful Links

- [Cloud Run Console](https://console.cloud.google.com/run)
- [Container Registry](https://console.cloud.google.com/gcr)
- [Cloud SQL](https://console.cloud.google.com/sql)
- [Logs Explorer](https://console.cloud.google.com/logs)
- [Monitoring](https://console.cloud.google.com/monitoring)

---

For detailed guide, see [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)
