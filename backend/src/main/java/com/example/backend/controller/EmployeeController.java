package com.example.backend.controller;

import com.example.backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/employees")
    public ResponseEntity<?> findByEmail(@RequestParam String email) {
        return employeeService.findEmployeeByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(null));
    }

    @GetMapping("/employees/{id}/salary")
    public ResponseEntity<?> getSalaryHistory(@PathVariable int id) {
        return ResponseEntity.ok(employeeService.getEmployeeSalaryHistory(id));
    }
}
