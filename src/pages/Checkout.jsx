import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  TOPPINGS,
  money,
  unitPrice,
  deliveryFee,
} from "../../shared/catalog.js";
import { api } from "../api.js";
import { Modal, Quantity, Field } from "../components.jsx";
export function Checkout({ cart, products, onChange, onClose, onSuccess }) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    method: "pickup",
    note: "",
  });
  const [requestId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      unitPrice(
        products.find((p) => p.id === item.productId),
        item,
      ) *
        item.quantity,
    0,
  );
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onSuccess(
        await api("/orders", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            requestId,
            items: cart,
            expectedTotal: subtotal + deliveryFee(form.method),
          }),
        }),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Giỏ hàng của bạn" onClose={onClose}>
      {!cart.length ? (
        <div className="empty">
          <ShoppingBag size={42} />
          <h3>Giỏ hàng đang chờ món ngon</h3>
          <button className="button" onClick={onClose}>
            Khám phá thực đơn
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            {cart.map((item, index) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <div className="cart-line" key={index}>
                  <div>
                    <b>
                      {product.name} · {item.size}
                    </b>
                    <small>
                      {item.sugar}% đường · {item.ice}% đá
                      {item.toppings.map((id) => " · " + TOPPINGS[id].name)}
                    </small>
                    <strong>
                      {money(unitPrice(product, item) * item.quantity)}
                    </strong>
                  </div>
                  <Quantity
                    min={0}
                    value={item.quantity}
                    onChange={(value) => onChange(index, value)}
                  />
                </div>
              );
            })}
            <div className="form-grid">
              <Field label="Tên người nhận">
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                />
              </Field>
              <Field label="Số điện thoại">
                <input
                  required
                  type="tel"
                  pattern="0[0-9]{9}"
                  title="10 chữ số, bắt đầu bằng 0"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Cách nhận món">
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
              >
                <option value="pickup">Nhận tại quán · Miễn phí</option>
                <option value="delivery">Giao hàng · 15.000 ₫</option>
              </select>
            </Field>
            {form.method === "delivery" && (
              <Field label="Địa chỉ giao hàng">
                <input
                  required
                  minLength={10}
                  maxLength={250}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </Field>
            )}
            <Field label="Ghi chú cho quán">
              <textarea
                maxLength={500}
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </Field>
            <p className="muted small">
              Nhận tại quán: Cổng trường C2-3 Đông Thọ. Mở cửa cả ngày. Thanh
              toán khi nhận món; quán sẽ gọi xác nhận đơn và khả năng giao hàng.
            </p>
            <div className="summary-row">
              <span>Tiền món</span>
              <b>{money(subtotal)}</b>
            </div>
            <div className="summary-row">
              <span>Phí giao hàng</span>
              <b>{money(deliveryFee(form.method))}</b>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="button full" disabled={busy}>
              {busy
                ? "Đang gửi đơn…"
                : `Đặt món · ${money(subtotal + deliveryFee(form.method))}`}
            </button>
          </fieldset>
        </form>
      )}
    </Modal>
  );
}
