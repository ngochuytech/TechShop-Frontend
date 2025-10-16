import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function UserDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  
  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        className="rounded-full px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => navigate("/auth")} // thêm onClick này
      >
        Đăng nhập
      </button>
    );
  }

  // Style cho tab active/inactive
  const activeClass =
    "px-3 py-1 rounded-full border border-blue-400 font-bold text-sm text-blue-700";
  const inactiveClass =
    "px-3 py-1 rounded-full border border-gray-400 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600";

  return (
    <div className="relative" ref={menuRef}>
      {/* Nút user */}
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full px-4 py-1 border-2 border-blue-300 text-sm bg-neutral-200 text-black hover:bg-neutral-50"
      >
        {user.name}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-85 bg-white border border-stone-400 rounded-lg shadow-lg z-50">
            <button
                    onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                    }}
                    className="w-[90%] text-center mx-auto block my-2 px-4 py-3 border border-blue-500 rounded-md font-medium text-blue-600 hover:bg-blue-50"
            >
                Trang cá nhân
            </button>

          <div className="px-4 py-2 border-b flex justify-between items-center">
            <span className="font-medium">Thông báo</span>
            <button className="text-blue-600 text-sm">
              Đánh dấu đã đọc tất cả
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 py-2">
            <button
              className={activeTab === "Tất cả" ? activeClass : inactiveClass}
              onClick={() => setActiveTab("Tất cả")}
            >
              Tất cả
            </button>
            <button
              className={activeTab === "Đơn hàng" ? activeClass : inactiveClass}
              onClick={() => setActiveTab("Đơn hàng")}
            >
              Đơn hàng
            </button>
            <button
              className={activeTab === "Bình luận" ? activeClass : inactiveClass}
              onClick={() => setActiveTab("Bình luận")}
            >
              Bình luận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
