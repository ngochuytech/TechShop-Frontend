import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header/Header";
import ProductCard from "../components/MainContent/ProductCard";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const FILTERS_BY_CATEGORY = {
  Laptop: [
    { label: "Xem theo giá", key: "Price" },
    { label: "Card đồ họa", key: "GPU_MODEL" },
    { label: "CPU", key: "CPU_MODEL" },
    { label: "Dung lượng Ram", key: "RAM" },
    { label: "Ổ cứng", key: "STORAGE_CAPACITY" },
    { label: "Kích thước màn hình", key: "SCREEN_SIZE" },
    { label: "Độ phân giải", key: "RESOLUTION" },
  ],
  Desktop: [
    { label: "Xem theo giá", key: "Price" },
    { label: "Card đồ họa", key: "GPU_MODEL" },
    { label: "CPU", key: "CPU_MODEL" },
    { label: "Dung lượng Ram", key: "RAM" },
    { label: "Ổ cứng", key: "STORAGE_CAPACITY" },
    { label: "Kích thước màn hình", key: "SCREEN_SIZE" },
    { label: "Độ phân giải", key: "RESOLUTION" },
  ],
  "Màn hình": [
    { label: "Xem theo giá", key: "Price" },
    "Kiểu màn hình",
    "Độ phân giải",
    "Kích thước",
    "Tần số quét",
    "Tấm nền",
    "Thời gian phản hồi",
    "Cổng kết nối",
    "Treo tường",
  ],
  "Ổ cứng": [
    { label: "Xem theo giá", key: "Price" },
    "Loại ổ cứng",
    "Dung lượng",
  ],
  Ram: [
    { label: "Xem theo giá", key: "Price" },
    "Dung lượng",
    "Loại Ram",
    "Bus Ram",
    "Hỗ trợ",
    "Đèn Led",
  ],
  "Micro": [
    { label: "Xem theo giá", key: "Price" },
    "Loại Micro",
  ],
  "Webcam": [
    { label: "Xem theo giá", key: "Price" },
    "Độ phân giải",
    "Tính năng",
  ],
};

const FILTER_OPTIONS = {
  GPU_MODEL: [
    { label: "Card OnBoard", key: "Intel" },
    { label: "NVIDIA GeForce Series", key: "NVIDIA" },
    { label: "AMD Radeon Series", key: "AMD" },
  ],
  CPU_MODEL: [
    { label: "Intel Core i3", key: "Intel Core i3" },
    { label: "Intel Core i5", key: "Intel Core i5" },
    { label: "Intel Core i7", key: "Intel Core i7" },
    { label: "Intel Core i9", key: "Intel Core i9" },
    { label: "AMD Ryzen 5", key: "AMD Ryzen 5" },
    { label: "AMD Ryzen 7", key: "AMD Ryzen 7" },
    { label: "AMD Ryzen 9", key: "AMD Ryzen 9"},
    { label: "AMD Ryzen AI", key: "AMD Ryzen AI"},
    { label: "Apple M1", key: "Apple M1" },
    { label: "Apple M2", key: "Apple M2" },
    { label: "Apple M3", key: "Apple M3" },
    { label: "Apple M4", key: "Apple M4" },
  ],
  RAM: [
    { label: "8GB", key: "8GB" },
    { label: "12GB", key: "12GB" },
    { label: "16GB", key: "16GB" },
    { label: "24GB", key: "24GB" },
    { label: "32GB", key: "32GB" },
    { label: "64GB", key: "64GB" },
    { label: "128GB", key: "128GB" },
  ],
  STORAGE_CAPACITY: [
    { label: "256GB", key: "256GB" },
    { label: "512GB", key: "512GB" },
    { label: "1TB", key: "1TB" },
    { label: "2TB", key: "2TB" },
    { label: "4TB", key: "4TB" },
  ],
  SCREEN_SIZE: [
    { label: "13 inch", key: "13 inch" },
    { label: "14 inch", key: "14 inch" },
    { label: "15.6 inch", key: "15.6 inch" },
    { label: "17 inch", key: "17 inch" },
  ],
  RESOLUTION: [
    { label: "HD", key: "HD" },
    { label: "Full HD", key: "Full HD" },
    { label: "2K (Quad HD)", key: "2K" },
    { label: "WUXGA", key: "WUXGA" },
    { label: "4K (Ultra HD)", key: "4K" },
  ],
};

