/* Service worker di Sfamati.
   Strategia: "rete poi cache" (network-first) per ogni file dell'app.
   - Se c'è connessione: si prende sempre la versione più aggiornata dalla rete
     e la si salva in cache per dopo.
   - Se non c'è connessione: si usa quello che è stato salvato l'ultima volta.
   Questo evita il problema più pericoloso per una PWA: restare bloccati a
   vedere una versione vecchia dell'app anche quando si è online.

   Cambiare CACHE_NAME (es. v1 -> v2) forza la sostituzione di tutta la cache
   alla prossima apertura dell'app: usalo quando pubblichi un aggiornamento
   importante e vuoi essere sicuro che tutti ripartano da una cache pulita. */

const CACHE_NAME = "sfamati-cache-v2";

const APP_SHELL = [
  "index.html",
  "menu.html",
  "ricette.html",
  "scopri.html",
  "spesa.html",
  "storico.html",
  "calorie.html",
  "guida.html",
  "style.css",
  "manifest.json",
  "data.js",
  "i18n.js",
  "photos.js",
  "budget.js",
  "script.js",
  "currency.js",
  "ricette.js",
  "spesa.js",
  "storico.js",
  "calorie.js",
  "scopri.js",
  "localita.js",
  "home.js",
  "icon-192.png",
  "icon-512.png",
  "icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Interveniamo solo sulle richieste GET dello stesso sito: tutto il resto
  // (es. la chiamata al tasso di cambio in spesa.html) va sempre dritto in rete.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        // Se il server risponde con un errore (es. 404, 500 - può succedere
        // se il sito è momentaneamente offline o il repository non è
        // pubblicato), NON lo salviamo in cache: sovrascriverebbe l'app
        // buona già salvata con una pagina di errore. Meglio mostrare
        // quello che avevamo già.
        if (!response.ok) {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (request.mode === "navigate") {
            const fallback = await caches.match("index.html");
            if (fallback) return fallback;
          }
          return response;
        }

        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        } catch (err) {
          /* scrittura in cache fallita: non blocchiamo la risposta per questo */
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Nessuna cache per questo file esatto: se è il caricamento di una
        // pagina, mostriamo almeno la Home invece di un errore vuoto.
        if (request.mode === "navigate") {
          const fallback = await caches.match("index.html");
          if (fallback) return fallback;
        }

        return Response.error();
      })
  );
});
