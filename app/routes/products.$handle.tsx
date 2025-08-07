import { Suspense } from 'react';
import { redirect, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData, type MetaFunction } from '@remix-run/react';
import type { ProductFragment } from 'storefrontapi.generated';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
} from '@shopify/hydrogen';
import type { SelectedOption } from '@shopify/hydrogen/storefront-api-types';
import { getVariantUrl } from '~/lib/variants';
import { ProductPrice } from '~/components/ProductPrice';
import { ProductImage } from '~/components/ProductImage';
import { ProductForm } from '~/components/ProductForm';
import { RelatedProducts } from '~/components/RelatedProducts';
import { RELATED_PRODUCTS_QUERY, processRelatedProducts } from '~/lib/related-products';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Underla | ${data?.product.title ?? ''}` }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Start fetching non-critical data with product ID from critical data
  const deferredData = loadDeferredData(args, criticalData.product.id);

  return { ...deferredData, ...criticalData };
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

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: { handle, selectedOptions: getSelectedProductOptions(request) },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  console.log(product.variants.nodes);

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option: SelectedOption) =>
        option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    // if no selected variant was returned from the selected options,
    // we redirect to the first variant's url with it's selected options applied
    if (!product.selectedVariant) {
      throw redirectToFirstVariant({ product, request });
    }
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context, params }: LoaderFunctionArgs, productId: string) {
  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = context.storefront
    .query(VARIANTS_QUERY, {
      variables: { handle: params.handle! },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  // Load related products using Shopify's intelligent recommendations
  const relatedProducts = context.storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: { 
        handle: params.handle!,
        productId: productId,
        first: 8 // Fetch 8 products to have enough for rotation
      },
    })
    .then((result) => {
      // Use the improved processing function with multiple strategies
      return processRelatedProducts(result, params.handle!, 8);
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error('Error loading related products:', error);
      return { products: [] };
    });

  return {
    variants,
    relatedProducts,
  };
}

function redirectToFirstVariant({
  product,
  request,
}: {
  product: ProductFragment;
  request: Request;
}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];

  return redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {
      status: 302,
    },
  );
}

export default function Product() {
  const { product, variants, relatedProducts } = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedVariant,
    variants,
  );
  const { title, descriptionHtml } = product;

  // Process media nodes to convert them to the format expected by ProductImage
  const processedMedia = product.media.nodes.map((mediaNode: any) => {
    if (mediaNode.__typename === 'MediaImage' && mediaNode.image) {
      return {
        ...mediaNode.image,
        __typename: "Image",
      };
    } else if (mediaNode.__typename === 'Video' && mediaNode.sources?.length > 0) {
      const source = mediaNode.sources[0]; // Use first source
      return {
        __typename: "Video",
        id: mediaNode.id,
        url: source.url,
        altText: mediaNode.alt || undefined,
        width: source.width || undefined,
        height: source.height || undefined,
        mimeType: source.mimeType || undefined,
      };
    } else if (mediaNode.__typename === 'ExternalVideo') {
      return {
        __typename: "Video",
        id: mediaNode.id,
        url: mediaNode.originUrl,
        altText: mediaNode.alt || undefined,
      };
    }
    
    // Fallback for unsupported media types or invalid data
    return null;
  }).filter(Boolean);

  console.log('Processed media:', processedMedia);

  // Add test video to processed media for testing
  const mediaWithTestVideo = [...processedMedia];

  return (
    <>
      <div className="container-app grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <div className='col-span-1 motion-preset-fade'>
          <ProductImage
            image={selectedVariant?.image}
            allImages={mediaWithTestVideo}
          />
        </div>
        <div className="col-span-1 flex flex-col gap-5 motion-preset-fade motion-delay-100">
          <div className='gap-2'>
            <h1 className='font-bold text-neutral-700 text-xl md:text-2xl'>{title}</h1>
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>
          <Suspense
            fallback={
              <ProductForm
                product={product}
                selectedVariant={selectedVariant}
                variants={[]}
              />
            }
          >
            <Await
              errorElement="There was a problem loading product variants"
              resolve={variants}
            >
              {(data) => (
                <ProductForm
                  product={product}
                  selectedVariant={selectedVariant}
                  variants={data?.product?.variants.nodes || []}
                />
              )}
            </Await>
          </Suspense>
          <br />
          <br />
          <span className='text-sm font-semibold text-neutral-600'>Descripción</span>
          <div className='text-gray-600' dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </div>

      </div>
      
      {/* Related Products Section */}
      <RelatedProducts relatedProducts={relatedProducts} />

      <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      optionValues {
        name
      }
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    media(first: 10) {
      nodes {
        ...ProductMedia
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

// Define a fragment for ProductMedia to handle both images and videos
const PRODUCT_MEDIA_FRAGMENT = `#graphql
  fragment ProductMedia on Media {
    __typename
    mediaContentType
    ... on MediaImage {
      id
      image {
        id
        url
        altText
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        url
        mimeType
        format
        height
        width
      }
      alt
    }
    ... on ExternalVideo {
      id
      originUrl
      alt
    }
    ... on Model3d {
      id
      sources {
        url
        mimeType
        format
      }
      alt
    }
  }
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
  ${PRODUCT_MEDIA_FRAGMENT}
` as const;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
` as const;


