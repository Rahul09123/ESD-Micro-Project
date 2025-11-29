# API Layer Documentation

This directory contains the API layer for the Employee ERP application, providing a clean separation between frontend services and backend API calls.

## Structure

### `apiConfig.ts`
- **Purpose**: Centralized API configuration and base fetch wrapper
- **Exports**:
  - `API_CONFIG`: Configuration object with base URL and endpoint definitions
  - `apiFetch<T>()`: Generic fetch wrapper with error handling and auth token support
  - `FetchOptions`: Type for fetch options (baseUrl, token)

### `employeeController.ts`
- **Purpose**: Employee-related API operations
- **Exports**:
  - `getEmployeeByEmail(email, options?)`: Fetch employee by email
  - `getSalaryHistoryFromApi(employeeId, options?)`: Fetch salary history
  - `getSalaryDataForDownload(employeeId, options?)`: Fetch salary data for download

## Usage Examples

### Fetching Employee Data
```typescript
import { getEmployeeByEmail } from '@/api/employeeController'

const employee = await getEmployeeByEmail('alice@example.com')
// Returns: { id: 1, name: 'Alice Johnson', email: 'alice@example.com' }
```

### Fetching Salary History
```typescript
import { getSalaryHistoryFromApi } from '@/api/employeeController'

const salaries = await getSalaryHistoryFromApi(1)
// Returns: [
//   { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
//   { month: '2025-10', amount: 5000, paidOn: '2025-10-25' },
//   ...
// ]
```

### With Custom Options
```typescript
const employee = await getEmployeeByEmail('alice@example.com', {
  baseUrl: 'https://api.example.com',
  token: 'custom-auth-token'
})
```

## Backend Endpoints

### Employee Endpoints
- **GET** `/api/employees?email={email}` - Get employee by email
- **GET** `/api/employees/{id}/salary` - Get salary history for employee

## Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:8080`)

### Example `.env` file
```
VITE_API_BASE_URL=http://localhost:8080
```

## Error Handling

All API calls include error handling:
- Network errors are caught and logged
- HTTP errors (non-2xx status) throw descriptive errors
- Errors are propagated to calling code for handling

## Authentication

- Auth tokens are automatically included from `localStorage.auth_token`
- Custom tokens can be passed via `FetchOptions`
- Tokens are sent in `Authorization: Bearer {token}` header

## Data Types

### EmployeeData
```typescript
{
  id: number
  name: string
  email: string
}
```

### SalaryRecord
```typescript
{
  month: string      // Format: YYYY-MM
  amount: number     // Salary amount
  paidOn: string     // Payment date (YYYY-MM-DD)
}
```

## Integration with Services

The API layer is used by service files:
- `src/services/auth.ts` - Uses `getEmployeeByEmail()` for login
- `src/services/salary.ts` - Uses `getSalaryHistoryFromApi()` for salary data

## Future Enhancements

- Add request/response interceptors
- Implement retry logic for failed requests
- Add request caching
- Add request timeout handling
- Add analytics/logging
