import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CompanyContext = createContext()

export function CompanyProvider({ children }) {
  const { user } = useAuth()
  const [company, setCompany] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tallyCompany') || 'null') }
    catch { return null }
  })

  // If the stored company belongs to a different user, clear it
  useEffect(() => {
    if (!user) {
      setCompany(null)
      localStorage.removeItem('tallyCompany')
    } else if (company && company.user && company.user !== user._id) {
      setCompany(null)
      localStorage.removeItem('tallyCompany')
    }
  }, [user])

  const selectCompany = (c) => {
    localStorage.setItem('tallyCompany', JSON.stringify(c))
    setCompany(c)
  }

  const clearCompany = () => {
    localStorage.removeItem('tallyCompany')
    setCompany(null)
  }

  return (
    <CompanyContext.Provider value={{ company, selectCompany, clearCompany }}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => useContext(CompanyContext)
