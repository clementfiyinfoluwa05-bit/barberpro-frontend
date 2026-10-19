import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import TopNav from "../components/TopNav";
import BarberCard from "../components/BarberCard";
import Spinner from "../components/Spinner";
import useCountries from "../hooks/useCountries";
import { errorMessage } from "../utils/format";

const input = "w-full bg-black border border-zinc-700 text-white px-3 py-2.5 rounded focus:outline-none focus:border-yellow-400 text-sm";
const FILTER_KEYS = ["state", "city", "area", "service", "home"];

export default function FindBarbers() {
  const [params, setParams] = useSearchParams();
  const countries = useCountries();
  const ng = countries?.NG;

  const [form, setForm] = useState(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ""])));
  const [data, setData] = useState({ results: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  const nearMe = params.get("lat") && params.get("lng");
  const radius = params.get("radiusKm") || "15";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    API.get("/barbers", { params: Object.fromEntries(params) })
      .then(({ data }) => { if (!cancelled) setData(data); })
      .catch((err) => { if (!cancelled) setError(errorMessage(err, "Could not load barbers")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params]);

  const update = (next) => {
    const p = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v); });
    setParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const keep = nearMe ? { lat: params.get("lat"), lng: params.get("lng"), radiusKm: radius } : {};
    update({ ...keep, ...form });
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) return setError("Your browser can't share your location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        update({
          ...form,
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
          radiusKm: radius,
        });
      },
      () => {
        setLocating(false);
        setError("Location permission was denied. Search by area instead.");
      },
      { timeout: 10000 }
    );
  };

  const clearAll = () => {
    setForm(Object.fromEntries(FILTER_KEYS.map((k) => [k, ""])));
    setParams(new URLSearchParams());
  };

  const goToPage = (page) => {
    const p = new URLSearchParams(params);
    p.set("page", String(page));
    setParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? (e.target.checked ? "1" : "") : e.target.value });

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-3xl font-bold mb-1">Find a <span className="text-yellow-400">Barber</span></h2>
        <p className="text-gray-400 text-sm mb-6">Barbers and stylists near you — at your home or in their shop.</p>

        <form onSubmit={handleSearch} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <select value={form.state} onChange={set("state")} className={input} aria-label="State">
            <option value="">All states</option>
            {(ng?.states || []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div>
            <input value={form.city} onChange={set("city")} list="find-cities" placeholder="City (e.g. Lagos)" className={input} aria-label="City" />
            <datalist id="find-cities">{(ng?.popularCities || []).map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <input value={form.area} onChange={set("area")} list="find-areas" placeholder="Area (e.g. Ikeja)" className={input} aria-label="Area" />
            <datalist id="find-areas">{(ng?.popularAreas?.[form.city] || ng?.popularAreas?.Lagos || []).map((a) => <option key={a} value={a} />)}</datalist>
          </div>
          <input value={form.service} onChange={set("service")} placeholder="Service (e.g. braids, fade)" className={input} aria-label="Service" />
          <label className="flex items-center gap-2 text-sm text-gray-300 sm:col-span-2 lg:col-span-2">
            <input type="checkbox" checked={form.home === "1"} onChange={set("home")} className="accent-yellow-400 w-4 h-4" />
            Only barbers who come to my home
          </label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-2 lg:justify-end">
            <button type="button" onClick={clearAll} className="border border-zinc-600 text-gray-300 px-4 py-2.5 rounded text-sm hover:border-yellow-400 transition">Clear</button>
            <button type="submit" className="flex-1 lg:flex-none bg-yellow-400 text-black font-bold px-6 py-2.5 rounded text-sm hover:bg-yellow-300 transition">Search</button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={handleNearMe} disabled={locating} className="border border-yellow-400 text-yellow-400 px-4 py-2 rounded text-sm font-bold hover:bg-yellow-400 hover:text-black transition disabled:opacity-50">
            {locating ? "Finding you…" : "📍 Near me"}
          </button>
          {nearMe && (
            <>
              <select value={radius} onChange={(e) => { const p = new URLSearchParams(params); p.set("radiusKm", e.target.value); p.delete("page"); setParams(p); }} className="bg-black border border-zinc-700 text-white px-3 py-2 rounded text-sm" aria-label="Distance">
                {["5", "10", "15", "25", "50"].map((r) => <option key={r} value={r}>Within {r} km</option>)}
              </select>
              <button onClick={() => { const p = new URLSearchParams(params); ["lat", "lng", "radiusKm", "page"].forEach((k) => p.delete(k)); setParams(p); }} className="text-gray-400 text-sm underline hover:text-yellow-400">
                Stop using my location
              </button>
            </>
          )}
        </div>

        {error && <div className="bg-red-500 text-white px-4 py-3 rounded mb-6 text-sm text-center">{error}</div>}

        {loading ? <Spinner /> : data.results.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 text-center">
            <p className="text-white font-bold mb-2">No barbers found here yet.</p>
            <p className="text-gray-400 text-sm mb-5">Try a nearby area, or clear the filters. Know a great barber? Invite them to join.</p>
            <Link to="/join-as-barber" className="bg-yellow-400 text-black px-6 py-2 rounded font-bold hover:bg-yellow-300 transition">Join as a Barber</Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-4">{data.total} barber{data.total === 1 ? "" : "s"} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.results.map((b) => <BarberCard key={b._id} barber={b} />)}
            </div>
            {data.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 text-sm">
                <button disabled={data.page <= 1} onClick={() => goToPage(data.page - 1)} className="border border-zinc-600 px-4 py-2 rounded disabled:opacity-40 hover:border-yellow-400">Previous</button>
                <span className="text-gray-400">Page {data.page} of {data.pages}</span>
                <button disabled={data.page >= data.pages} onClick={() => goToPage(data.page + 1)} className="border border-zinc-600 px-4 py-2 rounded disabled:opacity-40 hover:border-yellow-400">Next</button>
              </div>
            )}
          </>
        )}

        <div className="mt-12 bg-zinc-900 border border-yellow-400 rounded-lg p-6 text-center">
          <p className="text-yellow-400 font-bold text-lg mb-1">Are you a barber or stylist?</p>
          <p className="text-gray-400 text-sm mb-4">Get customers near you on TechBarberQueen.</p>
          <Link to="/join-as-barber" className="bg-yellow-400 text-black px-6 py-2 rounded font-bold hover:bg-yellow-300 transition">Join as a Barber</Link>
        </div>
      </div>
    </div>
  );
}
