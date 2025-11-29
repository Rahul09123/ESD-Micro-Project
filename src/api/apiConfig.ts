/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  ENDPOINTS: {
    EMPLOYEES: '/api/employees',
    SALARY_HISTORY: (employeeId: number) => `/api/employees/${employeeId}/salary`,
  },
}

export type FetchOptions = {
  baseUrl?: string
  token?: string
}

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const baseUrl = options?.baseUrl || API_CONFIG.BASE_URL
  const url = `${baseUrl}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add auth token if available
  const token =
    options?.token ||
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, { headers })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    return (await response.json()) as T
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error)
    throw error
  }
}

export default apiFetch
