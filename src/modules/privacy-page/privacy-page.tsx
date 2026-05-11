import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Lock, UserCheck, Mail, FileText } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/modules/animations";

export function PrivacyPage() {
  const { t } = useTranslation("privacy-page");
  usePageTitle({ title: t("title") });

  const sections = [
    { icon: Eye, titleKey: "collectionTitle", contentKey: "collectionContent" },
    { icon: FileText, titleKey: "usageTitle", contentKey: "usageContent" },
    { icon: Lock, titleKey: "securityTitle", contentKey: "securityContent" },
    { icon: UserCheck, titleKey: "rightsTitle", contentKey: "rightsContent" },
    { icon: Shield, titleKey: "cookiesTitle", contentKey: "cookiesContent" },
    { icon: Mail, titleKey: "contactTitle", contentKey: "contactContent" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4">
          {/* Header */}
          <FadeIn className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">
              {t("lastUpdated")}: {t("updateDate")}
            </p>
          </FadeIn>

          {/* Introduction */}
          <FadeIn delay={0.1} className="max-w-4xl mx-auto mb-12">
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed">
                  {t("introduction")}
                </p>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Sections */}
          <StaggerContainer className="max-w-4xl mx-auto space-y-6">
            {sections.map(({ icon: Icon, titleKey, contentKey }, index) => (
              <StaggerItem key={titleKey}>
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-3">
                          {index + 1}. {t(titleKey)}
                        </h2>
                        <p className="text-muted-foreground">{t(contentKey)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Footer Note */}
          <FadeIn className="max-w-4xl mx-auto mt-12 text-center">
            <p className="text-sm text-muted-foreground">{t("footerNote")}</p>
          </FadeIn>
        </div>
      </div>
    </Layout>
  );
}

export default PrivacyPage;
