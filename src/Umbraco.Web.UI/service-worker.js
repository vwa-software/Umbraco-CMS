// Update cache names any time any of the cached files change.
const CACHE_NAME = 'de-rede-cache-1.0';

self.addEventListener('install', function (evt) {

    //  Precache static resources here.
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {

            // Perform install steps
            console.log("[ServiceWorker] install");

            // get files to cache from server
            fetch('/umbraco/pwa/pwacache/getprecachefiles/0').then((response) => {
                return response.json();
            }).then(function (data) {
                console.log('[ServiceWorker] Pre-caching offline page');
                return cache.addAll(data);
            });
        })

    );

});


self.addEventListener('activate', function (evt) {
    // Remove previous cached data from disk.
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // fall back to network, do not cache.
                return fetch(event.request);

                /*
                 // fall back to network and cache
                return fetch(event.request).then(
                    function (response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );

*/

            })
    );
});
