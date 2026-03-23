import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// --- Users (managed by Better Auth, we extend it) ---
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),                    
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),  
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }), 
  scope: text("scope"),                         
  password: text("password"),                   
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// --- Products ---
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),       // /products/[slug] for SEO
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),           // stored in cents e.g. 2999 = $29.99
  compareAtPrice: integer("compare_at_price"), // for "was $X" strikethrough
  images: text("images", { mode: "json" }).$type<string[]>().default([]),
  categoryId: text("category_id").references(() => categories.id),
  stock: integer("stock").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: text("parent_id"),                 // self-reference for nested categories
});

// --- Orders ---
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  status: text("status", {
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
  }).notNull().default("pending"),
  totalAmount: integer("total_amount").notNull(),
  shippingAddress: text("shipping_address", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),  // price AT time of purchase
});