import React from 'react';
import { getPaymentModeConfig } from '../utils/paymentModes';
import { PaymentMode } from '../types';

interface PaymentModeBadgeProps {
  mode?: PaymentMode | string | null;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const PaymentModeBadge: React.FC<PaymentModeBadgeProps> = ({
  mode,
  size = 'sm',
  showIcon = true,
  className = ''
}) => {
  const config = getPaymentModeConfig(mode);
  const Icon = config.icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${
        isSmall ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      } ${className}`}
      title={`Payment Mode: ${config.label}`}
    >
      {showIcon && <Icon className={isSmall ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{config.shortLabel}</span>
    </span>
  );
};
