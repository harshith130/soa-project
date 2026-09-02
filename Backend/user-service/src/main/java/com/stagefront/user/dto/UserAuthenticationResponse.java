package com.stagefront.user.dto;

public record UserAuthenticationResponse(
		Long id,
		String name,
		String email,
		String role,
		String passwordHash) {
}