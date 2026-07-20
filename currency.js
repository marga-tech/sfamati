/* Convertitore valuta. Il tasso è impostato manualmente e persistito, con un tentativo
   opzionale di aggiornamento automatico (fallisce silenziosamente se offline). */

const CURRENCY_KEY = "currencyPref";

const CURRENCIES = [
  "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF",
  "RON", "BGN", "TRY", "USD", "ISK", "HRK"
];

function loadCurrencyPref() {
  const raw = localStorage.getItem(CURRENCY_KEY);
  return raw ? JSON.parse(raw) : { code: "GBP", rate: null };
}

function saveCurrencyPref(pref) {
  localStorage.setItem(CURRENCY_KEY, JSON.stringify(pref));
}

function initCurrencyConverter() {
  const codeSelect = document.getElementById("currencyCodeSelect");
  const rateInput = document.getElementById("currencyRateInput");
  const amountEurInput = document.getElementById("currencyAmountEur");
  const amountLocalEl = document.getElementById("currencyAmountLocal");
  const refreshBtn = document.getElementById("currencyRefreshBtn");
  const statusEl = document.getElementById("currencyStatus");

  if (!codeSelect) return;

  codeSelect.innerHTML = CURRENCIES.map(code => `<option value="${code}">${code}</option>`).join("");

  const pref = loadCurrencyPref();
  codeSelect.value = pref.code;
  if (pref.rate) rateInput.value = pref.rate;

  function updateConversion() {
    const rate = parseFloat(rateInput.value);
    const amount = parseFloat(amountEurInput.value) || 0;
    if (isNaN(rate) || rate <= 0) {
      amountLocalEl.textContent = "—";
      return;
    }
    amountLocalEl.textContent = `${(amount * rate).toFixed(2)} ${codeSelect.value}`;
  }

  function persistPref() {
    const rate = parseFloat(rateInput.value);
    saveCurrencyPref({ code: codeSelect.value, rate: isNaN(rate) ? null : rate });
  }

  codeSelect.addEventListener("change", () => {
    persistPref();
    updateConversion();
  });

  rateInput.addEventListener("input", () => {
    persistPref();
    updateConversion();
  });

  amountEurInput.addEventListener("input", updateConversion);

  refreshBtn.addEventListener("click", async () => {
    statusEl.textContent = t("spesa.currencyUpdating");
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${codeSelect.value}`);
      if (!response.ok) throw new Error("network");
      const data = await response.json();
      const rate = data.rates && data.rates[codeSelect.value];
      if (!rate) throw new Error("no-rate");
      rateInput.value = rate.toFixed(4);
      persistPref();
      updateConversion();
      statusEl.textContent = t("spesa.currencyUpdated");
    } catch (err) {
      statusEl.textContent = t("spesa.currencyUpdateFailed");
    }
  });

  updateConversion();
}

document.addEventListener("DOMContentLoaded", initCurrencyConverter);
