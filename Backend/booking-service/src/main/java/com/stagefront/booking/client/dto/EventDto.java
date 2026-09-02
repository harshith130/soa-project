package com.stagefront.booking.client.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record EventDto(
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
