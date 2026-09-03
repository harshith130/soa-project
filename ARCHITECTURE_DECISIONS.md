# StageFront Cloud Deployment Architecture Decisions

## Executive Summary

StageFront is ready for production deployment on Vercel (frontend) and Render (backend). This document explains the architecture decisions, trade-offs, and reasoning behind the cloud deployment configuration.

---

## 1. Eureka Service Discovery

### Decision: Keep Eureka for Cloud Deployment

**What Changed**: Added `EUREKA_SERVER_URL` environment variable to enable cloud Eureka server on Render.

**Why Keep Eureka?**

✅ **Advantages**:
- Services discover each other dynamically
- No hardcoded service URLs in code
- Zero-downtime service scaling (add instances, Eureka finds them)
- Health checking built-in
- Handles service failures gracefully
- Industry standard for microservices

❌ **Alternatives Considered**:
1. **Remove Eureka, hardcode service URLs**
   - ❌ Would require code changes (hardcoding URLs back in)
   - ❌ Can't scale horizontally (would need code updates per instance)
   - ❌ No health checking
   
2. **Use Kubernetes service discovery**
   - ❌ Render doesn't offer Kubernetes (uses containerized services)
   - ❌ More complex infrastructure
   - ❌ Overkill for current scale

3. **Use AWS Route 53 or similar**
   - ❌ Not integrated with Render
   - ❌ Adds cloud-vendor lock-in
   - ❌ More expensive

**Chosen Approach**: Deploy Eureka Server as a Render service. Other services register with it and discover services via Eureka.

**Trade-off**: Slightly more infrastructure complexity, but enables horizontal scaling later.

---

## 2. Database Architecture

### Decision: Single Shared PostgreSQL Database

**What Changed**: All services connect to single PostgreSQL instance via environment variables.

**Why Single Database?**

✅ **Advantages**:
- Simple setup (one Render PostgreSQL service)
- ACID transactions across services
- Single backup/recovery point
- Cost-effective for startup
- Existing JPA entities work without changes

❌ **Alternatives Considered**:

1. **Each service has its own database**
   - ❌ Complex schema synchronization
   - ❌ No cross-service transactions
   - ❌ Duplicate data management
   - ❌ More Render PostgreSQL services (higher cost)
   - ⚠️ Better for Netflix-scale but overkill now

2. **In-memory H2 database for each service**
   - ❌ No data persistence
   - ❌ Lost data on service restart
   - ❌ Can't share state across services

3. **Different database per service language** (MySQL, MongoDB, PostgreSQL)
   - ❌ Operational complexity
   - ❌ No unified backup strategy
   - ❌ Higher maintenance burden

**Chosen Approach**: Single PostgreSQL on Render. All services use same `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`.

**Upgrade Path**: If services grow independently, can later split databases with minimal schema changes:
1. Event Service → separate `EVENT_DATABASE_URL`
2. Booking Service → separate `BOOKING_DATABASE_URL`
3. User Service keeps shared database

