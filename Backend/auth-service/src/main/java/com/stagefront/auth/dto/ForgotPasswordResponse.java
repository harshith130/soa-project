package com.stagefront.auth.dto;

public record ForgotPasswordResponse(
        String message,
        String email,
        String resetCode
) {
}
