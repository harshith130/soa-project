package com.stagefront.booking.client.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventUpdateRequest(
        String name,
        String description,
        String venue,
        LocalDate eventDate,
        LocalTime eventTime,
        String category,
        Integer totalSeats,
        Integer availableSeats,
        BigDecimal price) {
}
