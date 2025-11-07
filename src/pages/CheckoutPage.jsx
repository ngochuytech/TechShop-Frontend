import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { toast } from "react-toastify";
import api from "../api";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Lấy dữ liệu từ CartPage
  const { selectedItems = [], total = 0 } = location.state || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

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
    if (!selectedItems || selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm từ giỏ hàng!");
      navigate("/cart");
      return;
    }
    fetchUserProfile();
    fetchAvaliableVouchers();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`${API}/api/v1/users/profile`);
      const user = response.data.data;

      setUserInfo(user);

      // Lưu danh sách địa chỉ
      if (Array.isArray(user.addresses) && user.addresses.length > 0) {
        setUserAddresses(user.addresses);
        // Tự động chọn địa chỉ đầu tiên
        const firstAddress = user.addresses[0];
        setSelectedAddress(firstAddress);
        setShippingInfo({
          fullName: user.fullName || "",
          phone: firstAddress.phone || user.phone || "",
          email: user.email || "",
          province: firstAddress.province || "",
          ward: firstAddress.ward || "",
          homeAddress: firstAddress.homeAddress || "",
          note: ""
        });
      } else {
        setShippingInfo({
          fullName: user.fullName || "",
          phone: user.phone || "",
          email: user.email || "",
          province: "",
          ward: "",
          homeAddress: "",
          note: ""
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    }
  };

  const fetchAvaliableVouchers = async () => {
    try {
      const response = await axios.get(`${API}/api/v1/promotions/available`);

      setAvailableVouchers(response.data.data);
    } catch (error) {
      console.error("Error fetching available vouchers:", error);
      toast.error("Không thể tải mã giảm giá hiện có");
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setShippingInfo(prev => ({
      ...prev,
      province: address.province || "",
      ward: address.ward || "",
      homeAddress: address.homeAddress || "",
      phone: address.phone || user.phone || ""
    }));
    setShowAddressModal(false);
    toast.success("Đã chọn địa chỉ giao hàng");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const shippingFee = 50000; // Phí vận chuyển mặc định 50k

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;

    if (selectedVoucher.type === "FIXED") {
      return selectedVoucher.discount;
    } else if (selectedVoucher.type === "SHIPPING") {
      // Nếu là mã freeship, giảm tối đa bằng phí ship
      return Math.min(selectedVoucher.discount, shippingFee);
    } else if (selectedVoucher.type === "PERCENTAGE") {
      const discountAmount = (total * selectedVoucher.discount) / 100;
      if (selectedVoucher.maxDiscount) {
        return Math.min(discountAmount, selectedVoucher.maxDiscount);
      }
      return discountAmount;
    }
    return 0;
  };

  const finalTotal = total + shippingFee - calculateDiscount();

  const handleSelectVoucher = (voucher) => {
    if (total < voucher.minOrder) {
      toast.warning(`Đơn hàng tối thiểu ${formatPrice(voucher.minOrder)} để áp dụng mã này!`);
      return;
    }
    setSelectedVoucher(voucher);
    setShowVoucherModal(false);
    toast.success(`Đã áp dụng mã giảm giá ${voucher.code}!`);
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    toast.info("Đã bỏ áp dụng mã giảm giá");
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
          homeAddress: shippingInfo.homeAddress,
          phoneNumber: shippingInfo.phone
        },
        orderDTO: {
          paymentMethod: selectedPaymentMethod,
          note: shippingInfo.note,
          shippingFee: shippingFee,
          promotionCode: selectedVoucher?.code || null,
          orderItemDTOs: selectedItems.map(item => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            price: item.price
          })),
        }
      };

      const response = await api.post(`${API}/api/v1/customer/orders`, orderData);

      const orderId = response.data?.data?.id;
      toast.success("Đặt hàng thành công!");
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate("/profile?tab=orders");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(error.response?.data?.error || "Đặt hàng thất bại. Vui lòng thử lại!");
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    Thông tin giao hàng
                  </h2>
                  {userAddresses.length > 0 && (
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all text-sm"
                    >
                      Chọn địa chỉ khác
                    </button>
                  )}
                </div>

                {userAddresses.length === 0 ? (
                  <div className="mb-4 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <div className="flex flex-col items-center text-center gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-yellow-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">Chưa có địa chỉ được thiết lập</p>
                        <p className="text-sm text-gray-600 mb-4">Vui lòng thêm địa chỉ giao hàng để tiếp tục đặt hàng</p>
                      </div>
                      <button
                        onClick={() => navigate("/profile?tab=info")}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Thêm địa chỉ ngay
                      </button>
                    </div>
                  </div>
                ) : selectedAddress && (
                  <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedAddress.suggestedName && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {selectedAddress.suggestedName}
                            </span>
                          )}
                          <span className="text-green-600 font-semibold text-sm">✓ Địa chỉ đã chọn</span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">
                          {selectedAddress.homeAddress}, {selectedAddress.ward}, {selectedAddress.province}
                        </p>
                        {selectedAddress.phoneNumber && (
                          <p className="text-sm text-gray-600 mt-1">SĐT: {selectedAddress.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {userAddresses.length > 0 && (
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
                          disabled
                          className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Chọn từ sổ địa chỉ"
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
                          disabled
                          className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Chọn từ sổ địa chỉ"
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
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Chọn từ sổ địa chỉ"
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
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Mã giảm giá
                </h2>

                {selectedVoucher ? (
                  <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                            {selectedVoucher.code}
                          </span>
                          <span className="text-green-600 font-semibold text-sm">
                            -{formatPrice(calculateDiscount())}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{selectedVoucher.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{selectedVoucher.description}</p>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowVoucherModal(true)}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Đổi mã khác
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="font-medium">Chọn mã giảm giá</span>
                    </div>
                  </button>
                )}
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
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === "COD"
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
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === "BANK_TRANSFER"
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
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === "VNPAY"
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
                    <div
                      key={item.id}
                      className="flex gap-3 items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/category/${item.categoryName}/product/${item.productId}`)}
                    >
                      <img
                        src={item.image || "https://via.placeholder.com/80"}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
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
                  {selectedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Giảm giá ({selectedVoucher.code}):
                      </span>
                      <span>-{formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{formatPrice(finalTotal)}</span>
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
                      <p className="text-xs">• Giá vận chuyển là 50.000đ cho toàn quốc</p>
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

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVoucherModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Chọn mã giảm giá</h3>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-4">
                {availableVouchers.map((voucher) => {
                  const isEligible = total >= voucher.minOrder;
                  const isSelected = selectedVoucher?.id === voucher.id;

                  return (
                    <div
                      key={voucher.id}
                      className={`border-2 rounded-lg p-4 transition-all ${isSelected
                        ? "border-blue-500 bg-blue-50"
                        : isEligible
                          ? "border-gray-300 hover:border-blue-400 cursor-pointer"
                          : "border-gray-200 bg-gray-50 opacity-60"
                        }`}
                      onClick={() => isEligible && handleSelectVoucher(voucher)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                              {voucher.code}
                            </span>
                            {voucher.type === "percent" && (
                              <span className="text-red-600 font-bold">-{voucher.discount}%</span>
                            )}
                            {voucher.type === "fixed" && (
                              <span className="text-red-600 font-bold">-{formatPrice(voucher.discount)}</span>
                            )}
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-1">{voucher.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">HSD: {new Date(voucher.expiry).toLocaleString('vi-VN')}</span>
                            {!isEligible && (
                              <span className="text-xs text-red-500 font-medium">
                                Cần thêm {formatPrice(voucher.minOrder - total)}
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-blue-600 text-sm font-semibold flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Đã chọn
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddressModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Chọn địa chỉ giao hàng</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {userAddresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Bạn chưa có địa chỉ nào</p>
                  <p className="text-sm mt-2">Vui lòng thêm địa chỉ trong trang hồ sơ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userAddresses.map((address) => {
                    const isSelected = selectedAddress?.id === address.id;
                    return (
                      <div
                        key={address.id}
                        onClick={() => handleSelectAddress(address)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {address.suggestedName && (
                              <div className="mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                                  </svg>
                                  {address.suggestedName}
                                </span>
                              </div>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {address.homeAddress}, {address.ward}, {address.province}
                                  </div>
                                </div>
                              </div>
                              {address.phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                  </svg>
                                  <div className="text-sm text-gray-600">{address.phoneNumber}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="ml-4">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
