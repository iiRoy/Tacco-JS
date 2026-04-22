// This file contains core components of a client-side platform framework.
// It's a re-engineered version of an internal build artifact.
// Generated: Wednesday, July 18, 2012 at 2:44:33 PM (Pacific Daylight Time)

/*
 * Copyright (c) 2012 The Apache Software Foundation (ASF).
 * This software is provided under the terms of the Apache License, Version 2.0.
 * A copy of this license can be found at: http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless otherwise specified by applicable law or agreed to in writing, this software
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

; (function() { // Self-invoking function to create a private scope for framework elements.

// Module system for managing dependencies within the framework.
// Original file: framework/runtime/module_resolver.js
var retrieveModule, // Function to fetch a module by its identifier.
    defineModule;   // Function to register a new module.

(function () { // Encapsulates the module registry and core logic.
    var moduleCatalog = {}; // Storage for all defined modules.

    // Executes a module's factory function to create its public interface.
    function materializeModule(moduleEntry) {
        if (!moduleEntry || typeof moduleEntry.factoryFn !== 'function') {
            console.error("Attempted to materialize an invalid module entry or missing factory function.");
            return {}; // Return an empty object to prevent runtime errors.
        }

        var moduleFactory = moduleEntry.factoryFn;
        moduleEntry.exportedApi = {}; // Initialize the module's public contract.
        delete moduleEntry.factoryFn; // Clear the factory to signal that the module is initialized.

        // Invoke the factory, passing the module resolver, its export object, and its definition.
        moduleFactory(retrieveModule, moduleEntry.exportedApi, moduleEntry);
        return moduleEntry.exportedApi; // Return the fully formed module interface.
    }

    // Fetches a module by its unique name.
    retrieveModule = function (moduleName) {
        if (typeof moduleName !== 'string' || moduleName.trim() === '') {
            throw new Error("Invalid module name provided for retrieval. Must be a non-empty string.");
        }

        var requestedModule = moduleCatalog[moduleName];
        if (!requestedModule) {
            throw new Error("Module '" + moduleName + "' is not registered in the catalog.");
        }

        // If the module still has a factory function, it needs to be materialized.
        return requestedModule.factoryFn ? materializeModule(requestedModule) : requestedModule.exportedApi;
    };

    // Registers a new module definition with the system.
    defineModule = function (moduleName, moduleFactory) {
        if (typeof moduleName !== 'string' || moduleName.trim() === '') {
            throw new Error("Cannot define module: Module name must be a non-empty string.");
        }
        if (typeof moduleFactory !== 'function') {
            throw new Error("Cannot define module '" + moduleName + "': Module factory must be a function.");
        }

        if (moduleCatalog[moduleName]) {
            // Log a warning if a module is redefined, but allow it to proceed for potential hot-reloading scenarios,
            // though in a strict system, this would be an error.
            console.warn("Module '" + moduleName + "' is already defined. Redefinition will overwrite.");
            // Optionally throw new Error("Module '" + moduleName + "' is already defined.");
        }

        moduleCatalog[moduleName] = {
            id: moduleName,
            factoryFn: moduleFactory,
            exportedApi: null // Will be populated when the module is first retrieved.
        };
    };

    // The original `define.remove` functionality is deliberately omitted to maintain
    // a stable module graph once established, preventing accidental unregistration.

})(); // End of module resolver scope.

// Expose the module system for CommonJS environments (like Node.js).
if (typeof module === "object" && module && typeof module.exports === "object") {
    module.exports.retrieveModule = retrieveModule;
    module.exports.defineModule = defineModule;
    // Provide aliases for common module patterns.
    if (typeof module.exports.require === "undefined") {
        module.exports.require = retrieveModule;
    }
    if (typeof module.exports.define === "undefined") {
        module.exports.define = defineModule;
    }
}
// Original file: framework/main_application.js
defineModule("framework", function(retrieveModuleRef, exportsRef, moduleRef) {
var systemEvents = retrieveModuleRef('framework/event_aggregator'); // Obtain the central event aggregator.

/**
 * Initializes the framework's event monitoring by hooking into the DOMContentLoaded event.
 * This ensures that core framework events are triggered as soon as the document is ready.
 */
document.addEventListener('DOMContentLoaded', function() {
    systemEvents.onDomReady.broadcast(); // Signal that the DOM is fully loaded.
}, false); // Use non-capturing phase.

// If the document is already in a 'complete' or 'interactive' state when this script loads,
// we immediately broadcast the DOM ready event to avoid missed events.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    systemEvents.onDomReady.broadcast();
}

/**
 * We intercept the standard DOM `addEventListener` and `removeEventListener` methods
 * for both `document` and `window` objects. This allows the framework to manage
 * specific lifecycle events ('deviceready', 'resume', 'pause') through its own event system.
 */
