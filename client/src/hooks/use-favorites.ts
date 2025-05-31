import { useState, useEffect } from 'react';
import type { Landmark } from '@/types/landmark';

const FAVORITES_KEY = 'landmark-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Landmark[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  const addFavorite = (landmark: Landmark) => {
    const updatedFavorites = [...favorites, landmark];
    setFavorites(updatedFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  };

  const removeFavorite = (landmarkId: number) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== landmarkId);
    setFavorites(updatedFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  };

  const isFavorite = (landmarkId: number) => {
    return favorites.some(fav => fav.id === landmarkId);
  };

  const toggleFavorite = (landmark: Landmark) => {
    if (isFavorite(landmark.id)) {
      removeFavorite(landmark.id);
    } else {
      addFavorite(landmark);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };
}