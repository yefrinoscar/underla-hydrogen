import React from 'react';
import {
  ShoppingBag, Shirt, Home, Gift, Watch, Laptop,
  Smartphone, Headphones, Book, Camera, Utensils, Baby,
  Dumbbell, Palette, Car, Briefcase, Heart, Tag,
  Gamepad2,
  Medal,
  Cpu,
  Cable,
  WatchIcon
} from 'lucide-react';

// Map of collection handles to their corresponding icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  // Default icon for "all products"
  'todos': <ShoppingBag className="h-5 w-5" />,

  // Common category handles
  'deportes': <Medal className="h-5 w-5" />,
  'laptops': <Laptop className="h-5 w-5" />,
  'accesorios': <Cable className="h-5 w-5" />,
  'tecnologia': <WatchIcon className="h-5 w-5" />,
  'celulares': <Smartphone className="h-5 w-5" />,
  'perfumes': <svg fill="#fff" height="800px" width="800px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 297 297" enableBackground="new 0 0 297 297">
    <g>
      <path d="m186.552,133.181h-76.104c-5.458,0-9.884,4.425-9.884,9.884v38.051c0,5.459 4.426,9.884 9.884,9.884h76.104c5.458,0 9.883-4.425 9.883-9.884v-38.051c0-5.46-4.425-9.884-9.883-9.884zm-9.884,38.051h-56.336v-18.285h56.336v18.285z" />
      <path d="m210.256,86.76c-0.22-2.624-0.974-5.3-1.725-7.934-1.037-3.641-2.213-7.768-2.213-11.865 0-4.098 1.176-8.225 2.213-11.865 1.625-5.705 3.305-11.604-0.589-16.762-1.629-2.158-4.776-4.73-10.519-4.73-3.202,0-8,0.982-20.015,6.95v-30.67c0-5.458-4.426-9.884-9.884-9.884h-38.051c-5.459,0-9.884,4.426-9.884,9.884v30.67c-12.015-5.968-16.813-6.95-20.015-6.95-5.742,0-8.89,2.572-10.519,4.73-3.894,5.157-2.214,11.057-0.589,16.762 1.037,3.641 2.213,7.768 2.213,11.865 0,4.098-1.176,8.225-2.213,11.865-0.751,2.634-1.505,5.309-1.725,7.934-14.99,15.482-24.23,36.563-24.23,59.764 0,15.189 3.9,37.114 10.981,76.916 3.125,17.571 7.016,39.438 11.364,65.314 0.799,4.76 4.92,8.246 9.746,8.246h107.789c4.826,0 8.947-3.486 9.746-8.246 4.349-25.876 8.239-47.743 11.364-65.314 7.082-39.802 10.981-61.727 10.981-76.916 0.004-23.202-9.236-44.282-24.226-59.764zm-69.169-19.799c0-4.088 3.325-7.412 7.413-7.412 4.088,0 7.413,3.324 7.413,7.412s-3.325,7.412-7.413,7.412c-4.088,0-7.413-3.324-7.413-7.412zm49.275,12.885c-4.551-2.076-10.56-5.183-17.008-8.731 0.226-1.353 0.349-2.738 0.349-4.153 0-1.415-0.123-2.801-0.349-4.153 6.448-3.549 12.457-6.655 17.008-8.731-0.951,3.696-1.834,8.104-1.834,12.885 0,4.779 0.883,9.186 1.834,12.883zm-32.719-60.078v21.002h-18.285v-3.36c3.222-1.629 5.436-4.962 5.436-8.817s-2.215-7.189-5.436-8.817v-0.007h18.285zm-51.005,34.307c4.551,2.076 10.56,5.183 17.008,8.731-0.226,1.353-0.349,2.738-0.349,4.153 0,1.415 0.123,2.801 0.349,4.153-6.448,3.549-12.457,6.655-17.008,8.731 0.951-3.696 1.834-8.104 1.834-12.885-1.42109e-14-4.779-0.883-9.187-1.834-12.883zm97.406,165.901c-2.797,15.717-6.202,34.864-10.004,57.257h-91.08c-3.802-22.393-7.207-41.54-10.004-57.257-6.657-37.421-10.676-60.009-10.676-73.453 0-18.009 7.232-34.35 18.938-46.293 4.328-0.457 11.8-2.956 30.488-13.247 0.298-0.164 0.591-0.327 0.887-0.491 4.341,3.543 9.879,5.672 15.906,5.672 6.026,0 11.563-2.129 15.905-5.672 0.296,0.164 0.591,0.327 0.888,0.491 18.688,10.291 26.16,12.79 30.488,13.247 11.706,11.943 18.938,28.284 18.938,46.293 0.002,13.444-4.017,36.032-10.674,73.453z" />
    </g>
  </svg>,
  'salud-y-belleza': <Heart className="h-5 w-5" />,
  'zona-gamer': <Gamepad2 className="h-5 w-5" />,
};

// Define colors for each category to create visual distinction
export const CATEGORY_COLORS: Record<string, string> = {
  'todos': 'from-blue-500 to-blue-600',
  'deportes': 'from-emerald-500 to-emerald-600',
  'laptops': 'from-cyan-500 to-cyan-600',
  'accesorios': 'from-purple-500 to-purple-600',
  'tecnologia': 'from-indigo-500 to-indigo-600',
  'celulares': 'from-sky-500 to-sky-600',
  'perfumes': 'from-pink-500 to-pink-600',
  'salud-y-belleza': 'from-rose-500 to-rose-600',
  'zona-gamer': 'from-red-500 to-red-600',
};

export function CategoryIcon({ handle, size = "normal" }: { handle: string, size?: "small" | "normal" | "large" }) {
  // Determine icon size class based on the size prop
  const sizeClass = size === "small" ? "h-4 w-4" :
    size === "large" ? "h-6 w-6" : "h-5 w-5";

  // Try to find an exact match for the handle
  if (CATEGORY_ICONS[handle]) {
    // Clone the icon element with the new size class and white color
    return React.cloneElement(CATEGORY_ICONS[handle] as React.ReactElement, {
      className: `${sizeClass} text-white`
    });
  }

  // Try to find a partial match
  const partialMatch = Object.keys(CATEGORY_ICONS).find(key =>
    handle.includes(key) || key.includes(handle)
  );

  if (partialMatch) {
    // Clone the icon element with the new size class and white color
    return React.cloneElement(CATEGORY_ICONS[partialMatch] as React.ReactElement, {
      className: `${sizeClass} text-white`
    });
  }

  // Default icon if no match is found
  return <ShoppingBag className={`${sizeClass} text-white`} />;
}

export function getCategoryColor(handle: string): string {
  // Try to find an exact match for the handle
  if (CATEGORY_COLORS[handle]) {
    return CATEGORY_COLORS[handle];
  }

  // Try to find a partial match
  const partialMatch = Object.keys(CATEGORY_COLORS).find(key =>
    handle.includes(key) || key.includes(handle)
  );

  if (partialMatch) {
    return CATEGORY_COLORS[partialMatch];
  }

  // Default color if no match is found
  return 'from-blue-500 to-blue-600';
}
