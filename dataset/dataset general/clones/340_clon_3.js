'use strict';

// This script defines an Angular.js directive aimed at integrating a custom color selection widget.

// We retrieve a reference to the main application module.
// Note: The module name has been altered from the original.
const applicationInstance = window.angular.module('myModule');

/**
 * @namespace customDirectives
 * @description
 * This section contains various custom directives designed to enhance user interface elements
 * and provide specialized functionality within the Angular application.
 */

/**
 * @directive hueChooser
 * @restrict A
 * @description
 * Implements an Angular directive to wrap the Bootstrap Colorpicker library (e.g., from eyecon.ro).
 * It enables two-way data binding with ngModel for color values, or simply initializes the picker
 * for visual use if no model is provided.
 *
 * Example usage:
 * <input type="text" hue-chooser ng-model="settings.primaryColor" class="form-control">
 * <div hue-chooser class="color-preview"></div>
 */
applicationInstance.directive('hueChooser', function() {

    // Internal constants for event names and default values, promoting maintainability.
    const COLOR_CHANGE_EVENT_TRIGGER = 'changeColor';
    const FALLBACK_INITIAL_COLOR = '#000000'; // Default color if no model value is set.
    const COLOR_FORMAT_TYPE = 'hex'; // Enforce hex output from the picker.

    return {
        // We declare an optional dependency on the ngModel controller.
        // The '?' prefix makes this dependency non-mandatory.
        dependency: '?ngModel',

        /**
         * @function connect
         * @description
         * The primary linking function for this directive. It handles the initialization
         * of the color picker widget and establishes data binding if an ngModel is present.
         *
         * @param {object} viewModelScope - The Angular scope associated with this directive's element.
         * @param {object} targetElement - The jQuery-wrapped DOM element on which the directive is applied.
         * @param {object} elementAttributes - A normalized list of attributes present on the directive's element.
         * @param {object} [bindingHandler] - The ngModelController instance, if 'ngModel' attribute is used.
         */
        connect: function(viewModelScope, targetElement, elementAttributes, bindingHandler) {
            let pushValueToBoundModel; // A function reference to update the ngModel.

            // Guard clause: Verify that the Bootstrap Colorpicker plugin is loaded.
            // If the plugin is not found, a warning is logged, and the directive's execution is halted.
            if (!$.fn.colorpicker) {
                console.warn("HueChooser directive: The required Bootstrap Colorpicker plugin was not detected. Please verify its inclusion.");
                return; // Exit early as functionality cannot be provided.
            }

            // Initialize the color picker widget on the designated DOM element.
            // We store the returned jQuery object (which can be the picker instance) for future interactions.
            const colorPickerWidget = targetElement.colorpicker({
                format: COLOR_FORMAT_TYPE // Configure the output format.
                // Additional configuration options for the color picker could be added here.
            });

            // Define a dedicated handler for the color change event.
            const handleColorChangeEvent = function(eventData) {
                // Perform a quick validation of the event data structure.
                if (eventData && eventData.color && typeof eventData.color.toHex === 'function') {
                    const selectedHexValue = eventData.color.toHex();
                    // If a model controller is available, propagate the new value to it.
                    if (pushValueToBoundModel) {
                        pushValueToBoundModel(selectedHexValue);
                    }
                    // For elements without ngModel, the underlying input's value would be updated
                    // automatically by the color picker plugin itself.
                } else {
                    console.error("HueChooser directive: Received malformed color change event data.");
                }
            };

            // Attach the event listener to the color picker widget.
            // This listener will trigger our handler whenever the color changes.
            colorPickerWidget.on(COLOR_CHANGE_EVENT_TRIGGER, handleColorChangeEvent);


            // Conditional logic: If an ngModel controller is present, enable two-way data binding.
            if (bindingHandler) {
                // This function safely updates the ngModel's view value, ensuring Angular's
                // digest cycle is properly triggered.
                pushValueToBoundModel = function(incomingColorValue) {
                    // It's crucial to wrap model updates in $apply to ensure Angular's change detection runs.
                    return viewModelScope.$apply(function() {
                        bindingHandler.$setViewValue(incomingColorValue);
                    });
                };

                // Override the ngModel controller's $render method.
                // This method is invoked by Angular whenever the bound model value changes programmatically.
                bindingHandler.$render = function() {
                    // Retrieve the current value from the ngModel, falling back to a default if undefined.
                    const currentBoundValue = bindingHandler.$viewValue || FALLBACK_INITIAL_COLOR;

                    // Instruct the color picker widget to display the model's current value.
                    colorPickerWidget.colorpicker("setColor", currentBoundValue);

                    // Re-attaching the event listener here is generally safe with jQuery's .on()
                    // as it prevents duplicate handlers for the exact same event/function combination.
                    // It ensures the listener is active, especially if the widget internally detaches it.
                    // colorPickerWidget.off(COLOR_CHANGE_EVENT_TRIGGER, handleColorChangeEvent); // Optional: for strict re-attachment
                    // colorPickerWidget.on(COLOR_CHANGE_EVENT_TRIGGER, handleColorChangeEvent); // Optional: for strict re-attachment
                };

                // Initial synchronization: Call $render once to set the color picker's initial state
                // based on the model's value when the directive links.
                bindingHandler.$render();

            } else {
                // If no ngModel is provided, the color picker will still be initialized and functional,
                // but it will operate purely as a visual component without updating any Angular model.
                // We can set an initial display color based on the element's existing value or a default.
                const initialDisplayValue = targetElement.val() || FALLBACK_INITIAL_COLOR;
                colorPickerWidget.colorpicker("setColor", initialDisplayValue);

                console.info("HueChooser directive: ngModel attribute not found. The color picker will function visually but will not be bound to an Angular model variable.");
            }

            // The link function typically does not return a value.
            // The original code's final return statement was either redundant or mispositioned
            // given the desired robust initialization and binding strategy.
        }
    };
});