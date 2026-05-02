import React, { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TickerCard } from './TickerCard'
import { marketAPI } from '../api/marketAPI'

gsap.registerPlugin(ScrollTrigger)

export function WatchlistSection() {
  const headingRef = useRef()
  const cardsContainerRef = useRef()
  const [marketData, setMarketData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fallbackTickers = [
    {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      price: 2847.50,
      currency: '₹',
      change: 1.24,
      score: 82,
      sentiment: 'Bullish',
      confidence: 82,
      reason: 'Strong price gain with positive Q4 earnings news',
      news: ['Reliance Q4 profit beats estimates by 12%', 'Jio adds record 8M subscribers in March'],
    },
    {
      symbol: 'TCS.NS',
      name: 'Tata Consultancy Services',
      price: 3920.00,
      currency: '₹',
      change: 0.85,
      score: 65,
      sentiment: 'Neutral',
      confidence: 60,
      reason: 'Steady performance with cautious market outlook',
      news: ['TCS Q4 revenue meets expectations'],
    },
    {
      symbol: 'HDFCBANK.NS',
      name: 'HDFC Bank',
      price: 1685.50,
      currency: '₹',
      change: -0.45,
      score: 45,
      sentiment: 'Bearish',
      confidence: 55,
      reason: 'Volume spike indicates selling pressure',
      news: ['Banking sector faces headwinds in Q4'],
    },
    {
      symbol: 'INFY.NS',
      name: 'Infosys',
      price: 2645.00,
      currency: '₹',
      change: 2.10,
      score: 78,
      sentiment: 'Bullish',
      confidence: 79,
      reason: 'Strong recovery with positive sector momentum',
      news: ['Infosys wins major enterprise contracts'],
    },
    {
      symbol: 'BITCOIN',
      name: 'Bitcoin',
      price: 64200,
      currency: '$',
      change: 3.12,
      score: 79,
      sentiment: 'Bullish',
      confidence: 78,
      reason: 'ETF inflows surge with 3% price gain overnight',
      news: ['Bitcoin ETF sees record inflows'],
    },
  ]

  const tickers = useMemo(() => {
    if (!marketData) return fallbackTickers

    const prices = marketData.prices || {}
    const scores = marketData.scores?.scores || {}
    const sentiments = marketData.sentiment?.results || {}
    const stocks = Object.entries(prices.stocks || {})
    const crypto = Object.entries(prices.crypto || {})

    const stockTickers = stocks.map(([symbol, item]) => ({
      symbol,
      name: item.name || symbol,
      price: item.price || 0,
      currency: item.currency === 'INR' ? '₹' : item.currency || '',
      change: item.pct_change || 0,
      score: scores[symbol]?.score || 0,
      sentiment: sentiments[symbol]?.sentiment || 'Neutral',
      confidence: sentiments[symbol]?.confidence || 0,
      reason: sentiments[symbol]?.reason || 'Sentiment analysis unavailable',
      news: (item.news || []).map((headline) => headline.title || headline),
    }))

    const cryptoTickers = crypto.map(([symbol, item]) => ({
      symbol: symbol.toUpperCase(),
      name: item.name || symbol,
      price: item.price_usd || item.price_inr || 0,
      currency: item.price_usd ? '$' : '₹',
      change: item.pct_change_24h || 0,
      score: scores[symbol]?.score || 0,
      sentiment: sentiments[symbol]?.sentiment || 'Neutral',
      confidence: sentiments[symbol]?.confidence || 0,
      reason: sentiments[symbol]?.reason || 'Sentiment analysis unavailable',
      news: (item.news || []).map((headline) => headline.title || headline),
    }))

    const combined = [...stockTickers, ...cryptoTickers].sort((a, b) => b.score - a.score)
    return combined.length ? combined : fallbackTickers
  }, [marketData])

  useEffect(() => {
    let isMounted = true

    marketAPI
      .getDashboard()
      .then((response) => {
        if (isMounted) setMarketData(response.data)
      })
      .catch(() => {
        if (isMounted) setMarketData(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    // Heading animation
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )

    // Cards staggered animation
    const cards = cardsContainerRef.current?.querySelectorAll('[data-card]')
    if (cards) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    }
  }, [tickers])

  return (
    <section
      id="watchlist"
      className="relative w-full py-24 bg-void overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between mb-16">
          <div ref={headingRef}>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Today's Watchlist
            </h2>
            <p className="text-lg text-text-muted max-w-2xl">
              {isLoading ? 'Loading AI-scored tickers...' : 'AI-scored tickers with sentiment analysis and live news updates'}
            </p>
          </div>
        </div>

        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16"
        >
          {tickers.map((ticker) => (
            <div key={ticker.symbol} data-card>
              <TickerCard ticker={ticker} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
