# Backend Project Structure

## Directory Organization

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/backend/
│   │   │       ├── BackendApplication.java          [Main Spring Boot App]
│   │   │       ├── DataInitializer.java             [Initialize sample data]
│   │   │       │
│   │   │       ├── controller/
│   │   │       │   └── EmployeeController.java      [REST API endpoints]
│   │   │       │
│   │   │       ├── service/
│   │   │       │   └── EmployeeService.java         [Business logic]
│   │   │       │
│   │   │       ├── repository/
│   │   │       │   ├── EmployeeRepository.java      [Employee DB access]
│   │   │       │   └── EmployeeSalaryRepository.java [Salary DB access]
│   │   │       │
│   │   │       ├── model/
│   │   │       │   ├── Employee.java                [Employee entity]
│   │   │       │   └── EmployeeSalary.java          [Salary entity]
│   │   │       │
│   │   │       └── dto/                             [Data Transfer Objects]
│   │   │           ├── EmployeeDTO.java             [Employee DTO]
│   │   │           ├── SalaryDTO.java               [Salary DTO]
│   │   │           └── README.md                    [DTO documentation]
│   │   │
│   │   └── resources/
│   │       ├── application.properties               [App configuration]
│   │       └── db/
│   │           └── init_employeedb.sql              [Database schema]
│   │
│   └── test/
│       └── java/
│           └── com/example/backend/
│               └── service/
│                   └── EmployeeServiceTest.java     [Service tests]
│
├── pom.xml                                          [Maven dependencies]
└── README.md                                        [Backend documentation]
```

---

## Layer Architecture

### 1. **Controller Layer** (`controller/`)
**Purpose**: Handle HTTP requests and route to services

**Files**:
- `EmployeeController.java` - REST API endpoints

**Endpoints**:
```
GET  /api/employees?email={email}      → Get employee by email
GET  /api/employees/{id}/salary        → Get salary history
```

**Responsibilities**:
- Parse HTTP requests
- Validate path parameters
- Call appropriate service methods
- Return HTTP responses

---

### 2. **Service Layer** (`service/`)
**Purpose**: Implement business logic

**Files**:
- `EmployeeService.java` - Employee and salary operations

**Methods**:
```java
Optional<EmployeeDTO> findEmployeeByEmail(String email)
List<SalaryDTO> getEmployeeSalaryHistory(int id)
```

**Responsibilities**:
- Implement business logic
- Call repository methods
- Transform entities to DTOs
- Handle data validation

---

### 3. **Repository Layer** (`repository/`)
**Purpose**: Database access using Spring Data JPA

**Files**:
- `EmployeeRepository.java` - Employee database operations
- `EmployeeSalaryRepository.java` - Salary database operations

**Methods**:
```java
// EmployeeRepository
Optional<Employee> findByEmailIgnoreCase(String email)

// EmployeeSalaryRepository
List<EmployeeSalary> findByEmployeeIdOrderByMonthDesc(Long employeeId)
```

**Responsibilities**:
- Query database
- Return JPA entities
- Handle database transactions

---

### 4. **Model Layer** (`model/`)
**Purpose**: Define database entities

**Files**:
- `Employee.java` - Employee entity
- `EmployeeSalary.java` - Salary entity

**Annotations**:
```java
@Entity                    // JPA entity
@Table(name = "...")       // Database table mapping
@Id                        // Primary key
@GeneratedValue            // Auto-increment
@Column                    // Column mapping
@ForeignKey                // Foreign key relationship
```

**Responsibilities**:
- Map Java classes to database tables
- Define entity relationships
- Specify column constraints

---

### 5. **DTO Layer** (`dto/`)
**Purpose**: Transfer data between backend and frontend

**Files**:
- `EmployeeDTO.java` - Employee data transfer object
- `SalaryDTO.java` - Salary data transfer object
- `README.md` - DTO documentation

**Responsibilities**:
- Define API response structure
- Transform entities to DTOs
- Hide internal database structure
- Ensure type safety

---

## Data Flow Through Layers

```
┌──────────────────────────────────────────────────────────────┐
│ HTTP Request (Frontend)                                      │
│ GET /api/employees/1/salary                                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Controller Layer                                             │
│ EmployeeController.getSalaryHistory(@PathVariable int id)    │
│ - Parse request                                              │
│ - Extract path parameter (id = 1)                            │
│ - Call service method                                        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Service Layer                                                │
│ EmployeeService.getEmployeeSalaryHistory(int id)             │
│ - Implement business logic                                   │
│ - Call repository method                                     │
│ - Transform entities to DTOs                                 │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Repository Layer                                             │
│ EmployeeSalaryRepository.findByEmployeeIdOrderByMonthDesc()  │
│ - Query database                                             │
│ - Return JPA entities                                        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Database                                                     │
│ SELECT * FROM employee_salaries WHERE employee_id = 1       │
│ ORDER BY month DESC                                          │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Repository Layer (Return)                                    │
│ List<EmployeeSalary> entities                                │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Service Layer (Transform)                                    │
│ entities.stream().map(e -> new SalaryDTO(...)).toList()      │
│ List<SalaryDTO> dtos                                         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Controller Layer (Return)                                    │
│ ResponseEntity.ok(dtos)                                      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ HTTP Response (Frontend)                                     │
│ 200 OK                                                       │
│ [{ month, amount, paidOn }, ...]                             │
└──────────────────────────────────────────────────────────────┘
```

---

## File Responsibilities

| File | Layer | Responsibility |
|------|-------|-----------------|
| `EmployeeController.java` | Controller | Handle HTTP requests |
| `EmployeeService.java` | Service | Business logic |
| `EmployeeRepository.java` | Repository | Employee DB access |
| `EmployeeSalaryRepository.java` | Repository | Salary DB access |
| `Employee.java` | Model | Employee entity |
| `EmployeeSalary.java` | Model | Salary entity |
| `EmployeeDTO.java` | DTO | Employee data transfer |
| `SalaryDTO.java` | DTO | Salary data transfer |

---

## Dependency Injection Flow

```
BackendApplication (Spring Boot)
    ↓
