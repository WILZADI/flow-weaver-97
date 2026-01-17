import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, Link2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { PendingCard } from '@/components/dashboard/PendingCard';
import { MonthYearSelector } from '@/components/shared/MonthYearSelector';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default function DashboardPage() {
  const { 
    transactions,
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
  const monthlyChartData = MONTHS_SHORT.map((month, index) => {
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

  // Get linked incomes information
  const linkedIncomesInfo = useMemo(() => {
    const filteredTransactions = showAllMonths
      ? getFilteredTransactions(undefined, selectedYear)
      : getFilteredTransactions(selectedMonth, selectedYear);
    
    // Get all income IDs that are linked to expenses
    const linkedIncomeIds = new Set<string>();
    filteredTransactions.forEach(t => {
      if (t.type === 'expense' && t.linkedIncomeIds) {
        t.linkedIncomeIds.forEach(id => linkedIncomeIds.add(id));
      }
    });

    // Get the actual linked income transactions
    const linkedIncomes = transactions.filter(t => linkedIncomeIds.has(t.id));
    const totalLinkedAmount = linkedIncomes.reduce((sum, t) => sum + t.amount, 0);

    return {
      incomes: linkedIncomes,
      totalLinkedAmount,
      count: linkedIncomes.length,
    };
  }, [transactions, showAllMonths, selectedMonth, selectedYear, getFilteredTransactions]);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header with Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Dashboard - {showAllMonths ? `Año ${selectedYear}` : MONTHS[selectedMonth]}
            </h1>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {/* Income Card with Linked Incomes Sub-card */}
          <div className="space-y-2">
            <KPICard
              title="Ingresos Totales"
              value={summary.totalIncome}
              icon={TrendingUp}
              variant="income"
              delay={0}
            />
            {linkedIncomesInfo.count > 0 && (
              <div className="bg-card border border-income/20 rounded-lg p-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Link2 className="w-3 h-3 text-income" />
                  <span className="text-[10px] font-medium text-foreground">Ingresos Afectados</span>
                </div>
                <div className="space-y-1">
                  {linkedIncomesInfo.incomes.slice(0, 2).map(income => (
                    <div key={income.id} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground truncate max-w-[80px]">{income.description}</span>
                      <span className="text-income font-medium">{formatCurrency(income.amount)}</span>
                    </div>
                  ))}
                  {linkedIncomesInfo.count > 2 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{linkedIncomesInfo.count - 2} más
                    </p>
                  )}
                  <div className="pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-income font-bold">{formatCurrency(linkedIncomesInfo.totalLinkedAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
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
