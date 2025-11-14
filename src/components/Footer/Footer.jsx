import { Link } from 'react-router-dom';

export default function Footer() {
  const footerLinks = {
    about: [
      { name: 'Giới thiệu', path: '/about' },
      { name: 'Tuyển dụng', path: '/careers' },
      { name: 'Tin tức', path: '/news' },
    ],
    support: [
      { name: 'Hướng dẫn mua hàng', path: '/buying-guide' },
      { name: 'Chính sách bảo hành', path: '/warranty' },
      { name: 'Chính sách đổi trả', path: '/return-policy' },
      { name: 'Vận chuyển & Thanh toán', path: '/shipping' },
    ],
    contact: [
      { name: 'Hotline: 1900.1234 (7:30 - 22:00)', href: 'tel:19001234' },
      { name: 'Email: support@techstore.vn', href: 'mailto:support@techstore.vn' },
    ],
    social: [
      { name: 'Facebook', href: 'https://facebook.com' },
      { name: 'Youtube', href: 'https://youtube.com' },
      { name: 'Instagram', href: 'https://instagram.com' },
    ],
  };

  return (
    <footer className="bg-gray-300 mt-8 border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Về TechStore</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-600 hover:text-blue-600">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-600 hover:text-blue-600">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2">
              {footerLinks.contact.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-600 hover:text-blue-600">
                    {item.name}
                  </a>
                </li>
              ))}
              <li className="text-gray-600">
                Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
              </li>
            </ul>
          </div>

          {/* Social & Payment Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Kết nối với chúng tôi</h3>
            <ul className="space-y-2">
              {footerLinks.social.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>© 2025 TechStore. Nguyễn Văn Ngọc Huy.</p>
        </div>
      </div>
    </footer>
  );
}