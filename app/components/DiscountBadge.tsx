import React from 'react';
import badge_percent from '../assets/badge-percent.svg';

interface DiscountBadgeProps {
  discountPercentage: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DiscountBadge({
  discountPercentage,
  className = '',
  showIcon = true,
  size = 'md'
}: DiscountBadgeProps) {
  if (discountPercentage <= 0) return null;
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-2 py-1',
    lg: 'text-xl px-4 py-1.5'
  };
  
  return (
    <div className={`bg-underla-yellow text-white font-semibold flex flex-col md:flex-row items-center space-x-1 rounded-[10px] ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <img src={badge_percent} className="px-2 h-4 w-4 stroke-white" alt="%" />
      )}
      <span>
        {discountPercentage}% off
      </span>
    </div>
  );
} 