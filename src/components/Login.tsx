import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="brand">
          <div className="logo" />
          <div>
            <div style={{fontWeight:700}}>InsideBox</div>
            <div className="muted" style={{fontSize:12}}>Start your journey</div>
          </div>
        </div>

  <h1 style={{marginTop:28,marginBottom:8}}>Sign In</h1>
  <p className="muted">Sign in with your email and password to view salary history and download slips.</p>

        <div style={{marginTop:22}}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>E-mail</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} required placeholder="example@email.com" />
            </div>
            <div className="form-row">
              <label>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            <div style={{display:'flex',gap:12,alignItems:'center',marginTop:12}}>
              <button className="signup-cta" type="submit">{loading? 'Signing in...' : 'Sign In'}</button>
            </div>
          </form>

          {error && <p className="error" style={{marginTop:12}}>{error}</p>}

          <p className="muted" style={{marginTop:12}}>For demo: use email <strong>alice@example.com</strong> and password <strong>password</strong>.</p>
        </div>
      </div>
      <div className="auth-right" aria-hidden="true"></div>
    </div>
  )
}
