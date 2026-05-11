import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  className?: string;
  style?: React.CSSProperties;
}

const themes: {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeSwitcher({ className, style }: ThemeSwitcherProps) {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon =
    theme === "system"
      ? effectiveTheme === "dark"
        ? themes[1].icon
        : themes[0].icon
      : currentTheme?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("h-9 w-9 px-0", className)} style={style}>
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              theme === value ? "bg-accent" : "",
              "hover:text-primary focus:text-primary flex items-center gap-2 group",
            )}
          >
            <Icon className="h-4 w-4 transition-colors group-hover:text-primary" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
