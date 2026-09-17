/* Logica della pagina Menu Settimanale. Richiede data.js e photos.js caricati prima di questo file.
   Le calorie vengono comunque calcolate e salvate (le legge la pagina Calorie),
   ma qui non vengono mostrate per tenere il menu leggero e senza pressioni sui numeri. */

const STORAGE_KEY = "weeklyMenuData";
const WEEK_START_KEY = "menuWeekStart";
const HISTORY_KEY = "menuHistory";
const MAX_HISTORY_WEEKS = 26;
const TEMPLATE_KEY = "weeklyMealTemplates";

let data = loadData();
let activeDay = getTodayKey();
let photoCache = new Map(); // entryId -> object URL

function getTodayKey() {
  const map = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
  return map[new Date().getDay()];
}

function formatDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMondayString(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 = domenica
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  d.setDate(d.getDate() + diff);
  return formatDateLocal(d);
}

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function weekHasContent(weekData) {
  return DAYS.some(day => MEALS.some(meal => (weekData[day] && weekData[day][meal] && weekData[day][meal].length > 0)));
}

function archiveWeek(weekStart, weekData) {
  const history = loadHistory();
  history.push({ weekStart, savedAt: Date.now(), data: weekData });
  history.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  while (history.length > MAX_HISTORY_WEEKS) history.shift();
  saveHistory(history);
}

function checkWeekRollover() {
  const thisMonday = getMondayString(new Date());
  const storedMonday = localStorage.getItem(WEEK_START_KEY);

  if (!storedMonday) {
    localStorage.setItem(WEEK_START_KEY, thisMonday);
    return;
  }

  if (storedMonday !== thisMonday) {
    if (weekHasContent(data)) {
      archiveWeek(storedMonday, data);
    }
    data = emptyData();
    saveData();
    localStorage.setItem(WEEK_START_KEY, thisMonday);
  }
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* dati corrotti, si riparte da vuoto */ }
  }
  return emptyData();
}

function emptyData() {
  const empty = {};
  const templates = loadMealTemplates();
  DAYS.forEach(day => {
    empty[day] = {};
    MEALS.forEach(meal => {
      const tpl = templates[meal];
      empty[day][meal] = tpl ? [{ ...tpl, entryId: generateEntryId() }] : [];
    });
  });
  return empty;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* --- Pasti fissi per tutta la settimana --- */

function loadMealTemplates() {
  const raw = localStorage.getItem(TEMPLATE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* dati corrotti, si riparte da vuoto */ }
  }
  return { colazione: null, pranzo: null, cena: null, spuntini: null };
}

function saveMealTemplates(templates) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
}

function entriesEqual(a, b) {
  if (!a || !b) return false;
  if (a.tipo !== b.tipo) return false;
  if (a.tipo === "ricetta") return a.ricettaId === b.ricettaId && a.porzioni === b.porzioni;
  if (a.tipo === "libero") return a.nome === b.nome && a.kcal100 === b.kcal100 && a.grammi === b.grammi;
  return false;
}

/* Un giorno è "libero da personalizzazioni" (quindi può essere sovrascritto quando si
   aggiorna un pasto fisso) se è vuoto, oppure se contiene esattamente la vecchia scelta
   fissata: in quel caso significa che l'utente non l'ha mai toccato a mano. */
function dayMatchesTemplate(dayMealArray, templateEntry) {
  if (!templateEntry) return true;
  if (!dayMealArray || dayMealArray.length === 0) return true;
  return dayMealArray.length === 1 && entriesEqual(dayMealArray[0], templateEntry);
}

function applyMealTemplateToAllDays(meal, entry) {
  const templates = loadMealTemplates();
  const oldTemplate = templates[meal];
  const isFirstTime = !oldTemplate;

  DAYS.forEach(day => {
    const current = data[day][meal];
    if (isFirstTime || dayMatchesTemplate(current, oldTemplate)) {
      data[day][meal] = [{ ...entry, entryId: generateEntryId() }];
    }
  });

  templates[meal] = entry;
  saveMealTemplates(templates);
  saveData();
}

