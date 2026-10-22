# Báo cáo triển khai và kiểm thử

Ngày thực hiện: 15/09/2026.

## Kết quả

| Hạng mục                | Kết quả            | Phạm vi                                                                                                             |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Build phát hành         | Đạt                | Vite build thành công, React production                                                                             |
| ESLint                  | Đạt                | Không có lỗi được báo trong mã dự án                                                                                |
| Kiểm thử nghiệp vụ      | 10/10 đạt          | Size/topping/phí giao; số lượng, tùy chọn và địa chỉ sai; giá giả; món hết; giá lưu trong đơn; trạng thái; mật khẩu |
| Kiểm thử tích hợp       | Đạt                | Chạy HTTP API và PostgreSQL 18.4 thật trên máy này                                                                  |
| Kiểm thử Chromium       | 4/4 đạt            | Đặt món, quản trị, mobile, tìm kiếm rỗng, bàn phím, lỗi JavaScript                                                  |
| Kiểm tra mã trùng jscpd | 0 khối trùng       | `src`, `server`, `shared`; ngưỡng 8 dòng / 90 token                                                                 |
| npm audit khi cài đặt   | 0 lỗ hổng được báo | Theo cơ sở dữ liệu npm ở thời điểm kiểm tra                                                                         |

## Tình huống tích hợp đã xác nhận

- Chưa đăng nhập không được đọc đơn hoặc thêm sản phẩm.
- Cookie phiên đăng nhập có HttpOnly và SameSite=Strict; đăng xuất vô hiệu hóa phiên trong PostgreSQL.
- Gửi đồng thời 4 yêu cầu cùng mã tạo đúng một bản ghi đơn.
- Dùng lại mã yêu cầu với nội dung khác bị từ chối.
- Máy chủ bỏ qua tổng tiền do khách tự gửi, dùng giá trong PostgreSQL.
- Không nhận số lượng âm; không cho bỏ qua bước xử lý hoặc mở lại đơn hoàn tất.
- Không chấp nhận yêu cầu ghi dữ liệu có Origin từ website khác.

## Giao diện đã kiểm tra

- Máy tính: 1440px; kiểm tra tràn ngang thêm ở 320px, 390px và 768px.
- Luồng mua: tìm Ô Long → size L → trân châu → nhập thông tin → gửi → nhận mã đơn, tổng 47.000đ.
- Quản trị: đăng nhập, mở trình sửa món, lưu món và đăng xuất.
- Xem trực tiếp ảnh `desktop.png` và `mobile.png` trong thư mục này.

## Lỗi phát hiện và đã sửa

1. Nút giỏ hàng mất tên truy cập khi ẩn chữ trên mobile: thêm nhãn `aria-label` độc lập.
2. Font Georgia hiển thị dấu tiếng Việt không tốt trong môi trường kiểm tra: dùng Times New Roman cho tiêu đề.
3. Minh họa ly bị cắt trên mobile: điều chỉnh kích thước minh họa và chi tiết bên trong.
4. Cấu hình NODE_ENV trong file dùng chung làm build chứa React development: bỏ giá trị development cố định.
5. Đăng xuất gọi tải lại dữ liệu quản trị sau khi xóa phiên: ngừng thao tác tải lại trong luồng đăng xuất.

## Giới hạn còn lại

- Đây là bản cơ bản chạy cục bộ, chưa đưa lên tên miền công khai và chưa bán hàng thật.
- Chưa kiểm chứng Safari, Firefox, tải cao, gián đoạn mạng dài hoặc khôi phục sao lưu production.
- Website dùng tên/thực đơn mẫu, minh họa CSS; cần thông tin quán thật trước khi mở bán.
- Chưa upload ảnh, tích điểm, cổng thanh toán, SMS/email, quản lý nhiều chi nhánh, phân quyền nhân viên hoặc khôi phục mật khẩu qua email.
- Phí giao hàng mẫu cố định; khu vực giao được quán xác nhận thủ công. Giỏ hàng chưa lưu qua lần tải lại trang.
- PostgreSQL đi kèm bản beta dành cho phát triển. Khi vận hành thật cần dịch vụ PostgreSQL ổn định, sao lưu và HTTPS.
- Kết quả công cụ không chứng minh phần mềm tuyệt đối không có lỗi, không có mã trùng ở mọi mức hoặc không có lỗ hổng chưa được biết.

Các lệnh tái kiểm tra và hướng dẫn triển khai nằm trong README.md.
