package com.stagefront.user.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stagefront.user.dto.NotificationRequest;
import com.stagefront.user.entity.Notification;
import com.stagefront.user.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(NotificationRequest req) {
        String role = (req.recipientRole() != null && !req.recipientRole().isBlank()) ? req.recipientRole().toUpperCase() : "USER";
        Notification notification = new Notification(
                req.recipientUserId(),
                role,
                req.title(),
                req.message(),
                req.type(),
                req.relatedId()
        );
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getNotificationsForAdmin() {
        return notificationRepository.findByRecipientRoleOrderByCreatedAtDesc("ADMIN");
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsReadForUser(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public void markAllAsReadForAdmin() {
        notificationRepository.markAllAsReadForAdmin();
    }
}
