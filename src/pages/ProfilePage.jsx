import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { toast } from "react-toastify";
import api from "../api";
import ProfileInfo from "../components/Profile/ProfileInfo";
import ProfileOrders from "../components/Profile/ProfileOrders";
import ProfileFavorites from "../components/Profile/ProfileFavorites";
import ProfileSettings from "../components/Profile/ProfileSettings";

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

  const [address, setAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    province: "",
    ward: "",
    homeAddress: "",
    suggestedName: ""
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`${API}/api/v1/users/profile`);
        const profile = response.data.data;
        setUser({
          fullName: profile.fullName || "User",
          email: profile.email || "user@example.com",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
          avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}`,
        });
        setFormData({
          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
        });
        if(profile.address != null){
          setAddress({
            province: profile.address?.province || "",
            ward: profile.address?.ward || "",
            homeAddress: profile.address?.homeAddress || "",
            suggestedName: profile.address?.suggestedName || ""
          });
          setAddressForm({
            province: profile.address?.province || "",
            ward: profile.address?.ward || "",
            homeAddress: profile.address?.homeAddress || "",
            suggestedName: profile.address?.suggestedName || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const response = await api.get(`${API}/api/v1/orders/user`);
        let ordersData = [];
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        }
        
        console.log("Processed ordersData:", ordersData);
        
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
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchProfile();
    fetchOrders();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [showEditForm, setShowEditForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateProfile = async () => {
      try {
        const response = await api.put(`${API}/api/v1/users/update-profile`, formData);
        toast.success("Cập nhật thông tin thành công!");
        setShowEditForm(false);
      } catch (error) {
        toast.error("Cập nhật thông tin thất bại!");
      }
    };
    updateProfile();
  };

  function updateUserAddress(addressData) {
    return api.put(`${API}/api/v1/users/update-address-user`, addressData);
  }

  // ...existing code...

  // Trong component ProfilePage
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.ward || !addressForm.province || !addressForm.homeAddress) {
      toast.error("Vui lòng nhập đầy đủ Phường, Thành phố và Địa chỉ nhà!");
      return;
    }
    try {
      await updateUserAddress(addressForm);
      toast.success("Cập nhật địa chỉ thành công!");
      setAddress({ ...addressForm });
      setShowAddressForm(false);
    } catch (error) {
      toast.error("Cập nhật địa chỉ thất bại!");
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full border-4 border-red-600 shadow-lg"
                  />
                  <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {user.fullName}
                    </h1>
                    <p className="text-gray-700 mb-1">{user.email}</p>
                    <p className="text-gray-600 text-sm">
                      📞 {user.phone || "Chưa cập nhật số điện thoại"}
                    </p>
                  </div>
                </div>
                
                {/* Stats Section */}
                <div className="hidden md:flex gap-8">
                  <div className="text-center border-l border-gray-300 pl-8">
                    <div className="text-3xl font-bold text-blue-600">
                      {orders.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Đơn hàng</div>
                  </div>
                  <div className="text-center border-l border-gray-300 pl-8">
                    <div className="text-3xl font-bold text-purple-600">
                      {address ? "1" : "0"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Địa chỉ</div>
                  </div>
                  <div className="text-center border-l border-gray-300 pl-8">
                    <div className="text-3xl font-bold text-pink-600">0</div>
                    <div className="text-sm text-gray-600 mt-1">Yêu thích</div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Stats */}
              <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {orders.length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Đơn hàng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {address ? "1" : "0"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Địa chỉ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">0</div>
                    <div className="text-xs text-gray-600 mt-1">Yêu thích</div>
                  </div>
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
                <ProfileInfo
                  address={address}
                  addressForm={addressForm}
                  handleAddressChange={handleAddressChange}
                  handleAddressSubmit={handleAddressSubmit}
                  showAddressForm={showAddressForm}
                  setShowAddressForm={setShowAddressForm}
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  showEditForm={showEditForm}
                  setShowEditForm={setShowEditForm}
                />
              )}
              {activeTab === "orders" && (
                <ProfileOrders orders={orders} getStatusColor={getStatusColor} loading={loadingOrders} />
              )}
              {activeTab === "favorites" && (
                <ProfileFavorites />
              )}
              {activeTab === "settings" && (
                <ProfileSettings />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
