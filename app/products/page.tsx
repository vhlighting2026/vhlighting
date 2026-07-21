"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Notice from "@/components/Notice";
import {supabase} from "@/lib/supabase";
import type {Product} from "@/lib/types";
import {Search,Trash2,Pencil} from "lucide-react";

const empty={sku:'',name:'',unit:'Cái',light_attribute:'Trắng',price:0,stock:0};
export default function Page(){
 const[data,setData]=useState<Product[]>([]); const[form,setForm]=useState(empty); const[query,setQuery]=useState(''); const[msg,setMsg]=useState(''); const[error,setError]=useState(false); const[busy,setBusy]=useState(false);
 async function load(){const{data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});if(error){setError(true);setMsg(error.message)}setData(data||[])}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>{const q=query.toLowerCase();return data.filter(x=>(x.sku+' '+x.name+' '+(x.light_attribute||'')).toLowerCase().includes(q))},[data,query]);
 async function add(e:FormEvent){e.preventDefault();setBusy(true);setMsg('');const payload={...form,sku:form.sku.trim().toUpperCase(),name:form.name.trim(),price:Math.max(0,Number(form.price)||0),stock:Math.max(0,Number(form.stock)||0)};const{error}=await supabase.from('products').insert(payload);setBusy(false);setError(!!error);setMsg(error?.message||'Đã lưu sản phẩm thành công');if(!error){setForm({...empty,sku:payload.sku});load()}}
 async function del(id:string){if(!confirm('Xóa sản phẩm này?'))return;const{error}=await supabase.from('products').delete().eq('id',id);if(error){setError(true);setMsg(error.message)}else load()}
 return <AuthGuard><AppShell title="Thêm sản phẩm"><div className="product-workspace">
  <form className="panel product-form-card" onSubmit={add}><h2>Thông tin sản phẩm</h2><Notice text={msg} type={error?'error':'ok'}/>
   <label>Mã sản phẩm <em>*</em><input required placeholder="VH-AT12W" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></label>
   <label>Tên sản phẩm <em>*</em><input required placeholder="Đèn âm trần 12W" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
   <label>Đơn vị tính <em>*</em><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option>Cái</option><option>Bộ</option><option>Mét</option><option>Cuộn</option><option>Hộp</option></select></label>
   <label>Thuộc tính (Ánh sáng) <em>*</em><select value={form.light_attribute} onChange={e=>setForm({...form,light_attribute:e.target.value})}><option>Trắng</option><option>Vàng</option><option>Trung tính</option><option>Ba màu</option><option>Không áp dụng</option></select></label>
   <label>Giá bán <em>*</em><div className="money-input-wrap"><input required type="number" min="0" value={form.price||''} onChange={e=>setForm({...form,price:Number(e.target.value)})}/><span>đ</span></div></label>
   <label>Tồn kho<input type="number" min="0" value={form.stock||''} onChange={e=>setForm({...form,stock:Number(e.target.value)})}/></label>
   <div className="form-actions product-actions"><button type="button" className="secondary" onClick={()=>setForm(empty)}>Hủy</button><button className="primary" disabled={busy}>{busy?'Đang lưu…':'Lưu sản phẩm'}</button></div>
  </form>
  <section className="panel product-list-card"><div className="panel-heading"><div><h2>Danh sách sản phẩm hiện có</h2></div></div><div className="product-filter-row"><div className="search-field"><Search size={17}/><input placeholder="Tìm theo mã hoặc tên sản phẩm..." value={query} onChange={e=>setQuery(e.target.value)}/></div><select><option>Tất cả thuộc tính</option><option>Trắng</option><option>Vàng</option><option>Trung tính</option></select></div>
   <div className="table-wrap"><table className="data-table compact-products"><thead><tr><th>Mã sản phẩm</th><th>Tên sản phẩm</th><th>Ánh sáng</th><th>ĐVT</th><th>Giá bán</th><th>Thao tác</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id}><td><b>{x.sku}</b></td><td>{x.name}</td><td>{x.light_attribute||'—'}</td><td>{x.unit}</td><td>{Number(x.price).toLocaleString('vi-VN')}</td><td><div className="row-actions"><button type="button" className="edit-icon" title="Sửa"><Pencil size={15}/></button><button type="button" className="delete-icon" onClick={()=>del(x.id)} title="Xóa"><Trash2 size={15}/></button></div></td></tr>)}{!filtered.length&&<tr><td colSpan={6} className="empty-state">Chưa có sản phẩm phù hợp.</td></tr>}</tbody></table></div>
   <div className="table-footer">Hiển thị {Math.min(filtered.length,1)} đến {filtered.length} của {data.length} sản phẩm</div>
  </section>
 </div></AppShell></AuthGuard>
}
