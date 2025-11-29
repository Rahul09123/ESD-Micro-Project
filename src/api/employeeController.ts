/**
 * Employee API Controller
 * Handles all employee-related API calls
 */

import apiFetch, { API_CONFIG, type FetchOptions } from './apiConfig'

export type EmployeeData = {
  id: number
  name: string
  email: string
}

export type SalaryRecord = {
  month: string
  amount: number
  paidOn: string
}

/**
 * Fetch employee by email
 * @param email - Employee email address
 * @param options - Fetch options (baseUrl, token)
 * @returns Employee data
 */
export async function getEmployeeByEmail(
  email: string,
  options?: FetchOptions
): Promise<EmployeeData> {
  const query = encodeURIComponent(email.trim())
  const path = `${API_CONFIG.ENDPOINTS.EMPLOYEES}?email=${query}`
  return apiFetch<EmployeeData>(path, options)
}

/**
 * Fetch salary history for an employee
 * @param employeeId - Employee ID
 * @param options - Fetch options (baseUrl, token)
 * @returns Array of salary records
 */
export async function getSalaryHistoryFromApi(
  employeeId: number,
  options?: FetchOptions
): Promise<SalaryRecord[]> {
  const path = API_CONFIG.ENDPOINTS.SALARY_HISTORY(employeeId)
  return apiFetch<SalaryRecord[]>(path, options)
}

/**
 * Fetch all salary data for download
 * @param employeeId - Employee ID
 * @param options - Fetch options
 * @returns Formatted salary data for download
 */
export async function getSalaryDataForDownload(
  employeeId: number,
  options?: FetchOptions
): Promise<SalaryRecord[]> {
  return getSalaryHistoryFromApi(employeeId, options)
}
