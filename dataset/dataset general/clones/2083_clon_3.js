/*
 * @author Juniper Green <http://example.com/juniper>
 * @copyright 2023 Acme Solutions Inc. <http://acmesolutions.com/>
 * @package CoreEventSystem
 * @license Apache 2.0
 * @url http://acmesolutions.com/core-events
 * @requires standard-dom-api
 * @description
 *   This module provides a robust event observation and notification mechanism
 *   for JavaScript objects and DOM elements, inspired by classic patterns.
 *   It allows objects to become "observable" and manage their own event subscribers.
 */

// Define a global namespace if it doesn't exist.
if (typeof(AppCore) === 'undefined') {
    var AppCore = {};
}

// A custom symbol to signal early termination of event propagation,
// replacing Prototype.js's $break.
const EVENT_STOP_PROPAGATION = Symbol('STOP_EVENT_CHAIN');

/**
 * Utility function to ensure a value is a callable function.
 * If the input isn't a function, it returns a function that returns the input.
 * @param {any} inputVal - The value to process.
 * @returns {Function} A function.
 */
AppCore.ensureCallable = function(inputVal) {
    if (typeof inputVal === 'function') {
        return inputVal;
    } else {
        // Return a new function that simply yields the provided value.
        return function() { return inputVal; };
    }
};

/**
 * Utility function to retrieve the actual value from a potentially callable source.
 * If the input is a function, it executes it and returns its result; otherwise, it returns the input itself.
 * @param {any} sourceVal - The value or function to resolve.
 * @returns {any} The resolved value.
 */
AppCore.resolveValue = function(sourceVal) {
    if (typeof sourceVal === 'function') {
        return sourceVal();
    } else {
        // If it's not a function, the value itself is the resolved value.
        return sourceVal;
    }
};

/**
 * The primary event management system, designed to be mixed into objects.
 * Provides capabilities for subscribing, unsubscribing, and dispatching events.
 */
