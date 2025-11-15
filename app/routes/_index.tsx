import { type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, type MetaFunction } from 'react-router';
import { useEffect } from 'react';
import type { Promotion } from '~/types/promotion';
import { HomeBanner, type HomeProductsQueryResult } from '~/components/HomeBanner';
import { FeaturedCollection, type FeaturedCollectionQuery } from '~/components/FeaturedCollection';
import { RecommendedProducts, type RecommendedProductsQueryResult } from '~/components/RecommendedProducts';
import { CategoryCollection } from '~/components/CategoryCollection';
import { Promotions } from '~/components/Promotions';
import { PromotionCarousel } from '~/components/PromotionCarousel';
import { CtaRequest } from '~/components/CtaRequest';
import { tryCatch } from '~/utils/tryCatch';
import {
  FEATURED_COLLECTION_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
  HOME_PRODUCTS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
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
  promotions: Promotion[];
}> {
  const collections = context.storefront
    .query(FEATURED_COLLECTION_QUERY)
    .catch((error: unknown) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  // Fetch promotions
  const { data: promotionsResponse, error } = await tryCatch(
    fetch('https://dashboard.underla.store/api/promotions')
  );

  let promotions: Promotion[] = [];
  if (!error && promotionsResponse) {
    promotions = await promotionsResponse.json() as Promotion[];
  }

  return {
    collections,
    promotions,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: LoaderFunctionArgs): {
  recommendedProducts: Promise<RecommendedProductsQueryResult | null>;
  lipsProducts: Promise<any>;
  sneakersProducts: Promise<any>;
  perfumesProducts: Promise<any>;
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

  const lipsProducts = context.storefront
    .query(COLLECTION_PRODUCTS_QUERY, {
      variables: {
        handle: 'para-ellas_labios',
        first: 6
      }
    })
    .catch((error: unknown) => {
      console.error(error);
      return null;
    });

  const sneakersProducts = context.storefront
    .query(COLLECTION_PRODUCTS_QUERY, {
      variables: {
        handle: 'streetwear_zapatillas',
        first: 6
      }
    })
    .catch((error: unknown) => {
      console.error(error);
      return null;
    });

  const perfumesProducts = context.storefront
    .query(COLLECTION_PRODUCTS_QUERY, {
      variables: {
        handle: 'perfumes_disenador',
        first: 6
      }
    })
    .catch((error: unknown) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
    lipsProducts,
    sneakersProducts,
    perfumesProducts,
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
  const { promotions } = data;

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
    <>

      <div className="space-y-8">

        {/* CTA Hero - Above "Los productos de la semana" */}
        <CtaRequest variant="emoji" />

        {/* Promotions Carousel */}
        {promotions && promotions.length > 0 && (
          <PromotionCarousel promotions={promotions} />
        )}

        {/* Hero Banner with 3 Featured Products */}
        <HomeBanner products={data.homeProducts} />

        {/* Categories Horizontal Scroll */}
        <FeaturedCollection collections={data.collections} />

        {/* Best Sellers */}
        <RecommendedProducts products={data.recommendedProducts} />

        {/* Lips Collection */}
        <CategoryCollection
          products={data.lipsProducts}
          collection={data.collections}
          title="Labios que Enamoran"
          subtitle="Dale vida a tu sonrisa con nuestra colección exclusiva"
          categoryHandle="para-ellas_labios"
          titleAccentColor="text-pink-500"
        />

        {/* Sneakers Collection */}
        <CategoryCollection
          products={data.sneakersProducts}
          collection={data.collections}
          title="Streetwear Urbano"
          subtitle="Las zapatillas más cool para tu estilo único"
          categoryHandle="streetwear_zapatillas"
          titleAccentColor="text-neutral-900"
        />

        {/* Perfumes Collection */}
        <CategoryCollection
          products={data.perfumesProducts}
          collection={data.collections}
          title="Perfumes de Diseñador"
          subtitle="Fragancias exclusivas que definen tu personalidad"
          categoryHandle="perfumes_disenador"
          titleAccentColor="text-neutral-900"
        />

        {/* CTA Request Form */}
        <CtaRequest />
      </div>
    </>
  );
}
