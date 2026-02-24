package com.example.medassistant.repository;

import com.example.medassistant.model.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findBySeniorId(Long seniorId);
}
