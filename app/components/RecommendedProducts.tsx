import { Suspense, useState, useEffect, useRef } from 'react';
import { Await, Link } from 'react-router';
import { Money } from '@shopify/hydrogen';
import { ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { ProductItemFragment } from 'storefrontapi.generated';

// Reuse and extend ProductItemFragment with only what's different
type RecommendedProduct = Omit<ProductItemFragment, 'featuredImage' | 'variants' | 'compareAtPriceRange' | 'availableForSale'> & {
  images: {
    nodes: Array<NonNullable<ProductItemFragment['featuredImage']>>;
  };
  tags: string[];
};

export interface RecommendedProductsQueryResult {
  products: {
    nodes: RecommendedProduct[];
  };
}

interface RecommendedProductsProps {
  products: Promise<RecommendedProductsQueryResult | null>;
  title?: string;
}

export function RecommendedProducts({ products, title = "Los Más Vendidos" }: RecommendedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className="container-app py-8">
      {/* Special Box */}
      <div className="relative overflow-hidden bg-white rounded-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-3 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" fill="white" />
              </div>
              <div>
                <h2 className='text-3xl md:text-5xl font-black text-neutral-900'>
                  {title}
                </h2>
                <p className="text-neutral-600 mt-1">Los productos favoritos de nuestros clientes</p>
              </div>
            </div>
          </div>

              <Suspense fallback={
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-[200px] md:w-[280px] h-[300px] md:h-[380px] rounded-2xl bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          }>
            <Await resolve={products}>
              {(response) => {
                if (!response || response.products.nodes.length === 0) return null;
                
                return (
                  <div className="relative group/carousel">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                      <button
                        onClick={() => scroll('left')}
                        className='absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl rounded-full p-3 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110'
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className='w-6 h-6' />
                      </button>
                    )}

                    {/* Right Arrow */}
                    {showRightArrow && (
                      <button
                        onClick={() => scroll('right')}
                        className='absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl rounded-full p-3 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110'
                        aria-label="Scroll right"
                      >
                        <ChevronRight className='w-6 h-6' />
                      </button>
                    )}

                    <div 
                      ref={scrollContainerRef}
                      onScroll={handleScroll}
                      className="flex overflow-x-auto gap-4 md:gap-6 pb-6 scrollbar-hide scroll-smooth"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {response.products.nodes.map((product) => (
                        <Link
                          key={product.id}
                          className="group flex-shrink-0 w-[200px] md:w-[280px]"
                          to={`/products/${product.handle}`}
                        >
                          <div className="h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 transition-all duration-300">
                            {/* Product Image */}
                            <div className="relative bg-white m-3 md:m-4 rounded-xl h-[180px] md:h-[240px] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                              <img
                                src={product.images.nodes[0]?.url}
                                width={240}
                                height={240}
                                className='object-contain w-full h-full transition-transform duration-500 group-hover:scale-110'
                                alt={product.images.nodes[0]?.altText || product.title}
                                loading="lazy"
                              />
                            </div>
                            
                            {/* Product Info */}
                            <div className="px-3 md:px-5 pb-3 md:pb-5 space-y-2 md:space-y-3">
                              <h4 className='font-bold text-neutral-900 text-sm md:text-base line-clamp-2 leading-tight min-h-[2rem] md:min-h-[2.5rem]'>
                                {product.title}
                              </h4>
                              <div className="flex items-center justify-between">
                                <Money 
                                  data={product.priceRange.minVariantPrice} 
                                  className='font-black text-lg md:text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent' 
                                />
                                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ShoppingBag className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <div className='shrink-0 w-1'></div>
                    </div>
                  </div>
                );
              }}
            </Await>
          </Suspense>
      </div>
    </div>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Initial check
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener('change', handleChange);

    // Clean up listener on unmount
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]); // Re-run effect if query changes

  return matches;
}
