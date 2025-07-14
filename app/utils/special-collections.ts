import zona_gamer_bg from '../assets/images-categories/zona-gamer-bg.jpg'
import mundo_tennis_bg from '../assets/images-categories/mundo-tennis-bg.jpg'
import for_girls_bg from '../assets/images-categories/for-girls-bg.jpg'
import apple_bg from '../assets/images-categories/apple-bg.jpg'
import streetwear_bg from '../assets/images-categories/streetwear-bg.jpg'
import audio_bg from '../assets/images-categories/audio-bg.jpg'
import phones_bg from '../assets/images-categories/celulares-bg.jpg'
import exclusive_bg from '../assets/images-categories/exclusivo-bg.jpg'
import perfumes_bg from '../assets/images-categories/perfumes-bg.jpg'


/**
 * Enum for special collection handles that should use the /collections/special/$handle route
 * instead of the standard /collections/$handle route
 */
export enum SpecialCollectionHandle {
  TENNIS = 'mundo-tennis',
  ZONA_GAMER = 'zona-gamer',
  FOR_GIRLS = 'para-ellas',
  APPLE = 'mundo-apple',
  STREET_WEAR = 'streetwear',
  AUDIO = 'audio-sonido',
  PHONES = 'celulares',
  EXCLUSIVE = 'exclusivo',
  PERFUMES = 'perfumes'
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
    replace: /\b[Mm]undo\s+[Aa]pple\b/ // fix que la palabra filtrada sea mundo apple y no apple
  },
  [SpecialCollectionHandle.STREET_WEAR]: {
    redirectUrl: '/collections/special/streetwear_polos',
    backgroundImage: streetwear_bg,
    title: 'Streetwear',
    description: 'Estilo urbano con actitud: ropa y accesorios que marcan tendencia en la calle. Diseños frescos, cómodos y llenos de personalidad para destacar en cualquier lugar.',
    replace: /\b(de\s+)?[Ss]treetwear\b/
  },
  [SpecialCollectionHandle.AUDIO]: {
    redirectUrl: '/collections/special/audio-sonido_samsung',
    backgroundImage: audio_bg,
    title: 'Audio y sonido',
    description: 'Sumérgete en el mundo del sonido con nuestra selección premium de audífonos, parlantes y accesorios de audio. Calidad, innovación y estilo para cada experiencia auditiva.',
    replace: /\b(de\s+)?(audio\s*y\s*sonido|audio|sonido)\b/gi
  },
  [SpecialCollectionHandle.PHONES]: {
    redirectUrl: '/collections/special/celulares_samsung',
    backgroundImage: phones_bg,
    title: 'Celulares',
    description: 'Explora la mejor tecnología móvil: smartphones, accesorios y lo último en innovación para mantenerte siempre conectado.',
    replace: /\b(de\s+)?(celulares|celular|celular[-\s]?y[-\s]?accesorios)\b/gi
  },
  [SpecialCollectionHandle.EXCLUSIVE]: {
    redirectUrl: '/collections/special/exclusivo_beats',
    backgroundImage: exclusive_bg,
    title: 'Exclusivo',
    description: 'Colecciones únicas y productos de edición limitada seleccionados para quienes buscan lo extraordinario y exclusivo.',
    replace: /\b(de\s+)?[Ee]xclusivo\b/
  },
  [SpecialCollectionHandle.PERFUMES]: {
    redirectUrl: '/collections/special/perfumes_arabes',
    backgroundImage: perfumes_bg,
    title: 'Perfumes',
    description: 'Fragancias originales y sofisticadas para cada ocasión. Descubre perfumes de las mejores marcas y encuentra tu aroma ideal.',
    replace: /\b(de\s+)?[Pp]erfumes\b/
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
