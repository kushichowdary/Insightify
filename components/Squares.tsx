import React, { useRef, useEffect } from 'react';
import { Theme } from '../types';

interface GridOffset {
  x: number;
  y: number;
}

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  squareSize?: number;
  theme: Theme;
}

const Squares: React.FC<SquaresProps> = ({
  direction = 'diagonal',
  speed = 0.4,
  squareSize = 50,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<GridOffset | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);

  const colors = theme === 'dark' ? {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    hoverFillColor: 'rgba(255, 255, 255, 0.04)',
    gradientEndColor: '#000000',
  } : {
    borderColor: 'rgba(0, 0, 0, 0.08)',
    hoverFillColor: 'rgba(0, 0, 0, 0.02)',
    gradientEndColor: '#FFFFFF',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numSquaresX.current; i++) {
        for (let j = 0; j < numSquaresY.current; j++) {
          const squareX = i * squareSize - (gridOffset.current.x % squareSize);
          const squareY = j * squareSize - (gridOffset.current.y % squareSize);

          const gridCol = i + Math.floor(gridOffset.current.x / squareSize);
          const gridRow = j + Math.floor(gridOffset.current.y / squareSize);

          if (
            hoveredSquareRef.current &&
            gridCol === hoveredSquareRef.current.x &&
            gridRow === hoveredSquareRef.current.y
          ) {
            ctx.fillStyle = colors.hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = colors.borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.5
      );

      const transparentColor = theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)';
      gradient.addColorStop(0, transparentColor);
      gradient.addColorStop(1, colors.gradientEndColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right':
          gridOffset.current.x -= effectiveSpeed;
          break;
        case 'left':
          gridOffset.current.x += effectiveSpeed;
          break;
        case 'up':
          gridOffset.current.y += effectiveSpeed;
          break;
        case 'down':
          gridOffset.current.y -= effectiveSpeed;
          break;
        case 'diagonal':
          gridOffset.current.x -= effectiveSpeed;
          gridOffset.current.y -= effectiveSpeed;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseXOnGrid = event.clientX - rect.left + gridOffset.current.x;
      const mouseYOnGrid = event.clientY - rect.top + gridOffset.current.y;

      const hoveredSquareX = Math.floor(mouseXOnGrid / squareSize);
      const hoveredSquareY = Math.floor(mouseYOnGrid / squareSize);
      
      if (
        !hoveredSquareRef.current ||
        hoveredSquareRef.current.x !== hoveredSquareX ||
        hoveredSquareRef.current.y !== hoveredSquareY
      ) {
        hoveredSquareRef.current = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [direction, speed, squareSize, colors, theme]);

  return <canvas ref={canvasRef} className="w-full h-full border-none block"></canvas>;
};

export default Squares;