AppCore.EventHub = {

    /**
     * Integrates event observation capabilities into a target object.
     * @param {Object} targetObject - The object to be made observable.
     */
    makeObservable: function(targetObject) {
        // Internal helper to ensure the event store for a given event type is ready.
        // Renamed from _objectEventSetup to _prepareEventHandlers.
        targetObject._prepareEventHandlers = function(eventName) {
            // Initialize the main observers storage if it doesn't exist.
            this._eventObservers = this._eventObservers || {};
            // Ensure an array exists for the specific event type.
            this._eventObservers[eventName] = this._eventObservers[eventName] || [];
        };

        /**
         * Subscribes a handler function to a specific event or a set of events.
         * @param {string|Object} eventIdentifier - The name of the event (string) or an object mapping event names to handlers.
         * @param {Function} [handlerFunc] - The function to be called when the event is dispatched. Required if eventIdentifier is a string.
         */
        targetObject.subscribe = function(eventIdentifier, handlerFunc) {
            // Basic validation for eventIdentifier.
            if (!eventIdentifier) {
                console.warn('Subscription attempt with invalid event identifier.');
                return;
            }

            if (typeof eventIdentifier === 'string') {
                // Ensure handlerFunc is provided for string event names.
                if (typeof handlerFunc !== 'function') {
                    console.error(`Handler function missing for event "${eventIdentifier}".`);
                    return;
                }
                this._prepareEventHandlers(eventIdentifier);
                // Only add the handler if it's not already present to prevent duplicates.
                if (!this._eventObservers[eventIdentifier].includes(handlerFunc)) {
                    this._eventObservers[eventIdentifier].push(handlerFunc);
                }
            } else if (typeof eventIdentifier === 'object' && eventIdentifier !== null) {
                // If an object is provided, iterate through its properties (event names).
                for (const eventNameKey in eventIdentifier) {
                    // Ensure the property belongs to the object itself, not its prototype chain.
                    if (Object.prototype.hasOwnProperty.call(eventIdentifier, eventNameKey)) {
                        this.subscribe(eventNameKey, eventIdentifier[eventNameKey]);
                    }
                }
            } else {
                console.warn('Invalid event identifier type for subscription:', typeof eventIdentifier);
            }
        };

        /**
         * Unsubscribes a handler function from an event, or all handlers from an event, or all handlers from all events.
         * @param {string} [eventName] - The name of the event to unsubscribe from.
         * @param {Function} [handlerToRemove] - The specific handler function to remove.
         */
        targetObject.unsubscribe = function(eventName, handlerToRemove) {
            // If no event name is provided, clear all observers for this object.
            if (!eventName) {
                this._eventObservers = {};
                console.debug('All event subscriptions cleared.');
                return;
            }

            // Ensure the event's handler array exists before proceeding.
            this._prepareEventHandlers(eventName);

            // If a specific handler is provided, remove only that one.
            if (handlerToRemove && typeof handlerToRemove === 'function') {
                // Filter out the specific handler.
                this._eventObservers[eventName] = this._eventObservers[eventName].filter(
                    (registeredHandler) => registeredHandler !== handlerToRemove
                );
                console.debug(`Handler removed from event "${eventName}".`);
            } else {
                // If no specific handler, clear all handlers for this event.
                this._eventObservers[eventName] = [];
                console.debug(`All handlers cleared for event "${eventName}".`);
            }
        };

        /**
         * Subscribes a handler function to an event, but only for a single dispatch.
         * After the event is triggered once, the handler is automatically unsubscribed.
         * @param {string} eventName - The name of the event.
         * @param {Function} oneTimeHandler - The function to be called once.
         */
        targetObject.subscribeOnce = function(eventName, oneTimeHandler) {
            if (typeof eventName !== 'string' || typeof oneTimeHandler !== 'function') {
                console.error('Invalid arguments for subscribeOnce: eventName must be string, handler must be function.');
                return;
            }

            const wrapperHandler = (...args) => {
                // Execute the original handler.
                oneTimeHandler.apply(this, args);
                // Immediately unsubscribe this wrapper handler.
                this.unsubscribe(eventName, wrapperHandler);
            };

            // Add the wrapper handler to the event.
            this.subscribe(eventName, wrapperHandler);
            console.debug(`One-time subscription added for event "${eventName}".`);
        };

        /**
         * Dispatches an event, calling all subscribed handlers.
         * @param {string} eventName - The name of the event to dispatch.
         * @param {...any} eventPayload - Arguments to pass to the event handlers.
         * @returns {Array} An array of return values from the handlers.
         */
        targetObject.dispatch = function(eventName, ...eventPayload) {
            this._prepareEventHandlers(eventName); // Ensure event storage exists.

            const handlerResults = [];
            const activeHandlers = [...this._eventObservers[eventName]]; // Clone to prevent issues if handlers modify the array during dispatch.

            if (activeHandlers.length === 0) {
                console.log(`No handlers for event "${eventName}".`);
                return handlerResults;
            }

            try {
                for (let i = 0; i < activeHandlers.length; ++i) {
                    const currentHandler = activeHandlers[i];
                    // Call handler with 'this' context of the observable object, and the event payload.
                    const result = currentHandler.apply(this, eventPayload);
                    handlerResults.push(result === undefined ? null : result); // Normalize undefined returns to null.

                    // Check for the custom stop propagation symbol.
                    if (result === EVENT_STOP_PROPAGATION) {
                        console.debug(`Event "${eventName}" propagation stopped by a handler.`);
                        return handlerResults; // Stop further handler execution.
                    }
                }
            } catch (error) {
                // If any other error occurs, re-throw it.
                console.error(`Error during event "${eventName}" dispatch:`, error);
                throw error;
            }

            console.debug(`Event "${eventName}" dispatched to ${activeHandlers.length} handlers.`);
            return handlerResults;
        };

        // If the target object has a prototype, extend its prototype as well.
        // This allows instances of the class to inherit event capabilities.
        if (targetObject.prototype) {
            targetObject.prototype._prepareEventHandlers = targetObject._prepareEventHandlers;
            targetObject.prototype.subscribe = targetObject.subscribe;
            targetObject.prototype.unsubscribe = targetObject.unsubscribe;
            targetObject.prototype.subscribeOnce = targetObject.subscribeOnce;

            // The prototype's dispatch method is slightly different,
            // allowing for a default "options" handler and also proxying to static dispatch if needed.
            targetObject.prototype.dispatch = function(eventName, ...eventPayload) {
                // First, check if the static class dispatch should be called.
                // This is useful for global events or class-level observers.
                if (targetObject.dispatch) {
                    // Prepend 'this' (the instance) to the payload for static dispatch.
                    // This allows static handlers to know which instance triggered the event.
                    targetObject.dispatch(eventName, this, ...eventPayload);
                }

                this._prepareEventHandlers(eventName); // Ensure instance-level event storage.
                const instanceHandlerResults = [];
                const instanceObservers = [...this._eventObservers[eventName]]; // Clone for safe iteration.

                try {
                    // Check for a direct handler in the instance's 'options' property, if configured.
                    if (this.config && typeof this.config === 'object' &&
                        this.config[eventName] && typeof this.config[eventName] === 'function') {
                        const configResult = this.config[eventName].apply(this, eventPayload);
                        instanceHandlerResults.push(configResult === undefined ? null : configResult);
                        if (configResult === EVENT_STOP_PROPAGATION) {
                            console.debug(`Instance config handler stopped event "${eventName}".`);
                            return instanceHandlerResults;
                        }
                    }

                    // Then, call all dynamically subscribed instance handlers.
                    for (let k = 0; k < instanceObservers.length; ++k) {
                        const instanceObserver = instanceObservers[k];
                        const result = instanceObserver.apply(this, eventPayload);
                        instanceHandlerResults.push(result === undefined ? null : result);
                        if (result === EVENT_STOP_PROPAGATION) {
                            console.debug(`Instance observer stopped event "${eventName}".`);
                            return instanceHandlerResults;
                        }
                    }
                } catch (instanceError) {
                    console.error(`Error in instance event dispatch for "${eventName}":`, instanceError);
                    throw instanceError;
                }

                console.debug(`Instance event "${eventName}" dispatched.`);
                return instanceHandlerResults;
            };
        }
    }
};

