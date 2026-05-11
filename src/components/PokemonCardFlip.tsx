import { useState } from "react";
import { Link } from "react-router";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart, formatPrice } from "@/modules/ecommerce-core";
import { useTranslation } from "react-i18next";
import type { Product } from "@/modules/ecommerce-core/types";

interface PokemonCardFlipProps {
  product: Product & {
    back_image?: string;
    condition?: string;
    set_name?: string;
    is_box?: boolean | number;
  };
}

export function PokemonCardFlip({ product }: PokemonCardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { addItem } = useCart();
  const { t } = useTranslation("pokemon-card-flip");

  const frontImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : "/images/placeholder.png";
  const backImage = product.back_image || "/images/item_pokemon_card_back.jpg";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const conditionColors: Record<string, string> = {
    "Mint": "bg-emerald-100 text-emerald-800",
    "Near Mint": "bg-blue-100 text-blue-800",
    "Excellent": "bg-yellow-100 text-yellow-800",
    "Good": "bg-orange-100 text-orange-800",
  };

  const conditionColor = product.condition
    ? (conditionColors[product.condition] || "bg-gray-100 text-gray-800")
    : "bg-gray-100 text-gray-800";

  return (
    <div className="group flex flex-col">
      {/* Card Flip Container */}
      <div
        className="relative cursor-pointer mb-4"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            aspectRatio: "2.5/3.5",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={frontImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder.png";
              }}
            />
            {/* Flip hint */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {t("flipHint", "Çevir")}
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <img
              src={backImage}
              alt={t("cardBack", "Kart Arka Yüzü")}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder.png";
              }}
            />
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {t("flipBack", "Ön Yüz")}
            </div>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={`/products/${product.slug}`}
            className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
          {product.stock !== undefined && product.stock <= 2 && product.stock > 0 && (
            <Badge variant="destructive" className="text-xs shrink-0">
              {t("lastStock", "Son {{count}}", { count: product.stock })}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {t("outOfStock", "Tükendi")}
            </Badge>
          )}
        </div>

        {product.set_name && (
          <p className="text-xs text-muted-foreground mb-1">{product.set_name}</p>
        )}

        {product.condition && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit mb-2 ${conditionColor}`}>
            {product.condition}
          </span>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="font-bold text-base text-primary">
              {formatPrice(product.price, "TRY")}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through ml-1">
                {formatPrice(product.original_price, "TRY")}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="h-8 px-3 text-xs"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("addToCart", "Sepete Ekle")}
          </Button>
        </div>
      </div>
    </div>
  );
}
