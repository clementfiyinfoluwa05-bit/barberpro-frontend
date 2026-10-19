import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import AdminBarbers from "../components/AdminBarbers";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("appointments");

  useEffect(() => {
    if (!user || user.role !== "admin") return navigate("/login");
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

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === "pending").length;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  const statusColor = (status) => {
    if (status === "confirmed") return "text-green-400";
    if (status === "pending") return "text-brand";
    if (status === "completed") return "text-blue-400";
    if (status === "cancelled") return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-page text-ink">
      <nav className="flex justify-between items-center px-8 py-5 border-b border-brand">
        <h1 className="text-brand text-xl font-bold tracking-widest">
          TECH BARBER QUEEN - ADMIN
        </h1>
        <div className="flex gap-4 items-center">
          <span className="text-muted text-sm">Admin: {user?.fullName}</span>
          <button
            onClick={handleLogout}
            className="border border-brand text-brand px-4 py-2 rounded text-sm hover:bg-yellow-400 hover:text-black transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold mb-6">
          Admin <span className="text-brand">Dashboard</span>
        </h2>

        <div className="flex gap-2 mb-8 border-b border-line-soft">
          {[["appointments", "Appointments"], ["barbers", "Barbers"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px transition ${tab === key ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "barbers" ? <AdminBarbers /> : (<>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Total", value: total, color: "border-brand text-brand" },
            { label: "Pending", value: pending, color: "border-orange-400 text-orange-400" },
            { label: "Confirmed", value: confirmed, color: "border-green-400 text-green-400" },
            { label: "Completed", value: completed, color: "border-blue-400 text-blue-400" },
            { label: "Cancelled", value: cancelled, color: "border-red-400 text-red-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-card border ${stat.color} rounded-lg p-5 text-center`}
            >
              <p className={`text-3xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</p>
              <p className="text-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-brand mb-4">All Appointments</h3>

        {loading ? (
          <p className="text-muted">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="text-muted">No appointments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-muted text-left">
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Service</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Time</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr
                    key={apt._id}
                    className="border-b border-line-soft hover:bg-card transition"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-bold text-ink">
                        {apt.customerId?.fullName || "Customer"}
                      </p>
                      <p className="text-subtle text-xs">{apt.customerId?.phone}</p>
                    </td>
                    <td className="py-4 pr-4 text-ink-2 max-w-xs">
                      {apt.serviceId?.serviceName || "Service"}
                      {apt.notes && (
                        <p className="text-subtle text-xs mt-1 whitespace-pre-line break-words">{apt.notes}</p>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-ink-2">{apt.appointmentDate}</td>
                    <td className="py-4 pr-4 text-ink-2">{apt.appointmentTime}</td>
                    <td className="py-4 pr-4">
                      <span className={`font-bold capitalize ${statusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2 flex-wrap">
                        {apt.status === "pending" && (
                          <button
                            onClick={() => updateStatus(apt._id, "confirmed")}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-400 transition"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(apt._id, "completed")}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-400 transition"
                          >
                            Complete
                          </button>
                        )}
                        {(apt.status === "pending" || apt.status === "confirmed") && (
                          <button
                            onClick={() => updateStatus(apt._id, "cancelled")}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-400 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </>)}
      </div>
    </div>
  );
}
