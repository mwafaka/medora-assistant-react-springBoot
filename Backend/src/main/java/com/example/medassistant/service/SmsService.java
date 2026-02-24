package com.example.medassistant.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.enable:false}") // Use this flag to enable real SMS
    private boolean enableTwilio;

    @Value("${twilio.accountSid:}")
    private String accountSid;

    @Value("${twilio.authToken:}")
    private String authToken;

    @Value("${twilio.phoneNumber:}")
    private String fromNumber;

    public void sendSms(String to, String message) {
        if (enableTwilio) {
            // Real Twilio SMS
            Twilio.init(accountSid, authToken);
            Message.creator(new PhoneNumber(to), new PhoneNumber(fromNumber), message).create();
            System.out.println("✅ SMS sent to " + to + ": " + message);
        } else {
            // Mock SMS for testing
            System.out.println("📱 [MOCK SMS] To: " + to + " | Message: " + message);
        }
    }
}