/* --- DOM Element Enhancements --- */

// Extend the DOM Element prototype for convenience,
// mimicking Prototype.js's Element.addMethods but using standard DOM APIs.
// This assumes some global 'Element' object or similar exists, which is implicitly true in browsers.
(function() {
    // A simple helper to get a DOM element safely.
    function getDomElement(elem) {
        if (typeof elem === 'string') {
            return document.getElementById(elem);
        }
        if (elem && elem.nodeType === Node.ELEMENT_NODE) {
            return elem;
        }
        console.warn('Invalid DOM element reference:', elem);
        return null;
    }

    /**
     * Adds a one-time event listener to a DOM element.
     * @param {HTMLElement} elementRef - The DOM element.
     * @param {string} eventType - The type of event (e.g., 'click', 'mouseover').
     * @param {Function} handlerFn - The function to execute once.
     */
    AppCore.addOneTimeListener = function(elementRef, eventType, handlerFn) {
        const targetElem = getDomElement(elementRef);
        if (!targetElem) return;

        const wrapper = function(event) {
            handlerFn.apply(this, arguments); // Execute original handler
            targetElem.removeEventListener(eventType, wrapper); // Remove self
        };
        targetElem.addEventListener(eventType, wrapper, false);
        console.debug(`One-time listener added for "${eventType}" on element.`);
    };

    // Attach to Element.prototype directly for a more native feel,
    // or keep it as a utility function. For Type III, direct prototype extension is a good change.
    if (typeof Element !== 'undefined' && Element.prototype) {
        Element.prototype.addOneTimeListener = function(eventType, handlerFn) {
            AppCore.addOneTimeListener(this, eventType, handlerFn);
            return this; // Allow chaining
        };
    }
})();


