import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { placeLabel, errorMessage } from "../utils/format";

const TABS = [
  { key: "pending", label: "Waiting for approval" },
  { key: "approved", label: "Live" },
  { key: "suspended", label: "Suspended" },
];

export default function AdminBarbers() {
  const [status, setStatus] = useState("pending");
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    API.get("/admin/barbers", { params: { status } })
      .then(({ data }) => setBarbers(data))
      .catch((err) => setError(errorMessage(err, "Could not load barbers")))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const update = async (id, change) => {
    setBusyId(id);
    try {
      await API.put(`/admin/barbers/${id}`, change);
      load();
    } catch (err) {
      setError(errorMessage(err, "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setStatus(t.key)} className={`px-4 py-2 rounded text-sm font-bold border transition ${status === t.key ? "bg-yellow-400 text-black border-brand" : "border-line text-ink-2 hover:border-brand"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-500 text-white px-4 py-3 rounded mb-4 text-sm">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading barbers...</p>
      ) : barbers.length === 0 ? (
        <p className="text-muted">No barbers here.</p>
      ) : (
        <div className="grid gap-4">
          {barbers.map((b) => (
            <div key={b._id} className="bg-card border border-line rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-ink text-lg break-words">
                  {b.displayName} {b.verified && <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded align-middle">✓ Verified</span>}
                </p>
                <p className="text-muted text-sm">{b.userId?.fullName} · {b.userId?.phone} · {b.userId?.email}</p>
                <p className="text-subtle text-xs mt-1">
                  📍 {placeLabel(b.location) || "No location"} · {b.services?.length || 0} services · {b.photos?.length || 0} photos ·
                  {b.homeService ? " Home" : ""}{b.homeService && b.shopService ? " +" : ""}{b.shopService ? " Shop" : ""} · joined {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link to={`/barbers/${b.slug}`} className="border border-line text-ink-2 px-3 py-1 rounded text-xs hover:border-brand">View</Link>
                {b.status !== "approved" && (
                  <button disabled={busyId === b._id} onClick={() => update(b._id, { status: "approved" })} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-400 disabled:opacity-50">Approve</button>
                )}
                {b.status !== "suspended" && (
                  <button disabled={busyId === b._id} onClick={() => update(b._id, { status: "suspended" })} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-400 disabled:opacity-50">Suspend</button>
                )}
                <button disabled={busyId === b._id} onClick={() => update(b._id, { verified: !b.verified })} className="border border-brand text-brand px-3 py-1 rounded text-xs hover:bg-yellow-400 hover:text-black disabled:opacity-50">
                  {b.verified ? "Remove verified" : "Mark verified"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
