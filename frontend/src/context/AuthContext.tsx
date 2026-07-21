import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface User {
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (username: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 500))
    const u: User = { username, email: `${username}@example.com` }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }, [])

  const signup = useCallback(async (username: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 500))
    const u: User = { username, email }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user')
    setUser(null)
  }, [])

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
