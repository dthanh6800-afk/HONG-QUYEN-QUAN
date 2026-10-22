import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { randomBytes, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { z } from "zod";
import { pool, transaction } from "./db.js";
import { hashToken, verifyPassword } from "./auth.js";
import {
  orderSchema,
  productSchema,
  calculateOrder,
  canTransition,
} from "./domain.js";

export const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "upgrade-insecure-requests":
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (
    !["GET", "HEAD"].includes(req.method) &&
    req.headers.origin &&
    new URL(req.headers.origin).host !== req.headers.host
  )
    return res.status(403).json({ error: "Yêu cầu không hợp lệ." });
  next();
});
const limited = (limit, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau." },
  });
const tokenFrom = (req) =>
  req.headers.cookie
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("tea_session="))
    ?.slice(12) || "";
const cookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
};
async function adminOnly(req, res, next) {
  const result = await pool.query(
    "SELECT admin_id FROM sessions WHERE token_hash=$1 AND expires_at>now()",
    [hashToken(tokenFrom(req))],
  );
  if (!result.rowCount)
    return res.status(401).json({ error: "Vui lòng đăng nhập quản trị." });
  next();
}
app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
});
app.get("/api/products", async (req, res) =>
  res.json((await pool.query("SELECT * FROM products ORDER BY id")).rows),
);
app.post("/api/orders", limited(30), async (req, res) => {
  const input = orderSchema.parse(req.body);
  const payloadHash = hashToken(JSON.stringify(input));
  const order = await transaction(async (client) => {
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      [input.requestId],
    );
    const existing = (
      await client.query("SELECT * FROM orders WHERE request_id=$1", [
        input.requestId,
      ])
    ).rows[0];
    if (existing) {
      if (existing.payload_hash !== payloadHash)
        throw Object.assign(
          new Error("Mã yêu cầu đã được dùng cho một đơn khác."),
          { status: 409 },
        );
      return existing;
    }
    const products = (
      await client.query(
        "SELECT * FROM products WHERE id=ANY($1::text[]) FOR SHARE",
        [input.items.map((x) => x.productId)],
      )
    ).rows;
    const priced = calculateOrder(input, products);
    return (
      await client.query(
        "INSERT INTO orders(id,request_id,payload_hash,customer_name,phone,method,address,note,items,subtotal,delivery_fee,total) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",
        [
          randomUUID(),
          input.requestId,
          payloadHash,
          input.customerName,
          input.phone,
          input.method,
          input.address,
          input.note,
          JSON.stringify(priced.items),
          priced.subtotal,
          priced.deliveryFee,
          priced.total,
        ],
      )
    ).rows[0];
  });
  res
    .status(201)
    .json({ id: order.id, total: order.total, status: order.status });
});
app.post("/api/admin/login", limited(8), async (req, res) => {
  const { email, password } = z
    .object({ email: z.email().max(150), password: z.string().min(1).max(200) })
    .parse(req.body);
  const admin = (
    await pool.query("SELECT * FROM admins WHERE email=$1", [
      email.toLowerCase(),
    ])
  ).rows[0];
  if (!admin || !(await verifyPassword(password, admin.password_hash)))
    return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
  const token = randomBytes(32).toString("hex");
  await pool.query("DELETE FROM sessions WHERE expires_at<now()");
  await pool.query(
    "INSERT INTO sessions VALUES($1,$2,now()+interval '8 hours')",
    [hashToken(token), admin.id],
  );
  res.cookie("tea_session", token, cookieOptions).json({ ok: true });
});
app.post("/api/admin/logout", async (req, res) => {
  await pool.query("DELETE FROM sessions WHERE token_hash=$1", [
    hashToken(tokenFrom(req)),
  ]);
  res
    .clearCookie("tea_session", { ...cookieOptions, maxAge: undefined })
    .json({ ok: true });
});
app.use("/api/admin", adminOnly);
app.get("/api/admin/me", (req, res) => res.json({ ok: true }));
app.get("/api/admin/orders", async (req, res) =>
  res.json(
    (
      await pool.query(
        "SELECT * FROM orders ORDER BY created_at DESC LIMIT 200",
      )
    ).rows,
  ),
);
app.patch("/api/admin/orders/:id", async (req, res) => {
  const id = z.uuid().parse(req.params.id);
  const { status } = z.object({ status: z.string() }).parse(req.body);
  const order = await transaction(async (client) => {
    const current = (
      await client.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [id])
    ).rows[0];
    if (!current)
      throw Object.assign(new Error("Không tìm thấy đơn."), { status: 404 });
    if (!canTransition(current.status, status, current.method))
      throw Object.assign(
        new Error(
          "Không thể chuyển sang trạng thái này. Hãy tải lại danh sách.",
        ),
        { status: 409 },
      );
    return (
      await client.query(
        "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
        [status, id],
      )
    ).rows[0];
  });
  res.json(order);
});
app.post("/api/admin/products", async (req, res) => {
  const p = productSchema.parse(req.body);
  res
    .status(201)
    .json(
      (
        await pool.query(
          "INSERT INTO products VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
          [
            randomUUID(),
            p.name,
            p.category,
            p.price,
            p.description,
            p.color,
            p.tag,
            p.available,
          ],
        )
      ).rows[0],
    );
});
app.put("/api/admin/products/:id", async (req, res) => {
  const p = productSchema.parse(req.body);
  const result = await pool.query(
    "UPDATE products SET name=$1,category=$2,price=$3,description=$4,color=$5,tag=$6,available=$7 WHERE id=$8 RETURNING *",
    [
      p.name,
      p.category,
      p.price,
      p.description,
      p.color,
      p.tag,
      p.available,
      req.params.id,
    ],
  );
  if (!result.rowCount)
    return res.status(404).json({ error: "Không tìm thấy món." });
  res.json(result.rows[0]);
});
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Không tìm thấy API." }),
);
app.use(express.static(resolve("dist")));
app.get("/{*path}", (req, res) => res.sendFile(resolve("dist/index.html")));
app.use((error, req, res, _next) => {
  if (error instanceof z.ZodError)
    return res
      .status(400)
      .json({ error: error.issues[0]?.message || "Dữ liệu không hợp lệ." });
  const status = error.status || 500;
  if (status >= 500) console.error(error.message);
  res.status(status).json({
    error:
      status >= 500
        ? "Hệ thống tạm thời không khả dụng. Vui lòng thử lại."
        : error.message,
  });
});
