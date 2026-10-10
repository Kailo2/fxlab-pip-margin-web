/**
 * app.js — DOM wiring for the pip & margin calculator page.
 * Depends on pipCalculator.js and rates.js being loaded first (plain <script> tags).
 */
(function () {
  const symbolSelect = document.getElementById("symbol");
  const lotsInput = document.getElementById("lots");
  const priceInput = document.getElementById("price");
  const leverageInput = document.getElementById("leverage");
  const accountCurrencySelect = document.getElementById("accountCurrency");
  const fetchLiveBtn = document.getElementById("fetchLive");
  const liveStatus = document.getElementById("liveStatus");
  const form = document.getElementById("calcForm");
  const resultBox = document.getElementById("result");

  // populate symbol dropdown
  listSymbols().forEach((sym) => {
    const opt = document.createElement("option");
    opt.value = sym;
    opt.textContent = sym;
    symbolSelect.appendChild(opt);
  });
  symbolSelect.value = "EURUSD";

  async function fetchLivePrice() {
    const symbol = symbolSelect.value;
    liveStatus.textContent = "در حال دریافت قیمت زنده...";
    liveStatus.className = "status loading";
    const price = await getPriceForSymbol(symbol);
    if (price == null) {
      liveStatus.textContent = "قیمت زنده در دسترس نیست -- دستی وارد کن";
      liveStatus.className = "status error";
      return;
    }
    priceInput.value = price.toFixed(symbol.includes("JPY") ? 2 : 4);
    liveStatus.textContent = `قیمت زنده دریافت شد (${new Date().toLocaleTimeString()})`;
    liveStatus.className = "status ok";
  }

  function renderResult(data) {
    resultBox.hidden = false;
    resultBox.innerHTML = `
      <div class="result-row"><span>ارزش هر پیپ (برای ${data.lots} لات)</span><strong>${data.pipValueForLots.toFixed(2)} ${data.accountCurrency}</strong></div>
      <div class="result-row"><span>ارزش پیپ برای ۱ لات استاندارد</span><strong>${data.pipValuePerLot.toFixed(4)} ${data.accountCurrency}</strong></div>
      <div class="result-row"><span>حجم پوزیشن (واحد)</span><strong>${data.units.toLocaleString()}</strong></div>
      <div class="result-row"><span>مارجین لازم (لوریج ۱:${data.leverage})</span><strong>${data.requiredMargin.toFixed(2)} ${data.accountCurrency}</strong></div>
    `;
  }

  function renderError(message) {
    resultBox.hidden = false;
    resultBox.innerHTML = `<div class="result-row error"><span>خطا</span><strong>${message}</strong></div>`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const symbol = symbolSelect.value;
    const lots = parseFloat(lotsInput.value);
    const price = parseFloat(priceInput.value);
    const leverage = parseInt(leverageInput.value, 10);
    const accountCurrency = accountCurrencySelect.value;

    try {
      const metrics = calculateLotMetrics(symbol, lots, price, leverage, accountCurrency);
      renderResult({ ...metrics, symbol, lots, leverage, accountCurrency });
    } catch (err) {
      renderError(err.message);
    }
  });

  fetchLiveBtn.addEventListener("click", fetchLivePrice);
})();
