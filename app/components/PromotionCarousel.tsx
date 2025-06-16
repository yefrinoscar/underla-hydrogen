import { Link } from "@remix-run/react";
import { useEffect, useState, useCallback } from "react";
import { Promotion } from "~/types/promotion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface PromotionCarouselProps {
  promotions: Promotion[];
}

export function PromotionCarousel({ promotions }: PromotionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Don't render if no promotions
  if (!promotions || promotions.length === 0) {
    return null;
  }

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
  }, []);

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
    <div className="w-full mb-4 pt-6 pb-2">
      <div className="relative max-w-7xl mx-4 md:mx-auto">
        {/* Main Carousel Container */}
        <div
          className={`relative h-[75px] md:h-[85px] rounded-[20px] text-white overflow-hidden shadow-lg transform transition-all duration-700 ease-in-out ${
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
                  to={promotion.condition_type === 'tags' 
                    ? `/promotions/${promotion.condition_value.toLowerCase()}` 
                    : `/products/${promotion.id}`}
                  className="relative block h-full"
                >
                  <div 
                    className="px-4 py-3 sm:px-6 lg:px-8 h-full flex w-full"
                    style={{
                      background: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)`
                    }}
                  >
                    <div className="w-full flex items-center justify-between flex-wrap">
                      <div className="flex-1 flex items-center h-full justify-center md:justify-start">
                        <span className="flex p-2 animate-pulse">
                          <svg
                            className="h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                            />
                          </svg>
                        </span>
                        <div className="ml-3 font-medium truncate flex flex-col">
                          <span className="inline md:hidden">{promotion.title}</span>
                          <span className="hidden md:inline text-lg font-bold">{promotion.title}</span>
                          <span className="hidden md:inline text-sm">{promotion.description}</span>
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
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
                aria-label="Next promotion"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </>
          )}

          {/* Auto-play control - Only show if more than 1 promotion */}
          {promotions.length > 1 && (
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              aria-label={isAutoPlay ? "Pause autoplay" : "Start autoplay"}
            >
              {isAutoPlay ? (
                <Pause className="h-3 w-3 text-white" />
              ) : (
                <Play className="h-3 w-3 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Circle Indicators - Only show if more than 1 promotion */}
        {promotions.length > 1 && (
          <div className="flex justify-center mt-3 gap-2">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to promotion ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {promotions.length > 1 && isAutoPlay && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 rounded-b-[20px] overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                animation: 'progressBar 5s linear infinite',
                animationPlayState: isAutoPlay ? 'running' : 'paused'
              }}
            />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progressBar {
            from { width: 0% }
            to { width: 100% }
          }
        `
      }} />
    </div>
  );
} 