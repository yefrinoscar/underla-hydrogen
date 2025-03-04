import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link, type MetaFunction } from '@remix-run/react';
import { Suspense, useEffect, useState } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  FeaturedCollectionQuery,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';
import { Carrousel } from '~/components/Carrousel';

export const meta: MetaFunction = () => {
  return [{ title: 'Underla | Home' }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const homeProducts = await loadHomeProducts(args);
  const criticalData = await loadCriticalData(args);

  return defer({ ...homeProducts, ...deferredData, ...criticalData });
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
  return (
    <div>
      <Banner products={data.homeProducts} />
      <RecommendedProducts products={data.recommendedProducts} />
      <Promotions products={data.recommendedProducts} />
      <FeaturedCollection collections={data.collections} />
      <CtaRequest />
    </div>
  );
}


const productItems = [
  {
    col: "col-span-6",
    discount: 15 // 15% discount
  },
  {
    col: "col-span-4",
    discount: 25
  },
  {
    col: "col-span-10",
    discount: 0 // No discount
  }
];

function getFirstPngImage(images: Array<Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>) {
  for (const image of images) {
    if (image && typeof image === 'object' && image.url) {
      if (image.url.toLowerCase().endsWith('.png')) {
        return image; // Found the first PNG image, return the object
      }
    }
  }

  return images[0]; // No PNG image found in the array
}

function Banner({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className='container-app grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-5 h-auto md:h-[500px]'>
      <div className='col-span-1 md:grid-cols-6 flex items-center justify-center md:justify-start'>
        <h1 className='font-bold text-3xl md:text-5xl motion-preset-blur-down motion-delay-300 text-center md:text-start'>Todo lo que <br />    
          <span className='text-underla-yellow '>necesitas</span>, <br />
          en un solo lugar</h1>
      </div>

      <div className='grid col-span-1 md:grid-cols-10 grid-rows-2 gap-5 *:bg-underla-50 *:rounded-default md:*:rounded-[49px] h-72 md:h-auto'>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {
              (response) => {
                return response
                  ? response.products.nodes.map((product, index) => {
                    const className = `${productItems[index].col} relative flex justify-center items-center motion-preset-fade motion-delay-${(index + 1) * 200}`;
                    return <div key={index} className={className}>
                      <span className='bg-underla-500 text-white text-sm md:text-xl font-medium absolute top-0 left-0 -translate-x-2.5 -translate-y-3.5 px-4 md:px-6 py-0.5 md:py-1 rounded-full motion-preset-pop motion-delay-${(index + 1) * 300}'>
                        {productItems[index].discount}% off
                      </span>
                      <Image
                        data={getFirstPngImage(product.images.nodes)}
                        className='object-contain h-2/3! absolute motion-preset-scale-up'
                      />
                    </div>
                  }) : null
              }

            }
          </Await>
        </Suspense>
      </div>
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
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="container-app pt-10 md:pt-20 grid grid-cols-12 gap-5 h-auto md:h-72 *:p-5 *:rounded-[20px]">
      <div className='bg-pink-600 col-span-12 md:col-span-6 motion-preset-slide-up motion-delay-100'>
        <h3 className='text-[35px]/12 font-bold text-white'>
          Hasta 50% off <br />
          por el verano</h3>
      </div>
      <div className='bg-blue-600 col-span-12 md:col-span-6 motion-preset-slide-up motion-delay-300'>
        <h3 className='text-[35px]/12 font-bold text-white'>Lo mejor en  <br />
          zapatillas   <br />
          de lujo</h3>
      </div>
    </div>
  );
}

function CtaRequest() {
  return (
    <div className='container-app pt-20 pb-40 flex flex-col items-center gap-4'>
        <h3 className='font-bold text-center text-2xl md:text-5xl text-neutral-700 motion-preset-blur-down'>
          ¿Necesitas algo único y especial?
        </h3>
        <div className='flex flex-col gap-5 w-8/10 md:w-auto motion-preset-slide-up motion-delay-200'>
          <div className='w-full md:w-[520px] flex bg-neutral-100 rounded-[20px] has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-underla-500'>
            <input className='min-w-0 grow h-16 md:h-20 placeholder:text-neutral-400 pl-5 focus:outline-none rounded-[20px]' type="text" placeholder='¿Qué necesitas?' />
          </div>
          <button className='bg-underla-500 h-16 md:h-20 shadow-lg hover:shadow-xl shadow-underla-500/50 transition-shadow duration-200 motion-ease-bounce px-8 cursor-pointer rounded-default text-xl font-medium text-white motion-preset-pop motion-delay-400'>
            💡
            Enviar
          </button>
        </div>
        <p className='text-xl text-neutral-500 motion-preset-fade motion-delay-600'>
          Te conseguimos todo, <strong>SÍ</strong>, todo.
        </p>
    </div>
  )
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