**Current Status**: Currently used by:
- User Service
- Event Service
- Booking Service
- Auth Service (reads user data via User Service REST API, doesn't access DB directly)

---

## 3. Frontend-Backend Communication

### Decision: Environment Variable for API Base URL

**What Changed**: Frontend API URL moved from hardcoded `http://localhost:8080` to environment variable `VITE_API_BASE_URL`.

**Why Environment Variables?**

✅ **Advantages**:
- Different URLs for development vs. production
- No code changes for different deployments
- Vercel can inject URL at build time
- Frontend deployment independent of backend deployment

**How It Works**:

1. **Build Time** (on Vercel):
   ```bash
   VITE_API_BASE_URL=https://api-gateway.onrender.com npm run build
   ```

2. **Result** (in dist/index.html):
   - Frontend code contains URL pointing to Render API Gateway
   - All requests go to Render backend

3. **Vite Configuration** (vite.config.js):
   ```javascript
   define: {
     'import.meta.env.VITE_API_BASE_URL': JSON.stringify(...)
   }
   ```

**Alternatives Considered**:

1. **Hardcode Render URL in code**
   - ❌ Can't switch between environments
   - ❌ Development requires code changes

2. **Fetch configuration from /config endpoint**
   - ✅ Works, but adds complexity
   - ❌ Extra HTTP request on app startup
   - ❌ Race conditions if API unreachable

3. **Use DNS alias (api.stagefront.app)**
   - ✅ Works, but requires domain setup
   - ❌ Not needed for development

**Chosen Approach**: Vite environment variable injected at build time.

---

## 4. API Gateway CORS Configuration

### Decision: Environment Variable for Allowed Origins

**What Changed**: CORS origins moved from hardcoded `[localhost:3000, localhost:5173]` to environment variable `CORS_ALLOWED_ORIGINS`.

**Why Environment Variables?**

✅ **Advantages**:
- Support multiple origins (dev, staging, production)
- No code deployment for CORS changes
- Security: restrict to specific domains

❌ **Alternatives Considered**:

1. **Hardcode all possible origins**
   - ❌ Security risk (allows all development origins in production)
   - ❌ Not extensible

2. **Allow all origins** (`*`)
   - ❌ Security vulnerability
   - ❌ Credentials (cookies) not allowed with `*`

3. **Use API Gateway routing rules**
   - ✅ Works, but less flexible
   - ❌ Harder to manage

**Chosen Approach**: Runtime configuration via environment variable.

**Format**: Comma-separated, no spaces
```
CORS_ALLOWED_ORIGINS=https://stagefront.vercel.app,https://www.yourdomain.com
```

---

## 5. Service-to-Service Communication

### Decision: Eureka Discovery with RestClient Load Balancing

**What Changed**: 
- Auth Service → User Service: Uses load-balanced RestClient bean
- Booking Service → Event/User Services: Uses Feign clients with Eureka

**How It Works**:

**Auth Service (RestClient)**:
```java
@Bean
@LoadBalanced
RestClient.Builder loadBalancedRestClientBuilder()

// Then use:
RestClient userServiceClient = 
    builder.baseUrl("${USER_SERVICE_URL:http://user-service}").build()
```

Result: Requests to `http://user-service` are intercepted and routed through Eureka's service discovery.

**Booking Service (OpenFeign)**:
```java
@FeignClient(name = "EVENT-SERVICE")
public interface EventClient { ... }

@FeignClient(name = "USER-SERVICE")
public interface UserClient { ... }
```

Result: Feign clients automatically use Eureka to resolve `EVENT-SERVICE` and `USER-SERVICE` to actual endpoints.

**Advantages**:
- No hardcoded URLs in code
- Automatic retry on failure
- Timeout handling
- Load balancing across multiple instances

---

## 6. Port Configuration

### Decision: Dynamic Port via Environment Variable

**What Changed**: Ports moved from hardcoded (8080, 8081, 8082, etc.) to `PORT` environment variable.

**Why Dynamic Ports?**

✅ **Advantages**:
- Services can share host without conflict
- Render assigns dynamic ports automatically
- Enable multiple service instances on same machine

**Application Properties**:
```properties
server.port=${PORT:8080}
# Uses PORT if set, otherwise defaults to 8080
```

**Why Defaults?**
- Local development doesn't need to set PORT
- Services work out-of-box without configuration
- Backward compatible with existing setup

---

## 7. Health Checks

### Decision: Spring Boot Actuator `/actuator/health`

**Used For**: Render uses health endpoints to monitor services.

**How Services Are Configured**:

```properties
management.endpoints.web.exposure.include=health,info
```

**Eureka Server**:
```
http://eureka-server.onrender.com/eureka/
```

**Other Services**:
```
http://service.onrender.com/actuator/health
```

**Response Example**:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

**Why Actuator?**
- ✅ Built into Spring Boot
- ✅ No extra code needed
- ✅ Automatically checks dependencies (DB, etc.)
- ✅ Industry standard

---

## 8. Docker Strategy

### Decision: Multi-Stage Docker Builds

**All services use**:
1. **Stage 1**: Maven build with dependencies
2. **Stage 2**: Alpine JRE runtime with minimal size

**Advantages**:
- Small image sizes (reduces deploy time)
- Two-stage: compile in full JDK, run in minimal JRE
- No source code in production images
- Fast builds (Maven dependencies cached)

**Example (Booking Service)**:
```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
COPY --from=builder /build/target/booking-service-*.jar booking-service.jar
HEALTHCHECK --interval=30s...
CMD ["java", "-jar", "booking-service.jar"]
```

**Image Sizes** (approximate):
- Maven build image: 1.2 GB
- Final runtime image: ~250 MB per service
- Total: ~1.5 GB for all services

---

## 9. Frontend Deployment (Vercel)

### Decision: Vercel for Frontend Only

**Why Vercel?**

✅ **Advantages**:
- Optimized for React/Vite
- Zero-config deployment from Git
- Automatic HTTPS
- Global CDN for static assets
- Environment variables at build time
- Automatic preview deployments
- Free tier available

❌ **Alternatives Considered**:

1. **Deploy frontend on Render with backend**
   - ❌ Not optimized for static SPA
   - ❌ Higher resource usage
   - ❌ No automatic CDN

2. **AWS S3 + CloudFront**
   - ✅ Similar performance
   - ❌ More complex setup
   - ❌ Higher cost

3. **GitHub Pages**
   - ✅ Free, simple
   - ❌ Can't set environment variables at build
   - ❌ No preview deployments

**Chosen Approach**: Vercel for frontend only. Optimal cost/performance.

---

## 10. Backend Deployment (Render)

### Decision: Render for All Microservices + Database

**Why Render?**

✅ **Advantages**:
- Simple Docker deployment
- Integrated PostgreSQL database
- Managed services (auto-scaling, monitoring)
- GitHub integration
- Environment variables UI
- Render.yaml for infrastructure-as-code
- Cheaper than AWS/GCP for startup scale

❌ **Alternatives Considered**:

1. **AWS (ECS + RDS)**
   - ✅ More features, better scaling
   - ❌ More complex setup
   - ❌ Higher cost for small apps

2. **Google Cloud Run**
   - ✅ Simpler than ECS
   - ❌ Harder to set up PostgreSQL
   - ❌ Stateless only (issues with Eureka)

3. **Heroku** (deprecated)
   - ✅ Simple UI
   - ❌ Shutting down
   - ❌ Higher cost

4. **DigitalOcean**
   - ✅ Simpler, cheaper
   - ❌ Less managed services

**Chosen Approach**: Render for simplicity + price balance.

---

## 11. Infrastructure as Code

### Decision: render.yaml for Service Definitions

**What It Contains**:
- PostgreSQL database configuration
- 6 backend services (Eureka, Gateway, User, Auth, Event, Booking)
- 1 frontend service (React)
- Environment variables
- Deployment instructions

**Why render.yaml?**

✅ **Advantages**:
- Version controlled infrastructure
- Reproducible deployments
- Easy to scale (copy a service block, change name)
- Documentation of architecture
- Can be templated for dev/staging/prod

❌ **Alternatives Considered**:

1. **Manual Render dashboard setup**
   - ❌ No version control
   - ❌ Hard to replicate
   - ❌ Error-prone

2. **Terraform**
   - ✅ More powerful
   - ❌ Steeper learning curve
   - ❌ More complex for this scale

**Chosen Approach**: render.yaml for simplicity.

---

## 12. Configuration Management

### Decision: Environment Variables + application.properties Defaults

**Pattern Used**:
```properties
property.name=${ENVIRONMENT_VARIABLE:default_value}
```

**Examples**:
```properties
server.port=${PORT:8080}
eureka.client.service-url.defaultZone=${EUREKA_SERVER_URL:http://localhost:8761/eureka/}
spring.datasource.url=${DATABASE_URL:}
```

**Advantages**:
- Works without environment variables (defaults for local dev)
- Clear which configs are externalized
- No `application-prod.properties` needed
- Spring's built-in resolution

**Alternatives Considered**:

1. **Separate application-prod.properties**
   - ❌ Duplicate configs
   - ❌ Hard to maintain

2. **ConfigServer**
   - ✅ Centralized config
   - ❌ Extra service to manage
   - ❌ Overkill for current scale

3. **All hardcoded**
   - ❌ Not cloud-ready

**Chosen Approach**: Environment variable patterns with defaults.

---

## 13. Scaling Strategy

### Current Setup (Starter Plan)
- 1 instance per service
- Shared resources
- Single database

### Scaling Levels

**Level 1: Plan Upgrades** (when needed)
- Upgrade individual services to Standard plan
- Adds more CPU/RAM per instance
- No code changes

**Level 2: Multiple Instances**
- Run 2+ instances of same service
- Eureka load balances between them
- Render auto-restart failed instances

**Level 3: Database Scaling**
- Upgrade PostgreSQL to Pro plan
- Enable read replicas
- Connection pooling optimization

**Level 4: Service Decomposition**
- Separate databases per service
- Different caching strategies
- Message queues for async communication

---

## 14. Security Decisions

### 1. No Secrets in Source Code
- ✅ `.env` in `.gitignore`
- ✅ Only `.env.example` with placeholders in git
- ✅ Render environment variables for real secrets

### 2. CORS Restrictions
- ✅ Environment variable controls allowed origins
- ✅ No `*` wildcard in production
- ✅ Credentials allowed only for specific origins

### 3. HTTPS Everywhere
- ✅ Vercel uses HTTPS by default
- ✅ Render uses HTTPS by default
- ✅ All service URLs use HTTPS in production

### 4. Database Credentials
- ✅ Never hardcoded in code
- ✅ Always via environment variables
- ✅ Render encrypts at rest

---

## 15. Monitoring & Observability

### Current Setup
- Render logs (real-time via dashboard)
- Eureka health checks
- Spring Boot Actuator endpoints

### What's Not Included (Optional)
- Centralized logging (ELK Stack, CloudWatch)
- Distributed tracing (Jaeger, Sleuth)
- Metrics collection (Prometheus, Micrometer)
- Alerts (Pagerduty, OpsGenie)

### How to Add Later
1. Add `spring-boot-starter-actuator` (already included)
2. Add `spring-cloud-starter-sleuth` for tracing
3. Export metrics to CloudWatch/Datadog
4. Set up alerts in Render dashboard

---

## Key Decisions Summary

| Component | Decision | Why |
|-----------|----------|-----|
| Service Discovery | Eureka Server on Render | Zero-config service discovery |
| Database | Single PostgreSQL | Simplicity + ACID transactions |
| Frontend | Vercel | Optimized for React/Vite |
| Backend | Render | Simplicity + Docker support |
| Config | Env vars + defaults | Cloud-ready, flexible |
| Ports | Dynamic via PORT var | Flexibility + defaults |
| CORS | Env variable | Security + flexibility |
| API URL | Vite env variable | Dev/Prod separation |
| Secrets | Render env vars | Never in code |
| Docker | Multi-stage | Small images |
| Scaling | Eureka discovery | Horizontal scaling ready |

---

## Trade-offs & Risks

### Trade-offs Made

1. **Eureka Complexity** vs. **Scalability**
   - Extra service to manage, but enables scaling

2. **Shared Database** vs. **Service Independence**
   - Tightly coupled now, can split later

3. **Environment Variables** vs. **ConfigServer**
   - Simple now, but not as centralized

### Mitigations

1. Eureka runs on same infrastructure (one more Render service)
2. Database split is a one-time migration if needed
3. Environment variables clear and documented

---

## Future Improvements

1. **Add Observability**
   - Spring Cloud Sleuth for tracing
   - Prometheus for metrics
   - Grafana for dashboards

2. **Database Optimization**
   - Connection pooling (HikariCP - already included)
   - Read replicas for scaling reads
   - Caching layer (Redis)

3. **Event-Driven Architecture**
   - Message broker (RabbitMQ, Kafka)
   - Async communication between services
   - Event sourcing for audit trail

4. **Deployment Pipeline**
   - Staging environment
   - Automated testing before deploy
   - Blue-green deployments

5. **Cost Optimization**
   - Reserve instances for production
   - Scheduled scaling (down at night)
   - Spot instances for non-critical services

---

**Last Updated**: 2026-09-02
**Status**: Architecture Decisions Finalized
**Ready for**: Production Deployment
