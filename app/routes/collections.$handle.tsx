import { defer, redirect, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from '@remix-run/react';
import {
  Analytics,
  getPaginationVariables,
  Pagination,
} from '@shopify/hydrogen';
import type { CollectionFragment, ProductItemFragment } from 'storefrontapi.generated';
import { CollectionItem, COLLECTIONS_QUERY, ProductsLoadedOnScroll } from './collections._index';
import { useInView } from 'react-intersection-observer';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Underla |${data?.collection.title ?? ''} Collection` }];
};

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
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const { handle } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,

  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{ collections }, { collection }] = await Promise.all([
    storefront.query(COLLECTIONS_QUERY),
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  console.log(collection);


  if (!collections || !handle) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collections,
    collection,
    handle
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: LoaderFunctionArgs) {
  return {};
}

export default function Collection() {
  const { collections, collection, handle } = useLoaderData<typeof loader>();
  const { ref, inView } = useInView();

  return (
    <div className="w-full max-w-7xl px-4 md:px-8 md:mx-auto flex flex-col gap-5">
      <h1 className='font-bold text-3xl md:text-5xl text-neutral-700'>Categorias</h1>
      <div className="flex gap-2 py-3 -mr-4 md:mr-0 md:gap-4 overflow-x-auto scrool">
        <CollectionItem
          collection={{ handle: '', title: 'Todos los productos' } as CollectionFragment}
          active={handle === 'all'}
        />
        {
          collections.nodes.map((collection: CollectionFragment, index: number) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              active={handle === collection.handle}
            />
          ))
        }
      </div>

      <div className='grid grid-cols-1 gap-5 sm:grid-cols-3 md:grid-cols-4'>
        <Pagination connection={collection?.products}>
          {({ nodes, NextLink, hasNextPage, nextPageUrl, state }: {
            nodes: ProductItemFragment[];
            NextLink: any;
            hasNextPage: boolean;
            nextPageUrl: string;
            state: any;
          }) => (
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
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

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

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
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
  }
` as const;
