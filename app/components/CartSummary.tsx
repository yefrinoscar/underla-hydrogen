import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef} from 'react';
import {FetcherWithComponents, Link} from '@remix-run/react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  // Check if there are any applicable discount codes
  const hasApplicableDiscounts = cart.discountCodes?.some(code => code.applicable) || false;
  const applicableCodes = cart.discountCodes?.filter(code => code.applicable).map(({code}) => code) || [];
  
  return (
    <div aria-labelledby="cart-summary" className="w-full">
      {/* Summary Card */}
      <div className="w-full">
        {/* Summary Header */}
        {/* <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2 ">
          <h2 className="text-base font-medium text-gray-900">Resumen</h2>
          <div className="text-lg font-bold text-underla-500">
            {cart.cost?.totalAmount?.amount ? (
              <Money data={cart.cost?.totalAmount} />
            ) : (
              '-'
            )}
          </div>
        </div> */}
        
        {/* Price Details */}
        <dl className="text-sm space-y-1">
          <div className="flex justify-between py-1">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="font-medium text-underla-500">
              {cart.cost?.subtotalAmount?.amount ? (
                <Money data={cart.cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </dd>
          </div>
          
          {hasApplicableDiscounts && (
            <div className="flex justify-between py-1 text-green-600">
              <dt>Descuento</dt>
              <dd className="font-medium">
                {applicableCodes.join(', ')}
              </dd>
            </div>
          )}
          
          {cart.cost?.totalTaxAmount?.amount && (
            <div className="flex justify-between py-1">
              <dt className="text-gray-600">Impuestos</dt>
              <dd className="font-medium text-gray-900">
                <Money data={cart.cost.totalTaxAmount} />
              </dd>
            </div>
          )}
        </dl>
        
        {/* Discount Code Message */}
        <div className="mb-3 flex items-center text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Los códigos de descuento se pueden aplicar en el último paso del checkout.</span>
        </div>
        
        {/* Checkout Button */}
        <div className="mt-3">
          <a 
            href={cart.checkoutUrl} 
            target="_self"
            className="w-full rounded-xl bg-underla-500 py-3 px-4 text-center text-white transition-all duration-200 hover:bg-underla-600 cursor-pointer font-medium flex items-center justify-center gap-2"
          >
            <span>Finalizar compra</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Hidden components for functionality */}
      <div className="hidden">
        <CartDiscounts discountCodes={cart.discountCodes} />
        <CartGiftCard giftCardCodes={cart.appliedGiftCards} />
      </div>
    </div>
  );
}
// Removed CartCheckoutActions as it's now integrated directly in CartSummary

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Código de descuento</h3>
      
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length} className="mb-3">
        <div className="flex items-center justify-between bg-underla-50 p-3 rounded-lg">
          <dt className="text-sm text-gray-600">Código aplicado:</dt>
          <dd className="flex items-center">
            <UpdateDiscountForm>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-underla-500 font-medium text-sm">{codes?.join(', ')}</code>
                <button className="text-sm text-red-500 hover:text-red-700 font-medium">
                  Eliminar
                </button>
              </div>
            </UpdateDiscountForm>
          </dd>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex space-x-2">
          <input 
            type="text" 
            name="discountCode" 
            placeholder="Ingresa tu código" 
            className="flex-1 min-w-0 rounded-lg border-gray-300 shadow-sm focus:border-underla-500 focus:ring-underla-500 py-2 px-3 text-sm"
          />
          <button 
            type="submit"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
          >
            Aplicar
          </button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Tarjeta de regalo</h3>
      
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length} className="mb-3">
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
          <dt className="text-sm text-gray-600">Tarjeta aplicada:</dt>
          <dd className="flex items-center">
            <UpdateGiftCardForm>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-green-600 font-medium text-sm">{codes?.join(', ')}</code>
                <button 
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                  onSubmit={() => removeAppliedCode}
                >
                  Eliminar
                </button>
              </div>
            </UpdateGiftCardForm>
          </dd>
        </div>
      </dl>

      {/* Show an input to apply a gift card */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div className="flex space-x-2">
          <input
            type="text"
            name="giftCardCode"
            placeholder="Ingresa código de tarjeta"
            ref={giftCardCodeInput}
            className="flex-1 min-w-0 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 text-sm"
          />
          <button 
            type="submit"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
          >
            Aplicar
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  removeAppliedCode?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code) saveAppliedCode && saveAppliedCode(code as string);
        return children;
      }}
    </CartForm>
  );
}
