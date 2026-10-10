# fxlab-pip-margin-web

A static, dependency-free web app that calculates **pip value and required
margin** for any forex lot size — with correct per-pair math (not the
"$10/pip for everything" shortcut most calculators use) and an optional
live-rate fetch.

## Live math, not a flat assumption

Pip value depends on the pair's **quote currency**, its **pip decimal
convention** (4 digits normally, 2 for JPY pairs), and its **contract
size**. This calculator derives it properly — see
[`js/pipCalculator.js`](js/pipCalculator.js).

```
pipValuePerLot = pipSize × contractSize                    (quote == account currency)
               = (pipSize × contractSize) / price           (account currency is the base, e.g. USD/XXX)
requiredMargin = (lots × contractSize × price) / leverage
```

## Run it

No build step, no dependencies. Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Live rates

Clicking **"دریافت قیمت زنده"** fetches the current rate from the free,
key-less [Frankfurter API](https://www.frankfurter.app) (ECB reference
rates). If the fetch fails or the symbol isn't a plain currency pair (e.g.
`XAUUSD`), the price field just stays manually editable — nothing breaks.

## Tests

Zero-dependency test suite using Node's built-in `assert`:

```bash
npm test
# or directly:
node tests/pipCalculator.test.js
```

13 tests covering pip-size derivation, pip value for USD-quote and
JPY-quote pairs, margin/leverage scaling, risk-based lot sizing, and
input validation.

## Project structure

```
index.html          UI
css/style.css        styling
js/pipCalculator.js   pure calculation functions (also used by tests)
js/rates.js            optional live-rate fetch (Frankfurter API)
js/app.js               DOM wiring
tests/pipCalculator.test.js
```

## Disclaimer

Educational tool, not financial advice. Verify against your broker's
actual contract specs before trading live.

## License

MIT — see [LICENSE](LICENSE).
