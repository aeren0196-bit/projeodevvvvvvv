// Auto-generated from schemas - DO NOT EDIT

// From promake schema
export interface DbBlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbBlogCategoryTranslation {
  id: number;
  blog_category_id: number;
  language_code: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface DbBlogCategoryInput {
  slug: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, {
    name: string;
    description?: string;
  }>;
}

export interface DbPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  images?: string[];
  author?: string;
  author_avatar?: string;
  created_at?: string;
  published_at?: string;
  updated_at?: string;
  tags?: string[];
  categories?: number[];
  read_time?: number;
  view_count?: number;
  featured?: boolean;
  published?: boolean;
  meta_description?: string;
  meta_keywords?: string;
}

export interface DbPostTranslation {
  id: number;
  post_id: number;
  language_code: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
}

export interface DbPostInput {
  slug: string;
  featured_image?: string;
  images?: string[];
  author_avatar?: string;
  created_at?: string;
  published_at?: string;
  updated_at?: string;
  tags?: string[];
  categories?: number[];
  read_time?: number;
  view_count?: number;
  featured?: boolean;
  published?: boolean;
  translations?: Record<string, {
    title: string;
    content: string;
    excerpt?: string;
    author?: string;
    meta_description?: string;
    meta_keywords?: string;
  }>;
}

export interface DbProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbProductCategoryTranslation {
  id: number;
  product_category_id: number;
  language_code: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface DbProductCategoryInput {
  slug: string;
  image?: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, {
    name: string;
    description?: string;
  }>;
}

export interface DbProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  sale_price?: number;
  on_sale?: boolean;
  images?: string[];
  back_image?: string;
  brand?: string;
  sku?: string;
  stock?: number;
  tags?: string[];
  categories?: number[];
  category?: string;
  condition?: string;
  set_name?: string;
  is_box?: boolean;
  rating?: number;
  review_count?: number;
  featured?: boolean;
  is_new?: boolean;
  published?: boolean;
  specifications?: Record<string, unknown>;
  variants?: Array<{ id: string; name: string; value: string; price?: number; image?: string; stockQuantity: number }>;
  created_at?: string;
  updated_at?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface DbProductTranslation {
  id: number;
  product_id: number;
  language_code: string;
  name: string;
  description?: string;
  brand?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
}

export interface DbProductInput {
  slug: string;
  price: number;
  original_price?: number;
  sale_price?: number;
  on_sale?: boolean;
  images?: string[];
  back_image?: string;
  sku?: string;
  stock?: number;
  tags?: string[];
  categories?: number[];
  category?: string;
  condition?: string;
  set_name?: string;
  is_box?: boolean;
  rating?: number;
  review_count?: number;
  featured?: boolean;
  is_new?: boolean;
  published?: boolean;
  specifications?: Record<string, unknown>;
  variants?: Array<{ id: string; name: string; value: string; price?: number; image?: string; stockQuantity: number }>;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, {
    name: string;
    description?: string;
    brand?: string;
    meta_description?: string;
    meta_keywords?: string;
  }>;
}

export interface DbCardSellRequest {
  id: number;
  card_name: string;
  set_name?: string;
  condition?: string;
  quantity?: number;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  message?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbTransaction {
  id: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbProductReview {
  id: number;
  product_name: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at?: string;
}
