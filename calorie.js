/* Logica della pagina Calorie: pagina di sola lettura che riassume ciò che è stato
   scelto nel Menu Settimanale. Richiede data.js caricato prima di questo file.
   Il contenuto viene mostrato solo se l'utente ha esplicitamente accettato
   di vedere il riepilogo (nessuna pressione sui numeri per chi non li vuole). */

const MENU_STORAGE_KEY = "weeklyMenuData";
const GOAL_KEY = "weeklyMealTrackerGoal";
const CONSENT_KEY = "calorieTrackingConsent"; // "yes" | "no" | assente

let menuData = null;
let goal = loadGoal();
let activeDay = getTodayKey();

function getTodayKey() {
  const map = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];
  return map[new Date().getDay()];
}

function loadMenuData() {
  const raw = localStorage.getItem(MENU_STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* dati corrotti */ }
  }
  const empty = {};
  DAYS.forEach(day => {
    empty[day] = {};
    MEALS.forEach(meal => { empty[day][meal] = []; });
  });
  return empty;
}

function loadGoal() {
  const g = localStorage.getItem(GOAL_KEY);
  return g ? Number(g) : 2000;
}

function saveGoal() {
  localStorage.setItem(GOAL_KEY, String(goal));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showScreen(id) {
  ["consentScreen", "declinedScreen", "calorieContent"].forEach(sid => {
    document.getElementById(sid).hidden = sid !== id;
  });
}

function initConsentGate() {
  const consent = localStorage.getItem(CONSENT_KEY);

  document.getElementById("consentYesBtn").addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "yes");
    activateTracker();
  });
  document.getElementById("consentNoBtn").addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "no");
    showScreen("declinedScreen");
  });
  document.getElementById("changeMindBtn").addEventListener("click", () => {
    showScreen("consentScreen");
  });
  document.getElementById("hideAgainBtn").addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "no");
    showScreen("declinedScreen");
  });

  if (consent === "yes") {
    activateTracker();
  } else if (consent === "no") {
    showScreen("declinedScreen");
  } else {
    showScreen("consentScreen");
  }
}

function activateTracker() {
  showScreen("calorieContent");
  if (!menuData) {
    menuData = loadMenuData();
    document.getElementById("goalInput").value = goal;
    buildTabs();
    buildDays();
    attachTrackerEvents();
    showDay(activeDay);
  }
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

    panel.innerHTML = `
      <div class="day-summary">
        <div class="summary-text"><span class="total-kcal">0</span> / <span class="goal-kcal">${goal}</span> kcal</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill"></div></div>
      </div>
    `;

    MEALS.forEach(meal => {
      const section = document.createElement("section");
      section.className = "meal-section meal-section-readonly";
      section.dataset.meal = meal;
      section.innerHTML = `
        <h2>${mealLabel(meal)}</h2>
        <ul class="food-list food-list-readonly"></ul>
      `;
      panel.appendChild(section);
    });

    container.appendChild(panel);
  });
}

function renderMeal(day, meal) {
  const panel = document.querySelector(`.day-panel[data-day="${day}"]`);
  const section = panel.querySelector(`.meal-section[data-meal="${meal}"]`);
  const list = section.querySelector(".food-list");
  const items = (menuData[day] && menuData[day][meal]) || [];

  if (items.length === 0) {
    list.innerHTML = '<li class="empty-meal">Nessun alimento inserito.</li>';
    return;
  }

  list.innerHTML = items.map(item => {
    let emoji = item.emoji || "🥄";
    let detail = "";
    if (item.tipo === "ricetta" && item.porzioni > 1) {
      detail = ` (x${item.porzioni} persone)`;
    } else if (item.tipo === "libero") {
      detail = ` (${item.grammi} g)`;
    } else if (item.tipo === "consegna") {
      emoji = "🛵";
      detail = " (consegna)";
    } else if (item.tipo === "fuori") {
      emoji = "🍽️";
      detail = " (fuori casa)";
    }
    return `
      <li>
        <span class="food-emoji">${emoji}</span>
        <span class="food-name">${escapeHtml(item.nome)}${detail}</span>
        <span class="food-detail">${item.kcalTotali} kcal</span>
      </li>
    `;
  }).join("");
}

function renderAllMeals(day) {
  MEALS.forEach(meal => renderMeal(day, meal));
}

function updateDaySummary(day) {
  const panel = document.querySelector(`.day-panel[data-day="${day}"]`);
  const giorno = menuData[day] || {};
  const total = MEALS.reduce((sum, meal) => {
    const items = giorno[meal] || [];
    return sum + items.reduce((s, item) => s + item.kcalTotali, 0);
  }, 0);

  panel.querySelector(".total-kcal").textContent = total;
  panel.querySelector(".goal-kcal").textContent = goal;

  const fill = panel.querySelector(".progress-bar-fill");
  const pct = Math.min((total / goal) * 100, 100);
  fill.style.width = pct + "%";
  fill.classList.toggle("over-goal", total > goal);
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
  updateDaySummary(day);
}

function attachTrackerEvents() {
  document.getElementById("goalInput").addEventListener("change", (e) => {
    const val = Number(e.target.value);
    if (val > 0) {
      goal = val;
      saveGoal();
      updateDaySummary(activeDay);
    }
  });
}

document.addEventListener("DOMContentLoaded", initConsentGate);
