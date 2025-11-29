import type { Employee } from '../model/model'
import { getEmployeeByEmail } from '../api/employeeController'

/**
 * Login with email and password
 * Fetches employee data from backend API
 */
export async function login(email: string, password: string): Promise<Employee> {
  try {
    // Fetch employee from backend API
    const employee = await getEmployeeByEmail(email)
    
    // In a real app, you would verify the password with the backend
    // For now, we'll just return the employee data
    if (!employee) {
      throw new Error('Invalid email or password')
    }
    
    return employee
  } catch (error) {
    console.error('Login failed:', error)
    throw new Error('Invalid email or password')
  }
}

/**
 * Login with token
 * Returns employee data and a token for authenticated requests
 */
export async function loginWithToken(email: string, password: string): Promise<{ user: Employee; token: string }> {
  const user = await login(email, password)
  // Generate a mock JWT-like token (in production, this would come from backend)
  const token = `demo-token-${user.id}-${Date.now()}`
  return { user, token }
}

export async function loginWithGoogle(idToken: string): Promise<{ user: Employee; token: string; registered?: boolean }> {
  const base = import.meta.env.VITE_API_BASE ?? ''
  const res = await fetch(`${base}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  })
  try {
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Authentication failed: ${res.status} ${res.statusText} - ${txt}`)
    }
    const data = await res.json()
    // expect { user, token, registered }
    return data as { user: Employee; token: string; registered?: boolean }
  } catch (err: any) {
    // Network or CORS errors surface as 'TypeError: Failed to fetch' in browsers
    if (err instanceof TypeError) {
      throw new Error(`Network/CORS error: ${err.message}`)
    }
    throw err
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}
