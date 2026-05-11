import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useDbList, type DbProductCategory } from "@/db";

export interface CategoryItem {
  id: string | number;
  slug: string;
  name: string;
  description?: string;
  image: string;
}

export interface CategorySectionProps {
  categories?: CategoryItem[];
  loading?: boolean;
}

export function CategorySection({
  categories: propCategories,
  loading: propLoading,
}: CategorySectionProps) {
  const { t } = useTranslation("category-section");
  const { data: hookCategories = [], isLoading: hookLoading } = useDbList<DbProductCategory>("product_categories");

  const categories = propCategories ?? hookCategories;
  const loading = propLoading ?? hookLoading;

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/20 border-t border-border/20">
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 px-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent leading-normal pb-1">
            {t("title", "Shop by Category")}
          </h2>
          <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-primary/50 to-primary/20 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full"></div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("subtitle", "Discover our carefully curated collections")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/2] bg-muted rounded-xl mb-4"></div>
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))
            : categories.map((category) => (
                <div key={category.id} className="contents" data-db-table="product_categories" data-db-id={category.id}>
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group block"
                >
                  <Card className="overflow-hidden border-0 p-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 rounded-2xl">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300"></div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-primary-foreground transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs sm:text-sm text-white/90 line-clamp-2 group-hover:text-white transition-colors">
                            {category.description}
                          </p>
                        )}

                        <div className="flex items-center mt-2 sm:mt-3 text-white/80 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                          <span className="text-xs sm:text-sm font-medium mr-2">
                            {t("explore", "Explore")}
                          </span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