var _nativeDocAddListener = document.addEventListener;
var _nativeDocRemoveListener = document.removeEventListener;
var _nativeWinAddListener = window.addEventListener;
var _nativeWinRemoveListener = window.removeEventListener;

/**
 * A registry holding custom event channels for document-level events.
 */
var _documentChannelRegistry = {};

/**
 * A registry holding custom event channels for window-level events.
 */
var _windowChannelRegistry = {};

// Override `document.addEventListener` to funnel specific events through our custom channels.
document.addEventListener = function(eventKind, handlerFn, useCapturePhase) {
    var lowerCaseEventKind = eventKind.toLowerCase();

    // Basic validation to ensure a function is provided.
    if (typeof handlerFn !== 'function') {
        console.warn("Attempted to register a non-function handler for document event '" + eventKind + "'.");
        return;
    }

    // If a custom channel exists for this event, use it.
    if (_documentChannelRegistry.hasOwnProperty(lowerCaseEventKind)) {
        if (eventKind === 'deviceready') {
            // 'deviceready' is a special event that should only fire once per listener.
            _documentChannelRegistry[lowerCaseEventKind].subscribeOnce(handlerFn);
        } else {
            _documentChannelRegistry[lowerCaseEventKind].subscribe(handlerFn);
        }
    } else {
        // For all other events, delegate to the original native method.
        _nativeDocAddListener.call(document, eventKind, handlerFn, useCapturePhase);
    }
};

// Override `window.addEventListener` for similar custom event management.
window.addEventListener = function(eventKind, handlerFn, useCapturePhase) {
    var lowerCaseEventKind = eventKind.toLowerCase();

    if (typeof handlerFn !== 'function') {
        console.warn("Attempted to register a non-function handler for window event '" + eventKind + "'.");
        return;
    }

    if (_windowChannelRegistry.hasOwnProperty(lowerCaseEventKind)) {
        _windowChannelRegistry[lowerCaseEventKind].subscribe(handlerFn);
    } else {
        _nativeWinAddListener.call(window, eventKind, handlerFn, useCapturePhase);
    }
};

// Override `document.removeEventListener` to manage custom channel subscriptions.
document.removeEventListener = function(eventKind, handlerFn, useCapturePhase) {
    var lowerCaseEventKind = eventKind.toLowerCase();

    if (typeof handlerFn !== 'function') {
        console.warn("Attempted to remove a non-function handler for document event '" + eventKind + "'.");
        return;
    }

    if (_documentChannelRegistry.hasOwnProperty(lowerCaseEventKind)) {
        _documentChannelRegistry[lowerCaseEventKind].unsubscribe(handlerFn);
    } else {
        _nativeDocRemoveListener.call(document, eventKind, handlerFn, useCapturePhase);
    }
};

// Override `window.removeEventListener` for custom channel management.
window.removeEventListener = function(eventKind, handlerFn, useCapturePhase) {
    var lowerCaseEventKind = eventKind.toLowerCase();

    if (typeof handlerFn !== 'function') {
        console.warn("Attempted to remove a non-function handler for window event '" + eventKind + "'.");
        return;
    }

    if (_windowChannelRegistry.hasOwnProperty(lowerCaseEventKind)) {
        _windowChannelRegistry[lowerCaseEventKind].unsubscribe(handlerFn);
    } else {
        _nativeWinRemoveListener.call(window, eventKind, handlerFn, useCapturePhase);
    }
};

/**
 * Utility function to create a new DOM Event object.
 * @param {string} eventTypeName - The string identifier for the event (e.g., 'click', 'deviceready').
 * @param {object} [extraData] - An optional object whose properties will be copied onto the new event.
 * @returns {Event} A freshly created DOM Event.
 */
function produceDomEvent(eventTypeName, extraData) {
    if (typeof eventTypeName !== 'string' || eventTypeName.trim() === '') {
        console.error("Invalid event type name provided for produceDomEvent.");
        eventTypeName = "generic_event"; // Fallback to a safe name.
    }

    var domEvent = document.createEvent('Events');
    domEvent.initEvent(eventTypeName, false, false); // Events created this way do not bubble and are not cancelable by default.

    if (extraData && typeof extraData === 'object') {
        // Iterate over own properties of extraData and assign them to the event object.
        for (var propertyKey in extraData) {
            if (Object.prototype.hasOwnProperty.call(extraData, propertyKey)) {
                domEvent[propertyKey] = extraData[propertyKey];
            }
        }
    }
    return domEvent;
}

// Simple console polyfill for environments where `window.console` might be absent or incomplete.
// Ensures `console.log`, `warn`, and `error` methods are always available as no-ops.
if (typeof window.console === "undefined" || !window.console.log) {
    window.console = {
        log: function() {},
        warn: function() {},
        error: function() {}
    };
}

