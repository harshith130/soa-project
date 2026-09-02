# STAGEFRONT: Enterprise Microservices Live Event & Ticket Booking Platform

## 1. Project Title
**StageFront — Enterprise Microservices Event Booking & Management System**

---

## 2. Project Objective
The primary objective of StageFront is to design, develop, and demonstrate a production-grade, distributed microservices application for searching live events, reserving tickets with real-time seat availability synchronization, managing event schedules, and delivering role-based administration for administrators and customers.

---

## 3. Problem Statement
Monolithic event booking applications suffer from single-point-of-failure vulnerabilities, tight database coupling, poor horizontal scalability during peak ticket sales, and unified deployments where minor changes require rebuilding the entire application stack.

---

## 4. Proposed Solution
StageFront addresses monolithic limitations by implementing a Service-Oriented Architecture (SOA) powered by Spring Boot Microservices, Netflix Eureka Service Discovery, Spring Cloud API Gateway, PostgreSQL databases per service domain, and a modern React.js (Vite) single-page application frontend.

---

## 5. Technologies Used
- **Frontend**: React.js 18, Vite 8, FontAwesome 6, CSS3 Glassmorphism UI
- **Backend Framework**: Java 17, Spring Boot 3.x, Spring Data JPA, Hibernate, BCrypt
- **Microservices & Discovery**: Spring Cloud Gateway (`:8080`), Netflix Eureka Discovery Server (`:8761`)
- **Database Architecture**: PostgreSQL (Dedicated microservice schemas)
- **Build Tools**: Apache Maven 3.x, Node.js / npm

---

## 6. System Architecture
The application utilizes a distributed, decoupled multi-tier architecture:
```
Client (Browser:5173) ──> API Gateway (:8080) ──> Service Registry (:8761)
                              │
     ┌────────────────────────┼────────────────────────┬────────────────────────┐
     ▼                        ▼                        ▼                        ▼
User Service (:8081)   Auth Service (:8082)   Event Service (:8083)   Booking Service (:8084)
 [DB: user_db]          [DB: auth_db]          [DB: event_db]          [DB: booking_db]
```

---

## 7. Microservices Architecture
1. **Eureka Server (`:8761`)**: Central service discovery registry tracking live service instances.
2. **API Gateway (`:8080`)**: Unified reverse-proxy entry point routing HTTP requests to downstream registered services.
3. **User Service (`:8081`)**: Manages user profiles, role definitions, and role-based notification channels.
4. **Auth Service (`:8082`)**: Handles login, registration, password hashing (BCrypt), and 6-digit reset token workflows.
5. **Event Service (`:8083`)**: Manages event schedules, venue locations, ticket prices, total capacity, and available seats.
6. **Booking Service (`:8084`)**: Manages ticket reservations, booking references, total amounts, and cancellation statuses.

---

## 8. Frontend Architecture
Built with React.js using component-driven state architecture. High-performance Features include:
- Continuous 3D mouse-follow event card tilt animation using `perspective(1000px)` and hardware-accelerated CSS transforms.
- Single unified routing state through API Gateway `:8080`.
- Dynamic glassmorphism theme and interactive seat matrix.

---

## 9. Backend Architecture
Each microservice is an independent Maven project built on Spring Boot with:
- RestController endpoints (`/api/**`).
- Spring Data JPA Repository pattern.
- Transactional service business logic layer (`@Transactional`).
- Automatic schema validation and initialization.

---

## 10. Database Architecture
De-coupled domain-driven databases:
- `user_db`: User accounts, notifications table.
- `auth_db`: Credential store, password tokens.
- `event_db`: Live event catalogue, category, pricing, seat counts.
- `booking_db`: Ticket reservations, seat allocations, statuses (`CONFIRMED`, `CANCELLED`).

---

