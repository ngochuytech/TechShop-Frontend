import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api";

export default function ProductVariantManagement() {
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    product_id: "",
    color: "",
    stock: "",
    price: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch products
      const productsRes = await api.get("/api/v1/products/category?category=laptop");
      const productsData = productsRes.data.data || productsRes.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      // Fetch variants for first product if available
      if (productsData && productsData.length > 0) {
        await fetchVariants(productsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Có lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (productId) => {
    try {
      const response = await api.get(`/api/v1/product-variants/product/${productId}`);
      const data = response.data.data || response.data;
      setVariants(Array.isArray(data) ? data : []);
      setSelectedProductId(productId);
    } catch (error) {
      console.error("Error fetching variants:", error);
      setVariants([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    if (productId) {
      fetchVariants(productId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_id || !formData.color || !formData.stock) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      if (editingVariant) {
        const updateData = {
          product_id: formData.product_id,
          color: formData.color,
          stock: parseInt(formData.stock),
          price: formData.price ? parseInt(formData.price) : 0,
        };
        await api.put(`/api/v1/product-variants/${editingVariant.id}`, updateData);
        toast.success("Cập nhật Product Variant thành công!");
      } else {
        const formDataToSend = new FormData();
        
        const variantData = {
          product_id: formData.product_id,
          color: formData.color,
          stock: parseInt(formData.stock),
          price: formData.price ? parseInt(formData.price) : 0,
        };

        formDataToSend.append(
          "productVariantDTO",
          new Blob([JSON.stringify(variantData)], { type: "application/json" })
        );

        if (image) {
          formDataToSend.append("image", image);
        }

        await api.post("/api/v1/product-variants/create", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Thêm Product Variant thành công!");
      }

      setShowForm(false);
      setEditingVariant(null);
      setImage(null);
      setFormData({
        product_id: "",
        color: "",
        stock: "",
        price: "",
      });
      if (selectedProductId) {
        fetchVariants(selectedProductId);
      }
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setFormData({
      product_id: variant.product?.id || "",
      color: variant.color,
      stock: variant.stock?.toString() || "",
      price: variant.price?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Product Variant này?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/product-variants/${id}`);
      toast.success("Xóa Product Variant thành công!");
      if (selectedProductId) {
        fetchVariants(selectedProductId);
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Có lỗi khi xóa Product Variant");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingVariant(null);
    setImage(null);
    setFormData({
      product_id: "",
      color: "",
      stock: "",
      price: "",
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
          Quản lý Product Variants (Biến thể màu)
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {showForm ? "Đóng Form" : "➕ Thêm Variant"}
        </button>
      </div>

      {/* Product Selector */}
      <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chọn sản phẩm để xem variants
        </label>
        <select
          value={selectedProductId}
          onChange={handleProductSelect}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingVariant ? "Chỉnh sửa Product Variant" : "Thêm Product Variant mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={editingVariant}
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Màu sắc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Đen, Trắng, Xanh"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá (tùy chọn)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Để trống nếu giống sản phẩm gốc"
                />
              </div>

              {!editingVariant && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hình ảnh màu
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {image && (
                    <p className="text-sm text-gray-600 mt-1">
                      Đã chọn: {image.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {editingVariant ? "Cập nhật" : "Thêm mới"}
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

      {/* Variants List */}
      {!selectedProductId ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Vui lòng chọn sản phẩm để xem các biến thể</p>
        </div>
      ) : variants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Sản phẩm này chưa có biến thể nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Hình ảnh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Màu sắc</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sản phẩm</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Số lượng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Giá</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img
                      src={variant.imageUrl || "https://via.placeholder.com/60"}
                      alt={variant.color}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: variant.color.toLowerCase() }}
                        title={variant.color}
                      ></div>
                      <span className="font-medium text-gray-800">{variant.color}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{variant.product?.name || "N/A"}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      variant.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {variant.stock || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {variant.price ? (
                      <p className="font-semibold text-gray-800">
                        {variant.price.toLocaleString("vi-VN")}₫
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">Giá gốc</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(variant)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
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
