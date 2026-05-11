import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, CreditCard, Banknote, Truck, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";
import { toast } from "sonner";
import {
  useCart,
  formatPrice,
  type PaymentMethod,
  type OnlinePaymentProvider,
  getFilteredPaymentMethodConfigs,
  getOnlinePaymentProviders,
  ONLINE_PROVIDER_CONFIGS,
} from "@/modules/ecommerce-core";
import { customerClient, getErrorMessage } from "@/modules/api";
import constants from "@/constants/constants.json";
import { FadeIn } from "@/modules/animations";
import { FormField } from "@/components/FormField";

interface Country {
  value: string;
  label: string;
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

interface BankTransferInfo {
  bank_name: string;
  bank_account_name: string;
  iban: string;
}

const DEFAULT_COUNTRIES: Country[] = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "TR", label: "Turkey" },
  { value: "JP", label: "Japan" },
];

export function CheckoutPage() {
  const { t } = useTranslation("checkout-page");
  usePageTitle({ title: t("pageTitle", "Checkout") });
  const { state, clearCart } = useCart();
  const { items, total } = state;

  const currency = (constants as any).site?.currency || "USD";
  const taxRate = (constants as any).payments?.taxRate || 0;
  const freeShippingThreshold = (constants as any).payments?.freeShippingThreshold || 0;
  const shippingCost = (constants as any).shipping?.domesticShipping?.standard?.cost || 0;

  // Calculate shipping and tax
  const shipping = total >= freeShippingThreshold ? 0 : shippingCost;
  const tax = total * taxRate;

  const countries = DEFAULT_COUNTRIES;

  // Get available payment methods and providers from config
  const availablePaymentMethods = getFilteredPaymentMethodConfigs();
  const availableProviders = getOnlinePaymentProviders();

  const getProductPrice = (product: {
    price: number;
    sale_price?: number;
    on_sale?: boolean;
  }) => {
    return product.on_sale && product.sale_price
      ? product.sale_price
      : product.price;
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    availablePaymentMethods[0]?.id || "card"
  );
  const [selectedProvider, setSelectedProvider] = useState<OnlinePaymentProvider>(
    availableProviders[0] || "stripe"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Bank transfer info state
  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [isBankInfoLoading, setIsBankInfoLoading] = useState(false);
  const [bankInfoError, setBankInfoError] = useState<string | null>(null);

  const finalTotal = total + shipping + tax;

  // Fetch bank info when transfer is selected
  useEffect(() => {
    if (paymentMethod === "transfer") {
      const fetchBankInfo = async () => {
        setIsBankInfoLoading(true);
        setBankInfoError(null);
        try {
          const info = await customerClient.payment.getBankTransferInfo();
          setBankInfo(info);
        } catch (err: any) {
          setBankInfoError(
            err.message || t("bankInfoError", "Failed to load bank information")
          );
        } finally {
          setIsBankInfoLoading(false);
        }
      };
      fetchBankInfo();
    }
  }, [paymentMethod, t]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error(t("agreeToTermsError", "Please agree to the terms and conditions"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Determine payment type based on selection
      let paymentType: "stripe" | "iyzico" | "bank_transfer" | "cash_on_delivery";

      if (paymentMethod === "card") {
        paymentType = selectedProvider;
      } else if (paymentMethod === "transfer") {
        paymentType = "bank_transfer";
      } else {
        paymentType = "cash_on_delivery";
      }

      // Save checkout data to localStorage for success page
      const checkoutData = {
        items: items,
        total: finalTotal,
        customerInfo: formData,
        paymentMethod,
        paymentProvider: paymentType,
      };
      localStorage.setItem("pending_checkout", JSON.stringify(checkoutData));

      // Build product data for checkout
      const productData = items.map((item) => {
        const price = getProductPrice(item.product);
        const qty = item.quantity || 1;

        return {
          quantity: qty,
          name: item.product.name || "Product",
          description: item.product.description || item.product.name || "Product",
          amount: Math.round(price * 100), // Convert to cents
          img: item.product.images?.[0] || "/images/placeholder.png",
          optionals: {
            productId: item.product.id,
          },
        };
      });

      // Tax amount in cents
      const taxAmountInCents = tax && !isNaN(tax) ? Math.round(tax * 100) : undefined;

      // Create checkout session
      const response = await customerClient.payment.createCheckout({
        currency: currency.toLowerCase(),
        taxAmount: taxAmountInCents,
        paymentType: paymentType,
        db: "local",
        productData,
        contactData: {
          firstname: formData.firstName,
          lastname: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingData: {
          address: formData.address,
          country: formData.country,
          city: formData.city,
          zip: formData.postalCode,
        },
      });

      // Clear cart and redirect to payment URL or confirmation page
      clearCart();
      if (response.url) {
        window.location.href = response.url;
      } else {
        window.location.href = `/order-confirmation?session_id=${response.sessionId}`;
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, t("orderError", "Failed to place order. Please try again."));
      setError(errorMessage);
      toast.error(t("orderErrorTitle", "Order Failed"), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get icon component based on payment method
  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case "CreditCard":
        return CreditCard;
      case "Banknote":
        return Banknote;
      case "Truck":
        return Truck;
      default:
        return CreditCard;
    }
  };

  // Get icon color based on payment method
  const getIconColor = (methodId: string) => {
    switch (methodId) {
      case "card":
        return "text-blue-600";
      case "transfer":
        return "text-primary";
      case "cash":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-primary";
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">
              {t("cartEmpty", "Your cart is empty")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t(
                "cartEmptyDescription",
                "Please add items to your cart before proceeding to checkout."
              )}
            </p>
            <Button asChild>
              <Link to="/products">
                {t("continueShopping", "Continue Shopping")}
              </Link>
            </Button>
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
            <Link to="/cart">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("title", "Checkout")}</h1>
            <p className="text-muted-foreground">
              {t("completeOrder", "Complete your order")}
            </p>
          </div>
        </FadeIn>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <FadeIn delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("contactInformation", "Contact Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label={t("firstName", "First Name")} htmlFor="firstName" required>
                      <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </FormField>
                   <FormField label={t("lastName", "Last Name")} htmlFor="lastName" required>
                   <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                   </FormField>
                    </div>
                    <FormField label={t("email", "Email Address")} htmlFor="email" required>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </FormField>
                    <FormField label={t("phone", "Phone Number")} htmlFor="phone" required>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </FormField>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Shipping Address */}
              <FadeIn delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("shippingAddress", "Shipping Address")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">{t("address", "Address")} *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder={t(
                          "addressPlaceholder",
                          "Street address, apartment, suite, etc."
                        )}
                        required
                      />
                    </div>
                    <FormField label={t("country", "Country")} htmlFor="country" required>
                    <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, country: value }))
                        }
                        required
                      >
                        <SelectTrigger id="country">
                          <SelectValue
                            placeholder={t("selectCountry", "Select a country")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label={t("city", "City")} htmlFor="city" required>
                      <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </FormField>
                      <FormField label={t("postalCode", "Postal Code")} htmlFor="postalCode" required>
                      <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Payment Method */}
              <FadeIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("paymentMethod", "Payment Method")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value as PaymentMethod)
                      }
                      className="space-y-4"
                    >
                      {availablePaymentMethods.map((method) => {
                        const IconComponent = getPaymentIcon(method.icon);
                        const iconColor = getIconColor(method.id);

                        return (
                          <div
                            key={method.id}
                            className="flex items-center space-x-2 p-4 border rounded-lg"
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label
                              htmlFor={method.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent
                                  className={`h-5 w-5 ${iconColor}`}
                                />
                                <div>
                                  <div className="font-medium">
                                    {t(method.id, method.label)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {t(`${method.id}Description`, method.description)}
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {/* Bank Transfer Details */}
                    {paymentMethod === "transfer" && (
                      <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <h4 className="font-medium mb-2">
                          {t("bankTransferDetailsTitle", "Bank Transfer Details")}:
                        </h4>
                        {isBankInfoLoading ? (
                          <div className="text-sm space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ) : bankInfoError ? (
                          <p className="text-sm text-red-600">{bankInfoError}</p>
                        ) : bankInfo ? (
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>{t("bank", "Bank")}:</strong> {bankInfo.bank_name}
                            </p>
                            <p>
                              <strong>{t("accountName", "Account Name")}:</strong>{" "}
                              {bankInfo.bank_account_name}
                            </p>
                            <p>
                              <strong>IBAN:</strong> {bankInfo.iban}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("bankInfoNotAvailable", "Bank account information not available")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Card Payment - Provider Selection */}
                    {paymentMethod === "card" && availableProviders.length > 1 && (
                      <div className="mt-4 space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                            {t("selectPaymentProvider", "Select Payment Provider")}
                          </h4>
                          <RadioGroup
                            value={selectedProvider}
                            onValueChange={(value) =>
                              setSelectedProvider(value as OnlinePaymentProvider)
                            }
                            className="space-y-2"
                          >
                            {availableProviders.map((provider) => (
                              <div
                                key={provider}
                                className="flex items-center space-x-2 p-3 bg-background rounded border"
                              >
                                <RadioGroupItem
                                  value={provider}
                                  id={`provider-${provider}`}
                                />
                                <Label
                                  htmlFor={`provider-${provider}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">
                                    {t(`provider_${provider}_label`, ONLINE_PROVIDER_CONFIGS[provider].label)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {t(`provider_${provider}_description`, ONLINE_PROVIDER_CONFIGS[provider].description)}
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
                            {t(
                              "creditCardRedirectNote",
                              "You will be redirected to the secure payment page to complete your purchase."
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Order Notes */}
              <FadeIn delay={0.4}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("orderNotesOptional", "Order Notes (Optional)")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder={t(
                        "orderNotesPlaceholder",
                        "Special instructions for your order..."
                      )}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Order Summary */}
            <FadeIn delay={0.2} className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("orderSummary", "Order Summary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={
                            item.product.images?.[0] ||
                            "/images/placeholder.png"
                          }
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-medium leading-normal">
                            {item.product.name}
                          </h4>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t("qty", "Qty")}: {item.quantity}
                            </span>
                            <span>
                              {formatPrice(
                                getProductPrice(item.product) * item.quantity,
                                currency
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t("subtotal", "Subtotal")}</span>
                      <span>{formatPrice(total, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("shipping", "Shipping")}</span>
                      <span>
                        {shipping === 0
                          ? t("free", "Free")
                          : formatPrice(shipping, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("tax", "Tax")}</span>
                      <span>{formatPrice(tax, currency)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t("total", "Total")}</span>
                    <span>{formatPrice(finalTotal, currency)}</span>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) =>
                        setAgreedToTerms(checked as boolean)
                      }
                    />
                    <span className="text-sm">
                      {t("agreeToTermsTextBefore", "I agree to the")}{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline"
                      >
                        {t("termsOfService", "Terms of Service")}
                      </Link>{" "}
                      {t("and", "and")}{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:underline"
                      >
                        {t("privacyPolicy", "Privacy Policy")}
                      </Link>
                      </span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!agreedToTerms || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        {t("processing", "Processing...")}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {paymentMethod === "card"
                          ? t("proceedToPayment", "Proceed to Payment")
                          : t("placeOrder", "Place Order")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default CheckoutPage;
