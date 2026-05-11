import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem, CartState, CartContextType } from "../types";

const getProductPrice = (product: Product): number => {
  return product.on_sale && product.sale_price ? product.sale_price : product.price;
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = getProductPrice(item.product);
    return total + price * item.quantity;
  }, 0);
};

interface CartStore extends CartState {
  addItem: (product: Product) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, _get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isDrawerOpen: false,
      setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),

      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            const items = state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            return {
              items,
              total: calculateTotal(items),
              itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
              isDrawerOpen: true,
            };
          }

          const items = [
            ...state.items,
            { id: product.id, product, quantity: 1 },
          ];
          return {
            items,
            total: calculateTotal(items),
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            isDrawerOpen: true,
          };
        }),

      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);
          return {
            items,
            total: calculateTotal(items),
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
          };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const items = state.items.filter((item) => item.id !== id);
            return {
              items,
              total: calculateTotal(items),
              itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            };
          }

          const items = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          return {
            items,
            total: calculateTotal(items),
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
          };
        }),

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
    }),
    { name: "ecommerce_cart" }
  )
);

// Backward compatible hook - matches CartContextType with drawer state
export const useCart = (): CartContextType & { isDrawerOpen: boolean; setDrawerOpen: (open: boolean) => void } => {
  const store = useCartStore();
  return {
    state: { items: store.items, total: store.total },
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    itemCount: store.itemCount,
    isDrawerOpen: store.isDrawerOpen,
    setDrawerOpen: store.setDrawerOpen,
  };
};
