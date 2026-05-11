# Related Products Block

Related/recommended products section with heading and horizontal scrollable grid. Shows 4 products on desktop, swipeable on mobile. Use on product detail pages.

## Exports

**Components:** RelatedProductsBlock

## Usage

```tsx
import { RelatedProductsBlock } from '@/modules/related-products-block';

<RelatedProductsBlock products={relatedProducts} />

• Props: products (Product[] from ecommerce-core)
• Uses ProductCard component
• Responsive: 4 cols desktop, scrollable mobile
```

## Dependencies

- ecommerce-core
- product-card

