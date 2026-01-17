import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'balance' | 'pending';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const variantStyles = {
  income: 'kpi-card-income',
  expense: 'kpi-card-expense',
  balance: 'kpi-card-balance',
  pending: 'kpi-card-pending',
};

const iconBgStyles = {
  income: 'bg-income/10',
  expense: 'bg-expense/10',
  balance: 'bg-balance/10',
  pending: 'bg-pending/10',
};

const iconColorStyles = {
  income: 'text-income',
  expense: 'text-expense',
  balance: 'text-balance',
  pending: 'text-pending',
};

const valueColorStyles = {
  income: 'text-income',
  expense: 'text-expense',
  balance: 'text-balance',
  pending: 'text-pending',
};

export function KPICard({ title, value, icon: Icon, variant, trend, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={variantStyles[variant]}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className={cn("text-2xl lg:text-3xl font-bold mt-2", valueColorStyles[variant])}>
            {formatCurrency(value)}
          </h3>
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              trend.isPositive ? "text-income" : "text-expense"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mes anterior
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgStyles[variant])}>
          <Icon className={cn("w-6 h-6", iconColorStyles[variant])} />
        </div>
      </div>
    </motion.div>
  );
}
