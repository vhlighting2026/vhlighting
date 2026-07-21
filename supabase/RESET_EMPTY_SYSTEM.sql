-- CANH BAO: FILE NAY XOA TOAN BO DU LIEU NGHIEP VU.
-- Chi dung khi muon lam sach project Supabase thu nghiem roi cai lai tu dau.

begin;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.customers cascade;
drop table if exists public.company_settings cascade;
commit;

-- Sau do chay FULL_SETUP_NEW_SYSTEM.sql
