import { Pagination } from '@shopify/hydrogen';
import type { CollectionFragment, ProductItemFragment } from 'storefrontapi.generated';
import { CollectionsHeader, InfiniteProductGrid } from '~/components/CollectionGrid';

interface CollectionPageProps {
  collections: CollectionFragment[];
  products: {
    nodes: ProductItemFragment[];
    pageInfo: {
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  } | null;
  currentCollection?: string | null;
}

export function CollectionPage({ 
  collections, 
  products, 
  currentCollection = null 
}: CollectionPageProps) {
  // Create an empty connection if products is not provided
  const connection = products || {
    nodes: [],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: false,
      startCursor: null,
      endCursor: null,
    },
  };

  return (
    <div className="container-app flex flex-col gap-8">
      <CollectionsHeader 
        collections={collections} 
        currentCollection={currentCollection} 
      />
      
      <div className='grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        <Pagination connection={connection}>
          {({ nodes, NextLink, hasNextPage, nextPageUrl, state }) => (
            <InfiniteProductGrid
              products={nodes as ProductItemFragment[]}
              hasNextPage={hasNextPage}
              nextPageUrl={nextPageUrl}
              state={state}
              NextLink={NextLink}
            />
          )}
        </Pagination>
      </div>
    </div>
  );
}