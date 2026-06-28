import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await API.get("/appointments");
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const upcoming = appointments.filter(a => a.status === "pending" || a.status === "confirmed");
  const history = appointments.filter(a => a.status === "completed" || a.status === "cancelled");

  const statusColor = (status) => {
    if (status === "confirmed") return "text-green-400";
    if (status === "pending") return "text-yellow-400";
    if (status === "completed") return "text-blue-400";
    if (status === "cancelled") return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-yellow-400">
        <h1 className="text-yellow-400 text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-400 text-sm">Welcome, {user?.fullName}</span>
          <button
            onClick={() => navigate("/book")}
            className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm hover:bg-yellow-300 transition"
          >
            Book Now
          </button>
          <button
            onClick={handleLogout}
            className="border border-yellow-400 text-yellow-400 px-4 py-2 rounded text-sm hover:bg-yellow-400 hover:text-black transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* WELCOME */}
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, <span className="text-yellow-400">{user?.fullName}</span> ??
        </h2>
        <p className="text-gray-400 mb-10">Manage your appointments below</p>

        {loading ? (
          <p className="text-gray-400">Loading appointments...</p>
        ) : (
          <>
            {/* UPCOMING */}
            <section className="mb-10">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Upcoming Appointments</h3>
              {upcoming.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No upcoming appointments.</p>
                  <button
                    onClick={() => navigate("/book")}
                    className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded font-bold hover:bg-yellow-300 transition"
                  >
                    Book an Appointment
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {upcoming.map((apt) => (
                    <div key={apt._id} className="bg-zinc-900 border border-zinc-700 hover:border-yellow-400 rounded-lg p-5 flex justify-between items-center transition">
                      <div>
                        <p className="font-bold text-white">{apt.serviceId?.serviceName || "Service"}</p>
                        <p className="text-gray-400 text-sm">{apt.appointmentDate} at {apt.appointmentTime}</p>
                        {apt.notes && <p className="text-gray-500 text-xs mt-1">Note: {apt.notes}</p>}
                      </div>
                      <span className={`font-bold capitalize text-sm ${statusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* HISTORY */}
            <section>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Appointment History</h3>
              {history.length === 0 ? (
                <p className="text-gray-500">No past appointments yet.</p>
              ) : (
                <div className="grid gap-4">
                  {history.map((apt) => (
                    <div key={apt._id} className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 flex justify-between items-center opacity-70">
                      <div>
                        <p className="font-bold text-white">{apt.serviceId?.serviceName || "Service"}</p>
                        <p className="text-gray-400 text-sm">{apt.appointmentDate} at {apt.appointmentTime}</p>
                      </div>
                      <span className={`font-bold capitalize text-sm ${statusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
