/* Logica della pagina Ricette. Richiede data.js caricato prima di questo file. */

let filtroCategoria = "tutte";
let filtroStile = "tutti";
let filtroTempo = "tutti";
let filtroDurata = "tutti";
let filtroDifficolta = "tutti";
let filtroPesce = "tutte";
let allergeniEsclusi = new Set();
let searchQuery = "";
let frigoTermini = [];
let soloPreferiti = false;
let modalitaCorsa = false;
let visibleCount = 30;
const PAGE_SIZE = 30;
const FAVORITES_KEY = "favoriteRecipes";
const CORSA_MAX_INGREDIENTI = 4;

let preferiti = new Set(loadFavorites());

function loadFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...preferiti]));
}

function toggleFavorite(id) {
  if (preferiti.has(id)) {
    preferiti.delete(id);
  } else {
    preferiti.add(id);
  }
  saveFavorites();
}

function eDiCorsa(recipe) {
  return recipe.tempo === "veloce" && recipe.ingredienti.length <= CORSA_MAX_INGREDIENTI;
}

const TEMPO_LABELS = { veloce: "Veloce", elaborato: "Più elaborata" };

function starsLabel(difficolta) {
  return "★".repeat(difficolta) + "☆".repeat(5 - difficolta);
}

const PESCE_REGEX = /salmone|tonno|gamber|merluzzo|branzino|orata|cozze|vongole|calamar|polpo|acciughe|sgombro|pesce spada|baccal|seppie|nasello|trota|sardine|capesante/i;

const ALLERGENI = {
  glutine: { label: "Glutine", regex: /\bpasta\b|\bpane\b|farina|gnocchi|cous cous|\borzo\b|\bfarro\b|pizza|panino|toast|biscott|torta|muffin|cr[eè]pes|piadina|pancake|waffle|grissini|taralli|cracker|lasagna|bagel|tortilla|besciamella|seitan/i },
  lattosio: { label: "Lattosio", regex: /\blatte\b|formaggio|yogurt|panna|besciamella|\bburro\b|mozzarella|ricotta|parmigiano|gorgonzola|\bfeta\b|mascarpone|\bskyr\b|philadelphia/i },
  frutta_guscio: { label: "Frutta a guscio", regex: /mandorl|nocciol|pistacchi|anacardi|\bnoci\b|arachidi/i },
  uova: { label: "Uova", regex: /\buov[ao]\b/i }
};

function contienePesce(recipe) {
  return PESCE_REGEX.test(recipe.nome) || recipe.ingredienti.some(ing => PESCE_REGEX.test(ing.nome));
}

function contieneAllergene(recipe, chiave) {
  const regex = ALLERGENI[chiave].regex;
  return regex.test(recipe.nome) || recipe.ingredienti.some(ing => regex.test(ing.nome));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function init() {
  attachFilterEvents();
  renderRecipes();
}

function attachFilterEvents() {
  document.getElementById("categoriaFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filtroCategoria = btn.dataset.categoria;
    setActiveChip("categoriaFilters", btn);
    resetAndRender();
  });

  document.getElementById("stileFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filtroStile = btn.dataset.stile;
    setActiveChip("stileFilters", btn);
    resetAndRender();
  });

  document.getElementById("tempoFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filtroTempo = btn.dataset.tempo;
    setActiveChip("tempoFilters", btn);
    resetAndRender();
  });

  document.getElementById("durataFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filtroDurata = btn.dataset.durata;
    setActiveChip("durataFilters", btn);
    resetAndRender();
  });

  document.getElementById("difficoltaFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filtroDifficolta = btn.dataset.difficolta;
    setActiveChip("difficoltaFilters", btn);
    resetAndRender();
  });

  document.getElementById("pesceFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filtroPesce = btn.dataset.pesce;
    setActiveChip("pesceFilters", btn);
    resetAndRender();
  });

  document.getElementById("allergeneFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    const chiave = btn.dataset.allergene;
    if (allergeniEsclusi.has(chiave)) {
      allergeniEsclusi.delete(chiave);
      btn.classList.remove("active");
    } else {
      allergeniEsclusi.add(chiave);
      btn.classList.add("active");
    }
    resetAndRender();
  });

  let searchTimeout;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim().toLowerCase();
      resetAndRender();
    }, 150);
  });

  document.getElementById("loadMoreBtn").addEventListener("click", () => {
    visibleCount += PAGE_SIZE;
    renderRecipes();
  });

  document.getElementById("frigoBtn").addEventListener("click", () => {
    const raw = document.getElementById("frigoInput").value;
    frigoTermini = raw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    resetAndRender();
  });

  document.getElementById("frigoClearBtn").addEventListener("click", () => {
    document.getElementById("frigoInput").value = "";
    frigoTermini = [];
    resetAndRender();
  });

  document.getElementById("extraFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    if (btn.dataset.toggle === "preferiti") {
      soloPreferiti = !soloPreferiti;
      btn.classList.toggle("active", soloPreferiti);
    } else if (btn.dataset.toggle === "corsa") {
      modalitaCorsa = !modalitaCorsa;
      btn.classList.toggle("active", modalitaCorsa);
    }
    resetAndRender();
  });

  document.getElementById("recipeGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".favorite-btn");
    if (!btn) return;
    toggleFavorite(btn.dataset.id);
    btn.classList.toggle("active");
    btn.textContent = btn.classList.contains("active") ? "⭐" : "☆";
    if (soloPreferiti) renderRecipes();
  });
}

function resetAndRender() {
  visibleCount = PAGE_SIZE;
  renderRecipes();
}

function setActiveChip(groupId, activeBtn) {
  document.querySelectorAll(`#${groupId} .filter-chip`).forEach(btn => {
    btn.classList.toggle("active", btn === activeBtn);
  });
}

