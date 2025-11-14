import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import ProductCard from "../components/MainContent/ProductCard";
import DualRangePriceSlider from "../components/DualRangePriceSlider";
import axios from "axios";
import Footer from "../components/Footer/Footer";

const API = import.meta.env.VITE_API_URL;

export default function CategoryDetail() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || null;
  const [filterDropdown, setFilterDropdown] = useState("");
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts(0);
    fetchBrandsByCategory();
  }, [category, pageSize]);

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
        // Sắp xếp theo độ phổ biến
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
      if (key !== "Price") {
        attributes[key] = values;
      }
    });
    return attributes;
  };

  async function fetchAllProducts(page = 0) {
    try {
      const res = await axios.get(`${API}/api/v1/products/category`, {
        params: { 
          category,
          page: page,
          size: pageSize,
          sortBy: 'createdAt',
          sortDir: 'desc'
        },
      });
      const data = res.data.data;
      const fetchedProducts = data?.content || [];
      setOriginalProducts(fetchedProducts);
      setCurrentPage(page);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);

      const sortedProducts = applySorting(fetchedProducts, sort);
      setProducts(sortedProducts);
    } catch (e) {
      setProducts([]);
      setOriginalProducts([]);
    }
  }

  async function fetchBrandsByCategory() {
    if (!category) return;

    try {
      const res = await axios.get(`${API}/api/v1/brands/by-category`, {
        params: { category },
      });
      const fetchedBrands = res.data.data || [];
      setBrands(fetchedBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  }


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
        {brands && brands.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Thương hiệu</h3>
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`items-center border rounded-lg cursor-pointer transition-all duration-200 bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm`}
                  onClick={() => navigate(`/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand.name)}`)}
                >
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-28 h-12 object-contain p-2"
                    />
                  ) : (
                    <div className="w-28 h-12 flex items-center justify-center p-2">
                      <span className="text-sm font-semibold text-gray-700">{brand.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Filter Giá */}
        <div className="mb-6">
          <label className="block text-xl font-bold mb-3">Lọc theo giá</label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <button
                className="w-full px-4 py-2 rounded-full border text-sm bg-white hover:bg-gray-100 flex items-center gap-1 text-left"
                onClick={() => {
                  setFilterDropdown(filterDropdown === "Price" ? "" : "Price");
                }}
              >
                ₫ {filters.Price && filters.Price.length > 0 ? filters.Price[0] : "Chọn khoảng giá"}
              </button>

              {filterDropdown === "Price" && (
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
            </div>

            {/* Nút áp dụng filter giá */}
            {filters.Price && filters.Price.length > 0 && (
              <>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700"
                  onClick={() => setAppliedFilters(filters)}
                >
                  Áp dụng
                </button>
                <button
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                  onClick={() => {
                    setFilters({});
                    setAppliedFilters({});
                    fetchAllProducts();
                  }}
                >
                  Xóa
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sắp xếp theo */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Sắp xếp theo</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setSort("popular")}
              className={`flex justify-center items-center gap-2 px-3 py-1 rounded-full border text-sm ${sort === "popular"
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
              className={`flex justify-center items-center gap-2 px-3 py-1 rounded-full border text-sm ${sort === "priceAsc"
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
              className={`flex justify-center items-center gap-2 px-3 py-1 rounded-full border text-sm ${sort === "priceDesc"
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
            <ProductCard key={product._id || product.id} product={product} category={category} />
          ))}
        </div>

        {/* Pagination */}
        {products.length > 0 && (
          <div className="mt-8 flex flex-col gap-3">
            {/* Page info */}
            <div className="text-center text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages > 0 ? totalPages : 1}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => fetchAllProducts(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>

              <div className="flex gap-1 flex-wrap">
                {totalPages > 0 && [...Array(totalPages)].map((_, index) => {
                  if (
                    index === 0 ||
                    index === totalPages - 1 ||
                    (index >= currentPage - 1 && index <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => fetchAllProducts(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === index
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {index + 1}
                      </button>
                    );
                  } else if (index === currentPage - 2 || index === currentPage + 2) {
                    return <span key={index} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => fetchAllProducts(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>

            {/* Page size selector */}
            <div className="flex justify-center items-center gap-2 text-sm">
              <span className="text-gray-600">Số item mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="px-3 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}