//
// Touch Input Emulation Utility for Legacy UI Frameworks
// Original Concept: Stephen von Takach (2010)
// Adapted and Extended for Modern Web Environments
// License: MIT (Re-affirmed)
// Version: 1.1.0
//
// Project Repository: https://github.com/your-repo/touch-shim
//

// Central configuration for gesture timings and offsets
var gestureSettings = {
    doubleTapIntervalMs: 650, // Time window for a double tap
    longPressDurationMs: 750, // Duration for a long press to trigger a context menu
    contextMenuOffsetX: 45,   // X offset for context menu display
    contextMenuOffsetY: 7,    // Y offset for context menu display
    defaultButtonIdentifier: 0 // Mouse button for left click (0)
};

// State variables for tap detection
var lastElementTouched = null;  // Stores the target of the last tap
var tapAttemptActive = false;   // Flag indicating if a tap sequence is in progress
var tapExpirationTimer = null;  // Reference to the timeout for tap sequence invalidation

// State variables for long press / right-click emulation
var longPressAwaiting = false;  // Flag indicating a potential long press
var primaryTouchEvent = null;   // Stores the initial touch event for long press
var longPressTimerRef = null;   // Reference to the timeout for long press
var suppressNextMouseUp = false; // Flag to prevent a click after context menu display

/**
 * Resets the active tap sequence state.
 * This function clears the double-tap window.
 */
function invalidateTapSequence() {
    tapAttemptActive = false;
}

/**
 * Clears any pending long press actions.
 * Prevents a context menu from appearing if the hold is released prematurely.
 */
function abortLongPress() {
    if (longPressAwaiting) {
        clearTimeout(longPressTimerRef);
        longPressAwaiting = false;
        primaryTouchEvent = null;
    }
}

/**
 * Initiates the long press detection timer.
 * @param {Event} currentEvent - The touchstart event object.
 */
function commenceLongPressDetection(currentEvent) {
    // If a long press is already being tracked, do nothing.
    if (longPressAwaiting) {
        return;
    }

    longPressAwaiting = true; // Mark as potentially long pressing
    primaryTouchEvent = currentEvent.changedTouches[0]; // Store the initial touch point
    longPressTimerRef = setTimeout(triggerContextMenuSimulation, gestureSettings.longPressDurationMs);
}

/**
 * Helper to create and dispatch a MouseEvent.
 * @param {string} eventType - The type of mouse event (e.g., 'mousedown', 'mouseup').
 * @param {Touch} touchPoint - The touch object providing coordinates and target.
 * @param {number} mouseButton - The mouse button to simulate (e.g., 0 for left, 2 for right).
 * @param {number} [offsetX=0] - X offset for event coordinates.
 * @param {number} [offsetY=0] - Y offset for event coordinates.
 */
function dispatchSimulatedMouseEvent(eventType, touchPoint, mouseButton, offsetX, offsetY) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;

    var simulatedMouseEvent = document.createEvent("MouseEvent");
    simulatedMouseEvent.initMouseEvent(
        eventType,          // type
        true,               // bubbles
        true,               // cancelable
        window,             // view
        1,                  // detail
        touchPoint.screenX + offsetX, // screenX
        touchPoint.screenY + offsetY, // screenY
        touchPoint.clientX + offsetX, // clientX
        touchPoint.clientY + offsetY, // clientY
        false,              // ctrlKey
        false,              // altKey
        false,              // shiftKey
        false,              // metaKey
        mouseButton,        // button
        null                // relatedTarget
    );
    touchPoint.target.dispatchEvent(simulatedMouseEvent);
}

/**
 * Simulates a right-click and context menu display.
 * This function is called after a long press timeout.
 */
function triggerContextMenuSimulation() {
    longPressAwaiting = false; // Reset long press state

    var initialTouch = primaryTouchEvent;
    if (!initialTouch) { // Guard against null touch event
        return;
    }

    // First, simulate a mouseup to release the initial mousedown
    dispatchSimulatedMouseEvent("mouseup", initialTouch, gestureSettings.defaultButtonIdentifier);

    // Then, simulate a mousedown with the right-click button
    dispatchSimulatedMouseEvent("mousedown", initialTouch, 2); // 2 for right mouse button

    // Finally, simulate the contextmenu event with a slight offset
    dispatchSimulatedMouseEvent(
        "contextmenu",
        initialTouch,
        2, // 2 for right mouse button
        gestureSettings.contextMenuOffsetX,
        gestureSettings.contextMenuOffsetY
    );

    // Prevent any subsequent mouseup from triggering a regular click
    suppressNextMouseUp = true;
    primaryTouchEvent = null; // Clear reference to free memory
}

/**
 * Processes the initial touch (touchstart) event.
 * Handles single tap, double tap, and initiates long press detection.
 * @param {Event} initialTouchEvt - The original touchstart event.
 */
