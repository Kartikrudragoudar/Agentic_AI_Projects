import React from 'react'
import { TrendingUp, IndianRupee } from 'lucide-react'

/**
 * CalculatorResult — green card showing EMI or FD calculation breakdown.
 */
export default function CalculatorResult({ result }) {
  if (!result) return null

  const isEMI = result.emi !== undefined
  const isFD  = result.maturity_amount !== undefined

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="mx-3 mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="text-emerald-400" size={16} />
        <p className="text-emerald-300 font-semibold text-sm">
          {isEMI ? '📊 EMI Calculation Result' : '📈 FD Maturity Result'}
        </p>
      </div>

      {isEMI && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <ResultRow label="Principal" value={fmt(result.principal)} />
          <ResultRow label="Annual Rate" value={`${result.annual_rate}%`} />
          <ResultRow label="Tenure" value={`${result.tenure_months} months`} />
          <ResultRow label="Monthly EMI" value={fmt(result.emi)} highlight />
          <ResultRow label="Total Payment" value={fmt(result.total_payment)} />
          <ResultRow label="Total Interest" value={fmt(result.total_interest)} />
        </div>
      )}

      {isFD && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <ResultRow label="Principal" value={fmt(result.principal)} />
          <ResultRow label="Annual Rate" value={`${result.annual_rate}%`} />
          <ResultRow label="Tenure" value={`${result.tenure_years} years`} />
          <ResultRow label="Compounding" value={result.compounding} />
          <ResultRow label="Interest Earned" value={fmt(result.interest_earned)} />
          <ResultRow label="Maturity Amount" value={fmt(result.maturity_amount)} highlight />
        </div>
      )}
    </div>
  )
}

function ResultRow({ label, value, highlight }) {
  return (
    <div className={`rounded-lg px-2.5 py-2 ${
      highlight
        ? 'bg-emerald-500/20 border border-emerald-500/30 col-span-2'
        : 'bg-black/20'
    }`}>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className={`font-semibold mt-0.5 ${highlight ? 'text-emerald-300 text-base' : 'text-slate-200 text-sm'}`}>
        {value}
      </p>
    </div>
  )
}
