import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import ProductCard from "../components/MainContent/ProductCard";
import DualRangePriceSlider from "../components/DualRangePriceSlider";
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
    { label: "Kiểu màn hình", key: "SCREEN_TYPE" },
    { label: "Độ phân giải", key: "RESOLUTION" },
    { label: "Kích thước", key: "SCREEN_SIZE" },
    { label: "Tần số quét", key: "SCAN_FREQUENCY" },
    { label: "Tấm nền", key: "SCREEN_PANEL" },
    { label: "Thời gian phản hồi", key: "RESPONSE_TIME" },
    { label: "Cổng kết nối", key: "PORT" },
    { label: "Treo tường", key: "WALL_HANGING" },
  ],
  "Ổ cứng": [
    { label: "Xem theo giá", key: "Price" },
    { label: "Loại ổ cứng", key: "STORAGE_TYPE" },
    { label: "Dung lượng", key: "STORAGE_CAPACITY" },
  ],
  Ram: [
    { label: "Xem theo giá", key: "Price" },
    { label: "Dung lượng", key: "RAM" },
    { label: "Loại Ram", key: "DDR_RAM" }
  ],
  "Micro": [
    { label: "Xem theo giá", key: "Price" },
    { label: "Loại Micro", key: "MICRO_TYPE" },

  ],
  "Webcam": [
    { label: "Xem theo giá", key: "Price" },
    { label: "Độ phân giải", key: "RESOLUTION" }
  ],
};

