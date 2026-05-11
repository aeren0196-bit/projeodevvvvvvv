import { Link } from "react-router";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import constants from "@/constants/constants.json";
import { formatPrice } from "@/modules/ecommerce-core/format-price";
import type { Product } from "@/modules/ecommerce-core/types";

interface RelatedProductsBlockProps {
  products: Product[];
  title?: string;
}

export function RelatedProductsBlock({
  products,
  title,
}: RelatedProductsBlockProps) {
  const { t } = useTranslation("related-products-block");

  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {title || t("title", "Related Products")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="contents" data-db-table="products" data-db-id={product.id}>
          <Card
            className="group overflow-hidden border-0 p-0 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <Link to={`/products/${product.slug}`}>
              <div className="relative aspect-square overflow-hidden cursor-pointer">
                <img
                  src={product.images?.length ? product.images?.[0] : "/images/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link to={`/products/${product.slug}`}>
                <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold">
                  {formatPrice(product.price, constants.site.currency)}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  <span className="text-xs">{product.rating}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
