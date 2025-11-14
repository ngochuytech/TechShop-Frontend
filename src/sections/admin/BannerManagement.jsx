import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaArrowUp, FaArrowDown } from "react-icons/fa";
import api from "../../api";
import { toast } from "react-toastify";

export default function BannerManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: null,
        link: "",
        order: 0,
        active: true,
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/v1/admin/banners");
            setBanners(response.data.data || []);
        } catch (error) {
            console.error("Error fetching banners:", error);
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image && !editingBanner) {
            toast.error("Vui lòng chọn ảnh banner");
            return;
        }

        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề banner");
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', new Blob([formData.title], { type: "application/json" }), formData.title);
            formDataToSend.append('description', new Blob([formData.description], { type: "application/json" }), formData.description);
            formDataToSend.append('link', new Blob([formData.link], { type: "application/json" }), formData.link);
            formDataToSend.append('order', new Blob([formData.order.toString()], { type: "application/json" }), formData.order);
            formDataToSend.append('active', new Blob([formData.active.toString()], { type: "application/json" }), formData.active);

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            if (editingBanner) {
                // Update banner
                await api.put(`/api/v1/admin/banners/${editingBanner.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success("Cập nhật banner thành công");
            } else {
                // Create new banner
                await api.post("/api/v1/admin/banners", formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success("Thêm banner thành công");
            }

            fetchBanners();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving banner:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bannerId) => {
        if (window.confirm("Bạn chắc chắn muốn xóa banner này?")) {
            setLoading(true);
            try {
                await api.delete(`/api/v1/admin/banners/${bannerId}`);
                toast.success("Xóa banner thành công");
                fetchBanners();
            } catch (error) {
                console.error("Error deleting banner:", error);
                toast.error("Không thể xóa banner");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            description: banner.description || "",
            image: null,
            link: banner.link || "",
            order: banner.order || 0,
            active: banner.active !== false,
        });
        setImagePreview(banner.image || null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBanner(null);
        setFormData({
            title: "",
            description: "",
            image: null,
            link: "",
            order: 0,
            active: true,
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

    const handleMoveUp = async (index) => {
        if (index === 0) return;
        const updatedBanners = [...banners];
        [updatedBanners[index], updatedBanners[index - 1]] = [updatedBanners[index - 1], updatedBanners[index]];

        try {
            const orders = updatedBanners.map((b, i) => ({ ...b, order: i }));
            await api.put("/api/v1/admin/banners/reorder", orders);
            setBanners(updatedBanners);
            toast.success("Cập nhật thứ tự thành công");
        } catch (error) {
            console.error(error);

            toast.error("Không thể cập nhật thứ tự");
        }
    };

    const handleMoveDown = async (index) => {
        if (index === banners.length - 1) return;
        const updatedBanners = [...banners];
        [updatedBanners[index], updatedBanners[index + 1]] = [updatedBanners[index + 1], updatedBanners[index]];

        try {
            const orders = updatedBanners.map((b, i) => ({ ...b, order: i }));
            await api.put("/api/v1/admin/banners/reorder", orders);
            setBanners(updatedBanners);
            toast.success("Cập nhật thứ tự thành công");
        } catch (error) {
            console.error(error);

            toast.error("Không thể cập nhật thứ tự");
        }
    };

    const filteredBanners = banners.filter((banner) =>
        banner.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <FaImage />
                    Quản lý banner
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                >
                    <FaPlus />
                    Thêm banner
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm banner..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Banners Grid */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredBanners.length > 0 ? (
                    filteredBanners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <div className="flex gap-4 p-4">
                                {/* Banner Image */}
                                <div className="w-40 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex-shrink-0 overflow-hidden">
                                    {banner.image ? (
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <FaImage size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Banner Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{banner.title}</h3>
                                            {banner.description && (
                                                <p className="text-sm text-gray-600 mt-1">{banner.description}</p>
                                            )}
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${banner.active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {banner.active ? "Kích hoạt" : "Vô hiệu"}
                                        </span>
                                    </div>

                                    {banner.link && (
                                        <p className="text-xs text-gray-500">
                                            Liên kết: <span className="text-blue-600 truncate">{banner.link}</span>
                                        </p>
                                    )}

                                    <div className="text-xs text-gray-500 mt-2">
                                        Thứ tự: <span className="font-semibold">{banner.order || 0}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 justify-start">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <FaEdit size={18} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa"
                                    >
                                        <FaTrash size={18} />
                                    </button>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Di chuyển lên"
                                        >
                                            <FaArrowUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === filteredBanners.length - 1}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Di chuyển xuống"
                                        >
                                            <FaArrowDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không tìm thấy banner nào</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {editingBanner ? "Cập nhật banner" : "Thêm banner mới"}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tiêu đề banner <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tiêu đề banner"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập mô tả banner"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ảnh banner <span className="text-red-500">*</span>
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
                                            className="w-full h-40 object-cover border rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Liên kết (URL)
                                </label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Thứ tự hiển thị
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                                    Kích hoạt banner
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
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
                                    {loading ? "Đang xử lý..." : editingBanner ? "Cập nhật" : "Thêm mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
