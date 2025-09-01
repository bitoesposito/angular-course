/**
 * Service Worker personalizzato per l'app S43
 * Gestisce il caching intelligente di font, risorse e funzionalità offline
 */

const CACHE_NAME = 's43-cache-v1';
const FONT_CACHE_NAME = 's43-fonts-v1';
const STATIC_CACHE_NAME = 's43-static-v1';

// Risorse da mettere in cache immediatamente
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest'
];

// Font da mettere in cache prioritariamente
const FONT_RESOURCES = [
  // Aggiungi qui i percorsi dei tuoi font se ne hai
  // '/fonts/roboto.woff2',
  // '/fonts/opensans.woff2'
];

// Strategie di caching
const CACHE_STRATEGIES = {
  // Cache-first per risorse statiche
  STATIC: 'cache-first',
  // Cache-first per font
  FONT: 'cache-first',
  // Network-first per API
  API: 'network-first',
  // Stale-while-revalidate per altre risorse
  DEFAULT: 'stale-while-revalidate'
};

/**
 * Evento di installazione del Service Worker
 * Mette in cache le risorse essenziali
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installazione in corso...');
  
  event.waitUntil(
    Promise.all([
      // Cache per risorse statiche
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] Cache risorse statiche aperta');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Cache per font
      caches.open(FONT_CACHE_NAME).then(cache => {
        console.log('[SW] Cache font aperta');
        return cache.addAll(FONT_RESOURCES);
      })
    ]).then(() => {
      console.log('[SW] Installazione completata');
      // Attiva immediatamente il nuovo service worker
      return self.skipWaiting();
    })
  );
});

/**
 * Evento di attivazione del Service Worker
 * Pulisce le vecchie cache
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Attivazione in corso...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Rimuove le vecchie cache
          if (cacheName !== CACHE_NAME && 
              cacheName !== FONT_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            console.log('[SW] Rimozione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Attivazione completata');
      // Prende il controllo di tutte le pagine
      return self.clients.claim();
    })
  );
});

/**
 * Evento di fetch - gestisce le richieste di rete
 * Implementa diverse strategie di caching
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora richieste non GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignora richieste per estensioni di browser
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Gestisce richieste per font
  if (isFontRequest(request)) {
    event.respondWith(handleFontRequest(request));
    return;
  }
  
  // Gestisce richieste per API
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Gestisce richieste per risorse statiche
  if (isStaticResource(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Strategia di default per altre risorse
  event.respondWith(handleDefaultRequest(request));
});

/**
 * Verifica se la richiesta è per un font
 */
function isFontRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i);
}

/**
 * Verifica se la richiesta è per un'API
 */
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

/**
 * Verifica se la richiesta è per una risorsa statica
 */
function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/i);
}

/**
 * Gestisce le richieste per font con strategia cache-first
 */
async function handleFontRequest(request) {
  try {
    // Prima controlla la cache
    const cachedResponse = await caches.match(request, { cacheName: FONT_CACHE_NAME });
    if (cachedResponse) {
      console.log('[SW] Font servito dalla cache:', request.url);
      return cachedResponse;
    }
    
    // Se non in cache, scarica e mette in cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(FONT_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Font scaricato e messo in cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Errore nella gestione font:', error);
    // Ritorna una risposta di fallback se disponibile
    return new Response('Font non disponibile', { status: 404 });
  }
}

/**
 * Gestisce le richieste per API con strategia network-first
 */
async function handleApiRequest(request) {
  try {
    // Prima prova la rete
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Mette in cache la risposta
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Rete non disponibile per API, prova cache:', request.url);
  }
  
  // Se la rete fallisce, prova la cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[SW] API servita dalla cache:', request.url);
    return cachedResponse;
  }
  
  // Fallback per API
  return new Response('API non disponibile offline', { status: 503 });
}

/**
 * Gestisce le richieste per risorse statiche con strategia cache-first
 */
async function handleStaticRequest(request) {
  try {
    // Prima controlla la cache
    const cachedResponse = await caches.match(request, { cacheName: STATIC_CACHE_NAME });
    if (cachedResponse) {
      console.log('[SW] Risorsa statica servita dalla cache:', request.url);
      return cachedResponse;
    }
    
    // Se non in cache, scarica e mette in cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Risorsa statica scaricata e messa in cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Errore nella gestione risorsa statica:', error);
    return new Response('Risorsa non disponibile', { status: 404 });
  }
}

/**
 * Gestisce le richieste di default con strategia stale-while-revalidate
 */
async function handleDefaultRequest(request) {
  try {
    // Prima prova la cache
    const cachedResponse = await caches.match(request);
    
    // Scarica in background per aggiornare la cache
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then(cache => cache.put(request, networkResponse.clone()));
      }
      return networkResponse;
    }).catch(() => null);
    
    // Ritorna la risposta dalla cache se disponibile, altrimenti dalla rete
    if (cachedResponse) {
      console.log('[SW] Risorsa servita dalla cache (stale-while-revalidate):', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Fallback se tutto fallisce
    return new Response('Risorsa non disponibile', { status: 404 });
  } catch (error) {
    console.error('[SW] Errore nella gestione richiesta:', error);
    return new Response('Errore del servizio', { status: 500 });
  }
}

/**
 * Gestisce i messaggi dal main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage(info);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('[SW] Messaggio non gestito:', type);
  }
});

/**
 * Ottiene informazioni sulla cache
 */
async function getCacheInfo() {
  try {
    const cacheNames = await caches.keys();
    const cacheInfo = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      cacheInfo[cacheName] = {
        size: requests.length,
        urls: requests.map(req => req.url)
      };
    }
    
    return cacheInfo;
  } catch (error) {
    console.error('[SW] Errore nel recupero info cache:', error);
    return {};
  }
}

/**
 * Pulisce tutte le cache
 */
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] Tutte le cache sono state pulite');
    return true;
  } catch (error) {
    console.error('[SW] Errore nella pulizia cache:', error);
    return false;
  }
}

console.log('[SW] Service Worker personalizzato caricato');

