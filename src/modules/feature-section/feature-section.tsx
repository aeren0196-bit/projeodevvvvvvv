import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function FeatureSection() {
  const { t } = useTranslation("feature-section");

  return (
    <section className="py-20 bg-muted/30">
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
              {t("heading", "Your Business Title Here")}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t(
                "description",
                "This is where your main business description will appear. Ask Promake to customize this content based on your specific industry and services."
              )}
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-foreground">
                  {t("feature1", "Key feature or benefit #1")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-foreground">
                  {t("feature2", "Key feature or benefit #2")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-foreground">
                  {t("feature3", "Key feature or benefit #3")}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button asChild>
                <Link to="/about">{t("primaryButton", "Learn More")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">{t("secondaryButton", "Get Started")}</Link>
              </Button>
            </div>
          </div>
          <div>
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl overflow-hidden">
              <img
                src="/images/placeholder.png"
                alt={t("imageAlt", "Business Solutions")}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
