import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { CategoryIcon } from './IconPicker';
import { Category } from '@/types/finance';
import { categories as defaultCategories } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  type: 'income' | 'expense';
  allCategories: Category[];
  customCategories: Category[];
  onAddCategory: () => void;
  onDeleteCategory: (id: string) => Promise<boolean>;
}

export function CategorySelector({
  value,
  onChange,
  type,
  allCategories,
  customCategories,
  onAddCategory,
  onDeleteCategory,
}: CategorySelectorProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCategories = allCategories.filter(c => c.type === type);
  const defaultCategoryIds = new Set(defaultCategories.map(c => c.id));

  const handleDeleteClick = (e: React.MouseEvent, category: Category) => {
    e.preventDefault();
    e.stopPropagation();
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await onDeleteCategory(categoryToDelete.id);
      if (success) {
        toast.success(`Categoría "${categoryToDelete.name}" eliminada`);
        // Clear selection if the deleted category was selected
        if (value === categoryToDelete.name) {
          onChange('');
        }
      } else {
        toast.error('Error al eliminar la categoría');
      }
    } catch {
      toast.error('Error al eliminar la categoría');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-12 flex-1">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectGroup>
              <SelectLabel>Categorías predeterminadas</SelectLabel>
              {filteredCategories
                .filter(c => defaultCategoryIds.has(c.id))
                .map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon iconName={category.icon} className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectGroup>
            {customCategories.filter(c => c.type === type).length > 0 && (
              <SelectGroup>
                <SelectLabel>Mis categorías</SelectLabel>
                {customCategories
                  .filter(c => c.type === type)
                  .map(category => (
                    <div
                      key={category.id}
                      className="relative flex items-center group"
                    >
                      <SelectItem value={category.name} className="flex-1 pr-10">
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconName={category.icon} className="w-4 h-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                      <button
                        type="button"
                        className={cn(
                          "absolute right-2 p-1 rounded-md opacity-0 group-hover:opacity-100",
                          "hover:bg-destructive/10 text-destructive transition-opacity"
                        )}
                        onClick={(e) => handleDeleteClick(e, category)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={onAddCategory}
        >
          <PlusCircle className="w-5 h-5 text-primary" />
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (
                <>
                  Estás a punto de eliminar la categoría <strong>"{categoryToDelete.name}"</strong>.
                  <br /><br />
                  Las transacciones existentes con esta categoría mantendrán su nombre de categoría.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
