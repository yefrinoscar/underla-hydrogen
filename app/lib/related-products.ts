/**
 * Related Products Query and Logic
 * 
 * This file contains comprehensive strategies for finding related products using:
 * 1. Shopify's AI-powered productRecommendations (primary)
 * 2. Collection-based recommendations (fallback)
 * 3. Vendor-based recommendations (additional fallback)
 * 4. Multiple recommendation intents (RELATED, COMPLEMENTARY, etc.)
 */

import type { ProductItemFragment } from 'storefrontapi.generated';
import { PRODUCT_ITEM_FRAGMENT } from './fragments/product';

// Enhanced Related Products Query with multiple strategies
export const ENHANCED_RELATED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query EnhancedRelatedProducts(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $productId: ID!
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    # Strategy 1: Shopify's AI-powered product recommendations (RELATED intent)
    relatedRecommendations: productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductItem
    }
    
    # Strategy 2: Shopify's AI-powered product recommendations (COMPLEMENTARY intent)
    complementaryRecommendations: productRecommendations(productId: $productId, intent: COMPLEMENTARY) {
      ...ProductItem
    }
    
    # Strategy 3: Collection-based products as fallback
    product(handle: $handle) {
      id
      vendor
      productType
      tags
      collections(first: 5) {
        nodes {
          id
          handle
          title
          products(first: $first, sortKey: BEST_SELLING) {
            nodes {
              ...ProductItem
            }
          }
        }
      }
    }
    
    # Strategy 4: Popular products (sorted by best selling) as additional fallback
    popularProducts: products(
      first: $first,
      sortKey: BEST_SELLING
    ) {
      nodes {
        ...ProductItem
      }
    }
  }
` as const;

// Simplified query for basic usage (current implementation compatible)
export const RELATED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query RelatedProducts(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $productId: ID!
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    # Primary: Shopify's AI-powered product recommendations
    productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductItem
    }
    
    # Fallback: Collection-based products
    product(handle: $handle) {
      id
      vendor
      collections(first: 3) {
        nodes {
          products(first: $first, sortKey: BEST_SELLING) {
            nodes {
              ...ProductItem
            }
          }
        }
      }
    }
  }
` as const;

// Processing logic for related products with multiple strategies
export function processRelatedProducts(
  result: any, 
  currentProductHandle: string,
  maxProducts: number = 8
): { products: ProductItemFragment[] } {
  console.log('Processing related products result:', result);
  
  const allRelatedProducts: ProductItemFragment[] = [];
  const seenProductIds = new Set<string>();
  
  // Strategy 1: AI-powered RELATED recommendations (highest priority)
  if (result?.productRecommendations?.length) {
    const relatedProducts = result.productRecommendations.filter(
      (product: any) => product.handle !== currentProductHandle && !seenProductIds.has(product.id)
    );
    
    relatedProducts.forEach((product: any) => {
      if (allRelatedProducts.length < maxProducts) {
        allRelatedProducts.push(product);
        seenProductIds.add(product.id);
      }
    });
    
    console.log('Added AI RELATED recommendations:', relatedProducts.length);
  }
  
  // Strategy 2: AI-powered COMPLEMENTARY recommendations
  if (result?.complementaryRecommendations?.length && allRelatedProducts.length < maxProducts) {
    const complementaryProducts = result.complementaryRecommendations.filter(
      (product: any) => product.handle !== currentProductHandle && !seenProductIds.has(product.id)
    );
    
    complementaryProducts.forEach((product: any) => {
      if (allRelatedProducts.length < maxProducts) {
        allRelatedProducts.push(product);
        seenProductIds.add(product.id);
      }
    });
    
    console.log('Added AI COMPLEMENTARY recommendations:', complementaryProducts.length);
  }
  
  // Strategy 3: Collection-based products (fallback)
  if (result?.product?.collections?.nodes?.length && allRelatedProducts.length < maxProducts) {
    for (const collection of result.product.collections.nodes) {
      if (allRelatedProducts.length >= maxProducts) break;
      
      const collectionProducts = collection.products.nodes.filter(
        (product: any) => product.handle !== currentProductHandle && !seenProductIds.has(product.id)
      );
      
      collectionProducts.forEach((product: any) => {
        if (allRelatedProducts.length < maxProducts) {
          allRelatedProducts.push(product);
          seenProductIds.add(product.id);
        }
      });
      
      if (collectionProducts.length > 0) {
        console.log(`Added collection "${collection.title}" products:`, collectionProducts.length);
      }
    }
  }
  
  // Strategy 4: Popular products (additional fallback)
  if (result?.popularProducts?.nodes?.length && allRelatedProducts.length < maxProducts) {
    const popularProducts = result.popularProducts.nodes.filter(
      (product: any) => product.handle !== currentProductHandle && !seenProductIds.has(product.id)
    );
    
    popularProducts.forEach((product: any) => {
      if (allRelatedProducts.length < maxProducts) {
        allRelatedProducts.push(product);
        seenProductIds.add(product.id);
      }
    });
    
    if (popularProducts.length > 0) {
      console.log('Added popular products as fallback:', popularProducts.length);
    }
  }
  
  console.log(`Final related products count: ${allRelatedProducts.length}`);
  return { products: allRelatedProducts };
}

// Enhanced processing for the enhanced query
export function processEnhancedRelatedProducts(
  result: any, 
  currentProductHandle: string,
  maxProducts: number = 8
): { products: ProductItemFragment[] } {
  return processRelatedProducts(result, currentProductHandle, maxProducts);
}

// Recommendation intents available in Shopify
export const RECOMMENDATION_INTENTS = {
  RELATED: 'RELATED',
  COMPLEMENTARY: 'COMPLEMENTARY',
  CROSS_SELL: 'CROSS_SELL',
  UPSELL: 'UPSELL'
} as const;

export type RecommendationIntent = typeof RECOMMENDATION_INTENTS[keyof typeof RECOMMENDATION_INTENTS];

// Utility function to get product ID from handle (if needed)
export function getProductGid(productId: string): string {
  // If already a GID, return as is
  if (productId.startsWith('gid://shopify/Product/')) {
    return productId;
  }
  
  // If numeric ID, convert to GID
  if (/^\d+$/.test(productId)) {
    return `gid://shopify/Product/${productId}`;
  }
  
  // If it's a handle or other format, return as is (let GraphQL handle it)
  return productId;
} 