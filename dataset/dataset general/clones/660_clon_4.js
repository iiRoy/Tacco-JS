(function () {
    var nucleus = this;
    var coreSystem = (typeof acquireOperationalCore === "undefined") ? nucleus.CoreSystem : acquireOperationalCore();

    if (!coreSystem) {
        coreSystem = nucleus.CoreSystem = {};
    }

    function DataFlow(sourceProducer) {
        var activeSubscribers = [];
        var sourceCleanupFunction = null;

        function activateSource() {
            if (sourceCleanupFunction === null) {
                sourceCleanupFunction = sourceProducer(function sendData(value) {
                    activeSubscribers.forEach(function (listener) {
                        listener(value);
                    });
                });
            }
        }

        function deactivateSource() {
            if (activeSubscribers.length === 0 && sourceCleanupFunction !== null) {
                sourceCleanupFunction();
                sourceCleanupFunction = null;
            }
        }

        this.registerListener = function (listenerCallback) {
            activeSubscribers.push(listenerCallback);
            activateSource();

            return function () {
                var index = activeSubscribers.indexOf(listenerCallback);
                if (index > -1) {
                    activeSubscribers.splice(index, 1);
                }
                deactivateSource();
            };
        };

        this.ignoreInitial = function () {
            var self = this;
            return new DataFlow(function (forwardData) {
                var hasPassedFirst = false;
                var originalStreamDisposer = self.registerListener(function (valueFromSource) {
                    if (!hasPassedFirst) {
                        hasPassedFirst = true;
                    } else {
                        forwardData(valueFromSource);
                    }
                });
                return originalStreamDisposer;
            });
        };
    }

    coreSystem.FromAngularPropertyWatch = function (contextScope, propertyIdentifier) {
        return new DataFlow(function (valueBroadcaster) {
            var watcherDeactivator = contextScope.$watch(function () {
                return contextScope[propertyIdentifier];
            }, function (currentValue) {
                valueBroadcaster(currentValue);
            });
            return function () {
                watcherDeactivator();
            };
        }).ignoreInitial();
    };

    DataFlow.prototype.PipeToAngularProperty = function (targetScope, targetProperty) {
        var streamUnsubscriber = this.registerListener(function (incomingData) {
            targetScope[targetProperty] = incomingData;
            targetScope.$apply();
        });

        targetScope.$on('$destroy', function (destructionEvent) {
            if (destructionEvent.targetScope === targetScope) {
                streamUnsubscriber();
            }
        });
    };
})();