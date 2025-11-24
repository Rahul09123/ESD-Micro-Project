import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

declare global {
  interface Window { google?: any }
}

export default function Login() {
  const { loginWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // load Google Identity Services script
    if (window.google) return
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    document.head.appendChild(s)
    return () => { s.remove() }
  }, [])

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
    if (!clientId) {
      setError('Missing VITE_GOOGLE_CLIENT_ID environment variable')
      return
    }

    const clientIdLog = clientId ?? '(missing)'
    console.log('VITE_GOOGLE_CLIENT_ID=', clientIdLog)

    function initGoogle() {
      try {
        if (!window.google) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp: any) => {
            setLoading(true)
            setError(null)
            try {
              await loginWithGoogle(resp.credential)
            } catch (err: any) {
              setError(err?.message || 'Google sign-in failed')
            } finally {
              setLoading(false)
            }
          }
        })

        // render button into container
        const container = document.getElementById('g_id_signin')
        if (container) {
          window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large' })
        }
      } catch (e) {
        setError('Failed to initialize Google Sign-In')
      }
    }

    // If script already loaded, init immediately
    if (window.google) {
      initGoogle()
      return
    }

    // Otherwise, attach a load handler to the script we added earlier
    const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.includes('accounts.google.com/gsi/client')) as HTMLScriptElement | undefined
    if (existing) {
      existing.addEventListener('load', initGoogle)
      return () => existing.removeEventListener('load', initGoogle)
    }

    // If the script wasn't present for some reason, create it and init on load
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.addEventListener('load', initGoogle)
    document.head.appendChild(s)
    return () => { s.removeEventListener('load', initGoogle); s.remove() }
  }, [loginWithGoogle])

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
        <p className="muted">Sign in with Google to view salary history and download slips.</p>
        <p style={{fontSize:12,marginTop:8}} className="muted">Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '(not set)'}</p>

        <div style={{marginTop:22}}>
          <div id="g_id_signin" />
          {loading && <p>Signing in with Google...</p>}
          {error && <p className="error" style={{marginTop:12}}>{error}</p>}

          <p className="muted" style={{marginTop:12}}>Make sure `VITE_GOOGLE_CLIENT_ID` is set in your environment.</p>
        </div>
      </div>
      <div className="auth-right" aria-hidden="true"></div>
    </div>
  )
}
