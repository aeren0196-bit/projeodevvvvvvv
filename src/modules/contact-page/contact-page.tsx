import React, { useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { useApiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import constants from "@/constants/constants.json";
import { FadeIn, SlideInLeft, SlideInRight } from "@/modules/animations";
import { FormFileInput } from "@/components/FormFileInput";
import { FormField } from "@/components/FormField";

const socialIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
};

export function ContactPage() {
  const { t } = useTranslation("contact-page");
  usePageTitle({ title: t("title") });

  const apiService = useApiService();

  const socialLinks = useMemo(() => {
    const socialMedia = constants.socialMedia as
      | Record<string, string>
      | undefined;
    if (!socialMedia) return [];
    return Object.entries(socialMedia)
      .filter(([platform, url]) => url && socialIcons[platform])
      .map(([platform, url]) => ({
        platform,
        url,
        Icon: socialIcons[platform],
      }));
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    attachments: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const fileMaxFiles = constants.file?.maxFiles || 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const currentLanguage = constants.site.defaultLanguage;

      await apiService.submitFormWithFile(
        formData,
        {
          email_subject1: "Thank you for contacting us",
          email_subject2: "New Contact Form Submission",
          fields: [
            { name: "name", required: true },
            { name: "email", required: true },
            { name: "phone", required: false },
            { name: "subject", required: false },
            { name: "message", required: true },
            { name: "attachments", required: false },
          ],
        },
        currentLanguage
      );

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        attachments: [],
      });

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error: unknown) {
      console.error("Form submission failed:", error);
      setSubmitStatus("error");

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    const remainingSlots = fileMaxFiles - formData.attachments.length;

    if (selectedFiles.length > remainingSlots) {
      alert(t("maxFilesLimit", { max: fileMaxFiles }));
      e.target.value = ''; // Clear the input value
      return;
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...selectedFiles]
    }));

    e.target.value = ''; // Clear the input
  }
  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="w-full max-w-[var(--container-max-width)] mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <FadeIn className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t("title")}
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t("description")}
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <SlideInLeft className="lg:col-span-1 space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    {t("getInTouch")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-foreground">
                        {t("email")}
                      </p>
                      <p className="text-muted-foreground">{constants.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("emailResponse")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-foreground">
                        {t("phone")}
                      </p>
                      <p className="text-muted-foreground">{constants.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-foreground">
                        {t("address")}
                      </p>
                      <div className="text-muted-foreground">
                        <p>{constants.address.line1}</p>
                        {constants.address.line2 && (
                          <p>{constants.address.line2}</p>
                        )}
                        <p>
                          {constants.address.city}, {constants.address.state}{" "}
                          {constants.address.postalCode}
                        </p>
                        {constants.address.country && (
                          <p>{constants.address.country}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  {socialLinks.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="font-medium text-foreground mb-3">
                        {t("followUs")}
                      </p>
                      <div className="flex gap-2">
                        {socialLinks.map(({ platform, url, Icon }) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 w-10 flex items-center justify-center rounded-md border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Support Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("needSupport")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {t("supportDescription")}
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {t("supportEmail")}
                    </p>
                    <p className="text-muted-foreground">{constants.email}</p>
                  </div>
                </CardContent>
              </Card>
            </SlideInLeft>

            {/* Contact Form */}
            <SlideInRight className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("sendMessage")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <FormField label={t("fullName")} htmlFor="name" required>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("fullNamePlaceholder")}
                        required
                        className="mt-1"
                      />
                    </FormField>
                    {/* Email */}
                    <FormField label={t("emailAddress")} htmlFor="email" required>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t("emailPlaceholder")}
                        required
                        className="mt-1"
                      />
                    </FormField>
                    {/* Phone */}
                    <FormField label={t("phoneNumber")} htmlFor="phone">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t("phonePlaceholder")}
                        className="mt-1"
                      />
                    </FormField>
                    {/* Subject */}
                    <FormField label={t("subject")} htmlFor="subject" >
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder={t("subjectPlaceholder")}
                        className="mt-1"
                      />
                    </FormField>
                    {/* Message */}
                    <FormField label={t("message")} htmlFor="message" required>
                    <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t("messagePlaceholder")}
                        required
                        rows={6}
                        className="mt-1 resize-none"
                      />
                    </FormField>
                    <FormFileInput
                      files={formData.attachments}
                      onFilesChange={handleFileUploadChange}
                      handleRemoveFile={handleRemoveFile}
                      maxFiles={constants.file?.maxFiles || 5}
                      accept={constants.file?.accept || ".pdf,.doc,.docx,.jpg,.jpeg,.png"}
                      disabled={isSubmitting}
                      uploadButtonText={t("addFiles")}
                      maxFilesReachedText={t("maxFilesReached")}
                    />

                    {submitStatus === "success" && (
                      <div className="p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 rounded-lg">
                        <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                          {t("success")}
                        </p>
                      </div>
                    )}

                    {submitStatus === "error" && (
                      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                        <p className="text-destructive text-sm font-medium">
                          {t("error")}
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          {t("sending")}
                        </>
                      ) : (
                        t("submit")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </SlideInRight>
          </div>

          {/* Google Maps */}
          <div className="mt-10 rounded-2xl overflow-hidden shadow-md border border-gray-200">
            <iframe
              title="CardDünyası Konum"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6!2d29.0282!3d40.9897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7a0a0a0a0a1%3A0x0!2sCafera%C4%9Fa%2C%20Moda%20Cd.%208%2F3%2C%2034710%20Kad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str&q=Caferağa+Mahallesi+Kadıköy+İstanbul"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ContactPage;
