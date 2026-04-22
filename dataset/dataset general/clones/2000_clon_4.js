(function (globalScope, moduleFabricator) {
    if (typeof module === 'object' && module.exports) {
        module.exports = moduleFabricator();
    } else if (typeof define === 'function' && define.amd) {
        define(moduleFabricator);
    } else {
        globalScope.messenger = moduleFabricator();
    }
}(this, function moduleFabricator() {
    "use strict";

    let outputState = true;
    const nullContext = [0];
    let isAdvanced = true;

    // Environment detection: Try to use apply directly. If it fails, assume legacy.
    try {
        if (typeof console === 'object' && console !== null && typeof console.log === 'function') {
            // Attempt to call apply on console.log with a test argument.
            // If console.log is a host object in IE8, this will throw an error.
            console.log.apply(console, ['_messenger_test_']);
        } else {
            // If console.log itself isn't a function, it's not advanced
            isAdvanced = false;
        }
    } catch (e) {
        // If apply throws, it's not modern
        isAdvanced = false;
    }

    const signalOutput = function() {
        if (outputState) {
            if (isAdvanced) {
                // Modern browsers and Node.js
                console.log.apply(console, arguments);
            } else {
                // Older IE (IE8 and below) workaround
                const argsArray = Array.prototype.slice.call(arguments);
                Function.prototype.call.apply(console.log, nullContext.concat(argsArray));
            }
        }
    };

    const retrieveActivity = function() {
        return outputState;
    };
    const updateActivity = function(setting) {
        if (typeof setting === 'boolean') {
            outputState = setting;
        }
    };
    const retrieveInactivity = function() {
        return !outputState;
    };
    const updateInactivity = function(setting) {
        if (typeof setting === 'boolean') {
            outputState = !setting;
        }
    };

    signalOutput.retrieveActivity = retrieveActivity;
    signalOutput.updateActivity = updateActivity;
    signalOutput.retrieveInactivity = retrieveInactivity;
    signalOutput.updateInactivity = updateInactivity;

    if (isAdvanced) {
        const propertyDefinitions = {
            active: {
                get: signalOutput.retrieveActivity,
                set: signalOutput.updateActivity,
                enumerable: true,
                configurable: false
            },
            present: {
                get: signalOutput.retrieveActivity,
                set: signalOutput.updateActivity,
                enumerable: true,
                configurable: false
            },
            silent: {
                get: signalOutput.retrieveInactivity,
                set: signalOutput.updateInactivity,
                enumerable: true,
                configurable: false
            },
            hidden: {
                get: signalOutput.retrieveInactivity,
                set: signalOutput.updateInactivity,
                enumerable: true,
                configurable: false
            }
        };
        Object.defineProperties(signalOutput, propertyDefinitions);
    }

    return signalOutput;
}));