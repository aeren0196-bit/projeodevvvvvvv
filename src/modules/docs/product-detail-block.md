# Product Detail Block

Product detail view with image gallery (lightbox zoom), variant selector, quantity input, specifications tabs, reviews section, and add to cart button. Mobile responsive with sticky add-to-cart bar.

## Exports

**Components:** ProductDetailBlock

## Usage

```tsx
import { ProductDetailBlock } from '@/modules/product-detail-block';

<ProductDetailBlock product={product} />

• Uses useCart() from ecommerce-core (Zustand)
• Sections: gallery, info, variants, specs, reviews
• Props: product (Product type from ecommerce-core)
```

## Dependencies

- ecommerce-core

