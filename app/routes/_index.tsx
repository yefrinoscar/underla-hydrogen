import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link, type MetaFunction, useOutletContext } from '@remix-run/react';
import { ContextType, Suspense, useEffect, useState } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  FeaturedCollectionQuery,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';
import { Carrousel } from '~/components/Carrousel';
import { HomeBanner } from '~/components/HomeBanner';
import { Promotion } from '~/types/promotion';
import { PromotionCard } from '~/components/PromotionCard';
import { RequestForm } from '~/components/RequestForm';
import { useAside } from '~/components/Aside';
import { Aside } from '~/components/Aside';
import { PartyPopper, PartyPopperIcon, Send } from 'lucide-react';
import { Modal, useModal } from '~/components/Modal';

export const meta: MetaFunction = () => {
  return [{ title: 'Underla | Home' }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const homeProducts = loadHomeProducts(args);
  const criticalData = await loadCriticalData(args);

  return { ...homeProducts, ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context }: LoaderFunctionArgs) {
  const collections = context.storefront
    .query(FEATURED_COLLECTION_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    collections,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: { query: 'tag:top-selling' }
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

function loadHomeProducts({ context }: LoaderFunctionArgs) {
  const homeProducts = context.storefront
    .query(HOME_PRODUCTS_QUERY, {
      variables: { query: 'tag:Home' }
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    homeProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const { promotions } = useOutletContext<{ promotions: Promotion[] }>();

  return (
    <div>
      <HomeBanner products={data.homeProducts} />
      <RecommendedProducts products={data.recommendedProducts} />
      <Promotions promotions={promotions} />
      <FeaturedCollection collections={data.collections} />
      <CtaRequest />
    </div>
  );
}


function FeaturedCollection({
  collections,
}: {
  collections: Promise<FeaturedCollectionQuery | null>;
}) {
  return (
    <div className='container-app pt-20 flex flex-col justify-center items-center gap-5'>
      <h2 className='text-3xl font-bold motion-preset-blur-down'>Categorias</h2>
      <div className='grid grid-cols-9 md:grid-cols-12 gap-2 md:gap-5 w-full'>
        <Suspense fallback={<div>Loading...</div>} >
          <Await resolve={collections}>
            {(response) => {
              {
                return response
                  ? response.collections.nodes.map((collection, index) => (
                    <Link
                      key={collection.id}
                      className={`col-span-3 h-16 md:h-32 bg-neutral-50 rounded-2xl md:rounded-[20px] flex justify-center items-center hover:bg-underla-500 group motion-preset-slide-up motion-delay-${index * 100}`}
                      to={`/collections/${collection.handle}`}
                    >
                      {/* {
                        collection.image && <Image
                          data={collection?.image}
                          aspectRatio="1/1"
                          className='h-64! rounded-[20px]! mb-5'
                        />
                      } */}

                      <h3 className='font-semibold text-neutral-700 text-center text-base md:text-3xl group-hover:text-white text-decoration-none'>
                        {collection.title}
                      </h3>
                    </Link>
                  ))
                  : null
              }
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');


  return (
    <div className="container-app pt-16 grid grid-cols-12 gap-5">
      <div style={{ backgroundSize: '150% 150%' }} className='bg-linear-to-br from-underla-500 to-gr-to animate-gradientAnimation col-span-12 md:col-span-3 p-6 rounded-[20px] flex justify-center md:justify-start items-end motion-preset-slide-right'>
        <h2 className='text-center text-2xl md:text-start md:text-[42px]/12 font-bold text-white'>Los <br className='hidden md:block' />
          mas  <br className='hidden md:block' />
          vendidos</h2>
      </div>
      <Suspense fallback={<div>Loading...</div>} >
        <Await resolve={products}>
          {(response) => (
            <div className="col-span-12 md:col-span-9 motion-preset-slide-right">
              <Carrousel items={response?.products.nodes ?? []} countItems={isMobile ? 2 : 3}>
                {response
                  ? response.products.nodes.map((product, index) => (
                    <Link
                      key={product.id}
                      className={`recommended-product w-[calc((100%-20px)/2)] md:w-[calc((100%-40px)/3)] flex-shrink-0 bg-neutral-100 rounded-[20px] p-5 motion-preset-fade motion-delay-${index * 150}`}
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        width={249}
                        height={256}
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        className='h-auto! xl:h-64! rounded-[20px]! mb-5 motion-preset-scale-up'
                      />
                      <h4 className='font-medium text-neutral-800 text-ellipsis whitespace-nowrap overflow-hidden text-sm'>
                        {product.title}
                      </h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} className='text-underla-500 font-semibold text-xs md:text-base' />
                      </small>
                    </Link>
                  ))
                  : null}
              </Carrousel>
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

function Promotions({
  promotions,
}: {
  promotions: Promotion[] | [];
}) {
  return (
    <div className="container-app pt-10 md:pt-20 grid grid-cols-12 gap-5 h-auto md:h-72 motion-preset-slide-right">
      {promotions.map((promotion, index) => (
        <PromotionCard key={promotion.id} className={`motion-preset-fade motion-delay-${index * 150}`} promotion={promotion} />
      ))}
    </div>
  );
}

function CtaRequest() {
  const [requestText, setRequestText] = useState('');
  const { open } = useModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestText.trim()) {
      open('default', requestText);
    }
  };

  return (
    <>
      <div className='container-app pt-20 pb-40 flex flex-col items-center gap-4'>
        <h3 className='font-bold text-center text-2xl md:text-5xl text-neutral-700 motion-preset-blur-down'>
          ¿Necesitas algo único y especial?
        </h3>
        {/* md:w-[520px] */}
        <form onSubmit={handleSubmit} className='flex flex-col w-full md:w-5/10 gap-4 motion-preset-slide-up motion-delay-200'>
          <div className='w-full md:w-full flex bg-neutral-100 rounded-[20px] has-[textarea:focus-within]:outline-2 has-[textarea:focus-within]:-outline-offset-2 has-[textarea:focus-within]:outline-underla-500'>
            <textarea
              className='w-full h-24 md:h-30 placeholder:text-neutral-400 p-5 focus:outline-none rounded-[20px] resize-none text-sm'
              placeholder='Estamos aquí para ayudarte, dinos qué estás buscando o qué necesitas hacer...'
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className='bg-underla-500 h-14 shadow-lg hover:shadow-xl flex justify-center items-center text-center shadow-underla-500/50 transition-shadow duration-200 motion-ease-bounce px-8 cursor-pointer rounded-default text-md md:text-lg font-medium text-white motion-preset-up motion-delay-400'
          >
            <PartyPopperIcon className='w-5 h-5 mr-2' />
            <span>Enviar</span>
          </button>
        </form>
        <p className='text-xl text-neutral-500 motion-preset-fade motion-delay-600'>
          Te conseguimos todo, <strong>SÍ</strong>, todo.
        </p>
      </div>
    </>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: any) => {
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

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection {
    collections(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($query: String!) {
    products(first: 6, query: $query) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const HOME_PRODUCTS_QUERY = `#graphql
  fragment HomeProduct on Product {
    id
    title
    handle
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    availableForSale
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query HomeProducts($query: String!)  {
      products(first: 3, query: $query) {
        nodes {
          ...HomeProduct
        }
      }
  }
` as const;
