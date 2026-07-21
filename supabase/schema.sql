create extension if not exists pgcrypto;
create table if not exists public.customers(id uuid primary key default gen_random_uuid(),name text not null,phone text,address text,tax_code text,created_at timestamptz not null default now());
create table if not exists public.products(id uuid primary key default gen_random_uuid(),sku text not null,name text not null,unit text not null default 'Cái',price numeric(14,2) not null default 0,stock integer not null default 0,created_at timestamptz not null default now());
create table if not exists public.orders(id uuid primary key default gen_random_uuid(),order_no text not null unique,customer_id uuid references public.customers(id) on delete set null,customer_name text not null,customer_phone text,customer_address text,subtotal numeric(14,2) not null default 0,discount numeric(14,2) not null default 0,shipping_fee numeric(14,2) not null default 0,total numeric(14,2) not null default 0,status text not null default 'Mới',note text,created_at timestamptz not null default now(),created_by uuid default auth.uid());
create table if not exists public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,product_id uuid references public.products(id) on delete set null,sku text not null,product_name text not null,unit text not null,quantity numeric(12,2) not null default 1,unit_price numeric(14,2) not null default 0,line_total numeric(14,2) not null default 0);
alter table public.customers enable row level security;alter table public.products enable row level security;alter table public.orders enable row level security;alter table public.order_items enable row level security;
do $$ begin
if not exists(select 1 from pg_policies where policyname='customers_auth') then create policy customers_auth on public.customers for all to authenticated using(true) with check(true); end if;
if not exists(select 1 from pg_policies where policyname='products_auth') then create policy products_auth on public.products for all to authenticated using(true) with check(true); end if;
if not exists(select 1 from pg_policies where policyname='orders_auth') then create policy orders_auth on public.orders for all to authenticated using(true) with check(true); end if;
if not exists(select 1 from pg_policies where policyname='items_auth') then create policy items_auth on public.order_items for all to authenticated using(true) with check(true); end if;
end $$;
create index if not exists idx_orders_created_at on public.orders(created_at desc);create index if not exists idx_order_items_order_id on public.order_items(order_id);

create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_sku_name on public.products(sku,name);

create table if not exists public.company_settings(
  id integer primary key default 1 check(id=1),
  company_name text not null default 'VH LIGHTING', tagline text, address text, hotline text,
  website text, email text, tax_code text, bank_name text, bank_id text, bank_account text,
  bank_holder text, bank_branch text, logo_url text, warranty_note text, invoice_footer text,
  updated_at timestamptz not null default now()
);
alter table public.company_settings enable row level security;
do $$ begin
if not exists(select 1 from pg_policies where policyname='company_settings_auth') then
  create policy company_settings_auth on public.company_settings for all to authenticated using(true) with check(true);
end if; end $$;
insert into public.company_settings(id,company_name,tagline,hotline,website,email,warranty_note,invoice_footer)
values(1,'VH LIGHTING','Chuyên cung cấp thiết bị chiếu sáng','0877 933 362','vulighting.com','vat.vuhoanglighting@gmail.com','Sản phẩm được bảo hành theo chính sách của nhà sản xuất. Vui lòng giữ phiếu bán hàng để được hỗ trợ.','Cảm ơn Quý khách đã tin tưởng và lựa chọn VH Lighting.')
on conflict(id) do nothing;
