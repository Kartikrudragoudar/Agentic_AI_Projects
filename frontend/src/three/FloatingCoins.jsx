import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { CylinderGeometry, MeshStandardMaterial } from 'three'

export function FloatingCoins() {
  const btcRef = useRef()
  const ethRef = useRef()
  const solRef = useRef()

  useFrame(() => {
    if (btcRef.current) btcRef.current.rotation.z += 0.01
    if (ethRef.current) ethRef.current.rotation.z += 0.008
    if (solRef.current) solRef.current.rotation.z += 0.009
  })

  return (
    <group>
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 10, 5]} intensity={1.5} color="#10B981" />

      {/* Bitcoin Coin */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2} position={[-3, 0, 0]}>
        <mesh ref={btcRef}>
          <cylinderGeometry args={[1, 1, 0.12, 32]} />
          <meshStandardMaterial color="#F7931A" metalness={0.9} roughness={0.1} />
        </mesh>
      </Float>

      {/* Ethereum Coin */}
      <Float speed={1.3} rotationIntensity={1.2} floatIntensity={2.5} position={[0, 1, 0]}>
        <mesh ref={ethRef}>
          <cylinderGeometry args={[1, 1, 0.12, 32]} />
          <meshStandardMaterial color="#627EEA" metalness={0.9} roughness={0.1} />
        </mesh>
      </Float>

      {/* Solana Coin */}
      <Float speed={1.4} rotationIntensity={0.8} floatIntensity={2.2} position={[3, 0.5, 0]}>
        <mesh ref={solRef}>
          <cylinderGeometry args={[1, 1, 0.12, 32]} />
          <meshStandardMaterial color="#10B981" metalness={0.9} roughness={0.1} />
        </mesh>
      </Float>
    </group>
  )
}
