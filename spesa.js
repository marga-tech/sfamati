/* Logica della pagina Lista della Spesa. Richiede data.js e budget.js caricati prima di questo file. */

const MENU_STORAGE_KEY = "weeklyMenuData";
const CHECKED_KEY = "shoppingListChecked";
const EXTRA_KEY = "shoppingListExtra";
const ROOMMATES_KEY = "roommateNames";

const BUDGET_CATEGORIE = {
  cibo: { label: "Cibo (spesa)", colore: "var(--primario)" },
  altri: { label: "Altri articoli", colore: "var(--secondario)" },
  consegna: { label: "Consegne a domicilio", colore: "var(--giallo)" },
  fuori: { label: "Cene fuori", colore: "var(--viola)" }
};

let checkedState = loadChecked();
let extraItems = loadExtra();
let currentPeriod = "settimana";
let roommates = loadRoommates();

function loadRoommates() {
  const raw = localStorage.getItem(ROOMMATES_KEY);
  return raw ? JSON.parse(raw) : ["Io"];
}

function saveRoommates() {
  localStorage.setItem(ROOMMATES_KEY, JSON.stringify(roommates));
}

function loadChecked() {
  const raw = localStorage.getItem(CHECKED_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveChecked() {
  localStorage.setItem(CHECKED_KEY, JSON.stringify(checkedState));
}

function loadExtra() {
  const raw = localStorage.getItem(EXTRA_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveExtra() {
  localStorage.setItem(EXTRA_KEY, JSON.stringify(extraItems));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function generaListaSpesa() {
  const raw = localStorage.getItem(MENU_STORAGE_KEY);
  const menuData = raw ? JSON.parse(raw) : {};
  const aggregato = {};

  DAYS.forEach(day => {
    const giorno = menuData[day];
    if (!giorno) return;

    MEALS.forEach(meal => {
      const items = giorno[meal] || [];
      items.forEach(item => {
        if (item.tipo === "ricetta") {
          const ricetta = getRecipeById(item.ricettaId);
          if (!ricetta) return;
          const fattore = item.porzioni || 1;
          ricetta.ingredienti.forEach(ing => {
            const quantitaScalata = ing.quantita === null ? null : ing.quantita * fattore;
            addToAggregato(aggregato, ing.nome, quantitaScalata, ing.unita);
          });
        } else if (item.tipo === "libero") {
          addToAggregato(aggregato, item.nome, item.grammi, "g");
        }
      });
    });
  });

  return Object.values(aggregato).sort((a, b) => a.nome.localeCompare(b.nome));
}

function addToAggregato(agg, nome, quantita, unita) {
  const key = nome.trim().toLowerCase() + "|" + unita;
  if (!agg[key]) {
    agg[key] = { key, nome: nome.trim(), unita, quantita: unita === "q.b." ? null : 0 };
  }
  if (unita !== "q.b.") {
    agg[key].quantita += quantita;
  }
}

function renderShoppingList() {
  const lista = generaListaSpesa();
  const ul = document.getElementById("shoppingList");
  const emptyMsg = document.getElementById("emptyShoppingMessage");
  ul.innerHTML = "";

  if (lista.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  lista.forEach(item => {
    const li = document.createElement("li");
    li.className = "shopping-item";
    const checked = !!checkedState[item.key];
    if (checked) li.classList.add("checked");

    const qtyText = item.unita === "q.b." ? "q.b." : `${item.quantita} ${item.unita}`;

    li.innerHTML = `
      <label class="shopping-label">
        <input type="checkbox" data-key="${item.key}" ${checked ? "checked" : ""}>
        <span class="shopping-name">${escapeHtml(item.nome)}</span>
        <span class="shopping-qty">${qtyText}</span>
      </label>
    `;
    ul.appendChild(li);
  });
}

function handleCheckToggle(e) {
  if (e.target.type !== "checkbox") return;
  const key = e.target.dataset.key;
  checkedState[key] = e.target.checked;
  saveChecked();
  e.target.closest(".shopping-item").classList.toggle("checked", e.target.checked);
}

function renderExtraList() {
  const ul = document.getElementById("extraList");
  ul.innerHTML = "";

  if (extraItems.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-message";
    li.textContent = "Nessun articolo extra aggiunto.";
    ul.appendChild(li);
    return;
  }

  extraItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "shopping-item";
    if (item.comprato) li.classList.add("checked");

    li.innerHTML = `
      <label class="shopping-label">
        <input type="checkbox" data-index="${index}" ${item.comprato ? "checked" : ""}>
        <span class="shopping-name">${escapeHtml(item.nome)}</span>
        <span class="shopping-qty">${escapeHtml(item.quantita || "")}</span>
      </label>
      <button type="button" class="delete-food" data-index="${index}" aria-label="Rimuovi articolo">&times;</button>
    `;
    ul.appendChild(li);
  });
}

/* --- Coinquilini e divisione spese --- */

function renderRoommateSelect() {
  const select = document.getElementById("pagatoDaSelect");
  const current = select.value;
  select.innerHTML = roommates.map(nome => `<option value="${escapeHtml(nome)}">${escapeHtml(nome)}</option>`).join("");
  if (roommates.includes(current)) {
    select.value = current;
  }
}

function renderRoommateList() {
  const ul = document.getElementById("roommateList");
  ul.innerHTML = "";

  if (roommates.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-message";
    li.textContent = "Nessun coinquilino aggiunto.";
    ul.appendChild(li);
    return;
  }

  roommates.forEach((nome, index) => {
    const li = document.createElement("li");
    li.className = "shopping-item";
    li.innerHTML = `
      <span class="shopping-name">${escapeHtml(nome)}</span>
      <button type="button" class="delete-food" data-index="${index}" aria-label="Rimuovi coinquilino">&times;</button>
    `;
    ul.appendChild(li);
  });
}

function computeSettlement() {
  const entries = getFilteredBudgetLog().filter(e => e.condivisa && e.pagatoDa);
  const totaleCondiviso = entries.reduce((s, e) => s + e.importo, 0);

  if (roommates.length < 2 || totaleCondiviso === 0) {
    return { totaleCondiviso, saldi: [], trasferimenti: [] };
  }

  const fairShare = totaleCondiviso / roommates.length;
  const pagatoPer = {};
  roommates.forEach(nome => { pagatoPer[nome] = 0; });
  entries.forEach(e => {
    if (pagatoPer[e.pagatoDa] === undefined) pagatoPer[e.pagatoDa] = 0;
    pagatoPer[e.pagatoDa] += e.importo;
  });

  const saldi = roommates.map(nome => ({
    nome,
    saldo: (pagatoPer[nome] || 0) - fairShare
  }));

  // Algoritmo greedy: abbina chi deve ricevere con chi deve dare, minimizzando i trasferimenti
  const creditori = saldi.filter(s => s.saldo > 0.01).map(s => ({ nome: s.nome, importo: s.saldo })).sort((a, b) => b.importo - a.importo);
  const debitori = saldi.filter(s => s.saldo < -0.01).map(s => ({ nome: s.nome, importo: -s.saldo })).sort((a, b) => b.importo - a.importo);
  const trasferimenti = [];

  let i = 0, j = 0;
  while (i < debitori.length && j < creditori.length) {
    const debitore = debitori[i];
    const creditore = creditori[j];
    const importo = Math.min(debitore.importo, creditore.importo);
    trasferimenti.push({ da: debitore.nome, a: creditore.nome, importo });
    debitore.importo -= importo;
    creditore.importo -= importo;
    if (debitore.importo < 0.01) i++;
    if (creditore.importo < 0.01) j++;
  }

  return { totaleCondiviso, saldi, trasferimenti };
}

function renderSettlement() {
  const el = document.getElementById("settlementSummary");
  const { totaleCondiviso, saldi, trasferimenti } = computeSettlement();

  if (roommates.length < 2) {
    el.innerHTML = '<p class="empty-message">Aggiungi almeno un coinquilino per calcolare la divisione delle spese.</p>';
    return;
  }

  if (totaleCondiviso === 0) {
    el.innerHTML = '<p class="empty-message">Nessuna spesa condivisa registrata in questo periodo.</p>';
    return;
  }

  const saldiHtml = saldi.map(s => {
    const classe = s.saldo > 0.01 ? "balance-positive" : s.saldo < -0.01 ? "balance-negative" : "";
    const testo = s.saldo > 0.01
      ? `deve ricevere € ${s.saldo.toFixed(2)}`
      : s.saldo < -0.01
        ? `deve dare € ${Math.abs(s.saldo).toFixed(2)}`
        : "in pari";
    return `<div class="settlement-line ${classe}"><span>${escapeHtml(s.nome)}</span><span>${testo}</span></div>`;
  }).join("");

  const trasferimentiHtml = trasferimenti.length > 0
    ? `<p class="panel-hint">Per pareggiare i conti:</p>` + trasferimenti.map(t =>
        `<div class="settlement-line settlement-transfer"><span>${escapeHtml(t.da)} → ${escapeHtml(t.a)}</span><span>€ ${t.importo.toFixed(2)}</span></div>`
      ).join("")
    : `<p class="panel-hint">I conti sono già in pari.</p>`;

  el.innerHTML = saldiHtml + trasferimentiHtml;
}

/* --- Budget: periodo, filtri, grafico --- */

function getPeriodRange(period) {
  const now = new Date();
  if (period === "mese") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
  }
  // settimana: da lunedì a domenica della settimana corrente
  const dayIndex = (now.getDay() + 6) % 7; // 0 = lunedì
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - dayIndex);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.getTime(), end: sunday.getTime() };
}

function getFilteredBudgetLog() {
  const { start, end } = getPeriodRange(currentPeriod);
  return loadBudgetLog().filter(entry => entry.data >= start && entry.data <= end);
}

function aggregateByCategoria(entries) {
  const agg = { cibo: 0, altri: 0, consegna: 0, fuori: 0 };
  entries.forEach(entry => {
    if (agg[entry.categoria] !== undefined) {
      agg[entry.categoria] += entry.importo;
    }
  });
  return agg;
}

function renderBudgetChart() {
  const entries = getFilteredBudgetLog();
  const agg = aggregateByCategoria(entries);
  const totale = Object.values(agg).reduce((s, v) => s + v, 0);

  const chartEl = document.getElementById("budgetChart");
  const legendEl = document.getElementById("budgetLegend");

  if (totale === 0) {
    chartEl.innerHTML = '<p class="empty-message">Nessuna spesa registrata in questo periodo.</p>';
    legendEl.innerHTML = "";
  } else {
    chartEl.innerHTML = Object.keys(BUDGET_CATEGORIE).map(cat => {
      const valore = agg[cat];
      if (valore <= 0) return "";
      const pct = (valore / totale) * 100;
      return `<div class="budget-chart-segment" style="width:${pct}%; background-color:${BUDGET_CATEGORIE[cat].colore}" title="${budgetCategoriaLabel(cat)}: €${valore.toFixed(2)}"></div>`;
    }).join("");

    legendEl.innerHTML = Object.keys(BUDGET_CATEGORIE).map(cat => {
      const valore = agg[cat];
      return `
        <div class="budget-legend-item">
          <span class="budget-legend-dot" style="background-color:${BUDGET_CATEGORIE[cat].colore}"></span>
          <span class="budget-legend-label">${budgetCategoriaLabel(cat)}</span>
          <span class="budget-legend-value">€ ${valore.toFixed(2)}</span>
        </div>
      `;
    }).join("");
  }

  document.getElementById("budgetGrandTotal").textContent = `€ ${totale.toFixed(2)}`;
}

function renderExpenseList() {
  const entries = getFilteredBudgetLog().slice().sort((a, b) => b.data - a.data);
  const ul = document.getElementById("expenseList");
  ul.innerHTML = "";

  if (entries.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-message";
    li.textContent = "Nessuna spesa registrata in questo periodo.";
    ul.appendChild(li);
    return;
  }

  entries.forEach(entry => {
    const li = document.createElement("li");
    li.className = "shopping-item";
    const dataText = new Date(entry.data).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
    const catLabel = BUDGET_CATEGORIE[entry.categoria] ? budgetCategoriaLabel(entry.categoria) : entry.categoria;
    li.innerHTML = `
      <span class="shopping-name">€ ${entry.importo.toFixed(2)} &middot; ${escapeHtml(catLabel)}${entry.nota ? " &middot; " + escapeHtml(entry.nota) : ""}</span>
      <span class="shopping-qty">${dataText}</span>
      <button type="button" class="delete-food" data-id="${entry.id}" aria-label="Rimuovi spesa">&times;</button>
    `;
    ul.appendChild(li);
  });
}

function refreshBudgetUI() {
  renderBudgetChart();
  renderExpenseList();
  renderSettlement();
}

function attachEvents() {
  document.getElementById("refreshBtn").addEventListener("click", renderShoppingList);
  document.getElementById("shoppingList").addEventListener("change", handleCheckToggle);

  document.getElementById("clearCheckedBtn").addEventListener("click", () => {
    checkedState = {};
    saveChecked();
    renderShoppingList();
  });

  document.getElementById("extraForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const nome = form.nome.value.trim();
    const quantita = form.quantita.value.trim();
    if (!nome) return;

    extraItems.push({ nome, quantita, comprato: false });
    saveExtra();
    form.reset();
    renderExtraList();
  });

  const extraList = document.getElementById("extraList");
  extraList.addEventListener("change", (e) => {
    if (e.target.type !== "checkbox") return;
    const index = Number(e.target.dataset.index);
    extraItems[index].comprato = e.target.checked;
    saveExtra();
    e.target.closest(".shopping-item").classList.toggle("checked", e.target.checked);
  });

  extraList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete-food")) return;
    const index = Number(e.target.dataset.index);
    extraItems.splice(index, 1);
    saveExtra();
    renderExtraList();
  });

  document.getElementById("periodToggle").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    currentPeriod = btn.dataset.period;
    document.querySelectorAll("#periodToggle .filter-chip").forEach(b => b.classList.toggle("active", b === btn));
    refreshBudgetUI();
  });

  document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const importo = parseFloat(form.importo.value);
    const categoria = form.categoria.value;
    const nota = form.nota.value.trim();
    const pagatoDa = form.pagatoDa.value;
    const condivisa = form.condivisa.checked;
    if (isNaN(importo) || importo < 0) return;

    addBudgetEntry(categoria, importo, nota, { pagatoDa, condivisa });
    form.reset();
    refreshBudgetUI();
  });

  document.getElementById("expenseList").addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete-food")) return;
    const id = e.target.dataset.id;
    const log = loadBudgetLog().filter(entry => entry.id !== id);
    saveBudgetLog(log);
    refreshBudgetUI();
  });

  document.getElementById("roommateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const nome = form.nome.value.trim();
    if (!nome || roommates.includes(nome)) return;

    roommates.push(nome);
    saveRoommates();
    form.reset();
    renderRoommateList();
    renderRoommateSelect();
    renderSettlement();
  });

  document.getElementById("roommateList").addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete-food")) return;
    const index = Number(e.target.dataset.index);
    roommates.splice(index, 1);
    saveRoommates();
    renderRoommateList();
    renderRoommateSelect();
    renderSettlement();
  });
}

function init() {
  attachEvents();
  renderShoppingList();
  renderExtraList();
  renderRoommateSelect();
  renderRoommateList();
  refreshBudgetUI();
}

document.addEventListener("DOMContentLoaded", init);
