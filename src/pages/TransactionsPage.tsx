import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Link2,
  MoreVertical,
  Trash2,
  Edit,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  PlusCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MonthYearSelector } from '@/components/shared/MonthYearSelector';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/finance';
import { LinkExpenseModal } from '@/components/transactions/LinkExpenseModal';
import { AddCategoryModal } from '@/components/transactions/AddCategoryModal';
import { formatCurrency } from '@/lib/currency';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { transactionSchema } from '@/lib/validation';
import { useCustomCategories } from '@/hooks/useCustomCategories';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function TransactionsPage() {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction,
    deleteTransaction, 
    togglePending,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    getFilteredTransactions 
  } = useFinance();

  const { getAllCategories, addCategory } = useCustomCategories();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [addCategoryType, setAddCategoryType] = useState<'income' | 'expense'>('expense');
  const [selectedExpense, setSelectedExpense] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    isPending: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: '',
    isPending: false,
  });

  const openAddCategoryModal = (type: 'income' | 'expense') => {
    setAddCategoryType(type);
    setAddCategoryModalOpen(true);
  };

  const handleAddCategory = (name: string, type: 'income' | 'expense') => {
    addCategory(name, type);
  };

  const openLinkModal = (expense: Transaction) => {
    setSelectedExpense(expense);
    setLinkModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      isPending: transaction.isPending,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction) return;
    setFormErrors({});

    const amount = parseFloat(editForm.amount);
    const validation = transactionSchema.safeParse({
      type: editForm.type,
      amount: isNaN(amount) ? undefined : amount,
      description: editForm.description,
      category: editForm.category,
      date: editForm.date,
      isPending: editForm.isPending,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(fieldErrors);
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      await updateTransaction(editingTransaction.id, {
        type: editForm.type,
        amount: validation.data.amount,
        description: validation.data.description,
        category: validation.data.category,
        date: validation.data.date,
        isPending: validation.data.isPending,
      });

      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      toast.success('Transacción actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la transacción');
    } finally {
      setIsSaving(false);
    }
  };

  // Get transactions filtered by month/year
  const monthFilteredTransactions = showAllMonths 
    ? getFilteredTransactions(undefined, selectedYear)
    : getFilteredTransactions(selectedMonth, selectedYear);

  const filteredTransactions = monthFilteredTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && t.isPending) ||
      (statusFilter === 'paid' && !t.isPending);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddTransaction = async () => {
    setFormErrors({});

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
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(fieldErrors);
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
        date: new Date().toISOString().split('T')[0],
        isPending: false,
      });
      toast.success('Transacción agregada correctamente');
    } catch (error) {
      toast.error('Error al agregar la transacción');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete.id);
        toast.success('Transacción eliminada');
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        toast.error('Error al eliminar la transacción');
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Movimientos</h1>
              <p className="text-muted-foreground mt-1">Gestiona tus ingresos y gastos</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="gap-2"
                    onClick={async () => {
                      const period = showAllMonths 
                        ? `${selectedYear}` 
                        : `${MONTHS[selectedMonth]}_${selectedYear}`;
                      try {
                        await exportToExcel(filteredTransactions, `transacciones_${period}`);
                        toast.success('Archivo Excel generado correctamente');
                      } catch (error) {
                        toast.error('Error al generar el archivo Excel');
                      }
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2"
                    onClick={() => {
                      const period = showAllMonths 
                        ? `Año ${selectedYear}` 
                        : `${MONTHS[selectedMonth]} ${selectedYear}`;
                      exportToPDF(
                        filteredTransactions, 
                        `transacciones_${period.replace(' ', '_')}`,
                        `Reporte de Transacciones - ${period}`
                      );
                      toast.success('Archivo PDF generado correctamente');
                    }}
                  >
                    <FileText className="w-4 h-4 text-red-600" />
                    Exportar a PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Transaction Button */}
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
                      onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income', category: '' }))}
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
                    <Input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Monto (COP)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <Input
                    placeholder="Descripción"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    className="h-12"
                  />

                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) => {
                      if (value === '__add_new__') {
                        openAddCategoryModal(newTransaction.type);
                      } else {
                        setNewTransaction(prev => ({ ...prev, category: value }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categorías</SelectLabel>
                        {getAllCategories(newTransaction.type).map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectItem value="__add_new__" className="text-primary">
                        <span className="flex items-center gap-2">
                          <PlusCircle className="w-4 h-4" />
                          Crear nueva categoría
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPending"
                      checked={newTransaction.isPending}
                      onCheckedChange={(checked) => 
                        setNewTransaction(prev => ({ ...prev, isPending: checked === true }))
                      }
                    />
                    <label
                      htmlFor="isPending"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Marcar como pendiente
                    </label>
                  </div>

                  <Button
                    onClick={handleAddTransaction}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    Guardar Transacción
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Month Year Selector */}
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar transacciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-card"
            />
          </div>
          <div className="flex gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Estado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transactions List - Desktop Table */}
        <div className="hidden md:block kpi-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Descripción</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Monto</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          transaction.type === 'income' ? "bg-income/10" : "bg-expense/10"
                        )}>
                          {transaction.type === 'income' 
                            ? <TrendingUp className="w-5 h-5 text-income" />
                            : <TrendingDown className="w-5 h-5 text-expense" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          {transaction.linkedIncomeIds && transaction.linkedIncomeIds.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs cursor-help">
                                  <Link2 className="w-3 h-3" /> 
                                  {transaction.linkedIncomeIds.length} ingreso{transaction.linkedIncomeIds.length > 1 ? 's' : ''}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                <p className="font-medium mb-1">Fuentes de ingreso:</p>
                                <ul className="space-y-1">
                                  {transaction.linkedIncomeIds.map(id => {
                                    const income = transactions.find(t => t.id === id);
                                    return income ? (
                                      <li key={id} className="flex items-center justify-between gap-3 text-xs">
                                        <span>{income.description}</span>
                                        <span className="text-income font-medium">+{formatCurrency(income.amount)}</span>
                                      </li>
                                    ) : null;
                                  })}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{transaction.category}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          togglePending(transaction.id);
                          toast.success(transaction.isPending ? 'Marcado como pagado' : 'Marcado como pendiente');
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                          transaction.isPending 
                            ? "bg-pending/10 text-pending hover:bg-pending/20"
                            : "bg-income/10 text-income hover:bg-income/20"
                        )}
                      >
                        {transaction.isPending ? 'Pendiente' : 'Pagado'}
                      </button>
                    </td>
                    <td className={cn(
                      "py-4 px-4 text-right font-bold",
                      transaction.type === 'income' ? "text-income" : "text-expense"
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => openEditModal(transaction)}>
                            <Edit className="w-4 h-4" /> Editar
                          </DropdownMenuItem>
                          {transaction.type === 'expense' && (
                            <DropdownMenuItem className="gap-2" onClick={() => openLinkModal(transaction)}>
                              <Link2 className="w-4 h-4" /> Vincular
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => openDeleteDialog(transaction)}
                          >
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Transactions List - Mobile Cards */}
        <div className="md:hidden space-y-3">
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.03 }}
                className="kpi-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      transaction.type === 'income' ? "bg-income/10" : "bg-expense/10"
                    )}>
                      {transaction.type === 'income' 
                        ? <TrendingUp className="w-6 h-6 text-income" />
                        : <TrendingDown className="w-6 h-6 text-expense" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                      {transaction.linkedIncomeIds && transaction.linkedIncomeIds.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs cursor-help">
                              <Link2 className="w-3 h-3" /> 
                              {transaction.linkedIncomeIds.length} ingreso{transaction.linkedIncomeIds.length > 1 ? 's' : ''}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="font-medium mb-1">Fuentes de ingreso:</p>
                            <ul className="space-y-1">
                              {transaction.linkedIncomeIds.map(id => {
                                const income = transactions.find(t => t.id === id);
                                return income ? (
                                  <li key={id} className="flex items-center justify-between gap-3 text-xs">
                                    <span>{income.description}</span>
                                    <span className="text-income font-medium">+{formatCurrency(income.amount)}</span>
                                  </li>
                                ) : null;
                              })}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => openEditModal(transaction)}>
                          <Edit className="w-4 h-4" /> Editar
                        </DropdownMenuItem>
                        {transaction.type === 'expense' && (
                          <DropdownMenuItem className="gap-2" onClick={() => openLinkModal(transaction)}>
                            <Link2 className="w-4 h-4" /> Vincular
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => openDeleteDialog(transaction)}
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('es-CO')}
                    </span>
                    {transaction.isPending && (
                      <span className="flex items-center gap-1 text-xs text-pending">
                        <Clock className="w-3 h-3" /> Pendiente
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-lg font-bold",
                    transaction.type === 'income' ? "text-income" : "text-expense"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle>Editar Transacción</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editForm.type === 'income' ? 'default' : 'outline'}
                  className={cn(
                    "flex-1",
                    editForm.type === 'income' && "bg-income hover:bg-income/90"
                  )}
                  onClick={() => setEditForm(prev => ({ ...prev, type: 'income', category: '' }))}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ingreso
                </Button>
                <Button
                  type="button"
                  variant={editForm.type === 'expense' ? 'default' : 'outline'}
                  className={cn(
                    "flex-1",
                    editForm.type === 'expense' && "bg-expense hover:bg-expense/90"
                  )}
                  onClick={() => setEditForm(prev => ({ ...prev, type: 'expense', category: '' }))}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Gasto
                </Button>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Fecha</label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Monto (COP)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.amount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="h-12"
                />
              </div>

              <Input
                placeholder="Descripción"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="h-12"
              />

              <Select
                value={editForm.category}
                onValueChange={(value) => {
                  if (value === '__add_new__') {
                    openAddCategoryModal(editForm.type);
                  } else {
                    setEditForm(prev => ({ ...prev, category: value }));
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categorías</SelectLabel>
                    {getAllCategories(editForm.type).map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectItem value="__add_new__" className="text-primary">
                    <span className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" />
                      Crear nueva categoría
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editIsPending"
                  checked={editForm.isPending}
                  onCheckedChange={(checked) => 
                    setEditForm(prev => ({ ...prev, isPending: checked === true }))
                  }
                />
                <label
                  htmlFor="editIsPending"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Marcar como pendiente
                </label>
              </div>

              <Button
                onClick={handleEditTransaction}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Link Expense Modal */}
        <LinkExpenseModal
          expense={selectedExpense}
          open={linkModalOpen}
          onOpenChange={(open) => {
            setLinkModalOpen(open);
            if (!open) setSelectedExpense(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
              <AlertDialogDescription>
                {transactionToDelete && (
                  <>
                    Estás a punto de eliminar <strong>"{transactionToDelete.description}"</strong> por{' '}
                    <strong className={transactionToDelete.type === 'income' ? 'text-income' : 'text-expense'}>
                      {formatCurrency(transactionToDelete.amount)}
                    </strong>.
                    <br /><br />
                    Esta acción no se puede deshacer.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Category Modal */}
        <AddCategoryModal
          open={addCategoryModalOpen}
          onOpenChange={setAddCategoryModalOpen}
          type={addCategoryType}
          onAddCategory={handleAddCategory}
          existingCategories={getAllCategories().map(c => c.name)}
        />
      </div>
    </AppLayout>
  );
}
