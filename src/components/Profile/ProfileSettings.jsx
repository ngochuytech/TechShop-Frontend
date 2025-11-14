import { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

export default function ProfileSettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`${API}/api/v1/users/change-password`, passwordData);
      toast.success(response.data.data || "Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.error || "Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Cài đặt tài khoản
      </h2>
      <div className="space-y-6">
        <div className="border-b pb-6">
          <h3 className="font-semibold text-lg mb-4">
            Đổi mật khẩu
          </h3>
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu mới"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                  Đang xử lý...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </button>
          </form>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4 text-red-600">
            Xóa tài khoản
          </h3>
          <p className="text-gray-600 mb-4">
            Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn.
            Hành động này không thể hoàn tác.
          </p>
          <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all">
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
