import clsx from "clsx";
import { Children } from "react";

type StackProps = {
  as?: keyof HTMLElementTagNameMap;   // "div", "ul", "section" vs can be any valid HTML element
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12; //Tailwind spacing scale
  direction?: "vertical" | "horizontal";
  className?: string;
  children: React.ReactNode;
  wrapChildren?: boolean; // If true, wraps each child in a Stack with the same gap
  childGap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12; // Gap for wrapped children
};

export function Stack({
  as: Component = "div",
  gap = 2,
  direction = "vertical",
  className,
  children,
  wrapChildren = false,
  childGap = 2,
}: StackProps) {
  const gapClass =
    direction === "vertical" ? `space-y-${gap}` : `space-x-${gap}`;

  const content = wrapChildren
    ? Children.map(children, (child, index) => (
        <Stack key={index} gap={childGap} direction={direction}>
          {child}
        </Stack>
      ))
    : children;

  return (
    <Component className={clsx(gapClass, className)}>
      {content}
    </Component>
  );
}