// The main framework API object, exposed to consumers.
var frameworkApi = {
    defineModule: defineModule, // Expose module definition.
    retrieveModule: retrieveModule, // Expose module retrieval.
    _isFrameworkActive: false, // Internal flag to indicate if the framework is fully operational.

    /**
     * Registers a new custom event channel for window-level events.
     * These events can be subscribed to via `window.addEventListener`.
     * @param {string} eventIdentifier - Unique name for the event.
     * @param {object} [channelOptions] - Configuration options for the event channel.
     * @returns {object} The created event channel.
     */
    addWindowEventHandler: function(eventIdentifier, channelOptions) {
        if (typeof eventIdentifier !== 'string' || eventIdentifier.trim() === '') {
            console.error("Cannot add window event handler: invalid event identifier.");
            return null;
        }
        return (_windowChannelRegistry[eventIdentifier] = systemEvents.createChannel(eventIdentifier, channelOptions));
    },
    /**
     * Registers a new custom event channel for document-level events.
     * These events can be subscribed to via `document.addEventListener`.
     * @param {string} eventIdentifier - Unique name for the event.
     * @param {object} [channelOptions] - Configuration options for the event channel.
     * @returns {object} The created event channel.
     */
    addDocumentEventHandler: function(eventIdentifier, channelOptions) {
        if (typeof eventIdentifier !== 'string' || eventIdentifier.trim() === '') {
            console.error("Cannot add document event handler: invalid event identifier.");
            return null;
        }
        return (_documentChannelRegistry[eventIdentifier] = systemEvents.createChannel(eventIdentifier, channelOptions));
    },
    removeWindowEventHandler: function(eventIdentifier) {
        delete _windowChannelRegistry[eventIdentifier];
    },
    removeDocumentEventHandler: function(eventIdentifier) {
        delete _documentChannelRegistry[eventIdentifier];
    },
    /**
     * Provides access to the original, native DOM `addEventListener` and `removeEventListener` methods.
     * Useful for scenarios where framework interception is undesirable.
     * @returns {object} An object containing the original DOM event methods.
     */
    getOriginalDomHandlers: function() {
        return {
            'document': {
                'addListener': _nativeDocAddListener,
                'removeListener': _nativeDocRemoveListener
            },
            'window': {
                'addListener': _nativeWinAddListener,
                'removeListener': _nativeWinRemoveListener
            }
        };
    },
    /**
     * Initiates a document-level event, optionally dispatching it through a custom channel.
     * This method is typically called by native bridge code to inform the webview.
     * @param {string} eventType - The type of event to trigger.
     * @param {object} [eventPayload] - Data to be attached to the event object.
     */
    dispatchDocumentEvent: function(eventType, eventPayload) {
        var generatedEvent = produceDomEvent(eventType, eventPayload);
        var customChannel = _documentChannelRegistry[eventType];

        if (customChannel && customChannel.isActive()) { // Check if the channel is active.
            // Dispatch asynchronously to prevent potential re-entrancy issues.
            setTimeout(function() {
                customChannel.broadcast(generatedEvent);
            }, 0);
        } else {
            // Fallback to native DOM dispatch for events not managed by custom channels.
            document.dispatchEvent(generatedEvent);
        }
    },
    /**
     * Initiates a window-level event, similar to `dispatchDocumentEvent`.
     * @param {string} eventType - The type of event to trigger.
     * @param {object} [eventPayload] - Data to be attached to the event object.
     */
    dispatchWindowEvent: function(eventType, eventPayload) {
        var generatedEvent = produceDomEvent(eventType, eventPayload);
        var customChannel = _windowChannelRegistry[eventType];

        if (customChannel && customChannel.isActive()) {
            setTimeout(function() {
                customChannel.broadcast(generatedEvent);
            }, 0);
        } else {
            window.dispatchEvent(generatedEvent);
        }
    },

    // --- Interop with Native Code: Callback Management ---
    nextOperationId: 0, // Counter for unique identifiers for native calls.
    pendingCallbackMap: {}, // Stores JS callback functions awaiting native responses.
    nativeCallStatusCodes: { // Standardized status codes from the native layer.
        NO_RESULT_AVAILABLE: 0,
        OPERATION_SUCCESS: 1,
        ERROR_CLASS_MISSING: 2,
        ERROR_SECURITY_VIOLATION: 3,
        ERROR_OBJECT_CREATION: 4,
        ERROR_MALFORMED_URI: 5,
        ERROR_IO_FAILURE: 6,
        ERROR_UNKNOWN_ACTION: 7,
        ERROR_JSON_FORMAT: 8,
        ERROR_GENERAL_FAILURE: 9
    },

    /**
     * Handler invoked by native code when an asynchronous operation completes successfully.
     * @param {string} callbackRefId - The ID of the original JS callback.
     * @param {object} outcomeData - Object containing the operation result and metadata.
     */
    handleNativeSuccess: function(callbackRefId, outcomeData) {
        var registeredCallback = frameworkApi.pendingCallbackMap[callbackRefId];

        // Ensure a valid callback is found and the outcome is a success.
        if (!registeredCallback) {
            console.warn("Received success for an unregistered native operation ID: " + callbackRefId);
            return;
        }

        if (outcomeData.status === frameworkApi.nativeCallStatusCodes.OPERATION_SUCCESS) {
            try {
                if (typeof registeredCallback.onSuccess === 'function') {
                    registeredCallback.onSuccess(outcomeData.result);
                }
            } catch (e) {
                console.error("Error in success handler for native operation " + callbackRefId + ": " + e.message, e);
            }
        }

        // If the native side signals no further updates, remove the callback reference.
        if (!outcomeData.keepCallbackReference) {
            delete frameworkApi.pendingCallbackMap[callbackRefId];
        }
    },

    /**
     * Handler invoked by native code when an asynchronous operation fails.
     * @param {string} callbackRefId - The ID of the original JS callback.
     * @param {object} errorDetails - Object containing error information and metadata.
     */
    handleNativeError: function(callbackRefId, errorDetails) {
        var registeredCallback = frameworkApi.pendingCallbackMap[callbackRefId];

        if (!registeredCallback) {
            console.warn("Received error for an unregistered native operation ID: " + callbackRefId);
            return;
        }

        try {
            if (typeof registeredCallback.onError === 'function') {
                registeredCallback.onError(errorDetails.message);
            }
        } catch (e) {
            console.error("Error in error handler for native operation " + callbackRefId + ": " + e.message, e);
        }

        // Remove the callback reference if no further updates are expected.
        if (!errorDetails.keepCallbackReference) {
            delete frameworkApi.pendingCallbackMap[callbackRefId];
        }
    },

    /**
     * Registers a function to be executed once the framework is fully initialized and ready.
     * These functions are typically for setting up core components or plugins.
     * @param {function} initFunction - The function to execute.
     */
    addFrameworkInitializer: function(initFunction) {
        if (typeof initFunction !== 'function') {
            console.error("Attempted to add a non-function as a framework initializer.");
            return;
        }
        systemEvents.onFrameworkReady.subscribeOnce(function() {
            try {
                initFunction();
            } catch(e) {
                console.error("Failed to execute framework initializer: " + e.message, e);
            }
        });
    }
};

