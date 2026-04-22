(function (globalScope, moduleFactory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], moduleFactory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = moduleFactory(require('jquery'));
    } else {
        globalScope.viewpointManager = moduleFactory(globalScope.jQuery);
    }
}(typeof self !== 'undefined' ? self : this, function (jqAlias) {

    var viewpointObserver = {};

    var measurementConfigs = [];
    var currentlyEngagedIdentifier = '';
    var activeQueryListeners = [];

    function safelyInvoke(callbackFunction) {
        if (typeof callbackFunction === 'function') {
            callbackFunction();
        }
    }

    function processAllZones() {
        var potentialActiveIdentifier = '';

        for (var i = 0; i < measurementConfigs.length; i++) {
            var config = measurementConfigs[i];
            if (config.mediaQueryObject && config.mediaQueryObject.matches) {
                potentialActiveIdentifier = config.zoneIdentifier;
            }
        }

        if (potentialActiveIdentifier !== currentlyEngagedIdentifier) {
            currentlyEngagedIdentifier = potentialActiveIdentifier;

            for (var j = 0; j < measurementConfigs.length; j++) {
                var configEntry = measurementConfigs[j];
                if (configEntry.zoneIdentifier === currentlyEngagedIdentifier) {
                    safelyInvoke(configEntry.matchHandler);
                } else {
                    safelyInvoke(configEntry.noMatchHandler);
                }
            }
        } else {
            for (var k = 0; k < measurementConfigs.length; k++) {
                var configEntry = measurementConfigs[k];
                if (configEntry.zoneIdentifier !== currentlyEngagedIdentifier) {
                    safelyInvoke(configEntry.noMatchHandler);
                }
            }
        }
    }

    viewpointObserver.defineZone = function (identifier, queryText, matchHandler, noMatchHandler) {
        measurementConfigs.push({
            zoneIdentifier: identifier,
            queryText: queryText,
            matchHandler: matchHandler,
            noMatchHandler: noMatchHandler,
            mediaQueryObject: null
        });
    };

    viewpointObserver.commenceObservation = function () {
        for (var i = 0; i < measurementConfigs.length; i++) {
            var config = measurementConfigs[i];
            var mediaQueryList;

            if (config.queryText && config.queryText !== '') {
                mediaQueryList = window.matchMedia(config.queryText);
            } else {
                mediaQueryList = {
                    matches: true,
                    media: 'all',
                    addListener: function() {},
                    removeListener: function() {},
                    addEventListener: function() {},
                    removeEventListener: function() {}
                };
            }
            config.mediaQueryObject = mediaQueryList;

            var zoneChangeListener = function() {
                processAllZones();
            };

            if (mediaQueryList.addEventListener) {
                mediaQueryList.addEventListener('change', zoneChangeListener);
            } else if (mediaQueryList.addListener) {
                mediaQueryList.addListener(zoneChangeListener);
            }
            activeQueryListeners.push({ mqList: mediaQueryList, listener: zoneChangeListener });
        }

        processAllZones();
    };

    return viewpointObserver;
}));