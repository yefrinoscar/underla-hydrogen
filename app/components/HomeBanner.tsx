import { Link } from "@remix-run/react";
import { Image, Money } from "@shopify/hydrogen";
import { Suspense } from "react";
import { Await } from "@remix-run/react";
import type { HomeProductsQuery, RecommendedProductsQuery } from "storefrontapi.generated";
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';
import { DiscountBadge } from "./DiscountBadge";
import badge_percent from '../assets/badge-percent.svg';

// Helper function to get the first PNG image
function getFirstPngImage(images: Array<Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>>) {
    for (const image of images) {
        if (image && typeof image === 'object' && image.url) {
            if (image.url.toLowerCase().endsWith('.png')) {
                return image; // Found the first PNG image, return the object
            }
        }
    }

    return images[0]; // No PNG image found in the array
}

export function HomeBanner({
    products,
}: {
    products: Promise<HomeProductsQuery | null>;
}) {
    return (
        <div className='container-app grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-5 h-auto md:h-[500px]'>
            <div className='col-span-1 md:grid-cols-6 flex items-center justify-center md:justify-start'>
                <h1 className='font-bold text-3xl md:text-5xl motion-preset-blur-down motion-delay-300 text-center md:text-start'>Todo lo que <br />
                    <span className='text-underla-yellow '>necesitas</span>, <br />
                    en un solo lugar</h1>
            </div>

            <div className='grid col-span-1 md:grid-cols-10 grid-rows-2 gap-5 *:bg-underla-50 *:rounded-default md:*:rounded-[49px] md:h-auto'>
                <Suspense fallback={<div>Loading...</div>}>
                    <Await resolve={products}>
                        {
                            (response) => {
                                return response
                                    ? response.products.nodes.map((product, index) => {
                                        // Calculate real discount percentage
                                        const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
                                        const currentPrice = product.priceRange.minVariantPrice.amount;
                                        const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(currentPrice);

                                        // Calculate actual discount percentage if available
                                        const discountPercentage = hasDiscount
                                            ? Math.round((1 - (Number(currentPrice) / Number(compareAtPrice))) * 100)
                                            : 0;

                                        const aling = `${product.tags.includes('order-3') ? '' : 'justify-center items-center'}`
                                        const className = `relative flex ${aling} motion-preset-fade motion-delay-${(index + 1) * 200} ${product.tags.includes('order-3') ? `col-span-10` : `col-span-5`} ${product.tags.join(' ')} h-44 md:h-auto`;

                                        return (
                                            <Link
                                                key={index}
                                                to={`/products/${product.handle}`}
                                                prefetch="intent"
                                                className={className}
                                            >
                                                {
                                                    product.tags.indexOf('order-3') === index ? (<>
                                                        <div className="rounded-l-default md:rounded-l-[49px] overflow-hidden w-[280px] h-full">
                                                            <div className="bg-underla-500 h-7/10 p-3 text-center pt-4 flex flex-col justify-between">
                                                                <p className="text-white font-medium !text-xs md:!text-sm !pt-3">
                                                                    {product.title}
                                                                </p>
                                                                <div>
                                                                    {hasDiscount && compareAtPrice && (
                                                                        <span className="text-neutral-400 line-through text-xs md:text-sm">
                                                                            {compareAtPrice} {product.priceRange.minVariantPrice.currencyCode}
                                                                        </span>
                                                                    )}
                                                                    <Money
                                                                        data={product.priceRange.minVariantPrice}
                                                                        className='text-white font-semibold text-xs md:text-sm'
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="bg-underla-yellow h-3/10 p-3 flex justify-center items-center space-x-2">

                                                                <img src={badge_percent} className="h-5 w-5 stroke-white" alt="%" />

                                                                <span className="text-white font-semibold text-sm md:text-lg">
                                                                    {discountPercentage}% off
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="relative w-full h-full rounded-r-[49px]">
                                                            <Image
                                                                width={400}
                                                                height={400}
                                                                data={getFirstPngImage(product.images.nodes)}
                                                                className='object-contain h-full absolute motion-preset-scale-up'
                                                            />
                                                        </div>
                                                    </>) : (
                                                        <>
                                                            <div className='absolute top-0 left-0 -translate-x-2.5 -translate-y-3.5 flex space-x-1 md:space-x-2'>
                                                                <div className="bottom-2 md:space-x-2 flex flex-col text-center bg-underla-500 px-3 py-1 rounded-full">
                                                                    {hasDiscount && compareAtPrice && (
                                                                        <span className="text-neutral-400 line-through text-xs">
                                                                            {compareAtPrice} {product.priceRange.minVariantPrice.currencyCode}
                                                                        </span>
                                                                    )}
                                                                    <Money
                                                                        data={product.priceRange.minVariantPrice}
                                                                        className='text-white font-semibold text-xs'
                                                                    />
                                                                </div>
                                                                {discountPercentage > 0 && (
                                                                    <DiscountBadge
                                                                        discountPercentage={discountPercentage}
                                                                        className="self-start shrink-0 motion-delay-${(index + 1) * 300}"
                                                                        size="md"
                                                                    />
                                                                )}
                                                            </div>

                                                            <Image
                                                                width={150}
                                                                height={150}
                                                                data={getFirstPngImage(product.images.nodes)}
                                                                className='object-contain h-3/5! absolute motion-preset-scale-up'
                                                            />
                                                        </>
                                                    )
                                                }

                                            </Link>
                                        );
                                    }) : null
                            }
                        }
                    </Await>
                </Suspense>
            </div>
        </div>
    );
} 