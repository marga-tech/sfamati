/* Logica della pagina Storico: mostra in sola lettura le settimane passate del Menu,
   archiviate automaticamente da script.js quando inizia una nuova settimana.
   Richiede data.js, i18n.js e photos.js caricati prima di questo file. */

const HISTORY_KEY = "menuHistory";

let history = [];
let activeWeekIndex = -1;
let activeDay = null;
let photoCache = new Map();

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

function formatWeekLabel(weekStart) {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const lang = getLang();
  const locale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
  const startText = start.toLocaleDateString(locale, { day: "numeric", month: "short" });
  const endText = end.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  return `${startText} – ${endText}`;
}

async function init() {
  history = loadHistory().slice().sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  photoCache = await loadAllPhotosAsMap();

  if (history.length === 0) {
    document.getElementById("emptyHistoryMessage").hidden = false;
    return;
  }

  buildWeekTabs();
  selectWeek(0);

  const lightbox = document.getElementById("lightbox");
  lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
  document.getElementById("storicoDaysContainer").addEventListener("click", (e) => {
    const thumb = e.target.closest(".photo-thumb");
    if (thumb) openLightbox(thumb.dataset.entryId);
  });
}

function buildWeekTabs() {
  const nav = document.getElementById("weekTabs");
  nav.innerHTML = "";
  history.forEach((week, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "week-tab";
    btn.textContent = formatWeekLabel(week.weekStart);
    btn.addEventListener("click", () => selectWeek(index));
    nav.appendChild(btn);
  });
}

function selectWeek(index) {
  activeWeekIndex = index;
  document.querySelectorAll(".week-tab").forEach((btn, i) => btn.classList.toggle("active", i === index));
  document.getElementById("weekContent").hidden = false;

  buildDayTabs();
  activeDay = getFirstDayWithContent(history[index].data) || DAYS[0];
  showDay(activeDay);
}

function getFirstDayWithContent(weekData) {
  return DAYS.find(day => MEALS.some(meal => (weekData[day] && weekData[day][meal] && weekData[day][meal].length > 0)));
}

function buildDayTabs() {
  const nav = document.getElementById("storicoDayTabs");
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

  const container = document.getElementById("storicoDaysContainer");
  container.innerHTML = "";
  DAYS.forEach(day => {
    const panel = document.createElement("div");
    panel.className = "day-panel";
    panel.dataset.day = day;

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
  const weekData = history[activeWeekIndex].data;
  const panel = document.querySelector(`.day-panel[data-day="${day}"]`);
  const section = panel.querySelector(`.meal-section[data-meal="${meal}"]`);
  const list = section.querySelector(".food-list");
  const items = (weekData[day] && weekData[day][meal]) || [];

  if (items.length === 0) {
    list.innerHTML = `<li class="empty-meal">${escapeHtml(t("storico.noFood"))}</li>`;
    return;
  }

  list.innerHTML = items.map(item => {
    let emoji = item.emoji || "🥄";
    let detail = "";
    if (item.tipo === "ricetta" && item.porzioni > 1) {
      detail = ` (x${item.porzioni})`;
    } else if (item.tipo === "libero") {
      detail = ` (${item.grammi} g)`;
    } else if (item.tipo === "consegna") {
      emoji = "🛵";
      detail = ` (${t("storico.delivery")})`;
    } else if (item.tipo === "fuori") {
      emoji = "🍽️";
      detail = ` (${t("storico.eatingOut")})`;
    }

    const photoUrl = item.entryId ? photoCache.get(item.entryId) : null;
    const photoHtml = photoUrl
      ? `<button type="button" class="photo-thumb photo-thumb-small" data-entry-id="${item.entryId}" style="background-image:url('${photoUrl}')" aria-label="Vedi foto"></button>`
      : "";

    return `
      <li>
        <span class="food-emoji">${emoji}</span>
        <span class="food-name">${escapeHtml(item.nome)}${detail}</span>
        <span class="food-photo-slot">${photoHtml}</span>
      </li>
    `;
  }).join("");
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

function openLightbox(entryId) {
  const url = photoCache.get(entryId);
  if (!url) return;
  const lightbox = document.getElementById("lightbox");
  document.getElementById("lightboxImg").src = url;
  lightbox.classList.add("open");
}

document.addEventListener("DOMContentLoaded", init);
