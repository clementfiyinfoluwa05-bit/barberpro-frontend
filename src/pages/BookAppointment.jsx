import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const COVERED_AREAS = ["Ogba", "Ikeja", "Agege", "Ijaiye"];

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
    area: "",
    address: "",
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

  const isOutsideCoveredArea = formData.area && !COVERED_AREAS.includes(formData.area);
  const selectedService = services.find(s => s._id === formData.serviceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const notes = "Area: " + formData.area + " | Address: " + formData.address + (formData.notes ? " | Notes: " + formData.notes : "") + (isOutsideCoveredArea ? " | OUTSIDE COVERAGE AREA - transport fee TBC" : "");
      await API.post("/appointments", {
        serviceId: formData.serviceId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

  const formatPrice = (service) => {
    if (!service) return "";
    if (service.priceType === "from") return "From NGN " + service.price.toLocaleString();
    return "NGN " + service.price.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-page text-ink">
      <nav className="flex justify-between items-center px-6 py-5 border-b border-brand">
        <h1 className="text-brand text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>
        <button onClick={() => navigate("/dashboard")} className="text-muted hover:text-brand text-sm transition">Back to Dashboard</button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-1">Book <span className="text-brand">Appointment</span></h2>
        <p className="text-muted mb-6 text-sm">We come to you — fill in your details below</p>

        {success && (
          <div className="bg-green-500 text-white px-4 py-3 rounded mb-6 text-center font-bold">
            Booking submitted! We will confirm your appointment shortly. Redirecting...
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm text-muted mb-1 block">Select Service</label>
            <select name="serviceId" value={formData.serviceId} onChange={handleChange} required className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand">
              <option value="">-- Choose a service --</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.serviceName} — {s.priceType === "from" ? "From " : ""}NGN {s.price.toLocaleString()}
                </option>
              ))}
            </select>
            {selectedService && selectedService.priceType === "from" && (
              <p className="text-brand text-xs mt-1">Starting from NGN {selectedService.price.toLocaleString()}. Final price confirmed before appointment.</p>
            )}
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Select Date</label>
            <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand" />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Select Time</label>
            <select name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand">
              <option value="">-- Choose a time --</option>
              {timeSlots.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Select Your Area</label>
            <select name="area" value={formData.area} onChange={handleChange} required className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand">
              <option value="">-- Select your area --</option>
              <option value="Ogba">Ogba</option>
              <option value="Ikeja">Ikeja</option>
              <option value="Agege">Agege</option>
              <option value="Ijaiye">Ijaiye</option>
              <option value="Other">Other (outside coverage area)</option>
            </select>
            {isOutsideCoveredArea && (
              <div className="mt-2 bg-card border border-brand rounded p-3 text-xs text-brand">
                Your location is outside our main coverage area. An additional transportation fee may apply. We will contact you to confirm the total cost before accepting your booking.
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Full Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="e.g. 12 Balogun Street, Ogba" className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand" />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Additional Notes (optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any special requests or additional information..." rows={3} className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand resize-none" />
          </div>

          {selectedService && formData.area && (
            <div className="bg-card border border-line rounded-lg p-4 text-sm">
              <p className="text-brand font-bold mb-2">Booking Summary</p>
              <p className="text-ink">{selectedService.serviceName}</p>
              <p className="text-muted">{formatPrice(selectedService)}</p>
              <p className="text-muted">{formData.area}{formData.address && " — " + formData.address}</p>
              {isOutsideCoveredArea && <p className="text-brand text-xs mt-2">+ Transport fee TBC</p>}
            </div>
          )}

          <button type="submit" disabled={loading || success} className="bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-300 transition disabled:opacity-50">
            {loading ? "Submitting..." : "Confirm Booking"}
          </button>
        </form>
      </div>

      <a href="https://wa.me/2349132490766" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-full font-bold shadow-lg hover:bg-green-400 transition z-50 flex items-center gap-2">
        WhatsApp
      </a>
    </div>
  );
}