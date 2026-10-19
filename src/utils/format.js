// "₦5,000" for NGN, "£25" for GBP, etc.
export const formatMoney = (amount, currency = "NGN") => {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
};

export const priceLabel = (service, currency) =>
  (service.priceType === "from" ? "From " : "") + formatMoney(service.price, currency);

export const lowestPrice = (services = []) =>
  services.length ? Math.min(...services.map((s) => Number(s.price) || 0)) : null;

export const placeLabel = (location = {}) =>
  [location.area, location.city, location.state].filter(Boolean).join(", ");

export const errorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || fallback;
