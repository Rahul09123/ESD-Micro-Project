# Code Walkthrough - Fetching Salary Data

## Real Example: Fetching Salary for Employee ID 1

Let's trace through the actual code with a real example.

---

## 1️⃣ User Sees Salary History Component

**File**: `src/components/SalaryHistory.tsx` (Lines 13-17)

```typescript
export default function SalaryHistory({ user, onLogout }: Props) {
  const [records, setRecords] = useState<SalaryRecord[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    // user.id = 1 (Alice Johnson)
    salaryService.getSalaryHistory(user.id!).then(r => setRecords(r)).finally(()=>setLoading(false))
  }, [user.id])
```

**What happens**:
- Component mounts with `user = { id: 1, name: 'Alice Johnson', email: 'alice@example.com' }`
- `useEffect` runs
- Sets `loading = true` (shows "Loading..." message)
- Calls `salaryService.getSalaryHistory(1)`

---

## 2️⃣ Service Layer Receives Request

**File**: `src/services/salary.ts` (Lines 11-24)

```typescript
export async function getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
  try {
    // employeeId = 1
    const salaryData = await getSalaryHistoryFromApi(employeeId)
    
    // salaryData = [
    //   { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
    //   { month: '2025-10', amount: 5000, paidOn: '2025-10-25' }
    // ]
    
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
- Receives `employeeId = 1`
- Calls `getSalaryHistoryFromApi(1)` from API controller
- Maps response to ensure correct format
- Returns formatted array

---

## 3️⃣ API Controller Constructs Request

**File**: `src/api/employeeController.ts` (Lines 41-47)

```typescript
export async function getSalaryHistoryFromApi(
  employeeId: number,
  options?: FetchOptions
): Promise<SalaryRecord[]> {
  // employeeId = 1
  const path = API_CONFIG.ENDPOINTS.SALARY_HISTORY(employeeId)
  // path = "/api/employees/1/salary"
  
  return apiFetch<SalaryRecord[]>(path, options)
}
```

**What happens**:
- Receives `employeeId = 1`
- Constructs path: `"/api/employees/1/salary"`
- Calls `apiFetch()` to make HTTP request

---

## 4️⃣ API Config Makes HTTP Request

**File**: `src/api/apiConfig.ts` (Lines 6-12 and 22-56)

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  ENDPOINTS: {
    EMPLOYEES: '/api/employees',
    SALARY_HISTORY: (employeeId: number) => `/api/employees/${employeeId}/salary`,
  },
}

async function apiFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  // path = "/api/employees/1/salary"
  const baseUrl = options?.baseUrl || API_CONFIG.BASE_URL
  // baseUrl = "http://localhost:8080"
  
  const url = `${baseUrl}${path}`
  // url = "http://localhost:8080/api/employees/1/salary"
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Get auth token if available
  const token = options?.token || localStorage.getItem('auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, { headers })
    // Makes HTTP GET request to backend
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    return (await response.json()) as T
    // Returns parsed JSON
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error)
    throw error
  }
}
```

**HTTP Request Made**:
```
GET http://localhost:8080/api/employees/1/salary HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer demo-token-1-1732864800000
```

---

## 5️⃣ Backend Controller Receives Request

