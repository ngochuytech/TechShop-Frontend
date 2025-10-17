export default function ProfileSettings() {
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
              Đổi mật khẩu
            </button>
          </div>
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
