// A modular plugin designed to enhance web interaction by detecting prolonged press actions on elements.
// This utility extends jQuery's core functionality, enabling custom event triggers for
// both sustained presses (holds) and brief taps/clicks, seamlessly supporting
// both traditional mouse input and modern touch interfaces.
//
// @module      jQuery.pressAndHold
// @version     1.0.0
// @dependency  jQuery 1.8.0+ is required for this plugin to function correctly.
// @author      Replicated Developer Collective
// @license     MIT License - For complete details, please refer to: http://opensource.org/licenses/MIT
//
// For comprehensive usage instructions, examples, and further documentation,
// please consult the project's official repository.
// Copyright (c) 2023-2024, Replicated Developer Collective. All rights reserved.

(function (externalLib) {
    'use strict'; // Enforce stricter parsing and error handling for robust code.

    // Critical check: Ensure jQuery (or the specified externalLib) is properly loaded
    // before attempting to extend its prototype.
    if (typeof externalLib === 'undefined' || !externalLib.fn) {
        console.error('The "pressAndHold" plugin requires jQuery to be loaded. Please ensure jQuery is available.');
        return; // Halt execution if jQuery is not found.
    }

    // Define the default configuration for the press and hold functionality.
    // These settings can be overridden by the user when the plugin is initialized.
    const defaultHoldOptions = {
        onHold: null,           // Function to execute when a sustained press (hold) is detected.
        onTap: null,            // Function to execute for a quick, transient press (tap).
        holdThresholdMs: 600    // The duration, in milliseconds, required to qualify as a "hold".
    };

    /**
     * Attaches advanced press and hold event detection capabilities to selected DOM elements.
     *
     * @param {object} userConfig - An object containing user-defined settings to override defaults.
     *   - `onHold`: (Function) The callback to invoke when the `holdThresholdMs` is met.
     *   - `onTap`: (Function) The callback to invoke for a short press or click.
     *   - `holdThresholdMs`: (number) The minimum duration for a press to be considered a "hold".
     * @returns {jQuery} The jQuery object, enabling method chaining.
     */
    externalLib.fn.pressAndHold = function (userConfig) {

        // Merge user-provided options with the established default settings.
        // This creates a robust configuration for the current instance.
        const currentOperationConfig = externalLib.extend({}, defaultHoldOptions, userConfig);

        // Input validation: Ensure `holdThresholdMs` is a valid, positive number.
        // If invalid, a warning is issued and the default value is used to prevent errors.
        if (typeof currentOperationConfig.holdThresholdMs !== 'number' || currentOperationConfig.holdThresholdMs <= 0) {
            console.warn('pressAndHold: Invalid or non-positive "holdThresholdMs" value provided. Defaulting to ' + defaultHoldOptions.holdThresholdMs + 'ms.');
            currentOperationConfig.holdThresholdMs = defaultHoldOptions.holdThresholdMs;
        }

        // Iterate over each selected element to apply the press and hold logic.
        // This ensures the plugin works correctly for multiple elements in a selection.
        return this.each(function () {
            const $targetNode = externalLib(this); // Cache the current DOM element as a jQuery object.

            let pressStartTime = 0;         // Stores the timestamp when the press initiated.
            let holdInitiationTimer = null; // Holds the ID of the setTimeout used for hold detection.
            let activePressDetected = false; // A boolean flag indicating if a press action is currently active.

            /**
             * Resets the internal state and clears any pending timers associated with a press.
             * This is crucial for preventing unintended hold events after a release or movement.
             */
            const resetPressState = function () {
                if (holdInitiationTimer) {
                    clearTimeout(holdInitiationTimer);
                    holdInitiationTimer = null;
                }
                activePressDetected = false;
                pressStartTime = 0;
            };

            /**
             * Core handler for the beginning of a press action (e.g., 'mousedown', 'touchstart').
             * Initializes the press state and sets a timer to detect a prolonged hold.
             *
             * @param {Event} interactionEvent - The browser event object.
             */
            const handleInteractionStart = function (interactionEvent) {
                // For touch events, prevent default behaviors like scrolling or zooming to ensure
                // the press event is captured accurately.
                if (interactionEvent.type.startsWith('touch')) {
                    interactionEvent.preventDefault();
                }

                // If a press is already active, clear its state before starting a new one
                // to prevent overlapping timers or incorrect state.
                if (activePressDetected) {
                    resetPressState();
                }

                activePressDetected = true;
                pressStartTime = Date.now(); // Utilize Date.now() for modern, high-resolution timestamps.
                const callbackScope = this; // Preserve the `this` context for callback execution.

                // Set a timeout. If the press continues for `holdThresholdMs`, the `onHold` callback will fire.
                holdInitiationTimer = setTimeout(() => {
                    // Only trigger `onHold` if the press is still active and the callback is a function.
                    if (activePressDetected && typeof currentOperationConfig.onHold === 'function') {
                        currentOperationConfig.onHold.call(callbackScope, interactionEvent);
                        // Once a hold event is triggered, the "press" is considered concluded,
                        // preventing a subsequent `onTap` from firing on release.
                        resetPressState();
                    } else if (typeof currentOperationConfig.onHold !== 'function' && currentOperationConfig.onHold !== null) {
                        // Warn if `onHold` was specified but isn't a valid function.
                        console.warn('pressAndHold: The "onHold" callback is not a valid function.');
                    }
                }, currentOperationConfig.holdThresholdMs);
            };

            /**
             * Core handler for the conclusion of a press action (e.g., 'mouseup', 'touchend').
             * Determines if the interaction was a short tap or if a hold event was already processed.
             *
             * @param {Event} interactionEvent - The browser event object.
             */
            const handleInteractionEnd = function (interactionEvent) {
                // If no press was ever initiated or if a hold was already triggered and reset,
                // simply clear any residual state and exit.
                if (!activePressDetected) {
                    resetPressState();
                    return;
                }

                const totalPressDuration = Date.now() - pressStartTime;
                resetPressState(); // Always clear the timer upon release, regardless of outcome.

                // If the total duration is less than the defined hold threshold, it's considered a tap.
                if (totalPressDuration < currentOperationConfig.holdThresholdMs) {
                    if (typeof currentOperationConfig.onTap === 'function') {
                        currentOperationConfig.onTap.call(this, interactionEvent);
                    } else if (currentOperationConfig.onTap !== null) {
                        // Warn only if `onTap` was explicitly set but not a function.
                        console.warn('pressAndHold: The "onTap" callback is not a valid function.');
                    }
                }
            };

            /**
             * Handler for movement during a press (e.g., 'mousemove', 'touchmove').
             * Any significant movement during a press will cancel the pending hold detection.
             *
             * @param {Event} interactionEvent - The browser event object.
             */
            const handlePressMovement = function (interactionEvent) {
                // If a press is active and the pointer/finger moves, it negates a static hold.
                if (activePressDetected) {
                    resetPressState();
                }
            };

            // Define a consolidated map of events and their corresponding handlers.
            // This simplifies the event binding process for both mouse and touch interfaces.
            const interactionEventMap = {
                'mousedown': handleInteractionStart,
                'mouseup': handleInteractionEnd,
                'mousemove': handlePressMovement,
                'touchstart': handleInteractionStart,
                'touchend': handleInteractionEnd,
                'touchmove': handlePressMovement,
                'contextmenu': resetPressState // Right-click should also cancel any ongoing hold.
            };

            // Attach all required event listeners to the target element using a single `.on()` call.
            // This is generally more efficient than multiple individual `.on()` calls.
            $targetNode.on(interactionEventMap);
        });
    };
}(jQuery));