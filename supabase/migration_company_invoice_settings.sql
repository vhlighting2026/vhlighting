create table if not exists public.company_settings(
  id integer primary key default 1 check(id=1),
  company_name text not null default 'VH LIGHTING', tagline text, address text, hotline text,
  website text, email text, tax_code text, bank_name text, bank_account text,
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
