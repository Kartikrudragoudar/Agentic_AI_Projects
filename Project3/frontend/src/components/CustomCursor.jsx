import React, { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const dotRef = useRef()
  const ringRef = useRef()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top = e.clientY + 'px'
      }

      if (ringRef.current) {
        ringRef.current.style.left = e.clientX + 'px'
        ringRef.current.style.top = e.clientY + 'px'
      }
    }

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  return (
    <>
      {/* Dot cursor */}
      <div
        ref={dotRef}
        className="fixed w-2 h-2 bg-accent rounded-full pointer-events-none z-50"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.05s ease-out',
        }}
      />

      {/* Ring cursor */}
      <div
        ref={ringRef}
        className="fixed w-8 h-8 border border-accent rounded-full pointer-events-none z-50"
        style={{
          left: 0,
          top: 0,
          opacity: 0.4,
          transform: `translate(-50%, -50%) scale(${isHovering ? 2 : 1})`,
          transition: 'all 0.1s ease-out',
        }}
      />
    </>
  )
}
