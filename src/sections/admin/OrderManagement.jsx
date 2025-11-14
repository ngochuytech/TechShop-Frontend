import { useEffect, useState } from "react";
import {
    FaSearch,
    FaEye,
    FaEdit,
    FaBox,
    FaShippingFast,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaFilter,
    FaSync,
} from "react-icons/fa";
import api from "../../api";
import { toast } from "react-toastify";

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    // Sort states
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");
    
    // Status statistics - independent from filters
    const [statusStats, setStatusStats] = useState({
        PENDING: 0,
        CONFIRMED: 0,
        SHIPPING: 0,
        DELIVERED: 0,
        CANCELLED: 0
    });

    const orderStatuses = [
        { value: "ALL", label: "Tất cả", color: "gray", icon: FaBox },
        { value: "PENDING", label: "Chờ xử lý", color: "yellow", icon: FaClock },
        { value: "CONFIRMED", label: "Đã xác nhận", color: "blue", icon: FaCheckCircle },
        { value: "SHIPPING", label: "Đang giao", color: "purple", icon: FaShippingFast },
        { value: "DELIVERED", label: "Đã giao", color: "green", icon: FaCheckCircle },
        { value: "CANCELLED", label: "Đã hủy", color: "red", icon: FaTimesCircle },
    ];

    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter, searchTerm, sortBy, sortDir]);

    useEffect(() => {
        fetchOrders();
        fetchStatusStatistics(); // Fetch statistics on component mount and when orders change
    }, [statusFilter, searchTerm, currentPage, pageSize, sortBy, sortDir]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                sortBy: sortBy,
                sortDir: sortDir
            };

            if (statusFilter && statusFilter !== "ALL") {
                params.status = statusFilter;
            }

            if (searchTerm) {
                params.customerName = searchTerm;
            }

            const response = await api.get("/api/v1/admin/orders", { params });
            const pageData = response.data.data;
            setOrders(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 0);
            setTotalElements(pageData?.totalElements || 0);
            
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const fetchStatusStatistics = async () => {
        try {
            const response = await api.get("/api/v1/admin/orders/statistics");
            const stats = response.data.data;
            setStatusStats({
                PENDING: stats.PENDING || 0,
                CONFIRMED: stats.CONFIRMED || 0,
                SHIPPING: stats.SHIPPING || 0,
                DELIVERED: stats.DELIVERED || 0,
                CANCELLED: stats.CANCELLED || 0
            });
        } catch (error) {
            console.error("Error fetching order statistics:", error);
            // Don't show error toast for statistics, it's not critical
        }
    };

    const fetchOrderDetail = async (orderId) => {
        try {
            const response = await api.get(`/api/v1/admin/orders/${orderId}`);
            setSelectedOrder(response.data.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error("Error fetching order detail:", error);
            toast.error("Không thể tải chi tiết đơn hàng");
        }
    };

    const getAvailableStatuses = (currentStatus) => {
        // CANCELLED chỉ áp dụng khi chưa DELIVERED
        const allStatuses = [
            { value: "CONFIRMED", label: "Xác nhận đơn hàng", color: "blue", icon: FaCheckCircle },
            { value: "SHIPPING", label: "Đang giao hàng", color: "purple", icon: FaShippingFast },
            { value: "DELIVERED", label: "Đã giao hàng", color: "green", icon: FaCheckCircle },
            { value: "CANCELLED", label: "Hủy đơn hàng", color: "red", icon: FaTimesCircle },
        ];

        switch (currentStatus) {
            case "PENDING":
                // PENDING -> CONFIRMED hoặc CANCELLED
                return allStatuses.filter(s => s.value === "CONFIRMED" || s.value === "CANCELLED");
            case "CONFIRMED":
                // CONFIRMED -> SHIPPING hoặc CANCELLED  
                return allStatuses.filter(s => s.value === "SHIPPING" || s.value === "CANCELLED");
            case "SHIPPING":
                // SHIPPING -> DELIVERED hoặc CANCELLED
                return allStatuses.filter(s => s.value === "DELIVERED" || s.value === "CANCELLED");
            case "DELIVERED":
                // Đã giao thì không cho phép hủy hay chuyển trạng thái nữa
                return [];
            case "CANCELLED":
                // Đã hủy thì không cho phép chuyển trạng thái nữa
                return [];
            default:
                return [];
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) {
            toast.error("Vui lòng chọn trạng thái mới");
            return;
        }

        // Nếu trạng thái không thay đổi thì không cần gọi API
        if (newStatus === selectedOrder.status) {
            toast.info("Trạng thái không thay đổi");
            setShowStatusModal(false);
            return;
        }

        try {
            let endpoint = "";
            let successMessage = "";

            switch (newStatus) {
                case "CONFIRMED":
                    endpoint = `/api/v1/admin/orders/${selectedOrder.id}/confirm`;
                    successMessage = "Xác nhận đơn hàng thành công";
                    break;
                case "SHIPPING":
                    endpoint = `/api/v1/admin/orders/${selectedOrder.id}/ship`;
                    successMessage = "Đơn hàng đang được giao";
                    break;
                case "DELIVERED":
                    endpoint = `/api/v1/admin/orders/${selectedOrder.id}/delivered`;
                    successMessage = "Đơn hàng đã giao thành công";
                    break;
                case "CANCELLED":
                    endpoint = `/api/v1/admin/orders/${selectedOrder.id}/cancel`;
                    successMessage = "Đã hủy đơn hàng";
                    break;
                default:
                    toast.error("Trạng thái không hợp lệ");
                    return;
            }

            await api.put(endpoint);
            toast.success(successMessage);
            setShowStatusModal(false);
            setShowDetailModal(false);
            fetchOrders();
            fetchStatusStatistics(); // Refresh statistics after status update
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = orderStatuses.find((s) => s.value === status);
        if (!statusConfig) return null;

        const colorClasses = {
            yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
            blue: "bg-blue-100 text-blue-700 border-blue-300",
            purple: "bg-purple-100 text-purple-700 border-purple-300",
            green: "bg-green-100 text-green-700 border-green-300",
            red: "bg-red-100 text-red-700 border-red-300",
        };

        return (
            <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[statusConfig.color]
                    }`}
            >
                <statusConfig.icon size={12} />
                {statusConfig.label}
            </span>
        );
    };

    // Không cần filter ở client nữa vì đã filter ở server
    const filteredOrders = orders;

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
                        Quản lý đơn hàng
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Tổng số: <span className="font-semibold">{totalElements}</span> đơn hàng
                        {totalPages > 0 && (
                            <span className="text-sm ml-2">
                                (Trang {currentPage + 1}/{totalPages})
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchOrders();
                        fetchStatusStatistics();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaSync />
                    Làm mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên khách hàng..."
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
                            {orderStatuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort by Time */}
                    <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={`${sortBy}-${sortDir}`}
                            onChange={(e) => {
                                const [newSortBy, newSortDir] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortDir(newSortDir);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt-desc">Mới nhất</option>
                            <option value="createdAt-asc">Cũ nhất</option>
                            <option value="totalPrice-desc">Giá cao đến thấp</option>
                            <option value="totalPrice-asc">Giá thấp đến cao</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {orderStatuses.slice(1).map((status) => {
                    // Use statistics from API instead of counting from filtered orders
                    const count = statusStats[status.value] || 0;
                    const colorClasses = {
                        yellow: "from-yellow-500 to-yellow-600",
                        blue: "from-blue-500 to-blue-600",
                        purple: "from-purple-500 to-purple-600",
                        green: "from-green-500 to-green-600",
                        red: "from-red-500 to-red-600",
                    };

                    return (
                        <div
                            key={status.value}
                            className={`bg-gradient-to-br ${colorClasses[status.color]} rounded-xl shadow-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform`}
                            onClick={() => setStatusFilter(status.value)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90">{status.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">{count}</h3>
                                </div>
                                <status.icon className="text-3xl opacity-30" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Table Header with Page Size Selector */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="text-sm text-gray-600">
                        Hiển thị {orders.length > 0 ? (currentPage * pageSize + 1) : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số {totalElements} đơn hàng
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Số dòng mỗi trang:</label>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(0);
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold">Mã đơn hàng</th>
                                <th className="text-left py-4 px-6 font-semibold">Khách hàng</th>
                                <th className="text-left py-4 px-6 font-semibold">Ngày đặt</th>
                                <th className="text-right py-4 px-6 font-semibold">Tổng tiền</th>
                                <th className="text-center py-4 px-6 font-semibold">Trạng thái</th>
                                <th className="text-center py-4 px-6 font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-gray-300 border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <p className="font-semibold text-gray-800">
                                                #{order.orderCode || order.id}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {order.shippingAddress?.fullName || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {order.shippingAddress?.phone || "N/A"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-gray-700">
                                                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <p className="font-semibold text-gray-800">
                                                {order.totalPrice?.toLocaleString("vi-VN")} ₫
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => fetchOrderDetail(order.id)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500">
                                        <FaBox className="text-5xl mx-auto mb-3 opacity-50" />
                                        <p>Không tìm thấy đơn hàng nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <span>←</span> Trước
                        </button>

                        <div className="flex items-center gap-2">
                            {/* First page */}
                            {currentPage > 2 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPage(0)}
                                        className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        1
                                    </button>
                                    {currentPage > 3 && <span className="text-gray-400">...</span>}
                                </>
                            )}

                            {/* Page numbers around current page */}
                            {Array.from({ length: totalPages }, (_, i) => i)
                                .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                                .map(page => (
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

                            {/* Last page */}
                            {currentPage < totalPages - 3 && (
                                <>
                                    {currentPage < totalPages - 4 && <span className="text-gray-400">...</span>}
                                    <button
                                        onClick={() => setCurrentPage(totalPages - 1)}
                                        className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            Sau <span>→</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">
                                    Chi tiết đơn hàng #{selectedOrder.orderCode || selectedOrder.id}
                                </h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-bold text-gray-800 mb-3">Thông tin khách hàng</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Họ tên:</p>
                                        <p className="font-semibold">
                                            {selectedOrder.shippingAddress?.fullName || selectedOrder.user?.fullName || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email:</p>
                                        <p className="font-semibold">{selectedOrder.shippingAddress?.email || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Số điện thoại:</p>
                                        <p className="font-semibold">
                                            {selectedOrder.shippingAddress?.phone || "N/A"}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Địa chỉ giao hàng:</p>
                                        <p className="font-semibold">
                                            {selectedOrder.shippingAddress
                                                ? `${selectedOrder.shippingAddress.homeAddress || ''}, ${selectedOrder.shippingAddress.ward || ''}, ${selectedOrder.shippingAddress.province || ''}`
                                                : "N/A"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">Sản phẩm đã đặt</h4>
                                <div className="space-y-3">
                                    {selectedOrder.orderItems?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                {item.productImage ? (
                                                    <img src={item.productImage || "/placeholder.png"} alt={item.product?.name || "Product"} className="max-w-full max-h-full rounded-lg" />
                                                ) : (
                                                    <FaBox className="text-gray-400 text-2xl" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">
                                                    {item.product?.name || item.productName || "Sản phẩm"}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Số lượng: {item.quantity} x {item.price?.toLocaleString("vi-VN")} ₫
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800">
                                                    {(item.quantity * item.price)?.toLocaleString("vi-VN")} ₫
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-bold text-gray-800 mb-3">Tổng kết đơn hàng</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="font-semibold">
                                            {selectedOrder.totalPrice?.toLocaleString("vi-VN")} ₫
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span className="font-semibold">
                                            {selectedOrder.shippingFee?.toLocaleString("vi-VN") || 0} ₫
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="font-bold text-gray-800">Tổng cộng:</span>
                                        <span className="font-bold text-blue-600 text-lg">
                                            {selectedOrder.totalPrice?.toLocaleString("vi-VN")} ₫
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Trạng thái hiện tại:</p>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                                {getAvailableStatuses(selectedOrder.status).length > 0 ? (
                                    <button
                                        onClick={() => {
                                            const availableStatuses = getAvailableStatuses(selectedOrder.status);
                                            setNewStatus(availableStatuses[0]?.value || selectedOrder.status);
                                            setShowStatusModal(true);
                                        }}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Cập nhật trạng thái
                                    </button>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">
                                        {selectedOrder.status === "DELIVERED" ? "Đơn hàng đã hoàn thành" : "Đơn hàng đã bị hủy"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
                            <h3 className="text-xl font-bold">Cập nhật trạng thái đơn hàng</h3>
                            <p className="text-sm opacity-90 mt-1">#{selectedOrder.orderCode || selectedOrder.id}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Current Status */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">Trạng thái hiện tại:</p>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                            </div>

                            {/* Available Actions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Chọn hành động:
                                </label>
                                <div className="space-y-2">
                                    {getAvailableStatuses(selectedOrder.status).map((status) => {
                                        const colorClasses = {
                                            blue: "border-blue-500 hover:bg-blue-50 focus:ring-blue-500",
                                            purple: "border-purple-500 hover:bg-purple-50 focus:ring-purple-500",
                                            green: "border-green-500 hover:bg-green-50 focus:ring-green-500",
                                            red: "border-red-500 hover:bg-red-50 focus:ring-red-500",
                                        };

                                        return (
                                            <label
                                                key={status.value}
                                                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    newStatus === status.value
                                                        ? `${colorClasses[status.color]} bg-opacity-10`
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="orderStatus"
                                                    value={status.value}
                                                    checked={newStatus === status.value}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                                />
                                                <status.icon className="text-xl" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{status.label}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Warning for cancel */}
                            {newStatus === "CANCELLED" && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-700">
                                        ⚠️ <strong>Lưu ý:</strong> Hủy đơn hàng là hành động không thể hoàn tác.
                                    </p>
                                </div>
                            )}

                            {/* Workflow Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-xs text-blue-700 font-medium mb-2">📋 Luồng đơn hàng:</p>
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                    <span>Chờ xử lý</span>
                                    <span>→</span>
                                    <span>Xác nhận</span>
                                    <span>→</span>
                                    <span>Đang giao</span>
                                    <span>→</span>
                                    <span>Đã giao</span>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    * Có thể hủy đơn ở bất kỳ giai đoạn nào
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
                                >
                                    Xác nhận cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
