package com.example.medassistant.controller;

import com.example.medassistant.repository.SeniorRepository;

import com.example.medassistant.model.Notification;
import com.example.medassistant.model.Senior;
import com.example.medassistant.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final SeniorRepository seniorRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            SeniorRepository seniorRepository) {
        this.notificationRepository = notificationRepository;
        this.seniorRepository = seniorRepository;
    }

    @GetMapping("/{seniorId}")
    public List<Notification> getNotifications(@PathVariable Long seniorId) {
        Senior senior = seniorRepository.findById(seniorId)
                .orElseThrow(() -> new RuntimeException("Senior not found"));
        return notificationRepository.findBySeniorOrderByCreatedAtDesc(senior);
    }

    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}