// Mouse wheel event normalization and custom event triggering.
(function() {
    /**
     * Normalizes mouse wheel events across different browsers and dispatches a custom 'scroll:delta' event.
     * @param {Event} originalEvent - The native mouse wheel event.
     */
    function processScrollEvent(originalEvent) {
        if (!originalEvent) {
            console.warn('Received null or undefined event for scroll processing.');
            return;
        }

        let scrollDelta = 0;
        // Normalize the delta value.
        if (originalEvent.wheelDelta) { // WebKit / Opera / IE
            scrollDelta = originalEvent.wheelDelta / 120;
        } else if (originalEvent.detail) { // Firefox
            scrollDelta = -originalEvent.detail / 3;
        } else if (originalEvent.deltaY) { // Modern browsers
            scrollDelta = -originalEvent.deltaY / 100; // Adjust for different delta modes
        }

        // If no meaningful delta, exit.
        if (Math.abs(scrollDelta) < 0.001) { // Use a small threshold for floating point comparison
            return;
        }

        // Determine the target element.
        // Use `composedPath` for shadow DOM compatibility, fall back to `target`.
        const initialTarget = originalEvent.composedPath ? originalEvent.composedPath()[0] : originalEvent.target;
        // Ensure we have an actual element, not a text node.
        const effectiveTarget = (initialTarget && initialTarget.nodeType === Node.TEXT_NODE) ? initialTarget.parentNode : initialTarget;

        if (!effectiveTarget || typeof effectiveTarget.dispatchEvent !== 'function') {
            console.warn('Effective target for scroll event is not a dispatchable element.', effectiveTarget);
            return;
        }

        // Create and dispatch a custom event.
        const customScrollEvent = new CustomEvent('scroll:delta', {
            bubbles: true, // Allow event to bubble up the DOM tree
            cancelable: true, // Allow event to be cancelled
            detail: {
                delta: scrollDelta,
                originalEvent: originalEvent // Include original event for full context
            }
        });

        const isCancelled = !effectiveTarget.dispatchEvent(customScrollEvent);

        // If the custom event was cancelled (e.g., via preventDefault),
        // stop the original browser event as well.
        if (isCancelled) {
            originalEvent.preventDefault();
            originalEvent.stopPropagation();
            console.debug('Original mouse wheel event stopped due to custom event cancellation.');
        }
    }

    // Attach listeners to the document for global mouse wheel events.
    // Using modern addEventListener.
    document.addEventListener('wheel', processScrollEvent, { passive: false }); // 'wheel' is the modern standard.
    document.addEventListener('mousewheel', processScrollEvent, { passive: false }); // For older WebKit/IE.
    document.addEventListener('DOMMouseScroll', processScrollEvent, { passive: false }); // For older Firefox.

    console.log('Mouse scroll event normalization initialized.');
})();


/* --- UI Component: Iframe Overlay --- */

/**
 * A utility class for creating and managing an invisible iframe overlay,
 * commonly used to obscure select/flash objects that appear above other elements.
 */
