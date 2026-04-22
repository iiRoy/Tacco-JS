!function (externalJQuery) {

    "use strict";

    // This module offers functionality to manage and display task progress.
    // It provides a JavaScript class for individual progress indicators
    // and integrates as a jQuery plugin for easy DOM manipulation.
    // ====================================================================

    /**
     * Constructs a new TaskTracker instance to manage a progress display.
     * @param {HTMLElement} domContainer The DOM element that serves as the main wrapper for the progress bar.
     */
    var TaskTracker = function (domContainer) {
        this.$mainContainer = externalJQuery(domContainer);
        // Internal state to hold the current progress level.
        this.currentCompletionLevel = 0;
        this.setupInitialState(); // Calls a new internal method for setup.
    };

    // Define prototype methods using an object literal for cleaner structure.
    TaskTracker.prototype = {
        constructor: TaskTracker, // Explicitly set the constructor reference.

        /**
         * Initializes the tracker's attributes and progress based on data attributes.
         * This is a new internal helper method.
         */
        setupInitialState: function() {
            let initialLoadValue = parseInt(this.$mainContainer.attr('data-initial-progress') || '0', 10);
            // Ensure the initial value is within a sensible range.
            if (isNaN(initialLoadValue) || initialLoadValue < 0) {
                initialLoadValue = 0;
            } else if (initialLoadValue > 100) {
                initialLoadValue = 100;
            }
            this.updateCompletion(initialLoadValue); // Use the main update method for initial display.
        },

        /**
         * Updates the visual representation of the task's completion level.
         * @param {number} percentageAmount The new percentage value (0-100) for the progress.
         */
        updateCompletion: function (percentageAmount) { // Renamed from 'update' to 'updateCompletion'.
            let verifiedPercentage = parseFloat(percentageAmount);

            // Guard clause: Validate the input percentage.
            if (isNaN(verifiedPercentage) || verifiedPercentage < 0) {
                verifiedPercentage = 0;
                console.warn("TaskTracker: Invalid progress percentage provided; defaulting to 0%.");
            } else if (verifiedPercentage > 100) {
                verifiedPercentage = 100;
                console.warn("TaskTracker: Percentage exceeds 100%; capping at 100%.");
            }

            this.currentCompletionLevel = verifiedPercentage; // Update internal state.

            // Locate the specific progress segment and its associated text label.
            var $activeSegment = this.$mainContainer.find('.progress-bar-fill'); // Changed selector, renamed variable.
            var $statusTextLabel = $activeSegment.find('.progress-text-label'); // Changed selector, renamed variable.

            // Guard clause: Ensure the core progress bar fill element exists.
            if ($activeSegment.length === 0) {
                console.error("TaskTracker: Could not locate '.progress-bar-fill' within the container. Progress update aborted.");
                return;
            }

            // Update ARIA attributes for accessibility.
            $activeSegment.attr('aria-valuenow', verifiedPercentage.toFixed(0));
            $activeSegment.attr('aria-valuemin', '0'); // Added for completeness.
            $activeSegment.attr('aria-valuemax', '100'); // Added for completeness.

            // Dynamically set the width style.
            $activeSegment.css('width', verifiedPercentage + '%');

            // Update the descriptive text label if it is present.
            if ($statusTextLabel.length > 0) {
                $statusTextLabel.text(`Current Status: ${verifiedPercentage.toFixed(1)}% Done`); // Rewritten text format.
            } else {
                // Optionally log if the label is missing, or create it dynamically.
                // console.log("TaskTracker: No status text label found for this progress bar.");
            }

            // New: Dispatch a custom event to notify external listeners of the update.
            this.$mainContainer.trigger('tasktracker:progressChanged', { level: verifiedPercentage, timestamp: new Date() });
        },

        /**
         * Sets the task's progress to 100%, indicating full completion.
         */
        markAsCompleted: function () { // Renamed from 'finish' to 'markAsCompleted'.
            this.updateCompletion(100);
            // New: Add a class to the container for specific styling upon completion.
            this.$mainContainer.addClass('task-is-completed');
        },

        /**
         * Resets the task's progress back to 0%.
         */
        clearProgress: function () { // Renamed from 'reset' to 'clearProgress'.
            this.updateCompletion(0);
            // New: Remove the completion class if the task is reset.
            this.$mainContainer.removeClass('task-is-completed');
        },

        /**
         * New: Retrieves the current completion level.
         * @returns {number} The current percentage of completion.
         */
        getCurrentLevel: function() {
            return this.currentCompletionLevel;
        }
    };

    // jQuery Plugin Integration for TaskTracker
    // =========================================

    // New: Define default options for the plugin.
    var defaultPluginSettings = {
        initialProgress: 0,
        animationSpeed: 200 // Example for future animation integration.
    };

    externalJQuery.fn.taskTracker = function (userOption) { // Renamed plugin name and parameter.
        return this.each(function () {
            var $targetDomElement = externalJQuery(this); // Renamed internal variable.
            var trackerInstance = $targetDomElement.data('app.taskTracker'); // Renamed data key.

            // New: Merge default settings, data attributes, and user-provided options.
            var effectiveSettings = externalJQuery.extend(
                {},
                defaultPluginSettings,
                $targetDomElement.data(), // Read data attributes from the element.
                typeof userOption === 'object' && userOption // Apply object options last.
            );

            // If no TaskTracker instance exists for this element, create one.
            if (!trackerInstance) {
                trackerInstance = new TaskTracker(this);
                $targetDomElement.data('app.taskTracker', trackerInstance);
                // Apply initial progress from settings if it's a valid number.
                if (typeof effectiveSettings.initialProgress === 'number') {
                    trackerInstance.updateCompletion(effectiveSettings.initialProgress);
                }
            }

            // Handle different types of user options for method calls or direct updates.
            if (typeof userOption === 'string') {
                // Use a switch statement for clearer handling of string-based actions.
                switch (userOption) {
                    case 'complete':
                        trackerInstance.markAsCompleted();
                        break;
                    case 'reset':
                        trackerInstance.clearProgress();
                        break;
                    case 'getLevel': // New method call.
                        return trackerInstance.getCurrentLevel(); // Return the value for getter.
                    default:
                        console.warn(`TaskTracker: Unrecognized method call "${userOption}".`);
                        break;
                }
            } else if (typeof userOption === 'number') {
                // If a number is provided, interpret it as a direct progress update.
                trackerInstance.updateCompletion(userOption);
            }
            // If userOption is an object, it was handled during the effectiveSettings merge.
            // If userOption is undefined, it means we're just initializing the instance.
        });
    };

    // Automated Initialization via Data-API Attributes
    // ================================================

    // New: Encapsulate data-api binding within a document ready block for safety.
    externalJQuery(document).ready(function() {
        externalJQuery(document).on('click', '[data-trigger="progress-action"]', function (interactionEvent) { // Renamed event, selector, and event object.
            var $activatingControl = externalJQuery(this); // Renamed variables.
            var targetElementSelector = $activatingControl.data('target-element'); // Renamed data attribute key.
            var progressAmount = parseInt($activatingControl.data('progress-amount'), 10); // Renamed data attribute key, explicit parsing.

            // Guard clause: Validate required data attributes.
            if (!targetElementSelector) {
                console.error("TaskTracker Data-API: Missing 'data-target-element' attribute on the activating control.");
                return;
            }
            if (isNaN(progressAmount)) {
                console.warn("TaskTracker Data-API: 'data-progress-amount' is not a valid number; defaulting to 0.");
                progressAmount = 0; // Provide a fallback value.
            }

            interactionEvent.preventDefault(); // Prevent default link/button behavior.

            var $targetedDisplay = externalJQuery(targetElementSelector); // Renamed variable.
            // Guard clause: Check if the target element actually exists in the DOM.
            if ($targetedDisplay.length === 0) {
                console.warn(`TaskTracker Data-API: Target display element "${targetElementSelector}" not found.`);
                return;
            }

            // Invoke the taskTracker plugin on the identified target element.
            $targetedDisplay.taskTracker(progressAmount);
        });
    });

}(window.jQuery); // Using 'externalJQuery' as the alias for jQuery.