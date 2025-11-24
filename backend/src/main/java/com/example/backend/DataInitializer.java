package com.example.backend;

import com.example.backend.model.Employee;
import com.example.backend.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(EmployeeRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Employee("Alice Johnson", "alice@example.com"));
                repo.save(new Employee("Bob Smith", "bob@example.com"));
            }
        };
    }
}
