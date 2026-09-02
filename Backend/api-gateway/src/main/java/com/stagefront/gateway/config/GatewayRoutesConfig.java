package com.stagefront.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    RouteLocator stageFrontRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", route -> route
                        .path("/api/users/**")
                        .uri("lb://USER-SERVICE"))
                .route("notification-service", route -> route
                        .path("/api/notifications/**")
                        .uri("lb://USER-SERVICE"))
                .route("auth-service", route -> route
                        .path("/api/auth/**")
                        .uri("lb://AUTH-SERVICE"))
                .route("event-service", route -> route
                        .path("/api/events/**")
                        .uri("lb://EVENT-SERVICE"))
                .route("booking-service", route -> route
                        .path("/api/bookings/**")
                        .uri("lb://BOOKING-SERVICE"))
                .build();
    }
}
