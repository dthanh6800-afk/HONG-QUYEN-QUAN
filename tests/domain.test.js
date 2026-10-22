import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  orderSchema,
  calculateOrder,
  canTransition,
} from "../server/domain.js";
import { hashPassword, verifyPassword } from "../server/auth.js";
const product = { id: "tea", name: "Trà", price: 35000, available: true };
test("price changes require the customer to review the total again", () => {
  assert.throws(
    () => calculateOrder({ ...input(), expectedTotal: 1 }, [product]),
    { status: 409 },
  );
  assert.equal(
    calculateOrder({ ...input(), expectedTotal: 114000 }, [product]).total,
    114000,
  );
});
const input = () => ({
  requestId: randomUUID(),
  customerName: "Khách thử",
  phone: "0901234567",
  method: "pickup",
  address: "",
  note: "",
  items: [
    {
      productId: "tea",
      size: "L",
      sugar: 50,
      ice: 70,
      toppings: ["pearl", "cheese"],
      quantity: 2,
    },
  ],
});
test("price includes size and each topping per cup; pickup is free", () => {
  const priced = calculateOrder(orderSchema.parse(input()), [product]);
  assert.equal(priced.total, 114000);
  assert.equal(priced.deliveryFee, 0);
});
test("delivery fee applies once per order", () => {
  const order = input();
  order.method = "delivery";
  order.address = "123 Đường thử nghiệm";
  assert.equal(
    calculateOrder(orderSchema.parse(order), [product]).total,
    129000,
  );
});
test("client supplied price and totals are discarded", () => {
  const order = input();
  order.total = 1;
  order.items[0].price = 1;
  const parsed = orderSchema.parse(order);
  assert.equal(parsed.total, undefined);
  assert.equal(parsed.items[0].price, undefined);
  assert.equal(calculateOrder(parsed, [product]).total, 114000);
});
test("reject invalid quantities, options, duplicate toppings and missing address", () => {
  for (const patch of [
    { quantity: 0 },
    { quantity: -1 },
    { quantity: 1.5 },
    { quantity: 21 },
    { size: "XL" },
    { sugar: 42 },
    { ice: 101 },
    { toppings: ["pearl", "pearl"] },
    { toppings: ["unknown"] },
  ]) {
    const order = input();
    Object.assign(order.items[0], patch);
    assert.equal(orderSchema.safeParse(order).success, false);
  }
  assert.equal(
    orderSchema.safeParse({ ...input(), method: "delivery" }).success,
    false,
  );
});
test("reject empty order and invalid phone", () => {
  assert.equal(orderSchema.safeParse({ ...input(), items: [] }).success, false);
  assert.equal(
    orderSchema.safeParse({ ...input(), phone: "123" }).success,
    false,
  );
});
test("unavailable and removed products cannot be ordered", () => {
  assert.throws(() =>
    calculateOrder(input(), [{ ...product, available: false }]),
  );
  assert.throws(() => calculateOrder(input(), []));
});
test("stored order keeps original price after catalog changes", () => {
  const source = { ...product };
  const result = calculateOrder(input(), [source]);
  source.price = 90000;
  assert.equal(result.items[0].unitPrice, 57000);
});
test("status lifecycle prevents skipping steps and reopening completed orders", () => {
  assert.equal(canTransition("new", "completed", "pickup"), false);
  assert.equal(canTransition("new", "confirmed", "pickup"), true);
  assert.equal(canTransition("preparing", "ready", "pickup"), true);
  assert.equal(canTransition("preparing", "delivering", "pickup"), false);
  assert.equal(canTransition("preparing", "delivering", "delivery"), true);
  assert.equal(canTransition("completed", "new", "pickup"), false);
  assert.equal(canTransition("cancelled", "confirmed", "pickup"), false);
});
test("password hashes are salted and reject incorrect passwords", async () => {
  const hash = await hashPassword("test-password-123");
  assert.notEqual(hash, await hashPassword("test-password-123"));
  assert.equal(await verifyPassword("test-password-123", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});
