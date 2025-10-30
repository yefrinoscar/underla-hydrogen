import { useState, useRef, useId, useEffect, Suspense } from 'react';
import { NavLink, useLocation, Form, useFetcher, useNavigate, Await } from 'react-router';
import type { HeaderQuery, CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import { SearchFormPredictive } from '~/components/SearchFormPredictive';
import { SearchResultsPredictive } from '~/components/SearchResultsPredictive';
import logo from "../assets/underla_logo.svg";
import { ShoppingCart, User, Search, X } from 'lucide-react';

interface MobileHeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function MobileHeader({
  header,
  cart,
  isLoggedIn,
  publicStoreDomain,
}: MobileHeaderProps) {
  const { shop } = header;
  const location = useLocation();
  const navigate = useNavigate();
  const aside = useAside();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const queriesDatalistId = useId();
  
  // Check if we're on a special route that should have transparent header with white text
  const isSpecialRoute = location.pathname.includes('/collections/special/');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  });

  // Determine header classes based on route and scroll state
  const headerClasses = isSpecialRoute 
    ? `mobile-header w-full ${isScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-transparent'} border-b-0 transition-all duration-300`
    : `mobile-header w-full ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'} border-b-0 transition-all duration-300`;
    
  // Determine text/icon color classes based on route and scroll state
  const textColorClasses = (isSpecialRoute && !isScrolled) ? 'text-white' : 'text-neutral-800';

  // Focus search input on mount
  useEffect(() => {
    // Optional: focus search input after a short delay
    // setTimeout(() => {
    //   searchInputRef.current?.focus();
    // }, 500);
  }, []);

  // Add CSS classes for the animation
  const firstRowClasses = isScrolled
    ? 'max-h-0 opacity-0 overflow-hidden'
    : 'max-h-16 opacity-100';
    
  const secondRowClasses = isScrolled
    ? 'py-2'
    : 'pb-3';
    
  const logoClasses = isScrolled
    ? 'opacity-100 scale-100'
    : 'opacity-0 scale-0';
    
  return (
    <header className={`${headerClasses} md:hidden sticky top-0 z-50 mb-8`}>
      <div className="flex flex-col w-full max-w-7xl mx-auto relative z-10">
        {/* First row: logo and icons - hides on scroll */}
        <div className={`flex items-center justify-between w-full px-4 h-16 ${textColorClasses} transition-all duration-300 ${firstRowClasses}`}>
          {/* Logo - First Element */}
          <NavLink 
            prefetch="intent" 
            to="/" 
            className="flex items-center"
          >
            <img src={logo} className='w-8' alt="Logo underla" />
          </NavLink>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            {/* User Icon */}
            <NavLink
              to="/account"
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Mi cuenta"
            >
              <User size={20} className={textColorClasses} />
            </NavLink>

            {/* Cart Icon */}
            <button
              onClick={() => aside.open('cart')}
              className="p-2 rounded-full hover:bg-gray-100 relative"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} className={textColorClasses} />
              <CartBadge cart={cart} textColorClass={textColorClasses} />
            </button>
          </div>
        </div>
        
        {/* Second row: Search bar with logo that appears on scroll */}
        <div className={`px-4 ${secondRowClasses} transition-all duration-300`}>
          <div className="relative w-full flex items-center">
            {/* Logo that appears next to search when scrolled */}
            <NavLink 
              prefetch="intent" 
              to="/" 
              className={`flex-shrink-0 transition-all duration-300 ${logoClasses} ${isScrolled ? 'mr-3' : 'mr-0'}`}
              style={{ width: isScrolled ? '32px' : '0' }}
            >
              <img src={logo} className='w-8' alt="Logo underla" />
            </NavLink>
            
            <SearchFormPredictive className="flex items-center w-full">
              {({ fetchResults, goToSearch, inputRef }) => (
                <div className="flex items-center w-full">
                  <div className="relative flex items-center w-full">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Search size={18} className="text-gray-500" />
                    </div>
                    <input
                      ref={(el) => {
                        inputRef.current = el;
                        searchInputRef.current = el;
                      }}
                      type="search"
                      name="q"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      className="w-full h-10 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-underla-500 focus:border-underla-500 text-sm"
                      onChange={(e) => {
                        fetchResults(e);
                        setSearchTerm(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          goToSearch();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </SearchFormPredictive>
            
            <SearchResultsPredictive>
              {({ items, total, term, state, closeSearch }) => {
                const { products, collections } = items;
                
                // Only render the container if there are results or loading
                if (!term.current || (!total && state !== 'loading')) {
                  return null;
                }
                
                return (
                  <div className="search-results-container absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[60vh] overflow-y-auto">
                    {state === 'loading' && term.current ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Buscando...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2">
                        <SearchResultsPredictive.Products
                          products={products}
                          closeSearch={closeSearch}
                          term={term}
                        />
                        <SearchResultsPredictive.Collections
                          collections={collections}
                          closeSearch={closeSearch}
                        />
                      </div>
                    )}
                  </div>
                );
              }}
            </SearchResultsPredictive>
          </div>
        </div>
      </div>

      {/* Search results will be shown below the search bar */}
    </header>
  );
}

// Cart Badge Component
function CartBadge({ cart, textColorClass = 'text-neutral-800' }: { cart: MobileHeaderProps['cart']; textColorClass?: string }) {
  return (
    <Suspense fallback={null}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart?.totalQuantity) return null;
          return (
            <div className={`${textColorClass === 'text-white' ? 'bg-white text-black' : 'bg-underla-500 text-white'} absolute -top-1 -right-1 text-xs font-medium min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1`}>
              {cart.totalQuantity}
            </div>
          );
        }}
      </Await>
    </Suspense>
  );
}
