import React, { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Download } from 'lucide-react'
import { marketAPI } from '../api/marketAPI'

gsap.registerPlugin(ScrollTrigger)

export function MorningBriefSection() {
  const containerRef = useRef()
  const [dashboard, setDashboard] = useState(null)
  const [brief, setBrief] = useState(null)

  const fallbackBriefSections = [
    {
      title: 'Market Indices',
      content: [
        { label: 'NIFTY 50', value: '22,450', change: '-0.34%' },
        { label: 'SENSEX', value: '73,820', change: '-0.28%' },
        { label: 'NIFTY BANK', value: '48,920', change: '+0.15%' },
      ],
    },
    {
      title: 'Top Picks (Score 70+)',
      content: [
        { ticker: 'RELIANCE.NS', score: 82, sentiment: 'Bullish' },
        { ticker: 'INFY.NS', score: 78, sentiment: 'Bullish' },
        { ticker: 'BITCOIN', score: 79, sentiment: 'Bullish' },
      ],
    },
    {
      title: 'Crypto Brief',
      content: [
        { ticker: 'BTC', price: '$64,200', change: '+3.12%' },
        { ticker: 'ETH', price: '$3,420', change: '+2.85%' },
        { ticker: 'SOL', price: '$145.50', change: '+4.20%' },
      ],
    },
    {
      title: 'Full Brief',
      content: 'Download or read the complete analysis with detailed insights on each ticker, sentiment scores, and actionable alerts.',
      isDownload: true,
    },
  ]

  const briefSections = useMemo(() => {
    if (!dashboard) return fallbackBriefSections

    const indices = Object.entries(dashboard.prices?.indices || {}).map(([, index]) => ({
      label: index.name,
      value: Number(index.price || 0).toLocaleString('en-IN'),
      change: `${index.pct_change >= 0 ? '+' : ''}${Number(index.pct_change || 0).toFixed(2)}%`,
    }))

    const scores = dashboard.scores?.scores || {}
    const sentiments = dashboard.sentiment?.results || {}
    const topPicks = Object.entries(scores)
      .filter(([, item]) => item.highlight || item.score >= 70)
      .sort(([, a], [, b]) => a.rank - b.rank)
      .map(([symbol, item]) => ({
        ticker: symbol.toUpperCase(),
        score: item.score,
        sentiment: sentiments[symbol]?.sentiment || 'Neutral',
      }))

    const crypto = Object.entries(dashboard.prices?.crypto || {}).map(([symbol, item]) => ({
      ticker: symbol.toUpperCase(),
      price: `$${Number(item.price_usd || 0).toLocaleString('en-US')}`,
      change: `${item.pct_change_24h >= 0 ? '+' : ''}${Number(item.pct_change_24h || 0).toFixed(2)}%`,
    }))

    return [
      { title: 'Market Indices', content: indices.length ? indices : fallbackBriefSections[0].content },
      { title: 'Top Picks (Score 70+)', content: topPicks.length ? topPicks : fallbackBriefSections[1].content },
      { title: 'Crypto Brief', content: crypto.length ? crypto : fallbackBriefSections[2].content },
      {
        title: 'Full Brief',
        content: brief?.content || fallbackBriefSections[3].content,
        isDownload: true,
      },
    ]
  }, [dashboard, brief])

  useEffect(() => {
    let isMounted = true

    Promise.allSettled([marketAPI.getDashboard(), marketAPI.getBrief()]).then((results) => {
      if (!isMounted) return

      if (results[0].status === 'fulfilled') setDashboard(results[0].value.data)
      if (results[1].status === 'fulfilled') setBrief(results[1].value.data)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const downloadBrief = () => {
    const content = brief?.content || '# Morning Market Brief\n\nBrief is not available yet.'
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'morning_brief.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // Horizontal scroll effect using GSAP
    const proxy = { skew: 0 },
      skewSetter = gsap.quickSetter('.scroll-content', 'skewY', 'deg'),
      clamp = gsap.utils.clamp(-20, 20)

    gsap.set('.scroll-wrapper', { transformOrigin: 'center center', force3D: true })

    ScrollTrigger.create({
      onUpdate: (self) => {
        let skew = clamp(self.getVelocity() / 300)
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew
          skewSetter(skew)
        }
      },
    })

    gsap.set('.scroll-content', { skewY: 0 }, 0)

    gsap.to(proxy, {
      skew: 0,
      duration: 0.8,
      ease: 'power3',
      overwrite: 'auto',
    })
  }, [])

  return (
    <section
      id="brief"
      className="w-full py-24 bg-void overflow-hidden"
    >
      <div className="container mx-auto px-6 mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Morning Brief
        </h2>
        <p className="text-lg text-text-muted max-w-2xl">
          Your comprehensive daily market analysis delivered before markets open
        </p>
      </div>

      <div
        ref={containerRef}
        className="scroll-wrapper w-full overflow-x-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="scroll-content flex gap-6 px-6 pb-8 min-w-max">
          {briefSections.map((section, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-96 h-96 bg-surface border border-border rounded-2xl p-8 hover:border-accent/40 transition-all card-hover"
            >
              <h3 className="text-xl font-bold text-accent mb-6 pb-4 border-b border-border">
                {section.title}
              </h3>

              {section.isDownload ? (
                <div className="h-64 flex flex-col items-center justify-center">
                  <p className="text-center text-text-muted mb-6 text-sm leading-relaxed">
                    {typeof section.content === 'string' ? section.content.slice(0, 180) : fallbackBriefSections[3].content}
                  </p>
                  <button
                    onClick={downloadBrief}
                    className="flex items-center gap-2 px-6 py-2 bg-accent text-void rounded-lg hover:bg-opacity-90 transition font-semibold"
                  >
                    <Download size={18} />
                    Download Brief
                  </button>
                </div>
              ) : (
                <div className="space-y-4 h-64 overflow-y-auto pr-2">
                  {section.content.map((item, i) => (
                    <div key={i} className="text-sm">
                      {item.ticker ? (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-text-primary font-semibold">
                            {item.ticker}
                          </span>
                          <span className={item.change?.includes('+') || item.sentiment === 'Bullish' ? 'text-accent' : 'text-red'}>
                            {item.score ? `${item.score}/100 ${item.sentiment}` : `${item.price} ${item.change}`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between py-1">
                          <span className="text-text-muted">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-text-primary">
                              {item.value}
                            </span>
                            <span className={item.change?.includes('+') ? 'text-accent' : 'text-red'}>
                              {item.change}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
