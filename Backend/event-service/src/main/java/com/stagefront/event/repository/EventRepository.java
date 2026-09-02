package com.stagefront.event.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stagefront.event.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
}
