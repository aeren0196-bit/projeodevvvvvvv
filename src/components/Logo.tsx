import { Link } from "react-router";
import constants from "@/constants/constants.json";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
}

export function Logo({
  className = "",
  size = "md",
  variant = "default",
  style,
  textStyle,
}: LogoProps) {
  // Text boyutları
  const textSizes = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  };

  // Image boyutları
  const imageSizes = {
    sm: "h-6 sm:h-8",
    md: "h-8 sm:h-10",
    lg: "h-10 sm:h-12",
    xl: "h-12 sm:h-16",
  };

  // Renk varyantları
  const variants = {
    default: "text-primary",
    light: "text-white",
    dark: "text-foreground",
  };

  const currentVariant = variants[variant];
  const siteName = constants.site.name;
  const logoImage = constants.site.logo;

  return (
    <Link
      to="/"
      style={style}
      className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 ${className}`}
    >
      {/* Logo Image (if exists) */}
      {logoImage && (
        <img
          src={logoImage}
          alt={`${siteName} Logo`}
          className={`${imageSizes[size]} w-auto object-contain flex-shrink-0`}
        />
      )}

      {/* Site Name */}
      <span
        style={textStyle}
        className={`${textSizes[size]} font-bold ${currentVariant} truncate`}
      >
        {siteName}
      </span>
    </Link>
  );
}
