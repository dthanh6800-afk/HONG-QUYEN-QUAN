import React, { useEffect, useState } from "react";
import { Leaf, LogOut, RefreshCw, Plus } from "lucide-react";
import { api } from "../api.js";
import { Field, Modal } from "../components.jsx";
import { STATUS, TOPPINGS, money } from "../../shared/catalog.js";
import { canTransition } from "../../shared/transitions.js";
const blankProduct = {
  name: "",
  category: "Trà sữa",
  price: 35000,
  description: "",
  color: "#cfac7f",
  tag: "",
  available: true,
};
function ProductEditor({ product, onClose, onSave }) {
  const [form, setForm] = useState(product),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api("/admin/products" + (product.id ? "/" + product.id : ""), {
        method: product.id ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      await onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={product.id ? "Chỉnh sửa món" : "Thêm món mới"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <Field label="Tên món">
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <div className="form-grid">
            <Field label="Danh mục">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {["Trà sữa", "Trà trái cây", "Sữa tươi", "Matcha"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Giá (VNĐ)">
              <input
                type="number"
                required
                min={1000}
                max={1000000}
                step={1}
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <Field label="Mô tả">
            <textarea
              required
              minLength={5}
              maxLength={500}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <div className="form-grid">
            <Field label="Màu minh họa">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </Field>
            <Field label="Nhãn nổi bật">
              <input
                maxLength={30}
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              />
            </Field>
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) =>
                setForm({ ...form, available: e.target.checked })
              }
            />
            Đang bán
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button full">
            {busy ? "Đang lưu…" : "Lưu món"}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
}
export function Admin() {
  const [authenticated, setAuthenticated] = useState(false),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState([]),
    [products, setProducts] = useState([]),
    [tab, setTab] = useState("orders"),
    [editing, setEditing] = useState(null);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  async function load() {
    const [nextOrders, nextProducts] = await Promise.all([
      api("/admin/orders"),
      api("/products"),
    ]);
    setOrders(nextOrders);
    setProducts(nextProducts);
  }
  useEffect(() => {
    api("/admin/me")
      .then(async () => {
        await load();
        setAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await load();
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function action(fn, refresh = true) {
    setBusy(true);
    setError("");
    try {
      await fn();
      if (refresh) await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (checking)
    return <div className="empty">Đang kiểm tra phiên đăng nhập…</div>;
  if (!authenticated)
    return (
      <main className="login-page">
        <a className="brand" href="/">
          <Leaf />
          Hồng Quyên Quán
        </a>
        <form className="login-card" onSubmit={login}>
          <span className="eyebrow">KHÔNG GIAN QUẢN TRỊ</span>
          <h1>Chào bạn trở lại.</h1>
          <p className="muted">Đăng nhập để quản lý món và đơn hàng.</p>
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
          <a className="back-link" href="/">
            ← Quay về quán
          </a>
        </form>
      </main>
    );
  return (
    <>
      <header className="site-header">
        <a className="brand" href="/">
          <Leaf />
          Hồng Quyên Quán <small>QUẢN TRỊ</small>
        </a>
        <button
          className="cart-button"
          onClick={() =>
            action(async () => {
              await api("/admin/logout", { method: "POST" });
              setAuthenticated(false);
            }, false)
          }
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </header>
      <main className="admin-main">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MỖI ĐƠN HÀNG, MỘT NIỀM VUI</div>
            <h1>Quản lý quán</h1>
          </div>
          <button
            className="cart-button"
            disabled={busy}
            onClick={() => action(async () => {})}
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
        <div className="stat-grid">
          <div>
            <span>Đơn trong danh sách</span>
            <b>{orders.length}</b>
          </div>
          <div>
            <span>Đang chờ xác nhận</span>
            <b>{orders.filter((o) => o.status === "new").length}</b>
          </div>
          <div>
            <span>Tổng tiền đơn hoàn tất*</span>
            <b>
              {money(
                orders
                  .filter((o) => o.status === "completed")
                  .reduce((sum, o) => sum + o.total, 0),
              )}
            </b>
          </div>
        </div>
        <p className="muted small">
          * Hiển thị tối đa 200 đơn gần nhất; tổng tiền bao gồm phí giao hàng.
        </p>
        <div className="admin-tabs">
          <div className="categories">
            <button
              className={tab === "orders" ? "selected" : ""}
              onClick={() => setTab("orders")}
            >
              Đơn hàng
            </button>
            <button
              className={tab === "products" ? "selected" : ""}
              onClick={() => setTab("products")}
            >
              Thực đơn
            </button>
          </div>
          {tab === "products" && (
            <button className="button" onClick={() => setEditing(blankProduct)}>
              <Plus size={17} />
              Thêm món
            </button>
          )}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {tab === "orders" ? (
          <div className="orders">
            {!orders.length && (
              <p className="empty">
                Chưa có đơn hàng. Đơn mới sẽ xuất hiện tại đây.
              </p>
            )}
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <header>
                  <div>
                    <b>
                      #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                      {order.customer_name}
                    </b>
                    <small>
                      {new Date(order.created_at).toLocaleString("vi-VN")} ·{" "}
                      {order.phone}
                    </small>
                  </div>
                  <span className="status">{STATUS[order.status]}</span>
                </header>
                <p>
                  {order.method === "delivery"
                    ? `Giao hàng: ${order.address}`
                    : "Nhận tại quán"}
                  {order.note && ` · Ghi chú: ${order.note}`}
                </p>
                {order.items.map((item, i) => (
                  <div className="order-item" key={i}>
                    <span>
                      {item.quantity} × {item.name} ({item.size})
                      <small>
                        {item.sugar}% đường · {item.ice}% đá
                        {item.toppings.map((id) => " · " + TOPPINGS[id].name)}
                      </small>
                    </span>
                    <b>{money(item.unitPrice * item.quantity)}</b>
                  </div>
                ))}
                <div className="order-footer">
                  <b>Tổng: {money(order.total)}</b>
                  <div className="choices">
                    {Object.entries(STATUS)
                      .filter(([next]) =>
                        canTransition(order.status, next, order.method),
                      )
                      .map(([next, label]) => (
                        <button
                          disabled={busy}
                          key={next}
                          onClick={() =>
                            action(() =>
                              api("/admin/orders/" + order.id, {
                                method: "PATCH",
                                body: JSON.stringify({ status: next }),
                              }),
                            )
                          }
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-products">
            {products.map((product) => (
              <div className="admin-product" key={product.id}>
                <span
                  className="color-dot"
                  style={{ background: product.color }}
                />
                <div>
                  <b>{product.name}</b>
                  <small>
                    {product.category} · {money(product.price)}
                  </small>
                </div>
                <span className="status">
                  {product.available ? "Đang bán" : "Hết món"}
                </span>
                <button
                  className="cart-button"
                  onClick={() => setEditing(product)}
                >
                  Chỉnh sửa
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSave={async () => {
            await load();
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
