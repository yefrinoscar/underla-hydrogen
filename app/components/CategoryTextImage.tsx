import React from 'react';
import { getCategoryColor } from './CategoryIcon';

interface CategoryTextImageProps {
  handle: string;
  size?: 'small' | 'normal' | 'large';
}

export function CategoryTextImage({ handle, size = 'normal' }: CategoryTextImageProps) {
  // Get the first letter of the category name
  const firstLetter = handle.charAt(0).toUpperCase();
  
  // Determine SVG size based on the size prop
  const svgSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;
  
  // Get a color for the background that complements the category's gradient
  const colorClass = getCategoryColor(handle);
  const backgroundColor = getBackgroundColorFromClass(colorClass);
  
  return (
    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle with radial gradient */}
      <defs>
        <radialGradient id={`grad-${handle}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Main circle */}
      <circle cx="50" cy="50" r="48" fill={backgroundColor} />
      
      {/* Overlay pattern */}
      <circle cx="50" cy="50" r="48" fill={`url(#grad-${handle})`} />
      
      {/* Text */}
      <text 
        x="50" 
        y="50" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fill="white" 
        fontFamily="sans-serif" 
        fontWeight="bold"
        fontSize="50"
      >
        {firstLetter}
      </text>
    </svg>
  );
}

// Helper function to extract a background color from gradient class
function getBackgroundColorFromClass(colorClass: string): string {
  // Map gradient classes to solid colors
  const colorMap: Record<string, string> = {
    'from-blue-500 to-blue-600': '#3B82F6',
    'from-emerald-500 to-emerald-600': '#10B981',
    'from-cyan-500 to-cyan-600': '#06B6D4',
    'from-purple-500 to-purple-600': '#8B5CF6',
    'from-indigo-500 to-indigo-600': '#6366F1',
    'from-sky-500 to-sky-600': '#0EA5E9',
    'from-pink-500 to-pink-600': '#EC4899',
    'from-rose-500 to-rose-600': '#F43F5E',
    'from-red-500 to-red-600': '#EF4444',
  };
  
  return colorMap[colorClass] || '#3B82F6'; // Default to blue if no match
}
