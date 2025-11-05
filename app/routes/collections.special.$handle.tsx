import { useLoaderData, Link, useParams, useNavigation } from 'react-router';
import { useState, useEffect, useRef, Suspense, memo } from 'react';
import { type LoaderFunctionArgs, MetaFunction, redirect } from 'react-router';
import { getPaginationVariables, Pagination } from '@shopify/hydrogen';
import type { ProductItemFragment, CollectionFragment } from 'storefrontapi.generated';
import { COLLECTION_QUERY, COLLECTIONS_QUERY, PRODUCT_ITEM_FRAGMENT } from '~/lib/fragments';
import { filterCollections, getSpecialCollection } from '~/utils/collection-filters';
import { InfiniteProductGrid } from '~/components/CollectionGrid';
import { CategoryCard } from '~/components/CategoryImage';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { HorizontalScroll } from '~/components/HorizontalScroll';
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
  bannerUrl: string | null;
  videoUrl: string | null;
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

/**
 * Meta function with enhanced SEO
 */
export const meta: MetaFunction<typeof loader> = ({data}) => {
  const loaderData = data as LoaderData;
  return [{ title: `${loaderData?.specialCollectionInfo.title}` }];
};

/**
 * Enhanced loader with better error handling and performance optimizations
 */
export async function loader(args: LoaderFunctionArgs): Promise<LoaderData | Response> {
  const { params, context, request } = args;
  const { handle } = params;

  if (!handle) {
    return redirect('/');
  }

  const { baseCollection, subcategory } = getSpecialCollection(handle);
  
  // Check if the handle exists in SPECIAL_COLLECTIONS_CONFIG and redirect if needed
  if (!baseCollection) return redirect('/');

  const config = SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle];
  if (config?.redirectUrl && !subcategory) return redirect(config.redirectUrl);

  const criticalData = await loadCriticalData({ ...args, baseCollection });
  
  return { ...criticalData, baseCollection, subcategory: subcategory || undefined };
}

/**
 * Optimized data loading function with better error handling
 */
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

  // Fetch banner and video URLs from custom API
  let bannerUrl: string | null = null;
  let videoUrl: string | null = null;
  
  try {
    const apiResponse = await fetch(`https://dashboard.underla.store/api/collections/${baseCollection}`);
    if (apiResponse.ok) {
      const apiData = await apiResponse.json() as { handle: string; banner_url: string | null; video_url: string | null };
      bannerUrl = apiData.banner_url;
      videoUrl = apiData.video_url;
    }
  } catch (error) {
    console.error('Error fetching collection media:', error);
  }

  const title = specialCollectionData?.title || 'Collection';
  const description = specialCollectionData?.description || '';
  const image = specialCollectionData?.image?.url;
  // backgroundImage will still come from local config as it's specific to UI
  const backgroundImage = SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle]?.backgroundImage || '';
  // Construct specialCollectionInfo with data from API and config
  const specialCollectionInfo = {
    title,
    description,
    image,
    backgroundImage,
    replace: SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle]?.replace,
    bannerUrl,
    videoUrl
  };

  const variables = getPaginationVariables(request, {
    pageBy: 8, // 8 products per page for better initial load
  });

  // Load collections in all cases
  const { collections } = await context.storefront.query(COLLECTIONS_QUERY);

  // Query for products in the collection with filters
  const { collection: rawCollection } = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle: handle as string,
      ...variables
    }
  });

  // Adjust collection to match LoaderData interface
  const collection = rawCollection ? {
    ...rawCollection,
    products: {
      ...rawCollection.products,
      pageInfo: {
        ...rawCollection.products.pageInfo,
        startCursor: rawCollection.products.pageInfo.startCursor || null,
        endCursor: rawCollection.products.pageInfo.endCursor || null,
      }
    }
  } : undefined;

  // If no products found, fall back to regular products
  if (!collection || collection.products.nodes.length === 0) {
    const { products: fallbackProducts } = await context.storefront.query(PAGINATION_PRODUCTS_QUERY, {
      variables
    });
    // Ensure pageInfo cursors are string | null to match LoaderData interface
    const products = {
      ...fallbackProducts,
      pageInfo: {
        ...fallbackProducts.pageInfo,
        startCursor: fallbackProducts.pageInfo.startCursor || null,
        endCursor: fallbackProducts.pageInfo.endCursor || null,
      }
    };
    // Pass the API-derived title/desc and config-derived backgroundImage
    return { collections, products, specialCollectionInfo };
  }
  
  return { 
    collections, 
    collection,
    // Pass the API-derived title/desc and config-derived backgroundImage
    specialCollectionInfo
  };
}

/**
 * Custom hook for managing collection transitions
 */
