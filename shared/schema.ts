import { z } from "zod";

// Firestore Document Schemas

export const UserRole = z.enum(["admin", "staff"]);
export type UserRole = z.infer<typeof UserRole>;

export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: UserRole,
  name: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const productSchema = z.object({
  id: z.string().optional(), // Firestore ID
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  available: z.boolean().default(true),
});
export type Product = z.infer<typeof productSchema>;

export const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const OrderStatus = z.enum(["pending", "preparing", "ready", "completed"]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const PaymentMethod = z.enum(["cash", "digital"]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const orderSchema = z.object({
  id: z.string().optional(), // Firestore ID
  items: z.array(orderItemSchema),
  totalAmount: z.number(),
  paymentMethod: PaymentMethod,
  status: OrderStatus.default("pending"),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(), // Firestore Timestamp
});
export type Order = z.infer<typeof orderSchema>;

// API Schemas for Backend Functions
export const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});
export type CreateStaffRequest = z.infer<typeof createStaffSchema>;
