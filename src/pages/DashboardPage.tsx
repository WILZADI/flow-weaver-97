import { TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { PendingCard } from '@/components/dashboard/PendingCard';
import { useFinance } from '@/contexts/FinanceContext';

export default function DashboardPage() {
  const { summary } = useFinance();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Vista general de tus finanzas</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <KPICard
            title="Ingresos Totales"
            value={summary.totalIncome}
            icon={TrendingUp}
            variant="income"
            trend={{ value: 12.5, isPositive: true }}
            delay={0}
          />
          <KPICard
            title="Gastos Totales"
            value={summary.totalExpenses}
            icon={TrendingDown}
            variant="expense"
            trend={{ value: 8.2, isPositive: false }}
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
            <CashFlowChart />
          </div>
          <PendingCard />
        </div>
      </div>
    </AppLayout>
  );
}
