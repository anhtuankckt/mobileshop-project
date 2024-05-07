<!-- updateded by anhtuankckt at 3.5.2024 -->
*** CHỨC NĂNG ***
1. Quản lí đơn hàng
2. Mã hóa mật khẩu
3. Quản lí bình luận
4. Cấu hình website
5. Ghi nhớ mật khẩu
6. Quản lí quảng cáo (Slider & Banner)
7. Xác nhận trước khi xóa nội dung
8. Chọn xóa nhiều nội dung cùng lúc
9. Xóa sản phẩm sẽ xóa luôn ảnh mô tả cho sản phẩm
10. Xóa danh mục thì đưa sản phẩm vào danh mục gốc (root)
<!-- -->
**TRÌNH BÀY**
1. Quản lí đơn hàng:
# Xây dựng orderModel:
Tại đây, có các field:
- <customer>: thông tin người dùng
- items: là 1 mảng chứa các object, mỗi object đại diện cho 1 sản phẩm (id, price, qty)
- confirmed: Dùng để kiểm soát đơn hàng. Khi quản trị viên xem đơn hàng và xác nhận đơn đã được gửi đi hay chưa.
- is_delete: Xóa đơn hàng (xóa mềm)
# admin:
- admin/orders: Hiển thị các order khi người dùng đã mua ở site và chưa được xác nhận. Tại đây, quản trị viên sẽ xem và xác nhận đơn.
- admin/orders/confirmed: Hiển thị các order đã được xác nhận

# site:
Người dùng phải đăng nhập mới được mua hàng.
Ban đầu người dùng đăng kí tài khoản sẽ có thông tin như phone, address.. rồi.
Mua hàng xong, người dùng có thể kiểm tra đã đơn đã mua (đã mua xong, đang chờ)

2. Mã hóa mật khẩu:
Dùng *bcryptjs* để mã hóa mật khẩu (hash)
Sau khi mã hóa, khi người dùng nhập mật khẩu cần kiểm tra giải mã mật khẩu được nhập (compare).

3. Quản lí bình luận: (Bình luận dạng Nested)
# Xây dựng commentModel:
Tại đây có các field:
- <prd_id>: Thông tin sản phẩm (Dấu mốc)
- <parrent_comment_id>: Thông tin của comment khác (mặc định là null)
- allow: Cho phép hiển thị ra trang _site_
- is_delete: Để xóa mềm
- full_name, email, body: Thông tin người dùng khi comment
- left, right: Dùng để kiểm soát dạng nested

# Hoạt động:
Mặc định, có <prd_id> là mốc (bình luận của sản phẩm)
Quản lí comment dạng nested thì mỗi comment có 2 node,
node comment cha sẽ bao quanh node comment con.
Ban đầu, comment có <parrent_comment_id> là *null* sẽ là comment cha có 2 node,
comment con sẽ lấy *id* của comment cha làm <parrent_comment_id> của mình, 2 node của comment con này sẽ chèn vào giữa 2 node của comment cha đó.
(Ví dụ: Cha đang có 2 node *12*, khi có comment con thì comment con có 2 node là *23* và comment cha bây giờ có 2 node là *14*)

# site:
- Tại trang chi tiết sản phẩm sẽ có mặc định 1 form để bình luận.
Lấy <prd_id> là *id* của sản phẩm đang xem chi tiết làm mốc.
form mặc định này thì <parrent_comment_id> sẽ là *null* (Comment cha)
- Tiếp theo khi đã có bình luận rồi, click vào Trả lời thì sẽ hiển thị ra form để trả lời.
Tại form này, cũng lấy <prd_id> là *id* của sản phẩm đang xem chi tiết làm mốc.
<parrent_comment_id> lúc này sẽ lấy *id* của bình luận trên (Nhận nó làm cha)

# admin: 
Có trang hiển thị comment, cho phép hiển thị ra site (thay đổi *allow* thành true) hoặc xóa comment.

4. Cấu hình website
# Xây dựng configModel:
# Hoạt động:
Cấu hình này lưu ảnh logo header, logo banner, các thông tin khác: info, address, service, hotline
Cả admin và site đều cùng vào model này lấy ra và hiển thị

# admin:
Quản lí các cấu hình này. Mỗi 1 cấu hình gồm 1 logo banner, 1 logo footer và các trường thông tin khác.
Quản trị sẽ cho thêm mới, sửa, xóa, cho phép hiển thị ra _site_ với field *allow*
Chỉ cho phép tất cả ẩn đi hoặc chỉ 1 trong các cấu hình được *allow: true* thôi. 