function useCollectionTransition(handle: string | undefined) {
  const [showProducts, setShowProducts] = useState(true);
  const previousHandleRef = useRef(handle);

  useEffect(() => {
    if (handle !== previousHandleRef.current) {
      setShowProducts(false);
      const timer = setTimeout(() => {
        previousHandleRef.current = handle;
        setShowProducts(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!showProducts) {
      setShowProducts(true);
    }
  }, [handle, showProducts]);

  return showProducts;
}

/**
 * Memoized category card component for better performance
 */
const MemoizedCategoryCard = memo<{
  category: any;
  isActive: boolean;
  specialCollectionInfo: any;
  handle: string;
}>(({ category, isActive, specialCollectionInfo, handle }) => {
  const categoryTitle = category.title.replace(specialCollectionInfo.replace, '').trim();

  return (
    <Link
      to={`/collections/special/${category.handle}`}
      className="transition-all duration-300 hover:scale-105"
      aria-label={`View ${categoryTitle} collection`}
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
});

MemoizedCategoryCard.displayName = 'MemoizedCategoryCard';

/**
 * Loading skeleton component
 */
function CollectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main component with enhanced performance and accessibility
 */
function SpecialCollections() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { collections, collection, baseCollection, specialCollectionInfo } = data;
  const { handle } = useParams();
  const navigation = useNavigation();

  const showProducts = useCollectionTransition(handle);
  const isLoading = navigation.state === 'loading';
  const [bannerLoaded, setBannerLoaded] = useState(false);

  // Filter collections with memoization
  const filteredCollections = filterCollections(collections.nodes, `${baseCollection}_`);

  // Get background image with error handling
  const backgroundImage = SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle]?.backgroundImage;

  // Get connection for pagination
  const connection = collection?.products || {
    nodes: [],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: false,
      startCursor: null,
      endCursor: null,
    }
  };

  // Trigger banner animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setBannerLoaded(true);
    }, 100); // Quick enter

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='space-y-4'>
      <div
        className={`w-full ${isLoading ? 'opacity-75 transition-opacity' : ''}`}
        role="main"
        aria-labelledby="collection-title"
      >
        <section className='container-app !py-0 space-y-4'>
          <div>
            <h1
              id="collection-title"
              className="text-4xl md:text-6xl lg:text-3xl font-bold mb-6 leading-tight"
            >
              {specialCollectionInfo.title}
            </h1>
          </div>

          {/* Banner */}

          <div className={`h-[250px] flex space-x-4 transition-all duration-500 ease-out ${bannerLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className='w-1/3 h-full relative overflow-hidden rounded-lg'>
              {specialCollectionInfo.videoUrl ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={specialCollectionInfo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div 
                  className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-sm">Video placeholder</span>
                </div>
              )}
            </div>
            <div className='w-2/3 h-full relative overflow-hidden rounded-lg'>
              {specialCollectionInfo.bannerUrl ? (
                <div
                  className='w-full h-full'
                  style={{
                    backgroundImage: `url(${specialCollectionInfo.bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-sm">Banner placeholder</span>
                </div>
              )}
            </div>
          </div>


        </section>
      </div>

      <nav
        className="flex flex-wrap relative z-0"
        aria-label="Collection categories"
      >
        <HorizontalScroll
          itemWidth={180}
          arrowSize="md"
        >
          {filteredCollections.map((category) => {
            const isActive = handle === category.handle;
            const categoryTitle = category.title.replace(specialCollectionInfo.replace, '').trim();

            return (
              <Link
                key={category.handle}
                to={`/collections/special/${category.handle}`}
                className={`relative h-[240px] w-[170px] rounded-lg flex-shrink-0 flex flex-col justify-between text-sm font-medium relative p-4 transition-all duration-200 hover:shadow-lg ${isActive ? 'bg-stone-900 text-white' : 'bg-[#EFEFEF] hover:bg-[#E5E5E5]'}`}
                aria-label={`View ${categoryTitle} collection`}
              >
                <div className='flex flex-col'>
                  <span className='text-[16px] font-bold'>{categoryTitle}</span>
                  <span className='text-[12px]'>Reflejo de tu esencia</span>
                </div>

                {
                  category.description === '1' ? (
                    <div className='absolute bottom-0 left-0 w-full flex justify-center items-center'>
                      <img src={category.image?.url || ''} alt={category.title} className='object-fit w-[90%]' />
                    </div>
                  ) : (
                    <div className={`self-center bottom-2 right-2 rounded-full ${category.description === '2' ? '' : 'overflow-hidden'}`}>
                      <img src={category.image?.url || ''} alt={category.title} className='w-[120px] h-[120px]' />
                    </div>
                  )
                }
              </Link>
            );
          })}
        </HorizontalScroll>
      </nav>


      <div>
        <section
          className="container-app !py-0 min-h-[500px] transition-opacity duration-300"
          aria-label="Collection products"
        >
          <Suspense fallback={<CollectionSkeleton />}>
            {connection.nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 3l4 2 4-2-4-2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-gray-700">
                    ¡Pronto tendremos productos increíbles!
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Estamos trabajando para traerte los mejores productos. Muy pronto podrás descubrir nuestra nueva colección especial.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            )}
          </Suspense>
        </section>
      </div>

    </div>

  );
}

/**
 * Export with ErrorBoundary wrapper for enhanced error handling
 */
const SpecialCollectionsWithErrorBoundary = () => (
  <ErrorBoundary>
    <SpecialCollections />
  </ErrorBoundary>
);

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

export default SpecialCollectionsWithErrorBoundary;
