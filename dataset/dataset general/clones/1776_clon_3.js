/*
 * RangeSliderWidget - jQuery Plugin
 * version: 2.1 - December 2023
 * @requires jQuery v3.0 or higher
 *
 * This component offers an interactive range slider for numerical input.
 * Freely modifiable and distributable under the MIT License.
 * For more details, consult http://www.opensource.org/licenses/mit-license.php
 *
 */
(function(jq) {
    "use strict"; // Enforce strict mode for cleaner code

    // Check for jQuery availability as a basic guard
    if (typeof jq === 'undefined') {
        console.error("RangeSliderWidget: jQuery is not loaded. Plugin cannot initialize.");
        return;
    }

    // Private helper for detecting old IE versions (moved to be a local helper)
    // This is primarily for adding specific compatibility classes.
    function detectLegacyBrowserVersion() {
        let browserVersion = -1;
        if (navigator.appName === 'Microsoft Internet Explorer' || navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)) {
            const userAgent = navigator.userAgent;
            const msieMatch = /MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(userAgent);
            const rvMatch = /rv:([0-9]{1,}[\.0-9]{0,})/.exec(userAgent);

            if (msieMatch !== null) {
                browserVersion = parseFloat(msieMatch[1]);
            } else if (rvMatch !== null) { // IE 11+ (Trident)
                browserVersion = parseFloat(rvMatch[1]);
            }
        }
        return browserVersion;
    }

    jq.fn.rangeSlider = function(userSettings) {

        // Default configuration for the slider behavior
        const baseConfig = {
            animationDuration: 400, // Speed of visual updates in milliseconds
            minimumValue: 1,        // The lowest possible value for the input
            maximumValue: 10        // The highest possible value for the input
        };

        // Merge user-provided settings with the base configuration
        // The original `options` variable was redeclared, fixing that.
        const currentConfig = jq.extend({}, baseConfig, userSettings);

        // This ensures chainability for jQuery methods
        return this.each(function() {

            const targetElement = jq(this);

            // Basic validation: Ensure the target is an input element
            if (!targetElement.is('input')) {
                console.warn("RangeSliderWidget: Target element is not an input. Skipping.", targetElement);
                return;
            }

            // Add a class to the original input for styling or identification
            targetElement.addClass('rangeInputWidget');

            // Internal state variables for the slider
            let isDragging = false;             // Flag to indicate if the handle is being dragged
            let currentPercentage = 0;          // Current position of the handle as a percentage (0-100)

            // Retrieve parent and associated label for restructuring the DOM
            const wrapperDiv = targetElement.parent();
            const associatedLabel = wrapperDiv.find('label').first();
            const originalLabelText = associatedLabel.html();

            // Store the original input element and remove it temporarily for reinsertion
            const originalInputClone = targetElement.clone(true);
            targetElement.remove();

            // Clear the parent wrapper to rebuild its content
            wrapperDiv.empty();

            // Construct the new DOM structure programmatically
            const newLabel = jq('<label>').html(originalLabelText);
            const sliderTrack = jq('<span>').addClass('rangeTrackContainer');
            const progressFill = jq('<span>').addClass('rangeProgressFill');
            const dragHandle = jq('<span>').addClass('rangeDragHandle');

            // Assemble the slider components
            progressFill.append(dragHandle);
            sliderTrack.append(progressFill);

            // Append all elements back to the wrapperDiv
            wrapperDiv.append(newLabel, sliderTrack, originalInputClone);

            // Re-reference the input element now that it's been re-added
            const linkedInput = wrapperDiv.find('.rangeInputWidget').first();

            // Cache dimensions and position for performance
            let trackWidth = sliderTrack.outerWidth();
            let handleDimension = dragHandle.outerWidth();
            let trackOffset = sliderTrack.offset();

            // Helper function to convert actual value (e.g., 1-10) to percentage (0-100)
            const valueToPercent = (val) => {
                const min = currentConfig.minimumValue;
                const max = currentConfig.maximumValue;
                // Ensure value is within bounds before conversion
                val = Math.max(min, Math.min(max, val));
                return ((val - min) / (max - min)) * 100;
            };

            // Helper function to convert percentage (0-100) back to actual value (e.g., 1-10)
            const percentToValue = (percent) => {
                const min = currentConfig.minimumValue;
                const max = currentConfig.maximumValue;
                // Ensure percentage is within 0-100
                percent = Math.max(0, Math.min(100, percent));
                return Math.round((percent / 100) * (max - min) + min);
            };

            // Function to ensure a percentage value is within valid visual bounds (0-100)
            const constrainPercentage = (valuePct) => {
                return Math.max(0, Math.min(100, valuePct));
            };

            // Function to update the visual representation of the slider
            const updateVisuals = (targetValue) => {
                const visualPercentage = valueToPercent(targetValue);
                progressFill.stop(true, true).animate({ width: visualPercentage + "%" }, currentConfig.animationDuration);
                linkedInput.val(targetValue); // Update the input field's value
            };

            // Initial setup of the slider based on the input's current value
            const initialInputValue = parseFloat(linkedInput.val()) || currentConfig.minimumValue;
            updateVisuals(initialInputValue);

            // Recalculate track position on window resize
            jq(window).on('resize.rangeSlider', function() {
                trackOffset = sliderTrack.offset();
                trackWidth = sliderTrack.outerWidth();
            });

            // Apply IE-specific shadow class if detected (non-essential, can be deleted)
            const ieVer = detectLegacyBrowserVersion();
            if (ieVer > -1 && ieVer < 9) {
                dragHandle.addClass('ieShadow');
            }

            // Event handler for clicks on the slider track
            sliderTrack.on('click.rangeSlider', function(event) {
                event.preventDefault();
                // Calculate new percentage based on click position
                const clickX = event.pageX - trackOffset.left;
                const rawPercentage = (clickX / trackWidth) * 100; // Simplified calculation
                currentPercentage = constrainPercentage(rawPercentage);

                const newValue = percentToValue(currentPercentage);
                updateVisuals(newValue);
            });

            // Event handler for mousedown on the drag handle
            dragHandle.on('mousedown.rangeSlider', function(event) {
                event.preventDefault(); // Prevent default browser drag behavior
                isDragging = true; // Set drag flag

                // Attach mousemove and mouseup handlers to the document for global tracking
                jq(document).on('mousemove.rangeSlider', function(moveEvent) {
                    if (isDragging) { // Only process if dragging is active
                        moveEvent.preventDefault();
                        const currentX = moveEvent.pageX - trackOffset.left;
                        const rawPercentage = (currentX / trackWidth) * 100;
                        currentPercentage = constrainPercentage(rawPercentage);

                        // During drag, update width directly for responsiveness without animation
                        progressFill.width(currentPercentage + "%");
                        linkedInput.val(percentToValue(currentPercentage));
                    }
                }).on('mouseup.rangeSlider', function() {
                    // Detach event handlers and reset drag flag
                    jq(document).off('mousemove.rangeSlider mouseup.rangeSlider');
                    isDragging = false;
                    // Ensure the final value is properly set and potentially animated if needed (not in original)
                    // The value is already set by mousemove, so no extra update needed here.
                });
            });

            // Event handler for manual changes to the input field
            linkedInput.on('change.rangeSlider', function() {
                let inputValue = parseFloat(jq(this).val());

                // Guard clause for invalid input
                if (isNaN(inputValue)) {
                    inputValue = currentConfig.minimumValue; // Default to min if input is invalid
                    linkedInput.val(inputValue);
                }

                // Constrain input value to defined range
                inputValue = Math.max(currentConfig.minimumValue, Math.min(currentConfig.maximumValue, inputValue));
                linkedInput.val(inputValue); // Update input in case it was out of bounds

                updateVisuals(inputValue); // Visually update the slider
            });
        }); // End of .each()

        // Return `this` for jQuery chainability
        return this;
    }; // End of $.fn.rangeSlider
})(jQuery);