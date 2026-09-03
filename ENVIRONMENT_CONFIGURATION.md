# StageFront Environment Configuration Guide

## Overview

This document explains all environment variables used in StageFront and how to configure them for different deployment environments.

---

## Environment Variable Categories

### 1. Service Discovery (Eureka)

**Purpose**: Enable services to find and communicate with each other

| Variable | Services | Format | Local Dev | Render Production |
|----------|----------|--------|-----------|------------------|
| `EUREKA_SERVER_URL` | All except Eureka | URL | `http://localhost:8761/eureka/` | `http://eureka-server.onrender.com:8761/eureka/` |

**Notes**:
- Eureka Server itself does NOT register with itself
- Services use `eureka.client.register-with-eureka=true` to register
- All services must point to the same Eureka server

### 2. Database Connection

**Purpose**: Connect services to PostgreSQL database

| Variable | Services | Format | Example |
|----------|----------|--------|---------|
| `DATABASE_URL` | User, Event, Booking | JDBC URL | `jdbc:postgresql://localhost:5432/stagefront_db` |
| `DATABASE_USERNAME` | User, Event, Booking | String | `postgres` |
| `DATABASE_PASSWORD` | User, Event, Booking | String | `secure_password_here` |

**Services using database**:
- User Service (stores users, profiles, notifications)
- Event Service (stores events)
- Booking Service (stores bookings, seat holds)
- Auth Service (NO - stateless, calls User Service via REST)

**Render PostgreSQL Connection String Format**:
```
postgresql://username:password@host:5432/database
```

Example from Render:
```
postgresql://stagefront_user:ABC123xyz@dpg-xyz123.render-db.cloud:5432/stagefront_db
```

### 3. Service-to-Service Communication

**Purpose**: Direct URLs for synchronous service calls (alternative to Eureka discovery)

| Variable | Source Service | Target Service | Format | Local Dev |
|----------|----------------|----------------|--------|-----------|
| `USER_SERVICE_URL` | Auth Service | User Service | Base URL | `http://user-service` |

**Note**: With Eureka, services use service names (e.g., `USER-SERVICE`) instead of hardcoded URLs. The `USER_SERVICE_URL` is used by load-balanced RestClient in Auth Service.

### 4. Frontend Configuration

**Purpose**: Tell frontend where the backend API is located

| Variable | Used In | Format | Scope | Local Dev | Production |
|----------|---------|--------|-------|-----------|-----------|
| `VITE_API_BASE_URL` | Frontend (Node.js build) | Full URL | Build-time | `http://localhost:8080` | `https://api-gateway.onrender.com` |

**Important**:
- This is a **build-time variable**, not runtime
- Set this when building the frontend: `npm run build`
- Different builds needed for different deployment targets
- Frontend stores this in `api.js` configuration

**How it works**:
```javascript
// In Frontend/src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// All API calls use: ${API_BASE_URL}/api/users, etc.
```

### 5. API Gateway Configuration

**Purpose**: Control which frontend origins can access the API

| Variable | Component | Format | Local Dev |
|----------|-----------|--------|-----------|
| `CORS_ALLOWED_ORIGINS` | API Gateway CORS Config | Comma-separated URLs | `http://localhost:3000,http://localhost:5173` |

**Format**: 
- No spaces around commas
- Include protocol (http/https)
- Separate multiple origins with commas

**Example**:
```
http://localhost:3000,http://localhost:5173,https://stagefront.vercel.app
```

### 6. Port Configuration

**Purpose**: Specify which port each service listens on

| Variable | Service | Local Default | Render | Notes |
|----------|---------|---------------|--------|-------|
| `PORT` | Any | Service-specific | 8080-8084 | Optional; defaults provided in application.properties |

**How it works**:
```properties
server.port=${PORT:8080}
# Uses PORT env var if set, otherwise defaults to 8080
```

---

## Local Development Setup

### Using .env file

1. Copy `.env.example` to `.env`
2. Update values for local development
3. Load environment variables into your IDE/terminal

