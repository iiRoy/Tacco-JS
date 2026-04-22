(function($) {
    'use strict';

    // --- Configuration Constants and Selectors ---
    // Define key selectors and units for easier maintenance and renaming.
    const VISUAL_DISPLAY_ELEMENT_CLASS = '.perspective-visualizer'; // Renamed from .perspective
    const X_CONTROL_INPUT_NAME = 'rotation_axis_alpha'; // Renamed from x_axis
    const Y_CONTROL_INPUT_NAME = 'rotation_axis_beta';  // Renamed from y_axis
    const Z_CONTROL_INPUT_NAME = 'rotation_axis_gamma'; // Renamed from z_axis
    const ALL_RANGE_INPUTS_SELECTOR = 'input[type="range"]'; // General selector for range controls
    const INTERACTION_ZONE_SELECTOR = 'body'; // Element for mouse/touch interactions

    const ANGLE_UNIT_STRING = 'deg'; // Standard unit for CSS rotations.

    // Parameters for mouse/touch based rotation.
    // These values integrate concepts from the original unused 'mvar' and 'offset',
    // and the hardcoded multipliers (55, -50).
    const DYNAMIC_ROTATION_SENSITIVITY = 0.01; // Corresponds to original 'mvar'
    const MOUSE_INPUT_BASE_MAGNITUDE = 48; // Adjusted from 55/50, conceptually using 'offset' idea.

    // --- Application State Management ---
    // Object to hold the current rotation angles. Renamed from 'xyz'.
    let currentRotationState = {
        alpha: 0, // Corresponds to original x_axis
        beta: 0,  // Corresponds to original y_axis
        gamma: 0  // Corresponds to original z_axis
    };

    // --- Utility Helper Functions ---

    /**
     * Safely retrieves a numeric value from a jQuery input element.
     * Ensures the returned value is a valid number, defaulting if not.
     * @param {jQuery} inputJqueryObject The jQuery object for the input field.
     * @param {number} fallbackValue The default value to return if parsing fails.
     * @returns {number} The parsed numeric value or the fallback value.
     */
    function getValidatedNumericInput(inputJqueryObject, fallbackValue = 0) {
        const stringValue = inputJqueryObject.val();
        const numericValue = parseFloat(stringValue);
        // Return fallback if not a number, otherwise the parsed value.
        return isNaN(numericValue) ? fallbackValue : numericValue;
    }

    /**
     * Applies the specified rotation angles to a target HTML element using CSS transforms.
     * Handles vendor prefixes for wider browser compatibility.
     * @param {jQuery} targetElementJquery The jQuery object representing the element to transform.
     * @param {number} rotationAlpha Angle for X-axis rotation.
     * @param {number} rotationBeta Angle for Y-axis rotation.
     * @param {number} rotationGamma Angle for Z-axis rotation.
     */
    function applyTransformStyles(targetElementJquery, rotationAlpha, rotationBeta, rotationGamma) {
        // Guard clause: Exit if the target element doesn't exist on the page.
        if (!targetElementJquery || targetElementJquery.length === 0) {
            // console.warn("Cannot apply transform: Target display element not found.");
            return;
        }

        // Construct the CSS transform string.
        const transformCssString = `rotateX(${rotationAlpha}${ANGLE_UNIT_STRING}) rotateY(${rotationBeta}${ANGLE_UNIT_STRING}) rotateZ(${rotationGamma}${ANGLE_UNIT_STRING})`;

        // Create a style object to apply all relevant vendor-prefixed properties.
        const cssProperties = {
            '-webkit-transform': transformCssString,
            '-moz-transform': transformCssString,
            'transform': transformCssString
        };

        targetElementJquery.css(cssProperties);
    }

    /**
     * Updates a specific rotation angle in the application state and triggers a re-render.
     * @param {string} axisIdentifier 'alpha', 'beta', or 'gamma' to identify the axis.
     * @param {number} newAngleValue The new angle for the specified axis.
     */
    function updateRotationAngleAndRefresh(axisIdentifier, newAngleValue) {
        // Validate the axis identifier before updating the state.
        if (currentRotationState.hasOwnProperty(axisIdentifier)) {
            currentRotationState[axisIdentifier] = newAngleValue;
            // Re-render the visual display with the updated state.
            applyTransformStyles(
                $cachedDisplayElement,
                currentRotationState.alpha,
                currentRotationState.beta,
                currentRotationState.gamma
            );
        } else {
            // console.warn(`Attempted to update an unrecognized rotation axis: ${axisIdentifier}`);
        }
    }

    /**
     * Extracts normalized X and Y coordinates from a mouse or touch event.
     * Prioritizes touch event coordinates if available.
     * @param {Event} domEvent The raw DOM event object (e.g., from jQuery's `on` handler).
     * @returns {{x: number, y: number}} An object containing the x and y coordinates.
     */
    function extractEventCoordinates(domEvent) {
        let coordinateX, coordinateY;
        // Check for touch events (originalEvent for jQuery).
        if (domEvent.originalEvent && domEvent.originalEvent.touches && domEvent.originalEvent.touches.length > 0) {
            coordinateX = domEvent.originalEvent.touches[0].pageX;
            coordinateY = domEvent.originalEvent.touches[0].pageY;
        } else {
            // Fallback to mouse event properties.
            coordinateX = domEvent.pageX;
            coordinateY = domEvent.pageY;
        }
        // Ensure coordinates are numbers, defaulting to 0 if undefined.
        return { x: coordinateX || 0, y: coordinateY || 0 };
    }


    // --- Global Cached jQuery Elements ---
    // Cache frequently used jQuery selectors for performance.
    let $cachedDisplayElement;
    let $xAxisControlInput;
    let $yAxisControlInput;
    let $zAxisControlInput;
    let $allRangeControlInputs;
    let $interactiveRegion;
    let $resetActionTrigger; // For the new reset functionality

    // --- Document Ready / Initialization Block ---
    // Executes code only after the entire DOM is fully loaded.
    $(document).ready(function() {
        // Assign cached jQuery objects.
        $cachedDisplayElement = $(VISUAL_DISPLAY_ELEMENT_CLASS);
        $xAxisControlInput = $(`input[name="${X_CONTROL_INPUT_NAME}"]`);
        $yAxisControlInput = $(`input[name="${Y_CONTROL_INPUT_NAME}"]`);
        $zAxisControlInput = $(`input[name="${Z_CONTROL_INPUT_NAME}"]`);
        $allRangeControlInputs = $(ALL_RANGE_INPUTS_SELECTOR);
        $interactiveRegion = $(INTERACTION_ZONE_SELECTOR);
        $resetActionTrigger = $('#reset-transform-button'); // Assuming an element with this ID for reset.

        // --- Initial Application State Population ---
        // Retrieve initial rotation angles from the input fields.
        currentRotationState.alpha = getValidatedNumericInput($xAxisControlInput);
        currentRotationState.beta = getValidatedNumericInput($yAxisControlInput);
        currentRotationState.gamma = getValidatedNumericInput($zAxisControlInput);

        // Apply the initial transformation to the display element.
        applyTransformStyles(
            $cachedDisplayElement,
            currentRotationState.alpha,
            currentRotationState.beta,
            currentRotationState.gamma
        );

        // --- Event Binding for User Interactions ---

        // Handle changes from range input sliders.
        // Using the 'input' event for more immediate visual feedback compared to 'change'.
        $allRangeControlInputs.on('input', function() {
            const $currentControl = $(this);
            const controlId = $currentControl.attr('name'); // Get the name attribute as identifier.
            const newControlValue = getValidatedNumericInput($currentControl); // Get and validate the new value.

            // Use a switch statement for a cleaner and more extensible way to handle
            // different input controls, replacing the original if/else if chain.
            switch (controlId) {
                case X_CONTROL_INPUT_NAME:
                    updateRotationAngleAndRefresh('alpha', newControlValue);
                    break;
                case Y_CONTROL_INPUT_NAME:
                    updateRotationAngleAndRefresh('beta', newControlValue);
                    break;
                case Z_CONTROL_INPUT_NAME:
                    updateRotationAngleAndRefresh('gamma', newControlValue);
                    break;
                default:
                    // console.info(`Input changed for unknown control: ${controlId}`);
                    break;
            }
        });

        // Handle mouse movement or touch on the interaction surface for dynamic rotation.
        $interactiveRegion.on('mousemove touchstart', function(eventObject) {
            // Determine current viewport dimensions for center calculation.
            const documentViewportWidth = $(document).width();
            const documentViewportHeight = $(document).height();

            // Calculate the center coordinates of the interactive viewport.
            const viewportHalfWidth = documentViewportWidth * 0.5;
            const viewportHalfHeight = documentViewportHeight * 0.5;

            // Extract pointer coordinates from the event using the helper function.
            const pointerLocation = extractEventCoordinates(eventObject);
            const eventPointerX = pointerLocation.x;
            const eventPointerY = pointerLocation.y;

            // Calculate dynamic rotation angles based on pointer position relative to center.
            // These calculations integrate the DYNAMIC_ROTATION_SENSITIVITY (from original mvar)
            // and MOUSE_INPUT_BASE_MAGNITUDE (from original 55/-50 and offset concept).
            const effectiveRotationScale = MOUSE_INPUT_BASE_MAGNITUDE + (DYNAMIC_ROTATION_SENSITIVITY * 1000); // e.g., 48 + (0.01 * 1000) = 48 + 10 = 58

            const dynamicXAngle = ((viewportHalfHeight - eventPointerY) / viewportHalfHeight) * effectiveRotationScale;
            const dynamicYAngle = ((viewportHalfWidth - eventPointerX) / viewportHalfWidth) * (-effectiveRotationScale); // Invert Y for intuitive mouse control.

            // Apply these dynamic rotations, maintaining the Z-axis rotation from the sliders.
            applyTransformStyles(
                $cachedDisplayElement,
                dynamicXAngle,
                dynamicYAngle,
                currentRotationState.gamma // Z-axis rotation remains controlled by the slider.
            );
        });

        // --- New Feature: Reset Button Fragment ---
        // This demonstrates adding a new functionality fragment to the code.
        if ($resetActionTrigger.length) { // Check if the reset button exists in the DOM.
            $resetActionTrigger.on('click', function() {
                // Reset all rotation angles in the state to zero.
                updateRotationAngleAndRefresh('alpha', 0);
                updateRotationAngleAndRefresh('beta', 0);
                updateRotationAngleAndRefresh('gamma', 0);

                // Additionally, reset the visual state of the range input controls to their default (0).
                $xAxisControlInput.val(0);
                $yAxisControlInput.val(0);
                $zAxisControlInput.val(0);
            });
        }
    });

})(jQuery); // Pass jQuery as an argument to the IIFE for scope and potential noConflict compatibility.