package com.stagefront.booking.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stagefront.booking.dto.BookingRequest;
import com.stagefront.booking.dto.BookingResponse;
import com.stagefront.booking.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.create(request);
        return ResponseEntity.created(URI.create("/api/bookings/" + response.id())).body(response);
    }

    @PostMapping("/hold")
    public ResponseEntity<BookingResponse> createHold(
            @Valid @RequestBody BookingRequest request,
            @RequestParam(name = "expirationSeconds", defaultValue = "0") int expirationSeconds) {
        BookingResponse response = bookingService.createHold(request, expirationSeconds);
        return ResponseEntity.created(URI.create("/api/bookings/" + response.id())).body(response);
    }

    @PutMapping("/{id}/confirm")
    public BookingResponse confirmBooking(@PathVariable Long id) {
        return bookingService.confirmBooking(id);
    }

    @GetMapping
    public List<BookingResponse> findAll() {
        return bookingService.findAll();
    }

    @GetMapping("/{id}")
    public BookingResponse findById(@PathVariable Long id) {
        return bookingService.findById(id);
    }

    @GetMapping("/user/{userId}")
    public List<BookingResponse> findByUserId(@PathVariable Long userId) {
        return bookingService.findByUserId(userId);
    }

    @GetMapping("/event/{eventId}")
    public List<BookingResponse> findByEventId(@PathVariable Long eventId) {
        return bookingService.findByEventId(eventId);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id) {
        return bookingService.cancel(id);
    }
}
