import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SentimentBadge, ScoreBadge, PriceChangeIndicator } from './Badges'
import { ExternalLink } from 'lucide-react'

export function TickerCard({ ticker }) {
  const cardRef = useRef()
  const priceRef = useRef()

  useEffect(() => {
    // Animate price counter when card is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const finalPrice = ticker.price
          gsap.fromTo(
            priceRef.current,
            { textContent: 0 },
            {
              textContent: finalPrice,
              duration: 1.2,
              ease: 'power2.out',
              snap: { textContent: 1 },
            }
          )
          observer.unobserve(entry.target)
        }
      })
    })

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [ticker.price])

  return (
    <div
      ref={cardRef}
      className="card-hover bg-surface border border-border rounded-xl p-6 transition-all duration-300 hover:border-accent/40"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{ticker.name}</h3>
          <p className="text-sm text-text-muted">{ticker.symbol}</p>
        </div>
        <ScoreBadge score={ticker.score} />
      </div>

      {/* Price Section */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 mb-2">
          <span
            ref={priceRef}
            className="text-3xl font-bold font-mono text-text-primary"
          >
            {ticker.price}
          </span>
          <span className="text-sm text-text-muted">{ticker.currency}</span>
        </div>
        <PriceChangeIndicator change={ticker.change} />
      </div>

      {/* Sentiment */}
      <div className="mb-4">
        <SentimentBadge sentiment={ticker.sentiment} confidence={ticker.confidence} />
        <p className="text-sm text-text-muted mt-2">{ticker.reason}</p>
      </div>

      {/* News */}
      {ticker.news && ticker.news.length > 0 && (
        <div className="mb-4 pb-4 border-t border-border pt-4">
          <p className="text-xs text-text-muted uppercase mb-2">Latest News</p>
          <p className="text-sm text-text-primary line-clamp-2">{ticker.news[0]}</p>
        </div>
      )}

      {/* Footer */}
      <a
        href={
          ticker.symbol.includes('.NS') || ticker.symbol.includes('.BO') || ticker.symbol.startsWith('^')
            ? `https://finance.yahoo.com/quote/${ticker.symbol}`
            : `https://www.coingecko.com/en/coins/${ticker.symbol.toLowerCase()}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-accent text-sm hover:gap-3 transition-all cursor-pointer"
      >
        View Details
        <ExternalLink size={14} />
      </a>
    </div>
  )
}
