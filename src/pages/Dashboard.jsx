import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Spinner from "../components/Spinner";

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
    if (status === "pending") return "text-brand";
    if (status === "completed") return "text-blue-400";
    if (status === "cancelled") return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-page text-ink">
      <nav className="flex justify-between items-center px-8 py-5 border-b border-brand">
        <h1 className="text-brand text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>
        <div className="flex gap-4 items-center">
          <span className="text-muted text-sm hidden sm:block">Welcome, {user?.fullName}</span>
          <button onClick={() => navigate("/book")} className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm hover:bg-yellow-300 transition">Book Now</button>
          <button onClick={handleLogout} className="border border-brand text-brand px-4 py-2 rounded text-sm hover:bg-yellow-400 hover:text-black transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold mb-2">Welcome back, <span className="text-brand">{user?.fullName}</span></h2>
        <p className="text-muted mb-10">Manage your appointments below</p>

        {loading ? <Spinner /> : (
          <>
            <section className="mb-10">
              <h3 className="text-xl font-bold text-brand mb-4">Upcoming Appointments</h3>
              {upcoming.length === 0 ? (
                <div className="bg-card border border-line rounded-lg p-6 text-center">
                  <p className="text-muted">No upcoming appointments.</p>
                  <button onClick={() => navigate("/book")} className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded font-bold hover:bg-yellow-300 transition">Book an Appointment</button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {upcoming.map((apt) => (
                    <div key={apt._id} className="bg-card border border-line hover:border-brand rounded-lg p-5 flex justify-between items-center transition">
                      <div>
                        <p className="font-bold text-ink">{apt.serviceId?.serviceName || "Service"}</p>
                        <p className="text-muted text-sm">{apt.appointmentDate} at {apt.appointmentTime}</p>
                        {apt.notes && <p className="text-subtle text-xs mt-1">Note: {apt.notes}</p>}
                      </div>
                      <span className={`font-bold capitalize text-sm ${statusColor(apt.status)}`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-xl font-bold text-brand mb-4">Appointment History</h3>
              {history.length === 0 ? (
                <p className="text-subtle">No past appointments yet.</p>
              ) : (
                <div className="grid gap-4">
                  {history.map((apt) => (
                    <div key={apt._id} className="bg-card border border-line rounded-lg p-5 flex justify-between items-center opacity-70">
                      <div>
                        <p className="font-bold text-ink">{apt.serviceId?.serviceName || "Service"}</p>
                        <p className="text-muted text-sm">{apt.appointmentDate} at {apt.appointmentTime}</p>
                      </div>
                      <span className={`font-bold capitalize text-sm ${statusColor(apt.status)}`}>{apt.status}</span>
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
