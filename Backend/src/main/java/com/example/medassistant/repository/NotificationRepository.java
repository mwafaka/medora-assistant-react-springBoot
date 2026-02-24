package com.example.medassistant.repository;

import com.example.medassistant.model.Medication;
import com.example.medassistant.model.Notification;
import com.example.medassistant.model.Senior;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // For notifications UI
    List<Notification> findBySeniorOrderByCreatedAtDesc(Senior senior);

    // Used by scheduler (IMPORTANT)
    boolean existsByMedicationAndLevel(Medication medication, int level);
}
