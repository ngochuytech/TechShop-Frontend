import { useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";
import ProductModelManagement from "../sections/admin/ProductModelManagement";
import ProductManagement from "../sections/admin/ProductManagement";
import ProductVariantManagement from "../sections/admin/ProductVariantManagement";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("product-models");
  const [user] = useState(() => {
    if (localStorage.getItem("accessToken")) {
      return { name: localStorage.getItem("username") };
    }
    return null;
  });

  const renderContent = () => {
    switch (activeTab) {
      case "product-models":
        return <ProductModelManagement />;
      case "products":
        return <ProductManagement />;
      case "product-variants":
        return <ProductVariantManagement />;
      case "dashboard":
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Tổng sản phẩm</h3>
                <p className="text-4xl font-bold">0</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Đơn hàng</h3>
                <p className="text-4xl font-bold">0</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Khách hàng</h3>
                <p className="text-4xl font-bold">0</p>
              </div>
            </div>
          </div>
        );
      default:
        return <ProductModelManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-white font-bold text-2xl">
              🛠️ Admin Panel
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white text-sm">Xin chào, <span className="font-semibold">{user?.name || "Admin"}</span></span>
            <a
              href="/home"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
