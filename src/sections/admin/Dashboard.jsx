import { useEffect, useState } from "react";
import {
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaStar,
  FaExclamationTriangle,
  FaChartLine,
  FaBox,
  FaTags,
} from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import api from "../../api";
import { toast } from "react-toastify";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalProductModels: 0,
    totalReviews: 0,
    averageRating: 0,
    lowStockProducts: 0,
    totalVariants: 0,
    favoriteCount: 0,
    monthlyGrowth: {
      revenue: 0,
      orders: 0,
      customers: 0,
    },
  });
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    data: [],
  });
  const [categoryData, setCategoryData] = useState({
    labels: [],
    data: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState("year");
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [revenueMonth, setRevenueMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRevenueData();
    fetchCategoryData();
    fetchRecentOrders();
    fetchRecentReviews();
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [revenuePeriod, revenueYear, revenueMonth]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const overviewRes = await api.get('/api/v1/admin/statistics/overview');
      const overviewData = overviewRes.data.data;

      const topProductsRes = await api.get('/api/v1/admin/statistics/products/top-selling', {
        params: { limit: 5 }
      });
      
      const topProductsData = topProductsRes.data.data || [];

      setStats({
        totalProducts: overviewData.totalProducts || 0,
        totalOrders: overviewData.totalOrders || 0,
        totalCustomers: overviewData.totalCustomers || 0,
        totalRevenue: overviewData.totalRevenue || 0,
        totalProductModels: overviewData.totalProductModels || 0,
        totalReviews: overviewData.totalReviews || 0,
        averageRating: overviewData.averageRating || 0,
        lowStockProducts: overviewData.lowStockProducts || 0,
        totalVariants: overviewData.totalVariants || 0,
        favoriteCount: overviewData.favoriteCount || 0,
        monthlyGrowth: overviewData.monthlyGrowth || {
          revenue: 0,
          orders: 0,
          customers: 0,
        },
      });
      
      setTopProducts(topProductsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const params = {
        period: revenuePeriod,
        year: revenueYear,
      };

      if (revenuePeriod === "month" || revenuePeriod === "week") {
        params.month = revenueMonth;
      }

      const response = await api.get('/api/v1/admin/statistics/revenue', { params });
      const data = response.data.data;

      setRevenueData({
        labels: data.labels || [],
        data: data.values || [],
      });
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Không thể tải dữ liệu doanh thu");
    }
  };

  const fetchCategoryData = async () => {
    try {
      const response = await api.get('/api/v1/admin/statistics/products/by-category');
      const categories = response.data.data || [];
      
      const labels = categories.map(item => item.category);
      const counts = categories.map(item => item.count);
      
      setCategoryData({
        labels: labels,
        data: counts,
      });
    } catch (error) {
      console.error("Error fetching category data:", error);
      toast.error("Không thể tải dữ liệu danh mục");
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/api/v1/admin/orders/recent', {
        params: { limit: 5 }
      });
      const orders = response.data.data || [];
      setRecentOrders(orders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      toast.error("Không thể tải đơn hàng gần đây");
    }
  };

  const fetchRecentReviews = async () => {
    try {
      const response = await api.get('/api/v1/admin/reviews/recent', {
        params: { limit: 5 }
      });
      const reviews = response.data.data || [];
      
      setRecentReviews(reviews);
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
      toast.error("Không thể tải đánh giá gần đây");
    }
  };

  // Chart data từ API
  const revenueChartData = {
    labels: revenueData.labels,
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: revenueData.data,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        label: "Số lượng sản phẩm",
        data: categoryData.data,
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(139, 92, 246)",
          "rgb(236, 72, 153)",
          "rgb(34, 197, 94)",
          "rgb(251, 191, 36)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Số lượng: ${context.parsed.y} sản phẩm`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Tổng Quan
        </h2>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaChartLine />
          Làm mới
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tổng doanh thu */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tổng doanh thu</p>
              <h3 className="text-3xl font-bold mt-2">
                {(stats.totalRevenue / 1000000).toFixed(1)}M
              </h3>
              <p className="text-xs mt-2 opacity-80">
                {stats.monthlyGrowth?.revenue > 0 ? '+' : ''}{stats.monthlyGrowth?.revenue}% so với tháng trước
              </p>
            </div>
            <FaDollarSign className="text-5xl opacity-20" />
          </div>
        </div>

        {/* Tổng đơn hàng */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tổng đơn hàng</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalOrders}</h3>
              <p className="text-xs mt-2 opacity-80">
                {stats.monthlyGrowth?.orders > 0 ? '+' : ''}{stats.monthlyGrowth?.orders}% so với tháng trước
              </p>
            </div>
            <FaShoppingCart className="text-5xl opacity-20" />
          </div>
        </div>

        {/* Tổng sản phẩm */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tổng sản phẩm</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalProducts}</h3>
              <p className="text-xs mt-2 opacity-80">{stats.totalVariants} variants</p>
            </div>
            <FaBoxes className="text-5xl opacity-20" />
          </div>
        </div>

        {/* Tổng khách hàng */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Khách hàng</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalCustomers}</h3>
              <p className="text-xs mt-2 opacity-80">
                {stats.monthlyGrowth?.customers > 0 ? '+' : ''}{stats.monthlyGrowth?.customers}% so với tháng trước
              </p>
            </div>
            <FaUsers className="text-5xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaStar className="text-2xl text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đánh giá TB</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.averageRating.toFixed(1)} ⭐
              </h3>
              <p className="text-xs text-gray-500">{stats.totalReviews} đánh giá</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-2xl text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sắp hết hàng</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.lowStockProducts}
              </h3>
              <p className="text-xs text-gray-500">Cần nhập thêm</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaTags className="text-2xl text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Product Models</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalProductModels}
              </h3>
              <p className="text-xs text-gray-500">Tổng mẫu sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Doanh thu {revenuePeriod === "year" ? "theo tháng" : revenuePeriod === "month" ? "theo ngày" : "theo tuần"}
          </h3>
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="year">Năm</option>
              <option value="month">Tháng</option>
              <option value="week">Tuần</option>
            </select>

            {/* Year Selector */}
            <select
              value={revenueYear}
              onChange={(e) => setRevenueYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>

            {/* Month Selector */}
            {(revenuePeriod === "month" || revenuePeriod === "week") && (
              <select
                value={revenueMonth}
                onChange={(e) => setRevenueMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <Line data={revenueChartData} options={chartOptions} />
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <FaBox className="text-purple-600" />
          Phân bố sản phẩm theo danh mục
        </h3>
        <Bar data={categoryChartData} options={categoryChartOptions} />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <FaStar className="text-yellow-600" />
          Top 5 sản phẩm nổi bật
        </h3>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Sản phẩm</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Giá</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Tồn kho</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Đã bán</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.configuration_summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800">
                        {product.price?.toLocaleString("vi-VN")} ₫
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.stock < 10
                            ? "bg-red-100 text-red-700"
                            : product.stock < 20
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-gray-800">
                        {product.soldCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold text-gray-800">
                          {product.averageRating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FaBoxes className="text-5xl mx-auto mb-3 opacity-50" />
            <p>Chưa có sản phẩm nào</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-green-600" />
            Đơn hàng gần đây
          </h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">Đơn hàng #{order.id}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress.fullName || "Khách hàng"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {order.totalPrice?.toLocaleString("vi-VN")} ₫
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-700' 
                        : order.status === 'CANCELLED' 
                        ? 'bg-red-100 text-red-700'
                        : order.status === 'SHIPPING'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'DELIVERED' ? 'Đã giao' :
                       order.status === 'COMPLETED' ? 'Hoàn thành' :
                       order.status === 'CANCELLED' ? 'Đã hủy' :
                       order.status === 'SHIPPING' ? 'Đang giao' :
                       order.status === 'PENDING' ? 'Chờ xử lý' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FaShoppingCart className="text-5xl mx-auto mb-3 opacity-50" />
              <p>Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <FaStar className="text-yellow-600" />
            Đánh giá gần đây
          </h3>
          {recentReviews.length > 0 ? (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {review.user.name || "Khách hàng"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.product?.name || "Sản phẩm"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                          size={12}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {review.comment || "Không có nhận xét"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {review.createdAt ? new Date(review.createdAt).toLocaleString("vi-VN") : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FaStar className="text-5xl mx-auto mb-3 opacity-50" />
              <p>Chưa có đánh giá nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