function removeMealTemplate(meal) {
  const templates = loadMealTemplates();
  templates[meal] = null;
  saveMealTemplates(templates);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* --- Generazione automatica del menu --- */

const AUTOGEN_PESCE_REGEX = /salmone|tonno|gamber|merluzzo|branzino|orata|cozze|vongole|calamar|polpo|acciughe|sgombro|pesce spada|baccal|seppie|nasello|trota|sardine|capesante/i;

function autoGenContienePesce(recipe) {
  return AUTOGEN_PESCE_REGEX.test(recipe.nome) || recipe.ingredienti.some(ing => AUTOGEN_PESCE_REGEX.test(ing.nome));
}

/* Stessi allergeni/regex usati nella pagina Ricette, duplicati qui perché il Menu non carica ricette.js. */
const AUTOGEN_ALLERGENI = {
  glutine: /\bpasta\b|\bpane\b|farina|gnocchi|cous cous|\borzo\b|\bfarro\b|pizza|panino|toast|biscott|torta|muffin|cr[eè]pes|piadina|pancake|waffle|grissini|taralli|cracker|lasagna|bagel|tortilla|besciamella|seitan/i,
  lattosio: /\blatte\b|formaggio|yogurt|panna|besciamella|\bburro\b|mozzarella|ricotta|parmigiano|gorgonzola|\bfeta\b|mascarpone|\bskyr\b|philadelphia/i,
  frutta_guscio: /mandorl|nocciol|pistacchi|anacardi|\bnoci\b|arachidi/i,
  uova: /\buov[ao]\b/i
};

let autoGenAllergeniEsclusi = new Set();

function autoGenContieneAllergene(recipe, chiave) {
  const regex = AUTOGEN_ALLERGENI[chiave];
  if (!regex) return false;
  return regex.test(recipe.nome) || recipe.ingredienti.some(ing => regex.test(ing.nome));
}

function autoGenContieneTermine(recipe, termine) {
  if (!termine) return false;
  return recipe.nome.toLowerCase().includes(termine) || recipe.ingredienti.some(ing => ing.nome.toLowerCase().includes(termine));
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Interlaccia le ricette per stile (leggero/bilanciato/goloso) così che la settimana
   non finisca per essere tutta dello stesso tipo. */
function buildBalancedPool(recipes) {
  const groups = { leggero: [], bilanciato: [], goloso: [] };
  recipes.forEach(r => {
    if (groups[r.stile]) groups[r.stile].push(r);
  });
  Object.keys(groups).forEach(k => { groups[k] = shuffleArray(groups[k]); });

  const order = ["bilanciato", "leggero", "goloso"];
  const result = [];
  let anyLeft = true;
  while (anyLeft) {
    anyLeft = false;
    order.forEach(stile => {
      if (groups[stile].length > 0) {
        result.push(groups[stile].pop());
        anyLeft = true;
      }
    });
  }
  return result;
}

/* Interlaccia le ricette secondo un ordine di priorità sullo stile: usata da buildBalancedPool
   (ordine di default) e dalle modalità di generazione automatica (fitness/goloso/ecc.). */
function buildPrioritizedPool(recipes, order) {
  const groups = { leggero: [], bilanciato: [], goloso: [] };
  recipes.forEach(r => {
    if (groups[r.stile]) groups[r.stile].push(r);
  });
  Object.keys(groups).forEach(k => { groups[k] = shuffleArray(groups[k]); });

  const result = [];
  let anyLeft = true;
  while (anyLeft) {
    anyLeft = false;
    order.forEach(stile => {
      if (groups[stile].length > 0) {
        result.push(groups[stile].pop());
        anyLeft = true;
      }
    });
  }
  return result;
}

/* Modalità di generazione automatica del menu settimanale.
   - misto: bilancia leggero/bilanciato/goloso in parti uguali (comportamento storico).
   - fitness: privilegia ricette leggere e, quando possibile, con meno calorie.
   - veloce: usa solo ricette rapide (tempo di preparazione breve).
   - goloso: privilegia ricette comfort food/più ricche. */
const AUTOGEN_MODES = {
  misto: { order: ["bilanciato", "leggero", "goloso"] },
  fitness: { order: ["leggero", "bilanciato", "goloso"], kcalMax: 500 },
  veloce: { order: ["bilanciato", "leggero", "goloso"], soloVeloci: true },
  goloso: { order: ["goloso", "bilanciato", "leggero"] }
};

function pickForWeek(pool, count) {
  if (pool.length === 0) return [];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[i % pool.length]);
  }
  return result;
}

