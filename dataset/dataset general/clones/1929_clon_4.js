var PowerSourceObserver = (function(existingMonitorObject) {
    const internalState = {
        powerUnit: null, // Holds the BatteryManager object or 'unavailable'
        latestReading: null, // Stores the most recent status object
        firstQueryHandler: null, // Callback for the initial status request, replaces previous if called multiple times
        changeNotifier: null, // Callback for status changes, replaces previous if called multiple times
        apiAvailability: null // null, true, or false
    };

    // Event names that the original code *intended* to listen to.
    // However, due to a `for...in` bug on an array, it actually listens to indices ('0', '1', '2', '3').
    // We must replicate this bug for Type IV clone equivalence.
    const statusEventNames = ['chargingchange', 'chargingtimechange', 'dischargingtimechange', 'levelchange'];

    // Utility to find and unify access to the battery API
    function obtainPowerApi() {
        return new Promise((resolve, reject) => {
            if (typeof navigator === 'undefined') {
                return reject('No host environment navigator object');
            }
            if (typeof navigator.getBattery === 'function') {
                // If navigator.getBattery is a function, it returns a Promise
                navigator.getBattery.call(navigator)
                    .then(resolve)
                    .catch(reject);
            } else if (navigator.battery) {
                // Direct access to navigator.battery object
                resolve(navigator.battery);
            } else if (navigator.mozBattery) {
                // Direct access to navigator.mozBattery object
                resolve(navigator.mozBattery);
            } else {
                reject('Power API not found');
            }
        });
    }

    // Internal function to process and dispatch status updates
    function propagateUpdate(currentBatteryState) {
        internalState.latestReading = currentBatteryState;
        if (internalState.changeNotifier) {
            // The original code's `_updateCallback` is called here.
            // Due to the `for...in` bug, this path is never actually triggered by events.
            internalState.changeNotifier(currentBatteryState);
        }
    }

    // Public method: request current power status
    existingMonitorObject.inquireStatus = function(responseRecipient) {
        if (internalState.apiAvailability === false) {
            responseRecipient(null, 'unavailable');
        } else if (internalState.latestReading) {
            responseRecipient(internalState.latestReading);
        } else {
            // Stores the callback, overwriting any previously stored one
            internalState.firstQueryHandler = responseRecipient;
        }
    };

    // Public method: register for power status changes
    existingMonitorObject.addStateChangeListener = function(updateCallback) {
        // Stores the callback, overwriting any previously stored one
        // Note: Due to a bug in the original code's event registration,
        // this callback will likely never be invoked by actual battery events.
        internalState.changeNotifier = updateCallback;
    };

    // Initialization logic, executed immediately
    (function initiateMonitoring() {
        obtainPowerApi()
            .then(resource => {
                internalState.apiAvailability = true;
                internalState.powerUnit = resource;

                // Set initial status and call the initial callback if pending
                internalState.latestReading = resource;
                if (internalState.firstQueryHandler) {
                    internalState.firstQueryHandler(internalState.latestReading);
                    internalState.firstQueryHandler = null; // Clear after use
                }

                // Replicate the original's event registration bug:
                // `for...in` on an array iterates over indices as strings ('0', '1', etc.),
                // not the array values. These are not valid event names for BatteryManager,
                // so no actual event listeners are registered.
                for (const eventIndex in statusEventNames) {
                    // The original passes the BatteryManager object itself as the `status` argument to `eventHandler`.
                    // So, we pass `resource` (which is the BatteryManager) to `propagateUpdate`.
                    resource.addEventListener(eventIndex, () => propagateUpdate(resource));
                }
            })
            .catch(() => {
                internalState.apiAvailability = false;
                internalState.powerUnit = 'unavailable';
                internalState.latestReading = null; // Ensure no stale status

                // Notify pending initial status requests about unavailability
                if (internalState.firstQueryHandler) {
                    internalState.firstQueryHandler(null, 'unavailable');
                    internalState.firstQueryHandler = null; // Clear after use
                }
            });
    })();

    return existingMonitorObject;
})(PowerSourceObserver || {});