## 11. API Gateway
All frontend requests target `http://localhost:8080`. The Spring Cloud Gateway routes endpoints:
- `/api/auth/**` ──> `AUTH-SERVICE` (`:8082`)
- `/api/users/**` ──> `USER-SERVICE` (`:8081`)
- `/api/notifications/**` ──> `USER-SERVICE` (`:8081`)
- `/api/events/**` ──> `EVENT-SERVICE` (`:8083`)
- `/api/bookings/**` ──> `BOOKING-SERVICE` (`:8084`)

---

## 12. Eureka Service Discovery
Services register dynamically with `EUREKA-SERVER` on port `8761`. The API Gateway uses load-balanced Eureka IDs (`lb://EVENT-SERVICE`, `lb://BOOKING-SERVICE`, etc.) to resolve backend endpoints dynamically.

---

## 13. Authentication and Authorization
- User and Admin accounts authenticate against `AUTH-SERVICE`.
- Passwords are encrypted with BCrypt.
- Roles (`USER`, `ADMIN`) control frontend navigation views and backend authorization boundaries.

---

## 14. User Module
Customers can explore live events, filter by category/schedule, select seats, book tickets, view reservations under `My Bookings`, receive notifications, and manage their profile and settings.

---

## 15. Admin Module
Administrators access a non-congested dashboard showing Active Events, Total Seats, and Revenue. Admins can Create, Edit, Delete, View, Inspect Analytics, and Manage Bookings for events without customer booking options.

---

## 16. Event Management
Admins create and modify event titles, categories (Music, Tech, Sports, Arts), venues, schedules, capacity, and pricing.

---

## 17. Event Scheduling
Timezone-safe date validation (`getTodayLocalDateStr()`) prevents selecting past dates and ensures Spring Boot `@FutureOrPresent` constraints are strictly satisfied.

---

## 18. Ticket Booking
Users pick interactive seats (`SeatModal`), confirm payment method (`PaymentModal`), receive a confirmed booking reference (`STG-2026-XXXX`), and download printable ticket passes (`ConfirmationModal`).

---

## 19. Seat Management
When a ticket booking is placed:
$$\text{Available Seats}_{\text{new}} = \max(0, \text{Available Seats}_{\text{current}} - N)$$
The updated capacity is synchronized immediately in the `EVENT-SERVICE` database.

---

## 20. Booking Cancellation
Cancelling a reservation updates status to `CANCELLED` in `BOOKING-SERVICE` and restores seat capacity in `EVENT-SERVICE`:
$$\text{Available Seats}_{\text{restored}} = \min(\text{Total Seats}, \text{Available Seats}_{\text{current}} + N)$$

---

## 21. Notification System
Role-scoped notifications stored in `USER-SERVICE` notify users of confirmed/cancelled bookings and notify admins of new ticket orders or event changes. Unread badges update in real-time.

---

## 22. Profile and Settings
Users and Admins view account details (Avatar, Name, Email, Phone, Role, Joined Date) and configure security preferences or change passwords.

---

## 23. Forgot Password
Provides a 2-step verification recovery flow generating a 6-digit reset token to restore account access securely.

---

## 24. Role-Based Access Control
- **USER Role**: Home, Events, Wishlist, My Bookings, Notifications, Profile, Settings.
- **ADMIN Role**: Event Management, Create Event, View, Edit, Delete, Analytics, Booking Audit, Notifications, Profile, Settings. Admins do not see "Book Tickets" buttons.

---

