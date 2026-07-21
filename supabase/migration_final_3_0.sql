-- VH Lighting Final 3.0: chỉ sử dụng chuyển khoản.
alter table public.orders add column if not exists payment_method text default 'Chuyển khoản';
alter table public.orders add column if not exists transfer_mode text;
alter table public.orders add column if not exists transfer_content text;

alter table public.orders alter column payment_method set default 'Chuyển khoản';
update public.orders
set payment_method = 'Chuyển khoản',
    transfer_mode = null,
    transfer_content = null
where payment_method is distinct from 'Chuyển khoản'
   or transfer_mode is not null
   or transfer_content is not null;
