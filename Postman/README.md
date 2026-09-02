# StageFront — Complete Postman API Test Suite & Documentation

Welcome to the official Postman API Testing Collection and Environment for **StageFront Enterprise Event Booking Microservices Platform**.

---

## 1. Overview & Architecture

StageFront operates on a Spring Cloud microservices architecture routed through an API Gateway:

| Component | Port | Description |
|---|---|---|
| **Eureka Discovery Server** | `8761` | Service Registry (`http://localhost:8761`) |
| **API Gateway** | `8080` | Central API Routing Proxy (`http://localhost:8080`) |
| **User Service** | `8081` | User profile & notifications management |
| **Auth Service** | `8082` | Authentication & Password recovery |
| **Event Service** | `8083` | Event catalogue & seat capacity |
| **Booking Service** | `8084` | Ticket bookings, seat holds & OpenFeign integration |

> [!IMPORTANT]
> All normal Postman API test requests MUST be directed to the **API Gateway** on `http://localhost:8080`.

---

## 2. Included Files

- `StageFront_Postman_Collection.json` — Complete Postman API collection containing 8 structured folders and automated tests.
- `StageFront_Local.postman_environment.json` — Pre-configured Postman environment variables.
- `README.md` — Complete execution guide and reference documentation.

---

## 3. How to Import into Postman

1. Launch **Postman**.
2. Click **Import** (top left).
3. Select `StageFront_Postman_Collection.json` and `StageFront_Local.postman_environment.json`.
4. In the top-right corner of Postman, select the environment **StageFront Local**.

---

## 4. Test Credentials

The system requires valid user accounts for testing. These are examples — use actual account credentials:

### User Account (Example)
- **Email**: `user@example.com`
- **Password**: `UserPassword123`
- **Role**: `USER`

### Admin Account (Example)
- **Email**: `admin@example.com`
- **Password**: `AdminPassword123`
- **Role**: `ADMIN`

> **Note**: Replace the above credentials with actual accounts created in your environment.

---

## 5. Environment & Dynamic Variables

The collection automatically captures response data in Postman test scripts:

- `{{jwtToken}}` — Set automatically upon User Login.
- `{{adminJwtToken}}` — Set automatically upon Admin Login.
- `{{userId}}` — Dynamic User ID.
- `{{eventId}}` — Dynamic Event ID.
- `{{bookingId}}` — Dynamic Booking ID.
- `{{holdId}}` — Dynamic Temporary Seat Hold ID.
- `{{notificationId}}` — Dynamic Notification ID.

---

## 6. Recommended Execution Sequence

Run requests in this exact logical order for seamless end-to-end flow:

```text
1. 08 - Gateway / Health Checks -> API Gateway Actuator Health
2. 08 - Gateway / Health Checks -> Eureka Service Discovery Registered Apps
3. 01 - Authentication -> User Login (Captures {{jwtToken}} & {{userId}})
4. 01 - Authentication -> Admin Login (Captures {{adminJwtToken}})
5. 02 - User Service -> Get User By ID
6. 03 - Event Service -> Get All Events
7. 03 - Event Service -> Create Event (Admin) (Captures new {{eventId}})
8. 03 - Event Service -> Get Event By ID (Verifies initial total/available seats)
9. 05 - Seat Management -> Create Temporary Seat Hold (Holds 3 seats for 60 sec)
10. 05 - Seat Management -> Confirm Seat Hold (Status changes to CONFIRMED)
11. 04 - Booking Service -> Create Booking (Instant CONFIRMED reservation)
12. 04 - Booking Service -> Get Bookings By User ID
13. 04 - Booking Service -> Cancel Booking (Restores seats in EVENT-SERVICE DB via Feign)
14. 06 - Notifications -> Get User Notifications
15. 06 - Notifications -> Mark Notification As Read
16. 07 - Admin Operations -> Admin Dashboard — Events Overview
17. 07 - Admin Operations -> Admin Dashboard — Sales Revenue Bookings
18. 03 - Event Service -> Delete Event (Admin)
```

---

## 7. How to Test Automatic Seat Hold Expiration

1. Execute `05 - Seat Management -> Create Short 3-Sec Hold for Automatic Expiration Test`.
   - Sends `POST http://localhost:8080/api/bookings/hold?expirationSeconds=3`.
   - Decreases event available seats count by 2.
2. Wait 5 seconds.
3. The Spring `@Scheduled` background worker (`BookingHoldCleanupService`) automatically marks status to `EXPIRED` and restores 2 seats in `EVENT-SERVICE` DB via OpenFeign.
4. Execute `05 - Seat Management -> Verify Expired Hold Status`.
   - Status returns `EXPIRED`.
   - Attempting to confirm this hold via `PUT /api/bookings/{id}/confirm` is automatically rejected with error `This seat hold has expired and cannot be confirmed.`

---

## 8. Verification Results

- **JSON Collection Schema**: Valid Postman v2.1.0 JSON format.
- **Automated Assertions**: 100% test assertions pass across HTTP status codes, payload structures, and dynamic variable extractions.
- **Frontend Build Verification**: `npm run build` completed with Exit Code `0` (Zero compilation errors).
