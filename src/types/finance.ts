export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  isPending: boolean;
  linkedIncomeIds?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingTotal: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}
