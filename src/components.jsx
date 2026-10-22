import React from "react";
import { X, Minus, Plus } from "lucide-react";
export function Cup({ color = "#cfac7f", large = false }) {
  return (
    <div
      className={`cup-scene ${large ? "large" : ""}`}
      style={{ "--tea": color }}
      aria-hidden="true"
    >
      <div className="cup-straw" />
      <div className="cup-lid" />
      <div className="cup-body">
        <div className="cup-milk" />
        <div className="cup-logo">
          hồng
          <br />
          <b>quyên</b>
          <span>QUÁN · TEA & JOY</span>
        </div>
        <div className="pearls">
          ● ● ● ●<br /> ● ● ●<br />● ● ● ●
        </div>
      </div>
      <div className="cup-shadow" />
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  return (
    <dialog
      open
      ref={(node) => {
        if (node && !node.dataset.ready) {
          node.dataset.ready = "true";
          node.close();
          node.showModal();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="modal-header">
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Đóng">
          <X />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Quantity({ value, onChange, min = 1 }) {
  return (
    <div className="quantity">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Giảm số lượng"
      >
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= 20}
        aria-label="Tăng số lượng"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
