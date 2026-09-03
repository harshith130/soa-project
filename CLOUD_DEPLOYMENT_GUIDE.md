# StageFront Cloud Deployment Guide

## Overview

This guide explains how to deploy StageFront to Vercel (Frontend) and Render (Backend) for production use.

**Status**: Ready for deployment (NOT YET DEPLOYED)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                        │
│              React + Vite Single Page Application           │
│                    stagefront.vercel.app                    │
└────────────────────┬────────────────────────────────────────┘
                     │ (VITE_API_BASE_URL)
                     │ https://api-gateway.onrender.com
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          API Gateway (Render) - Port 8080                   │
│     Routes requests to backend microservices via Eureka     │
│         ├─ /api/users/** → User Service :8081             │
│         ├─ /api/auth/** → Auth Service :8082              │
│         ├─ /api/events/** → Event Service :8083           │
│         └─ /api/bookings/** → Booking Service :8084       │
└────────────────────┬────────────────────────────────────────┘
                     │ (Service Discovery)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Eureka Server (Render) :8761                 │
│          Service Discovery & Registration Center            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬─────────────┐
        ▼            ▼            ▼             ▼
    User Svc      Auth Svc    Event Svc    Booking Svc
    :8081         :8082       :8083         :8084
    ┌──────────────────────────────────────────────┐
    │   Render PostgreSQL Database                 │
    │   (Shared by all services)                   │
    └──────────────────────────────────────────────┘
```

---

## Prerequisites

- Git account with repository access
- Vercel account (vercel.com)
- Render account (render.com)
- PostgreSQL database (Render provides one)
- Docker installed locally (optional, for testing)

---

## Part 1: Prepare GitHub Repository

### Step 1.1: Ensure Repository is Clean

```bash
# No uncommitted changes
git status

# All changes should be committed
git add .
git commit -m "Prepare for cloud deployment"
```

### Step 1.2: Verify Environment Variables

Check that `.env` is in `.gitignore`:

```bash
cat .gitignore | grep .env
# Should output: .env
```

Never commit `.env` with real credentials.

---

## Part 2: Deploy Backend to Render

### Step 2.1: Create Render Account

1. Go to https://render.com
2. Sign up / Log in
3. Connect your GitHub account

### Step 2.2: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `stagefront-db`
   - **Database**: `stagefront_db`
   - **User**: `stagefront_user`
   - **Region**: Select your region
   - **Plan**: Starter (free tier)
3. Click **"Create Database"**
4. Wait for database to be ready (~2 minutes)
5. **Save the Connection String** (you'll need this)

**Connection String Format**:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

### Step 2.3: Deploy Eureka Server

1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **Name**: `eureka-server`
   - **Environment**: `Docker`
   - **Repository**: Select `soa-project`
   - **Branch**: `main`
   - **Dockerfile Path**: `Backend/eureka-server/Dockerfile`
   - **Plan**: Starter (free tier)
3. Set Environment Variables:
   - `PORT` = `8761`
   - `EUREKA_SERVER_URL` = `http://eureka-server.onrender.com:8761/eureka/`
4. Click **"Deploy"**
5. Wait for deployment to complete

**Note the URL**: `eureka-server.onrender.com` (you'll use this for other services)

### Step 2.4: Deploy User Service

1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **Name**: `user-service`
   - **Environment**: `Docker`
   - **Repository**: Select `soa-project`
   - **Branch**: `main`
   - **Dockerfile Path**: `Backend/user-service/Dockerfile`
   - **Plan**: Starter
3. Set Environment Variables:
   - `PORT` = `8081`
   - `EUREKA_SERVER_URL` = `http://eureka-server.onrender.com:8761/eureka/`
   - `DATABASE_URL` = (Paste PostgreSQL connection string from Step 2.2)
   - `DATABASE_USERNAME` = `stagefront_user`
   - `DATABASE_PASSWORD` = (Password from database setup)
4. Click **"Deploy"**

### Step 2.5: Deploy Auth Service

1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **Name**: `auth-service`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Backend/auth-service/Dockerfile`
   - **Plan**: Starter
3. Set Environment Variables:
   - `PORT` = `8082`
   - `EUREKA_SERVER_URL` = `http://eureka-server.onrender.com:8761/eureka/`
   - `USER_SERVICE_URL` = `http://user-service.onrender.com:8081`
4. Click **"Deploy"**

### Step 2.6: Deploy Event Service

1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **Name**: `event-service`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Backend/event-service/Dockerfile`
   - **Plan**: Starter
3. Set Environment Variables:
   - `PORT` = `8083`
   - `EUREKA_SERVER_URL` = `http://eureka-server.onrender.com:8761/eureka/`
   - `DATABASE_URL` = (Paste PostgreSQL connection string)
   - `DATABASE_USERNAME` = `stagefront_user`
   - `DATABASE_PASSWORD` = (Password from database setup)
4. Click **"Deploy"**

### Step 2.7: Deploy Booking Service

1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **Name**: `booking-service`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Backend/booking-service/Dockerfile`
   - **Plan**: Starter
3. Set Environment Variables:
   - `PORT` = `8084`
   - `EUREKA_SERVER_URL` = `http://eureka-server.onrender.com:8761/eureka/`
   - `DATABASE_URL` = (Paste PostgreSQL connection string)
   - `DATABASE_USERNAME` = `stagefront_user`
   - `DATABASE_PASSWORD` = (Password from database setup)
4. Click **"Deploy"**

### Step 2.8: Deploy API Gateway

1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **Name**: `api-gateway`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Backend/api-gateway/Dockerfile`
   - **Plan**: Starter
3. Set Environment Variables:
   - `PORT` = `8080`
   - `EUREKA_SERVER_URL` = `http://eureka-server.onrender.com:8761/eureka/`
   - `CORS_ALLOWED_ORIGINS` = `https://stagefront.vercel.app,https://www.yourdomain.com`
4. Click **"Deploy"**

**Save the API Gateway URL**: `api-gateway.onrender.com` (you'll need this for frontend)

---

## Part 3: Deploy Frontend to Vercel

### Step 3.1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up / Log in
3. Connect your GitHub account

### Step 3.2: Import and Deploy Project

1. Click **"Add New"** → **"Project"**
2. Select repository `soa-project`
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_BASE_URL` = `https://api-gateway.onrender.com` (from Step 2.8)
5. Click **"Deploy"**

### Step 3.3: Verify Deployment

After deployment completes:

1. Vercel provides a URL like: `stagefront.vercel.app`
2. Test the application in browser
3. If you see the StageFront interface, deployment was successful

### Step 3.4: (Optional) Connect Custom Domain

1. In Vercel project settings
2. Go to **"Domains"**
3. Add your custom domain (e.g., `stagefront.app`)
4. Follow DNS configuration instructions

---

## Part 4: Post-Deployment Configuration

### Step 4.1: Update API Gateway CORS (if needed)

If you deployed with a custom domain, update API Gateway environment variable:

1. In Render dashboard, go to `api-gateway`
2. Go to **"Environment"**
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://stagefront.vercel.app,https://stagefront.app
   ```
4. Deploy

### Step 4.2: Database Schema Initialization

The backend services use Hibernate JPA with `spring.jpa.hibernate.ddl-auto=update`, which means:

- Database tables are **automatically created** on first startup
- No manual schema setup needed
- Application data persists in PostgreSQL

### Step 4.3: Test the Deployment

1. Open your frontend URL in browser: `https://stagefront.vercel.app`
2. Try to:
   - Register a new user
   - Log in
   - View events
   - Create an event (if admin)
   - Book a ticket

If all features work, deployment is successful!

---

## Part 5: Monitoring & Troubleshooting

### Check Service Health

#### Eureka Dashboard
```
https://eureka-server.onrender.com
```
Should show all registered services:
- USER-SERVICE
- AUTH-SERVICE
- EVENT-SERVICE
- BOOKING-SERVICE
- API-GATEWAY

#### API Gateway Health
```
https://api-gateway.onrender.com/actuator/health
```
Should return: `{"status":"UP"}`

#### Database Connection
Each service checks database on startup. If a service fails to start:
1. Check `DATABASE_URL` environment variable
2. Verify PostgreSQL database is running
3. Confirm username/password are correct

### Common Issues

| Issue | Solution |
|-------|----------|
| Services not registering with Eureka | Check `EUREKA_SERVER_URL` environment variable on each service |
| Frontend can't connect to API | Check `VITE_API_BASE_URL` and `CORS_ALLOWED_ORIGINS` |
| Database connection fails | Verify `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` |
| Service crashes on startup | Check service logs in Render dashboard |

### View Logs

In Render dashboard:
1. Select a service
2. Go to **"Logs"**
3. View real-time application logs

---

## Part 6: Scaling & Performance

### Current Configuration

All services are deployed on Render's **Starter plan** (free tier), which includes:
- 0.5 CPU
- 512 MB RAM
- Limited to one instance per service
- Spinning down after inactivity

### Scale Up When Needed

1. In Render dashboard, select a service
2. Go to **"Settings"**
3. Update **"Plan"** to `Standard` or higher
4. Service will automatically restart with more resources

### Recommended Upgrades for Production

| Service | Recommended Plan |
|---------|-----------------|
| API Gateway | Standard (5x scaling) |
| User Service | Standard |
| Auth Service | Standard |
| Event Service | Standard |
| Booking Service | Standard (handles concurrent bookings) |
| PostgreSQL | Pro (auto-backups, higher availability) |

---

## Environment Variables Reference

### For Render Deployment

**All services require**:
- `EUREKA_SERVER_URL` = `http://eureka-server.onrender.com:8761/eureka/`

**Services using PostgreSQL require**:
- `DATABASE_URL` = PostgreSQL connection string
- `DATABASE_USERNAME` = `stagefront_user`
- `DATABASE_PASSWORD` = (Your secure password)

**Auth Service requires**:
- `USER_SERVICE_URL` = `http://user-service.onrender.com:8081`

**API Gateway requires**:
- `CORS_ALLOWED_ORIGINS` = List of allowed frontend origins

### For Vercel Deployment

**Frontend requires**:
- `VITE_API_BASE_URL` = `https://api-gateway.onrender.com`

---

## Security Checklist

Before going to production, verify:

- [ ] No `.env` file with real credentials committed to GitHub
- [ ] All environment variables use placeholder/secure values on Render
- [ ] API Gateway CORS origins restricted to your domain only
- [ ] Database password is strong and unique
- [ ] PostgreSQL backups are enabled (Pro plan)
- [ ] HTTPS is enforced (both Vercel and Render use HTTPS by default)
- [ ] API endpoints are tested for authorization (services only accept valid tokens)

---

## Rollback Procedure

If deployment has issues:

### Render
1. Go to service
2. Click **"Deployments"**
3. Select previous successful deployment
4. Click **"Redeploy"**

### Vercel
1. Go to project
2. Click **"Deployments"**
3. Select previous successful deployment
4. Click **"Redeploy"**

---

## Next Steps

1. ✅ Complete the deployment following this guide
2. ✅ Test all functionality in production
3. ✅ Set up monitoring/alerts (optional)
4. ✅ Configure custom domain (optional)
5. ✅ Document any custom configurations
6. ✅ Create backup strategy for database

---

## Support & Documentation

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

---

**Last Updated**: 2026-09-02
**Status**: Ready for Production Deployment
