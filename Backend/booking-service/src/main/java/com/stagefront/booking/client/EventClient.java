package com.stagefront.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.stagefront.booking.client.dto.EventDto;
import com.stagefront.booking.client.dto.EventUpdateRequest;

@FeignClient(name = "EVENT-SERVICE")
public interface EventClient {

    @GetMapping("/api/events/{id}")
    EventDto getEventById(@PathVariable("id") Long id);

    @PutMapping("/api/events/{id}")
    EventDto updateEvent(@PathVariable("id") Long id, @RequestBody EventUpdateRequest request);
}
