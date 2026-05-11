# Products Page

Full-featured product listing page with sidebar filters (category, price range, rating), sorting options (price, name, rating, newest), view toggle (grid/list), pagination, and search integration. Uses ProductCard component for display. Includes loading skeletons, empty state handling, and responsive design with collapsible mobile filters.

## Exports

**Components:** ProductsPage, default

## Usage

```tsx
import ProductsPage from '@/modules/products-page';

<Route path="/products" element={<ProductsPage />} />

• Installed at: src/modules/products-page/
• Add link: <Link to="/products">Browse Products</Link>
• Supports filters, sorting, grid/list view, pagination
• Uses useDbList from @/db for data fetching
```

## Dependencies

- ecommerce-core
- product-card
- animations

