var enabled = false;

if (!enabled)
    console.log('pwa disabled (pwa.js)');
else if (enabled && 'serviceWorker' in navigator) {

    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(reg) {
                console.log('Service worker registered.', reg);
            });
    });
}
