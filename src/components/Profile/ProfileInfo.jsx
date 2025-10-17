import React, { useEffect } from "react";

export default function ProfileInfo({
  formData,
  handleChange,
  handleSubmit,
  address,
  addressForm = address
    ? {
        province: address.province,
        ward: address.ward,
        homeAddress: address.homeAddress,
        suggestedName: address.suggestedName
      }
    : {},
  handleAddressChange,
  handleAddressSubmit,
  showAddressForm,
  setShowAddressForm,
  showEditForm,
  setShowEditForm
}) {
    
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
          <h3 className="text-xl font-bold text-blue-600">Địa chỉ của bạn</h3>
          {address && !showAddressForm ? (
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              onClick={() => setShowAddressForm(true)}
            >
              Cập nhật địa chỉ
            </button>
          ) : !address && !showAddressForm ? (
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              onClick={() => setShowAddressForm(true)}
            >
              Thêm địa chỉ
            </button>
          ) : null}
        </div>
        {!address && !showAddressForm ? (
          <div className="text-gray-500 text-center py-8">Bạn chưa thiết lập địa chỉ</div>
        ) : showAddressForm ? (
          <form className="space-y-4" onSubmit={handleAddressSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phường</label>
                <input
                  type="text"
                  name="ward"
                  {...(handleAddressChange ? {
                    value: addressForm.ward || "",
                    onChange: handleAddressChange
                  } : {
                    defaultValue: addressForm.ward || ""
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập phường"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thành phố</label>
                <input
                  type="text"
                  name="province"
                  {...(handleAddressChange ? {
                    value: addressForm.province || "",
                    onChange: handleAddressChange
                  } : {
                    defaultValue: addressForm.province || ""
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập thành phố"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ nhà</label>
                <input
                  type="text"
                  name="homeAddress"
                  {...(handleAddressChange ? {
                    value: addressForm.homeAddress || "",
                    onChange: handleAddressChange
                  } : {
                    defaultValue: addressForm.homeAddress || ""
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập địa chỉ nhà"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Đặt tên gợi nhớ</label>
                <input
                  type="text"
                  name="suggestedName"
                  {...(handleAddressChange ? {
                    value: addressForm.suggestedName || "",
                    onChange: handleAddressChange
                  } : {
                    defaultValue: addressForm.suggestedName || ""
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ví dụ: Nhà riêng, Công ty, ..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => setShowAddressForm(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                Lưu địa chỉ
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-x-8">
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Tỉnh / Thành phố:</div>
              <div className="font-medium">{address.province}</div>
            </div>
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Phường / Xã:</div>
              <div className="font-medium">{address.ward || 'Chưa cập nhật'}</div>
            </div>
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Địa chỉ nhà:</div>
              <div className="font-medium">{address.homeAddress}</div>
            </div>
            <div className="py-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Tên gợi nhớ:</div>
              <div className="font-medium">{address.suggestedName || 'Chưa cập nhật'}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
