import { useState } from 'react';
import { Link2, TrendingUp, Check } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/finance';

interface LinkExpenseModalProps {
  expense: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkExpenseModal({ expense, open, onOpenChange }: LinkExpenseModalProps) {
  const { transactions, linkExpenseToIncome } = useFinance();
  const [selectedIncomes, setSelectedIncomes] = useState<string[]>(
    expense?.linkedIncomeIds || []
  );

  const incomes = transactions.filter(t => t.type === 'income');

  const toggleIncome = (incomeId: string) => {
    setSelectedIncomes(prev =>
      prev.includes(incomeId)
        ? prev.filter(id => id !== incomeId)
        : [...prev, incomeId]
    );
  };

  const handleSave = () => {
    if (expense) {
      linkExpenseToIncome(expense.id, selectedIncomes);
      onOpenChange(false);
    }
  };

  const totalLinked = incomes
    .filter(i => selectedIncomes.includes(i.id))
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Vincular Gasto a Ingresos
          </DialogTitle>
        </DialogHeader>

        {expense && (
          <div className="space-y-4">
            {/* Expense info */}
            <div className="p-4 rounded-lg bg-expense/10 border border-expense/20">
              <p className="text-sm text-muted-foreground">Gasto a vincular:</p>
              <p className="font-semibold text-foreground">{expense.description}</p>
              <p className="text-expense font-bold text-lg">-${expense.amount.toLocaleString()}</p>
            </div>

            {/* Income selector */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Selecciona los ingresos que cubren este gasto:
              </p>
              <ScrollArea className="h-[240px] pr-4">
                <div className="space-y-2">
                  {incomes.map(income => {
                    const isSelected = selectedIncomes.includes(income.id);
                    return (
                      <button
                        key={income.id}
                        onClick={() => toggleIncome(income.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3",
                          isSelected
                            ? "border-income bg-income/10"
                            : "border-border hover:border-income/50 hover:bg-accent/30"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          isSelected ? "bg-income border-income" : "border-muted-foreground"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-income/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-income" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{income.description}</p>
                          <p className="text-sm text-muted-foreground">{income.category}</p>
                        </div>
                        <span className="text-income font-bold">
                          +${income.amount.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-accent/30 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total vinculado:</span>
                <span className="text-income font-bold text-lg">
                  ${totalLinked.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Cobertura:</span>
                <span className={cn(
                  "font-semibold",
                  totalLinked >= expense.amount ? "text-income" : "text-pending"
                )}>
                  {totalLinked >= expense.amount ? '100% cubierto' : `${Math.round((totalLinked / expense.amount) * 100)}%`}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Guardar Vinculación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
