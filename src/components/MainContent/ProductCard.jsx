import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';
const API = import.meta.env.VITE_API_URL;

export default function ProductCard({product, category }) {
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    let mounted = true;
    const checkFav = async () => {
      if (!product || !product.id) return;
      try {
        const res = await api.get(`${API}/api/v1/customer/favourites/product/${product.id}`);
        let fav = res?.data?.data;

        if (mounted) setIsFav(!!fav);
      } catch (e) {
        console.error("Error checking favorite status:", e);
      }
    };
    checkFav();
    return () => { mounted = false; };
  }, [product?.id, isLoggedIn]);
  return (
    <div
      className="bg-white min-h-[345px] rounded-xl shadow-md p-3 flex flex-col gap-2 w-52 hover:shadow-xl transition-shadow duration-200 flex-shrink-0"
      data-card
      onClick={() => navigate(`/category/${encodeURIComponent(category)}/product/${encodeURIComponent(product.id)}`)}
    >
      <div className="w-full aspect-[4/3] bg-white rounded-lg flex items-center justify-center mb-1 overflow-hidden">
        <img
          src={`${product.imagePrimary || "https://via.placeholder.com/200x150?text=Image"}`}
          alt={product.name || "Sản phẩm"}
          className="object-contain w-full h-full max-h-32"
        />
      </div>
      <h3 className="text-left font-semibold text-base mt-1 text-gray-800">{product.name || "Tên sản phẩm"}</h3>

      <div className="flex gap-2">
        {product.price_discount && product.price ? (
          <div className="flex gap-2">
            <p className="text-red-500 text-sm font-bold">
              {product.price_discount.toLocaleString()}đ
            </p>
            <p className="text-gray-400 text-xs line-through">
              {product.price.toLocaleString()}đ
            </p>
          </div>
        ) : (
          <p className="text-red-500 text-sm font-bold">
            {product.price ? product.price.toLocaleString() + "đ" : "Giá liên hệ"}
          </p>
        )}
      </div>

      <p className="text-gray-400 text-xs text-center">{product.promotion || "Khuyến mãi hấp dẫn"}</p>
      
      {product.stock === 0 && (
        <div className="bg-gray-200 text-gray-600 text-xs font-semibold py-1 px-2 rounded text-center">
          Tạm hết hàng
        </div>
      )}
      
      <div className="flex-1 flex items-end">
        <div
          className={`flex w-full text-xs mt-2 ${isLoggedIn ? 'justify-between' : 'justify-center'}`}
        >
          <span className="px-3 py-2 min-h-[36px] rounded text-yellow-400 flex items-center font-semibold text-base">
            {product.averageRating ? product.averageRating + "★" : ""}
          </span>
          {isLoggedIn && (
            <span className={`px-4 py-2 min-h-[36px] rounded flex items-center font-semibold text-base border transition-colors ${isFav ? 'bg-pink-50 text-pink-600 border-pink-300' : 'bg-white text-pink-500 border-pink-200'}`}>
              <span className={`mr-2 ${isFav ? 'text-pink-600' : 'text-pink-500'}`}>{isFav ? '♥' : '♡'}</span>
              <span>Yêu thích</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}