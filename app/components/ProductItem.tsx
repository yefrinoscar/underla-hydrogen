import { Link } from "@remix-run/react";
import { Image, Money } from "@shopify/hydrogen";
import { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";

export function ProductItem({
    product,
    loading,
}: {
    product: ProductItemFragment;
    loading?: 'eager' | 'lazy';
}) {
    const variant = product.variants.nodes[0];
    const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
    return (
        <Link
            key={product.id}
            className="bg-neutral-100 rounded-[20px] p-5 col-span-1 block"
            prefetch="intent"
            to={variantUrl}
        >

            {product.featuredImage && (
                <Image
                    alt={product.featuredImage.altText || product.title}
                    data={product.featuredImage}
                    aspectRatio="1/1"
                    loading={loading}
                    className='w-full rounded-[20px]! mb-5'
                />
            )}
            <h4 className='text-sm font-medium text-neutral-800 text-ellipsis whitespace-nowrap overflow-hidden'>{product.title}</h4>
            <small>
                <Money data={product.priceRange.minVariantPrice} className='text-sm text-underla-500 font-semibold' />
            </small>
        </Link>
    );
}