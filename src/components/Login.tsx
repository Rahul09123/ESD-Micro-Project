import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

declare global {
  interface Window { google?: any }
}

export default function Login() {
  const { loginWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [gisReady, setGisReady] = useState(false)

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
          setGisReady(true)
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
      existing.addEventListener('load', () => { initGoogle(); setGisReady(true) })
      return () => existing.removeEventListener('load', initGoogle)
    }

    // If the script wasn't present for some reason, create it and init on load
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.addEventListener('load', () => { initGoogle(); setGisReady(true) })
    document.head.appendChild(s)
    return () => { s.removeEventListener('load', initGoogle); s.remove() }
  }, [loginWithGoogle])

  async function handleManualSignIn() {
    setError(null)
    setLoading(true)
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
      if (!clientId) {
        setError('Missing VITE_GOOGLE_CLIENT_ID environment variable')
        return
      }

      if (window.google && window.google.accounts && window.google.accounts.id) {
        // ensure initialized (safe to call multiple times)
        try {
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
        } catch (e) {
          // ignore
        }

        // try One Tap / prompt which will invoke the same callback
        try {
          window.google.accounts.id.prompt()
          return
        } catch (e) {
          // fallback: try to render the button into a temporary container
          const tmp = document.getElementById('g_id_signin')
          if (tmp) {
            try { window.google.accounts.id.renderButton(tmp, { theme: 'outline', size: 'large' }) } catch (e) {}
            return
          }
        }
      }

      setError('Google Identity script not loaded. Check network or refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div
        className="card shadow-lg border-0"
        style={{
          maxWidth: 560,
          width: '100%',
          background: 'rgba(255,255,255,0.72)',
          borderRadius: 20,
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
        }}
      >
        <div className="card-body p-5">
          <div className="d-flex align-items-center mb-2">
            <div className="rounded bg-primary me-2" style={{width:48,height:48}} />
            <div>
              <h3 className="mb-0">Welcome back</h3>
              <small className="text-muted">Sign in to access your dashboard</small>
            </div>
          </div>
          <hr className="my-4" />

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <div className="d-flex justify-content-center mb-4">
            <div id="g_id_signin" />
          </div>

          {/* Fallback button only if GIS button isn't ready */}
          {!gisReady && (
            <button
              className="btn btn-dark btn-lg w-100"
              onClick={handleManualSignIn}
              disabled={loading}
              aria-label="Sign in with Google"
            >
              {loading ? 'Signing in…' : 'Sign in with Google'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}