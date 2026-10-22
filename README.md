# Hồng Quyên Quán

Website quán trà sữa bằng tiếng Việt, gồm cửa hàng và quản trị. Tên quán, nội dung và minh họa hiện là dữ liệu mẫu. Database là **PostgreSQL thực**, không lưu đơn bằng localStorage.

## Chức năng

- Giao diện responsive, tìm món, lọc danh mục, thông báo hết món.
- Chọn size, đường, đá, topping và số lượng; xem giỏ hàng; nhận tại quán hoặc giao hàng; thanh toán khi nhận.
- Tính lại tổng tiền trên máy chủ; lưu ảnh chụp dữ liệu món trong đơn; chống gửi trùng bằng mã yêu cầu và khóa giao dịch PostgreSQL.
- Quản trị có đăng nhập; thêm/sửa món, giá, tình trạng bán; xem 200 đơn gần nhất và cập nhật trạng thái theo đúng quy trình.
- Băm mật khẩu bằng scrypt có salt, cookie HttpOnly/SameSite, phiên lưu bằng token băm, giới hạn tần suất đăng nhập/đặt đơn, truy vấn SQL có tham số.

## Chạy trên máy này (PowerShell)

Node.js đã được tải vào `.tools`; không cần sửa cấu hình hệ thống. Mở terminal tại thư mục dự án:

```powershell
$env:PATH = "$PWD\.tools\node-v24.21.0-win-x64;$env:PATH"
npm.cmd run db:local
```

Lần đầu, lệnh tạo PostgreSQL trong `.postgres` và `.env` với mật khẩu ngẫu nhiên. Giữ terminal database chạy. Mở terminal thứ hai:

```powershell
$env:PATH = "$PWD\.tools\node-v24.21.0-win-x64;$env:PATH"
npm.cmd run db:setup
npm.cmd run build
npm.cmd start
```

- Cửa hàng: http://127.0.0.1:3000
- Quản trị: http://127.0.0.1:3000/admin
- Đọc `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `.env` để đăng nhập. Không đưa `.env` lên Git hoặc chia sẻ công khai.
- `Ctrl+C` để dừng từng tiến trình. Dữ liệu vẫn nằm trong `.postgres`.
- Khi sửa giao diện: dùng `npm.cmd run dev` và mở http://127.0.0.1:5173.

## Cài trên máy khác

Cài Node.js 24, chạy `npm ci`. Có thể dùng `npm run db:local` để chạy thử với PostgreSQL đi kèm, hoặc kết nối PostgreSQL riêng bằng `DATABASE_URL` trong `.env`. Với database riêng, sao chép `.env.example`, đặt mật khẩu quản trị mạnh và chạy `npm run db:setup`. Lệnh setup giữ nguyên dữ liệu/mật khẩu đã tồn tại.

`compose.yaml` là lựa chọn dùng Docker PostgreSQL: đặt `POSTGRES_PASSWORD`, chạy `docker compose up -d db`, rồi cấu hình `DATABASE_URL` tương ứng. Không chạy Docker và database đi kèm trên cùng cổng.

## Cấu trúc và tránh mã trùng

| Thư mục                      | Trách nhiệm                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `src/`                       | Giao diện khách, quản trị, thành phần dùng chung và HTTP client |
| `shared/`                    | Bảng giá tùy chọn, định dạng tiền, chuyển trạng thái dùng chung |
| `server/domain.js`           | Kiểm tra dữ liệu và tính đơn hàng                               |
| `server/app.js`              | API, đăng nhập, giới hạn truy cập và xử lý lỗi                  |
| `server/db.js`, `schema.sql` | Kết nối, giao dịch và cấu trúc PostgreSQL                       |
| `scripts/`                   | Khởi tạo, database cục bộ và kiểm thử tích hợp                  |
| `tests/`                     | Kiểm thử nghiệp vụ và trình duyệt                               |

Giá trị tiền là số nguyên VNĐ. Giao diện chỉ ước tính; máy chủ tra giá hiện hành từ database. Quy tắc chuyển trạng thái dùng một hàm chung. `Modal`, `Field`, `Quantity`, `Cup` và `api()` được tái sử dụng. Minh họa ly trà dựng bằng CSS; chưa hỗ trợ tải ảnh sản phẩm.

## Kiểm tra

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
node --env-file=.env scripts/integration.mjs
node --env-file=.env node_modules/@playwright/test/cli.js test
```

Kiểm thử tích hợp cần database và server đang chạy. Kiểm thử trình duyệt cần Chromium (`npx playwright install chromium`). Chỉ chạy kiểm thử trên database phát triển: bài kiểm thử trình duyệt tạo đơn có tên “Khách kiểm thử”. Kịch bản tích hợp tự xóa đúng các đơn do nó tạo.

## Trước khi bán hàng thật

1. Tên quán, ảnh menu, địa chỉ Cổng trường C2-3 Đông Thọ, hotline 0364 011 302, giờ mở cửa cả ngày và phí giao 15.000đ đã được cập nhật. Xác nhận khu vực giao hàng; quán xác nhận đơn và khả năng giao hàng thủ công.
2. Dùng PostgreSQL được quản lý và tài khoản ứng dụng riêng. Không dùng database đi kèm bản beta để vận hành thật.
3. Build ứng dụng, đặt `NODE_ENV=production`, cấu hình HTTPS/reverse proxy và database. Cookie bảo mật ở production cần HTTPS. Xác định cấu hình proxy tin cậy trước khi đổi `trust proxy`, tránh tin mọi proxy.
4. Thiết lập sao lưu tự động, thử khôi phục, giám sát, lưu trữ thông tin khách và lịch xóa phù hợp quy trình quán.
5. Nghiệm thu cùng chủ quán. Chưa tích hợp cổng thanh toán, đơn vị giao hàng, email/SMS, upload ảnh, đặt lại mật khẩu hoặc phân quyền nhiều vai trò.

Hiện chỉ triển khai cục bộ. Xuất bản Internet cần máy chủ/tên miền và cấu hình thực tế. Không có cam kết phần mềm tuyệt đối không có lỗi; xem `docs/VERIFICATION.md` để biết phạm vi kiểm chứng.

## Tài liệu tham khảo

- [Node.js chính thức](https://nodejs.org/en/download)
- [PostgreSQL: giao dịch](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Embedded PostgreSQL: môi trường phát triển](https://github.com/leinelissen/embedded-postgres)
