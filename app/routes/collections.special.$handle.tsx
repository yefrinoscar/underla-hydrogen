import { useLoaderData, Link, useParams, useNavigation } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import { type LoaderFunctionArgs, MetaFunction, redirect } from '@shopify/remix-oxygen';
import { getPaginationVariables, Pagination } from '@shopify/hydrogen';
import type { ProductItemFragment, CollectionFragment } from 'storefrontapi.generated';
import { COLLECTION_QUERY, COLLECTIONS_QUERY, PRODUCT_ITEM_FRAGMENT } from '~/lib/fragments';
import { filterCollections, getSpecialCollection } from '~/utils/collection-filters';
import { InfiniteProductGrid } from '~/components/CollectionGrid';
import { CategoryCard } from '~/components/CategoryImage';
import { 
  SpecialCollectionHandle, 
  SPECIAL_COLLECTIONS_CONFIG 
} from '~/utils/special-collections';

interface SpecialCollectionInfo {
  title: string;
  description: string;
  image?: string;
  backgroundImage: string;
  replace: RegExp;
}

interface LoaderData {
  collections: {
    nodes: CollectionFragment[];
  };
  collection?: {
    products: {
      nodes: ProductItemFragment[];
      pageInfo: {
        hasPreviousPage: boolean;
        hasNextPage: boolean;
        startCursor: string | null;
        endCursor: string | null;
      };
    };
  };
  products?: {
    nodes: ProductItemFragment[];
    pageInfo: {
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
  specialCollectionInfo: SpecialCollectionInfo;
  baseCollection: string;
  subcategory?: string;
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  const loaderData = data as LoaderData;
  return [{ title: `${loaderData?.specialCollectionInfo.title}` }];
};

export async function loader(args: LoaderFunctionArgs): Promise<LoaderData | Response> {
  const { params } = args;
  const { handle } = params;

  if (!handle) {
    return redirect('/');
  }
  
  const { baseCollection, subcategory } = getSpecialCollection(handle);
  
  // Check if the handle exists in SPECIAL_COLLECTIONS_CONFIG and redirect if needed
  if (baseCollection && !subcategory) {
    const config = SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle];
    if (config?.redirectUrl) {
      return redirect(config.redirectUrl);
    }
  } else if(!baseCollection) {
    return redirect('/');
  }

  const criticalData = await loadCriticalData({ ...args, baseCollection });
  
  return { ...criticalData, baseCollection, subcategory: subcategory || undefined };
}

async function loadCriticalData({ context, request, params, baseCollection }: LoaderFunctionArgs & { baseCollection: string }) {
  const { handle } = params;

  // Fragment for fetching basic special collection information 
  const SPECIAL_COLLECTION_DATA_FRAGMENT = `#graphql
    fragment SpecialCollectionData on Collection {
      id
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
    }
  ` as const;

  // Query to get special collection title and description by handle
  const GET_SPECIAL_COLLECTION_DATA_QUERY = `#graphql
    ${SPECIAL_COLLECTION_DATA_FRAGMENT}
    query GetSpecialCollectionData(
      $handle: String!
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(country: $country, language: $language) {
      collection(handle: $handle) {
        ...SpecialCollectionData
      }
    }
  ` as const;

  // Fetch special collection title and description from Shopify API
  const { collection: specialCollectionData } = await context.storefront.query(
    GET_SPECIAL_COLLECTION_DATA_QUERY,
    {
      variables: { handle: baseCollection as string },
    },
  );

  const title = specialCollectionData?.title || 'Collection';
  const description = specialCollectionData?.description || '';
  const image = specialCollectionData?.image?.url;
  // backgroundImage will still come from local config as it's specific to UI
  const backgroundImage = SPECIAL_COLLECTIONS_CONFIG[handle as SpecialCollectionHandle]?.backgroundImage || ''; 
  // Construct specialCollectionInfo with data from API and config
  const specialCollectionInfo = {
    title,
    description,
    image,
    backgroundImage,
    replace: SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle]?.replace
  };

