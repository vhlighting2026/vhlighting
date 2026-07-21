# VH Lighting Final 3.1

## Nâng cấp quản lý sản phẩm

- Nhập sản phẩm hàng loạt từ CSV UTF-8 ngay trên website.
- Kéo thả file CSV vào khu vực nhập nhanh.
- Tải file CSV mẫu đúng cấu trúc bảng `products`.
- Xuất toàn bộ danh sách sản phẩm ra CSV.
- Sản phẩm trùng `sku + name + light_attribute` được cập nhật giá và tồn kho.
- Chọn nhiều sản phẩm để cập nhật giá/tồn kho hàng loạt.
- Xóa nhiều sản phẩm cùng lúc.
- Sao lưu sản phẩm ra JSON và khôi phục từ JSON.
- Sửa sản phẩm trực tiếp từ danh sách.

## Cột CSV hỗ trợ

```text
sku,name,unit,light_attribute,price,stock
```

Tên cột tiếng Việt như `Mã sản phẩm`, `Tên sản phẩm`, `ĐVT`, `Ánh sáng`, `Giá bán`, `Tồn kho` cũng được nhận diện.

## Triển khai

Không cần chạy SQL mới nếu bảng `products` hiện có các cột:

```text
id, sku, name, unit, light_attribute, price, stock, created_at
```

Upload toàn bộ code lên GitHub/Vercel và deploy lại.
