import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`);
      toast.success(response.data || "Email khôi phục mật khẩu đã được gửi!");
      setEmail("");
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error(error.response?.data || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Quay lại đăng nhập
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quên mật khẩu
        </h2>
        <p className="text-gray-600 mb-8">
          Nhập email của bạn và chúng tôi sẽ gửi link khôi phục mật khẩu
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Nhập email của bạn"
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
                Đang gửi...
              </>
            ) : (
              "Gửi email khôi phục"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Bạn đã nhớ mật khẩu?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
