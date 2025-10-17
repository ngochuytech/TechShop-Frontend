export default function ProfileFavorites() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Sản phẩm yêu thích
      </h2>
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          Chưa có sản phẩm yêu thích
        </p>
      </div>
    </div>
  );
}
