# Product Detail Page

Product detail page that fetches product data by slug from URL params. Uses useDbGet from @/db and renders ProductDetailBlock. Includes loading skeleton, error handling for not found products, and automatic page title.

## Exports

**Components:** ProductDetailPage, default

## Usage

```tsx
import { ProductDetailPage } from '@/modules/product-detail-page';

<Route path="/products/:slug" element={<ProductDetailPage />} />

• Uses useDbGet() from @/db to fetch product by slug
• Fetches product by slug from URL params
• Shows loading skeleton while fetching
• Handles product not found state
```

## Dependencies

- ecommerce-core
- product-detail-block

