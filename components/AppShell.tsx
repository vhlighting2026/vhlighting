"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, Users, Package, ShoppingCart, Warehouse, Settings, LogOut, Menu, X, Bell, Search } from "lucide-react";
import { useState } from "react";
const nav=[['/dashboard','Tổng quan',LayoutDashboard],['/orders','Đơn hàng',ShoppingCart],['/customers','Khách hàng',Users],['/products','Sản phẩm',Package],['/inventory','Kho hàng',Warehouse],['/settings','Cài đặt',Settings]] as const;
export default function AppShell({children,title,subtitle,action}:{children:React.ReactNode;title:string;subtitle?:string;action?:React.ReactNode}){
 const p=usePathname(); const r=useRouter(); const [open,setOpen]=useState(false);
 return <div className="app-shell">
  <aside className={`sidebar ${open?'open':''}`}>
   <div className="brand"><div className="logo">VH</div><div><b>VH LIGHTING</b><span>Quản lý bán hàng</span></div><button className="mobile-close" onClick={()=>setOpen(false)}><X size={20}/></button></div>
   <nav>{nav.map(([h,l,I])=><Link key={h} href={h} onClick={()=>setOpen(false)} className={p.startsWith(h)?'active':''}><I size={19}/><span>{l}</span></Link>)}</nav>
   <div className="sidebar-user"><div className="avatar">A</div><div><b>Quản trị viên</b><span>VH Lighting</span></div></div>
   <button className="logout" onClick={async()=>{await supabase.auth.signOut();r.replace('/login')}}><LogOut size={18}/>Đăng xuất</button>
  </aside>
  {open&&<button aria-label="Đóng menu" className="sidebar-backdrop" onClick={()=>setOpen(false)}/>} 
  <main className="main-area">
   <header className="topbar"><div className="topbar-left"><button className="menu-button" onClick={()=>setOpen(true)}><Menu size={22}/></button><div><h1>{title}</h1><p>{subtitle||'Hệ thống bán hàng nội bộ VH Lighting'}</p></div></div><div className="topbar-actions"><button className="icon-button" aria-label="Tìm kiếm"><Search size={19}/></button><button className="icon-button" aria-label="Thông báo"><Bell size={19}/><span className="notification-dot"/></button>{action}</div></header>
   <section className="content">{children}</section>
  </main>
 </div>
}
