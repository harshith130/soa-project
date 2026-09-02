package com.stagefront.event.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stagefront.event.dto.EventRequest;
import com.stagefront.event.dto.EventResponse;
import com.stagefront.event.entity.Event;
import com.stagefront.event.exception.EventNotFoundException;
import com.stagefront.event.repository.EventRepository;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findAll() {
        return eventRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EventResponse findById(Long id) {
        return eventRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
    }

    public EventResponse create(EventRequest request) {
        validateSeats(request.totalSeats(), request.availableSeats());
        Event event = new Event();
        apply(request, event);
        return toResponse(eventRepository.save(event));
    }

    public EventResponse update(Long id, EventRequest request) {
        validateSeats(request.totalSeats(), request.availableSeats());
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
        apply(request, event);
        return toResponse(eventRepository.save(event));
    }

    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EventNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    private void apply(EventRequest request, Event event) {
        event.setName(request.name().trim());
        event.setDescription(request.description().trim());
        event.setVenue(request.venue().trim());
        event.setEventDate(request.eventDate());
        event.setEventTime(request.eventTime());
        event.setCategory(request.category().trim());
        event.setTotalSeats(request.totalSeats());
        event.setAvailableSeats(request.availableSeats());
        event.setPrice(request.price());
    }

    private void validateSeats(Integer totalSeats, Integer availableSeats) {
        if (availableSeats > totalSeats) {
            throw new IllegalArgumentException("Available seats cannot exceed total seats");
        }
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(), event.getName(), event.getDescription(), event.getVenue(),
                event.getEventDate(), event.getEventTime(), event.getCategory(),
                event.getTotalSeats(), event.getAvailableSeats(), event.getPrice(), event.getCreatedAt());
    }
}
