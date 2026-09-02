package com.stagefront.auth.dto;

public record LoginResponse(
		String message,
		Long userId,
		String name,
		String email,
		String role) {
}