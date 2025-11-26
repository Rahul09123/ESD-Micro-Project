import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AccessDenied() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You are authenticated but your account is not registered to view payroll data.</p>
        <div style={{ marginTop: 20 }}>
          <button className="btn-google" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
