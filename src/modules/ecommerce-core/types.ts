export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number;
  on_sale: boolean;
  images: string[];
  categories: number[];
  brand?: string;
  sku?: string;
  stock: number;
  tags: string[];
  rating: number;
  review_count: number;
  featured: boolean;
  is_new: boolean;
  published: boolean;
  specifications?: Record<string, string | number | boolean>;
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  image?: string;
  stockQuantity: number;
}

export interface CartItem {
  id: string | number;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

export interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string | number) => void;
  isFavorite: (productId: string | number) => boolean;
  favoriteCount: number;
  clearFavorites: () => void;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  addresses?: Address[];
  orders?: Order[];
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: number;
  user_id: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  shipping_address: Address;
  notes?: string;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug: string;
    images: string[];
    price: number;
  };
}