### Sample .env for Local Development

```bash
# Database (local PostgreSQL)
DATABASE_URL=jdbc:postgresql://localhost:5432/stagefront_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_local_postgres_password

# Service Discovery (local Eureka)
EUREKA_SERVER_URL=http://localhost:8761/eureka/

# Service-to-Service (Eureka discovery names)
USER_SERVICE_URL=http://user-service

# Frontend API (local gateway)
VITE_API_BASE_URL=http://localhost:8080

# CORS (local frontend ports)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Ports (optional, defaults work)
# PORT=8080
```

### Running Locally with Docker Compose

```bash
cd Backend
docker-compose up -d
# All services start with environment variables from .env
```

---

## Render Production Setup

### Step 1: Set Render Environment Variables

For each service in Render dashboard:

1. Go to service settings
2. Click **"Environment"**
3. Add variables from table below

### Step 2: PostgreSQL Setup

1. Create PostgreSQL database on Render
2. Copy the connection string
3. Use it for all three services: `DATABASE_URL`

### Step 3: Service URLs

Once services are deployed, get their Render URLs:

```bash
# Example URLs generated by Render
eureka-server.onrender.com
api-gateway.onrender.com
user-service.onrender.com
auth-service.onrender.com
event-service.onrender.com
booking-service.onrender.com
```

### Sample Environment Variables for Render

**Eureka Server**:
```
PORT=8761
EUREKA_SERVER_URL=http://eureka-server.onrender.com:8761/eureka/
```

**User Service**:
```
PORT=8081
EUREKA_SERVER_URL=http://eureka-server.onrender.com:8761/eureka/
DATABASE_URL=postgresql://user:pass@host/db
DATABASE_USERNAME=stagefront_user
DATABASE_PASSWORD=[your-secure-password]
```

**Auth Service**:
```
PORT=8082
EUREKA_SERVER_URL=http://eureka-server.onrender.com:8761/eureka/
USER_SERVICE_URL=http://user-service.onrender.com:8081
```

**Event Service**:
```
PORT=8083
EUREKA_SERVER_URL=http://eureka-server.onrender.com:8761/eureka/
DATABASE_URL=postgresql://user:pass@host/db
DATABASE_USERNAME=stagefront_user
DATABASE_PASSWORD=[your-secure-password]
```

**Booking Service**:
```
PORT=8084
EUREKA_SERVER_URL=http://eureka-server.onrender.com:8761/eureka/
DATABASE_URL=postgresql://user:pass@host/db
DATABASE_USERNAME=stagefront_user
DATABASE_PASSWORD=[your-secure-password]
```

**API Gateway**:
```
PORT=8080
EUREKA_SERVER_URL=http://eureka-server.onrender.com:8761/eureka/
CORS_ALLOWED_ORIGINS=https://stagefront.vercel.app,https://yourdomain.com
```

**Frontend (Vercel)**:
```
VITE_API_BASE_URL=https://api-gateway.onrender.com
```

---

## Eureka Service Discovery Explained

### How It Works

1. **Services Register**: Each service registers with Eureka Server on startup
   ```properties
   eureka.client.register-with-eureka=true
   eureka.client.fetch-registry=true
   ```

2. **Services Discover**: Services fetch the registry to find each other
   ```
   Booking Service needs Event Service?
   → Looks in Eureka registry
   → Finds: EVENT-SERVICE @ http://event-service:8083
   → Calls: http://event-service:8083/api/events/123
   ```

3. **Load Balancing**: Spring Cloud provides load balancing via Eureka names
   ```java
   @FeignClient(name = "EVENT-SERVICE")
   public interface EventClient { ... }
   // Automatically load-balanced across instances
   ```

### Why Eureka in Cloud?

- **Dynamic Discovery**: No hardcoded IPs/URLs
- **High Availability**: Services automatically registered/deregistered
- **Load Balancing**: Requests distributed across instances
- **Resilience**: Failures detected and instances removed

---

## Configuration Precedence

