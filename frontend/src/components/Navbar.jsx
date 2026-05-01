import React, { useEffect } from 'react'
import gsap from 'gsap'
import { TrendingUp, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = React.useRef()

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 100) {
          gsap.to(navRef.current, { duration: 0.3, opacity: 1, y: 0 })
        } else {
          gsap.to(navRef.current, { duration: 0.3, opacity: 0.95, y: 0 })
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '5rem',
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #1E1E1E',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '9999px', backgroundColor: '#10B981' }}></div>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#C0C0C0' }}>MarketBrief</span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#watchlist" style={{ color: '#C0C0C0', textDecoration: 'none', transition: 'color 0.3s' }}>Watchlist</a>
        <a href="#brief" style={{ color: '#C0C0C0', textDecoration: 'none', transition: 'color 0.3s' }}>Brief</a>
        <a href="#alerts" style={{ color: '#C0C0C0', textDecoration: 'none', transition: 'color 0.3s' }}>Alerts</a>
        <a href="#how" style={{ color: '#C0C0C0', textDecoration: 'none', transition: 'color 0.3s' }}>How It Works</a>
      </div>

      {/* Status */}
      <div className="hidden sm:flex items-center gap-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }}></div>
          <span style={{ fontSize: '0.875rem', color: '#555555' }}>Markets open in 42 min</span>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {isOpen && (
        <div style={{ position: 'absolute', top: '5rem', left: 0, right: 0, backgroundColor: '#141414', borderBottom: '1px solid #1E1E1E', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href="#watchlist" style={{ color: '#C0C0C0', textDecoration: 'none', display: 'block' }}>Watchlist</a>
          <a href="#brief" style={{ color: '#C0C0C0', textDecoration: 'none', display: 'block' }}>Brief</a>
          <a href="#alerts" style={{ color: '#C0C0C0', textDecoration: 'none', display: 'block' }}>Alerts</a>
          <a href="#how" style={{ color: '#C0C0C0', textDecoration: 'none', display: 'block' }}>How It Works</a>
        </div>
      )}
    </nav>
  )
}
