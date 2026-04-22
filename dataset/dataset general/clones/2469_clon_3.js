(function (globalScope, documentContext, undefinedValue) {
    // This module encapsulates core functionalities for a geospatial viewing library.
    // Original project details:
    // (c) 2010-2013, Vladimir Agafonkin
    // (c) 2010-2011, CloudMade

    let previousGeoView = globalScope.GeoView; // Save any existing global GeoView object
    const GeoView = {}; // Our new global object

    GeoView.releaseTag = '0.7.3-alpha'; // Semantic versioning for this build

    // Check for CommonJS/Node.js module environment
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = GeoView;
    }
    // Check for Asynchronous Module Definition (AMD) environment
    else if (typeof define === 'function' && define.amd) {
        define(GeoView);
    }

    // Expose GeoView as a global variable, providing a mechanism to restore previous global state.
    GeoView.restorePrevious = function () {
        globalScope.GeoView = previousGeoView;
        // Return 'this' for method chaining
        return this;
    };

    globalScope.GeoView = GeoView;


    /*
     * GeoView.Toolbox provides a collection of general-purpose utility functions.
     * These are used internally across the GeoView library.
     */

    GeoView.Toolbox = {
        // Merges properties from one or more source objects into a destination object.
        // (destinationObject[, sourceObject1, sourceObject2, ...]) -> destinationObject
        assignProps: function (targetObject) {
            const sourceArguments = Array.from(arguments).slice(1);
            let currentSource;

            // Iterate through each source object
            for (let sourceIdx = 0; sourceIdx < sourceArguments.length; sourceIdx++) {
                currentSource = sourceArguments[sourceIdx];
                if (!currentSource || typeof currentSource !== 'object') {
                    // Skip null/undefined/non-object sources
                    continue;
                }
                // Copy own enumerable properties from source to target
                for (const propName in currentSource) {
                    if (Object.prototype.hasOwnProperty.call(currentSource, propName)) {
                        targetObject[propName] = currentSource[propName];
                    }
                }
            }
            return targetObject;
        },

        // Creates a new function with a pre-set 'this' context and optional initial arguments.
        // (originalFunction, contextObject[, arg1, arg2, ...]) -> boundFunction
        createBoundFunction: function (funcToBind, contextObj) {
            const initialArgs = arguments.length > 2 ? Array.from(arguments).slice(2) : [];
            // Return an anonymous function that applies the original function with the specified context and arguments.
            return function () {
                // If initial arguments were provided, use them. Otherwise, use the arguments passed to the bound function.
                const finalArgs = initialArgs.length > 0 ? initialArgs : Array.from(arguments);
                return funcToBind.apply(contextObj, finalArgs);
            };
        },

        // Assigns and retrieves a unique integer ID for an object.
        // This is a self-executing function to encapsulate the counter.
        getObjectId: (function () {
            let idCounter = 0; // Starts from 0, increments before assignment
            const internalIdProperty = '_geoview_unique_id'; // Unique property name

            return function (targetObject) {
                // If the object doesn't have our unique ID, assign one.
                if (!targetObject[internalIdProperty]) {
                    targetObject[internalIdProperty] = ++idCounter;
                }
                return targetObject[internalIdProperty];
            };
        }()),

        // Iterates over properties of an object and applies a method to each.
        // (targetObject, methodToApply, executionContext[, extraArg1, ...]) -> Boolean
        processCollection: function (targetData, processingMethod, methodContext) {
            if (typeof targetData !== 'object' || targetData === null) {
                // Early exit if the target is not a valid object for iteration
                return false;
            }

            // Capture any additional arguments to pass to the method
            const additionalArgs = Array.from(arguments).slice(3);

            for (const propKey in targetData) {
                // Ensure it's an own property before processing
                if (Object.prototype.hasOwnProperty.call(targetData, propKey)) {
                    processingMethod.apply(methodContext, [propKey, targetData[propKey]].concat(additionalArgs));
                }
            }
            return true;
        },

        // Limits the execution frequency of a function to a specified interval.
        // Subsequent calls within the interval will defer execution until unlock.
        // (functionToThrottle, delayMilliseconds, contextObject) -> throttledFunction
        throttleExecution: function (originalFunc, intervalMs, executionScope) {
            let busyState = false; // Flag to indicate if a call is currently "locked"
            let pendingCall = false; // Flag to indicate if a call is waiting for the lock to release
            let timeoutId = null; // Store the timeout ID

            // The returned throttled function
            return function () {
                const currentArgs = Array.from(arguments); // Capture arguments for potential deferred call

                if (busyState) {
                    pendingCall = true; // Mark that a call is waiting
                    return; // Exit if busy, don't execute immediately
                }

                busyState = true; // Set busy state

                // Set a timeout to release the busy state and potentially execute the pending call
                timeoutId = setTimeout(() => {
                    busyState = false; // Release the lock

                    if (pendingCall) {
                        // If there was a pending call, execute it with the last captured arguments
                        this.throttleExecution.apply(executionScope, [originalFunc, intervalMs, executionScope].concat(currentArgs));
                        pendingCall = false; // Reset pending state
                    }
                    timeoutId = null; // Clear timeout ID
                }, intervalMs);

                // Execute the original function immediately (first call)
                originalFunc.apply(executionScope, currentArgs);
            };
        },

        // A simple function that always returns `false`.
        returnFalse: function () {
            return false;
        },

        // Formats a number by rounding it to a specified number of decimal digits.
        // (numberValue, decimalPlaces) -> formattedNumber
        roundToPrecision: function (inputNum, digitsCount) {
            const powerOfTen = 10 ** (digitsCount || 5); // Default to 5 decimal places
            return Math.round(inputNum * powerOfTen) / powerOfTen;
        },

        // Removes leading and trailing whitespace from a string.
        // (inputString) -> trimmedString
        cleanString: function (textInput) {
            return textInput.trim ? textInput.trim() : textInput.replace(/(^\s+|\s+$)/g, '');
        },

        // Splits a string into an array of words, using whitespace as a delimiter.
        // (inputString) -> arrayOfWords
        parseWords: function (phrase) {
            const cleanedPhrase = GeoView.Toolbox.cleanString(phrase);
            return cleanedPhrase.split(/\s+/);
        },

        // Merges new options into an object's existing options property.
        // (targetObject, newOptions) -> mergedOptions
        configureInstance: function (instanceObj, specificOptions) {
            // Ensure instanceObj.options exists and is an object.
            instanceObj.options = GeoView.Toolbox.assignProps({}, instanceObj.options || {}, specificOptions);
            return instanceObj.options;
        },

        // Constructs a URL query string from an object.
        // (parametersObject, existingUrlString, useUppercaseKeys) -> queryString
        buildQueryString: function (paramsData, currentUrl, capitalizeKeys) {
            const queryParts = [];
            for (const key in paramsData) {
                if (Object.prototype.hasOwnProperty.call(paramsData, key)) {
                    const encodedKey = encodeURIComponent(capitalizeKeys ? key.toUpperCase() : key);
                    const encodedValue = encodeURIComponent(paramsData[key]);
                    queryParts.push(`${encodedKey}=${encodedValue}`);
                }
            }
            const separator = (!currentUrl || currentUrl.indexOf('?') === -1) ? '?' : '&';
            return separator + queryParts.join('&');
        },

        // Replaces placeholders in a string with values from a data object.
        // Placeholders are in the format `{ *key_name* }`.
        // (templateString, dataObject) -> formattedString
        formatString: function (templateStr, dataValues) {
            if (typeof templateStr !== 'string' || typeof dataValues !== 'object') {
                console.warn("GeoView.Toolbox.formatString: Invalid input types.");
                return templateStr; // Return original if inputs are invalid
            }
            return templateStr.replace(/\{ *([\w_]+) *\}/g, (fullMatch, keyName) => {
                let retrievedValue = dataValues[keyName];
                if (retrievedValue === undefinedValue) {
                    throw new Error(`GeoView.Toolbox.formatString: No value provided for placeholder "${fullMatch}"`);
                } else if (typeof retrievedValue === 'function') {
                    retrievedValue = retrievedValue(dataValues); // Execute function if value is a function
                }
                return retrievedValue;
            });
        },

        // Checks if a given object is an array. Provides a fallback for older browsers.
        // (testObject) -> Boolean
        isAnArray: Array.isArray || function (testObj) {
            return (Object.prototype.toString.call(testObj) === '[object Array]');
        },

        // A base64 encoded string for a 1x1 transparent GIF image.
        transparentPixelData: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    };

    // --- Animation Frame Utilities ---
    (function () {
        // Inspired by Paul Irish's polyfill for requestAnimationFrame.

        // Attempts to find a vendor-prefixed version of a browser API function.
        function findVendorSpecific(baseName) {
            const vendorPrefixes = ['webkit', 'moz', 'o', 'ms'];
            for (let i = 0; i < vendorPrefixes.length; i++) {
                const prefixedName = vendorPrefixes[i] + baseName;
                if (globalScope[prefixedName]) {
                    return globalScope[prefixedName];
                }
            }
            return undefinedValue; // Not found
        }

        let lastFrameTimestamp = 0; // Timestamp of the last animation frame or timeout

        // Fallback for requestAnimationFrame using setTimeout.
        function fallbackAnimationFrame(callbackFunction) {
            const currentTime = Date.now();
            const timeUntilNextFrame = Math.max(0, 16 - (currentTime - lastFrameTimestamp)); // Aim for ~60 FPS (16ms per frame)

            lastFrameTimestamp = currentTime + timeUntilNextFrame;
            return globalScope.setTimeout(callbackFunction, timeUntilNextFrame);
        }

        // Determine the actual requestAnimationFrame function to use.
        const animationRequester = globalScope.requestAnimationFrame ||
            findVendorSpecific('RequestAnimationFrame') ||
            fallbackAnimationFrame;

        // Determine the actual cancelAnimationFrame function to use.
        const animationCanceller = globalScope.cancelAnimationFrame ||
            findVendorSpecific('CancelAnimationFrame') ||
            findVendorSpecific('CancelRequestAnimationFrame') ||
            function (timerId) {
                globalScope.clearTimeout(timerId);
            };


        // Provides a cross-browser way to request an animation frame.
        // (callbackFunction, contextObject, executeImmediatelyIfFallback, targetElement)
        GeoView.Toolbox.requestAnimationFrame = function (cbFn, ctxObj, runNow, targetEl) {
            const boundCallback = GeoView.Toolbox.createBoundFunction(cbFn, ctxObj);

            // If immediate execution is requested and we're using the setTimeout fallback,
            // execute synchronously to avoid a delay.
            if (runNow && animationRequester === fallbackAnimationFrame) {
                boundCallback();
                return null; // No ID to cancel in this case
            } else {
                return animationRequester.call(globalScope, boundCallback, targetEl);
            }
        };

        // Cancels a previously requested animation frame.
        // (animationFrameId)
        GeoView.Toolbox.cancelAnimationFrame = function (frameId) {
            if (frameId !== undefinedValue && frameId !== null) {
                animationCanceller.call(globalScope, frameId);
            }
        };

    }()); // End of animation frame IIFE


    // --- Common Utility Shortcuts ---
    // These provide direct access to frequently used utility functions from the main GeoView object.
    GeoView.assignProps = GeoView.Toolbox.assignProps;
    GeoView.createBoundFunction = GeoView.Toolbox.createBoundFunction;
    GeoView.getObjectId = GeoView.Toolbox.getObjectId;
    GeoView.configureInstance = GeoView.Toolbox.configureInstance;


    /*
     * GeoView.Prototypal establishes the object-oriented programming foundation for the library.
     * Inspiration drawn from John Resig's Simple JavaScript Inheritance and Dean Edwards' Base.js.
     */

    GeoView.Prototypal = function () {}; // Base constructor for all GeoView classes

    // Method to create a new class that inherits from the current class.
    GeoView.Prototypal.createDerivedClass = function (classProperties) {

        // The constructor function for the new derived class.
        const DerivedType = function () {
            // Execute the custom initialization method if defined.
            if (this.initializeConstructor) {
                this.initializeConstructor.apply(this, arguments);
            }

            // Execute all registered initialization hooks.
            if (this.initializationCallbacks && this.initializationCallbacks.length > 0) {
                this.executeInitializationHooks();
            }
        };

        // Create an intermediate constructor to avoid calling the parent's constructor
        // when setting up the prototype chain.
        const IntermediatePrototype = function () {};
        IntermediatePrototype.prototype = this.prototype; // Point to parent's prototype

        const childPrototype = new IntermediatePrototype(); // Instance of parent's prototype
        childPrototype.constructor = DerivedType; // Correct the constructor reference for the child

        DerivedType.prototype = childPrototype; // Assign the new prototype to the derived class

        // Inherit static properties from the parent class.
        for (const staticProp in this) {
            if (Object.prototype.hasOwnProperty.call(this, staticProp) && staticProp !== 'prototype') {
                DerivedType[staticProp] = this[staticProp];
            }
        }

        // Mix static properties provided in `classProperties.staticMembers` into the new class.
        if (classProperties.staticMembers) {
            GeoView.assignProps(DerivedType, classProperties.staticMembers);
            delete classProperties.staticMembers; // Remove from prototype properties
        }

        // Mix in properties from `classProperties.mixins` into the prototype.
        if (classProperties.mixins) {
            if (GeoView.Toolbox.isAnArray(classProperties.mixins)) {
                 GeoView.Toolbox.assignProps.apply(null, [childPrototype].concat(classProperties.mixins));
            } else {
                 console.warn("GeoView.Prototypal.createDerivedClass: 'mixins' property should be an array.");
            }
            delete classProperties.mixins;
        }

        // Merge default options: new options override parent options.
        if (classProperties.defaultOptions && childPrototype.defaultOptions) {
            classProperties.defaultOptions = GeoView.assignProps({}, childPrototype.defaultOptions, classProperties.defaultOptions);
        }

        // Mix in all other provided properties into the prototype of the new class.
        GeoView.assignProps(childPrototype, classProperties);

        // Initialize an array for custom initialization callbacks.
        childPrototype.initializationCallbacks = [];

        // Store a reference to the parent's prototype for easy access (e.g., calling super methods).
        const superClassReference = this;
        // jshint camelcase: false // Suppress jshint warning for non-camelcase
        DerivedType.parentPrototypeRef = superClassReference.prototype;

        // Method to execute all registered initialization hooks.
        childPrototype.executeInitializationHooks = function () {
            if (this.hooksExecuted) {
                return; // Prevent hooks from being executed multiple times
            }

            // If the parent class has its own hook execution method, call it first.
            if (superClassReference.prototype.executeInitializationHooks) {
                superClassReference.prototype.executeInitializationHooks.call(this);
            }

            this.hooksExecuted = true; // Mark as executed

            // Iterate and call each registered hook function.
            for (let hookIndex = 0; hookIndex < this.initializationCallbacks.length; hookIndex++) {
                const currentHook = this.initializationCallbacks[hookIndex];
                currentHook.call(this);
            }
        };

        return DerivedType;
    };


    // Adds properties (methods and fields) directly to the prototype of the class.
    // (propertiesObject)
    GeoView.Prototypal.addMethods = function (newProperties) {
        GeoView.assignProps(this.prototype, newProperties);
    };

    // Merges new default options into the class's existing default options.
    // (optionsObject)
    GeoView.Prototypal.updateDefaultOptions = function (additionalOptions) {
        GeoView.assignProps(this.prototype.defaultOptions, additionalOptions);
    };

    // Registers a function or a method name to be called during object initialization.
    // (callbackFunction || methodName, ...methodArguments)
    GeoView.Prototypal.registerInitializationHook = function (hookDefinition) {
        const hookArguments = Array.from(arguments).slice(1);

        const actualHookFn = typeof hookDefinition === 'function' ? hookDefinition : function () {
            // If a string (method name) is provided, call that method on 'this'.
            if (typeof this[hookDefinition] === 'function') {
                this[hookDefinition].apply(this, hookArguments);
            } else {
                console.warn(`GeoView.Prototypal.registerInitializationHook: Method "${hookDefinition}" not found.`);
            }
        };

        // Ensure the array of initialization callbacks exists on the prototype.
        this.prototype.initializationCallbacks = this.prototype.initializationCallbacks || [];
        this.prototype.initializationCallbacks.push(actualHookFn);
    };


    /*
     * GeoView.Behavior.EmitterTrait provides functionality for custom event handling
     * to any GeoView class that mixes it in.
     */

    const eventRegistryField = '_geoview_event_handlers'; // Internal property name for event storage

    GeoView.Behavior = {};

    GeoView.Behavior.EmitterTrait = {

        // Attaches one or more event listeners to the object.
        // (eventTypesString, callbackFunction[, contextObject])
        // or (eventTypesObject[, contextObject])
        attachListener: function (eventTypes, callbackFn, listenerContext) {

            // Handle multiple event types if the first argument is an object (map of type -> handler).
            if (GeoView.Toolbox.processCollection(eventTypes, this.attachListener, this, callbackFn, listenerContext)) {
                return this; // Processed as an object map, return early.
            }

            // Ensure event storage exists on this object.
            const eventData = this[eventRegistryField] = this[eventRegistryField] || {};
            // Generate a unique ID for the context object if it's different from 'this'.
            const boundContextId = (listenerContext && listenerContext !== this) ? GeoView.getObjectId(listenerContext) : null;

            // Split space-separated event types into an array.
            const typesArray = GeoView.Toolbox.parseWords(eventTypes);

            for (let idx = 0; idx < typesArray.length; idx++) {
                const currentType = typesArray[idx];
                const eventDescriptor = {
                    action: callbackFn,
                    context: listenerContext || this // Default context to 'this' object
                };

                if (boundContextId) {
                    // Store listeners indexed by context ID for performance with many objects.
                    const indexedKey = currentType + '_idx_by_context';
                    const indexedCountKey = indexedKey + '_count';

                    const contextTypeIndex = eventData[indexedKey] = eventData[indexedKey] || {};

                    if (!contextTypeIndex[boundContextId]) {
                        contextTypeIndex[boundContextId] = [];
                        // Increment the count of unique contexts for this event type.
                        eventData[indexedCountKey] = (eventData[indexedCountKey] || 0) + 1;
                    }
                    contextTypeIndex[boundContextId].push(eventDescriptor);
                } else {
                    // Store regular listeners directly by type.
                    eventData[currentType] = eventData[currentType] || [];
                    eventData[currentType].push(eventDescriptor);
                }
            }

            return this; // For method chaining
        },

        // Checks if there are any listeners registered for a specific event type.
        // (eventTypeString) -> Boolean
        hasListenersFor: function (testEventType) {
            const eventStorage = this[eventRegistryField];
            if (!eventStorage) {
                return false;
            }

            // Check for direct listeners
            const directListenersExist = (eventStorage[testEventType] && eventStorage[testEventType].length > 0);
            // Check for context-indexed listeners
            const indexedListenersExist = (eventStorage[testEventType + '_idx_by_context'] && eventStorage[testEventType + '_idx_by_context_count'] > 0);

            return directListenersExist || indexedListenersExist;
        },

        // Removes one or more event listeners from the object.
        // (eventTypesString, callbackFunction[, contextObject])
        // or (eventTypesObject[, contextObject])
        // If no arguments, clears all listeners. If only eventTypes, clears all for those types.
        detachListener: function (eventTypes, callbackFn, listenerContext) {

            const eventStorage = this[eventRegistryField];
            if (!eventStorage) {
                return this; // No events to remove
            }

            // If no specific types are provided, clear all.
            if (!eventTypes) {
                return this.removeAllListeners();
            }

            // Handle multiple event types if the first argument is an object.
            if (GeoView.Toolbox.processCollection(eventTypes, this.detachListener, this, callbackFn, listenerContext)) {
                return this;
            }

            const boundContextId = (listenerContext && listenerContext !== this) ? GeoView.getObjectId(listenerContext) : null;
            const typesToRemove = GeoView.Toolbox.parseWords(eventTypes);

            for (let i = 0; i < typesToRemove.length; i++) {
                const currentType = typesToRemove[i];
                const indexedKey = currentType + '_idx_by_context';
                const indexedCountKey = indexedKey + '_count';

                const contextTypeIndex = eventStorage[indexedKey];

                if (!callbackFn) {
                    // If no specific callback is given, remove all listeners for this type.
                    delete eventStorage[currentType];
                    delete eventStorage[indexedKey];
                    delete eventStorage[indexedCountKey];
                } else {
                    let listenerList = boundContextId && contextTypeIndex ? contextTypeIndex[boundContextId] : eventStorage[currentType];

                    if (listenerList) {
                        for (let j = listenerList.length - 1; j >= 0; j--) {
                            const currentListener = listenerList[j];
                            const contextMatch = !listenerContext || (currentListener.context === listenerContext);

                            if ((currentListener.action === callbackFn) && contextMatch) {
                                // Remove the listener and mark its action as a no-op,
                                // in case it's currently being iterated over during an event dispatch.
                                const removed = listenerList.splice(j, 1);
                                if (removed.length > 0) {
                                    removed[0].action = GeoView.Toolbox.returnFalse;
                                }
                            }
                        }

                        // If context-indexed and the list for that context becomes empty, clean up.
                        if (boundContextId && contextTypeIndex && listenerList.length === 0) {
                            delete contextTypeIndex[boundContextId];
                            eventStorage[indexedCountKey]--; // Decrement the count of contexts
                        }
                    }
                }
            }

            return this;
        },

        // Removes all event listeners of any type from this object.
        removeAllListeners: function () {
            delete this[eventRegistryField];
            return this;
        },

        // Dispatches an event of a specific type, notifying all registered listeners.
        // (eventTypeString[, eventPayloadObject])
        emitEvent: function (eventType, payloadData) {
            if (!this.hasListenersFor(eventType)) {
                return this; // No listeners, nothing to do.
            }

            // Create the event object, merging payload data with core event properties.
            const eventPayload = GeoView.assignProps({}, payloadData, { eventType: eventType, targetObject: this });

            const eventStorage = this[eventRegistryField];
            let activeListeners;
            let currentListener;

            // Process directly registered listeners.
            if (eventStorage[eventType]) {
                // Use a slice to create a shallow copy, preventing issues if listeners
                // are added/removed during event dispatch.
                activeListeners = eventStorage[eventType].slice();
                for (let i = 0; i < activeListeners.length; i++) {
                    currentListener = activeListeners[i];
                    currentListener.action.call(currentListener.context, eventPayload);
                }
            }

            // Process context-indexed listeners.
            const indexedListeners = eventStorage[eventType + '_idx_by_context'];
            if (indexedListeners) {
                // Iterate through each context that has listeners for this event type.
                for (const contextId in indexedListeners) {
                    if (Object.prototype.hasOwnProperty.call(indexedListeners, contextId)) {
                        activeListeners = indexedListeners[contextId].slice(); // Copy for safe iteration

                        for (let i = 0; i < activeListeners.length; i++) {
                            currentListener = activeListeners[i];
                            currentListener.action.call(currentListener.context, eventPayload);
                        }
                    }
                }
            }

            return this;
        },

        // Attaches a listener that will be automatically removed after being invoked once.
        // (eventTypesString, callbackFunction[, contextObject])
        addSingleUseListener: function (eventTypes, callbackFn, listenerContext) {

            // Handle multiple event types if the first argument is an object.
            if (GeoView.Toolbox.processCollection(eventTypes, this.addSingleUseListener, this, callbackFn, listenerContext)) {
                return this;
            }

            const selfReference = this; // Capture 'this' for the handler closure

            // Create a wrapper handler that removes both the original listener and itself.
            const oneTimeHandler = GeoView.createBoundFunction(function () {
                selfReference
                    .detachListener(eventTypes, callbackFn, listenerContext)
                    .detachListener(eventTypes, oneTimeHandler, listenerContext); // Remove this wrapper too
            }, this);

            // First, attach the original listener.
            // Then, attach the one-time handler that cleans up.
            return this
                .attachListener(eventTypes, callbackFn, listenerContext)
                .attachListener(eventTypes, oneTimeHandler, listenerContext);
        }
    };

    // --- Event Handling Aliases ---
    // Provide common, shorter aliases for event methods.
    GeoView.Behavior.EmitterTrait.onEvent = GeoView.Behavior.EmitterTrait.attachListener;
    GeoView.Behavior.EmitterTrait.offEvent = GeoView.Behavior.EmitterTrait.detachListener;
    GeoView.Behavior.EmitterTrait.onceEvent = GeoView.Behavior.EmitterTrait.addSingleUseListener;
    GeoView.Behavior.EmitterTrait.triggerEvent = GeoView.Behavior.EmitterTrait.emitEvent;

}(window, document, undefined));