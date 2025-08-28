import axios from "axios";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    window.location.href = `${API}/api/v1/users/auth/social-login`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 disabled:opacity-60"
    >
      <img src="https://www.google.com/favicon.ico" alt="g" className="w-5 h-5" />
      <span className="text-sm font-medium">
        {loading ? "Đang chuyển hướng..." : "Đăng nhập với Google"}
      </span>
    </button>
  );
}