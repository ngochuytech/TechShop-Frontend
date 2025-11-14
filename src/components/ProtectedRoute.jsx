import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const API = import.meta.env.VITE_API_URL;

export default function ProtectedRoute({ children, requiredRole = 'ADMIN' }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await api.get(`${API}/api/v1/users/profile`);
        const user = response.data?.data;
        
        if (user && user.role === requiredRole.toUpperCase()) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast.error('Bạn không có quyền truy cập trang này!');
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
        toast.error('Không thể xác minh quyền truy cập!');
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
