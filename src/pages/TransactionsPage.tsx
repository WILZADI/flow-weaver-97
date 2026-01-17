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
  Clock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
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
import { toast } from 'sonner';
import { categories } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/finance';
import { LinkExpenseModal } from '@/components/transactions/LinkExpenseModal';

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, togglePending } = useFinance();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const openLinkModal = (expense: Transaction) => {
    setSelectedExpense(expense);
    setLinkModalOpen(true);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && t.isPending) ||
      (statusFilter === 'paid' && !t.isPending);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    addTransaction({
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      date: newTransaction.date,
      isPending: false,
    });

    setIsDialogOpen(false);
    setNewTransaction({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    toast.success('Transacción agregada correctamente');
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Transacción eliminada');
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Movimientos</h1>
            <p className="text-muted-foreground mt-1">Gestiona tus ingresos y gastos</p>
          </div>
          
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
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
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
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Gasto
                  </Button>
                </div>

                <Input
                  type="number"
                  placeholder="Monto"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  className="h-12"
                />

                <Input
                  placeholder="Descripción"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  className="h-12"
                />

                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(c => c.type === newTransaction.type)
                      .map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  className="h-12"
                />

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
                                        <span className="text-income font-medium">+${income.amount.toLocaleString()}</span>
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
                      {new Date(transaction.date).toLocaleDateString('es-MX')}
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
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" /> Editar
                          </DropdownMenuItem>
                          {transaction.type === 'expense' && (
                            <DropdownMenuItem className="gap-2" onClick={() => openLinkModal(transaction)}>
                              <Link2 className="w-4 h-4" /> Vincular
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDelete(transaction.id)}
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
                                    <span className="text-income font-medium">+${income.amount.toLocaleString()}</span>
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
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" /> Editar
                        </DropdownMenuItem>
                        {transaction.type === 'expense' && (
                          <DropdownMenuItem className="gap-2" onClick={() => openLinkModal(transaction)}>
                            <Link2 className="w-4 h-4" /> Vincular
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('es-MX')}
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
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Link Expense Modal */}
        <LinkExpenseModal
          expense={selectedExpense}
          open={linkModalOpen}
          onOpenChange={(open) => {
            setLinkModalOpen(open);
            if (!open) setSelectedExpense(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
