package com.example.backend.service;

import com.example.backend.dto.EmployeeDTO;
import com.example.backend.dto.SalaryDTO;
import com.example.backend.model.Employee;
import com.example.backend.model.EmployeeSalary;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.EmployeeSalaryRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Employee Service
 * Handles business logic for employee and salary operations
 */
@Service
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    
    public EmployeeService(EmployeeRepository employeeRepository, EmployeeSalaryRepository employeeSalaryRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeSalaryRepository = employeeSalaryRepository;
    }
    
    /**
     * Find employee by email
     * @param email Employee email address
     * @return Optional containing EmployeeDTO if found
     */
    public Optional<EmployeeDTO> findEmployeeByEmail(String email) {
        return employeeRepository.findByEmailIgnoreCase(email)
                .map(emp -> new EmployeeDTO(emp.getId(), emp.getName(), emp.getEmail()));
    }
    
    /**
     * Get salary history for an employee
     * @param id Employee ID
     * @return List of SalaryDTO objects
     */
    public List<SalaryDTO> getEmployeeSalaryHistory(int id) {
        List<EmployeeSalary> salaries = employeeSalaryRepository.findByEmployeeIdOrderByMonthDesc((long) id);
        return salaries.stream()
                .map(s -> new SalaryDTO(s.getMonth(), s.getAmount().doubleValue(), 
                    s.getPaymentDate() != null ? s.getPaymentDate().toString() : s.getMonth() + "-25"))
                .toList();
    }
}
