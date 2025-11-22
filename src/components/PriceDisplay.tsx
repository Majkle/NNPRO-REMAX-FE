import React from 'react';
import { TransactionType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  previousPrice?: number;
  transactionType: TransactionType;
  className?: string;
  showBadge?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  previousPrice,
  transactionType,
  className = '',
  showBadge = true,
}) => {
  const formatPrice = (amount: number) => {
    const formatted = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(amount);
    return transactionType === TransactionType.RENTAL ? `${formatted}/měsíc` : formatted;
  };

  const hasPriceChange = previousPrice && previousPrice !== price;
  const priceDecreased = hasPriceChange && price < previousPrice;
  const priceIncreased = hasPriceChange && price > previousPrice;

  const percentageChange = hasPriceChange
    ? Math.abs(((price - previousPrice) / previousPrice) * 100).toFixed(1)
    : null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-baseline gap-2 flex-wrap">
        {/* Current Price */}
        <span className="text-2xl font-bold text-primary">
          {formatPrice(price)}
        </span>

        {/* Previous Price (crossed out) */}
        {hasPriceChange && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(previousPrice)}
          </span>
        )}

        {/* Price Change Badge */}
        {showBadge && hasPriceChange && (
          <Badge
            variant={priceDecreased ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {priceDecreased ? (
              <>
                <TrendingDown className="h-3 w-3" />
                -{percentageChange}%
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3" />
                +{percentageChange}%
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Price Change Text */}
      {hasPriceChange && (
        <span className={`text-sm ${priceDecreased ? 'text-green-600' : 'text-orange-600'}`}>
          {priceDecreased ? 'Cena snížena' : 'Cena zvýšena'}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
