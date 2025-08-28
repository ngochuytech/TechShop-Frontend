import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const REDIRECT_URI = import.meta.env.VITE_OAUTH2_REDIRECT_URI;

export default function OAuth2Callback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const code = params.get("code");

  useEffect(() => {
    const fetchGoogleUser = async () => {
      try {
        const res = await axios.post(`${API}/api/v1/users/auth/social/callback`, {
          code: code,
          redirectUri: `${window.location.origin}${REDIRECT_URI}`
        });

        // Backend trả về { user, token }
        const { username, token } = res.data.data;

        if (token) sessionStorage.setItem("accessToken", token);
        if (username) sessionStorage.setItem("username", username);
        

        navigate("/home", { replace: true });
      } catch (err) {
        console.error("Google login error:", err.response?.data || err.message);
        navigate("/", { replace: true });
      }
    };

    if (code) {
      fetchGoogleUser();
    }
  }, [params, code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">Đang xử lý đăng nhập Google...</p>
    </div>
  );
}
