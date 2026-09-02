package com.stagefront.booking.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record BookingRequest(
        @NotNull(message = "User id is required") Long userId,
        @NotNull(message = "Event id is required") Long eventId,
        @NotNull(message = "Number of seats is required") @Min(value = 1, message = "Number of seats must be greater than 0") Integer numberOfSeats,
        @NotNull(message = "Price is required") @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive") BigDecimal price) {
}
