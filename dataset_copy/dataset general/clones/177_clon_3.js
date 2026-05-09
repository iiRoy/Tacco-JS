/*
 * Event Sequencer Utility for jQuery -- v2.1.0
 * Copyright 2023, A. Developer
 * Licensed under the MIT License.
 *
 * Inspired by classic animation principles and Ben Nadel's concept.
 *
 * For detailed usage and examples, refer to:
 * https://your-repo.com/docs/event-sequencer.md
*/

(function(jQueryObject){

    // Ensure jQuery is available before proceeding.
    if (!jQueryObject || !jQueryObject.fn || !jQueryObject.fn.jquery) {
        console.error("Event Sequencer requires jQuery to be loaded.");
        return;
    }

    /**
     * Initializes a new event sequencer instance.
     * @param {object} [userPreferences] - Optional configuration overrides.
     * @returns {object} The sequencer control object.
     */
    jQueryObject.timelineScheduler = function(userPreferences) {

        // Core configuration for the scheduler's behavior.
        // These can be partially overridden by userPreferences.
        const appConfig = {
            // Determines how animation steps are rounded to match keyframes.
            // Options: 'floor' (nearest lower interval) or 'round' (nearest interval).
            roundingStrategy: 'floor',

            // The base granularity for keyframe intervals (e.g., 5 for 5%, 10 for 10%).
            // Defaults to 5 for durations >= 500ms; automatically switches to 10 for shorter animations.
            intervalGranularity: 5,

            // Minimum duration for an animation segment before intervalGranularity is forced to 10.
            minDurationForGranularityFive: 500
        };

        // Apply user-provided settings, prioritizing them over defaults.
        if (userPreferences && typeof userPreferences === 'object') {
            Object.assign(appConfig, userPreferences);
        }

        // A discreet DOM element used by jQuery's animation engine to track progress.
        // Its 'top' CSS property is animated from 0 to 100 to represent percentage progress.
        const progressTarget = document.createElement('div');
        // Initial setup for the animation target, ensuring it's off-screen and ready.
        jQueryObject(progressTarget).css({ 'position': 'absolute', 'left': '-9999px', 'top': '0' });

        // Storage for all registered callback functions, indexed by their normalized keyframe identifier.
        // Each key can hold an array of functions, allowing multiple callbacks per point.
        const eventRegistry = {};

        // A log of keyframe points that have already triggered their events during the current sequence run.
        // This prevents re-execution if the animation briefly hovers on a point.
        const triggerHistory = {};

        // Internal state variables for managing the current animation sequence.
        let totalSequenceTime = 0;          // The total duration of the current 'play' cycle.
        let timeRemainingOnPause = 0;       // How much time was left when the sequence was paused.
        let animationProgress = 0;          // The current percentage progress (0-100).
        let isCurrentlyActive = false;      // Flag indicating if the sequencer is actively playing.

        // The public interface object that will be returned to the user.
        let timelineController;

        /**
         * Normalizes an input percentage (e.g., "50%", 50) into a consistent key identifier "atXX".
         * @param {string|number} inputKey - The percentage point, e.g., "25%" or 75.
         * @returns {string|boolean} A normalized key string like "at25", or false if invalid.
         */
        const createNormalizedKey = function(inputKey) {
            if (typeof inputKey === 'string' && inputKey.endsWith('%')) {
                inputKey = inputKey.slice(0, -1);
            }
            const numericValue = parseInt(inputKey, 10);

            // Ensure the value is a valid number within the 0-100 range.
            if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
                console.warn(`Invalid keyframe percentage: ${inputKey}. Must be a number between 0 and 100.`);
                return false;
            }
            return "at" + numericValue;
        };

        // Define the public methods of the timeline controller.
        return timelineController = {

            /**
             * Indicates whether the sequencer is currently running an animation.
             * @type {boolean}
             */
            isCurrentlyActive: false, // This will be updated dynamically

            /**
             * Registers a callback function to be executed at a specific percentage point in the timeline.
             * If multiple functions are registered for the same point, they will all be executed in order of registration.
             * @param {string|number} percentagePoint - The timeline percentage (0-100) at which to trigger the callback.
             * @param {function} callbackFunction - The function to execute.
             */
            registerEventPoint: function(percentagePoint, callbackFunction) {
                const eventKey = createNormalizedKey(percentagePoint);

                // Basic validation for inputs.
                if (!eventKey) {
                    console.error("Failed to register event: Invalid percentage point provided.");
                    return;
                }
                if (typeof callbackFunction !== 'function') {
                    console.error(`Failed to register event for ${percentagePoint}: Callback must be a function.`);
                    return;
                }

                // Initialize an array for this key if it doesn't exist, then add the function.
                if (!eventRegistry[eventKey]) {
                    eventRegistry[eventKey] = [];
                }
                eventRegistry[eventKey].push(callbackFunction);
            },

            /**
             * Unregisters all callback functions associated with a specific percentage point.
             * @param {string|number} percentagePoint - The timeline percentage from which to remove events.
             */
            unregisterEventPoint: function(percentagePoint) {
                const eventKey = createNormalizedKey(percentagePoint);
                if (eventKey && eventRegistry.hasOwnProperty(eventKey)) {
                    delete eventRegistry[eventKey];
                } else if (!eventKey) {
                    console.warn(`Attempted to unregister event with invalid percentage point: ${percentagePoint}.`);
                }
            },

            /**
             * Registers multiple event points and their callbacks from a map object.
             * @param {object} eventDefinitions - An object where keys are percentage points (e.g., "25%")
             *                                   and values are the callback functions.
             */
            registerEventMap: function(eventDefinitions) {
                if (!eventDefinitions || typeof eventDefinitions !== 'object') {
                    console.error("Failed to register event map: Input must be an object.");
                    return;
                }

                // Iterate over the provided map and register each event individually.
                for (const definitionKey in eventDefinitions) {
                    if (eventDefinitions.hasOwnProperty(definitionKey)) { // Ensure it's an own property
                        const currentCallback = eventDefinitions[definitionKey];
                        // Validate and add each key-function pair.
                        if (typeof currentCallback === "function") {
                            this.registerEventPoint(definitionKey, currentCallback);
                        } else {
                            console.warn(`Skipping invalid entry for key '${definitionKey}': Value is not a function.`);
                        }
                    }
                }
            },

            /**
             * Retrieves a copy of the currently registered event map for inspection.
             * @returns {object} A deep clone of the event registry.
             */
            getRegisteredEvents: function() {
                // Return a deep copy to prevent external modification of the internal state.
                return JSON.parse(JSON.stringify(eventRegistry));
            },

            /**
             * Resets the sequencer to its initial state, clearing progress and execution history.
             * Does not remove registered event points.
             */
            resetState: function() {
                // Reset internal tracking variables to their defaults.
                totalSequenceTime = 0;
                timeRemainingOnPause = 0;
                animationProgress = 0;
                // Clear the log of executed keyframes for a fresh start.
                for (const prop in triggerHistory) {
                    if (triggerHistory.hasOwnProperty(prop)) {
                        delete triggerHistory[prop];
                    }
                }

                // Explicitly set the animation progress target back to 0.
                jQueryObject(progressTarget).css('top', 0);
            },

            /**
             * Pauses the currently active sequence at its current progress point.
             * Note: This only pauses the sequencer itself, not any animations or processes
             * initiated by the keyframe callbacks.
             */
            pauseSequence: function() {
                if (!isCurrentlyActive) {
                    console.warn("Attempted to pause a sequencer that is not currently active.");
                    return;
                }

                timelineController.isCurrentlyActive = false; // Update public flag
                isCurrentlyActive = false; // Update internal flag

                // Calculate the remaining duration based on current progress.
                const elapsedTime = Math.round(totalSequenceTime * (animationProgress / 100));
                timeRemainingOnPause = totalSequenceTime - elapsedTime;

                // Stop the jQuery animation on the progress target, clearing its queue.
                jQueryObject(progressTarget).stop(true, false);
            },

            /**
             * Starts or resumes the event sequence.
             * If paused, it continues from where it left off.
             * @param {number} [sequenceDuration=500] - The total duration of the sequence in milliseconds.
             * @param {function} [completionCallback] - An optional function to execute when the sequence finishes.
             */
            startSequence: function(sequenceDuration = 500, completionCallback) {

                // Prevent starting if already active.
                if (isCurrentlyActive) {
                    console.info("Sequencer is already active. Ignoring start request.");
                    return;
                }

                // Update public and internal active flags.
                timelineController.isCurrentlyActive = true;
                isCurrentlyActive = true;

                // Ensure duration is a positive integer.
                const validatedDuration = Math.max(0, parseInt(sequenceDuration, 10));
                if (isNaN(validatedDuration) || validatedDuration === 0) {
                    console.error("Invalid sequence duration provided. Must be a positive number.");
                    isCurrentlyActive = false;
                    timelineController.isCurrentlyActive = false;
                    return;
                }

                // Determine effective granularity for this run.
                let effectiveGranularity = appConfig.intervalGranularity;
                if (validatedDuration < appConfig.minDurationForGranularityFive) {
                    // For short durations, always use a coarser 10% interval to avoid too many steps.
                    effectiveGranularity = 10;
                }

                let currentAnimationDuration = validatedDuration;

                // If resuming from a pause, adjust the duration and initial progress.
                if (timeRemainingOnPause > 0) {
                    currentAnimationDuration = timeRemainingOnPause;
                    // Set the animation target's starting 'top' value to the last known progress.
                    jQueryObject(progressTarget).css('top', animationProgress);
                    // Reset remaining time as it's now being used.
                    timeRemainingOnPause = 0;
                } else {
                    // If starting fresh, clear any previous progress and execution history.
                    this.resetState();
                }

                // Store the full duration for potential pause calculations.
                totalSequenceTime = validatedDuration;

                // Register the optional completion callback as a 100% keyframe.
                if (typeof completionCallback === "function") {
                    this.registerEventPoint('100%', completionCallback);
                }

                // Initiate the jQuery animation.
                jQueryObject(progressTarget).animate({'top': '100'}, {
                    duration: currentAnimationDuration,
                    easing: 'linear', // Ensure consistent progress.

                    // This function is called for each animation step.
                    step: function(currentValue, animationTween) {
                        animationProgress = currentValue; // Update current progress.

                        // Apply rounding based on configuration and effective granularity.
                        let roundedProgressValue;
                        if (appConfig.roundingStrategy === "round") {
                            roundedProgressValue = Math.round(currentValue / effectiveGranularity) * effectiveGranularity;
                        } else {
                            roundedProgressValue = Math.floor(currentValue / effectiveGranularity) * effectiveGranularity;
                        }

                        // Generate the key for the current rounded progress.
                        const currentEventKey = createNormalizedKey(roundedProgressValue);

                        // Check if this keyframe has registered events and hasn't been triggered yet in this run.
                        if (currentEventKey && eventRegistry[currentEventKey] && !triggerHistory.hasOwnProperty(currentEventKey)) {
                            // Mark this keyframe as executed to prevent re-triggering.
                            triggerHistory[currentEventKey] = true;

                            // Execute all registered functions for this keyframe.
                            eventRegistry[currentEventKey].forEach(func => {
                                try {
                                    func();
                                } catch (e) {
                                    console.error(`Error executing callback for keyframe ${currentEventKey}:`, e);
                                }
                            });
                        }
                    },

                    // Callback when the animation completes.
                    complete: function() {
                        // Reset flags and state after completion.
                        timelineController.isCurrentlyActive = false;
                        isCurrentlyActive = false;
                        timelineController.resetState();
                    }
                });
            },

            /**
             * Cleans up the sequencer instance, removing its DOM element and clearing references.
             * This should be called when the sequencer is no longer needed to prevent memory leaks.
             */
            destroy: function() {
                if (isCurrentlyActive) {
                    this.pauseSequence(); // Stop any ongoing animation first.
                }
                jQueryObject(progressTarget).remove(); // Remove the dummy div from the DOM.
                // Clear the event registry
                for (const key in eventRegistry) {
                    if (eventRegistry.hasOwnProperty(key)) {
                        delete eventRegistry[key];
                    }
                }
                // Clear trigger history
                for (const prop in triggerHistory) {
                    if (triggerHistory.hasOwnProperty(prop)) {
                        delete triggerHistory[prop];
                    }
                }
                // Nullify references to aid garbage collection
                totalSequenceTime = 0;
                timeRemainingOnPause = 0;
                animationProgress = 0;
            }
        };
    };
})(jQuery);