function generaMenuAutomatico(options) {
  let riempiti = 0;
  const modeConfig = AUTOGEN_MODES[options.modalita] || AUTOGEN_MODES.misto;
  const mealTemplates = loadMealTemplates();

  MEALS.forEach(meal => {
    if (mealTemplates[meal]) return; // pasto fissato per la settimana: la generazione automatica non lo tocca

    const categoria = MEAL_TO_CATEGORIA[meal];
    let candidati = getRecipesByCategoria(categoria);
    if (options.escludiPesce) candidati = candidati.filter(r => !autoGenContienePesce(r));
    if (options.allergeni && options.allergeni.length) {
      candidati = candidati.filter(r => !options.allergeni.some(a => autoGenContieneAllergene(r, a)));
    }
    if (options.evita && options.evita.length) {
      candidati = candidati.filter(r => !options.evita.some(termine => autoGenContieneTermine(r, termine)));
    }
    if (modeConfig.soloVeloci) candidati = candidati.filter(r => r.tempo === "veloce");
    if (modeConfig.kcalMax) {
      const filtrati = candidati.filter(r => r.kcalPortion <= modeConfig.kcalMax);
      if (filtrati.length >= Math.min(3, candidati.length)) candidati = filtrati;
    }
    if (candidati.length === 0) return;

    const pool = buildPrioritizedPool(candidati, modeConfig.order);
    const scelte = pickForWeek(pool, DAYS.length);

    DAYS.forEach((day, index) => {
      const slotVuoto = data[day][meal].length === 0;
      if (!slotVuoto && !options.sovrascrivi) return;

      const ricetta = scelte[index];
      if (!ricetta) return;

      if (!slotVuoto) data[day][meal] = [];

      data[day][meal].push({
        entryId: generateEntryId(),
        tipo: "ricetta",
        ricettaId: ricetta.id,
        nome: ricetta.nome,
        emoji: ricetta.emoji,
        porzioni: 1,
        kcalTotali: ricetta.kcalPortion
      });
      riempiti++;
    });
  });

  saveData();
  return riempiti;
}

function attachAutoGenerateEvents() {
  document.getElementById("autoGenAllergeniFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    const chiave = btn.dataset.allergene;
    if (autoGenAllergeniEsclusi.has(chiave)) {
      autoGenAllergeniEsclusi.delete(chiave);
      btn.classList.remove("active");
    } else {
      autoGenAllergeniEsclusi.add(chiave);
      btn.classList.add("active");
    }
  });

  document.getElementById("autoGenerateBtn").addEventListener("click", () => {
    const evitaRaw = document.getElementById("autoGenEvita").value;
    const evita = evitaRaw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

    const options = {
      modalita: document.getElementById("autoGenModalita").value,
      escludiPesce: document.getElementById("autoGenPesce").checked,
      sovrascrivi: document.getElementById("autoGenOverwrite").checked,
      allergeni: [...autoGenAllergeniEsclusi],
      evita
    };

    const riempiti = generaMenuAutomatico(options);
    renderAllMeals(activeDay);

    const statusEl = document.getElementById("autoGenerateStatus");
    statusEl.textContent = riempiti > 0
      ? t("menu.autoGenerateDone").replace("{n}", riempiti)
      : t("menu.autoGenerateNothing");
  });
}

const RECIPE_PICKER_LIMIT = 40;

/* Selettore di ricette pensato per il touch/mobile: al posto del vecchio
   <input list> + <datalist> (poco affidabile su Safari/Chrome mobile, sia per
   la visibilità del suggerimento che per il filtro durante la digitazione),
   qui c'è un pulsante ben visibile che apre un pannello con ricerca dal vivo
   e risultati come pulsanti grandi e toccabili. */
function buildRecipePickerHtml(categoria) {
  return `
    <div class="recipe-picker" data-categoria="${categoria}">
      <input type="hidden" name="ricettaNome">
      <button type="button" class="recipe-picker-toggle">${escapeHtml(t("menu.recipePickerToggle"))}</button>
      <div class="recipe-picker-panel" hidden>
        <input type="text" class="recipe-picker-search" placeholder="${escapeHtml(t("menu.recipePickerSearchPlaceholder"))}" autocomplete="off">
        <div class="recipe-picker-results"></div>
      </div>
    </div>
  `;
}

