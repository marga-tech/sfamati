/* Gestione foto "ricordo personale" dei piatti tramite IndexedDB.
   Le foto NON vengono salvate in localStorage: possono essere più pesanti
   di qualche MB e IndexedDB è pensato apposta per questo tipo di dati. */

const PHOTO_DB_NAME = "pianoAlimentareFotoDB";
const PHOTO_STORE = "foto";

function openPhotoDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePhoto(entryId, blob) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).put(blob, entryId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deletePhoto(entryId) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).delete(entryId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* Carica tutte le foto salvate in una Map (entryId -> object URL), da usare come cache locale. */
async function loadAllPhotosAsMap() {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const map = new Map();
    const tx = db.transaction(PHOTO_STORE, "readonly");
    const store = tx.objectStore(PHOTO_STORE);
    const cursorRequest = store.openCursor();
    cursorRequest.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const url = URL.createObjectURL(cursor.value);
        map.set(cursor.key, url);
        cursor.continue();
      } else {
        resolve(map);
      }
    };
    cursorRequest.onerror = () => reject(cursorRequest.error);
  });
}

function generateEntryId() {
  return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