Spring Boot resolves configuration in this order:

1. **Environment variables** (highest priority)
   ```bash
   export DATABASE_URL=...
   ```

2. **System properties**
   ```bash
   java -D DATABASE_URL=...
   ```

3. **application.properties** (default values)
   ```properties
   database.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/db}
   ```

4. **Hardcoded defaults** (lowest priority)

**Example** in `application.properties`:
```properties
server.port=${PORT:8080}
# If PORT env var is set → use it
# Otherwise → use default 8080
```

---

## Database Multi-Tenancy Strategy

### Current Setup (Single Database)

All services share one PostgreSQL database:

```sql
-- One database with all tables
CREATE DATABASE stagefront_db;
-- Tables:
-- - users (User Service)
-- - events (Event Service)
-- - bookings (Booking Service)
-- - notifications (User Service)
```

**Advantages**:
- Simple setup
- ACID transactions across services
- Single backup strategy
- Cost-effective (one DB on Render)

**Disadvantages**:
- Services tightly coupled at DB level
- Schema changes affect all services
- Scaling challenges

### Future: Multi-Database Setup

If needed later, each service can have its own database:

```properties
# User Service
DATABASE_URL=postgresql://host/stagefront_user_db

# Event Service
DATABASE_URL=postgresql://host/stagefront_event_db

# Booking Service
DATABASE_URL=postgresql://host/stagefront_booking_db
```

Then use environment variables to specify which database:
```
USER_SERVICE_DATABASE_URL=...
EVENT_SERVICE_DATABASE_URL=...
BOOKING_SERVICE_DATABASE_URL=...
```

---

## Secret Management

### DO NOT commit to git:
- `.env` file with real passwords
- Database passwords in code
- API keys
- JWT secrets
- Any credentials

### Safe practices:

1. **Local Development**:
   ```bash
   # .env is in .gitignore
   cp .env.example .env
   # Edit .env with your local values
   ```

2. **Render Deployment**:
   - Use Render dashboard to set environment variables
   - Render encrypts secrets at rest
   - Never paste passwords in code

3. **Version Control**:
   - Only commit `.env.example` with placeholder values
   - Update `.env.example` when adding new variables

---

## Testing Environment Variables

### Test locally:

```bash
# Set in terminal
export EUREKA_SERVER_URL=http://localhost:8761/eureka/
export DATABASE_URL=jdbc:postgresql://localhost:5432/stagefront_db

# Or in IDE (IntelliJ):
# Run → Edit Configurations → Environment variables

# Or with Maven:
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Verify configuration:

```bash
# Check which configuration was loaded
# Look for in application startup logs:
# "The following profiles are active: dev"
# "spring.datasource.url = jdbc:postgresql://..."
```

---

## Environment-Specific Profiles

### Spring Profiles

You can create environment-specific properties:

1. **Local**: `application-dev.properties`
2. **Production**: `application-prod.properties`

Activate with:
```bash
export SPRING_PROFILES_ACTIVE=dev
# or
export SPRING_PROFILES_ACTIVE=prod
```

### Example structure:

```
application.properties (defaults)
application-dev.properties (local overrides)
application-prod.properties (production overrides)
```

In `application-prod.properties`:
```properties
logging.level.root=WARN
spring.jpa.show-sql=false
spring.datasource.hikari.maximum-pool-size=10
```

---

## Troubleshooting Environment Variables

| Problem | Cause | Solution |
|---------|-------|----------|
| Service can't find Eureka | Wrong `EUREKA_SERVER_URL` | Verify URL in env vars and logs |
| Database connection fails | Missing `DATABASE_URL` | Set all three: URL, USERNAME, PASSWORD |
| Frontend blank page | Wrong `VITE_API_BASE_URL` | Rebuild frontend: `npm run build` |
| CORS errors | Wrong `CORS_ALLOWED_ORIGINS` | Add frontend URL to comma-separated list |
| Services can't communicate | Eureka not running | Check Eureka server status and health |

---

**Last Updated**: 2026-09-02
