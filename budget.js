/* Log unificato di tutte le spese legate al cibo: spesa al supermercato (cibo/altri articoli),
   ordini delivery e cene fuori. Ogni voce ha una data reale, così da poter fare
   aggregazioni settimanali E mensili in modo affidabile (il Menu Settimanale invece
   riusa i giorni della settimana come "slot" che si sovrascrivono ogni settimana). */

const BUDGET_LOG_KEY = "budgetLog";

function loadBudgetLog() {
  const raw = localStorage.getItem(BUDGET_LOG_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveBudgetLog(log) {
  localStorage.setItem(BUDGET_LOG_KEY, JSON.stringify(log));
}

/* categoria: "cibo" | "altri" | "consegna" | "fuori"
   extra (facoltativo): { pagatoDa, condivisa } per la divisione spese con i coinquilini */
function addBudgetEntry(categoria, importo, nota, extra) {
  const log = loadBudgetLog();
  log.push(Object.assign({
    id: "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    categoria,
    importo,
    nota: nota || "",
    data: Date.now()
  }, extra || {}));
  saveBudgetLog(log);
}
