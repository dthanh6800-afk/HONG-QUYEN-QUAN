import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Search,
  Leaf,
  Heart,
  Clock,
  Plus,
  CheckCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { menuOrder, money } from "../shared/catalog.js";
import { api } from "./api.js";
import { Modal } from "./components.jsx";
import { Admin } from "./pages/Admin.jsx";
import "./styles.css";
import { ProductOptions } from "./pages/ProductOptions.jsx";
import { Checkout } from "./pages/Checkout.jsx";

function productPhoto(product) {
  const photos = {
    oolong: "01_tra_sua_truyen_thong.jpg",
    "brown-sugar": "02_tra_sua_duong_nau.jpg",
    matcha: "03_tra_sua_matcha.jpg",
    jasmine: "04_tra_sua_khoai_mon.jpg",
    "caramel-pudding": "05_tra_sua_caramel_pudding.jpg",
    chocolate: "06_tra_sua_socola.jpg",
    berry: "07_tra_sua_dau.jpg",
    cookies: "08_tra_sua_cookies.jpg",
    "cheese-cream": "09_tra_sua_kem_cheese.jpg",
    "pearl-oolong": "10_tra_sua_o_long.jpg",
    "black-jelly-milk-tea": "11_tra_sua_thach_den.jpg",
    "thai-tea": "12_tra_sua_thai.jpg",
    "thai-jelly": "13_tra_sua_thai_thach.jpg",
    kiwi: "14_tra_sua_kiwi.jpg",
    peach: "15_tra_sua_dao.jpg",
    mango: "16_tra_sua_xoai.jpg",
    "fresh-milk-black-jelly": "17_sua_tuoi_thach_den.jpg",
  };
  return `/images/${photos[product.id] || "01_tra_sua_truyen_thong.jpg"}`;
}

