import zona_gamer_bg from '../assets/images-categories/zona-gamer-bg.jpg'
import mundo_tennis_bg from '../assets/images-categories/mundo-tennis-bg.jpg'


/**
 * Enum for special collection handles that should use the /collections/special/$handle route
 * instead of the standard /collections/$handle route
 */
export enum SpecialCollectionHandle {
  TENNIS = 'mundo-tennis',
  ZONA_GAMER = 'zona-gamer'
}

/**
 * Configuration for special collections including redirect URLs and background images
 */
export const SPECIAL_COLLECTIONS_CONFIG = {
  [SpecialCollectionHandle.TENNIS]: {
    redirectUrl: '/collections/special/mundo-tennis_lifestyle',
    backgroundImage: mundo_tennis_bg,
    title: 'Mundo Tennis',
    description: 'Descubre nuestra colección exclusiva de productos de tennis',
    replace: /\b(de\s+)?[Tt]ennis\b/
  },
  [SpecialCollectionHandle.ZONA_GAMER]: {
    redirectUrl: '/collections/special/zona-gamer_monitores',
    backgroundImage: zona_gamer_bg,
    title: 'Zona Gamer',
    description: 'Equipamiento de alta gama para gamers exigentes',
    replace: /\b[Zz]ona gamer\b/gi
  }
};

/**
 * Check if a collection handle should use the special collection route
 * @param handle The collection handle to check
 * @returns boolean indicating if the handle should use the special route
 */
export function isSpecialCollection(handle: string): boolean {
  return Object.values(SpecialCollectionHandle).includes(handle as SpecialCollectionHandle);
}

/**
 * Get the appropriate URL for a collection based on whether it's a special collection
 * @param handle The collection handle
 * @returns The URL path for the collection
 */
export function getCollectionUrl(handle: string): string {
  
  if (isSpecialCollection(handle)) {
    return `/collections/special/${handle}`;
  }
  return `/collections/${handle}`;
}
