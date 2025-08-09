import { Suspense, useState, useEffect, useRef, useId } from 'react';
import { Await, NavLink, useLocation, Form, useFetcher, useNavigate } from '@remix-run/react';
import type { HeaderQuery, CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import { SearchFormPredictive } from '~/components/SearchFormPredictive';
import { SearchResultsPredictive } from '~/components/SearchResultsPredictive';
import logo from "../assets/underla_logo.svg";
import menu from "../assets/menu.svg";
import { ShoppingCart, UserCheck, UserX } from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

// Fallback menu for development
const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/news',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

// Function to smooth scroll to categories section
const scrollToCategories = () => {
  const categoriesSection = document.getElementById('categorias');
  if (categoriesSection) {
    categoriesSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export function Header({
  header,
  cart,
  isLoggedIn,
  publicStoreDomain,
}: HeaderProps) {
  const { shop, menu } = header;
  const location = useLocation();
  const navigate = useNavigate();
  const aside = useAside();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
  }, [])

  // Determine header classes based on route and scroll state
  const headerClasses = isSpecialRoute 
    ? `header w-full mb-8 md:mb-16 ${isScrolled ? 'bg-white' : 'bg-transparent'} border-b-0`
    : `header w-full mb-8 md:mb-16 ${isScrolled ? 'bg-white' : 'bg-white'} border-b-0`;
    
  // Determine text/icon color classes based on route and scroll state
  const textColorClasses = (isSpecialRoute && !isScrolled) ? 'text-white' : 'text-neutral-800';

  // No need for toggle as search is always expanded

  return (
    <header className={headerClasses}>
      <div className={`flex items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-16 ${textColorClasses} relative z-10`}>
        {/* Overlay for blur effect when search is focused */}
        {isSearchFocused && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-0" onClick={() => setIsSearchFocused(false)}></div>
        )}
        {/* Main container with new order: logo, search, menu, cart */}
        <div className="flex items-center justify-between w-full gap-4">
          {/* Logo - First Element */}
          <NavLink 
            prefetch="intent" 
            to="/" 
            style={activeLinkStyle} 
            end 
            className={`flex items-center gap-2 ${textColorClasses} transition-all duration-200 ${isSearchFocused ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
          >
            <img src={logo} className='w-8' alt="Logo underla" />
            <p className='uppercase font-bold text-underla-500'>{shop.name}</p>
          </NavLink>

          {/* Search Bar - Second Element */}
          <div className="hidden md:flex relative flex-grow mx-6">
            <div className="relative w-full">
              <SearchFormPredictive className="flex items-center w-full">
                {({ fetchResults, goToSearch, inputRef }) => (
                  <>
                    <div className="flex items-center w-full">
                      <div className="relative flex items-center w-full">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="text-gray-500"
                          >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
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
                          className={`w-full h-10 py-2 pl-10 pr-4 rounded-lg border transition-all duration-200 ${isSearchFocused ? 'border-primary ring-2 ring-underla-500 bg-white shadow-md' : 'border-gray-300'} focus:outline-none text-base`}
                          onChange={(e) => {
                            fetchResults(e);
                            setSearchTerm(e.target.value);
                          }}
                          onFocus={(e) => {
                            fetchResults(e);
                            setIsSearchFocused(true);
                          }}
                          onBlur={() => {
                            // Small delay to allow click events on search results
                            setTimeout(() => {
                              if (!document.activeElement?.closest('.search-results-container')) {
                                setIsSearchFocused(false);
                              }
                            }, 200);
                          }}
                          list={queriesDatalistId}
                        />
                      </div>
                    </div>
                  </>
                )}
              </SearchFormPredictive>
              
              <SearchResultsPredictive>
                {({ items, total, term, state, closeSearch: originalCloseSearch }) => {
                  const { products, collections } = items;
                  
                  // Enhanced closeSearch that also updates the search focused state
                  // and clears the input value directly
                  const closeSearch = () => {
                    originalCloseSearch();
                    setIsSearchFocused(false);
                    setSearchTerm('');
                    if (searchInputRef.current) {
                      searchInputRef.current.value = '';
                      searchInputRef.current.blur();
                    }
                  };
                  
                  // Only render the container if there are results or loading
                  if (!term.current || (!total && state !== 'loading') || !isSearchFocused) {
                    return null;
                  }
                  
                  return (
                    <div className={`search-results-container absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border ${isSearchFocused ? 'border-underla-500/30' : 'border-gray-200'} max-h-80 overflow-y-auto transition-all duration-200 ${state === 'loading' ? 'opacity-90' : 'opacity-100'}`}>
                      {state === 'loading' && term.current ? (
                        <div className="p-2 text-center text-gray-500 text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Buscando...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-1.5">
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

          {/* Menu and Cart - Third and Fourth Elements */}
          <div className={`flex items-center gap-4 ml-auto transition-all duration-200 ${isSearchFocused ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <HeaderMenu
              menu={menu}
              viewport="desktop"
              primaryDomainUrl={header.shop.primaryDomain.url}
              publicStoreDomain={publicStoreDomain}
              isLoggedIn={isLoggedIn}
              cart={cart}
              textColorClass={textColorClasses}
            />
            
            {/* Mobile Menu Toggle */}
            <HeaderMenuMobileToggle textColorClass={textColorClasses} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  isLoggedIn,
  cart,
  publicStoreDomain,
  textColorClass = 'text-neutral-800',
}: {
  menu: HeaderQuery['menu'];
  primaryDomainUrl: string;
  viewport: Viewport;
  isLoggedIn: Promise<boolean>;
  cart: Promise<CartApiQueryFragment | null>;
  publicStoreDomain: string;
  textColorClass?: string;
}) {
  const { close } = useAside();
  const location = useLocation();
  
  const className = `${viewport === 'mobile' ? 'lg:hidden' : 'hidden lg:flex'} gap-6 transition-all duration-300 flex items-center `;
  
  // Function to handle smooth scroll to categories section
  const handleCategoriesClick = (e: React.MouseEvent, url: string) => {
    // Check if this is a collections link
    if (url.includes('/collections')) {
      e.preventDefault();
      console.log('Collections link clicked!', { url, pathname: location.pathname });
      
      // Close mobile menu if open
      if (viewport === 'mobile') {
        close();
      }
      
      // Only scroll if we're on the home page
      if (location.pathname === '/') {
        const categoriesSection = document.getElementById('categorias');
        console.log('Categories section found:', categoriesSection);
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      } else {
        // If not on home page, navigate to home and then scroll
        window.location.href = '/#categorias';
      }
    }
  };
  
  return (
    <nav className={className}>
      {viewport === 'desktop' &&
        (menu || FALLBACK_HEADER_MENU).items.map((item: any) => {
          if (!item.url) return null;
          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          
          // Special handling for Collections link
          if (item.title === 'Collections') {
            return (
              <button
                key={item.id}
                className={`${textColorClass} nav-item cursor-pointer`}
                onClick={(e) => handleCategoriesClick(e, url)}
              >
                Catálogo
              </button>
            );
          }
          
          // Check if this is an exclusive item
          const isExclusive = url.includes('exclusivo') || url.includes('exclusive');
          
          return (
            <NavLink
              className={`${textColorClass} relative group`}
              end
              key={item.id}
              prefetch="intent"
              style={activeLinkStyle}
              to={isExclusive ? '#' : url}
              onClick={(e) => {
                if (isExclusive) {
                  e.preventDefault();
                } else {
                  handleCategoriesClick(e, url);
                }
              }}
            >
              <div className="relative">
                {isExclusive ? (
                  <>
                    <span className="absolute -bottom-5 right-0 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">Muy Pronto</span>
                    <span className="exclusive-text relative inline-block font-bold">{item.title}</span>
                  </>
                ) : (
                  <span>{item.title}</span>
                )}
              </div>
            </NavLink>
          );
        })}
      <Suspense fallback={<p className={textColorClass}>Cargando...</p>}>
        <Await resolve={isLoggedIn}>
          {(isLoggedIn) => (
            <NavLink
              className={`${textColorClass} nav-item hover:opacity-80 transition-opacity duration-200`}
              prefetch="intent"
              style={activeLinkStyle}
              to={isLoggedIn ? '/account' : '/account/login'}
              title={isLoggedIn ? 'Ver mi cuenta' : 'Iniciar sesión'}
            >
              <span className="flex items-center gap-2">
                {/* {isLoggedIn ? 'Mi Cuenta' : 'Iniciar Sesión'} */}
                {isLoggedIn ? <UserCheck /> : <UserX /> }
              </span>
            </NavLink>
          )}
        </Await>
      </Suspense>
      {/* <SearchToggle textColorClass={textColorClass} /> */}
      <CartToggle cart={cart} textColorClass={textColorClass} />
    </nav>
  );
}

function HeaderMenuMobileToggle({ textColorClass = 'text-neutral-800' }: { textColorClass?: string }) {
  const { open } = useAside();
  return (
    <button
      className={`lg:hidden reset ${textColorClass} p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 `}
      onClick={() => open('mobile')}
      aria-label="Menu"
    >
      <img src={menu} alt="Menu" className='w-5' />
    </button>
  );
}

function SearchToggle({ textColorClass = 'text-neutral-800' }: { textColorClass?: string }) {
  const { open } = useAside();
  
  // Determine if we should use white icons based on the text color class
  const isWhiteTheme = textColorClass.includes('text-white');
  
  return (
    <button 
      className={`reset ${textColorClass} p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200`} 
      onClick={() => open('search')}
      aria-label="Search"
    >
      <ShoppingCart />  
    </button>
  );
}

function CartBadge({ count, textColorClass = 'text-neutral-800' }: { count: number | null; textColorClass?: string }) {
  const { open } = useAside();
  
  // Determine if we should use white icons based on the text color class
  const isWhiteTheme = textColorClass.includes('text-white');
  
  return (
    <button 
      className={`reset ${textColorClass} relative rounded-lg hover:bg-gray-100 transition-colors duration-200 `} 
      onClick={() => open('cart')}
      aria-label="Shopping Cart"
    >
      <div className="relative">
        <ShoppingCart />
        {count ? (
          <div className="absolute -top-2 -right-2 text-[0.625rem] bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm transform transition-transform duration-200 hover:scale-110">
            {count}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function CartToggle({ cart, textColorClass = 'text-neutral-800' }: { cart: HeaderProps['cart']; textColorClass?: string }) {
  return (
    <Suspense fallback={<CartBadge count={null} textColorClass={textColorClass} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} textColorClass={textColorClass} />;
          return <CartBadge count={cart.totalQuantity || 0} textColorClass={textColorClass} />;
        }}
      </Await>
    </Suspense>
  );
}

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : undefined,
  };
}
