import './App.css'
import Login from './components/Login'
import SalaryHistory from './components/SalaryHistory'
import AccessDenied from './components/AccessDenied'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Routes, Route, Navigate } from 'react-router-dom'

function AppInner() {
  const { user, logout, registered } = useAuth()

  if (!user) return <Login />
  if (user && registered === false) return <Navigate to="/access-denied" replace />
  // user && registered === true
  return (
    <div className="dashboard-page">
      <SalaryHistory user={user} onLogout={logout} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AppInner />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