**File**: `backend/src/main/java/com/example/backend/controller/EmployeeController.java` (Lines 25-28)

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    private final EmployeeService employeeService;
    
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }
    
    @GetMapping("/employees/{id}/salary")
    public ResponseEntity<?> getSalaryHistory(@PathVariable int id) {
        // @PathVariable int id extracts "1" from URL
        // id = 1
        
        return ResponseEntity.ok(employeeService.getEmployeeSalaryHistory(id));
        // Calls service and returns result
    }
}
```

**Annotations Explained**:
- `@RestController` - This class handles REST API requests
- `@RequestMapping("/api")` - All routes start with `/api`
- `@CrossOrigin(origins = "*")` - Allow requests from any origin (frontend)
- `@GetMapping("/employees/{id}/salary")` - Maps GET requests to this method
- `@PathVariable int id` - Extracts `{id}` from URL path

---

## 6️⃣ Backend Service Queries Database

**File**: `backend/src/main/java/com/example/backend/service/EmployeeService.java` (Lines 28-34)

```java
public List<SalaryDTO> getEmployeeSalaryHistory(int id) {
    // id = 1
    
    List<EmployeeSalary> salaries = employeeSalaryRepository.findByEmployeeIdOrderByMonthDesc((long) id);
    // Calls repository method
    // This generates SQL query:
    // SELECT * FROM employee_salaries WHERE employee_id = 1 ORDER BY month DESC
    
    // salaries = [
    //   EmployeeSalary(id=1, employeeId=1, month='2025-11', amount=5000.00, paymentDate=2025-11-25),
    //   EmployeeSalary(id=2, employeeId=1, month='2025-10', amount=5000.00, paymentDate=2025-10-25)
    // ]
    
    return salaries.stream()
            .map(s -> new SalaryDTO(
                s.getMonth(),                                    // "2025-11"
                s.getAmount().doubleValue(),                     // 5000.0
                s.getPaymentDate() != null 
                    ? s.getPaymentDate().toString()              // "2025-11-25"
                    : s.getMonth() + "-25"
            ))
            .toList();
    // Returns: [
    //   SalaryDTO(month='2025-11', amount=5000.0, paidOn='2025-11-25'),
    //   SalaryDTO(month='2025-10', amount=5000.0, paidOn='2025-10-25')
    // ]
}
```

**What happens**:
1. Calls repository method to query database
2. Gets list of `EmployeeSalary` entities
3. Converts each entity to `SalaryDTO`
4. Returns list of DTOs

---

## 7️⃣ Repository Queries Database

**File**: `backend/src/main/java/com/example/backend/repository/EmployeeSalaryRepository.java`

```java
@Repository
public interface EmployeeSalaryRepository extends JpaRepository<EmployeeSalary, Long> {
    List<EmployeeSalary> findByEmployeeIdOrderByMonthDesc(Long employeeId);
    // Spring Data JPA automatically generates SQL from method name:
    // SELECT * FROM employee_salaries WHERE employee_id = ? ORDER BY month DESC
}
```

**Database Query Executed**:
```sql
SELECT * FROM employee_salaries 
WHERE employee_id = 1 
ORDER BY month DESC
```

**Database Result**:
```
+----+-------------+----------+--------+--------------+
| id | employee_id | month    | amount | payment_date |
+----+-------------+----------+--------+--------------+
| 1  | 1           | 2025-11  | 5000   | 2025-11-25   |
| 2  | 1           | 2025-10  | 5000   | 2025-10-25   |
| 3  | 1           | 2025-09  | 4900   | 2025-09-25   |
+----+-------------+----------+--------+--------------+
```

---

## 8️⃣ Convert to DTO

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

**Why DTO?**
- **Entity** (EmployeeSalary): Has all database fields (id, created_at, etc.)
- **DTO** (SalaryDTO): Only has fields needed by frontend (month, amount, paidOn)
- **Security**: Doesn't expose internal database structure
- **Performance**: Smaller JSON payload

---

## 9️⃣ Return JSON Response

**HTTP Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 156

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
  },
  {
    "month": "2025-09",
    "amount": 4900.0,
    "paidOn": "2025-09-25"
  }
]
```

---

## 🔟 Frontend Receives Response

**Back in `src/api/apiConfig.ts`**:

```typescript
const response = await fetch(url, { headers })
// response.status = 200
// response.ok = true

if (!response.ok) {
  throw new Error(`API Error ${response.status}: ${errorText}`)
}

return (await response.json()) as T
// Parses JSON and returns to employeeController.ts
// Returns: [
//   { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
//   { month: '2025-10', amount: 5000, paidOn: '2025-10-25' },
//   { month: '2025-09', amount: 4900, paidOn: '2025-09-25' }
// ]
```

