package com.stagefront.booking.client.dto;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String name,
        String email,
        String phone,
        String role,
        LocalDateTime createdAt) {
}
