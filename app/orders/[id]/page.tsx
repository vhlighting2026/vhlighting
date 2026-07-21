"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Pencil, Printer, Save, X } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Notice from "@/components/Notice";
import { supabase } from "@/lib/supabase";
import type { CompanySettings, Order, OrderItem } from "@/lib/types";

const fallback: CompanySettings={id:1,company_name:"VH LIGHTING",tagline:"Chuyên cung cấp thiết bị chiếu sáng",address:"",hotline:"0877 933 362",website:"vulighting.com",email:"vat.vuhoanglighting@gmail.com",tax_code:"",bank_name:"TPBank",bank_id:"",bank_account:"",bank_holder:"VU DO HOANG",bank_branch:"",logo_url:"",warranty_note:"",invoice_footer:"",invoice_creator:"Vũ Lighting"};
const money=(v:number)=>Number(v||0).toLocaleString("vi-VN");

type EditableOrder={customer_name:string;customer_phone:string;customer_address:string;note:string};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [company,setCompany]=useState<CompanySettings>(fallback);
  const [editing,setEditing]=useState(false);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState<EditableOrder>({customer_name:"",customer_phone:"",customer_address:"",note:""});

  async function load(){
    const [a,b,c]=await Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase.from("order_items").select("*").eq("order_id", id).order("id"),
      supabase.from("company_settings").select("*").eq("id",1).maybeSingle()
    ]);
    if(a.data){
      setOrder(a.data);
      setForm({customer_name:a.data.customer_name||"Khách lẻ",customer_phone:a.data.customer_phone||"",customer_address:a.data.customer_address||"",note:a.data.note||""});
    }
    setItems((b.data||[]) as OrderItem[]);
    if(c.data)setCompany({...fallback,...c.data});
  }
  useEffect(()=>{load();},[id]);

  async function saveInfo(e:FormEvent){
    e.preventDefault();
    setSaving(true);setMessage("");
    const payload={customer_name:form.customer_name.trim()||"Khách lẻ",customer_phone:form.customer_phone.trim()||null,customer_address:form.customer_address.trim()||null,note:form.note.trim()||null};
    const {error}=await supabase.from("orders").update(payload).eq("id",id);
    setSaving(false);
    if(error){setMessage(error.message);return;}
    setEditing(false);setMessage("Đã cập nhật thông tin phiếu bán hàng.");await load();
  }

  const qrUrl=useMemo(()=>{
    if(!order || !company.bank_id || !company.bank_account) return "";
    const bank=encodeURIComponent(company.bank_id.trim());
    const account=encodeURIComponent(company.bank_account.replace(/\s+/g,""));
    const params=new URLSearchParams({amount:String(Math.max(0,Math.round(Number(order.total||0)))),addInfo:`THANH TOAN DON HANG ${order.order_no.replace(/\W/g, "")}`,accountName:(company.bank_holder||"").slice(0,50)});
    return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?${params.toString()}`;
  },[company.bank_id,company.bank_account,company.bank_holder,order]);

  return <AuthGuard><AppShell title="Chi tiết đơn hàng" action={<div className="invoice-actions"><button className="secondary inline" onClick={()=>setEditing(v=>!v)}><Pencil size={16}/>Sửa thông tin</button><button className="primary inline" onClick={()=>window.print()}><Printer size={16}/>In / Lưu PDF A4</button></div>}>
    {message&&<Notice text={message} type={message.startsWith("Đã")?"ok":"error"}/>} 
    {editing&&<form className="panel invoice-edit-form" onSubmit={saveInfo}><div className="panel-heading"><div><h2>Chỉnh sửa thông tin phiếu</h2><p>Các thay đổi sẽ được lưu và hiển thị ngay trên bản in.</p></div></div><div className="form-grid"><label>Khách hàng<input value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})}/></label><label>Điện thoại<input value={form.customer_phone} onChange={e=>setForm({...form,customer_phone:e.target.value})}/></label><label className="span-2">Địa chỉ / Công trình<input value={form.customer_address} onChange={e=>setForm({...form,customer_address:e.target.value})}/></label><label className="span-2">Ghi chú đơn hàng<textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label></div><div className="form-actions"><button type="button" className="secondary inline" onClick={()=>setEditing(false)}><X size={16}/>Đóng</button><button className="primary inline" disabled={saving}><Save size={16}/>{saving?"Đang lưu…":"Lưu thay đổi"}</button></div></form>}
    {!order ? <div>Đang tải…</div> : <article className="invoice invoice-v11">
      <header className="invoice-head-new">
        <div className="invoice-brand-block">
          {company.logo_url?<img className="invoice-logo-new" src={company.logo_url} alt={company.company_name}/>:<div className="invoice-logo-text-new">VH</div>}
          <div className="invoice-company-copy"><h1>{company.company_name}</h1>{company.tagline&&<p className="invoice-tagline">{company.tagline}</p>}{company.address&&<p><b>Địa chỉ:</b> {company.address}</p>}<p><b>Hotline:</b> {company.hotline||"—"}</p>{company.website&&<p><b>Website:</b> {company.website}</p>}{company.email&&<p><b>Email:</b> {company.email}</p>}</div>
        </div>
        <div className="invoice-title-block-new"><h2>PHIẾU BÁN HÀNG</h2><div className="invoice-meta-new"><span>Ngày lập</span><b>{new Date(order.created_at).toLocaleDateString("vi-VN")}</b><span>Giờ lập</span><b>{new Date(order.created_at).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}</b></div></div>
      </header>

      <section className="invoice-customer-new"><div><span>Khách hàng</span><b>{order.customer_name||"Khách lẻ"}</b></div><div><span>Điện thoại</span><b>{order.customer_phone||"—"}</b></div><div className="full"><span>Địa chỉ / Công trình</span><b>{order.customer_address||"—"}</b></div></section>

      <table className="invoice-table invoice-table-new"><thead><tr><th>STT</th><th>Tên sản phẩm</th><th>Thuộc tính</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{items.map((x,i)=><tr key={x.id||i}><td>{i+1}</td><td>{x.product_name}</td><td>{x.light_attribute||"—"}</td><td>{x.unit}</td><td>{x.quantity}</td><td>{money(x.unit_price)}</td><td>{money(x.line_total)}</td></tr>)}</tbody></table>

      <section className="invoice-finance-new">
        <div className="invoice-payment-card"><div className="bank-heading"><strong>{company.bank_name||"NGÂN HÀNG"}</strong></div><div className="payment-grid"><div className="bank-copy"><p><span>Số tài khoản</span><b>{company.bank_account||"—"}</b></p><p><span>Chủ tài khoản</span><b>{company.bank_holder||"—"}</b></p>{company.bank_branch&&<p><span>Chi nhánh</span><b>{company.bank_branch}</b></p>}</div>{qrUrl?<img className="invoice-qr-large" src={qrUrl} alt="QR thanh toán"/>:<div className="invoice-qr-placeholder">Cập nhật VietQR<br/>trong Cài đặt</div>}</div></div>
        <table className="invoice-total-table invoice-total-table-new"><tbody><tr><td>Tạm tính</td><td>{money(order.subtotal)} ₫</td></tr><tr><td>Chiết khấu</td><td>- {money(order.discount)} ₫</td></tr><tr><td>Phí vận chuyển</td><td>+ {money(order.shipping_fee||0)} ₫</td></tr><tr className="grand-total"><td>TỔNG THANH TOÁN</td><td>{money(order.total)} ₫</td></tr></tbody></table>
      </section>

      <section className="invoice-transfer-new"><b>Nội dung chuyển khoản</b><p>THANH TOAN DON HANG {order.order_no.replace(/\W/g, "")}</p></section><section className="invoice-note-new"><b>Ghi chú đơn hàng</b><p>{order.note||"Không có ghi chú."}</p></section>
      <section className="sign sign-new"><div><b>Người lập phiếu</b><strong>{company.invoice_creator||"Vũ Lighting"}</strong><span>(Ký và ghi rõ họ tên)</span></div><div><b>Khách hàng</b><span>(Ký và ghi rõ họ tên)</span></div></section><footer className="invoice-decor-footer"><div className="gold-wave"/><p>— &nbsp; Cảm ơn quý khách đã tin tưởng và ủng hộ! &nbsp; —</p></footer>
    </article>}
  </AppShell></AuthGuard>;
}
