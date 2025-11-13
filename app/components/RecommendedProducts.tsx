import { Suspense, useState, useEffect } from 'react';
import { Await, Link } from 'react-router';
import { Money } from '@shopify/hydrogen';
import { ShoppingBag } from 'lucide-react';
import type { RecommendedProductsQuery } from 'storefrontapi.generated';

interface RecommendedProductsProps {
  products: Promise<RecommendedProductsQuery | null>;
  title?: string;
}

export function RecommendedProducts({ products, title = "Los Más Vendidos" }: RecommendedProductsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="container-app py-16 md:py-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className='text-3xl md:text-4xl font-bold text-neutral-800 motion-preset-blur-down'>
          {title}
        </h2>
        <div className="hidden md:flex items-center space-x-2 text-underla-500 font-medium hover:text-underla-600 transition-colors cursor-pointer">
          <span className="text-sm">Ver todos</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex overflow-x-auto gap-5 md:gap-6 pb-6 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[240px] md:w-[280px] h-[340px] rounded-2xl bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      }>
        <Await resolve={products}>
          {(response) => {
            if (!response || response.products.nodes.length === 0) return null;
            
            return (
              <div className="flex overflow-x-auto gap-5 md:gap-6 pb-6 scrollbar-hide snap-x snap-mandatory px-1">
                {response.products.nodes.map((product, index) => (
                  <Link
                    key={product.id}
                    className={`group flex-shrink-0 w-[240px] md:w-[280px] snap-start motion-preset-fade motion-delay-${index * 100}`}
                    to={`/products/${product.handle}`}
                  >
                    <div className="h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                      <div className="bg-white h-full flex flex-col">
                        {/* Product Image */}
                        <div className="relative bg-neutral-50 h-[200px] md:h-[240px] flex items-center justify-center p-4 overflow-hidden">
                          <img
                            src={product.images.nodes[0]?.url}
                            width={240}
                            height={240}
                            className='object-contain w-full h-full transition-transform duration-300 group-hover:scale-110'
                            alt={product.images.nodes[0]?.altText || product.title}
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <h4 className='font-semibold text-neutral-800 text-sm md:text-base line-clamp-2 mb-2 min-h-[40px]'>
                            {product.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <Money 
                              data={product.priceRange.minVariantPrice} 
                              className='text-underla-500 font-bold text-lg' 
                            />
                            <div className="bg-underla-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
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
