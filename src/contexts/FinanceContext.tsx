// Finance Context - Manages all financial data and transactions using Supabase
import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Transaction, FinanceSummary } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Database transaction type
interface DbTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  is_pending: boolean;
  linked_income_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

// Convert database record to app Transaction type
const dbToTransaction = (db: DbTransaction): Transaction => ({
  id: db.id,
  type: db.type as 'income' | 'expense',
  amount: Number(db.amount),
  description: db.description,
  category: db.category,
  date: db.date,
  isPending: db.is_pending,
  linkedIncomeIds: db.linked_income_ids || undefined,
  isUserCreated: true,
});

interface FinanceContextType {
  transactions: Transaction[];
  summary: FinanceSummary;
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  togglePending: (id: string) => Promise<void>;
  linkExpenseToIncome: (expenseId: string, incomeIds: string[]) => Promise<void>;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  getFilteredTransactions: (month?: number, year?: number) => Transaction[];
  getMonthSummary: (month: number, year: number) => FinanceSummary;
  getYearSummary: (year: number) => FinanceSummary;
  refreshTransactions: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions((data || []).map(dbToTransaction));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, fetchTransactions]);

  const getFilteredTransactions = useCallback((month?: number, year?: number) => {
    return transactions.filter(t => {
      // Parse date without timezone issues - split the YYYY-MM-DD string
      const [yearStr, monthStr] = t.date.split('-').map(Number);
      const matchesYear = year !== undefined ? yearStr === year : true;
      const matchesMonth = month !== undefined ? (monthStr - 1) === month : true;
      return matchesYear && matchesMonth;
    });
  }, [transactions]);

  const getMonthSummary = useCallback((month: number, year: number): FinanceSummary => {
    const filtered = getFilteredTransactions(month, year);
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    // Solo contar gastos que NO están pendientes (ya pagados)
    const totalExpenses = filtered.filter(t => t.type === 'expense' && !t.isPending).reduce((sum, t) => sum + t.amount, 0);
    const pendingTotal = filtered.filter(t => t.isPending).reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, pendingTotal };
  }, [getFilteredTransactions]);

  const getYearSummary = useCallback((year: number): FinanceSummary => {
    const filtered = getFilteredTransactions(undefined, year);
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    // Solo contar gastos que NO están pendientes (ya pagados)
    const totalExpenses = filtered.filter(t => t.type === 'expense' && !t.isPending).reduce((sum, t) => sum + t.amount, 0);
    const pendingTotal = filtered.filter(t => t.isPending).reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, pendingTotal };
  }, [getFilteredTransactions]);

  const summary = useMemo<FinanceSummary>(() => {
    return getMonthSummary(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, getMonthSummary]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        is_pending: transaction.isPending,
        linked_income_ids: transaction.linkedIncomeIds || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    if (data) {
      setTransactions(prev => [dbToTransaction(data), ...prev]);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;

    const dbUpdates: Partial<DbTransaction> = {};
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.isPending !== undefined) dbUpdates.is_pending = updates.isPending;
    if (updates.linkedIncomeIds !== undefined) dbUpdates.linked_income_ids = updates.linkedIncomeIds;

    const { error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const togglePending = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    await updateTransaction(id, { isPending: !transaction.isPending });
  };

  const linkExpenseToIncome = async (expenseId: string, incomeIds: string[]) => {
    await updateTransaction(expenseId, { linkedIncomeIds: incomeIds });
  };

  const refreshTransactions = async () => {
    await fetchTransactions();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        summary,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        togglePending,
        linkExpenseToIncome,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        getFilteredTransactions,
        getMonthSummary,
        getYearSummary,
        refreshTransactions,
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
