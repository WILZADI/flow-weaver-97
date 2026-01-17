import { motion } from 'framer-motion';
import { Clock, Check } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PendingCard() {
  const { transactions, togglePending } = useFinance();
  const pendingTransactions = transactions.filter(t => t.isPending);

  const handleMarkAsPaid = (id: string, description: string) => {
    togglePending(id);
    toast.success(`"${description}" marcado como pagado`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="kpi-card-pending"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-pending/10">
          <Clock className="w-5 h-5 text-pending" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Pagos Pendientes</h3>
      </div>

      {pendingTransactions.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">
          ¡No tienes pagos pendientes! 🎉
        </p>
      ) : (
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
          {pendingTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-pending">
                  ${transaction.amount.toLocaleString()}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-income/10 hover:text-income"
                  onClick={() => handleMarkAsPaid(transaction.id, transaction.description)}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
