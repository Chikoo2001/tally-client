import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useCompany } from '../../context/CompanyContext'
import LedgerSearch from '../../components/LedgerSearch'

const TYPE_INFO = {
  Sales:      { label: 'SALES', drNature: 'assets', crNature: 'income', isGST: true, key: 'F8' },
  Purchase:   { label: 'PURCHASE', drNature: 'expenses', crNature: 'assets', isGST: true, key: 'F9' },
  Receipt:    { label: 'RECEIPT', drNature: 'assets', crNature: null, key: 'F6' },
  Payment:    { label: 'PAYMENT', drNature: null, crNature: 'assets', key: 'F5' },
  Contra:     { label: 'CONTRA', drNature: 'assets', crNature: 'assets', key: 'F4' },
  Journal:    { label: 'JOURNAL', drNature: null, crNature: null, key: 'F7' },
  CreditNote: { label: 'CREDIT NOTE', drNature: 'income', crNature: 'assets', isGST: true, key: 'A+F5' },
  DebitNote:  { label: 'DEBIT NOTE', drNature: 'assets', crNature: 'expenses', isGST: true, key: 'A+F6' },
}

const emptyEntry = () => ({ ledger: null, type: 'Dr', amount: 0 })
const fmt = n => (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

export default function VoucherEntry() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { company } = useCompany()

  const [voucherNumber, setVoucherNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [narration, setNarration] = useState('')
  const [partyLedger, setPartyLedger] = useState(null)
  const [entries, setEntries] = useState([emptyEntry(), emptyEntry()])
  const [isGSTVoucher, setIsGSTVoucher] = useState(false)
  const [supplyType, setSupplyType] = useState('B2B')
  const [placeOfSupply, setPlaceOfSupply] = useState('')
  const [gstRate, setGstRate] = useState(18)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const info = TYPE_INFO[type] || TYPE_INFO.Journal

  useEffect(() => {
    if (!company) return
    setLoading(true)
    api.get('/vouchers/next-number', { params: { company: company._id, type } })
      .then(r => setVoucherNumber(r.data.voucherNumber))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [company, type])

  const totalDr = entries.filter(e => e.type === 'Dr').reduce((s, e) => s + (e.amount || 0), 0)
  const totalCr = entries.filter(e => e.type === 'Cr').reduce((s, e) => s + (e.amount || 0), 0)
  const diff = Math.abs(totalDr - totalCr)
  const balanced = diff < 0.01

  const addEntry = () => setEntries(prev => [...prev, emptyEntry()])

  const removeEntry = (idx) => {
    if (entries.length <= 2) return toast.error('Minimum 2 entries required')
    setEntries(prev => prev.filter((_, i) => i !== idx))
  }

  const updateEntry = (idx, key, val) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [key]: val } : e))
  }

  const calcGST = useCallback(() => {
    if (!isGSTVoucher) return
    const taxableEntry = entries.find(e => e.amount > 0 && e.ledger)
    if (!taxableEntry) return
    const taxable = taxableEntry.amount
    const half = gstRate / 2
    const cgstAmt = parseFloat((taxable * half / 100).toFixed(2))
    const sgstAmt = parseFloat((taxable * half / 100).toFixed(2))

    // Find CGST/SGST ledgers in entries
    toast.success(`GST Calc: Taxable ₹${fmt(taxable)}, CGST ₹${fmt(cgstAmt)}, SGST ₹${fmt(sgstAmt)}`, { duration: 3000 })
  }, [isGSTVoucher, entries, gstRate])

  const handleSave = async () => {
    if (!company) return toast.error('Select a company first')
    if (!balanced) return toast.error(`Not balanced! Difference: ₹${fmt(diff)}`)
    const validEntries = entries.filter(e => e.ledger && e.amount > 0)
    if (validEntries.length < 2) return toast.error('Need at least 2 entries with ledger and amount')

    setSaving(true)
    try {
      const payload = {
        company: company._id,
        voucherType: type,
        date,
        narration,
        partyLedger: partyLedger?._id,
        partyName: partyLedger?.name,
        entries: validEntries.map(e => ({ ledger: e.ledger._id, type: e.type, amount: e.amount })),
        isGSTVoucher,
        supplyType: isGSTVoucher ? supplyType : '',
        placeOfSupply: isGSTVoucher ? placeOfSupply : '',
      }
      await api.post('/vouchers', payload)
      toast.success(`${info.label} saved as ${voucherNumber}`)
      // Reset
      setEntries([emptyEntry(), emptyEntry()])
      setPartyLedger(null)
      setNarration('')
      // Get next number
      const r = await api.get('/vouchers/next-number', { params: { company: company._id, type } })
      setVoucherNumber(r.data.voucherNumber)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save voucher')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'a') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [entries, narration, partyLedger, date, isGSTVoucher])

  if (!company) return <div style={{ padding: 20, color: '#F87171' }}>Please select a company first.</div>

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #243358', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: '#FCAF1E', fontSize: 13, fontWeight: 700 }}>
            <span className="shortcut-key">{info.key}</span>{' '}{info.label}
          </div>
          <div style={{ color: '#8B9DC3', fontSize: 12 }}>{voucherNumber || 'Loading...'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label className="tally-label" style={{ marginRight: 4 }}>Date</label>
          <input type="date" className="tally-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 140 }} />
        </div>
      </div>

      {/* Party + Narration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <div className="tally-label" style={{ marginBottom: 4 }}>Party Ledger</div>
          <LedgerSearch value={partyLedger} onChange={setPartyLedger} placeholder="Select party..." />
        </div>
        <div>
          <div className="tally-label" style={{ marginBottom: 4 }}>Narration</div>
          <input className="tally-input" value={narration} onChange={e => setNarration(e.target.value)} placeholder="Enter narration..." />
        </div>
      </div>

      {/* GST options */}
      {info.isGST && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12, padding: '8px 12px', backgroundColor: '#1A2744', border: '1px solid #243358' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E2E8F0', fontSize: 12 }}>
            <input type="checkbox" checked={isGSTVoucher} onChange={e => setIsGSTVoucher(e.target.checked)} />
            GST Voucher
          </label>
          {isGSTVoucher && <>
            <label className="tally-label">Supply Type</label>
            <select className="tally-input" value={supplyType} onChange={e => setSupplyType(e.target.value)} style={{ background: '#0D1B33', width: 100 }}>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
              <option value="Export">Export</option>
              <option value="SEZ">SEZ</option>
            </select>
            <label className="tally-label">GST Rate %</label>
            <input type="number" className="tally-input" value={gstRate} onChange={e => setGstRate(parseInt(e.target.value) || 0)} style={{ width: 60 }} />
            <button className="tally-btn" onClick={calcGST} style={{ fontSize: 11 }}>Calc GST</button>
          </>}
        </div>
      )}

      {/* Entries Table */}
      <div style={{ flex: 1, overflow: 'auto', border: '1px solid #243358', marginBottom: 8 }}>
        <table className="tally-table">
          <thead>
            <tr>
              <th className="tally-th" style={{ width: '45%' }}>Ledger Account</th>
              <th className="tally-th" style={{ width: '10%', textAlign: 'center' }}>Type</th>
              <th className="tally-th" style={{ width: '20%', textAlign: 'right' }}>Amount (₹)</th>
              <th className="tally-th" style={{ width: '25%' }}>Narration/Ref</th>
              <th className="tally-th" style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={idx} className="tally-tr">
                <td className="tally-td">
                  <LedgerSearch
                    value={entry.ledger}
                    onChange={val => updateEntry(idx, 'ledger', val)}
                    placeholder="Select ledger..."
                  />
                </td>
                <td className="tally-td" style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => updateEntry(idx, 'type', entry.type === 'Dr' ? 'Cr' : 'Dr')}
                    style={{
                      padding: '3px 10px',
                      border: '1px solid #243358',
                      backgroundColor: entry.type === 'Dr' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)',
                      color: entry.type === 'Dr' ? '#F87171' : '#34D399',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {entry.type}
                  </button>
                </td>
                <td className="tally-td">
                  <input
                    type="number"
                    className="tally-input"
                    style={{ textAlign: 'right' }}
                    value={entry.amount || ''}
                    onChange={e => updateEntry(idx, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="tally-td">
                  <input
                    className="tally-input"
                    value={entry.billRef || ''}
                    onChange={e => updateEntry(idx, 'billRef', e.target.value)}
                    placeholder="Bill ref..."
                  />
                </td>
                <td className="tally-td" style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => removeEntry(idx)}
                    style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#1A2744' }}>
              <td className="tally-td" colSpan={2} style={{ fontWeight: 700, color: '#FCAF1E' }}>TOTAL</td>
              <td className="tally-td" style={{ textAlign: 'right' }}>
                <div><span className="amount-dr">Dr: {fmt(totalDr)}</span></div>
                <div><span className="amount-cr">Cr: {fmt(totalCr)}</span></div>
              </td>
              <td className="tally-td" colSpan={2}>
                {balanced ? (
                  <span style={{ color: '#34D399', fontSize: 11 }}>✓ Balanced</span>
                ) : (
                  <span style={{ color: '#F87171', fontSize: 11 }}>✗ Diff: {fmt(diff)}</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="tally-btn primary" onClick={handleSave} disabled={saving || !balanced}>
          {saving ? 'Saving...' : 'Ctrl+A  Accept'}
        </button>
        <button className="tally-btn" onClick={addEntry}>Add Row</button>
        <button className="tally-btn" onClick={() => navigate(-1)}>Escape</button>
        <span style={{ color: '#8B9DC3', fontSize: 11, marginLeft: 8 }}>
          <span className="shortcut-key">Ctrl+A</span> Save  <span className="shortcut-key">Esc</span> Back
        </span>
      </div>
    </div>
  )
}
