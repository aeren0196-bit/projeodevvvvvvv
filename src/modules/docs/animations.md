# Animations

Motion animation utilities and wrapper components including FadeIn, SlideIn, ScaleUp, StaggerContainer. Built with motion/react for smooth, performant animations.

## Exports

**Components:** Fade, FadeIn, FadeInDown, GridItem, ListItem, ScaleUp, SlideInLeft, SlideInRight, StaggerContainer, StaggerItem, buttonPress, carouselSlide, collapseVariants, easeTransition, fade, fadeInDown, fadeInUp, gridItem, hoverLift, hoverScale, hoverScaleSubtle, iconHoverRotate, listItem, notificationVariants, pageTransition, quickTransition, scaleUp, slideInLeft, slideInRight, springTransition, staggerContainer, staggerContainerFast, staggerContainerSlow

## Usage

```tsx
import { FadeIn, StaggerContainer, StaggerItem, ScaleUp } from '@/modules/animations';

// Simple fade in on scroll
<FadeIn>
  <Card>Content</Card>
</FadeIn>

// Staggered grid animation
<StaggerContainer className="grid grid-cols-3 gap-4">
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>

// With delay
<FadeIn delay={0.2}>
  <Section>...</Section>
</FadeIn>
```

