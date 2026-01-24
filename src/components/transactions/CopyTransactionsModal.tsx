import { useState } from 'react';
import { Copy, Loader2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from 'sonner';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2025 + i);

interface CopyTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CopyTransactionsModal({ open, onOpenChange }: CopyTransactionsModalProps) {
  const { getFilteredTransactions, addTransaction, selectedMonth, selectedYear } = useFinance();
  
  const [sourceMonth, setSourceMonth] = useState<number>(selectedMonth);
  const [sourceYear, setSourceYear] = useState<number>(selectedYear);
  const [targetMonth, setTargetMonth] = useState<number>((selectedMonth + 1) % 12);
  const [targetYear, setTargetYear] = useState<number>(
    selectedMonth === 11 ? selectedYear + 1 : selectedYear
  );
  const [copyOnlyExpenses, setCopyOnlyExpenses] = useState(false);
  const [copyOnlyIncomes, setCopyOnlyIncomes] = useState(false);
  const [copyOnlyPending, setCopyOnlyPending] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    // Get source transactions
    let sourceTransactions = getFilteredTransactions(sourceMonth, sourceYear);
    
    // Apply filters
    if (copyOnlyExpenses) {
      sourceTransactions = sourceTransactions.filter(t => t.type === 'expense');
    }
    if (copyOnlyIncomes) {
      sourceTransactions = sourceTransactions.filter(t => t.type === 'income');
    }
    if (copyOnlyPending) {
      sourceTransactions = sourceTransactions.filter(t => t.isPending);
    }

    if (sourceTransactions.length === 0) {
      toast.error('No hay transacciones para copiar con los filtros seleccionados');
      return;
    }

    setIsCopying(true);
    
    try {
      let copiedCount = 0;
      
      for (const transaction of sourceTransactions) {
        // Parse the original date and update to target month/year
        const [, , day] = transaction.date.split('-').map(Number);
        
        // Handle edge case for days that don't exist in target month
        const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const adjustedDay = Math.min(day, lastDayOfTargetMonth);
        
        const newDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(adjustedDay).padStart(2, '0')}`;
        
        await addTransaction({
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: newDate,
          isPending: transaction.isPending,
          linkedIncomeIds: undefined, // Don't copy links
        });
        
        copiedCount++;
      }
      
      toast.success(`${copiedCount} transacción${copiedCount > 1 ? 'es' : ''} copiada${copiedCount > 1 ? 's' : ''} correctamente`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error copying transactions:', error);
      toast.error('Error al copiar las transacciones');
    } finally {
      setIsCopying(false);
    }
  };

  const sourceTransactionsCount = (() => {
    let transactions = getFilteredTransactions(sourceMonth, sourceYear);
    if (copyOnlyExpenses) transactions = transactions.filter(t => t.type === 'expense');
    if (copyOnlyIncomes) transactions = transactions.filter(t => t.type === 'income');
    if (copyOnlyPending) transactions = transactions.filter(t => t.isPending);
    return transactions.length;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Copiar Movimientos
          </DialogTitle>
          <DialogDescription>
            Copia las transacciones de un mes a otro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mes origen</Label>
            <div className="flex gap-2">
              <Select value={sourceMonth.toString()} onValueChange={(v) => setSourceMonth(parseInt(v))}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sourceYear.toString()} onValueChange={(v) => setSourceYear(parseInt(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>

          {/* Target Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mes destino</Label>
            <div className="flex gap-2">
              <Select value={targetMonth.toString()} onValueChange={(v) => setTargetMonth(parseInt(v))}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={targetYear.toString()} onValueChange={(v) => setTargetYear(parseInt(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Options */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium text-muted-foreground">Filtros opcionales</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="onlyExpenses" 
                  checked={copyOnlyExpenses}
                  onCheckedChange={(checked) => {
                    setCopyOnlyExpenses(!!checked);
                    if (checked) setCopyOnlyIncomes(false);
                  }}
                />
                <Label htmlFor="onlyExpenses" className="text-sm cursor-pointer">
                  Solo gastos
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="onlyIncomes" 
                  checked={copyOnlyIncomes}
                  onCheckedChange={(checked) => {
                    setCopyOnlyIncomes(!!checked);
                    if (checked) setCopyOnlyExpenses(false);
                  }}
                />
                <Label htmlFor="onlyIncomes" className="text-sm cursor-pointer">
                  Solo ingresos
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="onlyPending" 
                  checked={copyOnlyPending}
                  onCheckedChange={(checked) => setCopyOnlyPending(!!checked)}
                />
                <Label htmlFor="onlyPending" className="text-sm cursor-pointer">
                  Solo pendientes
                </Label>
              </div>
            </div>
          </div>

          {/* Preview count */}
          <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            {sourceTransactionsCount > 0 ? (
              <span>
                Se copiarán <span className="font-semibold text-foreground">{sourceTransactionsCount}</span> transacción{sourceTransactionsCount > 1 ? 'es' : ''}
              </span>
            ) : (
              <span>No hay transacciones para copiar</span>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCopying}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCopy} 
            disabled={isCopying || sourceTransactionsCount === 0}
            className="gap-2"
          >
            {isCopying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Copiando...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
