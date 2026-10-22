import { z } from "zod";
import {
  SIZES,
  TOPPINGS,
  LEVELS,
  unitPrice,
  deliveryFee,
} from "../shared/catalog.js";
export const itemSchema = z.object({
  productId: z.string().min(1).max(80),
  size: z.enum(Object.keys(SIZES)),
  sugar: z.union(LEVELS.map((x) => z.literal(x))),
  ice: z.union(LEVELS.map((x) => z.literal(x))),
  toppings: z
    .array(z.enum(Object.keys(TOPPINGS)))
    .max(3)
    .refine((a) => new Set(a).size === a.length),
  quantity: z.number().int().min(1).max(20),
});
export const orderSchema = z
  .object({
    requestId: z.uuid(),
    expectedTotal: z.number().int().nonnegative().optional(),
    customerName: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .regex(/^0[0-9]{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0"),
    method: z.enum(["pickup", "delivery"]),
    address: z.string().trim().max(250).default(""),
    note: z.string().trim().max(500).default(""),
    items: z.array(itemSchema).min(1).max(30),
  })
  .refine((x) => x.method !== "delivery" || x.address.length >= 10, {
    message: "Vui lòng nhập địa chỉ giao hàng đầy đủ",
    path: ["address"],
  });
export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  category: z.enum(["Trà sữa", "Sữa tươi", "Matcha", "Trà trái cây"]),
  price: z.number().int().min(1000).max(1000000),
  description: z.string().trim().min(5).max(500),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  tag: z.string().trim().max(30).default(""),
  available: z.boolean(),
});
export function calculateOrder(input, products) {
  const items = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product?.available)
      throw Object.assign(
        new Error(
          "Món đã hết hoặc không còn tồn tại. Vui lòng cập nhật giỏ hàng.",
        ),
        { status: 409 },
      );
    return { ...item, name: product.name, unitPrice: unitPrice(product, item) };
  });
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  if (
    input.expectedTotal !== undefined &&
    input.expectedTotal !== subtotal + deliveryFee(input.method)
  ) {
    throw Object.assign(
      new Error(
        "Giá món đã thay đổi. Vui lòng tải lại trang, chọn lại món và kiểm tra tổng tiền trước khi đặt.",
      ),
      { status: 409 },
    );
  }
  return {
    items,
    subtotal,
    deliveryFee: deliveryFee(input.method),
    total: subtotal + deliveryFee(input.method),
  };
}
export { canTransition } from "../shared/transitions.js";
