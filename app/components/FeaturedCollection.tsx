import { Suspense, useRef, useState } from 'react';
import { Await, Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryColor } from './CategoryIcon';
import { filterCollections } from '~/utils/collection-filters';
import { getCollectionUrl } from '~/utils/special-collections';

// Define type based on FEATURED_COLLECTION_QUERY structure
export interface FeaturedCollectionQuery {
  collections: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      image?: {
        id: string;
        url: string;
        altText: string | null;
        width: number | null;
        height: number | null;
      } | null;
    }>;
  };
}

interface FeaturedCollectionProps {
  collections: Promise<FeaturedCollectionQuery | null>;
}

export function FeaturedCollection({ collections }: FeaturedCollectionProps) {
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
    const scrollAmount = 300;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div id="categorias" className='container-app'>
      <div className="flex items-center justify-between mb-6">
        <h2 className='text-3xl md:text-4xl font-bold text-neutral-800 motion-preset-blur-down'>
          Categorías
        </h2>
      </div>
      
      <Suspense fallback={<CategorySkeleton />}>
        <Await resolve={collections}>
          {(response) => {
            if (!response) return null;
            
            const filteredCollections = filterCollections(response.collections.nodes, undefined, '_');
                        
            return (
              <div className='relative group/carousel -mx-4 px-4'>
                {/* Left Arrow */}
                {showLeftArrow && (
                  <button
                    onClick={() => scroll('left')}
                    className='absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl rounded-full p-2.5 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100'
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className='w-5 h-5 text-neutral-800' />
                  </button>
                )}

                {/* Right Arrow */}
                {showRightArrow && (
                  <button
                    onClick={() => scroll('right')}
                    className='absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl rounded-full p-2.5 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100'
                    aria-label="Scroll right"
                  >
                    <ChevronRight className='w-5 h-5 text-neutral-800' />
                  </button>
                )}

                {/* Scroll Wrapper - Sin overflow visible */}
                <div className='overflow-hidden'>
                  {/* Categories Container */}
                  <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className='flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth -mx-6 px-6'
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                  {filteredCollections.map((collection, index) => {
                    const gradientClass = getCategoryColor(collection.handle);
                    
                    return (
                      <Link
                        key={collection.id}
                        className={`shrink-0 w-[160px] md:w-[180px] motion-preset-slide-up motion-delay-${Math.min(index, 9) * 100}`}
                        to={getCollectionUrl(collection.handle)}
                      >
                        <div className='group relative h-[200px] md:h-[220px] rounded-xl transition-all duration-300'>
                          {/* Image Container with overflow hidden */}
                          <div className='absolute inset-0 rounded-xl overflow-hidden'>
                            {/* Image or Gradient Background */}
                            {collection.image ? (
                              <div 
                                className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110"
                                style={{
                                  backgroundImage: `url(${collection.image.url})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            ) : (
                              <div className={`absolute inset-0 bg-linear-to-br ${gradientClass}`}></div>
                            )}
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
                          </div>
                          
                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                            <h3 className="font-bold text-lg text-white drop-shadow-lg mb-1.5 line-clamp-2">
                              {collection.title}
                            </h3>
                            <div className="flex items-center text-white/90 group-hover:text-white transition-colors">
                              <span className="text-xs font-medium">Ver más</span>
                              <ChevronRight className='w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-1' />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                    {/* Spacer para asegurar que el último elemento se vea completo */}
                    <div className='shrink-0 w-1'></div>
                  </div>
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

function CategorySkeleton() {
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);
  
  return (
    <div className='flex overflow-x-auto gap-4 pb-4'>
      {skeletonItems.map((index) => (
        <div key={index} className='shrink-0 w-[160px] md:w-[180px] h-[200px] md:h-[220px] rounded-xl bg-gray-200 animate-pulse'>
        </div>
      ))}
    </div>
  );
}
