import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, Link, useNavigate } from '@remix-run/react';
import { getPaginationVariables, Image, Money, Pagination } from '@shopify/hydrogen';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductItem } from '~/components/ProductItem';
import { motion } from "framer-motion";

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({ ...deferredData, ...criticalData });
}

async function loadCriticalData({ context, request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const tag = searchParams.get('tag') || 'sale';
  
  const variables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const { products } = await context.storefront.query(PROMOTIONS_QUERY, {
    variables: { ...variables, tag: `tag:${tag}` },
  });

  const tags = await context.storefront.query(PROMOTION_TAGS_QUERY);

  return { products, tags: tags.productTags.nodes, currentTag: tag };
}

function loadDeferredData({ context }: LoaderFunctionArgs) {
  return {};
}

export default function Promotions() {
  const { products, tags, currentTag } = useLoaderData<typeof loader>();
  const { ref, inView } = useInView();

  return (
    <div className="container-app flex flex-col gap-8">
      {/* Promotional Banner */}
      <div className="w-full bg-gradient-to-r from-underla-500 to-underla-yellow rounded-[20px] p-8 text-white motion-preset-slide-down">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Ofertas Especiales</h1>
        <p className="text-lg md:text-xl mb-6">Descubre nuestras mejores promociones con descuentos de hasta 50% off</p>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-2xl font-bold">🎉 Ofertas por tiempo limitado</span>
          <span className="bg-white text-underla-500 px-4 py-2 rounded-full font-semibold">
            Hasta 50% OFF
          </span>
        </div>
      </div>

      {/* Category/Tag Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 motion-preset-slide-up">
        {tags.map((tag: string, index: number) => (
          <Link
            key={tag}
            to={`/promotions/${tag.toLowerCase()}`}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors motion-preset-pop motion-delay-${index * 100} 
              ${currentTag === tag.toLowerCase() 
                ? 'bg-underla-500 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:grid-cols-4 motion-preset-fade motion-delay-300">
        <Pagination connection={products}>
          {({ nodes, NextLink, hasNextPage, nextPageUrl, state }) => (
            <>
              <ProductsLoadedOnScroll
                nodes={nodes as ProductItemFragment[]}
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

interface ProductsLoadedOnScrollProps {
  nodes: ProductItemFragment[];
  inView: boolean;
  hasNextPage: boolean;
  nextPageUrl: string;
  state: any;
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

  return nodes.map((product, index) => (
    <motion.li
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className='list-none'
    >
      <ProductItem key={product.id} product={product} />
    </motion.li>
  ));
}


export const PRODUCT_ITEM_FRAGMENT = `#graphql
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
    availableForSale
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

const PROMOTIONS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query PromotionsProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $tag: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first, 
      last: $last, 
      before: $startCursor, 
      after: $endCursor,
      query: $tag
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

const PROMOTION_TAGS_QUERY = `#graphql
  query GetPromotionTags {
    productTags(first: 10) {
      nodes
    }
  }
` as const; 