function renderRecipePickerResults(picker, query) {
  const categoria = picker.dataset.categoria;
  const resultsEl = picker.querySelector(".recipe-picker-results");
  const all = getRecipesByCategoria(categoria);
  const q = query.trim().toLowerCase();
  const matches = q ? all.filter(r => r.nome.toLowerCase().includes(q)) : all;
  const shown = matches.slice(0, RECIPE_PICKER_LIMIT);

  resultsEl.innerHTML = "";

  if (shown.length === 0) {
    resultsEl.innerHTML = `<p class="recipe-picker-empty">${escapeHtml(t("menu.recipePickerNoResults"))}</p>`;
    return;
  }

  shown.forEach(r => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "recipe-picker-result";
    btn.dataset.nome = r.nome;
    btn.innerHTML = `<span class="recipe-picker-result-emoji">${r.emoji || "🍽️"}</span><span>${escapeHtml(r.nome)}</span>`;
    resultsEl.appendChild(btn);
  });

  if (matches.length > RECIPE_PICKER_LIMIT) {
    const note = document.createElement("p");
    note.className = "recipe-picker-note";
    note.textContent = t("menu.recipePickerMore").replace("{n}", matches.length);
    resultsEl.appendChild(note);
  }
}

function openRecipePicker(picker) {
  const panel = picker.querySelector(".recipe-picker-panel");
  const search = picker.querySelector(".recipe-picker-search");
  panel.hidden = false;
  renderRecipePickerResults(picker, search.value);
  search.focus();
}

function closeRecipePicker(picker) {
  picker.querySelector(".recipe-picker-panel").hidden = true;
}

function toggleRecipePicker(picker) {
  const panel = picker.querySelector(".recipe-picker-panel");
  if (panel.hidden) openRecipePicker(picker);
  else closeRecipePicker(picker);
}

function selectRecipeInPicker(picker, nome) {
  const hidden = picker.querySelector('input[name="ricettaNome"]');
  const toggle = picker.querySelector(".recipe-picker-toggle");
  hidden.value = nome;
  toggle.textContent = "✓ " + nome;
  toggle.classList.add("has-selection");
  closeRecipePicker(picker);
}

function resetRecipePicker(form) {
  const picker = form.querySelector(".recipe-picker");
  if (!picker) return;
  const toggle = picker.querySelector(".recipe-picker-toggle");
  toggle.textContent = t("menu.recipePickerToggle");
  toggle.classList.remove("has-selection");
  const search = picker.querySelector(".recipe-picker-search");
  if (search) search.value = "";
  // Gli input hidden non vengono davvero riportati al valore iniziale da
  // form.reset() una volta che il valore è stato impostato via JS: va svuotato a mano.
  const hidden = picker.querySelector('input[name="ricettaNome"]');
  if (hidden) hidden.value = "";
  closeRecipePicker(picker);
}

function buildFixedMealsPanel() {
  const container = document.getElementById("fixedMealsRows");
  container.innerHTML = "";

  MEALS.forEach(meal => {
    const categoria = MEAL_TO_CATEGORIA[meal];

    const row = document.createElement("div");
    row.className = "fixed-meal-row";
    row.dataset.meal = meal;
    row.innerHTML = `
      <h3>${mealLabel(meal)}</h3>
      <p class="fixed-meal-status" data-meal-status="${meal}"></p>

      <form class="fix-recipe-form" data-meal="${meal}">
        ${buildRecipePickerHtml(categoria)}
        <select name="porzioni" class="porzioni-select" title="Per quante persone?">
          <option value="1">1 persona</option>
          <option value="2">2 persone</option>
          <option value="4">4 persone</option>
          <option value="6">6 persone</option>
        </select>
        <button type="submit">${t("menu.fixedMealsFixBtn")}</button>
      </form>

      <details class="fix-food-alt">
        <summary>${t("menu.fixedMealsFoodAlt")}</summary>
        <form class="fix-food-form" data-meal="${meal}">
          <input type="text" name="nome" placeholder="Alimento" required>
          <input type="number" name="kcal100" placeholder="kcal/100g" min="0" step="1" required>
          <input type="number" name="grammi" placeholder="Grammi" min="0" step="1" required>
          <button type="submit">${t("menu.fixedMealsFixBtn")}</button>
        </form>
      </details>

      <button type="button" class="remove-fixed-btn" data-meal="${meal}" hidden>${t("menu.fixedMealsRemoveBtn")}</button>
    `;
    container.appendChild(row);
  });

  renderFixedMealsStatus();
}

