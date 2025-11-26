/**
 * Download Manager Utility
 * Handles generation and download of salary slips and payroll documents
 * Files are downloaded to the user's Downloads folder
 */

import type { Employee } from '../model/model'
import type { SalaryRecord } from '../services/salary'

/**
 * Generate and download a salary slip as a text file
 * @param user Employee data
 * @param record Salary record to generate slip for
 */
export function downloadSalarySlip(user: Employee, record: SalaryRecord): void {
  const content = generateSalarySlipContent(user, record)
  const filename = `salary-${user.id || 'unknown'}-${record.month}.txt`
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Generate salary slip content as formatted text
 * @param user Employee data
 * @param record Salary record
 * @returns Formatted salary slip content
 */
export function generateSalarySlipContent(user: Employee, record: SalaryRecord): string {
  const slipContent = [
    '=====================================',
    '              SALARY SLIP',
    '=====================================',
    '',
    `Employee ID:    ${user.id || 'N/A'}`,
    `Employee Name:  ${user.name}`,
    `Email:          ${user.email}`,
    '',
    `Month:          ${record.month}`,
    `Amount:         $${record.amount.toFixed(2)}`,
    `Paid On:        ${record.paidOn}`,
    '',
    '=====================================',
    `Generated: ${new Date().toLocaleString()}`,
    '====================================='
  ].join('\n')
  return slipContent
}
