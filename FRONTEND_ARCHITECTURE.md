# Frontend Architecture - Data Flow

## Overview
The frontend has been refactored to properly fetch data from the backend using a clean, layered architecture.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  (Login.tsx, SalaryHistory.tsx, AccessDenied.tsx)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  (auth.ts, salary.ts)                                        │
│  - Business logic                                            │
│  - Data transformation                                       │
│  - Error handling                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  (employeeController.ts, apiConfig.ts)                      │
│  - API endpoint definitions                                 │
│  - HTTP request handling                                    │
│  - Authentication token management                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Spring Boot)                   │
│  http://localhost:8080/api                                  │
│  - /employees?email=...                                     │
│  - /employees/{id}/salary                                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Login Flow
```
User enters email
    ↓
Login.tsx calls loginWithGoogle()
    ↓
AuthContext.login() → auth.ts
    ↓
auth.ts calls getEmployeeByEmail()
    ↓
employeeController.ts calls apiFetch()
    ↓
apiConfig.ts makes HTTP GET request
    ↓
Backend: GET /api/employees?email=alice@example.com
    ↓
Returns: { id: 1, name: 'Alice Johnson', email: 'alice@example.com' }
    ↓
User is logged in and redirected to SalaryHistory
```

### 2. Salary History Fetch
```
SalaryHistory component mounts
    ↓
useEffect calls getSalaryHistory(user.id)
    ↓
salary.ts calls getSalaryHistoryFromApi()
    ↓
employeeController.ts calls apiFetch()
    ↓
apiConfig.ts makes HTTP GET request
    ↓
Backend: GET /api/employees/1/salary
    ↓
Returns: [
  { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
  { month: '2025-10', amount: 5000, paidOn: '2025-10-25' },
  ...
]
    ↓
Component displays salary cards with download buttons
```

### 3. Download Salary Slip
```
User clicks "Download Slip" button
    ↓
SalaryHistory.downloadSlip() is called
    ↓
downloadManager.downloadSalarySlip() generates text file
    ↓
Browser downloads: salary-1-2025-11.txt
```

## File Structure

```
src/
├── api/
│   ├── apiConfig.ts           # API configuration and base fetch
│   ├── employeeController.ts  # Employee API operations
│   └── README.md              # API documentation
├── services/
│   ├── auth.ts                # Authentication logic
│   └── salary.ts              # Salary data logic
├── components/
│   ├── Login.tsx              # Login UI
│   ├── SalaryHistory.tsx       # Salary history UI
│   └── AccessDenied.tsx        # Access denied UI
├── contexts/
│   └── AuthContext.tsx         # Auth state management
├── utils/
│   ├── downloadManager.ts      # File download utilities
│   └── util.ts                 # Legacy utilities (deprecated)
└── model/
    └── model.ts                # TypeScript types
```

## API Endpoints

### Employee Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees?email={email}` | Get employee by email |
| GET | `/api/employees/{id}/salary` | Get salary history |

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Key Features

✅ **Centralized API Configuration**
- Single source of truth for API endpoints
- Easy to switch between environments

✅ **Error Handling**
- Comprehensive error logging
- User-friendly error messages
- Graceful error recovery

✅ **Authentication**
- Automatic token management
- Token persistence in localStorage
- Support for custom tokens

✅ **Type Safety**
- Full TypeScript support
- Proper type definitions for all API responses
- Type-safe API calls

✅ **Separation of Concerns**
- Components handle UI only
- Services handle business logic
- API layer handles HTTP communication

## Testing

### Manual Testing with Postman
1. **Get Employee**: `GET http://localhost:8080/api/employees?email=alice@example.com`
2. **Get Salary**: `GET http://localhost:8080/api/employees/1/salary`

### Browser Testing
1. Open DevTools (F12)
2. Go to Network tab
3. Login and observe API calls
4. Check Console for any errors

## Troubleshooting

### CORS Issues
- Ensure backend has `@CrossOrigin(origins = "*")`
- Check backend is running on port 8080

### 404 Errors
- Verify employee exists in database
- Check employee ID is correct

### Empty Salary Data
- Ensure `employee_salaries` table has data
- Check employee_id matches in database

## Future Improvements

- [ ] Add request caching
- [ ] Add retry logic for failed requests
- [ ] Add request timeout handling
- [ ] Add analytics/logging
- [ ] Add request interceptors
- [ ] Implement proper JWT token handling
