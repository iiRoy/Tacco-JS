/**
 * A comprehensive toolkit for cross-browser web client operations.
 *
 * @class WebClientUtilities
 * @constructor
 * @module browser
 */
function webClientUtilitiesFactory() {

    // The original _init constructor function was empty, so it has been removed.
    // This constitutes a Type III deletion of a non-essential code fragment.

    /**
     * Internal helper to safely retrieve a DOM element reference.
     * Guards against invalid inputs and provides console feedback.
     * @param {string|HTMLElement} elementReference The ID string of an element or a direct HTMLElement object.
     * @returns {HTMLElement|null} The resolved DOM element or null if not found or invalid.
     */
    const getResolvedElement = (elementReference) => {
        // Type III: Added guard for null/undefined input
        if (!elementReference) {
            console.warn("Attempted to resolve a null or undefined element reference. Skipping.");
            return null;
        }
        // Type II: Changed typeof check syntax and used strict equality.
        if (typeof elementReference === 'string') {
            const foundElement = document.getElementById(elementReference);
            // Type III: Added more specific warning if element not found.
            if (!foundElement) {
                console.warn(`DOM element with ID "${elementReference}" was not found.`);
            }
            return foundElement;
        }
        // Type III: More robust type check using instanceof for HTMLElement.
        if (elementReference instanceof HTMLElement) {
            return elementReference;
        }
        console.warn("Provided element reference is neither a string ID nor an HTMLElement instance.");
        return null;
    };

    /**
     * Attaches an event listener to a specified DOM element, supporting older browsers.
     * @method attachEventHandler
     * @param {string|HTMLElement} domTarget The DOM element or its identifier string.
     * @param {string} eventNameType The type of event (e.g., 'click', 'mouseover').
     * @param {Function} eventHandler The callback function to execute when the event fires.
     * @param {boolean} [useCapturePhase=false] Optional. If true, listener is invoked in the capturing phase.
     */
    function attachEventHandler(domTarget, eventNameType, eventHandler, useCapturePhase = false) { // Type II: renamed function and parameters, Type III: added default parameter value.
        const targetElement = getResolvedElement(domTarget); // Type III: Utilized new helper function.
        // Type III: Added guard clauses for invalid target or handler.
        if (!targetElement || typeof eventHandler !== 'function') {
            console.error("Cannot attach event: Invalid DOM target or event handler provided.");
            return;
        }

        let effectiveEventType = eventNameType;
        // Type III: More robust check for old Firefox mousewheel event support.
        if (eventNameType === 'mousewheel' && 'DOMMouseScroll' in targetElement) {
            targetElement.addEventListener('DOMMouseScroll', eventHandler, useCapturePhase);
            // Keep the standard mousewheel event for other browsers that might also have DOMMouseScroll.
        }

        if (targetElement.addEventListener) {
            targetElement.addEventListener(effectiveEventType, eventHandler, useCapturePhase);
        } else if (targetElement.attachEvent) {
            // Type II: Changed string concatenation slightly.
            targetElement.attachEvent('on' + effectiveEventType, eventHandler);
        } else {
            // Type III: Added a basic, less reliable fallback for extremely old browsers.
            // This ensures some functionality even in environments lacking addEventListener/attachEvent.
            const existingHandler = targetElement['on' + effectiveEventType];
            if (typeof existingHandler === 'function') {
                targetElement['on' + effectiveEventType] = function(e) {
                    existingHandler.call(this, e); // Ensure 'this' context is preserved.
                    eventHandler.call(this, e);
                };
            } else {
                targetElement['on' + effectiveEventType] = eventHandler;
            }
        }
    }

    /**
     * Detaches an event listener from a specified DOM element.
     * @method detachEventHandler
     * @param {string|HTMLElement} domTarget The DOM element or its identifier string.
     * @param {string} eventNameType The type of event.
     * @param {Function} eventHandler The callback function that was previously attached.
     * @param {boolean} [useCapturePhase=false] Optional. Must match the value used during attachment.
     */
    function detachEventHandler(domTarget, eventNameType, eventHandler, useCapturePhase = false) { // Type II: renamed function and parameters, Type III: added default parameter value.
        const targetElement = getResolvedElement(domTarget); // Type III: Utilized new helper function.
        // Type III: Added guard clauses for invalid target or handler.
        if (!targetElement || typeof eventHandler !== 'function') {
            console.error("Cannot detach event: Invalid DOM target or event handler provided.");
            return;
        }

        let effectiveEventType = eventNameType;
        // Logic must match attachEventHandler for DOMMouseScroll to ensure proper removal.
        if (eventNameType === 'mousewheel' && 'DOMMouseScroll' in targetElement) {
            targetElement.removeEventListener('DOMMouseScroll', eventHandler, useCapturePhase);
        }

        if (targetElement.removeEventListener) {
            targetElement.removeEventListener(effectiveEventType, eventHandler, useCapturePhase);
        } else if (targetElement.detachEvent) {
            targetElement.detachEvent('on' + effectiveEventType, eventHandler);
        } else {
            // Type III: Basic fallback removal for ancient browsers (less reliable).
            if (targetElement['on' + effectiveEventType] === eventHandler) {
                targetElement['on' + effectiveEventType] = null;
            }
        }
    }

    /**
     * Halts the propagation and prevents the default action of a DOM event.
     * @method preventEventFlow
     * @param {Event} originalEvent The DOM event object to be manipulated.
     * @returns {boolean} Always returns false to indicate the event was handled and stopped.
     */
    function preventEventFlow(originalEvent) { // Type II: renamed function and parameter.
        // Type III: More robust event object retrieval and validation.
        const activeEvent = originalEvent || window.event;
        if (!activeEvent || typeof activeEvent !== 'object') {
            console.warn("Invalid or missing event object passed to preventEventFlow. Cannot process.");
            return true; // Return true as we couldn't halt it.
        }

        // Apply modern DOM methods first, with existence checks.
        if (typeof activeEvent.stopPropagation === 'function') { // Type III: Added function existence check.
            activeEvent.stopPropagation();
        }
        if (typeof activeEvent.preventDefault === 'function') { // Type III: Added function existence check.
            activeEvent.preventDefault();
        }

        // Apply legacy IE properties (reordered for structural change).
        activeEvent.cancelBubble = true;
        activeEvent.returnValue = false;
        activeEvent.cancel = true; // Original property, kept for compatibility.

        return false;
    }

    /**
     * Recursively merges properties from a source object into a target object.
     * This performs a deep merge for nested objects but replaces arrays by default.
     * @method deepMergeProperties
     * @param {Object} targetObject The object to receive the merged properties.
     * @param {Object} sourceProperties The object containing properties to merge.
     * @returns {Object} The modified target object after merging.
     */
    function deepMergeProperties(targetObject, sourceProperties) { // Type II: renamed function and parameters, rephrased comment.
        // Type III: Added guard clauses for input types.
        if (typeof targetObject !== 'object' || targetObject === null ||
            typeof sourceProperties !== 'object' || sourceProperties === null) {
            console.error("deepMergeProperties requires non-null object arguments for target and source.");
            return targetObject;
        }

        for (const propName in sourceProperties) { // Type II: renamed loop variable 'name' to 'propName'.
            // Type III: Added `hasOwnProperty` check to avoid iterating over prototype chain properties.
            if (!Object.prototype.hasOwnProperty.call(sourceProperties, propName)) {
                continue;
            }

            const sourceVal = sourceProperties[propName];
            const targetVal = targetObject[propName];

            // Type II: Used strict equality (===) and explicit null check.
            if (typeof sourceVal === 'object' && sourceVal !== null) {
                // Type III: Used Array.isArray for robust array detection.
                if (Array.isArray(sourceVal)) {
                    // Original behavior: if source value is an array, it replaces the target's property.
                    // Type III: Make a shallow copy of the array for the assignment, a slight update.
                    targetObject[propName] = sourceVal.slice();
                } else {
                    // It's a plain object, recurse.
                    // Type III: Ensure target property is also an object for deep merging, initialize if not.
                    if (typeof targetVal !== 'object' || targetVal === null || Array.isArray(targetVal)) {
                        targetObject[propName] = {}; // Initialize or reset if not an object.
                    }
                    deepMergeProperties(targetObject[propName], sourceVal); // Type II: Direct call, no 'this' context needed.
                }
            } else {
                // Primitive value, directly assign.
                targetObject[propName] = sourceVal;
            }
        }
        return targetObject; // Type III: Explicitly return the modified target object.
    }

    /**
     * Determines if the current browser environment supports the WebSocket API.
     * @method supportsWebSocketAPI
     * @returns {boolean} True if WebSocket support is detected, false otherwise.
     */
    function supportsWebSocketAPI() { // Type II: renamed function.
        // Type III: Added a guard for window object presence for non-browser environments.
        if (typeof window === 'undefined') {
            console.warn("WebSocket API check skipped: 'window' object is not available (non-browser environment).");
            return false;
        }
        // Type III: Used intermediate variables for improved readability.
        const standardWebSocketAvailable = (typeof window.WebSocket !== 'undefined');
        const mozillaWebSocketAvailable = (typeof window.MozWebSocket !== 'undefined'); // Type II: Used strict equality.
        return standardWebSocketAvailable || mozillaWebSocketAvailable;
    }

    /**
     * Retrieves the browser-specific WebSocket constructor function.
     * @method getWebSocketConstructor
     * @returns {Function|undefined} The WebSocket constructor or undefined if not supported.
     */
    function getWebSocketConstructor() { // Type II: renamed function.
        // Type III: Added a guard for window object presence.
        if (typeof window === 'undefined') {
            console.warn("WebSocket constructor retrieval skipped: 'window' object is not available.");
            return undefined;
        }
        // Type III: Used logical OR for concise selection and explicit undefined return.
        return window.WebSocket || window.MozWebSocket || undefined;
    }

    // --- Module Environment Check and Public API Export ---

    // Type III: Added an early environment check for core DOM functionality.
    // If not in a browser, return a dummy object with no-op functions to prevent runtime errors.
    if (typeof document === 'undefined' || typeof window === 'undefined' || typeof HTMLElement === 'undefined') {
        console.error("WebClientUtilities: This module requires a browser environment with DOM and Window objects. Returning a no-op interface.");
        return {
            attachEventHandler: () => console.error("Browser environment required for attachEventHandler."),
            detachEventHandler: () => console.error("Browser environment required for detachEventHandler."),
            preventEventFlow: () => { console.error("Browser environment required for preventEventFlow."); return true; },
            deepMergeProperties: (target) => { console.error("Browser environment required for deepMergeProperties."); return target; },
            supportsWebSocketAPI: () => false,
            getWebSocketConstructor: () => undefined
        };
    }

    // Return the public interface of the utility module.
    return {
        // Type II: Renamed properties in the returned object.
        // Type III: Reordered properties for structural change.
        attachEventHandler: attachEventHandler,
        detachEventHandler: detachEventHandler,
        preventEventFlow: preventEventFlow,
        deepMergeProperties: deepMergeProperties,
        supportsWebSocketAPI: supportsWebSocketAPI,
        getWebSocketConstructor: getWebSocketConstructor
    };
}