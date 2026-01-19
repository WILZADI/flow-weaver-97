import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types/finance';
import { categories as defaultCategories } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCustomCategories() {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCustomCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const categories: Category[] = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        type: cat.type as 'income' | 'expense',
      }));

      setCustomCategories(categories);
    } catch (error) {
      console.error('Error fetching custom categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name: string, type: 'income' | 'expense'): Promise<Category | null> => {
    if (!user) return null;

    const icon = type === 'income' ? 'Plus' : 'Tag';

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert({
          user_id: user.id,
          name: name.trim(),
          type,
          icon,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        type: data.type as 'income' | 'expense',
      };

      setCustomCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomCategories(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  };

  const getAllCategories = (type?: 'income' | 'expense'): Category[] => {
    const all = [...defaultCategories, ...customCategories];
    if (type) {
      return all.filter(c => c.type === type);
    }
    return all;
  };

  return {
    customCategories,
    isLoading,
    addCategory,
    deleteCategory,
    getAllCategories,
    refetch: fetchCategories,
  };
}
