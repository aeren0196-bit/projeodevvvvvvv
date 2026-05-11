import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function CtaSection() {
  const { t } = useTranslation("cta-section");

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          {t("title", "Ready to Start Your Project?")}
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
          {t(
            "description",
            "Let's discuss your needs and create a solution that drives results for your business."
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-3 text-lg"
            asChild
          >
            <Link to="/contact">{t("primaryButton", "Get Free Quote")}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3 text-lg border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary transition-all duration-300"
            asChild
          >
            <Link to="/about" className="text-primary-foreground hover:text-primary">
              {t("secondaryButton", "Learn About Us")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
