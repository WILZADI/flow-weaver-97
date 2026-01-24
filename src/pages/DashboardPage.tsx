import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, Link2, ChevronRight, Plus, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { PendingCard } from '@/components/dashboard/PendingCard';
import { MonthYearSelector } from '@/components/shared/MonthYearSelector';
import { LinkedIncomesDetailModal } from '@/components/dashboard/LinkedIncomesDetailModal';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { CategorySelector } from '@/components/transactions/CategorySelector';
import { AddCategoryModal } from '@/components/transactions/AddCategoryModal';
import { useCustomCategories } from '@/hooks/useCustomCategories';
import { transactionSchema } from '@/lib/validation';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Helper functions for date handling
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayString = (): string => formatDateToString(new Date());

export default function DashboardPage() {
  const { 
    transactions,
    selectedMonth, 
    selectedYear, 
    setSelectedMonth, 
    setSelectedYear,
    getMonthSummary,
    getYearSummary,
    getFilteredTransactions,
    addTransaction,
  } = useFinance();

  const { getAllCategories, addCategory, deleteCategory, customCategories } = useCustomCategories();
  
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [showLinkedIncomesModal, setShowLinkedIncomesModal] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [addCategoryType, setAddCategoryType] = useState<'income' | 'expense'>('expense');
  const [isNewDatePickerOpen, setIsNewDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: getTodayString(),
    isPending: false,
  });
  
  const summary = showAllMonths 
    ? getYearSummary(selectedYear) 
    : getMonthSummary(selectedMonth, selectedYear);

  const openAddCategoryModal = (type: 'income' | 'expense') => {
    setAddCategoryType(type);
    setAddCategoryModalOpen(true);
  };

  const handleAddCategory = async (name: string, type: 'income' | 'expense', icon: string) => {
    return await addCategory(name, type, icon);
  };

  const handleAddTransaction = async () => {
    const amount = parseFloat(newTransaction.amount);
    const validation = transactionSchema.safeParse({
      type: newTransaction.type,
      amount: isNaN(amount) ? undefined : amount,
      description: newTransaction.description,
      category: newTransaction.category,
      date: newTransaction.date,
      isPending: newTransaction.isPending,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      await addTransaction({
        type: validation.data.type,
        amount: validation.data.amount,
        description: validation.data.description,
        category: validation.data.category,
        date: validation.data.date,
        isPending: validation.data.isPending,
      });

      setIsDialogOpen(false);
      setNewTransaction({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: getTodayString(),
        isPending: false,
      });
      toast.success('Transacción agregada correctamente');
    } catch (error) {
      toast.error('Error al agregar la transacción');
    } finally {
      setIsSaving(false);
    }
  };

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

  // Get linked incomes information with remaining balance and expense details
  const linkedIncomesInfo = useMemo(() => {
    const filteredTransactions = showAllMonths
      ? getFilteredTransactions(undefined, selectedYear)
      : getFilteredTransactions(selectedMonth, selectedYear);
    
    // Calculate expenses per linked income and collect expense details
    const expensesByIncome = new Map<string, number>();
    const expenseDetailsByIncome = new Map<string, typeof filteredTransactions>();
    
    filteredTransactions.forEach(t => {
      if (t.type === 'expense' && t.linkedIncomeIds) {
        t.linkedIncomeIds.forEach(id => {
          expensesByIncome.set(id, (expensesByIncome.get(id) || 0) + t.amount);
          const existing = expenseDetailsByIncome.get(id) || [];
          expenseDetailsByIncome.set(id, [...existing, t]);
        });
      }
    });

    // Get the actual linked income transactions with remaining balance
    const linkedIncomeIds = new Set(expensesByIncome.keys());
    const linkedIncomes = transactions
      .filter(t => linkedIncomeIds.has(t.id))
      .map((income) => ({
        ...income,
        label: income.category,
        expensesLinked: expensesByIncome.get(income.id) || 0,
        remainingBalance: income.amount - (expensesByIncome.get(income.id) || 0),
        linkedExpenses: expenseDetailsByIncome.get(income.id) || [],
      }));
    
    const totalRemainingBalance = linkedIncomes.reduce((sum, t) => sum + t.remainingBalance, 0);

    return {
      incomes: linkedIncomes,
      totalRemainingBalance,
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
          <div className="flex items-center gap-3 flex-wrap">
            <MonthYearSelector
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              showAllOption
              isAllMonths={showAllMonths}
              onToggleAllMonths={setShowAllMonths}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-5 h-5" />
                  Nueva Transacción
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Nueva Transacción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newTransaction.type === 'income' ? 'default' : 'outline'}
                      className={cn(
                        "flex-1",
                        newTransaction.type === 'income' && "bg-income hover:bg-income/90"
                      )}
                      onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income', category: '', isPending: false }))}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Ingreso
                    </Button>
                    <Button
                      type="button"
                      variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
                      className={cn(
                        "flex-1",
                        newTransaction.type === 'expense' && "bg-expense hover:bg-expense/90"
                      )}
                      onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense', category: '' }))}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Gasto
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Fecha</label>
                    <Popover open={isNewDatePickerOpen} onOpenChange={setIsNewDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal",
                            !newTransaction.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTransaction.date ? (
                            format(parseDateString(newTransaction.date), "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={es}
                          selected={newTransaction.date ? parseDateString(newTransaction.date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setNewTransaction(prev => ({ ...prev, date: formatDateToString(date) }));
                              setIsNewDatePickerOpen(false);
                            }
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <CategorySelector
                    value={newTransaction.category}
                    onChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
                    type={newTransaction.type}
                    allCategories={getAllCategories()}
                    customCategories={customCategories}
                    onAddCategory={() => openAddCategoryModal(newTransaction.type)}
                    onDeleteCategory={deleteCategory}
                  />

                  <Input
                    placeholder="Descripción"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    className="h-12"
                  />

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Monto (COP)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                      className="h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {newTransaction.type === 'expense' && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                      <label
                        htmlFor="dashboardIsPending"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Marcar como pendiente
                      </label>
                      <Switch
                        id="dashboardIsPending"
                        checked={newTransaction.isPending}
                        onCheckedChange={(checked) => 
                          setNewTransaction(prev => ({ ...prev, isPending: checked }))
                        }
                        className="data-[state=checked]:bg-pending"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleAddTransaction}
                    disabled={isSaving}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Transacción'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
              <button
                onClick={() => setShowLinkedIncomesModal(true)}
                className="w-full bg-card border border-income/20 rounded-lg p-2.5 shadow-sm hover:border-income/40 hover:bg-accent/30 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3 h-3 text-income" />
                    <span className="text-[10px] font-medium text-foreground">Ingresos Afectados</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-income transition-colors" />
                </div>
                <div className="space-y-1">
                  {linkedIncomesInfo.incomes.slice(0, 2).map(income => (
                    <div key={income.id} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground truncate max-w-[80px]">{income.label}</span>
                      <span className="text-income font-medium">{formatCurrency(income.remainingBalance)}</span>
                    </div>
                  ))}
                  {linkedIncomesInfo.count > 2 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{linkedIncomesInfo.count - 2} más
                    </p>
                  )}
                  <div className="pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-medium text-foreground">Saldo Restante</span>
                      <span className="text-income font-bold">{formatCurrency(linkedIncomesInfo.totalRemainingBalance)}</span>
                    </div>
                  </div>
                </div>
              </button>
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

      {/* Modal for Linked Incomes Detail */}
      <LinkedIncomesDetailModal
        open={showLinkedIncomesModal}
        onOpenChange={setShowLinkedIncomesModal}
        incomes={linkedIncomesInfo.incomes}
        totalRemainingBalance={linkedIncomesInfo.totalRemainingBalance}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        open={addCategoryModalOpen}
        onOpenChange={setAddCategoryModalOpen}
        onAddCategory={handleAddCategory}
        type={addCategoryType}
        existingCategories={getAllCategories().map(c => c.name)}
      />
    </AppLayout>
  );
}
