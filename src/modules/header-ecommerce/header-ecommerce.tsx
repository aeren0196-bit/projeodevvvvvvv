import { useState, useMemo } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, Menu, Search, Heart, Package, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/modules/auth-core";
import { CartDrawer } from "@/modules/cart-drawer";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import constants from "@/constants/constants.json";
import type { Product, Category } from "@/modules/ecommerce-core/types";
import {
  useCart,
  useFavorites,
  formatPrice,
} from "@/modules/ecommerce-core";
import { useDbList } from "@/db";

export function HeaderEcommerce() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { itemCount, state } = useCart();
  const { favoriteCount } = useFavorites();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("header-ecommerce");

  const handleLogout = () => {
    logout();
    toast.success(t("logoutToastTitle", "Goodbye!"), {
      description: t("logoutToastDesc", "You have been logged out successfully."),
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebouncedValue(searchTerm, 300);
  const { data: productCategories = [] } = useDbList<Category>("product_categories");
  const categoryMap = useMemo(() => new Map(productCategories.map(c => [c.id, c])), [productCategories]);

  const { data: searchResults = [] } = useDbList<Product>("products", {
    where: debouncedTerm ? { name: { $like: `%${debouncedTerm}%` } } : {},
    limit: 20,
    enabled: debouncedTerm.length > 0,
  });

  const clearSearch = () => { setSearchTerm(""); };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setShowResults(false);
      setDesktopSearchOpen(false);
      clearSearch();
    }
  };

  const handleSearchFocus = () => {
    setShowResults(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
  };

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("products"), href: "/products" },
    { name: t("about"), href: "/about" },
    { name: t("contact"), href: "/contact" },
    { name: t("admin", "Admin"), href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Logo size="sm" className="text-base sm:text-xl lg:text-2xl" />
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-12 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-base font-medium transition-colors hover:text-primary relative group py-2"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Search & Actions - Right Aligned */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Desktop Search - Modal */}
            <Dialog
              open={desktopSearchOpen}
              onOpenChange={setDesktopSearchOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex h-10 w-10"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {t("searchProducts", "Search Products")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        type="search"
                        placeholder={t(
                          "searchPlaceholder",
                          "Search for products..."
                        )}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-11 h-12 text-base"
                        autoFocus
                      />
                    </div>
                  </form>

                  {/* Desktop Search Results */}
                  {searchTerm.trim() && (
                    <div className="max-h-[400px] overflow-y-auto rounded-lg border bg-card">
                      {searchResults.length > 0 ? (
                        <div className="divide-y">
                          <div className="px-4 py-3 bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">
                              {searchResults.length}{" "}
                              {searchResults.length === 1
                                ? "result"
                                : "results"}{" "}
                              found
                            </p>
                          </div>
                          {searchResults.slice(0, 8).map((product: Product) => (
                            <div key={product.id} className="contents" data-db-table="products" data-db-id={product.id}>
                            <Link
                              to={`/products/${product.slug}`}
                              onClick={() => {
                                setDesktopSearchOpen(false);
                                clearSearch();
                              }}
                              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                            >
                              <img
                                src={
                                  product.images?.length ? product.images?.[0] : "/images/placeholder.png"
                                }
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-base line-clamp-1">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {categoryMap.get(product.categories?.[0] as number)?.name}
                                </p>
                                <p className="text-base font-semibold text-primary mt-1">
                                  {formatPrice(
                                    product.price,
                                    constants.site.currency
                                  )}
                                </p>
                              </div>
                            </Link>
                            </div>
                          ))}
                          {searchResults.length > 8 && (
                            <div className="px-4 py-3 bg-muted/30 text-center">
                              <button
                                onClick={() => {
                                  navigate(
                                    `/products?search=${encodeURIComponent(
                                      searchTerm
                                    )}`
                                  );
                                  setDesktopSearchOpen(false);
                                  clearSearch();
                                }}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {t(
                                  "viewAllResults",
                                  `View all ${searchResults.length} results`
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-base text-muted-foreground">
                            {t("noResults", "No products found")}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t(
                              "tryDifferentKeywords",
                              "Try different keywords"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Search - Mobile (Hidden - moved to hamburger menu) */}
            <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("searchProducts")}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchTerm.trim()) {
                      navigate(
                        `/products?search=${encodeURIComponent(searchTerm)}`
                      );
                      setMobileSearchOpen(false);
                      clearSearch();
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="search"
                      placeholder={t("searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {t("searchButton", "Search")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        clearSearch();
                        setMobileSearchOpen(false);
                      }}
                    >
                      {t("cancel", "Cancel")}
                    </Button>
                  </div>
                </form>

                {/* Mobile Search Results */}
                {searchTerm.trim() && (
                  <div className="mt-4 max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          {searchResults.length} result
                          {searchResults.length !== 1 ? "s" : ""} found
                        </p>
                        {searchResults.slice(0, 5).map((product: Product) => (
                          <div key={product.id} className="contents" data-db-table="products" data-db-id={product.id}>
                          <Link
                            to={`/products/${product.slug}`}
                            onClick={() => {
                              setMobileSearchOpen(false);
                              clearSearch();
                            }}
                            className="block p-2 rounded hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  product.images?.length ? product.images?.[0] : "/images/placeholder.png"
                                }
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {categoryMap.get(product.categories?.[0] as number)?.name}
                                </p>
                                <p className="text-sm font-medium">
                                  {formatPrice(
                                    product.price,
                                    constants.site.currency
                                  )}
                                </p>
                              </div>
                            </div>
                          </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("noResults")}
                      </p>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Wishlist - Desktop Only */}
            <Link to="/favorites" className="hidden lg:block">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
              >
                <Heart className="h-5 w-5" />
                {favoriteCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                  >
                    {favoriteCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart - Desktop Only (Goes to Cart Page) */}
            <Link to="/cart" className="hidden lg:block">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth - Desktop Only */}
            <div className="hidden lg:flex">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.username}</p>
                        {user?.email && (
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/my-orders" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        {t("myOrders", "My Orders")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("logout", "Logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] px-6">
                <SheetHeader>
                  <SheetTitle>{t("menu")}</SheetTitle>
                </SheetHeader>

                {/* Mobile Search in Hamburger */}
                <div className="mt-6 pb-4 border-b">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="search"
                        placeholder={t("searchPlaceholder")}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        className="pl-10 h-11"
                      />
                    </div>
                  </form>

                  {/* Search Results in Hamburger */}
                  {showResults && searchTerm && (
                    <div className="mt-3 max-h-[300px] overflow-y-auto rounded-lg border bg-card">
                      {searchResults.length > 0 ? (
                        <div className="divide-y">
                          <div className="px-3 py-2 bg-muted/50">
                            <p className="text-xs font-medium text-muted-foreground">
                              {searchResults.length}{" "}
                              {searchResults.length === 1
                                ? "result"
                                : "results"}
                            </p>
                          </div>
                          {searchResults.slice(0, 5).map((product: Product) => (
                            <div key={product.id} className="contents" data-db-table="products" data-db-id={product.id}>
                            <Link
                              to={`/products/${product.slug}`}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                clearSearch();
                                setShowResults(false);
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                            >
                              <img
                                src={
                                  product.images?.length ? product.images?.[0] : "/images/placeholder.png"
                                }
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-1">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {categoryMap.get(product.categories?.[0] as number)?.name}
                                </p>
                                <p className="text-sm font-semibold text-primary mt-1">
                                  {formatPrice(
                                    product.price,
                                    constants.site.currency
                                  )}
                                </p>
                              </div>
                            </Link>
                            </div>
                          ))}
                          {searchResults.length > 5 && (
                            <div className="px-3 py-2 bg-muted/30 text-center">
                              <button
                                onClick={() => {
                                  navigate(
                                    `/products?search=${encodeURIComponent(
                                      searchTerm
                                    )}`
                                  );
                                  setMobileMenuOpen(false);
                                  clearSearch();
                                  setShowResults(false);
                                }}
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                {t(
                                  "viewAllResults",
                                  `View all ${searchResults.length} results`
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            {t("noResults", "No results found")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t pt-4 space-y-4">
                    <Link
                      to="/favorites"
                      className="flex items-center justify-between text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5" />
                        <span>{t("favorites")}</span>
                      </div>
                      <Badge variant="secondary">{favoriteCount}</Badge>
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center justify-between w-full text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5" />
                        <span>{t("cart")}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="secondary">{itemCount}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(state.total, constants.site.currency)}
                        </span>
                      </div>
                    </Link>

                    {/* Auth - Mobile */}
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.username}</p>
                            {user?.email && (
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            )}
                          </div>
                        </div>
                        <Link
                          to="/my-orders"
                          className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Package className="h-5 w-5" />
                          <span>{t("myOrders", "My Orders")}</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 text-lg font-medium text-red-600 hover:text-red-700 transition-colors w-full"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>{t("logout", "Logout")}</span>
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>{t("login", "Login")}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {/* Cart Drawer */}
      <CartDrawer showTrigger={false} />
    </header>
  );
}
