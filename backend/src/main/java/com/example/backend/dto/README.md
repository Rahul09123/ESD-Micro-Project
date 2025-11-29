# DTO (Data Transfer Object) Package

This package contains all Data Transfer Objects used to transfer data between the backend API and frontend clients.

## Purpose

DTOs serve as a bridge between:
- **Database Entities** (JPA models with all internal fields)
- **Frontend Clients** (only need specific fields)

### Benefits

✅ **Security** - Don't expose internal database structure  
✅ **Performance** - Smaller JSON payloads  
✅ **Flexibility** - Change database schema without affecting API  
✅ **Type Safety** - Clear contract between backend and frontend  
✅ **Separation of Concerns** - API contract is independent of database model  

---

## DTOs in This Package

### 1. EmployeeDTO

**Purpose**: Transfer employee information to frontend

**Fields**:
- `id: int` - Employee unique identifier
- `name: String` - Employee full name
- `email: String` - Employee email address

**Used By**:
- `GET /api/employees?email={email}` - Login endpoint
- Frontend login service

**Example**:
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com"
}
```

**Corresponding Entity**: `Employee.java`

---

### 2. SalaryDTO

**Purpose**: Transfer salary history records to frontend

**Fields**:
- `month: String` - Salary month in YYYY-MM format
- `amount: double` - Salary amount
- `paidOn: String` - Payment date in YYYY-MM-DD format

**Used By**:
- `GET /api/employees/{id}/salary` - Salary history endpoint
- Frontend salary service

**Example**:
```json
[
  {
    "month": "2025-11",
    "amount": 5000.0,
    "paidOn": "2025-11-25"
  },
  {
    "month": "2025-10",
    "amount": 5000.0,
    "paidOn": "2025-10-25"
  }
]
```

**Corresponding Entity**: `EmployeeSalary.java`

---

## Entity vs DTO Comparison

### Employee Entity
```java
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    // Only these 3 fields are exposed via DTO
}
```

### EmployeeDTO
```java
public class EmployeeDTO {
    public int id;
    public String name;
    public String email;
    
    // Only necessary fields for frontend
    // No JPA annotations
    // No database-specific logic
}
```

---

### EmployeeSalary Entity
```java
@Entity
@Table(name = "employee_salaries")
public class EmployeeSalary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;
    
    @Column(nullable = false, length = 7)
    private String month;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column(name = "payment_date")
    private LocalDate paymentDate;
    
    @Column(name = "paid_on")
    private LocalDate paidOn;
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    // Many fields, but only 3 exposed via DTO
}
```

### SalaryDTO
```java
public class SalaryDTO {
    public String month;
    public double amount;
    public String paidOn;
    
    // Only 3 fields needed by frontend
    // BigDecimal converted to double
    // LocalDate converted to String
}
```

---

## Data Transformation Flow

### Employee Login Flow
```
Database Entity (Employee)
    ↓ (has: id, name, email, + internal fields)
Service Layer
    ↓ (maps to DTO)
EmployeeDTO
    ↓ (has: id, name, email only)
JSON Response
    ↓
Frontend receives clean data
```

### Salary History Flow
```
Database Entities (List<EmployeeSalary>)
    ↓ (has: id, employeeId, month, amount, paymentDate, paidOn, createdAt)
Service Layer
    ↓ (maps each entity to DTO)
List<SalaryDTO>
    ↓ (has: month, amount, paidOn only)
JSON Response
    ↓
Frontend receives clean data
```

---

## How to Create a New DTO

### Step 1: Create DTO Class
```java
package com.example.backend.dto;

public class MyDTO {
    public String field1;
    public int field2;
    
    public MyDTO(String field1, int field2) {
        this.field1 = field1;
        this.field2 = field2;
    }
    
    public MyDTO() {}
    
    // Add getters and setters
    public String getField1() { return field1; }
    public void setField1(String field1) { this.field1 = field1; }
    
    public int getField2() { return field2; }
    public void setField2(int field2) { this.field2 = field2; }
}
```

### Step 2: Use in Service
```java
public List<MyDTO> getMyData() {
    List<MyEntity> entities = repository.findAll();
    return entities.stream()
        .map(e -> new MyDTO(e.getField1(), e.getField2()))
        .toList();
}
```

### Step 3: Return from Controller
```java
@GetMapping("/my-endpoint")
public ResponseEntity<?> getMyData() {
    return ResponseEntity.ok(service.getMyData());
}
```

---

## Best Practices

### ✅ DO

- **Keep DTOs simple** - Only include fields needed by frontend
- **Use clear field names** - Match frontend expectations
- **Add documentation** - Explain what each DTO is used for
- **Include constructors** - Both parameterized and no-arg
- **Add getters/setters** - For JSON serialization
- **Convert types as needed** - BigDecimal → double, LocalDate → String
- **Create separate DTOs** - For different API responses

### ❌ DON'T

- **Don't expose internal IDs** - Hide database-specific fields
- **Don't include JPA annotations** - DTOs are plain Java classes
- **Don't expose sensitive data** - Filter passwords, tokens, etc.
- **Don't make DTOs too complex** - Keep them lightweight
- **Don't reuse entity classes** - Always create separate DTOs
- **Don't include business logic** - DTOs are data containers only

---

## Testing DTOs

### Unit Test Example
```java
@Test
public void testEmployeeDTOCreation() {
    EmployeeDTO dto = new EmployeeDTO(1, "Alice", "alice@example.com");
    
    assertEquals(1, dto.getId());
    assertEquals("Alice", dto.getName());
    assertEquals("alice@example.com", dto.getEmail());
}
```

### Integration Test Example
```java
@Test
public void testEmployeeDTOSerialization() {
    EmployeeDTO dto = new EmployeeDTO(1, "Alice", "alice@example.com");
    String json = objectMapper.writeValueAsString(dto);
    
    assertTrue(json.contains("\"id\":1"));
    assertTrue(json.contains("\"name\":\"Alice\""));
}
```

---

## Related Files

- **Service**: `src/main/java/com/example/backend/service/EmployeeService.java`
- **Controller**: `src/main/java/com/example/backend/controller/EmployeeController.java`
- **Entities**: `src/main/java/com/example/backend/model/`
- **Frontend Types**: `src/api/employeeController.ts`

---

## Summary

DTOs are essential for:
1. **API Contract** - Define what data is sent to frontend
2. **Security** - Hide internal database structure
3. **Performance** - Reduce JSON payload size
4. **Flexibility** - Change database without affecting API
5. **Type Safety** - Clear data structure for frontend

Always create DTOs for API responses instead of exposing entities directly!
