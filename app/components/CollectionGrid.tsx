import { Link, useNavigate, useLocation } from 'react-router';
import type { CollectionFragment, CollectionQuery, ProductItemFragment } from 'storefrontapi.generated';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductItem } from '~/components/ProductItem';
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIcon, getCategoryColor } from '~/components/CategoryIcon';
import { CategoryTextImage } from '~/components/CategoryTextImage';
import { Collection } from '@shopify/hydrogen/storefront-api-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCollectionUrl } from '~/utils/special-collections';

// Container animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

// Item animation variants
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function CollectionItem({
  collection,
  active,
  index = 0
}: {
  collection: Collection | { handle: string; title: string; id?: string };
  active: boolean;
  index?: number;
}) {
  const gradientClass = getCategoryColor(collection.handle);
  
  return (
    <Link
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        active ? 'bg-white shadow-lg ring-2 ring-underla-600' : 'bg-white/80 hover:bg-white'
      }`}
      key={collection.id || collection.handle}
      to={getCollectionUrl(collection.handle)}
      prefetch="intent"
      style={{
        transitionDelay: `${index * 50}ms`
      }}
    >
      <div className={`flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br ${gradientClass} text-white shadow-md`}>
        <CategoryIcon handle={collection.handle} size="large" />
      </div>
      <span className='text-center font-medium text-sm'>{collection.title}</span>
    </Link>
  );
}

export function CollectionsHeader({
  collections,
  currentCollection
}: {
  collections: CollectionFragment[];
  currentCollection?: string | null;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Find the active collection
  const activeCollection = currentCollection 
    ? collections.find(c => c.handle === currentCollection) 
    : null;
  
  // Create a fixed category at the top for mobile view
  const fixedCategory = activeCollection || { handle: 'todos', title: 'Todos los productos' };
  
  // Create a list of other categories (excluding the active one)
  const otherCategories = collections.filter(c => 
    c.handle !== (activeCollection?.handle || '')
  );
  
  // Scroll left/right handlers for the mobile carousel
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  return (
    <>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='font-bold text-3xl md:text-5xl text-neutral-700 mb-8'
      >
        Categorias
      </motion.h1>
      
      {/* Mobile Categories Navigation - Only visible on small screens */}
      <div className="md:hidden mb-8">
        {/* Fixed active category */}
        <div className="mb-4 flex justify-center">
          {fixedCategory.handle === 'todos' ? (
            <CollectionItem
              collection={{ handle: 'todos', title: 'Todos los productos' }}
              active={!currentCollection}
              index={0}
            />
          ) : (
            <CollectionItem
              collection={fixedCategory}
              active={true}
              index={0}
            />
          )}
        </div>
        
        {/* Scrollable other categories */}
        <div className="relative">
          {/* Left scroll button */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-700" />
          </button>
          
          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-4 pt-2 px-8 gap-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* "All products" category - only show if not currently active */}
            {currentCollection && (
              <div className="flex-shrink-0 snap-start">
                <CollectionItem
                  collection={{ handle: 'todos', title: 'Todos los productos' }}
                  active={false}
                  index={0}
                />
              </div>
            )}
            
            {/* Other categories (excluding the active one) */}
            {otherCategories.map((collection, index) => (
              <div key={collection.id} className="flex-shrink-0 snap-start">
                <CollectionItem
                  collection={collection}
                  active={false}
                  index={index + 1}
                />
              </div>
            ))}
          </div>
          
          {/* Right scroll button */}
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-neutral-700" />
          </button>
        </div>
      </div>
      
      {/* Desktop Categories Grid - Hidden on mobile, visible on md screens and up */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hidden md:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12"
      >
        <motion.div variants={itemVariants}>
          <CollectionItem
            collection={{ handle: 'todos', title: 'Todos los productos' }}
            active={!currentCollection}
            index={0}
          />
        </motion.div>
        {
          collections.map((collection: CollectionFragment, index: number) => (
            <motion.div key={collection.id} variants={itemVariants}>
              <CollectionItem
                collection={collection}
                active={currentCollection === collection.handle}
                index={index + 1}
              />
            </motion.div>
          ))
        }
      </motion.div>
    </>
  );
}

export function InfiniteProductGrid({
  products,
  hasNextPage,
  nextPageUrl,
  state,
  NextLink,
  whiteBackground = false
}: {
  products: ProductItemFragment[];
  hasNextPage: boolean;
  nextPageUrl: string;
  state: any;
  NextLink: any;
  whiteBackground?: boolean;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  
  // Create ref for the sentinel element (loading trigger)
  const { ref: sentinelRef, inView: sentinelIsVisible } = useInView({
    threshold: 0,
    rootMargin: '400px 0px',
    triggerOnce: false,
  });
  
  // Handle navigation when sentinel becomes visible
  const loadMoreProducts = useCallback(() => {
    if (!hasNextPage || isLoading) return;
    
    setIsLoading(true);
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Navigate to next page
    navigate(nextPageUrl, {
      replace: true,
      preventScrollReset: true,
      state,
    });
    
    // Set a timeout to reset loading state if navigation doesn't complete
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, [hasNextPage, isLoading, navigate, nextPageUrl, state]);
  
  // Effect to trigger loading more products when sentinel is visible
  useEffect(() => {
    if (sentinelIsVisible && hasNextPage) {
      loadMoreProducts();
    }
  }, [sentinelIsVisible, hasNextPage, loadMoreProducts]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);
  
  // Effect to reset loading state when URL changes (indicating new data loaded)
  useEffect(() => {
    setIsLoading(false);
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [location.key]);
  
  return (
    <>
      <AnimatePresence>
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: Math.min(index % 8 * 0.05, 0.3), // Only delay based on position in current page
              ease: "easeOut" 
            }}
          >
            <ProductItem product={product} whiteBackground={whiteBackground} />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Loading indicator and sentinel */}
      <div className="col-span-full py-8 flex justify-center items-center">
        {hasNextPage && (
          <>
            {/* Hidden NextLink for Remix functionality */}
            <div className="sr-only">
              <NextLink>Load more</NextLink>
            </div>
            
            {/* Loading indicator */}
            <div 
              ref={sentinelRef}
              className="flex flex-col items-center justify-center"
            >
              <div className={`w-10 h-10 border-4 border-neutral-200 border-t-underla-500 rounded-full ${isLoading ? 'animate-spin' : ''}`}></div>
              <span className="sr-only">Loading more products...</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
