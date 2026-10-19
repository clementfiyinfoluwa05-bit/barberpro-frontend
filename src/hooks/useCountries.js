import { useEffect, useState } from "react";
import API from "../services/api";

let cache = null;
let pending = null;

// Loads the supported countries (with states / popular cities and areas) once per page load.
export default function useCountries() {
  const [countries, setCountries] = useState(cache);

  useEffect(() => {
    if (cache) return;
    pending ||= API.get("/meta/countries").then(({ data }) => (cache = data));
    pending.then(setCountries).catch(() => { pending = null; });
  }, []);

  return countries;
}

export const enabledCountries = (countries) =>
  Object.entries(countries || {}).filter(([, c]) => c.enabled);
