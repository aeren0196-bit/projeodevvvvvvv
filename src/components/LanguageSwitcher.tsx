import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeLanguage } from "@/lang";
import { cn } from "@/lib/utils";
import constants from "@/constants/constants.json";

interface LanguageSwitcherProps {
  className?: string;
  style?: React.CSSProperties;
}

const languages: Record<string, string> =
  constants?.site?.availableLanguages || {};

export function LanguageSwitcher({ className, style }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-9 px-2 text-sm font-medium", className)}
          style={style}
        >
          {languages?.[currentLang] || currentLang.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([lang, label]) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={cn(
              currentLang === lang ? "bg-accent" : "",
              "hover:text-primary focus:text-primary",
            )}
          >
            {label || lang.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
