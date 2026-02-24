package com.example.medassistant.controller;

import com.example.medassistant.model.Medication;
import com.example.medassistant.model.MedicationLog;
import com.example.medassistant.service.MedicationService;
// import com.example.medassistant.util.HashUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class MedicationController {

    @Autowired
    private MedicationService service;

    @GetMapping("/medications/{seniorId}")
    public List<Medication> getMedications(@PathVariable Long seniorId) {
    //   System.out.println(HashUtil.sha256("1234"));
        return service.getMedicationsBySenior(seniorId);
    }

    @GetMapping("/medication-logs/today/{seniorId}")
    public List<MedicationLog> getTodayLogs(@PathVariable Long seniorId) {
        LocalDate today = LocalDate.now();
        return service.getTodayLogs(seniorId, today);
    }

    @PostMapping("/medications")
    public Medication createMedication(@RequestBody Medication medication) {
        return service.createMedication(medication);
    }

    @PutMapping("/medication/{id}")
    public Medication updateMedication(@PathVariable Long id, @RequestBody Medication medicationDetails) {
        return service.updateMedication(id, medicationDetails);
    }

    @DeleteMapping("/medication/{id}")
    public String deleteMedication(@PathVariable Long id) {
        service.deleteMedication(id);
        return "Medication with ID " + id + " has been deleted.";
    }

    // Log taken/missed
    @PostMapping("/medications/{medicationId}/log")
    public MedicationLog confirmMedication(@PathVariable Long medicationId,
            @RequestBody Map<String, Boolean> payload) {
        boolean taken = payload.getOrDefault("taken", false);
        return service.logMedication(medicationId, taken);
    }
}
