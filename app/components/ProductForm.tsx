import { Link } from '@remix-run/react';
import { type VariantOption, VariantSelector } from '@shopify/hydrogen';
import { Plane } from 'lucide-react';
import type {
  ProductFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useAside } from '~/components/Aside';
import { Modal, useModal } from './Modal';
import { RequestForm } from './RequestForm';

export function ProductForm({
  product,
  selectedVariant,
  variants,
}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Array<ProductVariantFragment>;
}) {
  const { open } = useAside();
  const { open: openModal } = useModal();

  return (
    <div className="flex flex-col gap-5">
      <div className='flex flex-col gap-4'>
        <VariantSelector
          handle={product.handle}
          options={product.options.filter(
            (option) => option.optionValues.length > 1,
          )}
          variants={variants}
        >
          {({ option }) => <ProductOptions key={option.name} option={option} />}
        </VariantSelector>
      </div>

      {/* Conditional Rendering: Add to Cart or Special Order */}
      {selectedVariant?.availableForSale ? (
        <AddToCartButton
          disabled={!selectedVariant} // Simplified condition
          onClick={() => {
            open('cart');
          }}
          lines={[
            {
              merchandiseId: selectedVariant.id,
              quantity: 1,
              selectedVariant,
            },
          ]}
        >
          <>
            <svg
              className="stroke-white mr-2"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cart Icon Paths */}
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Agregar al carrito</span>
          </>
        </AddToCartButton>
      ) : (
        <div className="flex flex-col items-center gap-3 py-5 text-center">
          {/* Updated Headline & Description */}
          <p className="text-sm text-neutral-600">
            <span className="font-semibold">¿Te gusta mucho este producto?</span><br />
            Consigue este artículo exclusivo a un precio increíble. Lo traemos directamente para ti.
          </p>
          {/* Primary Style Button with Gradient */}
          <button
            type="button"
            onClick={() => openModal('default', `Quiero esto ${product.title} ${selectedVariant?.title}`)} // Pass the variant ID to the modal
            // Enhanced gradient with dramatic effect using #4D2DDA as base
            className="cursor-pointer flex items-center justify-center w-full px-4 py-2.5 md:py-3.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#6644ff] via-[#4D2DDA] to-[#3620a0] text-white hover:shadow-[0_8px_25px_-5px_rgba(77,45,218,0.6)] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D2DDA] shadow-lg"
            disabled={!selectedVariant}
          >
            {/* New Airplane Icon SVG (White) */}
            <Plane className='h-5 w-5 mr-2' />
            Hacer el pedido
          </button>
        </div>
      )}


    </div>
  );
}

function ProductOptions({ option }: { option: VariantOption }) {
  return (
    <div className="flex flex-col gap-2" key={option.name}>
      <h5>{option.name}</h5>
      <div className="flex flex-wrap gap-2">
        {option.values.map(({ value, isAvailable, isActive, to }) => {
          return (
            <Link
              className={`px-4 py-2.5 md:py-3.5 text-sm rounded-xl ${isActive ? 'bg-neutral-900 text-white hover:bg-neutral-950' : 'bg-neutral-200 hover:bg-neutral-900 text-neutral-600 hover:text-white'}`}
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
              style={{
                opacity: isAvailable ? 1 : 0.2,
              }}
            >
              {/* test
              {isAvailable ? 1 : 0} */}
              {value}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
