import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

export default function ProfileFavorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    fetchFavorites();
  }, [currentPage, pageSize]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: "id",
        sortDir: "desc"
      };
      const response = await api.get(`${API}/api/v1/customer/favourites`, { params });
      
      if (response.data?.data?.content) {
        setFavorites(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setTotalElements(response.data.data.totalElements);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?")) return;
    
    try {
      await api.delete(`${API}/api/v1/customer/favourites/product/${productId}`);
      toast.success("Đã xóa khỏi danh sách yêu thích");
      fetchFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <FaHeart className="text-red-500" />
          Sản phẩm yêu thích
        </h2>
        <div className="text-sm text-gray-600">
          Tổng số: <span className="font-semibold text-blue-600">{totalElements}</span> sản phẩm
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <FaHeart className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg mb-2">Chưa có sản phẩm yêu thích</p>
          <p className="text-gray-400 text-sm mb-6">Hãy thêm sản phẩm vào danh sách yêu thích của bạn</p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="relative">
                  <img
                    src={favorite.product.image || "https://via.placeholder.com/300"}
                    alt={favorite.product.name}
                    className="w-full h-48 object-contain cursor-pointer group-hover:scale-105 transition-transform"
                    onClick={() => navigate(`/category/${favorite.product.category}/product/${favorite.product.id}`)}
                  />
                  <button
                    onClick={() => handleRemoveFavorite(favorite.product.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-red-50 transition-colors shadow-md"
                    title="Xóa khỏi yêu thích"
                  >
                    <FaTrash className="text-red-500" size={16} />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3
                    className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/category/${favorite.product.category}/product/${favorite.product.id}`)}
                  >
                    {favorite.product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(favorite.product.price)}
                    </span>
                    <button
                      onClick={() => navigate(`/category/${favorite.product.category}/product/${favorite.product.id}`)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Xem chi tiết"
                    >
                      <FaShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                Hiển thị {favorites.length} sản phẩm - Trang {currentPage + 1} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
