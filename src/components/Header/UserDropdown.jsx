import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import axios from "axios";
import { toast } from "react-toastify";
import { FaBell, FaShoppingCart, FaComment, FaTrash, FaCheckDouble } from "react-icons/fa";
import { ACCESS_TOKEN } from "../../constants";

const API = import.meta.env.VITE_API_URL;

export default function UserDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      fetchNotifications();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {

    if (open) {
      setLoading(true);
    }
    try {
      const params = {
        page: 0,
        size: 5,
        sortBy: "createdAt",
        sortDir: "desc"
      };
      const response = await api.get(`${API}/api/v1/customer/notifications/user`, { params });
      const notificationArray = Array.isArray(response.data?.data?.content) ? response.data?.data?.content : [];
      
      setNotifications(notificationArray);

      const unread = notificationArray.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (open) {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (notificationId, read) => {
    if (read) return;
    
    try {
      await api.put(`${API}/api/v1/customer/notifications/${notificationId}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      const wasUnread = notificationToDelete && !notificationToDelete.read;
      
      await api.delete(`${API}/api/v1/customer/notifications/delete/${notificationId}`);
      toast.success("Đã xóa thông báo");
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleLogout = async () => {
    try {
      // Gọi API logout
      await axios.post(
        `${API}/api/v1/users/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      
      sessionStorage.removeItem(ACCESS_TOKEN);
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("userId");
      
      toast.success("Đã đăng xuất thành công");
      setOpen(false);
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      sessionStorage.removeItem(ACCESS_TOKEN);
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("userId");
      toast.error("Đã đăng xuất (có lỗi từ server)");
      setOpen(false);
      navigate("/auth");
    }
  };

  const getNotificationIcon = (title) => {
    if (title?.toLowerCase().includes("đơn hàng") || title?.toLowerCase().includes("order")) {
      return <FaShoppingCart className="text-blue-500" />;
    } else if (title?.toLowerCase().includes("bình luận") || title?.toLowerCase().includes("comment")) {
      return <FaComment className="text-green-500" />;
    }
    return <FaBell className="text-gray-500" />;
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
    return date.toLocaleDateString("vi-VN");
  };
  
  const recentNotifications = notifications;

  if (!user) {
    return (
      <button
        className="rounded-full px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => navigate("/auth")}
      >
        Đăng nhập
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Nút user */}
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full px-4 py-1 border-2 border-blue-300 text-sm bg-neutral-200 text-black hover:bg-neutral-50 flex items-center gap-2"
      >
        {user.name}
        {unreadCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-stone-400 rounded-lg shadow-lg z-50 max-h-[600px] flex flex-col">
          <button
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
            className="w-[90%] text-center mx-auto block my-2 px-4 py-3 border border-blue-500 rounded-md font-medium text-blue-600 hover:bg-blue-50"
          >
            Trang cá nhân
          </button>

          <button
            onClick={handleLogout}
            className="w-[90%] text-center mx-auto block my-2 px-4 py-3 border border-red-500 rounded-md font-medium text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </button>

          <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
            <span className="font-semibold text-lg flex items-center gap-2">
              <FaBell className="text-blue-600" />
              Thông báo
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
            <button 
              className="text-blue-600 text-sm hover:underline"
              onClick={() => {
                navigate("/profile?tab=notifications");
                setOpen(false);
              }}
            >
              Xem tất cả
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? "bg-blue-50" : "bg-white"
                    }`}
                    onClick={() => handleMarkAsRead(notification.id, notification.read)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? "text-blue-700" : "text-gray-900"}`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                            title="Xóa thông báo"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message || notification.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                              Mới
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaBell size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
