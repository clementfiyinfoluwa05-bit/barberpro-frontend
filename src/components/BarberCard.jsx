import { Link } from "react-router-dom";
import { formatMoney, lowestPrice, placeLabel } from "../utils/format";

export default function BarberCard({ barber }) {
  const from = lowestPrice(barber.services);
  const photo = barber.photos?.[0];
  const initials = barber.displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Link
      to={`/barbers/${barber.slug}`}
      className="bg-card border border-line hover:border-brand rounded-lg overflow-hidden transition group flex flex-col"
    >
      {photo ? (
        <div style={{ backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center", height: "170px" }} />
      ) : (
        <div className="h-[170px] bg-soft flex items-center justify-center text-4xl font-bold text-brand">{initials}</div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-ink group-hover:text-brand transition break-words">{barber.displayName}</h3>
          {barber.verified && (
            <span className="shrink-0 text-[11px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">✓ Verified</span>
          )}
        </div>
        <p className="text-muted text-xs">📍 {placeLabel(barber.location) || "Location not set"}</p>
        <div className="flex flex-wrap gap-1">
          {barber.homeService && <span className="text-[11px] border border-brand text-brand px-2 py-0.5 rounded">Home service</span>}
          {barber.shopService && <span className="text-[11px] border border-line text-ink-2 px-2 py-0.5 rounded">In-shop</span>}
          {barber.distanceKm !== undefined && <span className="text-[11px] text-muted px-1 py-0.5">{barber.distanceKm} km away</span>}
        </div>
        <p className="text-brand text-sm font-bold mt-auto pt-1">
          {from !== null ? `From ${formatMoney(from, barber.currency)}` : "Prices on request"}
        </p>
      </div>
    </Link>
  );
}
