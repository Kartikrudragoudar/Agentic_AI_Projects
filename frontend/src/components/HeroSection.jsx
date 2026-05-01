import React from 'react'
import { Canvas } from '@react-three/fiber'
import { ParticleField } from '../three/ParticleField'
import { CandlestickScene } from '../three/CandlestickScene'

export function HeroSection() {
  const handleCTAClick = () => {
    document.getElementById('watchlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative w-full bg-void overflow-hidden flex items-center" style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '2rem' }}>
      {/* 3D Background */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 75 }}
        >
          <ParticleField />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-surface border border-border">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">
              AI-Powered Market Intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-text-primary">Your market.</span>
            <br />
            <span className="text-accent">Every morning.</span>
          </h1>

          <p className="text-lg text-text-muted mb-8 leading-relaxed">
            4 AI agents fetch, analyse and score your watchlist before NSE opens at 9:15 AM IST. Get your morning brief on Telegram with sentiment scores, alerts, and top picks.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
            <button
              onClick={handleCTAClick}
              className="px-8 py-3 bg-accent text-void font-semibold rounded-lg hover:bg-opacity-90 transition transform hover:scale-105"
            >
              View Today's Brief
            </button>
            <button className="px-8 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10 transition">
              Learn More
            </button>
          </div>

          {/* Market Status */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-border">
              <span className="font-mono text-text-primary">NIFTY 50</span>
              <span className="font-bold text-text-primary">22,450</span>
              <span className="text-red">-0.34%</span>
            </div>
          </div>
        </div>

        {/* Right 3D Scene */}
        <div className="flex-1 hidden lg:block h-96">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
          >
            <CandlestickScene />
          </Canvas>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="text-center">
          <svg
            className="w-6 h-6 text-accent mx-auto"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  )
}
