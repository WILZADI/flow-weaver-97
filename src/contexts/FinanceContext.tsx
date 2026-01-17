import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
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
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  getFilteredTransactions: (month?: number, year?: number) => Transaction[];
  getMonthSummary: (month: number, year: number) => FinanceSummary;
  getYearSummary: (year: number) => FinanceSummary;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const getFilteredTransactions = useCallback((month?: number, year?: number) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const matchesYear = year !== undefined ? date.getFullYear() === year : true;
      const matchesMonth = month !== undefined ? date.getMonth() === month : true;
      return matchesYear && matchesMonth;
    });
  }, [transactions]);

  const getMonthSummary = useCallback((month: number, year: number): FinanceSummary => {
    const filtered = getFilteredTransactions(month, year);
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const pendingTotal = filtered.filter(t => t.isPending).reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, pendingTotal };
  }, [getFilteredTransactions]);

  const getYearSummary = useCallback((year: number): FinanceSummary => {
    const filtered = getFilteredTransactions(undefined, year);
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const pendingTotal = filtered.filter(t => t.isPending).reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, pendingTotal };
  }, [getFilteredTransactions]);

  const summary = useMemo<FinanceSummary>(() => {
    return getMonthSummary(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, getMonthSummary]);

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
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        getFilteredTransactions,
        getMonthSummary,
        getYearSummary,
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
