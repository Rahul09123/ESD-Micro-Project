import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Employee } from '../model/model'
import * as authService from '../services/auth'

type AuthContextType = {
  user: Employee | null
  token?: string | null
  login: (email: string, password: string) => Promise<Employee>
  loginWithGoogle: (idToken: string) => Promise<Employee>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      return raw ? JSON.parse(raw) as Employee : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token')
    } catch {
      return null
    }
  })

  useEffect(() => {
    // persist user/token when they change
    try {
      if (user) localStorage.setItem('auth_user', JSON.stringify(user))
      else localStorage.removeItem('auth_user')
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.removeItem('auth_token')
    } catch {
      // ignore
    }
  }, [user, token])

  async function login(email: string, password: string) {
    const res = await authService.loginWithToken(email, password)
    setUser(res.user)
    setToken(res.token)
    return res.user
  }

  async function loginWithGoogle(idToken: string) {
    const res = await authService.loginWithGoogle(idToken)
    setUser(res.user)
    setToken(res.token)
    return res.user
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
