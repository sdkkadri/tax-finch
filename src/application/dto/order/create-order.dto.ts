import { z } from "zod";

export const CreateOrderDTO = z.object({
  userId: z.string().uuid("Invalid user ID"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        productName: z.string().min(1, "Product name is required"),
        quantity: z.number().positive("Quantity must be positive"),
        price: z.number().positive("Price must be positive"),
      }),
    )
    .min(1, "At least one item is required"),
});

export type CreateOrderDTOType = z.infer<typeof CreateOrderDTO>;
