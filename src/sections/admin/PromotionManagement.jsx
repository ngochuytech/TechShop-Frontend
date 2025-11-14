import { useEffect, useState } from "react";
import {
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaToggleOn,
    FaToggleOff,
    FaSync,
    FaPercent,
    FaDollarSign,
    FaShippingFast,
    FaTicketAlt,
    FaCalendarAlt,
    FaFilter,
} from "react-icons/fa";
import api from "../../api";
import { toast } from "react-toastify";

export default function PromotionManagement() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Sort
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");

    // Form data
    const [formData, setFormData] = useState({
        title: "",
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        startDate: "",
        endTime: "",
        minOrderValue: "",
        maxDiscount: "",
        usageLimitPerUser: "",
        isForNewCustomer: false,
        totalUsageLimit: "",
    });

    // Clear maxDiscount if discountType is SHIPPING or FIXED
    useEffect(() => {
        if (formData.discountType === "SHIPPING" || formData.discountType === "FIXED") {
            if (formData.maxDiscount !== "") {
                setFormData((prev) => ({ ...prev, maxDiscount: "" }));
            }
        }
    }, [formData.discountType]);

    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter, searchTerm, sortBy, sortDir]);

    useEffect(() => {
        fetchPromotions();
    }, [currentPage, pageSize, sortBy, sortDir]);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                sortBy: sortBy,
                sortDir: sortDir,
            };

            const response = await api.get("/api/v1/admin/promotions", { params });
            const pageData = response.data.data;
            
            setPromotions(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 0);
            setTotalElements(pageData?.totalElements || 0);
        } catch (error) {
            console.error("Error fetching promotions:", error);
            toast.error("Không thể tải danh sách mã giảm giá");
        } finally {
            setLoading(false);
        }
    };

    const filteredPromotions = promotions.filter((promo) => {
        const matchesSearch =
            promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && promo.isActive) ||
            (statusFilter === "INACTIVE" && !promo.isActive);
        return matchesSearch && matchesStatus;
    });

    const handleOpenModal = (promotion = null) => {
        if (promotion) {
            setEditingPromotion(promotion);
            setFormData({
                title: promotion.title || "",
                code: promotion.code || "",
                description: promotion.description || "",
                discountType: promotion.discountType || "PERCENTAGE",
                discountValue: promotion.discountValue || "",
                startDate: promotion.startDate ? formatDateForInput(promotion.startDate) : "",
                endTime: promotion.endTime ? formatDateForInput(promotion.endTime) : "",
                minOrderValue: promotion.minOrderValue || "",
                maxDiscount: promotion.maxDiscount || "",
                usageLimitPerUser: promotion.usageLimitPerUser || "",
                isForNewCustomer: promotion.isForNewCustomer || false,
                totalUsageLimit: promotion.totalUsageLimit || "",
            });
        } else {
            setEditingPromotion(null);
            setFormData({
                title: "",
                code: "",
                description: "",
                discountType: "PERCENTAGE",
                discountValue: "",
                startDate: "",
                endTime: "",
                minOrderValue: "",
                maxDiscount: "",
                usageLimitPerUser: "",
                isForNewCustomer: false,
                totalUsageLimit: "",
            });
        }
        setShowModal(true);
    };

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.code || !formData.discountType || !formData.discountValue || !formData.startDate || !formData.endTime) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        try {
            const payload = {
                title: formData.title || formData.code,
                code: formData.code.toUpperCase(),
                description: formData.description,
                discount_type: formData.discountType,
                discount_value: parseInt(formData.discountValue),
                start_date: formatDateForAPI(formData.startDate),
                end_date: formatDateForAPI(formData.endTime),
                min_order_value: formData.minOrderValue ? parseInt(formData.minOrderValue) : 0,
                max_discount: formData.maxDiscount ? parseInt(formData.maxDiscount) : null,
                usage_limit_per_user: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : null,
                is_for_new_customer: formData.isForNewCustomer,
                total_usage_limit: formData.totalUsageLimit ? parseInt(formData.totalUsageLimit) : null,
            };

            if (editingPromotion) {
                await api.put(`/api/v1/admin/promotions/${editingPromotion.id}`, payload);
                toast.success("Cập nhật mã giảm giá thành công!");
            } else {
                await api.post("/api/v1/admin/promotions", payload);
                toast.success("Tạo mã giảm giá thành công!");
            }

            setShowModal(false);
            fetchPromotions();
        } catch (error) {
            console.error("Error saving promotion:", error);
            toast.error(error.response?.data?.error || "Có lỗi xảy ra khi lưu mã giảm giá");
        }
    };

    const handleToggleActive = async (promotionId, currentStatus) => {
        try {
            await api.put(`/api/v1/admin/promotions/${promotionId}/toggle-active?isActive=${!currentStatus}`);
            toast.success(`${!currentStatus ? "Kích hoạt" : "Vô hiệu hóa"} mã giảm giá thành công!`);
            fetchPromotions();
        } catch (error) {
            console.error("Error toggling promotion:", error);
            toast.error("Không thể thay đổi trạng thái mã giảm giá");
        }
    };



    const getDiscountIcon = (type) => {
        switch (type) {
            case "PERCENTAGE":
                return <FaPercent />;
            case "FIXED":
                return <FaDollarSign />;
            case "SHIPPING":
                return <FaShippingFast />;
            default:
                return <FaTicketAlt />;
        }
    };

    const getDiscountTypeLabel = (type) => {
        switch (type) {
            case "PERCENTAGE":
                return "Phần trăm";
            case "FIXED":
                return "Cố định";
            case "SHIPPING":
                return "Miễn phí vận chuyển";
            default:
                return type;
        }
    };

    const formatDiscount = (type, value) => {
        if (type === "PERCENTAGE") {
            return `${value}%`;
        } else if (type === "FIXED") {
            return `${value?.toLocaleString("vi-VN")} ₫`;
        } else {
            return "Miễn phí ship";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Quản lý mã giảm giá
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Tổng số: <span className="font-semibold">{totalElements}</span> mã giảm giá
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchPromotions}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FaSync />
                        Làm mới
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                        <FaPlus />
                        Tạo mã mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã hoặc tiêu đề..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="INACTIVE">Không hoạt động</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={`${sortBy}-${sortDir}`}
                            onChange={(e) => {
                                const [newSortBy, newSortDir] = e.target.value.split("-");
                                setSortBy(newSortBy);
                                setSortDir(newSortDir);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt-desc">Mới nhất</option>
                            <option value="createdAt-asc">Cũ nhất</option>
                            <option value="endTime-asc">Sắp hết hạn</option>
                            <option value="endTime-desc">Còn hạn lâu</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Promotions Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold">Mã giảm giá</th>
                                <th className="text-left py-4 px-6 font-semibold">Loại</th>
                                <th className="text-left py-4 px-6 font-semibold">Giảm giá</th>
                                <th className="text-left py-4 px-6 font-semibold">Thời gian</th>
                                <th className="text-center py-4 px-6 font-semibold">Trạng thái</th>
                                <th className="text-center py-4 px-6 font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPromotions.length > 0 ? (
                                filteredPromotions.map((promo) => (
                                    <tr key={promo.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-bold text-blue-600 text-lg">{promo.code}</p>
                                                <p className="text-sm text-gray-600">{promo.title}</p>
                                                {promo.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{promo.description}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {getDiscountIcon(promo.discountType)}
                                                <span className="text-sm">{getDiscountTypeLabel(promo.discountType)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-semibold text-green-600">
                                                {formatDiscount(promo.discountType, promo.discountValue)}
                                            </p>
                                            {promo.minOrderValue && (
                                                <p className="text-xs text-gray-500">
                                                    Đơn tối thiểu: {promo.minOrderValue.toLocaleString("vi-VN")} ₫
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm">
                                                <p className="text-gray-600">
                                                    Từ: {new Date(promo.startDate).toLocaleDateString("vi-VN")}
                                                </p>
                                                <p className="text-gray-600">
                                                    Đến: {new Date(promo.endTime).toLocaleDateString("vi-VN")}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleToggleActive(promo.id, promo.isActive)}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                    promo.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {promo.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                                                {promo.isActive ? "Hoạt động" : "Tắt"}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(promo)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500">
                                        <FaTicketAlt className="text-5xl mx-auto mb-3 opacity-50" />
                                        <p>Không tìm thấy mã giảm giá nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Trước
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i)
                                .filter((page) => page >= currentPage - 2 && page <= currentPage + 2)
                                .map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded-lg transition-colors ${
                                            currentPage === page
                                                ? "bg-blue-600 text-white"
                                                : "bg-white border border-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        {page + 1}
                                    </button>
                                ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sau →
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                            <h3 className="text-2xl font-bold">
                                {editingPromotion ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã giảm giá <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="VD: SUMMER2024"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tên hiển thị"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Mô tả chi tiết về mã giảm giá"
                                />
                            </div>

                            {/* Discount Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại giảm giá <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="PERCENTAGE">Phần trăm (%)</option>
                                        <option value="FIXED">Số tiền cố định (₫)</option>
                                        <option value="SHIPPING">Miễn phí vận chuyển</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giá trị giảm <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={formData.discountType === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Order Constraints */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giá trị đơn hàng tối thiểu (₫)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="VD: 100000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giảm tối đa (₫)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            formData.discountType === "SHIPPING" || formData.discountType === "FIXED"
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : ""
                                        }`}
                                        placeholder="VD: 200000"
                                        disabled={formData.discountType === "SHIPPING" || formData.discountType === "FIXED"}
                                    />
                                    {(formData.discountType === "SHIPPING" || formData.discountType === "FIXED") && (
                                        <p className="text-xs text-gray-400 mt-1">Chỉ áp dụng cho loại giảm giá phần trăm (%)</p>
                                    )}
                                </div>
                            </div>

                            {/* Usage Limits */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giới hạn sử dụng/người
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usageLimitPerUser}
                                        onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="VD: 1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tổng số lần sử dụng
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.totalUsageLimit}
                                        onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="VD: 100"
                                    />
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isForNewCustomer}
                                        onChange={(e) => setFormData({ ...formData, isForNewCustomer: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Chỉ dành cho khách hàng mới</span>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                                >
                                    {editingPromotion ? "Cập nhật" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
