import { useState } from "react";
import CategoryDropDown from "./CategoryDropDown";
import UserDropdown from "./UserDropDown";


function Header() {
  const [user, setUser] = useState(() => {
    if (sessionStorage.getItem("accessToken")) {
      return { name: sessionStorage.getItem("username") };
    }
    return null;
  });

  return (
    <header className="w-full bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 shadow-sm fixed top-0 left-0 z-30">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-(--my-blue) font-bold text-lg">Tech Shop</span>
        </div>

        {/* Danh mục + search */}
        <div className="flex items-center gap-10 flex-1 max-w-2xl mx-4">
          <CategoryDropDown />
          <div className="flex-1 flex items-center border rounded-md bg-green-50 px-2">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="flex-1 px-2 py-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Giỏ hàng + User */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
            Giỏ hàng
          </button>
          <UserDropdown user={user}/>
        </div>
      </div>
    </header>
  );
}

export default Header;
