import React, { useEffect, useRef } from 'react';
import './PerspectiveChart.css';

const PerspectiveChart = ({ data, height = 200, isProfit = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = height;

    const width = canvas.width;
    const chartHeight = canvas.height;
    const padding = 20;

    // Find min and max values
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, chartHeight);

    // Calculate points
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = chartHeight - padding - ((value - min) / range) * (chartHeight - padding * 2);
      return { x, y };
    });

    // Draw gradient area under curve
    const color = isProfit ? 'rgba(0, 179, 134' : 'rgba(239, 83, 80';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, chartHeight - padding);
    
    // Draw quadratic curve
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        ctx.lineTo(points[0].x, points[0].y);
      } else {
        const xc = (points[i - 1].x + points[i].x) / 2;
        const yc = (points[i - 1].y + points[i].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
    }
    
    ctx.lineTo(points[points.length - 1].x, chartHeight - padding);
    ctx.closePath();

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    gradient.addColorStop(0, `${color}, 0.3)`);
    gradient.addColorStop(1, `${color}, 0.01)`);
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.strokeStyle = isProfit ? '#00b386' : '#ef5350';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        ctx.moveTo(points[i].x, points[i].y);
      } else {
        const xc = (points[i - 1].x + points[i].x) / 2;
        const yc = (points[i - 1].y + points[i].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
    }
    
    ctx.stroke();

    // Draw glow effect
    ctx.shadowColor = isProfit ? 'rgba(0, 179, 134, 0.5)' : 'rgba(239, 83, 80, 0.5)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowColor = 'transparent';

  }, [data, height, isProfit]);

  return (
    <div className="perspective-chart">
      <canvas
        ref={canvasRef}
        className="perspective-chart__canvas"
        style={{ width: '100%', height: `${height}px` }}
      />
    </div>
  );
};

export default PerspectiveChart;
