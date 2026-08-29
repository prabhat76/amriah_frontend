import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, userApi, token, UserResponse, ApiError } from '@/lib/api'

interface AuthContextType {
  user: UserResponse | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Restore session on mount
  useEffect(() => {
    const t = token.get()
    if (t) {
      userApi.me()
        .then(setUser)
        .catch(() => token.clear())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const res = await authApi.login(email, password)
      token.set(res.accessToken)
      token.setRefresh(res.refreshToken)
      setUser(res.user)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Login failed. Please try again.'
      setError(msg)
      throw e
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setError(null)
    try {
      const res = await authApi.register(email, password, firstName, lastName)
      token.set(res.accessToken)
      token.setRefresh(res.refreshToken)
      setUser(res.user)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Registration failed. Please try again.'
      setError(msg)
      throw e
    }
  }

  const logout = () => {
    token.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user, isLoading,
      login, register, logout,
      error, clearError: () => setError(null),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
