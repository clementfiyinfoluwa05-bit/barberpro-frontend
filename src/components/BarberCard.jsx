import { Link } from "react-router-dom";
import { formatMoney, lowestPrice, placeLabel } from "../utils/format";

export default function BarberCard({ barber }) {
  const from = lowestPrice(barber.services);
  const photo = barber.photos?.[0];
  const initials = barber.displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Link
      to={`/barbers/${barber.slug}`}
      className="bg-zinc-900 border border-zinc-700 hover:border-yellow-400 rounded-lg overflow-hidden transition group flex flex-col"
    >
      {photo ? (
        <div style={{ backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center", height: "170px" }} />
      ) : (
        <div className="h-[170px] bg-zinc-800 flex items-center justify-center text-4xl font-bold text-yellow-400">{initials}</div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-white group-hover:text-yellow-400 transition break-words">{barber.displayName}</h3>
          {barber.verified && (
            <span className="shrink-0 text-[11px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">✓ Verified</span>
          )}
        </div>
        <p className="text-gray-400 text-xs">📍 {placeLabel(barber.location) || "Location not set"}</p>
        <div className="flex flex-wrap gap-1">
          {barber.homeService && <span className="text-[11px] border border-yellow-400 text-yellow-400 px-2 py-0.5 rounded">Home service</span>}
          {barber.shopService && <span className="text-[11px] border border-zinc-500 text-gray-300 px-2 py-0.5 rounded">In-shop</span>}
          {barber.distanceKm !== undefined && <span className="text-[11px] text-gray-400 px-1 py-0.5">{barber.distanceKm} km away</span>}
        </div>
        <p className="text-yellow-400 text-sm font-bold mt-auto pt-1">
          {from !== null ? `From ${formatMoney(from, barber.currency)}` : "Prices on request"}
        </p>
      </div>
    </Link>
  );
}
