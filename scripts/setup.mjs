import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { pool, transaction } from "../server/db.js";
import { hashPassword } from "../server/auth.js";
import { seedProducts } from "../shared/catalog.js";
const password = process.env.ADMIN_PASSWORD;
if (
  !password ||
  password.length < 12 ||
  password === "replace-with-a-long-unique-password"
)
  throw new Error(
    "Set ADMIN_PASSWORD to a unique password of at least 12 characters.",
  );
try {
  await transaction(async (client) => {
    await client.query(
      await readFile(new URL("../server/schema.sql", import.meta.url), "utf8"),
    );
    for (const p of seedProducts)
      await client.query(
        "INSERT INTO products VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, price=EXCLUDED.price, description=EXCLUDED.description, color=EXCLUDED.color, tag=EXCLUDED.tag, available=EXCLUDED.available",
        [
          p.id,
          p.name,
          p.category,
          p.price,
          p.description,
          p.color,
          p.tag,
          p.available,
        ],
      );
    await client.query(
      "INSERT INTO admins VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING",
      [
        randomUUID(),
        (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),
        await hashPassword(password),
      ],
    );
  });
  console.log(
    "Database ready. Menu items synchronized; admin account preserved.",
  );
} finally {
  await pool.end();
}