function renderFixedMealsStatus() {
  const templates = loadMealTemplates();
  MEALS.forEach(meal => {
    const statusEl = document.querySelector(`.fixed-meal-status[data-meal-status="${meal}"]`);
    const removeBtn = document.querySelector(`.remove-fixed-btn[data-meal="${meal}"]`);
    if (!statusEl || !removeBtn) return;

    const tpl = templates[meal];
    if (tpl) {
      statusEl.textContent = t("menu.fixedMealsCurrent").replace("{nome}", tpl.nome);
      statusEl.classList.add("is-fixed");
      removeBtn.hidden = false;
    } else {
      statusEl.textContent = t("menu.fixedMealsNone");
      statusEl.classList.remove("is-fixed");
      removeBtn.hidden = true;
    }
  });
}

function handleFixRecipe(e) {
  e.preventDefault();
  const form = e.target;
  const meal = form.dataset.meal;
  const ricettaNome = form.ricettaNome.value.trim();
  if (!ricettaNome) return;

  const categoria = MEAL_TO_CATEGORIA[meal];
  const ricetta = getRecipesByCategoria(categoria).find(
    r => r.nome.toLowerCase() === ricettaNome.toLowerCase()
  );
  if (!ricetta) {
    alert("Ricetta non trovata: scegli un nome dall'elenco suggerito mentre digiti.");
    return;
  }

  const porzioni = parseInt(form.porzioni.value, 10) || 1;
  applyMealTemplateToAllDays(meal, {
    tipo: "ricetta",
    ricettaId: ricetta.id,
    nome: ricetta.nome,
    emoji: ricetta.emoji,
    porzioni,
    kcalTotali: ricetta.kcalPortion * porzioni
  });

  form.reset();
  resetRecipePicker(form);
  renderFixedMealsStatus();
  renderAllMeals(activeDay);
}

function handleFixFood(e) {
  e.preventDefault();
  const form = e.target;
  const meal = form.dataset.meal;
  const nome = form.nome.value.trim();
  const kcal100 = parseFloat(form.kcal100.value);
  const grammi = parseFloat(form.grammi.value);
  if (!nome || isNaN(kcal100) || isNaN(grammi)) return;

  const kcalTotali = Math.round((kcal100 * grammi) / 100);
  applyMealTemplateToAllDays(meal, { tipo: "libero", nome, kcal100, grammi, kcalTotali });

  form.reset();
  renderFixedMealsStatus();
  renderAllMeals(activeDay);
}

function attachFixedMealsEvents() {
  const container = document.getElementById("fixedMealsRows");

  container.addEventListener("submit", (e) => {
    if (e.target.classList.contains("fix-recipe-form")) {
      handleFixRecipe(e);
    } else if (e.target.classList.contains("fix-food-form")) {
      handleFixFood(e);
    }
  });

  container.addEventListener("click", (e) => {
    const pickerToggle = e.target.closest(".recipe-picker-toggle");
    const pickerResult = e.target.closest(".recipe-picker-result");
    const removeBtn = e.target.closest(".remove-fixed-btn");

    if (pickerToggle) {
      toggleRecipePicker(pickerToggle.closest(".recipe-picker"));
      return;
    }
    if (pickerResult) {
      selectRecipeInPicker(pickerResult.closest(".recipe-picker"), pickerResult.dataset.nome);
      return;
    }
    if (removeBtn) {
      removeMealTemplate(removeBtn.dataset.meal);
      renderFixedMealsStatus();
    }
  });

  container.addEventListener("input", (e) => {
    if (!e.target.classList.contains("recipe-picker-search")) return;
    const picker = e.target.closest(".recipe-picker");
    renderRecipePickerResults(picker, e.target.value);
  });
}

async function init() {
  checkWeekRollover();
  photoCache = await loadAllPhotosAsMap();
  buildTabs();
  buildDays();
  buildFixedMealsPanel();
  attachFixedMealsEvents();
  attachGlobalEvents();
  attachAutoGenerateEvents();
  showDay(activeDay);
}

function buildTabs() {
  const nav = document.getElementById("dayTabs");
  nav.innerHTML = "";
  DAYS.forEach(day => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-tab";
    btn.dataset.day = day;
    btn.textContent = dayLabel(day);
    btn.addEventListener("click", () => showDay(day));
    nav.appendChild(btn);
  });
}

