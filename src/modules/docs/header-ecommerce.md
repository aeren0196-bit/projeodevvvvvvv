# E-commerce Header

Full-featured e-commerce header with logo, main navigation, search bar with autocomplete dropdown, favorites icon with count badge, shopping cart icon with item count, user account dropdown menu, and mobile hamburger menu. Includes sticky positioning, language switcher, and responsive breakpoints. Dark mode support included.

## Exports

**Components:** HeaderEcommerce

## Usage

```tsx
import { Header } from '@/modules/header-ecommerce';

<Header />

• Component is installed at: src/modules/header-ecommerce/
• Customize navigation links in: src/modules/header-ecommerce/lang/*.json
• Uses useCart and useFavorites from ecommerce-core for badges
• Includes search, cart, favorites, and mobile menu
```

## Dependencies

- ecommerce-core
- cart-drawer
- auth-core

