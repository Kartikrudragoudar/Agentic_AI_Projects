import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
// Three.js classes are automatically resolved by R3F JSX elements

export function CandlestickScene() {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#10B981" />

      {/* Candlestick bars */}
      {[
        { height: 1.2, color: '#10B981', x: -3 },
        { height: 0.8, color: '#EF4444', x: -2.2 },
        { height: 1.5, color: '#10B981', x: -1.4 },
        { height: 0.6, color: '#EF4444', x: -0.6 },
        { height: 1.8, color: '#10B981', x: 0.2 },
        { height: 1.1, color: '#10B981', x: 1.0 },
        { height: 0.7, color: '#EF4444', x: 1.8 },
        { height: 1.3, color: '#10B981', x: 2.6 },
        { height: 0.9, color: '#EF4444', x: 3.4 },
      ].map((candle, i) => (
        <Float key={i} speed={1} rotationIntensity={0}>
          <mesh position={[candle.x, candle.height / 2, 0]}>
            <boxGeometry args={[0.6, candle.height, 0.2]} />
            <meshStandardMaterial color={candle.color} roughness={0.3} metalness={0.7} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
