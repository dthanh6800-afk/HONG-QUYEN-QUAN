import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../server/db.js";
const base = "http://127.0.0.1:3000/api";
let cookie = "";
async function request(path, method = "GET", body, auth = false) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie"),
  };
}
const ids = [];
try {
  assert.equal((await request("/admin/orders")).status, 401);
  assert.equal((await request("/admin/products", "POST", {})).status, 401);
  const login = await request("/admin/login", "POST", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  assert.equal(login.status, 200);
  cookie = login.cookie.split(";")[0];
  assert.match(login.cookie, /HttpOnly/i);
  assert.match(login.cookie, /SameSite=Strict/i);
  const body = {
    requestId: randomUUID(),
    customerName: "Integration test",
    phone: "0901234567",
    method: "pickup",
    items: [
      {
        productId: "oolong",
        quantity: 2,
        size: "L",
        sugar: 50,
        ice: 70,
        toppings: ["pearl"],
      },
    ],
    total: 1,
  };
  const results = await Promise.all(
    Array.from({ length: 4 }, () => request("/orders", "POST", body)),
  );
  results.forEach((result) => {
    assert.equal(result.status, 201);
    assert.equal(result.data.total, 94000);
  });
  assert.equal(new Set(results.map((x) => x.data.id)).size, 1);
  const id = results[0].data.id;
  ids.push(id);
  assert.equal(
    Number(
      (
        await pool.query("SELECT count(*) FROM orders WHERE request_id=$1", [
          body.requestId,
        ])
      ).rows[0].count,
    ),
    1,
  );
  assert.equal(
    (await request("/orders", "POST", { ...body, phone: "0909999999" })).status,
    409,
  );
  assert.equal(
    (
      await request("/orders", "POST", {
        ...body,
        requestId: randomUUID(),
        items: [{ ...body.items[0], quantity: -1 }],
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/admin/orders/" + id,
        "PATCH",
        { status: "completed" },
        true,
      )
    ).status,
    409,
  );
  for (const status of ["confirmed", "preparing", "ready", "completed"])
    assert.equal(
      (await request("/admin/orders/" + id, "PATCH", { status }, true)).status,
      200,
    );
  assert.equal(
    (await request("/admin/orders/" + id, "PATCH", { status: "new" }, true))
      .status,
    409,
  );
  const malicious = await fetch(base + "/orders", {
    method: "POST",
    headers: {
      Origin: "https://evil.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  assert.equal(malicious.status, 403);
  await request("/admin/logout", "POST", {}, true);
  assert.equal(
    (await request("/admin/orders", "GET", undefined, true)).status,
    401,
  );
  console.log(
    "PASS: auth, HTTP-only session, PostgreSQL persistence, concurrent idempotency, server pricing, input validation, status lifecycle, cross-origin protection, logout.",
  );
} finally {
  if (ids.length)
    await pool.query("DELETE FROM orders WHERE id=ANY($1::uuid[])", [ids]);
  await pool.end();
}
