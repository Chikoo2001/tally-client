import { createContext, useContext, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('tallyUser') || 'null'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('tallyUser', JSON.stringify(data))
      setUser(data)
      toast.success(`Welcome back, ${data.name}!`)
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      setError(msg)
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('tallyUser', JSON.stringify(data))
      setUser(data)
      toast.success('Account created! Welcome to Tally ERP.')
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      setError(msg)
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('tallyUser')
    localStorage.removeItem('tallyCompany')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    localStorage.setItem('tallyUser', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
