// This module provides a robust solution for eliminating the common 300ms click delay
// on touch-enabled devices. It achieves this by intercepting touch events and
// executing a custom callback immediately upon touch release, while also
// actively suppressing any subsequent "ghost" click events that browsers might generate.
//
// Inspired by various fast-tap implementations, including:
// - http://cubiq.org/remove-onclick-delay-on-webkit-for-iphone
// - Techniques for robust touch detection and event management.
//
// The underlying principle involves:
// 1. Preventing default browser actions on 'touchstart' to avoid delays.
// 2. Tracking touch movement to differentiate between a tap and a drag.
// 3. Executing a user-defined function on 'touchend' if no significant movement occurred.
// 4. Suppressing native 'click' events that might fire after our custom handler.

/**
 * @class TapInterceptor
 * @description Creates an instance that intercepts touch and click events on a specified
 *              DOM element to provide an immediate tap response, bypassing the 300ms delay.
 * @param {HTMLElement|string} domElementRef - The HTML element object or its ID string
 *                                             to which the tap interception should apply.
 * @param {Function} tapActionCallback - The function to be executed when a tap is detected.
 *                                     It receives the actual tapped element as its first argument.
 */
function TapInterceptor(domElementRef, tapActionCallback) {
    // Basic input validation: Ensure we have a valid element reference and a callable function.
    if (!domElementRef || !tapActionCallback || typeof tapActionCallback !== 'function') {
        console.error("TapInterceptor initialization error: Invalid DOM element reference or callback function.");
        // Optionally throw an error: throw new Error("Invalid TapInterceptor arguments.");
        return;
    }

    // Resolve the DOM element from the provided reference.
    this.monitoredElement = (typeof domElementRef === 'object' && domElementRef instanceof Element)
                            ? domElementRef
                            : document.getElementById(domElementRef);

    if (!this.monitoredElement) {
        console.error("TapInterceptor initialization error: Could not find element for reference:", domElementRef);
        return;
    }

    // Store the client's custom function to be invoked on tap.
    this.onTapTriggered = tapActionCallback;

    // Internal state management for the current touch interaction.
    this.hasDragged = false; // Flag to indicate if the touch has moved significantly.
    this.activatedTarget = null; // The specific element that was initially touched.
    this.activeTouchIdentifier = null; // Unique ID for tracking a single touch across events.
    
    // Attach the primary event listeners to the monitored element.
    // By passing 'this', the `handleEvent` method on the prototype will be invoked.
    this.monitoredElement.addEventListener('touchstart', this, false);
    this.monitoredElement.addEventListener('click', this, false); // For ghost click suppression.

    // Optionally, add a marker class to the element for debugging/styling purposes.
    // this.monitoredElement.classList.add('tap-interceptor-active');
}

/**
 * @description Prototype methods for the TapInterceptor class.
 *              These methods manage the lifecycle of touch and click events.
 */
