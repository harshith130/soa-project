package com.stagefront.booking.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stagefront.booking.client.EventClient;
import com.stagefront.booking.client.dto.EventDto;
import com.stagefront.booking.client.dto.EventUpdateRequest;
import com.stagefront.booking.entity.Booking;
import com.stagefront.booking.entity.BookingStatus;
import com.stagefront.booking.repository.BookingRepository;

@Service
public class BookingHoldCleanupService {

    private static final Logger log = LoggerFactory.getLogger(BookingHoldCleanupService.class);

    private final BookingRepository bookingRepository;
    private final EventClient eventClient;

    public BookingHoldCleanupService(BookingRepository bookingRepository, EventClient eventClient) {
        this.bookingRepository = bookingRepository;
        this.eventClient = eventClient;
    }

    @Scheduled(fixedDelayString = "${stagefront.booking.cleanup-interval-ms:5000}")
    @Transactional
    public void cleanupExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredHolds = bookingRepository.findByStatusAndHoldExpiresAtBefore(BookingStatus.PENDING, now);

        if (expiredHolds.isEmpty()) {
            return;
        }

        log.info("Found {} expired pending seat hold(s) to process", expiredHolds.size());

        for (Booking booking : expiredHolds) {
            // State transition to EXPIRED prevents double-release
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);

            // Automatically restore seats in EVENT-SERVICE via OpenFeign
            try {
                EventDto event = eventClient.getEventById(booking.getEventId());
                if (event != null) {
                    int restoredAvail = Math.min(event.totalSeats(), event.availableSeats() + booking.getNumberOfSeats());
                    EventUpdateRequest updateReq = new EventUpdateRequest(
                            event.name(), event.description(), event.venue(),
                            event.eventDate(), event.eventTime(), event.category(),
                            event.totalSeats(), restoredAvail, event.price());
                    eventClient.updateEvent(event.id(), updateReq);
                    log.info("Released {} seat(s) for expired booking hold #{} (Event #{}) via OpenFeign",
                            booking.getNumberOfSeats(), booking.getId(), event.id());
                }
            } catch (Exception e) {
                log.error("Failed to release seats for expired hold #{}: {}", booking.getId(), e.getMessage());
            }
        }
    }
}
