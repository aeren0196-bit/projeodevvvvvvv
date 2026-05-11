import { useState } from "react";
import { useDbList, useDbCreate } from "@/db";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-gray-500"
          }`}
        />
      ))}
    </div>
  );
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`${starValue} yıldız`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                isActive
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-500"
              }`}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value === 1 && "Çok Kötü"}
          {value === 2 && "Kötü"}
          {value === 3 && "Orta"}
          {value === 4 && "İyi"}
          {value === 5 && "Mükemmel"}
        </span>
      )}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: {
    id: number;
    product_name: string;
    reviewer_name: string;
    rating: number;
    review_text: string;
    created_at: string;
  };
}) {
  const formattedDate = (() => {
    try {
      return new Date(review.created_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return review.created_at;
    }
  })();

  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
      data-db-table="product_reviews"
      data-db-id={review.id}
    >
      {/* Ürün adı */}
      <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit" data-db-field="product_name">
        {review.product_name}
      </span>

      {/* Yıldızlar */}
      <StarRating rating={review.rating} />

      {/* Yorum metni */}
      <p className="text-foreground text-sm leading-relaxed flex-1" data-db-field="review_text">
        "{review.review_text}"
      </p>

      {/* Alt bilgi */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm font-semibold text-foreground" data-db-field="reviewer_name">
          {review.reviewer_name}
        </span>
        <span className="text-xs text-muted-foreground" data-db-field="created_at">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export function ProductReviewsSection() {
  const { data: reviews, isLoading } = useDbList("product_reviews", {
    orderBy: [{ field: "created_at", direction: "DESC" }],
  });

  const { mutate: createReview } = useDbCreate("product_reviews");

  const [formData, setFormData] = useState({
    product_name: "",
    reviewer_name: "",
    rating: 0,
    review_text: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.product_name.trim() || !formData.reviewer_name.trim() || !formData.review_text.trim()) {
      return;
    }
    if (formData.rating === 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const today = new Date().toISOString().split("T")[0];
      createReview({
        product_name: formData.product_name.trim(),
        reviewer_name: formData.reviewer_name.trim(),
        rating: formData.rating,
        review_text: formData.review_text.trim(),
        created_at: today,
      });
      setSubmitStatus("success");
      setFormData({ product_name: "", reviewer_name: "", rating: 0, review_text: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background" id="urun-yorumlari">
      <div className="container mx-auto px-4">
        {/* Başlık */}
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Müşteri Yorumları
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ürün Yorumları
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Müşterilerimizin satın aldıkları ürünler hakkındaki gerçek yorumları
          </p>
        </div>

        {/* Yorum Kartları */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 h-48 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {(reviews ?? []).map((review) => (
              <div key={review.id} className="contents">
                <ReviewCard review={review as any} />
              </div>
            ))}
          </div>
        )}

        {/* Yorum Formu */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Yorum Yap
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Satın aldığınız ürün hakkında deneyiminizi paylaşın
            </p>

            {submitStatus === "success" && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
                ✓ Yorumunuz başarıyla gönderildi! Teşekkür ederiz.
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
                Bir hata oluştu. Lütfen tekrar deneyin.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ürün Adı */}
              <div className="space-y-1.5">
                <Label htmlFor="product_name" className="text-foreground font-medium">
                  Ürün Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  placeholder="Örn: Charizard ex, Booster Box..."
                  required
                  className="bg-background border-border focus:border-primary"
                />
              </div>

              {/* İsim */}
              <div className="space-y-1.5">
                <Label htmlFor="reviewer_name" className="text-foreground font-medium">
                  Adınız <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reviewer_name"
                  name="reviewer_name"
                  value={formData.reviewer_name}
                  onChange={handleChange}
                  placeholder="Adınız ve soyadınızın baş harfi"
                  required
                  className="bg-background border-border focus:border-primary"
                />
              </div>

              {/* Yıldız Seçimi */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-medium">
                  Puanınız <span className="text-red-500">*</span>
                </Label>
                <InteractiveStarRating
                  value={formData.rating}
                  onChange={(r) => setFormData((prev) => ({ ...prev, rating: r }))}
                />
                {formData.rating === 0 && (
                  <p className="text-xs text-muted-foreground">Lütfen bir puan seçin</p>
                )}
              </div>

              {/* Yorum Metni */}
              <div className="space-y-1.5">
                <Label htmlFor="review_text" className="text-foreground font-medium">
                  Yorumunuz <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="review_text"
                  name="review_text"
                  value={formData.review_text}
                  onChange={handleChange}
                  placeholder="Ürün hakkındaki deneyiminizi paylaşın..."
                  rows={4}
                  required
                  className="bg-background border-border focus:border-primary resize-none"
                />
              </div>

              {/* Gönder Butonu */}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  formData.rating === 0 ||
                  !formData.product_name.trim() ||
                  !formData.reviewer_name.trim() ||
                  !formData.review_text.trim()
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Gönderiliyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Yorum Gönder
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
