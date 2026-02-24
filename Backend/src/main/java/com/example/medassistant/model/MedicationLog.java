package com.example.medassistant.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class MedicationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Medication medication;

    private LocalDate date;
    private LocalTime timeTaken;
    private boolean taken;

    // Default constructor
    public MedicationLog() {
    }

    // Constructor with fields (without id, since it's auto-generated)
    public MedicationLog(Medication medication, LocalTime timeTaken, LocalDate date, boolean taken) {
        this.medication = medication;
        this.date = date;
        this.taken = taken;
        this.timeTaken = timeTaken;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medication getMedication() {
        return medication;
    }

    public void setMedication(Medication medication) {
        this.medication = medication;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isTaken() {
        return taken;
    }

    public LocalTime getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(LocalTime timeTaken) {
        this.timeTaken = timeTaken;
    }

    public void setTaken(boolean taken) {
        this.taken = taken;
    }

    @Override
    public String toString() {
        return "MedicationLog{" +
                "id=" + id +
                ", medication=" + (medication != null ? medication.getId() : null) +
                ", date=" + date +
                ", timeTaken=" + timeTaken +
                ", taken=" + taken +
                '}';
    }
}
