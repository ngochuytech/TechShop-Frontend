import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../sections/auth/LoginForm.jsx";
import RegisterForm from "../sections/auth/RegisterForm.jsx";
import GoogleLoginButton from "../sections/auth/GoogleLoginButton.jsx";

export default function AuthPage() {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLogin(true);
    }
  }, [location.state]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 relative">
        <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
          <button
            className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-150 ${
              showLogin ? "bg-gradient-to-r from-blue-500 to-pink-400 text-white shadow" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setShowLogin(true)}
          >
            Đăng nhập
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all duration-150 ${
              !showLogin ? "bg-gradient-to-r from-blue-500 to-pink-400 text-white shadow" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setShowLogin(false)}
          >
            Đăng ký
          </button>
        </div>

        {showLogin ? <LoginForm /> : <RegisterForm />}

        {/* Or separator */}
        <div className="flex items-center gap-4 my-8">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">Hoặc</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <GoogleLoginButton />
      </div>
    </div>
  );
}
