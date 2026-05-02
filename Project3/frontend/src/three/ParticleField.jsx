import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export function ParticleField() {
  const ref = useRef()
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.0001
      ref.current.rotation.y += 0.00015

      // Mouse parallax effect
      ref.current.position.x += (mousePos.current.x * 0.1 - ref.current.position.x) * 0.1
      ref.current.position.y += (mousePos.current.y * 0.1 - ref.current.position.y) * 0.1
    }
  })

  const particlesCount = 1500
  const positions = new Float32Array(particlesCount * 3)

  for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 2000
    positions[i + 1] = (Math.random() - 0.5) * 2000
    positions[i + 2] = (Math.random() - 0.5) * 2000
  }

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          sizeAttenuation
          size={4}
          sizeRange={[1, 10]}
          color="#10B981"
          opacity={0.6}
          transparent
          depthWrite={false}
        />
      </Points>
    </group>
  )
}
