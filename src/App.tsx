import './App.css'
import Login from './components/Login'
import SalaryHistory from './components/SalaryHistory'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppInner() {
  const { user, logout } = useAuth()
  return (
    <div>
      {!user && <Login />}
      {user && (
        <div className="dashboard-page">
          <SalaryHistory user={user} onLogout={logout} />
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App
