import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  ArrowLeft,
  Clock,
  AlertCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/modules/ecommerce-core";
import { customerClient } from "@/modules/api";
import constants from "@/constants/constants.json";

interface CheckoutData {
  items: any[];
  total: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentProvider: string;
}

interface OrderData {
  id: string;
  payment_status: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  product_data: {
    quantity: number;
    name: string;
    description: string;
    amount: number;
    img: string;
    optionals: Record<string, unknown> | null;
  }[];
  created_at: string;
}

export function OrderConfirmationPage() {
  const { t } = useTranslation("order-confirmation-page");
  usePageTitle({ title: t("title", "Order Confirmation") });

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const currency = (constants as any).site?.currency || "USD";

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(!!sessionId);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Load checkout data from localStorage
    const savedData = localStorage.getItem("pending_checkout");
    if (savedData) {
      try {
        setCheckoutData(JSON.parse(savedData));
        // Clear after loading
        localStorage.removeItem("pending_checkout");
      } catch {
        // Ignore parse errors
      }
    }

    // Fetch order data from backend if we have a session ID
    if (sessionId) {
      fetchOrderData(sessionId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchOrderData = async (sid: string) => {
    setIsLoading(true);
    setStatusError(null);

    try {
      const response = await customerClient.orders.getBySessionId({ sessionId: sid });
      setOrderData(response as OrderData);
    } catch (error: any) {
      setStatusError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                <h1 className="text-2xl font-bold mb-2">
                  {t("loading", "Loading Order...")}
                </h1>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // No data available at all
  if (!checkoutData && !orderData) {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">
                  {t("orderNotFound", "Order Not Found")}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "orderNotFoundDescription",
                    "We couldn't find the order details. Please check your email for confirmation."
                  )}
                </p>
                <Button asChild>
                  <Link to="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t("continueShopping", "Continue Shopping")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Derive display values from either backend data or localStorage
  const paymentMethod = checkoutData?.paymentMethod || orderData?.payment_method || "";
  const paymentProvider = checkoutData?.paymentProvider || orderData?.payment_method || "";
  const total = orderData ? orderData.total_amount / 100 : (checkoutData?.total || 0);
  const displayCurrency = orderData?.currency?.toUpperCase() || currency;
  const customerInfo = checkoutData?.customerInfo || null;

  // Use backend product data if available, otherwise fall back to localStorage
  const items = orderData?.product_data || checkoutData?.items || [];
  const isBackendData = !!orderData?.product_data;

  const paymentStatus = orderData?.payment_status || null;

  const getPaymentMethodDisplay = () => {
    if (paymentProvider === "cash_on_delivery" || paymentMethod === "cash") {
      return {
        icon: <Truck className="w-4 h-4 text-green-600" />,
        label: t("cashOnDelivery", "Cash on Delivery"),
      };
    }
    if (paymentProvider === "bank_transfer" || paymentMethod === "transfer") {
      return {
        icon: <CreditCard className="w-4 h-4 text-primary" />,
        label: t("bankTransfer", "Bank Transfer"),
      };
    }
    return {
      icon: <CreditCard className="w-4 h-4 text-blue-600" />,
      label: t("creditCard", "Credit Card"),
    };
  };

  const paymentDisplay = getPaymentMethodDisplay();

  return (
    <Layout>
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {t("title", "Order Confirmed!")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "thankYou",
                "Thank you for your order! We've received your order and will process it shortly."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t("orderInformation", "Order Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orderData?.id && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("orderId", "Order ID")}
                        </p>
                        <p className="font-semibold font-mono">#{orderData.id.slice(0, 12)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("orderDate", "Order Date")}
                      </p>
                      <p className="font-semibold">
                        {orderData?.created_at
                          ? new Date(orderData.created_at).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("totalAmount", "Total Amount")}
                      </p>
                      <p className="font-semibold text-lg">
                        {formatPrice(total, displayCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("paymentMethod", "Payment Method")}
                      </p>
                      <div className="flex items-center gap-2">
                        {paymentDisplay.icon}
                        <span className="font-semibold">{paymentDisplay.label}</span>
                      </div>
                    </div>
                    {sessionId && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("paymentStatus", "Payment Status")}
                        </p>
                        <div className="flex items-center gap-2">
                          {statusError ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {t("statusError", "Error")}
                            </Badge>
                          ) : paymentStatus === "paid" ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {t("paymentSucceeded", "Paid")}
                            </Badge>
                          ) : paymentStatus === "processing" ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {t("processing", "Processing")}
                            </Badge>
                          ) : paymentStatus === "requires_payment_method" ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {t("requiresPayment", "Requires Payment")}
                            </Badge>
                          ) : paymentStatus ? (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {paymentStatus}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("orderStatus", "Order Status")}
                      </p>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        {t("pending", "Pending")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info - only show if we have customer info from localStorage */}
              {customerInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("deliveryInformation", "Delivery Information")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-semibold">
                        {customerInfo.firstName} {customerInfo.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{customerInfo.email}</p>
                      <p className="text-sm text-muted-foreground">{customerInfo.phone}</p>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("address", "Address")}:
                        </p>
                        <p className="text-sm">{customerInfo.address}</p>
                        <p className="text-sm">
                          {customerInfo.city} {customerInfo.postalCode}
                        </p>
                      </div>
                      {customerInfo.notes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("notes", "Notes")}:
                          </p>
                          <p className="text-sm">{customerInfo.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("orderItems", "Order Items")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item: any, index: number) => (
                      <div key={item.id || index} className="flex gap-4">
                        <img
                          src={
                            isBackendData
                              ? item.img || "/images/placeholder.png"
                              : item.product?.images?.[0] || "/images/placeholder.png"
                          }
                          alt={isBackendData ? item.name : item.product?.name || "Product"}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {isBackendData ? item.name : item.product?.name}
                          </h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm">
                              {t("qty", "Qty")}: {item.quantity}
                            </span>
                            <span className="font-semibold">
                              {isBackendData
                                ? formatPrice(item.amount / 100, displayCurrency)
                                : formatPrice(
                                    (item.product?.on_sale
                                      ? item.product?.sale_price
                                      : item.product?.price) * item.quantity,
                                    displayCurrency
                                  )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t("total", "Total")}</span>
                    <span>{formatPrice(total, displayCurrency)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Bank Transfer Instructions */}
              {(paymentProvider === "bank_transfer" || paymentMethod === "transfer") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("paymentInstructions", "Payment Instructions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-2">
                        {t("bankTransferDetails", "Bank Transfer Details")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "bankDetailsEmail",
                          "Bank details will be sent via email. Please complete the transfer within 48 hours."
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cash on Delivery Info */}
              {(paymentProvider === "cash_on_delivery" || paymentMethod === "cash") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("deliveryPayment", "Payment on Delivery")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        {t("cashOnDeliveryInfo", "Cash on Delivery")}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {t(
                          "codInstructions",
                          "Pay when your order arrives. Our delivery team will contact you before delivery."
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Button asChild className="w-full">
                    <Link to="/products">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {t("continueShopping", "Continue Shopping")}
                    </Link>
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t("backToHome", "Back to Home")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default OrderConfirmationPage;