function buildDays() {
  const container = document.getElementById("daysContainer");
  container.innerHTML = "";

  DAYS.forEach(day => {
    const panel = document.createElement("div");
    panel.className = "day-panel";
    panel.dataset.day = day;

    MEALS.forEach(meal => {
      const categoria = MEAL_TO_CATEGORIA[meal];

      const section = document.createElement("section");
      section.className = "meal-section";
      section.dataset.meal = meal;
      section.innerHTML = `
        <h2>${mealLabel(meal)}</h2>
        <ul class="food-list"></ul>

        <form class="add-recipe-form">
          ${buildRecipePickerHtml(categoria)}
          <select name="porzioni" class="porzioni-select" title="Per quante persone?">
            <option value="1">1 persona</option>
            <option value="2">2 persone</option>
            <option value="4">4 persone</option>
            <option value="6">6 persone</option>
          </select>
          <button type="submit">+ Aggiungi</button>
        </form>

        <details class="manual-entry">
          <summary>Oppure aggiungi un alimento libero</summary>
          <form class="add-food-form">
            <input type="text" name="nome" placeholder="Alimento" required>
            <input type="number" name="kcal100" placeholder="kcal/100g" min="0" step="1" required>
            <input type="number" name="grammi" placeholder="Grammi" min="0" step="1" required>
            <button type="submit">+ Aggiungi</button>
          </form>
        </details>

        <details class="delivery-entry">
          <summary>🛵 Hai ordinato da asporto/delivery?</summary>
          <form class="add-delivery-form">
            <input type="text" name="nome" placeholder="Cosa hai ordinato" required>
            <input type="text" name="ristorante" placeholder="Ristorante (facoltativo)">
            <input type="number" name="costo" placeholder="Costo € (facoltativo)" min="0" step="0.5">
            <input type="number" name="kcal" placeholder="Calorie stimate (facoltativo)" min="0" step="10">
            <button type="submit">+ Segna ordine</button>
          </form>
        </details>

        <details class="fuori-entry">
          <summary>🍽️ Sei uscito a mangiare fuori?</summary>
          <form class="add-fuori-form">
            <input type="text" name="nome" placeholder="Locale o piatto" required>
            <input type="number" name="costo" placeholder="Costo € (facoltativo)" min="0" step="0.5">
            <input type="number" name="kcal" placeholder="Calorie stimate (facoltativo)" min="0" step="10">
            <button type="submit">+ Segna cena fuori</button>
          </form>
        </details>
      `;
      panel.appendChild(section);
    });

    container.appendChild(panel);
  });

  container.addEventListener("submit", handleFormSubmit);
  container.addEventListener("click", handleContainerClick);
  container.addEventListener("change", handlePhotoInputChange);
  container.addEventListener("input", handleRecipePickerInput);
}

function handleRecipePickerInput(e) {
  if (!e.target.classList.contains("recipe-picker-search")) return;
  const picker = e.target.closest(".recipe-picker");
  renderRecipePickerResults(picker, e.target.value);
}

function handleFormSubmit(e) {
  if (e.target.classList.contains("add-recipe-form")) {
    handleAddRecipe(e);
  } else if (e.target.classList.contains("add-food-form")) {
    handleAddFood(e);
  } else if (e.target.classList.contains("add-delivery-form")) {
    handleAddDelivery(e);
  } else if (e.target.classList.contains("add-fuori-form")) {
    handleAddFuori(e);
  }
}

function handleAddRecipe(e) {
  e.preventDefault();
  const form = e.target;
  const { day, meal } = getDayMealFromForm(form);

  const ricettaNome = form.ricettaNome.value.trim();
  if (!ricettaNome) return;
  const categoria = MEAL_TO_CATEGORIA[meal];
  const ricetta = getRecipesByCategoria(categoria).find(
    r => r.nome.toLowerCase() === ricettaNome.toLowerCase()
  );
  if (!ricetta) {
    alert("Ricetta non trovata: scegli un nome dall'elenco suggerito mentre digiti.");
    return;
  }

  const porzioni = parseInt(form.porzioni.value, 10) || 1;

  data[day][meal].push({
    entryId: generateEntryId(),
    tipo: "ricetta",
    ricettaId: ricetta.id,
    nome: ricetta.nome,
    emoji: ricetta.emoji,
    porzioni,
    kcalTotali: ricetta.kcalPortion * porzioni
  });
  saveData();
  form.reset();
  resetRecipePicker(form);

  renderMeal(day, meal);
}

