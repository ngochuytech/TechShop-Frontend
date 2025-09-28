import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import ProductCard from '../components/MainContent/ProductCard';
import Footer from '../components/Footer/Footer';
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const ProductDetailPage = () => {
  const { id, category } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    fetchProductById(id);
    fetchSimilarProducts(id);
  }, [id]);

  const fetchProductById = async (productId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/v1/products/${productId}`);
      const productData = res.data.data || {};
      
      // Tự động chọn variant đầu tiên nếu có colors
      if (productData && productData.colors && productData.colors.length > 0) {
        const firstVariant = productData.colors[0];
        console.log("Auto-selecting first variant:", firstVariant);
        
        // Cập nhật product với variant đầu tiên được chọn
        const updatedProduct = {
          ...productData,
          selectedVariant: firstVariant,
          variantId: firstVariant.id,
          originalId: productData.id,
        };
        
        setProduct(updatedProduct);
        setSelectedColor(0);
        setSelectedImage(0);
      }
    } catch (e) {
      console.error("Error fetching product:", e);
      setProduct({});
    } finally {
      setLoading(false);
    }
  };

  // Hàm fetch sản phẩm tương tự
  const fetchSimilarProducts = async (productId) => {
    setLoadingSimilar(true);
    try {
      const res = await axios.get(`${API}/api/v1/products/${productId}/similar`);
      setSimilarProducts(res.data.data || []);
    } catch (e) {
      console.error("Error fetching similar products:", e);
      setSimilarProducts([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Hàm cập nhật product với thông tin variant được chọn
  const updateProductWithVariant = (variantIndex) => {
    setProduct(currentProduct => {
      if (!currentProduct.colors || !currentProduct.colors[variantIndex]) {
        console.log("No variant found at index:", variantIndex);
        return currentProduct;
      }
      
      const selectedVariant = currentProduct.colors[variantIndex];
      console.log("selectedVariant =", selectedVariant);
      
      // Cập nhật product với thông tin từ variant
      const updatedProduct = {
        ...currentProduct,
        selectedVariant: selectedVariant,
        variantId: selectedVariant.id, 
        originalId: currentProduct.originalId || currentProduct.id, // Lưu ID gốc của product
      };
      
      return updatedProduct;
    });
    
    setSelectedColor(variantIndex);
    setSelectedImage(0); // Reset về ảnh đầu tiên
  };



  useEffect(() => {
    console.log("product after fetch =", product);
    // Debug để xem cấu trúc dữ liệu
    if (product.selectedVariant) {
      console.log("selectedVariant =", product.selectedVariant);
    }
  }, [product]);

  const orderInfo = {
    address: "123 Đường ABC, Quận 1, TP.HCM",
    time: "Giao hàng trong 2-3 ngày",
    hotline: "1900 1234"
  };

  const checkScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    setAtStart(container.scrollLeft <= 2);
  };

  const scrollByCard = (dir = 1) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.querySelector('div[data-card]');
    if (!card) return;
    const scrollAmount = card.offsetWidth + 24;
    container.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const hideScrollbar = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-[46px]">
      {/* Header */}
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-2">
          <div className="text-sm text-gray-600">
            <span>Trang chủ</span> / <span>{category}</span> / <span className="text-gray-900">{product.name || ""}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Product Images & Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.configuration_summary && (
                <h3 className="text-base text-gray-500 mb-4">{product.configuration_summary}</h3>
              )}

              
              <div className="grid grid-rows-1 lg:grid-rows-4 gap-1">
                {/* Product Images */}
                <div className="lg:row-span-3 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg flex items-center justify-center p-4">
                    <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={product.images && product.images.length > 0 ? `${API}${product.images[selectedImage]}` : null}
                          alt={product.name}
                          className="max-w-full max-h-[500px] object-contain mx-auto"
                          loading="lazy"
                        />
                    </div>
                </div>
                {/* Thumbnail Images */}
                <div className="flex gap-2">
                  {product.images && product.images.length > 0 && (
                    product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={`${API}${image}`} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))
                  )}
                </div>

              </div>

              {/* Specifications */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                  <table className="w-full border border-gray-300 text-left rounded">
                      <colgroup>
                          <col className="w-1/3" />
                          <col className="w-2/3" /> 
                      </colgroup>
                      <tbody>
                          {Object.entries(product.attributes).map(([key, value], index) => (
                              <tr key={index}>
                                  <th className="px-4 py-2 border border-gray-300 bg-gray-100 text-gray-600 font-medium">{key}</th>
                                  <td className="px-4 py-2 border border-gray-300 text-gray-900">{value}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </div>
              )}


            </div>
          </div>

          {/* Right Column - Order Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="w-75 h-23 p-[2px] rounded-xl bg-[linear-gradient(to_top_right,#dbe8fe,#609afa)]">
                    <div className="w-full h-full rounded-xl bg-[linear-gradient(to_top_right,#fcfeff,#eff5ff)]">
                        <div className="h-full text-gray-700 p-3 ml-2">
                            Giá sản phẩm
                            <div className="flex gap-3">
                                <p className="text-2xl font-bold">
                                    {(() => {
                                      const variant = product.selectedVariant;
                                      
                                      if (variant && variant.price) {
                                        return (variant.price_discount && variant.price_discount > 0)
                                          ? variant.price_discount.toLocaleString('vi-VN')
                                          : variant.price.toLocaleString('vi-VN');
                                      }
                                      // Fallback nếu không có variant
                                      return 'Đang cập nhật...';
                                    })()}₫  
                                </p>
                                <p className="pt-2 text-gray-400 text-base line-through">
                                    {(() => {
                                      const variant = product.selectedVariant;
                                      if (variant && variant.price_discount && variant.price_discount > 0 && variant.price) {
                                        return variant.price.toLocaleString('vi-VN') + '₫';
                                      }
                                      return "";
                                    })()} 
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
                
                {product.colors && product.colors.length > 0 && (
                  <div className='mt-5'>
                      <h2 className='font-bold text-lg'>Màu sắc</h2>
                      <div className='grid grid-cols-3 gap-2 mt-2'>
                          {product.colors.map((color, index) => (
                          <button 
                              key={index}
                              onClick={() => {
                                updateProductWithVariant(index);
                              }}
                              disabled={loading}
                              className={`flex items-center gap-3 border-2 rounded-lg p-3 text-sm transition-colors ${
                              selectedColor === index 
                                  ? 'border-red-500 bg-red-50' 
                                  : 'border-gray-300 hover:border-blue-400'
                              } ${loading ? 'opacity-70 cursor-wait' : ''}`}
                          >
                              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                  src={`${API}` + color.image}
                                  alt={color.name}
                                  className="w-full h-full object-contain p-1"
                              />
                              </div>
                              <div className="flex-1 text-left">
                              <p className='font-medium text-gray-900 text-sm lg:text-base'>{color.name || 'Không rõ'}</p>
                              <p className='text-gray-600 text-base text-sm lg:text-base'>
                                  {(() => {
                                    const price = (color.price_discount && color.price_discount > 0) 
                                      ? color.price_discount 
                                      : color.price;
                                    return price ? price.toLocaleString('vi-VN') : '0';
                                  })()}₫
                              </p>
                              </div>
                              {selectedColor === index && (
                              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              )}
                              {loading && selectedColor === index && (
                                <svg className="animate-spin ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                          </button>
                          ))}
                      </div>
                  </div>
                )}


                <div className="mt-5 space-y-4">
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <h2 className='font-bold text-lg'>Các cấu hình khác</h2>
                        <div className='grid grid-cols-3 lg:grid-cols-4 gap-2 mt-2'>
                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                              128GB - Bạc
                            </button>
                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                                256GB - Vàng
                            </button>
                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                                512GB - Xanh Dương
                            </button>

                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                            128GB - Bạc
                            </button>
                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                                256GB - Vàng
                            </button>
                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                                512GB - Xanh Dương
                            </button>

                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                            128GB - Bạc
                            </button>
                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                                256GB - Vàng
                            </button>
                            <button className="border border-gray-300 rounded-lg p-2 text-sm hover:border-red-500 transition-colors">
                                512GB - Xanh Dương
                            </button>

                        </div>
                    </div>

                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        
                        <div className='flex font-bold text-lg gap-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                            Thông tin vận chuyển
                        </div>
                        <div className="flex mt-2 text-blue-600 text-sm gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            <p>Địa chỉ: {orderInfo.address} </p>
                        </div>
                    </div>

                    {product.promotion && product.promotion.trim() !== "" && (
                      <div className="border border-blue-300 rounded-lg p-4 bg-gray-50">
                          <div className='flex font-bold text-lg gap-2'>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                              </svg>
                              Khuyến mãi hấp dẫn
                          </div>
                          <div className="flex mt-2 text-blue-600 text-sm gap-2 ml-1">
                              <ul className="space-y-2 list-disc pl-4">
                                  {product.promotion.split('\n').map((feature, index) => (
                                  <li key={index} className="text-justify">
                                      {feature.trim()}
                                  </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                    )}


                    <div className='grid grid-cols-2 gap-4'>
                        <button 
                          className='text-white bg-red-600 hover:bg-red-700 transition-colors font-semibold py-3 rounded-lg'
                          onClick={() => {
                            // Khi mua ngay, sử dụng variantId nếu có variant được chọn
                            const productIdToOrder = product.variantId || product.id;
                            console.log("Mua ngay - Product ID:", productIdToOrder);
                            console.log("Selected variant:", product.selectedVariant);
                            // TODO: Implement order logic here
                          }}
                        >
                            Mua ngay
                        </button>
                        <button 
                          className='flex justify-center text-red-600 border border-red-600 hover:bg-red-50 transition-colors font-semibold py-3 rounded-lg'
                          onClick={() => {
                            // Khi thêm vào giỏ hàng, sử dụng variantId nếu có variant được chọn
                            const productIdToCart = product.variantId || product.id;
                            console.log("Thêm vào giỏ hàng - Product ID:", productIdToCart);
                            console.log("Selected variant:", product.selectedVariant);
                            // TODO: Implement add to cart logic here
                          }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>

                            Thêm vào giỏ hàng
                        </button>

                    </div>

                </div>
            </div>
          </div>
        </div>
      </div>

      {similarProducts && similarProducts.length > 0 && (
        <div className="space-y-8 container mx-auto px-4 pb-8">
            {/* Similar Products */}
            <div className="relative mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Có thể bạn cũng thích</h2>
                {loadingSimilar ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-2 pr-10" style={{
                    ...hideScrollbar,
                    overflowX: 'auto',
                  }}>
                    {similarProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
                {/* Nút mũi tên phải */}
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 border border-blue-200 shadow rounded-full w-10 h-10 flex items-center justify-center text-blue-500 text-xl transition-all"
                  style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                  disabled={loadingSimilar}
                >
                  <span>&rarr;</span>
                </button>
                {/* Nút mũi tên trái */}
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 border border-blue-200 shadow rounded-full w-10 h-10 flex items-center justify-center text-blue-500 text-xl transition-all ${atStart ? 'opacity-30 pointer-events-none' : 'hover:bg-blue-100'}`}
                  disabled={loadingSimilar}
                >
                  <span>&larr;</span>
                </button>
            </div>
        </div>
      )}
      

      <div className="space-y-8 container mx-auto px-4 pb-8">
        {/* Reviews Section */}
        <div className="bg-gray-100 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh giá {product.name}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 bg-white p-6 rounded-lg">
            {/* Left Side - Overall Rating */}
            <div className="lg:col-span-2 space-y-4 flex flex-col justify-center items-center text-center border-r border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-gray-900">5.0</div>
                <div className="text-2xl text-gray-400">/5</div>
              </div>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              
              <div className="text-gray-600">5 lượt đánh giá</div>
              
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Viết đánh giá
              </button>
            </div>
            
            {/* Middle Side - Rating Distribution */}
            <div className="lg:col-span-3 mt-2 border-r border-gray-200">
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 w-4">{rating}</span>
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div 
                        className={`h-full rounded-full ${rating === 5 ? 'bg-red-600' : 'bg-gray-200'}`}
                        style={{ width: rating === 5 ? '100%' : '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-20">
                      {rating === 5 ? '5 đánh giá' : '0 đánh giá'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Rating Breakdown */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="font-semibold text-gray-900">Đánh giá theo trải nghiệm</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 min-w-[100px]">Hiệu năng</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">5/5 (4 đánh giá)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 min-w-[100px]">Thời lượng pin</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">5/5 (4 đánh giá)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 min-w-[100px]">Chất lượng camera</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    {[1, 2, 3, 4].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                    <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="text-gray-600 text-sm">4.8/5 (4 đánh giá)</span>
                </div>
              </div>
            </div>

            
          </div>

          {/* User reviews */}
          <div className='rounded-lg bg-white p-6 mt-6'>
            {/* Filter buttons */}
            <div className="flex gap-2 mb-6">
              <h2 className='self-center font-bold text-xl mr-2'>Lọc đánh giá theo</h2>
              <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                Tất cả
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
                Có hình ảnh
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
                Đã mua hàng
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
                5 sao
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
                4 sao
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
                3 sao
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
                2 sao
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
                1 sao
              </button>
            </div>

            {/* Review items */}
            <div className="space-y-6">
              {/* Review 1 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">TRAN QUOC TUAN ANH</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded">Tuyệt vời</span>
                    </div>
                    
                    <div className="flex gap-4 mb-3">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Hiệu năng Siêu mạnh mẽ
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Thời lượng pin Cực khủng
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Chất lượng camera Chụp đẹp, chuyên nghiệp
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      Huy giúp đơn này ạ
                    </p>
                    
                    <p className="text-gray-500 text-sm">
                      ⏰ Đánh giá đã đăng vào 4 tháng trước
                    </p>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">ANH TIẾN</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded">Tuyệt vời</span>
                    </div>
                    
                    <div className="flex gap-4 mb-3">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Hiệu năng Siêu mạnh mẽ
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Thời lượng pin Cực khủng
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Chất lượng camera Chụp đẹp, chuyên nghiệp
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-1">
                      Cho mình hỏi bên mình nhận giao hàng ở ngoại tỉnh ko
                    </p>
                    <p className="text-gray-700 mb-3">
                      Và hình thức giao hàng như thế nào đợi trả hàng ra sao
                    </p>
                    
                    <p className="text-gray-500 text-sm">
                      ⏰ Đánh giá đã đăng vào 4 tháng trước
                    </p>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    H
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Hoàng Vĩnh</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded">Tuyệt vời</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-600 text-sm">✓ Đã mua tại CellphoneS</span>
                    </div>
                    
                    <div className="flex gap-4 mb-3">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Hiệu năng Siêu mạnh mẽ
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Thời lượng pin Cực khủng
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Chất lượng camera Chụp đẹp
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      Tốt hơn kì vọng
                    </p>
                    
                    <p className="text-gray-500 text-sm">
                      ⏰ Đánh giá đã đăng vào 7 tháng trước
                    </p>
                  </div>
                </div>
              </div>

              {/* Review 4 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    K
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Kieu Phan</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded">Tuyệt vời</span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      Tư vấn nhiệt tình
                    </p>
                    
                    <p className="text-gray-500 text-sm">
                      ⏰ Đánh giá đã đăng vào 7 tháng trước
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;