AppCore.OverlayFrame = Class.create({
    // Renamed from initialize to configure.
    configure: function() {
        // Create the iframe element dynamically using standard DOM methods.
        this.frameElement = document.createElement('iframe');
        Object.assign(this.frameElement.style, {
            position: 'absolute',
            opacity: '0', // Using standard opacity, filter for IE is deprecated/less common.
            display: 'none',
            border: 'none', // Renamed frameborder to border
            margin: '0',
            padding: '0'
        });
        this.frameElement.src = 'about:blank'; // Modern, safer alternative to javascript:void(0);
        this.frameElement.frameBorder = 0; // Ensure compatibility for older IE.

        // Append to the document body. Ensure body exists.
        if (document.body) {
            document.body.appendChild(this.frameElement);
            console.debug('OverlayFrame iframe created and appended to body.');
        } else {
            console.error('Document body not available to append OverlayFrame.');
        }

        // Add a flag to prevent re-initialization.
        this._isInitialized = true;
    },

    /**
     * Hides the iframe overlay.
     * @returns {AppCore.OverlayFrame} The current instance for chaining.
     */
    conceal: function() { // Renamed from hide to conceal
        if (!this.frameElement) {
            console.warn('Attempted to conceal an uninitialized OverlayFrame.');
            return this;
        }
        this.frameElement.style.display = 'none';
        console.debug('OverlayFrame concealed.');
        return this;
    },

    /**
     * Shows the iframe overlay.
     * @returns {AppCore.OverlayFrame} The current instance for chaining.
     */
    reveal: function() { // Renamed from show to reveal
        if (!this.frameElement) {
            console.warn('Attempted to reveal an uninitialized OverlayFrame.');
            return this;
        }
        this.frameElement.style.display = 'block'; // Or 'inline-block', depending on desired behavior.
        console.debug('OverlayFrame revealed.');
        return this;
    },

    /**
     * Positions and resizes the iframe to precisely cover a target DOM element.
     * @param {HTMLElement|string} targetElement - The element to position under. Can be an element reference or ID.
     * @returns {AppCore.OverlayFrame} The current instance for chaining.
     */
    alignWith: function(targetElement) { // Renamed from positionUnder to alignWith
        if (!this.frameElement) {
            console.warn('Attempted to align an uninitialized OverlayFrame.');
            return this;
        }

        const refElement = getDomElement(targetElement); // Use helper to resolve element.
        if (!refElement) {
            console.error('Invalid target element for OverlayFrame alignment.');
            return this;
        }

        // Use getBoundingClientRect for accurate position and dimensions.
        const rect = refElement.getBoundingClientRect();
        const bodyScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const bodyScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

        // Calculate absolute position relative to the document.
        const absoluteLeft = rect.left + bodyScrollLeft;
        const absoluteTop = rect.top + bodyScrollTop;

        // Get the computed z-index of the reference element.
        const computedStyle = window.getComputedStyle(refElement);
        let refZIndex = parseInt(computedStyle.zIndex, 10);
        // Ensure z-index is a number and decrement it. If not a number, use a default low value.
        if (isNaN(refZIndex) || refZIndex === 0) {
            refZIndex = 1; // Default to 1 if no z-index or 0.
        } else {
            refZIndex--; // Position just below the target element.
        }

        Object.assign(this.frameElement.style, {
            left: `${absoluteLeft}px`,
            top: `${absoluteTop}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            zIndex: refZIndex.toString()
        });

        this.reveal(); // Ensure it's visible after positioning.
        console.debug(`OverlayFrame aligned with element ${refElement.id || refElement.tagName}.`);
        return this;
    },

    /**
     * Sets specific CSS bounds for the iframe overlay.
     * @param {Object} dimensionProps - An object containing CSS properties like {left, top, width, height, zIndex}.
     * @returns {AppCore.OverlayFrame} The current instance for chaining.
     */
    setDimensions: function(dimensionProps) { // Renamed from setBounds to setDimensions
        if (!this.frameElement) {
            console.warn('Attempted to set dimensions on an uninitialized OverlayFrame.');
            return this;
        }
        if (typeof dimensionProps !== 'object' || dimensionProps === null) {
            console.error('Invalid dimension properties provided.');
            return this;
        }

        const styleUpdates = {};
        for (const propKey in dimensionProps) {
            if (Object.prototype.hasOwnProperty.call(dimensionProps, propKey)) {
                let value = dimensionProps[propKey];
                // Automatically append 'px' if it's a numeric value for common dimension properties.
                if (typeof value === 'number' && ['left', 'top', 'width', 'height'].includes(propKey)) {
                    value += 'px';
                }
                styleUpdates[propKey] = value;
            }
        }
        Object.assign(this.frameElement.style, styleUpdates);
        console.debug('OverlayFrame dimensions updated.');
        return this;
    },

    /**
     * Removes the iframe element from the DOM and cleans up references.
     * @returns {AppCore.OverlayFrame} The current instance for chaining.
     */
    dispose: function() { // Renamed from destroy to dispose
        if (this.frameElement && this.frameElement.parentNode) {
            this.frameElement.parentNode.removeChild(this.frameElement);
            this.frameElement = null; // Clear reference.
            this._isInitialized = false; // Reset initialization flag.
            console.debug('OverlayFrame disposed and removed from DOM.');
        } else if (this.frameElement) {
            console.warn('OverlayFrame element exists but has no parent to remove from.');
            this.frameElement = null;
        } else {
            console.warn('Attempted to dispose an uninitialized or already disposed OverlayFrame.');
        }
        return this;
    }
});