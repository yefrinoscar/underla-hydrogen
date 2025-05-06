/**
 * Utility functions for filtering collections
 */

import { isSpecialCollection } from "./special-collections";

/**
 * Filters collections based on whether their handles include or exclude a string
 * @param collections Array of collection objects with a handle property
 * @param include String that should be included in the handle (if provided)
 * @param exclude String that should be excluded from the handle (if provided)
 * @returns Filtered array of collections
 */
export function filterCollections<T extends { handle: string }>(
  collections: T[],
  include?: string,
  exclude?: string
): T[] {
  return collections.filter(collection => {
    // Check if the handle includes the required string (if provided)
    const includeCheck = include ? collection.handle.includes(include) : true;
    
    // Check if the handle excludes the specified string (if provided)
    const excludeCheck = exclude ? !collection.handle.includes(exclude) : true;
    
    // Both conditions must be met
    return includeCheck && excludeCheck;
  });
}

/**
 * Filters collections by hyphenated segments to find special collections with subcategories
 * @param handle The collection handle to filter
 * @returns An object with the special collection base and subcategory (if any)
 */
/**
 * Identifies special collections and their subcategories from a handle
 * @param handle The collection handle to analyze
 * @returns An object with the base collection and subcategory (if any)
 */
export function getSpecialCollection(handle: string): { baseCollection: string | null, subcategory: string | null } {
  // Direct return for handles without underscores
  if (!handle.includes('_')) {
    // Check if it's a special collection without subcategory
    return isSpecialCollection(handle) 
      ? { baseCollection: handle, subcategory: null }
      : { baseCollection: null, subcategory: null };
  }
  
  // Split by underscore to separate base collection from subcategory
  const [baseCollection, ...subcategoryParts] = handle.split('_');
  
  // If the base is a special collection, return with subcategory
  if (isSpecialCollection(baseCollection)) {
    const subcategory = subcategoryParts.length > 0 ? subcategoryParts.join('_') : null;
    return { baseCollection, subcategory };
  }
  
  // Not a special collection
  return { baseCollection: null, subcategory: null };
}
