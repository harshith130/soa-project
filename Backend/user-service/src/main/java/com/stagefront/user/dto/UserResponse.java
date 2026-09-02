package com.stagefront.user.dto;

import java.time.LocalDateTime;

public record UserResponse(
		Long id,
		String name,
		String email,
		String phone,
		String role,
		LocalDateTime createdAt) {
}