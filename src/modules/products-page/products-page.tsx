import { useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";
import { Filter, Grid, List, Package, CreditCard, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/modules/animations";

const ITEMS_PER_PAGE = 20;

// 360° Flip Card bileşeni
function FlipCard({ frontImage, backImage, productName }: { frontImage: string; backImage: string; productName: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="relative w-full aspect-[4/3] cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFlipped(f => !f); }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Ön yüz */}
        <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: "hidden" }}>
          <img src={frontImage} alt={productName} className="w-full h-full object-cover" />
        </div>
        {/* Arka yüz */}
        <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <img src={backImage || "/images/item_pokemon_card_back.jpg"} alt={`${productName} arka`} className="w-full h-full object-cover" />
        </div>
      </div>
      {/* Flip ipucu */}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
        <RotateCcw className="w-3 h-3" />
        {flipped ? "Ön" : "Arka"}
      </div>
    </div>
  );
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductCard } from "@/modules/product-card/product-card";
import { useDbList } from "@/db";
import type { Product, Category } from "@/modules/ecommerce-core/types";

interface FilterSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  categories: Category[];
  selectedCategories: string[];
  handleCategoryChange: (category: string, checked: boolean) => void;
  selectedFeatures: string[];
  handleFeatureChange: (feature: string, checked: boolean) => void;
  minPriceRef: React.RefObject<HTMLInputElement | null>;
  maxPriceRef: React.RefObject<HTMLInputElement | null>;
  searchParams: URLSearchParams;
  handlePriceFilter: () => void;
}

