# Announcement Bar

Top notification bar with multiple style variants (default, primary, warning, success, gradient), dismissible with localStorage persistence, customizable icon, and link support. Slide animation.

## Exports

**Components:** AnnouncementBar

## Usage

```tsx
import { AnnouncementBar } from '@/modules/announcement-bar';

<AnnouncementBar
  message="New features available!"
  linkText="Learn more"
  linkUrl="/blog/new-features"
  variant="gradient"
  icon="sparkles"
/>

• Variants: default, primary, warning, success, gradient
• Icons: sparkles, megaphone, gift, zap, none
• Dismissible with storage key
```

