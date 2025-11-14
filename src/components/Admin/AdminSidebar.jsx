export default function AdminSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "orders", label: "Đơn hàng", icon: "🛒" },
    { id: "categories", label: "Danh mục", icon: "🏷️" },
    { id: "brands", label: "Thương hiệu", icon: "©️" },
    { id: "banners", label: "Banner", icon: "🖼️" },
    { id: "product-models", label: "Nhóm sản phẩm", icon: "📋" },
    { id: "products", label: "Sản phẩm", icon: "📦" },
    { id: "promotions", label: "Mã giảm giá", icon: "🎫" }
  ];

  return (
    <aside className="w-64 bg-white rounded-xl shadow-lg p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
