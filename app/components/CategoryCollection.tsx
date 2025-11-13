import { Suspense, useRef, useState } from 'react';
import { Await, Link } from 'react-router';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Image, Money } from '@shopify/hydrogen';
import type { RecommendedProductsQueryResult } from './RecommendedProducts';
import type { FeaturedCollectionQuery } from './FeaturedCollection';

interface CollectionProductsResult {
  collection: {
    id: string;
    title: string;
    handle: string;
    products: {
      nodes: Array<{
        id: string;
        title: string;
        handle: string;
        tags: string[];
        priceRange: {
          minVariantPrice: {
            amount: string;
            currencyCode: any;
          };
        };
        images: {
          nodes: Array<{
            id: string;
            url: string;
            altText: string | null;
            width: number;
            height: number;
          }>;
        };
      }>;
    };
  };
}

interface CategoryCollectionProps {
  products: Promise<CollectionProductsResult | null>;
  collection: Promise<FeaturedCollectionQuery | null>;
  title: string;
  subtitle?: string;
  accentColor?: string;
  categoryHandle: string;
  backgroundColor?: string;
}

export function CategoryCollection({ 
  products, 
  collection,
  title, 
  subtitle = "Descubre nuestra colección exclusiva",
  accentColor = "pink",
  categoryHandle,
  backgroundColor = "bg-white"
}: CategoryCollectionProps) {
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

  // Color classes mapping
  const colorClasses = {
    pink: {
      icon: 'text-pink-500',
      titleAccent: 'text-pink-500',
      button: 'bg-pink-500 hover:bg-pink-600',
      cardBg: 'from-pink-50 to-rose-50',
      price: 'text-pink-500'
    },
    purple: {
      icon: 'text-purple-500',
      titleAccent: 'text-purple-500',
      button: 'bg-purple-500 hover:bg-purple-600',
      cardBg: 'from-purple-50 to-violet-50',
      price: 'text-purple-500'
    },
    blue: {
      icon: 'text-blue-500',
      titleAccent: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
      cardBg: 'from-blue-50 to-cyan-50',
      price: 'text-blue-500'
    },
    green: {
      icon: 'text-green-500',
      titleAccent: 'text-green-500',
      button: 'bg-green-500 hover:bg-green-600',
      cardBg: 'from-green-50 to-emerald-50',
      price: 'text-green-500'
    },
    orange: {
      icon: 'text-orange-500',
      titleAccent: 'text-orange-500',
      button: 'bg-orange-500 hover:bg-orange-600',
      cardBg: 'from-orange-50 to-amber-50',
      price: 'text-orange-500'
    },
    black: {
      icon: 'text-neutral-900',
      titleAccent: 'text-neutral-900',
      button: 'bg-neutral-900 hover:bg-neutral-800',
      cardBg: 'from-neutral-100 to-neutral-200',
      price: 'text-neutral-900'
    }
  };

  const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.pink;

  return (
    <div className='container-app'>
      <Suspense fallback={<div>Cargando...</div>}>
        <Await resolve={collection}>
          {(collectionData) => {
            const categoryImage = collectionData?.collections.nodes.find(
              c => c.handle === categoryHandle
            )?.image;

            return (
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {categoryImage ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-white">
                      <Image
                        data={categoryImage}
                        className="w-full h-full object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <Sparkles className={`w-8 h-8 ${colors.icon}`} fill="currentColor" />
                  )}
                  <div>
                    <h2 
                      className='text-3xl md:text-4xl font-black text-neutral-900'
                      dangerouslySetInnerHTML={{ __html: title }}
                    />
                    <p className="text-sm md:text-base text-neutral-600 mt-1">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/collections/special/${categoryHandle}`}
                  className={`hidden md:flex items-center gap-2 px-6 py-3 ${colors.button} text-white font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  Ver todo
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            );
          }}
        </Await>
      </Suspense>
      
      <Suspense fallback={<CategorySkeleton />}>
        <Await resolve={products}>
          {(response: CollectionProductsResult | null) => {
            if (!response || !response.collection || response.collection.products.nodes.length === 0) return null;
            
            const categoryProducts = response.collection.products.nodes;

            return (
              <div className='relative group/carousel'>
                {/* Left Arrow */}
                {showLeftArrow && (
                  <button
                    onClick={() => scroll('left')}
                    className='absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-neutral-50 shadow-xl rounded-full p-3 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110'
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className='w-6 h-6 text-neutral-800' />
                  </button>
                )}

                {/* Right Arrow */}
                {showRightArrow && (
                  <button
                    onClick={() => scroll('right')}
                    className='absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-neutral-50 shadow-xl rounded-full p-3 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110'
                    aria-label="Scroll right"
                  >
                    <ChevronRight className='w-6 h-6 text-neutral-800' />
                  </button>
                )}

                {/* Products Container */}
                <div className='relative'>
                  <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className='flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4'
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {categoryProducts.map((product) => {
                      return (
                        <Link
                          key={product.id}
                          to={`/products/${product.handle}`}
                          className={`group shrink-0 w-[280px] ${backgroundColor} rounded-2xl overflow-hidden transition-all duration-300`}
                        >
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden p-4">
                            {product.images.nodes[0] && (
                              <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                                <Image
                                  data={product.images.nodes[0]}
                                  className='w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110'
                                  sizes="280px"
                                />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-5 space-y-3">
                            <h3 className="font-bold text-neutral-900 text-base line-clamp-2 leading-tight min-h-[2.5rem]">
                              {product.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <Money
                                data={product.priceRange.minVariantPrice}
                                className={`font-black text-xl ${colors.price}`}
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    {/* Spacer */}
                    <div className='shrink-0 w-1'></div>
                  </div>
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>

      {/* Mobile CTA */}
      <div className="mt-8 md:hidden flex justify-center">
        <Link
          to={`/collections/special/${categoryHandle}`}
          className={`flex items-center gap-2 px-8 py-3 ${colors.button} text-white font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-lg`}
        >
          Ver toda la colección
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

function CategorySkeleton() {
  const skeletonItems = Array.from({ length: 4 }, (_, i) => i);
  
  return (
    <div className='flex overflow-x-auto gap-6 pb-4'>
      {skeletonItems.map((index) => (
        <div key={index} className='shrink-0 w-[280px] bg-white rounded-2xl overflow-hidden shadow-md'>
          <div className="aspect-square bg-gray-200 animate-pulse"></div>
          <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
