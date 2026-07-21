-- Final 1.1: thuộc tính ánh sáng và thông tin người lập phiếu
alter table public.products add column if not exists light_attribute text;
alter table public.order_items add column if not exists light_attribute text;
alter table public.company_settings add column if not exists invoice_creator text default 'Vũ Lighting';
update public.company_settings set invoice_creator=coalesce(nullif(invoice_creator,''),'Vũ Lighting') where id=1;
