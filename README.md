# CHỨC NĂNG CHÍNH
1. Quản lí đơn hàng
2. Quản lí bình luận
3. Mã hóa mật khẩu
4. Ghi nhớ mật khẩu
5. Quản lí cấu hình website
6. Quản lí quảng cáo (Slider & Banner)
7. Xác nhận trước khi xóa nội dung
8. Chọn xóa nhiều nội dung cùng lúc
9. Xóa sản phẩm sẽ xóa luôn ảnh mô tả cho sản phẩm
10. Đăng nhập bằng Google
11. Đăng nhập bằng Facebook
12. Menu đa cấp đệ quy
13. Tìm kiếm sản phẩm theo gợi ý
14. Lọc sản phẩm theo danh mục
15. Xây dựng trang đăng kí thành viên (Users) và Khách hàng (Customer)
16. Xây dựng tính năng lấy lại mật khẩu
17. Upload nhiều ảnh sản phẩm cùng lúc
18. Tích hợp mã captcha khi bình luận sản phẩm
19. Xóa dữ liệu trong admin(user, category, products,...) sẽ được đưa dữ liệu vào thùng rác, có thể vào thùng rác để khôi phục dữ liệu đã xóa.
-----

# TRÌNH BÀY
* Tại trang site sẽ có các chức năng cơ bản mua hàng, đăng kí, đăng nhập tài khoản cho customer.
* Tại trang admin(quản trị) sẽ phân quyền, với *role* là admin được dùng hết chức năng, *role* site chỉ được xem và chỉ được dùng chức năng với phần order (quản lí đơn hàng)

**1. Quản lí đơn hàng**
a/ Xây dựng model quản lí có tên orderModel:
Tại đây, có các field:
- customer: thông tin người dùng
- items: là 1 mảng chứa các object, mỗi object đại diện cho 1 sản phẩm (id, price, qty)
- confirmed: Dùng để kiểm soát đơn hàng. Khi quản trị viên xem đơn hàng và xác nhận đơn đã được gửi đi hay chưa.
- is_delete: Xóa mềm đơn hàng.

b/ Trang admin:
- Hiển thị các order khi người dùng đã mua ở trang site, hiển thị nó xem đã được xác nhận hay chưa.
- Quản trị viên sẽ xem và xác nhận đơn hàng.

c/ Trang site:
- Người dùng phải đăng nhập mới được mua hàng (Khi đăng kí tài khoản đã có hết thông tin khách hàng).
- Người dùng có thể kiểm tra danh sách đơn hàng đã có hoặc chưa có.

**2. Quản lí bình luận**
* Bình luận có dạng Nested
a/ Xây dựng commentModel:
Tại đây có các field:
- prd_id: Thông tin sản phẩm
- parrent_comment_id: populate đến _id của comment khác (mặc định là null)
- allow: Cho phép hiển thị ra trang site
- is_delete: Xóa mềm
- full_name, email, body: Thông tin người dùng khi comment
- left, right: Dùng để kiểm soát dạng nested

b/ Cách hoạt động:
- Quản lí comment dạng nested thì mỗi comment có 2 node (left, right)
- Node comment cha sẽ bao quanh node comment con.
- Ban đầu, comment có *parrent_comment_id* là *null* sẽ là comment cha, có 2 node được khởi tạo.
- Comment con sẽ lấy *_id* của comment cha làm *parrent_comment_id* của mình, 2 node của comment con này sẽ chèn vào giữa 2 node của comment cha đó.
(Ví dụ: Cha đang có 2 node *12*, khi có comment con thì comment con có 2 node là *23* và comment cha bây giờ có 2 node là *14*)

c/ Trang site:
Bình luận:
- Tại trang chi tiết sản phẩm sẽ có mặc định 1 form để bình luận.
- Lấy *prd_id* là *_id* của sản phẩm đang xem chi tiết làm mốc.
- Form mặc định này thì *parrent_comment_id* sẽ là *null* (Comment cha)
- Tiếp theo khi đã có bình luận rồi, click vào Trả lời thì sẽ hiển thị ra form để trả lời.
- Tại form trả lời này này, cũng lấy *prd_id* là *id* của sản phẩm đang xem chi tiết làm mốc
- *parrent_comment_id* lúc này sẽ lấy *_id* của bình luận trên (Nhận nó làm cha)
Hiển thị:
- Chỉ hiển thiện các comment có field *allow* là *true*

d/ Trang admin: 
- Có trang hiển thị comment, cho phép hiển thị ra trang site (thay đổi *allow* thành true) hoặc xóa comment.


