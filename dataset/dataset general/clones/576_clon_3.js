var eventManager = {
    // Establishes an event listener for a given DOM element.
    bindEvent: function(targetElement, eventName, handlerFunction) {
        // Prefer the standard addEventListener for modern browsers.
        if (targetElement.addEventListener) {
            targetElement.addEventListener(eventName, handlerFunction, false);
        }
        // Provide compatibility for older Internet Explorer versions.
        else if (targetElement.attachEvent) {
            // Create a unique identifier for the handler and its wrapper to manage context and prevent memory leaks.
            // Using a string representation length helps create a somewhat unique key.
            const uniqueKey = '_' + eventName + handlerFunction.toString().length + handlerFunction.name;
            targetElement[uniqueKey] = handlerFunction;
            targetElement['__wrapped_' + uniqueKey] = function() {
                // Ensure 'this' context within the handler refers to the target element.
                targetElement[uniqueKey].call(targetElement, window.event);
            };
            targetElement.attachEvent('on' + eventName, targetElement['__wrapped_' + uniqueKey]);
        } else {
            // Fallback for extremely old browsers, direct assignment (may overwrite previous handlers).
            targetElement['on' + eventName] = handlerFunction;
        }
    },

    // Removes an event listener from a specified DOM element.
    // (Added for completeness, though not explicitly used in the original example's execution flow.)
    unbindEvent: function(targetElement, eventName, handlerFunction) {
        if (targetElement.removeEventListener) {
            targetElement.removeEventListener(eventName, handlerFunction, false);
        } else if (targetElement.detachEvent) {
            const uniqueKey = '_' + eventName + handlerFunction.toString().length + handlerFunction.name;
            const wrapperKey = '__wrapped_' + uniqueKey;
            if (targetElement[wrapperKey]) {
                targetElement.detachEvent('on' + eventName, targetElement[wrapperKey]);
                // Clean up the stored references to prevent memory leaks in IE.
                delete targetElement[uniqueKey];
                delete targetElement[wrapperKey];
            }
        } else {
            targetElement['on' + eventName] = null;
        }
    }
};

// Holds the identifier of the last successfully detected media query breakpoint.
var lastActiveBreakpoint = null;

// --- Core Responsive Breakpoint Detection & Sync ---

