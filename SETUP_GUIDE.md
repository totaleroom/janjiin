# Janjiin Setup Guide

Complete setup and deployment instructions for local development and major cloud platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Running Locally](#running-locally)
- [Docker Setup](#docker-setup)
- [Cloud Platform Deployment](#cloud-platform-deployment)
  - [AWS Deployment](#aws-deployment)
  - [Google Cloud Platform](#google-cloud-platform)
  - [Microsoft Azure](#microsoft-azure)
  - [Heroku Deployment](#heroku-deployment)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: v7.0.0+ (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Docker** (optional): v20.0.0+ ([Download](https://www.docker.com/))
- **Python**: v3.8+ (if using serverless frameworks)
- A code editor (VS Code, WebStorm, etc.)

### Verify Installation

```bash
node --version
npm --version
git --version
```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/totaleroom/janjiin.git
cd janjiin
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Create Local Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 4. Install Additional Tools (Optional)

For development convenience:

```bash
# Install nodemon for auto-reloading
npm install --save-dev nodemon

# Install concurrently for running multiple scripts
npm install --save-dev concurrently
```

---

## Environment Configuration

### Local Development (.env.local)

Create a `.env.local` file in the project root:

```env
# Application
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/janjiin_dev
DB_HOST=localhost
DB_PORT=5432
DB_NAME=janjiin_dev
DB_USER=postgres
DB_PASSWORD=yourpassword

# API Keys
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug

# Feature Flags
ENABLE_FEATURE_X=true
ENABLE_ANALYTICS=true
```

### Environment Variables by Platform

Different environments may require different configurations. Create separate files:

- `.env.local` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

---

## Running Locally

### Development Mode

Start the application in development mode with hot-reload:

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

### Production Build

Create an optimized production build:

```bash
npm run build
```

### Start Production Build

```bash
npm start
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.js
```

### Linting and Formatting

```bash
# Check code style
npm run lint

# Fix code style issues automatically
npm run lint:fix

# Format code
npm run format
```

---

## Docker Setup

### Build Docker Image

```bash
docker build -t janjiin:latest .
```

### Run Docker Container Locally

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e DATABASE_URL=postgresql://user:password@db:5432/janjiin \
  --env-file .env.local \
  janjiin:latest
```

### Docker Compose (Recommended)

Create a `docker-compose.yml` if not present:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@db:5432/janjiin
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: janjiin
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

Run with Docker Compose:

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
```

---

## Cloud Platform Deployment

### AWS Deployment

#### Option 1: AWS Elastic Beanstalk

##### Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed: `pip install awsebcli`
- AWS credentials configured: `aws configure`

##### Setup Steps

1. **Initialize Elastic Beanstalk**

```bash
eb init -p node.js-16 janjiin --region us-east-1
```

2. **Create Environment**

```bash
eb create janjiin-env \
  --instance-type t3.micro \
  --scale 1
```

3. **Set Environment Variables**

```bash
eb setenv NODE_ENV=production \
  DATABASE_URL=your_rds_url \
  API_KEY=your_api_key
```

4. **Deploy Application**

```bash
eb deploy
```

5. **Monitor Application**

```bash
eb logs
eb open
```

#### Option 2: AWS ECS (Docker)

##### Prerequisites

- Docker image pushed to ECR
- AWS account setup
- ECS cluster created

##### Steps

1. **Create ECR Repository**

```bash
aws ecr create-repository --repository-name janjiin
```

2. **Push Docker Image**

```bash
docker tag janjiin:latest <account_id>.dkr.ecr.us-east-1.amazonaws.com/janjiin:latest
docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/janjiin:latest
```

3. **Create ECS Task Definition** (janjiin-task.json)

```json
{
  "family": "janjiin",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "janjiin",
      "image": "<account_id>.dkr.ecr.us-east-1.amazonaws.com/janjiin:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/janjiin",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

4. **Register Task Definition**

```bash
aws ecs register-task-definition --cli-input-json file://janjiin-task.json
```

5. **Create ECS Service**

```bash
aws ecs create-service \
  --cluster janjiin-cluster \
  --service-name janjiin-service \
  --task-definition janjiin \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

#### Option 3: AWS Lambda

For serverless deployment with AWS Lambda:

1. **Install Serverless Framework**

```bash
npm install -g serverless
```

2. **Create Serverless Configuration** (serverless.yml)

```yaml
service: janjiin

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs16.x
  region: us-east-1
  environment:
    NODE_ENV: production
    DATABASE_URL: ${ssm:/janjiin/database-url}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - logs:CreateLogGroup
        - logs:CreateLogStream
        - logs:PutLogEvents
      Resource: "*"

functions:
  api:
    handler: handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline
  - serverless-plugin-tracing
```

3. **Deploy**

```bash
serverless deploy --stage production
```

---

### Google Cloud Platform

#### Option 1: Google Cloud Run (Recommended)

##### Prerequisites

- Google Cloud account
- `gcloud` CLI installed: `curl https://sdk.cloud.google.com | bash`
- Project created and billing enabled

##### Setup Steps

1. **Install and Initialize gcloud**

```bash
gcloud init
gcloud config set project janjiin-project
```

2. **Authenticate Docker**

```bash
gcloud auth configure-docker gcr.io
```

3. **Build and Push Image to Artifact Registry**

```bash
gcloud builds submit --tag gcr.io/janjiin-project/janjiin:latest
```

4. **Deploy to Cloud Run**

```bash
gcloud run deploy janjiin \
  --image gcr.io/janjiin-project/janjiin:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,DATABASE_URL=your_db_url,API_KEY=your_key
```

5. **Enable Cloud SQL Proxy (if using Cloud SQL)**

Update the gcloud run deploy command:

```bash
gcloud run deploy janjiin \
  --image gcr.io/janjiin-project/janjiin:latest \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances project:region:instance
```

#### Option 2: Google App Engine

1. **Create app.yaml**

```yaml
runtime: nodejs16

env: standard

env_variables:
  NODE_ENV: production

handlers:
  - url: /.*
    script: auto

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

2. **Deploy**

```bash
gcloud app deploy
```

#### Option 3: Google Kubernetes Engine (GKE)

1. **Create GKE Cluster**

```bash
gcloud container clusters create janjiin-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-1
```

2. **Create Kubernetes Deployment** (k8s-deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: janjiin
spec:
  replicas: 3
  selector:
    matchLabels:
      app: janjiin
  template:
    metadata:
      labels:
        app: janjiin
    spec:
      containers:
        - name: janjiin
          image: gcr.io/janjiin-project/janjiin:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: janjiin-secrets
                  key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: janjiin-service
spec:
  selector:
    app: janjiin
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

3. **Deploy**

```bash
kubectl create secret generic janjiin-secrets --from-literal=database-url=your_db_url
kubectl apply -f k8s-deployment.yaml
```

---

### Microsoft Azure

#### Option 1: Azure Container Instances

1. **Create Resource Group**

```bash
az group create --name janjiin-rg --location eastus
```

2. **Create Container Registry**

```bash
az acr create --resource-group janjiin-rg \
  --name janjiinregistry \
  --sku Basic
```

3. **Build and Push Image**

```bash
az acr build --registry janjiinregistry \
  --image janjiin:latest .
```

4. **Deploy Container**

```bash
az container create \
  --resource-group janjiin-rg \
  --name janjiin \
  --image janjiinregistry.azurecr.io/janjiin:latest \
  --cpu 1 --memory 1 \
  --port 3000 \
  --environment-variables NODE_ENV=production
```

#### Option 2: Azure App Service

1. **Create App Service Plan**

```bash
az appservice plan create \
  --name janjiin-plan \
  --resource-group janjiin-rg \
  --sku B1 --is-linux
```

2. **Create Web App**

```bash
az webapp create \
  --resource-group janjiin-rg \
  --plan janjiin-plan \
  --name janjiin-app \
  --deployment-container-image-name janjiinregistry.azurecr.io/janjiin:latest
```

3. **Configure Environment Variables**

```bash
az webapp config appsettings set \
  --resource-group janjiin-rg \
  --name janjiin-app \
  --settings NODE_ENV=production DATABASE_URL=your_db_url
```

#### Option 3: Azure Kubernetes Service (AKS)

1. **Create AKS Cluster**

```bash
az aks create \
  --resource-group janjiin-rg \
  --name janjiin-aks \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets \
  --load-balancer-sku standard
```

2. **Get Credentials**

```bash
az aks get-credentials \
  --resource-group janjiin-rg \
  --name janjiin-aks
```

3. **Deploy Application**

```bash
kubectl apply -f k8s-deployment.yaml
```

---

### Heroku Deployment

#### Prerequisites

- Heroku account
- Heroku CLI installed: `curl https://cli.heroku.com/install.sh | sh`

#### Setup Steps

1. **Login to Heroku**

```bash
heroku login
```

2. **Create Heroku App**

```bash
heroku create janjiin-app
```

3. **Add PostgreSQL Addon**

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set API_KEY=your_api_key
heroku config:set SECRET_KEY=your_secret_key
```

5. **Create Procfile** (in project root)

```
web: npm start
worker: npm run worker
release: npm run migrate
```

6. **Create app.json** (Heroku configuration)

```json
{
  "name": "Janjiin",
  "description": "Janjiin Application",
  "repository": "https://github.com/totaleroom/janjiin",
  "keywords": ["nodejs", "express"],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "description": "Application environment",
      "value": "production"
    },
    "API_KEY": {
      "description": "API Key",
      "required": true
    }
  },
  "addons": ["heroku-postgresql:hobby-dev"]
}
```

7. **Deploy**

```bash
git push heroku main
```

8. **View Logs**

```bash
heroku logs --tail
```

9. **Scale Dynos**

```bash
heroku ps:scale web=2
```

---

## Database Setup

### PostgreSQL Setup (Local)

#### macOS

```bash
# Install with Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb janjiin_dev
createdb janjiin_test
```

#### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb janjiin_dev
```

#### Windows

1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Open pgAdmin to create databases

### Run Migrations

```bash
# Create migration
npm run migrate:create migration_name

# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

### Seed Database

```bash
npm run db:seed
```

### Database Backups

```bash
# Backup PostgreSQL
pg_dump janjiin_dev > backup.sql

# Restore from backup
psql janjiin_dev < backup.sql
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Database Connection Issues

1. Verify DATABASE_URL is correct in .env.local
2. Check if PostgreSQL service is running
3. Verify credentials and database exists

```bash
# Test connection
psql $DATABASE_URL
```

### Docker Issues

```bash
# Clean up Docker
docker system prune -a

# Rebuild image
docker build --no-cache -t janjiin:latest .
```

### Memory Issues

If running out of memory:

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm start

# Or in .env
NODE_OPTIONS=--max-old-space-size=4096
```

### SSL Certificate Issues

For development:

```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```

For production, use proper certificates with Let's Encrypt or similar service.

---

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description"

# Push to remote
git push origin feature/feature-name

# Create pull request on GitHub
```

### Code Style Guidelines

- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Include unit tests for new features

### Running Pre-commit Hooks

```bash
npm install husky --save-dev
npm install lint-staged --save-dev

# Setup husky
npx husky install
```

### Useful npm Scripts

```bash
npm run dev              # Development mode
npm run build            # Build for production
npm start                # Start production build
npm test                 # Run tests
npm run lint             # Check code style
npm run lint:fix         # Fix code style
npm run format           # Format code
npm run migrate:up       # Run migrations
npm run db:seed          # Seed database
```

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Google Cloud Documentation](https://cloud.google.com/docs/)
- [Azure Documentation](https://docs.microsoft.com/azure/)

---

## Support and Contributions

For issues, questions, or contributions:

- Open an issue on [GitHub Issues](https://github.com/totaleroom/janjiin/issues)
- Submit a pull request with improvements
- Check existing documentation first

---

**Last Updated**: 2025-12-21

For the latest updates, refer to the main README.md and contributing guidelines.
