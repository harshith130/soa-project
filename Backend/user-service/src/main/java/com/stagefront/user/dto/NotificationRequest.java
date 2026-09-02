package com.stagefront.user.dto;

public record NotificationRequest(
    Long recipientUserId,
    String recipientRole,
    String title,
    String message,
    String type,
    Long relatedId
) {}