// This function identifies the current CSS media query breakpoint and updates the UI/application state accordingly.
var synchronizeBreakpoints = function() {
    // Early exit if fundamental DOM elements are not yet available.
    if (!document.documentElement || !document.body) {
        // console.warn("Essential DOM elements not ready for breakpoint synchronization."); // Removed for Type III
        return;
    }

    let detectedCssBreakpoint = '';
    
    // The CSS stylesheet should define content on a pseudo-element (e.g., body::after)
    // or font-family on a specific element (e.g., head) to indicate the active breakpoint.
    // Example CSS for body::after:
    // body::after { content: 'xs'; display: none; }
    // @media (min-width: 576px) { body::after { content: 'sm'; } }
    // @media (min-width: 768px) { body::after { content: 'md'; } }
    // @media (min-width: 992px) { body::after { content: 'lg'; } }

    // Use window.getComputedStyle for modern browser compatibility.
    if (window.getComputedStyle) {
        const bodyPseudoStyle = window.getComputedStyle(document.body, ':after');
        detectedCssBreakpoint = bodyPseudoStyle.getPropertyValue('content');
    }
    // Fallback path for older Internet Explorer versions using a custom shim.
    else if (window.legacyStyleReader) { // Renamed from original 'getCompStyle'
        // The original code used 'font-family' from 'document.head' for old IE.
        const headElement = document.getElementsByTagName('head')[0];
        if (headElement) {
            const ieComputedStyleShim = window.legacyStyleReader(headElement, ""); // Pseudo-element argument not relevant for font-family
            detectedCssBreakpoint = ieComputedStyleShim.getPropertyValue("font-family");
        } else {
            // console.error("Head element missing for legacy IE breakpoint detection."); // Removed for Type III
            return;
        }
    } else {
        // If no supported method for style computation is found, log and exit.
        console.error("Failed to retrieve computed styles for breakpoint detection.");
        return;
    }

    // Sanitize the retrieved breakpoint string: remove quotes and trim whitespace.
    detectedCssBreakpoint = detectedCssBreakpoint.replace(/['"]/g, '').trim();

    // Proceed only if a breakpoint was detected and it differs from the last known state.
    if (detectedCssBreakpoint && detectedCssBreakpoint !== lastActiveBreakpoint) {
        lastActiveBreakpoint = detectedCssBreakpoint; // Update the stored breakpoint.

        const statusDisplayArea = document.getElementById('breakpointStatusDisplay'); // Renamed ID from 'msg'

        // Ensure the display element exists before attempting to update its content.
        if (!statusDisplayArea) {
            // console.error("Breakpoint status display element with ID 'breakpointStatusDisplay' not found."); // Removed for Type III
            return;
        }

        // Use a switch statement for a structured and clearer handling of different breakpoints.
        switch (lastActiveBreakpoint.toLowerCase()) { // Normalize to lowercase for robustness
            case 'xs':
                statusDisplayArea.innerHTML = `Active Layout: <span style="font-weight: bold; color: #007bff;">Extra Small (${lastActiveBreakpoint.toUpperCase()})</span>`;
                // Implement XS-specific JavaScript logic here.
                break;
            case 's':
                statusDisplayArea.innerHTML = `Active Layout: <span style="font-weight: bold; color: #28a745;">Small (${lastActiveBreakpoint.toUpperCase()})</span>`;
                // Implement S-specific JavaScript logic here.
                break;
            case 'm':
                statusDisplayArea.innerHTML = `Active Layout: <span style="font-weight: bold; color: #ffc107;">Medium (${lastActiveBreakpoint.toUpperCase()})</span>`;
                // Implement M-specific JavaScript logic here.
                break;
            case 'l':
                statusDisplayArea.innerHTML = `Active Layout: <span style="font-weight: bold; color: #dc3545;">Large (${lastActiveBreakpoint.toUpperCase()})</span>`;
                // Implement L-specific JavaScript logic here.
                break;
            default:
                statusDisplayArea.innerHTML = `Unknown Layout: <span style="font-weight: bold; color: #6c757d;">${lastActiveBreakpoint.toUpperCase()}</span>`;
                // console.warn(`An unexpected breakpoint value was detected: "${lastActiveBreakpoint}".`); // Removed for Type III
                break;
        }
    }
}; // End of synchronizeBreakpoints function definition.

// --- IE Compatibility Shim for getComputedStyle ---
// This polyfill-like function provides a basic getComputedStyle functionality for older IE versions.
if (!window.getComputedStyle) {
    window.legacyStyleReader = function(targetElementRef, pseudoElementIdentifier) { // Renamed from getCompStyle
        let computedStyleFacade = {}; // Return an object mimicking the style interface.
        computedStyleFacade.element = targetElementRef;

        computedStyleFacade.getPropertyValue = function(cssPropertyName) {
            const hyphenToCamelCaseRegex = /(\-([a-z]){1})/g;
            let ieCompatiblePropName = cssPropertyName;

            // Adjust 'float' property name for IE's 'styleFloat'.
            if (ieCompatiblePropName === 'float') {
                ieCompatiblePropName = 'styleFloat';
            }

            // Convert hyphenated CSS property names (e.g., 'font-family') to camelCase (e.g., 'fontFamily')
            // for compatibility with IE's currentStyle object.
            if (hyphenToCamelCaseRegex.test(ieCompatiblePropName)) {
                ieCompatiblePropName = ieCompatiblePropName.replace(hyphenToCamelCaseRegex, function(_match, _p1, char) {
                    return char.toUpperCase();
                });
            }
            
            // Attempt to retrieve the style value from IE's currentStyle.
            // Note: Reading pseudo-element content via currentStyle in IE is generally not possible.
            // For the original code's specific use case (font-family on head), this approach works.
            return targetElementRef.currentStyle && targetElementRef.currentStyle[ieCompatiblePropName] ?
                   targetElementRef.currentStyle[ieCompatiblePropName] : null;
        };
        return computedStyleFacade;
    };
}

// --- Document Ready & Event Binding ---

// Utilize 'DOMContentLoaded' for modern browsers to ensure the DOM is fully parsed
// before attempting to access elements or synchronize breakpoints.
eventManager.bindEvent(document, 'DOMContentLoaded', function() {
    synchronizeBreakpoints(); // Execute an initial breakpoint check.

    // Attach the breakpoint synchronization function to the window's 'resize' event.
    eventManager.bindEvent(window, 'resize', synchronizeBreakpoints);

    // For mobile devices, also listen for 'orientationchange' to handle viewport dimension changes.
    if ('onorientationchange' in window) {
        eventManager.bindEvent(window, 'orientationchange', synchronizeBreakpoints);
    }
});

// As a fallback for very old browsers that may not support 'DOMContentLoaded',
// use 'load' event, which fires after all resources (images, scripts) are loaded.
eventManager.bindEvent(window, 'load', function() {
    // Only execute if 'DOMContentLoaded' hasn't already performed the initial synchronization.
    if (lastActiveBreakpoint === null) {
        synchronizeBreakpoints();
    }
});