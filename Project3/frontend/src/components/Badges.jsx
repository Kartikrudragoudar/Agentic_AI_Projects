import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function SentimentBadge({ sentiment, confidence }) {
  const getBadgeStyle = () => {
    switch (sentiment) {
      case 'Bullish':
        return 'bg-green-bg text-accent border border-green-bg'
      case 'Bearish':
        return 'bg-red-bg text-red border border-red-bg'
      default:
        return 'bg-surface-2 text-text-muted border border-border'
    }
  }

  const getIcon = () => {
    if (sentiment === 'Bullish') return <TrendingUp size={16} />
    if (sentiment === 'Bearish') return <TrendingDown size={16} />
    return null
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getBadgeStyle()}`}>
      {getIcon()}
      <span className="text-sm font-semibold">{sentiment}</span>
      <span className="text-xs opacity-75">({confidence}%)</span>
    </div>
  )
}

export function ScoreBadge({ score }) {
  const getColor = () => {
    if (score >= 70) return 'bg-green-bg text-accent'
    if (score >= 50) return 'bg-surface-2 text-accent'
    return 'bg-red-bg text-red'
  }

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${getColor()}`}>
      <span className="font-bold text-sm">{score}</span>
      <span className="text-xs text-text-muted">/100</span>
    </div>
  )
}

export function PriceChangeIndicator({ change }) {
  const isPositive = change >= 0
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${isPositive ? 'bg-green-bg text-accent' : 'bg-red-bg text-red'}`}>
      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      <span className="font-semibold">{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
    </div>
  )
}
