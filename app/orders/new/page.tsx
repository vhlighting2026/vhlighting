"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Notice from "@/components/Notice";
import { supabase } from "@/lib/supabase";
import type { Customer, Product, OrderItem } from "@/lib/types";
import { Search, Plus, Trash2, Printer, Save, Landmark } from "lucide-react";

const money=(v:number)=>Number(v||0).toLocaleString("vi-VN");

export default function Page() {
 const router=useRouter();
 const[customers,setCustomers]=useState<Customer[]>([]); const[products,setProducts]=useState<Product[]>([]);
 const[customerId,setCustomerId]=useState(""); const[items,setItems]=useState<OrderItem[]>([]);
 const[discount,setDiscount]=useState(0); const[shippingFee,setShippingFee]=useState(0); const[note,setNote]=useState("");
 const[busy,setBusy]=useState(false); const[productQuery,setProductQuery]=useState(""); const[showResults,setShowResults]=useState(false); const[message,setMessage]=useState("");
 const customer=customers.find(x=>x.id===customerId); const now=new Date();

 useEffect(()=>{Promise.all([
   supabase.from("customers").select("*").order("name"),
   supabase.from("products").select("*").order("sku").order("name")
 ]).then(([a,b])=>{setCustomers(a.data||[]);setProducts(b.data||[]);if(a.error||b.error)setMessage(a.error?.message||b.error?.message||"Không tải được dữ liệu")})},[]);

 const searchResults=useMemo(()=>{const q=productQuery.trim().toLowerCase();if(!q)return[];return products.filter(x=>x.sku.toLowerCase().includes(q)||x.name.toLowerCase().includes(q)).slice(0,20)},[products,productQuery]);
 function addProduct(product:Product){setItems(current=>{const found=current.findIndex(x=>x.product_id===product.id);if(found>=0)return current.map((x,i)=>i===found?{...x,quantity:x.quantity+1,line_total:(x.quantity+1)*x.unit_price}:x);return[...current,{product_id:product.id,sku:product.sku,product_name:product.name,unit:product.unit,light_attribute:product.light_attribute||null,quantity:1,unit_price:Number(product.price),line_total:Number(product.price)}]});setProductQuery("");setShowResults(false)}
 function patch(i:number,key:"quantity"|"unit_price",value:number){const safe=key==="quantity"?Math.max(1,Math.floor(value||1)):Math.max(0,value||0);setItems(current=>current.map((x,n)=>n===i?{...x,[key]:safe,line_total:(key==="quantity"?safe:x.quantity)*(key==="unit_price"?safe:x.unit_price)}:x))}
 const subtotal=useMemo(()=>items.reduce((s,x)=>s+x.line_total,0),[items]); const total=Math.max(0,subtotal-discount+shippingFee);

 async function save(printAfter=false){setMessage("");if(!items.length){setMessage("Hãy thêm ít nhất một sản phẩm.");return}setBusy(true);const orderNo="VH-"+Date.now();const payload={order_no:orderNo,customer_id:customer?.id||null,customer_name:customer?.name||"Khách lẻ",customer_phone:customer?.phone||null,customer_address:customer?.address||null,subtotal,discount,shipping_fee:shippingFee,total,status:"Mới",note:note.trim()||null,payment_method:"Chuyển khoản",transfer_mode:null,transfer_content:null};const{data:order,error}=await supabase.from("orders").insert(payload).select().single();if(error){setMessage(error.message);setBusy(false);return}const{error:itemError}=await supabase.from("order_items").insert(items.map(x=>({...x,order_id:order.id})));if(itemError){await supabase.from("orders").delete().eq("id",order.id);setMessage(itemError.message);setBusy(false);return}router.push(`/orders/${order.id}${printAfter?"?print=1":""}`)}

 return <AuthGuard><AppShell title="Bán hàng"><div className="sales-screen sales-v3"><Notice text={message} type="error"/>
  <section className="sales-customer-grid"><label>Khách hàng<select value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Khách lẻ</option>{customers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label>Điện thoại<input readOnly value={customer?.phone||""}/></label><label>Địa chỉ / Công trình<input readOnly value={customer?.address||""}/></label><label>Ngày lập<input readOnly value={now.toLocaleDateString("vi-VN")}/></label><label>Giờ lập<input readOnly value={now.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}/></label></section>
  <section className="sales-products"><div className="product-picker"><label>Nhập mã hoặc tên sản phẩm</label><div className="search-box large"><Search size={18}/><input value={productQuery} placeholder="Nhập mã hoặc tên sản phẩm..." onFocus={()=>setShowResults(true)} onChange={e=>{setProductQuery(e.target.value);setShowResults(true)}} onKeyDown={e=>{if(e.key==="Enter"&&searchResults[0]){e.preventDefault();addProduct(searchResults[0])}}}/></div>{showResults&&productQuery&&<div className="product-results sales-results">{searchResults.map(x=><button key={x.id} type="button" onClick={()=>addProduct(x)}><div><span>💡</span><b>{x.sku} — {x.name}</b><small>{x.light_attribute||"Không thuộc tính"} · {x.unit} · {money(x.price)} đ</small></div><Plus size={17}/></button>)}{!searchResults.length&&<div className="empty-state">Không có sản phẩm phù hợp</div>}</div>}</div>
   <div className="table-wrap order-table"><table><thead><tr><th>STT</th><th>Tên sản phẩm</th><th>Ánh sáng</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th><th>Thao tác</th></tr></thead><tbody>{items.map((x,i)=><tr key={x.product_id||i}><td>{i+1}</td><td><b>{x.product_name}</b><small className="sales-sku">{x.sku}</small></td><td>{x.light_attribute||"—"}</td><td>{x.unit}</td><td><input className="mini" type="number" min="1" step="1" value={x.quantity} onChange={e=>patch(i,"quantity",Number(e.target.value))}/></td><td><input className="money" type="number" min="0" value={x.unit_price} onChange={e=>patch(i,"unit_price",Number(e.target.value))}/></td><td className="number-cell"><b>{money(x.line_total)} đ</b></td><td><button type="button" aria-label="Xóa sản phẩm" className="delete-icon" onClick={()=>setItems(v=>v.filter((_,n)=>n!==i))}><Trash2 size={16}/></button></td></tr>)}{!items.length&&<tr><td colSpan={8} className="empty-state">Nhập mã sản phẩm để thêm vào hóa đơn.</td></tr>}</tbody></table></div>
  </section>
  <section className="sales-bottom-grid sales-bottom-v3"><div className="sales-note"><label>Ghi chú đơn hàng</label><textarea placeholder="Có ghi chú thì nhập tại đây, không có có thể để trống." value={note} onChange={e=>setNote(e.target.value)}/></div><div className="sales-summary"><p><span>Tạm tính</span><b>{money(subtotal)} đ</b></p><label><span>Chiết khấu</span><input type="number" min="0" value={discount} onChange={e=>setDiscount(Math.max(0,Number(e.target.value)))}/></label><label><span>Phí vận chuyển</span><input type="number" min="0" value={shippingFee} onChange={e=>setShippingFee(Math.max(0,Number(e.target.value)))}/></label><div className="sales-grand"><span>TỔNG THANH TOÁN</span><b>{money(total)} đ</b></div></div><div className="bank-only-box"><Landmark size={20}/><div><b>Thanh toán: Chuyển khoản</b><p>Hóa đơn PDF tự động hiển thị QR tài khoản ngân hàng của công ty.</p></div></div></section>
  <footer className="sales-actions"><button className="primary inline" onClick={()=>save(false)} disabled={busy}><Save size={17}/>{busy?"Đang lưu…":"Lưu hóa đơn"}</button><button className="success-button inline" onClick={()=>save(true)} disabled={busy}><Printer size={17}/>In hóa đơn</button></footer>
 </div></AppShell></AuthGuard>
}
