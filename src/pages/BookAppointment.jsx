import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

// We cover all of Lagos. Prices can differ by area; the final price is confirmed before the appointment.
const LAGOS_AREAS = {
  Mainland: ["Agege", "Alimosho", "Apapa", "Egbeda", "Festac", "Gbagada", "Ijaiye", "Ikeja", "Ikorodu", "Ikotun", "Ilupeju", "Isolo", "Ketu", "Magodo", "Maryland", "Mushin", "Ogba", "Ojo", "Ojota", "Oshodi", "Surulere", "Yaba"],
  Island: ["Ajah", "Epe", "Ikoyi", "Lagos Island", "Lekki", "Sangotedo", "Victoria Island"],
};
const OTHER_LAGOS = "Other area in Lagos";
const OUTSIDE_LAGOS = "Outside Lagos";
const TIME_SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

// Today's date in the visitor's own timezone, as YYYY-MM-DD.
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// "9:00 AM" -> minutes since midnight
const toMinutes = (t) => {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
};

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
  const [slots, setSlots] = useState(null); // [{ time, available }] for the chosen date + service
  const [checkingSlots, setCheckingSlots] = useState(false);

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

  // Load which times are already taken whenever the date or service changes.
  const loadSlots = useCallback(async (date, serviceId) => {
    if (!date) return setSlots(null);
    setCheckingSlots(true);
    try {
      const { data } = await API.get("/appointments/availability", { params: { date, serviceId: serviceId || undefined } });
      setSlots(data.slots);
    } catch {
      setSlots(null); // if this fails, the server still blocks double-bookings when submitting
    } finally {
      setCheckingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadSlots(formData.appointmentDate, formData.serviceId);
  }, [formData.appointmentDate, formData.serviceId, loadSlots]);

  const today = localToday();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const slotState = (time) => {
    if (formData.appointmentDate === today && toMinutes(time) <= nowMinutes) return "passed";
    const slot = slots?.find((x) => x.time === time);
    return slot && !slot.available ? "booked" : "free";
  };

  // If the chosen time stops being free (e.g. date changed), clear it.
  useEffect(() => {
    if (formData.appointmentTime && slotState(formData.appointmentTime) !== "free") {
      setFormData((f) => ({ ...f, appointmentTime: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, formData.appointmentDate]);

  const freeCount = formData.appointmentDate ? TIME_SLOTS.filter((t) => slotState(t) === "free").length : null;
  const isOutsideCoveredArea = formData.area === OUTSIDE_LAGOS;
  const selectedService = services.find(s => s._id === formData.serviceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const notes = "Area: " + formData.area + " | Address: " + formData.address + (formData.notes ? " | Notes: " + formData.notes : "") + (isOutsideCoveredArea ? " | OUTSIDE LAGOS - travel fee TBC" : "");
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
      if (err.response?.status === 409) {
        // Someone else just took this time: refresh the list so they can pick another.
        setFormData((f) => ({ ...f, appointmentTime: "" }));
        loadSlots(formData.appointmentDate, formData.serviceId);
      }
    } finally {
      setLoading(false);
    }
  };

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
            <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required min={today} className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand" />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Select Time</label>
            <select name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required disabled={!formData.appointmentDate} className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand disabled:opacity-60">
              <option value="">{formData.appointmentDate ? (checkingSlots ? "Checking free times..." : "-- Choose a time --") : "-- Pick a date first --"}</option>
              {TIME_SLOTS.map((t) => {
                const state = slotState(t);
                return (
                  <option key={t} value={t} disabled={state !== "free"}>
                    {t}{state === "booked" ? " — booked" : state === "passed" ? " — passed" : ""}
                  </option>
                );
              })}
            </select>
            {freeCount === 0 && !checkingSlots && (
              <p className="text-red-400 text-xs mt-1">No free times left on this date. Please pick another day.</p>
            )}
            {freeCount > 0 && slots?.some((x) => !x.available) && (
              <p className="text-muted text-xs mt-1">Times marked "booked" are already taken.</p>
            )}
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Select Your Area</label>
            <select name="area" value={formData.area} onChange={handleChange} required className="w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand">
              <option value="">-- Select your area --</option>
              {Object.entries(LAGOS_AREAS).map(([group, areas]) => (
                <optgroup key={group} label={`Lagos ${group}`}>
                  {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                </optgroup>
              ))}
              <optgroup label="Other">
                <option value={OTHER_LAGOS}>{OTHER_LAGOS}</option>
                <option value={OUTSIDE_LAGOS}>{OUTSIDE_LAGOS}</option>
              </optgroup>
            </select>
            {formData.area && !isOutsideCoveredArea && (
              <p className="mt-2 text-xs text-muted">We cover all of Lagos. Prices can vary by area — we'll confirm your final price before your appointment.</p>
            )}
            {isOutsideCoveredArea && (
              <div className="mt-2 bg-card border border-brand rounded p-3 text-xs text-brand">
                You're outside Lagos. A travel fee will apply. We will contact you to confirm the total cost before accepting your booking.
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
              {formData.appointmentDate && formData.appointmentTime && <p className="text-muted">{formData.appointmentDate} at {formData.appointmentTime}</p>}
              <p className="text-brand text-xs mt-2">{isOutsideCoveredArea ? "+ Travel fee TBC" : "Final price for your area confirmed before your appointment"}</p>
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