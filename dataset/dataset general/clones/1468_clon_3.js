// This script manages interactive elements and custom event detection for enhanced user experience.

// Global configuration constants for easier maintenance and readability.
const APPLICATION_SETTINGS = {
    DOM_IDENTIFIERS: {
        MAIN_INTERACTION_ZONE: 'clickarea',
        RAPID_RESPONSE_DISPLAY: 'clickresultfast',
        STANDARD_RESPONSE_DISPLAY: 'clickresultslow'
    },
    EVENT_TYPE_NAMES: {
        CUSTOM_INSTANT_TOUCH: 'fastclick',
        STANDARD_POINTER_CLICK: 'click',
        TOUCH_START_EVENT: 'touchstart',
        TOUCH_MOVE_EVENT: 'touchmove',
        TOUCH_END_EVENT: 'touchend'
    },
    OUTPUT_MESSAGES: {
        INSTANT_CLICK_PREFIX: 'Instant Tap: ',
        NORMAL_CLICK_PREFIX: 'Regular Tap: '
    }
};

// A utility function to safely retrieve a DOM element by its ID.
const retrieveElementById = (elementId, contextDescription = 'component') => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        console.error(`Initialization Error: The required ${contextDescription} with ID '${elementId}' was not found in the DOM.`);
        // Returning null allows subsequent code to check for existence gracefully.
    }
    return targetElement;
};

// Obtain references to the primary interactive and display elements.
const primaryInteractionSurface = retrieveElementById(APPLICATION_SETTINGS.DOM_IDENTIFIERS.MAIN_INTERACTION_ZONE, 'main interaction surface');
const speedyFeedbackPanel = retrieveElementById(APPLICATION_SETTINGS.DOM_IDENTIFIERS.RAPID_RESPONSE_DISPLAY, 'speedy feedback panel');
const typicalFeedbackPanel = retrieveElementById(APPLICATION_SETTINGS.DOM_IDENTIFIERS.STANDARD_RESPONSE_DISPLAY, 'typical feedback panel');

// Variable to store the high-resolution timestamp of the initial touch event.
let initialContactTimestamp = null;

// Common options for event listeners to improve performance where appropriate.
const listenerConfiguration = {
    capture: false, // Events will bubble up.
    passive: true   // Listener will not call preventDefault().
};

// --- Core Event Handling Logic ---

/**
 * Updates a display element with a formatted duration message.
 * @param {HTMLElement} displayTarget - The DOM element to update.
 * @param {string} messagePrefix - Text to prepend to the duration.
 * @param {number|null} startTime - The initial timestamp (e.g., from performance.now()).
 * @param {number} endTime - The current timestamp.
 */
const renderTimingResult = (displayTarget, messagePrefix, startTime, endTime) => {
    if (!displayTarget || startTime === null || endTime < startTime) {
        // Guard clause for invalid inputs or missing display element.
        console.warn(`Attempted to render timing result with invalid data or target. Target: ${displayTarget ? 'Valid' : 'Invalid'}, StartTime: ${startTime}, EndTime: ${endTime}`);
        if (displayTarget) { // Provide feedback even if data is bad.
            displayTarget.textContent = `${messagePrefix} (Measurement Error)`;
        }
        return;
    }
    const calculatedDuration = (endTime - startTime).toFixed(2); // Precision for performance.now().
    displayTarget.textContent = `${messagePrefix}${calculatedDuration} ms`;
};

// Set up the listener for the custom 'instant touch' event.
if (primaryInteractionSurface && speedyFeedbackPanel) {
    primaryInteractionSurface.addEventListener(APPLICATION_SETTINGS.EVENT_TYPE_NAMES.CUSTOM_INSTANT_TOUCH, (eventObject) => {
        // Validate that the custom event originated from our designated interaction surface.
        if (eventObject.detail instanceof HTMLElement && eventObject.detail === primaryInteractionSurface) {
            const eventCompletionTimestamp = performance.now(); // High-resolution timestamp.
            renderTimingResult(speedyFeedbackPanel, APPLICATION_SETTINGS.OUTPUT_MESSAGES.INSTANT_CLICK_PREFIX, initialContactTimestamp, eventCompletionTimestamp);
        }
    }, listenerConfiguration);
} else {
    console.info("Custom instant touch listener could not be registered due to missing DOM elements.");
}

