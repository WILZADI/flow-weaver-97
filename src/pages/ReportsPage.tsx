import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { monthlyData, categoryExpenseData } from '@/data/mockData';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-border shadow-xl">
        <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const annualSavingsData = monthlyData.map((item, index) => ({
  ...item,
  savingsRate: Math.round((item.balance / item.income) * 100),
  cumulativeSavings: monthlyData.slice(0, index + 1).reduce((acc, curr) => acc + curr.balance, 0),
}));

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalExpenses = categoryExpenseData.reduce((sum, cat) => sum + cat.value, 0);

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="kpi-card"
              >
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Gastos por Categoría
                </h3>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="h-[280px] w-full lg:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryExpenseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          onMouseEnter={(_, index) => setSelectedCategory(categoryExpenseData[index].name)}
                          onMouseLeave={() => setSelectedCategory(null)}
                        >
                          {categoryExpenseData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              opacity={selectedCategory === null || selectedCategory === entry.name ? 1 : 0.3}
                              style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {categoryExpenseData.map((category) => (
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
                            ${category.value.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({Math.round((category.value / totalExpenses) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Monthly Summary Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="kpi-card-income">
                  <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
                  <h3 className="text-3xl font-bold text-income mt-2">$6,500</h3>
                  <p className="text-sm text-income/70 mt-1">+12.5% vs mes anterior</p>
                </div>
                <div className="kpi-card-expense">
                  <p className="text-sm text-muted-foreground">Gastos del Mes</p>
                  <h3 className="text-3xl font-bold text-expense mt-2">$4,200</h3>
                  <p className="text-sm text-expense/70 mt-1">-5.2% vs mes anterior</p>
                </div>
                <div className="kpi-card-balance">
                  <p className="text-sm text-muted-foreground">Ahorro del Mes</p>
                  <h3 className="text-3xl font-bold text-balance mt-2">$2,300</h3>
                  <p className="text-sm text-balance/70 mt-1">35.4% de tasa de ahorro</p>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Annual Report */}
          <TabsContent value="annual" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="kpi-card"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Ahorro Acumulado Anual
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={annualSavingsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(217, 33%, 17%)' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 8%)',
                        border: '1px solid hsl(217, 33%, 17%)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeSavings"
                      name="Ahorro Acumulado"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#savingsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Annual Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Ingresos Anuales', value: '$86,000', color: 'text-income' },
                { label: 'Gastos Anuales', value: '$56,500', color: 'text-expense' },
                { label: 'Ahorro Total', value: '$29,500', color: 'text-balance' },
                { label: 'Tasa de Ahorro', value: '34.3%', color: 'text-primary' },
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
