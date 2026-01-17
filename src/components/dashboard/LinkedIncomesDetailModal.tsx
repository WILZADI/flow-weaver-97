import { TrendingUp, TrendingDown, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  // Calculate total income and total expenses for overall progress
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = incomes.reduce((sum, i) => sum + i.expensesLinked, 0);
  const overallProgress = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;

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
            {incomes.map((income) => {
              const usagePercent = income.amount > 0 
                ? Math.min((income.expensesLinked / income.amount) * 100, 100) 
                : 0;
              
              return (
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

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Uso del ingreso</span>
                      <span className={cn(
                        "font-medium",
                        usagePercent >= 100 ? "text-expense" : usagePercent >= 75 ? "text-pending" : "text-income"
                      )}>
                        {usagePercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={usagePercent} 
                        className="h-2 bg-muted"
                      />
                      <div 
                        className={cn(
                          "absolute inset-0 h-2 rounded-full transition-all",
                          usagePercent >= 100 ? "bg-expense" : usagePercent >= 75 ? "bg-pending" : "bg-income"
                        )}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Linked Expenses */}
                  {income.linkedExpenses && income.linkedExpenses.length > 0 ? (
                    <div className="pl-2 border-l-2 border-expense/30 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Gastos Vinculados ({income.linkedExpenses.length})
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
                  ) : (
                    <div className="pl-2 border-l-2 border-muted/30">
                      <p className="text-xs text-muted-foreground italic">
                        Sin gastos vinculados detallados
                      </p>
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
              );
            })}
          </div>
        </ScrollArea>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uso total de ingresos afectados</span>
            <span className={cn(
              "font-medium",
              overallProgress >= 100 ? "text-expense" : overallProgress >= 75 ? "text-pending" : "text-income"
            )}>
              {overallProgress.toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <Progress value={overallProgress} className="h-3 bg-muted" />
            <div 
              className={cn(
                "absolute inset-0 h-3 rounded-full transition-all",
                overallProgress >= 100 ? "bg-expense" : overallProgress >= 75 ? "bg-pending" : "bg-income"
              )}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

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
