/* Logica della landing page: mostra un piatto consigliato diverso ogni giorno.
   La scelta è deterministica (basata sulla data), quindi resta la stessa
   per tutto il giorno e cambia automaticamente il giorno dopo. Richiede data.js. */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function hashStringToInt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getDishOfTheDay() {
  const today = new Date();
  const dateKey = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const index = hashStringToInt(dateKey) % RECIPES.length;
  return RECIPES[index];
}

function renderDishOfDay() {
  const dish = getDishOfTheDay();
  const card = document.getElementById("dishOfDayCard");

  const ingredientiList = dish.ingredienti.map(ing => {
    const qty = ing.unita === "q.b." ? "q.b." : `${ing.quantita} ${ing.unita}`;
    return `<li>${escapeHtml(ing.nome)} &ndash; ${qty}</li>`;
  }).join("");

  card.innerHTML = `
    <div class="dish-of-day-icon">${dish.emoji}</div>
    <div class="dish-of-day-body">
      <h3>${escapeHtml(dish.nome)}</h3>
      <div class="recipe-badges">
        <span class="badge badge-categoria">${categoriaLabel(dish.categoria)}</span>
        <span class="badge badge-stile badge-stile-${dish.stile}">${stileLabel(dish.stile)}</span>
        <span class="badge badge-kcal">${dish.kcalPortion} kcal</span>
      </div>
      <details class="recipe-details">
        <summary>Ingredienti e preparazione</summary>
        <p class="recipe-subtitle">Ingredienti (1 porzione)</p>
        <ul class="ingredient-list">${ingredientiList}</ul>
        <p class="recipe-subtitle">Preparazione</p>
        <p class="recipe-instructions">${escapeHtml(dish.istruzioni)}</p>
      </details>
      <a href="menu.html" class="primary-btn dish-of-day-cta">${t("home.addToMenu")}</a>
    </div>
  `;
}

/* --- Statistiche personali --- */

const STATS_MENU_KEY = "weeklyMenuData";
const STATS_HISTORY_KEY = "menuHistory";
const STATS_FAVORITES_KEY = "favoriteRecipes";
const STATS_BUDGET_KEY = "budgetLog";

const STILE_EMOJI = { leggero: "🥗", bilanciato: "⚖️", goloso: "😋" };

function loadJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}

function weekHasContent(weekData) {
  return DAYS.some(day => MEALS.some(meal => (weekData[day] && weekData[day][meal] && weekData[day][meal].length > 0)));
}

function getAllWeeks() {
  const current = loadJson(STATS_MENU_KEY, null);
  const history = loadJson(STATS_HISTORY_KEY, []);
  const weeks = history.map(w => w.data);
  if (current) weeks.push(current);
  return weeks;
}

function computeStats() {
  const weeks = getAllWeeks();
  const recipeCounts = new Map();
  const stileCounts = {};
  let consegnaCount = 0;
  let fuoriCount = 0;
  let weeksWithContent = 0;

  weeks.forEach(weekData => {
    if (weekHasContent(weekData)) weeksWithContent++;
    DAYS.forEach(day => {
      MEALS.forEach(meal => {
        const items = (weekData[day] && weekData[day][meal]) || [];
        items.forEach(item => {
          if (item.tipo === "ricetta") {
            recipeCounts.set(item.ricettaId, (recipeCounts.get(item.ricettaId) || 0) + 1);
            const ricetta = getRecipeById(item.ricettaId);
            if (ricetta) {
              stileCounts[ricetta.stile] = (stileCounts[ricetta.stile] || 0) + 1;
            }
          } else if (item.tipo === "consegna") {
            consegnaCount++;
          } else if (item.tipo === "fuori") {
            fuoriCount++;
          }
        });
      });
    });
  });

  let topRecipeId = null;
  let topRecipeCount = 0;
  recipeCounts.forEach((count, id) => {
    if (count > topRecipeCount) {
      topRecipeCount = count;
      topRecipeId = id;
    }
  });

  let topStile = null;
  let topStileCount = 0;
  Object.keys(stileCounts).forEach(stile => {
    if (stileCounts[stile] > topStileCount) {
      topStileCount = stileCounts[stile];
      topStile = stile;
    }
  });

  const favorites = loadJson(STATS_FAVORITES_KEY, []);
  const budgetLog = loadJson(STATS_BUDGET_KEY, []);
  const totalSpent = budgetLog.reduce((sum, e) => sum + (e.importo || 0), 0);

  return {
    uniqueRecipes: recipeCounts.size,
    topRecipeId,
    topRecipeCount,
    topStile,
    weeksTracked: weeksWithContent,
    favoritesCount: favorites.length,
    consegnaCount,
    fuoriCount,
    totalSpent
  };
}

async function renderStats() {
  const stats = computeStats();
  const grid = document.getElementById("statsGrid");
  const emptyMsg = document.getElementById("statsEmptyMessage");
  const highlightEl = document.getElementById("statsHighlight");

  let photoCount = 0;
  if (typeof loadAllPhotosAsMap === "function") {
    try {
      const photoMap = await loadAllPhotosAsMap();
      photoCount = photoMap.size;
    } catch (e) { photoCount = 0; }
  }

  const hasAnyData = stats.uniqueRecipes > 0 || stats.weeksTracked > 0 || stats.totalSpent > 0
    || stats.favoritesCount > 0 || photoCount > 0 || stats.consegnaCount > 0 || stats.fuoriCount > 0;

  if (!hasAnyData) {
    grid.hidden = true;
    highlightEl.hidden = true;
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;
  grid.hidden = false;

  const cards = [
    { icon: "👨‍🍳", value: stats.uniqueRecipes, label: t("home.statsUniqueRecipes") },
    { icon: "⭐", value: stats.favoritesCount, label: t("home.statsFavorites") },
    { icon: "📚", value: stats.weeksTracked, label: t("home.statsWeeks") },
    { icon: "📷", value: photoCount, label: t("home.statsPhotos") },
    { icon: "🛵", value: stats.consegnaCount, label: t("home.statsDeliveries") },
    { icon: "🍽️", value: stats.fuoriCount, label: t("home.statsEatingOut") },
    { icon: "💶", value: `€ ${stats.totalSpent.toFixed(2)}`, label: t("home.statsTotalSpent") }
  ];

  grid.innerHTML = cards.map(c => `
    <div class="stat-card">
      <span class="stat-icon">${c.icon}</span>
      <span class="stat-value">${c.value}</span>
      <span class="stat-label">${escapeHtml(c.label)}</span>
    </div>
  `).join("");

  const highlightParts = [];
  if (stats.topRecipeId && stats.topRecipeCount >= 2) {
    const ricetta = getRecipeById(stats.topRecipeId);
    if (ricetta) {
      highlightParts.push(`${ricetta.emoji} ${t("home.statsTopDish")} <strong>${escapeHtml(ricetta.nome)}</strong> (${stats.topRecipeCount}×)`);
    }
  }
  if (stats.topStile) {
    highlightParts.push(`${STILE_EMOJI[stats.topStile] || ""} ${t("home.statsTopStyle")} <strong>${escapeHtml(stileLabel(stats.topStile))}</strong>`);
  }

  if (highlightParts.length > 0) {
    highlightEl.hidden = false;
    highlightEl.innerHTML = highlightParts.join(" &middot; ");
  } else {
    highlightEl.hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderDishOfDay();
  renderStats();
});
