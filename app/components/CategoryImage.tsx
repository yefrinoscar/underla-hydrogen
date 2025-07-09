import React from 'react';
// Main category backgrounds
import zona_gamer_bg from '../assets/images-categories/zona-gamer-bg.jpg';
import mundo_tennis_bg from '../assets/images-categories/mundo-tennis-bg.jpg';
import for_girls_bg from '../assets/images-categories/for-girls-bg.jpg';
import apple_bg from '../assets/images-categories/apple-bg.jpg';
import streetwear_bg from '../assets/images-categories/streetwear-bg.jpg';

interface CategoryImageProps {
  handle: string;
  size?: 'small' | 'normal' | 'large';
  isActive?: boolean;
  image?: string;
  fallbackImage?: string;
}

export function CategoryImage({ 
  handle, 
  size = 'normal', 
  isActive = false,
  image,
  fallbackImage 
}: CategoryImageProps) {
  
  // Determine size classes based on the size prop
  const sizeClasses = {
    small: 'w-[40px] h-[40px]',
    normal: 'w-[60px] h-[60px]',
    large: 'w-[80px] h-[80px]'
  }[size];

  // Get the appropriate image
  const imageUrl = image || fallbackImage || getDefaultImage(handle);

  return (
    <div 
      className={`
        relative rounded-full overflow-hidden ${sizeClasses}
        border-2 transition-all duration-300 hover:scale-105
        ${isActive 
          ? 'border-white ring-2 ring-white/50 shadow-lg shadow-white/25' 
          : 'border-white/80 hover:border-white'
        }
      `}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Subtle overlay for better contrast only when not active */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/10 hover:bg-black/5 transition-all duration-300" />
      )}
    </div>
  );
}

function getDefaultImage(handle: string): string {
  // Get the main category handle
  const baseHandle = handle.split('_')[0];
  
  // Map of default images
  const defaultImages: Record<string, string> = {
    'mundo-tennis': mundo_tennis_bg,
    'zona-gamer': zona_gamer_bg,
    'para-ellas': for_girls_bg,
    'mundo-apple': apple_bg,
    'streetwear': streetwear_bg
  };
  
  return defaultImages[baseHandle] || mundo_tennis_bg;
} 