"use client";

import {ChangeEvent,FormEvent,useEffect,useMemo,useRef,useState} from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Notice from "@/components/Notice";
import {supabase} from "@/lib/supabase";
import type {Product} from "@/lib/types";
import * as XLSX from "xlsx";
import {
  CheckSquare,Download,FileDown,FileSpreadsheet,FileUp,
  Pencil,RefreshCw,Search,Square,Trash2,Upload,X
} from "lucide-react";

const empty={sku:'',name:'',unit:'Cái',light_attribute:'Trắng',price:0,stock:0};

type ImportRow={
  sku:string;
  name:string;
  unit:string;
  light_attribute:string;
  price:number;
  stock:number;
};

type ImportPreview={rows:ImportRow[]; invalid:number; fileName:string};

const normalize=(value:unknown)=>String(value??'').trim();
const normalizeKey=(value:unknown)=>normalize(value).toLowerCase().replace(/\s+/g,' ');
const numberValue=(value:unknown)=>{
  if(typeof value==='number') return Number.isFinite(value)?value:0;
  const raw=normalize(value).replace(/\s/g,'').replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,'');
  const parsed=Number(raw);
  return Number.isFinite(parsed)?parsed:0;
};

function getCell(row:Record<string,unknown>, keys:string[]){
  const entries=Object.entries(row);
  for(const key of keys){
    const found=entries.find(([column])=>normalizeKey(column)===normalizeKey(key));
    if(found) return found[1];
  }
  return undefined;
}

function parseImportRows(sheet:XLSX.WorkSheet){
  const raw=XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:''});
  let invalid=0;
  const rows:ImportRow[]=[];
  raw.forEach(row=>{
    const sku=normalize(getCell(row,['sku','mã sản phẩm','ma san pham','mã sp','ma sp'])).toUpperCase();
    const name=normalize(getCell(row,['name','tên sản phẩm','ten san pham','sản phẩm','san pham']));
    const unit=normalize(getCell(row,['unit','đvt','dvt','đơn vị tính','don vi tinh']))||'Cái';
    const light_attribute=normalize(getCell(row,['light_attribute','ánh sáng','anh sang','thuộc tính','thuoc tinh']))||'Không áp dụng';
    const price=Math.max(0,numberValue(getCell(row,['price','giá','gia','giá bán','gia ban'])));
    const stock=Math.max(0,Math.floor(numberValue(getCell(row,['stock','tồn','ton','tồn kho','ton kho']))));
    if(!sku||!name){invalid++;return;}
    rows.push({sku,name,unit,light_attribute,price,stock});
  });
  return {rows,invalid};
}

