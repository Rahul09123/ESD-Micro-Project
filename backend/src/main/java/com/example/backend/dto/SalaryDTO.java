package com.example.backend.dto;

/**
 * Data Transfer Object for Salary
 * Used to transfer salary history data between backend and frontend
 */
public class SalaryDTO {
    public String month;
    public double amount;
    public String paidOn;
    
    public SalaryDTO(String month, double amount, String paidOn) {
        this.month = month;
        this.amount = amount;
        this.paidOn = paidOn;
    }
    
    public SalaryDTO() {}
    
    // Getters
    public String getMonth() {
        return month;
    }
    
    public double getAmount() {
        return amount;
    }
    
    public String getPaidOn() {
        return paidOn;
    }
    
    // Setters
    public void setMonth(String month) {
        this.month = month;
    }
    
    public void setAmount(double amount) {
        this.amount = amount;
    }
    
    public void setPaidOn(String paidOn) {
        this.paidOn = paidOn;
    }
    
    @Override
    public String toString() {
        return "SalaryDTO{" +
                "month='" + month + '\'' +
                ", amount=" + amount +
                ", paidOn='" + paidOn + '\'' +
                '}';
    }
}
