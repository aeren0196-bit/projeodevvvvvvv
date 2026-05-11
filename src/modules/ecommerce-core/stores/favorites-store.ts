import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, FavoritesContextType } from "../types";

interface FavoritesStore {
  favorites: Product[];
  favoriteCount: number;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string | number) => void;
  isFavorite: (productId: string | number) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteCount: 0,

      addToFavorites: (product) =>
        set((state) => {
          if (state.favorites.some((fav) => fav.id === product.id)) {
            return state;
          }
          const favorites = [...state.favorites, product];
          return { favorites, favoriteCount: favorites.length };
        }),

      removeFromFavorites: (productId) =>
        set((state) => {
          const favorites = state.favorites.filter((fav) => fav.id !== productId);
          return { favorites, favoriteCount: favorites.length };
        }),

      isFavorite: (productId) => {
        return get().favorites.some((fav) => fav.id === productId);
      },

      clearFavorites: () => set({ favorites: [], favoriteCount: 0 }),
    }),
    { name: "ecommerce_favorites" }
  )
);

// Backward compatible hook - matches FavoritesContextType
export const useFavorites = (): FavoritesContextType => {
  const store = useFavoritesStore();
  return {
    favorites: store.favorites,
    addToFavorites: store.addToFavorites,
    removeFromFavorites: store.removeFromFavorites,
    isFavorite: store.isFavorite,
    favoriteCount: store.favoriteCount,
    clearFavorites: store.clearFavorites,
  };
};
