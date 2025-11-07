import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [productModels, setProductModels] = useState([]);
  const productModelDropdownRef = useRef(null);
  const [attributes, setAttributes] = useState([]);
  const [showAttributeDropdown, setShowAttributeDropdown] = useState({});
  const attributeDropdownRefs = useRef({});
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterProductModel, setFilterProductModel] = useState("");
  const [productModelSearch, setProductModelSearch] = useState("");
  const [showProductModelDropdown, setShowProductModelDropdown] = useState(false);
  const [selectedProductModelName, setSelectedProductModelName] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchProductModels();
    fetchAttributes();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, sortBy, sortDir, searchQuery, filterProductModel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productModelDropdownRef.current && !productModelDropdownRef.current.contains(event.target)) {
        setShowProductModelDropdown(false);
      }
      
      // Check attribute dropdowns
      Object.keys(showAttributeDropdown).forEach(idx => {
        const ref = attributeDropdownRefs.current[idx];
        if (ref && !ref.contains(event.target)) {
          setShowAttributeDropdown(prev => ({ ...prev, [idx]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttributeDropdown]);

  const fetchProducts = async () => {
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
      if (filterProductModel) {
        params.append('productModelId', filterProductModel);
      }

      const response = await axios.get(`${API}/api/v1/admin/products?${params.toString()}`);
      const data = response.data.data || response.data;
          
      if (data.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setProducts(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalElements(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Có lỗi khi tải danh sách sản phẩm");
      setProducts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductModels = async () => {
    try {
      const response = await axios.get(`${API}/api/v1/admin/product-models/search`);
      const data = response.data.data || response.data;
      
      setProductModels(Array.isArray(data) ? data : []);
    } catch (error) {
      setProductModels([]);
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await axios.get(`${API}/api/v1/admin/attributes/list`);
      const data = response.data.data || response.data;
      
      setAttributes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching attributes:", error);
      setAttributes([]);
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
    
    // Show dropdown when typing in key field
    if (field === 'key' && value) {
      setShowAttributeDropdown(prev => ({ ...prev, [idx]: true }));
    } else if (field === 'key' && !value) {
      setShowAttributeDropdown(prev => ({ ...prev, [idx]: false }));
    }
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
    // Clean up dropdown state
    setShowAttributeDropdown(prev => {
      const newState = { ...prev };
      delete newState[idx];
      return newState;
    });
  };

  const handleSelectAttribute = (idx, attributeKey) => {
    setFormData((prev) => {
      const newAttrs = [...prev.attributes];
      newAttrs[idx].key = attributeKey;
      return { ...prev, attributes: newAttrs };
    });
    setShowAttributeDropdown(prev => ({ ...prev, [idx]: false }));
  };

  const getFilteredAttributes = (idx) => {
    const searchValue = formData.attributes[idx]?.key?.toLowerCase() || '';
    if (!searchValue) return attributes;
    
    return attributes.filter(attr => 
      attr.name?.toLowerCase().includes(searchValue)
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPrimaryImageIndex(0);
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
      formDataToSend.append("primaryImageIndex", new Blob([JSON.stringify(primaryImageIndex)], { type: "application/json" }));

      await api.post(`/api/v1/admin/products/create`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Thêm Product thành công!");

      setShowForm(false);
      setImages([]);
      setPrimaryImageIndex(0);
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
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setImages([]);
    setPrimaryImageIndex(0);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Product này?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/products/admin/delete/${id}`);
      toast.success("Xóa Product thành công!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Có lỗi khi xóa Product");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchInput("");
    setFilterProductModel("");
    setProductModelSearch("");
    setSelectedProductModelName("");
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
      case "price-asc":
        setSortBy("price");
        setSortDir("asc");
        break;
      case "price-desc":
        setSortBy("price");
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

  const handleProductModelFilterChange = (e) => {
    setFilterProductModel(e.target.value);
    setCurrentPage(0);
  };

  const handleProductModelSearch = (e) => {
    setProductModelSearch(e.target.value);
    setShowProductModelDropdown(true);
  };

  const handleSelectProductModel = (model) => {
    setFilterProductModel(model.id);
    setSelectedProductModelName(model.name);
    setProductModelSearch("");
    setShowProductModelDropdown(false);
    setCurrentPage(0);
  };

  const handleClearProductModel = () => {
    setFilterProductModel("");
    setSelectedProductModelName("");
    setProductModelSearch("");
    setShowProductModelDropdown(false);
    setCurrentPage(0);
  };

  const filteredProductModels = productModels.filter((model) =>
    model.name.toLowerCase().includes(productModelSearch.toLowerCase())
  );

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

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔍 Tìm kiếm theo tên sản phẩm"
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
          {(searchQuery || filterProductModel || sortBy !== "createdAt" || sortDir !== "desc") && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all whitespace-nowrap"
            >
              🗑️ Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div ref={productModelDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lọc theo Product Model
            </label>
            <div className="relative">
              {selectedProductModelName ? (
                <div className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50">
                  <span className="flex-1 text-gray-800">{selectedProductModelName}</span>
                  <button
                    type="button"
                    onClick={handleClearProductModel}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={productModelSearch}
                    onChange={handleProductModelSearch}
                    onFocus={() => setShowProductModelDropdown(true)}
                    placeholder="🔍 Tìm kiếm Product Model..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showProductModelDropdown && productModelSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProductModels.length > 0 ? (
                        filteredProductModels.map((model) => (
                          <div
                            key={model.id}
                            onClick={() => handleSelectProductModel(model)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium text-gray-800">{model.name}</p>
                            {model.category && (
                              <p className="text-xs text-gray-500">
                                {model?.category} • {model?.brand || 'N/A'}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          Không tìm thấy Product Model phù hợp
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={`${sortBy === "createdAt" ? (sortDir === "desc" ? "newest" : "oldest") : sortBy === "price" ? (sortDir === "asc" ? "price-asc" : "price-desc") : (sortDir === "asc" ? "name-asc" : "name-desc")}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
          </div>
        </div>

      </div>

      {showForm && (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Thêm Product mới
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

              <div className="md:col-span-2">
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
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {images.length} ảnh đã chọn - Click vào ảnh để chọn làm ảnh chính
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => setPrimaryImageIndex(index)}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                            primaryImageIndex === index
                              ? "border-blue-500 shadow-lg"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          {primaryImageIndex === index && (
                            <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
                              ẢNH CHÍNH
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center text-xs py-1">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                    <div 
                      key={idx} 
                      className="flex gap-2 items-start"
                      ref={el => attributeDropdownRefs.current[idx] = el}
                    >
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Key (VD: Màn hình, RAM, ...)"
                          value={attr.key || ''}
                          onChange={e => handleAttributeChange(idx, "key", e.target.value)}
                          onFocus={() => setShowAttributeDropdown(prev => ({ ...prev, [idx]: true }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {showAttributeDropdown[idx] && getFilteredAttributes(idx).length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {getFilteredAttributes(idx).map((attribute) => (
                              <div
                                key={attribute.id}
                                onClick={() => handleSelectAttribute(idx, attribute.name)}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <p className="font-medium text-gray-800">{attribute.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Value"
                        value={attr.value || ''}
                        onChange={e => handleAttributeChange(idx, "value", e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAttribute(idx)} 
                        className="text-red-500 hover:text-red-700 font-bold text-xl px-2 py-2"
                      >
                        ✕
                      </button>
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
                  "Thêm mới"
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
          <p className="text-gray-500 text-lg">
            {searchQuery || filterProductModel
              ? "Không tìm thấy Product nào phù hợp với bộ lọc"
              : "Chưa có Product nào"}
          </p>
        </div>
      ) : (
        <>
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

        {/* Pagination - Always show if there are items */}
        {products.length > 0 && (
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
