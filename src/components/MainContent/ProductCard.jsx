export default function ProductCard({product }) {
  return (
    <div
      className="bg-white min-h-[345px] rounded-xl shadow-md p-3 flex flex-col gap-2 w-52 hover:shadow-xl transition-shadow duration-200 flex-shrink-0"
      data-card
    >
      <div className="w-full aspect-[4/3] bg-white rounded-lg flex items-center justify-center mb-1 overflow-hidden">
        <img
          src={product.image || "https://via.placeholder.com/200x150?text=Image"}
          alt={product.name || "Sản phẩm"}
          className="object-contain w-full h-full max-h-32"
        />
      </div>
      <h3 className="text-left font-semibold text-base mt-1 text-gray-800">{product.name || "Tên sản phẩm"}</h3>
      <p className="text-orange-600 text-sm font-bold text-center">{product.price ? product.price.toLocaleString() + "đ" : "Giá liên hệ"}</p>
      <p className="text-gray-400 text-xs text-center">{product.promotion || "Khuyến mãi hấp dẫn"}</p>
      <div className="flex-1 flex items-end">
        <div className="flex w-full justify-between text-xs mt-2">
          <span className="border border-yellow-200 px-3 py-2 min-h-[36px] rounded bg-yellow-50 text-yellow-400 flex items-center font-semibold text-base">
            {product.rating ? product.rating + "★" : "4.5★"}
          </span>
          <span className="border border-pink-200 px-4 py-2 min-h-[36px] rounded bg-pink-50 text-pink-500 flex items-center font-semibold text-base">
            {product.isFavorite ? "♥ Yêu thích" : "♡ Yêu thích"}
          </span>
        </div>
      </div>
    </div>
  );
}