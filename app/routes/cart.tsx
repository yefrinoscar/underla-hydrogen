import {Await, type MetaFunction, useLoaderData, useRouteLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {type ActionFunctionArgs} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import type {RootLoader} from '~/root';

export const meta: MetaFunction = () => {
  return [{title: `Underla |Cart`}];
};

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;

  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [] as string[];

      // Combine discount codes
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity(inputs.buyerIdentity);
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result.cart.id;
  const headers = cart.setCartId(result.cart.id);
  const {cart: cartResult, errors: cartErrors, warnings} = result;

  const redirectTo = formData.get('redirectTo') as string | undefined;
  if (redirectTo) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  const errors = cartErrors?.map((error) => {
    return {
      message: error.message,
      field: error.field as string | undefined,
      code: error.code as string | undefined,
    };
  });

  return {
    cart: cartResult,
    errors,
    warnings,
    analytics: {
      cartId,
    },
    status,
    headers,
  };
}

export default function Cart() {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;

  return (
    <div className="cart">
      <h1>Cart</h1>
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await
          resolve={rootData.cart}
          errorElement={<div>An error occurred</div>}
        >
          {(cart) => {
            return <CartMain layout="page" cart={cart} />;
          }}
        </Await>
      </Suspense>
    </div>
  );
}