**3. Mã hóa mật khẩu**
- Dùng *bcryptjs* để mã hóa mật khẩu khi đăng kí tài khoản mới, lúc này lưu mật khẩu người dùng vào database mật khẩu dạng đã được hash.
- Khi người dùng đăng nhập, cần thực hiện kiểm tra mật khẩu với giải mã (compare)

**4. Ghi nhớ mật khẩu**
- Sử dụng *cookie* cho việc này.

a/ Hoạt động:
- Ban đầu, bảo vệ các router bằng middleware, session. Tức là session có key thì mới qua middeware để vào các router.
- Khi đăng nhập thành công và chọn ô ghi nhớ thì sẽ lưu thông tin vào cookie. 
- Tạo middeware đứng trước middeware kiểm tra session ban đầu, kiểm tra key cookie, nếu có thì gán thông tin tương tự như middeware ở trên.
=> Từ đó, vào trình duyệt, đủ điều kiện middeware thì sẽ không cần đăng nhập thủ công.

**5. Cấu hình website**
a/ Xây dựng configModel cho việc này.
a/ Hoạt động:
- Phần cấu hình này quản lí ảnh logo header, logo banner, các thông tin khác: info, address, service, hotline

c/ Trang admin:
- Quản lí các cấu hình này. Mỗi 1 cấu hình gồm 1 logo banner, 1 logo footer và các trường thông tin khác.
- Quản trị viên sẽ được CRUD và cho phép hiển thị ra trang site với field *allow*
- Chỉ cho phép tất cả ẩn đi hoặc chỉ 1 trong các cấu hình được *allow: true* thôi. 

d/ Trang site:
- Lấy từ database, cấu hình nào có *allow: true* thì được hiển thị, nếu không sẽ hiển thị mặc định.

**6. Quản lí quảng cáo (Slider && Banners)**
a/ Xây dựng sliderModel và bannerModel cho việc này, với:
- thumbnails: 1 mảng các ảnh
- allow: cho phép hiển thị

b/ Trang admin:
- Quản lí, CRUD các slider, banner này.
- Thao tác: tắt hết hoặc hiển thị 1 cấu hình slider hoặc banner với *allow: true*
- Khi silder hoặc banner có trường *allow: true* thì khi đó chỉ có 1 document có *allow* như vậy, còn tất cả các document khác có *allow: false*

c/ Trang site:
- Lấy từ database theo model trên, slider, banner nào có *allow: true* thì được hiển thị, còn không thì sẽ hiển thị theo mặc định.

**7. Xác nhận trước khi xóa nội dung**
- Dùng javascipt, sự kiện onClick để xử lí
- window confirm hiển thị ra 1 thông báo để người dùng xác nhận trước khi xóa.
- Nếu đồng ý thì sẽ chuyển tới đường dẫn chạy controller cần xóa (kèm đường dẫn là id trên params)

**8. Chọn xóa nhiều nội dung cùng lúc**
- Dùng javascipt, sự kiện onClick để xử lí
- window confirm hiển thị ra 1 thông báo để người dùng xác nhận trước khi xóa.
- Nếu đồng ý thì sẽ chuyển đường dẫn tới controller cần xóa (kèm đường dẫn là ids trên params)
- Tại controller xóa, kiểm tra dữ liệu trên database có *_id* khớp với *ids* nhận về, chuyển *is_delete: true* (xóa mềm) 

**9. Xóa sản phẩm sẽ xóa luôn ảnh mô tả cho sản phẩm**
- Đây là áp dụng với xóa cứng, xóa hẳn sản phẩm đi.
- Khi có *_id* của sản phẩm thì lấy được thumbnail của sản phẩm. (Ban đầu khi tạo thumbnail cho sản phẩm sẽ là duy nhất)
- Dùng phương thức với S3 AWS để xóa ảnh trên bucket của aws theo thumbnail sản phẩm.

**10. Đăng nhập bằng Google && 11.Đăng nhập bằng Facebook**
Dùng passportjs để thực hiện chức năng này.
Cài đặt, chạy theo hướng dẫn, có 2 router để xử lí.
- 1 router để đưa việc đăng nhập tới cách đăng nhập của Google, Facebook (*Router 1*)
- 1 router để hứng callback trả về khi đăng nhập của router trước (*Router 2*)
Tại *Router 2*, xử lí khi có profile trả về, kiểm tra dữ liệu đó để tạo mới hoặc cho phép đăng nhập khi đã có tài khoản.
Khi tạo mới hoặc cho phép đăng nhập thì sẽ đưa tới 1 router khác, tại đây sẽ lưu email, password vào req.session để khớp với middleware kiểm tra việc đăng nhập.

