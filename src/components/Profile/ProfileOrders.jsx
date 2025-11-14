import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api";

export default function ProfileOrders({ orders: initialOrders = [], getStatusColor, loading: initialLoading }) {
  const navigate = useNavigate();
  const [activeStatusTab, setActiveStatusTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(initialLoading);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    All: 0,
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPING: 0,
    DELIVERED: 0,
    CANCELLED: 0
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Hàm fetch số lượng đơn hàng theo status
  const fetchStatusCounts = async () => {
    try {
      const response = await api.get(`${API_URL}/api/v1/customer/orders/count-by-status`);
      const counts = response.data.data || {};
      setStatusCounts(prev => ({
        ...prev,
        PENDING: counts.PENDING || 0,
        CONFIRMED: counts.CONFIRMED || 0,
        SHIPPING: counts.SHIPPING || 0,
        DELIVERED: counts.DELIVERED || 0,
        CANCELLED: counts.CANCELLED || 0
      }));
      // Tính tổng All
      const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
      setStatusCounts(prev => ({
        ...prev,
        All: total
      }));
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  // Hàm fetch đơn hàng
  const fetchOrders = async (page = 0, status = "All", size = 10) => {
    setLoading(true);
    try {
      let response;
      if (status === "All") {
        response = await api.get(`${API_URL}/api/v1/customer/orders/user`, {
          params: { page, size, sortBy: "createdAt", sortDir: "desc" }
        });
      } else {
        response = await api.get(`${API_URL}/api/v1/customer/orders/status`, {
          params: { status, page, size, sortBy: "createdAt", sortDir: "desc" }
        });
      }

      const data = response.data.data;
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      
      const ordersData = data.content || [];
      setOrders(ordersData.map(order => ({
        id: order.id,
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '',
        status: order.status,
        total: order.totalPrice,
        items: Array.isArray(order.items)
          ? order.items.map(item => ({
            name: item.productName,
            price: item.price,
            quantity: item.quantity
          }))
          : []
      })));
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load đơn hàng và status counts khi component mount
  useEffect(() => {
    fetchStatusCounts();
    fetchOrders(0, "All", pageSize);
  }, [pageSize]);

  // Xử lý thay đổi tab trạng thái
  const handleStatusTabChange = (status) => {
    setActiveStatusTab(status);
    setCurrentPage(0);
    fetchOrders(0, status, pageSize);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchOrders(newPage, activeStatusTab, pageSize);
    }
  };

  // Định nghĩa các trạng thái
  const statusTabs = [
    { key: "All", label: "Tất cả", count: statusCounts.All },
    { key: "PENDING", label: "Chờ xác nhận", count: statusCounts.PENDING },
    { key: "CONFIRMED", label: "Đã xác nhận", count: statusCounts.CONFIRMED },
    { key: "SHIPPING", label: "Đang giao", count: statusCounts.SHIPPING },
    { key: "DELIVERED", label: "Đã giao", count: statusCounts.DELIVERED },
    { key: "CANCELLED", label: "Đã hủy", count: statusCounts.CANCELLED },
  ];

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
              onClick={() => handleStatusTabChange(tab.key)}
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

      {/* Page Size Selection */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Số đơn hàng mỗi trang:</label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
          <span className="text-gray-500 text-lg">Đang tải đơn hàng...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-gray-500 text-lg">
            {activeStatusTab === "All" 
              ? "Chưa có đơn hàng nào" 
              : `Không có đơn hàng "${statusTabs.find(t => t.key === activeStatusTab)?.label}"`}
          </p>
        </div>
      ) : (
        <>
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
                    {(() => {
                      switch(order.status) {
                        case 'PENDING': return 'Chờ xác nhận';
                        case 'CONFIRMED': return 'Đã xác nhận';
                        case 'SHIPPING': return 'Đang giao';
                        case 'DELIVERED': return 'Đã giao';
                        case 'CANCELLED': return 'Đã hủy';
                        default: return order.status;
                      }
                    })()}
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

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị trang <span className="font-semibold">{currentPage + 1}</span> / <span className="font-semibold">{totalPages}</span>
              {totalElements > 0 && (
                <span className="ml-4">
                  Tổng cộng: <span className="font-semibold">{totalElements}</span> đơn hàng
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Trước
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map(pageNum => {
                  // Hiển thị tối đa 5 nút trang
                  if (totalPages <= 5 || 
                      pageNum === 0 || 
                      pageNum === totalPages - 1 ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  } else if (pageNum === 1 && currentPage > 2) {
                    return <span key={pageNum} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Sau →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}