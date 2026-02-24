package com.example.medassistant.service;

import com.example.medassistant.model.Medication;
import com.example.medassistant.model.MedicationLog;
import com.example.medassistant.repository.MedicationLogRepository;
import com.example.medassistant.repository.MedicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class MedicationService {

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private MedicationLogRepository logRepository;

    // get the taken medication
    public List<MedicationLog> getTodayLogs(Long seniorId, LocalDate date) {
        List<Medication> meds = medicationRepository.findBySeniorId(seniorId);
        // For each medication, get logs for today
        return meds.stream()
                .flatMap(med -> logRepository.findByMedicationAndDate(med, date).stream())
                .toList();
    }

    // Get medications for a senior
    public List<Medication> getMedicationsBySenior(Long seniorId) {
        return medicationRepository.findBySeniorId(seniorId);
    }

    // Create medication
    public Medication createMedication(Medication medication) {
        return medicationRepository.save(medication);
    }

    // Update medication
    public Medication updateMedication(Long id, Medication medicationDetails) {
        Medication med = medicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medication not found"));

        med.setName(medicationDetails.getName());
        med.setDosage(medicationDetails.getDosage());
        med.setScheduleTime(medicationDetails.getScheduleTime());
        med.setSenior(medicationDetails.getSenior());

        return medicationRepository.save(med);
    }

    // Delete medication
    public void deleteMedication(Long id) {
        medicationRepository.deleteById(id);
    }

    // Log medication taken/missed
    public MedicationLog logMedication(Long medicationId, boolean taken) {
        Medication med = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new RuntimeException("Medication not found"));

        LocalDate today = LocalDate.now();

        // Check if log already exists for today
        MedicationLog existingLog = logRepository
                .findByMedicationAndDate(med, today)
                .stream()
                .findFirst()
                .orElse(null);

        if (existingLog != null) {
            // Update existing log
            existingLog.setTaken(taken);
            existingLog.setTimeTaken(LocalTime.now());
            return logRepository.save(existingLog);
        }

        // Create new log
        MedicationLog log = new MedicationLog();
        log.setMedication(med);
        log.setDate(today);
        log.setTimeTaken(LocalTime.now());
        log.setTaken(taken);

        return logRepository.save(log);
    }
}
