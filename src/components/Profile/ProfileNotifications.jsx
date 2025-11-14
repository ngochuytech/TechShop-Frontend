import { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FaBell, FaShoppingCart, FaComment, FaTrash, FaSync } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

export default function ProfileNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, pageSize]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: "createdAt",
        sortDir: "desc"
      };
      const response = await api.get(`${API}/api/v1/customer/notifications/user`, { params });
      const data = response.data?.data;
      
      const notificationArray = Array.isArray(data?.content) ? data.content : [];
      setNotifications(notificationArray);
      
      setTotalElements(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải thông báo");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, read) => {
    if (read) return; // Đã đọc rồi thì không làm gì
    
    try {
      await api.put(`${API}/api/v1/customer/notifications/${notificationId}/read`);
      // Cập nhật state ngay lập tức
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    
    try {
      await api.delete(`${API}/api/v1/customer/notifications/delete/${notificationId}`);
      toast.success("Đã xóa thông báo");
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Không thể xóa thông báo");
    }
  };

  const getNotificationIcon = (title) => {
    if (title?.toLowerCase().includes("đơn hàng") || title?.toLowerCase().includes("order")) {
      return <FaShoppingCart className="text-blue-500 text-xl" />;
    } else if (title?.toLowerCase().includes("bình luận") || title?.toLowerCase().includes("comment")) {
      return <FaComment className="text-green-500 text-xl" />;
    }
    return <FaBell className="text-gray-500 text-xl" />;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleString("vi-VN");
  };

  const getFilteredNotifications = () => {
    if (filter === "ALL") return notifications;
    if (filter === "UNREAD") {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBell className="text-blue-600" />
            Thông báo
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-3 py-1 rounded-full">
                {unreadCount} chưa đọc
              </span>
            )}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Tổng số: <span className="font-semibold">{notifications.length}</span> thông báo
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaSync />
          Làm mới
        </button>
      </div>

      {/* Page Size Selection */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Số thông báo mỗi trang:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "UNREAD"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* Pagination Controls - Top */}
      {totalElements > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Tổng cộng: <span className="font-semibold">{totalElements}</span> thông báo
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Trước
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i).map(pageNum => {
                if (totalPages <= 5 || 
                    pageNum === 0 || 
                    pageNum === totalPages - 1 ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? "bg-blue-50" : "bg-white"
                }`}
                onClick={() => handleMarkAsRead(notification.id, notification.read)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                          !notification.read ? "text-blue-700" : "text-gray-900"
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-700 mb-3">
                          {notification.message || notification.content}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                              Chưa đọc
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa thông báo"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FaBell size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Không có thông báo nào</p>
            <p className="text-sm mt-2">Các thông báo của bạn sẽ xuất hiện ở đây</p>
          </div>
        )}
      </div>

      {/* Pagination Controls - Bottom */}
      {totalElements > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Hiển thị trang <span className="font-semibold">{currentPage + 1}</span> / <span className="font-semibold">{totalPages}</span>
            {notifications.length > 0 && (
              <span className="ml-4">
                Số thông báo trên trang: <span className="font-semibold">{notifications.length}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Trước
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i).map(pageNum => {
                if (totalPages <= 5 || 
                    pageNum === 0 || 
                    pageNum === totalPages - 1 ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
