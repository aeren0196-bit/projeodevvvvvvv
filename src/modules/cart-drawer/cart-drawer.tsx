import { useMemo } from "react";
import { Link } from "react-router";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { useCart, formatPrice } from "@/modules/ecommerce-core";
import type { Category } from "@/modules/ecommerce-core/types";
import { useDbList } from "@/db";
import constants from "@/constants/constants.json";

interface CartDrawerProps {
  checkoutHref?: string;
  className?: string;
  showTrigger?: boolean;
}

export function CartDrawer({
  checkoutHref = "/checkout",
  className,
  showTrigger = true,
}: CartDrawerProps) {
  const { t } = useTranslation("cart-drawer");
  const {
    state,
    removeItem,
    updateQuantity,
    isDrawerOpen,
    setDrawerOpen,
  } = useCart();
  const { items, total } = state;
  const { data: productCategories = [] } = useDbList<Category>("product_categories");
  const categoryMap = useMemo(() => new Map(productCategories.map(c => [c.id, c])), [productCategories]);
  const currency = (constants.site as any).currency || "USD";

  const getProductPrice = (product: {
    price: number;
    sale_price?: number;
    on_sale?: boolean;
  }) => {
    return product.on_sale && product.sale_price
      ? product.sale_price
      : product.price;
  };

  const handleQuantityChange = (id: string | number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col px-6 pb-8">
        <SheetHeader>
          <SheetTitle>{t("title", "Shopping cart")}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-8">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("empty", "Your cart is empty")}
            </p>
          ) : (
            <ul className="-my-6 divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex py-6">
                  <div className="size-24 shrink-0 overflow-hidden rounded-md border border-border">
                    <img
                      alt={item.product.name}
                      src={item.product.images?.length ? item.product.images?.[0] : "/images/placeholder.png"}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium">
                        <h3>
                          <Link
                            to={`/products/${item.product.slug}`}
                            onClick={() => setDrawerOpen(false)}
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="ml-4">
                          {formatPrice(getProductPrice(item.product), currency)}
                        </p>
                      </div>
                      {categoryMap.get(item.product.categories?.[0] as number)?.name && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {categoryMap.get(item.product.categories?.[0] as number)?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        {t("remove", "Remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border pt-6 mt-6">
          <div className="flex justify-between text-base font-medium">
            <p>{t("subtotal", "Subtotal")}</p>
            <p>{formatPrice(total, currency)}</p>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("shippingNote", "Shipping and taxes calculated at checkout.")}
          </p>
          <div className="mt-6">
            <Button asChild className="w-full" disabled={items.length === 0}>
              <Link to={checkoutHref} onClick={() => setDrawerOpen(false)}>
                {t("checkout", "Checkout")}
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
