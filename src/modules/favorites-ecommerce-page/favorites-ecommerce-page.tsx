import { Link } from "react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/modules/product-card/product-card";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/modules/ecommerce-core";
import { usePageTitle } from "@/hooks/use-page-title";

export function FavoritesEcommercePage() {
  const { t } = useTranslation("favorites-ecommerce-page");
  const { favorites, clearFavorites } = useFavorites();
  usePageTitle({ title: t("title", "My Favorites") });

  // Empty State
  if (favorites.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-muted/30 py-12">
          <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4">
            <div className="text-center max-w-md mx-auto">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {t("noFavoritesYet", "No Favorites Yet")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t(
                  "noFavoritesDescription",
                  "Start browsing our products and add items to your favorites by clicking the heart icon."
                )}
              </p>
              <Button asChild size="lg">
                <Link to="/products">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t("browseProducts", "Browse Products")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Favorites Grid
  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t("title", "My Favorites")}
              </h1>
              <p className="text-muted-foreground">
                {favorites.length}{" "}
                {t(
                  "itemsInFavorites",
                  `item${favorites.length !== 1 ? "s" : ""} in your favorites`
                )}
              </p>
            </div>
            <Button variant="outline" onClick={clearFavorites}>
              {t("clearAll", "Clear All")}
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div key={product.id} className="contents" data-db-table="products" data-db-id={product.id}>
                <ProductCard product={product} variant="grid" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default FavoritesEcommercePage;
