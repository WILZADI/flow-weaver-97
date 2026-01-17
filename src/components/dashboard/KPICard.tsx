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
      className={cn(variantStyles[variant], "p-4 lg:p-5")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs lg:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <h3 className={cn("text-lg lg:text-2xl font-bold mt-1", valueColorStyles[variant])}>
            {formatCurrency(value)}
          </h3>
          {trend && (
            <p className={cn(
              "text-xs mt-1.5 font-medium",
              trend.isPositive ? "text-income" : "text-expense"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mes anterior
            </p>
          )}
        </div>
        <div className={cn("p-2 lg:p-2.5 rounded-lg shrink-0", iconBgStyles[variant])}>
          <Icon className={cn("w-4 h-4 lg:w-5 lg:h-5", iconColorStyles[variant])} />
        </div>
      </div>
    </motion.div>
  );
}