function handleAddFood(e) {
  e.preventDefault();
  const form = e.target;
  const { day, meal } = getDayMealFromForm(form);

  const nome = form.nome.value.trim();
  const kcal100 = parseFloat(form.kcal100.value);
  const grammi = parseFloat(form.grammi.value);
  if (!nome || isNaN(kcal100) || isNaN(grammi) || kcal100 < 0 || grammi < 0) return;

  const kcalTotali = Math.round((kcal100 * grammi) / 100);
  data[day][meal].push({ entryId: generateEntryId(), tipo: "libero", nome, kcal100, grammi, kcalTotali });
  saveData();
  form.reset();

  renderMeal(day, meal);
}

function handleAddDelivery(e) {
  e.preventDefault();
  const form = e.target;
  const { day, meal } = getDayMealFromForm(form);

  const nome = form.nome.value.trim();
  const ristorante = form.ristorante.value.trim();
  const costo = form.costo.value ? parseFloat(form.costo.value) : null;
  const kcal = form.kcal.value ? parseFloat(form.kcal.value) : 0;
  if (!nome) return;

  const costoValido = (costo !== null && !isNaN(costo)) ? costo : null;

  data[day][meal].push({
    entryId: generateEntryId(),
    tipo: "consegna",
    nome,
    ristorante: ristorante || null,
    costo: costoValido,
    kcalTotali: isNaN(kcal) ? 0 : kcal
  });
  saveData();

  if (costoValido !== null) {
    addBudgetEntry("consegna", costoValido, ristorante ? `${nome} (${ristorante})` : nome);
  }

  form.reset();
  renderMeal(day, meal);
}

function handleAddFuori(e) {
  e.preventDefault();
  const form = e.target;
  const { day, meal } = getDayMealFromForm(form);

  const nome = form.nome.value.trim();
  const costo = form.costo.value ? parseFloat(form.costo.value) : null;
  const kcal = form.kcal.value ? parseFloat(form.kcal.value) : 0;
  if (!nome) return;

  const costoValido = (costo !== null && !isNaN(costo)) ? costo : null;

  data[day][meal].push({
    entryId: generateEntryId(),
    tipo: "fuori",
    nome,
    costo: costoValido,
    kcalTotali: isNaN(kcal) ? 0 : kcal
  });
  saveData();

  if (costoValido !== null) {
    addBudgetEntry("fuori", costoValido, nome);
  }

  form.reset();
  renderMeal(day, meal);
}

function getDayMealFromForm(form) {
  const panel = form.closest(".day-panel");
  const section = form.closest(".meal-section");
  return { day: panel.dataset.day, meal: section.dataset.meal };
}

function handleContainerClick(e) {
  const pickerToggle = e.target.closest(".recipe-picker-toggle");
  const pickerResult = e.target.closest(".recipe-picker-result");

  if (pickerToggle) {
    toggleRecipePicker(pickerToggle.closest(".recipe-picker"));
  } else if (pickerResult) {
    selectRecipeInPicker(pickerResult.closest(".recipe-picker"), pickerResult.dataset.nome);
  } else if (e.target.classList.contains("delete-food")) {
    handleDeleteFood(e);
  } else if (e.target.closest(".photo-thumb")) {
    openLightbox(e.target.closest(".photo-thumb").dataset.entryId);
  } else if (e.target.classList.contains("remove-photo-btn")) {
    handleRemovePhoto(e);
  }
}

async function handleDeleteFood(e) {
  const li = e.target.closest("li");
  const section = e.target.closest(".meal-section");
  const panel = e.target.closest(".day-panel");
  const day = panel.dataset.day;
  const meal = section.dataset.meal;
  const index = Number(li.dataset.index);
  const entry = data[day][meal][index];

  if (entry && entry.entryId && photoCache.has(entry.entryId)) {
    URL.revokeObjectURL(photoCache.get(entry.entryId));
    photoCache.delete(entry.entryId);
    await deletePhoto(entry.entryId);
  }

  data[day][meal].splice(index, 1);
  saveData();

  renderMeal(day, meal);
}

async function handlePhotoInputChange(e) {
  if (!e.target.classList.contains("photo-input")) return;
  const file = e.target.files[0];
  if (!file) return;

  const entryId = e.target.dataset.entryId;
  await savePhoto(entryId, file);

  if (photoCache.has(entryId)) URL.revokeObjectURL(photoCache.get(entryId));
  photoCache.set(entryId, URL.createObjectURL(file));

  const li = e.target.closest("li");
  const section = e.target.closest(".meal-section");
  const panel = e.target.closest(".day-panel");
  renderMeal(panel.dataset.day, section.dataset.meal);
}

