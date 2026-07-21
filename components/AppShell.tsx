"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, Users, Package, ShoppingCart, Warehouse, Settings, LogOut, Menu, X, FileText, ClipboardList, BarChart3, History } from "lucide-react";
import { useState } from "react";

const nav=[
  ['/dashboard','Tổng quan',LayoutDashboard],
  ['/orders/new','Bán hàng',ShoppingCart],
  ['/orders','Đơn hàng',ClipboardList],
  ['/products','Sản phẩm',Package],
  ['/customers','Khách hàng',Users],
  ['/inventory','Kho hàng',Warehouse],
  ['/dashboard','Báo cáo',BarChart3],
  ['/orders','Lịch sử in',History],
  ['/settings','Cài đặt',Settings],
] as const;

export default function AppShell({children,title,subtitle,action}:{children:React.ReactNode;title:string;subtitle?:string;action?:React.ReactNode}){
 const p=usePathname(); const r=useRouter(); const [open,setOpen]=useState(false);
 const isActive=(h:string)=>h==='/orders/new'?p===h:h==='/orders'?p==='/orders'||(/^\/orders\/.+/.test(p)&&p!=='/orders/new'):p.startsWith(h);
 return <div className="app-shell vh-shell">
  <aside className={`sidebar ${open?'open':''}`}>
   <div className="brand"><div className="logo">VH</div><div><b>VH LIGHTING</b><span>Chuyên cung cấp thiết bị chiếu sáng</span></div><button className="mobile-close" onClick={()=>setOpen(false)}><X size={20}/></button></div>
   <nav>{nav.map(([h,l,I],idx)=><Link key={`${h}-${idx}`} href={h} onClick={()=>setOpen(false)} className={isActive(h)?'active':''}><I size={18}/><span>{l}</span></Link>)}</nav>
   <div className="sidebar-user"><div className="avatar">V</div><div><b>Vũ Lighting</b><span>Quản trị viên</span></div></div>
   <button className="logout" onClick={async()=>{await supabase.auth.signOut();r.replace('/login')}}><LogOut size={18}/>Đăng xuất</button>
  </aside>
  {open&&<button aria-label="Đóng menu" className="sidebar-backdrop" onClick={()=>setOpen(false)}/>} 
  <main className="main-area">
   <header className="topbar"><div className="topbar-left"><button className="menu-button" onClick={()=>setOpen(true)}><Menu size={22}/></button><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div></div><div className="topbar-actions">{action}</div></header>
   <section className="content">{children}</section>
  </main>
 </div>
}
