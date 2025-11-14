import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ProductModelManagement() {
  const [productModels, setProductModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    brand_id: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProductModels();
  }, [currentPage, pageSize, sortBy, sortDir, searchQuery, filterCategory, filterBrand]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.get(`${API}/api/v1/categories`),
        axios.get(`${API}/api/v1/brands`),
      ]);
      setCategories(categoriesRes.data.data || categoriesRes.data);
      setBrands(brandsRes.data.data || brandsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Có lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductModels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: sortBy,
        sortDir: sortDir,
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (filterCategory) {
        params.append('categoryId', filterCategory);
      }
      if (filterBrand) {
        params.append('brandId', filterBrand);
      }

      const response = await api.get(`${API}/api/v1/admin/product-models?${params.toString()}`);
      const data = response.data.data || response.data;

      if (data.content) {
        setProductModels(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setProductModels(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalElements(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Error fetching product models:", error);
      setProductModels([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category_id || !formData.brand_id) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      if (editingModel) {
        await api.put(`${API}/api/v1/admin/product-models/update/${editingModel.id}`, formData);
        toast.success("Cập nhật Product Model thành công!");
      } else {
        await api.post(`${API}/api/v1/admin/product-models/create`, formData);
        toast.success("Thêm Product Model thành công!");
      }

      setShowForm(false);
      setEditingModel(null);
      setFormData({
        name: "",
        description: "",
        category_id: "",
        brand_id: "",
      });
      fetchProductModels();
    } catch (error) {
      console.error("Error saving product model:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      description: model.description || "",
      category_id: model.category?.id || "",
      brand_id: model.brand?.id || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Product Model này?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/admin/product-models/delete/${id}`);
      toast.success("Xóa Product Model thành công!");
      fetchProductModels();
    } catch (error) {
      console.error("Error deleting product model:", error);
      toast.error("Có lỗi khi xóa Product Model");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingModel(null);
    setFormData({
      name: "",
      description: "",
      category_id: "",
      brand_id: "",
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchInput("");
    setFilterCategory("");
    setFilterBrand("");
    setSortBy("createdAt");
    setSortDir("desc");
    setCurrentPage(0);
  };

  const handleSortChange = (value) => {
    setCurrentPage(0);
    switch (value) {
      case "newest":
        setSortBy("createdAt");
        setSortDir("desc");
        break;
      case "oldest":
        setSortBy("createdAt");
        setSortDir("asc");
        break;
      case "name-asc":
        setSortBy("name");
        setSortDir("asc");
        break;
      case "name-desc":
        setSortBy("name");
        setSortDir("desc");
        break;
      default:
        setSortBy("createdAt");
        setSortDir("desc");
    }
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(0);
  };

  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(0);
  };

  const handleBrandFilterChange = (e) => {
    setFilterBrand(e.target.value);
    setCurrentPage(0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quản lý nhóm sản phẩm
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {showForm ? "Đóng Form" : "➕ Thêm Product Model"}
        </button>
      </div>

      {/* Info Box - Hướng dẫn */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
            📱
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              🎯 Product Model - Mẫu sản phẩm tổng quát
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <span className="font-bold text-purple-600 mt-0.5">📋</span>
                <span><strong>Định nghĩa:</strong> Product Model là dòng sản phẩm chung, đại diện cho một mẫu mã sản phẩm cụ thể của thương hiệu.
                <br/>Không chứa thông tin chi tiết về giá cả, màu sắc, dung lượng hay số lượng tồn kho.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-purple-600 mt-0.5">🔗</span>
                <span><strong>Quan hệ:</strong> 1 Product Model có thể có nhiều Products (biến thể) khác nhau.
                <br/>Mỗi biến thể sẽ có giá, màu sắc, cấu hình và số lượng riêng.</span>
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                <p className="font-semibold text-gray-800 mb-1">💡 Ví dụ:</p>
                <ul className="space-y-1 ml-4 text-xs text-gray-600">
                  <li>• <strong className="text-purple-600">Product Model:</strong> "iPhone 15 Pro Max" (chỉ là tên dòng sản phẩm)</li>
                  <li className="ml-4">↳ Chứa thông tin: Tên, Danh mục (Điện thoại), Thương hiệu (Apple), Mô tả chung</li>
                  <li className="mt-2">• <strong className="text-blue-600">Product (Con):</strong> "iPhone 15 Pro Max 256GB Titan Xanh - 29.990.000₫"</li>
                  <li className="ml-4">↳ Chứa thông tin: Giá, Màu sắc, Dung lượng, Hình ảnh, Số lượng tồn kho</li>
                </ul>
              </div>
              <p className="flex items-center gap-2 mt-3 text-xs bg-purple-100 text-purple-800 px-3 py-2 rounded-lg">
                <span className="font-bold">⚠️ Lưu ý:</span>
                <span>Phải tạo Product Model trước, sau đó mới tạo các Products thuộc Model đó.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔍 Tìm kiếm theo tên nhóm sản phẩm"
              className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleSearchClick}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all whitespace-nowrap"
          >
            Tìm kiếm
          </button>
          {(searchQuery || filterCategory || filterBrand || sortBy !== "createdAt" || sortDir !== "desc") && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all whitespace-nowrap"
            >
              🗑️ Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lọc theo danh mục
            </label>
            <select
              value={filterCategory}
              onChange={handleCategoryFilterChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lọc theo thương hiệu
            </label>
            <select
              value={filterBrand}
              onChange={handleBrandFilterChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={`${sortBy === "createdAt" ? (sortDir === "desc" ? "newest" : "oldest") : (sortDir === "asc" ? "name-asc" : "name-desc")}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
          </div>
        </div>

      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingModel ? "✏️ Chỉnh sửa Product Model" : "➕ Thêm Product Model mới"}
                </h3>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Product Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: iPhone 15 Pro Max"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết về product model"
                  rows="3"
                />
              </div>
            </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingModel ? "💾 Cập nhật" : "➕ Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Models List */}
      {productModels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery || filterCategory || filterBrand 
              ? "Không tìm thấy Product Model nào phù hợp với bộ lọc" 
              : "Chưa có Product Model nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Danh mục</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Thương hiệu</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mô tả</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {productModels.map((model) => (
                <tr key={model.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{model.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {model.category || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {model.brand|| "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {model.description || "Không có mô tả"}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(model)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Always show if there are items */}
        {productModels.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {/* Page info */}
            <div className="text-center text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages > 0 ? totalPages : 1}
            </div>
            
            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              
              <div className="flex gap-1 flex-wrap">
                {totalPages > 0 && [...Array(totalPages)].map((_, index) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    index === 0 ||
                    index === totalPages - 1 ||
                    (index >= currentPage - 1 && index <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === index
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  } else if (index === currentPage - 2 || index === currentPage + 2) {
                    return <span key={index} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>

            {/* Page size selector */}
            <div className="flex justify-center items-center gap-2 text-sm">
              <span className="text-gray-600">Số item mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="px-3 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </>
      )}
    </div>
  );
}
