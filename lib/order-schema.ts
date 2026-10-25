import { z } from "zod";
import { product } from "@/lib/product";

export const orderItemSchema = z.object({
  imageIndex: z.coerce.number().int().min(0).max(product.images.length - 1),
  quantity: z.coerce.number().int().min(1).max(10),
  size: z.coerce.number().refine((size) => product.sizes.includes(size as never), {
    message: "Select a valid size",
  }),
});

const orderItemsSchema = z.array(orderItemSchema).min(1, "Add at least one pair").max(product.images.length).superRefine((items, context) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity > 20) context.addIssue({ code: z.ZodIssueCode.custom, message: "A single order can contain up to 20 pairs" });
  if (new Set(items.map((item) => item.imageIndex)).size !== items.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "Each colorway can appear only once" });
});

export const orderSchema = z.object({
  requestId: z.string().uuid("Invalid request ID"),
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+977[- ]?)?9[678]\d{8}$/, "Enter a valid Nepali mobile number"),
  email: z.string().trim().email("Enter a valid email address").max(150),
  location: z.string().trim().min(5, "Kindly share your exact location").max(300),
  deliveryArea: z.enum(["inside", "outside"]),
  productName: z.literal(product.name),
  items: orderItemsSchema,
});

export type OrderInput = z.infer<typeof orderSchema>;
export type StoredOrderItem = z.infer<typeof orderItemSchema> & {
  colorway: string;
  productImage: string;
  lineTotal: number;
};

export type StoredOrder = Omit<OrderInput, "items"> & {
  items: StoredOrderItem[];
  orderId: string;
  createdAt: string;
  quantity: number;
  pricePerPiece: number;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  colorway: string;
  size: string;
  productImage: string;
};
