/* Logica della pagina Scopri (piatti tipici). Richiede localita.js caricato prima di questo file. */

let filtroPaese = "tutti";
let searchQuery = "";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function init() {
  buildPaeseFilters();
  attachEvents();
  render();
}

function buildPaeseFilters() {
  const container = document.getElementById("paeseFilters");
  PAESI.forEach(paese => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-chip";
    btn.dataset.paese = paese.id;
    btn.textContent = `${paese.bandiera} ${paese.nome}`;
    container.appendChild(btn);
  });
}

function attachEvents() {
  document.getElementById("paeseFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filtroPaese = btn.dataset.paese;
    document.querySelectorAll("#paeseFilters .filter-chip").forEach(b => b.classList.toggle("active", b === btn));
    render();
  });

  let searchTimeout;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim().toLowerCase();
      render();
    }, 150);
  });
}

function getFilteredDishes() {
  const paesiDaMostrare = filtroPaese === "tutti" ? PAESI : PAESI.filter(p => p.id === filtroPaese);
  const risultati = [];

  paesiDaMostrare.forEach(paese => {
    paese.piatti.forEach(piatto => {
      const okSearch = !searchQuery
        || piatto.nome.toLowerCase().includes(searchQuery)
        || paese.nome.toLowerCase().includes(searchQuery);
      if (okSearch) {
        risultati.push({ paese, piatto });
      }
    });
  });

  return risultati;
}

function renderIntro() {
  const el = document.getElementById("paeseIntro");
  if (filtroPaese === "tutti") {
    el.innerHTML = "";
    return;
  }
  const paese = getPaeseById(filtroPaese);
  if (!paese) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<p><strong>${paese.bandiera} ${escapeHtml(paese.nome)}</strong> &mdash; ${escapeHtml(paese.intro)}</p>`;
}

function render() {
  renderIntro();

  const grid = document.getElementById("dishGrid");
  const countEl = document.getElementById("dishCount");
  const risultati = getFilteredDishes();

  countEl.textContent = `${risultati.length} piatt${risultati.length === 1 ? "o" : "i"} trovat${risultati.length === 1 ? "o" : "i"}`;

  grid.innerHTML = "";

  if (risultati.length === 0) {
    grid.innerHTML = '<p class="empty-message">Nessun piatto trovato con questa ricerca.</p>';
    return;
  }

  risultati.forEach(({ paese, piatto }) => {
    const card = document.createElement("article");
    card.className = "recipe-card dish-card";

    card.innerHTML = `
      <div class="recipe-card-icon">${piatto.emoji}</div>
      <div class="recipe-card-body">
        <h3>${escapeHtml(piatto.nome)}</h3>
        <div class="recipe-badges">
          <span class="badge badge-paese">${paese.bandiera} ${escapeHtml(paese.nome)}</span>
        </div>
        <p class="dish-description">${escapeHtml(piatto.descrizione)}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", init);
