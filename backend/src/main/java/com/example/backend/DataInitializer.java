package com.example.backend;

import com.example.backend.model.Employee;
import com.example.backend.model.EmployeeSalary;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.EmployeeSalaryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(EmployeeRepository employeeRepo, EmployeeSalaryRepository salaryRepo) {
        return args -> {
            // Initialize employees
            if (employeeRepo.count() == 0) {
                employeeRepo.save(new Employee("Alice Johnson", "alice@example.com"));
                employeeRepo.save(new Employee("Bob Smith", "bob@example.com"));
                employeeRepo.save(new Employee("Rahul Raman", "rahulraman2603@gmail.com"));
            }
            
            // Initialize salary data
            if (salaryRepo.count() == 0) {
                // Employee 1 (Alice Johnson)
                salaryRepo.save(new EmployeeSalary(1L, "2025-11", new BigDecimal("5000.00"), LocalDate.of(2025, 11, 25)));
                salaryRepo.save(new EmployeeSalary(1L, "2025-10", new BigDecimal("5000.00"), LocalDate.of(2025, 10, 25)));
                salaryRepo.save(new EmployeeSalary(1L, "2025-09", new BigDecimal("4800.00"), LocalDate.of(2025, 9, 25)));
                salaryRepo.save(new EmployeeSalary(1L, "2025-08", new BigDecimal("4800.00"), LocalDate.of(2025, 8, 25)));
                salaryRepo.save(new EmployeeSalary(1L, "2025-07", new BigDecimal("4700.00"), LocalDate.of(2025, 7, 25)));
                salaryRepo.save(new EmployeeSalary(1L, "2025-06", new BigDecimal("4700.00"), LocalDate.of(2025, 6, 25)));
                
                // Employee 2 (Bob Smith)
                salaryRepo.save(new EmployeeSalary(2L, "2025-11", new BigDecimal("4500.00"), LocalDate.of(2025, 11, 25)));
                salaryRepo.save(new EmployeeSalary(2L, "2025-10", new BigDecimal("4500.00"), LocalDate.of(2025, 10, 25)));
                salaryRepo.save(new EmployeeSalary(2L, "2025-09", new BigDecimal("4400.00"), LocalDate.of(2025, 9, 25)));
            }
        };
    }
}
