package com.stagefront.event.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record EventResponse(
        Long id,
        String name,
        String description,
        String venue,
        LocalDate eventDate,
        LocalTime eventTime,
        String category,
        Integer totalSeats,
        Integer availableSeats,
        BigDecimal price,
        LocalDateTime createdAt) {
}
