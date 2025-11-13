import { type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, type MetaFunction, useOutletContext } from 'react-router';
import { useEffect } from 'react';
import type { Promotion } from '~/types/promotion';
import { HomeBanner, type HomeProductsQueryResult } from '~/components/HomeBanner';
import { FeaturedCollection, type FeaturedCollectionQuery } from '~/components/FeaturedCollection';
import { RecommendedProducts, type RecommendedProductsQueryResult } from '~/components/RecommendedProducts';
import { Promotions } from '~/components/Promotions';
import { CtaRequest } from '~/components/CtaRequest';
import {
  FEATURED_COLLECTION_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
  HOME_PRODUCTS_QUERY,
} from '~/graphql/home.queries';

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
async function loadCriticalData({ context }: LoaderFunctionArgs): Promise<{
  collections: Promise<FeaturedCollectionQuery | null>;
}> {
  const collections = context.storefront
    .query(FEATURED_COLLECTION_QUERY)
    .catch((error: unknown) => {
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
function loadDeferredData({ context }: LoaderFunctionArgs): {
  recommendedProducts: Promise<RecommendedProductsQueryResult | null>;
} {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: { query: 'tag:top-selling' }
    })
    .catch((error: unknown) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

function loadHomeProducts({ context }: LoaderFunctionArgs): {
  homeProducts: Promise<HomeProductsQueryResult | null>;
} {
  const homeProducts = context.storefront
    .query(HOME_PRODUCTS_QUERY, {
      variables: { query: 'tag:Home' }
    })
    .catch((error: unknown) => {
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

  // Handle scroll to categories if URL has hash
  useEffect(() => {
    if (window.location.hash === '#categorias') {
      setTimeout(() => {
        const categoriesSection = document.getElementById('categorias');
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100); // Small delay to ensure the page is fully loaded
    }
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-neutral-50 space-y-8">
      {/* Hero Banner with 3 Featured Products */}
      <HomeBanner products={data.homeProducts} />
      
      {/* Categories Horizontal Scroll */}
      <FeaturedCollection collections={data.collections} />
      
      {/* Best Sellers */}
      <RecommendedProducts products={data.recommendedProducts} />
      
      {/* Promotions Banner */}
      {promotions && promotions.length > 0 && (
        <Promotions promotions={promotions} />
      )}
      
      {/* Another Featured Products Section */}
      <RecommendedProducts products={data.recommendedProducts} />
      
      {/* CTA Request Form */}
      <CtaRequest />
    </div>
  );
}
