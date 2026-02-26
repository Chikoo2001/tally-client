import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1120', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, backgroundColor: '#0F1A2E', border: '1px solid #243358' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#1A2744', borderBottom: '1px solid #243358', padding: '14px 20px', textAlign: 'center' }}>
          <div style={{ color: '#FCAF1E', fontSize: 20, fontWeight: 700, letterSpacing: 3 }}>TALLY ERP</div>
          <div style={{ color: '#8B9DC3', fontSize: 12, marginTop: 4 }}>Create your account</div>
        </div>

        <div style={{ padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="tally-label" style={{ display: 'block', marginBottom: 5 }}>Full Name</label>
              <input type="text" required className="tally-input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" autoFocus />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="tally-label" style={{ display: 'block', marginBottom: 5 }}>Email Address</label>
              <input type="email" required className="tally-input" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="tally-label" style={{ display: 'block', marginBottom: 5 }}>Password</label>
              <input type="password" required minLength={6} className="tally-input" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <button
              type="submit" disabled={loading}
              className="tally-btn primary"
              style={{ width: '100%', padding: '8px 0', fontSize: 13 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', borderTop: '1px solid #243358', paddingTop: 16 }}>
            <span style={{ color: '#8B9DC3', fontSize: 12 }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#FCAF1E', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
