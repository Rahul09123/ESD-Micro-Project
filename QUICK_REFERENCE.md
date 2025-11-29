# Quick Reference - Data Fetching Flow

## Visual Flow Diagram

```
USER CLICKS LOGIN
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: React Component (SalaryHistory.tsx)                 │
│ ────────────────────────────────────────────────────────    │
│ useEffect(() => {                                           │
│   salaryService.getSalaryHistory(user.id)  ← Calls service  │
│ })                                                           │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Service Layer (salary.ts)                           │
│ ────────────────────────────────────────────────────────    │
│ export async function getSalaryHistory(employeeId) {        │
│   const salaryData = await getSalaryHistoryFromApi(id)      │
│   return salaryData.map(d => ({...}))  ← Format data        │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: API Controller (employeeController.ts)              │
│ ────────────────────────────────────────────────────────    │
│ export async function getSalaryHistoryFromApi(id) {         │
│   const path = `/api/employees/${id}/salary`                │
│   return apiFetch<SalaryRecord[]>(path)  ← Make HTTP call   │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: API Config (apiConfig.ts)                           │
│ ────────────────────────────────────────────────────────    │
│ async function apiFetch<T>(path, options) {                 │
│   const url = `http://localhost:8080${path}`                │
│   const response = await fetch(url, { headers })            │
│   return response.json()  ← HTTP GET Request                │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
        ↓
   ╔═══════════════════════════════════════════════════════════╗
   ║  HTTP GET http://localhost:8080/api/employees/1/salary   ║
   ╚═══════════════════════════════════════════════════════════╝
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Backend Controller (EmployeeController.java)        │
│ ────────────────────────────────────────────────────────    │
│ @GetMapping("/employees/{id}/salary")                       │
│ public ResponseEntity<?> getSalaryHistory(@PathVariable id) {│
│   return ResponseEntity.ok(                                 │
│     employeeService.getEmployeeSalaryHistory(id)            │
│   )  ← Call service                                         │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Backend Service (EmployeeService.java)              │
│ ────────────────────────────────────────────────────────    │
│ public List<SalaryDTO> getEmployeeSalaryHistory(int id) {   │
│   List<EmployeeSalary> salaries =                           │
│     employeeSalaryRepository                                │
│       .findByEmployeeIdOrderByMonthDesc(id)  ← Query DB     │
│   return salaries.stream()                                  │
│     .map(s -> new SalaryDTO(...))  ← Convert to DTO         │
│     .toList()                                               │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Database Query                                      │
│ ────────────────────────────────────────────────────────    │
│ SELECT * FROM employee_salaries                             │
│ WHERE employee_id = 1                                       │
│ ORDER BY month DESC                                         │
│                                                             │
│ Result:                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ id │ employee_id │ month    │ amount  │ payment_date    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 1  │ 1           │ 2025-11  │ 5000.00 │ 2025-11-25      │ │
│ │ 2  │ 1           │ 2025-10  │ 5000.00 │ 2025-10-25      │ │
│ │ 3  │ 1           │ 2025-09  │ 4900.00 │ 2025-09-25      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Convert to DTO                                      │
│ ────────────────────────────────────────────────────────    │
│ new SalaryDTO(                                              │
│   month = "2025-11",                                        │
│   amount = 5000.0,                                          │
│   paidOn = "2025-11-25"                                     │
│ )                                                           │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Return JSON Response                                │
│ ────────────────────────────────────────────────────────    │
│ HTTP 200 OK                                                 │
│ Content-Type: application/json                              │
│                                                             │
│ [                                                           │
│   {                                                         │
│     "month": "2025-11",                                     │
│     "amount": 5000.0,                                       │
│     "paidOn": "2025-11-25"                                  │
│   },                                                        │
│   {                                                         │
│     "month": "2025-10",                                     │
│     "amount": 5000.0,                                       │
│     "paidOn": "2025-10-25"                                  │
│   }                                                         │
│ ]                                                           │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Frontend Receives Response                         │
│ ────────────────────────────────────────────────────────    │
│ const response = await fetch(url)                           │
│ const data = await response.json()  ← Parse JSON            │
│ return data  ← Return to service                            │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 11: Update Component State                             │
│ ────────────────────────────────────────────────────────    │
│ salaryService.getSalaryHistory(1)                           │
│   .then(r => setRecords(r))  ← Update state with data       │
│   .finally(() => setLoading(false))  ← Stop loading         │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 12: React Re-renders Component                         │
│ ────────────────────────────────────────────────────────    │
│ Component displays salary cards:                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Month: 2025-11                                          │ │
│ │ Amount: $5000.00                                        │ │
│ │ Paid on: 2025-11-25                                     │ │
│ │ [Download Slip]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Month: 2025-10                                          │ │
│ │ Amount: $5000.00                                        │ │
│ │ Paid on: 2025-10-25                                     │ │
│ │ [Download Slip]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Snippets at Each Step

### Step 1: Component
```typescript
// src/components/SalaryHistory.tsx
useEffect(() => {
  setLoading(true)
  salaryService.getSalaryHistory(user.id!).then(r => setRecords(r)).finally(()=>setLoading(false))
}, [user.id])
```

### Step 2: Service
```typescript
// src/services/salary.ts
export async function getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
  const salaryData = await getSalaryHistoryFromApi(employeeId)
  return salaryData.map(d => ({ month: d.month, amount: d.amount, paidOn: d.paidOn }))
}
```

### Step 3: API Controller
```typescript
// src/api/employeeController.ts
export async function getSalaryHistoryFromApi(employeeId: number): Promise<SalaryRecord[]> {
  const path = API_CONFIG.ENDPOINTS.SALARY_HISTORY(employeeId)  // "/api/employees/1/salary"
  return apiFetch<SalaryRecord[]>(path)
}
```

### Step 4: API Config
```typescript
// src/api/apiConfig.ts
async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
  const baseUrl = options?.baseUrl || API_CONFIG.BASE_URL  // "http://localhost:8080"
  const url = `${baseUrl}${path}`  // "http://localhost:8080/api/employees/1/salary"
  const response = await fetch(url, { headers })
  return (await response.json()) as T
}
```

### Step 5: Backend Controller
```java
// backend/src/main/java/com/example/backend/controller/EmployeeController.java
@GetMapping("/employees/{id}/salary")
public ResponseEntity<?> getSalaryHistory(@PathVariable int id) {
    return ResponseEntity.ok(employeeService.getEmployeeSalaryHistory(id));
}
```

### Step 6: Backend Service
```java
// backend/src/main/java/com/example/backend/service/EmployeeService.java
public List<SalaryDTO> getEmployeeSalaryHistory(int id) {
    List<EmployeeSalary> salaries = employeeSalaryRepository.findByEmployeeIdOrderByMonthDesc((long) id);
    return salaries.stream()
            .map(s -> new SalaryDTO(s.getMonth(), s.getAmount().doubleValue(), 
                s.getPaymentDate() != null ? s.getPaymentDate().toString() : s.getMonth() + "-25"))
            .toList();
}
```

### Step 7: Database Query
```sql
SELECT * FROM employee_salaries 
WHERE employee_id = 1 
ORDER BY month DESC
```

### Step 8: DTO Conversion
```java
// backend/src/main/java/com/example/backend/service/EmployeeService.java
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

---

## Key Points to Remember

| Layer | File | Purpose |
|-------|------|---------|
| **Component** | `SalaryHistory.tsx` | Displays UI and triggers data fetch |
| **Service** | `salary.ts` | Business logic and data transformation |
| **API Controller** | `employeeController.ts` | Constructs API paths and calls fetch |
| **API Config** | `apiConfig.ts` | HTTP request handling and configuration |
| **Backend Controller** | `EmployeeController.java` | Receives HTTP request and routes to service |
| **Backend Service** | `EmployeeService.java` | Business logic and database queries |
| **Repository** | `EmployeeSalaryRepository.java` | Database access |
| **Database** | `employee_salaries` table | Stores salary data |

---

## Common Questions

### Q: How does the employee ID get passed through all layers?
**A**: It's passed as a parameter through each function call:
```
Component → Service → API Controller → API Config → HTTP Request → Backend Controller → Service → Repository → Database
```

### Q: Where is the HTTP request actually made?
**A**: In `apiConfig.ts` using the native `fetch()` API:
```typescript
const response = await fetch(url, { headers })
```

### Q: How does the backend know which endpoint to call?
**A**: The HTTP method and path tell Spring Boot:
- `GET /api/employees/{id}/salary` matches `@GetMapping("/employees/{id}/salary")`
- Spring automatically routes to the correct controller method

### Q: What is a DTO?
**A**: Data Transfer Object - converts database entities to JSON-friendly format:
- Database: `EmployeeSalary` (with all fields)
- DTO: `SalaryDTO` (only needed fields)
- JSON: `{ month, amount, paidOn }`

### Q: Why do we need all these layers?
**A**: 
- **Separation of concerns** - each layer has one responsibility
- **Reusability** - API functions can be used by multiple components
- **Testability** - each layer can be tested independently
- **Maintainability** - easier to change one layer without affecting others

---

## Testing the Flow

### 1. Browser DevTools
```
F12 → Network tab → Filter by XHR
Look for: GET /api/employees/1/salary
```

### 2. Postman
```
Method: GET
URL: http://localhost:8080/api/employees/1/salary
Expected: 200 OK with JSON array
```

### 3. Backend Logs
```
Spring Boot console will show:
GET /api/employees/1/salary
```

### 4. Browser Console
```
F12 → Console tab
Look for any fetch errors or logs
```

---

## Summary

The data fetching follows a **clean, layered architecture**:

1. **Frontend** initiates request through UI
2. **Service** handles business logic
3. **API Controller** constructs HTTP request
4. **API Config** makes the actual HTTP call
5. **Backend** receives and processes request
6. **Database** returns data
7. **Backend** converts to DTO and returns JSON
8. **Frontend** receives JSON and updates UI

This design ensures **maintainability**, **testability**, and **scalability**!
