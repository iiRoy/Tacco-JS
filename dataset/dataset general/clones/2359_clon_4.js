(function(globalScope) {
    'use strict';

    var activeRequestCount = 0;

    function conductRemoteDataRetrieval(resourceLocation, requestParameters, completionCallback) {
        var dynamicCallbackName = '_responseProcessor_' + Date.now() + '_' + (activeRequestCount++);
        var externalScriptElement = document.createElement('script');
        var constructedUrl = 'http://api.dribbble.com' + resourceLocation;
        var parameterSegments = [];

        for (var keyIdentifier in requestParameters) {
            if (Object.prototype.hasOwnProperty.call(requestParameters, keyIdentifier)) {
                parameterSegments.push(encodeURIComponent(keyIdentifier) + '=' + encodeURIComponent(requestParameters[keyIdentifier]));
            }
        }

        parameterSegments.push('callback=' + dynamicCallbackName);

        if (parameterSegments.length > 0) {
            constructedUrl += '?' + parameterSegments.join('&');
        }

        globalScope[dynamicCallbackName] = function(receivedData) {
            try {
                if (externalScriptElement.parentNode) {
                    externalScriptElement.parentNode.removeChild(externalScriptElement);
                }
            } catch (removalError) { /* Silently ignore cleanup errors */ }
            delete globalScope[dynamicCallbackName];

            if (typeof receivedData === 'undefined') {
                completionCallback({ statusError: true });
            } else {
                completionCallback(receivedData);
            }
        };

        externalScriptElement.onerror = function() {
            try {
                if (externalScriptElement.parentNode) {
                    externalScriptElement.parentNode.removeChild(externalScriptElement);
                }
            } catch (errorCleanup) { /* Silently ignore cleanup errors */ }
            delete globalScope[dynamicCallbackName];
            completionCallback({ statusError: true, issue: 'Network or external service unreachable' });
        };

        externalScriptElement.src = constructedUrl;
        document.head.appendChild(externalScriptElement);
    }

    var serviceEndpointDefinitions = [
        { operationName: 'obtainShotData', pathPattern: '/shots/{id}/' },
        { operationName: 'getReboundsForShot', pathPattern: '/shots/{id}/rebounds/' },
        { operationName: 'retrieveShotsByListing', pathPattern: '/shots/{id}/' },
        { operationName: 'findPlayerShots', pathPattern: '/players/{id}/shots/' },
        { operationName: 'findFollowedShots', pathPattern: '/players/{id}/shots/following/' },
        { operationName: 'acquirePlayerData', pathPattern: '/players/{id}/' },
        { operationName: 'retrievePlayerFollowers', pathPattern: '/players/{id}/followers/' },
        { operationName: 'retrievePlayerFollowing', pathPattern: '/players/{id}/following/' },
        { operationName: 'fetchPlayerDraftees', pathPattern: '/players/{id}/draftees/' },
        { operationName: 'getShotComments', pathPattern: '/shots/{id}/comments/' },
        { operationName: 'retrieveLikedShots', pathPattern: '/players/{id}/shots/likes/' }
    ];

    var DribbleDataService = {};

    serviceEndpointDefinitions.forEach(function(definition) {
        DribbleDataService[definition.operationName] = function() {
            var inputArguments = Array.prototype.slice.call(arguments);
            var primaryIdentifierValue = inputArguments.shift();
            var finalCallback = null;
            var auxiliaryParameters = {};

            if (inputArguments.length === 1) {
                finalCallback = inputArguments[0];
            } else if (inputArguments.length === 2) {
                auxiliaryParameters = inputArguments[0] || {};
                finalCallback = inputArguments[1];
            }

            if (typeof finalCallback !== 'function') {
                // If callback is not a function, the original jQuery implementation would also likely fail
                // or not execute the callback. We'll simply return here.
                return;
            }

            var resolvedPath = definition.pathPattern.replace('{id}', primaryIdentifierValue);
            conductRemoteDataRetrieval(resolvedPath, auxiliaryParameters, finalCallback);
        };
    });

    globalScope.DribbleDataService = DribbleDataService;

})(window);