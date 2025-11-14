import { Link } from "react-router";
import { Image, Money } from "@shopify/hydrogen";
import { Suspense, useState, useRef, useEffect } from "react";
import { Await } from "react-router";
import type { ProductItemFragment } from 'storefrontapi.generated';
import badge_percent from '~/assets/badge-percent.svg';
import { Play, X } from 'lucide-react';
import exampleVideo from '~/assets/videos/example.mp4';

// Reuse and extend ProductItemFragment with only what's different
type HomeProduct = Omit<ProductItemFragment, 'featuredImage' | 'variants'> & {
    images: {
        nodes: Array<NonNullable<ProductItemFragment['featuredImage']>>;
    };
    tags: string[];
};

export interface HomeProductsQueryResult {
    products: {
        nodes: HomeProduct[];
    };
}

// Helper function to get the first PNG image
function getFirstPngImage(images: Array<NonNullable<ProductItemFragment['featuredImage']>>): NonNullable<ProductItemFragment['featuredImage']> {
    const pngImage = images.find(img => img?.url?.toLowerCase().endsWith('.png'));
    return pngImage || images[0];
}

export function HomeBanner({
    products,
}: {
    products: Promise<HomeProductsQueryResult | null>;
}) {
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);
    const [videoError1, setVideoError1] = useState(false);
    const [videoError2, setVideoError2] = useState(false);
    
    // URLs de videos verticales estilo reels/TikTok (formato 9:16)
    const verticalVideoUrl1 = exampleVideo;
    const verticalVideoUrl2 = exampleVideo;

    // Intentar reproducir los videos cuando se montan
    useEffect(() => {
        const playVideo = async (videoRef: React.RefObject<HTMLVideoElement>) => {
            if (videoRef.current) {
                try {
                    await videoRef.current.play();
                } catch (error) {
                    console.log('Autoplay bloqueado, requiere interacción del usuario');
                }
            }
        };

        playVideo(videoRef1);
        playVideo(videoRef2);
    }, []);

    return (
        <div className='container-app'>
            {/* Section Title */}
            <div className="mb-8">
                <h2 className='text-3xl md:text-4xl font-bold text-neutral-800 motion-preset-blur-down'>
                    Los productos de la semana
                </h2>
            </div>

            {/* Hero Grid: 2 Videos + 3 Columns Products */}
            <div className='flex flex-col md:flex-row gap-4 md:gap-6 md:h-[350px]'>
                {/* Videos Container - 50/50 on mobile */}
                <div className='flex md:contents gap-3 md:gap-4'>
                {/* Video 1 */}
                <div className='relative flex-1 aspect-[9/16] md:flex-none md:h-full md:aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-underla-100 to-underla-200 motion-preset-slide-right group'>
                    {!videoError1 ? (
                        <video
                            ref={videoRef1}
                            className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            onError={() => setVideoError1(true)}
                        >
                            <source src={verticalVideoUrl1} type="video/mp4" />
                        </video>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-underla-100 to-underla-200">
                            <Play className="w-12 h-12 text-underla-400" />
                        </div>
                    )}
                    <Link to="/collections/all" className="absolute bottom-0 left-0 right-0 p-4 text-white group-hover:pb-5 transition-all duration-300 bg-gradient-to-t from-underla-500/80 via-underla-500/40 to-transparent">
                        <h3 className="text-lg md:text-xl font-bold mb-2">Nuevos Productos</h3>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                            <span>Ver más</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Video 2 */}
                <div className='relative flex-1 aspect-[9/16] md:flex-none md:h-full md:aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-underla-200 to-underla-300 motion-preset-slide-right motion-delay-150 group'>
                    {!videoError2 ? (
                        <video
                            ref={videoRef2}
                            className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            onError={() => setVideoError2(true)}
                        >
                            <source src={verticalVideoUrl2} type="video/mp4" />
                        </video>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-underla-200 to-underla-300">
                            <Play className="w-12 h-12 text-underla-400" />
                        </div>
                    )}
                    <Link to="/collections/all" className="absolute bottom-0 left-0 right-0 p-4 text-white group-hover:pb-5 transition-all duration-300 bg-gradient-to-t from-underla-500/80 via-underla-500/40 to-transparent">
                        <h3 className="text-lg md:text-xl font-bold mb-2">Ofertas</h3>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                            <span>Ver más</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </div>
                </div>

                {/* Products Grid: 2 Columns Layout - Left (1 large), Right (2 stacked) */}
                <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                    <Suspense fallback={
                        <>
                            <div className="bg-gray-200 animate-pulse rounded-3xl h-[400px] md:h-full"></div>
                            <div className="flex flex-col gap-4 md:gap-6">
                                <div className="bg-gray-200 animate-pulse rounded-3xl h-[250px] md:flex-1"></div>
                                <div className="bg-gray-200 animate-pulse rounded-3xl h-[250px] md:flex-1"></div>
                            </div>
                        </>
                    }>
                        <Await resolve={products}>
                            {(response: HomeProductsQueryResult | null) => {
                                if (!response || response.products.nodes.length === 0) {
                                    return null;
                                }

                                // Ordenar productos por tag "order-X" y tomar los primeros 3
                                const productsArray = response.products.nodes
                                    .slice()
                                    .sort((a, b) => {
                                        const orderA = a.tags.find(tag => tag.startsWith('order-'));
                                        const orderB = b.tags.find(tag => tag.startsWith('order-'));
                                        
                                        if (!orderA && !orderB) return 0;
                                        if (!orderA) return 1;
                                        if (!orderB) return -1;
                                        
                                        const numA = parseInt(orderA.replace('order-', ''));
                                        const numB = parseInt(orderB.replace('order-', ''));
                                        
                                        return numA - numB;
                                    })
                                    .slice(0, 3);
                                
                                // Discount Badge Component - Reutilizable
                                const DiscountBadge = ({ percentage }: { percentage: number }) => (
                                    <div className="absolute top-3 right-3 z-10">
                                        <div className="bg-black text-white font-bold px-2.5 py-1 rounded-full">
                                            <span className="text-xs">-{percentage}%</span>
                                        </div>
                                    </div>
                                );
                                
                                // Product Card Large Component
                                const LargeCard = ({ product, index }: { product: HomeProduct; index: number }) => {
                                    const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
                                    const currentPrice = product.priceRange.minVariantPrice.amount;
                                    const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(currentPrice);
                                    const discountPercentage = hasDiscount
                                        ? Math.round((1 - (Number(currentPrice) / Number(compareAtPrice))) * 100)
                                        : 0;

                                    // Detectar tags para colores específicos
                                    const hasWomenTag = product.tags.some(tag => tag.toLowerCase() === 'women');
                                    const hasMenTag = product.tags.some(tag => tag.toLowerCase() === 'men');
                                    
                                    let bgColor, bgColorHover;
                                    
                                    if (hasWomenTag) {
                                        // Colores rosas para productos de mujer
                                        bgColor = `hsl(330, 55%, 92%)`;
                                        bgColorHover = `hsl(330, 60%, 88%)`;
                                    } else if (hasMenTag) {
                                        // Colores oscuros para productos de hombre
                                        bgColor = `hsl(210, 20%, 85%)`;
                                        bgColorHover = `hsl(210, 25%, 80%)`;
                                    } else {
                                        // Color basado en la URL de la imagen
                                        const imageUrl = getFirstPngImage(product.images.nodes).url;
                                        const urlHash = imageUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                        const hue = urlHash % 360;
                                        bgColor = `hsl(${hue}, 45%, 92%)`;
                                        bgColorHover = `hsl(${hue}, 50%, 88%)`;
                                    }

                                    return (
                                        <Link
                                            to={`/products/${product.handle}`}
                                            prefetch="intent"
                                            className="group relative overflow-hidden rounded-3xl h-[400px] md:h-full flex flex-col transition-all duration-500"
                                            style={{ 
                                                animationDelay: `${index * 100}ms`,
                                                backgroundColor: bgColor,
                                                ['--hover-bg' as string]: bgColorHover
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgColorHover}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
                                        >
                                            {/* Badge de descuento */}
                                            {discountPercentage > 0 && <DiscountBadge percentage={discountPercentage} />}
                                            
                                            {/* Imagen del producto */}
                                            <div className="flex-1 flex items-center justify-center min-h-0">
                                                <Image
                                                    width={350}
                                                    height={350}
                                                    data={getFirstPngImage(product.images.nodes)}
                                                    className='object-contain max-h-full w-auto transition-all duration-500 group-hover:rotate-3 group-hover:-translate-y-3'
                                                />
                                            </div>
                                            
                                            {/* Información del producto */}
                                            <div className="p-4 md:p-5 space-y-2">
                                                <h3 className="font-bold text-neutral-900 text-base line-clamp-2 leading-tight">
                                                    {product.title}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <Money
                                                        data={product.priceRange.minVariantPrice}
                                                        className='font-black text-2xl text-underla-500'
                                                    />
                                                    {hasDiscount && compareAtPrice && (
                                                        <span className="text-neutral-500 line-through text-sm font-medium">
                                                            {compareAtPrice}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                };

                                // Product Card Medium Component
                                const MediumCard = ({ product, index }: { product: HomeProduct; index: number }) => {
                                    const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
                                    const currentPrice = product.priceRange.minVariantPrice.amount;
                                    const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(currentPrice);
                                    const discountPercentage = hasDiscount
                                        ? Math.round((1 - (Number(currentPrice) / Number(compareAtPrice))) * 100)
                                        : 0;

                                    // Para los cards apilados usar gray-100
                                    const bgColor = '#f3f4f6'; // gray-100
                                    const bgColorHover = '#e5e7eb'; // gray-200

                                    return (
                                        <Link
                                            to={`/products/${product.handle}`}
                                            prefetch="intent"
                                            className="group relative overflow-hidden rounded-2xl flex-1 flex items-stretch transition-all duration-500"
                                            style={{ 
                                                animationDelay: `${index * 100}ms`,
                                                backgroundColor: bgColor
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgColorHover}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
                                        >
                                            {/* Badge de descuento */}
                                            {discountPercentage > 0 && <DiscountBadge percentage={discountPercentage} />}
                                            
                                            {/* Imagen del producto */}
                                            <div className="w-28 md:w-32 flex-shrink-0 flex items-center justify-center p-4">
                                                <Image
                                                    width={120}
                                                    height={120}
                                                    data={getFirstPngImage(product.images.nodes)}
                                                    className='object-contain w-full h-full transition-all duration-500 group-hover:-rotate-6 group-hover:translate-x-2'
                                                />
                                            </div>
                                            
                                            {/* Información del producto */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center p-4 gap-1.5">
                                                <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 leading-tight">
                                                    {product.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Money
                                                        data={product.priceRange.minVariantPrice}
                                                        className='font-black text-base text-underla-500'
                                                    />
                                                    {hasDiscount && compareAtPrice && (
                                                        <span className="text-neutral-500 line-through text-xs font-medium">
                                                            {compareAtPrice}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                };

                                return (
                                    <>
                                        {/* Left Column - Large Product (order-1) */}
                                        {productsArray[0] && <LargeCard product={productsArray[0]} index={0} />}

                                        {/* Right Column - Two Stacked Products (order-2 arriba, order-3 abajo) */}
                                        <div className="flex flex-col gap-4 md:gap-6">
                                            {productsArray[1] && <MediumCard product={productsArray[1]} index={1} />}
                                            {productsArray[2] && <MediumCard product={productsArray[2]} index={2} />}
                                        </div>
                                    </>
                                );
                            }}
                        </Await>
                    </Suspense>
                </div>
            </div>
        </div>
    );
} 