async function handleRemovePhoto(e) {
  e.preventDefault();
  const entryId = e.target.dataset.entryId;
  if (photoCache.has(entryId)) {
    URL.revokeObjectURL(photoCache.get(entryId));
    photoCache.delete(entryId);
  }
  await deletePhoto(entryId);

  const section = e.target.closest(".meal-section");
  const panel = e.target.closest(".day-panel");
  renderMeal(panel.dataset.day, section.dataset.meal);
}

function openLightbox(entryId) {
  const url = photoCache.get(entryId);
  if (!url) return;
  const lightbox = document.getElementById("lightbox");
  document.getElementById("lightboxImg").src = url;
  lightbox.classList.add("open");
}

function renderMeal(day, meal) {
  const panel = document.querySelector(`.day-panel[data-day="${day}"]`);
  const section = panel.querySelector(`.meal-section[data-meal="${meal}"]`);
  const list = section.querySelector(".food-list");
  list.innerHTML = "";

  data[day][meal].forEach((item, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;
    if (!item.entryId) item.entryId = generateEntryId();

    let mainHtml = "";
    if (item.tipo === "ricetta") {
      const porzioniText = item.porzioni > 1 ? ` <span class="food-detail">(x${item.porzioni} persone)</span>` : "";
      mainHtml = `
        <span class="food-emoji">${item.emoji || "🍽️"}</span>
        <span class="food-name">${escapeHtml(item.nome)}${porzioniText}</span>
      `;
    } else if (item.tipo === "consegna") {
      const ristoranteText = item.ristorante ? ` &middot; ${escapeHtml(item.ristorante)}` : "";
      const costoText = item.costo != null ? ` &middot; €${item.costo.toFixed(2)}` : "";
      mainHtml = `
        <span class="food-emoji">🛵</span>
        <span class="food-name">${escapeHtml(item.nome)}
          <span class="food-detail">consegna${ristoranteText}${costoText}</span>
        </span>
      `;
    } else if (item.tipo === "fuori") {
      const costoText = item.costo != null ? ` &middot; €${item.costo.toFixed(2)}` : "";
      mainHtml = `
        <span class="food-emoji">🍽️</span>
        <span class="food-name">${escapeHtml(item.nome)}
          <span class="food-detail">fuori casa${costoText}</span>
        </span>
      `;
    } else {
      mainHtml = `
        <span class="food-emoji">🥄</span>
        <span class="food-name">${escapeHtml(item.nome)} <span class="food-detail">(${item.grammi} g)</span></span>
      `;
    }

    const photoUrl = photoCache.get(item.entryId);
    const photoHtml = photoUrl
      ? `<button type="button" class="photo-thumb" data-entry-id="${item.entryId}" style="background-image:url('${photoUrl}')" aria-label="Vedi foto"></button>
         <button type="button" class="remove-photo-btn" data-entry-id="${item.entryId}" aria-label="Rimuovi foto">&times;</button>`
      : `<label class="add-photo-btn" aria-label="Aggiungi foto ricordo">📷
           <input type="file" accept="image/*" capture="environment" class="photo-input" data-entry-id="${item.entryId}" hidden>
         </label>`;

    li.innerHTML = `
      ${mainHtml}
      <span class="food-photo-slot">${photoHtml}</span>
      <button type="button" class="delete-food" aria-label="Rimuovi alimento">&times;</button>
    `;
    list.appendChild(li);
  });
}

function renderAllMeals(day) {
  MEALS.forEach(meal => renderMeal(day, meal));
}

function showDay(day) {
  activeDay = day;

  document.querySelectorAll(".day-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.day === day);
  });
  document.querySelectorAll(".day-panel").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.day === day);
  });

  renderAllMeals(day);
}

function attachGlobalEvents() {
  document.getElementById("resetBtn").addEventListener("click", async () => {
    if (confirm("Cancellare tutti i dati inseriti in tutti i giorni? Verranno rimosse anche le foto salvate.")) {
      for (const entryId of photoCache.keys()) {
        URL.revokeObjectURL(photoCache.get(entryId));
        await deletePhoto(entryId);
      }
      photoCache.clear();
      data = emptyData();
      saveData();
      renderAllMeals(activeDay);
    }
  });

  const lightbox = document.getElementById("lightbox");
  lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
}

document.addEventListener("DOMContentLoaded", init);
