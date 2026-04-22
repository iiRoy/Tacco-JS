(function() {

// --- Global Module and Component Registry ---
const componentReservoir = new Map();
const activatedInstances = new Map();

function registerModule(moduleNameKey, moduleConstructorFunction) {
    if (componentReservoir.has(moduleNameKey)) {
        throw new Error(`Module '${moduleNameKey}' already registered.`);
    }
    componentReservoir.set(moduleNameKey, moduleConstructorFunction);
}

function fetchComponent(moduleNameKey) {
    if (activatedInstances.has(moduleNameKey)) {
        return activatedInstances.get(moduleNameKey);
    }
    if (!componentReservoir.has(moduleNameKey)) {
        throw new Error(`Module '${moduleNameKey}' not found.`);
    }

    const constructor = componentReservoir.get(moduleNameKey);
    const dependencyResolver = (depKey) => fetchComponent(depKey);
    const moduleOutput = {};
    const moduleDescriptor = {
        name: moduleNameKey,
        exports: moduleOutput
    };

    const componentResult = constructor(dependencyResolver, moduleOutput, moduleDescriptor);

    const finalExportValue = (componentResult !== undefined) ? componentResult : moduleOutput;
    
    activatedInstances.set(moduleNameKey, finalExportValue);
    return finalExportValue;
}

registerModule.removeEntry = function(moduleNameKey) {
    componentReservoir.delete(moduleNameKey);
    activatedInstances.delete(moduleNameKey); // Also clear from instantiated cache
};

// --- Export for Node.js compatibility ---
if (typeof module === "object" && typeof fetchComponent === "function") {
    module.exports.fetchComponent = fetchComponent;
    module.exports.registerModule = registerModule;
}

// --- Utility Functions Module (Replaces 'cordova/utils') ---
registerModule("platform/commonUtilities", function(getDependency, exports, descriptor) {
    exports.displayInfo = function(message) {
        if (typeof console !== 'undefined' && console.log) {
            console.log(message);
        }
    };
    // Other utility functions could go here if needed by other modules
});


// --- Event Flow Management System (Replaces 'cordova/channel') ---
registerModule("platform/eventFlowManager", function(getDependency, exports, descriptor) {
    const commonUtils = getDependency('platform/commonUtilities');

    function createEventFlow(flowIdentifier, flowOptions) {
        let activeSubscribers = [];
        let oneTimeSubscribers = [];
        let hasTriggered = false;
        let options = flowOptions || {};
        let subscriberCounter = 1;

        const flowHandle = {
            id: flowIdentifier,
            subscribe: function(callback) {
                activeSubscribers.push({ key: subscriberCounter++, fn: callback });
                if (options.onAttach) options.onAttach.call(flowHandle);
            },
            subscribeOnce: function(callback) {
                if (hasTriggered) {
                    try {
                        callback();
                    } catch (e) {
                        commonUtils.displayInfo(`Error in single-shot event flow '${flowIdentifier}' (already fired) callback: ${e}`);
                    }
                } else {
                    oneTimeSubscribers.push({ key: subscriberCounter++, fn: callback });
                    if (options.onAttach) options.onAttach.call(flowHandle);
                }
            },
            unsubscribe: function(callback) {
                activeSubscribers = activeSubscribers.filter(s => s.fn !== callback);
                oneTimeSubscribers = oneTimeSubscribers.filter(s => s.fn !== callback);
                if (options.onDetach) options.onDetach.call(flowHandle);
            },
            fire: function(...args) {
                hasTriggered = true;
                const allSubscribers = activeSubscribers.concat(oneTimeSubscribers);
                oneTimeSubscribers = []; // Clear one-time subscribers after firing
                allSubscribers.forEach(subscriber => {
                    try {
                        subscriber.fn(...args);
                    } catch (e) {
                        commonUtils.displayInfo(`Error in event flow '${flowIdentifier}' subscriber: ${e}`);
                    }
                });
            },
            get firedStatus() {
                return hasTriggered;
            },
            get subscriberCount() {
                return activeSubscribers.length + oneTimeSubscribers.length;
            }
        };
        return flowHandle;
    }

    const globalEventFlowManager = {
        // Map to store all created EventFlow instances
        managedEventFlows: new Map(),

        // Replaces channel.join
        waitForAll: function (finalCallback, flowsToWaitFor) {
            let pendingFlows = flowsToWaitFor.length;
            if (pendingFlows === 0) {
                finalCallback();
                return;
            }

            const decrementAndCheck = () => {
                pendingFlows--;
                if (pendingFlows === 0) {
                    finalCallback();
                }
            };

            for (const flow of flowsToWaitFor) {
                if (!flow.firedStatus) {
                    flow.subscribeOnce(decrementAndCheck);
                } else {
                    decrementAndCheck();
                }
            }
        },

        // Replaces channel.create
        produceEventFlow: function (typeIdentifier, opts) {
            const newFlow = createEventFlow(typeIdentifier, opts);
            globalEventFlowManager.managedEventFlows.set(typeIdentifier, newFlow);
            exports[typeIdentifier + 'Flow'] = newFlow; // Expose on the manager's exports
            return newFlow;
        },

        // Replaces deviceReadyChannelsArray/Map logic
        coreReadyPrerequisites: new Set(),

        // Indicate an EventFlow must fire before the main 'deviceReady' event
        addCoreReadyCondition: function(flowInstance) {
            globalEventFlowManager.coreReadyPrerequisites.add(flowInstance);
        }
    };

    exports.globalEventFlowManager = globalEventFlowManager;
    // exports.createEventFlow = createEventFlow; // Can expose if needed elsewhere explicitly
});

// --- Object Construction Utilities (Replaces 'cordova/builder') ---
registerModule("platform/objectConstructor", function(getDependency, exports, descriptor) {
    const commonUtils = getDependency('platform/commonUtilities');

    function deepPropertyCombine(targetObject, sourceObject) {
        for (const propertyKey in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, propertyKey)) {
                if (typeof targetObject === 'function' && targetObject.prototype && targetObject.prototype.constructor === targetObject) {
                    // If target is a constructor, properties are applied to its prototype.
                    targetObject.prototype[propertyKey] = sourceObject[propertyKey];
                } else if (typeof sourceObject[propertyKey] === 'object' && sourceObject[propertyKey] !== null && !Array.isArray(sourceObject[propertyKey])) {
                    if (typeof targetObject[propertyKey] === 'object' && targetObject[propertyKey] !== null && !Array.isArray(targetObject[propertyKey])) {
                        // Both are objects, recurse the merge
                        deepPropertyCombine(targetObject[propertyKey], sourceObject[propertyKey]);
                    } else {
                        // Source is an object, target is not or doesn't exist, assign a deep copy
                        targetObject[propertyKey] = deepPropertyCombine({}, sourceObject[propertyKey]);
                    }
                } else {
                    // Primitive or array, assign directly
                    targetObject[propertyKey] = sourceObject[propertyKey];
                }
            }
        }
        return targetObject;
    }

    function integrateDefinitions(baseObject, componentDefinitions, overrideExisting, enableDeepMerge) {
        for (const componentKey in componentDefinitions) {
            if (Object.prototype.hasOwnProperty.call(componentDefinitions, componentKey)) {
                const definition = componentDefinitions[componentKey];
                try {
                    let componentValue;
                    if (definition.modulePath) {
                        componentValue = getDependency(definition.modulePath);
                    } else {
                        componentValue = {};
                    }

                    let currentTargetProperty = baseObject[componentKey];

                    if (overrideExisting) { // Corresponds to 'clobber' in original
                        if (typeof currentTargetProperty === 'undefined' || (definition.modulePath && !enableDeepMerge)) {
                            baseObject[componentKey] = componentValue;
                        } else if (enableDeepMerge && definition.modulePath) {
                            deepPropertyCombine(baseObject[componentKey], componentValue);
                        }
                        currentTargetProperty = baseObject[componentKey]; // Update reference if assigned/merged
                    } else { // Corresponds to 'dontClobber' in original
                        if (typeof currentTargetProperty === 'undefined') {
                            baseObject[componentKey] = componentValue;
                        } else if (enableDeepMerge && definition.modulePath) {
                            // Original merges parent onto result. Here, merge existing target onto new componentValue.
                            deepPropertyCombine(componentValue, currentTargetProperty);
                            baseObject[componentKey] = componentValue;
                        } else {
                            // Use existing value for further child integration
                            componentValue = currentTargetProperty;
                        }
                        currentTargetProperty = baseObject[componentKey]; // Update reference
                    }

                    if (definition.childDefinitions) {
                        integrateDefinitions(currentTargetProperty, definition.childDefinitions, overrideExisting, enableDeepMerge);
                    }
                } catch (e) {
                    commonUtils.displayInfo('Error during object integration: ' + e + ' for key "' + componentKey + '"');
                }
            }
        }
    }

    exports.objectConstructionHelper = {
        buildFromDefinitions: function (definitions) {
            return {
                intoButPreserveExisting: function (targetObject) {
                    integrateDefinitions(targetObject, definitions, false, false);
                },
                intoAndReplaceExisting: function (targetObject) {
                    integrateDefinitions(targetObject, definitions, true, false);
                },
                intoAndCombineProperties: function (targetObject) {
                    integrateDefinitions(targetObject, definitions, true, true);
                }
            };
        }
    };
});

