import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/modules/product-card/product-card";
import { useTranslation } from "react-i18next";
import { useDbList } from "@/db";
import type { Product } from "@/modules/ecommerce-core/types";

interface FeaturedProductsProps {
  products?: Product[];
  loading?: boolean;
}

export function FeaturedProducts({
  products: propProducts,
  loading: propLoading,
}: FeaturedProductsProps) {
  const { t } = useTranslation("featured-products");
  const { data: hookProducts = [], isLoading: hookLoading } = useDbList<Product>("products", {
    where: { featured: 1 },
    limit: 8,
  });

  const products = propProducts ?? hookProducts;
  const loading = propLoading ?? hookLoading;

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background border-t border-border/20 relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 h-px bg-primary/30"></div>
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 px-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent leading-normal pb-1">
            {t('title', 'Featured Products')}
          </h2>
          <div className="w-12 sm:w-16 md:w-20 h-1 bg-gradient-to-r from-primary/50 to-primary/20 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full"></div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle', 'Hand-picked favorites from our collection')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse group">
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-2xl mb-6"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded-lg w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-5 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <div key={product.id} className="contents" data-db-table="products" data-db-id={product.id}>
                <ProductCard
                  product={product}
                  variant="featured"
                />
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8 sm:mt-12 lg:mt-16">
          <Button size="lg" asChild className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
            <Link to="/products">
              {t('viewAll', 'View All Products')}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
