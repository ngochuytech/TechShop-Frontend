import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaSearch, FaTag } from "react-icons/fa";
import api from "../../api";
import { toast } from "react-toastify";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/v1/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('name', formData.name);

      if (editingCategory) {
        // Update category
        await api.put(`/api/v1/admin/categories/${editingCategory.id}?${params.toString()}`);
        toast.success("Cập nhật danh mục thành công");
      } else {
        // Create new category
        await api.post(`/api/v1/admin/categories?${params.toString()}`);
        toast.success("Thêm danh mục thành công");
      }
      
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
    });
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <FaTag />
          Quản lý danh mục
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <FaPlus />
          Thêm danh mục
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Tên danh mục</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-800">{category.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaTag className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy danh mục nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên danh mục"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    {loading ? "Đang xử lý..." : editingCategory ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
