import { Money as ShopifyMoney } from '@shopify/hydrogen';
import type { MoneyV2, CurrencyCode } from '@shopify/hydrogen/storefront-api-types';

type MoneyProps = {
  data: MoneyV2;
  className?: string;
};

/**
 * Custom Money component that formats currency as PEN (S/)
 */
export function Money({ data, className }: MoneyProps) {
  // Instead of modifying the data, we'll just render the S/ prefix
  return (
    <span className={`${className} flex gap-1`}>
      S/ <ShopifyMoney data={data}  withoutCurrency={true} />
    </span>
  );
}
