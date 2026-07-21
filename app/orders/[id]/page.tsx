"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Pencil, Printer, Save, X } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Notice from "@/components/Notice";
import { supabase } from "@/lib/supabase";
import type { CompanySettings, Order, OrderItem } from "@/lib/types";

const fallback: CompanySettings={id:1,company_name:"VH LIGHTING",tagline:"Chuyên cung cấp thiết bị chiếu sáng",address:"",hotline:"0877 933 362",website:"vulighting.com",email:"vat.vuhoanglighting@gmail.com",tax_code:"",bank_name:"TPBank",bank_id:"",bank_account:"",bank_holder:"VU DO HOANG",bank_branch:"",logo_url:"",signature_url:"",transfer_content_mode:"order",transfer_content_default:"THANH TOAN HD",warranty_note:"",invoice_footer:"",invoice_creator:"Vũ Lighting"};
const money=(v:number)=>Number(v||0).toLocaleString("vi-VN");
type EditableOrder={customer_name:string;customer_phone:string;customer_address:string;note:string;transfer_mode:"order"|"customer_input";transfer_content:string};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [company,setCompany]=useState<CompanySettings>(fallback);
  const [editing,setEditing]=useState(false);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState<EditableOrder>({customer_name:"",customer_phone:"",customer_address:"",note:"",transfer_mode:"order",transfer_content:""});

  async function load(){
    const [a,b,c]=await Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase.from("order_items").select("*").eq("order_id", id).order("id"),
      supabase.from("company_settings").select("*").eq("id",1).maybeSingle()
    ]);
    const nextCompany={...fallback,...(c.data||{})};
    setCompany(nextCompany);
    if(a.data){
      setOrder(a.data);
      setForm({customer_name:a.data.customer_name||"Khách lẻ",customer_phone:a.data.customer_phone||"",customer_address:a.data.customer_address||"",note:a.data.note||"",transfer_mode:a.data.transfer_mode||nextCompany.transfer_content_mode||"order",transfer_content:a.data.transfer_content||nextCompany.transfer_content_default||"THANH TOAN HD"});
    }
    setItems((b.data||[]) as OrderItem[]);
  }
  useEffect(()=>{load();},[id]);

  async function saveInfo(e:FormEvent){
    e.preventDefault(); setSaving(true); setMessage("");
    const payload={customer_name:form.customer_name.trim()||"Khách lẻ",customer_phone:form.customer_phone.trim()||null,customer_address:form.customer_address.trim()||null,note:form.note.trim()||null,transfer_mode:form.transfer_mode,transfer_content:form.transfer_mode==="order"?(form.transfer_content.trim()||null):null};
    const {error}=await supabase.from("orders").update(payload).eq("id",id);
    setSaving(false);
    if(error){setMessage(error.message);return;}
    setEditing(false);setMessage("Đã cập nhật thông tin phiếu bán hàng.");await load();
  }

  const transferMode=order?.transfer_mode||company.transfer_content_mode||"order";
  const transferContent=transferMode==="order"?(order?.transfer_content||company.transfer_content_default||"THANH TOAN HD").trim():"";
  const qrUrl=useMemo(()=>{
    if(!order || !company.bank_id || !company.bank_account) return "";
    const bank=encodeURIComponent(company.bank_id.trim());
    const account=encodeURIComponent(company.bank_account.replace(/\s+/g,""));
    const params=new URLSearchParams({amount:String(Math.max(0,Math.round(Number(order.total||0)))),accountName:(company.bank_holder||"").slice(0,50)});
    if(transferMode==="order"&&transferContent) params.set("addInfo",transferContent);
    return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?${params.toString()}`;
  },[company.bank_id,company.bank_account,company.bank_holder,order,transferMode,transferContent]);

  return <AuthGuard><AppShell title="Chi tiết đơn hàng" action={<div className="invoice-actions"><button className="secondary inline" onClick={()=>setEditing(v=>!v)}><Pencil size={16}/>Sửa thông tin</button><button className="primary inline" onClick={()=>window.print()}><Printer size={16}/>In / Lưu PDF A4</button></div>}>
    {message&&<Notice text={message} type={message.startsWith("Đã")?"ok":"error"}/>} 
    {editing&&<form className="panel invoice-edit-form" onSubmit={saveInfo}><div className="panel-heading"><div><h2>Chỉnh sửa thông tin phiếu</h2><p>Thông tin khách hàng, ghi chú và nội dung chuyển khoản có thể sửa riêng cho đơn này.</p></div></div><div className="form-grid"><label>Khách hàng<input value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})}/></label><label>Điện thoại<input value={form.customer_phone} onChange={e=>setForm({...form,customer_phone:e.target.value})}/></label><label className="span-2">Địa chỉ / Công trình<input value={form.customer_address} onChange={e=>setForm({...form,customer_address:e.target.value})}/></label><label className="span-2">Quy tắc nội dung chuyển khoản<select value={form.transfer_mode} onChange={e=>setForm({...form,transfer_mode:e.target.value as "order"|"customer_input"})}><option value="order">Theo đơn hàng</option><option value="customer_input">Khách hàng tự nhập</option></select></label>{form.transfer_mode==="order"&&<label className="span-2">Nội dung chuyển khoản<input value={form.transfer_content} onChange={e=>setForm({...form,transfer_content:e.target.value})}/></label>}<label className="span-2">Ghi chú đơn hàng<textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label></div><div className="form-actions"><button type="button" className="secondary inline" onClick={()=>setEditing(false)}><X size={16}/>Đóng</button><button className="primary inline" disabled={saving}><Save size={16}/>{saving?"Đang lưu…":"Lưu thay đổi"}</button></div></form>}
    {!order ? <div>Đang tải…</div> : <article className="invoice invoice-v12">
      <div className="invoice-top-accent"/>
      <header className="invoice-head-v12">
        <div className="invoice-brand-v12">
          {company.logo_url?<img className="invoice-logo-v12" src={company.logo_url} alt={company.company_name}/>:<div className="invoice-logo-fallback-v12"><b>VH</b><small>LIGHTING</small></div>}
          <div><h1>{company.company_name}</h1>{company.tagline&&<p className="invoice-tagline-v12">{company.tagline}</p>}<p><b>Hotline:</b> {company.hotline||"—"}</p>{company.website&&<p><b>Website:</b> {company.website}</p>}{company.email&&<p><b>Email:</b> {company.email}</p>}{company.address&&<p><b>Địa chỉ:</b> {company.address}</p>}</div>
        </div>
        <div className="invoice-title-v12"><h2>PHIẾU BÁN HÀNG</h2><div className="title-divider"/><div className="invoice-meta-v12"><span>Ngày lập:</span><b>{new Date(order.created_at).toLocaleDateString("vi-VN")}</b><span>Giờ lập:</span><b>{new Date(order.created_at).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}</b></div></div>
      </header>
      <section className="invoice-customer-v12"><div><span>Khách hàng:</span><b>{order.customer_name||"Khách lẻ"}</b></div><div><span>Điện thoại:</span><b>{order.customer_phone||"—"}</b></div><div className="wide"><span>Địa chỉ / Công trình:</span><b>{order.customer_address||"—"}</b></div></section>
      <table className="invoice-table invoice-table-v12"><thead><tr><th>STT</th><th>TÊN SẢN PHẨM</th><th>THUỘC TÍNH</th><th>ĐVT</th><th>SL</th><th>ĐƠN GIÁ</th><th>THÀNH TIỀN</th></tr></thead><tbody>{items.map((x,i)=><tr key={x.id||i}><td><span className="row-number">{i+1}</span></td><td>{x.product_name}</td><td>{x.light_attribute||"—"}</td><td>{x.unit}</td><td>{money(x.quantity)}</td><td>{money(x.unit_price)}</td><td>{money(x.line_total)}</td></tr>)}</tbody></table>
      <section className="invoice-finance-v12">
        <div className="payment-card-v12"><h3>THANH TOÁN CHUYỂN KHOẢN</h3><div className="payment-body-v12"><div><strong className="bank-name-v12">{company.bank_name||"NGÂN HÀNG"}</strong><p><span>Số tài khoản</span><b>{company.bank_account||"—"}</b></p><p><span>Chủ tài khoản</span><b>{company.bank_holder||"—"}</b></p>{company.bank_branch&&<p><span>Chi nhánh</span><b>{company.bank_branch}</b></p>}<p className="transfer-copy"><span>Nội dung chuyển khoản</span><b>{transferMode==="order"?(transferContent||"—"):"Khách hàng tự nhập"}</b></p></div>{qrUrl?<img className="invoice-qr-v12" src={qrUrl} alt="QR thanh toán"/>:<div className="invoice-qr-empty-v12">Cập nhật VietQR<br/>trong Cài đặt</div>}</div></div>
        <div className="total-card-v12"><h3>TỔNG THANH TOÁN</h3><div className="total-lines-v12"><p><span>Tạm tính</span><b>{money(order.subtotal)} ₫</b></p><p><span>Chiết khấu</span><b>- {money(order.discount)} ₫</b></p><p><span>Phí vận chuyển</span><b>+ {money(order.shipping_fee||0)} ₫</b></p></div><div className="grand-total-v12"><span>TỔNG THANH TOÁN</span><b>{money(order.total)} ₫</b></div></div>
      </section>
      <section className="invoice-note-v12"><b>GHI CHÚ ĐƠN HÀNG</b><p>{order.note||"Không có ghi chú."}</p></section>
      <section className="sign-v12"><div><b>NGƯỜI LẬP PHIẾU</b><strong>{company.invoice_creator||"Vũ Lighting"}</strong><span>(Ký và ghi rõ họ tên)</span>{company.signature_url&&<img src={company.signature_url} alt="Chữ ký người lập phiếu"/>}</div><div><b>KHÁCH HÀNG</b><span>(Ký và ghi rõ họ tên)</span><i/></div></section>
      <footer className="invoice-footer-v12"><span>☎ {company.hotline||"—"}</span><span>◎ {company.website||"—"}</span><span>✉ {company.email||"—"}</span></footer>
    </article>}
  </AppShell></AuthGuard>;
}
