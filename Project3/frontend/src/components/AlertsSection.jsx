import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { AlertCircle, TrendingUp, Volume2 } from 'lucide-react'
import { marketAPI } from '../api/marketAPI'

gsap.registerPlugin(ScrollTrigger)

export function AlertsSection() {
  const alertsRef = useRef([])
  const [apiAlerts, setApiAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fallbackAlerts = [
    {
      id: 1,
      type: 'volume',
      title: 'HDFCBANK.NS: Volume 3.1x above average',
      timestamp: '08:12 IST',
      icon: Volume2,
    },
    {
      id: 2,
      type: 'price',
      title: 'BITCOIN: Crossed 7-day high of $62,800',
      timestamp: '08:10 IST',
      icon: TrendingUp,
    },
    {
      id: 3,
      type: 'alert',
      title: 'NIFTY 50: Pre-market down 0.34%',
      timestamp: '08:05 IST',
      icon: AlertCircle,
    },
    {
      id: 4,
      type: 'price',
      title: 'RELIANCE.NS: Touched intraday high of ₹2,861',
      timestamp: '08:02 IST',
      icon: TrendingUp,
    },
  ]

  const alerts = apiAlerts.length ? apiAlerts : fallbackAlerts

  useEffect(() => {
    let isMounted = true

    marketAPI
      .getAlerts()
      .then((response) => {
        const nextAlerts = (response.data.alerts || []).map((alert, index) => ({
          id: alert.id || index + 1,
          type: alert.type || 'alert',
          title: alert.title,
          timestamp: alert.timestamp
            ? new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) + ' IST'
            : 'Latest',
          icon: alert.type === 'volume' ? Volume2 : alert.type === 'price' ? TrendingUp : AlertCircle,
        }))

        if (isMounted) setApiAlerts(nextAlerts)
      })
      .catch(() => {
        if (isMounted) setApiAlerts([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    // Use gsap.context for proper React cleanup
    const ctx = gsap.context(() => {
      alertsRef.current.forEach((element, index) => {
        if (!element) return
        // Set initial state explicitly
        gsap.set(element, { opacity: 0, x: -40 })
        gsap.to(element, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        })
      })
    })

    // Refresh ScrollTrigger after a brief delay to handle timing issues
    const timer = setTimeout(() => ScrollTrigger.refresh(), 150)

    return () => {
      ctx.revert()
      clearTimeout(timer)
    }
  }, [alerts])

  return (
    <section id="alerts" className="w-full py-24 bg-void overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 border-l-4 border-accent pl-4">
            Live Alerts
          </h2>
          <p className="text-lg text-text-muted">
            {isLoading ? 'Loading market movements...' : 'Real-time market movements and unusual activity'}
          </p>
        </div>

        <div className="space-y-4 max-w-3xl">
          {alerts.map((alert, index) => {
            const IconComponent = alert.icon
            return (
              <div
                key={alert.id}
                ref={(el) => {
                  if (el) alertsRef.current[index] = el
                }}
                className="flex items-center gap-4 p-4 bg-surface border border-border rounded-lg hover:border-accent/30 transition-all cursor-pointer group"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-surface-2 group-hover:bg-accent/20 transition">
                  <IconComponent
                    size={20}
                    className={alert.type === 'alert' ? 'text-red' : 'text-accent'}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary font-mono">
                    {alert.title}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-text-muted">
                  {alert.timestamp}
                </div>
              </div>
            )
          })}
        </div>

        {/* More alerts link */}
        <div className="mt-8 text-center">
          <button className="text-accent hover:text-accent/80 text-sm font-semibold transition">
            View All Alerts →
          </button>
        </div>
      </div>
    </section>
  )
}
