export type SalaryRecord = {
  month: string // YYYY-MM format
  amount: number
  paidOn: string // ISO date
}

// Return mock salary history for a given employee id
export async function getSalaryHistory(_employeeId: number): Promise<SalaryRecord[]> {
  await delay(200)
  // Mock data: last 6 months
  const base = [
    { month: '2025-11', amount: 5000, paidOn: '2025-11-25' },
    { month: '2025-10', amount: 5000, paidOn: '2025-10-25' },
    { month: '2025-09', amount: 4800, paidOn: '2025-09-25' },
    { month: '2025-08', amount: 4800, paidOn: '2025-08-25' },
    { month: '2025-07', amount: 4700, paidOn: '2025-07-25' },
    { month: '2025-06', amount: 4700, paidOn: '2025-06-25' },
  ]
  return base
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

// Optional: fetch salary history from a backend API using the shared util.
import util from '../utils/util'

export async function getSalaryHistoryFromApi(employeeId: number, opts?: { baseUrl?: string; token?: string }): Promise<SalaryRecord[]> {
  const data = await util.fetchSalaryHistory(employeeId, { baseUrl: opts?.baseUrl, token: opts?.token })
  // Map DTO to internal shape if necessary
  return data.map(d => ({ month: d.month, amount: d.amount, paidOn: d.paidOn }))
}
