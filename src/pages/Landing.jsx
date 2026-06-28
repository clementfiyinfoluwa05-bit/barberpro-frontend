import { useState } from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-black text-white min-h-screen">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-5 border-b border-yellow-400 relative">
        <h1 className="text-yellow-400 text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>

        {/* Desktop menu */}
        <div className="hidden sm:flex gap-6 text-sm font-medium">
          <a href="#services" className="hover:text-yellow-400 transition">Services</a>
          <Link to="/services" className="hover:text-yellow-400 transition">Book Now</Link>
          <Link to="/login" className="hover:text-yellow-400 transition">Login</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-yellow-400 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "?" : "?"}
        </button>

        {/* Mobile dropdown */}
        {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-yellow-400 flex flex-col items-center gap-4 py-6 z-50 sm:hidden">
            <a href="#services" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Services</a>
            <Link to="/services" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Book Now</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Login</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Book Your Haircut <span className="text-yellow-400">With Ease</span>
        </h2>
        <p className="text-gray-400 text-base md:text-lg mb-8 max-w-xl">
          Professional barber booking system powered by Tech Barber Queen
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/book" className="bg-yellow-400 text-black px-6 py-3 rounded font-bold hover:bg-yellow-300 transition">
            Book Appointment
          </Link>
          <Link to="/services" className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded font-bold hover:bg-yellow-400 hover:text-black transition">
            View Services
          </Link>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section id="services" className="py-20 px-6 bg-zinc-900">
        <h3 className="text-center text-3xl font-bold text-yellow-400 mb-12">Our Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {["Low Cut", "Hair Dye", "Home Service", "Kids Cut"].map((service) => (
            <div key={service} className="bg-black border border-yellow-400 rounded-lg p-5 text-center hover:bg-yellow-400 hover:text-black transition group">
              <div className="text-3xl mb-2">??</div>
              <h4 className="font-bold text-sm md:text-lg group-hover:text-black">{service}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 px-6">
        <h3 className="text-center text-3xl font-bold text-yellow-400 mb-12">Why Choose Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "?", title: "Fast Booking", desc: "Book your appointment in seconds, no waiting on calls." },
            { icon: "??", title: "Expert Barbers", desc: "Skilled professionals who know exactly what you need." },
            { icon: "??", title: "Easy Management", desc: "Track and manage all your appointments in one place." },
          ].map((item) => (
            <div key={item.title} className="text-center p-6 border border-zinc-700 rounded-lg hover:border-yellow-400 transition">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-bold text-yellow-400 mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-zinc-900">
        <h3 className="text-center text-3xl font-bold text-yellow-400 mb-12">What Clients Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Emeka O.", text: "Best barber booking experience ever. Super smooth and professional!" },
            { name: "Tunde A.", text: "I love how easy it is to book. Tech Barber Queen is the future!" },
            { name: "Chisom N.", text: "My kids love coming here. The home service option is a lifesaver." },
          ].map((t) => (
            <div key={t.name} className="bg-black border border-zinc-700 rounded-lg p-6 hover:border-yellow-400 transition">
              <p className="text-yellow-400 text-lg mb-1">?????</p>
              <p className="text-gray-300 text-sm mb-4 italic">"{t.text}"</p>
              <p className="text-white font-bold text-sm">� {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready for a Fresh Cut?</h3>
        <p className="text-gray-400 mb-8">Join hundreds of satisfied clients booking with Tech Barber Queen</p>
        <Link to="/register" className="bg-yellow-400 text-black px-8 py-4 rounded font-bold text-lg hover:bg-yellow-300 transition">
          Get Started Today
        </Link>
      </section>

      {/* BRAND SECTION */}
      <section className="py-10 px-6 bg-yellow-400 text-black text-center">
        <p className="text-base md:text-lg font-bold">Built by Tech Barber Queen � where technology meets grooming.</p>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-zinc-800 text-center text-gray-500 text-sm">
        <p className="text-yellow-400 font-bold text-lg mb-2">TECH BARBER QUEEN</p>
        <p>� 2026 BarberPro. All rights reserved.</p>
      </footer>

    </div>
  );
}