TapInterceptor.prototype = {
    /**
     * @method handleEvent
     * @description A universal event handler that dispatches events to specific methods
     *              based on their type. This is used when 'this' is passed as an
     *              event listener (standard DOM API behavior).
     * @param {Event} eventData - The event object dispatched by the browser.
     */
    handleEvent: function(eventData) {
        switch (eventData.type) {
            case 'touchstart':  this.processTouchBegin(eventData); break;
            case 'touchmove':   this.processTouchDrag(eventData);  break;
            case 'touchend':    this.processTouchRelease(eventData); break;
            case 'click':       this.blockGhostClick(eventData); break;
            // No default needed as we only listen for these specific types.
        }
    },

    /**
     * @method processTouchBegin
     * @description Handles the 'touchstart' event. It prevents default browser actions,
     *              identifies the initial target, and sets up state for tracking.
     * @param {TouchEvent} eventData - The touchstart event object.
     */
    processTouchBegin: function(eventData) {
        // Stop the browser's default handling (e.g., scrolling, zooming) and event propagation.
        eventData.preventDefault();
        eventData.stopPropagation();

        // Only process single-touch gestures for a simple tap.
        if (eventData.touches.length !== 1) {
            this.resetInteractionState(); // Clear state if multi-touch detected.
            return;
        }

        this.hasDragged = false; // Reset drag flag.
        // Store a unique identifier for this touch to ensure we track the same finger.
        this.activeTouchIdentifier = eventData.targetTouches[0].identifier;

        // Determine the precise element under the initial touch point.
        // `elementFromPoint` is often more accurate for nested elements than `eventData.target`.
        this.activatedTarget = document.elementFromPoint(
            eventData.targetTouches[0].clientX,
            eventData.targetTouches[0].clientY
        );

        // If the target is a text node (e.g., direct text content), use its parent element.
        if (this.activatedTarget && this.activatedTarget.nodeType === Node.TEXT_NODE) {
            this.activatedTarget = this.activatedTarget.parentNode;
        }

        // Apply visual feedback (e.g., a "pressed" style) if a valid target is found.
        if (this.activatedTarget) {
            this.activatedTarget.classList.add('is-active-tap');
        }

        // Dynamically add 'touchmove' and 'touchend' listeners.
        // These are added to the *monitoredElement* to keep event scope consistent.
        this.monitoredElement.addEventListener('touchmove', this, false);
        this.monitoredElement.addEventListener('touchend', this, false);
    },

    /**
     * @method processTouchDrag
     * @description Handles the 'touchmove' event. If movement is detected, it flags
     *              the interaction as a drag and removes any visual feedback.
     * @param {TouchEvent} eventData - The touchmove event object.
     */
    processTouchDrag: function(eventData) {
        // Ensure this event belongs to the touch we are currently tracking.
        if (eventData.changedTouches[0].identifier !== this.activeTouchIdentifier) {
            return;
        }

        this.hasDragged = true; // Mark that movement has occurred.

        // Immediately remove the "pressed" visual feedback if the finger moves.
        if (this.activatedTarget) {
            this.activatedTarget.classList.remove('is-active-tap');
        }
    },

    /**
     * @method processTouchRelease
     * @description Handles the 'touchend' event. If no significant movement occurred,
     *              it triggers the custom tap action. Cleans up event listeners and state.
     * @param {TouchEvent} eventData - The touchend event object.
     */
    processTouchRelease: function(eventData) {
        eventData.preventDefault(); // Prevent default browser actions.
        eventData.stopPropagation(); // Stop event propagation.

        // Ensure this event belongs to the touch we are currently tracking.
        if (eventData.changedTouches[0].identifier !== this.activeTouchIdentifier) {
            this.resetInteractionState(); // Clear state if touch ID mismatch.
            return;
        }

        // Remove the temporary 'touchmove' and 'touchend' listeners.
        this.monitoredElement.removeEventListener('touchmove', this, false);
        this.monitoredElement.removeEventListener('touchend', this, false);

        // If it was a genuine tap (no drag) and we have a valid target:
        if (!this.hasDragged && this.activatedTarget) {
            // Remove the visual feedback class.
            this.activatedTarget.classList.remove('is-active-tap');
            // Execute the client's custom tap callback.
            this.onTapTriggered(this.activatedTarget);
        }

        // Reset all internal state variables for the next interaction.
        this.resetInteractionState();
    },
    
    /**
     * @method blockGhostClick
     * @description Handles the native 'click' event. Its primary purpose is to
     *              prevent the browser's default (and delayed) click event from firing
     *              after our custom tap handler has already executed. This eliminates
     *              "ghost clicks".
     * @param {MouseEvent} eventData - The click event object.
     */
    blockGhostClick: function(eventData) {
        eventData.stopPropagation(); // Prevent event bubbling.
        eventData.preventDefault();  // Stop the browser's default click action.
        return false;                // Explicitly return false for maximum compatibility.
    },

    /**
     * @method resetInteractionState
     * @description Resets all internal flags and references related to a touch interaction.
     *              This ensures a clean state for subsequent touches.
     */
    resetInteractionState: function() {
        // If the 'is-active-tap' class was applied, remove it during cleanup.
        if (this.activatedTarget && this.activatedTarget.classList.contains('is-active-tap')) {
            this.activatedTarget.classList.remove('is-active-tap');
        }
        this.hasDragged = false;
        this.activatedTarget = null;
        this.activeTouchIdentifier = null;

        // Ensure all temporary listeners are removed, even if an interaction was aborted.
        this.monitoredElement.removeEventListener('touchmove', this, false);
        this.monitoredElement.removeEventListener('touchend', this, false);
    }

    // Optional: A `destroy` method could be added here to completely unbind all
    // listeners and free up resources if the TapInterceptor instance is no longer needed.
    // destroy: function() {
    //     this.monitoredElement.removeEventListener('touchstart', this, false);
    //     this.monitoredElement.removeEventListener('click', this, false);
    //     this.resetInteractionState(); // Ensure all temporary listeners are removed.
    //     // Remove marker class if it was added.
    //     // if (this.monitoredElement.classList.contains('tap-interceptor-active')) {
    //     //     this.monitoredElement.classList.remove('tap-interceptor-active');
    //     // }
    //     this.monitoredElement = null;
    //     this.onTapTriggered = null;
    // }
};