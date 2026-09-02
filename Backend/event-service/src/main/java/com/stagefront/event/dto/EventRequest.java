package com.stagefront.event.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EventRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Description is required") String description,
        @NotBlank(message = "Venue is required") String venue,
        @NotNull(message = "Event date is required") @FutureOrPresent(message = "Event date must be today or later") LocalDate eventDate,
        @NotNull(message = "Event time is required") LocalTime eventTime,
        @NotBlank(message = "Category is required") String category,
        @NotNull(message = "Total seats are required") @Min(value = 1, message = "Total seats must be at least 1") Integer totalSeats,
        @NotNull(message = "Available seats are required") @Min(value = 0, message = "Available seats cannot be negative") Integer availableSeats,
        @NotNull(message = "Price is required") @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative") BigDecimal price) {
}
