package com.example.backend.controller;

import com.example.backend.repository.EmployeeRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.AuthService.AuthResult;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final ObjectMapper mapper = new ObjectMapper();
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    public AuthController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
        this.authService = new AuthService(employeeRepository);
    }

    static class AuthRequest {
        public String idToken;
    }

    static class AuthResponse {
        public Map<String, Object> user;
        public String token;
        public boolean registered;

        public AuthResponse(Map<String, Object> user, String token, boolean registered) {
            this.user = user;
            this.token = token;
            this.registered = registered;
        }
    }

    @PostMapping(path = "/auth/google", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginWithGoogle(@RequestBody AuthRequest req) {
        if (req == null || req.idToken == null || req.idToken.isBlank()) {
            throw new IllegalArgumentException("Missing idToken");
        }

        try {
            AuthResult result = authService.loginWithGoogle(req.idToken);
            return ResponseEntity.ok(new AuthResponse(result.user, result.token, result.registered));
        } catch (IOException | InterruptedException e) {
            log.error("Token validation failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Token validation failed");
        }
    }
}