const FILTER_OPTIONS = {
  Price: [],
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
  SCREEN_TYPE: [
    { label: "Màn hình phẳng", key: "Phẳng" },
    { label: "Man hình cong", key: "Cong" },
  ],
  SCAN_FREQUENCY: [
    { label: "60Hz", key: "60Hz" },
    { label: "75Hz", key: "75Hz" },
    { label: "120Hz", key: "120Hz" },
    { label: "144Hz", key: "144Hz" },
    { label: "165Hz", key: "165Hz" },
    { label: "240Hz", key: "240Hz" },
    { label: "360Hz", key: "360Hz" },
  ],
  SCREEN_PANEL: [
    { label: "IPS", key: "IPS" },
    { label: "VA", key: "VA" },
    { label: "TN", key: "TN" },
    { label: "OLED", key: "OLED" },
    { label: "Mini LED", key: "Mini LED" },
    { label: "QLED", key: "QLED" },
  ],
  RESPONSE_TIME: [
    { label: "<1ms", key: "<1ms" },
    { label: "1ms", key: "1ms" },
    { label: "2 - 3ms", key: "2 - 3ms" },
    { label: "4 - 5ms", key: "4 - 5ms" },
    { label: "6 - 10ms", key: "6 - 10ms" },
  ],
  PORT: [
    { label: "HDMI", key: "HDMI" },
    { label: "DisplayPort", key: "DisplayPort" },
    { label: "USB-C", key: "USB-C" },
    { label: "VGA", key: "VGA" },
    { label: "Thunderbolt", key: "Thunderbolt" },
  ],
  WALL_HANGING: [
    { label: "75 x 75 mm", key: "75 x 75 mm" },
    { label: "100 x 100 mm", key: "100 x 100 mm" },
    { label: "200 x 200 mm", key: "200 x 200 mm" },
  ],
  STORAGE_TYPE: [
    { label: "HDD", key: "HDD" },
    { label: "SSD", key: "SSD" },
  ],
  DDR_RAM: [
    { label: "DDR3", key: "DDR3" },
    { label: "DDR4", key: "DDR4" },
    { label: "DDR5", key: "DDR5" },
  ],
  MICRO_TYPE: [
    { label: "Micro cài đặt", key: "Cài đặt" },
    { label: "Micro thu âm", key: "Thu âm" },
    { label: "Micro không dây", key: "Không dây" },
    { label: "Micro điện thoại", key: "Điện thoại" },
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
  SCREEN_TYPE: "Kiểu màn hình",
  SCAN_FREQUENCY: "Tần số quét",
  SCREEN_PANEL: "Tấm nền",
  RESPONSE_TIME: "Thời gian phản hồi",
  PORT: "Cổng kết nối",
  WALL_HANGING: "Treo tường",
};

const BRANDS = {
  Laptop: [
    { label: "Macbook", imageUrl: "/assets/brands/macbook.webp" },
    { label: "Asus", imageUrl: "/assets/brands/Asus.webp" },
    { label: "Lenovo", imageUrl: "/assets/brands/Lenovo.webp" },
    { label: "MSI", imageUrl: "/assets/brands/MSI.webp" },
    { label: "Acer", imageUrl: "/assets/brands/acer.webp"},
    { label: "HP", imageUrl: "/assets/brands/HP.webp" },
    { label: "Dell", imageUrl: "/assets/brands/Dell.webp" },
    { label: "LG", imageUrl: "/assets/brands/LG.webp" },
    { label: "Masstel", imageUrl: "/assets/brands/masstel.webp" }
  ],
  Desktop: [],
  "Màn hình": [
    { label: "Asus", imageUrl: "/assets/brands/Asus.webp" },
    { label: "LG", imageUrl: "/assets/brands/LG.webp" },
    { label: "Samsung", imageUrl: "/assets/brands/samsung.webp" },
    { label: "Acer", imageUrl: "/assets/brands/acer.webp"},
    { label: "Viewsonic", imageUrl: "/assets/brands/viewsonic.webp" },
    { label: "Dell", imageUrl: "/assets/brands/Dell.webp" },
    { label: "Xiaomi", imageUrl: "/assets/brands/xiaomi.webp" },
    { label: "MSI", imageUrl: "/assets/brands/MSI.webp" },
    { label: "Lenovo", imageUrl: "/assets/brands/Lenovo.webp" },
    { label: "E-DRA", imageUrl: "/assets/brands/edra.webp" },
    { label: "AOC", imageUrl: "/assets/brands/aoc.webp" },
    { label: "Dahua", imageUrl: "/assets/brands/dahua.webp" }
  ],
  "Ổ cứng": [
    { label: "Kingston", imageUrl: "/assets/brands/kingston.webp" },
    { label: "SanDisk", imageUrl: "/assets/brands/SanDisk.webp" },
    { label: "Samsung", imageUrl: "/assets/brands/samsung.webp" },
    { label: "Western Digital", imageUrl: "/assets/brands/western-digital.webp" },
    { label: "Lexar", imageUrl: "/assets/brands/lexar.webp" },
    { label: "PNY", imageUrl: "/assets/brands/PNY.webp" },
    { label: "Asus", imageUrl: "/assets/brands/Asus.webp" },
    { label: "MSI", imageUrl: "/assets/brands/MSI.webp" },
    { label: "SEAGATE", imageUrl: "/assets/brands/seagate.webp" },
    { label: "ORICO", imageUrl: "/assets/brands/orico.webp" },
    { label: "Synology", imageUrl: "/assets/brands/synology.webp" },
  ],
  Ram: [
    { label: "Kingston", imageUrl: "/assets/brands/kingston.webp" },
    { label: "Samsung", imageUrl: "/assets/brands/samsung.webp" },
    { label: "Lexar", imageUrl: "/assets/brands/lexar.webp" },
    { label: "Adata", imageUrl: "/assets/brands/adata.webp" },
    { label: "PNY", imageUrl: "/assets/brands/PNY.webp" },
    { label: "Patriot", imageUrl: "/assets/brands/patriot.webp" },
  ],
  Loa: [
    { label: "JBL", imageUrl: "/assets/brands/jbl.webp" },
    { label: "Marshall", imageUrl: "/assets/brands/marshall.webp" },
    { label: "LG", imageUrl: "/assets/brands/LG.webp" },
    { label: "Sony", imageUrl: "/assets/brands/sony.webp" },
    { label: "Bose", imageUrl: "/assets/brands/bose.webp" },
    { label: "Samsung", imageUrl: "/assets/brands/samsung.webp" },
    { label: "Xiaomi", imageUrl: "/assets/brands/xiaomi.webp" },
    { label: "Edifier", imageUrl: "/assets/brands/edifier.webp" },
    { label: "Havit", imageUrl: "/assets/brands/havit.webp" },
    { label: "Logitech", imageUrl: "/assets/brands/logitech.webp" },
    { label: "Anker", imageUrl: "/assets/brands/anker.webp" },
  ],
  Micro: [
    { label: "Saramonic", imageUrl: "/assets/brands/saramonic.webp" },
    { label: "Boya", imageUrl: "/assets/brands/boya.webp" },
    { label: "JBL", imageUrl: "/assets/brands/jbl.webp" },
    { label: "AKG", imageUrl: "/assets/brands/AKG.webp" },
    { label: "Shure", imageUrl: "/assets/brands/shure.webp" },
    { label: "Rode", imageUrl: "/assets/brands/rode.webp" },
  ],
  Webcam: [
    { label: "Logitech", imageUrl: "/assets/brands/logitech.webp" },
    { label: "Asus", imageUrl: "/assets/brands/Asus.webp" },
    { label: "Tapo", imageUrl: "/assets/brands/tapo.webp" },
    { label: "Dahua", imageUrl: "/assets/brands/dahua.webp" },
    { label: "Xiaomi", imageUrl: "/assets/brands/xiaomi.webp" },
  ]
}

export default function CategoryDetail() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || null;
  const filtersForCategory = FILTERS_BY_CATEGORY[category] || [];
  const [filterDropdown, setFilterDropdown] = useState("");
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts();
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (Object.keys(appliedFilters).length === 0) return;
      
      try {
        const filterAttributes = prepareFilterAttributes();
        const payload = {
          category,
          attributes: filterAttributes,
        };

        if (appliedFilters.Price && appliedFilters.Price.length > 0) {
          const priceRange = appliedFilters.Price[0].split('-');
          payload.min_price = parseInt(priceRange[0]);
          payload.max_price = parseInt(priceRange[1]);
        }

        const response = await axios.post(`${API}/api/v1/products/filters`, payload);
        
        const fetchedProducts = response.data.data || [];
        setOriginalProducts(fetchedProducts);
        
        const sortedProducts = applySorting(fetchedProducts, sort);
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setOriginalProducts([]);
      }
    };

    fetchProducts();
  }, [category, appliedFilters]);

  // Xử lý sắp xếp khi sort thay đổi
  useEffect(() => {
    const dataToSort = originalProducts.length > 0 ? originalProducts : products;
    const sortedProducts = applySorting([...dataToSort], sort);
    setProducts(sortedProducts);
  }, [sort, originalProducts]);

  // Hàm sắp xếp sản phẩm
  const applySorting = (productList, sortType) => {
    switch (sortType) {
      case "priceAsc":
        return productList.sort((a, b) => {
          const priceA = a.priceDiscount || a.price || 0;
          const priceB = b.priceDiscount || b.price || 0;
          return priceA - priceB;
        });
      case "priceDesc":
        return productList.sort((a, b) => {
          const priceA = a.priceDiscount || a.price || 0;
          const priceB = b.priceDiscount || b.price || 0;
          return priceB - priceA;
        });
      case "popular":
      default:
        // Sắp xếp theo độ phổ biến (có thể là rating, views, sales, etc.)
        return productList.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
    }
  };

  const prepareFilterAttributes = () => {
    const attributes = {};
    Object.entries(appliedFilters).forEach(([key, values]) => {
      if (key !== "Price") {  // Loại trừ Price vì đã xử lý riêng
        attributes[key] = values;
      }
    });
    return attributes;
  };

  async function fetchAllProducts() {
      try {
        const res = await axios.get(`${API}/api/v1/products/category`, {
          params: { category },
        });
        const fetchedProducts = res.data.data || [];
        setOriginalProducts(fetchedProducts); // Lưu dữ liệu gốc
        
        // Áp dụng sắp xếp cho lần đầu load
        const sortedProducts = applySorting(fetchedProducts, sort);
        setProducts(sortedProducts);
      } catch (e) {
        setProducts([]);
        setOriginalProducts([]);
      }
  }

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
        <div className="text-sm text-gray-500 mb-2">
          Home / {category}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-4">{category}</h1>

        {/* Brands */}
        {BRANDS[category] && BRANDS[category].length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Thương hiệu</h3>
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              {BRANDS[category].map((brand) => (
                <div 
                  key={brand.label}
                  className={`items-center border rounded-lg cursor-pointer transition-all duration-200 bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm`}
                  onClick={() => navigate(`/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand.label)}`)}
                >
                  <img
                    src={brand.imageUrl}
                    alt={brand.label}
                    className="w-28 h-12 object-contain"
                  />
                </div>
              ))}
            </div>
          </>
        )}

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

                  {filterDropdown === filter.key && filter.key === "Price" && (
                    <div className="absolute left-0 mt-2 z-20 bg-white border rounded shadow-lg min-w-[300px]">
                      <DualRangePriceSlider
                        minPrice={0}
                        maxPrice={50000000}
                        step={500000}
                        onPriceChange={(range, shouldClose = false) => {
                          setFilters((prev) => ({
                            ...prev,
                              Price: [`${range.min}-${range.max}`]
                          }));
                          
                          if (shouldClose) {
                            setFilterDropdown("");
                          }
                        }}
                      />
                    </div>
                  )}

                  {filterDropdown === filter.key && filter.key !== "Price" && FILTER_OPTIONS[filter.key] && (
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
                        onClick={() => {
                          setFilters({});
                          fetchAllProducts();
                        }}
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Sắp xếp theo</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setSort("popular")}
              className={`flex justify-center items-center gap-2 px-3 py-1 rounded-full border text-sm ${
                  sort === "popular"
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              Phổ biến
            </button>
            <button
              onClick={() => setSort("priceAsc")}
              className={`flex justify-center items-center gap-2 px-3 py-1 rounded-full border text-sm ${
                sort === "priceAsc"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
              </svg>
              Giá thấp - cao
            </button>
            <button
              onClick={() => setSort("priceDesc")}
              className={`flex justify-center items-center gap-2 px-3 py-1 rounded-full border text-sm ${
                sort === "priceDesc"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
              </svg>
              Giá cao - thấp
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}