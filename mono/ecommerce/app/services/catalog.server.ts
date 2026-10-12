import { getDb } from "../db/db.server";
import type { Product, Category } from "../types";

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "rating";
  minPrice?: number;
  maxPrice?: number;
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  const res = await db.query<Category>(
    "SELECT id, name, slug, description, icon FROM categories ORDER BY name ASC"
  );
  return res.rows;
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const db = await getDb();
  const res = await db.query<Product>(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.featured = true
     ORDER BY p.rating DESC
     LIMIT $1`,
    [limit]
  );
  return res.rows.map(mapProduct);
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const db = await getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.category && filters.category !== "all") {
    params.push(filters.category);
    conditions.push(`c.slug = $${params.length}`);
  }

  if (filters.search && filters.search.trim()) {
    params.push(`%${filters.search.trim().toLowerCase()}%`);
    conditions.push(
      `(LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`
    );
  }

  if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
    params.push(filters.minPrice);
    conditions.push(`p.price >= $${params.length}`);
  }

  if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
    params.push(filters.maxPrice);
    conditions.push(`p.price <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderBy = "ORDER BY p.featured DESC, p.created_at DESC";
  if (filters.sort === "price_asc") {
    orderBy = "ORDER BY p.price ASC";
  } else if (filters.sort === "price_desc") {
    orderBy = "ORDER BY p.price DESC";
  } else if (filters.sort === "rating") {
    orderBy = "ORDER BY p.rating DESC";
  }

  const sql = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderBy}
  `;

  const res = await db.query<Product>(sql, params);
  return res.rows.map(mapProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await getDb();
  const res = await db.query<Product>(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1`,
    [id]
  );
  if (res.rows.length === 0) return null;
  return mapProduct(res.rows[0]);
}

export async function getRelatedProducts(productId: number, categoryId: number, limit = 4): Promise<Product[]> {
  const db = await getDb();
  const res = await db.query<Product>(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.category_id = $1 AND p.id != $2
     ORDER BY p.rating DESC
     LIMIT $3`,
    [categoryId, productId, limit]
  );
  return res.rows.map(mapProduct);
}

function mapProduct(row: any): Product {
  return {
    ...row,
    price: Number(row.price),
    rating: Number(row.rating),
    stock: Number(row.stock),
    featured: Boolean(row.featured),
  };
}

