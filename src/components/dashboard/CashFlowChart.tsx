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
  Cell,
} from 'recharts';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface CashFlowChartProps {
  data: MonthlyData[];
  selectedMonth?: number;
}

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

export function CashFlowChart({ data, selectedMonth }: CashFlowChartProps) {
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
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              formatter={(value) => {
                const colorMap: Record<string, string> = {
                  'Ingresos': 'hsl(142, 76%, 36%)',
                  'Gastos': 'hsl(0, 72%, 51%)',
                  'Balance': 'hsl(217, 91%, 60%)',
                };
                return <span style={{ color: colorMap[value] || 'hsl(215, 20%, 55%)', fontWeight: 500 }}>{value}</span>;
              }}
            />
            <Bar 
              dataKey="income" 
              name="Ingresos" 
              radius={[4, 4, 0, 0]}
              barSize={24}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`income-${index}`}
                  fill={selectedMonth === index ? 'hsl(142, 76%, 46%)' : 'hsl(142, 76%, 36%)'}
                  opacity={selectedMonth !== undefined && selectedMonth !== index ? 0.4 : 1}
                />
              ))}
            </Bar>
            <Bar 
              dataKey="expenses" 
              name="Gastos" 
              radius={[4, 4, 0, 0]}
              barSize={24}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`expense-${index}`}
                  fill={selectedMonth === index ? 'hsl(0, 72%, 61%)' : 'hsl(0, 72%, 51%)'}
                  opacity={selectedMonth !== undefined && selectedMonth !== index ? 0.4 : 1}
                />
              ))}
            </Bar>
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
