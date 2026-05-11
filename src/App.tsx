import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MetriaAnalytics } from "@/components/MetriaAnalytics";
import { ScriptInjector } from "@/components/ScriptInjector";
import { AppDbProvider } from "@/db";
import { Router } from "./router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { customerClient } from "./modules/api";

const App = () => {
  const {
    i18n: { language },
  } = useTranslation();

  useEffect(() => {
    customerClient.setLanguage(language);
  }, [language]);

  return (
    <AppDbProvider>
      <TooltipProvider>
        <GoogleAnalytics />
        <MetriaAnalytics />
        <ScriptInjector />
        <Router />
      </TooltipProvider>
    </AppDbProvider>
  );
};

export default App;
