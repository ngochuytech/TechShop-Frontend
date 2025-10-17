import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { toast } from "react-toastify";
import api from "../api";

const API = import.meta.env.VITE_API_URL;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Lấy dữ liệu từ CartPage
  const { selectedItems = [], total = 0 } = location.state || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    ward: "",
    homeAddress: "",
    note: ""
  });

  useEffect(() => {
    // Kiểm tra nếu không có sản phẩm được chọn thì quay về giỏ hàng
    if (!selectedItems || selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm từ giỏ hàng!");
      navigate("/cart");
      return;
    }
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`${API}/api/v1/users/profile`);
      const user = response.data.data;
      setUserInfo(user);
      
      // Điền sẵn thông tin từ profile
      setShippingInfo({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        province: user.address.province || "",
        ward: user.address.ward || "",
        homeAddress: user.address.homeAddress || "",
        note: ""
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmitOrder = async () => {
    // Validate thông tin
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.province || 
        !shippingInfo.ward || !shippingInfo.homeAddress) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setSubmitting(true);
    try {
      // Gọi API đặt hàng với thông tin sản phẩm đã chọn
      const orderData = {
        addressDTO: {
            province: shippingInfo.province,
            ward: shippingInfo.ward,
            homeAddress: shippingInfo.homeAddress
        },
        orderDTO: {
            paymentMethod: selectedPaymentMethod,
            totalPrice: total,
            note: shippingInfo.note,
            orderItemDTOs : selectedItems.map(item => ({
                productId: item.productId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                price: item.price
            })),
        }
      };
      
      const response = await api.post(`${API}/api/v1/orders/create`, orderData);
      
      toast.success("Đặt hàng thành công!");
      navigate("/profile?tab=orders");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 pt-16 pb-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 pt-16 pb-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thanh toán
            </h1>
            <p className="text-gray-600 mt-2">
              Vui lòng kiểm tra thông tin và hoàn tất đơn hàng
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thông tin giao hàng */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Thông tin giao hàng
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      disabled
                      className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={shippingInfo.province}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tỉnh/thành phố"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phường <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={shippingInfo.ward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập phường"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="homeAddress"
                      value={shippingInfo.homeAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={shippingInfo.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Ghi chú thêm về đơn hàng (nếu có)..."
                    />
                  </div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <div
                    onClick={() => setSelectedPaymentMethod("COD")}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === "COD"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={selectedPaymentMethod === "COD"}
                      onChange={() => setSelectedPaymentMethod("COD")}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedPaymentMethod("BANK_TRANSFER")}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === "BANK_TRANSFER"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={selectedPaymentMethod === "BANK_TRANSFER"}
                      onChange={() => setSelectedPaymentMethod("BANK_TRANSFER")}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-gray-600">Thanh toán qua chuyển khoản</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedPaymentMethod("VNPAY")}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === "VNPAY"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VNPAY"
                      checked={selectedPaymentMethod === "VNPAY"}
                      onChange={() => setSelectedPaymentMethod("VNPAY")}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Thanh toán qua VNPay</p>
                      <p className="text-sm text-gray-600">Thanh toán qua ví điện tử VNPay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Đơn hàng của bạn
                </h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 max-h-64 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img
                        src={item.image || "https://via.placeholder.com/80"}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {item.productName}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600">x{item.quantity}</span>
                          <span className="text-sm font-semibold text-red-600">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{formatPrice(total)}</span>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Đặt hàng
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Quay lại giỏ hàng
                </button>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">Chính sách giao hàng</p>
                      <p className="text-xs">• Miễn phí vận chuyển toàn quốc</p>
                      <p className="text-xs">• Giao hàng trong 2-3 ngày</p>
                      <p className="text-xs">• Hỗ trợ đổi trả trong 7 ngày</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
