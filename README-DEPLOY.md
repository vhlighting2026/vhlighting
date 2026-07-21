# VH Lighting 1.1 - Hướng dẫn triển khai

1. Đưa toàn bộ mã nguồn lên GitHub, bao gồm `package-lock.json` mới.
2. Trên Vercel chọn Framework Preset: Next.js.
3. Node.js: 22.x.
4. Không đặt Install Command thủ công; để Vercel tự dùng `npm install`/`npm ci`.
5. Khai báo hai biến môi trường:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Không tạo thêm `pnpm-lock.yaml` và không xóa `package-lock.json` mới.

Các màn hình đã tối ưu: Thêm sản phẩm, Bán hàng, Phiếu bán hàng A4.
