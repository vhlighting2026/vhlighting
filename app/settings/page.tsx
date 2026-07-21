"use client";
import { FormEvent, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Notice from "@/components/Notice";
import { supabase } from "@/lib/supabase";
import type { CompanySettings } from "@/lib/types";

const defaults: CompanySettings = {
  id: 1, company_name: "VH LIGHTING", tagline: "Chuyên cung cấp thiết bị chiếu sáng",
  address: "", hotline: "0877 933 362", website: "vulighting.com",
  email: "vat.vuhoanglighting@gmail.com", tax_code: "", bank_name: "", bank_id: "",
  bank_account: "", bank_holder: "", bank_branch: "", logo_url: "",
  warranty_note: "Sản phẩm được bảo hành theo chính sách của nhà sản xuất. Vui lòng giữ phiếu bán hàng để được hỗ trợ.",
  invoice_footer: "Cảm ơn Quý khách đã tin tưởng và lựa chọn VH Lighting."
};

export default function Page(){
  const [form,setForm]=useState<CompanySettings>(defaults);
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{supabase.from("company_settings").select("*").eq("id",1).maybeSingle().then(({data})=>{if(data)setForm({...defaults,...data});});},[]);
  const set=(key:keyof CompanySettings,value:string)=>setForm(prev=>({...prev,[key]:value}));
  async function save(e:FormEvent){e.preventDefault();setSaving(true);setNotice("");setError("");
    const {error}=await supabase.from("company_settings").upsert(form,{onConflict:"id"});
    if(error)setError(error.message);else setNotice("Đã lưu thông tin công ty và tài khoản ngân hàng.");setSaving(false);
  }
  return <AuthGuard><AppShell title="Cài đặt hóa đơn"><form className="panel form-card settings-form" onSubmit={save}>
    <div className="panel-heading"><div><h2>Thông tin doanh nghiệp</h2><p>Dữ liệu này sẽ hiển thị trên phiếu bán hàng A4.</p></div><button className="primary" disabled={saving}>{saving?"Đang lưu…":"Lưu cài đặt"}</button></div>
    {notice&&<Notice text={notice}/>} {error&&<Notice text={error} type="error"/>}
    <div className="settings-section"><h3>Nhận diện và liên hệ</h3><div className="form-grid">
      <label>Tên đơn vị<input value={form.company_name} onChange={e=>set("company_name",e.target.value)} required/></label>
      <label>Dòng giới thiệu<input value={form.tagline||""} onChange={e=>set("tagline",e.target.value)}/></label>
      <label>Mã số thuế<input value={form.tax_code||""} onChange={e=>set("tax_code",e.target.value)}/></label>
      <label className="span-2">Địa chỉ<input value={form.address||""} onChange={e=>set("address",e.target.value)}/></label>
      <label>Hotline<input value={form.hotline||""} onChange={e=>set("hotline",e.target.value)}/></label>
      <label>Website<input value={form.website||""} onChange={e=>set("website",e.target.value)}/></label>
      <label>Email<input value={form.email||""} onChange={e=>set("email",e.target.value)}/></label>
      <label>Link logo (tùy chọn)<input value={form.logo_url||""} onChange={e=>set("logo_url",e.target.value)} placeholder="https://.../logo.png"/></label>
    </div></div>
    <div className="settings-section"><h3>Tài khoản nhận thanh toán</h3><div className="form-grid">
      <label>Ngân hàng<input value={form.bank_name||""} onChange={e=>set("bank_name",e.target.value)} placeholder="VD: Vietcombank"/></label>
      <label>Mã ngân hàng VietQR<input value={form.bank_id||""} onChange={e=>set("bank_id",e.target.value.trim())} placeholder="VD: VCB hoặc 970436"/><small>Dùng mã viết tắt hoặc BIN để tạo QR chuyển khoản.</small></label>
      <label>Số tài khoản<input value={form.bank_account||""} onChange={e=>set("bank_account",e.target.value)} placeholder="Nhập STK công ty"/></label>
      <label>Chủ tài khoản<input value={form.bank_holder||""} onChange={e=>set("bank_holder",e.target.value)} placeholder="Tên công ty/chủ tài khoản"/></label>
      <label>Chi nhánh<input value={form.bank_branch||""} onChange={e=>set("bank_branch",e.target.value)}/></label>
    </div></div>
    <div className="settings-section"><h3>Nội dung cuối hóa đơn</h3><div className="form-grid">
      <label className="span-2">Chính sách bảo hành<textarea value={form.warranty_note||""} onChange={e=>set("warranty_note",e.target.value)}/></label>
      <label>Thông điệp cảm ơn<textarea value={form.invoice_footer||""} onChange={e=>set("invoice_footer",e.target.value)}/></label>
    </div></div>
  </form></AppShell></AuthGuard>;
}