function processTouchDownEvent(initialTouchEvt) {
    var primaryContact = initialTouchEvt.changedTouches[0];
    var currentTouchTarget = primaryContact.target;

    // Simulate mouseover for hover effects
    dispatchSimulatedMouseEvent("mouseover", primaryContact, gestureSettings.defaultButtonIdentifier);

    // Simulate mousedown
    dispatchSimulatedMouseEvent("mousedown", primaryContact, gestureSettings.defaultButtonIdentifier);

    // Double-tap and long-press logic
    if (!tapAttemptActive) {
        // This is the first tap in a potential double-tap sequence
        lastElementTouched = currentTouchTarget;
        tapAttemptActive = true;
        tapExpirationTimer = setTimeout(invalidateTapSequence, gestureSettings.doubleTapIntervalMs);
        commenceLongPressDetection(initialTouchEvt); // Start tracking for long press
    } else {
        // A previous tap is still valid within the double-tap window
        clearTimeout(tapExpirationTimer); // Clear the previous tap's expiration timer
        abortLongPress(); // If we tap again, it's not a long press

        if (currentTouchTarget === lastElementTouched) {
            // It's a double tap on the same element
            lastElementTouched = null; // Reset for next sequence
            tapAttemptActive = false;

            // Simulate a 'click' event
            dispatchSimulatedMouseEvent("click", primaryContact, gestureSettings.defaultButtonIdentifier);

            // Simulate a 'dblclick' event
            dispatchSimulatedMouseEvent("dblclick", primaryContact, gestureSettings.defaultButtonIdentifier);
        } else {
            // Tapped a different element within the double-tap window
            // Treat this as a new single tap sequence
            lastElementTouched = currentTouchTarget;
            tapAttemptActive = true;
            tapExpirationTimer = setTimeout(invalidateTapSequence, gestureSettings.doubleTapIntervalMs);
            commenceLongPressDetection(initialTouchEvt); // Start tracking for long press on new element
        }
    }
}

/**
 * Main handler for all touch events (touchstart, touchmove, touchend, touchcancel).
 * Dispatches appropriate simulated mouse events.
 * @param {Event} rawTouchEvent - The original touch event object.
 * @returns {boolean|void} - Returns false to prevent default browser behavior for some events.
 */
function unifiedTouchGestureProcessor(rawTouchEvent) {
    // If multiple touches are active, we don't process complex gestures
    if (rawTouchEvent.touches.length > 1) {
        abortLongPress(); // Cancel any pending long press
        return;
    }

    var eventTypeToSimulate = "";
    var simulatedMouseButton = gestureSettings.defaultButtonIdentifier; // Default to left click

    // Determine the type of simulated mouse event based on the touch event phase
    switch (rawTouchEvent.type) {
        case "touchstart":
            // If the target is a <select> element, let the browser handle it natively
            // This is a common pattern to avoid breaking native dropdowns.
            if (rawTouchEvent.changedTouches[0].target.tagName.toLowerCase() === "select") {
                return; // Do not prevent default, let native behavior occur
            }
            processTouchDownEvent(rawTouchEvent); // Delegate to specific touchstart handler
            rawTouchEvent.preventDefault(); // Prevent scrolling/zooming for custom gestures
            return false; // Indicate that the event was handled

        case "touchmove":
            abortLongPress(); // Movement cancels any long press
            eventTypeToSimulate = "mousemove";
            rawTouchEvent.preventDefault(); // Prevent native scrolling
            break;

        case "touchend":
            // If context menu was displayed, suppress the subsequent mouseup to avoid a click
            if (suppressNextMouseUp) {
                suppressNextMouseUp = false;
                rawTouchEvent.preventDefault(); // Prevent default click action
                return false; // Event handled
            }
            abortLongPress(); // End of touch, cancel any pending long press
            eventTypeToSimulate = "mouseup";
            break;

        case "touchcancel": // Treat touchcancel similar to touchend for cleanup
            abortLongPress();
            eventTypeToSimulate = "mouseup"; // Or perhaps just cleanup without event dispatch
            break;

        default:
            return; // Unknown event type, do nothing
    }

    // If no specific event type was determined (e.g., touchstart was handled separately), return.
    if (!eventTypeToSimulate) {
        return;
    }

    var primaryContactPoint = rawTouchEvent.changedTouches[0];
    // Dispatch the determined simulated mouse event
    dispatchSimulatedMouseEvent(eventTypeToSimulate, primaryContactPoint, simulatedMouseButton);

    // After a 'mouseup', check if a single 'click' needs to be simulated
    // This emulates the browser's default click behavior after a tap.
    // This check also ensures a 'click' isn't simulated after a double-tap.
    if (eventTypeToSimulate === "mouseup" && tapAttemptActive && primaryContactPoint.target === lastElementTouched) {
        dispatchSimulatedMouseEvent("click", primaryContactPoint, simulatedMouseButton);
    }
}


// Ensure jQuery is loaded before attempting to use it
if (typeof jQuery !== 'undefined') {
    jQuery(function($) {
        //
        // Augment jQuery's feature detection capabilities
        //
        if (typeof $.deviceCapabilities === 'undefined') {
            $.deviceCapabilities = {}; // Initialize if not present
        }
        $.extend($.deviceCapabilities, {
            supportsTouch: (typeof Touch !== "undefined" || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
        });

        //
        // Attach global touch event listeners if touch is supported
        //
        if ($.deviceCapabilities.supportsTouch) {
            document.addEventListener("touchstart", unifiedTouchGestureProcessor, false);
            document.addEventListener("touchmove", unifiedTouchGestureProcessor, false);
            document.addEventListener("touchend", unifiedTouchGestureProcessor, false);
            document.addEventListener("touchcancel", unifiedTouchGestureProcessor, false);
        }
    });
} else {
    // Fallback or warning if jQuery is not present, or attach directly to document
    console.warn("jQuery not found. Touch events will be attached directly to document, but jQuery extensions will be skipped.");
    document.addEventListener("touchstart", unifiedTouchGestureProcessor, false);
    document.addEventListener("touchmove", unifiedTouchGestureProcessor, false);
    document.addEventListener("touchend", unifiedTouchGestureProcessor, false);
    document.addEventListener("touchcancel", unifiedTouchGestureProcessor, false);
}