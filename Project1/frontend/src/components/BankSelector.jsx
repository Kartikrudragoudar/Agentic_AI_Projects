import React from 'react'
import { Building2 } from 'lucide-react'

const BANKS = [
  { key: null,    label: 'Select Bank (Auto-detect)' },
  { key: 'SBI',   label: '🏛️ State Bank of India (SBI)' },
  { key: 'HDFC',  label: '🔵 HDFC Bank' },
  { key: 'ICICI', label: '🟠 ICICI Bank' },
  { key: 'Axis',  label: '🔴 Axis Bank' },
  { key: 'Kotak', label: '🟣 Kotak Mahindra Bank' },
  { key: 'PNB',   label: '🟢 Punjab National Bank (PNB)' },
  { key: 'BOB',   label: '🟡 Bank of Baroda (BOB)' },
]

/**
 * BankSelector — dropdown to select an Indian bank.
 */
export default function BankSelector({ selectedBank, onBankChange }) {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="text-gold-500 shrink-0" size={16} />
      <select
        id="bank-selector"
        value={selectedBank || ''}
        onChange={e => onBankChange(e.target.value || null)}
        className="input-field flex-1 text-sm px-3 py-2 cursor-pointer"
        aria-label="Select Bank"
      >
        {BANKS.map(b => (
          <option key={b.key ?? 'auto'} value={b.key ?? ''}>
            {b.label}
          </option>
        ))}
      </select>
    </div>
  )
}
