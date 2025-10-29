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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    setUploadingAvatar(true);
    try {

      const response = await api.put(`${API}/api/v1/users/avatar`, { avatar: file }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update avatar in state
      const newAvatarUrl = response.data?.data?.avatar || response.data?.avatar;
      setUser(prev => ({
        ...prev,
        avatar: newAvatarUrl
      }));

      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Cập nhật ảnh đại diện thất bại!');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
        if (profile.address != null) {
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
                  <div className="relative group">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-24 h-24 rounded-full border-4 border-red-600 shadow-lg object-cover"
                    />
                    {/* Overlay with edit button on hover */}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </div>
                    {/* Loading spinner overlay */}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${activeTab === "info"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>

                    <span>Thông tin cá nhân</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${activeTab === "orders"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span className="text-xl">📦</span>
                    <span>Đơn hàng của tôi</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("promotions")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${activeTab === "promotions"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="blue" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                    </svg>

                    <span>Mã giảm giá</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${activeTab === "favorites"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="red" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>

                    <span>Yêu thích</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${activeTab === "settings"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="gray" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>

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
