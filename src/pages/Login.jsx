import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", formData);
      login(data);
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "barber") {
        navigate("/barber/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="bg-card border border-brand rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-brand text-center mb-2">Welcome Back</h2>
        <p className="text-muted text-center text-sm mb-6">Login to your BarberPro account</p>

        {error && (
          <div className="bg-red-500 text-white text-sm px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email" name="email" placeholder="Email Address"
            value={formData.email} onChange={handleChange} required
            className="bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand"
          />
          <input
            type="password" name="password" placeholder="Password"
            value={formData.password} onChange={handleChange} required
            className="bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand"
          />
          <button
            type="submit" disabled={loading}
            className="bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          New here?{" "}
          <Link to="/register" className="text-brand hover:underline">Create an account</Link>
        </p>
        <p className="text-subtle text-xs text-center mt-2">
          <Link to="/" className="hover:text-brand">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
