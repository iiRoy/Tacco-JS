// A custom jQuery extension for enhanced hover functionality.
// This module provides a "slow hover" or "focus on hover" effect,
// similar to the standard .hover() but with a delay and sensitivity threshold.
// It ensures that the 'over' action only fires when the mouse has
// settled over an element, preventing accidental triggers during quick passes.

(function($) {
    "use strict"; // Enforce stricter parsing and error handling for better code quality.

    // The main plugin method, attached to jQuery's prototype.
    // Allows for various ways to configure:
    // .focusOnHover( enterCallback, exitCallback )
    // .focusOnHover( enterAndExitCallback )
    // .focusOnHover( enterCallback, exitCallback, targetSelector )
    // .focusOnHover( configObject )
    $.fn.focusOnHover = function(enterAction, exitAction, targetSelector) {

        // Default configuration values for the hover behavior.
        const defaultSettings = {
            checkDelayMs: 100,      // Milliseconds between mouse position checks during entry.
            movementThreshold: 6,   // Maximum pixels mouse can move before a hover is reset.
            exitDelayMs: 0,         // Milliseconds to wait before firing the 'out' action.
            onHoverEnter: null,     // Function to execute when a sustained hover is established.
            onHoverExit: null,      // Function to execute when hover ends after 'onHoverEnter' fired.
            delegateSelector: null  // Optional selector for event delegation (e.g., ".item").
        };

        // Initialize current configuration by copying default settings.
        let currentConfig = { ...defaultSettings };

        // Determine the actual configuration based on the provided arguments.
        if (typeof enterAction === "object" && enterAction !== null) {
            // Case 1: A configuration object was provided (e.g., .focusOnHover({ checkDelayMs: 50, ... })).
            // Merge the provided object with the default settings.
            currentConfig = $.extend(currentConfig, enterAction);
        } else if (typeof exitAction === "function") {
            // Case 2: Two functions provided (enterAction, exitAction) for hover over and out.
            // The third argument, if present, is the delegation selector.
            currentConfig.onHoverEnter = enterAction;
            currentConfig.onHoverExit = exitAction;
            currentConfig.delegateSelector = targetSelector;
        } else {
            // Case 3: A single function provided (used for both enter and exit) OR
            // enterAction and a selector (where exitAction is undefined or not a function).
            currentConfig.onHoverEnter = enterAction;
            currentConfig.onHoverExit = enterAction; // Use the same function for both enter and exit.
            currentConfig.delegateSelector = exitAction; // The second argument is the selector here.
        }

        // Validate that the hover enter/exit callbacks are actual functions.
        // If not, replace them with a no-operation function to prevent runtime errors.
        if (typeof currentConfig.onHoverEnter !== 'function') {
            currentConfig.onHoverEnter = $.noop;
        }
        if (typeof currentConfig.onHoverExit !== 'function') {
            currentConfig.onHoverExit = $.noop;
        }

        // Internal variables to track mouse position across checks.
        // `currentX`, `currentY`: The most recent mouse coordinates captured by `mousemove`.
        // `previousX`, `previousY`: Mouse coordinates from the last successful position check.
        let currentX, currentY, previousX, previousY;

        // Private utility function to update the current mouse position.
        // This function is bound to the `mousemove` event to continuously track the pointer.
        const updateCurrentMousePosition = (eventData) => {
            currentX = eventData.pageX;
            currentY = eventData.pageY;
        };

        // Private function to evaluate if the mouse has settled enough to trigger the 'over' action.
        // This function is called repeatedly by a timer during the hover-in detection phase.
        const evaluateHoverCondition = (eventCopy, elementContext) => {
            // Clear any previously set timer for this element to prevent multiple concurrent checks.
            if (elementContext.activityTimer) {
                elementContext.activityTimer = clearTimeout(elementContext.activityTimer);
            }

            // Calculate the Euclidean distance the mouse has moved since the last check.
            const distanceMoved = Math.hypot(previousX - currentX, previousY - currentY);

            // If the mouse has moved less than the configured sensitivity threshold,
            // it indicates that the mouse has "settled" over the element.
            if (distanceMoved < currentConfig.movementThreshold) {
                // Mouse has settled:
                // 1. Unbind the continuous `mousemove` tracking, as it's no longer needed for entry.
                $(elementContext).off("mousemove.focusOnHover", updateCurrentMousePosition);
                // 2. Set an internal flag indicating that the element is now officially "hovered".
                elementContext.hoverStateFlag = true;
                // 3. Execute the 'onHoverEnter' callback in the context of the element,
                //    passing a copy of the event object.
                return currentConfig.onHoverEnter.call(elementContext, eventCopy);
            } else {
                // Mouse is still moving too much or outside the threshold:
                // 1. Update the 'previous' coordinates to the current position for the next check.
                previousX = currentX;
                previousY = currentY;
                // 2. Reschedule this function to run again after `checkDelayMs`.
                elementContext.activityTimer = setTimeout(
                    () => evaluateHoverCondition(eventCopy, elementContext),
                    currentConfig.checkDelayMs
                );
            }
        };

        // Private function to manage the delayed execution of the 'out' action.
        // This is triggered when the mouse leaves an element that was actively hovered.
        const initiateExitSequence = (eventCopy, elementContext) => {
            // Clear any active timer associated with this element to prevent conflicts.
            if (elementContext.activityTimer) {
                elementContext.activityTimer = clearTimeout(elementContext.activityTimer);
            }

            // Reset the internal hover state flag for this element.
            elementContext.hoverStateFlag = false;

            // Execute the 'onHoverExit' callback in the context of the element.
            return currentConfig.onHoverExit.call(elementContext, eventCopy);
        };

        // The primary event handler for both `mouseenter` and `mouseleave` events.
        // This function orchestrates the hover detection and exit sequences.
        const manageElementInteraction = (triggerEvent) => {
            // Create a shallow copy of the original event object. This is crucial
            // because jQuery often reuses event objects, and we need a stable reference
            // for asynchronous operations (like `setTimeout`).
            const eventCopy = { ...triggerEvent };
            // 'this' refers to the DOM element on which the event occurred.
            const targetElement = this;

            // Always clear any pending timer when a new hover event (enter or leave) occurs.
            // This prevents race conditions and ensures a clean state for the new event.
            if (targetElement.activityTimer) {
                targetElement.activityTimer = clearTimeout(targetElement.activityTimer);
            }

            // Handle the `mouseenter` event type.
            if (triggerEvent.type === "mouseenter") {
                // Initialize the 'previous' coordinates with the mouse's position upon entry.
                previousX = eventCopy.pageX;
                previousY = eventCopy.pageY;

                // Start tracking the current mouse position by binding `updateCurrentMousePosition`
                // to the `mousemove` event. This is an "expensive" event, so it's only active
                // during the initial hover entry detection phase.
                $(targetElement).on("mousemove.focusOnHover", updateCurrentMousePosition);

                // If the element is not already in a "hovered" state (e.g., re-entering quickly,
                // or initial entry), then begin the polling process to evaluate hover condition.
                if (!targetElement.hoverStateFlag) {
                    targetElement.activityTimer = setTimeout(
                        () => evaluateHoverCondition(eventCopy, targetElement),
                        currentConfig.checkDelayMs
                    );
                }

            } else { // Handle the `mouseleave` event type.
                // Immediately stop tracking mouse movement once the mouse leaves the element.
                $(targetElement).off("mousemove.focusOnHover", updateCurrentMousePosition);

                // If the element was genuinely in a "hovered" state (meaning `onHoverEnter`
                // had previously fired), then initiate the delayed exit sequence.
                if (targetElement.hoverStateFlag) {
                    targetElement.activityTimer = setTimeout(
                        () => initiateExitSequence(eventCopy, targetElement),
                        currentConfig.exitDelayMs
                    );
                }
            }
        };

        // Bind the primary event handler to both `mouseenter` and `mouseleave` events.
        // The events are namespaced with `.focusOnHover` to allow for easy unbinding later.
        // Event delegation is used if a `delegateSelector` is provided in the configuration.
        return this.on(
            {
                'mouseenter.focusOnHover': manageElementInteraction,
                'mouseleave.focusOnHover': manageElementInteraction
            },
            currentConfig.delegateSelector
        );
    };
})(jQuery);