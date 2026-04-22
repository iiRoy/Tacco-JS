(function() {
    'use strict';
    const globalContext = (typeof globalThis !== 'undefined') ? globalThis : self;
    const historyAccessor = globalContext['history'];
    let stateFeature;

    if (historyAccessor) {
        stateFeature = historyAccessor['pushState'];
    } else {
        stateFeature = historyAccessor;
    }

    const configObject = {};
    Object.defineProperty(configObject, 'pushState', {
        value: stateFeature,
        writable: true,
        enumerable: true,
        configurable: true
    });

    return function retrieveApplicationConfiguration() {
        return configObject;
    };
})();