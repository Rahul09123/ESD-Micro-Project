import { getSalaryHistoryFromApi, type SalaryRecord } from '../api/employeeController'

export type { SalaryRecord }

/**
 * Fetch salary history for an employee
 * Delegates to the API controller
 * @param employeeId - Employee ID
 * @returns Array of salary records
 */
export async function getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
  try {
    const salaryData = await getSalaryHistoryFromApi(employeeId)
    // Map API response to internal shape (already in correct format from controller)
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
