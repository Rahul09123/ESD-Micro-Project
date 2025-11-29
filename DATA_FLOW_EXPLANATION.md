# Frontend to Backend Data Flow - Complete Explanation

## Overview
This document explains how data flows from the React frontend to the Spring Boot backend when fetching salary information.

---

## Step-by-Step Data Flow

### **Step 1: React Component Triggers Data Fetch**

**File**: `src/components/SalaryHistory.tsx` (Lines 13-17)

```typescript
useEffect(() => {
  setLoading(true)
  // user.id is guaranteed when this component is rendered
  salaryService.getSalaryHistory(user.id!).then(r => setRecords(r)).finally(()=>setLoading(false))
}, [user.id])
```

**What happens**:
- When the `SalaryHistory` component mounts, the `useEffect` hook runs
- It calls `salaryService.getSalaryHistory(user.id)` with the employee ID
- Sets `loading = true` to show loading state
- When data arrives, it updates `records` state
- Finally, sets `loading = false`

**Example**: If user.id = 1, it calls `getSalaryHistory(1)`

---

### **Step 2: Service Layer Processes Request**

**File**: `src/services/salary.ts` (Lines 11-24)

```typescript
export async function getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
  try {
    const salaryData = await getSalaryHistoryFromApi(employeeId)
    // Map API response to internal shape
    return salaryData.map(d => ({
      month: d.month,
      amount: d.amount,
      paidOn: d.paidOn,
    }))
  } catch (error) {
    console.error('Error fetching salary history:', error)
    throw error
  }
}
```

**What happens**:
- Receives employee ID (1)
- Calls `getSalaryHistoryFromApi(1)` from the API controller
- Maps the response to ensure correct data shape
- Handles errors and logs them
- Returns the formatted salary array

**Data at this point**: 
```javascript
[
  { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
  { month: '2025-10', amount: 5000, paidOn: '2025-10-25' }
]
```

---

### **Step 3: API Controller Makes HTTP Request**

**File**: `src/api/employeeController.ts` (Lines 41-47)

```typescript
export async function getSalaryHistoryFromApi(
  employeeId: number,
  options?: FetchOptions
): Promise<SalaryRecord[]> {
  const path = API_CONFIG.ENDPOINTS.SALARY_HISTORY(employeeId)
  return apiFetch<SalaryRecord[]>(path, options)
}
```

**What happens**:
- Receives employee ID (1)
- Constructs the API path using `API_CONFIG.ENDPOINTS.SALARY_HISTORY(1)`
- This generates: `/api/employees/1/salary`
- Calls `apiFetch()` to make the HTTP request

---

### **Step 4: API Configuration & HTTP Request**

**File**: `src/api/apiConfig.ts` (Lines 6-12 and 22-56)

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  ENDPOINTS: {
    EMPLOYEES: '/api/employees',
    SALARY_HISTORY: (employeeId: number) => `/api/employees/${employeeId}/salary`,
  },
}
```

**HTTP Request Details**:
```
Method: GET
URL: http://localhost:8080/api/employees/1/salary
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}' (if available)
}
```

**What happens in `apiFetch()`**:
1. Constructs full URL: `http://localhost:8080` + `/api/employees/1/salary`
2. Sets headers with auth token if available
3. Makes `fetch()` call to the backend
4. Checks if response is OK (status 200-299)
5. Parses JSON response
6. Returns typed data

---

### **Step 5: Backend Controller Receives Request**

**File**: `backend/src/main/java/com/example/backend/controller/EmployeeController.java` (Lines 25-28)

```java
@GetMapping("/employees/{id}/salary")
public ResponseEntity<?> getSalaryHistory(@PathVariable int id) {
    return ResponseEntity.ok(employeeService.getEmployeeSalaryHistory(id));
}
```

**What happens**:
- Spring Boot receives GET request at `/api/employees/1/salary`
- `@PathVariable int id` extracts `1` from the URL
- Calls `employeeService.getEmployeeSalaryHistory(1)`
- Returns the result wrapped in `ResponseEntity.ok()`

