# Favorites Ecommerce Page

Product favorites page that displays user's favorite products with grid layout. Uses useFavorites hook from ecommerce-core for state management. Includes empty state, clear all functionality, and responsive product grid.

## Exports

**Components:** FavoritesEcommercePage, default

## Usage

```tsx
import FavoritesEcommercePage from '@/modules/favorites-ecommerce-page';

<Route path="/favorites" element={<FavoritesEcommercePage />} />

• Uses useFavorites() from ecommerce-core
• Shows empty state when no favorites
• Grid layout with ProductCard components
```

## Dependencies

- ecommerce-core
- product-card

