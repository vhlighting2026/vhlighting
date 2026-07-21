-- Chạy một lần trên Supabase SQL Editor để bổ sung phí vận chuyển và mã ngân hàng VietQR.
alter table public.orders
  add column if not exists shipping_fee numeric(14,2) not null default 0;

alter table public.company_settings
  add column if not exists bank_id text;
