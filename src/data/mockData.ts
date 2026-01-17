import { Transaction, MonthlyData, Category } from '@/types/finance';

export const categories: Category[] = [
  // Ingresos
  { id: '1', name: 'Sueldo', icon: 'Wallet', type: 'income' },
  { id: '2', name: 'Bonificación', icon: 'Gift', type: 'income' },
  { id: '3', name: 'Primas', icon: 'Award', type: 'income' },
  { id: '4', name: 'Trabajo', icon: 'Briefcase', type: 'income' },
  { id: '5', name: 'Otro', icon: 'Plus', type: 'income' },
  // Gastos
  { id: '6', name: 'Casa', icon: 'Home', type: 'expense' },
  { id: '7', name: 'Colegio', icon: 'GraduationCap', type: 'expense' },
  { id: '8', name: 'Servicios', icon: 'Receipt', type: 'expense' },
  { id: '9', name: 'Celular', icon: 'Smartphone', type: 'expense' },
  { id: '10', name: 'Créditos', icon: 'CreditCard', type: 'expense' },
  { id: '11', name: 'Otros', icon: 'MoreHorizontal', type: 'expense' },
  { id: '12', name: 'Finca', icon: 'Trees', type: 'expense' },
  { id: '13', name: 'Transporte', icon: 'Car', type: 'expense' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 5000000, description: 'Salario Mensual', category: 'Sueldo', date: '2025-01-15', isPending: false },
  { id: '2', type: 'income', amount: 1200000, description: 'Bonificación Trimestral', category: 'Bonificación', date: '2025-01-10', isPending: false },
  { id: '3', type: 'expense', amount: 450000, description: 'Mercado del Mes', category: 'Casa', date: '2025-01-14', isPending: false, linkedIncomeIds: ['1'] },
  { id: '4', type: 'expense', amount: 150000, description: 'Recarga Celular', category: 'Celular', date: '2025-01-12', isPending: true },
  { id: '5', type: 'expense', amount: 800000, description: 'Arriendo', category: 'Casa', date: '2025-01-01', isPending: true, linkedIncomeIds: ['1'] },
  { id: '6', type: 'expense', amount: 200000, description: 'Gasolina', category: 'Transporte', date: '2025-01-08', isPending: false },
  { id: '7', type: 'income', amount: 300000, description: 'Trabajo Extra', category: 'Trabajo', date: '2025-01-05', isPending: false },
  { id: '8', type: 'expense', amount: 350000, description: 'Cuota Colegio', category: 'Colegio', date: '2025-01-03', isPending: false, linkedIncomeIds: ['2'] },
  { id: '9', type: 'expense', amount: 280000, description: 'Servicios Públicos', category: 'Servicios', date: '2025-01-02', isPending: false },
  { id: '10', type: 'expense', amount: 500000, description: 'Cuota Crédito', category: 'Créditos', date: '2025-01-20', isPending: true },
];

export const monthlyData: MonthlyData[] = [
  { month: 'Ene', income: 6500000, expenses: 4200000, balance: 2300000 },
  { month: 'Feb', income: 5800000, expenses: 3900000, balance: 1900000 },
  { month: 'Mar', income: 7200000, expenses: 4500000, balance: 2700000 },
  { month: 'Abr', income: 6100000, expenses: 4100000, balance: 2000000 },
  { month: 'May', income: 6800000, expenses: 4800000, balance: 2000000 },
  { month: 'Jun', income: 7500000, expenses: 5200000, balance: 2300000 },
  { month: 'Jul', income: 6900000, expenses: 4600000, balance: 2300000 },
  { month: 'Ago', income: 7100000, expenses: 4900000, balance: 2200000 },
  { month: 'Sep', income: 6600000, expenses: 4300000, balance: 2300000 },
  { month: 'Oct', income: 7800000, expenses: 5100000, balance: 2700000 },
  { month: 'Nov', income: 7200000, expenses: 4700000, balance: 2500000 },
  { month: 'Dic', income: 8500000, expenses: 6200000, balance: 2300000 },
];

export const categoryExpenseData = [
  { name: 'Casa', value: 1250000, color: 'hsl(0, 72%, 51%)' },
  { name: 'Transporte', value: 800000, color: 'hsl(25, 95%, 53%)' },
  { name: 'Colegio', value: 350000, color: 'hsl(263, 70%, 50%)' },
  { name: 'Servicios', value: 280000, color: 'hsl(217, 91%, 60%)' },
  { name: 'Créditos', value: 500000, color: 'hsl(142, 76%, 36%)' },
  { name: 'Celular', value: 150000, color: 'hsl(340, 82%, 52%)' },
];
