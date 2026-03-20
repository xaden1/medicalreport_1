# 🚀 MedProof Deployment Guide

Complete deployment instructions for different platforms and environments.

---

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Vercel (Frontend)](#vercel-frontend)
4. [Render (Backend)](#render-backend)
5. [AWS EC2/ECS](#aws-ec2ecs)
6. [DigitalOcean](#digitalocean)
7. [Railway](#railway)
8. [Production Checklist](#production-checklist)

---

## Local Development

### Quick Start

```bash
# Clone repository
git clone https://github.com/stellar-connect-wallet/medproof.git
cd medicalreport

# Backend setup
cd backend
npm install
cp .env.example .env
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

**Access:** http://localhost:3000

### Environment Configuration

Backend `.env` for development:
```env
NODE_ENV=development
PORT=5000
STELLAR_NETWORK=testnet
ENABLE_RATE_LIMITING=false
LOG_LEVEL=debug
```

---

## Docker Deployment

### Single Service (Backend)

```bash
cd backend
docker build -t medproof-backend:latest .
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e STELLAR_NETWORK=public \
  medproof-backend:latest
```

### Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up --build

# Or start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services Started:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Nginx: `http://localhost`
- Redis: `localhost:6379`

### Compose Configuration for Production

Add production overrides in `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Vercel (Frontend)

### Method 1: GitHub Integration (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository
5. Configure:
   - **Framework:** React
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

6. Add environment variables:
   ```
   REACT_APP_API_URL=https://api.medproof.dev/api
   REACT_APP_ENV=production
   ```

7. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment
vercel env pull .env.local
```

### Custom Domain

1. In Vercel dashboard → Project Settings → Domains
2. Add your domain
3. Update DNS records with Vercel nameservers
4. Enable HTTPS (automatic with Vercel)

---

## Render (Backend)

### Create Web Service

1. Go to [Render](https://render.com)
2. Click "New Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name:** `medproof-api`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** `18`

5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   STELLAR_NETWORK=public
   STELLAR_ACCOUNT_ID=your_account_id
   STELLAR_SECRET_KEY=your_secret_key
   CONTRACT_ADDRESS=your_contract_address
   ENABLE_RATE_LIMITING=true
   RATE_LIMIT_MAX_REQUESTS=1000
   ```

6. Click "Create Web Service"

### Update Frontend API Endpoint

In `frontend/.env.production`:
```
REACT_APP_API_URL=https://medproof-api.onrender.com/api
```

---

## AWS EC2/ECS

### EC2 Setup

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Clone and setup
git clone https://github.com/stellar-connect-wallet/medproof.git
cd medicalreport/backend
npm ci --production

# Create .env file
nano .env
# Add configuration

# Start with PM2 for process management
npm i -g pm2
pm2 start server.js --name "medproof-api"
pm2 save
pm2 startup

# Configure Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.medproof.dev;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### ECS Fargate Deployment

1. Create ECR repository for Docker images
2. Push Docker images:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com
   docker build -t medproof-backend .
   docker tag medproof-backend:latest YOUR_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/medproof-backend:latest
   docker push YOUR_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/medproof-backend:latest
   ```

3. Create ECS task definition
4. Create ECS service with load balancer
5. Configure auto-scaling policies

---

## DigitalOcean

### App Platform (Easiest)

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect GitHub repository
4. Add services:
   - **Backend:** `backend/` directory
   - **Frontend:** `frontend/` directory
5. Configure environment variables
6. Click "Deploy"

### Droplet Setup

```bash
# Connect to Droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2, Nginx, Certbot
npm i -g pm2
apt install -y nginx certbot python3-certbot-nginx

# Clone repository
git clone https://github.com/stellar-connect-wallet/medproof.git
cd medicalreport/backend
npm install

# Start application
pm2 start server.js
pm2 startup
pm2 save

# Setup SSL
certbot certonly --standalone -d api.medproof.dev
certbot certonly --standalone -d medproof.dev
```

---

## Railway

### Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
cd medicalreport
railway init

# Create backend service
cd backend
railway service add backend
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Deploy via GitHub

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Configure services and environment variables
6. Click "Deploy"

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (Minikube, AWS EKS, DigitalOcean Kubernetes, etc.)
- kubectl CLI installed
- Docker images in registry

### Create Kubernetes Manifests

1. **Deployment:**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: medproof-backend
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: medproof-backend
     template:
       metadata:
         labels:
           app: medproof-backend
       spec:
         containers:
         - name: medproof-backend
           image: your-registry/medproof-backend:latest
           ports:
           - containerPort: 5000
           env:
           - name: NODE_ENV
             value: "production"
           - name: PORT
             value: "5000"
           resources:
             requests:
               memory: "256Mi"
               cpu: "250m"
             limits:
               memory: "512Mi"
               cpu: "500m"
   ```

2. **Service:**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: medproof-backend
   spec:
     selector:
       app: medproof-backend
     ports:
     - protocol: TCP
       port: 80
       targetPort: 5000
     type: LoadBalancer
   ```

### Deploy to Kubernetes

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Monitor deployment
kubectl get pods
kubectl logs -f deployment/medproof-backend
```

---

## Production Checklist

Before deploying to production, verify:

### Security
- [ ] Environment variables are secure (not in code)
- [ ] API keys are rotated
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive data
- [ ] Database credentials encrypted
- [ ] API authentication enabled (JWT or API key)

### Performance
- [ ] Database indexes optimized
- [ ] Caching implemented (Redis)
- [ ] CDN configured for static assets
- [ ] Minification enabled for JavaScript/CSS
- [ ] Image optimization applied
- [ ] Load balancer configured
- [ ] Auto-scaling policies set up
- [ ] Database connection pooling enabled

### Monitoring & Logging
- [ ] Error tracking setup (Sentry/Rollbar)
- [ ] Application monitoring (DataDog/New Relic)
- [ ] Log aggregation (CloudWatch/ELK)
- [ ] Health checks configured
- [ ] Uptime monitoring enabled
- [ ] Alerts configured for critical failures
- [ ] Performance metrics tracked
- [ ] Database backups automated

### Infrastructure
- [ ] DNS properly configured
- [ ] CDN configured
- [ ] Database backups automated
- [ ] Disaster recovery plan documented
- [ ] Infrastructure as Code (Terraform/CloudFormation)
- [ ] Multi-region setup (if needed)
- [ ] Load balancing configured
- [ ] Auto-scaling groups setup

### Testing
- [ ] End-to-end tests pass
- [ ] Load testing completed
- [ ] Security scanning completed
- [ ] Dependency vulnerabilities checked
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness tested

### Documentation
- [ ] API documentation complete
- [ ] Deployment runbooks documented
- [ ] Emergency procedures documented
- [ ] Architecture documentation updated
- [ ] Team trained on deployment process

---

## Troubleshooting

### Common Issues

#### Port already in use
```bash
# Find and kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

#### Out of memory during build
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

#### CORS errors
- Update `corsOptions` in `backend/middleware/security.js`
- Ensure frontend URL matches `FRONTEND_URL` in `.env`

#### Blockchain verification fails
- Check Stellar network status
- Verify contract address
- Check account has sufficient lumens for transactions

#### IPFS connection issues
- Start local IPFS daemon: `ipfs daemon`
- Or use Infura gateway: `IPFS_GATEWAY_URL=https://gateway.pinata.cloud`

#### Database connection timeouts
- Check network connectivity
- Verify credentials
- Increase timeout values in `.env`
- Check database security groups

---

## Monitoring & Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check API health endpoint
- Monitor server resources

**Weekly:**
- Review performance metrics
- Check for security alerts
- Test backup restoration

**Monthly:**
- Update dependencies
- Review security patches
- Analyze usage patterns
- Optimize queries if needed

**Quarterly:**
- Security audit
- Performance review
- Architecture review
- Disaster recovery drill

---

## Rollback Procedure

```bash
# Docker Compose rollback
docker-compose down
git checkout <previous-commit>
docker-compose up --build

# Render rollback
# In Render dashboard → Deployments → Select previous version → Redeploy

# Vercel rollback
# In Vercel dashboard → Deployments → Select previous → Promote to Production
```

---

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- health endpoint: `curl https://api.medproof.dev/health`
- Review deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Last Updated:** March 16, 2026
