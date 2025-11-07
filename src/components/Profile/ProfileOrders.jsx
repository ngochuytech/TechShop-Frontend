import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProfileOrders({ orders, getStatusColor, loading }) {
  const navigate = useNavigate();
  const [activeStatusTab, setActiveStatusTab] = useState("All");

  // Định nghĩa các trạng thái
  const statusTabs = [
    { key: "All", label: "Tất cả", count: orders.length },
    { key: "PENDING", label: "Chờ xác nhận", count: orders.filter(o => o.status === "PENDING").length },
    { key: "CONFIRMED", label: "Đã xác nhận", count: orders.filter(o => o.status === "CONFIRMED").length },
    { key: "SHIPPING", label: "Đang giao", count: orders.filter(o => o.status === "SHIPPING").length },
    { key: "DELIVERED", label: "Đã giao", count: orders.filter(o => o.status === "DELIVERED").length },
    { key: "CANCELLED", label: "Đã hủy", count: orders.filter(o => o.status === "CANCELLED").length },
  ];

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = activeStatusTab === "All" 
    ? orders 
    : orders.filter(order => order.status === activeStatusTab);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Đơn hàng của tôi
      </h2>

      {/* Status Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2 -mb-px">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all ${
                activeStatusTab === tab.key
                  ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeStatusTab === tab.key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
          <span className="text-gray-500 text-lg">Đang tải đơn hàng...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-gray-500 text-lg">
            {activeStatusTab === "all" 
              ? "Chưa có đơn hàng nào" 
              : `Không có đơn hàng "${statusTabs.find(t => t.key === activeStatusTab)?.label}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
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