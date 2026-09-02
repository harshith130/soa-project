# StageFront API Gateway

The API Gateway runs on port 8080 and routes requests through Eureka:

- `/api/users/**` to `USER-SERVICE`
- `/api/auth/**` to `AUTH-SERVICE`
