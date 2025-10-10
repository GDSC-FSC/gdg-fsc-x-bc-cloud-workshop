# ☁️ Google Cloud Deployment

Deploy the NYC Restaurants Inspector to Google Cloud Run.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[Cloud Run Deployment Guide](./CLOUD_RUN_DEPLOYMENT.md)** | Complete deployment guide with setup, configuration, and troubleshooting |
| **[Quick Reference](./QUICK_REFERENCE.md)** | Common commands and examples for quick access |
| **[Update Summary](./UPDATE_SUMMARY.md)** | Details of recent updates and improvements |

## 🚀 Quick Start

### 1. Install Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Docker](https://docs.docker.com/get-docker/)

### 2. Set Environment Variables

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

### 3. Deploy

```bash
# Deploy both API and Frontend
./scripts/deploy-all.sh

# Or use npm
npm run cloud:deploy
```

## 📦 What Gets Deployed

### Architecture

```
┌─────────────────────────────────────────────┐
│         Google Cloud Run                     │
│                                              │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │   Frontend   │─────▶│   API Backend   │ │
│  │ (React/Vite) │      │ (Spring Boot)   │ │
│  │   256Mi RAM  │      │   768Mi RAM     │ │
│  └──────────────┘      └────────┬────────┘ │
│                                  │          │
│                        ┌─────────▼────────┐ │
│                        │   Cloud SQL      │ │
│                        │  (PostgreSQL)    │ │
│                        └──────────────────┘ │
└─────────────────────────────────────────────┘
```

### Services

| Service | Technology | Memory | Auto-Scale |
|---------|-----------|---------|------------|
| **Frontend** | React + Vite | 256Mi | 0-10 instances |
| **API** | Spring Boot | 768Mi | 0-10 instances |
| **Database** | Cloud SQL (optional) | - | Always on |

## 🔧 Configuration

### Required Variables

```bash
GCP_PROJECT_ID           # Your GCP project ID
GCP_REGION              # Deployment region (e.g., us-central1)
VITE_GOOGLE_MAPS_API_KEY # Google Maps API key
```

### Optional Variables

```bash
DB_CONNECTION_NAME      # Cloud SQL connection (project:region:instance)
DB_USER                # Database username (default: postgres)
DB_PASSWORD            # Database password (default: brooklyn)
DB_NAME                # Database name (default: restaurants)
VERSION                # Image version tag (default: v1)
```

## 💻 Available Scripts

### npm Scripts

```bash
npm run cloud:deploy              # Deploy everything
npm run cloud:deploy:api          # Deploy API only
npm run cloud:deploy:frontend     # Deploy frontend only
```

### Bash Scripts

```bash
./scripts/deploy-all.sh           # Deploy everything
./scripts/deploy-api.sh           # Deploy API only
./scripts/deploy-frontend.sh      # Deploy frontend only
```

## 🗄️ Database Options

### Option 1: In-Memory (Default)
- ✅ Free
- ✅ No setup required
- ❌ Data not persisted

### Option 2: Cloud SQL (Recommended)
```bash
# Create Cloud SQL instance
gcloud sql instances create restaurants-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1

# Deploy with Cloud SQL
export DB_CONNECTION_NAME="project:region:restaurants-db"
./scripts/deploy-all.sh
```

## 📊 Monitoring

### View Logs

```bash
# API logs
gcloud run logs read gdg-fsc-api --region=us-central1

# Frontend logs  
gcloud run logs read gdg-fsc-frontend --region=us-central1

# Follow logs
gcloud run logs tail gdg-fsc-api --region=us-central1
```

### Check Status

```bash
# List services
gcloud run services list --region=us-central1

# Get service URL
gcloud run services describe gdg-fsc-api \
  --region=us-central1 \
  --format='value(status.url)'
```

## 💰 Cost Estimation

### Free Tier (per month)
- 2 million requests
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

### Typical Monthly Cost
- **Low traffic** (<10k requests/month): **Free**
- **Medium traffic** (~100k requests/month): **$5-10**
- **High traffic** (~1M requests/month): **$20-30**

*Plus Cloud SQL costs if used (~$7-15/month for db-f1-micro)*

## 🐛 Troubleshooting

### Common Issues

**Service not responding:**
```bash
# Check logs
gcloud run logs read gdg-fsc-api --region=us-central1

# Check health
curl https://SERVICE_URL/actuator/health
```

**Build fails:**
```bash
# Test build locally
cd api && docker build -t test-api .

# Check for errors
docker run --rm test-api
```

**Frontend can't reach API:**
```bash
# Verify API URL
echo $API_URL

# Rebuild with correct URL
export API_URL="https://correct-url.run.app"
./scripts/deploy-frontend.sh
```

## 🔒 Security

### Enable Authentication

```bash
# Require auth
gcloud run services update gdg-fsc-api \
  --no-allow-unauthenticated \
  --region=us-central1
```

### Use Secrets

```bash
# Store secret
echo -n "secret_value" | gcloud secrets create my-secret --data-file=-

# Use in Cloud Run
gcloud run services update gdg-fsc-api \
  --update-secrets=MY_SECRET=my-secret:latest \
  --region=us-central1
```

## 📖 Next Steps

1. **Read the full guide**: [Cloud Run Deployment Guide](./CLOUD_RUN_DEPLOYMENT.md)
2. **Set up Cloud SQL**: See [Database Setup](./CLOUD_RUN_DEPLOYMENT.md#-database-setup)
3. **Configure monitoring**: [Monitoring Guide](./CLOUD_RUN_DEPLOYMENT.md#-monitoring)
4. **Optimize costs**: [Cost Optimization](./CLOUD_RUN_DEPLOYMENT.md#-cost-optimization)

## 🆘 Support

- **Documentation**: See guides above
- **Issues**: [GitHub Issues](https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop/issues)
- **Cloud Run Docs**: [Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**Ready to deploy?** Run `./scripts/deploy-all.sh` 🚀
