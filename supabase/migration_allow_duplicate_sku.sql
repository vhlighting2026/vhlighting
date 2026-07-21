-- Chạy file này một lần trong Supabase > SQL Editor để cho phép nhiều sản phẩm dùng chung mã SKU.
alter table public.products drop constraint if exists products_sku_key;
create index if not exists idx_products_sku on public.products (sku);
create index if not exists idx_products_sku_name on public.products (sku, name);
