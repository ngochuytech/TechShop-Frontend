import { useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar";
import ProductModelManagement from "../sections/admin/ProductModelManagement";
import ProductManagement from "../sections/admin/ProductManagement";
import OrderManagement from "../sections/admin/OrderManagement";
import PromotionManagement from "../sections/admin/PromotionManagement";
import CategoryManagement from "../sections/admin/CategoryManagement";
import BrandManagement from "../sections/admin/BrandManagement";
import BannerManagement from "../sections/admin/BannerManagement";
import Dashboard from "../sections/admin/Dashboard";

export default function AdminPage() {
  const location = useLocation();
  const initialTab = location.state?.activeTab || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user] = useState(() => {
    if (sessionStorage.getItem("accessToken")) {
      return { name: sessionStorage.getItem("username") };
    }
    return null;
  });

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "categories":
        return <CategoryManagement />;
      case "brands":
        return <BrandManagement />;
      case "product-models":
        return <ProductModelManagement />;
      case "products":
        return <ProductManagement />;
      case "orders":
        return <OrderManagement />;
      case "promotions":
        return <PromotionManagement />;
      case "banners":
        return <BannerManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-white font-bold text-2xl">
              Trang Quản Trị
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
