/* Registra il service worker (vedi sw.js). Il percorso è relativo così
   funziona sia su un dominio dedicato sia pubblicato in una sottocartella
   (es. GitHub Pages). Se il browser non supporta i service worker
   (raro, ma capita su iOS molto vecchi), l'app continua a funzionare
   normalmente: semplicemente non avrà la modalità offline. */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Registrazione service worker non riuscita:", err);
    });
  });
}
