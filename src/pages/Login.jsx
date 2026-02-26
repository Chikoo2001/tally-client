import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1120', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, backgroundColor: '#0F1A2E', border: '1px solid #243358' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#1A2744', borderBottom: '1px solid #243358', padding: '14px 20px', textAlign: 'center' }}>
          <div style={{ color: '#FCAF1E', fontSize: 20, fontWeight: 700, letterSpacing: 3 }}>TALLY ERP</div>
          <div style={{ color: '#8B9DC3', fontSize: 12, marginTop: 4 }}>Sign in to your account</div>
        </div>

        <div style={{ padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="tally-label" style={{ display: 'block', marginBottom: 5 }}>Email Address</label>
              <input
                type="email" required
                className="tally-input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="tally-label" style={{ display: 'block', marginBottom: 5 }}>Password</label>
              <input
                type="password" required
                className="tally-input"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="tally-btn primary"
              style={{ width: '100%', padding: '8px 0', fontSize: 13 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', borderTop: '1px solid #243358', paddingTop: 16 }}>
            <span style={{ color: '#8B9DC3', fontSize: 12 }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#FCAF1E', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
