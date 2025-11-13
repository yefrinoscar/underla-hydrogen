import { PromotionCard } from './PromotionCard';
import type { Promotion } from '~/types/promotion';

interface PromotionsProps {
  promotions: Promotion[] | [];
}

export function Promotions({ promotions }: PromotionsProps) {
  return (
    <div className="container-app py-16 md:py-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className='text-3xl md:text-4xl font-bold text-neutral-800 motion-preset-blur-down'>
          Promociones Especiales
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {promotions.slice(0, 3).map((promotion, index) => (
          <div
            key={promotion.id}
            className={`motion-preset-fade motion-delay-${index * 150}`}
          >
            <PromotionCard promotion={promotion} />
          </div>
        ))}
      </div>
    </div>
  );
}
