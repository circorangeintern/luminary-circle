import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface User {
  displayName: string
  phone: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<void>
  signup: (displayName: string, phone: string, password: string) => Promise<void>
  logout: () => void
  phoneExists: (phone: string) => boolean
}

const PHONES_KEY = 'registered_phones'

function getRegisteredPhones(): string[] {
  try {
    const raw = localStorage.getItem(PHONES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRegisteredPhones(phones: string[]) {
  localStorage.setItem(PHONES_KEY, JSON.stringify(phones))
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const phoneExists = useCallback((phone: string) => {
    return getRegisteredPhones().includes(phone)
  }, [])

  const login = useCallback(async (phone: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 500))
    const u: User = { displayName: phone, phone }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }, [])

  const signup = useCallback(async (displayName: string, phone: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 500))
    const phones = getRegisteredPhones()
    if (!phones.includes(phone)) {
      phones.push(phone)
      saveRegisteredPhones(phones)
    }
    const u: User = { displayName, phone }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, phoneExists }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
