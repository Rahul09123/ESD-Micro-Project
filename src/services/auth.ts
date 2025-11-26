import type { Employee } from '../model/model'

// Simple mock OAuth-like login. In a real app this would call a backend.
export async function login(email: string, password: string): Promise<Employee> {
  await delay(600)
  // Mock user database keyed by id but we'll search by email
  const users: Array<Employee & { password: string }> = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', password: 'password' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', password: 'password' },
  ]

  const u = users.find(x => x.email.toLowerCase() === email.trim().toLowerCase())
  if (!u || u.password !== password) {
    throw new Error('Invalid email or password')
  }
  // Return employee object for demo
  return { id: u.id, name: u.name, email: u.email }
}

export async function loginWithToken(email: string, password: string): Promise<{ user: Employee; token: string }> {
  // For demo, return a mock JWT-like token string
  const user = await login(email, password)
  const token = `demo-token-${user.id}-${Date.now()}`
  return { user, token }
}

export async function loginWithGoogle(idToken: string): Promise<{ user: Employee; token: string; registered?: boolean }> {
  const base = import.meta.env.VITE_API_BASE ?? ''
  const res = await fetch(`${base}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  })
  try {
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Authentication failed: ${res.status} ${res.statusText} - ${txt}`)
    }
    const data = await res.json()
    // expect { user, token, registered }
    return data as { user: Employee; token: string; registered?: boolean }
  } catch (err: any) {
    // Network or CORS errors surface as 'TypeError: Failed to fetch' in browsers
    if (err instanceof TypeError) {
      throw new Error(`Network/CORS error: ${err.message}`)
    }
    throw err
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}
