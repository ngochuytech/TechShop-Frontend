import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const API = import.meta.env.VITE_API_URL;

export default function ProductSection({ title, brands, category }) {
  const [active, setActive] = useState(brands[0]);
  const [products, setProducts] = useState([]);
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const navigate = useNavigate();
  
   useEffect(() => {
    // Gọi API lấy sản phẩm theo category và brand
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API}/api/v1/products/`, {
          params: {category, brand: active}
        });
        
        setProducts(res.data.data || []);
      } catch (e) {
        console.error("Error fetching products:", e);
        
        setProducts([]);
      }
    }
    fetchProducts();
  }, [category, active]);

  const checkScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    setAtStart(container.scrollLeft <= 2); // allow for small rounding
  };

  const scrollByCard = (dir = 1) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.querySelector('div[data-card]');
    if (!card) return;
    const scrollAmount = card.offsetWidth + 24; // 24 = gap-6
    container.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350); // update after scroll
  };

  // Hide scrollbar with custom CSS
  const hideScrollbar = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  return (
    <section className="mt-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-extrabold text-xl text-gray-800">{title}</h2>
        <div className="flex gap-2 text-sm">
          {brands.map((b, i) => (
              b === "Xem tất cả" ? (
              <button
                key={b}
                onClick={() => navigate(`/category?category=${encodeURIComponent(category)}`)}
                className="px-3 py-1 rounded-full border text-sm bg-blue-100 hover:bg-blue-200 font-semibold"
              >
                {b}
              </button>
            ) : (
              <button
                key={i}
                onClick={() => setActive(b)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all duration-150 ${active === b ? "bg-gradient-to-r from-blue-500 to-pink-400 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-blue-50"}`}
              >
                {b}
              </button>
            )
          ))}
        </div>
      </div>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-2 pr-10" style={{
          ...hideScrollbar,
          overflowX: 'auto',
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* Nút mũi tên phải */}
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 border border-blue-200 shadow rounded-full w-10 h-10 flex items-center justify-center text-blue-500 text-xl transition-all"
          style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
        >
          <span>&rarr;</span>
        </button>
        {/* Nút mũi tên trái */}
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 border border-blue-200 shadow rounded-full w-10 h-10 flex items-center justify-center text-blue-500 text-xl transition-all ${atStart ? 'opacity-30 pointer-events-none' : 'hover:bg-blue-100'}`}
        >
          <span>&larr;</span>
        </button>
      </div>
    </section>
  );
}