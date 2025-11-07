import React from "react";
import { toast } from "react-toastify";
import api from "../../api";

export default function ProfileInfo({
  formData,
  handleChange,
  handleSubmit,
  addresses = [], // mảng địa chỉ
  addressForm = {},
  handleAddressChange,
  handleAddressSubmit,
  showAddressForm,
  setShowAddressForm,
  editingAddressId,
  setEditingAddressId,
  showEditForm,
  setShowEditForm
}) {
  const API = import.meta.env.VITE_API_URL;

  const [provinces, setProvinces] = React.useState([]);
  const [wards, setWards] = React.useState([]);

  // Modal fetch tỉnh/thành phố
  React.useEffect(() => {
    if (showAddressForm) {
      fetch("https://provinces.open-api.vn/api/v2/p/")
        .then(res => res.json())
        .then(data => setProvinces(data));
    }
  }, [showAddressForm]);

  // Fetch lại danh sách wards khi province thay đổi hoặc khi mở modal chỉnh sửa
  React.useEffect(() => {
    if (showAddressForm && addressForm.province) {
      const selectedProvince = provinces.find(p => p.name === addressForm.province);
      if (selectedProvince) {
        fetch(`https://provinces.open-api.vn/api/v2/p/${selectedProvince.code}?depth=2`)
          .then(res => res.json())
          .then(data => setWards(data.wards || []));
      }
    }
  }, [showAddressForm, addressForm.province, provinces]);

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    handleAddressChange({ target: { name: "province", value: provinceName } });
    handleAddressChange({ target: { name: "ward", value: "" } });
    setWards([]);
    // Tìm code của province theo name để fetch quận/huyện/phường
    const selectedProvince = provinces.find(p => p.name === provinceName);
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/v2/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
    }
  };

  const handleWardChange = (e) => {
    handleAddressChange({ target: { name: "ward", value: e.target.value } });
  };

  // Hàm xóa địa chỉ
  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await api.delete(`${API}/api/v1/address/${id}`);
      alert("Xóa địa chỉ thành công.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Xóa địa chỉ thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <>
      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thông tin cá nhân
          </h2>
          {!showEditForm && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              onClick={() => setShowEditForm(true)}
            >
              Cập nhật
            </button>
          )}
        </div>
        {!showEditForm ? (
          <div className="grid grid-cols-2 gap-x-8">
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Họ và tên:</div>
              <div className="font-medium">{formData.fullName || 'Chưa cập nhật'}</div>
            </div>
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Số điện thoại:</div>
              <div className="font-medium">{formData.phone || 'Chưa cập nhật'}</div>
            </div>
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Email:</div>
              <div className="font-medium">{formData.email || 'Chưa cập nhật'}</div>
            </div>
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Ngày sinh:</div>
              <div className="font-medium">{formData.dateOfBirth || 'Chưa cập nhật'}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => setShowEditForm(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all hover:from-blue-600 hover:to-purple-600"
              >
                Cập nhật thông tin
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Địa chỉ của bạn */}
      <div className="bg-white rounded-xl shadow-lg p-8 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-600">Sổ địa chỉ</h3>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            onClick={() => { setShowAddressForm(true); setEditingAddressId(null); }}
          >
            Thêm địa chỉ
          </button>
        </div>
        {addresses.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Bạn chưa có địa chỉ nào</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(addr => (
              <div key={addr.id} className="border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all relative bg-gradient-to-br from-white to-gray-50">
                {/* Tag tên gợi nhớ */}
                {addr.suggestedName && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                      </svg>
                      {addr.suggestedName}
                    </span>
                  </div>
                )}

                {/* Nút chỉnh sửa */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    className="p-2 bg-white border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
                    onClick={() => {
                      setShowAddressForm(true);
                      setEditingAddressId(addr.id);
                      if (typeof window.setAddressForm === 'function') {
                        window.setAddressForm(addr);
                      }
                      if (typeof setAddressForm === 'function') {
                        setAddressForm(addr);
                      }
                    }}
                    title="Chỉnh sửa địa chỉ"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    className="p-2 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all shadow-sm"
                    onClick={() => handleDeleteAddress(addr.id)}
                    title="Xóa địa chỉ"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Nội dung địa chỉ */}
                <div className="mt-12 space-y-3">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Địa chỉ đầy đủ:</div>
                      <div className="font-medium text-gray-900">
                        {addr.homeAddress}, {addr.ward}, {addr.province}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Số điện thoại:</div>
                      <div className="font-medium text-gray-900">{addr.phoneNumber || addr.phone}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Thêm / Cập nhật địa chỉ */}
      {showAddressForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) { setShowAddressForm(false); setEditingAddressId(null); }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAddressId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
              </h3>
              <button
                onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddressSubmit(e, editingAddressId); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Thành phố</label>
                  <select
                    name="province"
                    value={addressForm.province || ""}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phường/Xã</label>
                  <select
                    name="ward"
                    value={addressForm.ward || ""}
                    onChange={handleWardChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ nhà</label>
                  <input
                    type="text"
                    name="homeAddress"
                    value={addressForm.homeAddress || ""}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={addressForm.phoneNumber || ""}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Số điện thoại nhận hàng"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên gợi nhớ</label>
                  <input
                    type="text"
                    name="suggestedName"
                    value={addressForm.suggestedName || ""}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ví dụ: Nhà riêng, Công ty, ..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
                  onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium"
                >
                  {editingAddressId ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
