import { Suspense, useState, useEffect } from 'react';
import { Await, NavLink, useLocation } from '@remix-run/react';
import type { HeaderQuery, CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import logo from "../assets/underla_logo.svg";
import search from "../assets/search.png";
import shopping_cart from "../assets/shopping_cart.png";
import menu from "../assets/menu.svg";

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
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const { shop, menu } = header;
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
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
    ? `header w-full mb-8 md:mb-16 ${isScrolled ? 'shadow-md bg-white' : 'bg-transparent'}`
    : `header w-full mb-8 md:mb-16 ${isScrolled ? 'shadow-md bg-white' : 'bg-white'}`;
    
  // Determine text/icon color classes based on route and scroll state
  const textColorClasses = (isSpecialRoute && !isScrolled) ? 'text-white' : 'text-neutral-800';

  return (
    <header className={headerClasses}>
      <div className={`flex items-center w-full px-8 max-w-7xl mx-auto h-16 justify-between ${textColorClasses}`}>
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end className={`flex items-center gap-2 ${textColorClasses}`}>
          <img src={logo} className='w-8' alt="Logo underla" />
          <p className='uppercase'>{shop.name}</p>
        </NavLink>
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          isLoggedIn={isLoggedIn}
          cart={cart}
          textColorClass={textColorClasses}
        />
        <HeaderMenuMobileToggle textColorClass={textColorClasses} />
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
  
  const className = `${viewport === 'mobile' ? 'lg:hidden' : 'hidden lg:flex'} gap-8`;
  
  // Function to handle click on menu items
  const handleMenuItemClick = (e: React.MouseEvent, item: any, url: string) => {
    // Check if it's the Collections link and we're on the home page
    if (item.title === 'Collections' && location.pathname === '/') {
      e.preventDefault();
      // Close mobile menu if open
      if (viewport === 'mobile') {
        close();
      }
      scrollToCategories();
    }
    // For other cases, let the navigation happen normally
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
                onClick={(e) => handleMenuItemClick(e, item, url)}
              >
                Catálogo
              </button>
            );
          }
          
          return (
            <NavLink
              className={`${textColorClass} nav-item`}
              end
              key={item.id}
              prefetch="intent"
              style={activeLinkStyle}
              to={url}
            >
              {item.title}
            </NavLink>
          );
        })}
      <Suspense fallback={<p className={textColorClass}>Cargando...</p>}>
        <Await resolve={isLoggedIn}>
          {(isLoggedIn) => (
            <NavLink
              className={`${textColorClass} nav-item`}
              prefetch="intent"
              style={activeLinkStyle}
              to={isLoggedIn ? '/account' : '/account/login'}
            >
              {isLoggedIn ? 'Cuenta' : 'Iniciar sesión'}
            </NavLink>
          )}
        </Await>
      </Suspense>
      <SearchToggle textColorClass={textColorClass} />
      <CartToggle cart={cart} textColorClass={textColorClass} />
    </nav>
  );
}

function HeaderMenuMobileToggle({ textColorClass = 'text-neutral-800' }: { textColorClass?: string }) {
  const { open } = useAside();
  return (
    <button
      className={`lg:hidden reset ${textColorClass}`}
      onClick={() => open('mobile')}
    >
      <img src={menu} alt="Menu" className='w-6' />
    </button>
  );
}

function SearchToggle({ textColorClass = 'text-neutral-800' }: { textColorClass?: string }) {
  const { open } = useAside();
  
  // Determine if we should use white icons based on the text color class
  const isWhiteTheme = textColorClass.includes('text-white');
  
  return (
    <button className={`reset ${textColorClass}`} onClick={() => open('search')}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={isWhiteTheme ? "#FFFFFF" : "#000000"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  );
}

function CartBadge({ count, textColorClass = 'text-neutral-800' }: { count: number | null; textColorClass?: string }) {
  const { open } = useAside();
  
  // Determine if we should use white icons based on the text color class
  const isWhiteTheme = textColorClass.includes('text-white');
  
  return (
    <button className={`reset ${textColorClass} relative`} onClick={() => open('cart')}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={isWhiteTheme ? "#FFFFFF" : "#000000"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      {count ? (
        <div className="absolute -top-1 -right-1 text-[0.625rem] bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-medium">
          {count}
        </div>
      ) : null}
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
