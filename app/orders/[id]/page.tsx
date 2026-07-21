"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { moneyToVietnameseWords } from "@/lib/money-to-words";
import type { CompanySettings, Order, OrderItem } from "@/lib/types";

const fallback: CompanySettings={id:1,company_name:"VH LIGHTING",tagline:"Chuyên cung cấp thiết bị chiếu sáng",address:"",hotline:"0877 933 362",website:"vulighting.com",email:"vat.vuhoanglighting@gmail.com",tax_code:"",bank_name:"",bank_id:"",bank_account:"",bank_holder:"",bank_branch:"",logo_url:"",warranty_note:"Sản phẩm được bảo hành theo chính sách của nhà sản xuất.",invoice_footer:"Cảm ơn Quý khách đã tin tưởng VH Lighting."};
const money=(v:number)=>Number(v||0).toLocaleString("vi-VN");

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [company,setCompany]=useState<CompanySettings>(fallback);
  useEffect(() => { Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id).order("id"),
    supabase.from("company_settings").select("*").eq("id",1).maybeSingle()
  ]).then(([a,b,c])=>{setOrder(a.data);setItems(b.data||[]);if(c.data)setCompany({...fallback,...c.data});}); }, [id]);
  const qrUrl=useMemo(()=>{
    if(!order || !company.bank_id || !company.bank_account) return "";
    const bank=encodeURIComponent(company.bank_id.trim());
    const account=encodeURIComponent(company.bank_account.replace(/\s+/g,""));
    const params=new URLSearchParams({
      amount:String(Math.max(0,Math.round(Number(order.total||0)))),
      addInfo:order.order_no.slice(0,25),
      accountName:(company.bank_holder||"").slice(0,50)
    });
    return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?${params.toString()}`;
  },[company.bank_id,company.bank_account,company.bank_holder,order]);

  return <AuthGuard><AppShell title="Chi tiết đơn hàng" action={<button className="primary" onClick={() => window.print()}>In / Lưu PDF A4</button>}>
    {!order ? <div>Đang tải…</div> : <article className="invoice">
      <header className="invoice-head">
        <div className="invoice-brand-block">
          {company.logo_url?<img className="invoice-logo" src={company.logo_url} alt={company.company_name}/>:<div className="invoice-logo-text">VH</div>}
          <div><h1>{company.company_name}</h1>{company.tagline&&<p className="invoice-tagline">{company.tagline}</p>}
          {company.address&&<p><b>Địa chỉ:</b> {company.address}</p>}
          <p><b>Hotline:</b> {company.hotline||"—"}{company.website?<> · <b>Website:</b> {company.website}</>:null}</p>
          {company.email&&<p><b>Email:</b> {company.email}</p>}{company.tax_code&&<p><b>MST:</b> {company.tax_code}</p>}</div>
        </div>
        <div className="invoice-title-block"><h2>PHIẾU BÁN HÀNG</h2><div className="invoice-meta"><span>Số phiếu</span><b>{order.order_no}</b><span>Ngày lập</span><b>{new Date(order.created_at).toLocaleDateString("vi-VN")}</b><span>Thời gian</span><b>{new Date(order.created_at).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}</b></div></div>
      </header>

      <section className="invoice-customer">
        <div><span>Khách hàng</span><b>{order.customer_name||"Khách lẻ"}</b></div>
        <div><span>Điện thoại</span><b>{order.customer_phone||"—"}</b></div>
        <div className="full"><span>Địa chỉ / Công trình</span><b>{order.customer_address||"—"}</b></div>
      </section>

      <table className="invoice-table"><thead><tr><th>STT</th><th>Mã hàng</th><th>Tên sản phẩm</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>
        {items.map((x,i)=><tr key={i}><td>{i+1}</td><td>{x.sku}</td><td>{x.product_name}</td><td>{x.unit}</td><td>{x.quantity}</td><td>{money(x.unit_price)}</td><td>{money(x.line_total)}</td></tr>)}
      </tbody></table>

      <section className="invoice-finance">
        <div className="invoice-payment-box"><h3>THÔNG TIN THANH TOÁN</h3>
          {company.bank_account?<div className="invoice-payment-content"><div className="invoice-bank-details"><p><span>Ngân hàng</span><b>{company.bank_name||"—"}</b></p><p><span>Số tài khoản</span><b className="bank-account">{company.bank_account}</b></p><p><span>Chủ tài khoản</span><b>{company.bank_holder||"—"}</b></p>{company.bank_branch&&<p><span>Chi nhánh</span><b>{company.bank_branch}</b></p>}<p><span>Nội dung CK</span><b>{order.order_no}</b></p></div>{qrUrl&&<div className="invoice-qr"><img src={qrUrl} alt="QR chuyển khoản"/><span>Quét QR để chuyển khoản</span></div>}</div>:<p className="invoice-muted">Cập nhật số tài khoản tại mục Cài đặt hóa đơn.</p>}
        </div>
        <table className="invoice-total-table"><tbody><tr><td>Tạm tính</td><td>{money(order.subtotal)} ₫</td></tr><tr><td>Chiết khấu</td><td>- {money(order.discount)} ₫</td></tr><tr><td>Phí vận chuyển</td><td>+ {money(order.shipping_fee||0)} ₫</td></tr><tr className="grand-total"><td>TỔNG THANH TOÁN</td><td>{money(order.total)} ₫</td></tr></tbody></table>
      </section>

      <div className="invoice-in-words"><b>Bằng chữ:</b> <em>{moneyToVietnameseWords(order.total)}.</em></div>
      <section className="invoice-notes"><div><b>Ghi chú đơn hàng:</b><p>{order.note||"Không có"}</p></div><div><b>Chính sách bảo hành:</b><p>{company.warranty_note||"—"}</p></div></section>
      <section className="sign"><div><b>Người lập phiếu</b><span>(Ký và ghi rõ họ tên)</span></div><div><b>Khách hàng</b><span>(Ký và ghi rõ họ tên)</span></div><div><b>Người giao hàng</b><span>(Ký và ghi rõ họ tên)</span></div></section>
      <footer className="invoice-footer"><b>{company.invoice_footer}</b><span>{[company.hotline,company.website,company.email].filter(Boolean).join("  •  ")}</span></footer>
    </article>}
  </AppShell></AuthGuard>;
}
