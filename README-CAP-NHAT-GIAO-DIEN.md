# Cập nhật giao diện bán hàng

## Đã thay đổi
- Tăng cỡ chữ, độ rõ và khoảng cách trên màn hình Bán hàng.
- Thêm hiệu ứng chuyển trang, hover menu, bảng, nút và danh sách tìm sản phẩm.
- Phương thức Chuyển khoản có 2 lựa chọn:
  - Theo nội dung hóa đơn: QR có số tiền và nội dung chuyển khoản tự tạo.
  - Theo nội dung mặc định của khách (chỉ QR): QR có tài khoản và số tiền, không gắn nội dung.
- Bỏ các nút Hủy đơn hàng, Lưu đơn hàng, Lưu và in, Tạo báo giá.
- Thay bằng Lưu hóa đơn và In hóa đơn.
- Nút In hóa đơn sẽ lưu dữ liệu, mở hóa đơn rồi tự gọi hộp thoại in.
- Bổ sung CSS chuẩn cho popup để tránh tràn và chồng chéo trên màn hình nhỏ.

## Bắt buộc chạy SQL một lần trên Supabase
Mở Supabase > SQL Editor và chạy file:

`supabase/migration_payment_options.sql`

Nếu không chạy migration này, thao tác lưu hóa đơn sẽ báo thiếu các cột payment_method, transfer_mode hoặc transfer_content.
