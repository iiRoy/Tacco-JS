"use strict";

// Screencast application module augmentation.
// This module provides functionalities for viewing interactive screencasts.

// @param   scApp        The core screencast application object to extend.
// @param   jq           jQuery library instance.
// @returns The scApp object, now enhanced with the screencast player module.

(function(scApp, jq) {
    // Ensure both scApp and jQuery are available before proceeding.
    if (!scApp || !jq) {
        console.error("Screencast Player: Missing dependencies (scApp or jQuery).");
        return;
    }

    // Main player component encapsulates all viewer logic.
    const screencastPlayer = (() => {

        // Public API for the player component.
        const playerAPI = {};

        // Configuration constants for the player.
        const playerConfig = {
            hashCheckIntervalMs: 150, // How often to check URL hash if onhashchange is not supported.
            defaultPlaybackDelay: 5000 // Default delay for auto-advance if not specified.
        };

        /**
         * Represents a single screencast presentation instance.
         * Manages state, events, and playback logic.
         * @param {string} domContainerId - CSS selector for the main player container.
         * @param {object} urlParameters - Key-value pairs from URL query string.
         */
        const ScreencastPresenter = function(domContainerId, urlParameters) {

            /* Private members and internal utilities */

            let presentationData = null; // Holds the parsed screencast JSON.
            const containerElement = domContainerId; // Selector for the player's root DOM element.

            /**
             * Parses a playback option from URL parameters, providing a fallback.
             * Supports 'auto', 'autoplay', 'autostart', 'autoloop' with boolean or numeric values.
             * @param {string} optionKey - The name of the option to parse (e.g., 'autoplay').
             * @param {number|boolean} fallbackValue - The default value if the option is not found or invalid.
             * @returns {number|boolean} The parsed option value.
             */
            const getPlaybackSetting = (optionKey, fallbackValue) => {
                let paramValue = urlParameters[optionKey];

                if (paramValue === null || paramValue === undefined) {
                    // Fallback to generic 'auto' if specific option not found.
                    if (optionKey === 'auto') {
                        return false; // Default 'auto' behavior is off.
                    } else {
                        return getPlaybackSetting('auto', fallbackValue);
                    }
                }

                if (typeof paramValue === 'string') {
                    const lowerCaseValue = paramValue.toLowerCase();
                    if (lowerCaseValue === 'false') {
                        return false;
                    }
                    if (lowerCaseValue === 'true') {
                        return true; // Treat '?autoplay' or '?autoplay=true' as true
                    }
                }

                // Attempt to parse as integer for delay values.
                const intValue = parseInt(paramValue, 10);
                if (!isNaN(intValue) && intValue >= 0) {
                    return intValue;
                }

                // If parsing fails, return the fallback.
                return fallbackValue;
            };

            // Playback timing and control settings.
            const delayBetweenSteps = getPlaybackSetting('autoplay', playerConfig.defaultPlaybackDelay); // Delay before auto-advancing to next step.
            const initialDelay = getPlaybackSetting('autostart', playerConfig.defaultPlaybackDelay);   // Delay before starting the first step on load.
            const loopPresentation = getPlaybackSetting('autoloop', false);                           // Whether to restart from beginning after last step.

            // Centralized event management for decoupling components.
            const eventHub = (() => {
                const hub = {};

                /**
                 * Creates a custom event channel using jQuery.Callbacks.
                 * @returns {object} An object with publish, subscribe, unsubscribe methods.
                 */
                const makeEventChannel = () => {
                    const eventCallbacks = jq.Callbacks();
                    return {
                        publish: eventCallbacks.fire,
                        subscribe: eventCallbacks.add,
                        unsubscribe: eventCallbacks.remove,
                        clearAll: eventCallbacks.empty
                    };
                };

                // Define all event channels.
                hub.onAdvance = makeEventChannel();           // Triggered when user/autoplay requests next step.
                hub.onRecede = makeEventChannel();            // Triggered when user requests previous step.
                hub.onStepFinished = makeEventChannel();      // Triggered when an individual action completes.
                hub.onStepInitiated = makeEventChannel();     // Triggered when an individual action begins.
                hub.onAllStepsComplete = makeEventChannel();  // Triggered when all linked actions for a "click" event are done.

                return hub;
            })();

            /* Presentation state variables */
            let activeStepIndex = 0;      // Index of the action currently being processed.
            let nextStepIndex = 0;        // Index of the action to execute upon the next 'advance' request.
            let runningStepCount = 0;     // Counter for actions currently in progress.
            let lastKnownHash = -1;       // Stores the last observed URL hash for fallback hash change detection.
            let playbackTimer = 0;        // Timer ID for scheduled auto-advances.

            // State management for the presentation.
            let isAnimating = false;      // Flag to indicate if the player is in an automated animation sequence.
            let presentationStarted = false; // Flag to indicate if presentation has started.


            /**
             * Stops all currently running animations and resets event listeners.
             */
            const haltAllActiveSteps = () => {
                jq(containerElement + " .object-list").children().stop(true, true); // Stop all jQuery animations.
                resetEventSubscriptions();
                runningStepCount = 0;
            };

            /**
             * Resets the event hub's subscriptions for dynamic actions.
             * Ensures `onStepInitiated` always has its default handler.
             */
            const resetEventSubscriptions = () => {
                eventHub.onStepInitiated.clearAll();
                eventHub.onStepInitiated.subscribe(handleStepInitiation); // Re-subscribe default handler.
                eventHub.onAllStepsComplete.clearAll();
            };

            /**
             * Handles the 'onAdvance' event, progressing the presentation.
             * Manages sequential and parallel actions based on trigger types.
             */
            const handleAdvanceRequest = () => {
                window.clearTimeout(playbackTimer); // Cancel any pending auto-advance.

                activatePlaybackFeedback(); // Indicate that animation is active.
                haltAllActiveSteps();       // Stop any ongoing animations from previous state.

                const currentTriggeredStep = nextStepIndex; // Store the index for the primary action.
                let processLinkedSteps = true;              // Flag to continue processing 'withPrevious' steps.
                nextStepIndex++;                            // Optimistically advance nextStepIndex.
                activeStepIndex = nextStepIndex;            // Initialize activeStepIndex for the loop.

                // Iterate through actions to determine what to execute next.
                while (presentationData.action[activeStepIndex] && processLinkedSteps) {
                    const currentAction = presentationData.action[activeStepIndex];
                    switch (currentAction.trigger) {
                        case 'onClick':
                            nextStepIndex = activeStepIndex; // Found the next user-triggered step.
                            processLinkedSteps = false;      // Stop processing linked steps.
                            break;
                        case 'withPrevious':
                            // Action executes concurrently with the primary 'onClick' action.
                            const stepIndexRefConcurrent = activeStepIndex;
                            eventHub.onStepInitiated.subscribe(() => {
                                presentationData.action[stepIndexRefConcurrent].execute(eventHub, containerElement);
                            });
                            break;
                        case 'afterPrevious':
                            // Action executes after all 'withPrevious' and primary actions are done.
                            const stepIndexRefSequential = activeStepIndex;
                            eventHub.onAllStepsComplete.subscribe(() => {
                                presentationData.action[stepIndexRefSequential].execute(eventHub, containerElement);
                            });
                            // If 'afterPrevious' is found, the next 'onClick' might be further ahead.
                            // We need to find the actual next 'onClick' action.
                            let tempNext = activeStepIndex;
                            while (presentationData.action[tempNext] && presentationData.action[tempNext].trigger !== 'onClick') {
                                tempNext++;
                            }
                            nextStepIndex = tempNext;
                            processLinkedSteps = false; // Stop processing linked steps, as we've found the next 'onClick' boundary.
                            break;
                    }
                    activeStepIndex++; // Move to the next action in the sequence.
                }

                // Execute the primary action (if one exists for the current trigger point).
                if (presentationData.action[currentTriggeredStep]) {
                    executeStep(presentationData.action[currentTriggeredStep]);
                }

                // Ensure nextStepIndex doesn't exceed the total number of actions.
                if (nextStepIndex > presentationData.action.length) {
                    nextStepIndex = presentationData.action.length;
                }
            };

            /**
             * Handles the 'onRecede' event, moving the presentation backward.
             * Reverses actions until the previous 'onClick' point is reached.
             */
            const handleRecedeRequest = () => {
                haltAllActiveSteps(); // Stop all current animations.
                activeStepIndex = nextStepIndex - 1; // Start from the step *before* the current 'next'.

                // Iterate backward, reversing actions until an 'onClick' trigger is encountered.
                while (activeStepIndex >= 0 && presentationData.action[activeStepIndex] && presentationData.action[activeStepIndex].trigger !== 'onClick') {
                    reverseStepExecution(presentationData.action[activeStepIndex]);
                    activeStepIndex--;
                }

                // Reverse the 'onClick' action itself if one was found.
                if (activeStepIndex >= 0) {
                    reverseStepExecution(presentationData.action[activeStepIndex]);
                }

                // Ensure activeStepIndex doesn't go below zero.
                if (activeStepIndex < 0) {
                    activeStepIndex = 0;
                }
                nextStepIndex = activeStepIndex; // Set the new 'next' point.
            };

            /**
             * Handles the 'onStepFinished' event, decrements the running actions counter.
             * If all actions are complete, it triggers `onAllStepsComplete` and schedules the next auto-advance.
             */
            const handleStepCompletion = () => {
                runningStepCount--;
                if (runningStepCount <= 0) { // All actions for the current trigger point have finished.
                    eventHub.onAllStepsComplete.publish(); // Notify listeners that all linked steps are done.
                    resetEventSubscriptions(); // Clean up dynamic subscriptions.
                    runningStepCount = 0; // Reset counter for safety.

                    // Check for subsequent 'withPrevious' or 'afterPrevious' steps that might have been subscribed.
                    let continueProcessing = true;
                    while (presentationData.action[activeStepIndex] && continueProcessing) {
                        switch (presentationData.action[activeStepIndex].trigger) {
                            case 'onClick':
                                deactivatePlaybackFeedback(); // Ready for user interaction.
                                // Schedule auto-advance if enabled and no actions are running.
                                if (delayBetweenSteps && runningStepCount === 0) {
                                    playbackTimer = window.setTimeout(() => {
                                        eventHub.onAdvance.publish();
                                    }, delayBetweenSteps);
                                }
                                continueProcessing = false; // Stop iterating.
                                return; // Exit early, waiting for next user/auto-advance.
                            case 'withPrevious':
                                // This case should ideally not be hit here if `activeStepIndex` is correctly managed.
                                // It implies `withPrevious` was subscribed but not yet executed.
                                // For robustness, re-subscribe if necessary.
                                const stepIndexRefConcurrent = activeStepIndex;
                                eventHub.onStepInitiated.subscribe(() => {
                                    presentationData.action[stepIndexRefConcurrent].execute(eventHub, containerElement);
                                });
                                break;
                            case 'afterPrevious':
                                // This case means an 'afterPrevious' was scheduled and now it's time to execute it.
                                const stepIndexRefSequential = activeStepIndex;
                                eventHub.onAllStepsComplete.subscribe(() => {
                                    presentationData.action[stepIndexRefSequential].execute(eventHub, containerElement);
                                });
                                activeStepIndex++; // Move past this 'afterPrevious' action.
                                // If there are more 'afterPrevious' actions, they will be handled by subsequent eventHub.onAllStepsComplete publishes.
                                // If the next action is onClick, we need to stop processing this loop.
                                if (presentationData.action[activeStepIndex] && presentationData.action[activeStepIndex].trigger === 'onClick') {
                                    continueProcessing = false;
                                }
                                return; // Let the subscribed 'afterPrevious' action execute and re-trigger completion.
                        }
                        activeStepIndex++;
                    }

                    // If we reached the end of the presentation without finding an 'onClick'.
                    if (activeStepIndex >= presentationData.action.length) {
                        deactivatePlaybackFeedback(); // No more animations.
                        if (loopPresentation && runningStepCount === 0) {
                            window.setTimeout(() => {
                                initializePresentationState(); // Reset to start.
                                initiateAutoPlayback();       // Start again if auto-start is on.
                            }, loopPresentation); // Use loopPresentation delay if it's a number.
                        }
                    }
                }
            };

            /**
             * Handles the 'onStepInitiated' event, increments the running actions counter.
             */
            const handleStepInitiation = () => {
                runningStepCount++;
            };

            /**
             * Activates visual feedback indicating the player is in an automated playback sequence.
             */
            const activatePlaybackFeedback = () => {
                isAnimating = true;
                jq(containerElement + ' .mouse-cursor-pause').hide();
                jq(containerElement + ' .mouse-cursor-normal').show();
            };

            /**
             * Deactivates visual feedback, indicating the player is waiting for user input or has paused.
             */
            const deactivatePlaybackFeedback = () => {
                isAnimating = false;
                jq(containerElement + ' .mouse-cursor-pause').show();
                jq(containerElement + ' .mouse-cursor-normal').hide();
            };

            /**
             * Executes a given screencast action.
             * @param {object} actionObj - The action object to execute.
             */
            const executeStep = (actionObj) => {
                actionObj.execute(eventHub, containerElement);
            };

            /**
             * Executes a given screencast action in reverse.
             * @param {object} actionObj - The action object to reverse.
             */
            const reverseStepExecution = (actionObj) => {
                if (typeof actionObj.executeReverse === 'function') {
                    actionObj.executeReverse(containerElement);
                } else {
                    console.warn("ScreencastPresenter: Action does not support reverse execution.", actionObj);
                }
            };

            /**
             * Helper function to find a specific action by ID within a range.
             * @param {number} startIdx - The starting index for the search.
             * @param {number} endIdx - The ending index for the search.
             * @param {number|string} targetAnchorId - The ID of the anchor to find.
             * @param {boolean} forward - True for forward search, false for backward.
             * @returns {Array<object>|null} An array of actions leading to the target anchor, or null if not found.
             */
            const findStepsToAnchor = (startIdx, endIdx, targetAnchorId, forward) => {
                const stepSequence = [];
                const stepList = presentationData.action;

                if (forward) {
                    for (let i = startIdx; i < endIdx; i++) {
                        if (!stepList[i]) continue;
                        if (stepList[i].id == targetAnchorId) { // Loose comparison for flexibility.
                            return stepSequence;
                        }
                        stepSequence.push(stepList[i]);
                    }
                } else { // Backward search
                    for (let i = startIdx; i >= endIdx; i--) {
                        if (!stepList[i]) continue;
                        stepSequence.push(stepList[i]);
                        if (stepList[i].id == targetAnchorId) { // Loose comparison.
                            return stepSequence;
                        }
                    }
                }
                return null; // Anchor not found in the specified range.
            };

            /**
             * Navigates the presentation to a specific action identified by an anchor ID.
             * @param {string} anchorId - The ID of the target action.
             */
            const navigateToActionById = (anchorId) => {
                if (!anchorId || !presentationData || !presentationData.action) {
                    return; // No anchor or presentation data.
                }

                haltAllActiveSteps(); // Stop current playback.

                const targetAnchor = parseInt(anchorId, 10);
                if (isNaN(targetAnchor)) {
                    console.warn(`ScreencastPresenter: Invalid anchor ID received: ${anchorId}`);
                    return;
                }

                if (targetAnchor > nextStepIndex) {
                    // Navigate forward
                    const stepsToExecute = findStepsToAnchor(nextStepIndex, presentationData.action.length, targetAnchor, true);
                    if (stepsToExecute) {
                        for (const step of stepsToExecute) {
                            step.executeImmediately(containerElement); // Execute without triggering events.
                        }
                        nextStepIndex += stepsToExecute.length;
                    } else {
                        console.warn(`ScreencastPresenter: Anchor ${targetAnchor} not found when moving forward.`);
                    }
                } else if (targetAnchor < nextStepIndex) {
                    // Navigate backward
                    const stepsToReverse = findStepsToAnchor(nextStepIndex - 1, 0, targetAnchor, false);
                    if (stepsToReverse) {
                        for (const step of stepsToReverse) {
                            reverseStepExecution(step); // Reverse execution.
                        }
                        nextStepIndex -= stepsToReverse.length;
                    } else {
                        console.warn(`ScreencastPresenter: Anchor ${targetAnchor} not found when moving backward.`);
                    }
                }
                // If targetAnchor === nextStepIndex, no action is needed.
            };

            /**
             * Resets the presentation to its initial state (first frame, default mouse position).
             */
            const initializePresentationState = () => {
                window.clearTimeout(playbackTimer); // Clear any auto-advance timers.

                activeStepIndex = 0;
                nextStepIndex = 0;
                runningStepCount = 0;
                resetEventSubscriptions(); // Clear dynamic event subscriptions.

                // Hide all objects and show the initial background.
                jq(containerElement + " .object-list").children().hide();
                if (presentationData && presentationData.metaData && presentationData.metaData.initialBackgroundId) {
                    jq(containerElement + " ." + presentationData.metaData.initialBackgroundId).show();
                } else {
                    console.warn("ScreencastPresenter: Initial background ID not found in metadata.");
                }


                // Position the mouse cursor to its initial coordinates.
                const meta = presentationData ? presentationData.metaData : null;
                if (meta && typeof meta.initialMouseY === 'number' && typeof meta.initialMouseX === 'number') {
                    jq(containerElement + " .mouse-cursor").css({
                        'top': (meta.initialMouseY * meta.imageHeight) + "px",
                        'left': (meta.initialMouseX * meta.imageWidth) + "px"
                    }).show();
                } else {
                    jq(containerElement + " .mouse-cursor").hide(); // Hide if no initial position.
                    console.warn("ScreencastPresenter: Initial mouse position metadata missing.");
                }
            };

            /**
             * Initiates auto-playback if the `initialDelay` setting is enabled.
             */
            const initiateAutoPlayback = () => {
                if (initialDelay && presentationStarted) { // Only auto-start if presentation has begun and initialDelay is active.
                    playbackTimer = window.setTimeout(() => {
                        eventHub.onAdvance.publish();
                    }, initialDelay);
                }
            };

            /* Public API for ScreencastPresenter instances */

            /**
             * Loads presentation data from a given URL.
             * @param {string} resourcePath - The URL to fetch the JSON data from.
             */
            this.loadPresentationFromUrl = (resourcePath) => {
                let fetchedData;
                jq.ajax({
                    'async': false, // Synchronous request to ensure data is loaded before proceeding.
                    'global': false,
                    'url': resourcePath,
                    'dataType': "json",
                    'success': (data) => {
                        fetchedData = data;
                    },
                    'error': (xhr, status, error) => {
                        console.error(`ScreencastPresenter: Failed to load presentation from ${resourcePath}: ${status}, ${error}`);
                    }
                });

                if (fetchedData) {
                    this.loadPresentationData(fetchedData);
                }
            };

            /**
             * Loads and processes the raw JSON data for the presentation.
             * @param {object} rawData - The raw JSON object representing the screencast.
             */
            this.loadPresentationData = (rawData) => {
                if (!rawData) {
                    console.error("ScreencastPresenter: No raw presentation data provided.");
                    return;
                }
                // Use the screencast application's model processor to convert raw JSON into executable functions.
                const executableModel = scApp.createScreencastExecutableModel();
                executableModel.loadJson(rawData);
                presentationData = executableModel.getJson();

                if (!presentationData || !presentationData.action || presentationData.action.length === 0) {
                    console.error("ScreencastPresenter: Loaded data is not a valid screencast presentation.");
                }
            };

            /**
             * Initializes and starts the screencast presentation.
             * Sets up event listeners and begins playback.
             */
            this.beginPresentation = () => {
                if (!presentationData) {
                    console.error("ScreencastPresenter: Cannot start presentation, no data loaded.");
                    return;
                }

                // Subscribe core handlers to the event hub.
                eventHub.onAdvance.subscribe(handleAdvanceRequest);
                eventHub.onRecede.subscribe(handleRecedeRequest);
                eventHub.onStepFinished.subscribe(handleStepCompletion);
                eventHub.onStepInitiated.subscribe(handleStepInitiation);

                initializePresentationState(); // Set up the initial visual state.
                presentationStarted = true; // Mark presentation as started.

                // Handle URL hash changes for navigation.
                const currentHash = window.location.hash.substring(1);
                if (currentHash) {
                    navigateToActionById(currentHash);
                }
                lastKnownHash = currentHash; // Initialize lastKnownHash.

                // Set up hash change listener.
                if ("onhashchange" in window) {
                    // Browser supports 'onhashchange' event.
                    window.onhashchange = () => {
                        navigateToActionById(window.location.hash.substring(1));
                    };
                } else {
                    // Fallback for older browsers: periodical hash check.
                    const hashCheckInterval = window.setInterval(() => {
                        const newHash = window.location.hash.substring(1);
                        if (newHash !== lastKnownHash) {
                            lastKnownHash = newHash;
                            navigateToActionById(newHash);
                        }
                    }, playerConfig.hashCheckIntervalMs);

                    // Store interval ID for cleanup if needed.
                    this.cleanupInterval = () => window.clearInterval(hashCheckInterval);
                }

                // Attach click handlers for navigation buttons.
                jq(containerElement + " .next").on('click', () => {
                    eventHub.onAdvance.publish();
                });
                jq(containerElement + " .previous").on('click', () => {
                    eventHub.onRecede.publish();
                });

                // Hide loading screen and display the player content.
                jq("#loading").hide();
                jq(containerElement + " .object-list").show();

                initiateAutoPlayback(); // Start auto-playback if configured.
            };

            /**
             * Cleans up event listeners and timers when the presentation is no longer needed.
             */
            this.destroy = () => {
                window.clearTimeout(playbackTimer);
                if (this.cleanupInterval) {
                    this.cleanupInterval();
                }
                eventHub.onAdvance.clearAll();
                eventHub.onRecede.clearAll();
                eventHub.onStepFinished.clearAll();
                eventHub.onStepInitiated.clearAll();
                eventHub.onAllStepsComplete.clearAll();

                jq(containerElement + " .next").off('click');
                jq(containerElement + " .previous").off('click');
                window.onhashchange = null; // Remove global listener.

                // Optionally, reset DOM state or remove player elements.
                jq(containerElement + " .object-list").hide();
                jq("#loading").show(); // Show loading again if it was a global element.
                console.log("ScreencastPresenter: Instance destroyed and cleaned up.");
            };
        }; // End of ScreencastPresenter constructor.

        /**
         * Factory method to create a new ScreencastPresenter instance.
         * @param {string} domContainerId - The CSS selector for the player's root DOM element.
         * @param {object} urlParameters - URL query parameters.
         * @returns {ScreencastPresenter} A new instance of the presentation player.
         */
        playerAPI.createScreencastPlayer = (domContainerId, urlParameters) => {
            return new ScreencastPresenter(domContainerId, urlParameters);
        };

        return playerAPI;
    })(); // End of screencastPlayer IIFE.

    scApp.screencastPlayer = screencastPlayer; // Augment the main application object.

})(scApp || {}, jQuery);