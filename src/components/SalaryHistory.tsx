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
    <div className="container">
      <div className="card">
          <div className="topbar">
            <h2>Salary History</h2>
            <div className="user-info">
              <strong>{user.name}</strong>
              <button className="btn" onClick={onLogout} style={{background:'#ef4444'}}>Logout</button>
            </div>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && records && (
            <>
              {/* Current month prominent card */}
              <div className="card" style={{marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div className="muted">Current Month</div>
                    <div style={{fontSize:20,fontWeight:700}}>
                      {(() => {
                        const cur = records.find(r => r.month === currentMonth)
                        return cur ? `$${cur.amount.toFixed(2)}` : 'No data for this month'
                      })()}
                    </div>
                    <div className="muted" style={{fontSize:13}}>
                      {(() => {
                        const cur = records.find(r => r.month === currentMonth)
                        return cur ? `Paid on ${cur.paidOn}` : ''
                      })()}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="muted">Previous month</div>
                    <div style={{marginTop:8}}>
                      <button className="btn" onClick={downloadPreviousMonth}>
                        Download {prevMonth} slip
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <table className="salary-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="right">Amount</th>
                    <th>Paid On</th>
                    <th>Slip</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.month}>
                      <td>{r.month}</td>
                      <td className="right">${r.amount.toFixed(2)}</td>
                      <td>{r.paidOn}</td>
                      <td>
                        <button className="btn" onClick={()=>downloadSlip(r)}>
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
      </div>
    </div>
  )
}
