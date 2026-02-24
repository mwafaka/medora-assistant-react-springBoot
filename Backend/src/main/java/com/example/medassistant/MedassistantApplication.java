package com.example.medassistant;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableScheduling
public class MedassistantApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedassistantApplication.class, args);
	}

}
