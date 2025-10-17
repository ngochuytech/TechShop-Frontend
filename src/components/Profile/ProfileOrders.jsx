import { useNavigate } from "react-router-dom";

export default function ProfileOrders({ orders, getStatusColor, loading }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Đơn hàng của tôi
      </h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
          <span className="text-gray-500 text-lg">Đang tải đơn hàng...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Mã đơn hàng: {order.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ngày đặt: {order.date}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {item.price.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-700 font-semibold">
                  Tổng cộng:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {order.total.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
