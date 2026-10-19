import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PageLayout from "./components/PageLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import BookAppointment from "./pages/BookAppointment";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FindBarbers from "./pages/FindBarbers";
import BarberProfile from "./pages/BarberProfile";
import BecomeBarber from "./pages/BecomeBarber";
import BarberDashboard from "./pages/BarberDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/barbers" element={<FindBarbers />} />
            <Route path="/barbers/:slug" element={<BarberProfile />} />
            <Route path="/join-as-barber" element={<BecomeBarber />} />
            <Route path="/barber/dashboard" element={<BarberDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