# site:
Lấy từ database, cấu hình nào có *allow: true* thì được hiển thị, nếu không sẽ hiển thị mặc định.

5. Ghi nhớ mật khẩu
Dùng *cookie* để lưu tài khoản, mật khẩu.
Áp dụng cho _admin_ và _site_
# Hoạt động:
- Ban đầu, bảo vệ việc đăng nhập bằng middeware, dùng session.
- Khi đăng nhập, chọn ô ghi nhớ thì sẽ lưu thông tin vào cookie. 
- Tạo middeware đứng trước session, tìm cookie, tìm được thì gán cho thông tin như ở session.
=> Từ đó, vào trình duyệt, đủ điều kiện middeware thì sẽ không cần đăng nhập thủ công.

6. Quản lí quảng cáo slider, banner
# Xây dựng sliderModel và bannerModel:
- thumbnails: 1 mảng các ảnh
- allow: cho phép hiển thị
# admin:
Quản lí, hiển thị, thêm mới, xóa các slider, banner này.
Thao tác: tắt hết hoặc hiển thị 1 cấu hình slider hoặc banner với *allow: true*

# site:
Lấy từ database, slider, banner nào có *allow: true* thì được hiển thị, còn không thì sẽ hiển thị theo mặc định.

7. Xác nhận trước khi xóa nội dung:
Dùng javascipt, dùng sự kiện onClick để xử lí
window confirm hiển thị ra 1 thông báo để người dùng xác nhận trước khi xóa.
Nếu đồng ý thì sẽ chuyển đường dẫn tới controller cần xóa (kèm đường dẫn là id trên params)

8. Chọn xóa nhiều nội dung cùng lúc:
Dùng javascipt, dùng sự kiện onClick để xử lí
window confirm hiển thị ra 1 thông báo để người dùng xác nhận trước khi xóa.
Nếu đồng ý thì sẽ chuyển đường dẫn tới controller cần xóa (kèm đường dẫn là ids trên params)
Xử lí tương tự như xóa 1

9. Xóa sản phẩm sẽ xóa luôn ảnh mô tả cho sản phẩm
- Xóa mềm: Ban đầu productModel có field <is_delete> để là false (mặc định) - hiểu là chưa xóa
Khi xóa mềm thì sẽ chuyển <is_delete> là *true*

- Xóa cứng:
Khi có id của sản phẩm thì tìm được thumbnail của sản phẩm.
Dùng path, fs để xử lí.
Khi có thumbnail (tên ảnh) của sản phẩm, dùng path để tạo đường dẫn đến thư mục đó.
Kiểm tra, nếu có nhiều hơn 1 ảnh trong thư mục thì xóa bằng fs.unlinkSync, nếu không thì để nguyên đó.
Xóa ảnh xong thì xóa hẳn sản phẩm trong database bằng việc gọi phương thức delete

10. Xóa danh mục thì đưa sản phẩm vào danh mục gốc (root):
Không dùng cách xóa này nữa mà sẽ là xóa mềm -> đưa vào thùng rác.

<!-- ---------------------------------------------------------- -->
*** CHỨC NĂNG ***
1. Đăng nhập bằng Google
2. Đăng nhập bằng Facebook
3. Menu đa cấp đệ quy
4. Tìm kiếm sản phẩm theo gợi ý
5. Lọc sản phẩm theo danh mục
6. Xây dựng trang đăng kí thành viên (Users) và Khách hàng (Customer)
7. Xây dựng tính năng lấy lại mật khẩu
8. Upload nhiều ảnh sản phẩm cùng lúc
9. Tích hợp mã captcha khi bình luận sản phẩm
10. Xóa dữ liệu trong admin(user, category, products,...) sẽ được đưa dữ liệu vào thùng rác, có thể vào thùng rác để khôi phục dữ liệu đã xóa.
<!--  -->
**TRÌNH BÀY**
1. Đăng nhập bằng Google
2. Đăng nhập bằng Facebook
Dùng passportjs để thực hiện chức năng này.
Cài đặt, chạy theo hướng dẫn, có 2 router để xử lí.
- 1 router để đưa việc đăng nhập tới cách đăng nhập của Google, Facebook (<Router 1>)
- 1 router để hứng callback trả về khi đăng nhập của router trước (<Router 2>)
Tại <Router 2>, xử lí khi có profile trả về, kiểm tra dữ liệu đó để tạo mới hoặc cho phép đăng nhập khi đã có tài khoản.
Khi tạo mới hoặc cho phép đăng nhập thì sẽ đưa tới 1 router khác, tại đây sẽ lưu email, password vào req.session để khớp với middleware checkLogin và checkAdmin

