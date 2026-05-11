import {
  createClient,
  type ApiClient,
} from "@promakeai/customer-backend-client";
import enValidation from "./validation/en.json";
import trValidation from "./validation/tr.json";

const customerClient = createClient({
  baseURL: `https://${import.meta.env.VITE_TENANT_UUID}.backend.promake.ai/`,
  messages: {
    en: enValidation,
    tr: trValidation,
  },
  defaultLanguage: "en",
});

export { customerClient };
export type { ApiClient };
