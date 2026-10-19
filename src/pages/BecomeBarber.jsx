import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import TopNav from "../components/TopNav";
import LocationFields from "../components/LocationFields";
import { errorMessage } from "../utils/format";

const input = "w-full bg-black border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:border-yellow-400";

export default function BecomeBarber() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState({ country: "NG", state: "", city: "", area: "" });
  const [homeService, setHomeService] = useState(true);
  const [shopService, setShopService] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAcc = (k) => (e) => setAccount({ ...account, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!homeService && !shopService) return setError("Choose home service, in-shop, or both.");
    if (!user && account.password !== account.confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    const profile = { displayName, ...location, homeService, shopService };
    try {
      if (user) {
        const { data } = await API.post("/barbers/apply", profile);
        login({ ...user, role: data.role, token: data.token });
      } else {
        const { fullName, email, phone, password } = account;
        const { data } = await API.post("/barbers/register", { fullName, email, phone, password, ...profile });
        login(data);
      }
      navigate("/barber/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Could not create your barber profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-3xl font-bold mb-1">Join as a <span className="text-yellow-400">Barber</span></h2>
        <p className="text-gray-400 text-sm mb-8">
          Create your free profile, list your services and get customers near you. We review every profile before it goes live.
        </p>

        {error && <div className="bg-red-500 text-white px-4 py-3 rounded mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {!user ? (
            <section className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-yellow-400">Your account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={account.fullName} onChange={setAcc("fullName")} required placeholder="Full name" className={input} />
                <input type="tel" value={account.phone} onChange={setAcc("phone")} required placeholder="Phone number" className={input} />
                <input type="email" value={account.email} onChange={setAcc("email")} required placeholder="Email address" className={`${input} sm:col-span-2`} />
                <input type="password" value={account.password} onChange={setAcc("password")} required minLength={6} placeholder="Password (6+ characters)" className={input} />
                <input type="password" value={account.confirmPassword} onChange={setAcc("confirmPassword")} required placeholder="Confirm password" className={input} />
              </div>
              <p className="text-gray-500 text-xs">Already have an account? <Link to="/login" className="text-yellow-400 hover:underline">Log in</Link> first, then come back to this page.</p>
            </section>
          ) : (
            <p className="bg-zinc-900 border border-zinc-700 rounded p-4 text-sm text-gray-300">
              Signed in as <span className="text-yellow-400 font-bold">{user.fullName}</span>. Your barber profile will be added to this account.
            </p>
          )}

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-yellow-400">Your barber profile</h3>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Business or display name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={80} placeholder="e.g. Kings Cut Studio" className={input} />
              <p className="text-gray-500 text-xs mt-1">This name appears on your public profile and link.</p>
            </div>
            <LocationFields value={location} onChange={setLocation} />
            <div className="flex flex-col sm:flex-row gap-3 text-sm">
              <label className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded px-4 py-3 flex-1">
                <input type="checkbox" checked={homeService} onChange={(e) => setHomeService(e.target.checked)} className="accent-yellow-400 w-4 h-4" />
                I go to customers' homes
              </label>
              <label className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded px-4 py-3 flex-1">
                <input type="checkbox" checked={shopService} onChange={(e) => setShopService(e.target.checked)} className="accent-yellow-400 w-4 h-4" />
                Customers come to my shop
              </label>
            </div>
          </section>

          <button type="submit" disabled={loading} className="bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-300 transition disabled:opacity-50">
            {loading ? "Creating your profile…" : "Create my barber profile"}
          </button>
          <p className="text-gray-500 text-xs text-center -mt-4">Next you'll add your services, prices and photos.</p>
        </form>
      </div>
    </div>
  );
}
