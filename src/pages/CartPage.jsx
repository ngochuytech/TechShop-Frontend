import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { toast } from "react-toastify";
import api from "../api";

const API = import.meta.env.VITE_API_URL;

export default function CartPage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get(`${API}/api/v1/cart`);
      const cartData = response.data?.data;
      let items = Array.isArray(cartData?.items) ? cartData.items : [];
      
      setCartItems(items);
      setTotalQuantity(cartData?.totalQuantity || items.length);
      setTotalPrice(cartData?.totalPrice || 0);
      if (!initialized) {
        setSelectedIds(items.map(item => item.id));
        setInitialized(true);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setTotalQuantity(0);
      setTotalPrice(0);
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`${API}/api/v1/cart/items/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      toast.error(error.response?.data.error || "Cập nhật số lượng thất bại!");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`${API}/api/v1/cart/items/${itemId}`);
      await fetchCart();
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại!");
    }
  };

  const calculateTotal = () => {
  // Tính tổng tiền chỉ cho các sản phẩm đã chọn
  return cartItems.filter(item => selectedIds.includes(item.id)).reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 pt-16 pb-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 pt-16 pb-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-600 mt-2">
              Bạn có {totalQuantity} sản phẩm trong giỏ hàng
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn chưa có sản phẩm nào trong giỏ hàng
              </p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg p-6 flex gap-6 items-center"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-blue-600 mr-2"
                      checked={selectedIds.includes(item.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, item.id]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== item.id));
                        }
                      }}
                    />
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{item.productName}</h3>
                      <p className="text-gray-600 mb-2">
                        Đơn giá: <span className="text-blue-600 font-semibold">{formatPrice(item.price)}</span>
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Tổng đơn hàng
                  </h2>
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển:</span>
                      <span className="text-green-600">Miễn phí</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
                      const total = calculateTotal();
                      navigate("/checkout", { 
                        state: { 
                          selectedItems,
                          total 
                        } 
                      });
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                    disabled={selectedIds.length === 0}
                  >
                    Tiến hành thanh toán
                  </button>
                  <button
                    onClick={() => navigate("/home")}
                    className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
