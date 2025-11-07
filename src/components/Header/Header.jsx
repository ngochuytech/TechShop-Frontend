import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryDropDown from "./CategoryDropDown";
import UserDropdown from "./UserDropDown";


function Header() {
  const [user, setUser] = useState(() => {
    if (sessionStorage.getItem("accessToken")) {
      return { name: sessionStorage.getItem("username") };
    }
    return null;
  });
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="w-full bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 shadow-sm fixed top-0 left-0 z-30">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <a href="/home" className="text-(--my-blue) font-bold text-lg">Tech Shop</a>
        </div>

        {/* Danh mục + search */}
        <div className="flex items-center gap-10 flex-1 max-w-2xl mx-4">
          <CategoryDropDown />
          <form onSubmit={handleSearch} className="flex-1 flex items-center border rounded-md bg-green-50 px-2">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1 px-2 py-1 bg-transparent outline-none text-sm"
            />
            <button
              type="submit"
              className="p-1 hover:bg-green-100 rounded transition-colors"
              aria-label="Tìm kiếm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Giỏ hàng + User */}
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            onClick={() => navigate("/cart")}
          >
            Giỏ hàng
          </button>
          <UserDropdown user={user}/>
        </div>
      </div>
    </header>
  );
}

export default Header;
