import { useState, useMemo } from "react";
import {
  Star,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCart, formatPrice } from "@/modules/ecommerce-core";
import type { Product, Category } from "@/modules/ecommerce-core/types";
import { useTranslation } from "react-i18next";
import { useDbList } from "@/db";
import constants from "@/constants/constants.json";

interface ProductDetailBlockProps {
  product: Product;
}

export function ProductDetailBlock({ product }: ProductDetailBlockProps) {
  const { t } = useTranslation("product-detail-block");
  const { addItem } = useCart();
  const { data: productCategories = [] } = useDbList<Category>("product_categories");
  const categoryMap = useMemo(() => new Map(productCategories.map(c => [c.id, c])), [productCategories]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleAddToCart = async () => {
    if (product) {
      setIsAdding(true);
      // Add multiple items by calling addItem quantity times
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }

      // Show success feedback
      setTimeout(() => {
        setIsAdding(false);
      }, 1000);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const features = [
    {
      icon: Truck,
      title: t("freeShipping", "Free Shipping"),
      description: t("freeShippingDesc", "On orders over 50"),
    },
    {
      icon: RotateCcw,
      title: t("easyReturns", "Easy Returns"),
      description: t("easyReturnsDesc", "30-day return policy"),
    },
    {
      icon: Shield,
      title: t("secureCheckout", "Secure Checkout"),
      description: t("secureCheckoutDesc", "SSL encrypted payment"),
    },
  ];

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-muted group">
            <img
              src={product.images?.length ? product.images?.[selectedImageIndex] : "/images/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
              onClick={() => setIsImageModalOpen(true)}
            />

            {/* Zoom Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5" />
            </div>

            {/* Navigation Arrows */}
            {product?.images?.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex === 0
                        ? product?.images?.length - 1
                        : selectedImageIndex - 1
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex === product?.images?.length - 1
                        ? 0
                        : selectedImageIndex + 1,
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.on_sale && (
                <Badge variant="destructive">{t("sale", "Sale")}</Badge>
              )}
              {product.is_new && (
                <Badge variant="secondary">{t("new", "New")}</Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Images */}
          {product?.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {categoryMap.get(product.categories?.[0] as number)?.name}
              </Badge>
              {product.featured && (
                <Badge variant="secondary">{t("featured", "Featured")}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-current text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="text-sm font-medium ml-1">
                  {product.rating}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">
                {formatPrice(
                  product.on_sale && product.sale_price
                    ? product.sale_price
                    : product.price,
                  constants.site.currency
                )}
              </span>
              {product.on_sale && product.sale_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(
                    product.price,
                    constants.site.currency
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("size", "Size")}
              </label>
              <Select
                value={selectedVariant}
                onValueChange={setSelectedVariant}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectSize", "Select size")} />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem
                      key={variant.id}
                      value={variant.id}
                      disabled={variant.stockQuantity === 0}
                    >
                      {variant.value}{" "}
                      {variant.stockQuantity === 0 &&
                        `(${t("outOfStock", "Out of Stock")})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("quantity", "Quantity")}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock} {t("available", "available")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                disabled={product.stock <= 0 || isAdding}
                variant="default"
                onClick={handleAddToCart}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("adding", "Adding...")}
                  </>
                ) : (
                  t("addToCart", "Add to Cart")
                )}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {product.stock > 0 ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ {t("inStockReady", "In stock and ready to ship")} (
                {product.stock} {t("available", "available")})
              </p>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ✗ {t("currentlyOutOfStock", "Currently out of stock")}
              </p>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="text-sm font-medium">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mt-16">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">
            {t("description", "Description")}
          </TabsTrigger>
          <TabsTrigger value="specifications">
            {t("specifications", "Specifications")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <Separator className="my-6" />
                <h3 className="text-lg font-semibold mb-3">
                  {t("keyFeatures", "Key Features")}
                </h3>
                <ul className="space-y-2">
                  {Array.isArray(product.tags) && product.tags.map((tag, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="capitalize">{tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {product.specifications ? (
                <div className="grid gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-muted/30 rounded-lg p-4 flex justify-between items-center"
                      >
                        <span className="font-medium text-foreground capitalize">
                          {key
                            .replace(/_/g, " ")
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        </span>
                        <span className="text-muted-foreground font-mono bg-background px-3 py-1 rounded-md border">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t("noSpecifications", "No specifications available.")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Zoom Modal */}
      <Dialog
        open={isImageModalOpen}
        onOpenChange={(open) => {
          setIsImageModalOpen(open);
          if (!open) {
            setZoomLevel(1);
            setPosition({ x: 0, y: 0 });
          }
        }}
      >
        <DialogContent className="!max-w-[95vw] !w-[95vw] !h-[95vh] p-0 overflow-hidden bg-black/95 border-none [&>button]:hidden">
          {/* Close Button */}
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/60 hover:bg-black/80 p-2 transition-all border border-white/10 backdrop-blur-md"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Image Counter */}
          {product?.images?.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <span className="text-white text-sm font-semibold">
                {selectedImageIndex + 1} / {product?.images?.length}
              </span>
            </div>
          )}

          {/* Navigation Buttons */}
          {product?.images?.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md rounded-full p-3 transition-all"
                onClick={() => {
                  setSelectedImageIndex(
                    selectedImageIndex === 0
                      ? product?.images?.length - 1
                      : selectedImageIndex - 1
                  );
                  setZoomLevel(1);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md rounded-full p-3 transition-all"
                onClick={() => {
                  setSelectedImageIndex(
                    selectedImageIndex === product?.images?.length - 1
                      ? 0
                      : selectedImageIndex + 1
                  );
                  setZoomLevel(1);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
            <button
              className="text-white hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center disabled:opacity-50"
              onClick={() => {
                const newZoom = Math.max(1, zoomLevel - 0.3);
                setZoomLevel(newZoom);
                if (newZoom === 1) setPosition({ x: 0, y: 0 });
              }}
              disabled={zoomLevel <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-white text-sm font-semibold min-w-[50px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              className="text-white hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center disabled:opacity-50"
              onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.3))}
              disabled={zoomLevel >= 4}
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <button
              className="text-white hover:bg-white/20 text-xs px-3 h-8 rounded-full disabled:opacity-50"
              onClick={() => {
                setZoomLevel(1);
                setPosition({ x: 0, y: 0 });
              }}
              disabled={zoomLevel === 1}
            >
              Reset
            </button>
          </div>

          {/* Zoomable Image Container */}
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden select-none"
            style={{
              cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            }}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.15 : 0.15;
              const newZoom = Math.max(1, Math.min(4, zoomLevel + delta));
              setZoomLevel(newZoom);
              if (newZoom === 1) setPosition({ x: 0, y: 0 });
            }}
            onMouseDown={(e) => {
              if (zoomLevel > 1) {
                setIsDragging(true);
                setDragStart({
                  x: e.clientX - position.x,
                  y: e.clientY - position.y,
                });
              } else if (e.detail === 2) {
                setZoomLevel(2.5);
              }
            }}
            onMouseMove={(e) => {
              if (isDragging && zoomLevel > 1) {
                setPosition({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y,
                });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onClick={(e) => {
              if (zoomLevel === 1 && e.detail === 1) {
                setZoomLevel(2.5);
              }
            }}
          >
            <img
              src={product.images?.length ? product.images?.[selectedImageIndex] : "/images/placeholder.png"}
              alt={product.name}
              className="max-w-[85vw] max-h-[85vh] object-contain pointer-events-none transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
              }}
              draggable={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
