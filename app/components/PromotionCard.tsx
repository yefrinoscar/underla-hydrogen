import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Promotion } from "~/types/promotion";


export function PromotionCard({ promotion, className = '' }: { promotion: Promotion, className?: string }) {

    return (
        <div
        style={{
            background: `url(${promotion.image_url})`
        }}
            className={`${className} relative w-full p-4 col-span-12 md:col-span-6 md:mx-auto rounded-[20px] text-white overflow-hidden shadow-lg`}
        >
            <Link to={promotion.condition_type === 'tags' ? `/promotions/${promotion.condition_value.toLowerCase()}` : `/products/${promotion.id}`}>
                <div className="h-full flex w-full">
                    <div className="w-full flex items-center justify-between flex-wrap">
                        <div className="flex-1 flex items-center h-full">
                            <span className="flex p-2 animate-pulse">
                                <svg
                                    className="h-6 w-6 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                                    />
                                </svg>
                            </span>
                            <div className="ml-3 flex flex-col">
                                <span className="text-[20px]/12 md:text-[35px]/12 font-bold text-white">{promotion.title}</span>
                                <span className="text-sm md:font-medium md:text-lg text-white">{promotion.description}</span>
                            </div>
                        </div>
                        <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto z-10">
                            {/* <Link
                                to={promotion.condition_type === 'tags' ? `/promotions/${promotion.condition_value.toLowerCase()}` : `/products/${promotion.id}`}
                                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-white text-neutral-600  transition-colors duration-300 hover:scale-105 transform"
                            >
                                Ver promo
                            </Link> */}
                        </div>
                        {/* <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                            <button
                                type="button"
                                className="-mr-1 flex p-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 transition-colors duration-300"
                                onClick={() => setIsVisible(false)}
                            >
                                <span className="sr-only">Dismiss</span>
                                <X className="h-5 w-5 text-white" aria-hidden="true" />
                            </button>
                        </div> */}
                    </div>
                </div>

                {/* Decorative elements with animations */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20">
                    <div className="w-40 h-40 rounded-full bg-white opacity-10 animate-pulse-slow"></div>
                </div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16">
                    <div className="w-32 h-32 rounded-full bg-white opacity-10 animate-pulse-slower"></div>
                </div>
            </Link>
        </div>
    );
}
