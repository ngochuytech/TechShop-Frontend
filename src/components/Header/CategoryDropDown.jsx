import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function CategoryDropDown() {
  const [openCategory, setOpenCategory] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: "Laptop" },
    { id: 2, name: "Desktop" },
    { id: 3, name: "Ổ cứng" },
    { id: 4, name: "Ram" },
    { id: 5, name: "Loa" },
    { id: 6, name: "Webcam" },
    { id: 7, name: "Màn hình" }
  ]
// Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenCategory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category?category=${encodeURIComponent(categoryName)}`);
    setOpenCategory(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút danh mục */}
      <button
        onClick={() => setOpenCategory(!openCategory)}
        className="flex items-center gap-1 px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
      >
        Danh mục
      </button>

      {/* Dropdown menu */}
      {openCategory && (
        <div className="absolute left-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
          <ul className="py-1">
            {categories.map((item) => (
              <li
                key={item.id}
                onClick={() => handleCategoryClick(item.name)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}