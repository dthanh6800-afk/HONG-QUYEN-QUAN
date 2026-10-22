$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$script:body = New-Object System.Text.StringBuilder
function P([string]$text, [string]$style = 'Normal') {
    $safe = [System.Security.SecurityElement]::Escape($text)
    [void]$script:body.Append("<w:p><w:pPr><w:pStyle w:val='$style'/></w:pPr><w:r><w:t xml:space='preserve'>$safe</w:t></w:r></w:p>")
}
function BreakPage { [void]$script:body.Append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>') }
P 'KẾ HOẠCH XÂY DỰNG WEBSITE' 'Title'
P 'QUÁN TRÀ SỮA' 'Subtitle'
P 'Phân tích sơ bộ và tóm tắt quy trình thực hiện • 15/09/2026' 'Meta'
P '1. Mục tiêu và phạm vi đề xuất' 'Heading1'
P 'Xây dựng website giúp khách hàng tìm hiểu quán, xem thực đơn và đặt món thuận tiện trên điện thoại; đồng thời giúp nhân viên tiếp nhận, theo dõi đơn và cập nhật món bán hằng ngày.'
P 'Giả định lập kế hoạch: quán có một chi nhánh, phục vụ mang đi và giao hàng trong khu vực. Tên quán, bộ nhận diện, ngân sách và phương thức giao hàng chưa được cung cấp; phạm vi sẽ được điều chỉnh sau khi thống nhất yêu cầu.'
P '2. Người dùng và nhu cầu' 'Heading1'
P '• Khách hàng: xem giá và hình món, chọn kích cỡ, mức đường/đá, topping; đặt món và nhận thông tin xác nhận đơn.'
P '• Nhân viên: xem đơn mới, xác nhận khả năng phục vụ và cập nhật tiến độ xử lý.'
P '• Chủ quán: quản lý thực đơn, giá, tình trạng hết món; theo dõi đơn và tổng giá trị bán theo ngày.'
P '3. Chức năng ưu tiên khi ra mắt' 'Heading1'
P '• Trang chủ: hình ảnh thương hiệu, món nổi bật, ưu đãi và nút xem thực đơn/đặt món.'
P '• Thực đơn và chi tiết món: phân loại, tìm kiếm, giá rõ ràng; cấu hình size, đường, đá và topping theo từng món.'
P '• Giỏ hàng và đặt món: sửa số lượng, ghi chú, chọn nhận tại quán hoặc giao hàng; hiển thị tiền món, phí giao và tổng tiền trước khi xác nhận.'
P '• Thông tin quán: địa chỉ, giờ mở cửa, số điện thoại, liên kết bản đồ và kênh liên hệ.'
P '• Trang quản trị có đăng nhập: quản lý món, hình ảnh, giá, trạng thái còn/hết và trạng thái đơn hàng.'
P 'Phần mở rộng: thanh toán trực tuyến, tích điểm, mã giảm giá nâng cao, kết nối đơn vị giao hàng và quản lý nhiều chi nhánh. Chỉ triển khai sau khi xác định nhu cầu, chi phí và dịch vụ tích hợp.'
BreakPage
P 'QUY TRÌNH TÔI SẼ THỰC HIỆN' 'Title'
P '4. Các bước triển khai và kết quả bàn giao' 'Heading1'
P 'Bước 1 — Khảo sát và chốt yêu cầu' 'Heading2'
P 'Thu thập tên quán, logo, thực đơn, ảnh, giá, quy tắc tùy chọn món, giờ bán, khu vực giao hàng và cách nhận thanh toán. Thống nhất chức năng ưu tiên, ngân sách và tiêu chí nghiệm thu. Kết quả: bản yêu cầu và danh sách dữ liệu cần chuẩn bị.'
P 'Bước 2 — Thiết kế cấu trúc và luồng sử dụng' 'Heading2'
P 'Lập sơ đồ các trang và phác thảo bố cục. Thiết kế luồng đặt món: xem thực đơn → chọn món và tùy chọn → giỏ hàng → thông tin nhận hàng → kiểm tra tổng tiền → gửi đơn → thông báo kết quả. Kết quả: sơ đồ trang và bản phác thảo các màn hình chính.'
P 'Bước 3 — Thiết kế giao diện' 'Heading2'
P 'Chọn màu, kiểu chữ và cách trình bày theo thương hiệu. Ưu tiên điện thoại, nút dễ bấm, chữ dễ đọc, ảnh món rõ và giá dễ thấy. Trình bày mẫu trang chủ, thực đơn, giỏ hàng và quản trị để chốt trước khi lập trình. Kết quả: bộ giao diện được thống nhất.'
P 'Bước 4 — Xây dựng website và dữ liệu' 'Heading2'
P 'Lập trình giao diện, xử lý đặt hàng và trang quản trị. Tổ chức dữ liệu món, danh mục, tùy chọn, đơn hàng và tài khoản nhân viên. Tính giá trên máy chủ, kiểm tra món hết và hạn chế gửi trùng đơn. Lưu giá cùng tùy chọn tại thời điểm đặt để đơn cũ không đổi khi cập nhật thực đơn. Kết quả: bản website chạy thử.'
P 'Bước 5 — Kiểm thử và hoàn thiện nội dung' 'Heading2'
P 'Kiểm tra trên điện thoại và máy tính; thử đặt đơn, thay đổi topping, tính phí giao, nhập thiếu dữ liệu và truy cập quản trị. Kiểm tra ảnh, thông tin quán, hiệu năng tải trang và thông báo lỗi. Cho quán chạy thử tình huống bán hàng thực tế, ghi nhận và sửa lỗi. Kết quả: bản nghiệm thu cùng danh sách kiểm tra.'
P 'Bước 6 — Đưa vào sử dụng và bàn giao' 'Heading2'
P 'Cấu hình tên miền, máy chủ, HTTPS, tài khoản quản trị và sao lưu. Kiểm tra một đơn thử sau khi xuất bản. Bàn giao mã nguồn, hướng dẫn cập nhật thực đơn và xử lý đơn; thống nhất thời gian hỗ trợ sau ra mắt. Kết quả: website hoạt động và tài liệu vận hành.'
BreakPage
P 'TIẾN ĐỘ VÀ TIÊU CHÍ HOÀN THÀNH' 'Title'
P '5. Thời gian dự kiến' 'Heading1'
P '• Khảo sát và chốt yêu cầu: 1–2 ngày làm việc.'
P '• Cấu trúc trang và thiết kế giao diện: 3–4 ngày làm việc.'
P '• Lập trình và nhập dữ liệu ban đầu: 6–9 ngày làm việc.'
P '• Kiểm thử, chỉnh sửa và nghiệm thu: 2–3 ngày làm việc.'
P '• Triển khai và bàn giao: 1–2 ngày làm việc.'
P 'Tổng ước tính: 13–20 ngày làm việc, khoảng 3–4 tuần với một người thực hiện. Đây là dự kiến cho phạm vi cơ bản, khi có đủ nội dung và phản hồi kịp thời; chưa tính thời gian chờ dịch vụ bên ngoài hoặc bổ sung chức năng.'
P '6. Tiêu chí nghiệm thu chính' 'Heading1'
P '• Hiển thị tốt trên điện thoại và máy tính; các trang, nút và biểu mẫu chính hoạt động.'
P '• Tổng tiền đúng theo món, số lượng, size, topping và phí giao; khách thấy tổng tiền trước khi gửi đơn.'
P '• Đơn được lưu đủ thông tin, xuất hiện trong quản trị và cập nhật được trạng thái: mới → xác nhận → đang chuẩn bị → đang giao/chờ nhận → hoàn tất hoặc hủy.'
P '• Có xử lý món hết, thông tin thiếu và lỗi gửi đơn; thông báo gửi đơn thành công phân biệt rõ với việc quán đã xác nhận.'
P '• Người chưa đăng nhập không truy cập được quản trị; dữ liệu khách hàng chỉ hiển thị cho người có quyền. Mật khẩu được lưu bằng hàm băm an toàn.'
P '• HTTPS hoạt động; có sao lưu và kiểm tra khôi phục; chủ quán tự cập nhật món và xử lý được đơn thử theo hướng dẫn.'
P '7. Thông tin cần chuẩn bị và điểm cần thống nhất' 'Heading1'
P 'Chuẩn bị: tên quán, logo, màu thương hiệu, ảnh có quyền sử dụng, thực đơn và giá, địa chỉ, giờ hoạt động, hotline; người phụ trách duyệt nội dung và nhận đơn.'
P 'Thống nhất: ngân sách, thời điểm ra mắt, cách tính phí và giới hạn giao hàng, cách thanh toán, quy định hủy đơn, thời gian lưu thông tin khách và quyền truy cập nhân viên.'
P 'Chi phí sẽ được tách thành xây dựng ban đầu, tên miền, máy chủ, bảo trì và phí dịch vụ tích hợp nếu có. Chưa đưa ra báo giá khi phạm vi và dịch vụ chưa được chốt.'
P 'Định hướng: ra mắt phiên bản cơ bản ổn định, vận hành thử với đơn thực tế rồi chọn chức năng mở rộng dựa trên phản hồi của khách và nhân viên.'
$styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="110" w:line="270" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:spacing w:after="180"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:color w:val="215E52"/><w:sz w:val="34"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="956333"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Meta"><w:name w:val="Meta"/><w:rPr><w:color w:val="666666"/><w:sz w:val="20"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/><w:spacing w:before="170" w:after="100"/></w:pPr><w:rPr><w:b/><w:color w:val="215E52"/><w:sz w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:keepNext/><w:spacing w:before="130" w:after="70"/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style>
</w:styles>
'@
$document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' + $script:body.ToString() + '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1050" w:bottom="1000" w:left="1050" w:header="400" w:footer="450"/></w:sectPr></w:body></w:document>'
$parts = @{
    '[Content_Types].xml' = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>'
    '_rels/.rels' = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
    'word/document.xml' = $document
    'word/styles.xml' = $styles
    'word/_rels/document.xml.rels' = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'
    'word/footer1.xml' = '<?xml version="1.0" encoding="UTF-8"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="777777"/></w:rPr><w:t xml:space="preserve">Kế hoạch website quán trà sữa • Trang </w:t></w:r><w:fldSimple w:instr="PAGE"/></w:p></w:ftr>'
}
$path = Join-Path 'E:\HongQuyenQuan' 'Ke_hoach_website_quan_tra_sua.docx'
$file = [System.IO.File]::Open($path, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($file, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($part in $parts.GetEnumerator()) {
        $null = [xml]$part.Value
        $entry = $zip.CreateEntry($part.Key)
        $writer = New-Object System.IO.StreamWriter($entry.Open(), (New-Object System.Text.UTF8Encoding($false)))
        try { $writer.Write($part.Value) } finally { $writer.Dispose() }
    }
} finally { $zip.Dispose(); $file.Dispose() }
$check = [System.IO.Compression.ZipFile]::OpenRead($path)
try {
    foreach ($entry in $check.Entries) {
        $reader = New-Object System.IO.StreamReader($entry.Open())
        try { $null = [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
    }
    Write-Output "Validated DOCX: $($check.Entries.Count) XML parts"
} finally { $check.Dispose() }
Get-Item -LiteralPath $path | Select-Object FullName,Length