// --- Device Platform Core Logic (Replaces 'lib/cordova.js') ---
registerModule("devicePlatformCore", function(getDependency, exports, descriptor) {
    const eventFlowManager = getDependency('platform/eventFlowManager').globalEventFlowManager;
    const commonUtils = getDependency('platform/commonUtilities');

    // Store original DOM event listener methods
    const originalDocAttachListener = document.addEventListener;
    const originalDocDetachListener = document.removeEventListener;
    const originalWinAttachListener = window.addEventListener;
    const originalWinDetachListener = window.removeEventListener;

    // Maps to hold custom EventFlows for document and window events
    const customDocEventFlows = new Map();
    const customWinEventFlows = new Map();

    // Helper to standardize event names
    function standardizeEventName(eventName) {
        return eventName.toLowerCase();
    }

    // --- DOM Event Listener Interception ---
    document.addEventListener = function(eventType, handlerFunc, useCapture) {
        const standardType = standardizeEventName(eventType);
        const managedFlow = customDocEventFlows.get(standardType);

        if (managedFlow) {
            // Special handling for 'deviceready' to use subscribeOnce
            if (eventType === 'deviceready') {
                managedFlow.subscribeOnce(handlerFunc);
            } else {
                managedFlow.subscribe(handlerFunc);
            }
        } else {
            originalDocAttachListener.call(document, eventType, handlerFunc, useCapture);
        }
    };

    window.addEventListener = function(eventType, handlerFunc, useCapture) {
        const standardType = standardizeEventName(eventType);
        const managedFlow = customWinEventFlows.get(standardType);

        if (managedFlow) {
            managedFlow.subscribe(handlerFunc);
        } else {
            originalWinAttachListener.call(window, eventType, handlerFunc, useCapture);
        }
    };

    document.removeEventListener = function(eventType, handlerFunc, useCapture) {
        const standardType = standardizeEventName(eventType);
        const managedFlow = customDocEventFlows.get(standardType);

        if (managedFlow) {
            managedFlow.unsubscribe(handlerFunc);
        } else {
            originalDocDetachListener.call(document, eventType, handlerFunc, useCapture);
        }
    };

    window.removeEventListener = function(eventType, handlerFunc, useCapture) {
        const standardType = standardizeEventName(eventType);
        const managedFlow = customWinEventFlows.get(standardType);

        if (managedFlow) {
            managedFlow.unsubscribe(handlerFunc);
        } else {
            originalWinDetachListener.call(window, eventType, handlerFunc, useCapture);
        }
    };

    // --- DOM Event Object Creation ---
    function generateDOMEvent(type, eventDetails) {
        const newEvent = document.createEvent('Events');
        newEvent.initEvent(type, false, false);
        if (eventDetails) {
            for (const prop in eventDetails) {
                if (Object.prototype.hasOwnProperty.call(eventDetails, prop)) {
                    newEvent[prop] = eventDetails[prop];
                }
            }
        }
        return newEvent;
    }

    // --- Console Polyfill ---
    if (typeof window.console === "undefined") {
        window.console = {
            log: function() {}
        };
    }

    // --- Main Device Platform Interface Object ---
    const devicePlatformInterface = {
        registerModule: registerModule,
        fetchComponent: fetchComponent,

        // Replaces addWindowEventHandler
        registerWindowFlow: function(eventName, options) {
            const flow = eventFlowManager.produceEventFlow(eventName, options);
            customWinEventFlows.set(standardizeEventName(eventName), flow);
            return flow;
        },
        // Replaces addDocumentEventHandler
        registerDocumentFlow: function(eventName, options) {
            const flow = eventFlowManager.produceEventFlow(eventName, options);
            customDocEventFlows.set(standardizeEventName(eventName), flow);
            return flow;
        },
        // Replaces removeWindowEventHandler
        deregisterWindowFlow: function(eventName) {
            customWinEventFlows.delete(standardizeEventName(eventName));
            eventFlowManager.managedEventFlows.delete(eventName);
        },
        // Replaces removeDocumentEventHandler
        deregisterDocumentFlow: function(eventName) {
            customDocEventFlows.delete(standardizeEventName(eventName));
            eventFlowManager.managedEventFlows.delete(eventName);
        },

        // Replaces getOriginalHandlers
        getNativeDOMHandlers: function() {
            return {
                'document': {
                    'addEventListener': originalDocAttachListener,
                    'removeEventListener': originalDocDetachListener
                },
                'window': {
                    'addEventListener': originalWinAttachListener,
                    'removeEventListener': originalWinDetachListener
                }
            };
        },

        // Replaces fireDocumentEvent
        triggerDocumentEvent: function(type, details) {
            const eventObj = generateDOMEvent(type, details);
            const standardType = standardizeEventName(type);
            const managedFlow = customDocEventFlows.get(standardType);
            if (managedFlow) {
                setTimeout(() => {
                    managedFlow.fire(eventObj);
                }, 0);
            } else {
                document.dispatchEvent(eventObj);
            }
        },
        // Replaces fireWindowEvent
        triggerWindowEvent: function(type, details) {
            const eventObj = generateDOMEvent(type, details);
            const standardType = standardizeEventName(type);
            const managedFlow = customWinEventFlows.get(standardType);
            if (managedFlow) {
                setTimeout(() => {
                    managedFlow.fire(eventObj);
                }, 0);
            } else {
                window.dispatchEvent(eventObj);
            }
        },

        // Placeholder properties (Android/iOS specific, retained for functional equivalence)
        isShuttingDown: false,
        usePollingForCommands: false,
        commandBuffer: [],
        commandFlushInProgress: false,

        // --- Native Callback Mechanism ---
        callbackInvocationId: 0,
        pendingCallbacks: {},
        callbackResponseCodes: {
            NO_RETURN: 0,
            OK_STATUS: 1,
            CLASS_NOT_FOUND: 2,
            ILLEGAL_ACCESS: 3,
            INSTANTIATION_ISSUE: 4,
            MALFORMED_URL: 5,
            IO_PROBLEM: 6,
INVALID_ACTION_TYPE: 7,
JSON_PARSING_ERROR: 8,
            GENERAL_FAILURE: 9
        },

        // Replaces callbackSuccess
        processSuccessCallback: function(callId, argumentsObj) {
            const registeredCall = devicePlatformInterface.pendingCallbacks[callId];
            if (registeredCall) {
                if (argumentsObj.status === devicePlatformInterface.callbackResponseCodes.OK_STATUS) {
                    try {
                        if (registeredCall.success) {
                            registeredCall.success(argumentsObj.message);
                        }
                    } catch (e) {
                        commonUtils.displayInfo("Error in success callback for ID " + callId + ": " + e);
                    }
                }
                if (!argumentsObj.keepCallback) {
                    delete devicePlatformInterface.pendingCallbacks[callId];
                }
            }
        },

        // Replaces callbackError
        processErrorCallback: function(callId, argumentsObj) {
            const registeredCall = devicePlatformInterface.pendingCallbacks[callId];
            if (registeredCall) {
                try {
                    if (registeredCall.fail) {
                        registeredCall.fail(argumentsObj.message);
                    }
                } catch (e) {
                    commonUtils.displayInfo("Error in error callback for ID " + callId + ": " + e);
                }
                if (!argumentsObj.keepCallback) {
                    delete devicePlatformInterface.pendingCallbacks[callId];
                }
            }
        },

        // Replaces addConstructor
        scheduleOnCoreReady: function(initializationFunc) {
            eventFlowManager.onCoreReadyFlow.subscribeOnce(function() {
                try {
                    initializationFunc();
                } catch (e) {
                    commonUtils.displayInfo("Failed to run scheduled core initializer: " + e);
                }
            });
        }
    };

    // --- Initialize Core Event Flows ---
    // These replace the global channel events
    eventFlowManager.produceEventFlow('onPause', {});
    eventFlowManager.produceEventFlow('onResume', {});
    eventFlowManager.produceEventFlow('onDeviceReady', {}); // Public event
    eventFlowManager.produceEventFlow('onDOMContentLoaded', {});
    eventFlowManager.produceEventFlow('onNativeReady', {});
    eventFlowManager.produceEventFlow('onCoreReady', {}); // Internal event, predecessor to onDeviceReady
    eventFlowManager.produceEventFlow('onInfoAvailable', {});
    eventFlowManager.produceEventFlow('onNetworkConnected', {});
    eventFlowManager.produceEventFlow('onAppDestroyed', {});

    // Set up public document event flows via the platform interface
    devicePlatformInterface.pauseEvent = devicePlatformInterface.registerDocumentFlow('pause');
    devicePlatformInterface.resumeEvent = devicePlatformInterface.registerDocumentFlow('resume');
    devicePlatformInterface.deviceReadyEvent = devicePlatformInterface.registerDocumentFlow('deviceready');

    // Register prerequisite flows for 'onCoreReady' (and thus 'onDeviceReady')
    eventFlowManager.addCoreReadyCondition(eventFlowManager.onDOMContentLoadedFlow);
    eventFlowManager.addCoreReadyCondition(eventFlowManager.onNativeReadyFlow);
    eventFlowManager.addCoreReadyCondition(eventFlowManager.onInfoAvailableFlow);
    eventFlowManager.addCoreReadyCondition(eventFlowManager.onNetworkConnectedFlow);

    // Orchestrate 'onCoreReady' and 'onDeviceReady' to fire after all prerequisites
    eventFlowManager.waitForAll(() => {
        eventFlowManager.onCoreReadyFlow.fire(); // Internal core ready event
        eventFlowManager.onDeviceReadyFlow.fire(); // Public device ready event
    }, Array.from(eventFlowManager.coreReadyPrerequisites));


    // --- Initial DOMContentLoaded check and trigger ---
    document.addEventListener('DOMContentLoaded', function() {
        eventFlowManager.onDOMContentLoadedFlow.fire();
    }, false);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        eventFlowManager.onDOMContentLoadedFlow.fire();
    }

    exports.devicePlatformInterface = devicePlatformInterface;
});

// --- Activate the main device platform module ---
const devicePlatform = fetchComponent("devicePlatformCore").devicePlatformInterface;

// The original makes 'require' and 'define' globally available in non-Node environments.
// My implementation exposes them via the `devicePlatform` object itself.
// If direct global exposure of `registerModule` and `fetchComponent` is strictly required
// outside the `devicePlatform` object, it would need to be added here:
// window.registerModule = registerModule;
// window.fetchComponent = fetchComponent;

})();