import { z } from "zod";
import { product } from "@/lib/product";

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
  imageIndex: z.coerce.number().int().min(0).max(product.images.length - 1),
  quantity: z.coerce.number().int().min(1).max(10),
  size: z.coerce.number().refine((size) => product.sizes.includes(size as never), {
    message: "Select a valid size",
  }),
});

export type OrderInput = z.infer<typeof orderSchema>;

export type StoredOrder = OrderInput & {
  orderId: string;
  createdAt: string;
  pricePerPiece: number;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  colorway: string;
  productImage: string;
};
