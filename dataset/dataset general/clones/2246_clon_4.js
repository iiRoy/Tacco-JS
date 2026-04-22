(function() {
    const ascertainFeaturePresence = () => typeof window.matchMedia !== 'undefined';

    const injectResource = (resourcePath) => {
        const scriptElement = document.createElement('script');
        scriptElement.async = true;
        scriptElement.src = resourcePath;

        const placementTarget = document.head || document.getElementsByTagName('head')[0] || document.body;

        if (placementTarget) {
            placementTarget.appendChild(scriptElement);
        } else {
            document.write('<script src="' + resourcePath + '"><\/script>');
        }
    };

    if (!ascertainFeaturePresence()) {
        injectResource('public/js/respond.js');
    }
})();