---

## 1️⃣1️⃣ Service Processes Response

**Back in `src/services/salary.ts`**:

```typescript
const salaryData = await getSalaryHistoryFromApi(employeeId)
// salaryData = [
//   { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
//   { month: '2025-10', amount: 5000, paidOn: '2025-10-25' },
//   { month: '2025-09', amount: 4900, paidOn: '2025-09-25' }
// ]

return salaryData.map(d => ({
  month: d.month,
  amount: d.amount,
  paidOn: d.paidOn,
}))
// Returns same data (already in correct format)
```

---

## 1️⃣2️⃣ Component Updates State

**Back in `src/components/SalaryHistory.tsx`**:

```typescript
salaryService.getSalaryHistory(user.id!).then(r => setRecords(r)).finally(()=>setLoading(false))

// Promise resolves with:
// r = [
//   { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
//   { month: '2025-10', amount: 5000, paidOn: '2025-10-25' },
//   { month: '2025-09', amount: 4900, paidOn: '2025-09-25' }
// ]

// setRecords(r) updates state
// setLoading(false) stops loading

// React re-renders component with salary data
```

---

## 1️⃣3️⃣ Component Renders Salary Cards

**Component displays**:
```
┌─────────────────────────────────────────┐
│ Salary History                          │
├─────────────────────────────────────────┤
│                                         │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ 2025-11      │  │ 2025-10      │     │
│ │ $5000.00     │  │ $5000.00     │     │
│ │ Paid: 11-25  │  │ Paid: 10-25  │     │
│ │ [Download]   │  │ [Download]   │     │
│ └──────────────┘  └──────────────┘     │
│                                         │
│ ┌──────────────┐                        │
│ │ 2025-09      │                        │
│ │ $4900.00     │                        │
│ │ Paid: 09-25  │                        │
│ │ [Download]   │                        │
│ └──────────────┘                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## Summary Table

| Step | Layer | Code | Input | Output |
|------|-------|------|-------|--------|
| 1 | Component | `SalaryHistory.tsx` | `user.id = 1` | Calls service |
| 2 | Service | `salary.ts` | `employeeId = 1` | Calls API controller |
| 3 | API Controller | `employeeController.ts` | `employeeId = 1` | Path: `/api/employees/1/salary` |
| 4 | API Config | `apiConfig.ts` | Path | HTTP GET request |
| 5 | Backend Controller | `EmployeeController.java` | HTTP request | Calls service |
| 6 | Backend Service | `EmployeeService.java` | `id = 1` | Calls repository |
| 7 | Repository | `EmployeeSalaryRepository.java` | `employeeId = 1` | SQL query |
| 8 | Database | `employee_salaries` table | SQL query | Rows |
| 9 | Backend Service | `EmployeeService.java` | Rows | List<SalaryDTO> |
| 10 | Backend Controller | `EmployeeController.java` | List<SalaryDTO> | JSON response |
| 11 | API Config | `apiConfig.ts` | JSON | Parsed data |
| 12 | Service | `salary.ts` | Parsed data | Formatted data |
| 13 | Component | `SalaryHistory.tsx` | Formatted data | Salary cards |

---

## Key Takeaways

✅ **Each layer has a single responsibility**
- Component: UI
- Service: Business logic
- API Controller: HTTP routing
- API Config: HTTP communication
- Backend: Database operations

✅ **Data flows through multiple transformations**
- Database Entity → DTO → JSON → Parsed Object → Component State

✅ **Type safety at each step**
- TypeScript on frontend
- Java types on backend
- DTO ensures consistent format

✅ **Error handling at each layer**
- Frontend catches fetch errors
- Backend returns appropriate HTTP status
- Service logs errors for debugging

✅ **Separation of concerns**
- Easy to test each layer
- Easy to change one layer without affecting others
- Easy to reuse API functions
