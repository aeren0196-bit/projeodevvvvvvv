import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Package,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth-core";
import { customerClient } from "@/modules/api";

interface OrderItem {
  name: string;
  description?: string;
  quantity: number;
  amount: number;
  img?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  product_data?: OrderItem[];
}

type PageStatus = "loading" | "success" | "error" | "unauthorized";

export function MyOrdersPage() {
  const { t } = useTranslation("my-orders-page");
  usePageTitle({ title: t("title", "My Orders") });

  const { isAuthenticated, token } = useAuth();

  const [status, setStatus] = useState<PageStatus>("loading");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setStatus("unauthorized");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await customerClient.orders.getMyOrders();
        const ordersList = response.orders;
        setOrders(ordersList);
        setStatus("success");
      } catch (error: any) {
        console.error("Error fetching orders:", error);

        if (error?.response?.status === 401) {
          setStatus("unauthorized");
        } else {
          setStatus("error");
          toast.error(t("loadError", "Failed to load orders. Please try again."));
        }
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, t]);

  const getStatusIcon = (orderStatus: string) => {
    const statusLower = orderStatus.toLowerCase();
    if (["paid", "completed", "tamamlandı"].includes(statusLower)) {
      return <CheckCircle2 className="w-4 h-4" />;
    }
    if (["processing", "hazırlanıyor"].includes(statusLower)) {
      return <Clock className="w-4 h-4" />;
    }
    if (["shipped", "kargoda"].includes(statusLower)) {
      return <Truck className="w-4 h-4" />;
    }
    if (["cancelled", "iptal", "failed"].includes(statusLower)) {
      return <XCircle className="w-4 h-4" />;
    }
    return <Package className="w-4 h-4" />;
  };

  const getStatusBadgeVariant = (
    orderStatus: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = orderStatus.toLowerCase();
    if (["paid", "completed", "tamamlandı"].includes(statusLower)) {
      return "default";
    }
    if (["processing", "hazırlanıyor"].includes(statusLower)) {
      return "secondary";
    }
    if (["shipped", "kargoda"].includes(statusLower)) {
      return "outline";
    }
    if (["cancelled", "iptal", "failed"].includes(statusLower)) {
      return "destructive";
    }
    return "secondary";
  };

  const getPaymentStatusBadge = (
    paymentStatus: string
  ): "default" | "secondary" | "destructive" => {
    if (paymentStatus === "paid") return "default";
    if (paymentStatus === "unpaid" || paymentStatus === "pending")
      return "secondary";
    return "destructive";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Unauthorized
  if (status === "unauthorized") {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">
                  {t("loginRequired", "Login Required")}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "loginRequiredDescription",
                    "Please login to view your orders."
                  )}
                </p>
                <div className="flex flex-col gap-3">
                  <Button asChild>
                    <Link to="/login">{t("login", "Login")}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/register">
                      {t("createAccount", "Create Account")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading
  if (status === "loading") {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                <h1 className="text-2xl font-bold mb-2">
                  {t("loadingOrders", "Loading Orders")}
                </h1>
                <p className="text-muted-foreground">
                  {t("pleaseWait", "Please wait...")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Error
  if (status === "error") {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">
                  {t("errorTitle", "Something went wrong")}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "errorDescription",
                    "We couldn't load your orders. Please try again."
                  )}
                </p>
                <Button onClick={() => window.location.reload()}>
                  {t("tryAgain", "Try Again")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // No orders
  if (orders.length === 0) {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">
                  {t("noOrders", "No Orders Yet")}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "noOrdersDescription",
                    "You haven't placed any orders yet. Start shopping to see your orders here."
                  )}
                </p>
                <Button asChild>
                  <Link to="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t("startShopping", "Start Shopping")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Success - Has orders
  return (
    <Layout>
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("title", "My Orders")}</h1>
            <p className="text-muted-foreground">
              {t("orderCount", "{{count}} order(s)", { count: orders.length })}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              {/* Order Header */}
              <div className="bg-muted/50 px-6 py-4 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {t("orderNumber", "Order")}:
                      </span>{" "}
                      <span className="font-mono font-medium">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <Badge
                        variant={getPaymentStatusBadge(order.payment_status)}
                        className="text-xs"
                      >
                        {order.payment_status === "paid"
                          ? t("paid", "Paid")
                          : t("unpaid", "Unpaid")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getStatusBadgeVariant(order.status)}
                      className="flex items-center gap-1.5"
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.product_data?.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-border/50"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.img || "/images/placeholder.png"}
                          alt={item.name}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/images/placeholder.png";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg truncate">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            {t("quantity", "Qty")}:{" "}
                            <span className="font-medium text-foreground">
                              {item.quantity}
                            </span>
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(item.amount, order.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <span className="text-muted-foreground">
                    {t("total", "Total")}
                  </span>
                  <span className="text-xl font-bold">
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to="/products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              {t("continueShopping", "Continue Shopping")}
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default MyOrdersPage;
