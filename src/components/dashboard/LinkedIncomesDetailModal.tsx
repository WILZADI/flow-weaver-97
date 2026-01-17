import { TrendingUp, TrendingDown, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/finance';

interface LinkedIncomeWithDetails {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  isPending: boolean;
  label: string;
  expensesLinked: number;
  remainingBalance: number;
  linkedExpenses: Transaction[];
}

interface LinkedIncomesDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incomes: LinkedIncomeWithDetails[];
  totalRemainingBalance: number;
}

export function LinkedIncomesDetailModal({
  open,
  onOpenChange,
  incomes,
  totalRemainingBalance,
}: LinkedIncomesDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-income" />
            Detalle de Ingresos Afectados
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="p-4 rounded-lg bg-accent/30 border border-border space-y-3"
              >
                {/* Income Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-income/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-income" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{income.label}</span>
                      <span className="text-income font-bold">
                        {formatCurrency(income.amount)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {income.description}
                    </p>
                  </div>
                </div>

                {/* Linked Expenses */}
                {income.linkedExpenses.length > 0 && (
                  <div className="pl-2 border-l-2 border-expense/30 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Gastos Vinculados
                    </p>
                    {income.linkedExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center gap-2 p-2 rounded bg-expense/5 border border-expense/10"
                      >
                        <TrendingDown className="w-4 h-4 text-expense shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {expense.description}
                          </p>
                          <p className="text-xs text-muted-foreground">{expense.category}</p>
                        </div>
                        <span className="text-expense font-semibold text-sm">
                          -{formatCurrency(expense.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Balance Summary */}
                <div className="pt-2 border-t border-border/50 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Gastos:</span>
                    <span className="text-expense font-medium">
                      -{formatCurrency(income.expensesLinked)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Saldo Restante:</span>
                    <span
                      className={cn(
                        'font-bold',
                        income.remainingBalance >= 0 ? 'text-income' : 'text-expense'
                      )}
                    >
                      {formatCurrency(income.remainingBalance)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Total Summary */}
        <div className="p-4 rounded-lg bg-income/10 border border-income/20">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Saldo Total Restante</span>
            <span
              className={cn(
                'text-lg font-bold',
                totalRemainingBalance >= 0 ? 'text-income' : 'text-expense'
              )}
            >
              {formatCurrency(totalRemainingBalance)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
