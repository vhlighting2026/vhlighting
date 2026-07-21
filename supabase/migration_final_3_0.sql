-- VH Lighting Final 3.0: chỉ sử dụng chuyển khoản và QR ngân hàng công ty.
-- Giữ giá trị kỹ thuật cho các cột cũ để tương thích với database đã đặt NOT NULL.

alter table public.orders add column if not exists payment_method text default 'Chuyển khoản';
alter table public.orders add column if not exists transfer_mode text default 'company_qr';
alter table public.orders add column if not exists transfer_content text default '';

alter table public.orders alter column payment_method set default 'Chuyển khoản';
alter table public.orders alter column transfer_mode set default 'company_qr';
alter table public.orders alter column transfer_content set default '';

update public.orders
set payment_method = 'Chuyển khoản',
    transfer_mode = 'company_qr',
    transfer_content = '';

-- Đảm bảo các bản ghi mới không lỗi với schema cũ có ràng buộc NOT NULL.
alter table public.orders alter column payment_method set not null;
alter table public.orders alter column transfer_mode set not null;
alter table public.orders alter column transfer_content set not null;