// Ánh xạ key sang nhãn hiển thị
const FILTER_LABELS = {
  GPU_MODEL: "GPU",
  CPU_MODEL: "CPU",
  RAM: "RAM",
  STORAGE_CAPACITY: "Ổ cứng",
  SCREEN_SIZE: "Kích thước màn hình",
  RESOLUTION: "Độ phân giải",
  Price: "Giá",
};

export default function CategoryDetail() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || null;
  const filtersForCategory = FILTERS_BY_CATEGORY[category] || [];
  const [filterDropdown, setFilterDropdown] = useState("");
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    console.log("Filters changed: ", filters);
  }, [filters]);

  // Gọi API lấy sản phẩm theo category
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API}/api/v1/products/category`, {
          params: { category },
        });
        setProducts(res.data.data || []);
      } catch (e) {
        setProducts([]);
      }
    }
    fetchProducts();
  }, [category]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.post(`${API}/api/v1/products/filters`, {
          category,
          attributes: appliedFilters,
        });
        console.log("Filtered products: ", res.data);
        
        setProducts(res.data.data || []);
      } catch (e) {
        console.log("Error fetching filtered products: ", e.response.data);
        setProducts([]);
      }
    }
    if (Object.keys(appliedFilters).length > 0) {
      fetchProducts();
    }
  }, [category, appliedFilters]);

  // Xóa filter
  const removeFilter = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      updated[key] = updated[key].filter((v) => v !== value);
      if (updated[key].length === 0) delete updated[key];
      return updated;
    });
  };

  const getFilterLabel = (filterKey, value) => {
    const options = FILTER_OPTIONS[filterKey];
    if (options) {
      const option = options.find((opt) => opt.key === value);
      return option ? option.label : value;
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <main className="container mx-auto px-4 pt-20">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-2">Home / {category}</div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-4">{category}</h1>

        {filtersForCategory.length > 0 && (
          <>
            {/* Bộ lọc tiêu chí */}
            <h3 className="text-xl font-bold mb-4">Chọn theo tiêu chí</h3>
            <div className="flex flex-wrap gap-2 mb-4 relative">
              {filtersForCategory.map((filter, i) => (
                <div key={i} className="relative">
                  <button
                    className="px-4 py-2 rounded-full border text-sm bg-white hover:bg-gray-100 flex items-center gap-1"
                    onClick={() => {
                      if (FILTER_OPTIONS[filter.key]) {
                        setFilterDropdown(
                          filterDropdown === filter.key ? "" : filter.key
                        );
                      }
                    }}
                  >
                    {filter.label}
                  </button>

                  {filterDropdown === filter.key && FILTER_OPTIONS[filter.key] && (
                    <div className="absolute left-0 mt-2 z-20 bg-white border rounded shadow-lg min-w-[180px]">
                      {FILTER_OPTIONS[filter.key].map((filter_option) => (
                        <button
                          key={filter_option.label}
                          className="block w-full text-left px-4 py-2 hover:bg-blue-50"
                          onClick={() => {
                            setFilters((prev) => {
                              const currentValues = prev[filter.key] || [];
                              return {
                                ...prev,
                                [filter.key]: [
                                  ...new Set([...currentValues, filter_option.key]),
                                ],
                              };
                            });
                            setFilterDropdown("");
                          }}
                        >
                          {filter_option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Đang lọc theo */}
            {Object.keys(filters).length > 0 && (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Đang lọc theo</h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    {Object.entries(filters).map(([key, values]) =>
                      values.map((value) => (
                        <span
                          key={key + value}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm"
                        >
                          {FILTER_LABELS[key] || key}: {getFilterLabel(key, value)}
                          <button
                            onClick={() => removeFilter(key, value)}
                            className="ml-1 text-gray-600 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                    {Object.keys(filters).length > 0 && (
                      <button
                        onClick={() => setFilters({})}
                        className="text-blue-600 text-sm"
                      >
                        Bỏ chọn tất cả
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            {Object.keys(filters).length > 0 && (
              <div className="mb-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700"
                  onClick={() => setAppliedFilters(filters)}
                >
                  Xem kết quả
                </button>
              </div>
            )}
          </>
        )}

        {/* Sắp xếp theo */}
        <h3 className="text-xl font-bold mb-4">Sắp xếp theo</h3>
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