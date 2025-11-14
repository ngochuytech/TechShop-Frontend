import { useState } from "react";
import axios from "axios";
import { ACCESS_TOKEN } from "../../constants";
const API = import.meta.env.VITE_API_URL;

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/v1/users/login`, {
        email: form.email,
        password: form.password
      }, {
        withCredentials: true
      });

      const result = res.data; 
      if (!result.success) {
        throw new Error(result.error || "Đăng nhập thất bại");
      }
      const data = result.data;

      if (data.token) {
        sessionStorage.setItem(ACCESS_TOKEN, data.token);
      }
      if (data.id) {
        sessionStorage.setItem("userId", data.id);
      }
      if (data.username) {
        sessionStorage.setItem("username", data.username);
      }

      window.location.href = "/home";
    } catch (e) {
      console.error("Login error:", e);
      setErr(e.response.data.error || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium">Mật khẩu</label>
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Quên mật khẩu?
          </a>
        </div>
        <input
          type="password"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
