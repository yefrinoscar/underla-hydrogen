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
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-xl px-4 py-1.5'
  };
  
  return (
    <div className={`bg-underla-yellow text-white flex flex-col md:flex-row items-center space-x-1 font-medium rounded-default md:rounded-full ${sizeClasses[size]} ${className} px-1.5`}>
      {showIcon && (
        <img src={badge_percent} className="h-4 w-4 stroke-white" alt="%" />
      )}
      <span>
        {discountPercentage}% off
      </span>
    </div>
  );
} 