EmployeeController
    ├─ depends on → EmployeeService
    │
EmployeeService
    ├─ depends on → EmployeeRepository
    └─ depends on → EmployeeSalaryRepository
    
EmployeeRepository
    └─ depends on → Employee (entity)
    
EmployeeSalaryRepository
    └─ depends on → EmployeeSalary (entity)
```

---

## Configuration Files

### `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employeedb
spring.datasource.username=rahulraman
spring.datasource.password=shinchan
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080
```

### `init_employeedb.sql`
```sql
CREATE DATABASE IF NOT EXISTS employeedb;
CREATE TABLE IF NOT EXISTS employees (...)
CREATE TABLE IF NOT EXISTS employee_salaries (...)
INSERT INTO employees (...)
INSERT INTO employee_salaries (...)
```

---

## Best Practices Implemented

✅ **Separation of Concerns**
- Each layer has a single responsibility
- Easy to test and maintain

✅ **Dependency Injection**
- Spring manages dependencies
- Loose coupling between layers

✅ **DTO Pattern**
- Hide internal database structure
- Type-safe API contracts

✅ **Repository Pattern**
- Abstract database access
- Easy to switch databases

✅ **Service Layer**
- Centralized business logic
- Reusable across controllers

✅ **Exception Handling**
- Graceful error responses
- Proper HTTP status codes

✅ **Documentation**
- Javadoc comments
- README files
- Clear naming conventions

---

## How to Add a New Feature

### Example: Add a new endpoint to get employee by ID

#### Step 1: Add Repository Method
```java
// EmployeeRepository.java
Optional<Employee> findById(Integer id);  // Already exists in JpaRepository
```

#### Step 2: Add Service Method
```java
// EmployeeService.java
public Optional<EmployeeDTO> findEmployeeById(int id) {
    return employeeRepository.findById(id)
            .map(emp -> new EmployeeDTO(emp.getId(), emp.getName(), emp.getEmail()));
}
```

#### Step 3: Add Controller Endpoint
```java
// EmployeeController.java
@GetMapping("/employees/{id}")
public ResponseEntity<?> getEmployeeById(@PathVariable int id) {
    return employeeService.findEmployeeById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
}
```

#### Step 4: Test the Endpoint
```
GET http://localhost:8080/api/employees/1
Response: { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" }
```

---

## Testing Strategy

### Unit Tests
- Test service methods in isolation
- Mock repositories
- Verify business logic

### Integration Tests
- Test controller endpoints
- Use test database
- Verify full request/response cycle

### Example Test
```java
@SpringBootTest
public class EmployeeServiceTest {
    @Autowired
    private EmployeeService employeeService;
    
    @Test
    public void testGetEmployeeSalaryHistory() {
        List<SalaryDTO> salaries = employeeService.getEmployeeSalaryHistory(1);
        assertNotNull(salaries);
        assertFalse(salaries.isEmpty());
    }
}
```

---

## Summary

The backend follows a **clean, layered architecture**:

1. **Controller** - HTTP handling
2. **Service** - Business logic
3. **Repository** - Database access
4. **Model** - Entity definitions
5. **DTO** - Data transfer

This design ensures:
- ✅ Maintainability
- ✅ Testability
- ✅ Scalability
- ✅ Reusability
- ✅ Security
