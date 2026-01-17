import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { PendingCard } from '@/components/dashboard/PendingCard';
import { MonthYearSelector } from '@/components/shared/MonthYearSelector';
import { useFinance } from '@/contexts/FinanceContext';

const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default function DashboardPage() {
  const { 
    selectedMonth, 
    selectedYear, 
    setSelectedMonth, 
    setSelectedYear,
    getMonthSummary,
    getYearSummary,
    getFilteredTransactions 
  } = useFinance();
  
  const [showAllMonths, setShowAllMonths] = useState(false);
  
  const summary = showAllMonths 
    ? getYearSummary(selectedYear) 
    : getMonthSummary(selectedMonth, selectedYear);

  // Generate monthly data for the chart based on selected year
  const monthlyChartData = MONTHS.map((month, index) => {
    const monthSummary = getMonthSummary(index, selectedYear);
    return {
      month,
      income: monthSummary.totalIncome,
      expenses: monthSummary.totalExpenses,
      balance: monthSummary.netBalance,
    };
  });

  // Get pending transactions for current filter
  const pendingTransactions = showAllMonths
    ? getFilteredTransactions(undefined, selectedYear).filter(t => t.isPending)
    : getFilteredTransactions(selectedMonth, selectedYear).filter(t => t.isPending);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header with Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {showAllMonths 
                ? `Resumen anual ${selectedYear}` 
                : `Vista de ${MONTHS[selectedMonth]} ${selectedYear}`}
            </p>
          </div>
          <MonthYearSelector
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            showAllOption
            isAllMonths={showAllMonths}
            onToggleAllMonths={setShowAllMonths}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <KPICard
            title="Ingresos Totales"
            value={summary.totalIncome}
            icon={TrendingUp}
            variant="income"
            delay={0}
          />
          <KPICard
            title="Gastos Totales"
            value={summary.totalExpenses}
            icon={TrendingDown}
            variant="expense"
            delay={0.1}
          />
          <KPICard
            title="Balance Neto"
            value={summary.netBalance}
            icon={Wallet}
            variant="balance"
            delay={0.2}
          />
          <KPICard
            title="Pendiente por Pagar"
            value={summary.pendingTotal}
            icon={Clock}
            variant="pending"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashFlowChart data={monthlyChartData} selectedMonth={showAllMonths ? undefined : selectedMonth} />
          </div>
          <PendingCard transactions={pendingTransactions} />
        </div>
      </div>
    </AppLayout>
  );
}
