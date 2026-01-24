import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Bar,
  Line,
  Legend,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthYearSelector } from '@/components/shared/MonthYearSelector';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '@/lib/currency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_ABBREVIATIONS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const CATEGORY_COLORS: Record<string, string> = {
  'Casa': 'hsl(0, 72%, 51%)',
  'Colegio': 'hsl(263, 70%, 50%)',
  'Servicios': 'hsl(217, 91%, 60%)',
  'Celular': 'hsl(340, 82%, 52%)',
  'Créditos': 'hsl(142, 76%, 36%)',
  'Otros': 'hsl(25, 95%, 53%)',
  'Finca': 'hsl(45, 93%, 47%)',
  'Transporte': 'hsl(180, 70%, 45%)',
};

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

export default function ReportsPage() {
  const { getFilteredTransactions, getMonthSummary, getYearSummary } = useFinance();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth());
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const [annualReportYear, setAnnualReportYear] = useState<number>(new Date().getFullYear());

  // Monthly category data
  const monthlyCategoryData = useMemo(() => {
    const transactions = getFilteredTransactions(reportMonth, reportYear);
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || 'hsl(200, 70%, 50%)',
    }));
  }, [getFilteredTransactions, reportMonth, reportYear]);

  const totalExpenses = monthlyCategoryData.reduce((sum, cat) => sum + cat.value, 0);
  const monthSummary = getMonthSummary(reportMonth, reportYear);

  // Annual data
  const annualSavingsData = useMemo(() => {
    let cumulative = 0;
    return MONTH_ABBREVIATIONS.map((month, index) => {
      const summary = getMonthSummary(index, annualReportYear);
      cumulative += summary.netBalance;
      return {
        month,
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        balance: summary.netBalance,
        savingsRate: summary.totalIncome > 0 ? Math.round((summary.netBalance / summary.totalIncome) * 100) : 0,
        cumulativeSavings: cumulative,
      };
    });
  }, [getMonthSummary, annualReportYear]);

  const yearSummary = getYearSummary(annualReportYear);
  const annualSavingsRate = yearSummary.totalIncome > 0 
    ? Math.round((yearSummary.netBalance / yearSummary.totalIncome) * 100) 
    : 0;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-1">Análisis detallado de tus finanzas</p>
        </div>

        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
            <TabsTrigger value="annual">Anual</TabsTrigger>
          </TabsList>

          {/* Monthly Report */}
          <TabsContent value="monthly" className="space-y-6">
            {/* Month Selector */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Reporte de:</span>
              <MonthYearSelector
                month={reportMonth}
                year={reportYear}
                onMonthChange={setReportMonth}
                onYearChange={setReportYear}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="kpi-card"
              >
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Gastos por Categoría - {MONTHS[reportMonth]} {reportYear}
                </h3>
                {monthlyCategoryData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="h-[280px] w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthlyCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            onMouseEnter={(_, index) => setSelectedCategory(monthlyCategoryData[index].name)}
                            onMouseLeave={() => setSelectedCategory(null)}
                          >
                            {monthlyCategoryData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                opacity={selectedCategory === null || selectedCategory === entry.name ? 1 : 0.3}
                                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                              />
                            ))}
                          </Pie>
                          
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {monthlyCategoryData.map((category) => (
                        <div 
                          key={category.name}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
                          onMouseEnter={() => setSelectedCategory(category.name)}
                          onMouseLeave={() => setSelectedCategory(null)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm text-foreground">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-foreground">
                              {formatCurrency(category.value)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({totalExpenses > 0 ? Math.round((category.value / totalExpenses) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                    No hay gastos registrados para este mes
                  </div>
                )}
              </motion.div>

              {/* Monthly Summary Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="kpi-card-income">
                  <p className="text-sm text-muted-foreground">Ingresos de {MONTHS[reportMonth]}</p>
                  <h3 className="text-3xl font-bold text-income mt-2">{formatCurrency(monthSummary.totalIncome)}</h3>
                </div>
                <div className="kpi-card-expense">
                  <p className="text-sm text-muted-foreground">Gastos de {MONTHS[reportMonth]}</p>
                  <h3 className="text-3xl font-bold text-expense mt-2">{formatCurrency(monthSummary.totalExpenses)}</h3>
                </div>
                <div className="kpi-card-balance">
                  <p className="text-sm text-muted-foreground">Ahorro de {MONTHS[reportMonth]}</p>
                  <h3 className="text-3xl font-bold text-balance mt-2">{formatCurrency(monthSummary.netBalance)}</h3>
                  <p className="text-sm text-balance/70 mt-1">
                    {monthSummary.totalIncome > 0 
                      ? `${Math.round((monthSummary.netBalance / monthSummary.totalIncome) * 100)}% de tasa de ahorro`
                      : 'Sin ingresos registrados'}
                  </p>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Annual Report */}
          <TabsContent value="annual" className="space-y-6">
            {/* Year Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Reporte del año:</span>
              <Select value={annualReportYear.toString()} onValueChange={(v) => setAnnualReportYear(parseInt(v))}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="kpi-card"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Resumen Financiero Anual - {annualReportYear}
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={annualSavingsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => formatCompactCurrency(value)}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => {
                        const colorMap: Record<string, string> = {
                          'Ingresos': 'hsl(142, 76%, 36%)',
                          'Gastos': 'hsl(0, 72%, 51%)',
                          'Ahorro': 'hsl(217, 91%, 60%)',
                          'Tasa de Ahorro': 'hsl(263, 70%, 50%)',
                        };
                        return <span style={{ color: colorMap[value] || 'hsl(215, 20%, 55%)' }}>{value}</span>;
                      }}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="income" 
                      name="Ingresos" 
                      fill="hsl(142, 76%, 36%)" 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="expenses" 
                      name="Gastos" 
                      fill="hsl(0, 72%, 51%)" 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="balance" 
                      name="Ahorro" 
                      fill="hsl(217, 91%, 60%)" 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="savingsRate" 
                      name="Tasa de Ahorro"
                      stroke="hsl(263, 70%, 50%)" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(263, 70%, 50%)', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(263, 70%, 50%)' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Annual Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: `Ingresos ${annualReportYear}`, value: formatCurrency(yearSummary.totalIncome), color: 'text-income' },
                { label: `Gastos ${annualReportYear}`, value: formatCurrency(yearSummary.totalExpenses), color: 'text-expense' },
                { label: 'Ahorro Total', value: formatCurrency(yearSummary.netBalance), color: 'text-balance' },
                { label: 'Tasa de Ahorro', value: `${annualSavingsRate}%`, color: 'text-primary' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="kpi-card text-center"
                >
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
