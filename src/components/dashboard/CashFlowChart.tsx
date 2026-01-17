import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { monthlyData } from '@/data/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-4 border border-border shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CashFlowChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="kpi-card col-span-full"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Flujo de Efectivo Mensual</h3>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-muted-foreground">{value}</span>}
            />
            <Bar 
              dataKey="income" 
              name="Ingresos" 
              fill="hsl(142, 76%, 36%)" 
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Bar 
              dataKey="expenses" 
              name="Gastos" 
              fill="hsl(0, 72%, 51%)" 
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              name="Balance"
              stroke="hsl(217, 91%, 60%)" 
              strokeWidth={3}
              dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'hsl(217, 91%, 60%)' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
