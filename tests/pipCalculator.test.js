/**
 * Zero-dependency test runner (plain Node `assert`).
 * Run with: node tests/pipCalculator.test.js
 */
const assert = require("assert");
const {
  pipSize,
  pipValuePerLot,
  calculateLotMetrics,
  lotsForRisk,
  listSymbols,
} = require("../js/pipCalculator");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ok  - ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

function approxEqual(a, b, eps = 1e-4) {
  assert.ok(Math.abs(a - b) < eps, `expected ${a} to be close to ${b}`);
}

console.log("pipSize");
test("4-decimal pair", () => approxEqual(pipSize(4), 0.0001));
test("2-decimal (JPY) pair", () => approxEqual(pipSize(2), 0.01));

console.log("pipValuePerLot");
test("EURUSD ~ $10/pip per standard lot", () => {
  approxEqual(pipValuePerLot("EURUSD", 1.0850, "USD"), 10.0, 0.01);
});
test("USDJPY divides by price", () => {
  const price = 150.0;
  const expected = (0.01 * 100000) / price; // 6.666...
  approxEqual(pipValuePerLot("USDJPY", price, "USD"), expected);
});
test("unknown symbol throws", () => {
  assert.throws(() => pipValuePerLot("NOTAPAIR", 1.0));
});
test("non-positive price throws", () => {
  assert.throws(() => pipValuePerLot("EURUSD", 0));
});

console.log("calculateLotMetrics");
test("1 standard lot EURUSD margin at 1:100", () => {
  const r = calculateLotMetrics("EURUSD", 1, 1.0850, 100);
  approxEqual(r.requiredMargin, (100000 * 1.0850) / 100);
  assert.strictEqual(r.units, 100000);
});
test("margin scales inversely with leverage", () => {
  const low = calculateLotMetrics("EURUSD", 1, 1.0850, 10);
  const high = calculateLotMetrics("EURUSD", 1, 1.0850, 200);
  assert.ok(low.requiredMargin > high.requiredMargin);
});
test("zero lots throws", () => {
  assert.throws(() => calculateLotMetrics("EURUSD", 0, 1.0850, 100));
});

console.log("lotsForRisk");
test("matches manual calc: 100 risk / (25 pips * $10) = 0.4 lots", () => {
  const lots = lotsForRisk("EURUSD", 100, 25, 1.0850);
  approxEqual(lots, 0.4, 0.01);
});
test("tighter stop loss -> more lots for same risk", () => {
  const wide = lotsForRisk("EURUSD", 100, 50, 1.0850);
  const tight = lotsForRisk("EURUSD", 100, 10, 1.0850);
  assert.ok(tight > wide);
});

console.log("listSymbols");
test("includes majors and gold", () => {
  const syms = listSymbols();
  assert.ok(syms.includes("EURUSD"));
  assert.ok(syms.includes("XAUUSD"));
  assert.ok(syms.includes("USDJPY"));
});
test("returns a sorted array", () => {
  const syms = listSymbols();
  const sorted = [...syms].sort();
  assert.deepStrictEqual(syms, sorted);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
