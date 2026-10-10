/**
 * rates.js — optional live-rate fetching.
 * Uses the free, no-API-key Frankfurter API (https://www.frankfurter.app, ECB data).
 * If the fetch fails (offline, CORS, rate limit) the UI falls back to manual price entry.
 */

const FRANKFURTER_BASE = "https://api.frankfurter.app";

/**
 * Fetch a single pair rate, e.g. getRate("EUR", "USD") -> price of 1 EUR in USD.
 * Returns null on any failure so callers can gracefully fall back.
 */
async function getRate(base, quote) {
  try {
    const res = await fetch(`${FRANKFURTER_BASE}/latest?from=${base}&to=${quote}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.rates ? data.rates[quote] ?? null : null;
  } catch (e) {
    console.warn("Live rate fetch failed, falling back to manual entry:", e.message);
    return null;
  }
}

/**
 * Given a symbol like "EURUSD", split into base/quote and fetch its price.
 * Note: Frankfurter is ECB-sourced forex only (no metals like XAU) — for
 * XAUUSD or anything unsupported this will resolve to null, which the UI
 * treats as "enter price manually".
 */
async function getPriceForSymbol(symbol) {
  if (symbol.length !== 6) return null;
  const base = symbol.slice(0, 3);
  const quote = symbol.slice(3, 6);
  return getRate(base, quote);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getRate, getPriceForSymbol, FRANKFURTER_BASE };
}
