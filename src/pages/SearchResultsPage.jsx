import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ProductCard from '../components/MainContent/ProductCard';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortDescription, setSortDescription] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('');

  useEffect(() => {
    if (query) {
      searchProducts(query, currentPage, sortBy, sortDir);
    }
  }, [query, currentPage, sortBy, sortDir]);

  const searchProducts = async (searchQuery, page = 0, sortByParam = '', sortDirParam = '') => {
    setLoading(true);
    try {
      let url = `${API}/api/v1/products/search/${encodeURIComponent(searchQuery)}?page=${page}`;
      if (sortByParam) {
        url += `&sortBy=${sortByParam}`;
      }
      if(sortDirParam) {
        url += `&sortDir=${sortDirParam}`;
      }
      const res = await axios.get(url);

      const data = res.data.data;
      
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    let result = e.target.value.split(',');
    setSortBy(result[0] || '');
    setSortDir(result[1] || '');
    setCurrentPage(0);
    setSortDescription(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-gray-600">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/home')}>
              Trang chủ
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Kết quả tìm kiếm</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm cho "{query}"
          </h1>
          <p className="text-gray-600">
            Tìm thấy {totalElements} sản phẩm
          </p>
        </div>

        {/* Sort and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
            <select
              value={sortDescription}
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Mặc định</option>
              <option value="price,asc">Giá: Thấp đến cao</option>
              <option value="price,desc">Giá: Cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Không tìm thấy sản phẩm nào
            </h3>
            <p className="mt-2 text-gray-600">
              Thử tìm kiếm với từ khóa khác hoặc duyệt qua danh mục sản phẩm
            </p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  // Hiển thị trang đầu, trang cuối, và 2 trang xung quanh trang hiện tại
                  if (
                    index === 0 ||
                    index === totalPages - 1 ||
                    (index >= currentPage - 1 && index <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === index
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  } else if (
                    index === currentPage - 2 ||
                    index === currentPage + 2
                  ) {
                    return <span key={index} className="px-2">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
