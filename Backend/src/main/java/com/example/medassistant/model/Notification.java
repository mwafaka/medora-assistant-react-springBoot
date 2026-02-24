package com.example.medassistant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    @Column(name = "is_read")
    private boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Reminder level:
     * 1 = first reminder to senior
     * 2 = second reminder to senior (after 30 min)
     * 3 = family notified
     */
    private int level;

    @ManyToOne
    private Medication medication;

    @ManyToOne
    private Senior senior;

    // ===== Constructors =====

    public Notification() {
    }

    public Notification(String message, int level, Medication medication, Senior senior) {
        this.message = message;
        this.level = level;
        this.medication = medication;
        this.senior = senior;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public Medication getMedication() {
        return medication;
    }

    public void setMedication(Medication medication) {
        this.medication = medication;
    }

    public Senior getSenior() {
        return senior;
    }

    public void setSenior(Senior senior) {
        this.senior = senior;
    }

    // ===== toString =====

    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", message='" + message + '\'' +
                ", read=" + read +
                ", createdAt=" + createdAt +
                ", level=" + level +
                ", medication=" + (medication != null ? medication.getId() : null) +
                ", senior=" + (senior != null ? senior.getId() : null) +
                '}';
    }
}
