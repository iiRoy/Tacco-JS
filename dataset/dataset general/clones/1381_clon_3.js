// This module provides an advanced interactive range selection component built upon jQuery UI.
// It's designed to enhance standard HTML progress bars with draggable functionality.
// Developed by the UI/UX Engineering Group.
// Contributions and improvements are welcome at our internal repository.
;(function (uxRangeComponent) {
    // Implement Universal Module Definition (UMD) to support various module loaders.
    // This block checks if an AMD loader (like RequireJS) is present.
    const isAmdEnvironment = typeof define === "function" && define.amd;

    if (isAmdEnvironment) {
        // If AMD is detected, define the module and its dependencies.
        define( 'uxRangeComponent', ['module'],
            /**
             * AMD factory function to configure and load the range component.
             * @param {object} modConfig - The configuration object provided by the AMD loader.
             */
            function (modConfig) {
                const componentAssetPaths = modConfig.config();

                // Configure RequireJS's shim for jQuery UI Touch Punch.
                // It ensures that inputMouseHandler (jQuery UI Mouse) loads before touchInputEnhancer (Touch Punch).
                require.config((function (touchShimDefinition) {
                    const requireJsConfig = {
                        shim: {}
                    };
                    requireJsConfig.shim[componentAssetPaths['touchInputEnhancer']] = touchShimDefinition;
                    return requireJsConfig;
                })({
                    deps: [componentAssetPaths['jqLibrary'], componentAssetPaths['inputMouseHandler']],
                    exports: 'TouchInputEnhancer'
                }));

                // Load the core jQuery library and the touch input enhancer, then initialize the component.
                require([componentAssetPaths['jqLibrary'], componentAssetPaths['touchInputEnhancer']], function (jq) {
                    uxRangeComponent(jq);
                });
            }
        );
    } else {
        // For environments without AMD (e.g., global script tag), assume jQuery is globally available.
        uxRangeComponent( jQuery || $ );
    }
}(function(jq){ // The main component definition, encapsulated in an IIFE.

    // Register the new widget with jQuery UI.
    // It extends `jq.ui.mouse` to inherit mouse interaction capabilities.
    jq.widget( "ui.uxRange", jq.ui.mouse, {
        // Default configuration settings for this range component.
        configSettings: {
            minValue: 0,       // The lowest possible value in the range.
            currentValue: 0,   // The currently selected value.
            maxValue: 100,     // The highest possible value in the range.
            isInactive: false  // Boolean flag to enable/disable user interaction.
        },

        // Internal object to store dynamic layout measurements in pixels.
        _layoutMetrics: {
            thumbWidthPx: 0,         // Width of the draggable handle element.
            trackWidthPx: 0,         // Total width of the progress track (the parent element).
            draggableRangePx: 0,     // The actual pixel distance the handle can travel.
            halfHandleOffset: 0      // Half the handle's width, plus the track's left offset.
        },

        // Represents the handle's position as a percentage (0-100%).
        _currentCompletionRatio: 0,
        // A flag indicating if the widget's initial setup is complete.
        _isComponentReady: false,
        // Stores the type of the last significant interaction ('init', 'set', 'drag').
        _lastInteractionType: '',

        /**
         * The widget's constructor method, called upon instantiation.
         * It sets up the DOM elements and initial state.
         * @private
         */
        _setupComponent: function() {
            this._lastInteractionType = 'init'; // Mark the component as being initialized.

            // Find the core progress bar element within the widget's container.
            this._progressBarElement = jq(this.element.children('.progress-bar').first());
            // Temporarily disable CSS transitions to prevent animation during initial positioning.
            this._progressBarElement.css('transition', 'width 0s ease 0s');

            // Create the draggable handle element and append it to the widget's container.
            this._handleElement = jq("<div class='range-handle' />");
            this.element.append(this._handleElement);

            // Prepare initial settings by merging defaults, user options, and values from HTML data attributes.
            const componentInitialSettings = {};
            jq.extend(true, componentInitialSettings, this.configSettings, {
                currentValue: Number(this._progressBarElement.attr('data-current-val') || this.configSettings.currentValue),
                maxValue: Number(this._progressBarElement.attr('data-max-val') || this.configSettings.maxValue),
                minValue: Number(this._progressBarElement.attr('data-min-val') || this.configSettings.minValue)
            });

            // Apply these aggregated settings to the widget.
            this._applySettingsBatch(componentInitialSettings);

            // Initialize mouse event handling through the `jq.ui.mouse` base widget.
            this._mouseInit();
            // Perform an initial calculation of layout dimensions and position the handle.
            this.recalculateLayout();
            // Mark the component as fully ready for user interactions.
            this._isComponentReady = true;

            // Optional: Log component creation for debugging purposes.
            if (console && console.debug) {
                console.debug("UX Range Component initialized:", this.element[0]);
            }
        },

        /**
         * Updates a specific configuration setting of the component.
         * @param {string} settingKey - The name of the setting property to modify.
         * @param {*} newValue - The new value to assign to the setting.
         * @private
         */
        _updateSpecificSetting: function(settingKey, newValue) {
            // Convert specific settings to numbers if they are intended to be numeric.
            const numericSettingKeys = ['currentValue', 'maxValue', 'minValue'];
            if (numericSettingKeys.includes(settingKey)) {
                newValue = Number(newValue);
            }

            // Call the parent widget's `_setOption` method to handle standard option updates.
            this._super(settingKey, newValue);

            // Trigger specific actions based on the updated setting.
            if (settingKey === "currentValue" && this._isComponentReady) {
                // Only refresh if the new value is different from the current internal percentage.
                // This prevents unnecessary re-renders if the value hasn't effectively changed.
                const newCompletionRatio = this._valueToCompletionRatio(newValue);
                if (Math.abs(newCompletionRatio - this._currentCompletionRatio) > 0.01) { // Use epsilon for float comparison
                    this._lastInteractionType = "set"; // Indicate a programmatic setting change.
                    this.recalculateLayout(); // Update the visual layout.
                }
            } else if (settingKey === "isInactive" && typeof newValue === "boolean") {
                if (newValue) {
                    this._mouseDestroy(); // Disable mouse interaction events.
                    this._trigger("disabled", null, true); // Fire a custom 'disabled' event.
                } else {
                    this._mouseInit(); // Re-enable mouse interaction events.
                    this._trigger("disabled", null, false); // Fire a custom 'enabled' event.
                }
            }
        },

        /**
         * Applies multiple configuration settings at once.
         * @param {object} optionsObject - An object containing key-value pairs of settings to update.
         * @private
         */
        _applySettingsBatch: function(optionsObject) {
            this._super(optionsObject);
        },

        /**
         * Recalculates all component dimensions and updates the handle's visual position.
         * This method should be called whenever the component's size changes or `currentValue` is updated programmatically.
         */
        recalculateLayout: function() {
            this._determineDimensions(); // First, ensure all layout metrics are up-to-date.

            // If a current value is defined, calculate its corresponding pixel position and update the UI.
            if (this.configSettings.currentValue !== undefined) {
                const currentCompletionRatio = this._valueToCompletionRatio(this.configSettings.currentValue);
                const targetPixelOffset = this._percentToPixelOffset(currentCompletionRatio);
                this._adjustVisualPosition(targetPixelOffset);
            }
        },

        /**
         * Converts a given percentage (0-100) to a pixel offset within the draggable range.
         * @param {number} percentage - The percentage value.
         * @returns {number} The calculated pixel offset from the track's left edge.
         * @private
         */
        _percentToPixelOffset: function(percentage) {
            // Guard against division by zero if draggable range is unexpectedly zero.
            if (this._layoutMetrics.draggableRangePx <= 0) {
                return 0;
            }
            // Calculate raw pixel position based on percentage of the draggable range.
            const rawPixelPosition = (percentage * this._layoutMetrics.draggableRangePx) / 100;
            // Adjust by half the handle's width to get the center point of the handle.
            const finalPixelOffset = rawPixelPosition + this._layoutMetrics.halfHandleOffset;
            return Math.round(finalPixelOffset * 100) / 100; // Round to two decimal places for precision.
        },

        /**
         * Converts a pixel offset from the track's start to a percentage value (0-100).
         * @param {number} pixelOffset - The pixel offset from the track's left edge.
         * @returns {number} The calculated percentage.
         * @private
         */
        _pixelOffsetToPercent: function(pixelOffset) {
            // Ensure draggable range is not zero to prevent division by zero.
            if (this._layoutMetrics.draggableRangePx <= 0) {
                return 0;
            }
            const calculatedPercentage = (pixelOffset * 100) / this._layoutMetrics.draggableRangePx;
            return Math.round(calculatedPercentage * 100) / 100; // Round to two decimal places.
        },

        /**
         * Converts a component value (`currentValue`) into a completion ratio (percentage 0-100%).
         * @param {number} [value=this.configSettings.currentValue] - The value to convert.
         * @returns {number} The calculated completion ratio.
         * @private
         */
        _valueToCompletionRatio: function(value = this.configSettings.currentValue) {
            const rangeSpan = this.configSettings.maxValue - this.configSettings.minValue;
            // Handle cases where min and max values are identical to prevent division by zero.
            if (rangeSpan === 0) {
                return 0;
            }
            const valueRelativeToMin = value - this.configSettings.minValue;
            return (valueRelativeToMin * 100) / rangeSpan;
        },

        /**
         * Converts a completion ratio (percentage) back into a component value within the min/max range.
         * @returns {number} The calculated component value.
         * @private
         */
        _completionRatioToValue: function() {
            const rangeSpan = this.configSettings.maxValue - this.configSettings.minValue;
            const calculatedValue = (this._currentCompletionRatio * rangeSpan) / 100 + this.configSettings.minValue;
            return Math.round(calculatedValue * 100) / 100; // Round to two decimal places for consistency.
        },

        /**
         * Updates the visual position of the handle and progress bar based on a target X-coordinate.
         * This method also updates internal state and triggers custom events.
         * @param {number} targetXPageCoord - The page X-coordinate where the handle's center should be.
         * @private
         */
        _adjustVisualPosition: function(targetXPageCoord) {
            // Calculate the raw pixel position relative to the track's left edge.
            let rawTrackPixelPosition = targetXPageCoord - this._layoutMetrics.halfHandleOffset;

            // Clamp the handle's position to ensure it stays within the draggable range.
            const clampedPixelPosition = Math.max(
                0,
                Math.min(this._layoutMetrics.draggableRangePx, rawTrackPixelPosition)
            );

            // Convert the clamped pixel position to a percentage for CSS 'left' and 'width'.
            // This allows the component to be responsive to container resizing.
            const cssLeftPercentage = (clampedPixelPosition * 100) / this._layoutMetrics.trackWidthPx;

            this._handleElement.css("left", cssLeftPercentage + '%');
            this._progressBarElement.css("width", cssLeftPercentage + "%");

            // Update the internal completion ratio and the current value based on the new position.
            this._currentCompletionRatio = this._pixelOffsetToPercent(clampedPixelPosition);
            this.configSettings['currentValue'] = this._completionRatioToValue();

            // Update the custom data attribute for accessibility or external scripting.
            this._progressBarElement.attr('data-current-val', this.configSettings['currentValue']);

            // Trigger a custom 'valueChange' event, providing the new value and interaction type.
            this._trigger("valueChange", null, {
                value: this.configSettings['currentValue'],
                interaction: this._lastInteractionType
            });

            // If the handle reaches the end (100%), trigger a 'rangeComplete' event.
            if (this._currentCompletionRatio >= 99.99) { // Using a small epsilon for floating point comparison.
                this._trigger("rangeComplete", null, {
                    value: this.configSettings['currentValue'],
                    interaction: this._lastInteractionType
                });
            }
        },

        /**
         * Recalculates and stores all essential layout dimensions of the component.
         * This method is crucial for accurate positioning and should be called on initialization and resize.
         * @private
         */
        _determineDimensions: function() {
            const currentHandleWidth = this._handleElement.outerWidth();
            const parentTrackFullWidth = this.element.width();
            const parentTrackOffsetLeft = this.element.offset().left;

            this._layoutMetrics.thumbWidthPx = currentHandleWidth;
            this._layoutMetrics.trackWidthPx = parentTrackFullWidth;
            // The effective range the handle can move is the track width minus the handle's own width.
            this._layoutMetrics.draggableRangePx = parentTrackFullWidth - currentHandleWidth;
            // This value is used to adjust mouse X-coordinates to the handle's center relative to the track.
            this._layoutMetrics.halfHandleOffset = (currentHandleWidth / 2) + parentTrackOffsetLeft;

            // Add a guard and warning if the track width is non-positive, indicating a potential layout issue.
            if (this._layoutMetrics.trackWidthPx <= 0) {
                console.warn("UX Range Component: Track element has zero or negative width. Check CSS for:", this.element[0]);
            }
        },

        /**
         * Cleans up the component by removing event handlers and DOM elements.
         * Called when the widget instance is destroyed.
         * @private
         */
        _cleanupComponent: function() {
            this._mouseDestroy(); // Detach mouse event listeners.
            this._handleElement.remove(); // Remove the custom handle from the DOM.
            // Reset any inline transition styles on the progress bar.
            this._progressBarElement.css('transition', '');
            if (console && console.debug) {
                console.debug("UX Range Component destroyed:", this.element[0]);
            }
        },

        /**
         * Handler for mouse drag events. It updates the handle's position in real-time.
         * @param {object} eventData - The jQuery event object.
         * @private
         */
        _handleMouseDrag: function(eventData) {
            this._adjustVisualPosition(eventData.pageX); // Update position based on mouse X-coordinate.
            eventData.preventDefault(); // Prevent default browser drag behavior (e.g., text selection).
            eventData.stopPropagation(); // Stop event bubbling to parent elements.
        },

        /**
         * Handler for mouse start events (e.g., mousedown on the handle).
         * @param {object} eventData - The jQuery event object.
         * @private
         */
        _handleMouseStart: function(eventData) {
            this._lastInteractionType = "drag"; // Set interaction type to 'drag'.
            this._determineDimensions(); // Ensure dimensions are fresh before starting a drag.

            // Optional: Add a CSS class to provide visual feedback that the handle is being dragged.
            this._handleElement.addClass('is-dragging');
        },

        /**
         * Handler for mouse stop events (e.g., mouseup after dragging).
         * @param {object} eventData - The jQuery event object.
         * @private
         */
        _handleMouseStop: function(eventData) {
            this._handleElement.removeClass('is-dragging'); // Remove the dragging visual feedback class.
            // Trigger a final value change event, ensuring any last-moment position updates are broadcast.
            this._trigger("valueChange", null, {
                value: this.configSettings['currentValue'],
                interaction: this._lastInteractionType
            });
        }
    });

    /**
     * Global initialization routine for UX Range Components.
     * This runs once the entire window content has loaded.
     * It identifies specific progress bar elements and converts them into interactive range components.
     */
    jq(window).on('load.uxRangeInit', function() {
        // Iterate over all elements that are Bootstrap progress bars and have the 'ux-range-track' class.
        jq(".progress.ux-range-track").each(function() {
            const currentTrackElement = jq(this);

            // Check if the element has already been initialized as a 'uxRange' widget.
            if (!currentTrackElement.data('ui-uxRange')) {
                // Initialize the component, setting it as inactive by default for initial state.
                currentTrackElement.uxRange({ isInactive: true });
            }
        });
    });

    /**
     * Global resize handler for UX Range Components.
     * This ensures that all active range components correctly adjust their handle positions
     * and internal dimensions whenever the browser window is resized.
     */
    jq(window).on('resize.uxRangeRefresh', function() {
        // Iterate over all elements that *could* be UX Range components.
        jq(".progress").each(function() {
            const currentTrackElement = jq(this);

            // Retrieve the widget instance data.
            const componentInstance = currentTrackElement.data('ui-uxRange');
            // If it's an active UX Range component and has the `recalculateLayout` method, call it.
            if (componentInstance && typeof componentInstance.recalculateLayout === 'function') {
                componentInstance.recalculateLayout();
            }
        });
    });
}));