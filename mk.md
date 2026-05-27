# VPC và VPN trong AWS — Khác nhau như thế nào?

![Minh họa VPC và VPN](https://images.genius.com/36612aca049595e0128b73fc822b4866.760x760x1.png)

## 🏠 VPC — Virtual Private Cloud

**VPC** là **không gian mạng riêng tư** của bạn bên trong AWS.  
Hãy tưởng tượng nó như một **ngôi nhà**: bạn có thể chia thành nhiều phòng (subnet), đặt máy chủ (EC2), cơ sở dữ liệu (RDS), v.v. — tất cả đều nằm trong một khu vực được bảo vệ, tách biệt với người khác.

### Những thứ nằm bên trong VPC:
- **Subnet** — các phân vùng mạng nhỏ hơn (công khai / riêng tư)
- **EC2 instances** — máy chủ ảo
- **RDS / Database** — cơ sở dữ liệu
- **Internet Gateway** — cổng kết nối ra internet công khai
- **VPN Gateway (VGW)** — cổng nhận kết nối VPN từ bên ngoài

---

## 🔑 VPN — Virtual Private Network

**VPN** là **đường hầm kết nối mã hóa** để đi vào VPC một cách an toàn từ bên ngoài.  
Nếu VPC là ngôi nhà, thì VPN là **chìa khóa + đường hầm bí mật** giúp bạn vào nhà mà không ai nhìn thấy.

### Khi nào dùng VPN?
- Nhân viên làm việc từ xa cần truy cập tài nguyên nội bộ
- Kết nối văn phòng truyền thống với hạ tầng AWS
- Bảo mật dữ liệu truyền tải qua internet

---

## 🔍 So sánh nhanh

| Tiêu chí | VPC | VPN |
|---|---|---|
| **Là gì?** | Không gian mạng riêng trong AWS | Đường kết nối mã hóa |
| **Vai trò** | Nơi chứa tài nguyên | Cách truy cập an toàn |
| **Hình ảnh** | Ngôi nhà | Chìa khóa + đường hầm |
| **Ví dụ** | Subnet, EC2, RDS | Site-to-Site VPN, Client VPN |

---

## 💡 Cách nhớ đơn giản

> **VPC = ngôi nhà** (không gian, nơi chứa mọi thứ)  
> **VPN = chìa khóa** (cách vào nhà một cách an toàn)

Khi học AWS, VPC sẽ xuất hiện rất thường xuyên vì hầu hết các dịch vụ đều triển khai bên trong nó.  
Hiểu rõ VPC ngay từ đầu sẽ giúp bạn nắm được kiến trúc của toàn bộ hệ thống.

---

*Tham khảo thêm: [AWS Black Belt Online Seminar](https://aws.amazon.com/jp/events/aws-event-resource/blackbelt/)*