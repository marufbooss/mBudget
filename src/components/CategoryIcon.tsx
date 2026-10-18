import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  color,
}) => {
  // @ts-expect-error dynamic lucide component access
  const IconComponent = Icons[name] || Icons.CircleDollarSign;

  return <IconComponent className={className} size={size} style={{ color }} />;
};

export const AVAILABLE_ICONS = [
  'Utensils',
  'Home',
  'Zap',
  'Car',
  'ShoppingBag',
  'Tv',
  'HeartPulse',
  'Briefcase',
  'Laptop',
  'TrendingUp',
  'ArrowRightLeft',
  'Landmark',
  'CreditCard',
  'Banknote',
  'HandCoins',
  'Coins',
  'Coffee',
  'Plane',
  'Wifi',
  'Fuel',
  'GraduationCap',
  'Gift',
  'Film',
  'Smartphone',
  'Dumbbell',
  'ShieldCheck',
  'PiggyBank',
  'Wallet',
];