**Annotations explained**:
- `@GetMapping("/employees/{id}/salary")` - Maps GET requests to this path
- `@PathVariable int id` - Extracts the `{id}` from URL (1)
- `ResponseEntity.ok()` - Returns HTTP 200 with the data

---

### **Step 6: Service Layer Queries Database**

**File**: `backend/src/main/java/com/example/backend/service/EmployeeService.java` (Lines 28-34)

```java
public List<SalaryDTO> getEmployeeSalaryHistory(int id) {
    List<EmployeeSalary> salaries = employeeSalaryRepository.findByEmployeeIdOrderByMonthDesc((long) id);
    return salaries.stream()
            .map(s -> new SalaryDTO(s.getMonth(), s.getAmount().doubleValue(), 
                s.getPaymentDate() != null ? s.getPaymentDate().toString() : s.getMonth() + "-25"))
            .toList();
}
```

**What happens**:
1. Calls repository method: `findByEmployeeIdOrderByMonthDesc(1L)`
2. This queries the database:
   ```sql
   SELECT * FROM employee_salaries 
   WHERE employee_id = 1 
   ORDER BY month DESC
   ```
3. Gets list of `EmployeeSalary` objects from database
4. Converts each to `SalaryDTO` using `.map()`
5. Returns list of DTOs

**Database Query Result**:
```
EmployeeSalary(id=1, employeeId=1, month='2025-11', amount=5000.00, paymentDate=2025-11-25)
EmployeeSalary(id=2, employeeId=1, month='2025-10', amount=5000.00, paymentDate=2025-10-25)
```

---

### **Step 7: Convert to DTO (Data Transfer Object)**

**File**: `backend/src/main/java/com/example/backend/service/EmployeeService.java` (Lines 49-59)

```java
public static class SalaryDTO {
    public String month;
    public double amount;
    public String paidOn;
    
    public SalaryDTO(String month, double amount, String paidOn) {
        this.month = month;
        this.amount = amount;
        this.paidOn = paidOn;
    }
}
```

**What happens**:
- Each `EmployeeSalary` entity is converted to `SalaryDTO`
- Only exposes necessary fields to frontend
- Converts `BigDecimal` to `double` for JSON
- Converts `LocalDate` to `String`

**DTO Data**:
```java
SalaryDTO(month='2025-11', amount=5000.0, paidOn='2025-11-25')
SalaryDTO(month='2025-10', amount=5000.0, paidOn='2025-10-25')
```

---

### **Step 8: Backend Returns JSON Response**

**HTTP Response**:
```
Status: 200 OK
Content-Type: application/json

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

---

### **Step 9: Frontend Receives & Processes Response**

**Back in `src/api/apiConfig.ts`**:
```typescript
const response = await fetch(url, { headers })
if (!response.ok) {
  throw new Error(`API Error ${response.status}: ${errorText}`)
}
return (await response.json()) as T
```

**What happens**:
- `fetch()` completes
- Response is checked (status 200 = OK)
- JSON is parsed
- Data is returned to `employeeController.ts`

---

### **Step 10: Data Returns to Component**

**Back in `src/components/SalaryHistory.tsx`**:
```typescript
salaryService.getSalaryHistory(user.id!).then(r => setRecords(r))
```

**What happens**:
- Promise resolves with salary data
- `setRecords(r)` updates component state
- React re-renders with salary cards
- User sees the salary history displayed

---

## Complete Request/Response Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. SalaryHistory.tsx (Component)                                │
│     └─> salaryService.getSalaryHistory(1)                       │
│                                                                   │
│  2. salary.ts (Service)                                          │
│     └─> getSalaryHistoryFromApi(1)                              │
│                                                                   │
│  3. employeeController.ts (API Controller)                       │
│     └─> apiFetch('/api/employees/1/salary')                     │
│                                                                   │
│  4. apiConfig.ts (API Config)                                    │
│     └─> fetch('http://localhost:8080/api/employees/1/salary')   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP GET Request
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (Spring Boot)                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  5. EmployeeController.java                                      │
│     @GetMapping("/employees/{id}/salary")                       │
│     └─> employeeService.getEmployeeSalaryHistory(1)             │
│                                                                   │
│  6. EmployeeService.java                                         │
│     └─> employeeSalaryRepository.findByEmployeeIdOrderByMonthDesc(1)
│                                                                   │
│  7. Database Query                                               │
│     SELECT * FROM employee_salaries WHERE employee_id = 1       │
│     └─> Returns List<EmployeeSalary>                            │
│                                                                   │
│  8. Convert to DTO                                               │
│     └─> List<SalaryDTO>                                          │
│                                                                   │
│  9. Return JSON Response                                         │
│     └─> ResponseEntity.ok(salaryDTOList)                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP 200 Response (JSON)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React) - Response Handling                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  10. Parse JSON Response                                         │
│      └─> [{ month, amount, paidOn }, ...]                       │
│                                                                   │
│  11. Update Component State                                      │
│      └─> setRecords(data)                                        │
│                                                                   │
│  12. Re-render Component                                         │
│      └─> Display salary cards with download buttons             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts Explained

### **1. REST API Endpoint**
```
GET /api/employees/{id}/salary
```
- **GET**: Read operation (no data modification)
- **/api**: API prefix
- **/employees/{id}**: Resource path with ID parameter
- **/salary**: Sub-resource for salary data

### **2. Path Parameter**
```
/api/employees/{id}/salary
                   ↑
            This is the path parameter
