import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Spinner from "../components/Spinner";
import LocationFields from "../components/LocationFields";
import { errorMessage, formatMoney } from "../utils/format";
import { isUploadConfigured, uploadImage, MAX_PHOTO_MB } from "../utils/upload";

const input = "w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand";
const smallInput = "w-full bg-page border border-line text-ink px-3 py-2 rounded focus:outline-none focus:border-brand text-sm";
const MAX_PHOTOS = 8;
const emptyService = () => ({ name: "", price: "", priceType: "fixed", durationMins: 60, description: "" });

const STATUS_BANNER = {
  pending: { cls: "bg-yellow-400 text-black", text: "Your profile is waiting for approval. Add your services and photos now — customers will see you once you're approved." },
  approved: { cls: "bg-green-600 text-white", text: "Your profile is live! Customers can find you in search. Share your link below to get more bookings." },
  suspended: { cls: "bg-red-600 text-white", text: "Your profile is suspended and hidden from customers. Contact TechBarberQueen support." },
};

export default function BarberDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [newArea, setNewArea] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [locating, setLocating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    API.get("/barbers/me")
      .then(({ data }) => loadProfile(data))
      .catch((err) => {
        if (err.response?.status === 404) navigate("/join-as-barber");
        else setMessage({ type: "error", text: errorMessage(err, "Could not load your profile") });
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const loadProfile = (p) => {
    setProfile(p);
    setForm({
      displayName: p.displayName || "",
      bio: p.bio || "",
      location: {
        country: p.location?.country || "NG",
        state: p.location?.state || "",
        city: p.location?.city || "",
        area: p.location?.area || "",
      },
      coords: p.location?.lat !== undefined && p.location?.lat !== null ? { lat: p.location.lat, lng: p.location.lng } : null,
      homeService: p.homeService,
      shopService: p.shopService,
      serviceAreas: p.serviceAreas || [],
      services: (p.services || []).map((s) => ({ ...s, price: String(s.price) })),
      photos: p.photos || [],
    });
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const flash = (type, text) => setMessage({ type, text });

  // ----- services -----
  const updateService = (i, k, v) => set("services", form.services.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  const addService = () => set("services", [...form.services, emptyService()]);
  const removeService = (i) => set("services", form.services.filter((_, idx) => idx !== i));

  // ----- areas -----
  const addArea = () => {
    const a = newArea.trim();
    if (!a) return;
    if (!form.serviceAreas.some((x) => x.toLowerCase() === a.toLowerCase())) set("serviceAreas", [...form.serviceAreas, a]);
    setNewArea("");
  };

  // ----- photos -----
  const addPhotoUrl = () => {
    const url = photoUrl.trim();
    if (!/^https?:\/\//i.test(url)) return flash("error", "Photo links must start with https://");
    if (form.photos.length >= MAX_PHOTOS) return flash("error", `You can add up to ${MAX_PHOTOS} photos.`);
    set("photos", [...form.photos, url]);
    setPhotoUrl("");
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - form.photos.length);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadImage(file));
      set("photos", [...form.photos, ...urls]);
      flash("ok", `${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded — remember to save.`);
    } catch (err) {
      flash("error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const movePhoto = (i, dir) => {
    const p = [...form.photos];
    const j = i + dir;
    if (j < 0 || j >= p.length) return;
    [p[i], p[j]] = [p[j], p[i]];
    set("photos", p);
  };

  // ----- map location -----
  const useMyLocation = () => {
    if (!navigator.geolocation) return flash("error", "Your browser can't share your location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        set("coords", { lat: Number(pos.coords.latitude.toFixed(5)), lng: Number(pos.coords.longitude.toFixed(5)) });
        flash("ok", "Location captured — remember to save.");
      },
      () => {
        setLocating(false);
        flash("error", "Location permission was denied.");
      },
      { timeout: 10000 }
    );
  };

  // ----- save -----
  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const services = form.services.filter((s) => s.name.trim() || String(s.price).trim());
    for (const s of services) {
      if (!s.name.trim() || s.price === "" || Number(s.price) < 0 || Number.isNaN(Number(s.price))) {
        return flash("error", "Each service needs a name and a valid price.");
      }
    }
    if (!form.homeService && !form.shopService) return flash("error", "Choose home service, in-shop, or both.");

    setSaving(true);
    try {
      const { data } = await API.put("/barbers/me", {
        displayName: form.displayName,
        bio: form.bio,
        ...form.location,
        lat: form.coords ? form.coords.lat : null,
        lng: form.coords ? form.coords.lng : null,
        homeService: form.homeService,
        shopService: form.shopService,
        serviceAreas: form.serviceAreas,
        services: services.map((s) => ({ ...s, price: Number(s.price), durationMins: Number(s.durationMins) || 60 })),
        photos: form.photos,
      });
      loadProfile(data);
      flash("ok", "Profile saved ✓");
    } catch (err) {
      flash("error", errorMessage(err, "Could not save your profile"));
    } finally {
      setSaving(false);
    }
  };

  const profileUrl = profile ? `${window.location.origin}/barbers/${profile.slug}` : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your link:", profileUrl);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-page text-ink">
        {loading ? <Spinner /> : <p className="text-center text-red-400 p-10">{message.text}</p>}
      </div>
    );
  }

  const banner = STATUS_BANNER[profile.status];

  return (
    <div className="min-h-screen bg-page text-ink">
      <nav className="flex justify-between items-center gap-3 px-4 sm:px-8 py-5 border-b border-brand">
        <h1 className="text-brand text-base sm:text-xl font-bold tracking-widest">TECH BARBER QUEEN</h1>
        <div className="flex gap-3 items-center text-sm">
          {user?.role === "admin" && <Link to="/admin" className="text-ink-2 hover:text-brand">Admin</Link>}
          <Link to="/dashboard" className="text-ink-2 hover:text-brand hidden sm:block">My bookings</Link>
          <button onClick={handleLogout} className="border border-brand text-brand px-3 sm:px-4 py-2 rounded hover:bg-yellow-400 hover:text-black transition">Logout</button>
        </div>
      </nav>

      {banner && <div className={`${banner.cls} text-center text-sm font-bold py-3 px-4`}>{banner.text}</div>}

      <form onSubmit={handleSave} className="max-w-4xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">My <span className="text-brand">Barber Profile</span></h2>
            <p className="text-muted text-sm mt-1">Keep it complete — profiles with photos and prices get more bookings.</p>
          </div>
          <Link to={`/barbers/${profile.slug}`} className="border border-brand text-brand px-4 py-2 rounded text-sm font-bold text-center hover:bg-yellow-400 hover:text-black transition">
            View my public profile
          </Link>
        </div>

        <section className="bg-card border border-line rounded-lg p-5">
          <p className="text-brand font-bold mb-2">Your profile link</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input readOnly value={profileUrl} className={`${smallInput} text-ink-2`} onFocus={(e) => e.target.select()} />
            <button type="button" onClick={copyLink} className="bg-yellow-400 text-black font-bold px-4 py-2 rounded text-sm whitespace-nowrap">{copied ? "Copied ✓" : "Copy link"}</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Book me on TechBarberQueen: ${profileUrl}`)}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-bold px-4 py-2 rounded text-sm text-center whitespace-nowrap">WhatsApp</a>
          </div>
          <p className="text-subtle text-xs mt-2">Put this link in your Instagram and TikTok bio and your WhatsApp status.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-brand">About you</h3>
          <div>
            <label className="text-sm text-muted mb-1 block">Business or display name</label>
            <input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} required maxLength={80} className={input} />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Bio</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={1000} rows={4} placeholder="Your experience, specialties, what makes your cuts special…" className={`${input} resize-none`} />
            <p className="text-subtle text-xs text-right">{form.bio.length}/1000</p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-brand">Location</h3>
          <LocationFields value={form.location} onChange={(v) => set("location", v)} />
          <div className="bg-card border border-line rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-bold">Show up in "Near me" searches</p>
              <p className="text-muted text-xs">
                {form.coords ? "✓ Map location saved. Customers only see your distance, never your exact address." : "Add your map location so nearby customers can find you."}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={useMyLocation} disabled={locating} className="border border-brand text-brand px-4 py-2 rounded text-sm font-bold hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 whitespace-nowrap">
                {locating ? "Locating…" : form.coords ? "Update location" : "Use my current location"}
              </button>
              {form.coords && <button type="button" onClick={() => set("coords", null)} className="text-muted text-sm underline">Remove</button>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            <label className="flex items-center gap-2 bg-card border border-line rounded px-4 py-3 flex-1">
              <input type="checkbox" checked={form.homeService} onChange={(e) => set("homeService", e.target.checked)} className="accent-yellow-400 w-4 h-4" />
              I go to customers' homes
            </label>
            <label className="flex items-center gap-2 bg-card border border-line rounded px-4 py-3 flex-1">
              <input type="checkbox" checked={form.shopService} onChange={(e) => set("shopService", e.target.checked)} className="accent-yellow-400 w-4 h-4" />
              Customers come to my shop
            </label>
          </div>
          {form.homeService && (
            <div>
              <label className="text-sm text-muted mb-1 block">Other areas you travel to</label>
              <div className="flex gap-2">
                <input value={newArea} onChange={(e) => setNewArea(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArea(); } }} list="area-suggestions" placeholder="e.g. Ogba" className={smallInput} />
                <button type="button" onClick={addArea} className="bg-soft border border-line px-4 rounded text-sm hover:border-brand">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.serviceAreas.map((a) => (
                  <span key={a} className="text-xs bg-card border border-line pl-3 pr-1 py-1 rounded flex items-center gap-1">
                    {a}
                    <button type="button" onClick={() => set("serviceAreas", form.serviceAreas.filter((x) => x !== a))} className="text-muted hover:text-red-400 px-1" aria-label={`Remove ${a}`}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-brand">Services &amp; prices</h3>
            <button type="button" onClick={addService} className="bg-yellow-400 text-black font-bold px-4 py-2 rounded text-sm">+ Add service</button>
          </div>
          {form.services.length === 0 && <p className="text-muted text-sm bg-card border border-line rounded p-4">No services yet. Add your first one — e.g. "Haircut", "Beard trim", "Braids".</p>}
          {form.services.map((s, i) => (
            <div key={s._id || `new-${i}`} className="bg-card border border-line rounded-lg p-4 grid grid-cols-2 sm:grid-cols-6 gap-3">
              <input value={s.name} onChange={(e) => updateService(i, "name", e.target.value)} placeholder="Service name" maxLength={80} className={`${smallInput} col-span-2 sm:col-span-3`} aria-label="Service name" />
              <input type="number" min="0" step="any" inputMode="numeric" value={s.price} onChange={(e) => updateService(i, "price", e.target.value)} placeholder="Price" className={`${smallInput} sm:col-span-1`} aria-label="Price" />
              <select value={s.priceType} onChange={(e) => updateService(i, "priceType", e.target.value)} className={`${smallInput} sm:col-span-1`} aria-label="Price type">
                <option value="fixed">Fixed</option>
                <option value="from">From</option>
              </select>
              <select value={s.durationMins} onChange={(e) => updateService(i, "durationMins", e.target.value)} className={`${smallInput} sm:col-span-1`} aria-label="Duration">
                {[15, 30, 45, 60, 90, 120, 180, 240, 300].map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? "s" : ""}`}</option>)}
              </select>
              <input value={s.description} onChange={(e) => updateService(i, "description", e.target.value)} placeholder="Short description (optional)" maxLength={300} className={`${smallInput} col-span-2 sm:col-span-5`} aria-label="Description" />
              <div className="col-span-2 sm:col-span-6 flex justify-between items-center text-xs">
                <span className="text-brand">{s.price !== "" && !Number.isNaN(Number(s.price)) ? `${s.priceType === "from" ? "From " : ""}${formatMoney(s.price, profile.currency)}` : ""}</span>
                <button type="button" onClick={() => removeService(i)} className="text-red-400 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-brand">Photos of your work <span className="text-subtle text-sm font-normal">({form.photos.length}/{MAX_PHOTOS})</span></h3>
          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.photos.map((p, i) => (
                <div key={p} className="relative rounded overflow-hidden border border-line group">
                  <img src={p} alt={`Work ${i + 1}`} className="w-full h-32 object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">Cover</span>}
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white flex justify-between text-xs">
                    <button type="button" onClick={() => movePhoto(i, -1)} disabled={i === 0} className="px-2 py-1 disabled:opacity-30" aria-label="Move left">◀</button>
                    <button type="button" onClick={() => set("photos", form.photos.filter((x) => x !== p))} className="px-2 py-1 text-red-400">Delete</button>
                    <button type="button" onClick={() => movePhoto(i, 1)} disabled={i === form.photos.length - 1} className="px-2 py-1 disabled:opacity-30" aria-label="Move right">▶</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {form.photos.length < MAX_PHOTOS && (
            isUploadConfigured ? (
              <div>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed border-line hover:border-brand rounded-lg py-6 text-sm text-ink-2 transition disabled:opacity-50">
                  {uploading ? "Uploading…" : `+ Upload photos (max ${MAX_PHOTO_MB} MB each)`}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPhotoUrl(); } }} placeholder="Paste a photo link (https://...)" className={smallInput} />
                <button type="button" onClick={addPhotoUrl} className="bg-soft border border-line px-4 rounded text-sm hover:border-brand">Add</button>
              </div>
            )
          )}
        </section>

        {message.text && (
          <div className={`${message.type === "error" ? "bg-red-500" : "bg-green-600"} text-white px-4 py-3 rounded text-sm text-center`}>{message.text}</div>
        )}

        <div className="sticky bottom-0 bg-page/95 border-t border-line-soft -mx-4 sm:-mx-8 pl-20 pr-4 sm:pl-24 sm:pr-8 py-4">
          <button type="submit" disabled={saving || uploading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-300 transition disabled:opacity-50">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
