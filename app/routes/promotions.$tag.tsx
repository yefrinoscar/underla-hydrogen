import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, Link, useOutletContext, useParams, useNavigate } from '@remix-run/react';
import { getPaginationVariables, Image, Money, Pagination } from '@shopify/hydrogen';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductItem } from '~/components/ProductItem';
import { motion } from "framer-motion";
import { Promotion } from '~/types/promotion';
import { PRODUCT_ITEM_FRAGMENT } from '~/lib/fragments';

export async function loader(args: LoaderFunctionArgs) {
  const { tag } = args.params;

  const variables = getPaginationVariables(args.request, {
    pageBy: 8,
  });

  const { products } = await args.context.storefront.query(PROMOTIONS_QUERY, {
    variables: { ...variables, tag: `tag:${tag}` },
  });

  return {
    products,
    currentTag: tag
  };
}

export default function PromotionDetail() {
  const { products, currentTag } = useLoaderData<typeof loader>();
  const { promotions } = useOutletContext<{ promotions: Promotion[] }>();
  const params = useParams();
  const { ref, inView } = useInView();

  // Find the specific promotion that matches the current tag
  const currentPromotion = promotions.find(
    promo => promo.tags.toLowerCase() === params.tag?.toLowerCase()
  );

  return (
    <div className="container-app flex flex-col gap-8">
      {/* Promotional Banner */}

      <div
        className="w-full rounded-[20px] text-white motion-preset-slide-down overflow-hidden"
        style={{
          backgroundImage: `url(${currentPromotion?.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: 'transparent'
        }}
      >
        <div
          className="p-8"
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)`
          }}
        >
          <p className="text-md md:text-xl !mb-4 font-medium">🎉 Ofertas por tiempo limitado</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{currentPromotion?.title}</h1>
          <p className="text-lg md:text-xl mb-6">{currentPromotion?.description}</p>
          <div className="flex flex-wrap gap-4 items-center">
            {currentPromotion?.start_date && currentPromotion?.end_date && (
              <span className="text-sm mt-4">
                Válido del {new Date(currentPromotion?.start_date).toLocaleDateString()}
                al {new Date(currentPromotion.end_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
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
`; 