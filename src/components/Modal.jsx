import { useEffect } from 'react'

export default function Modal({ title, children, onClose, width = 500 }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width, backgroundColor: '#1A2744', border: '1px solid #243358', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#243358', padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#FCAF1E', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>{title}</span>
          <button onClick={onClose} style={{ color: '#8B9DC3', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>{children}</div>
      </div>
    </div>
  )
}
