import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Spinner from "../components/Spinner";

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await API.get("/services");
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (service) => {
    if (service.priceType === "from") return "From NGN " + service.price.toLocaleString();
    return "NGN " + service.price.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-page text-ink">
      <nav className="flex justify-between items-center px-6 py-5 border-b border-brand">
        <h1 className="text-brand text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>
        <div className="flex gap-4">
          <button onClick={() => navigate("/")} className="text-muted hover:text-brand text-sm transition">Home</button>
          {user ? (
            <button onClick={() => navigate("/dashboard")} className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm hover:bg-yellow-300 transition">Dashboard</button>
          ) : (
            <button onClick={() => navigate("/login")} className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm hover:bg-yellow-300 transition">Login</button>
          )}
        </div>
      </nav>

      <div className="bg-yellow-400 text-black text-center py-3 px-4">
        <p className="font-bold text-sm">HOME SERVICE ONLY - We come to you in Ogba, Ikeja, Agege and Ijaiye</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-2">Our <span className="text-brand">Services</span></h2>
        <p className="text-muted text-center mb-4">Professional grooming delivered to your doorstep</p>

        <div className="bg-card border border-brand rounded-lg p-4 mb-10 text-sm text-ink-2 text-center">
          <p>Home service is included in listed prices for <span className="text-brand font-bold">Ogba | Ikeja | Agege | Ijaiye</span>.</p>
          <p className="mt-1">For locations outside these areas, an additional transport fee may apply and will be confirmed before booking is accepted.</p>
        </div>

        {loading ? <Spinner /> : services.length === 0 ? (
          <p className="text-center text-muted">No services available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service._id} className="bg-card border border-line hover:border-brand rounded-lg overflow-hidden transition group">
                <div style={{ backgroundImage: `url(${service.image})`, backgroundSize: "cover", backgroundPosition: "center", height: "180px", backgroundColor: "#27272a" }} />
                <div className="p-4">
                  <h3 className="text-base font-bold text-ink group-hover:text-brand transition mb-1">{service.serviceName}</h3>
                  <p className="text-muted text-xs mb-3 leading-relaxed">{service.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-brand font-bold text-sm">{formatPrice(service)}</span>
                    <span className="text-subtle text-xs">{service.duration} mins</span>
                  </div>
                  <button
                    onClick={() => user ? navigate("/book", { state: { service } }) : navigate("/login")}
                    className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition text-sm"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-card border border-line rounded-lg p-5 text-sm text-muted">
          <p className="text-brand font-bold mb-2">Important Pricing Note</p>
          <p>Services marked <span className="text-brand">"From"</span> display the starting price. The final price may vary based on hair length, thickness, style and service requirements. Final price will be confirmed before your appointment begins.</p>
        </div>
      </div>

      <a href="https://wa.me/2349132490766" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-full font-bold shadow-lg hover:bg-green-400 transition z-50 flex items-center gap-2">
        WhatsApp
      </a>
    </div>
  );
}