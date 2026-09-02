# STAGEFRONT MICROSERVICES — FINAL RUN & EXECUTION GUIDE

This guide provides step-by-step instructions to boot the complete StageFront microservice cluster and launch the frontend application for college evaluation and live demonstration.

---

## System URLs Summary

- **Frontend Application**: `http://localhost:5173`
- **Eureka Discovery Registry**: `http://localhost:8761`
- **API Gateway (Unified Entry Point)**: `http://localhost:8080`

---

## Service Startup Order & Ports

Start the microservices in the exact numerical order listed below to allow Eureka Registration and Gateway Route Discovery to initialize cleanly.

| Order | Service Name | Directory Path | Port | Command |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Eureka Server** | `C:\StageFront\Backend\eureka-server` | `:8761` | `mvn spring-boot:run` |
| **2** | **User Service** | `C:\StageFront\Backend\user-service` | `:8081` | `mvn spring-boot:run` |
| **3** | **Auth Service** | `C:\StageFront\Backend\auth-service` | `:8082` | `mvn spring-boot:run` |
| **4** | **Event Service** | `C:\StageFront\Backend\event-service` | `:8083` | `mvn spring-boot:run` |
| **5** | **Booking Service** | `C:\StageFront\Backend\booking-service` | `:8084` | `mvn spring-boot:run` |
| **6** | **API Gateway** | `C:\StageFront\Backend\api-gateway` | `:8080` | `mvn spring-boot:run` |
| **7** | **Frontend (Vite)** | `C:\StageFront\Frontend` | `:5173` | `npm run dev` |

---

## Detailed Step-by-Step Execution Commands

### Step 1: Start Eureka Discovery Server (Port 8761)
Open a terminal and run:
```powershell
cd C:\StageFront\Backend\eureka-server
mvn spring-boot:run
```
*Wait ~10 seconds until Eureka Server logs `Started EurekaServerApplication`.*
Verify in browser: `http://localhost:8761`

---

### Step 2: Start User Service (Port 8081)
Open a new terminal window and run:
```powershell
cd C:\StageFront\Backend\user-service
mvn spring-boot:run
```
*Wait until logs display `Started UserServiceApplication`.*

---

### Step 3: Start Auth Service (Port 8082)
Open a new terminal window and run:
```powershell
cd C:\StageFront\Backend\auth-service
mvn spring-boot:run
```
*Wait until logs display `Started AuthServiceApplication`.*

---

### Step 4: Start Event Service (Port 8083)
Open a new terminal window and run:
```powershell
cd C:\StageFront\Backend\event-service
mvn spring-boot:run
```
*Wait until logs display `Started EventServiceApplication`.*

---

### Step 5: Start Booking Service (Port 8084)
Open a new terminal window and run:
```powershell
cd C:\StageFront\Backend\booking-service
mvn spring-boot:run
```
*Wait until logs display `Started BookingServiceApplication`.*

---

### Step 6: Start API Gateway (Port 8080)
Open a new terminal window and run:
```powershell
cd C:\StageFront\Backend\api-gateway
mvn spring-boot:run
```
*Wait until logs display `Started ApiGatewayApplication`.*

Now open `http://localhost:8761` in your browser. All 5 applications (`USER-SERVICE`, `AUTH-SERVICE`, `EVENT-SERVICE`, `BOOKING-SERVICE`, `API-GATEWAY`) will be listed as **UP**.

---

### Step 7: Launch Frontend Application (Port 5173)
Open a new terminal window and run:
```powershell
cd C:\StageFront\Frontend
npm run dev
```

Navigate to `http://localhost:5173` in Google Chrome or Microsoft Edge.

---

## Demo Credentials

### Default User Account
- **Email**: `rahul@gmail.com`
- **Password**: `Rahul12345`
- **Role**: `USER`

### Default Admin Account
- **Email**: `kusadhiharshit@gmail.com`
- **Password**: `Admin@12345`
- **Role**: `ADMIN`
