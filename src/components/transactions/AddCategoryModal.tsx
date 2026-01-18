import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense';
  onAddCategory: (name: string, type: 'income' | 'expense') => void;
  existingCategories: string[];
}

export function AddCategoryModal({
  open,
  onOpenChange,
  type,
  onAddCategory,
  existingCategories,
}: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>(type);

  const handleSubmit = () => {
    const trimmedName = categoryName.trim();
    
    if (!trimmedName) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    if (trimmedName.length > 30) {
      toast.error('El nombre es demasiado largo (máximo 30 caracteres)');
      return;
    }

    if (existingCategories.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error('Ya existe una categoría con ese nombre');
      return;
    }

    onAddCategory(trimmedName, categoryType);
    toast.success(`Categoría "${trimmedName}" creada`);
    setCategoryName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={categoryType === 'income' ? 'default' : 'outline'}
              className={cn(
                "flex-1",
                categoryType === 'income' && "bg-income hover:bg-income/90"
              )}
              onClick={() => setCategoryType('income')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Ingreso
            </Button>
            <Button
              type="button"
              variant={categoryType === 'expense' ? 'default' : 'outline'}
              className={cn(
                "flex-1",
                categoryType === 'expense' && "bg-expense hover:bg-expense/90"
              )}
              onClick={() => setCategoryType('expense')}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Gasto
            </Button>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Nombre de la categoría
            </label>
            <Input
              placeholder="Ej: Entretenimiento"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="h-12"
              maxLength={30}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            Crear Categoría
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
