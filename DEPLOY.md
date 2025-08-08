# Railway Deployment Guide

## Prerequisites
- GitHub account with your code pushed to a repository
- Railway account (sign up at https://railway.app)
- OpenAI API key for the chat functionality

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your repository

### 3. Configure Services

Railway will automatically detect the monorepo structure. You need to set up two services:

#### API Service:
1. Click "New Service" → "GitHub Repo"
2. Select your repo
3. In service settings:
   - **Service Name**: `api`
   - **Root Directory**: `/api`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Port**: Railway will auto-detect port 3000

4. Add environment variables:
   - `NODE_ENV` = `production`
   - `OPENAI_API_KEY` = `your-actual-openai-api-key`
   - `PORT` = `${{RAILWAY_TCP_PROXY_PORT}}` (Railway's dynamic port)

#### Web Service:
1. Click "New Service" → "GitHub Repo"
2. Select your repo again
3. In service settings:
   - **Service Name**: `web`
   - **Root Directory**: `/web`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`

4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://[your-api-service].railway.app`
   - `NEXT_PUBLIC_WS_URL` = `wss://[your-api-service].railway.app`
   
   Note: Replace `[your-api-service]` with the actual URL Railway provides for your API service.

### 4. Alternative: Using Railway CLI

Install Railway CLI:
```bash
npm install -g @railway/cli
```

Login and deploy:
```bash
railway login
railway link [project-id]

# Deploy API
cd api
railway up --service api

# Deploy Web
cd ../web
railway up --service web
```

### 5. Set Up Custom Domains (Optional)

1. Go to your service settings
2. Click on "Settings" → "Networking"
3. Add your custom domain
4. Update your DNS records as instructed

## Environment Variables Reference

### API Service
- `NODE_ENV`: Set to `production`
- `PORT`: Use Railway's dynamic port
- `OPENAI_API_KEY`: Your OpenAI API key

### Web Service
- `NEXT_PUBLIC_API_URL`: URL of your API service
- `NEXT_PUBLIC_WS_URL`: WebSocket URL of your API service

## Monitoring

- View logs: Click on service → "Logs" tab
- Monitor metrics: Check "Metrics" tab
- Set up health checks in service settings

## Troubleshooting

### Build Failures
- Check build logs for missing dependencies
- Ensure all environment variables are set
- Verify Node.js version compatibility (requires Node 20+)

### Connection Issues
- Verify CORS settings in API
- Check that WebSocket URLs use `wss://` protocol
- Ensure API service is running before accessing frontend

### Port Issues
- Always use `${{RAILWAY_TCP_PROXY_PORT}}` for the API port
- Railway handles port mapping automatically

## Costs

Railway offers:
- $5 free credits monthly
- Pay-as-you-go pricing after that
- Approximately $5-20/month for a small app like this

## Next Steps

After deployment:
1. Test all functionality
2. Set up error monitoring (e.g., Sentry)
3. Configure a database if needed
4. Add authentication if required