import { useState } from "react";
import { useApiService } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Send, Package, Shield, Zap } from "lucide-react";

export function SellCardSection() {
  const { t, i18n } = useTranslation("sell-card");
  const apiService = useApiService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    card_name: "",
    set_name: "",
    condition: "",
    quantity: "1",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await apiService.submitFormWithFile(
        formData,
        {
          email_subject1: "Kart Satış Talebiniz Alındı — CardDünyası",
          email_subject2: "Yeni Kart Satış Talebi",
          fields: [
            { name: "name", required: true },
            { name: "email", required: true },
            { name: "phone", required: false },
            { name: "card_name", required: true },
            { name: "set_name", required: false },
            { name: "condition", required: true },
            { name: "quantity", required: true },
            { name: "message", required: false },
          ],
        },
        i18n.language
      );
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        card_name: "",
        set_name: "",
        condition: "",
        quantity: "1",
        message: "",
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      icon: Send,
      title: t("step1Title", "Formu Doldur"),
      desc: t("step1Desc", "Kart bilgilerini ve iletişim bilgilerini gir"),
    },
    {
      icon: Shield,
      title: t("step2Title", "Değerlendirme"),
      desc: t("step2Desc", "24 saat içinde fiyat teklifimizi iletiyoruz"),
    },
    {
      icon: Zap,
      title: t("step3Title", "Hızlı Ödeme"),
      desc: t("step3Desc", "Anlaşma sağlanınca anında ödeme yapıyoruz"),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#1A1A2E]" id="karti-sat">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-yellow-400/20 text-yellow-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            {t("badge", "Kart Alım Servisi")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("title", "Kartını Sat")}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            {t("subtitle", "Koleksiyonundaki kartları adil fiyata satın alıyoruz. Hızlı değerlendirme, güvenli ödeme.")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/10 border border-yellow-400/30">
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="w-7 h-7 rounded-full bg-yellow-400 text-[#1A1A2E] font-bold text-sm flex items-center justify-center mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-white/50">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white/10 border border-yellow-400/40 rounded-2xl p-8 shadow-lg shadow-yellow-400/10">
          {submitStatus === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {t("successTitle", "Talebiniz Alındı!")}
              </h3>
              <p className="text-white/60">
                {t("successDesc", "24 saat içinde e-posta ile size dönüş yapacağız.")}
              </p>
              <Button
                className="mt-6 bg-yellow-400 text-[#1A1A2E] hover:bg-yellow-300 font-semibold"
                onClick={() => setSubmitStatus("idle")}
              >
                {t("newRequest", "Yeni Talep Gönder")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm">{t("nameLabel", "Adınız")} *</Label>
                  <Input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("namePlaceholder", "Adınız Soyadınız")}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm">{t("emailLabel", "E-posta")} *</Label>
                  <Input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("emailPlaceholder", "ornek@email.com")}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm">{t("phoneLabel", "Telefon")}</Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("phonePlaceholder", "+90 5XX XXX XX XX")}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm">{t("quantityLabel", "Adet")} *</Label>
                  <Input
                    name="quantity"
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm">{t("cardNameLabel", "Kart Adı")} *</Label>
                  <Input
                    name="card_name"
                    required
                    value={formData.card_name}
                    onChange={handleChange}
                    placeholder={t("cardNamePlaceholder", "örn: Charizard ex")}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm">{t("setNameLabel", "Set Adı")}</Label>
                  <Input
                    name="set_name"
                    value={formData.set_name}
                    onChange={handleChange}
                    placeholder={t("setNamePlaceholder", "örn: Scarlet & Violet")}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm">{t("conditionLabel", "Kondisyon")} *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) => handleSelectChange("condition", v)}
                  required
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400">
                    <SelectValue placeholder={t("conditionPlaceholder", "Kondisyon seçin")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mint">{t("condMint", "Mint — Mükemmel")}</SelectItem>
                    <SelectItem value="Near Mint">{t("condNearMint", "Near Mint — Neredeyse Mükemmel")}</SelectItem>
                    <SelectItem value="Excellent">{t("condExcellent", "Excellent — Çok İyi")}</SelectItem>
                    <SelectItem value="Good">{t("condGood", "Good — İyi")}</SelectItem>
                    <SelectItem value="Played">{t("condPlayed", "Played — Oynanmış")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm">{t("messageLabel", "Ek Notlar")}</Label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("messagePlaceholder", "Kart hakkında ek bilgi, özel durum vs.")}
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400 resize-none"
                />
              </div>

              {submitStatus === "error" && (
                <p className="text-red-400 text-sm text-center">
                  {t("errorMsg", "Bir hata oluştu. Lütfen tekrar deneyin.")}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 text-[#1A1A2E] hover:bg-yellow-300 font-bold py-3 text-base"
              >
                {isSubmitting ? t("sending", "Gönderiliyor...") : t("submitBtn", "Teklif Al")}
              </Button>

              <p className="text-center text-xs text-white/40">
                {t("privacyNote", "Bilgileriniz yalnızca değerlendirme amacıyla kullanılır.")}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
