import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapUtils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...' 
}) => {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Spinner rotation
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "none"
      });

      // Dots animation
      gsap.to('.loading-dot', {
        scale: 1.2,
        opacity: 0.7,
        duration: 0.6,
        stagger: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

      // Pulse effect
      gsap.to('.pulse-ring', {
        scale: 1.5,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: "power2.out"
      });

    }, spinnerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Pulse rings */}
        <div className={`pulse-ring absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20`}></div>
        <div className={`pulse-ring absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20`} style={{ animationDelay: '0.5s' }}></div>
        
        {/* Main spinner */}
        <div 
          ref={spinnerRef}
          className={`${sizeClasses[size]} relative`}
        >
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500"></div>
        </div>
      </div>

      {/* Loading text with animated dots */}
      <div className="text-center">
        <p className="text-gray-600 font-medium text-lg">
          {message}
          <span ref={dotsRef} className="ml-1">
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 