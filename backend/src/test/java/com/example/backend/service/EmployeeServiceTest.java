package com.example.backend.service;

import com.example.backend.model.EmployeeSalary;
import com.example.backend.repository.EmployeeSalaryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class EmployeeServiceTest {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private EmployeeSalaryRepository employeeSalaryRepository;

    @Test
    public void testGetEmployeeSalaryHistory() {
        // Test fetching salary history for employee 1
        List<EmployeeService.SalaryDTO> salaries = employeeService.getEmployeeSalaryHistory(1);
        
        assertNotNull(salaries, "Salary list should not be null");
        assertFalse(salaries.isEmpty(), "Salary list should not be empty for employee 1");
        
        // Verify the first salary record (should be the most recent month)
        EmployeeService.SalaryDTO firstSalary = salaries.get(0);
        assertNotNull(firstSalary.month, "Month should not be null");
        assertNotNull(firstSalary.paidOn, "Paid on date should not be null");
        assertTrue(firstSalary.amount > 0, "Amount should be greater than 0");
        
        System.out.println("✓ Successfully fetched " + salaries.size() + " salary records for employee 1");
        salaries.forEach(s -> System.out.println("  - Month: " + s.month + ", Amount: $" + s.amount + ", Paid: " + s.paidOn));
    }

    @Test
    public void testEmployeeSalaryRepository() {
        // Direct repository test
        List<EmployeeSalary> salaries = employeeSalaryRepository.findByEmployeeIdOrderByMonthDesc(1L);
        
        assertNotNull(salaries, "Repository should return a list");
        assertFalse(salaries.isEmpty(), "Repository should return salary records");
        
        System.out.println("✓ Repository test passed: Found " + salaries.size() + " records");
    }

    @Test
    public void testEmptyEmployeeSalaryHistory() {
        // Test fetching salary history for non-existent employee
        List<EmployeeService.SalaryDTO> salaries = employeeService.getEmployeeSalaryHistory(999);
        
        assertNotNull(salaries, "Salary list should not be null");
        assertTrue(salaries.isEmpty(), "Salary list should be empty for non-existent employee");
        
        System.out.println("✓ Empty salary history test passed");
    }
}