function downloadBlob(content:BlobPart,fileName:string,type:string){
  const url=URL.createObjectURL(new Blob([content],{type}));
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function Page(){
 const[data,setData]=useState<Product[]>([]);
 const[form,setForm]=useState(empty);
 const[editingId,setEditingId]=useState<string|null>(null);
 const[query,setQuery]=useState('');
 const[attribute,setAttribute]=useState('all');
 const[msg,setMsg]=useState('');
 const[error,setError]=useState(false);
 const[busy,setBusy]=useState(false);
 const[selected,setSelected]=useState<Set<string>>(new Set());
 const[importPreview,setImportPreview]=useState<ImportPreview|null>(null);
 const[showImport,setShowImport]=useState(false);
 const[showBulk,setShowBulk]=useState(false);
 const[bulkPrice,setBulkPrice]=useState('');
 const[bulkStock,setBulkStock]=useState('');
 const[fileDrag,setFileDrag]=useState(false);
 const fileInput=useRef<HTMLInputElement>(null);
 const restoreInput=useRef<HTMLInputElement>(null);

 async function load(){
   const{data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});
   if(error){setError(true);setMsg(error.message)}
   setData(data||[]);
   setSelected(new Set());
 }
 useEffect(()=>{load()},[]);

 const filtered=useMemo(()=>{
   const q=query.toLowerCase();
   return data.filter(x=>{
     const matches=(x.sku+' '+x.name+' '+(x.light_attribute||'')).toLowerCase().includes(q);
     const matchesAttribute=attribute==='all'||x.light_attribute===attribute;
     return matches&&matchesAttribute;
   })
 },[data,query,attribute]);

 const allFilteredSelected=filtered.length>0&&filtered.every(x=>selected.has(x.id));
 const selectedProducts=useMemo(()=>data.filter(x=>selected.has(x.id)),[data,selected]);

 function toast(text:string,isError=false){setMsg(text);setError(isError)}

 async function save(e:FormEvent){
   e.preventDefault();setBusy(true);setMsg('');
   const payload={...form,sku:form.sku.trim().toUpperCase(),name:form.name.trim(),price:Math.max(0,Number(form.price)||0),stock:Math.max(0,Number(form.stock)||0)};
   const result=editingId
    ? await supabase.from('products').update(payload).eq('id',editingId)
    : await supabase.from('products').insert(payload);
   setBusy(false);setError(!!result.error);setMsg(result.error?.message||(editingId?'Đã cập nhật sản phẩm':'Đã lưu sản phẩm thành công'));
   if(!result.error){setForm(empty);setEditingId(null);load()}
 }

 function edit(product:Product){
   setEditingId(product.id);
   setForm({sku:product.sku,name:product.name,unit:product.unit,light_attribute:product.light_attribute||'Không áp dụng',price:Number(product.price),stock:Number(product.stock)});
   window.scrollTo({top:0,behavior:'smooth'});
 }

 function cancelEdit(){setEditingId(null);setForm(empty)}

 async function del(id:string){
   if(!confirm('Xóa sản phẩm này khỏi hệ thống?'))return;
   const{error}=await supabase.from('products').delete().eq('id',id);
   if(error)toast(error.message,true);else{toast('Đã xóa sản phẩm');load()}
 }

 function toggleOne(id:string){
   setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next});
 }
 function toggleAll(){
   setSelected(current=>{
     const next=new Set(current);
     if(allFilteredSelected) filtered.forEach(x=>next.delete(x.id)); else filtered.forEach(x=>next.add(x.id));
     return next;
   });
 }

 async function deleteSelected(){
   if(!selected.size)return;
   if(!confirm(`Xóa ${selected.size} sản phẩm đã chọn? Hành động này không thể hoàn tác.`))return;
   setBusy(true);
   const{error}=await supabase.from('products').delete().in('id',Array.from(selected));
   setBusy(false);
   if(error)toast(error.message,true);else{toast(`Đã xóa ${selected.size} sản phẩm`);load()}
 }

 async function applyBulkUpdate(){
   if(!selected.size)return;
   const changes:Record<string,number>={};
   if(bulkPrice.trim()!=='') changes.price=Math.max(0,numberValue(bulkPrice));
   if(bulkStock.trim()!=='') changes.stock=Math.max(0,Math.floor(numberValue(bulkStock)));
   if(!Object.keys(changes).length){toast('Hãy nhập giá hoặc tồn kho cần cập nhật',true);return}
   setBusy(true);
   const{error}=await supabase.from('products').update(changes).in('id',Array.from(selected));
   setBusy(false);
   if(error)toast(error.message,true);else{
     toast(`Đã cập nhật ${selected.size} sản phẩm`);setShowBulk(false);setBulkPrice('');setBulkStock('');load();
   }
 }

 function exportExcel(){
   const rows=data.map(x=>({
     sku:x.sku,name:x.name,unit:x.unit,light_attribute:x.light_attribute||'',price:Number(x.price),stock:Number(x.stock)
   }));
   const workbook=XLSX.utils.book_new();
   const sheet=XLSX.utils.json_to_sheet(rows,{header:['sku','name','unit','light_attribute','price','stock']});
   sheet['!cols']=[{wch:18},{wch:34},{wch:12},{wch:18},{wch:14},{wch:12}];
   XLSX.utils.book_append_sheet(workbook,sheet,'products');
   XLSX.writeFile(workbook,`vh-lighting-products-${new Date().toISOString().slice(0,10)}.xlsx`);
 }

 function downloadTemplate(){
   const sample=[
     {sku:'VH-AT12W',name:'Đèn âm trần 12W',unit:'Cái',light_attribute:'Trắng',price:55000,stock:100},
     {sku:'VH-AT12W',name:'Đèn âm trần 12W',unit:'Cái',light_attribute:'Vàng',price:55000,stock:100},
     {sku:'VH-DL20W',name:'Đèn downlight 20W',unit:'Cái',light_attribute:'Trung tính',price:120000,stock:50}
   ];
   const workbook=XLSX.utils.book_new();
   const sheet=XLSX.utils.json_to_sheet(sample);
   sheet['!cols']=[{wch:18},{wch:34},{wch:12},{wch:18},{wch:14},{wch:12}];
   XLSX.utils.book_append_sheet(workbook,sheet,'products');
   XLSX.writeFile(workbook,'mau-nhap-san-pham-vh-lighting.xlsx');
 }

 async function readImportFile(file:File){
   if(!/\.(xlsx|xls|csv)$/i.test(file.name)){toast('Chỉ hỗ trợ file Excel hoặc CSV',true);return}
   try{
     const buffer=await file.arrayBuffer();
     const workbook=XLSX.read(buffer,{type:'array'});
     const sheet=workbook.Sheets[workbook.SheetNames[0]];
     const parsed=parseImportRows(sheet);
     if(!parsed.rows.length){toast('Không tìm thấy dòng sản phẩm hợp lệ trong file',true);return}
     setImportPreview({...parsed,fileName:file.name});setShowImport(true);setFileDrag(false);
   }catch(err){toast(err instanceof Error?err.message:'Không đọc được file',true)}
 }

 async function importProducts(){
   if(!importPreview)return;
   setBusy(true);
   const existing=data;
   let inserted=0,updated=0,failed=0;
   for(const row of importPreview.rows){
     const match=existing.find(x=>normalizeKey(x.sku)===normalizeKey(row.sku)&&normalizeKey(x.name)===normalizeKey(row.name)&&normalizeKey(x.light_attribute||'')===normalizeKey(row.light_attribute));
     const result=match
       ? await supabase.from('products').update(row).eq('id',match.id)
       : await supabase.from('products').insert(row);
     if(result.error)failed++; else match?updated++:inserted++;
   }
   setBusy(false);setShowImport(false);setImportPreview(null);
   toast(`Nhập hoàn tất: thêm ${inserted}, cập nhật ${updated}${failed?`, lỗi ${failed}`:''}`,failed>0);
   load();
 }

 function backupData(){
   const payload={version:'3.1',exported_at:new Date().toISOString(),products:data.map(({id,created_at,...rest})=>rest)};
   downloadBlob(JSON.stringify(payload,null,2),`vh-lighting-products-backup-${new Date().toISOString().slice(0,10)}.json`,'application/json;charset=utf-8');
 }

 async function restoreBackup(e:ChangeEvent<HTMLInputElement>){
   const file=e.target.files?.[0];if(!file)return;
   try{
     const json=JSON.parse(await file.text()) as {products?:ImportRow[]};
     if(!Array.isArray(json.products)||!json.products.length)throw new Error('File backup không hợp lệ');
     setImportPreview({rows:json.products.map(x=>({...x,sku:normalize(x.sku).toUpperCase(),price:Math.max(0,numberValue(x.price)),stock:Math.max(0,Math.floor(numberValue(x.stock)))})),invalid:0,fileName:file.name});
     setShowImport(true);
   }catch(err){toast(err instanceof Error?err.message:'Không đọc được file backup',true)}finally{e.target.value=''}
 }

 return <AuthGuard><AppShell title="Sản phẩm"><div className="product-workspace product-workspace-v31">
  <form className="panel product-form-card" onSubmit={save}>
   <div className="panel-heading"><div><h2>{editingId?'Chỉnh sửa sản phẩm':'Thêm sản phẩm'}</h2><p>Nhập thủ công một sản phẩm vào hệ thống.</p></div>{editingId&&<button type="button" className="icon-close" onClick={cancelEdit}><X size={18}/></button>}</div>
   <Notice text={msg} type={error?'error':'ok'}/>
   <label>Mã sản phẩm <em>*</em><input required placeholder="VH-AT12W" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></label>
   <label>Tên sản phẩm <em>*</em><input required placeholder="Đèn âm trần 12W" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
   <label>Đơn vị tính <em>*</em><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option>Cái</option><option>Bộ</option><option>Mét</option><option>Cuộn</option><option>Hộp</option></select></label>
   <label>Thuộc tính (Ánh sáng)<select value={form.light_attribute} onChange={e=>setForm({...form,light_attribute:e.target.value})}><option>Trắng</option><option>Vàng</option><option>Trung tính</option><option>Ba màu</option><option>Không áp dụng</option></select></label>
   <label>Giá bán <em>*</em><div className="money-input-wrap"><input required type="number" min="0" value={form.price||''} onChange={e=>setForm({...form,price:Number(e.target.value)})}/><span>đ</span></div></label>
   <label>Tồn kho<input type="number" min="0" value={form.stock||''} onChange={e=>setForm({...form,stock:Number(e.target.value)})}/></label>
   <div className="form-actions product-actions"><button type="button" className="secondary" onClick={cancelEdit}>Hủy</button><button className="primary" disabled={busy}>{busy?'Đang lưu…':editingId?'Cập nhật sản phẩm':'Lưu sản phẩm'}</button></div>
  </form>

  <section className="panel product-list-card">
   <div className="panel-heading product-heading-v31"><div><h2>Danh sách sản phẩm</h2><p>{data.length.toLocaleString('vi-VN')} sản phẩm trong hệ thống</p></div>
    <div className="product-toolbar">
      <button type="button" className="secondary compact-btn" onClick={downloadTemplate}><FileDown size={16}/> File mẫu</button>
      <button type="button" className="secondary compact-btn" onClick={exportExcel}><Download size={16}/> Xuất Excel</button>
      <button type="button" className="primary compact-btn" onClick={()=>fileInput.current?.click()}><Upload size={16}/> Nhập Excel</button>
      <input ref={fileInput} hidden type="file" accept=".xlsx,.xls,.csv" onChange={e=>{const f=e.target.files?.[0];if(f)readImportFile(f);e.target.value=''}}/>
    </div>
   </div>

   <div className={`excel-dropzone ${fileDrag?'is-dragging':''}`} onDragOver={e=>{e.preventDefault();setFileDrag(true)}} onDragLeave={()=>setFileDrag(false)} onDrop={e=>{e.preventDefault();setFileDrag(false);const f=e.dataTransfer.files?.[0];if(f)readImportFile(f)}} onClick={()=>fileInput.current?.click()}>
     <FileSpreadsheet size={26}/><div><b>Kéo file Excel vào đây để nhập nhanh</b><span>Hỗ trợ XLSX, XLS và CSV — tự cập nhật sản phẩm trùng mã + tên + ánh sáng.</span></div>
   </div>

   <div className="product-filter-row"><div className="search-field"><Search size={17}/><input placeholder="Tìm theo mã hoặc tên sản phẩm..." value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={attribute} onChange={e=>setAttribute(e.target.value)}><option value="all">Tất cả thuộc tính</option><option>Trắng</option><option>Vàng</option><option>Trung tính</option><option>Ba màu</option><option>Không áp dụng</option></select></div>

   {selected.size>0&&<div className="bulk-toolbar"><b>Đã chọn {selected.size} sản phẩm</b><div><button type="button" className="secondary compact-btn" onClick={()=>setShowBulk(true)}><RefreshCw size={15}/> Cập nhật hàng loạt</button><button type="button" className="danger-outline compact-btn" onClick={deleteSelected}><Trash2 size={15}/> Xóa đã chọn</button></div></div>}

   <div className="table-wrap"><table className="data-table compact-products"><thead><tr><th className="check-column"><button type="button" className="check-button" onClick={toggleAll}>{allFilteredSelected?<CheckSquare size={18}/>:<Square size={18}/>}</button></th><th>Mã sản phẩm</th><th>Tên sản phẩm</th><th>Ánh sáng</th><th>ĐVT</th><th>Giá bán</th><th>Tồn</th><th>Thao tác</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id} className={selected.has(x.id)?'selected-row':''}><td className="check-column"><button type="button" className="check-button" onClick={()=>toggleOne(x.id)}>{selected.has(x.id)?<CheckSquare size={18}/>:<Square size={18}/>}</button></td><td><b>{x.sku}</b></td><td>{x.name}</td><td>{x.light_attribute||'—'}</td><td>{x.unit}</td><td>{Number(x.price).toLocaleString('vi-VN')} đ</td><td>{Number(x.stock).toLocaleString('vi-VN')}</td><td><div className="row-actions"><button type="button" className="edit-icon" onClick={()=>edit(x)} title="Sửa"><Pencil size={15}/></button><button type="button" className="delete-icon" onClick={()=>del(x.id)} title="Xóa"><Trash2 size={15}/></button></div></td></tr>)}{!filtered.length&&<tr><td colSpan={8} className="empty-state">Chưa có sản phẩm phù hợp.</td></tr>}</tbody></table></div>
   <div className="table-footer product-footer-v31"><span>Hiển thị {filtered.length} trên {data.length} sản phẩm</span><div><button type="button" className="link-button" onClick={backupData}><FileDown size={15}/> Sao lưu JSON</button><button type="button" className="link-button" onClick={()=>restoreInput.current?.click()}><FileUp size={15}/> Khôi phục</button><input hidden ref={restoreInput} type="file" accept=".json" onChange={restoreBackup}/></div></div>
  </section>
 </div>

 {showImport&&importPreview&&<div className="modal-backdrop"><div className="modal-card import-modal"><div className="modal-header"><div><h3>Nhập sản phẩm từ Excel</h3><p>{importPreview.fileName}</p></div><button type="button" className="icon-close" onClick={()=>{setShowImport(false);setImportPreview(null)}}><X size={20}/></button></div><div className="import-summary"><div><b>{importPreview.rows.length}</b><span>Dòng hợp lệ</span></div><div><b>{importPreview.invalid}</b><span>Dòng bỏ qua</span></div></div><div className="import-preview-table"><table><thead><tr><th>SKU</th><th>Tên sản phẩm</th><th>Ánh sáng</th><th>Giá</th><th>Tồn</th></tr></thead><tbody>{importPreview.rows.slice(0,8).map((x,i)=><tr key={`${x.sku}-${i}`}><td>{x.sku}</td><td>{x.name}</td><td>{x.light_attribute}</td><td>{x.price.toLocaleString('vi-VN')}</td><td>{x.stock}</td></tr>)}</tbody></table>{importPreview.rows.length>8&&<p className="import-more">Và {importPreview.rows.length-8} dòng khác…</p>}</div><div className="modal-note">Sản phẩm trùng <b>mã + tên + ánh sáng</b> sẽ được cập nhật giá và tồn kho. Sản phẩm mới sẽ được thêm vào.</div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>{setShowImport(false);setImportPreview(null)}}>Hủy</button><button type="button" className="primary" disabled={busy} onClick={importProducts}>{busy?'Đang nhập…':`Nhập ${importPreview.rows.length} sản phẩm`}</button></div></div></div>}

 {showBulk&&<div className="modal-backdrop"><div className="modal-card bulk-modal"><div className="modal-header"><div><h3>Cập nhật hàng loạt</h3><p>Áp dụng cho {selectedProducts.length} sản phẩm đã chọn</p></div><button type="button" className="icon-close" onClick={()=>setShowBulk(false)}><X size={20}/></button></div><label>Giá bán mới <span>(bỏ trống để giữ nguyên)</span><input type="number" min="0" value={bulkPrice} onChange={e=>setBulkPrice(e.target.value)} placeholder="Ví dụ: 120000"/></label><label>Tồn kho mới <span>(bỏ trống để giữ nguyên)</span><input type="number" min="0" value={bulkStock} onChange={e=>setBulkStock(e.target.value)} placeholder="Ví dụ: 100"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowBulk(false)}>Hủy</button><button type="button" className="primary" disabled={busy} onClick={applyBulkUpdate}>{busy?'Đang cập nhật…':'Cập nhật sản phẩm'}</button></div></div></div>}
 </AppShell></AuthGuard>
}
