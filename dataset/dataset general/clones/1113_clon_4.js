(function() {
    const activeReaderPages = new Set();

    const requestFilters = Object.freeze({
        blockTargets: ['https://plusone.google.com/*'],
        readerIdentifiers: [
            'http://www.google.com/reader/',
            'https://www.google.com/reader/'
        ]
    });

    const isReaderPageUrl = (webAddress) => {
        return requestFilters.readerIdentifiers.some(signature => webAddress.includes(signature));
    };

    const networkInterceptionHandler = (networkEventPayload) => {
        if (activeReaderPages.has(networkEventPayload.pageIdentifier)) {
            console.warn('Resource blocked due to reader page context: ' + networkEventPayload.url);
            return { halt: true };
        }
        return {};
    };

    const pageUpdateObserver = (pageIdentifier, pageStatusChanges, pageEntity) => {
        if (pageStatusChanges.location) {
            console.info('Page navigation observed: ' + pageStatusChanges.location);

            if (isReaderPageUrl(pageStatusChanges.location)) {
                activeReaderPages.add(pageIdentifier);
            } else {
                activeReaderPages.delete(pageIdentifier);
            }
        }
    };

    const browserHooks = window.chrome || window.browser;

    browserHooks.webRequest.onBeforeRequest.addListener(
        networkInterceptionHandler,
        { urls: requestFilters.blockTargets },
        ['blocking']
    );

    browserHooks.tabs.onUpdated.addListener(pageUpdateObserver);
})();