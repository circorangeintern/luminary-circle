import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { register as apiRegister, login as apiLogin, fetchMe, setToken, clearToken } from '../services/api'
import type { UserDto } from '../services/api'

interface AuthContextType {
  user: UserDto | null
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<void>
  signup: (displayName: string, phone: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setToken(token)
      fetchMe()
        .then(setUser)
        .catch(() => {
          clearToken()
          localStorage.removeItem('user')
        })
        .finally(() => setInitialised(true))
    } else {
      setInitialised(true)
    }
  }, [])

  const login = useCallback(async (phone: string, password: string) => {
    const res = await apiLogin(phone, password)
    setToken(res.accessToken)
    setUser(res.user)
  }, [])

  const signup = useCallback(async (displayName: string, phone: string, password: string) => {
    const res = await apiRegister(displayName, phone, password)
    setToken(res.accessToken)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  if (!initialised) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-grey">
        <div className="skeleton h-8 w-48 rounded-lg" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
