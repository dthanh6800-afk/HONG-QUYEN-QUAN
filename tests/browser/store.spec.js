import { test, expect } from "@playwright/test";
test("storefront renders without JavaScript errors at desktop and mobile widths", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".product-card")).toHaveCount(6);
  await page.screenshot({ path: "docs/desktop.png", fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "docs/mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("customer can search, customize, submit and receive a real order confirmation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hôm nay bạn uống gì?" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Tìm món" }).fill("Ô Long");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Thêm Trà sữa Ô Long", exact: true })
    .click();
  await page.getByRole("button", { name: /L ·/ }).click();
  await page.getByLabel("Trân châu đen").check();
  await page.getByRole("button", { name: /Thêm vào giỏ/ }).click();
  await page.getByRole("button", { name: /Giỏ hàng/ }).click();
  await page.getByLabel("Tên người nhận").fill("Khách kiểm thử");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await page.getByRole("button", { name: /Đặt món ·/ }).click();
  await expect(
    page.getByRole("heading", { name: "Đã gửi đơn của bạn!" }),
  ).toBeVisible();
  await expect(page.getByText("47.000", { exact: false }).last()).toBeVisible();
});
test("empty search, mobile layout and modal keyboard dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Tìm món" }).fill("không-có-món-này");
  await expect(
    page.getByText("Chưa tìm thấy món.", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /Giỏ hàng/ }).click();
  await expect(page.getByText("Giỏ hàng đang chờ món ngon")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
});
test("admin login protects orders and supports menu editing", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill(process.env.ADMIN_EMAIL);
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Quản lý quán" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thực đơn", exact: true }).click();
  await page.getByRole("button", { name: "Chỉnh sửa" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Chỉnh sửa món" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lưu món", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(
    page.getByRole("heading", { name: "Chào bạn trở lại." }),
  ).toBeVisible();
});
