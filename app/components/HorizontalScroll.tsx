import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  itemWidth?: number;
  showArrows?: boolean;
  arrowSize?: 'sm' | 'md' | 'lg';
}

/**
 * Clean horizontal scroll component with simple, smooth arrow animations
 */
export function HorizontalScroll({
  children,
  className = '',
  itemWidth = 200,
  showArrows = true,
  arrowSize = 'md'
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [shouldCenter, setShouldCenter] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const pageWidth = window.innerWidth;
    const needsScroll = scrollWidth > clientWidth;
    const contentFitsInPage = scrollWidth < pageWidth;
    
    setCanScrollLeft(needsScroll && scrollLeft > 1);
    setCanScrollRight(needsScroll && scrollLeft < scrollWidth - clientWidth - 1);
    setShouldCenter(contentFitsInPage);
  }, []);

  const scrollTo = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = itemWidth * 1.5;
    const currentScroll = container.scrollLeft;
    
    let targetScroll;
    if (direction === 'left') {
      targetScroll = Math.max(0, currentScroll - scrollAmount);
    } else {
      targetScroll = Math.min(
        container.scrollWidth - container.clientWidth,
        currentScroll + scrollAmount
      );
    }

    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, [itemWidth]);

  const arrowConfig = {
    sm: { button: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { button: 'w-10 h-10', icon: 'w-5 h-5' },
    lg: { button: 'w-12 h-12', icon: 'w-6 h-6' }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    
    scrollElement.addEventListener('scroll', checkScrollPosition, { passive: true });
    setTimeout(checkScrollPosition, 100);
    
    return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
  }, [checkScrollPosition, children]);

  return (
    <>
      {/* Placeholder to maintain layout space */}
      <div
        ref={containerRef}
        className={`relative h-[240px] w-screen ${className}`}
      />

      {/* Floating scroll container */}
      <div className="absolute left-0 right-0 h-[240px] z-[1000] pointer-events-none">
        
        {/* Left Arrow - Simple and clean */}
        {showArrows && canScrollLeft && (
          <button
            onClick={() => scrollTo('left')}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-auto
              ${arrowConfig[arrowSize].button}
              bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md
              flex items-center justify-center
              hover:bg-white hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              transition-all duration-200 ease-out
            `}
            aria-label="Scroll left"
          >
            <svg className={`${arrowConfig[arrowSize].icon} text-gray-700`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Full width scroll content */}
        <div
          ref={scrollRef}
          className={`
            w-full pointer-events-auto
            flex gap-4 overflow-x-auto scroll-smooth pl-4 md:pl-8 xl:pl-0
            backdrop-blur-xl rounded-2xl border border-white/20
            scrollbar-hide
            ${shouldCenter ? 'justify-center' : ''}
          `}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overscrollBehaviorX: 'contain'
          }}
        >
          {children}
        </div>

        {/* Right Arrow - Simple and clean */}
        {showArrows && canScrollRight && (
          <button
            onClick={() => scrollTo('right')}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-auto
              ${arrowConfig[arrowSize].button}
              bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md
              flex items-center justify-center
              hover:bg-white hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              transition-all duration-200 ease-out
            `}
            aria-label="Scroll right"
          >
            <svg className={`${arrowConfig[arrowSize].icon} text-gray-700`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Hide scrollbar styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />
    </>
  );
}

export { HorizontalScroll as HorizontalScrollWithMomentum };
