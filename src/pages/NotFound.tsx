import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";

const isDev = import.meta.env.MODE === "development";

const NotFound = () => {
  const { t } = useTranslation("notfound");

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {!isDev && (
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          )}
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {isDev ? t("pageNotFoundDev") : t("pageNotFound")}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            {isDev ? t("descriptionDev") : t("description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link to="/">{t("goHome")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
