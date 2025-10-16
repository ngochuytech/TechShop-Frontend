import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { toast } from "react-toastify";
import api from "../api";
const API = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    avatar: "https://ui-avatars.com/api/?name=User"
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [orders] = useState([
    {
      id: "ORD001",
      date: "15/10/2025",
      status: "Đang giao",
      total: 29990000,
      items: [
        { name: "iPhone 15 Pro Max 256GB", price: 29990000, quantity: 1 }
      ]
    },
    {
      id: "ORD002",
      date: "10/10/2025",
      status: "Đã giao",
      total: 15990000,
      items: [
        { name: "AirPods Pro 2", price: 5990000, quantity: 1 },
        { name: "Apple Watch Series 9", price: 9990000, quantity: 1 }
      ]
    }
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`${API}/api/v1/users/profile`);
        const profile = response.data.data;
        console.log("profile = ", profile);
        
        setUser({
          fullName: profile.fullName || "User",
          email: profile.email || "user@example.com",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
          avatar: profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}`,
        });
        setFormData({
          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateProfile = async () => {
        try {
            const response = await api.put(`${API}/api/v1/users/update-profile`, formData);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            toast.error("Cập nhật thông tin thất bại!");
        }
    }
    updateProfile();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang giao":
        return "bg-blue-100 text-blue-700";
      case "Đã giao":
        return "bg-green-100 text-green-700";
      case "Đã hủy":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 pt-16 pb-10">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-[2px] mb-8 shadow-lg">
            <div className="bg-white/90 rounded-2xl p-8">
              <div className="flex items-center gap-6">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{user.fullName}</h1>
                  <p className="text-gray-700">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
                      activeTab === "info"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">👤</span>
                    <span>Thông tin cá nhân</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
                      activeTab === "orders"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">📦</span>
                    <span>Đơn hàng của tôi</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
                      activeTab === "favorites"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">❤️</span>
                    <span>Yêu thích</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
                      activeTab === "settings"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">⚙️</span>
                    <span>Cài đặt</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === "info" && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Thông tin cá nhân
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Nhập email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all hover:from-blue-600 hover:to-purple-600"
                      >
                        Cập nhật thông tin
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Đơn hàng của tôi
                  </h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
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
              )}

              {activeTab === "favorites" && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sản phẩm yêu thích
                  </h2>
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Chưa có sản phẩm yêu thích
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Cài đặt tài khoản
                  </h2>
                  <div className="space-y-6">
                    <div className="border-b pb-6">
                      <h3 className="font-semibold text-lg mb-4">
                        Đổi mật khẩu
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu hiện tại
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nhập mật khẩu hiện tại"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu mới
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nhập mật khẩu mới"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Xác nhận mật khẩu mới
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-red-600">
                        Xóa tài khoản
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn.
                        Hành động này không thể hoàn tác.
                      </p>
                      <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all">
                        Xóa tài khoản
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
