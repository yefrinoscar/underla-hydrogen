import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {useEffect, useState, useRef} from 'react';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity! > 0;
  
  // Get the current aside state
  const {type: asideType} = useAside();
  
  // Disable body scrolling only when cart is actually open
  useEffect(() => {
    // Only disable scrolling when cart is shown and active
    if (layout === 'aside' && asideType === 'cart') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [layout, asideType]);

  // State to track scroll position within cart
  const [isCartScrolled, setIsCartScrolled] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  
  // Add scroll event listener to cart container
  useEffect(() => {
    const cartContainer = cartRef.current;
    if (!cartContainer) return;
    
    const handleCartScroll = () => {
      if (cartContainer.scrollTop > 10) {
        setIsCartScrolled(true);
      } else {
        setIsCartScrolled(false);
      }
    };
    
    cartContainer.addEventListener('scroll', handleCartScroll);
    return () => {
      cartContainer.removeEventListener('scroll', handleCartScroll);
    };
  }, []);
  
  return (
    <div 
      ref={cartRef}
      className={`flex flex-col ${layout === 'aside' ? 'md:h-[calc(100vh-2rem)] h-[calc(90vh-2rem)] overflow-y-auto' : 'h-auto'}`}
    >
      {/* Header - with blur effect and diffused border on scroll */}
      <div 
        className={`sticky top-0 py-4 w-full transition-all duration-300 diffused-border-bottom ${isCartScrolled ? 'bg-white/80 backdrop-blur-md scrolled' : 'bg-white'}`}
      >
        <div className="w-full md:max-w-3xl mx-auto flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-gray-900">Tu carrito</h1>
          <div className="flex items-center gap-3">
            {cartHasItems && (
              <span className="bg-underla-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {cart.totalQuantity} {cart.totalQuantity === 1 ? 'producto' : 'productos'}
              </span>
            )}
            {layout === 'aside' && (
              <button 
                onClick={useAside().close}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Cerrar carrito"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Empty Cart State */}
      <CartEmpty hidden={linesCount} layout={layout} />
      
      {cartHasItems && (
        <>
          {/* Scrollable Product List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="w-full md:max-w-3xl mx-auto">
              <ul className="divide-y divide-gray-200">
                {(cart?.lines?.nodes ?? []).map((line) => (
                  <CartLineItem key={line.id} line={line} layout={layout} />
                ))}
              </ul>
            </div>
          </div>
          
          {/* Fixed Footer with Cart Summary */}
          <div className="bg-white border-t border-gray-200 w-full">
            <div className="w-full md:max-w-3xl mx-auto px-4 pt-4">
              {cartHasItems && <CartSummary cart={cart} layout={layout} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  
  const handleContinueShopping = () => {
    close();
    // If we're already on the home page, just close the cart
    if (window.location.pathname === '/' || window.location.pathname === '') {
      return;
    }
  };
  
  return (
    <div hidden={hidden} className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"></circle>
          <circle cx="19" cy="21" r="1"></circle>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
        </svg>
        <h2 className="mt-4 text-xl font-medium text-gray-900">Tu carrito está vacío</h2>
        <p className="mt-2 text-gray-500">
          Parece que no has agregado nada todavía, ¡vamos a comenzar!
        </p>
        <div className="mt-6">
          <Link 
            to="/" 
            onClick={handleContinueShopping} 
            prefetch="viewport"
            className="rounded-xl bg-underla-500 px-6 py-3 text-white transition-all duration-200 hover:bg-underla-600 cursor-pointer font-medium inline-flex items-center gap-2"
          >
            Seguir comprando
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
