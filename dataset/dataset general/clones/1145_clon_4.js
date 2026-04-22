(function(globalContext) {
    if (!globalContext['_gaq']) {
        Object.defineProperty(globalContext, '_gaq', {
            value: [],
            writable: true,
            configurable: true
        });
    }
    globalContext._gaq.push(['_setAccount', 'UA-19326313-14']);
    globalContext._gaq.push(['_trackPageview']);
})(window);

function deployAnalyticsAsset() {
    var analyticsResource = document.createElement('script');
    analyticsResource.setAttribute('type', 'text/javascript');
    analyticsResource.setAttribute('async', 'true');
    analyticsResource.setAttribute('src', 'https://ssl.google-analytics.com/ga.js');

    var insertionPoint = document.head || document.body;
    if (insertionPoint) {
        insertionPoint.appendChild(analyticsResource);
    }
}
deployAnalyticsAsset();