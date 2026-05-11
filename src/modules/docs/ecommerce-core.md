# E-commerce Core

Complete e-commerce state management with Zustand. Includes useCartStore for shopping cart operations (add/remove/update items, totals), useFavoritesStore for wishlist, formatPrice utility, and payment config. No provider wrapping needed. Data fetching uses useDbList/useDbGet from @/db.

## Exports

**Components:** ONLINE_PROVIDER_CONFIGS, PAYMENT_METHOD_CONFIGS, formatPrice, getAvailablePaymentMethods, getFilteredPaymentMethodConfigs, getOnlinePaymentProviders, isOnlineProviderAvailable, isPaymentMethodAvailable, useCart, useCartStore, useFavorites, useFavoritesStore

**Types:** Address, CartContextType, CartItem, CartState, Category, FavoritesContextType, OnlinePaymentProvider, Order, OrderItem, PaymentMethod, PaymentMethodConfig, Product, ProductVariant, User

## Usage

```tsx
import { useCart, useFavorites } from '@/modules/ecommerce-core';
import { useDbList } from '@/db';
import type { Product } from '@/modules/ecommerce-core';

// Cart & favorites stores:
const { addItem, removeItem, state, itemCount } = useCart();
const { addToFavorites, isFavorite } = useFavorites();

// Data fetching via @/db hooks:
const { data: products } = useDbList<Product>('products');

// Or use stores directly with selectors:
const itemCount = useCartStore((s) => s.itemCount);
```