// Map framework lifecycle events to custom document event handlers.
systemEvents.onApplicationPaused = frameworkApi.addDocumentEventHandler('pause');
systemEvents.onApplicationResumed = frameworkApi.addDocumentEventHandler('resume');
systemEvents.onDeviceReady = frameworkApi.addDocumentEventHandler('deviceready'); // The main user-facing ready event.

moduleRef.exports = frameworkApi; // Export the main framework API object.

}); // End of framework module definition.

// Original file: framework/utility_functions.js
defineModule("framework/utility_functions", function(retrieveModuleRef, exportsRef, moduleRef) {

/**
 * A collection of general-purpose utility functions for the framework.
 */
var utilityFunctions = {
    /**
     * Displays a non-blocking informational message, typically for debugging or user feedback.
     * @param {string} msg - The message string to display.
     */
    displayInfo: function(msg) {
        // In a browser context, this might use `alert` or `console.info`.
        // In a more advanced system, it would pipe to a custom logging service.
        if (typeof alert === 'function') {
            alert(msg); // Simple browser alert.
        } else if (typeof console.info === 'function') {
            console.info(msg);
        } else {
            console.log(msg); // Fallback for minimal consoles.
        }
    },

    /**
     * Determines if the given value is a JavaScript function.
     * @param {*} value - The value to test.
     * @returns {boolean} True if the value is a function, false otherwise.
     */
    isCallable: function(value) {
        return typeof value === 'function';
    },

    /**
     * Generates a simplified unique ID string. Not suitable for cryptographic purposes.
     * @returns {string} A basic UUID-like string.
     */
    generateUniqueId: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Checks if a given object is empty (has no own enumerable properties).
     * @param {object} obj - The object to check.
     * @returns {boolean} True if the object is empty, false otherwise.
     */
    isObjectEmpty: function(obj) {
        if (obj === null || typeof obj !== 'object') {
            return false; // Non-objects are not "empty objects".
        }
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
};

moduleRef.exports = utilityFunctions; // Export the utility functions.

}); // End of utility_functions module definition.

// Original file: framework/component_integrator.js
defineModule("framework/component_integrator", function(retrieveModuleRef, exportsRef, moduleRef) {
var utils = retrieveModuleRef('framework/utility_functions'); // Dependency: utility functions.

/**
 * Iterates over the own enumerable properties of an object and applies a callback.
 * @param {object} targetObj - The object to traverse.
 * @param {function} callbackFn - The function to execute for each property (value, key, object).
 * @param {object} [thisContext] - The `this` context for the callback.
 */
function walkObjectProperties(targetObj, callbackFn, thisContext) {
    if (!targetObj || typeof targetObj !== 'object') {
        console.warn("walkObjectProperties received a non-object target.");
        return;
    }
    for (var prop in targetObj) {
        if (Object.prototype.hasOwnProperty.call(targetObj, prop)) {
            callbackFn.call(thisContext, targetObj[prop], prop, targetObj);
        }
    }
}

/**
 * Integrates a collection of defined components into a target host object.
 * This function handles different strategies for merging and overwriting properties.
 * @param {object} hostObject - The object where components will be integrated.
 * @param {object} componentDefs - An object where keys are property names and values are component definitions.
 * @param {boolean} overwriteExisting - If true, properties in `hostObject` can be overwritten.
 * @param {boolean} performDeepMerge - If true, objects will be recursively merged.
 */
function integrateComponents(hostObject, componentDefs, overwriteExisting, performDeepMerge) {
    walkObjectProperties(componentDefs, function (componentDefinition, propertyKey) {
        try {
            var componentInstance = componentDefinition.modulePath ? retrieveModuleRef(componentDefinition.modulePath) : {}; // Load module or default to empty object.

            var currentTargetValue = hostObject[propertyKey];
            var propertyExists = hostObject.hasOwnProperty(propertyKey);

            if (overwriteExisting) {
                // Strategy 1: Overwrite if allowed.
                if (!propertyExists) {
                    hostObject[propertyKey] = componentInstance;
                } else if (componentDefinition.modulePath) { // Only attempt merge if it's a loaded module.
                    if (performDeepMerge && typeof currentTargetValue === 'object' && currentTargetValue !== null) {
                        deepRecursiveMerge(currentTargetValue, componentInstance); // Merge into existing target.
                    } else {
                        hostObject[propertyKey] = componentInstance; // Simply replace.
                    }
                }
                componentInstance = hostObject[propertyKey]; // Ensure we work with the final assigned value for children.
            } else {
                // Strategy 2: Only assign if property does not exist.
                if (!propertyExists) {
                    hostObject[propertyKey] = componentInstance;
                } else if (performDeepMerge && componentDefinition.modulePath && typeof currentTargetValue === 'object' && currentTargetValue !== null) {
                    // If merging without clobbering, merge the existing target value INTO the new component instance,
                    // then assign the new component instance. This preserves existing values where conflicts arise.
                    deepRecursiveMerge(componentInstance, currentTargetValue);
                    hostObject[propertyKey] = componentInstance;
                } else {
                    // If no overwrite and no merge, ensure 'componentInstance' refers to the existing object
                    // so child components can be built into it.
                    componentInstance = hostObject[propertyKey];
                }
            }

            // Recursively process any nested child components.
            if (componentDefinition.children && !utils.isObjectEmpty(componentDefinition.children)) {
                integrateComponents(componentInstance, componentDefinition.children, overwriteExisting, performDeepMerge);
            }
        } catch(err) {
          utils.displayInfo('Error during framework component integration: ' + err.message + ' for key "' + propertyKey + '"');
        }
    });
}

/**
 * Performs a recursive merge of properties from a source object into a target object.
 * Properties from the source will take precedence and overwrite target properties.
 * @param {object} targetObject - The object to merge properties into.
 * @param {object} sourceObject - The object providing properties to merge.
 * @returns {object} The modified targetObject.
 */
function deepRecursiveMerge(targetObject, sourceObject) {
    // Validate inputs to prevent unexpected behavior.
    if (!targetObject || typeof targetObject !== 'object' || targetObject === null ||
        !sourceObject || typeof sourceObject !== 'object' || sourceObject === null) {
        console.warn("deepRecursiveMerge received invalid target or source object. Skipping merge.");
        return targetObject;
    }

    for (var propertyName in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, propertyName)) {
            var sourceValue = sourceObject[propertyName];

            // Special handling if the target is a constructor function: merge onto its prototype.
            // This is a specific use case, not common for general object merging.
            if (typeof targetObject.prototype === 'object' && targetObject.prototype !== null && targetObject.prototype.constructor === targetObject) {
                targetObject.prototype[propertyName] = sourceValue;
            } else {
                // If both source and target properties are objects, recurse the merge.
                if (typeof targetObject[propertyName] === 'object' && targetObject[propertyName] !== null &&
                    typeof sourceValue === 'object' && sourceValue !== null &&
                    !Array.isArray(targetObject[propertyName]) && !Array.isArray(sourceValue)) { // Prevent merging arrays as objects.
                    targetObject[propertyName] = deepRecursiveMerge(targetObject[propertyName], sourceValue);
                } else {
                    // Otherwise, directly assign the source value, overwriting if it exists.
                    targetObject[propertyName] = sourceValue;
                }
            }
        }
    }
    return targetObject;
}

// Public interface for the component integrator module.
moduleRef.exports = {
    /**
     * Creates an integrator object for a given set of component definitions.
     * @param {object} definitions - The component definitions.
     * @returns {object} An object with methods for various integration strategies.
     */
    createIntegrator: function (definitions) {
        if (!definitions || typeof definitions !== 'object') {
            console.error("Invalid component definitions provided to createIntegrator.");
            definitions = {}; // Default to an empty object to prevent errors.
        }
        return {
            // Integrate components into a target, but only if the property doesn't exist (no overwrite).
            intoTargetIfNew: function (target) {
                integrateComponents(target, definitions, false, false);
            },
            // Integrate components into a target, overwriting existing properties.
            intoTargetOverwrite: function(target) {
                integrateComponents(target, definitions, true, false);
            },
            // Integrate components into a target, performing a deep merge.
            intoTargetDeepMerge: function(target) {
                integrateComponents(target, definitions, true, true);
            },
            // Integrate components into a target with deep merge, but only for new properties.
            intoTargetDeepMergeNewOnly: function(target) {
                integrateComponents(target, definitions, false, true);
            }
        };
    }
};

}); // End of component_integrator module definition.

