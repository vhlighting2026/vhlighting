# Chức năng xóa hóa đơn

Bản cập nhật bổ sung nút **Xóa** tại trang Đơn hàng.

- Có hộp xác nhận trước khi xóa.
- Hiển thị số hóa đơn và khách hàng cần xóa.
- Xóa vĩnh viễn bản ghi trong bảng `orders`.
- Các dòng trong `order_items` được xóa theo `ON DELETE CASCADE` của schema.
- Danh sách, tổng đơn hàng và tổng doanh thu cập nhật ngay sau khi xóa.
- Có thông báo thành công hoặc lỗi từ Supabase.

Không cần chạy thêm SQL nếu database đang có khóa ngoại `order_items.order_id` với `ON DELETE CASCADE` và policy hiện tại cho phép người dùng đã đăng nhập xóa dữ liệu.
