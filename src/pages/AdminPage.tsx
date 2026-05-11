import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Layout } from "@/components/Layout";
import { useDbList, useDbCreate, useDbUpdate, useDbDelete } from "@/db";
import { ArrowLeft, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  description?: string;
  images?: string[];
  back_image?: string;
  category?: string;
  condition?: string;
  set_name?: string;
  stock: number;
  featured?: number;
  is_box?: number;
  published?: number;
};

type CardSellRequest = {
  id: number;
  card_name: string;
  set_name?: string;
  condition?: string;
  quantity?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  message?: string;
  status?: string;
  created_at?: string;
};

type EditingCell = {
  id: number;
  field: "price" | "stock";
  value: string;
};

type NewProductForm = {
  name: string;
  slug: string;
  price: string;
  original_price: string;
  description: string;
  category: string;
  condition: string;
  set_name: string;
  stock: string;
  is_box: boolean;
  featured: boolean;
  published: boolean;
};

const EMPTY_FORM: NewProductForm = {
  name: "",
  slug: "",
  price: "",
  original_price: "",
  description: "",
  category: "",
  condition: "",
  set_name: "",
  stock: "",
  is_box: false,
  featured: false,
  published: true,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getStatusVariant(
  status?: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "reviewed":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

function AdminContent() {
  const { t } = useTranslation("admin");

  // ── Products ──────────────────────────────────────────────────────────────
  const { data: products, isLoading: productsLoading } = useDbList<Product>(
    "products",
    { orderBy: [{ field: "id", direction: "DESC" }] }
  );

  const { mutate: updateProduct } = useDbUpdate("products");
  const { mutate: createProduct } = useDbCreate("products");
  const { mutate: deleteProduct } = useDbDelete("products");

  // ── Sell Requests ─────────────────────────────────────────────────────────
  const { data: sellRequests, isLoading: requestsLoading } =
    useDbList<CardSellRequest>("card_sell_requests", {
      orderBy: [{ field: "id", direction: "DESC" }],
    });

  // ── Inline editing state ──────────────────────────────────────────────────
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  // ── Delete confirm dialog ─────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Add product dialog ────────────────────────────────────────────────────
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState<NewProductForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewProductForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Inline edit handlers ──────────────────────────────────────────────────
  function startEdit(id: number, field: "price" | "stock", current: number) {
    setEditingCell({ id, field, value: String(current) });
  }

  function handleSaveCell() {
    if (!editingCell) return;
    const numVal = parseFloat(editingCell.value);
    if (isNaN(numVal)) return;
    setSavingId(editingCell.id);
    updateProduct(
      { id: editingCell.id, data: { [editingCell.field]: numVal } },
      {
        onSettled: () => {
          setSavingId(null);
          setEditingCell(null);
        },
      }
    );
  }

  // ── Delete handlers ───────────────────────────────────────────────────────
  function confirmDelete(product: Product) {
    setDeleteTarget(product);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    deleteProduct(deleteTarget.id, {
      onSettled: () => {
        setIsDeleting(false);
        setDeleteTarget(null);
      },
    });
  }

  // ── Add product handlers ──────────────────────────────────────────────────
  function validateForm(): boolean {
    const errors: Partial<Record<keyof NewProductForm, string>> = {};
    if (!form.name.trim()) errors.name = t("addForm.required");
    if (!form.slug.trim()) errors.slug = t("addForm.required");
    if (!form.price || isNaN(parseFloat(form.price))) errors.price = t("addForm.required");
    if (!form.stock || isNaN(parseInt(form.stock))) errors.stock = t("addForm.required");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleFormChange(field: keyof NewProductForm, value: string | boolean) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from name
      if (field === "name" && typeof value === "string") {
        updated.slug = slugify(value);
      }
      return updated;
    });
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmitProduct() {
    if (!validateForm()) return;
    setIsSubmitting(true);
    createProduct(
      {
        name: form.name.trim(),
        slug: form.slug.trim(),
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : undefined,
        description: form.description.trim() || undefined,
        category: form.category || undefined,
        condition: form.condition || undefined,
        set_name: form.set_name.trim() || undefined,
        stock: parseInt(form.stock),
        is_box: form.is_box ? 1 : 0,
        featured: form.featured ? 1 : 0,
        published: form.published ? 1 : 0,
      },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setForm(EMPTY_FORM);
          setFormErrors({});
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  }

  function handleOpenAddDialog() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowAddDialog(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A1A2E] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana sayfaya dön
          </Link>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "#1A1A2E" }}
          >
            {t("title")}
          </h1>
          <p className="text-gray-500 text-sm">{t("subtitle")}</p>
          <div
            className="mt-3 h-1 w-16 rounded-full"
            style={{ backgroundColor: "#FFCB05" }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">{t("tabs.products")}</TabsTrigger>
            <TabsTrigger value="sellRequests">
              {t("tabs.sellRequests")}
            </TabsTrigger>
          </TabsList>

          {/* ── Products Tab ─────────────────────────────────────────────── */}
          <TabsContent value="products">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: "#1A1A2E" }}
                  >
                    {t("products.title")}
                  </h2>
                  {products && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t("products.totalProducts", { count: products.length })}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleOpenAddDialog}
                  style={{ backgroundColor: "#FFCB05", color: "#1A1A2E" }}
                  className="font-semibold hover:opacity-90"
                >
                  + {t("products.addProduct")}
                </Button>
              </div>

              {/* Table */}
              {productsLoading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <Spinner />
                  <span>{t("products.loading")}</span>
                </div>
              ) : !products || products.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  {t("products.noProducts")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12 text-xs font-semibold text-gray-500">
                          {t("products.table.id")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("products.table.name")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("products.table.price")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("products.table.stock")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("products.table.condition")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("products.table.setName")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("products.table.category")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 text-right">
                          {t("products.table.actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(products ?? []).map((product) => (
                        <TableRow
                          key={product.id}
                          data-db-table="products"
                          data-db-id={product.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* ID */}
                          <TableCell className="text-xs text-gray-400 font-mono">
                            #{product.id}
                          </TableCell>

                          {/* Name */}
                          <TableCell>
                            <div
                              className="font-medium text-sm"
                              style={{ color: "#1A1A2E" }}
                              data-db-field="name"
                            >
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                              {product.slug}
                            </div>
                          </TableCell>

                          {/* Price — inline edit */}
                          <TableCell data-db-field="price">
                            {editingCell?.id === product.id &&
                            editingCell.field === "price" ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={editingCell.value}
                                  onChange={(e) =>
                                    setEditingCell({
                                      ...editingCell,
                                      value: e.target.value,
                                    })
                                  }
                                  className="w-24 h-7 text-xs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveCell();
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-2"
                                  style={{
                                    backgroundColor: "#FFCB05",
                                    color: "#1A1A2E",
                                  }}
                                  onClick={handleSaveCell}
                                  disabled={savingId === product.id}
                                >
                                  {savingId === product.id
                                    ? t("products.saving")
                                    : t("products.save")}
                                </Button>
                              </div>
                            ) : (
                              <button
                                className="text-sm font-semibold hover:underline cursor-pointer"
                                style={{ color: "#1A1A2E" }}
                                onClick={() =>
                                  startEdit(product.id, "price", product.price)
                                }
                                title="Düzenlemek için tıkla"
                              >
                                ₺{Number(product.price).toFixed(2)}
                              </button>
                            )}
                          </TableCell>

                          {/* Stock — inline edit */}
                          <TableCell data-db-field="stock">
                            {editingCell?.id === product.id &&
                            editingCell.field === "stock" ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={editingCell.value}
                                  onChange={(e) =>
                                    setEditingCell({
                                      ...editingCell,
                                      value: e.target.value,
                                    })
                                  }
                                  className="w-20 h-7 text-xs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveCell();
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-2"
                                  style={{
                                    backgroundColor: "#FFCB05",
                                    color: "#1A1A2E",
                                  }}
                                  onClick={handleSaveCell}
                                  disabled={savingId === product.id}
                                >
                                  {savingId === product.id
                                    ? t("products.saving")
                                    : t("products.save")}
                                </Button>
                              </div>
                            ) : (
                              <button
                                className="cursor-pointer hover:underline"
                                onClick={() =>
                                  startEdit(product.id, "stock", product.stock)
                                }
                                title="Düzenlemek için tıkla"
                              >
                                <Badge
                                  variant={
                                    product.stock === 0
                                      ? "destructive"
                                      : product.stock <= 3
                                      ? "outline"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {product.stock}
                                </Badge>
                              </button>
                            )}
                          </TableCell>

                          {/* Condition */}
                          <TableCell
                            className="text-xs text-gray-600"
                            data-db-field="condition"
                          >
                            {product.condition ?? "—"}
                          </TableCell>

                          {/* Set Name */}
                          <TableCell
                            className="text-xs text-gray-600 max-w-[120px] truncate"
                            data-db-field="set_name"
                          >
                            {product.set_name ?? "—"}
                          </TableCell>

                          {/* Category */}
                          <TableCell data-db-field="category">
                            {product.category ? (
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => confirmDelete(product)}
                            >
                              {t("products.delete")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Sell Requests Tab ─────────────────────────────────────────── */}
          <TabsContent value="sellRequests">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "#1A1A2E" }}
                >
                  {t("sellRequests.title")}
                </h2>
                {sellRequests && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t("sellRequests.totalRequests", {
                      count: sellRequests.length,
                    })}
                  </p>
                )}
              </div>

              {requestsLoading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <Spinner />
                  <span>{t("sellRequests.loading")}</span>
                </div>
              ) : !sellRequests || sellRequests.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  {t("sellRequests.noRequests")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12 text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.id")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.cardName")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.setName")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.condition")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.quantity")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.contactName")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.contactEmail")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.contactPhone")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.status")}
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">
                          {t("sellRequests.table.createdAt")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(sellRequests ?? []).map((req) => (
                        <TableRow
                          key={req.id}
                          data-db-table="card_sell_requests"
                          data-db-id={req.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="text-xs text-gray-400 font-mono">
                            #{req.id}
                          </TableCell>
                          <TableCell
                            className="font-medium text-sm"
                            style={{ color: "#1A1A2E" }}
                            data-db-field="card_name"
                          >
                            {req.card_name}
                          </TableCell>
                          <TableCell
                            className="text-xs text-gray-600"
                            data-db-field="set_name"
                          >
                            {req.set_name ?? "—"}
                          </TableCell>
                          <TableCell
                            className="text-xs text-gray-600"
                            data-db-field="condition"
                          >
                            {req.condition ?? "—"}
                          </TableCell>
                          <TableCell
                            className="text-xs text-gray-600"
                            data-db-field="quantity"
                          >
                            {req.quantity ?? "—"}
                          </TableCell>
                          <TableCell
                            className="text-xs text-gray-600"
                            data-db-field="contact_name"
                          >
                            {req.contact_name ?? "—"}
                          </TableCell>
                          <TableCell
                            className="text-xs text-gray-600"
                            data-db-field="contact_email"
                          >
                            {req.contact_email ? (
                              <a
                                href={`mailto:${req.contact_email}`}
                                className="hover:underline"
                                style={{ color: "#1A1A2E" }}
                              >
                                {req.contact_email}
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell
                            className="text-xs text-gray-600"
                            data-db-field="contact_phone"
                          >
                            {req.contact_phone ?? "—"}
                          </TableCell>
                          <TableCell data-db-field="status">
                            <Badge
                              variant={getStatusVariant(req.status)}
                              className="text-xs"
                            >
                              {req.status
                                ? t(
                                    `sellRequests.statusBadge.${req.status}` as any,
                                    { defaultValue: req.status }
                                  )
                                : t("sellRequests.statusBadge.pending")}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className="text-xs text-gray-400"
                            data-db-field="created_at"
                          >
                            {req.created_at
                              ? new Date(req.created_at).toLocaleDateString(
                                  "tr-TR"
                                )
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: "#1A1A2E" }}>
              {t("products.deleteConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("products.deleteConfirmDesc", {
                name: deleteTarget?.name ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              {t("products.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="w-4 h-4 mr-2" /> : null}
              {t("products.yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Product Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => !open && setShowAddDialog(false)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: "#1A1A2E" }}>
              {t("addForm.title")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-2">
            {/* Name */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label className="text-right pt-2 text-sm font-medium">
                {t("addForm.name")}
                <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <div className="col-span-3">
                <Input
                  placeholder={t("addForm.namePlaceholder")}
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className={formErrors.name ? "border-red-400" : ""}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
            </div>

            {/* Slug */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label className="text-right pt-2 text-sm font-medium">
                {t("addForm.slug")}
                <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  placeholder={t("addForm.slugPlaceholder")}
                  value={form.slug}
                  onChange={(e) => handleFormChange("slug", e.target.value)}
                  className={`flex-1 font-mono text-sm ${formErrors.slug ? "border-red-400" : ""}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() =>
                    handleFormChange("slug", slugify(form.name))
                  }
                >
                  {t("addForm.slugAuto")}
                </Button>
              </div>
              {formErrors.slug && (
                <div className="col-span-3 col-start-2">
                  <p className="text-xs text-red-500">{formErrors.slug}</p>
                </div>
              )}
            </div>

            {/* Price + Original Price */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label className="text-right pt-2 text-sm font-medium">
                {t("addForm.price")}
                <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder={t("addForm.pricePlaceholder")}
                    value={form.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    className={formErrors.price ? "border-red-400" : ""}
                  />
                  {formErrors.price && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.price}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder={t("addForm.originalPricePlaceholder")}
                    value={form.original_price}
                    onChange={(e) =>
                      handleFormChange("original_price", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {t("addForm.originalPrice")}
                  </p>
                </div>
              </div>
            </div>

            {/* Category + Condition */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label className="text-right pt-2 text-sm font-medium">
                {t("addForm.category")}
              </Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Select
                  value={form.category}
                  onValueChange={(v) => handleFormChange("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("addForm.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-card">
                      {t("addForm.categories.singleCard")}
                    </SelectItem>
                    <SelectItem value="booster-box">
                      {t("addForm.categories.boosterBox")}
                    </SelectItem>
                    <SelectItem value="elite-trainer-box">
                      {t("addForm.categories.eliteTrainerBox")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={form.condition}
                  onValueChange={(v) => handleFormChange("condition", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("addForm.conditionPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mint">
                      {t("addForm.conditions.mint")}
                    </SelectItem>
                    <SelectItem value="Near Mint">
                      {t("addForm.conditions.nearMint")}
                    </SelectItem>
                    <SelectItem value="Excellent">
                      {t("addForm.conditions.excellent")}
                    </SelectItem>
                    <SelectItem value="Good">
                      {t("addForm.conditions.good")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Set Name + Stock */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label className="text-right pt-2 text-sm font-medium">
                {t("addForm.setName")}
              </Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input
                  placeholder={t("addForm.setNamePlaceholder")}
                  value={form.set_name}
                  onChange={(e) => handleFormChange("set_name", e.target.value)}
                />
                <div>
                  <Input
                    type="number"
                    placeholder={t("addForm.stockPlaceholder")}
                    value={form.stock}
                    onChange={(e) => handleFormChange("stock", e.target.value)}
                    className={formErrors.stock ? "border-red-400" : ""}
                  />
                  {formErrors.stock && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.stock}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {t("addForm.stock")}
                    <span className="text-red-500 ml-0.5">*</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label className="text-right pt-2 text-sm font-medium">
                {t("addForm.description")}
              </Label>
              <div className="col-span-3">
                <Textarea
                  placeholder={t("addForm.descriptionPlaceholder")}
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-4 items-start gap-3">
              <div />
              <div className="col-span-3 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_box"
                    checked={form.is_box}
                    onCheckedChange={(checked) =>
                      handleFormChange("is_box", !!checked)
                    }
                  />
                  <Label htmlFor="is_box" className="text-sm cursor-pointer">
                    {t("addForm.isBox")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      handleFormChange("featured", !!checked)
                    }
                  />
                  <Label htmlFor="featured" className="text-sm cursor-pointer">
                    {t("addForm.featured")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="published"
                    checked={form.published}
                    onCheckedChange={(checked) =>
                      handleFormChange("published", !!checked)
                    }
                  />
                  <Label htmlFor="published" className="text-sm cursor-pointer">
                    {t("addForm.published")}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              {t("addForm.cancel")}
            </Button>
            <Button
              onClick={handleSubmitProduct}
              disabled={isSubmitting}
              style={{ backgroundColor: "#FFCB05", color: "#1A1A2E" }}
              className="font-semibold hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  {t("addForm.submitting")}
                </>
              ) : (
                t("addForm.submit")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === "1234") {
      sessionStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-[#1A1A2E] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">Admin Paneli</h1>
            <p className="text-gray-500 text-sm mb-6">Devam etmek için şifreyi girin</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                placeholder="Şifre"
                className={`w-full px-4 py-3 border rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 ${passwordError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-sm">Yanlış şifre, tekrar deneyin.</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-yellow-400 text-[#1A1A2E] font-bold rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Giriş Yap
              </button>
            </form>
            <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return <AdminContent />;
}
