import React from "react";
import { Link } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/modules/ecommerce-core/types";
import { useCart, useFavorites, formatPrice } from "@/modules/ecommerce-core";
import { useTranslation } from "react-i18next";
import constants from "@/constants/constants.json";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list" | "featured" | "compact";
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = "grid",
  className,
}) => {
  const { addItem } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { t } = useTranslation("product-card");

  const currentPrice = product.on_sale
    ? product.sale_price || product.price
    : product.price;
  const isProductFavorite = isFavorite(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      return; // Don't add to cart if out of stock
    }

    addItem(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProductFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  if (variant === "list") {
    return (
      <Card
        className={cn(
          "overflow-hidden p-0 hover:shadow-lg transition-all duration-200",
          className
        )}
      >
        <Link
          to={`/products/${product.slug}`}
          className="flex flex-col sm:flex-row"
        >
          <div className="w-full sm:w-48 md:w-56 h-48 sm:h-56 flex-shrink-0 relative">
            <img
              src={product.images?.length ? product.images?.[0] : "/images/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
              {isOutOfStock && (
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold shadow-md bg-muted text-muted-foreground border-0"
                >
                  {t("outOfStock", "Out of Stock")}
                </Badge>
              )}
              {!isOutOfStock && product.on_sale && (
                <Badge
                  variant="destructive"
                  className="text-xs font-semibold shadow-md bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  {t("sale", "Sale")}
                </Badge>
              )}
              {!isOutOfStock && product.is_new && (
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold shadow-md bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  {t("new", "New")}
                </Badge>
              )}
              {!isOutOfStock && product.featured && (
                <Badge
                  variant="default"
                  className="text-xs font-semibold shadow-md bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  {t("featured", "Featured")}
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start h-full gap-4">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 line-clamp-2 leading-normal">
                    {product.name}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    {product.on_sale && (
                      <span className="text-sm sm:text-base text-muted-foreground line-through">
                        {formatPrice(product.price, constants.site.currency)}
                      </span>
                    )}
                    <span className="text-lg sm:text-xl font-bold text-foreground">
                      {formatPrice(currentPrice, constants.site.currency)}
                    </span>
                    {product.on_sale && (
                      <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                        {t("save", "Save")}{" "}
                        {formatPrice(
                          product.price - currentPrice,
                          constants.site.currency
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:ml-6 justify-end sm:justify-start">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleFavorite}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 p-0 shadow-sm hover:shadow-md transition-all duration-200",
                    isProductFavorite
                      ? "text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 hover:border-red-400"
                      : "text-muted-foreground border-border bg-card hover:bg-muted hover:text-red-500 hover:border-red-300"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5",
                      isProductFavorite && "fill-current"
                    )}
                  />
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 p-0 shadow-sm hover:shadow-md transition-all duration-200",
                    isOutOfStock && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Grid, Featured, and Compact variants
  return (
    <Card
      className={cn(
        "group overflow-hidden border-0 p-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-card rounded-2xl h-full flex flex-col",
        variant === "compact" && "max-w-xs",
        className
      )}
    >
      <Link to={`/products/${product.slug}`} className="flex flex-col h-full">
        <div className="relative">
          <div
            className={cn(
              "w-full bg-muted overflow-hidden",
              variant === "featured"
                ? "aspect-square"
                : variant === "compact"
                ? "aspect-square"
                : "aspect-[4/3]"
            )}
          >
            <img
              src={product.images?.length ? product.images?.[0] : "/images/placeholder.png"}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock && (
              <Badge
                variant="secondary"
                className="text-xs font-semibold shadow-lg bg-muted text-muted-foreground border-0"
              >
                {t("outOfStock", "Out of Stock")}
              </Badge>
            )}
            {!isOutOfStock && product.on_sale && (
              <Badge
                variant="destructive"
                className="text-xs font-semibold shadow-lg bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {t("sale", "Sale")}
              </Badge>
            )}
            {!isOutOfStock && product.is_new && (
              <Badge
                variant="secondary"
                className="text-xs font-semibold shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                {t("new", "New")}
              </Badge>
            )}
            {!isOutOfStock && product.featured && (
              <Badge
                variant="default"
                className="text-xs font-semibold shadow-lg bg-green-600 hover:bg-green-700 text-white border-0"
              >
                {t("featured", "Featured")}
              </Badge>
            )}
          </div>

          {/* Favorite button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleFavorite}
            className={cn(
              "absolute top-3 right-3 w-10 h-10 p-0 shadow-lg backdrop-blur-sm border-2 transition-all duration-200",
              isProductFavorite
                ? "text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 bg-card/95 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400"
                : "text-muted-foreground border-border bg-card/90 hover:bg-card hover:text-red-500 hover:border-red-300"
            )}
          >
            <Heart
              className={cn("w-5 h-5", isProductFavorite && "fill-current")}
            />
          </Button>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          <h3
            className={cn(
              "font-semibold text-foreground mb-2 line-clamp-2 leading-normal",
              variant === "compact" ? "text-sm" : "text-base"
            )}
          >
            {product.name}
          </h3>

          {variant !== "compact" && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-end justify-between gap-3 mt-auto">
            <div className="flex flex-col gap-0.5">
              {product.on_sale && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price, constants.site.currency)}
                </span>
              )}
              <span
                className={cn(
                  "font-bold text-foreground",
                  variant === "compact" ? "text-base" : "text-lg"
                )}
              >
                {formatPrice(currentPrice, constants.site.currency)}
              </span>
              {product.on_sale && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {t("save", "Save")}{" "}
                  {formatPrice(
                    product.price - currentPrice,
                    constants.site.currency
                  )}
                </span>
              )}
            </div>

            <Button
              size={variant === "compact" ? "sm" : "default"}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex-shrink-0 shadow-sm hover:shadow-md transition-all duration-200",
                variant === "compact"
                  ? "h-9 w-9 p-0"
                  : "h-10 px-4 text-sm whitespace-nowrap",
                isOutOfStock && "opacity-50 cursor-not-allowed"
              )}
            >
              <ShoppingCart
                className={cn(
                  variant === "compact" ? "w-4 h-4" : "w-4 h-4 mr-2"
                )}
              />
              {variant !== "compact" &&
                (isOutOfStock
                  ? t("outOfStock", "Out of Stock")
                  : t("addToCart", "Add to Cart"))}
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
