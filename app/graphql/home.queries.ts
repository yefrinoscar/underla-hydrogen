/**
 * GraphQL Queries for Home Page
 * Contains all queries related to the homepage data fetching
 */

export const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection {
    collections(first: 100, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

export const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($query: String!) {
    products(first: 6, query: $query) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

export const HOME_PRODUCTS_QUERY = `#graphql
  fragment HomeProduct on Product {
    id
    title
    handle
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    availableForSale
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query HomeProducts($query: String!)  {
      products(first: 3, query: $query) {
        nodes {
          ...HomeProduct
        }
      }
  }
` as const;
