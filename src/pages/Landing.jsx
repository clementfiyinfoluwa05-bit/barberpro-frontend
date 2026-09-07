import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get("/services")
      .then(({ data }) => setServices(data.slice(0, 8)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">

      <nav className="flex justify-between items-center px-6 py-5 border-b border-yellow-400 relative">
        <h1 className="text-yellow-400 text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>
        <div className="hidden md:flex gap-6 text-sm font-medium items-center">
          <a href="#services" className="hover:text-yellow-400 transition">Services</a>
          <Link to="/services" className="hover:text-yellow-400 transition">Book Now</Link>
          <Link to="/login" className="hover:text-yellow-400 transition">Login</Link>
          <a href="https://www.instagram.com/techbarberqueen.ng" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 transition">Instagram</a>
        </div>
        <button className="md:hidden text-yellow-400 text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "X" : "="}
        </button>
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-black border-b border-yellow-400 flex flex-col items-center gap-4 py-6 z-50 md:hidden">
            <a href="#services" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Services</a>
            <Link to="/services" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Book Now</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Login</Link>
            <a href="https://www.instagram.com/techbarberqueen.ng" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 transition">Instagram</a>
          </div>
        )}
      </nav>

      <div className="bg-yellow-400 text-black text-center py-3 px-4">
        <p className="font-bold text-sm">HOME SERVICE ONLY - We come to you in Ogba, Ikeja, Agege and Ijaiye</p>
      </div>

      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Premium Grooming <span className="text-yellow-400">At Your Door</span>
        </h2>
        <p className="text-gray-400 text-base md:text-lg mb-3 max-w-xl">
          Professional mobile barber and grooming services in Ogba, Ikeja, Agege and Ijaiye
        </p>
        <p className="text-yellow-400 text-sm mb-8 font-medium">No shop. No travel. We come to you.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="bg-yellow-400 text-black px-6 py-3 rounded font-bold hover:bg-yellow-300 transition">
            Book Appointment
          </Link>
          <Link to="/services" className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded font-bold hover:bg-yellow-400 hover:text-black transition">
            View Services
          </Link>
        </div>
      </section>

      <section id="services" className="py-16 px-6 bg-zinc-900">
        <h3 className="text-center text-3xl font-bold text-yellow-400 mb-4">Our Services</h3>
        <p className="text-center text-gray-400 text-sm mb-10">All services include home visit within our coverage areas</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {services.map((service) => (
            <Link to="/services" key={service._id} className="bg-black border border-yellow-400 rounded-lg overflow-hidden hover:border-yellow-300 transition group">
              <div style={{ backgroundImage: `url(${service.image})`, backgroundSize: "cover", backgroundPosition: "center", height: "110px", backgroundColor: "#27272a" }} />
              <div className="p-3 text-center">
                <h4 className="font-bold text-xs md:text-sm group-hover:text-yellow-400 transition">{service.serviceName}</h4>
                <p className="text-yellow-400 text-xs mt-1">
                  {service.priceType === "from" ? "From " : ""}NGN {service.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/services" className="bg-yellow-400 text-black px-6 py-3 rounded font-bold hover:bg-yellow-300 transition">
            View All Services
          </Link>
        </div>
      </section>

      <section className="py-16 px-6">
        <h3 className="text-center text-3xl font-bold text-yellow-400 mb-4">Coverage Areas</h3>
        <p className="text-center text-gray-400 text-sm mb-10">We currently serve the following areas in Lagos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {["Ogba", "Ikeja", "Agege", "Ijaiye"].map((area) => (
            <div key={area} className="bg-zinc-900 border border-yellow-400 rounded-lg p-5 text-center">
              <p className="text-2xl mb-2">📍</p>
              <p className="font-bold text-yellow-400">{area}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-xs mt-6 max-w-lg mx-auto">
          For locations outside these areas, an additional transportation fee may apply. Contact us via WhatsApp to confirm.
        </p>
      </section>

      <section className="py-16 px-6 bg-zinc-900">
        <h3 className="text-center text-3xl font-bold text-yellow-400 mb-12">Why Choose Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "🏠", title: "We Come To You", desc: "No need to travel. Book online and we show up at your door at your chosen time." },
            { icon: "👑", title: "Expert Barbers", desc: "Skilled professionals with the right tools and products for premium results." },
            { icon: "📱", title: "Easy Online Booking", desc: "Book in minutes from your phone. Pick your service, date, time and location." },
          ].map((item) => (
            <div key={item.title} className="text-center p-6 border border-zinc-700 rounded-lg hover:border-yellow-400 transition">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-bold text-yellow-400 mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6">
        <h3 className="text-center text-3xl font-bold text-yellow-400 mb-12">What Clients Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Emeka O.", text: "Super convenient! They came to my house and the haircut was clean. Will definitely book again." },
            { name: "Tunde A.", text: "I love how easy it is to book. Tech Barber Queen is the future of grooming!" },
            { name: "Chisom N.", text: "My kids love the service. No stress taking them to a barber shop anymore." },
          ].map((t) => (
            <div key={t.name} className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 hover:border-yellow-400 transition">
              <p className="text-yellow-400 text-lg mb-1">★★★★★</p>
              <p className="text-gray-300 text-sm mb-4 italic">"{t.text}"</p>
              <p className="text-white font-bold text-sm">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 text-center bg-zinc-900">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready for a Fresh Look?</h3>
        <p className="text-gray-400 mb-2">Book your home service appointment today</p>
        <p className="text-yellow-400 text-sm mb-8">Serving Ogba | Ikeja | Agege | Ijaiye</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="bg-yellow-400 text-black px-8 py-4 rounded font-bold text-lg hover:bg-yellow-300 transition">
            Book Now
          </Link>
          <a href="https://wa.me/2349132490766" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-8 py-4 rounded font-bold text-lg hover:bg-green-400 transition">
            WhatsApp Us
          </a>
        </div>
      </section>

      <section className="py-10 px-6 bg-yellow-400 text-black text-center">
        <p className="text-base md:text-lg font-bold">TechBarberQueen — Where Technology Meets Grooming.</p>
      </section>

      <footer className="py-8 px-6 border-t border-zinc-800 text-center text-gray-500 text-sm">
        <p className="text-yellow-400 font-bold text-lg mb-2">TECH BARBER QUEEN</p>
        <p className="mb-2">Ogba | Ikeja | Agege | Ijaiye, Lagos</p>
        <div className="flex justify-center gap-6 mb-3">
          <a href="https://wa.me/2349132490766" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">WhatsApp</a>
          <a href="https://www.instagram.com/techbarberqueen.ng" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">Instagram</a>
        </div>
        <p>2026 TechBarberQueen. All rights reserved.</p>
      </footer>

      <a href="https://wa.me/2349132490766" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-full font-bold shadow-lg hover:bg-green-400 transition z-50 flex items-center gap-2">
        WhatsApp
      </a>

    </div>
  );
}