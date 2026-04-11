import React, { useState } from 'react'
import {
  Wallet, CreditCard, ArrowLeftRight, FileText,
  Calculator, TrendingUp, ChevronDown, ChevronUp,
} from 'lucide-react'

const QUICK_ACTIONS = [
  { icon: Wallet,        label: 'Check Balance',    msg: 'How can I check my account balance?' },
  { icon: CreditCard,    label: 'Lost/Block Card',  msg: 'My debit card is lost. How do I block it?' },
  { icon: ArrowLeftRight,label: 'Fund Transfer',    msg: 'How can I transfer money to another account?' },
  { icon: FileText,      label: 'Mini Statement',   msg: 'How do I get my mini statement?' },
]

/**
 * Sidebar — Quick actions + EMI Calculator + FD Calculator forms.
 */
export default function Sidebar({ onQuickAction, selectedBank }) {
  const [emiOpen, setEmiOpen] = useState(false)
  const [fdOpen,  setFdOpen]  = useState(false)

  const [emi, setEmi] = useState({ principal: '', rate: '', tenure: '' })
  const [fd,  setFd]  = useState({ principal: '', rate: '', tenure: '' })

  const handleEmiCalc = () => {
    const { principal, rate, tenure } = emi
    if (!principal || !rate || !tenure) return
    const msg = `Calculate EMI for loan amount ₹${principal}, interest rate ${rate}% per year, tenure ${tenure} months`
    onQuickAction(msg)
  }

  const handleFdCalc = () => {
    const { principal, rate, tenure } = fd
    if (!principal || !rate || !tenure) return
    const msg = `Calculate FD maturity for ₹${principal} at ${rate}% annual interest for ${tenure} years`
    onQuickAction(msg)
  }

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-3 p-3 overflow-y-auto">

      {/* Quick Actions */}
      <div className="sidebar-section">
        <h2 className="text-xs font-semibold text-gold-400 uppercase tracking-widest mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(({ icon: Icon, label, msg }) => (
            <button
              key={label}
              id={`quick-${label.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => onQuickAction(msg)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl
                         bg-white/5 hover:bg-gold-500/10 border border-white/5
                         hover:border-gold-500/30 transition-all duration-200 group"
            >
              <Icon size={18} className="text-gold-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-slate-300 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* EMI Calculator */}
      <div className="sidebar-section">
        <button
          id="emi-calculator-toggle"
          onClick={() => setEmiOpen(v => !v)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gold-400"
        >
          <span className="flex items-center gap-2">
            <Calculator size={15} /> EMI Calculator
          </span>
          {emiOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {emiOpen && (
          <div className="mt-3 space-y-2 animate-fade-in">
            <CalcInput
              id="emi-principal"
              label="Loan Amount (₹)"
              placeholder="e.g. 500000"
              value={emi.principal}
              onChange={v => setEmi(p => ({ ...p, principal: v }))}
            />
            <CalcInput
              id="emi-rate"
              label="Annual Interest (%)"
              placeholder="e.g. 8.5"
              value={emi.rate}
              onChange={v => setEmi(p => ({ ...p, rate: v }))}
            />
            <CalcInput
              id="emi-tenure"
              label="Tenure (months)"
              placeholder="e.g. 60"
              value={emi.tenure}
              onChange={v => setEmi(p => ({ ...p, tenure: v }))}
            />
            <button
              id="emi-calculate-btn"
              onClick={handleEmiCalc}
              className="btn-gold w-full py-2 rounded-lg text-xs mt-1"
            >
              Calculate EMI →
            </button>
          </div>
        )}
      </div>

      {/* FD Calculator */}
      <div className="sidebar-section">
        <button
          id="fd-calculator-toggle"
          onClick={() => setFdOpen(v => !v)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gold-400"
        >
          <span className="flex items-center gap-2">
            <TrendingUp size={15} /> FD Calculator
          </span>
          {fdOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {fdOpen && (
          <div className="mt-3 space-y-2 animate-fade-in">
            <CalcInput
              id="fd-principal"
              label="Deposit Amount (₹)"
              placeholder="e.g. 100000"
              value={fd.principal}
              onChange={v => setFd(p => ({ ...p, principal: v }))}
            />
            <CalcInput
              id="fd-rate"
              label="Annual Interest (%)"
              placeholder="e.g. 7.0"
              value={fd.rate}
              onChange={v => setFd(p => ({ ...p, rate: v }))}
            />
            <CalcInput
              id="fd-tenure"
              label="Tenure (years)"
              placeholder="e.g. 3"
              value={fd.tenure}
              onChange={v => setFd(p => ({ ...p, tenure: v }))}
            />
            <button
              id="fd-calculate-btn"
              onClick={handleFdCalc}
              className="btn-gold w-full py-2 rounded-lg text-xs mt-1"
            >
              Calculate Maturity →
            </button>
          </div>
        )}
      </div>

      {/* Bank Info */}
      {selectedBank && (
        <div className="sidebar-section text-xs text-slate-400">
          <p className="text-gold-400 font-semibold mb-1">Selected Bank</p>
          <p className="text-slate-300 font-medium">{selectedBank}</p>
          <p className="mt-1">Ask me anything about {selectedBank} services →</p>
        </div>
      )}
    </aside>
  )
}

function CalcInput({ id, label, placeholder, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input
        id={id}
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full px-3 py-2 text-xs"
      />
    </div>
  )
}
