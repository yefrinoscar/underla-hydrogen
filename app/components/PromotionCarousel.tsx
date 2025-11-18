import { Link } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { Promotion } from "~/types/promotion";
import { ChevronLeft, ChevronRight, Play, Pause, ShoppingBag, ShoppingCart } from "lucide-react";

interface PromotionCarouselProps {
  promotions: Promotion[];
}

export function PromotionCarousel({ promotions }: PromotionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progressKey, setProgressKey] = useState(0); // Key to restart animation

  // Don't render if no promotions
  if (!promotions || promotions.length === 0) {
    return null;
  }

  // Debug logging
  console.log('PromotionCarousel: promotions count:', promotions.length);
  console.log('PromotionCarousel: promotions data:', promotions);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
    );
  }, [promotions.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? promotions.length - 1 : prevIndex - 1
    );
  }, [promotions.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    // Reset progress animation when manually navigating
    setProgressKey(prev => prev + 1);
  }, []);

  const handleManualNavigation = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next') {
      nextSlide();
    } else {
      prevSlide();
    }
    // Reset progress animation when manually navigating
    setProgressKey(prev => prev + 1);
  }, [nextSlide, prevSlide]);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlay || promotions.length <= 1) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, nextSlide, promotions.length]);

  // Load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const currentPromotion = promotions[currentIndex];

  return (
    <div className="w-full">
      <div className="container-app">
        {/* Main Carousel Container */}
        <div
          className={`relative h-[220px] rounded-2xl text-white overflow-hidden shadow-lg transform transition-all duration-700 ease-in-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-[-20px] opacity-0"
          }`}
        >
          {/* Carousel Slides */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {promotions.map((promotion, index) => (
              <div
                key={promotion.id}
                className="w-full flex-shrink-0 relative"
                style={{
                  backgroundImage: `url(${promotion.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundColor: 'transparent'
                }}
              >
                <Link
                  to={`/promotions/${promotion.tags.toLowerCase()}`}
                  className="relative block h-full"
                >
                  <div 
                    className="px-6 py-6 md:px-12 md:py-8 h-full flex w-full"
                    style={{
                      background: `linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 70%)`
                    }}
                  >
                    <div className="w-full flex items-center">
                      <div className="flex-1 flex flex-col justify-center gap-4 max-w-3xl">
                        <div className="space-y-2">
                          <h2 
                            className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg"
                            style={{ color: promotion.text_color }}
                          >
                            {promotion.title}
                          </h2>
                          {promotion.description && (
                            <p 
                              className="text-base md:text-xl font-medium opacity-95 line-clamp-2 leading-relaxed drop-shadow-md"
                              style={{ color: promotion.text_color }}
                            >
                              {promotion.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <button 
                            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 md:px-10 md:py-4 text-base md:text-lg font-bold rounded-full bg-white text-neutral-900 hover:bg-neutral-50 transition-all duration-300 ease-out transform hover:scale-105 shadow-xl hover:shadow-2xl"
                          >
                            <span>{promotion.button_text || 'Comprar ahora'}</span>
                            <ChevronRight className='h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1.5' strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Only show if more than 1 promotion */}
          {promotions.length > 1 && (
            <>
              <button
                onClick={() => handleManualNavigation('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={() => handleManualNavigation('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110"
                aria-label="Next promotion"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Enhanced Progress Indicators & Play/Pause Control */}
        {promotions.length > 1 && (
          <div className="flex justify-center items-center mt-4 gap-4">
            {/* Progressive Circle Indicators */}
            <div className="flex gap-3">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="relative w-6 h-6 flex items-center justify-center group"
                  aria-label={`Go to promotion ${index + 1}`}
                >
                  {/* Background Circle */}
                  <div className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-200" />
                  
                  {/* Progress Ring - Only for active slide */}
                  {index === currentIndex && isAutoPlay && (
                    <svg 
                      key={progressKey}
                      className="absolute inset-0 w-6 h-6 -rotate-90"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="62.83"
                        strokeDashoffset="62.83"
                        style={{
                          animation: 'fillProgress 5s linear infinite',
                          animationPlayState: isAutoPlay ? 'running' : 'paused'
                        }}
                      />
                    </svg>
                  )}
                  
                  {/* Center Dot */}
                  <div 
                    className={`relative z-10 w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-125 ${
                      index === currentIndex 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/60 group-hover:bg-white/80'
                    }`}
                  />
                  
                  {/* Ripple Effect for Active */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Play/Pause Control with Enhanced Design */}
            <div className="flex items-center ml-2">
              <div className="w-px h-4 bg-white/30 mr-3" /> {/* Separator */}
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className="relative bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110 group"
                aria-label={isAutoPlay ? "Pause autoplay" : "Start autoplay"}
              >
                {isAutoPlay ? (
                  <Pause className="h-3 w-3 text-white group-hover:text-white/90" />
                ) : (
                  <Play className="h-3 w-3 text-white ml-0.5 group-hover:text-white/90" />
                )}
                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fillProgress {
            from { stroke-dashoffset: 62.83; }
            to { stroke-dashoffset: 0; }
          }
        `
      }} />
    </div>
  );
} 
