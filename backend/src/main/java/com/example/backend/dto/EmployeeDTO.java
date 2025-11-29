package com.example.backend.dto;

/**
 * Data Transfer Object for Employee
 * Used to transfer employee data between backend and frontend
 */
public class EmployeeDTO {
    public int id;
    public String name;
    public String email;
    
    public EmployeeDTO(int id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    public EmployeeDTO() {}
    
    // Getters
    public int getId() {
        return id;
    }
    
    public String getName() {
        return name;
    }
    
    public String getEmail() {
        return email;
    }
    
    // Setters
    public void setId(int id) {
        this.id = id;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    @Override
    public String toString() {
        return "EmployeeDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