3. Menu đa cấp đệ quy (Nested):
Quản lí menu đa cấp tương tự như cách quản lí comment, quan hệ cha-con
Sử dụng đệ quy để xử lí, ở cấp cha ngoài cùng và cấp con thứ nhất (cấp 1) thì sẽ chỉ hiển thị thôi. Từ cấp con thứ 2 trở đi mới dùng để thêm sản phẩm vào đó. Vì sản phẩm có trường danh mục ref

4. Tìm kiếm sản phẩm theo gợi ý:
Khi nhập từ khóa vào ô input tìm kiếm, sử dụng JS xử lí.
Tại input đó, gán thuộc tính <onkeyup>, toàn bộ logic xử lí tại đây.
- Dùng ajax gọi tới router (router này trả về dữ liệu dạng json - là tên của tất cả các sản phẩm có trong database) và gán 1 biến cho nó.
Khi người dùng nhấc phím lên, biến đã được gán kia sẽ kiểm tra xem có chứa value từ input không? Nếu có thì trả về các tên khớp, nếu không thì chỉ lấy dữ liệu đang nhập.
Đồng thời, hiển thị thêm phần html, css cho các từ khóa vừa xong. 

5. Lọc sản phẩm theo danh mục:
# admin:
Tại trang hiển thị products, thêm 1 ô hiển thị option, tại đây là danh mục tương ứng (là cat_id của productModel).
Tại option này sẽ gán thuộc tính <onChange>. Khi <onChange>, lấy được *_id* của category và hiển thị *title* của category.
Sau đó chuyển sang router để xử lí cho việc <onChange> này. 
Tại controller tương ứng với router, lấy được *_id* trên đường dẫn, lấy sản phẩm lọc theo tiêu chí là tất cả sản phẩm *is_delete = false* và có *cat_id* là *_id* vừa được lấy về từ đường dẫn.
Trả lại sản phẩm đó ra trang products.

6. Xây dựng trang đăng kí customer và user:
- Tạo <userModel>, xây dựng router, controller cho việc đăng kí bình thường.

7. Xây dựng tính năng lấy lại mật khẩu:
Tạo thêm router, khi người dùng click vào nút "Quên mật khẩu", cần nhập email, kiểm tra email không có trong database thì trả về thông báo lỗi, nếu đúng thì gửi về email đó 1 link để cập nhật mật khẩu mới.

8. Upload nhiều ảnh sản phẩm cùng lúc:
Cần sửa lại tại field <file> ở giao diện, thêm thuộc tính *multiple*,
đồng thời tại router, middlware multer cần thay đổi *fields* thay cho *single* hiện tại.
Tại troller xử lí, cần lấy <req.files> thay cho <req.file>
Tiếp đó xử lí bình thường.

9. Tích hợp mã captcha khi bình luận sản phẩm
- Trên thẻ <head> cần thêm link google recaptcha.
- Giao diện: Thêm thẻ <div> có chứa `class="g-recaptcha"` và `data-sitekey`.
Vì đã cấu hình trong google captcha rồi nên với việc điền captcha và submit form, thẻ <div> kia sẽ nhận được response trả về.
Kiểm tra response đó mà không có thì không cho submit form.
- Controller: Gọi tới <link> verify captcha, chèn vào <link> đó là secret key và repsonse được nhận từ giao diện.
Kiểm tra, nếu data dạng *json* nhận về từ <link> vừa gọi có chứa key `success = true` thì cho lưu comment và chuyển hướng, nếu không thì trả về lỗi.

10. Xóa dữ liệu trong admin(user, category, products,...) sẽ được đưa dữ liệu vào thùng rác, có thể vào thùng rác để khôi phục dữ liệu đã xóa.
# Hoạt động:
Thêm field *is_delete* vào các model trên, mặc định cho nó là *false* (Chưa được xóa)
Ban đầu, hiển thị dữ liệu trong admin thì thêm field *is_delete = false*
Khi xóa mềm, đưa tới router kèm id của document cần xóa, thay đổi *is_delete = true*
Trong thùng rác sẽ chứa các document mà có *is_delete = true*
- Xóa cứng (áp dụng trong thùng rác):
Tại đây, xóa vĩnh viễn với model thao tác deleteOne hoặc deleteMany.
<!--  -->