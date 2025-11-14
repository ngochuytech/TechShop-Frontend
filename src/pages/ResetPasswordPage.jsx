import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token không hợp lệ");
      navigate("/auth");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(passwordData.newPassword)}`
      );
      toast.success(response.data || "Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        navigate("/auth", { state: { showLogin: true } });
      }, 1500);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data || "Có lỗi xảy ra. Token có thể đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Đặt lại mật khẩu
        </h2>
        <p className="text-gray-600 mb-8">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block"></span>
                Đang xử lý...
              </>
            ) : (
              "Đặt lại mật khẩu"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Quay lại{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
