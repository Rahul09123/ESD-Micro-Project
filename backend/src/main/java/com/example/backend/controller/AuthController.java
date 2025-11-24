package com.example.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.backend.model.Employee;
import com.example.backend.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final ObjectMapper mapper = new ObjectMapper();
    private final EmployeeRepository employeeRepository;

    public AuthController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    static class AuthRequest {
        public String idToken;
    }

    static class AuthResponse {
        public Map<String, Object> user;
        public String token;

        public AuthResponse(Map<String, Object> user, String token) {
            this.user = user;
            this.token = token;
        }
    }

    @PostMapping(path = "/auth/google", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginWithGoogle(@RequestBody AuthRequest req) {
        if (req == null || req.idToken == null || req.idToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing idToken");
        }

        try {
            // Call Google's tokeninfo endpoint to validate the ID token
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + req.idToken;
            log.info("Validating Google ID token via: {}", url);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest r = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> resp = client.send(r, HttpResponse.BodyHandlers.ofString());
            log.info("Google tokeninfo status: {}", resp.statusCode());
            if (resp.statusCode() != 200) {
                log.warn("Invalid ID token response: {}", resp.body());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token");
            }

            JsonNode node = mapper.readTree(resp.body());
            String email = node.path("email").asText(null);
            boolean emailVerified = node.path("email_verified").asBoolean(false);
            String name = node.path("name").asText(null);

            if (email == null || !emailVerified) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unverified or missing email");
            }

                // Try to find employee in DB; if not present, create one (auto-register)
            Optional<Employee> optEmp = employeeRepository.findByEmailIgnoreCase(email);
            Employee emp;
            if (optEmp.isPresent()) {
                emp = optEmp.get();
            } else {
                // create a new employee record
                String createName = name != null ? name : email.split("@")[0];
                emp = new Employee(createName, email);
                emp = employeeRepository.save(emp);
                log.info("Created new employee for email={}", email);
            }

            Map<String, Object> user = new HashMap<>();
            user.put("id", emp.getId());
            user.put("name", emp.getName());
            user.put("email", emp.getEmail());

            String token = "demo-token-" + emp.getId() + "-" + Instant.now().toEpochMilli();

            return ResponseEntity.ok(new AuthResponse(user, token));

        } catch (IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Token validation failed");
        }
    }
}
