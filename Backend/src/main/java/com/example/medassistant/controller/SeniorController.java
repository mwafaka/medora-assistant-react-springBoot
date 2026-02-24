package com.example.medassistant.controller;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.example.medassistant.model.Senior;
import com.example.medassistant.service.SeniorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/seniors")
public class SeniorController {

    private void verifyAdmin(String header) {
        if (!"true".equals(header)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    @Autowired
    private SeniorService seniorService;

    // List all seniors (include medications)
    @GetMapping
    public List<Senior> getAllSeniors() {
        return seniorService.getAllSeniors();
    }

    // Add a new senior
    @PostMapping
    public Senior addSenior(
            @RequestHeader(value = "X-Admin-Verified", required = false) String verified,
            @RequestBody Map<String, String> payload) {
        Senior senior = new Senior();
        senior.setName(payload.get("name"));
        senior.setPhone(payload.get("phone"));
        senior.setFamilyPhone(payload.get("familyPhone"));
        verifyAdmin(verified);
        return seniorService.saveSenior(senior);
    }

    // Edit an existing senior
    @PutMapping("/{id}")
    public Senior editSenior(
            @RequestHeader(value = "X-Admin-Verified", required = false) String verified,
            @PathVariable Long id, @RequestBody Map<String, String> payload) {
        Senior senior = seniorService.getSeniorById(id);
        if (senior == null)
            throw new RuntimeException("Senior not found");

        if (payload.containsKey("name"))
            senior.setName(payload.get("name"));
        if (payload.containsKey("phone"))
            senior.setPhone(payload.get("phone"));
        if (payload.containsKey("familyPhone"))
            senior.setFamilyPhone(payload.get("familyPhone"));
        verifyAdmin(verified);
        return seniorService.saveSenior(senior);
    }

    // Delete a senior
    @DeleteMapping("/{id}")
    public String deleteSenior(
            @RequestHeader(value = "X-Admin-Verified", required = false) String verified,
            @PathVariable Long id) {
        verifyAdmin(verified);
        seniorService.deleteSenior(id);

        return "Senior deleted successfully";
    }
}
