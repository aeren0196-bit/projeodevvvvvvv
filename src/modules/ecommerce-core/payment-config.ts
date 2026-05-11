// Payment configuration utility
// Parses environment variables and provides payment method configuration

export type PaymentMethod = "card" | "transfer" | "cash";
export type OnlinePaymentProvider = "stripe" | "iyzico";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string; // Icon component name from lucide-react
  requiresOnlineProvider?: boolean;
}

// Parse comma-separated env variable into array
const parseEnvArray = (envVar: string | undefined): string[] => {
  if (!envVar) return [];
  return envVar.split(",").map((item) => item.trim()).filter(Boolean);
};

// Get available payment methods from environment
export const getAvailablePaymentMethods = (): PaymentMethod[] => {
  const methods = parseEnvArray(import.meta.env.VITE_AVAILABLE_PAYMENT_METHODS);
  if (methods.length === 0) {
    // Default to all methods if not configured
    return ["card", "transfer", "cash"];
  }
  return methods as PaymentMethod[];
};

// Get available online payment providers from environment
export const getOnlinePaymentProviders = (): OnlinePaymentProvider[] => {
  const providers = parseEnvArray(import.meta.env.VITE_ONLINE_PAYMENT_METHODS);
  if (providers.length === 0) {
    // Default to stripe if not configured
    return ["stripe"];
  }
  return providers as OnlinePaymentProvider[];
};

// Payment method configurations with display information
export const PAYMENT_METHOD_CONFIGS: Record<PaymentMethod, PaymentMethodConfig> = {
  card: {
    id: "card",
    label: "Credit/Debit Card",
    description: "Pay securely with your credit or debit card",
    icon: "CreditCard",
    requiresOnlineProvider: true,
  },
  transfer: {
    id: "transfer",
    label: "Bank Transfer",
    description: "Transfer payment to our bank account",
    icon: "Banknote",
  },
  cash: {
    id: "cash",
    label: "Cash on Delivery",
    description: "Pay when your order arrives at your doorstep",
    icon: "Truck",
  },
};

// Online payment provider configurations
export const ONLINE_PROVIDER_CONFIGS: Record<OnlinePaymentProvider, { label: string; description: string }> = {
  stripe: {
    label: "Stripe",
    description: "Secure payment processing by Stripe",
  },
  iyzico: {
    label: "iyzico",
    description: "Secure payment processing by iyzico",
  },
};

// Check if a payment method is available
export const isPaymentMethodAvailable = (method: PaymentMethod): boolean => {
  const available = getAvailablePaymentMethods();
  return available.includes(method);
};

// Check if an online provider is available
export const isOnlineProviderAvailable = (provider: OnlinePaymentProvider): boolean => {
  const available = getOnlinePaymentProviders();
  return available.includes(provider);
};

// Get filtered payment method configs (only available ones)
export const getFilteredPaymentMethodConfigs = (): PaymentMethodConfig[] => {
  const availableMethods = getAvailablePaymentMethods();
  return availableMethods
    .map((method) => PAYMENT_METHOD_CONFIGS[method])
    .filter(Boolean);
};
