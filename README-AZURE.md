# Azure Deployment Guide

This guide explains how to deploy the YellowTip Reservations application to Microsoft Azure.

## Prerequisites

1. Azure account with active subscription
2. Azure CLI installed and configured
3. Docker installed locally
4. Azure Container Registry (ACR) created

## Deployment Options

### Option 1: Azure Container Instances (ACI)

1. **Create Azure Container Registry:**
```bash
az acr create --resource-group your-resource-group --name yellowtip --sku Basic
az acr login --name yellowtip
```

2. **Build and push images:**
```bash
# Build and push backend
docker build -t yellowtip.azurecr.io/yellowtip-backend:latest ./backend
docker push yellowtip.azurecr.io/yellowtip-backend:latest

# Build and push frontend
docker build -f ./frontend/Dockerfile.production -t yellowtip.azurecr.io/yellowtip-frontend:latest ./frontend
docker push yellowtip.azurecr.io/yellowtip-frontend:latest
```

3. **Create environment file:**
```bash
cp azure.env.example azure.env
# Edit azure.env with your Azure-specific values
```

4. **Deploy with docker-compose:**
```bash
docker-compose -f docker-compose.azure.yml --env-file azure.env up -d
```

### Option 2: Azure App Service

1. **Create App Service plans:**
```bash
# For backend
az appservice plan create --name yellowtip-backend-plan --resource-group your-resource-group --sku B1 --is-linux

# For frontend
az appservice plan create --name yellowtip-frontend-plan --resource-group your-resource-group --sku B1 --is-linux
```

2. **Create web apps:**
```bash
# Backend
az webapp create --resource-group your-resource-group --plan yellowtip-backend-plan --name yellowtip-backend --deployment-container-image-name yellowtip.azurecr.io/yellowtip-backend:latest

# Frontend
az webapp create --resource-group your-resource-group --plan yellowtip-frontend-plan --name yellowtip-frontend --deployment-container-image-name yellowtip.azurecr.io/yellowtip-frontend:latest
```

3. **Configure environment variables:**
```bash
az webapp config appsettings set --resource-group your-resource-group --name yellowtip-backend --settings \
  NODE_ENV=production \
  DATABASE_URL="your-database-url" \
  REDIS_URL="your-redis-url" \
  JWT_SECRET="your-jwt-secret"

az webapp config appsettings set --resource-group your-resource-group --name yellowtip-frontend --settings \
  REACT_APP_API_URL="https://yellowtip-backend.azurewebsites.net/api" \
  REACT_APP_WS_URL="wss://yellowtip-backend.azurewebsites.net"
```

### Option 3: Azure Database for PostgreSQL + Azure Cache for Redis

**Recommended for production** - Use managed Azure services instead of containers:

1. **Create Azure Database for PostgreSQL:**
```bash
az postgres flexible-server create \
  --resource-group your-resource-group \
  --name yellowtip-db \
  --location eastus \
  --admin-user yellowtip_user \
  --admin-password your-secure-password \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15
```

2. **Create Azure Cache for Redis:**
```bash
az redis create \
  --resource-group your-resource-group \
  --name yellowtip-redis \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

3. **Update connection strings in azure.env:**
```bash
DATABASE_URL=postgresql://yellowtip_user:password@yellowtip-db.postgres.database.azure.com:5432/yellowtip_reservations?sslmode=require
REDIS_URL=rediss://:access-key@yellowtip-redis.redis.cache.windows.net:6380
```

4. **Deploy application containers without database/redis:**
```bash
# Create a docker-compose file without postgres/redis services
docker-compose -f docker-compose.azure.yml up -d backend frontend
```

## Key Differences from Local Development

1. **No volume mounts** - Production images are self-contained
2. **Health checks** - Added for Azure monitoring
3. **Production environment** - NODE_ENV=production
4. **Managed services** - Use Azure Database and Azure Cache instead of containers in production
5. **HTTPS/WSS** - Use secure protocols for API/WebSocket connections

## Monitoring

- **Application Insights:** Enable for application monitoring
- **Log Analytics:** View container logs in Azure Portal
- **Health endpoints:** `/health` endpoints available for monitoring

## Security Best Practices

1. Use Azure Key Vault for secrets management
2. Enable firewall rules for Azure Database
3. Use managed identities where possible
4. Enable HTTPS/WSS for all connections
5. Regularly update base images and dependencies

## Troubleshooting

1. **Check container logs:**
```bash
az webapp log tail --name yellowtip-backend --resource-group your-resource-group
```

2. **Verify environment variables:**
```bash
az webapp config appsettings list --name yellowtip-backend --resource-group your-resource-group
```

3. **Test connectivity:**
```bash
az postgres flexible-server firewall-rule create \
  --resource-group your-resource-group \
  --name yellowtip-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

Для использования скопируйте azure.env.example в azure.env, заполните значения и выполните:

docker-compose -f docker-compose.azure.yml --env-file azure.env up -d