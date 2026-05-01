import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import { BoxGeometry } from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function DockerBox({ label, color, index }) {
  const groupRef = useRef()
  const edgesRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      // gentle continuous rotation
      groupRef.current.rotation.y += 0.004
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.15
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef}>
        {/* Solid semi-transparent box */}
        <mesh>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.3}
            transparent
            opacity={0.15}
          />
        </mesh>

        {/* Wireframe edges as a separate lineSegments mesh */}
        <lineSegments ref={edgesRef}>
          <edgesGeometry args={[new BoxGeometry(1.8, 1.8, 1.8)]} />
          <lineBasicMaterial color="#10B981" linewidth={1} />
        </lineSegments>

        {/* HTML label — no font file needed */}
        <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div style={{
            color: '#10B981',
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '0 0 8px #10B981',
            padding: '2px 6px',
            background: 'rgba(10,10,10,0.7)',
            borderRadius: '4px',
            border: '1px solid rgba(16,185,129,0.4)',
          }}>
            {label}
          </div>
        </Html>
      </group>
    </Float>
  )
}

const BOX_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']

export function HowItWorksSection() {
  const steps = [
    {
      label: 'Fetcher',
      description: 'Fetches live prices, volume, and news headlines from yfinance and CoinGecko API',
      icon: '📊',
    },
    {
      label: 'Sentiment',
      description: 'Groq LLM analyzes market mood based on price data and news headlines',
      icon: '🤖',
    },
    {
      label: 'Scorer',
      description: 'Scores each ticker 0-100 based on sentiment, momentum, volume, and preferences',
      icon: '⭐',
    },
    {
      label: 'Formatter',
      description: 'Generates Markdown brief and sends to Telegram with alerts and insights',
      icon: '📝',
    },
  ]

  return (
    <section id="how" className="w-full py-24 bg-void overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-text-muted max-w-2xl">
            4 AI agents running in Docker containers process your data sequentially
          </p>
        </div>

        {/* 3D Scene placeholder */}
        <div className="mb-16 h-96 bg-surface border border-border rounded-2xl flex items-center justify-center overflow-hidden">
          <Canvas camera={{ position: [0, 0, 8] }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#10B981" />

            {/* Render boxes in a row */}
            {steps.map((step, idx) => (
              <group key={idx} position={[(idx - 1.5) * 4, 0, 0]}>
                <DockerBox label={step.label} color={BOX_COLORS[idx]} index={idx} />
              </group>
            ))}
          </Canvas>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-xl p-6">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-lg font-bold text-accent mb-2">Step {idx + 1}: {step.label}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {step.description}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center">
                  <div className="text-2xl text-accent">→</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-16 p-8 bg-surface border border-border rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-6">Daily Schedule (IST)</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-accent text-void font-bold">08:00</div>
              <div>
                <p className="font-semibold text-text-primary">Pipeline Start</p>
                <p className="text-sm text-text-muted">All agents begin processing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-2 border border-accent text-accent font-bold">08:02</div>
              <div>
                <p className="font-semibold text-text-primary">Brief Generated</p>
                <p className="text-sm text-text-muted">Telegram message sent to your chat</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-border text-text-muted font-bold">09:15</div>
              <div>
                <p className="font-semibold text-text-primary">Markets Open</p>
                <p className="text-sm text-text-muted">NSE opens for trading</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
