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
import bgImage from '~/assets/bg-image.png';

interface SpecialCollectionInfo {
  title: string;
  description: string;
  image?: string;
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

export const meta: MetaFunction<typeof loader> = ({data}) => {
  const loaderData = data as LoaderData;
  return [{ title: `${loaderData?.specialCollectionInfo.title}` }];
};

export async function loader(args: LoaderFunctionArgs): Promise<LoaderData | Response> {
  const { params, context, request } = args;
  const { handle } = params;

  if (!handle) return redirect('/');

  const { baseCollection, subcategory } = getSpecialCollection(handle);
  if (!baseCollection) return redirect('/');

  const config = SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle];
  if (config?.redirectUrl && !subcategory) return redirect(config.redirectUrl);

  const criticalData = await loadCriticalData({ ...args, baseCollection });
  
  return {
    ...criticalData,
    baseCollection,
    subcategory: subcategory || undefined
  };
}

async function loadCriticalData({ context, request, params, baseCollection }: LoaderFunctionArgs & { baseCollection: string }) {
  const { handle } = params;

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

  const { collection: specialCollectionData } = await context.storefront.query(
    GET_SPECIAL_COLLECTION_DATA_QUERY,
    {
      variables: { handle: baseCollection as string },
    },
  );

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

  const specialCollectionInfo = {
    title,
    description,
    image,
    replace: SPECIAL_COLLECTIONS_CONFIG[baseCollection as SpecialCollectionHandle]?.replace,
    bannerUrl,
    videoUrl
  };

  const variables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const { collections } = await context.storefront.query(COLLECTIONS_QUERY);

  const { collection: rawCollection } = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle: handle as string,
      ...variables
    }
  });

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

  if (!collection || collection.products.nodes.length === 0) {
    const { products: fallbackProducts } = await context.storefront.query(PAGINATION_PRODUCTS_QUERY, {
      variables
    });
    const products = {
      ...fallbackProducts,
      pageInfo: {
        ...fallbackProducts.pageInfo,
        startCursor: fallbackProducts.pageInfo.startCursor || null,
        endCursor: fallbackProducts.pageInfo.endCursor || null,
      }
    };
    return { collections, products, specialCollectionInfo, collection: undefined };
  }

  return { collections, collection, specialCollectionInfo, products: undefined };
}

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

  const isLoading = navigation.state === 'loading';
  const [bannerLoaded, setBannerLoaded] = useState(false);

  // Filter collections with memoization
  const filteredCollections = filterCollections(collections.nodes, `${baseCollection}_`);

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
    <>
      {/* Fixed gradient background */}
      <div 
        className='fixed inset-0 -z-10'
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className='space-y-4 relative min-h-screen'>
        <div
          className={`w-full ${isLoading ? 'opacity-75 transition-opacity' : ''}`}
          role="main"
          aria-labelledby="collection-title"
        >
        <section className='container-app py-0! space-y-4'>
          <div>
            <h1
              id="collection-title"
              className="text-2xl md:text-6xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              {specialCollectionInfo.title}
            </h1>
          </div>

          {/* Banner */}

          <div className={`flex flex-row gap-4 transition-all duration-500 ease-out ${bannerLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className='w-1/3 md:w-1/3 h-[200px] md:h-[250px] relative overflow-hidden rounded-lg'>
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
            <div className='w-2/3 md:w-2/3 h-[200px] md:h-[250px] relative overflow-hidden rounded-lg'>
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
          className="flex flex-wrap relative z-0 px-4 md:px-0"
          aria-label="Collection categories"
        >
        <HorizontalScroll
          itemWidth={170}
          arrowSize="md"
        >
          {filteredCollections.map((category) => {
            const isActive = handle === category.handle;
            const categoryTitle = category.title.replace(specialCollectionInfo.replace, '').trim();

            return (
              <Link
                key={category.handle}
                to={`/collections/special/${category.handle}`}
                className={`relative h-[180px] md:h-[240px] w-[120px] md:w-[170px] rounded-lg shrink-0 flex flex-col justify-between text-sm font-medium p-4 transition-all duration-200 hover:shadow-lg ${isActive ? 'bg-stone-900 text-white' : 'bg-[#EFEFEF] hover:bg-[#E5E5E5]'}`}
                aria-label={`View ${categoryTitle} collection`}
              >
                <div className='flex flex-col mb-4'>
                  <span className='text-[16px] font-bold'>{categoryTitle}</span>
                  <span className='hidden md:block text-[12px]'>Reflejo de tu esencia</span>
                </div>

                {
                  category.description === '1' ? (
                    <div className='absolute bottom-0 left-0 w-full flex justify-center items-center'>
                      <img src={category.image?.url || ''} alt={category.title} className='object-fit w-[90%]' />
                    </div>
                  ) : (
                    <div className={`self-center rounded-full w-full aspect-square ${category.description === '2' ? '' : 'overflow-hidden'}`}>
                      <img src={category.image?.url || ''} alt={category.title} className='w-full h-full object-cover' />
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
              <div className="grid gap-4 grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                <Pagination connection={connection}>
                  {({ nodes, isLoading, NextLink, hasNextPage, nextPageUrl, state }) => (
                    <InfiniteProductGrid
                      products={nodes as ProductItemFragment[]}
                      hasNextPage={hasNextPage}
                      nextPageUrl={nextPageUrl}
                      state={{
                        pageBy: connection.pageInfo.hasNextPage ? nodes.length : 0,
                        startCursor: connection.pageInfo.startCursor ?? '',
                        endCursor: connection.pageInfo.endCursor ?? '',
                      }}
                      NextLink={NextLink as any}
                      whiteBackground={true}
                    />
                  )}
                </Pagination>
              </div>
            )}
          </Suspense>
          </section>
        </div>
      </div>
    </>
  );
}

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

const SpecialCollectionsWithErrorBoundary = () => (
  <ErrorBoundary>
    <SpecialCollections />
  </ErrorBoundary>
);

export default SpecialCollectionsWithErrorBoundary;
