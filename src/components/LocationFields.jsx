import useCountries, { enabledCountries } from "../hooks/useCountries";

const input = "w-full bg-page border border-line text-ink px-4 py-3 rounded focus:outline-none focus:border-brand";

// Country / state / city / area inputs. `value` = { country, state, city, area }.
export default function LocationFields({ value, onChange, required = true }) {
  const countries = useCountries();
  const country = countries?.[value.country];
  const areaSuggestions = country?.popularAreas?.[value.city] || country?.popularAreas?.[value.state] || [];
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-muted mb-1 block">Country</label>
        <select value={value.country} onChange={set("country")} required={required} className={input}>
          {!countries && <option value={value.country}>Loading…</option>}
          {enabledCountries(countries).map(([code, c]) => <option key={code} value={code}>{c.name}</option>)}
          {Object.entries(countries || {}).filter(([, c]) => !c.enabled).map(([code, c]) => (
            <option key={code} value={code} disabled>{c.name} (coming soon)</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-muted mb-1 block">State / Region</label>
        {country?.states ? (
          <select value={value.state} onChange={set("state")} required={required} className={input}>
            <option value="">-- Select state --</option>
            {country.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <input value={value.state} onChange={set("state")} required={required} className={input} placeholder="State or region" />
        )}
      </div>
      <div>
        <label className="text-sm text-muted mb-1 block">City / Town</label>
        <input value={value.city} onChange={set("city")} required={required} list="city-suggestions" className={input} placeholder="e.g. Lagos" />
        <datalist id="city-suggestions">
          {(country?.popularCities || []).map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div>
        <label className="text-sm text-muted mb-1 block">Area / Neighbourhood</label>
        <input value={value.area} onChange={set("area")} required={required} list="area-suggestions" className={input} placeholder="e.g. Ikeja" />
        <datalist id="area-suggestions">
          {areaSuggestions.map((a) => <option key={a} value={a} />)}
        </datalist>
      </div>
    </div>
  );
}
