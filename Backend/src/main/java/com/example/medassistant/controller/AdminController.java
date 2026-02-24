package com.example.medassistant.controller;

import com.example.medassistant.dto.PinRequest;
import com.example.medassistant.util.HashUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    @Value("${caregiver.pin}")
    private String storedHash;

    @PostMapping("/verify-pin")
    public ResponseEntity<?> verifyPin(@RequestBody PinRequest request) {

        String inputHash = HashUtil.sha256(request.getPin());

        if (!inputHash.equals(storedHash)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok().build();
    }
}