function FilterSidebar({
  t,
  categories,
  selectedCategories,
  handleCategoryChange,
  selectedFeatures,
  handleFeatureChange,
  minPriceRef,
  maxPriceRef,
  searchParams,
  handlePriceFilter,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 text-base">
          {t("categories", "Categories")}
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              data-db-table="product_categories"
              data-db-id={category.id}
            >
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.slug, checked as boolean)
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none cursor-pointer flex-1"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-base">
          {t("priceRange", "Price Range")}
        </h3>
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <input
              ref={minPriceRef}
              type="number"
              placeholder={t("minPrice", "Min")}
              defaultValue={searchParams.get("minPrice") || ""}
              onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background"
            />
            <input
              ref={maxPriceRef}
              type="number"
              placeholder={t("maxPrice", "Max")}
              defaultValue={searchParams.get("maxPrice") || ""}
              onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-base">
          {t("features", "Features")}
        </h3>
        <div className="space-y-3">
          {[
            { key: "on_sale", label: t("onSale", "On Sale") },
            { key: "is_new", label: t("newArrivals", "New Arrivals") },
            { key: "featured", label: t("featuredLabel", "Featured") },
            { key: "in_stock", label: t("inStock", "In Stock") },
          ].map((feature) => (
            <div
              key={feature.key}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={feature.key}
                checked={selectedFeatures.includes(feature.key)}
                onCheckedChange={(checked) =>
                  handleFeatureChange(feature.key, checked as boolean)
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={feature.key}
                className="text-sm font-medium leading-none cursor-pointer flex-1"
              >
                {feature.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const { t } = useTranslation("products-page");
  usePageTitle({ title: t("pageTitle", "Products") });
  const { data: products = [], isLoading: productsLoading } = useDbList<Product>("products", {
    where: { published: 1 },
  });
  const { data: categories = [], isLoading: categoriesLoading } = useDbList<Category>("product_categories");
  const loading = productsLoading || categoriesLoading;

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [productType, setProductType] = useState<"all" | "single" | "box">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categorySlug = searchParams.get("category");
    return categorySlug ? [categorySlug] : [];
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const searchQuery = searchParams.get("search") || "";
  const minPriceRef = useRef<HTMLInputElement>(null);
  const maxPriceRef = useRef<HTMLInputElement>(null);

  const selectedCategoryIds = useMemo(() => {
    if (selectedCategories.length === 0) return new Set<number>();
    return new Set(
      categories.filter(c => selectedCategories.includes(c.slug)).map(c => c.id)
    );
  }, [selectedCategories, categories]);

  const filteredProducts = useMemo(() => {
    const minPrice = parseFloat(searchParams.get("minPrice") || "0") || 0;
    const maxPrice =
      parseFloat(searchParams.get("maxPrice") || "999999") || 999999;

    let filtered = products.filter((product) => {
      const currentPrice =
        product.on_sale && product.sale_price
          ? product.sale_price
          : product.price;
      return currentPrice >= minPrice && currentPrice <= maxPrice;
    });

    // Product type filter (Booster Box / Single Card)
    if (productType === "box") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((p) => {
        const pb = p as any;
        return pb.is_box == 1 || pb.is_box === true || pb.category === "booster-box" || pb.category === "elite-trainer-box";
      });
    } else if (productType === "single") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((p) => {
        const pb = p as any;
        return (!pb.is_box || pb.is_box == 0) && pb.category !== "booster-box" && pb.category !== "elite-trainer-box";
      });
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        product.categories?.some((id) => selectedCategoryIds.has(id))
      );
    }

    if (selectedFeatures.length > 0) {
      filtered = filtered.filter((product) => {
        return selectedFeatures.every((feature) => {
          switch (feature) {
            case "on_sale":
              return product.on_sale;
            case "is_new":
              return product.is_new;
            case "featured":
              return product.featured;
            case "in_stock":
              return product.stock > 0;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (
            (a.on_sale ? a.sale_price || a.price : a.price) -
            (b.on_sale ? b.sale_price || b.price : b.price)
          );
        case "price-high":
          return (
            (b.on_sale ? b.sale_price || b.price : b.price) -
            (a.on_sale ? a.sale_price || a.price : a.price)
          );
        case "newest":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }, [products, searchParams, selectedFeatures, selectedCategories, selectedCategoryIds, sortBy, productType]);

  // Sayfalama
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePriceFilter = useCallback(() => {
    const minPrice = minPriceRef.current?.value || "";
    const maxPrice = maxPriceRef.current?.value || "";
    const params = new URLSearchParams(searchParams);
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleCategoryChange = useCallback(
    (category: string, checked: boolean) => {
      if (checked) {
        setSelectedCategories((prev) => [...prev, category]);
      } else {
        setSelectedCategories((prev) => prev.filter((c) => c !== category));
      }
    },
    []
  );

  const handleFeatureChange = useCallback(
    (feature: string, checked: boolean) => {
      if (checked) {
        setSelectedFeatures((prev) => [...prev, feature]);
      } else {
        setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
      }
    },
    []
  );

  const sortOptions = [
    { value: "featured", label: t("featured", "Featured") },
    { value: "price-low", label: t("sortPriceLow", "Price: Low to High") },
    { value: "price-high", label: t("sortPriceHigh", "Price: High to Low") },
    { value: "newest", label: t("sortNewest", "Newest") },
  ];

  const filterSidebarProps: FilterSidebarProps = {
    t,
    categories,
    selectedCategories,
    handleCategoryChange,
    selectedFeatures,
    handleFeatureChange,
    minPriceRef,
    maxPriceRef,
    searchParams,
    handlePriceFilter,
  };

  return (
    <Layout>
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-8">
        <FadeIn className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E]">
                {searchQuery
                  ? t("searchResultsFor", `"${searchQuery}" için sonuçlar`)
                  : productType === "box"
                    ? "Booster Box & Kapalı Kutular"
                    : productType === "single"
                      ? "Tekil Kartlar"
                      : t("allProducts", "Tüm Ürünler")}
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                {filteredProducts.length} ürün gösteriliyor
              </p>
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchParams({})}
                className="w-fit"
              >
                {t("clearSearch", "Aramayı Temizle")}
              </Button>
            )}
          </div>

          {/* ── Ürün Tipi Filtre Butonları ── */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => { setProductType("all"); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${
                productType === "all"
                  ? "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                  : "bg-white text-[#1A1A2E] border-gray-200 hover:border-[#1A1A2E]"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => { setProductType("single"); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${
                productType === "single"
                  ? "bg-yellow-400 text-[#1A1A2E] border-yellow-400"
                  : "bg-white text-[#1A1A2E] border-gray-200 hover:border-yellow-400"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Tekil Kart
            </button>
            <button
              onClick={() => { setProductType("box"); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${
                productType === "box"
                  ? "bg-yellow-400 text-[#1A1A2E] border-yellow-400"
                  : "bg-white text-[#1A1A2E] border-gray-200 hover:border-yellow-400"
              }`}
            >
              <Package className="w-4 h-4" />
              Booster Box
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden w-full sm:w-auto"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t("filters", "Filters")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>{t("filters", "Filters")}</SheetTitle>
                  <SheetDescription>
                    {t("refineSearch", "Refine your product search")}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar {...filterSidebarProps} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder={t("sortBy", "Sort by")} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg p-1 w-full sm:w-auto">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex-1 sm:flex-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1 sm:flex-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar {...filterSidebarProps} />
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-card rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="aspect-square bg-muted mb-4"></div>
                    <div className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="flex flex-col bg-card rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden" data-db-table="products" data-db-id={product.id}>
                    {/* 360° Flip görüntüleme */}
                    <FlipCard
                      frontImage={product.images?.length ? product.images[0] : "/images/placeholder.png"}
                      backImage={(product as any).back_image || "/images/item_pokemon_card_back.jpg"}
                      productName={product.name}
                    />
                    {/* Kart bilgileri */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-[#1A1A2E] text-base mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          {product.on_sale && <span className="text-xs text-muted-foreground line-through block">{product.price} ₺</span>}
                          <span className="text-lg font-bold text-[#1A1A2E]">{product.on_sale ? (product.sale_price || product.price) : product.price} ₺</span>
                        </div>
                        <a href={`/products/${product.slug}`} className="bg-yellow-400 hover:bg-yellow-500 text-[#1A1A2E] font-semibold text-xs px-3 py-2 rounded-lg transition-colors">
                          İncele
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="w-full"
                    data-db-table="products"
                    data-db-id={product.id}
                  >
                    <ProductCard
                      product={product}
                      variant="list"
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t(
                    "noProductsFound",
                    "No products found matching your criteria."
                  )}
                </p>
              </div>
            )}

            {/* Sayfalama */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-[#1A1A2E] font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1A1A2E] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Önceki
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all border-2 ${
                        page === currentPage
                          ? "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                          : "bg-white text-[#1A1A2E] border-gray-200 hover:border-[#1A1A2E]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-[#1A1A2E] font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1A1A2E] transition-colors"
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProductsPage;
