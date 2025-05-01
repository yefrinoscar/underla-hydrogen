import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-neutral-100 rounded-[20px] p-5 col-span-1 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-square rounded-[20px] bg-neutral-200 mb-5"></div>
      
      {/* Title skeleton */}
      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
      
      {/* Price skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function ProductSkeletonGrid() {
  // Create an array of 8 elements to display a grid of skeletons
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </>
  );
}
