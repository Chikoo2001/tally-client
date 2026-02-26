import { useNavigate } from 'react-router-dom'
import { useCompany } from '../context/CompanyContext'

const BLOCKS = [
  {
    key: 'masters',
    title: 'MASTERS',
    color: '#1A3A5C',
    items: [
      { label: 'F3 Ledger Groups', to: '/masters/ledger-groups' },
      { label: 'F4 Ledgers', to: '/masters/ledgers' },
      { label: 'F5 Stock Items', to: '/masters/stock/items' },
    ],
  },
  {
    key: 'vouchers',
    title: 'VOUCHERS',
    color: '#1A3A2A',
    items: [
      { label: 'F8 Sales', to: '/vouchers/Sales' },
      { label: 'F9 Purchase', to: '/vouchers/Purchase' },
      { label: 'F6 Receipt', to: '/vouchers/Receipt' },
      { label: 'F5 Payment', to: '/vouchers/Payment' },
      { label: 'F4 Contra', to: '/vouchers/Contra' },
      { label: 'F7 Journal', to: '/vouchers/Journal' },
    ],
  },
  {
    key: 'reports',
    title: 'REPORTS',
    color: '#2A1A3A',
    items: [
      { label: 'Trial Balance', to: '/reports/trial-balance' },
      { label: 'Balance Sheet', to: '/reports/balance-sheet' },
      { label: 'Profit & Loss', to: '/reports/profit-loss' },
      { label: 'Day Book', to: '/reports/day-book' },
      { label: 'Cash Book', to: '/reports/cash-book' },
      { label: 'Ledger', to: '/reports/ledger' },
    ],
  },
  {
    key: 'gst',
    title: 'GST REPORTS',
    color: '#3A2A1A',
    items: [
      { label: 'GSTR-1', to: '/gst/gstr1' },
      { label: 'GSTR-3B', to: '/gst/gstr3b' },
    ],
  },
]

export default function Gateway() {
  const navigate = useNavigate()
  const { company } = useCompany()

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20, borderBottom: '1px solid #243358', paddingBottom: 12 }}>
        <div style={{ color: '#FCAF1E', fontSize: 20, fontWeight: 700, letterSpacing: 3 }}>TALLY ERP</div>
        {company ? (
          <div style={{ color: '#8B9DC3', fontSize: 12, marginTop: 4 }}>
            Active Company: <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{company.name}</span>
            {company.gstin && <span style={{ marginLeft: 16, color: '#8B9DC3' }}>GSTIN: {company.gstin}</span>}
          </div>
        ) : (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#F87171', fontSize: 12 }}>No company selected.</span>
            <button className="tally-btn primary" onClick={() => navigate('/company/select')} style={{ fontSize: 11, padding: '3px 12px' }}>
              Select Company
            </button>
            <button className="tally-btn" onClick={() => navigate('/company/setup')} style={{ fontSize: 11, padding: '3px 12px' }}>
              Create Company
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, flex: 1 }}>
        {BLOCKS.map(block => (
          <div key={block.key} style={{ backgroundColor: block.color, border: '1px solid #243358', padding: 12 }}>
            <div style={{ color: '#FCAF1E', fontWeight: 700, fontSize: 11, letterSpacing: 2, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 6 }}>
              {block.title}
            </div>
            {block.items.map(item => (
              <div
                key={item.to}
                onClick={() => navigate(item.to)}
                style={{ color: '#E2E8F0', fontSize: 12, padding: '4px 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FCAF1E'}
                onMouseLeave={e => e.currentTarget.style.color = '#E2E8F0'}
              >
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, color: '#8B9DC3', fontSize: 11 }}>
        <span><span className="shortcut-key">F1</span> Help</span>
        <span><span className="shortcut-key">F12</span> Configure</span>
        <span><span className="shortcut-key">Ctrl+Q</span> Quit</span>
      </div>
    </div>
  )
}
