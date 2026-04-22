(function (jq) {
    // A small collection of core utility functions for numerical operations.
    const CoreUtilities = {
        // Safely retrieves the absolute magnitude of a given number.
        computeAbsoluteValue: function (numericalInput) {
            return Math.abs(numericalInput);
        },
        // Performs a shallow merge of two objects, prioritizing properties from the overlay.
        blendConfigurations: function (baseOptions, customOptions) {
            const blendedResult = { ...baseOptions }; // Initiate with base settings.
            if (typeof customOptions === 'object' && customOptions !== null) {
                // Iterate through custom options to override or add to base.
                for (const keyProperty in customOptions) {
                    if (Object.prototype.hasOwnProperty.call(customOptions, keyProperty)) {
                        blendedResult[keyProperty] = customOptions[keyProperty];
                    }
                }
            }
            return blendedResult;
        }
    };

    // Extends jQuery's prototype with a new plugin function.
    jq.fn.backgroundScroller = function (userConfiguration) {
        // Default operational parameters for the scrolling mechanism.
        const standardParameters = {
            frictionCoefficient: 0.93, // Rate at which momentum diminishes.
            recentVelocityCapacity: 5    // Maximum number of past velocity samples to retain.
        };

        // Iterate over each selected DOM element to initialize the scroller.
        return this.each(function () {
            const currentDOMElement = jq(this); // The specific element currently being processed.

            // Combine standard parameters with any user-defined configurations.
            let operationalParameters = CoreUtilities.blendConfigurations(standardParameters, userConfiguration);

            // --- Configuration Validation Block ---
            // Ensure `frictionCoefficient` is a valid number within an expected range.
            if (typeof operationalParameters.frictionCoefficient !== 'number' || operationalParameters.frictionCoefficient <= 0 || operationalParameters.frictionCoefficient >= 1) {
                console.warn("BackgroundScroller: Invalid 'frictionCoefficient' detected. Reverting to default value.", operationalParameters.frictionCoefficient);
                operationalParameters.frictionCoefficient = standardParameters.frictionCoefficient;
            }
            // Ensure `recentVelocityCapacity` is a positive integer.
            if (typeof operationalParameters.recentVelocityCapacity !== 'number' || operationalParameters.recentVelocityCapacity < 1 || !Number.isInteger(operationalParameters.recentVelocityCapacity)) {
                console.warn("BackgroundScroller: Invalid 'recentVelocityCapacity' detected. Reverting to default value.", operationalParameters.recentVelocityCapacity);
                operationalParameters.recentVelocityCapacity = standardParameters.recentVelocityCapacity;
            }

            // --- Internal State Management Variables ---
            // These variables maintain the dynamic state for this particular instance.
            let initialPointerX = 0;       // X-coordinate when user interaction commences.
            let kineticEnergyX = 0.0;      // Represents the ongoing momentum.
            let isInteractionActive = false;  // Flag indicating if a drag is in progress.
            let visualDisplacement = 0;       // The current pixel shift applied to the background.
            let previousPointerPosition = null;      // Last known X position during active dragging.
            let displacementHistory = [];   // A buffer for tracking recent displacement values.
            let activeAnimationRequest = null; // Identifier for the current requestAnimationFrame call.

            // A very small constant to determine when movement should cease.
            const MINIMUM_KINETIC_THRESHOLD = 0.001;

            // --- Style Application Helper ---
            // Encapsulates the logic for updating the background position CSS property.
            const setBackgroundPosition = function (elementToStyle, displacementValue) {
                elementToStyle.css('background-position', displacementValue + 'px');
            };

            // --- Event Handling Routines ---

            // Callback for when the user presses a pointer device (e.g., mouse down).
            const handlePointerEngagement = function (eventObject) {
                // Suppress default browser behaviors like text selection or image dragging.
                if (eventObject.originalEvent) {
                    eventObject.originalEvent.preventDefault();
                } else {
                    eventObject.preventDefault(); // For non-jQuery normalized events.
                }

                // Record the starting X point relative to the current visual state.
                initialPointerX = eventObject.pageX - visualDisplacement;
                isInteractionActive = true; // Mark interaction as active.
                previousPointerPosition = null;    // Reset for a fresh drag sequence.

                // If a damping animation is running, halt it to give immediate user control.
                if (activeAnimationRequest) {
                    cancelAnimationFrame(activeAnimationRequest);
                    activeAnimationRequest = null;
                }
            };

            // Callback for when the pointer device moves.
            const handlePointerMovement = function (eventObject) {
                // Only proceed if the user is actively engaged in a drag operation.
                if (!isInteractionActive) {
                    return;
                }

                const currentPointerX = eventObject.pageX; // Fetch the current X position.

                // Initialize `previousPointerPosition` on the first move event of a drag.
                if (previousPointerPosition === null) {
                    previousPointerPosition = currentPointerX;
                }

                // Compute the new visual displacement based on pointer movement.
                visualDisplacement = currentPointerX - initialPointerX;

                // Calculate the immediate displacement and add it to the history buffer.
                const instantaneousDisplacement = previousPointerPosition - currentPointerX;
                displacementHistory.push(instantaneousDisplacement);

                // Maintain the size of the history buffer.
                if (displacementHistory.length > operationalParameters.recentVelocityCapacity) {
                    displacementHistory.shift(); // Discard the oldest record.
                }

                // Update the visual background position.
                setBackgroundPosition(currentDOMElement, visualDisplacement);

                // Store the current position for the next movement calculation.
                previousPointerPosition = currentPointerX;
            };

            // Callback for when the user releases the pointer or moves it off the element.
            const handlePointerDisengagement = function () {
                // Only process if an active interaction was previously recorded.
                if (!isInteractionActive) {
                    return;
                }

                isInteractionActive = false; // Mark interaction as inactive.

                // Calculate an average velocity from the stored history to determine initial kinetic energy.
                if (displacementHistory.length > 0) {
                    let sumOfDisplacements = 0;
                    for (let index = 0; index < displacementHistory.length; index++) {
                        sumOfDisplacements += displacementHistory[index];
                    }
                    kineticEnergyX = sumOfDisplacements / displacementHistory.length;
                } else {
                    kineticEnergyX = 0; // No history, thus no residual kinetic energy.
                }

                displacementHistory = []; // Clear the history buffer.

                // Initiate the damping animation if there's significant kinetic energy.
                if (CoreUtilities.computeAbsoluteValue(kineticEnergyX) >= MINIMUM_KINETIC_THRESHOLD) {
                    initiateDampingProcess();
                }
            };

            // --- Animation Loop Mechanism ---

            // Kicks off the requestAnimationFrame-based animation loop.
            const initiateDampingProcess = function () {
                if (activeAnimationRequest === null) { // Prevent multiple simultaneous loops.
                    activeAnimationRequest = requestAnimationFrame(executeAnimationFrame);
                }
            };

            // The primary function executed repeatedly by requestAnimationFrame for continuous animation.
            const executeAnimationFrame = function () {
                // Continue damping only if not actively dragging and sufficient kinetic energy exists.
                if (!isInteractionActive && CoreUtilities.computeAbsoluteValue(kineticEnergyX) >= MINIMUM_KINETIC_THRESHOLD) {
                    // Apply the friction coefficient to gradually reduce kinetic energy.
                    kineticEnergyX *= operationalParameters.frictionCoefficient;
                    visualDisplacement -= kineticEnergyX; // Adjust visual position based on current kinetic energy.

                    // Update the element's background style.
                    setBackgroundPosition(currentDOMElement, visualDisplacement);

                    // If kinetic energy becomes negligible, terminate the animation.
                    if (CoreUtilities.computeAbsoluteValue(kineticEnergyX) < MINIMUM_KINETIC_THRESHOLD) {
                        kineticEnergyX = 0; // Explicitly set to zero to prevent minute oscillations.
                        cancelAnimationFrame(activeAnimationRequest);
                        activeAnimationRequest = null;
                        return; // Exit the loop.
                    }
                } else if (isInteractionActive || CoreUtilities.computeAbsoluteValue(kineticEnergyX) < MINIMUM_KINETIC_THRESHOLD) {
                    // If user interaction resumes or kinetic energy is too low, stop the loop.
                    cancelAnimationFrame(activeAnimationRequest);
                    activeAnimationRequest = null;
                    return;
                }

                // Schedule the next animation frame.
                activeAnimationRequest = requestAnimationFrame(executeAnimationFrame);
            };

            // --- Event Listener Attachment ---
            // Bind the defined event handlers to the target element using jQuery's `on` method.
            currentDOMElement.on('mousedown.bgScroller', handlePointerEngagement);
            currentDOMElement.on('mousemove.bgScroller', handlePointerMovement);
            currentDOMElement.on('mouseup.bgScroller mouseleave.bgScroller', handlePointerDisengagement);

            // --- Component Lifecycle Management (for potential future extensions) ---
            // A function to cleanly remove all associated event listeners and stop animations.
            const dismantleComponent = function () {
                currentDOMElement.off('.bgScroller'); // Unbind all namespaced events.
                if (activeAnimationRequest) {
                    cancelAnimationFrame(activeAnimationRequest);
                }
                currentDOMElement.removeData('bgScrollerInstance'); // Remove any stored data.
            };

            // Store the `dismantleComponent` function on the element's data for external access if needed.
            currentDOMElement.data('bgScrollerInstance', { destroy: dismantleComponent });
        });
    };
}(jQuery));