package com.example.medassistant.service;

import com.example.medassistant.model.Senior;
import com.example.medassistant.repository.SeniorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeniorService {

    @Autowired
    private SeniorRepository seniorRepository;

    public List<Senior> getAllSeniors() {
        return seniorRepository.findAll(); // include medications via JPA @OneToMany
    }

    public Senior getSeniorById(Long id) {
        return seniorRepository.findById(id).orElse(null);
    }

    public Senior saveSenior(Senior senior) {
        return seniorRepository.save(senior);
    }

    public void deleteSenior(Long id) {
        seniorRepository.deleteById(id);
    }
}
