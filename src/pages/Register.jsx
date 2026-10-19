import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="bg-card border border-brand rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-brand text-center mb-2">Create Account</h2>
        <p className="text-muted text-center text-sm mb-6">Join Tech Barber Queen today</p>

        {error && (
          <div className="bg-red-500 text-white text-sm px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text" name="fullName" placeholder="Full Name"
            value={formData.fullName} onChange={handleChange} required
            className="bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand"
          />
          <input
            type="email" name="email" placeholder="Email Address"
            value={formData.email} onChange={handleChange} required
            className="bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand"
          />
          <input
            type="tel" name="phone" placeholder="Phone Number"
            value={formData.phone} onChange={handleChange} required
            className="bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand"
          />
          <input
            type="password" name="password" placeholder="Password"
            value={formData.password} onChange={handleChange} required
            className="bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand"
          />
          <input
            type="password" name="confirmPassword" placeholder="Confirm Password"
            value={formData.confirmPassword} onChange={handleChange} required
            className="bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand"
          />
          <button
            type="submit" disabled={loading}
            className="bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand hover:underline">Login here</Link>
        </p>
        <p className="text-subtle text-xs text-center mt-2">
          <Link to="/" className="hover:text-brand">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
