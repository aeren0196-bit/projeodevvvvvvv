import { useMemo } from "react";
import { Link } from "react-router";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart, formatPrice } from "@/modules/ecommerce-core";
import type { Category } from "@/modules/ecommerce-core/types";
import { useDbList } from "@/db";
import constants from "@/constants/constants.json";
import { FadeIn } from "@/modules/animations";

export function CartPage() {
  const { t } = useTranslation("cart-page");
  usePageTitle({ title: t("pageTitle", "Shopping Cart") });
  const { state, removeItem, updateQuantity } = useCart();
  const { items, total } = state;
  const { data: productCategories = [] } = useDbList<Category>("product_categories");
  const categoryMap = useMemo(() => new Map(productCategories.map(c => [c.id, c])), [productCategories]);

  const currency = constants.site.currency || "USD";
  const shipping = 0;
  const tax = 0;
  const freeShippingThreshold = 100;

  const getProductPrice = (product: { price: number; sale_price?: number; on_sale?: boolean }) => {
    return product.on_sale && product.sale_price ? product.sale_price : product.price;
  };

  const handleQuantityChange = (productId: number | string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleQuantityInputChange = (productId: number | string, value: string) => {
    const quantity = parseInt(value) || 1;
    handleQuantityChange(productId, quantity);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const finalTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-3xl font-bold mb-4">
                {t("empty", "Your Cart is Empty")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("emptyDescription", "Looks like you haven't added any items to your cart yet.")}
              </p>
              <Button asChild size="lg">
                <Link to="/products">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("continueShopping", "Continue Shopping")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-8">
        <FadeIn className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("title", "Shopping Cart")}</h1>
            <p className="text-muted-foreground">
              {itemCount} {t("itemsInCart", "items in your cart")}
            </p>
          </div>
        </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.product.images?.length ? item.product.images?.[0] : "/images/placeholder.png"}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {categoryMap.get(item.product.categories?.[0] as number)?.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(getProductPrice(item.product) * item.quantity, currency)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(getProductPrice(item.product), currency)} {t("each", "each")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("orderSummary", "Order Summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>
                  {t("subtotal", "Subtotal")} ({itemCount} {t("items", "items")})
                </span>
                <span>{formatPrice(total, currency)}</span>
              </div>

              <div className="flex justify-between">
                <span>{t("shipping", "Shipping")}</span>
                <span>
                  {shipping === 0 ? t("free", "Free") : formatPrice(shipping, currency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t("tax", "Tax")}</span>
                <span>{formatPrice(tax, currency)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>{t("total", "Total")}</span>
                <span>{formatPrice(finalTotal, currency)}</span>
              </div>

              {shipping > 0 && freeShippingThreshold && freeShippingThreshold > total && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {t("freeShippingMessage", "Add {{amount}} more for free shipping!").replace(
                    "{{amount}}",
                    formatPrice(freeShippingThreshold - total, currency)
                  )}
                </div>
              )}

              <Button asChild className="w-full" size="lg">
                <Link to="/checkout">{t("proceedToCheckout", "Proceed to Checkout")}</Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link to="/products">{t("continueShopping", "Continue Shopping")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  {t("secureCheckout", "Secure Checkout")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("secureCheckoutDescription", "Your payment information is encrypted and secure")}
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CartPage;
