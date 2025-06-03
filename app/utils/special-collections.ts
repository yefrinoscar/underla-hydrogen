import zona_gamer_bg from '../assets/images-categories/zona-gamer-bg.jpg'
import mundo_tennis_bg from '../assets/images-categories/mundo-tennis-bg.jpg'
import for_girls_bg from '../assets/images-categories/for-girls-bg.jpg'
import apple_bg from '../assets/images-categories/apple-bg.jpg'
import streetwear_bg from '../assets/images-categories/streetwear-bg.jpg'


/**
 * Enum for special collection handles that should use the /collections/special/$handle route
 * instead of the standard /collections/$handle route
 */
export enum SpecialCollectionHandle {
  TENNIS = 'mundo-tennis',
  ZONA_GAMER = 'zona-gamer',
  FOR_GIRLS = 'para-ellas',
  APPLE = 'mundo-apple',
  STREET_WEAR = 'streetwear'
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
  },
  [SpecialCollectionHandle.FOR_GIRLS]: {
    redirectUrl: '/collections/special/para-ellas_labios',
    backgroundImage: for_girls_bg,
    title: 'Para Ellas',
    description: 'Un espacio pensado para ellas, donde bienestar, estilo y autenticidad se encuentran. Todo lo necesario para sentirse plena, poderosa y feliz, en un solo lugar.',
    replace: /\bpara ellas\b/gi
  },
  [SpecialCollectionHandle.APPLE]: {
    redirectUrl: '/collections/special/mundo-apple_iphone',
    backgroundImage: apple_bg,
    title: 'Mundo Apple',
    description: 'Todo lo que necesitas para potenciar tu ecosistema Apple, en un solo lugar. Accesorios, gadgets y tecnología 100% compatibles con tu estilo de vida Apple.',
    replace: /\b(de\s+)?[Aa]pple\b/
  },
  [SpecialCollectionHandle.STREET_WEAR]: {
    redirectUrl: '/collections/special/streetwear_polos',
    backgroundImage: streetwear_bg,
    title: 'Streetwear',
    description: 'Estilo urbano con actitud: ropa y accesorios que marcan tendencia en la calle. Diseños frescos, cómodos y llenos de personalidad para destacar en cualquier lugar.',
    replace: /\b(de\s+)?[Ss]treetwear\b/
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
