# Cart Page

Shopping cart page with item list showing product image, name, price, and quantity controls (+/- buttons). Features order summary sidebar with subtotal, shipping estimate, tax calculation, and total. Includes empty cart state with CTA, remove item confirmation, quantity validation, and proceed to checkout button. Responsive layout with mobile-optimized summary.

## Exports

**Components:** CartPage, default

## Usage

```tsx
import CartPage from '@/modules/cart-page';

<Route path="/cart" element={<CartPage />} />

• Uses useCart() from ecommerce-core (Zustand)
• Features: item list, quantity controls, order summary
• Empty cart state with shop CTA
```

## Dependencies

- ecommerce-core
- animations

