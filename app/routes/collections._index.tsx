import { useLoaderData, Link, useNavigate } from '@remix-run/react';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { getPaginationVariables, Image, Pagination } from '@shopify/hydrogen';
import type { CollectionFragment, ProductFragment, ProductItemFragment } from 'storefrontapi.generated';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductItem } from '~/components/ProductItem';

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({ ...deferredData, ...criticalData });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context, request }: LoaderFunctionArgs) {
  const variables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{ collections }, {products}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY),
    context.storefront.query(PAGINATION_PRODUCTS_QUERY, {variables}),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return { collections, products };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: LoaderFunctionArgs) {
  return {};
}

export default function Collections() {
  const { collections , products } = useLoaderData<typeof loader>();
  const { ref, inView, entry } = useInView();

  return (
    <div className="w-full max-w-7xl px-8 pl-4 md:mx-auto flex flex-col gap-5">
      <h1 className='font-bold text-3xl md:text-5xl text-neutral-700'>Categorias</h1>
      <div className="flex gap-2 md:gap-4 overflow-x-auto scrool">
        <CollectionItem
          collection={{ handle: '', title: 'Todos los productos' } as CollectionFragment}
          active={true}
        />
        {
          collections.nodes.map((collection: CollectionFragment, index: number) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              active={false}
            />
          ))
        }
      </div>
      
      <div className='grid gap-5 sm:grid-cols-3 md:grid-cols-4'>
        <Pagination connection={products}>
        {({ nodes, NextLink, hasNextPage, nextPageUrl, state }) => (
          <>
            <ProductsLoadedOnScroll
              nodes={nodes}
              inView={inView}
              hasNextPage={hasNextPage}
              nextPageUrl={nextPageUrl}
              state={state}
            />
            <NextLink ref={ref}>Load more</NextLink>
          </>
        )}
      </Pagination>
      </div>
    </div>
  );
}

function CollectionItem({
  collection,
  active
}: {
  collection: CollectionFragment;
  active: boolean
}) {
  return (
    <Link
      className={`flex rounded-lg cursor-pointer text-xs md:text-sm bg-neutral-200 text-neutral-900 transition-shadow hover:bg-underla-600 hover:text-white hover:shadow-category ${active ? 'bg-underla-600 text-white shadow-category hover:shadow-category-hover' : ''}`}
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <span className='py-3 px-4 text-nowrap'>{collection.title}</span>
    </Link>
  );
}

interface ProductsLoadedOnScrollProps {
  nodes: ProductItemFragment[];
  inView: boolean;
  hasNextPage: boolean;
  nextPageUrl: string;
  state: any; // Using any temporarily to match Pagination component's state
}

function ProductsLoadedOnScroll({ 
  nodes, 
  inView, 
  hasNextPage, 
  nextPageUrl, 
  state 
}: ProductsLoadedOnScrollProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage) {
      navigate(nextPageUrl, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
  }, [inView, navigate, state, nextPageUrl, hasNextPage]);

  return nodes.map((product) => (
    <ProductItem key={product.id} product={product}  />
  ));
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections {
    collections(first: 20) {
      nodes {
        ...Collection
      }
    }
  }
` as const;

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const PAGINATION_PRODUCTS_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
` as const;
