import { useState, useEffect } from 'react';
import { getClothingItems } from '../services/firestore';
import { ClothingItem } from '../types';

export function useClothing() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  const loadItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getClothingItems(selectedCategory ?? undefined);
      setItems(data);
    } catch (err) {
      setError('Не удалось загрузить каталог');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  return {
    items,
    loading,
    error,
    selectedCategory,
    selectCategory,
    refresh: loadItems,
  };
}
