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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.get(`${API}/api/v1/categories`),
        axios.get(`${API}/api/v1/brands`),
      ]);
      setCategories(categoriesRes.data.data || categoriesRes.data);
      setBrands(brandsRes.data.data || brandsRes.data);
      await fetchProductModels();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Có lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductModels = async () => {
    try {
      const response = await axios.get(`${API}/api/v1/product-models`);

      setProductModels(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching product models:", error);
      setProductModels([]);
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
        await axios.put(`${API}/api/v1/product-models/update/${editingModel.id}`, formData);
        toast.success("Cập nhật Product Model thành công!");
      } else {
        await axios.post(`${API}/api/v1/product-models/create`, formData);
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
      await api.delete(`/product-models/delete/${id}`);
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
          Quản lý Product Models
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {showForm ? "Đóng Form" : "➕ Thêm Product Model"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingModel ? "Chỉnh sửa Product Model" : "Thêm Product Model mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {editingModel ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Models List */}
      {productModels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Chưa có Product Model nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
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
                    <span className="font-medium text-gray-600">#{model.id}</span>
                  </td>
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
      )}
    </div>
  );
}
