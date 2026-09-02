package com.stagefront.booking.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stagefront.booking.client.EventClient;
import com.stagefront.booking.client.UserClient;
import com.stagefront.booking.client.dto.EventDto;
import com.stagefront.booking.client.dto.EventUpdateRequest;
import com.stagefront.booking.client.dto.NotificationDto;
import com.stagefront.booking.dto.BookingRequest;
import com.stagefront.booking.dto.BookingResponse;
import com.stagefront.booking.entity.Booking;
import com.stagefront.booking.entity.BookingStatus;
import com.stagefront.booking.exception.BookingNotFoundException;
import com.stagefront.booking.repository.BookingRepository;

@Service
@Transactional
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final EventClient eventClient;
    private final UserClient userClient;

    @Value("${stagefront.booking.hold-expiration-seconds:60}")
    private int holdExpirationSeconds;

    public BookingService(BookingRepository bookingRepository, EventClient eventClient, UserClient userClient) {
        this.bookingRepository = bookingRepository;
        this.eventClient = eventClient;
        this.userClient = userClient;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse findById(Long id) {
        return bookingRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findByEventId(Long eventId) {
        return bookingRepository.findByEventId(eventId).stream().map(this::toResponse).toList();
    }

    // Standard Instant Booking Creation (CONFIRMED)
    public BookingResponse create(BookingRequest request) {
        return createBookingInternal(request, BookingStatus.CONFIRMED, 0);
    }

    // Temporary Seat Hold Creation (PENDING with expiration)
    public BookingResponse createHold(BookingRequest request, int expirationSeconds) {
        int seconds = expirationSeconds > 0 ? expirationSeconds : holdExpirationSeconds;
        return createBookingInternal(request, BookingStatus.PENDING, seconds);
    }

    private BookingResponse createBookingInternal(BookingRequest request, BookingStatus initialStatus, int expirationSeconds) {
        // 1. Inter-service validation via OpenFeign EventClient
        EventDto event = null;
        try {
            event = eventClient.getEventById(request.eventId());
            if (event != null && event.availableSeats() != null && event.availableSeats() < request.numberOfSeats()) {
                throw new IllegalArgumentException("Not enough available seats for event id: " + request.eventId());
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Feign call to EVENT-SERVICE failed or event not found: {}", e.getMessage());
        }

        // 2. Create Booking Entity
        Booking booking = new Booking();
        booking.setUserId(request.userId());
        booking.setEventId(request.eventId());
        booking.setNumberOfSeats(request.numberOfSeats());
        booking.setTotalAmount(request.price().multiply(BigDecimal.valueOf(request.numberOfSeats())));
        booking.setBookingReference(generateBookingReference());
        booking.setStatus(initialStatus);

        if (initialStatus == BookingStatus.PENDING && expirationSeconds > 0) {
            booking.setHoldExpiresAt(LocalDateTime.now().plusSeconds(expirationSeconds));
        }

        Booking saved = bookingRepository.save(booking);

        // 3. Inter-service seat reduction via OpenFeign EventClient
        if (event != null) {
            try {
                int newAvail = Math.max(0, event.availableSeats() - request.numberOfSeats());
                EventUpdateRequest updateReq = new EventUpdateRequest(
                        event.name(), event.description(), event.venue(),
                        event.eventDate(), event.eventTime(), event.category(),
                        event.totalSeats(), newAvail, event.price());
                eventClient.updateEvent(event.id(), updateReq);
                log.info("Successfully updated event {} available seats to {} via OpenFeign", event.id(), newAvail);
            } catch (Exception e) {
                log.error("Failed to update event seats via Feign EventClient: {}", e.getMessage());
            }
        }

        // 4. Inter-service notifications for confirmed bookings
        if (initialStatus == BookingStatus.CONFIRMED) {
            sendBookingNotifications(request, saved, event);
        }

        return toResponse(saved);
    }

    public BookingResponse confirmBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new IllegalStateException("This seat hold has expired and cannot be confirmed.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("This booking was cancelled and cannot be confirmed.");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setHoldExpiresAt(null);
        Booking updated = bookingRepository.save(booking);

        try {
            EventDto event = eventClient.getEventById(booking.getEventId());
            sendBookingNotifications(new BookingRequest(booking.getUserId(), booking.getEventId(), booking.getNumberOfSeats(), booking.getTotalAmount()), updated, event);
        } catch (Exception e) {
            log.warn("Failed sending notification on confirm: {}", e.getMessage());
        }

        return toResponse(updated);
    }

    public BookingResponse cancel(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));

        BookingStatus prevStatus = booking.getStatus();
        if (prevStatus == BookingStatus.CANCELLED || prevStatus == BookingStatus.EXPIRED) {
            return toResponse(booking);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setHoldExpiresAt(null);
        Booking updated = bookingRepository.save(booking);

        // Inter-service seat restoration via OpenFeign EventClient
        try {
            EventDto event = eventClient.getEventById(booking.getEventId());
            if (event != null) {
                int restoredAvail = Math.min(event.totalSeats(), event.availableSeats() + booking.getNumberOfSeats());
                EventUpdateRequest updateReq = new EventUpdateRequest(
                        event.name(), event.description(), event.venue(),
                        event.eventDate(), event.eventTime(), event.category(),
                        event.totalSeats(), restoredAvail, event.price());
                eventClient.updateEvent(event.id(), updateReq);
                log.info("Successfully restored event {} available seats to {} via OpenFeign", event.id(), restoredAvail);
            }
        } catch (Exception e) {
            log.error("Failed to restore event seats via Feign EventClient: {}", e.getMessage());
        }

        // Inter-service cancellation notification via OpenFeign UserClient
        try {
            userClient.createNotification(new NotificationDto(
                    null, "ADMIN", "Booking Cancellation ⚠️",
                    "Reservation #" + booking.getId() + " was cancelled.",
                    "BOOKING_CANCELLED", booking.getId()));
        } catch (Exception e) {
            log.warn("Failed to create cancellation notification via Feign UserClient: {}", e.getMessage());
        }

        return toResponse(updated);
    }

    private void sendBookingNotifications(BookingRequest request, Booking saved, EventDto event) {
        try {
            String eventName = (event != null && event.name() != null) ? event.name() : ("Event EVT-" + request.eventId());
            userClient.createNotification(new NotificationDto(
                    request.userId(), "USER", "Booking Confirmed 🎉",
                    "Your reservation for " + eventName + " (" + request.numberOfSeats() + " seats) is confirmed!",
                    "BOOKING_CREATED", saved.getId()));

            userClient.createNotification(new NotificationDto(
                    null, "ADMIN", "New Ticket Booking 🎟️",
                    "User booked " + request.numberOfSeats() + " ticket(s) for " + eventName + ".",
                    "BOOKING_CREATED", saved.getId()));
        } catch (Exception e) {
            log.warn("Failed to create notifications via Feign UserClient: {}", e.getMessage());
        }
    }

    private String generateBookingReference() {
        return String.format(Locale.ROOT, "STG-%d-%s", Year.now().getValue(),
                UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT));
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(), booking.getUserId(), booking.getEventId(), booking.getBookingReference(),
                booking.getBookingDate(), booking.getNumberOfSeats(), booking.getTotalAmount(),
                booking.getStatus(), booking.getCreatedAt());
    }
}
