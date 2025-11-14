import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaSearch, FaCopyright } from "react-icons/fa";
import api from "../../api";
import { toast } from "react-toastify";

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/v1/brands");
      setBrands(response.data.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingBrand) {
        // Update brand
        await api.put(`/api/v1/admin/brands/${editingBrand.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Cập nhật thương hiệu thành công");
      } else {
        // Create new brand
        await api.post("/api/v1/admin/brands", formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Thêm thương hiệu thành công");
      }
      
      fetchBrands();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving brand:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      image: null,
    });
    setImagePreview(brand.image || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({
      name: "",
      image: null,
    });
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <FaCopyright />
          Quản lý thương hiệu
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <FaPlus />
          Thêm thương hiệu
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBrands.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Logo</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Tên thương hiệu</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand, index) => (
                  <tr
                    key={brand.id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-800">{brand.id}</td>
                    <td className="py-4 px-6">
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="w-20 h-10 object-contain"
                        />
                      ) : (
                        <div className="w-20 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          No Logo
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-800">{brand.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(brand)}
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
            <FaCopyright className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy thương hiệu nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên thương hiệu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo thương hiệu
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-16 object-contain border rounded-lg"
                      />
                    </div>
                  )}
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
                    {loading ? "Đang xử lý..." : editingBrand ? "Cập nhật" : "Thêm mới"}
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
