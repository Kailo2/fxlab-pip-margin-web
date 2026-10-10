/**
 * pipCalculator.js
 * Pure, dependency-free forex pip-value & margin math.
 * Works in both the browser (<script src>) and Node (CommonJS export at bottom).
 */

const SYMBOLS = {
  EURUSD: { quote: "USD", pipDecimal: 4, contractSize: 100000 },
  GBPUSD: { quote: "USD", pipDecimal: 4, contractSize: 100000 },
  AUDUSD: { quote: "USD", pipDecimal: 4, contractSize: 100000 },
  NZDUSD: { quote: "USD", pipDecimal: 4, contractSize: 100000 },
  USDJPY: { quote: "JPY", pipDecimal: 2, contractSize: 100000 },
  USDCHF: { quote: "CHF", pipDecimal: 4, contractSize: 100000 },
  USDCAD: { quote: "CAD", pipDecimal: 4, contractSize: 100000 },
  EURGBP: { quote: "GBP", pipDecimal: 4, contractSize: 100000 },
  EURJPY: { quote: "JPY", pipDecimal: 2, contractSize: 100000 },
  GBPJPY: { quote: "JPY", pipDecimal: 2, contractSize: 100000 },
  XAUUSD: { quote: "USD", pipDecimal: 2, contractSize: 100 },
};

function pipSize(pipDecimal) {
  return Math.pow(10, -pipDecimal);
}

/**
 * Pip value (in account currency) for ONE standard lot.
 * @param {string} symbol
 * @param {number} price - current market price of the pair
 * @param {string} accountCurrency
 * @param {number|null} quoteToAccountRate - required only for cross pairs
 *        whose quote currency differs from accountCurrency and isn't
 *        resolvable via a simple inverse of `price`.
 */
function pipValuePerLot(symbol, price, accountCurrency = "USD", quoteToAccountRate = null) {
  const meta = SYMBOLS[symbol];
  if (!meta) throw new Error(`Unknown symbol: ${symbol}`);
  if (!(price > 0)) throw new Error("price must be positive");

  const raw = pipSize(meta.pipDecimal) * meta.contractSize; // in quote currency

  if (meta.quote === accountCurrency) return raw;
  if (quoteToAccountRate != null) return raw * quoteToAccountRate;
  // default: assume account currency is the base of a XXX/account-style pair
  return raw / price;
}

/**
 * @returns {{pipValuePerLot:number, pipValueForLots:number, requiredMargin:number,
 *            units:number, contractSize:number}}
 */
function calculateLotMetrics(symbol, lots, price, leverage = 100, accountCurrency = "USD", quoteToAccountRate = null) {
  if (!(lots > 0)) throw new Error("lots must be positive");
  if (!(leverage > 0)) throw new Error("leverage must be positive");
  const meta = SYMBOLS[symbol];
  if (!meta) throw new Error(`Unknown symbol: ${symbol}`);

  const pvLot = pipValuePerLot(symbol, price, accountCurrency, quoteToAccountRate);
  const units = lots * meta.contractSize;
  const requiredMargin = (units * price) / leverage;

  return {
    pipValuePerLot: pvLot,
    pipValueForLots: pvLot * lots,
    requiredMargin,
    units,
    contractSize: meta.contractSize,
  };
}

/**
 * Lot size needed so that `stopLossPips` × pip-value-for-that-size == riskAmount.
 */
function lotsForRisk(symbol, riskAmount, stopLossPips, price, accountCurrency = "USD", quoteToAccountRate = null) {
  if (!(riskAmount > 0)) throw new Error("riskAmount must be positive");
  if (!(stopLossPips > 0)) throw new Error("stopLossPips must be positive");
  const pvLot = pipValuePerLot(symbol, price, accountCurrency, quoteToAccountRate);
  return riskAmount / (stopLossPips * pvLot);
}

function listSymbols() {
  return Object.keys(SYMBOLS).sort();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYMBOLS, pipSize, pipValuePerLot, calculateLotMetrics, lotsForRisk, listSymbols };
}