```
- `{id}` is a placeholder
- When called with `/api/employees/1/salary`, `id = 1`
- Extracted using `@PathVariable int id`

### **3. DTO (Data Transfer Object)**
- Converts database entities to JSON-friendly format
- Only includes fields needed by frontend
- Handles type conversions (BigDecimal → double, LocalDate → String)

### **4. Repository Pattern**
```java
employeeSalaryRepository.findByEmployeeIdOrderByMonthDesc(1L)
```
- Abstracts database queries
- Method name describes the query
- Returns JPA entities from database

### **5. Async/Await in Frontend**
```typescript
const salaryData = await getSalaryHistoryFromApi(employeeId)
```
- `await` pauses execution until HTTP response arrives
- Non-blocking operation
- Allows UI to remain responsive

---

## Error Handling

### **Frontend Error Handling**
```typescript
try {
  const salaryData = await getSalaryHistoryFromApi(employeeId)
  return salaryData.map(...)
} catch (error) {
  console.error('Error fetching salary history:', error)
  throw error
}
```

### **Backend Error Handling**
```java
return employeeService.findEmployeeByEmail(email)
    .map(ResponseEntity::ok)
    .orElseGet(() -> ResponseEntity.ok(null));
```
- Returns `null` if employee not found
- Frontend handles null gracefully

---

## Data Types at Each Layer

### **Frontend TypeScript**
```typescript
type SalaryRecord = {
  month: string      // "2025-11"
  amount: number     // 5000
  paidOn: string     // "2025-11-25"
}
```

### **Backend Java Entity**
```java
class EmployeeSalary {
  Long id
  Long employeeId
  String month
  BigDecimal amount
  LocalDate paymentDate
}
```

### **Backend DTO**
```java
class SalaryDTO {
  String month
  double amount
  String paidOn
}
```

### **JSON (Over HTTP)**
```json
{
  "month": "2025-11",
  "amount": 5000.0,
  "paidOn": "2025-11-25"
}
```

---

## Summary

The data flow follows a **clean layered architecture**:

1. **Component** initiates request
2. **Service** handles business logic
3. **API Controller** makes HTTP call
4. **API Config** manages endpoints and fetch
5. **Backend Controller** receives request
6. **Backend Service** processes business logic
7. **Repository** queries database
8. **DTO** converts entity to JSON
9. **Response** returns to frontend
10. **Component** displays data

This separation ensures:
- ✅ Easy to test each layer independently
- ✅ Easy to change endpoints without affecting components
- ✅ Type-safe data transfers
- ✅ Proper error handling at each level
- ✅ Reusable API functions
