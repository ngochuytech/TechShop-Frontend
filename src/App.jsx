import { BrowserRouter } from "react-router-dom";
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthPage from './pages/AuthPage.jsx'
import OAuth2Callback from './pages/OAuth2Callback.jsx'
import HomePage from './pages/HomePage.jsx';
import CategoryDetail from './pages/CategoryPage.jsx';
import CategoryBrand from './pages/CategoryBrandPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {

  return (
    <BrowserRouter>
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
        
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
