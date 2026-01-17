import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Transaction, FinanceSummary } from '@/types/finance';
import { mockTransactions } from '@/data/mockData';

interface FinanceContextType {
  transactions: Transaction[];
  summary: FinanceSummary;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  togglePending: (id: string) => void;
  linkExpenseToIncome: (expenseId: string, incomeIds: string[]) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const summary = useMemo<FinanceSummary>(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingTotal = transactions
      .filter(t => t.isPending)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingTotal,
    };
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const togglePending = (id: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, isPending: !t.isPending } : t))
    );
  };

  const linkExpenseToIncome = (expenseId: string, incomeIds: string[]) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === expenseId ? { ...t, linkedIncomeIds: incomeIds } : t
      )
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        summary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        togglePending,
        linkExpenseToIncome,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
