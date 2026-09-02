package com.stagefront.booking.client.dto;

public record NotificationDto(
        Long recipientUserId,
        String recipientRole,
        String title,
        String message,
        String type,
        Long relatedId) {
}
