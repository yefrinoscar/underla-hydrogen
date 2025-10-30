import { useLoaderData } from 'react-router';
import { type LoaderFunctionArgs } from 'react-router';
import { getPaginationVariables } from '@shopify/hydrogen';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { COLLECTION_QUERY, COLLECTIONS_QUERY, PRODUCT_ITEM_FRAGMENT } from '~/lib/fragments';
import { CollectionPage } from '~/components/CollectionPage';
import { filterCollections } from '~/utils/collection-filters';

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  
  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context, request, params }: LoaderFunctionArgs) {
  const { handle } = params;
  const isIndexPage = !handle || handle === 'todos';

  const variables = getPaginationVariables(request, {
    pageBy: 8, // Increased from 4 to 8 for better initial load
  });

  // Load collections in all cases
  const { collections } = await context.storefront.query(COLLECTIONS_QUERY);

  // If we're on the index page (no handle or handle is 'index'), load all products
  if (isIndexPage) {
    const { products } = await context.storefront.query(PAGINATION_PRODUCTS_QUERY, {
      variables
    });
    return { collections, products, collection: null };
  } 
  // Otherwise, load the specific collection
  else {
    const { collection } = await context.storefront.query(COLLECTION_QUERY, {
      variables: { handle, ...variables }
    });
    
    // If collection is not found, fall back to all products
    if (!collection) {
      const { products } = await context.storefront.query(PAGINATION_PRODUCTS_QUERY, {
        variables
      });
      return { collections, products, collection: null };
    }
    
    return { collections, collection, products: null };
  }
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
  const { collections, collection, products } = useLoaderData<typeof loader>();
  
  // Filter collections to exclude those with underscores in their handle
  const filteredCollections = filterCollections(collections.nodes, undefined, '_');
  
  // If we have a specific collection, use its products
  if (collection) {
    const collectionProducts = {
      nodes: collection.products.nodes as ProductItemFragment[],
      pageInfo: {
        hasPreviousPage: Boolean(collection.products.pageInfo.hasPreviousPage),
        hasNextPage: Boolean(collection.products.pageInfo.hasNextPage),
        startCursor: collection.products.pageInfo.startCursor || null,
        endCursor: collection.products.pageInfo.endCursor || null,
      }
    };
    
    return (
      <CollectionPage
        collections={filteredCollections}
        products={collectionProducts}
        currentCollection={collection.handle}
      />
    );
  }
  
  // Otherwise, we're on the index page, so use all products
  // Make sure to properly format the products data to match the expected type
  const formattedProducts = products ? {
    nodes: products.nodes as ProductItemFragment[],
    pageInfo: {
      hasPreviousPage: Boolean(products.pageInfo.hasPreviousPage),
      hasNextPage: Boolean(products.pageInfo.hasNextPage),
      startCursor: products.pageInfo.startCursor || null,
      endCursor: products.pageInfo.endCursor || null,
    }
  } : null;
  
  return (
    <CollectionPage
      collections={filteredCollections}
      products={formattedProducts}
      currentCollection={null}
    />
  );
}

// Query for all products (used on index page)
export const PAGINATION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query PaginatedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: UPDATED_AT) {
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
` as const;
