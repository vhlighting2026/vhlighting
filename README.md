# VH Lighting Sales — Final 2.0 Full Setup

Bản này dành cho **Supabase mới hoàn toàn**. Không cần chạy các file migration cũ.

## Cài database mới

1. Tạo một project Supabase mới.
2. Mở **SQL Editor**.
3. Mở file `supabase/FULL_SETUP_NEW_SYSTEM.sql` trong bộ code.
4. Sao chép toàn bộ nội dung và bấm **Run** đúng một lần.
5. Vào **Authentication → Users** để tạo tài khoản đăng nhập.

File SQL tổng hợp tạo đầy đủ:

- `customers`
- `products`
- `orders`
- `order_items`
- `company_settings`
- Quan hệ khóa ngoại
- Chỉ mục tìm kiếm
- Row Level Security và policy cho tài khoản đã đăng nhập
- Các cột thuộc tính ánh sáng, phí vận chuyển, QR/VietQR, chữ ký, người lập phiếu và nội dung chuyển khoản
- Thông tin mặc định VH Lighting

SQL **không tạo sẵn** khách hàng, sản phẩm hoặc dòng hóa đơn demo. Khi bán bao nhiêu sản phẩm, hệ thống chỉ tạo đúng bấy nhiêu dòng chi tiết.

## Cấu hình website

Tạo file `.env.local` hoặc khai báo trên Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Sau đó:

```bash
npm install
npm run build
npm run dev
```

Hoặc tải code lên GitHub, kết nối Vercel và thêm hai biến môi trường trên.

## Cài đặt thông tin hóa đơn

Sau khi đăng nhập, vào **Cài đặt hóa đơn** để sửa:

- Tên công ty và thông tin liên hệ
- Logo
- Người lập phiếu
- Ảnh chữ ký
- Ngân hàng, mã VietQR, số tài khoản, chủ tài khoản
- Nội dung chuyển khoản mặc định
- Chính sách bảo hành và lời cảm ơn

Nội dung chuyển khoản vẫn có thể sửa riêng ở từng đơn hàng trước khi lưu hoặc in.

## Project thử nghiệm cũ

`supabase/RESET_EMPTY_SYSTEM.sql` là file tùy chọn để xóa toàn bộ bảng nghiệp vụ. Không chạy file này trên hệ thống có dữ liệu cần giữ.

Các file `migration_*.sql` chỉ dành cho nâng cấp database cũ; với project mới, bỏ qua toàn bộ và chỉ chạy `FULL_SETUP_NEW_SYSTEM.sql`.


## Hai quy tắc nội dung chuyển khoản

1. **Theo đơn hàng:** QR chứa số tiền và nội dung chuyển khoản của đơn.
2. **Khách hàng tự nhập:** QR chỉ chứa tài khoản và số tiền; nội dung chuyển khoản để khách tự nhập.

Cấu hình tại **Cài đặt hóa đơn → Quy tắc nội dung chuyển khoản**.
