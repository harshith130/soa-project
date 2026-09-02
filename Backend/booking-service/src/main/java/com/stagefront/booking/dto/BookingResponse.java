package com.stagefront.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.stagefront.booking.entity.BookingStatus;

public record BookingResponse(
        Long id,
        Long userId,
        Long eventId,
        String bookingReference,
        LocalDate bookingDate,
        Integer numberOfSeats,
        BigDecimal totalAmount,
        BookingStatus status,
        LocalDateTime createdAt) {
}