## 25. API Endpoints
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/{id}`
- `DELETE /api/events/{id}`
- `POST /api/bookings`
- `GET /api/bookings/user/{userId}`
- `PUT /api/bookings/{id}/cancel`
- `GET /api/notifications/user/{userId}`

---

## 26. Database Tables
- `users`: `id`, `name`, `email`, `password`, `phone`, `role`, `created_at`
- `events`: `id`, `name`, `description`, `venue`, `event_date`, `event_time`, `category`, `total_seats`, `available_seats`, `price`
- `bookings`: `id`, `user_id`, `event_id`, `number_of_seats`, `total_amount`, `booking_reference`, `status`
- `notifications`: `id`, `recipient_user_id`, `recipient_role`, `title`, `message`, `type`, `is_read`, `created_at`

---

## 27. Complete User Flow
1. Login/Register as User.
2. Browse events on Home or Events page.
3. Select event -> Open `SeatModal` -> Choose seat quantity.
4. Complete payment -> Ticket booking created & seats reduced.
5. View digital ticket pass under `My Bookings`.
6. Cancel booking if needed -> Status updated to `CANCELLED` & seats restored.

---

## 28. Complete Admin Flow
1. Authenticate with Admin credentials.
2. View Admin Dashboard & sales revenue metrics.
3. Click `+ Create Event` -> Input title, venue, YYYY-MM-DD date, capacity, price.
4. Inspect event analytics & user booking details.
5. Edit or delete event as required.

---

## 29. Testing
Full end-to-end integration testing performed against live Gateway (`:8080`) and Eureka (`:8761`):
- User/Admin Authentication test: PASSED
- Seat reduction & restoration test: PASSED
- Database persistence check: PASSED

---

## 30. Build Verification
- **Frontend Build (`npm run build`)**: Exit Code `0`, Zero compilation errors.
- **Backend Builds (`mvn compile`)**: All 6 microservices compiled with `BUILD SUCCESS`.

---

## 31. Advantages
- Independent scalability of microservices.
- Fault isolation & resilience.
- Real-time seat availability synchronization across services.
- Clean glassmorphism UI with responsive tilt animations.

---

## 32. Limitations
- Requires all microservices running for full workflow integration.

---

## 33. Future Enhancements
- Payment gateway Webhook integration (Razorpay/Stripe).
- Real-time WebSocket ticket availability streams.

---

## 34. Conclusion
StageFront successfully demonstrates an enterprise-grade Service-Oriented Architecture for live event management and ticket booking, fulfilling all college submission requirements.

---

## COLLEGE DEMONSTRATION FLOW

Follow this step-by-step sequence during the college presentation:

1. **Open StageFront Frontend**: Navigate to `http://localhost:5173`.
2. **Show User Mode**: Demonstrate the home page, video hero background, and 3D card tilt animation.
3. **Login as User**: Click `Login`, enter `rahul@gmail.com` / `Rahul12345`.
4. **Show Events**: Navigate to the `Events` tab and filter by category (Music, Tech, Sports).
5. **Open an Event**: Click on an event (e.g. `Sunburn Goa Festival`).
6. **Book Tickets**: Click `Book Tickets`, select 2 seats in `SeatModal`, proceed through `PaymentModal`.
7. **Show Booking Confirmation**: Display the digital pass (`ConfirmationModal`) with barcode and reference ID (`STG-2026-XXXX`).
8. **Open My Bookings**: Show the new reservation in `My Bookings`.
9. **Cancel Booking**: Click `Cancel Booking` and confirm the dialog.
10. **Show Restored Seat Availability**: Verify seat count increased back by 2 in the event list.
11. **Show Notifications**: Click the notification bell to view real-time booking alerts.
12. **Open Profile & Settings**: Show user details and preferences.
13. **Logout**: Click user dropdown -> `Logout`.
14. **Login as Admin**: Click `Login`, enter `kusadhiharshit@gmail.com` / `Admin@12345`.
15. **Open Admin Dashboard**: Show admin dashboard metrics (Active Events, Seats Left, Revenue).
16. **Create an Event**: Click `+ Create Event`, submit a new concert with today's/future date.
17. **Edit the Event**: Click `Edit` on an event to update venue or capacity.
18. **Show Analytics**: Click `Analytics` to view occupancy percentage.
19. **Show User Booking Details**: Open `Bookings` on an event to view real user customer reservations.
20. **Delete the Event**: Click `Delete` to remove the test event.
21. **Logout**: Click Admin profile -> `Admin Logout`.
