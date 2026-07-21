alter table public.orders add column if not exists payment_method text default 'Chuyển khoản';
alter table public.orders add column if not exists transfer_mode text;
alter table public.orders add column if not exists transfer_content text;

update public.orders
set payment_method = coalesce(payment_method, 'Chuyển khoản'),
    transfer_mode = coalesce(transfer_mode, 'invoice'),
    transfer_content = coalesce(transfer_content, 'THANH TOAN DON HANG ' || regexp_replace(order_no, '[^A-Za-z0-9]', '', 'g'));
