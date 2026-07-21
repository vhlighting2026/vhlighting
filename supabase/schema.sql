-- ============================================================
-- VH LIGHTING FINAL 2.0 - FULL SETUP CHO SUPABASE MOI
-- Chay DUY NHAT file nay trong Supabase > SQL Editor.
-- File nay khong chen san san pham, khach hang hay hoa don demo.
-- ============================================================

begin;

create extension if not exists pgcrypto;

-- 1. KHACH HANG
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  tax_code text,
  created_at timestamptz not null default now()
);

-- 2. SAN PHAM
-- SKU duoc phep trung. Mot ma co the co nhieu thuoc tinh anh sang.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null,
  name text not null,
  unit text not null default 'Cái',
  light_attribute text,
  price numeric(14,2) not null default 0 check (price >= 0),
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

-- Bao dam khong con rang buoc unique cu tren SKU neu SQL duoc chay lai.
alter table public.products drop constraint if exists products_sku_key;

-- 3. DON HANG / PHIEU BAN HANG
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null default 'Khách lẻ',
  customer_phone text,
  customer_address text,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  shipping_fee numeric(14,2) not null default 0 check (shipping_fee >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  status text not null default 'Mới',
  note text,
  transfer_mode text not null default 'order' check (transfer_mode in ('order','customer_input')),
  transfer_content text,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

-- 4. CHI TIET DON HANG
-- Luu snapshot ten, don vi, thuoc tinh va gia tai thoi diem ban.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text not null,
  product_name text not null,
  unit text not null,
  light_attribute text,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0 check (unit_price >= 0),
  line_total numeric(14,2) not null default 0 check (line_total >= 0)
);

-- 5. CAI DAT CONG TY VA HOA DON
-- He thong chi dung mot ban ghi id = 1.
create table if not exists public.company_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'VH LIGHTING',
  tagline text,
  address text,
  hotline text,
  website text,
  email text,
  tax_code text,
  bank_name text,
  bank_id text,
  bank_account text,
  bank_holder text,
  bank_branch text,
  logo_url text,
  signature_url text,
  transfer_content_mode text not null default 'order' check (transfer_content_mode in ('order','customer_input')),
  transfer_content_default text default 'THANH TOAN HD',
  warranty_note text,
  invoice_footer text,
  invoice_creator text default 'Vũ Lighting',
  updated_at timestamptz not null default now()
);

-- 6. CHI MUC TIM KIEM
create index if not exists idx_customers_name on public.customers(name);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_name on public.products(name);
create index if not exists idx_products_sku_name on public.products(sku, name);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- 7. ROW LEVEL SECURITY
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.company_settings enable row level security;

-- Xoa policy cu cung ten de file co the chay lai an toan.
drop policy if exists customers_auth on public.customers;
drop policy if exists products_auth on public.products;
drop policy if exists orders_auth on public.orders;
drop policy if exists items_auth on public.order_items;
drop policy if exists company_settings_auth on public.company_settings;

create policy customers_auth
on public.customers for all to authenticated
using (true) with check (true);

create policy products_auth
on public.products for all to authenticated
using (true) with check (true);

create policy orders_auth
on public.orders for all to authenticated
using (true) with check (true);

create policy items_auth
on public.order_items for all to authenticated
using (true) with check (true);

create policy company_settings_auth
on public.company_settings for all to authenticated
using (true) with check (true);

-- 8. THONG TIN MAC DINH CUA VH LIGHTING
insert into public.company_settings (
  id,
  company_name,
  tagline,
  hotline,
  website,
  email,
  invoice_creator,
  transfer_content_mode,
  transfer_content_default,
  warranty_note,
  invoice_footer
)
values (
  1,
  'VH LIGHTING',
  'Chuyên cung cấp thiết bị chiếu sáng',
  '0877 933 362',
  'vulighting.com',
  'vat.vuhoanglighting@gmail.com',
  'Vũ Lighting',
  'order',
  'THANH TOAN HD',
  'Sản phẩm được bảo hành theo chính sách của nhà sản xuất. Vui lòng giữ phiếu bán hàng để được hỗ trợ.',
  'Cảm ơn Quý khách đã tin tưởng và lựa chọn VH Lighting.'
)
on conflict (id) do update set
  company_name = excluded.company_name,
  tagline = excluded.tagline,
  hotline = excluded.hotline,
  website = excluded.website,
  email = excluded.email,
  invoice_creator = coalesce(nullif(public.company_settings.invoice_creator, ''), excluded.invoice_creator),
  transfer_content_mode = coalesce(public.company_settings.transfer_content_mode, excluded.transfer_content_mode),
  transfer_content_default = coalesce(nullif(public.company_settings.transfer_content_default, ''), excluded.transfer_content_default),
  warranty_note = coalesce(public.company_settings.warranty_note, excluded.warranty_note),
  invoice_footer = coalesce(public.company_settings.invoice_footer, excluded.invoice_footer),
  updated_at = now();

commit;
