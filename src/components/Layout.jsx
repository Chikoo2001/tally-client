import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCompany } from '../context/CompanyContext'

const NAV_SECTIONS = [
  {
    label: 'GATEWAY',
    items: [
      { to: '/', label: 'Gateway', exact: true },
      { to: '/company/select', label: 'Select Company' },
      { to: '/company/setup', label: 'Create Company' },
    ],
  },
  {
    label: 'MASTERS',
    items: [
      { to: '/masters/ledger-groups', label: 'Ledger Groups' },
      { to: '/masters/ledgers', label: 'Ledgers' },
      { to: '/masters/stock/items', label: 'Stock Items' },
      { to: '/masters/stock/units', label: 'Stock Units' },
      { to: '/masters/stock/groups', label: 'Stock Groups' },
    ],
  },
  {
    label: 'VOUCHERS',
    items: [
      { to: '/vouchers/Sales', label: 'F8  Sales' },
      { to: '/vouchers/Purchase', label: 'F9  Purchase' },
      { to: '/vouchers/Receipt', label: 'F6  Receipt' },
      { to: '/vouchers/Payment', label: 'F5  Payment' },
      { to: '/vouchers/Contra', label: 'F4  Contra' },
      { to: '/vouchers/Journal', label: 'F7  Journal' },
      { to: '/vouchers/CreditNote', label: 'A+F5 Cr Note' },
      { to: '/vouchers/DebitNote', label: 'A+F6 Dr Note' },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      { to: '/reports/trial-balance', label: 'Trial Balance' },
      { to: '/reports/balance-sheet', label: 'Balance Sheet' },
      { to: '/reports/profit-loss', label: 'P & L' },
      { to: '/reports/day-book', label: 'Day Book' },
      { to: '/reports/cash-book', label: 'Cash Book' },
      { to: '/reports/bank-book', label: 'Bank Book' },
      { to: '/reports/ledger', label: 'Ledger' },
    ],
  },
  {
    label: 'GST',
    items: [
      { to: '/gst/gstr1', label: 'GSTR-1' },
      { to: '/gst/gstr3b', label: 'GSTR-3B' },
    ],
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { company } = useCompany()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0B1120' }}>
      <div
        className="flex flex-col overflow-y-auto shrink-0"
        style={{ width: 195, backgroundColor: '#0F1A2E', borderRight: '1px solid #243358' }}
      >
        <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #243358', backgroundColor: '#1A2744' }}>
          <div style={{ color: '#FCAF1E', fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>TALLY ERP</div>
          {company ? (
            <div style={{ color: '#8B9DC3', fontSize: 10, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {company.name}
            </div>
          ) : (
            <div style={{ color: '#F87171', fontSize: 10, marginTop: 2 }}>No company selected</div>
          )}
        </div>

        <nav className="flex-1 py-1">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-1">
              <div className="tally-section-header">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `block px-3 py-1 text-xs transition-colors ${
                      isActive
                        ? 'border-l-2 border-tally-accent'
                        : 'border-l-2 border-transparent hover:border-tally-border'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? '#1E2F4D' : 'transparent',
                    color: isActive ? '#FCAF1E' : '#8B9DC3',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-3 py-2 shrink-0" style={{ borderTop: '1px solid #243358' }}>
          <div style={{ color: '#8B9DC3', fontSize: 11, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </div>
          <button onClick={() => { logout(); navigate('/login') }} className="tally-btn w-full" style={{ fontSize: 11, padding: '3px 8px' }}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#0B1120' }}>
        <Outlet />
      </div>
    </div>
  )
}
