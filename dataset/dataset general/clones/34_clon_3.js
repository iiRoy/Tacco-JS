// This file implements a customizable star rating widget, originally
// inspired by the 'starrr' plugin (https://github.com/dobtco/starrr),
// but extensively refactored and enhanced for clarity and modern practices.

// Helper for slicing arguments, primarily for legacy browser compatibility.
// Using Array.prototype.slice explicitly for robustness.
const _arrayProtoSlice = Array.prototype.slice;

(function($, currentWindow) {
    // Define CSS class constants for better maintainability and easier customization.
    const FILLED_STAR_CLASS = 'fa-star';
    const UNFILLED_STAR_CLASS = 'fa-star-o';
    // Namespace for event binding to prevent conflicts with other plugins.
    const WIDGET_EVENT_NAMESPACE = '.starWidget';
    // Key used to store the widget instance on the DOM element's data.
    const DATA_KEY_INSTANCE = 'star-widget-instance';

    /**
     * @class StarRatingWidget
     * @description Represents a star rating UI component with interactive features.
     */
    let StarRatingWidget;

    StarRatingWidget = (function() {
        // Default configuration options for the star rating widget.
        // These can be overridden during instantiation or via data attributes.
        StarRatingWidget.prototype.defaultSettings = {
            selectedScore: undefined, // The currently chosen rating (1 to totalStarCount), or undefined if not set.
            totalStarCount: 5,        // The total number of stars to display in the widget.
            onScoreChanged: function(event, newScore) {} // Callback function executed when the rating value changes.
        };

        /**
         * @constructor
         * @param {jQuery} $rootElement - The jQuery-wrapped DOM element where the widget will be rendered.
         * @param {object} [initialOptions] - Optional configuration settings to override the default behavior.
         */
        function StarRatingWidget($rootElement, initialOptions) {
            const selfInstance = this; // Capture 'this' for consistent context within event handlers and callbacks.

            // Merge default settings with user-provided options.
            // This ensures all configuration properties are present.
            selfInstance.widgetConfiguration = $.extend(
                {},
                selfInstance.defaultSettings,
                initialOptions
            );

            selfInstance.$widgetContainer = $rootElement;

            // Iterate over default settings to check for corresponding data attributes on the root element.
            // Data attributes take precedence over initialOptions if present.
            for (const configKey in selfInstance.defaultSettings) {
                // Ensure the property is directly on the defaultSettings object, not inherited.
                if (Object.prototype.hasOwnProperty.call(selfInstance.defaultSettings, configKey)) {
                    const dataAttributeValue = selfInstance.$widgetContainer.data(configKey);
                    // If a data attribute exists and is not null or undefined, use its value.
                    if (dataAttributeValue !== null && dataAttributeValue !== undefined) {
                        selfInstance.widgetConfiguration[configKey] = dataAttributeValue;
                    }
                }
            }

            // Perform basic validation for the 'totalStarCount' configuration.
            // It must be a positive integer. If invalid, a warning is logged and a default value is used.
            if (selfInstance.widgetConfiguration.totalStarCount <= 0 || !Number.isInteger(selfInstance.widgetConfiguration.totalStarCount)) {
                console.warn(`[StarRatingWidget] Invalid 'totalStarCount' configuration detected (${selfInstance.widgetConfiguration.totalStarCount}). Defaulting to 5 stars.`);
                selfInstance.widgetConfiguration.totalStarCount = 5;
            }

            // Initialize the visual star elements within the container.
            selfInstance.renderStarElements();
            // Update their visual state to reflect the initial or default rating.
            selfInstance.updateDisplayState();

            // Set up event listeners for user interaction with the stars.
            // Using delegated events for efficiency and to handle dynamically added stars.
            selfInstance.$widgetContainer.on('mouseover' + WIDGET_EVENT_NAMESPACE, 'i', function(event) {
                // Ensure the event target is indeed a star icon.
                if (event.currentTarget.tagName === 'I') {
                    // Calculate the 1-based index of the hovered star.
                    const hoveredIndex = selfInstance.$widgetContainer.find('i').index(event.currentTarget) + 1;
                    // Temporarily update the display to show the hovered rating.
                    selfInstance.updateDisplayState(hoveredIndex);
                }
            });

            selfInstance.$widgetContainer.on('mouseout' + WIDGET_EVENT_NAMESPACE, function() {
                // When the mouse leaves the widget, revert the display to the permanently selected rating.
                selfInstance.updateDisplayState();
            });

            selfInstance.$widgetContainer.on('click' + WIDGET_EVENT_NAMESPACE, 'i', function(event) {
                // Ensure the event target is indeed a star icon.
                if (event.currentTarget.tagName === 'I') {
                    // Determine the 1-based index of the clicked star.
                    const clickedIndex = selfInstance.$widgetContainer.find('i').index(event.currentTarget) + 1;
                    // Permanently set the new rating value.
                    selfInstance.setScoreValue(clickedIndex);
                }
            });

            // Bind the custom 'starWidget:scoreUpdate' event to the user-provided callback function.
            selfInstance.$widgetContainer.on('starWidget:scoreUpdate', selfInstance.widgetConfiguration.onScoreChanged);
        }

        /**
         * @method renderStarElements
         * @description Creates and appends the individual star icon elements to the widget's container.
         *              This method clears existing stars before rendering new ones.
         */
        StarRatingWidget.prototype.renderStarElements = function() {
            const totalStars = this.widgetConfiguration.totalStarCount;
            // HTML string for a single star icon, using the unfilled class by default.
            const starIconHtml = `<i class="fa ${UNFILLED_STAR_CLASS}"></i>`;

            // Clear any existing content within the container to prevent duplicates.
            this.$widgetContainer.empty();

            // Loop to append the specified number of star icons.
            for (let k = 0; k < totalStars; k++) {
                this.$widgetContainer.append(starIconHtml);
            }
        };

        /**
         * @method setScoreValue
         * @description Sets the current, persistent rating value for the widget.
         *              If the same rating is clicked twice, it toggles the rating off.
         * @param {number} desiredScore - The new rating value to set (1 to totalStarCount).
         * @returns {jQuery} The jQuery object of the widget container, for chaining.
         */
        StarRatingWidget.prototype.setScoreValue = function(desiredScore) {
            let actualScoreToSet = desiredScore;

            // Implement toggle functionality: if the currently selected score is clicked again, unset it.
            if (this.widgetConfiguration.selectedScore === desiredScore) {
                actualScoreToSet = undefined; // Setting to undefined effectively "clears" the rating.
            }

            // Update the internal rating property.
            this.widgetConfiguration.selectedScore = actualScoreToSet;
            // Visually refresh the stars to reflect the new score.
            this.updateDisplayState(actualScoreToSet);

            // Trigger a custom event to notify external listeners about the rating change.
            // The event object and the new score value are passed as arguments.
            return this.$widgetContainer.trigger('starWidget:scoreUpdate', [actualScoreToSet]);
        };

        /**
         * @method updateDisplayState
         * @description Updates the visual appearance (filled/unfilled) of the stars based on a given score.
         *              If no score is provided, it defaults to the widget's `selectedScore`.
         * @param {number} [potentialScore] - The score to visually represent. If undefined or null,
         *                                    the widget's internal `selectedScore` will be used.
         */
        StarRatingWidget.prototype.updateDisplayState = function(potentialScore) {
            // Determine the score to display: use the provided `potentialScore` if available,
            // otherwise fall back to the widget's persistently `selectedScore`.
            const scoreToDisplay = (potentialScore !== undefined && potentialScore !== null) ? potentialScore : this.widgetConfiguration.selectedScore;

            const $allStars = this.$widgetContainer.find('i');
            const totalStars = this.widgetConfiguration.totalStarCount;

            // Iterate through all star elements to apply the correct filled/unfilled classes.
            for (let starIndex = 0; starIndex < totalStars; starIndex++) {
                const $currentStar = $allStars.eq(starIndex);

                // If a score is set and the current star's index is less than the score, it should be filled.
                // (starIndex is 0-based, scoreToDisplay is 1-based)
                if (scoreToDisplay !== undefined && scoreToDisplay > starIndex) {
                    $currentStar.removeClass(UNFILLED_STAR_CLASS).addClass(FILLED_STAR_CLASS);
                } else {
                    // Otherwise, the star should be unfilled.
                    $currentStar.removeClass(FILLED_STAR_CLASS).addClass(UNFILLED_STAR_CLASS);
                }
            }
        };

        return StarRatingWidget; // Return the constructor function for the class.

    })(); // End of the Immediately Invoked Function Expression (IIFE) for StarRatingWidget.

    // Extend jQuery's prototype to add the 'starSelector' plugin.
    // This makes the widget accessible via `$(selector).starSelector()`.
    return $.fn.extend({
        starSelector: function() {
            // Extract arguments: the first argument is either configuration options or a method name.
            // Subsequent arguments are passed directly to the method if it's a method call.
            const operationOrConfig = arguments[0];
            const methodArgs = (_arrayProtoSlice.call(arguments, 1)); // Use the global slice helper for method arguments.

            // Iterate over each selected DOM element to apply the plugin.
            return this.each(function() {
                const $element = $(this);
                let widgetInstance = $element.data(DATA_KEY_INSTANCE);

                // If no widget instance is currently associated with this element, create a new one.
                if (!widgetInstance) {
                    widgetInstance = new StarRatingWidget($element, operationOrConfig);
                    $element.data(DATA_KEY_INSTANCE, widgetInstance);
                }

                // If the first argument is a string, it indicates a method call on the widget instance.
                if (typeof operationOrConfig === 'string') {
                    // Guard clause: check if the specified method actually exists on the instance.
                    if (typeof widgetInstance[operationOrConfig] === 'function') {
                        // Call the method, ensuring 'this' context is correctly bound to the widget instance.
                        return widgetInstance[operationOrConfig].apply(widgetInstance, methodArgs);
                    } else {
                        // Log an error if an unknown method is called.
                        console.error(`[StarRatingWidget] Attempted to call unknown method "${operationOrConfig}" on the widget instance.`);
                    }
                }
            });
        }
    });

})(window.jQuery, window); // Pass jQuery and the global window object to the IIFE.

// Auto-initialize any elements with the 'star-rating-component' class once the DOM is fully loaded.
// This provides a quick way to set up widgets without explicit JavaScript calls.
$(document).ready(function() {
    // Select elements marked for auto-initialization and apply the starSelector plugin.
    // Users can simply add this class to their HTML elements to enable the widget.
    return $(".star-rating-component").starSelector();
});