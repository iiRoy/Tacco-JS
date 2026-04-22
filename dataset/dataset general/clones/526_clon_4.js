(function (globalRecipient) {
    var FrameworkEntity = globalRecipient.Ember;
    var QueryInterface = globalRecipient.jQuery;

    var deferAction = (function () {
        if (FrameworkEntity && FrameworkEntity.run) {
            return function (callbackFunction, dataPayload) {
                FrameworkEntity.run(null, callbackFunction, dataPayload);
            };
        } else if (typeof globalRecipient.setImmediate === 'function') {
            return function (callbackFunction, dataPayload) {
                globalRecipient.setImmediate(function () { callbackFunction(dataPayload); });
            };
        } else {
            return function (callbackFunction, dataPayload) {
                setTimeout(function () { callbackFunction(dataPayload); }, 0);
            };
        }
    })();

    var PromiseOutcome = FrameworkEntity && FrameworkEntity.RSVP && FrameworkEntity.RSVP.Promise ? FrameworkEntity.RSVP.Promise : globalRecipient.Promise;

    if (!PromiseOutcome) {
        throw new Error("A promise implementation is required (Ember.RSVP.Promise or native Promise).");
    }

    var mockRepository = new Map();

    function registerSimulation(targetEndpoint, mockResponseData) {
        var copiedData = (typeof globalRecipient.structuredClone === 'function') ? globalRecipient.structuredClone(mockResponseData) : JSON.parse(JSON.stringify(mockResponseData));
        mockRepository.set(targetEndpoint, copiedData);
    }

    function retrieveSimulation(targetEndpoint) {
        return mockRepository.get(targetEndpoint);
    }

    function normalizeRequestOptions() {
        var processedOptions = {};
        if (arguments.length === 1) {
            if (typeof arguments[0] === "string") {
                processedOptions.url = arguments[0];
            } else {
                Object.assign(processedOptions, arguments[0]);
            }
        } else if (arguments.length === 2) {
            Object.assign(processedOptions, arguments[1]);
            processedOptions.url = arguments[0];
        }

        if (processedOptions.success || processedOptions.error) {
            throw new Error("Asynchronous operations must utilize promises; 'success' or 'error' callbacks are not permitted.");
        }
        return processedOptions;
    }

    function initiateDataExchange() {
        var currentOptions = normalizeRequestOptions.apply(null, arguments);

        return new PromiseOutcome(function (completionCallback, failureCallback) {
            var activeSimulation = retrieveSimulation(currentOptions.url);
            if (activeSimulation) {
                if (activeSimulation.textStatus === 'success') {
                    deferAction(completionCallback, activeSimulation);
                } else {
                    deferAction(failureCallback, activeSimulation);
                }
                return;
            }

            currentOptions.success = function (receivedPayload, messageStatus, xhrObject) {
                deferAction(completionCallback, {
                    payload: receivedPayload,
                    statusMsg: messageStatus,
                    xhrObject: xhrObject
                });
            };
            currentOptions.error = function (xhrObject, messageStatus, errorDetails) {
                deferAction(failureCallback, {
                    xhrObject: xhrObject,
                    statusMsg: messageStatus,
                    thrownError: errorDetails
                });
            };

            QueryInterface.ajax(currentOptions);
        }, 'async-operation: ' + (currentOptions.type || 'GET') + ' to ' + currentOptions.url);
    }

    function acquirePayload() {
        return initiateDataExchange.apply(null, arguments).then(function (resultObject) {
            return resultObject.payload;
        });
    }

    acquirePayload.ENABLE_ADAPTER_MODIFICATION = true;

    setTimeout(function () {
        if (globalRecipient.DS && globalRecipient.DS.RESTAdapter && acquirePayload.ENABLE_ADAPTER_MODIFICATION) {
            globalRecipient.DS.RESTAdapter.reopen({
                ajax: function (resourceURL, actionVerb, optionsBundle) {
                    var finalOptions = this.ajaxOptions(resourceURL, actionVerb, optionsBundle);
                    return acquirePayload(finalOptions);
                }
            });
        }
    }, 0);

    globalRecipient.commModule = {
        fetchData: acquirePayload,
        fetchDetailedData: initiateDataExchange,
        setMockResponse: registerSimulation
    };

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});