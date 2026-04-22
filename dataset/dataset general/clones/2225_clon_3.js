(function(jqRef) {
    // Extend the core validator prototype with a custom feedback mechanism.
    // The original `showLabel` was empty, so we're providing a basic, non-intrusive implementation
    // that could be expanded or simply logs for debugging purposes.
    jqRef.extend(jqRef.validator.prototype, {
        displayValidationFeedback: function(targetElement, feedbackMessage) {
            // This function is intended to display validation messages next to form elements.
            // For now, it just logs, but could be enhanced to inject DOM elements.
            if (targetElement && feedbackMessage) {
                console.log(`Validation Feedback for element [${targetElement.id || targetElement.name || 'unknown'}]: ${feedbackMessage}`);
            }
            // An alternative implementation could involve dynamically creating a span or div
            // and appending it to a specific parent of the targetElement.
            // Example: jqRef(targetElement).after(`<span class="validation-tip">${feedbackMessage}</span>`);
        }
    });

    // Define default settings for the validation system.
    // These settings control how validation errors and successes are visually presented.
    const validationGlobalSettings = {
        // CSS class applied to elements with validation errors.
        invalidInputStateClass: 'error-state-indicator',
        // CSS class applied to elements that have passed validation.
        validInputStateClass: 'success-state-indicator',
        // The HTML tag used to wrap and display individual error messages.
        messageContainerTag: 'small',

        /**
         * Callback function executed when an input element fails validation.
         * It updates the element's appearance to reflect an invalid state.
         * @param {HTMLElement} currentElement - The DOM element that failed validation.
         * @param {string} errorCssClass - The CSS class for invalid elements.
         * @param {string} validCssClass - The CSS class for valid elements.
         */
        highlightField: function (currentElement, errorCssClass, validCssClass) {
            if (!currentElement) {
                console.warn("Attempted to highlight a null or undefined element.");
                return; // Guard clause for robustness
            }

            let $affectedInputs; // jQuery object representing the input(s) to be styled.

            // Special handling for radio buttons: apply styles to all related inputs.
            if (currentElement.type === 'radio') {
                $affectedInputs = this.findByName(currentElement.name);
            } else {
                $affectedInputs = jqRef(currentElement);
            }

            // Ensure we have a valid jQuery object before proceeding.
            if ($affectedInputs.length === 0) {
                console.warn("Highlight: No jQuery elements found for:", currentElement);
                return;
            }

            // Apply the error class and remove the success class.
            $affectedInputs.removeClass(validCssClass).addClass(errorCssClass);

            // Additionally, find the closest parent container (e.g., a form group)
            // and apply an error class to it for broader visual feedback.
            const $parentContainer = $affectedInputs.closest(".form-field-group");
            if ($parentContainer.length > 0) {
                 $parentContainer.addClass("has-validation-error");
            } else {
                // If a specific parent isn't found, log a warning or apply to a different common ancestor.
                console.debug("Highlight: Could not find '.form-field-group' for visual context.");
            }
        },

        /**
         * Callback function executed when an input element passes validation or is no longer invalid.
         * It restores the element's appearance to a neutral or valid state.
         * @param {HTMLElement} currentElement - The DOM element that passed validation.
         * @param {string} errorCssClass - The CSS class for invalid elements.
         * @param {string} validCssClass - The CSS class for valid elements.
         */
        unhighlightField: function (currentElement, errorCssClass, validCssClass) {
            if (!currentElement) {
                console.warn("Attempted to unhighlight a null or undefined element.");
                return;
            }

            let $affectedInputs; // jQuery object representing the input(s) to be styled.

            // Special handling for radio buttons.
            if (currentElement.type === 'radio') {
                $affectedInputs = this.findByName(currentElement.name);
            } else {
                $affectedInputs = jqRef(currentElement);
            }

            // Ensure we have a valid jQuery object.
            if ($affectedInputs.length === 0) {
                console.warn("Unhighlight: No jQuery elements found for:", currentElement);
                return;
            }

            // Remove the error class and apply the success class.
            $affectedInputs.removeClass(errorCssClass).addClass(validCssClass);

            // Also, remove the error class from the closest parent container.
            const $parentContainer = $affectedInputs.closest(".form-field-group");
            if ($parentContainer.length > 0) {
                $parentContainer.removeClass("has-validation-error");
            } else {
                console.debug("Unhighlight: Could not find '.form-field-group' for visual context.");
            }
        },

        /**
         * Manages the display of all validation errors.
         * It hides old popovers and shows new ones for current errors.
         * @param {object} validationIssueMap - An object mapping element names to error messages.
         * @param {Array<object>} activeFailureList - A list of current validation error objects.
         */
        displayFormErrors: function (validationIssueMap, activeFailureList) {
            // First, hide any existing popovers for elements that are now valid.
            // Iterate through elements that were previously invalid but are now considered successful.
            jqRef.each(this.successList || [], function (_idx, successfulNode) {
                const $validatedNode = jqRef(successfulNode);
                // Check if the popover plugin is initialized on the element before trying to hide.
                if ($validatedNode.data('bs.popover') || $validatedNode.data('popover')) { // Bootstrap 3 vs 4/5
                    $validatedNode.popover('hide');
                }
            });

            // If there are no current validation failures, we can simply return after hiding previous errors.
            if (!activeFailureList || activeFailureList.length === 0) {
                console.log("Validation: No active failures to display.");
                // Optionally, trigger a custom event indicating validation success.
                jqRef(this.currentForm).trigger('validationSuccess');
                return;
            }

            // Iterate through the list of current validation errors.
            jqRef.each(activeFailureList, function (_idx, failureItem) {
                const affectedElement = failureItem.element;
                const errorMessage = failureItem.message;

                if (!affectedElement) {
                    console.warn("Validation: Error item missing element property.", failureItem);
                    return true; // continue to next item
                }

                const $elementTarget = jqRef(affectedElement);

                // Initialize or update a Bootstrap popover to display the error message.
                // The 'manual' trigger means it only shows/hides programmatically.
                const popoverConfig = {
                    trigger: 'manual',
                    content: errorMessage,
                    placement: 'auto', // Automatically determine best placement
                    container: 'body' // Append popover to body to avoid clipping issues
                };

                // Check if popover already exists to avoid re-initializing unnecessarily.
                if ($elementTarget.data('bs.popover') || $elementTarget.data('popover')) {
                    // Update content if popover already exists
                    $elementTarget.data('bs.popover') ? $elementTarget.data('bs.popover').options.content = errorMessage : null;
                    $elementTarget.data('popover') ? $elementTarget.data('popover').options.content = errorMessage : null;
                } else {
                    // Initialize new popover if it doesn't exist
                    $elementTarget.popover(popoverConfig);
                }

                // Show the popover for the current error.
                $elementTarget.popover('show');
            });

            // Log a message indicating that custom error display logic has been applied.
            // The original `this.defaultShowErrors()` call is replaced by this custom logic.
            console.info("Validation: Custom error display logic completed.");

            // Optionally, trigger a custom event after displaying errors.
            jqRef(this.currentForm).trigger('validationErrorsDisplayed', [activeFailureList]);
        }
    };

    // Apply the custom validation settings to jQuery Validator's defaults.
    jqRef.extend(jqRef.validator.defaults, validationGlobalSettings);

}(jQuery)); // Pass jQuery as jqRef to avoid conflicts and for clarity.