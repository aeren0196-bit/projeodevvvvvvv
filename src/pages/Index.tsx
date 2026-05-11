import { Layout } from "@/components/Layout";
import { Link } from "react-router";
import { ArrowRight, Package, ShieldCheck, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useDbList } from "@/db";
import type { Product } from "@/modules/ecommerce-core/types";
import { PokemonCardFlip } from "@/components/PokemonCardFlip";
import { SellCardSection } from "@/components/SellCardSection";

type PokemonProduct = Product & {
  back_image?: string;
  condition?: string;
  set_name?: string;
  is_box?: boolean | number;
};

const Index = () => {
  const { t } = useTranslation("homepage");

  const { data: singleCards = [] } = useDbList<PokemonProduct>("products", {
    where: { featured: 1, is_box: 0 },
    limit: 8,
  });

  const { data: boxProducts = [] } = useDbList<PokemonProduct>("products", {
    where: { featured: 1, is_box: 1 },
    limit: 6,
  });

  const trustItems = [
    { icon: ShieldCheck, label: t("trust1", "Güvenli Ödeme") },
    { icon: Zap, label: t("trust2", "Hızlı Kargo") },
    { icon: Star, label: t("trust3", "Orijinal Ürün Garantisi") },
    { icon: Package, label: t("trust4", "Kolay İade") },
  ];

  return (
    <Layout>
      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#1A1A2E]">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero_primary_pokemon_cards_hero.jpg"
            alt={t("heroImageAlt", "Pokemon Kartları")}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-yellow-400/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/30">
              🎴 {t("heroBadge", "Türkiye'nin Pokemon Kart Mağazası")}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t("heroTitle1", "Koleksiyonunu")}
              <span className="text-yellow-400 block">{t("heroTitle2", "Büyüt!")}</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-lg leading-relaxed">
              {t("heroDesc", "Nadir kartlar, booster box'lar ve Elite Trainer Box'lar. Güvenli alışveriş, hızlı kargo, orijinal ürün garantisi.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-yellow-400 text-[#1A1A2E] hover:bg-yellow-300 font-bold text-base px-8">
                <Link to="/products">
                  {t("heroCta1", "Kartları Keşfet")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold text-base px-8">
                <a href="#karti-sat">
                  {t("heroCta2", "Kartını Sat")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-yellow-400 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[#1A1A2E] font-semibold text-sm">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CARDS (with flip) ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-yellow-400/10 text-yellow-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              {t("cardsBadge", "Öne Çıkan Kartlar")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-4">
              {t("cardsTitle", "Tekil Kartlar")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t("cardsSubtitle", "Kartın ön ve arka yüzünü görmek için üzerine tıkla!")}
            </p>
          </div>

          {singleCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
              {singleCards.map((product) => (
                <PokemonCardFlip key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2.5/3.5] bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="border-[#1A1A2E] text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white">
              <Link to="/products">
                {t("viewAllCards", "Tüm Kartları Gör")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── BOOSTER BOX SECTION ── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#1A1A2E]/10 text-[#1A1A2E] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              {t("boxBadge", "Kapalı Kutular")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-4">
              {t("boxTitle", "Booster Box & Elite Trainer Box")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t("boxSubtitle", "Sürpriz açılış heyecanı! Mühürlü kutularla koleksiyonunu genişlet.")}
            </p>
          </div>

          {boxProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {boxProducts.map((product) => (                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                      src={(product.images && product.images.length > 0) ? product.images[0] : "/images/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = "/images/placeholder.png"; }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-[#1A1A2E] leading-tight">{product.name}</h3>
                      {product.stock !== undefined && product.stock <= 3 && product.stock > 0 && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          {t("lastStock", "Son {{count}}", { count: product.stock })}
                        </Badge>
                      )}
                    </div>
                    {product.set_name && (
                      <p className="text-sm text-gray-500 mb-3">{product.set_name}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-yellow-600">
                          {product.price.toLocaleString("tr-TR")} ₺
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-400 line-through ml-2">
                            {product.original_price.toLocaleString("tr-TR")} ₺
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[#1A1A2E] font-semibold group-hover:text-yellow-600 transition-colors flex items-center gap-1">
                        {t("viewDetail", "İncele")} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button asChild size="lg" className="bg-[#1A1A2E] text-white hover:bg-[#1A1A2E]/90">
              <Link to="/products">
                {t("viewAllBoxes", "Tüm Kutuları Gör")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── SELL CARD SECTION ── */}
      <SellCardSection />
    </Layout>
  );
};

export default Index;
