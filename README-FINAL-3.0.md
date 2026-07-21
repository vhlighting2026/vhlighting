# VH Lighting Final 3.0

## Thay đổi chính
- Chỉ sử dụng thanh toán chuyển khoản; bỏ tiền mặt, công nợ và mọi lựa chọn phương thức thanh toán.
- Bỏ tạo nội dung chuyển khoản và popup QR trong màn hình bán hàng.
- PDF hóa đơn A5 dọc, QR tài khoản công ty tự lấy từ Cài đặt.
- QR không chứa nội dung chuyển khoản; chỉ gồm tài khoản, tên chủ tài khoản và số tiền hóa đơn.
- Ghi chú ở bên trái; nếu không nhập thì khung để trống hoàn toàn.
- Tạm tính, chiết khấu, phí vận chuyển và tổng thanh toán ở bên phải.
- Thông tin ngân hàng chỉnh tại Cài đặt, không hiển thị câu hướng dẫn chỉnh sửa trên PDF.
- Cuối hóa đơn có Người bán hàng và Khách hàng.
- Không có tính năng tải ảnh sản phẩm.

## Cập nhật Supabase
Mở Supabase > SQL Editor và chạy:

`supabase/migration_final_3_0.sql`

## Cài đặt và chạy
```bash
npm install
npm run build
npm run dev
```
