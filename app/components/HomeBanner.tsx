import { Link } from "react-router";
import { Image, Money } from "@shopify/hydrogen";
import { Suspense } from "react";
import { Await } from "react-router";
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
        <div className='container-app py-8 md:py-12'>
            {/* Section Title */}
            <div className="mb-8">
                <h2 className='text-3xl md:text-4xl font-bold text-neutral-800 motion-preset-blur-down'>
                    Productos Especiales de la Semana
                </h2>
            </div>

            {/* Hero Banner - 3 Equal Width Elements */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-auto'>
                <Suspense fallback={
                    <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-200 animate-pulse rounded-3xl h-[320px]"></div>
                        ))}
                    </div>
                }>
                    <Await resolve={products}>
                        {(response) => {
                            if (!response || response.products.nodes.length === 0) {
                                return null;
                            }

                            return response.products.nodes.slice(0, 3).map((product, index) => {
                                // Calculate real discount percentage
                                const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
                                const currentPrice = product.priceRange.minVariantPrice.amount;
                                const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(currentPrice);

                                // Calculate actual discount percentage if available
                                const discountPercentage = hasDiscount
                                    ? Math.round((1 - (Number(currentPrice) / Number(compareAtPrice))) * 100)
                                    : 0;

                                return (
                                    <Link
                                        key={product.id}
                                        to={`/products/${product.handle}`}
                                        prefetch="intent"
                                        className={`group relative overflow-hidden bg-gradient-to-br from-underla-50 to-underla-100 rounded-3xl h-[320px] md:h-[380px] flex flex-col justify-between p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] motion-preset-fade motion-delay-${index * 150}`}
                                    >
                                        {/* Discount Badge */}
                                        {discountPercentage > 0 && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <div className="bg-underla-yellow text-white font-bold px-4 py-2 rounded-full shadow-lg flex items-center space-x-1">
                                                    <img src={badge_percent} className="h-4 w-4" alt="%" />
                                                    <span className="text-sm">{discountPercentage}% OFF</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Image */}
                                        <div className="flex-1 flex items-center justify-center relative">
                                            <Image
                                                width={280}
                                                height={280}
                                                data={getFirstPngImage(product.images.nodes)}
                                                className='object-contain max-h-[200px] md:max-h-[240px] w-auto transition-transform duration-300 group-hover:scale-110 motion-preset-scale-up'
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-neutral-800 text-sm md:text-base line-clamp-2 min-h-[40px]">
                                                {product.title}
                                            </h3>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    {hasDiscount && compareAtPrice && (
                                                        <span className="text-neutral-400 line-through text-xs">
                                                            {compareAtPrice} {product.priceRange.minVariantPrice.currencyCode}
                                                        </span>
                                                    )}
                                                    <Money
                                                        data={product.priceRange.minVariantPrice}
                                                        className='text-underla-500 font-bold text-lg md:text-xl'
                                                    />
                                                </div>
                                                
                                                <div className="bg-underla-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors group-hover:bg-underla-600">
                                                    Ver más
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            });
                        }}
                    </Await>
                </Suspense>
            </div>
        </div>
    );
} 
