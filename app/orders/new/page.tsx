"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import type { Customer, Product, OrderItem } from "@/lib/types";
import { Search, Plus, Trash2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("customers").select("*").order("name"),
      supabase.from("products").select("*").order("sku").order("name"),
    ]).then(([a, b]) => { setCustomers(a.data || []); setProducts(b.data || []); });
  }, []);

  const searchResults = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(x => x.sku.toLowerCase().includes(q) || x.name.toLowerCase().includes(q)).slice(0, 20);
  }, [products, productQuery]);

  function addProduct(product: Product) {
    setItems(current => {
      const found = current.findIndex(x => x.product_id === product.id);
      if (found >= 0) return current.map((x, i) => i === found ? { ...x, quantity: x.quantity + 1, line_total: (x.quantity + 1) * x.unit_price } : x);
      return [...current, { product_id: product.id, sku: product.sku, product_name: product.name, unit: product.unit, quantity: 1, unit_price: Number(product.price), line_total: Number(product.price) }];
    });
    setProductQuery("");
    setShowResults(false);
  }

  function patch(i: number, key: "quantity" | "unit_price", value: number) {
    setItems(current => current.map((x, n) => n === i ? { ...x, [key]: value, line_total: (key === "quantity" ? value : x.quantity) * (key === "unit_price" ? value : x.unit_price) } : x));
  }

  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.line_total, 0), [items]);
  const total = Math.max(0, subtotal - discount + shippingFee);

  async function save() {
    if (!items.length) return alert("Hãy thêm ít nhất một sản phẩm");
    const customer = customers.find(x => x.id === customerId);
    setBusy(true);
    const orderNo = "VH-" + new Date().toISOString().slice(0, 10).replaceAll("-", "") + "-" + Math.floor(1000 + Math.random() * 9000);
    const { data: order, error } = await supabase.from("orders").insert({ order_no: orderNo, customer_id: customer?.id || null, customer_name: customer?.name || "Khách lẻ", customer_phone: customer?.phone || null, customer_address: customer?.address || null, subtotal, discount, shipping_fee: shippingFee, total, status: "Mới", note }).select().single();
    if (error) { alert(error.message); setBusy(false); return; }
    const { error: itemError } = await supabase.from("order_items").insert(items.map(x => ({ ...x, order_id: order.id })));
    if (itemError) alert(itemError.message); else router.push("/orders/" + order.id);
    setBusy(false);
  }

  return <AuthGuard><AppShell title="Tạo đơn hàng">
    <div className="panel order-editor">
      <div className="order-top-grid">
        <div><label>Khách hàng</label><select value={customerId} onChange={e => setCustomerId(e.target.value)}><option value="">Khách lẻ</option>{customers.map(x => <option key={x.id} value={x.id}>{x.name} — {x.phone}</option>)}</select></div>
        <div className="product-picker"><label>Nhập mã hoặc tên sản phẩm</label><div className="search-box large"><Search size={18}/><input value={productQuery} placeholder="Ví dụ: VH-AT hoặc âm trần…" onFocus={() => setShowResults(true)} onChange={e => { setProductQuery(e.target.value); setShowResults(true); }}/></div>
          {showResults && productQuery && <div className="product-results">{searchResults.map(x => <button key={x.id} type="button" onClick={() => addProduct(x)}><div><span className="sku-pill">{x.sku}</span><b>{x.name}</b><small>{x.unit} · Tồn {x.stock}</small></div><strong>{Number(x.price).toLocaleString("vi-VN")} ₫</strong><Plus size={17}/></button>)}{!searchResults.length && <div className="empty-state">Không có sản phẩm phù hợp</div>}</div>}
        </div>
      </div>

      <div className="table-wrap order-table"><table><thead><tr><th>STT</th><th>Mã</th><th>Tên sản phẩm</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th><th></th></tr></thead><tbody>
        {items.map((x, i) => <tr key={x.product_id || i}><td>{i + 1}</td><td><span className="sku-pill">{x.sku}</span></td><td><b>{x.product_name}</b></td><td>{x.unit}</td><td><input className="mini" type="number" min="1" value={x.quantity} onChange={e => patch(i, "quantity", Number(e.target.value))}/></td><td><input className="money" type="number" min="0" value={x.unit_price} onChange={e => patch(i, "unit_price", Number(e.target.value))}/></td><td className="number-cell"><b>{x.line_total.toLocaleString("vi-VN")} ₫</b></td><td><button className="icon-danger" onClick={() => setItems(v => v.filter((_, n) => n !== i))}><Trash2 size={16}/></button></td></tr>)}
        {!items.length && <tr><td colSpan={8} className="empty-state">Nhập mã sản phẩm phía trên để thêm vào đơn.</td></tr>}
      </tbody></table></div>

      <div className="checkout"><div><label>Ghi chú</label><textarea placeholder="Ghi chú giao hàng, bảo hành hoặc thanh toán…" value={note} onChange={e => setNote(e.target.value)}/></div><div className="totals">
        <p>Tạm tính <b>{subtotal.toLocaleString("vi-VN")} ₫</b></p>
        <label>Chiết khấu</label><div className="money-input-wrap"><input type="number" min="0" value={discount} onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}/><span>₫</span></div>
        <label>Phí vận chuyển</label><div className="money-input-wrap"><input type="number" min="0" value={shippingFee} onChange={e => setShippingFee(Math.max(0, Number(e.target.value)))}/><span>₫</span></div>
        <h3>Tổng cộng <b>{total.toLocaleString("vi-VN")} ₫</b></h3><button className="primary" onClick={save} disabled={busy}>{busy ? "Đang lưu…" : "Lưu và xem đơn"}</button></div></div>
    </div>
  </AppShell></AuthGuard>;
}
