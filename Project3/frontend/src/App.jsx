import React from 'react'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { WatchlistSection } from './components/WatchlistSection'
import { AlertsSection } from './components/AlertsSection'
import { MorningBriefSection } from './components/MorningBriefSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import './index.css'

function App() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#C0C0C0', overflowX: 'hidden' }}>
      <Navbar />

      <main>
        <HeroSection />
        <WatchlistSection />
        <AlertsSection />
        <MorningBriefSection />
        <HowItWorksSection />

        <footer style={{ width: '100%', paddingTop: '3rem', paddingBottom: '3rem', backgroundColor: '#141414', borderTop: '1px solid #1E1E1E' }}>
          <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center', color: '#555555' }}>
            <p style={{ marginBottom: '0.5rem' }}>Stock & Crypto Morning Brief</p>
            <p style={{ fontSize: '0.875rem' }}>AI-powered market intelligence delivered before NSE opens</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem' }}>
              <a href="#" style={{ color: '#10B981', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: '#10B981', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: '#10B981', textDecoration: 'none' }}>GitHub</a>
              <a href="#" style={{ color: '#10B981', textDecoration: 'none' }}>Twitter</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
