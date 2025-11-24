import { useEffect, useState } from 'react'
import type { Employee } from '../model/model'
import type { SalaryRecord } from '../services/salary'
import * as salaryService from '../services/salary'

type Props = { user: Employee; onLogout: () => void }

export default function SalaryHistory({ user, onLogout }: Props) {
  const [records, setRecords] = useState<SalaryRecord[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    salaryService.getSalaryHistory(user.id).then(r => setRecords(r)).finally(()=>setLoading(false))
  }, [user.id])

  function downloadSlip(rec: SalaryRecord) {
    // Simple plain-text slip; could be replaced with PDF generation
    const content = `Salary Slip\nEmployee: ${user.name} (${user.id})\nMonth: ${rec.month}\nAmount: ${rec.amount}\nPaid On: ${rec.paidOn}\n`;
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `salary-${user.id}-${rec.month}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // helper to format YYYY-MM for a Date
  function fmtYYYYMM(d: Date) {
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    return `${y}-${m.toString().padStart(2,'0')}`
  }

  const today = new Date()
  const currentMonth = fmtYYYYMM(today)
  // previous month
  const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const prevMonth = fmtYYYYMM(prev)
  const currentRecord = records?.find(r => r.month === currentMonth)

  function downloadPreviousMonth() {
    if (!records) return
    const rec = records.find(r => r.month === prevMonth)
    if (!rec) {
      alert(`No salary record found for ${prevMonth}`)
      return
    }
    downloadSlip(rec)
  }

  return (
    <div className="container my-4">
      <div className="card p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h4 mb-0">Salary History</h2>
            <div className="d-flex align-items-center gap-2">
              <strong className="me-2">{user.name}</strong>
              <button className="btn btn-outline-danger" onClick={onLogout}>Logout</button>
            </div>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && records && (
            <>
              {/* Current month Bootstrap card */}
              <div className="card mb-3 border-info" style={{background:'#e0f2fe'}}>
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-1">Current Month</h5>
                    <p className="card-text mb-0">
                      {currentRecord ? (
                        <>
                          <strong>${currentRecord.amount.toFixed(2)}</strong>
                          <span className="text-muted ms-2">Paid on {currentRecord.paidOn}</span>
                        </>
                      ) : (
                        <span className="text-muted">No data for this month</span>
                      )}
                    </p>
                  </div>
                  <button className="btn btn-lg btn-dark" onClick={downloadPreviousMonth}>
                    Download {prevMonth} slip
                  </button>
                </div>
              </div>

              {/* All months as Bootstrap cards */}
              <div className="row g-3">
                {records.map(r => (
                  <div className="col-12 col-sm-6 col-lg-4" key={r.month}>
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span>{r.month}</span>
                        {r.month === currentMonth && <span className="badge text-bg-info">Current</span>}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title mb-2">${r.amount.toFixed(2)}</h5>
                        <p className="card-text text-muted mb-4">Paid on {r.paidOn}</p>
                        <div className="mt-auto">
                          <button className="btn btn-dark w-100" onClick={() => downloadSlip(r)}>
                            Download Slip
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>
    </div>
  )
}
