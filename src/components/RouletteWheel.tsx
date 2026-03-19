'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { WHEEL_SEQUENCE, getSpinResult, type SpinResult } from '@/lib/roulette';

interface RouletteWheelProps {
  isSpinning: boolean;
  result: SpinResult | null;
  onSpinComplete: (result: SpinResult) => void;
  serverSpinStartTime?: number | null;
  serverSpinResult?: { number: number; color: string } | null;
}

export default function RouletteWheel({ 
  isSpinning, 
  result, 
  onSpinComplete,
  serverSpinStartTime,
  serverSpinResult
}: RouletteWheelProps) {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [ballRadius, setBallRadius] = useState(130);
  const [showBall, setShowBall] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  const segmentAngle = 360 / 37;

  // Start animation when isSpinning becomes true
  useEffect(() => {
    if (isSpinning && !isAnimating && !completedRef.current) {
      setIsAnimating(true);
      setShowBall(true);
      
      // Calculate wheel final angle
      const wheelSpins = 4 + Math.random() * 2;
      const finalWheelAngle = wheelRotation + wheelSpins * 360 + Math.random() * 360;
      
      // Ball physics
      let currentBallAngle = ballAngle;
      let currentBallVelocity = -(15 + Math.random() * 8);
      let currentBallRadius = 130;
      let isSettling = false;
      
      const gravity = 0.015;
      const friction = 0.992;
      const bounceEnergy = 0.4;
      const minRadius = 108;
      
      const startTime = Date.now();
      const duration = 5000; // 5 seconds animation
      
      // Animation loop
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out progress for wheel
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentWheelAngle = wheelRotation + (finalWheelAngle - wheelRotation) * easeProgress;
        setWheelRotation(currentWheelAngle);
        
        // Ball physics
        currentBallVelocity *= friction;
        
        if (currentBallRadius > minRadius && Math.abs(currentBallVelocity) > 0.5) {
          currentBallRadius -= gravity * (5 + Math.abs(currentBallVelocity) * 0.3);
        }
        
        currentBallAngle += currentBallVelocity;
        
        if (currentBallRadius <= minRadius + 2 && !isSettling) {
          if (Math.random() < 0.03 && Math.abs(currentBallVelocity) > 0.3) {
            currentBallVelocity *= -bounceEnergy;
            currentBallRadius = minRadius + 3 + Math.random() * 5;
          }
          
          if (Math.abs(currentBallVelocity) < 0.15) {
            isSettling = true;
            currentBallVelocity = 0;
            currentBallRadius = minRadius;
          }
        }
        
        setBallAngle(currentBallAngle);
        setBallRadius(currentBallRadius);
        
        if (progress < 1 || !isSettling) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          finishSpin(finalWheelAngle, currentBallAngle);
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Fallback timeout
      timeoutRef.current = setTimeout(() => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        finishSpin(finalWheelAngle, currentBallAngle);
      }, 8000);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSpinning]);

  // Reset when spinning stops
  useEffect(() => {
    if (!isSpinning && isAnimating) {
      setIsAnimating(false);
      completedRef.current = true;
      
      // Reset completed flag after a delay
      setTimeout(() => {
        completedRef.current = false;
      }, 1000);
    }
  }, [isSpinning, isAnimating]);

  const finishSpin = (finalWheelRotation: number, finalBallAngle: number) => {
    if (completedRef.current) return;
    completedRef.current = true;
    
    setIsAnimating(false);
    
    // If we have a server result, use it
    if (serverSpinResult) {
      const spinResult: SpinResult = {
        number: serverSpinResult.number,
        color: serverSpinResult.color as 'red' | 'black' | 'green',
        isOdd: serverSpinResult.number !== 0 && serverSpinResult.number % 2 === 1,
        isEven: serverSpinResult.number !== 0 && serverSpinResult.number % 2 === 0,
      };
      onSpinComplete(spinResult);
      return;
    }

    // Calculate winning number based on where ball stopped
    const ballAngleFromTop = finalBallAngle + 90;
    const relativeAngle = ballAngleFromTop - finalWheelRotation;
    const normalizedAngle = ((relativeAngle % 360) + 360) % 360;
    const segmentIndex = Math.floor(normalizedAngle / segmentAngle) % 37;
    const winningNumber = WHEEL_SEQUENCE[segmentIndex];
    
    const spinResult = getSpinResult(winningNumber);
    onSpinComplete(spinResult);
  };

  const renderWheelSegments = () => {
    const segments = [];
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    
    for (let i = 0; i < 37; i++) {
      const number = WHEEL_SEQUENCE[i];
      const color = number === 0 ? 'green' : (redNumbers.includes(number) ? 'red' : 'black');
      const angle = i * segmentAngle;
      
      segments.push(
        <g key={i} transform={`rotate(${angle} 0 0)`}>
          <path
            d={`M 0 0 L ${Math.sin(segmentAngle * Math.PI / 360) * 150} ${-150} A 150 150 0 0 0 ${-Math.sin(segmentAngle * Math.PI / 360) * 150} ${-150} Z`}
            fill={color === 'red' ? '#dc2626' : color === 'black' ? '#1f2937' : '#16a34a'}
            stroke="#fbbf24"
            strokeWidth="0.5"
          />
          <text
            x={0}
            y={-130}
            fill="white"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            transform={`rotate(${segmentAngle / 2} 0 -130)`}
            style={{ pointerEvents: 'none' }}
          >
            {number}
          </text>
        </g>
      );
    }
    return segments;
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer decorative ring */}
      <div className="absolute w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] rounded-full bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 shadow-2xl border-4 border-amber-400" />
      
      {/* Ball track */}
      <div className="absolute w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-full border-8 border-amber-800/50" />
      
      {/* Wheel - rotates */}
      <div 
        className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px]"
        style={{ transform: `rotate(${wheelRotation}deg)`, transition: 'none' }}
      >
        <svg viewBox="-150 -150 300 300" className="w-full h-full drop-shadow-xl">
          <circle cx="0" cy="0" r="140" fill="none" stroke="#1a1a1a" strokeWidth="8" opacity="0.3" />
          <circle cx="0" cy="0" r="150" fill="#2d1f0f" />
          {renderWheelSegments()}
          <circle cx="0" cy="0" r="105" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />
          <circle cx="0" cy="0" r="40" fill="url(#centerGradient)" stroke="#fbbf24" strokeWidth="2" />
          <defs>
            <radialGradient id="centerGradient">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
          </defs>
          <circle cx="0" cy="0" r="25" fill="#1f1307" stroke="#fbbf24" strokeWidth="1" />
        </svg>
      </div>

      {/* Ball */}
      {showBall && (
        <div
          className="absolute pointer-events-none"
          style={{ transform: `rotate(${ballAngle}deg)` }}
        >
          <div 
            className={`absolute rounded-full shadow-lg transition-all
              ${isAnimating 
                ? 'w-4 h-4 bg-gradient-to-br from-gray-100 via-white to-gray-300 border border-gray-200' 
                : 'w-5 h-5 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-600 animate-pulse'
              }`}
            style={{
              transform: `translateX(-50%) translateY(-50%) translateX(${ballRadius}px)`,
              boxShadow: isAnimating 
                ? 'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.8), 2px 2px 8px rgba(0,0,0,0.4)'
                : '0 0 15px rgba(251, 191, 36, 0.6), 2px 2px 8px rgba(0,0,0,0.4)'
            }}
          />
        </div>
      )}

      {/* Result display */}
      {result && !isAnimating && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-[-50px] sm:top-[-60px] flex items-center gap-2 bg-black/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-amber-500"
        >
          <div 
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg
              ${result.color === 'red' ? 'bg-red-600' : result.color === 'black' ? 'bg-gray-800' : 'bg-green-600'}`}
          >
            {result.number}
          </div>
          <span className="text-white font-semibold text-sm sm:text-base">
            {result.color === 'red' ? 'Rouge' : result.color === 'black' ? 'Noir' : 'Vert'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
