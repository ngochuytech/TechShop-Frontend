import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header/Header";
import ProductCard from "../components/MainContent/ProductCard";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function CategoryDetail() {
const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "Laptop"; // lấy category từ URL

  const [filters, setFilters] = useState(["CPU: Intel", "Ram: 32GB"]);
  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState([]);

// Gọi API lấy sản phẩm theo category
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API}/api/v1/products/category`, {
          params: { category }
        });
        setProducts(res.data.data || []);
      } catch (e) {
        setProducts([]);
      }
    }
    fetchProducts();
  }, [category]);


  // Xóa filter
  const removeFilter = (filter) =>
    setFilters(filters.filter((f) => f !== filter));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <main className="container mx-auto px-4 pt-20">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-2">Home / {category}</div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-4">{category}</h1>

        {/* Bộ lọc tiêu chí */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "Bộ lọc",
            "Xem theo giá",
            "Card đồ họa",
            "Độ phân giải",
            "CPU",
            "Hãng sản xuất",
            "Ổ cứng",
            "Dung lượng Ram",
          ].map((f, i) => (
            <button
              key={i}
              className="px-4 py-2 rounded-full border text-sm bg-white hover:bg-gray-100 flex items-center gap-1"
            >
              {f}
            </button>
          ))}
        </div>

        {/* Đang lọc theo */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Đang lọc theo</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {filters.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm"
              >
                {f}
                <button
                  onClick={() => removeFilter(f)}
                  className="ml-1 text-gray-600 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.length > 0 && (
              <button
                onClick={() => setFilters([])}
                className="text-blue-600 text-sm"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>
        </div>

        {/* Sắp xếp theo */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSort("popular")}
            className={`px-3 py-1 rounded-full border text-sm ${
              sort === "popular"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Phổ biến
          </button>
          <button
            onClick={() => setSort("priceAsc")}
            className={`px-3 py-1 rounded-full border text-sm ${
              sort === "priceAsc"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Giá thấp - cao
          </button>
          <button
            onClick={() => setSort("priceDesc")}
            className={`px-3 py-1 rounded-full border text-sm ${
              sort === "priceDesc"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Giá cao - thấp
          </button>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