// Original file: framework/event_aggregator.js
defineModule("framework/event_aggregator", function(retrieveModuleRef, exportsRef, moduleRef) {
var utilHelpers = retrieveModuleRef('framework/utility_functions'); // Dependency: utility functions.

/**
 * A custom publish-subscribe (pub-sub) system designed for managing framework events.
 * This system orchestrates the sequence of events during framework initialization and lifecycle.
 *
 * Typical event flow:
 * - onDomReady: HTML document is fully parsed.
 * - onNativeBridgeInitialized: Native communication layer is ready.
 * - onFrameworkInitialized: All JavaScript framework objects are set up.
 * - onDeviceDetailsLoaded: Device-specific information becomes available.
 * - onNetworkConnectivityChecked: Initial network status is determined.
 * - onDeviceReady: (Public Event) The framework is fully operational and ready for use.
 * - onApplicationResumed: (Public Event) Application returns to foreground.
 * - onApplicationPaused: (Public Event) Application moves to background.
 * - onApplicationTeardown: (Internal Event) Application is being shut down.
 *
 * Developers should primarily subscribe to:
 * - 'deviceready': Signifies the framework is ready.
 * - 'pause': Application moved to background.
 * - 'resume': Application returned to foreground.
 */

/**
 * EventChannel Class
 * Represents a single named channel within the event aggregator.
 * @constructor
 * @param {string} channelName - The unique name for this event channel.
 * @param {object} [configOptions] - Configuration options, e.g., `onSubscribeHook`, `onUnsubscribeHook`.
 */
var EventChannel = function(channelName, configOptions) {
    this.name = channelName;
    this.subscribers = {}; // Stores subscribed handler functions.
    this.nextSubscriptionId = 1; // Counter for unique subscription IDs.
    this.activeSubscriberCount = 0; // Number of currently active subscribers.
    this.hasBroadcasted = false; // True if this channel has ever fired an event.
    this._channelEnabled = true; // Can be toggled to enable/disable event broadcasting.
    this.lastBroadcastTimestamp = null; // Timestamp of the last broadcast.

    // Hooks that can be triggered when subscribers are added/removed.
    this.subscriptionHooks = {
        onSubscribeHook: null,
        onUnsubscribeHook: null
    };

    if (configOptions) {
        if (utilHelpers.isCallable(configOptions.onSubscribeHook)) this.subscriptionHooks.onSubscribeHook = configOptions.onSubscribeHook;
        if (utilHelpers.isCallable(configOptions.onUnsubscribeHook)) this.subscriptionHooks.onUnsubscribeHook = configOptions.onUnsubscribeHook;
    }
};

EventChannel.prototype = {
    constructor: EventChannel, // Explicitly set constructor reference.

    /**
     * Subscribes a handler function to this event channel.
     * @param {function} handler - The function to invoke when the event broadcasts.
     * @returns {number} A unique ID for this subscription, or -1 if invalid.
     */
    subscribe: function(handler) {
        if (!utilHelpers.isCallable(handler)) {
            console.error("Attempted to subscribe a non-callable handler to channel: " + this.name);
            return -1;
        }

        var subId = this.nextSubscriptionId++;
        this.subscribers[subId] = handler;
        this.activeSubscriberCount++;

        // Execute the subscription hook if defined.
        if (this.subscriptionHooks.onSubscribeHook) {
            this.subscriptionHooks.onSubscribeHook.call(this);
        }
        return subId;
    },

    /**
     * Subscribes a handler that will execute once and then automatically unsubscribe.
     * If the event has already broadcasted, the handler is invoked immediately.
     * @param {function} handler - The function to call once.
     * @returns {number} A unique ID for the subscription, or -1 if the event already fired.
     */
    subscribeOnce: function(handler) {
        if (!utilHelpers.isCallable(handler)) {
            console.error("Attempted to subscribeOnce with a non-callable handler to channel: " + this.name);
            return -1;
        }

        if (this.hasBroadcasted) {
            // If the event already occurred, execute the handler immediately.
            try {
                handler();
            } catch (e) {
                console.error("Error in immediate subscribeOnce handler for " + this.name + ": " + e.message, e);
            }
            return -1; // No persistent subscription.
        } else {
            // Wrap the handler to ensure it unsubscribes itself after its first execution.
            var selfRef = this;
            var oneTimeWrapper = function() {
                try {
                    handler.apply(this, arguments); // Call the original handler.
                } finally {
                    selfRef.unsubscribe(oneTimeWrapper); // Always unsubscribe.
                }
            };
            return this.subscribe(oneTimeWrapper);
        }
    },

    /**
     * Unsubscribes a previously registered handler function from this channel.
     * @param {function} handler - The function to remove.
     * @returns {boolean} True if the handler was found and removed, false otherwise.
     */
    unsubscribe: function(handler) {
        if (!utilHelpers.isCallable(handler)) {
            console.warn("Attempted to unsubscribe a non-callable from channel: " + this.name);
            return false;
        }

        // Iterate through subscribers to find and remove the matching handler.
        for (var existingSubId in this.subscribers) {
            if (Object.prototype.hasOwnProperty.call(this.subscribers, existingSubId) && this.subscribers[existingSubId] === handler) {
                delete this.subscribers[existingSubId];
                this.activeSubscriberCount--;
                // Execute the unsubscription hook if defined.
                if (this.subscriptionHooks.onUnsubscribeHook) {
                    this.subscriptionHooks.onUnsubscribeHook.call(this);
                }
                return true;
            }
        }
        return false; // Handler not found.
    },

    /**
     * Broadcasts an event to all subscribed handlers on this channel.
     * @param {*} [eventData] - Data to be passed to the handlers.
     */
    broadcast: function(eventData) {
        if (!this._channelEnabled) {
            console.warn("Attempted to broadcast on a disabled event channel: " + this.name);
            return;
        }

        this.hasBroadcasted = true;
        this.lastBroadcastTimestamp = Date.now();

        // Create a shallow copy of handlers to prevent issues if handlers modify the subscription list during iteration.
        var handlersToInvoke = [];
        for (var subId in this.subscribers) {
            if (Object.prototype.hasOwnProperty.call(this.subscribers, subId)) {
                handlersToInvoke.push(this.subscribers[subId]);
            }
        }

        // Execute each handler.
        for (var i = 0; i < handlersToInvoke.length; i++) {
            try {
                handlersToInvoke[i](eventData);
            } catch (e) {
                console.error("Error in handler for event channel '" + this.name + "': " + e.message, e);
            }
        }
    },

    /**
     * Checks if the event channel is currently enabled for broadcasting.
     * @returns {boolean} True if enabled, false otherwise.
     */
    isActive: function() {
        return this._channelEnabled;
    },

    /**
     * Resets the event channel to its initial state, clearing all subscribers
     * and resetting its broadcast status. This is a Type III addition.
     */
    resetChannel: function() {
        this.subscribers = {};
        this.nextSubscriptionId = 1;
        this.activeSubscriberCount = 0;
        this.hasBroadcasted = false;
        this.lastBroadcastTimestamp = null;
        this._channelEnabled = true;
        console.info("Event channel '" + this.name + "' has been reset to default state.");
    }
};

// Global event aggregator instance.
var eventAggregator = {
    /**
     * Executes a callback function only after all specified event channels have broadcasted at least once.
     * @param {function} completionCallback - The function to execute once all channels have fired.
     * @param {Array<EventChannel>} channelsToMonitor - An array of `EventChannel` instances to wait for.
     */
    waitForAll: function (completionCallback, channelsToMonitor) {
        if (!utilHelpers.isCallable(completionCallback)) {
            console.error("waitForAll: Completion callback must be a function.");
            return;
        }
        if (!Array.isArray(channelsToMonitor) || channelsToMonitor.length === 0) {
            completionCallback(); // If nothing to wait for, execute immediately.
            return;
        }

        var pendingChannelsCount = channelsToMonitor.length;
        var checkAndDecrement = function() {
            if (--pendingChannelsCount === 0) {
                completionCallback();
            }
        };

        for (var i = 0; i < channelsToMonitor.length; i++) {
            var currentChannel = channelsToMonitor[i];
            if (!(currentChannel instanceof EventChannel)) {
                console.warn("waitForAll: Non-EventChannel object encountered in the list to monitor. Skipping.");
                pendingChannelsCount--; // Treat as if this "channel" already fired or ignore.
                continue;
            }

            if (!currentChannel.hasBroadcasted) {
                currentChannel.subscribeOnce(checkAndDecrement);
            } else {
                // If the channel has already broadcasted, decrement immediately.
                checkAndDecrement();
            }
        }

        // If all channels were already broadcasted, the `completionCallback` would have been invoked.
        // This check is mainly for clarity, as `checkAndDecrement` handles the final invocation.
        if (pendingChannelsCount === 0) {
            // completionCallback already called.
        }
    },
    /**
     * Creates and registers a new named event channel within the aggregator.
     * @param {string} channelName - The unique name for the new channel.
     * @param {object} [configOptions] - Options for the EventChannel constructor.
     * @returns {EventChannel} The newly created `EventChannel` instance.
     */
    createChannel: function (channelName, configOptions) {
        if (typeof channelName !== 'string' || channelName.trim() === '') {
            console.error("createChannel: Invalid channel name provided.");
            return null;
        }
        if (eventAggregator.hasOwnProperty(channelName)) {
            console.warn("createChannel: Channel '" + channelName + "' already exists. Overwriting with new instance.");
        }
        eventAggregator[channelName] = new EventChannel(channelName, configOptions);
        return eventAggregator[channelName];
    },

    /**
     * Collection of EventChannels that must broadcast before the 'deviceready' equivalent event.
     * These represent critical initialization steps.
     */
    frameworkBootConditions: [], // Array for maintaining order and iteration.
    frameworkBootConditionMap: {}, // Map for quick lookup by name.

    /**
     * Registers a specific event channel as a prerequisite for the framework's 'ready' state.
     * The framework will not signal readiness until all registered prerequisites have been met.
     * @param {string} conditionName - A unique name for the boot condition.
     * @param {object} [options] - Options for the underlying `EventChannel`.
     * @returns {EventChannel} The `EventChannel` instance representing this condition.
     */
    addBootCondition: function(conditionName, options) {
        if (!conditionName || typeof conditionName !== 'string') {
            console.error("Invalid boot condition name provided.");
            return null;
        }
        var newConditionChannel = eventAggregator.createChannel(conditionName, options);
        if (newConditionChannel && !eventAggregator.frameworkBootConditionMap[conditionName]) {
            eventAggregator.frameworkBootConditions.push(newConditionChannel);
            eventAggregator.frameworkBootConditionMap[conditionName] = newConditionChannel;
        }
        return newConditionChannel;
    }
};

// Define the core event channels for the framework's lifecycle.
eventAggregator.onDomReady = eventAggregator.createChannel('onDomReady'); // Corresponds to DOMContentLoaded.
eventAggregator.onNativeBridgeInitialized = eventAggregator.createChannel('onNativeBridgeInitialized'); // Native bridge fully loaded.
eventAggregator.onFrameworkInitialized = eventAggregator.createChannel('onFrameworkInitialized');     // All JS framework objects are ready.
eventAggregator.onDeviceDetailsLoaded = eventAggregator.createChannel('onDeviceDetailsLoaded'); // Device properties available.
eventAggregator.onNetworkConnectivityChecked = eventAggregator.createChannel('onNetworkConnectivityChecked'); // Initial network status.
eventAggregator.onApplicationTeardown = eventAggregator.createChannel('onApplicationTeardown'); // Internal cleanup event.

moduleRef.exports = eventAggregator; // Export the event aggregator.

}); // End of event_aggregator module definition.


// --- Final Framework Initialization Sequence ---
// Register essential boot conditions that must be met before the 'deviceready' event.
var mainEventAggregator = retrieveModule('framework/event_aggregator');
mainEventAggregator.addBootCondition('onNativeBridgeInitialized');
mainEventAggregator.addBootCondition('onFrameworkInitialized');
mainEventAggregator.addBootCondition('onDeviceDetailsLoaded');
mainEventAggregator.addBootCondition('onNetworkConnectivityChecked');

// Once all internal boot conditions are satisfied, broadcast the public 'deviceready' event.
mainEventAggregator.waitForAll(function() {
    mainEventAggregator.onDeviceReady.broadcast();
}, mainEventAggregator.frameworkBootConditions);

// Signal that all core JavaScript framework objects are now defined and initialized.
// This often happens immediately after the module definitions are processed.
mainEventAggregator.onFrameworkInitialized.broadcast();

})(); // End of private scope for the framework.