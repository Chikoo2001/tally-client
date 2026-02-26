export default function AmountInput({ amount, type, onAmountChange, onTypeChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <input
        type="number"
        className="tally-input"
        style={{ flex: 1 }}
        value={amount || ''}
        onChange={e => onAmountChange(parseFloat(e.target.value) || 0)}
        placeholder="0.00"
        min="0"
        step="0.01"
      />
      <button
        type="button"
        onClick={() => onTypeChange(type === 'Dr' ? 'Cr' : 'Dr')}
        style={{
          padding: '5px 10px',
          border: '1px solid #243358',
          backgroundColor: type === 'Dr' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)',
          color: type === 'Dr' ? '#F87171' : '#34D399',
          fontWeight: 700,
          fontSize: 12,
          cursor: 'pointer',
          minWidth: 36,
        }}
      >
        {type}
      </button>
    </div>
  )
}
