import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import constants from "@/constants/constants.json";

// Auto-import translations from two locations:
// 1. Core: @/lang/{lang}/{namespace}.json (e.g., lang/en/header.json)
// 2. Modules: @/modules/{namespace}/lang/{lang}.json (e.g., modules/about-page/lang/en.json)
const coreLangs = import.meta.glob("@/lang/*/*.json", { eager: true });
const moduleLangs = import.meta.glob("@/modules/*/lang/*.json", { eager: true });

// Get available languages from config
const availableLanguages =
  Object.keys(constants?.site?.availableLanguages || {}) || [];

// Build resources object: { en: { header: {...}, about-page: {...} }, tr: {...} }
const resources: Record<string, Record<string, any>> = {};

// Process core translations: /lang/{lang}/{namespace}.json
Object.entries(coreLangs).forEach(([path, module]) => {
  const match = path.match(/\/lang\/([^/]+)\/([^/]+)\.json$/);
  if (match) {
    const [, lang, namespace] = match;
    if (!availableLanguages.includes(lang)) return;
    if (!resources[lang]) resources[lang] = {};
    resources[lang][namespace] = (module as any).default || module;
  }
});

// Process module translations: /modules/{namespace}/lang/{lang}.json
Object.entries(moduleLangs).forEach(([path, module]) => {
  const match = path.match(/\/modules\/([^/]+)\/lang\/([^/]+)\.json$/);
  if (match) {
    const [, namespace, lang] = match;
    if (!availableLanguages.includes(lang)) return;
    if (!resources[lang]) resources[lang] = {};
    const moduleData = (module as any).default || module;
    resources[lang][namespace] = {
      ...moduleData,
      ...resources[lang][namespace],
    };
  }
});

// Custom detector for cached settings
const settingsDetector = {
  name: "settingsDetector",
  lookup() {
    if (constants.site.overrideBrowserLanguage) {
      return constants?.site?.defaultLanguage;
    }
    return undefined;
  },
  cacheUserLanguage() {
    // Don't cache - settings detector is read-only
  },
};

// Create detector instance and add custom detector
const languageDetector = new LanguageDetector();
languageDetector.addDetector(settingsDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: constants?.site?.defaultLanguage || "en",
    supportedLngs: availableLanguages,
    detection: {
      // Priority: localStorage > settings > browser
      order: ["localStorage", "settingsDetector", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Helper to change language and persist to localStorage
export const changeLanguage = (lang: string) => {
  if (availableLanguages.includes(lang)) {
    i18n.changeLanguage(lang);
  }
};

export { availableLanguages };
export default i18n;
