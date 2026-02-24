package com.example.medassistant.repository;

import com.example.medassistant.model.Medication;
import com.example.medassistant.model.MedicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface MedicationLogRepository extends JpaRepository<MedicationLog, Long> {
    List<MedicationLog> findByMedicationAndDate(Medication medication, LocalDate date);
}
