import { BrowserRouter } from "react-router-dom";
import { useNavigate, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from 'react';
import { setNavigate } from './api';
import AuthPage from './pages/AuthPage.jsx'
import OAuth2Callback from './pages/OAuth2Callback.jsx'
import HomePage from './pages/HomePage.jsx';
import CategoryDetail from './pages/CategoryPage.jsx';
import CategoryBrand from './pages/CategoryBrandPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import ProductEditPage from './pages/ProductEditPage.jsx';

// Component wrapper để sử dụng useNavigate
function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set navigate function vào api interceptor
    setNavigate(navigate);
  }, [navigate]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={7000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />

        <Route path="/home" element={<HomePage />} />
        <Route path="/category" element={<CategoryDetail />} />
        <Route path="/category/:category/brand/:brand" element={<CategoryBrand />} />

        <Route path="/category/:category/product/:id" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products/edit/:productId" element={<ProductEditPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
