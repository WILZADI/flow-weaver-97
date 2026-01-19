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
  onAddCategory: (name: string, type: 'income' | 'expense') => Promise<unknown>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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

    setIsSubmitting(true);
    try {
      const result = await onAddCategory(trimmedName, type);
      if (result) {
        toast.success(`Categoría "${trimmedName}" creada`);
        setCategoryName('');
        onOpenChange(false);
      } else {
        toast.error('Error al crear la categoría');
      }
    } catch {
      toast.error('Error al crear la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg",
            type === 'income' ? "bg-income/10" : "bg-expense/10"
          )}>
            {type === 'income' ? (
              <>
                <TrendingUp className="w-5 h-5 text-income" />
                <span className="font-medium text-income">Categoría de Ingreso</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-expense" />
                <span className="font-medium text-expense">Categoría de Gasto</span>
              </>
            )}
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
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Creando...' : 'Crear Categoría'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
