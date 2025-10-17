import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import api from "../api";

const API = import.meta.env.VITE_API_URL;

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API}/api/v1/orders/${orderId}`);
      const orderData = response.data.data;
      console.log("orderData", orderData);
      
      
      setOrder({
        id: orderData.id,
        createdAt: orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('vi-VN') : '',
        status: orderData.status,
        totalPrice: orderData.totalPrice,
        shippingAddress: orderData.shippingAddress || {},
        paymentMethod: orderData.paymentMethod,
        items: Array.isArray(orderData.orderItems)
          ? orderData.orderItems.map(item => ({
              id: item.id,
              productName: item.productName,
              productImage: item.productImage,
              price: item.price,
              quantity: item.quantity
            }))
          : []
      });
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang giao":
        return "bg-blue-100 text-blue-700";
      case "Đã giao":
        return "bg-green-100 text-green-700";
      case "Đã hủy":
        return "bg-red-100 text-red-700";
      case "Chờ xác nhận":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "COD":
        return "Thanh toán khi nhận hàng (COD)";
      case "BANK_TRANSFER":
        return "Chuyển khoản ngân hàng";
      case "VNPAY":
        return "Thanh toán qua VNPay";
      default:
        return method;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 pt-16 pb-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 pt-16 pb-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Không tìm thấy đơn hàng</p>
            <button
              onClick={() => navigate("/profile?tab=orders")}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium"
            >
              Quay lại danh sách đơn hàng
            </button>
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
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate("/profile?tab=orders")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Quay lại
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chi tiết đơn hàng
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">Mã đơn hàng: <span className="font-semibold text-gray-900">{order.id}</span></p>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Products */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Sản phẩm
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <img
                        src={item.productImage || "https://via.placeholder.com/100"}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.productName}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">
                            Số lượng: <span className="font-medium text-gray-900">{item.quantity}</span>
                          </span>
                          <span className="font-bold text-blue-600">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Địa chỉ giao hàng
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    <span className="font-semibold">Người nhận:</span> {order.shippingAddress?.fullName || "N/A"}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-semibold">Số điện thoại:</span> {order.shippingAddress?.phone || "N/A"}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-semibold">Địa chỉ:</span> {order.shippingAddress?.homeAddress || ""}, {order.shippingAddress?.ward || ""}, {order.shippingAddress?.province || ""}
                  </p>
                  {order.shippingAddress?.note && (
                    <p className="text-gray-900">
                      <span className="font-semibold">Ghi chú:</span> {order.shippingAddress.note}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Thông tin đơn hàng
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Ngày đặt:</span>
                    <span className="font-medium text-gray-900">{order.createdAt}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phương thức thanh toán:</span>
                    <span className="font-medium text-gray-900 text-sm text-right">
                      {getPaymentMethodText(order.paymentMethod)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(order.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(order.totalPrice)}</span>
                </div>

                {order.status === "Chờ xác nhận" && (
                  <button
                    className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all mb-3"
                  >
                    Hủy đơn hàng
                  </button>
                )}

                <button
                  onClick={() => navigate("/profile?tab=orders")}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
