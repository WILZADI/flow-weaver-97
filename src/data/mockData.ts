import { Transaction, MonthlyData, Category } from '@/types/finance';

export const categories: Category[] = [
  { id: '1', name: 'Salary', icon: 'Wallet', type: 'income' },
  { id: '2', name: 'Freelance', icon: 'Laptop', type: 'income' },
  { id: '3', name: 'Investments', icon: 'TrendingUp', type: 'income' },
  { id: '4', name: 'Food & Dining', icon: 'Utensils', type: 'expense' },
  { id: '5', name: 'Transportation', icon: 'Car', type: 'expense' },
  { id: '6', name: 'Entertainment', icon: 'Film', type: 'expense' },
  { id: '7', name: 'Shopping', icon: 'ShoppingBag', type: 'expense' },
  { id: '8', name: 'Bills & Utilities', icon: 'Receipt', type: 'expense' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 5000, description: 'Monthly Salary', category: 'Salary', date: '2026-01-15', isPending: false },
  { id: '2', type: 'income', amount: 1200, description: 'Freelance Project', category: 'Freelance', date: '2026-01-10', isPending: false },
  { id: '3', type: 'expense', amount: 450, description: 'Grocery Shopping', category: 'Food & Dining', date: '2026-01-14', isPending: false, linkedIncomeIds: ['1'] },
  { id: '4', type: 'expense', amount: 150, description: 'Netflix & Spotify', category: 'Entertainment', date: '2026-01-12', isPending: true },
  { id: '5', type: 'expense', amount: 800, description: 'Rent Payment', category: 'Bills & Utilities', date: '2026-01-01', isPending: true, linkedIncomeIds: ['1'] },
  { id: '6', type: 'expense', amount: 200, description: 'Gas Station', category: 'Transportation', date: '2026-01-08', isPending: false },
  { id: '7', type: 'income', amount: 300, description: 'Stock Dividends', category: 'Investments', date: '2026-01-05', isPending: false },
  { id: '8', type: 'expense', amount: 350, description: 'New Headphones', category: 'Shopping', date: '2026-01-03', isPending: false, linkedIncomeIds: ['2'] },
];

export const monthlyData: MonthlyData[] = [
  { month: 'Jan', income: 6500, expenses: 4200, balance: 2300 },
  { month: 'Feb', income: 5800, expenses: 3900, balance: 1900 },
  { month: 'Mar', income: 7200, expenses: 4500, balance: 2700 },
  { month: 'Apr', income: 6100, expenses: 4100, balance: 2000 },
  { month: 'May', income: 6800, expenses: 4800, balance: 2000 },
  { month: 'Jun', income: 7500, expenses: 5200, balance: 2300 },
  { month: 'Jul', income: 6900, expenses: 4600, balance: 2300 },
  { month: 'Aug', income: 7100, expenses: 4900, balance: 2200 },
  { month: 'Sep', income: 6600, expenses: 4300, balance: 2300 },
  { month: 'Oct', income: 7800, expenses: 5100, balance: 2700 },
  { month: 'Nov', income: 7200, expenses: 4700, balance: 2500 },
  { month: 'Dec', income: 8500, expenses: 6200, balance: 2300 },
];

export const categoryExpenseData = [
  { name: 'Food & Dining', value: 1200, color: 'hsl(0, 72%, 51%)' },
  { name: 'Transportation', value: 800, color: 'hsl(25, 95%, 53%)' },
  { name: 'Entertainment', value: 450, color: 'hsl(263, 70%, 50%)' },
  { name: 'Shopping', value: 650, color: 'hsl(217, 91%, 60%)' },
  { name: 'Bills & Utilities', value: 1100, color: 'hsl(142, 76%, 36%)' },
];
