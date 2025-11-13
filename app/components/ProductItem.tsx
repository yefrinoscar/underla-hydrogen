import { Link } from "react-router";
import { Image } from "@shopify/hydrogen";
import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import React from 'react';
import { DiscountBadge } from "./DiscountBadge";
import { Money } from "./Money";
import { useModal } from "~/components/Modal";

// Extract types from ProductItemFragment for better type safety
type ProductVariantNode = ProductItemFragment['variants']['nodes'][number];
type SelectedOption = ProductVariantNode['selectedOptions'][number];
type ProductImage = NonNullable<ProductItemFragment['featuredImage']>;
type PriceRange = ProductItemFragment['priceRange'];
type CompareAtPriceRange = ProductItemFragment['compareAtPriceRange'];

export function ProductItem({
    product,
    loading,
    whiteBackground = false,
}: {
    product: ProductItemFragment;
    loading?: 'eager' | 'lazy';
    whiteBackground?: boolean;
}) {
    // Get the first available variant or the first variant if none are available
    const firstVariant = product.variants.nodes[0];
    
    // Always use the product handle for the URL without variant parameters
    const productUrl = `/products/${product.handle}`;

    // Check if product has multiple variants by looking at the nodes array length
    const hasMultipleVariants = product.variants.nodes.length > 1;
    
    // Extract unique variant options for display
    const getUniqueVariantOptions = () => {
        if (!hasMultipleVariants) return [];
        
        // Get all variant options
        const allOptions: { name: string; values: string[] }[] = [];
        
        // Process all variants
        product.variants.nodes.forEach(variant => {
            variant.selectedOptions.forEach(option => {
                // Find if this option type already exists in our array
                const existingOption = allOptions.find(opt => opt.name === option.name);
                
                if (existingOption) {
                    // Add the value if it doesn't already exist
                    if (!existingOption.values.includes(option.value)) {
                        existingOption.values.push(option.value);
                    }
                } else {
                    // Add new option type with this value
                    allOptions.push({ name: option.name, values: [option.value] });
                }
            });
        });
        
        return allOptions;
    };
    
    const variantOptions = getUniqueVariantOptions();
    
    // Count available variants for each option type
    const getAvailableVariantCounts = () => {
        const counts: Record<string, number> = {};
        
        // Get variants that are available for sale
        const inStockVariants = product.variants.nodes.filter(v => v.availableForSale === true);
        
        // For each option type, count how many unique values are available
        variantOptions.forEach(option => {
            const availableValues = new Set<string>();
            
            inStockVariants.forEach(variant => {
                const matchingOption = variant.selectedOptions.find(opt => opt.name === option.name);
                if (matchingOption) {
                    availableValues.add(matchingOption.value);
                }
            });
            
            counts[option.name.toLowerCase()] = availableValues.size;
        });
        
        return counts;
    };
    
    // Get count of in-stock variants
    const inStockVariantsCount = product.variants.nodes.filter(v => v.availableForSale === true).length;
    
    const availableVariantCounts = getAvailableVariantCounts();
    
    // Get the open function from the modal hook
    const { open } = useModal();
    
    // Debug log to check if product has multiple variants
    // console.log('Product:', product.title, 'Has multiple variants:', hasMultipleVariants, 'Count:', product.variants.nodes.length);

    // Current price
    const currentPrice = product.priceRange.minVariantPrice.amount;
    const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
    
    const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(currentPrice);
    const discountPercentage = hasDiscount
        ? Math.round((1 - (Number(currentPrice) / Number(compareAtPrice))) * 100)
        : 0;

    return (
        <Link
            key={product.id}
            className={`${whiteBackground ? 'bg-white' : 'bg-neutral-100'} rounded-[20px] p-3 md:p-5 col-span-1 flex flex-col h-[380px] md:h-[470px] space-y-2 md:space-y-4`}
            prefetch="intent"
            to={productUrl}
        >
            {product.featuredImage && (
                <Image
                    alt={product.featuredImage.altText || product.title}
                    data={product.featuredImage}
                    aspectRatio="1/1"
                    loading={loading}
                    className='w-full rounded-[12px] md:rounded-[20px] bg-white'
                    width={200}
                    height={200}
                />
            )}
            <div className="flex flex-col justify-between space-y-1 md:space-y-2 h-full">
                <div className="">
                    <h4 className='text-xs md:text-sm font-medium text-neutral-800 line-clamp-2 md:line-clamp-1'>{product.title}</h4>
                    <div className="flex flex-col gap-1">
                        {/* Mobile: Stack vertically, Desktop: Horizontal */}
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                            {hasDiscount && (
                                <DiscountBadge
                                    discountPercentage={discountPercentage}
                                    size="sm"
                                    className="text-black text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 self-start"
                                    showIcon={false}
                                />
                            )}
                            <small className="flex items-center">
                                <Money data={product.priceRange.minVariantPrice} className='text-sm md:text-base text-underla-500 font-semibold' />
                            </small>
                        </div>

                        {hasDiscount && (
                            <small className="text-gray-400 line-through text-xs md:text-sm font-semibold flex gap-1">
                                Antes <Money data={product.compareAtPriceRange.minVariantPrice} />
                            </small>
                        )}
                    </div>
                </div>
                <div>
                    {product.availableForSale ? (
                        <>
                            {hasMultipleVariants && (
                                <div className="relative mt-1 md:mt-2">
                                    {/* Simplified variant indicator */}
                                    <div className="bg-white rounded-lg border border-gray-200 px-2 py-1.5 md:p-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1 md:gap-1.5">
                                            <span className="text-gray-800 text-[10px] md:text-xs font-medium">Variantes</span>
                                            <span className="bg-underla-100 text-underla-700 text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded-full font-semibold">
                                                {inStockVariantsCount}
                                            </span>
                                        </div>
                                        <span className="text-[10px] md:text-xs text-underla-600 font-semibold">
                                            Ver
                                        </span>
                                    </div>
                                </div>
                            )}
                            {!hasMultipleVariants &&
                                <button className="bg-underla-500 text-white px-2 py-1.5 md:px-3.5 md:py-2.5 rounded-[10px] text-xs md:text-sm font-semibold cursor-pointer hover:bg-underla-600 transition-colors duration-200 ease-in-out w-full">
                                    Agregar
                                </button>
                            }
                        </>
                    ) : (
                        <>
                            <span 
                                className="relative inline-block text-white px-2 py-1 md:px-2.5 md:py-1.5 rounded-[10px] text-[10px] md:text-[12px] font-medium overflow-hidden animate-gradient"
                                style={{
                                    background: 'linear-gradient(-45deg, #22c55e, #16a34a, #15803d, #166534)',
                                    backgroundSize: '400% 400%',
                                }}
                            >
                                Entrega en 15 días
                            </span>

                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    open('default', `Solicitud de producto agotado: ${product.title}`);
                                }}
                                className="bg-zinc-800 text-white px-2 py-1.5 md:px-3.5 md:py-2.5 rounded-[10px] text-xs md:text-sm font-semibold cursor-pointer hover:bg-zinc-700 transition-colors duration-200 ease-in-out w-full"
                            >
                                Hacer pedido
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Helper function for color codes
const getColorCode = (colorName: string) => {
    const colorMap: Record<string, string> = {
        'rojo': '#ef4444',
        'azul': '#3b82f6',
        'verde': '#22c55e',
        'amarillo': '#eab308',
        'negro': '#171717',
        'blanco': '#ffffff',
        'gris': '#6b7280',
        'rosado': '#ec4899',
        'morado': '#8b5cf6',
        'naranja': '#f97316',
        'marrón': '#78350f',
        'beige': '#e5e5d2',
    };
    return colorMap[colorName.toLowerCase()] || null;
};
