import { Link } from "@remix-run/react";
import { Image, Money } from "@shopify/hydrogen";
import { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import React from 'react';
import { DiscountBadge } from "./DiscountBadge";

export function ProductItem({
    product,
    loading,
}: {
    product: ProductItemFragment;
    loading?: 'eager' | 'lazy';
}) {
    const variant = product.variants.nodes[0];
    const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
    
    // Calculate discount percentage if there's a price difference
    const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
    const currentPrice = product.priceRange.minVariantPrice.amount;
    const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(currentPrice);
    const discountPercentage = hasDiscount 
        ? Math.round((1 - (Number(currentPrice) / Number(compareAtPrice))) * 100) 
        : 0;
    
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
                    width={200}
                    height={200}
                />
            )}
            <h4 className='text-sm font-medium text-neutral-800 text-ellipsis whitespace-nowrap overflow-hidden'>{product.title}</h4>
            <div className="flex flex-wrap items-center gap-2">
                <small className="flex items-center">
                    <Money data={product.priceRange.minVariantPrice} className='text-sm text-underla-500 font-semibold' />
                    {/* {!product.availableForSale && <span className="text-red-500 ml-2">Sold Out</span>} */}
                </small>
                
                {hasDiscount && (
                    <>
                        <small className="text-gray-500 line-through text-xs">
                            {compareAtPrice} {product.priceRange.minVariantPrice.currencyCode}
                        </small>
                        <DiscountBadge 
                            discountPercentage={discountPercentage} 
                            size="sm" 
                            className="text-black"
                        />
                    </>
                )}
            </div>
        </Link>
    );
}
