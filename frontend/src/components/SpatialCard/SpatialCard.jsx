import React, { useState } from 'react';
import './SpatialCard.css';

const SpatialCard = ({
  children,
  className = '',
  onClick,
  hover = true,
  interactive = false,
  elevation = 'default',
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!hover || !interactive) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientY - centerY) / 10;
    const y = -(e.clientX - centerX) / 10;

    setTilt({ x: Math.max(-5, Math.min(5, x)), y: Math.max(-5, Math.min(5, y)) });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const transform = interactive
    ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${elevation === 'hover' ? '50px' : '20px'})`
    : `translateZ(20px)`;

  return (
    <div
      className={`spatial-card ${className} elevation-${elevation}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default SpatialCard;
