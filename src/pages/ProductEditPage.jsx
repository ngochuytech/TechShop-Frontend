import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ProductEditPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [productModels, setProductModels] = useState([]);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Product Model search states
  const [productModelSearch, setProductModelSearch] = useState("");
  const [showProductModelDropdown, setShowProductModelDropdown] = useState(false);
  const [selectedProductModel, setSelectedProductModel] = useState(null);
  const productModelDropdownRef = useRef(null);

  // Attribute states
  const [attributes, setAttributes] = useState([]);
  const [showAttributeDropdown, setShowAttributeDropdown] = useState({});
  const [attributeSearchQuery, setAttributeSearchQuery] = useState({});
  const attributeDropdownRefs = useRef({});

  const [formData, setFormData] = useState({
    name: "",
    configuration_summary: "",
    productModelId: "",
    description: "",
    price: "",
    stock: "",
    attributes: [],
    productImage: "",
    images: [],
  });

  // Variant management states
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantSubmitLoading, setVariantSubmitLoading] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantFormData, setVariantFormData] = useState({
    color: "",
    stock: "",
    price: "",
    image: null,
  });

  // Check if product has variants (colors)
  const hasVariants = variants.length > 0;

  // Click outside handler for product model dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productModelDropdownRef.current && !productModelDropdownRef.current.contains(event.target)) {
        setShowProductModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Click outside handler for attribute dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(attributeDropdownRefs.current).forEach(([idx, ref]) => {
        if (ref && !ref.contains(event.target)) {
          setShowAttributeDropdown(prev => ({ ...prev, [idx]: false }));
        }
      });
    };

    if (Object.keys(showAttributeDropdown).some(key => showAttributeDropdown[key])) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAttributeDropdown]);

  useEffect(() => {
    fetchProductModels();
    fetchAttributes();
    if (productId) {
      fetchProduct();
      fetchVariants();
    } else {
      // Nếu không có productId, chuyển về trang admin
      setLoading(false);
      navigate("/admin", { state: { activeTab: "products" } });
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/v1/products/${productId}`);
      const product = response.data.data || response.data;

      const attrs = product.attributes
        ? Object.entries(product.attributes).map(([key, value]) => ({ key, value }))
        : [];
    
      // imagePrimary lên đầu, các ảnh khác theo sau
      let sortedImages = [];
      if (product.images && product.images.length > 0) {
        const imagePrimary = product.imagePrimary || "";
        if (imagePrimary) {
          sortedImages = [imagePrimary, ...product.images.filter(img => img !== imagePrimary)];
        } else {
          sortedImages = [...product.images];
        }
      }

      setProductModelSearch(product.productModel.name || "");


      setFormData({
        name: product.name || "",
        configuration_summary: product.configuration_summary || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        productModelId: product.productModel?.id || "",
        attributes: attrs,
        productImage: product.imagePrimary || "",
        images: sortedImages,
      });

      // Set selected product model for search display
      const modelId = product.productModel.id;
      if (modelId && productModels.length > 0) {
        const model = productModels.find(m => m.id === modelId);
        if (model) {
          setSelectedProductModel(model);
          setProductModelSearch(model.name);
        }
      }

    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Có lỗi khi tải thông tin sản phẩm");
      navigate("/admin", { state: { activeTab: "products" } });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductModels = async () => {
    try {
      const response = await api.get(`${API}/api/v1/admin/product-models/search`);
      const data = response.data.data || response.data;
      setProductModels(Array.isArray(data) ? data : []);
    } catch (error) {
      setProductModels([]);
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await api.get(`${API}/api/v1/admin/attributes/list`);
      setAttributes(response.data.data || []);
      
    } catch (error) {
      console.error("Error fetching attributes:", error);
      setAttributes([]);
    }
  };

  const fetchVariants = async () => {
    try {
      setVariantsLoading(true);
      const response = await api.get(`${API}/api/v1/admin/product-variants/product/${productId}`);
      const data = response.data.data || response.data;
      setVariants(Array.isArray(data.content) ? data.content : []);
    } catch (error) {
      console.error("Error fetching variants:", error);
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductModelSearch = (value) => {
    setProductModelSearch(value);
    setShowProductModelDropdown(true);
  };

  const handleSelectProductModel = (model) => {
    setSelectedProductModel(model);
    setProductModelSearch(model.name);
    setFormData((prev) => ({
      ...prev,
      productModelId: model.id,
    }));
    setShowProductModelDropdown(false);
  };

  const getFilteredProductModels = () => {
    if (!productModelSearch) return productModels;
    return productModels.filter(model =>
      model.name?.toLowerCase().includes(productModelSearch.toLowerCase())
    );
  };

  const handleAttributeChange = (idx, field, value) => {
    setFormData((prev) => {
      const newAttrs = [...prev.attributes];
      newAttrs[idx][field] = value || "";
      return { ...prev, attributes: newAttrs };
    });
  };

  const handleAttributeSearchChange = (idx, value) => {
    setAttributeSearchQuery(prev => ({ ...prev, [idx]: value }));
    setShowAttributeDropdown(prev => ({ ...prev, [idx]: true }));
  };

  const handleSelectAttribute = (idx, attributeKey) => {
    setFormData((prev) => {
      const newAttrs = [...prev.attributes];
      newAttrs[idx].key = attributeKey || "";
      return { ...prev, attributes: newAttrs };
    });
    setAttributeSearchQuery(prev => ({ ...prev, [idx]: "" }));
    setShowAttributeDropdown(prev => ({ ...prev, [idx]: false }));
  };

  const getFilteredAttributes = (idx) => {
    const usedKeys = formData.attributes
      .map((attr, i) => (i !== idx ? attr.key : null))
      .filter(Boolean);
    
    let filtered = attributes.filter(attr => !usedKeys.includes(attr.name));
    
    // Apply search query if exists
    const searchQuery = attributeSearchQuery[idx] || "";
    if (searchQuery.trim()) {
      filtered = filtered.filter(attr => 
        (attr.name && attr.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    return filtered;
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
    setShowAttributeDropdown(prev => {
      const newState = { ...prev };
      delete newState[idx];
      return newState;
    });
    setAttributeSearchQuery(prev => {
      const newState = { ...prev };
      delete newState[idx];
      return newState;
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleUploadImages = async () => {
    if (newImages.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ảnh");
      return;
    }
    setImageUploadLoading(true);
    try {
      const formDataToSend = new FormData();
      newImages.forEach((file) => {
        formDataToSend.append("images", file);
      });
      formDataToSend.append("primaryImageIndex", new Blob([JSON.stringify(primaryImageIndex)], { type: "application/json" }));

      await api.put(`/api/v1/admin/products/${productId}/images`, formDataToSend);

      toast.success("Cập nhật ảnh sản phẩm thành công!");
      setNewImages([]);
      setShowImageUpload(false);
      await fetchProduct();
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(error.response?.data?.message || "Có lỗi khi tải ảnh lên");
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.configuration_summary || !formData.description) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!hasVariants && (!formData.price || !formData.stock)) {
      toast.error("Sản phẩm không có variant phải có giá và số lượng");
      return;
    }

    if (!hasVariants && (parseInt(formData.price) < 0 || parseInt(formData.stock) < 0)) {
      toast.error("Giá và số lượng không được âm");
      return;
    }    

    // Validate attributes - không cho phép key hoặc value bỏ trống
    const hasEmptyAttribute = formData.attributes.some(attr => {
      if (attr.key && (!attr.value || !attr.value.trim()==="")) return true;
      if ((!attr.key || !attr.key.trim()==="") && attr.value) return true;
      return false;
    });

    if (hasEmptyAttribute) {
      toast.error("Thuộc tính không được để trống key hoặc value. Vui lòng điền đầy đủ hoặc xóa thuộc tính đó.");
      return;
    }

    setSubmitLoading(true);
    try {
      const attrMap = {};
      formData.attributes.forEach(({ key, value }) => {
        if (key && value) attrMap[key] = value;
      });

      const productDTO = {
        name: formData.name,
        configuration_summary: formData.configuration_summary,
        product_model_id: formData.productModelId ? Number(formData.productModelId) : null,
        description: formData.description,
        attributes: attrMap,
      };

      if (!hasVariants) {
        productDTO.price = parseInt(formData.price);
        productDTO.stock = parseInt(formData.stock) || 0;
      }

      await api.put(`/api/v1/admin/products/update/${productId}`, productDTO);
      toast.success("Cập nhật Product thành công!");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin", { state: { activeTab: "products" } });
  };

  // Variant handlers
  const handleVariantFormChange = (e) => {
    const { name, value } = e.target;
    setVariantFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantImageChange = (e) => {
    const file = e.target.files[0];
    setVariantFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleAddVariant = () => {
    setShowVariantForm(true);
    setEditingVariant(null);
    setVariantFormData({
      color: "",
      stock: "",
      price: "",
      image: null,
    });
  };

  const handleEditVariant = (variant) => {
    setShowVariantForm(true);
    setEditingVariant(variant);
    setVariantFormData({
      color: variant.name,
      stock: variant.stock?.toString() || "",
      price: variant.price?.toString() || "",
      image: null,
    });
  };

  const handleCancelVariantForm = () => {
    setShowVariantForm(false);
    setEditingVariant(null);
    setVariantFormData({
      color: "",
      stock: "",
      price: "",
      image: null,
    });
  };

  const handleSubmitVariant = async (e) => {
    e.preventDefault();
    if (!variantFormData.color || !variantFormData.stock || !variantFormData.price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (parseInt(variantFormData.stock) < 0 || parseInt(variantFormData.price) < 0) {
      toast.error("Số lượng và giá không được âm");
      return;
    }

    setVariantSubmitLoading(true);
    try {
      if (editingVariant) {
        // Update existing variant
        const variantDTO = {
          product_id: productId,
          color: variantFormData.color,
          stock: parseInt(variantFormData.stock),
          price: variantFormData.price ? parseInt(variantFormData.price) : null,
        };

        const formDataToSend = new FormData();
        formDataToSend.append(
          "productVariantDTO",
          new Blob([JSON.stringify(variantDTO)], { type: "application/json" })
        );
        if (variantFormData.image) {
          formDataToSend.append("image", variantFormData.image);
        }

        await api.put(`/api/v1/admin/product-variants/${editingVariant.id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Cập nhật variant thành công!");
      } else {
        // Create new variant
        const formDataToSend = new FormData();

        const variantDTO = {
          product_id: productId,
          color: variantFormData.color,
          stock: parseInt(variantFormData.stock),
          price: variantFormData.price ? parseInt(variantFormData.price) : null,
        };

        formDataToSend.append(
          "productVariantDTO",
          new Blob([JSON.stringify(variantDTO)], { type: "application/json" })
        );

        if (variantFormData.image) {
          formDataToSend.append("image", variantFormData.image);
        }

        await api.post("/api/v1/admin/product-variants/create", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Thêm variant thành công!");
      }

      await fetchVariants();
      await fetchProduct(); // Refresh product data to update price and stock
      handleCancelVariantForm();
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setVariantSubmitLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa variant này?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/admin/product-variants/${variantId}`);
      toast.success("Xóa variant thành công!");
      await fetchVariants();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa variant");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto px-4 py-8 space-y-4">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-2">
            <div className="text-sm text-gray-600">
              <button onClick={handleCancel} className="hover:text-blue-600">
                Trang quản trị
              </button>
              {" / "}
              <span className="text-gray-900">Chỉnh sửa sản phẩm</span>
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Product Info & Images */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <button
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
                  >
                    ← Quay lại
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {formData.name || "Chỉnh sửa sản phẩm"}
                  </h1>
                </div>

                {/* Product Image Preview */}
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg flex items-center justify-center p-8 mb-4">
                  <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                    {formData.productImage || (formData.images && formData.images.length > 0) ? (
                      <img
                        src={formData.images && formData.images.length > 0 ? formData.images[selectedImageIndex] : ''}
                        alt={formData.name || "Product"}
                        className="max-w-full max-h-[400px] object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-32 h-32 mx-auto mb-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                        <p className="text-sm">Ảnh sản phẩm sẽ hiển thị tại đây</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Thumbnails */}
                {formData.images && formData.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {formData.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                      >
                        <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Update Product Images Section */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    {showImageUpload ? "Ẩn cập nhật ảnh" : "Cập nhật ảnh sản phẩm"}
                  </button>

                  {showImageUpload && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chọn ảnh mới (có thể chọn nhiều ảnh)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      {newImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Preview ảnh - Click để chọn ảnh chính
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            {newImages.map((file, idx) => (
                              <div
                                key={idx}
                                onClick={() => setPrimaryImageIndex(idx)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${primaryImageIndex === idx
                                  ? 'border-green-500 shadow-lg'
                                  : 'border-gray-300 hover:border-blue-400'
                                  }`}
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-full h-32 object-contain bg-white"
                                />
                                {primaryImageIndex === idx && (
                                  <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                    Chính
                                  </div>
                                )}
                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                                  Ảnh {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          type="button"
                          onClick={handleUploadImages}
                          disabled={newImages.length === 0 || imageUploadLoading}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {imageUploadLoading ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                              Đang tải lên...
                            </>
                          ) : (
                            "Tải lên"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewImages([]);
                            setShowImageUpload(false);
                          }}
                          disabled={imageUploadLoading}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Attributes Table */}
                {formData.attributes && formData.attributes.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                    <table className="w-full border border-gray-300 text-left rounded">
                      <colgroup>
                        <col className="w-1/3" />
                        <col className="w-2/3" />
                      </colgroup>
                      <tbody>
                        {formData.attributes.map((attr, index) => (
                          attr.key && (
                            <tr key={index}>
                              <th className="px-4 py-2 border border-gray-300 bg-gray-100 text-gray-600 font-medium">
                                {attr.key}
                              </th>
                              <td className="px-4 py-2 border border-gray-300 text-gray-900 whitespace-pre-wrap">
                                {attr.value}
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Product Description */}
                {formData.description && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Mô tả sản phẩm</h2>
                    <p className="text-gray-700 text-sm">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin sản phẩm</h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="relative" ref={productModelDropdownRef}>
                        <input
                          type="text"
                          value={productModelSearch}
                          onChange={(e) => handleProductModelSearch(e.target.value)}
                          onFocus={() => setShowProductModelDropdown(true)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tìm kiếm product model..."
                          required
                        />
                        {showProductModelDropdown && getFilteredProductModels().length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {getFilteredProductModels().map((model) => (
                              <div
                                key={model.id}
                                onClick={() => handleSelectProductModel(model)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <p className="font-medium text-gray-800">{model.name}</p>
                                {model.brand && (
                                  <p className="text-xs text-gray-500">Brand: {model.brand}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá {!hasVariants && <span className="text-red-500">*</span>}
                      </label>
                      {hasVariants ? (
                        <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 flex items-center justify-between">
                          <span>{formData.price ? parseInt(formData.price).toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</span>
                          <span className="text-xs text-gray-500">(Tính từ variants - min)</span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="VD: 29990000"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số lượng trong kho {!hasVariants && <span className="text-red-500">*</span>}
                      </label>
                      {hasVariants ? (
                        <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 flex items-center justify-between">
                          <span>{formData.stock || 0}</span>
                          <span className="text-xs text-gray-500">(Tổng từ variants)</span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="VD: 100"
                          required
                        />
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
                          <div key={idx} className="flex gap-2 items-center">
                            <div
                              ref={el => attributeDropdownRefs.current[idx] = el}
                              className="flex-1 relative"
                            >
                              <input
                                type="text"
                                placeholder="🔍 Tìm hoặc chọn Key"
                                value={attr.key ? attr.key : (attributeSearchQuery[idx] || "")}
                                onChange={(e) => handleAttributeSearchChange(idx, e.target.value)}
                                onFocus={() => setShowAttributeDropdown(prev => ({ ...prev, [idx]: true }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                              {showAttributeDropdown[idx] && getFilteredAttributes(idx).length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                  {getFilteredAttributes(idx).map((attribute) => (
                                    <div
                                      key={attribute.id}
                                      onClick={() => handleSelectAttribute(idx, attribute.name)}
                                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                      <p className="font-medium text-gray-800">{attribute.name}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <textarea
                              placeholder="Value"
                              value={attr.value || ""}
                              onChange={(e) => handleAttributeChange(idx, "value", e.target.value)}
                              rows="2"
                              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[42px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(idx)}
                              className="text-red-500 hover:text-red-700 font-bold text-xl px-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddAttribute}
                          className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                        >
                          + Thêm thuộc tính
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitLoading ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></span>
                          Đang lưu...
                        </>
                      ) : (
                        "💾 Cập nhật"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={submitLoading}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Variants Section - Full Width Below */}
        <div className="">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Quản lý Màu sắc (Variants)
              </h2>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
              >
                <span className="text-xl">+</span> Thêm màu mới
              </button>
            </div>

            {/* Variant Form */}
            {showVariantForm && (
              <div className="mb-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingVariant ? "Chỉnh sửa Variant" : "Thêm Variant mới"}
                </h3>
                <form onSubmit={handleSubmitVariant} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Màu sắc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={variantFormData.color}
                        onChange={handleVariantFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: Đen, Trắng, Xanh..."
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
                        value={variantFormData.stock}
                        onChange={handleVariantFormChange}
                        min="0"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: 50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={variantFormData.price}
                        onChange={handleVariantFormChange}
                        min="0"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: 29990000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hình ảnh {editingVariant && "(Tùy chọn - Để trống nếu không muốn thay đổi)"}
                    </label>
                    {editingVariant && editingVariant.image && (
                      <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Ảnh hiện tại:</p>
                        <img
                          src={editingVariant.image}
                          alt="Current variant"
                          className="w-20 h-20 object-contain rounded"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVariantImageChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={variantSubmitLoading}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {variantSubmitLoading ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                          {editingVariant ? "Đang cập nhật..." : "Đang thêm..."}
                        </>
                      ) : (
                        editingVariant ? "Cập nhật" : "Thêm"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelVariantForm}
                      disabled={variantSubmitLoading}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Variants List */}
            {variantsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : variants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có variant nào. Hãy thêm màu sắc cho sản phẩm!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    {variant.image && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={variant.image}
                          alt={variant.name}
                          className="w-2/3 h-2/3 object-contain flex justify-center rounded-lg p-1"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {variant.name}
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Giá:</span>{" "}
                          {variant.price
                            ? variant.price.toLocaleString("vi-VN") + " ₫"
                            : "Giá gốc"}
                        </p>
                        <p>
                          <span className="font-medium">Tồn kho:</span>{" "}
                          {variant.stock}
                        </p>
                        <p>
                          <span className="font-medium">Trạng thái:</span>{" "}
                          <span
                            className={
                              variant.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {variant.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditVariant(variant)}
                          className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
