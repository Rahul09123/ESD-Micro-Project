package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EmployeeController {

    static class EmployeeDTO {
        public int id;
        public String name;
        public String email;

        public EmployeeDTO(int id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }
    }

    static class SalaryDTO {
        public String month;
        public double amount;
        public String paidOn;

        public SalaryDTO(String month, double amount, String paidOn) {
            this.month = month;
            this.amount = amount;
            this.paidOn = paidOn;
        }
    }

    // Mock DB
    private static final List<EmployeeDTO> EMPLOYEES = Arrays.asList(
            new EmployeeDTO(1, "Alice Johnson", "alice@example.com"),
            new EmployeeDTO(2, "Bob Smith", "bob@example.com")
    );

    private static final Map<Integer, List<SalaryDTO>> SALARY = new HashMap<>();

    static {
        SALARY.put(1, Arrays.asList(
                new SalaryDTO("2025-11", 5000, "2025-11-25"),
                new SalaryDTO("2025-10", 5000, "2025-10-25"),
                new SalaryDTO("2025-09", 4800, "2025-09-25")
        ));
        SALARY.put(2, Arrays.asList(
                new SalaryDTO("2025-11", 4500, "2025-11-25"),
                new SalaryDTO("2025-10", 4500, "2025-10-25"),
                new SalaryDTO("2025-09", 4400, "2025-09-25")
        ));
    }

    @GetMapping("/employees")
    public ResponseEntity<?> findByEmail(@RequestParam String email) {
        return ResponseEntity.ok(EMPLOYEES.stream().filter(e -> e.email.equalsIgnoreCase(email)).findFirst().orElse(null));
    }

    @GetMapping("/employees/{id}/salary")
    public ResponseEntity<?> salary(@PathVariable int id) {
        List<SalaryDTO> s = SALARY.getOrDefault(id, Collections.emptyList());
        return ResponseEntity.ok(s);
    }
}