function Store() {
  const [products, setProducts] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Tất cả"),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]),
    [cartOpen, setCartOpen] = useState(false),
    [success, setSuccess] = useState(null),
    [toast, setToast] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const priority = new Map(menuOrder.map((id, index) => [id, index]));
      setProducts(
        (await api("/products")).sort(
          (a, b) =>
            (priority.get(a.id) ?? menuOrder.length) -
              (priority.get(b.id) ?? menuOrder.length) ||
            a.name.localeCompare(b.name, "vi"),
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "Tất cả" || p.category === category) &&
          p.name
            .toLocaleLowerCase("vi")
            .includes(search.toLocaleLowerCase("vi")),
      ),
    [products, category, search],
  );
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  function add(item) {
    setCart((previous) => [...previous, item]);
    setSelected(null);
    setToast("Đã thêm món vào giỏ hàng");
  }
  return (
    <>
      <div className="announcement">
        <div className="announcement-track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <span className="announcement-copy" key={copy}>
              Pha chút an yên, thêm chút ngọt ngào <i>✦</i> Một ly trà, một ngày
              vui <i>✦</i> Hồng Quyên Quán trân trọng pha từng món mỗi ngày
              <i>✦</i> Chọn vị yêu thích, quán gửi niềm vui đến bạn
            </span>
          ))}
        </div>
      </div>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Hồng Quyên Quán trang chủ">
          <span className="brand-mark">
            <Leaf size={23} />
          </span>
          <span>
            Hồng Quyên Quán
            <span className="brand-sub">TRÀ NGON · CHUYỆN NHỎ</span>
          </span>
        </a>
        <nav>
          <a className="active" href="#menu">
            Thực đơn
          </a>
          <a href="#story">Chuyện của trà</a>
          <a href="#contact">Ghé quán</a>
        </nav>
        <button
          className="cart-button"
          aria-label={`Giỏ hàng, ${count} món`}
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag size={19} />
          <span>Giỏ hàng</span>
          <b>{count}</b>
        </button>
      </header>
      <main>
        <section className="hero hero-banner">
          <a href="#menu" aria-label="Xem thực đơn Hồng Quyên Quán">
            <img
              src="/images/Banner%20H%E1%BB%93ng%20Quy%C3%AAn%20Qu%C3%A1n.png"
              alt="Banner Hồng Quyên Quán — Trà sữa, cà phê, trà chanh và đồ ăn vặt"
            />
          </a>
        </section>
        <section className="values">
          <span>
            <Leaf />
            Trà thơm chọn lọc
          </span>
          <span>
            <Heart />
            Pha mới mỗi đơn
          </span>
          <span>
            <ShoppingBag />
            Tùy chọn theo gu
          </span>
          <span>
            <Clock />
            Nhận món tiện lợi
          </span>
        </section>
        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <div className="eyebrow">MỖI NGÀY, MỘT VỊ YÊU THÍCH</div>
              <h2>Hôm nay bạn uống gì?</h2>
            </div>
            <p>
              Tìm một ly hợp gu,
              <br />
              để ngày thêm dễ chịu.
            </p>
          </div>
          <div className="menu-toolbar">
            <div className="categories">
              {["Tất cả", "Trà sữa", "Sữa tươi"].map((name) => (
                <button
                  key={name}
                  className={category === name ? "selected" : ""}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            <label className="search">
              <Search size={18} />
              <input
                aria-label="Tìm món"
                placeholder="Tìm món bạn thích…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          {loading ? (
            <p className="empty">Đang pha thực đơn cho bạn…</p>
          ) : error ? (
            <div className="empty error" role="alert">
              {error}
              <br />
              <button onClick={load}>Thử lại</button>
            </div>
          ) : !filtered.length ? (
            <p className="empty">
              Chưa tìm thấy món. Bạn thử từ khóa khác nhé.
            </p>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => (
                <article className="product-card" key={product.id}>
                  <button
                    className="product-art"
                    onClick={() => setSelected(product)}
                    disabled={!product.available}
                    aria-label={`Chọn ${product.name}`}
                    style={{ "--drink-bg": product.color + "35" }}
                  >
                    {product.tag && (
                      <span className="product-tag">{product.tag}</span>
                    )}
                    <img
                      className="product-photo"
                      src={productPhoto(product)}
                      alt={`Ảnh minh họa ${product.name}`}
                      loading="lazy"
                    />
                    <span className="photo-credit">Ảnh minh họa</span>
                  </button>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-bottom">
                      <b>
                        {money(product.price)}
                        <small> / M</small>
                      </b>
                      <button
                        className="add-button"
                        disabled={!product.available}
                        onClick={() => setSelected(product)}
                        aria-label={`Thêm ${product.name}`}
                      >
                        {product.available ? <Plus size={20} /> : "Hết"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="story" id="story">
          <div className="story-symbol">
            <Leaf size={66} />
            <span>HỒNG QUYÊN QUÁN</span>
          </div>
          <div>
            <div className="eyebrow">CHUYỆN CỦA TRÀ</div>
            <h2>
              Niềm vui từ những
              <br />
              điều giản đơn.
            </h2>
            <p>
              Chúng tôi tin rằng một ly trà ngon không cần cầu kỳ. Chỉ cần hương
              trà vừa vặn, chút ngọt đúng gu và sự chăm chút trong từng lần pha.
            </p>
            <a href="#menu">
              Cùng tìm vị trà của bạn <ArrowRight size={18} />
            </a>
          </div>
        </section>
        <section className="contact" id="contact">
          <div>
            <div className="eyebrow">HẸN BẠN MỘT LY TRÀ</div>
            <h2>Cổng trường C2-3 Đông Thọ</h2>
            <p>
              <MapPin size={17} /> Địa chỉ: Cổng trường C2-3 Đông Thọ
            </p>
            <p>
              <Clock size={17} /> Mở cửa cả ngày
            </p>
            <p>
              <Phone size={17} /> Hotline:{" "}
              <a href="tel:0364011302">0364 011 302</a>
            </p>
          </div>
          <a className="button light" href="#menu">
            Xem thực đơn <ArrowUpRight size={19} />
          </a>
        </section>
      </main>
      <footer>
        <a className="brand" href="/">
          Hồng Quyên Quán <Leaf size={20} />
        </a>
        <span>
          © {new Date().getFullYear()} Hồng Quyên Quán · Website chính thức
        </span>
        <a href="/admin">Quản trị</a>
      </footer>
      {selected && (
        <ProductOptions
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={add}
        />
      )}{" "}
      {cartOpen && (
        <Checkout
          cart={cart}
          products={products}
          onClose={() => setCartOpen(false)}
          onChange={(index, quantity) =>
            setCart((current) =>
              current
                .map((item, i) => (i === index ? { ...item, quantity } : item))
                .filter((item) => item.quantity > 0),
            )
          }
          onSuccess={(order) => {
            setSuccess(order);
            setCart([]);
            setCartOpen(false);
          }}
        />
      )}{" "}
      {success && (
        <Modal title="Đã gửi đơn của bạn!" onClose={() => setSuccess(null)}>
          <div className="empty">
            <CheckCircle size={52} />
            <h3>Cảm ơn bạn đã chọn Hồng Quyên Quán</h3>
            <p>
              Mã đơn: <b>{success.id.slice(0, 8).toUpperCase()}</b>
            </p>
            <p>
              Tổng tiền: <b>{money(success.total)}</b>
            </p>
            <p>
              Đơn đang chờ quán xác nhận. Vui lòng giữ điện thoại để quán liên
              hệ.
            </p>
            <button className="button" onClick={() => setSuccess(null)}>
              Tiếp tục khám phá
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  location.pathname.startsWith("/admin") ? <Admin /> : <Store />,
);