// Set up the listener for the standard 'click' event.
if (primaryInteractionSurface && typicalFeedbackPanel) {
    primaryInteractionSurface.addEventListener(APPLICATION_SETTINGS.EVENT_TYPE_NAMES.STANDARD_POINTER_CLICK, (eventObject) => {
        // Confirm the event target is the expected interaction surface.
        if (eventObject.target === primaryInteractionSurface) {
            const eventCompletionTimestamp = performance.now();
            renderTimingResult(typicalFeedbackPanel, APPLICATION_SETTINGS.OUTPUT_MESSAGES.NORMAL_CLICK_PREFIX, initialContactTimestamp, eventCompletionTimestamp);
        }
    }, listenerConfiguration);
} else {
    console.info("Standard click listener could not be registered due to missing DOM elements.");
}

// Globally track the start time of any touch interaction on the document.
document.addEventListener(APPLICATION_SETTINGS.EVENT_TYPE_NAMES.TOUCH_START_EVENT, () => {
    initialContactTimestamp = performance.now(); // Capture the precise moment a touch begins.
}, listenerConfiguration);


// --- Isolated Module for Custom Instant Touch Event Generation ---

// This self-executing function encapsulates the logic for detecting and dispatching the custom touch event.
((documentContext) => {
    let isPotentialQuickTap = false; // Flag to indicate if the current touch sequence might be a quick tap.

    // Define a minimal movement threshold. Touches moving more than this are not considered "quick".
    const MOVEMENT_TOLERANCE_PIXELS = 7; // Slightly modified threshold.

    let touchStartClientX = 0;
    let touchStartClientY = 0;

    // Listener for the initial touch down.
    documentContext.addEventListener(APPLICATION_SETTINGS.EVENT_TYPE_NAMES.TOUCH_START_EVENT, (touchEvent) => {
        isPotentialQuickTap = true; // Assume it's a quick tap until proven otherwise.
        if (touchEvent.touches.length > 0) {
            touchStartClientX = touchEvent.touches[0].clientX;
            touchStartClientY = touchEvent.touches[0].clientY;
        }
    }, { capture: false, passive: true }); // Passive is beneficial here.

    // Listener for touch movement. If significant movement occurs, it's not a quick tap.
    documentContext.addEventListener(APPLICATION_SETTINGS.EVENT_TYPE_NAMES.TOUCH_MOVE_EVENT, (touchEvent) => {
        if (isPotentialQuickTap && touchEvent.touches.length > 0) {
            const currentClientX = touchEvent.touches[0].clientX;
            const currentClientY = touchEvent.touches[0].clientY;
            // Calculate Euclidean distance moved.
            const displacement = Math.sqrt(
                Math.pow(currentClientX - touchStartClientX, 2) +
                Math.pow(currentClientY - touchStartClientY, 2)
            );

            if (displacement > MOVEMENT_TOLERANCE_PIXELS) {
                isPotentialQuickTap = false; // Movement exceeded threshold, not a quick tap.
            }
        }
    }, { capture: false, passive: true });

    // Listener for touch release. If it was a quick tap, dispatch the custom event.
    documentContext.addEventListener(APPLICATION_SETTINGS.EVENT_TYPE_NAMES.TOUCH_END_EVENT, (touchEvent) => {
        if (isPotentialQuickTap) {
            isPotentialQuickTap = false; // Reset the flag for the next touch sequence.

            // Construct the custom event using the modern CustomEvent constructor.
            const synthesizedEvent = new CustomEvent(APPLICATION_SETTINGS.EVENT_TYPE_NAMES.CUSTOM_INSTANT_TOUCH, {
                bubbles: true,      // The event can bubble up through the DOM.
                cancelable: true,   // The event's default action can be prevented.
                detail: touchEvent.target // Pass the original target element.
            });

            // Dispatch the custom event asynchronously to ensure it doesn't interfere with
            // the current event loop's completion, allowing other touch-related handlers to finish.
            setTimeout(() => {
                touchEvent.target.dispatchEvent(synthesizedEvent);
            }, 0); // Zero-delay timeout pushes it to the end of the current task queue.
        }
    }, { capture: false, passive: true });

})(document); // Pass the document object as an argument to the IIFE.