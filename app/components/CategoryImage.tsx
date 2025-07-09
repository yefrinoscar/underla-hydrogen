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

interface CategoryCardProps {
  handle: string;
  title: string;
  isActive?: boolean;
  image?: string;
  fallbackImage?: string;
  size?: 'small' | 'normal' | 'large';
}

// New unified CategoryCard component with background and text
export function CategoryCard({ 
  handle, 
  title,
  isActive = false,
  image,
  fallbackImage,
  size = 'normal'
}: CategoryCardProps) {
  
  // Determine size classes based on the size prop
  const sizeClasses = {
    small: 'w-[60px] h-[60px]',
    normal: 'w-[80px] h-[80px]',
    large: 'w-[100px] h-[100px]'
  }[size];

  // Get the appropriate image
  const imageUrl = image || fallbackImage || getDefaultImage(handle);

  // Function to format long titles
  const formatTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length <= 2) return title;
    
    const midPoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midPoint).join(' ');
    const secondLine = words.slice(midPoint).join(' ');
    
    return (
      <>
        <span className="block leading-tight">{firstLine}</span>
        <span className="block leading-tight">{secondLine}</span>
      </>
    );
  };

  return (
    <div className="group flex flex-col items-center gap-3 transition-all duration-500 ease-out">
      {/* Unified background container */}
      <div 
        className={`
          relative rounded-2xl overflow-hidden transition-all duration-500 ease-out
          ${isActive 
            ? 'bg-white/20 backdrop-blur-sm border-2 border-white shadow-xl shadow-white/25 scale-110' 
            : 'bg-white/5 backdrop-blur-sm border border-white/40 hover:bg-white/10 hover:border-white/60 hover:scale-105'
          }
          p-4 min-h-[120px] flex flex-col items-center justify-center gap-3
        `}
      >
        {/* Category Image */}
        <div 
          className={`
            relative rounded-full overflow-hidden ${sizeClasses}
            transition-all duration-300
            ${isActive 
              ? 'ring-2 ring-white/80 shadow-lg' 
              : 'ring-1 ring-white/40'
            }
          `}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          
          {/* Subtle overlay for better contrast */}
          <div className={`
            absolute inset-0 transition-all duration-300
            ${isActive ? 'bg-black/5' : 'bg-black/20 group-hover:bg-black/10'}
          `} />
        </div>

        {/* Category Title */}
        <div className={`
          text-center transition-all duration-300 min-h-[2.5rem] flex items-center justify-center
          ${isActive 
            ? 'text-white font-bold text-sm' 
            : 'text-white/90 group-hover:text-white font-medium text-xs'
          }
        `}>
          {formatTitle(title)}
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full opacity-80" />
        )}
      </div>
    </div>
  );
}

// Keep the original CategoryImage for backward compatibility
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
          ? 'border-white ring-3 ring-underla-500/50 shadow-lg  border-6' 
          : 'border-white/80 hover:border-white border-4'
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