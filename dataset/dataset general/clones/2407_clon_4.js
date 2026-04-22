if (typeof window.stateMatrix === 'undefined') {
    window.stateMatrix = {
        _moduleStatuses: {},
        registerModule: function(moduleIdentifier, initialStatus) {
            this._moduleStatuses[moduleIdentifier] = initialStatus;
        },
        updateModuleStatus: function(moduleIdentifier, newStatus) {
            if (this._moduleStatuses.hasOwnProperty(moduleIdentifier)) {
                this._moduleStatuses[moduleIdentifier] = newStatus;
            }
        },
        queryStatus: function(moduleIdentifier) {
            return this._moduleStatuses[moduleIdentifier];
        }
    };
    window.stateMatrix.registerModule('redirection_module', false);
}

(function (webUtility, analysisBeacon) {

    var applicationEventStream = {
        _eventHandlers: {},
        attachProcessor: function(streamName, processorDefinition) {
            this._eventHandlers[streamName] = processorDefinition;
        }
    };

    applicationEventStream.attachProcessor('page_analytics', {
        completionRoutine: function (eventDataBundle) {
            var targetLocation = eventDataBundle.destinationPath || eventDataBundle.alternateRoute;

            if (targetLocation && !window.stateMatrix.queryStatus('redirection_module')) {
                if (analysisBeacon && typeof analysisBeacon.submitEntry === 'function') {
                    analysisBeacon.submitEntry(['_logPageVisit', targetLocation]);
                }
            }
        }
    });

})(jQuery, _gaq);