**12. Menu đa cấp đệ quy (Nested)**
Quản lí menu đa cấp tương tự như cách quản lí comment, quan hệ cha-con (nested)
Sử dụng đệ quy để xử lí, ở cấp cha ngoài cùng và cấp con thứ nhất (cấp 1) thì sẽ chỉ hiển thị.
Từ cấp con thứ 2 trở đi mới dùng để xử lí CRUD sản phẩm.

**13. Tìm kiếm sản phẩm theo gợi ý**
Khi nhập từ khóa vào ô input tìm kiếm, sử dụng JS xử lí.
Tại input đó, gán thuộc tính *onkeyup*, tại đây xủ lí toàn bộ logic code.
- Dùng ajax gọi tới router (router này trả về dữ liệu dạng json - là tên của tất cả các sản phẩm có trong database) và gán 1 biến cho nó.
Khi người dùng nhấc phím lên, biến đã được gán kia sẽ kiểm tra xem có chứa value từ input không? Nếu có thì trả về các tên khớp, nếu không thì chỉ lấy dữ liệu đang nhập.
Đồng thời, hiển thị thêm phần html, css cho các từ khóa vừa xong. 

**14. Lọc sản phẩm theo danh mục**
a/ Trang admin:
- Tại trang hiển thị products, thêm 1 ô hiển thị option, tại đây là danh mục tương ứng (là cat_id của productModel).
- Tại option này sẽ gán thuộc tính *onChange*. Khi *onChange*, gọi tới 1 function, đưa vào *_id* của category và hiển thị *title* của category.
- function được gọi này sẽ logic code, sau đó chuyển sang router để xử lí.
- Tại controller tương ứng với router, lấy được *_id* trên đường dẫn, sau đó tạo 1 biến lưu trữ việc dùng model gọi tới các tiêu chí cần như *cat_id* là *_id* vừa lấy, *is_delete: false* (chưa xóa) rồi trả biến đó ra trang products.

**15. Xây dựng trang đăng kí customer và user**
- Tạo *userModel*, *customerModel*, xây dựng views, router, controller cho việc đăng kí bình thường.

**16. Xây dựng tính năng lấy lại mật khẩu**
Tạo thêm router, khi người dùng click vào nút "Quên mật khẩu", cần nhập email, kiểm tra email không có trong database thì trả về thông báo lỗi, nếu đúng thì gửi về email đó 1 link để cập nhật mật khẩu mới.

**17. Upload nhiều ảnh sản phẩm cùng lúc**
- Sửa lại field *file* ở giao diện, thêm thuộc tính *multiple*,
- Tại router, middlware multer thay đổi *fields* thay cho *single* hiện tại.
- Tại troller xử lí, lấy thông tin dữ liệu từ form với *req.files* thay *req.file* hiện tại
- Tiếp đó xử lí dữ liệu bình thường, thêm mới dữ liệu vào databse, thêm ảnh vào bucket của aws.

**18. Tích hợp mã captcha khi bình luận sản phẩm**
- Trên thẻ *head* cần thêm link google recaptcha.
a/ Trang site:
- Thêm thẻ *div* có chứa `class="g-recaptcha"` và `data-sitekey` (lấy trong dự án google recatcha).
- Vì đã cấu hình trong google captcha rồi nên với việc điền captcha, thẻ *div* kia sẽ nhận được response trả về.
- Kiểm tra response đó mà không có thì không cho submit form, nếu có thì chuyển hướng đến router xử lí, gửi kèm response nhận về.

b/ Trang admin:
- Controller xử lí: Gọi tới *link* verify captcha, thêm vào *link* đó là secret key và repsonse được nhận từ giao diện.
- Kiểm tra response tra về, nếu data dạng *json* nhận về từ *link* vừa gọi có chứa key `success = true` thì cho lưu comment và chuyển hướng, nếu không thì trả về lỗi.

**19. Xóa dữ liệu trong admin(user, category, products,...) sẽ được đưa dữ liệu vào thùng rác, có thể vào thùng rác để khôi phục dữ liệu đã xóa**
a/ Hoạt động - trang admin:
- Mặc định trong các model đã có field *is_delete: false* (Có nghĩa là chưa xóa), khi hiển thị dữ liệu thì cũng cần thêm field *is_delete: true* khi gọi database.
- Khi xóa mềm thì sẽ chuyển *is_delete: true* cho user, category, products, ... cần xóa.
- Với thùng rác, cần xây dựng views, chỉ hiển thị các user, category, products, ... có *is_delete: true*
- Trong thùng rác khôi phục thì đặt lại *is_delete*, xóa hẳn thì sẽ chuyển hướng đến router cho việc xóa hẳn.
<!--  -->