import { Suspense, useEffect, useState } from 'react';
import { Await, NavLink, useAsyncValue } from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type { HeaderQuery, CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import logo from "../assets/underla_logo.svg";
import search from "../assets/search.png";
import shopping_cart from "../assets/shopping_cart.png";
import menu from "../assets/menu.svg";
import { Link } from '@remix-run/react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const { shop, menu } = header;
  const [isScrolled, setIsScrolled] = useState(false)

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


  return (
    <header className={`header w-full mb-8  md:mb-16 bg-white ${isScrolled ? 'shadow-md': ''}`}>
      <div className='flex items-center  w-full px-8 max-w-7xl mx-auto h-16 justify-between'>
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end className="flex items-center gap-2">
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
        />
        <HeaderMenuMobileToggle />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  isLoggedIn,
  cart
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  isLoggedIn?: HeaderProps['isLoggedIn'];
  cart: HeaderProps['cart'];
}) {
  const className = `header-menu-${viewport} font-semibold text-base`;
  const { close } = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {


        (menu || FALLBACK_HEADER_MENU) &&
        <>
          <SearchToggle />
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;
            return (
              <NavLink
                className="header-menu-item"
                end
                key={item.id}
                onClick={close}
                prefetch="intent"
                style={activeLinkStyle}
                to={url}
              >
                {item.title}
              </NavLink>
            );
          })}
          <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
            <Suspense fallback="Sign in">
              <Await resolve={isLoggedIn} errorElement="Sign in">
                {(isLoggedIn) => (isLoggedIn ? 'Cuenta' : 'Iniciar sesión')}
              </Await>
            </Suspense>
          </NavLink>
          <CartToggle cart={cart} />
        </>
      }
    </nav>
  );
}


function HeaderMenuMobileToggle() {
  const { open } = useAside();
  return (
    <button
      className="md:hidden reset"
      onClick={() => open('mobile')}
    >
      <img src={menu} alt="Menu" className='w-6' />
    </button>
  );
}

function SearchToggle() {
  const { open } = useAside();
  return (
    <img className='w-8' src={search} onClick={() => open('search')} alt="Buscador" />
  );
}

function CartBadge({ count }: { count: number | null }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      className='flex  relative w-8'
    >
      <img src={shopping_cart} alt="Carro de compras" className='absolute' />
      <div className='absolute bg-pink-600 p-1 rounded-full text-xs right-0 top-1/3 text-white'>
        {count === null ? <span>&nbsp;</span> : count}
      </div>
    </a>
  );
}

function CartToggle({ cart }: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

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
      url: '/blogs/journal',
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

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
