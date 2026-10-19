import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Simple top bar used by the barber pages.
export default function TopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const home = !user ? "/login" : user.role === "admin" ? "/admin" : user.role === "barber" ? "/barber/dashboard" : "/dashboard";

  return (
    <nav className="flex justify-between items-center gap-3 px-4 sm:px-6 py-5 border-b border-yellow-400">
      <Link to="/" className="text-yellow-400 text-sm sm:text-xl font-bold tracking-wider sm:tracking-widest whitespace-nowrap">TECH BARBER QUEEN</Link>
      <div className="flex gap-3 sm:gap-4 items-center text-sm whitespace-nowrap">
        <Link to="/barbers" className="text-gray-300 hover:text-yellow-400 transition">
          <span className="sm:hidden">Barbers</span>
          <span className="hidden sm:inline">Find a Barber</span>
        </Link>
        <button onClick={() => navigate(home)} className="bg-yellow-400 text-black px-3 sm:px-4 py-2 rounded font-bold hover:bg-yellow-300 transition">
          {user ? "Dashboard" : "Login"}
        </button>
      </div>
    </nav>
  );
}