function contaIngredientiInFrigo(recipe) {
  if (frigoTermini.length === 0) return 0;
  return frigoTermini.reduce((count, termine) => {
    const trovato = recipe.ingredienti.some(ing => ing.nome.toLowerCase().includes(termine))
      || recipe.nome.toLowerCase().includes(termine);
    return trovato ? count + 1 : count;
  }, 0);
}

function getFilteredRecipes() {
  let risultati = RECIPES.filter(r => {
    const okCategoria = filtroCategoria === "tutte" || r.categoria === filtroCategoria;
    const okStile = filtroStile === "tutti" || r.stile === filtroStile;
    const okTempo = filtroTempo === "tutti" || r.tempo === filtroTempo;
    const okDurata = filtroDurata === "tutti" || r.tempoMinuti <= parseInt(filtroDurata, 10);
    const okDifficolta = filtroDifficolta === "tutti"
      || (filtroDifficolta === "facile" && r.difficolta <= 2)
      || (filtroDifficolta === "media" && r.difficolta === 3)
      || (filtroDifficolta === "difficile" && r.difficolta >= 4);
    const pesce = contienePesce(r);
    const okPesce = filtroPesce === "tutte" || (filtroPesce === "escludi" && !pesce) || (filtroPesce === "solo" && pesce);
    const okAllergeni = [...allergeniEsclusi].every(chiave => !contieneAllergene(r, chiave));
    const okPreferiti = !soloPreferiti || preferiti.has(r.id);
    const okCorsa = !modalitaCorsa || eDiCorsa(r);
    const okSearch = !searchQuery
      || r.nome.toLowerCase().includes(searchQuery)
      || r.ingredienti.some(ing => ing.nome.toLowerCase().includes(searchQuery));
    return okCategoria && okStile && okTempo && okDurata && okDifficolta && okPesce && okAllergeni && okPreferiti && okCorsa && okSearch;
  });

  if (frigoTermini.length > 0) {
    risultati = risultati
      .map(r => ({ r, match: contaIngredientiInFrigo(r) }))
      .filter(x => x.match > 0)
      .sort((a, b) => b.match - a.match)
      .map(x => x.r);
  } else if (modalitaCorsa) {
    risultati = risultati.slice().sort((a, b) => a.ingredienti.length - b.ingredienti.length);
  }

  return risultati;
}

function renderRecipes() {
  const grid = document.getElementById("recipeGrid");
  const countEl = document.getElementById("recipeCount");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  const filtrate = getFilteredRecipes();
  const daMostrare = filtrate.slice(0, visibleCount);

  countEl.textContent = `${daMostrare.length} di ${filtrate.length} ricett${filtrate.length === 1 ? "a" : "e"} trovate`;

  grid.innerHTML = "";

  if (filtrate.length === 0) {
    grid.innerHTML = '<p class="empty-message">Nessuna ricetta trovata con questi filtri.</p>';
    loadMoreBtn.hidden = true;
    return;
  }

  daMostrare.forEach(r => {
    const card = document.createElement("article");
    card.className = "recipe-card";

    const ingredientiList = r.ingredienti.map(ing => {
      const qty = ing.unita === "q.b." ? "q.b." : `${ing.quantita} ${ing.unita}`;
      return `<li>${escapeHtml(ing.nome)} &ndash; ${qty}</li>`;
    }).join("");

    const pesceBadge = contienePesce(r) ? '<span class="badge badge-pesce">🐟 Pesce</span>' : "";
    const matchCount = frigoTermini.length > 0 ? contaIngredientiInFrigo(r) : 0;
    const frigoBadge = matchCount > 0
      ? `<span class="badge badge-frigo">🧊 ${matchCount}/${frigoTermini.length} che hai già</span>`
      : "";
    const corsaBadge = eDiCorsa(r) ? '<span class="badge badge-corsa">⚡</span>' : "";
    const isFavorite = preferiti.has(r.id);

    card.innerHTML = `
      <div class="recipe-card-icon">${r.emoji}</div>
      <div class="recipe-card-body">
        <div class="recipe-card-title-row">
          <h3>${escapeHtml(r.nome)}</h3>
          <button type="button" class="favorite-btn${isFavorite ? " active" : ""}" data-id="${r.id}" aria-label="Preferito">${isFavorite ? "⭐" : "☆"}</button>
        </div>
        <div class="recipe-badges">
          <span class="badge badge-categoria">${categoriaLabel(r.categoria)}</span>
          <span class="badge badge-stile badge-stile-${r.stile}">${stileLabel(r.stile)}</span>
          <span class="badge badge-tempo">${tempoLabel(r.tempo)}</span>
          <span class="badge badge-durata">⏱ ${r.tempoMinuti} ${t("ricette.minutesShort")}</span>
          <span class="badge badge-difficolta" title="${starsLabel(r.difficolta)}">${starsLabel(r.difficolta)}</span>
          <span class="badge badge-kcal">${r.kcalPortion} kcal</span>
          ${pesceBadge}
          ${frigoBadge}
          ${corsaBadge}
        </div>
        <details class="recipe-details">
          <summary>Ingredienti e preparazione</summary>
          <p class="recipe-subtitle">Ingredienti (1 porzione)</p>
          <ul class="ingredient-list">${ingredientiList}</ul>
          <p class="recipe-subtitle">Preparazione</p>
          <p class="recipe-instructions">${escapeHtml(r.istruzioni)}</p>
        </details>
      </div>
    `;
    grid.appendChild(card);
  });

  loadMoreBtn.hidden = filtrate.length <= visibleCount;
}

document.addEventListener("DOMContentLoaded", init);
