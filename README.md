# VH Lighting Sales — Final

Bản tích hợp cuối gồm Giai đoạn 1 + Giai đoạn 2 + hóa đơn A4 nâng cấp.

## Tính năng
- Đăng nhập Supabase Auth
- Dashboard phong cách phần mềm bán hàng hiện đại
- Khách hàng, sản phẩm, kho, đơn hàng
- Cho phép nhiều sản phẩm dùng chung mã SKU
- Tìm sản phẩm theo mã hoặc tên khi tạo đơn
- In phiếu bán hàng A4 kẻ ô, số tiền bằng chữ, thông tin ngân hàng/STK
- Trang Cài đặt hóa đơn để nhập thông tin doanh nghiệp, ngân hàng, STK, logo, bảo hành
- Responsive desktop/tablet/mobile

## Triển khai
1. Tạo project Supabase.
2. Chạy `supabase/schema.sql` trong SQL Editor cho project mới.
3. Với database cũ, chạy thêm:
   - `supabase/migration_allow_duplicate_sku.sql`
   - `supabase/migration_company_invoice_settings.sql`
4. Tạo user tại Supabase Authentication.
5. Upload toàn bộ nội dung thư mục này lên root repository GitHub.
6. Import repository vào Vercel.
7. Thêm biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
8. Deploy.

## Kiểm tra build
Bản này đã chạy thành công `next build` với Next.js 15.5.20 và TypeScript.


## Cập nhật phí vận chuyển và VietQR
Nếu database đã tồn tại, chạy thêm file `supabase/migration_shipping_fee_vietqr.sql` trong Supabase SQL Editor. Sau đó vào **Cài đặt hóa đơn** và nhập mã ngân hàng VietQR (ví dụ `VCB` hoặc mã BIN), số tài khoản và chủ tài khoản.
