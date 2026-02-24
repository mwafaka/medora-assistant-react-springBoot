package com.example.medassistant.service;

import com.example.medassistant.model.*;
import com.example.medassistant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class MedicationScheduler {

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private MedicationLogRepository logRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SmsService smsService;

    // Runs every minute (for demo/testing)
    @Scheduled(cron = "0 * * * * *")
    public void checkMissedMedications() {

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        for (Medication med : medicationRepository.findAll()) {

            // 1️⃣ Skip if already taken today
            boolean taken = logRepository
                    .findByMedicationAndDate(med, today)
                    .stream()
                    .anyMatch(MedicationLog::isTaken);

            if (taken)
                continue;

            if (med.getScheduleTime() == null)
                continue;

            LocalDateTime scheduledTime = med.getScheduleTime().atDate(today);

            // 2️⃣ FIRST reminder (at time)
            if (now.isAfter(scheduledTime)
                    && !notificationRepository.existsByMedicationAndLevel(med, 1)) {

                sendNotification(
                        med,
                        1,
                        "Reminder: take " + med.getName(),
                        med.getSenior().getPhone());
            }

            // 3️⃣ SECOND reminder (after 30 min)
            if (now.isAfter(scheduledTime.plusMinutes(30))
                    && !notificationRepository.existsByMedicationAndLevel(med, 2)) {

                sendNotification(
                        med,
                        2,
                        "Second reminder: " + med.getName() + " not taken",
                        med.getSenior().getPhone());
            }

            // 4️⃣ FAMILY alert (after 50 min)
            if (now.isAfter(scheduledTime.plusMinutes(50))
                    && !notificationRepository.existsByMedicationAndLevel(med, 3)) {

                String familyPhone = med.getSenior().getFamilyPhone();

                if (familyPhone != null && !familyPhone.isBlank()) {
                    sendNotification(
                            med,
                            3,
                            "ALERT: " + med.getSenior().getName() + " Not responding for 4 hours"
                                    + " and missed " + med.getName(),
                            familyPhone);
                }
            }
        }
    }

    // ===== HELPER METHOD =====
    private void sendNotification(
            Medication med,
            int level,
            String message,
            String phone) {
        Notification notification = new Notification();
        notification.setMedication(med);
        notification.setSenior(med.getSenior());
        notification.setLevel(level);
        notification.setMessage(message);

        notificationRepository.save(notification);

        if (phone != null && !phone.isBlank()) {
            smsService.sendSms(phone, message);
        }
    }
}
