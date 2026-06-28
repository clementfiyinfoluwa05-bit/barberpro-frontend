import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedService = location.state?.service;

  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: preSelectedService?._id || "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await API.get("/services");
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/appointments", formData);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-5 border-b border-yellow-400">
        <h1 className="text-yellow-400 text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-yellow-400 text-sm transition">Back to Dashboard</button>
      </nav>

      <div className="max-w-lg mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">Book <span className="text-yellow-400">Appointment</span></h2>
        <p className="text-gray-400 mb-8">Fill in the details below to schedule your visit</p>

        {success && (
          <div className="bg-green-500 text-white px-4 py-3 rounded mb-6 text-center font-bold">
            Booking successful! Redirecting to dashboard...
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Select Service</label>
            <select
              name="serviceId" value={formData.serviceId} onChange={handleChange} required
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:border-yellow-400"
            >
              <option value="">-- Choose a service --</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>{s.serviceName} - NGN {s.price.toLocaleString()}+</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Select Date</label>
            <input
              type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Select Time</label>
            <select
              name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:border-yellow-400"
            >
              <option value="">-- Choose a time --</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Additional Notes (optional)</label>
            <textarea
              name="notes" value={formData.notes} onChange={handleChange}
              placeholder="Any special requests or notes..."
              rows={3}
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:border-yellow-400 resize-none"
            />
          </div>

          <button
            type="submit" disabled={loading || success}
            className="bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
