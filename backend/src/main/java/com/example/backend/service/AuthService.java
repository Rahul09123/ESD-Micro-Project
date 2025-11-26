package com.example.backend.service;

import com.example.backend.model.Employee;
import com.example.backend.repository.EmployeeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final EmployeeRepository employeeRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public AuthService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public static class AuthResult {
        public Map<String, Object> user;
        public String token;
        public boolean registered;

        public AuthResult(Map<String, Object> user, String token, boolean registered) {
            this.user = user;
            this.token = token;
            this.registered = registered;
        }
    }

    /**
     * Validate Google ID token using Google's tokeninfo endpoint, ensure email verified,
     * find or create Employee record, and return an AuthResult containing user info and token.
     */
    public AuthResult loginWithGoogle(String idToken) throws IOException, InterruptedException, IllegalArgumentException {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Missing idToken");
        }

        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
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
            throw new IllegalArgumentException("Invalid ID token");
        }

        JsonNode node = mapper.readTree(resp.body());
        String email = node.path("email").asText(null);
        boolean emailVerified = node.path("email_verified").asBoolean(false);
        String name = node.path("name").asText(null);

        if (email == null || !emailVerified) {
            throw new IllegalArgumentException("Unverified or missing email");
        }

        Optional<Employee> optEmp = employeeRepository.findByEmailIgnoreCase(email);
        Map<String, Object> user = new HashMap<>();
        boolean registered = false;
        String token;

        if (optEmp.isPresent()) {
            Employee emp = optEmp.get();
            user.put("id", emp.getId());
            user.put("name", emp.getName());
            user.put("email", emp.getEmail());
            registered = true;
            token = "demo-token-" + emp.getId() + "-" + Instant.now().toEpochMilli();
        } else {
            // Do NOT auto-create employee here. Return basic profile and indicate not registered.
            String displayName = name != null ? name : email.split("@")[0];
            user.put("name", displayName);
            user.put("email", email);
            registered = false;
            token = "demo-token-guest-" + Instant.now().toEpochMilli();
            log.info("Google-authenticated email not found in employees table: {}", email);
        }

        return new AuthResult(user, token, registered);
    }
}
