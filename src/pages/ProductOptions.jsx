import React, { useState } from "react";
import {
  SIZES,
  TOPPINGS,
  LEVELS,
  money,
  unitPrice,
} from "../../shared/catalog.js";
import { Modal, Quantity } from "../components.jsx";
export function ProductOptions({ product, onClose, onAdd }) {
  const [item, setItem] = useState({
    productId: product.id,
    size: "M",
    sugar: 100,
    ice: 100,
    toppings: [],
    quantity: 1,
  });
  const update = (key, value) =>
    setItem((current) => ({ ...current, [key]: value }));
  return (
    <Modal title={product.name} onClose={onClose}>
      <p className="muted">{product.description}</p>
      <div className="option-group">
        <b>Kích cỡ</b>
        <div className="choices">
          {Object.entries(SIZES).map(([size, price]) => (
            <button
              className={item.size === size ? "selected" : ""}
              key={size}
              onClick={() => update("size", size)}
            >
              {size} · {price ? "+" + money(price) : "Tiêu chuẩn"}
            </button>
          ))}
        </div>
      </div>
      {[
        ["sugar", "Mức đường"],
        ["ice", "Mức đá"],
      ].map(([key, label]) => (
        <div className="option-group" key={key}>
          <b>{label}</b>
          <div className="choices">
            {LEVELS.map((level) => (
              <button
                key={level}
                className={item[key] === level ? "selected" : ""}
                onClick={() => update(key, level)}
              >
                {level}%
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="option-group">
        <b>Thêm chút ngon</b>
        {Object.entries(TOPPINGS).map(([id, topping]) => (
          <label className="check-row" key={id}>
            <input
              type="checkbox"
              checked={item.toppings.includes(id)}
              onChange={(event) =>
                update(
                  "toppings",
                  event.target.checked
                    ? [...item.toppings, id]
                    : item.toppings.filter((x) => x !== id),
                )
              }
            />
            {topping.name}
            <span>+{money(topping.price)}</span>
          </label>
        ))}
      </div>
      <div className="modal-footer">
        <Quantity
          value={item.quantity}
          onChange={(value) => update("quantity", value)}
        />
        <button className="button" onClick={() => onAdd(item)}>
          Thêm vào giỏ · {money(unitPrice(product, item) * item.quantity)}
        </button>
      </div>
    </Modal>
  );
}
