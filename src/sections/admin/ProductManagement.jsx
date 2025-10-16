import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [productModels, setProductModels] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    configuration_summary: "",
    productModelId: "",
    description: "",
    price: "",
    stock: "",
    attributes: [],
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchProductModels();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/v1/products`);
      const data = response.data.data || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Có lỗi khi tải danh sách sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductModels = async () => {
    try {
      const response = await axios.get(`${API}/api/v1/product-models`);
      const data = response.data.data || response.data;
      setProductModels(Array.isArray(data) ? data : []);
    } catch (error) {
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

  const handleAttributeChange = (idx, field, value) => {
    setFormData((prev) => {
      const newAttrs = [...prev.attributes];
      newAttrs[idx][field] = value;
      return { ...prev, attributes: newAttrs };
    });
  };

  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: "", value: "" }],
    }));
  };

  const handleRemoveAttribute = (idx) => {
    setFormData((prev) => {
      const newAttrs = prev.attributes.filter((_, i) => i !== idx);
      return { ...prev, attributes: newAttrs };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.configuration_summary || !formData.description || !formData.price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSubmitLoading(true);
    try {
      const formDataToSend = new FormData();
      // Chuyển attributes sang object map
      const attrMap = {};
      formData.attributes.forEach(({ key, value }) => {
        if (key) attrMap[key] = value;
      });
      const productDTO = {
        name: formData.name,
        configuration_summary: formData.configuration_summary,
        product_model_id: formData.productModelId ? Number(formData.productModelId) : null,
        description: formData.description,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock) || 0,
        attributes: attrMap,
      };
      formDataToSend.append(
        "productDTO",
        new Blob([JSON.stringify(productDTO)], { type: "application/json" })
      );
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      if (editingProduct) {
        // Update không gửi ảnh, chỉ gửi json
        await api.put(`/api/v1/products/update/${editingProduct.id}`, productDTO);
        toast.success("Cập nhật Product thành công!");
      } else {
        await api.post(`/api/v1/products/create`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Thêm Product thành công!");
      }

      setShowForm(false);
      setEditingProduct(null);
      setImages([]);
      setFormData({
        name: "",
        configuration_summary: "",
        productModelId: "",
        description: "",
        price: "",
        stock: "",
        attributes: [],
      });
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // attributes: convert object to array
    const attrs = product.attributes
      ? Object.entries(product.attributes).map(([key, value]) => ({ key, value }))
      : [];
    setFormData({
      name: product.name,
      configuration_summary: product.configurationSummary || "",
      productModelId: product.productModelId || product.product_model_id || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      attributes: attrs,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Product này?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/products/delete/${id}`);
      toast.success("Xóa Product thành công!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Có lỗi khi xóa Product");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setImages([]);
    setFormData({
      name: "",
      configuration_summary: "",
      productModelId: "",
      description: "",
      price: "",
      stock: "",
      attributes: [],
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
          Quản lý Products (Sản phẩm cụ thể)
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {showForm ? "Đóng Form" : "➕ Thêm Product"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingProduct ? "Chỉnh sửa Product" : "Thêm Product mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: iPhone 15 Pro Max 256GB"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cấu hình tóm tắt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="configuration_summary"
                  value={formData.configuration_summary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: A17 Pro, 8GB RAM, 256GB"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Model <span className="text-red-500">*</span>
                </label>
                <select
                  name="productModelId"
                  value={formData.productModelId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn Product Model</option>
                  {productModels.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 29990000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng trong kho
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 100"
                />
              </div>

              {!editingProduct && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hình ảnh
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {images.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {images.length} ảnh đã chọn
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết về sản phẩm"
                  rows="4"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thuộc tính (Attributes)
                </label>
                <div className="space-y-2">
                  {formData.attributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Key"
                        value={attr.key}
                        onChange={e => handleAttributeChange(idx, "key", e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={attr.value}
                        onChange={e => handleAttributeChange(idx, "value", e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button type="button" onClick={() => handleRemoveAttribute(idx)} className="text-red-500 font-bold text-xl">&minus;</button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddAttribute} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Thêm thuộc tính</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></span>
                    Đang gửi...
                  </>
                ) : (
                  editingProduct ? "Cập nhật" : "Thêm mới"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                disabled={submitLoading}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Chưa có Product nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Hình ảnh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Cấu hình</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Giá</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tồn kho</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img
                      src={product.imagePrimary || "https://via.placeholder.com/60"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    {product.productModel && (
                      <p className="text-xs text-gray-500">Model: {product.productModel.name}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{product.configurationSummary}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">
                      {product.price?.toLocaleString("vi-VN")}₫
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      product.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