  const variables = getPaginationVariables(request, {
    pageBy: 8, // 8 products per page for better initial load
  });

  // Load collections in all cases
  const { collections } = await context.storefront.query(COLLECTIONS_QUERY);
  
  // Query for products in the collection with filters
  const { collection } = await context.storefront.query(COLLECTION_QUERY, {
    variables: { 
      handle: handle as string, 
      ...variables 
    }
  });

  console.log('collection.nodes', JSON.stringify(collections?.nodes));
  console.log('collection.products.nodes', JSON.stringify(collection?.products.nodes));
  
  // If no products found, fall back to regular products
  if (!collection || collection.products.nodes.length === 0) {
    const { products: fallbackProducts } = await context.storefront.query(PAGINATION_PRODUCTS_QUERY, {
      variables
    });
    // Pass the API-derived title/desc and config-derived backgroundImage
    return { collections, products: fallbackProducts, specialCollectionInfo };
  } 
  
  return { 
    collections, 
    collection,
    // Pass the API-derived title/desc and config-derived backgroundImage
    specialCollectionInfo
  };
}

export default function SpecialCollections() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { collections, collection, baseCollection, specialCollectionInfo } = data;
  const { handle } = useParams();
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';
  
  // State for managing product visibility during transitions
  const [showProducts, setShowProducts] = useState(true);
  const previousHandleRef = useRef(handle);
  
  // Handle product transitions when category changes
  useEffect(() => {
    if (handle !== previousHandleRef.current) {
      setShowProducts(false);
      const timer = setTimeout(() => {
        previousHandleRef.current = handle;
        setShowProducts(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!showProducts && !isNavigating) {
      setShowProducts(true);
    }
  }, [handle, isNavigating, showProducts]);
  
  // Filter collections for tennis-related collections
  const filteredCollections = filterCollections(collections.nodes, `${baseCollection}_`);
   
  // Get the connection for pagination with proper type handling
  const connection = collection?.products || {
    nodes: [],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: false,
      startCursor: null,
      endCursor: null,
    }
  };
  
  // Get the background image for the current handle
  const getBackgroundImage = () => {
    return SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle]?.backgroundImage;
  };
  
  const backgroundImage = getBackgroundImage();

  return (
    <div className={`w-full ${navigation.state === 'loading' ? 'navigation-loading' : ''}`}>
      {/* Hero section with background image */}
      <div className="absolute top-0 w-full h-[600px] -z-10">
        <div 
          className="w-full h-full bg-cover bg-center" 
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/55"></div>
        </div>
      </div>

      <div className="relative z-10 container-app h-full flex flex-col justify-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">{specialCollectionInfo.title}</h1>
          <p className="text-xl md:text-2xl max-w-2xl">
            {specialCollectionInfo.description}
          </p>
          
          {/* Category grid with unified cards */}
          <div className="flex flex-wrap gap-6 mt-8 justify-center">
            {filteredCollections.map((category) => {
              const isActive = handle === category.handle;
              const categoryTitle = category.title.replace(specialCollectionInfo.replace, '').trim();
              
              return (
                <Link 
                  key={category.handle} 
                  to={`/collections/special/${category.handle}`}
                  className="transition-all duration-300"
                >
                  <CategoryCard 
                    handle={category.handle}
                    title={categoryTitle}
                    isActive={isActive}
                    size="normal"
                    image={category.image?.url}
                    fallbackImage={specialCollectionInfo.image}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      
      {/* Products section */}
      <div className="container-app py-12 min-h-[1000px] transition-opacity ease-in-out">
        <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
          {showProducts && (
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
          )}
        </div>
      </div>
    </div>
  );
}

// Query for products in a special collection
export const SPECIAL_COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query SpecialCollectionProducts(
    $specialHandle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first, 
      last: $last, 
      before: $startCursor, 
      after: $endCursor, 
      sortKey: UPDATED_AT,
      query: $specialHandle
    ) {
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

// Query for all products (used as fallback)
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
