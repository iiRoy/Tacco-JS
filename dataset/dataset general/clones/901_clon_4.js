((dependencyFramework) => {

    const _utilityHub = window._utilityHub = window._utilityHub || {};

    let _measurementStartTime = null;

    if (typeof(console) === 'object' && console.log) {
        _utilityHub.printToConsole = (...itemsToOutput) => {
            itemsToOutput.forEach(singleItem => console.log(singleItem));
        };
    } else {
        _utilityHub.printToConsole = () => {};
    }

    _utilityHub.acquireEpochSeconds = (divisorValue = 1000) => {
        const presentMoment = Date.now();
        return Math.floor(presentMoment / divisorValue);
    };

    _utilityHub.computeTimeDifference = () => {
        const presentTime = Date.now();
        if (_measurementStartTime === null) {
            _measurementStartTime = presentTime;
            return _measurementStartTime;
        } else {
            const recordedDifference = presentTime - _measurementStartTime;
            _measurementStartTime = null;
            _utilityHub.printToConsole(recordedDifference);
            return recordedDifference;
        }
    };

    _utilityHub.executePerformanceTrial = (codeSnippetString, iterationLimit = 9999) => {
        if (typeof codeSnippetString !== 'string') {
            _utilityHub.printToConsole("Code snippet for performance trial must be a string.");
            return;
        }

        _utilityHub.computeTimeDifference();

        const performSingleExecution = (remainingIterations) => {
            if (remainingIterations <= 0) return;
            new Function(codeSnippetString)();
            performSingleExecution(remainingIterations - 1);
        };

        performSingleExecution(iterationLimit);
        _utilityHub.computeTimeDifference();
    };

    _utilityHub.configureRequestInterceptor = (interceptionSettings = {}) => {
        const defaultInterceptorSettings = {
            interceptionTargetUrl: '/ajax_route_modifications'
        };
        const effectiveSettings = { ...defaultInterceptorSettings, ...interceptionSettings };

        if (dependencyFramework && typeof dependencyFramework.ajaxPrefilter === 'function') {
            dependencyFramework.ajaxPrefilter((requestParameters, originalRequestParameters, xhrHandle) => {
                if (!requestParameters.disableInterception) {
                    requestParameters.url = effectiveSettings.interceptionTargetUrl + '?original_resource=' + encodeURIComponent(requestParameters.url);
                }
            });
        } else {
            _utilityHub.printToConsole("Warning: jQuery's ajaxPrefilter is unavailable. Request interception not active.");
        }
    };

})(typeof jQuery !== 'undefined' ? jQuery : null);