import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import TopNav from "../components/TopNav";
import Spinner from "../components/Spinner";
import { placeLabel, priceLabel, errorMessage } from "../utils/format";

export default function BarberProfile() {
  const { slug } = useParams();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    API.get(`/barbers/${slug}`)
      .then(({ data }) => { setBarber(data); setActivePhoto(0); })
      .catch((err) => setError(errorMessage(err, "Barber not found")))
      .finally(() => setLoading(false));
  }, [slug]);

  const url = `${window.location.origin}/barbers/${slug}`;
  const shareText = barber ? `Book ${barber.displayName} on TechBarberQueen:` : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const nativeShare = () => navigator.share?.({ title: barber.displayName, text: shareText, url }).catch(() => {});

  if (loading) return <div className="min-h-screen bg-page text-ink"><TopNav /><Spinner /></div>;

  if (error || !barber) {
    return (
      <div className="min-h-screen bg-page text-ink">
        <TopNav />
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <p className="text-2xl font-bold mb-2">Barber not found</p>
          <p className="text-muted mb-6">This profile may not be live yet.</p>
          <Link to="/barbers" className="bg-yellow-400 text-black px-6 py-2 rounded font-bold">Find another barber</Link>
        </div>
      </div>
    );
  }

  const photos = barber.photos || [];
  const areas = [barber.location?.area, ...(barber.serviceAreas || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-page text-ink">
      <TopNav />

      {barber.status && barber.status !== "approved" && (
        <div className={`${barber.status === "pending" ? "bg-yellow-400 text-black" : "bg-red-500 text-white"} text-center text-sm font-bold py-3 px-4`}>
          {barber.status === "pending"
            ? "Preview: this profile is waiting for approval and is not visible to customers yet."
            : "This profile is suspended and hidden from customers."}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          {photos.length > 0 ? (
            <>
              <div className="rounded-lg overflow-hidden border border-line bg-card">
                <img src={photos[activePhoto]} alt={`${barber.displayName} work ${activePhoto + 1}`} className="w-full h-72 sm:h-96 object-cover" />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {photos.map((p, i) => (
                    <button key={p} onClick={() => setActivePhoto(i)} className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${i === activePhoto ? "border-brand" : "border-transparent"}`}>
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-line bg-card h-60 flex items-center justify-center text-subtle">No photos yet</div>
          )}

          <h3 className="text-xl font-bold text-brand mt-8 mb-3">Services</h3>
          {barber.services?.length ? (
            <div className="grid gap-3">
              {barber.services.map((s) => (
                <div key={s._id || s.name} className="bg-card border border-line rounded-lg p-4 flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-ink break-words">{s.name}</p>
                    {s.description && <p className="text-muted text-xs mt-1 break-words">{s.description}</p>}
                    <p className="text-subtle text-xs mt-1">{s.durationMins} mins</p>
                  </div>
                  <p className="text-brand font-bold text-sm whitespace-nowrap">{priceLabel(s, barber.currency)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">This barber hasn't listed services yet.</p>
          )}
        </div>

        <aside className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-card border border-brand rounded-lg p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-2xl font-bold break-words">{barber.displayName}</h2>
              {barber.verified && <span className="shrink-0 text-xs font-bold bg-yellow-400 text-black px-2 py-1 rounded">✓ Verified</span>}
            </div>
            <p className="text-muted text-sm mt-2">📍 {placeLabel(barber.location) || "Location not set"}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {barber.homeService && <span className="text-xs border border-brand text-brand px-2 py-1 rounded">Comes to your home</span>}
              {barber.shopService && <span className="text-xs border border-line text-ink-2 px-2 py-1 rounded">In-shop</span>}
            </div>
            {barber.bio && <p className="text-ink-2 text-sm mt-4 whitespace-pre-line break-words">{barber.bio}</p>}

            <button disabled className="w-full mt-5 bg-yellow-400 text-black font-bold py-3 rounded opacity-60 cursor-not-allowed">
              Book this barber — coming soon
            </button>
          </div>

          {areas.length > 0 && (
            <div className="bg-card border border-line rounded-lg p-5">
              <p className="text-brand font-bold mb-3">Areas covered</p>
              <div className="flex flex-wrap gap-2">
                {areas.map((a) => <span key={a} className="text-xs bg-page border border-line px-2 py-1 rounded">{a}</span>)}
              </div>
            </div>
          )}

          <div className="bg-card border border-line rounded-lg p-5">
            <p className="text-brand font-bold mb-3">Share this barber</p>
            <div className="flex flex-col gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white text-center font-bold py-2 rounded hover:bg-green-400 transition text-sm">
                Share on WhatsApp
              </a>
              <button onClick={copyLink} className="border border-brand text-brand py-2 rounded font-bold text-sm hover:bg-yellow-400 hover:text-black transition">
                {copied ? "Link copied ✓" : "Copy profile link"}
              </button>
              {typeof navigator !== "undefined" && navigator.share && (
                <button onClick={nativeShare} className="border border-line text-ink-2 py-2 rounded text-sm hover:border-brand transition">More sharing options</button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
