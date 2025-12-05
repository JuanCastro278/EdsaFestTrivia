"use client";

import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
}

const easeOutExpo = (t: number) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export function AnimatedCounter({ from, to, duration = 1500 }: AnimatedCounterProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (from === to) {
        setCount(to);
        return;
    }
    
    let start = 0;
    const startTime = performance.now();
    
    const animateCount = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const elapsedTime = Math.min(progress / duration, 1);
      const easedProgress = easeOutExpo(elapsedTime);
      
      const newCount = Math.floor(easedProgress * (to - from) + from);
      setCount(newCount);
      
      if (progress < duration) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(to);
      }
    };
    
    requestAnimationFrame(animateCount);
  }, [from, to, duration]);

  return <>{count}</>;
}
