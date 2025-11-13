import { Suspense } from 'react';
import { Await, Link } from 'react-router';
import type { FeaturedCollectionQuery } from 'storefrontapi.generated';
import { getCategoryColor } from './CategoryIcon';
import { filterCollections } from '~/utils/collection-filters';
import { getCollectionUrl } from '~/utils/special-collections';

interface FeaturedCollectionProps {
  collections: Promise<FeaturedCollectionQuery | null>;
}

export function FeaturedCollection({ collections }: FeaturedCollectionProps) {
  return (
    <div id="categorias" className='container-app'>
      <div className="flex items-center justify-between mb-8">
        <h2 className='text-3xl md:text-4xl font-bold text-neutral-800 motion-preset-blur-down'>
          Categorías
        </h2>
      </div>
      
      <Suspense fallback={<CategorySkeleton />}>
        <Await resolve={collections}>
          {(response) => {
            if (!response) return null;
            
            // Filter collections to exclude those with underscores in their handle
            const filteredCollections = filterCollections(response.collections.nodes, undefined, '_');
                        
            return (
              <div className='flex overflow-x-auto gap-5 md:gap-6 pb-6 scrollbar-hide snap-x snap-mandatory px-1'>
                {filteredCollections.map((collection, index) => {
                  // Get the appropriate color gradient for this category as fallback
                  const gradientClass = getCategoryColor(collection.handle);
                  
                  return (
                    <Link
                      key={collection.id}
                      className={`flex-shrink-0 w-[240px] md:w-[280px] snap-start motion-preset-slide-up motion-delay-${Math.min(index, 9) * 100}`}
                      to={getCollectionUrl(collection.handle)}
                    >
                      <div className={`group relative h-[320px] md:h-[360px] overflow-visible rounded-2xl transition-all duration-300`}>
                        <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                          {/* Collection image */}
                          {collection.image ? (
                            <>
                              {/* Background image */}
                              <div 
                                className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-110"
                                style={{
                                  backgroundImage: `url(${collection.image.url})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            </>
                          ) : (
                            // Fallback gradient if no image
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
                          )}
                          
                          {/* Gradient overlay for text visibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                          
                          {/* Text content */}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="font-bold text-2xl md:text-3xl text-white drop-shadow-lg mb-3 group-hover:translate-y-[-4px] transition-transform view-transition-title">
                              {collection.title}
                            </h3>
                            <div className="flex items-center text-white/90 group-hover:text-white transition-colors">
                              <span className="text-sm font-medium mr-2">Explorar</span>
                              <svg 
                                className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2.5} 
                                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

function CategorySkeleton() {
  // Create an array of 6 items for the skeleton
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);
  
  return (
    <div className='flex overflow-x-auto gap-5 md:gap-6 pb-6 px-1'>
      {skeletonItems.map((index) => (
        <div key={index} className='flex-shrink-0 w-[240px] md:w-[280px] h-[320px] md:h-[360px] rounded-2xl bg-gray-200 animate-pulse'>
        </div>
      ))}
    </div>
  );
}
