import { useState, useEffect } from 'react';
import { Category } from '@/types/finance';
import { categories as defaultCategories } from '@/data/mockData';

const STORAGE_KEY = 'custom-categories';

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomCategories(JSON.parse(stored));
      } catch {
        setCustomCategories([]);
      }
    }
  }, []);

  const saveToStorage = (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    setCustomCategories(categories);
  };

  const addCategory = (name: string, type: 'income' | 'expense') => {
    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      icon: type === 'income' ? 'Plus' : 'Tag',
      type,
    };
    const updated = [...customCategories, newCategory];
    saveToStorage(updated);
    return newCategory;
  };

  const deleteCategory = (id: string) => {
    const updated = customCategories.filter(c => c.id !== id);
    saveToStorage(updated);
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
    addCategory,
    deleteCategory,
    getAllCategories,
  };
}
