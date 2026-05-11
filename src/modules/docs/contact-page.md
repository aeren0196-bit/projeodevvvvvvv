# Contact Page

Contact page with two-column layout: contact form (name, email, subject, message) on left, and contact information (address, phone, email, business hours, social links) on right. Includes embedded Google Map, form validation, and success/error toast notifications. Mobile-responsive with stacked layout.

## Exports

**Components:** ContactPage, default

## Usage

```tsx
import { ContactPage } from '@/modules/contact-page';

<Route path="/contact" element={<ContactPage />} />

• Two-column: form left, info right
• Form: name, email, subject, message
• Info: address, phone, email, hours, map
• Toast notifications on submit
```

## Dependencies

- animations

