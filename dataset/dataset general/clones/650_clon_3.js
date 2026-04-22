const ApplicationConfiguration = {
    CssTokens: {
        VALID_FEEDBACK_CLASS: 'valid-feedback-msg',
        INVALID_FEEDBACK_CLASS: 'invalid-feedback-msg',
        INLINE_ASSISTANCE_CLASS: 'auxiliary-text',
        FIELD_CONTAINER_CLASS: 'form-field-wrapper',
        ERROR_INDICATION_CLASS: 'state-error'
    },
    DomSelectors: {
        ALL_VALIDATION_SPANS: 'span.valid-feedback-msg, span.invalid-feedback-msg',
        ALL_FORMS: 'form',
        FIELD_WRAPPER_ELEMENTS: '.form-field-wrapper',
        ERROR_MESSAGE_SPAN: 'span.invalid-feedback-msg'
    }
};

/**
 * This module manages the visual representation of client-side form validation.
 * It ensures that validation messages and the interactive states of form fields
 * are correctly managed both when the page initially loads and during form submissions.
 */
const FormInteractionProcessor = (function () {

    /**
     * Updates the visual error state of a given form field container.
     * @param {jQuery} fieldWrapperElement - The jQuery object representing the field's wrapper.
     * @param {boolean} shouldShowError - True to add the error class, false to remove it.
     */
    function updateFieldWrapperErrorState(fieldWrapperElement, shouldShowError) {
        // Guard clause: Ensure a valid jQuery element is provided.
        if (!fieldWrapperElement || fieldWrapperElement.length === 0) {
            // console.debug("Attempted to update error state on an empty or invalid element."); // Optional debug
            return;
        }

        const errorClass = ApplicationConfiguration.CssTokens.ERROR_INDICATION_CLASS;

        if (shouldShowError) {
            // Add the error class if it's not already present.
            if (!fieldWrapperElement.hasClass(errorClass)) {
                fieldWrapperElement.addClass(errorClass);
            }
        } else {
            // Remove the error class if it is present.
            if (fieldWrapperElement.hasClass(errorClass)) {
                fieldWrapperElement.removeClass(errorClass);
            }
        }
    }

    /**
     * Applies initial styling to all validation message spans found on the page.
     * This function executes once the Document Object Model (DOM) is fully loaded.
     */
    function applyInitialValidationSpanStyling() {
        const validationMessageSpans = $(ApplicationConfiguration.DomSelectors.ALL_VALIDATION_SPANS);

        // If no relevant spans are found, there's no need to proceed.
        if (validationMessageSpans.length === 0) {
            // console.info("No validation message spans detected for initial styling."); // Optional info
            return;
        }

        // Iterate through each identified span element using a modern iteration approach.
        // The .get() method converts the jQuery object into a native JavaScript array.
        for (const currentSpanElement of validationMessageSpans.get()) {
            const $currentSpan = $(currentSpanElement);
            const auxiliaryClass = ApplicationConfiguration.CssTokens.INLINE_ASSISTANCE_CLASS;

            // Only add the class if it's not already assigned to avoid redundant DOM manipulation.
            if (!$currentSpan.hasClass(auxiliaryClass)) {
                $currentSpan.addClass(auxiliaryClass);
            }
        }
    }

    /**
     * This function processes the state of a form following a submission attempt.
     * It updates the visual error indicators on form fields based on validation results.
     * @param {jQuery} submittedFormElement - The jQuery object representing the form that was submitted.
     */
    function handleFormSubmissionResult(submittedFormElement) {
        // Pre-check: Ensure a valid form element is passed.
        if (!submittedFormElement || submittedFormElement.length === 0) {
            console.warn("Cannot process submission for a non-existent or invalid form element.");
            return;
        }

        const formIsCurrentlyValid = submittedFormElement.valid(); // Determines the overall validity of the form.

        const fieldContainers = submittedFormElement.find(ApplicationConfiguration.DomSelectors.FIELD_WRAPPER_ELEMENTS);

        // Guard clause: If no field containers are found, skip further processing.
        if (fieldContainers.length === 0) {
            // console.info("No field wrapper elements found within the submitted form."); // Optional info
            return;
        }

        // Iterate over each field container to adjust its error state.
        fieldContainers.each(function () {
            const $currentContainer = $(this);
            // Check if this specific container holds any active validation error messages.
            const containerHasErrors = $currentContainer.find(ApplicationConfiguration.DomSelectors.ERROR_MESSAGE_SPAN).length > 0;

            // Logic Adjustment:
            // If the entire form is valid, ensure all field wrappers clear any error states.
            // If the form is invalid, only apply error states to wrappers that explicitly contain error messages.
            if (formIsCurrentlyValid) {
                updateFieldWrapperErrorState($currentContainer, false); // Clear error state for all fields
            } else {
                updateFieldWrapperErrorState($currentContainer, containerHasErrors); // Apply error state only if errors exist
            }
        });
    }

    /**
     * Initializes the error states for form fields on page load,
     * primarily to display server-side validation errors correctly.
     * @param {jQuery} targetFormObj - The specific form (as a jQuery object) to initialize.
     */
    function setupInitialFormErrorDisplay(targetFormObj) {
        // Guard clause: Exit if the target form object is invalid or empty.
        if (!targetFormObj || targetFormObj.length === 0) {
            console.warn("Attempted to set up initial error display for an invalid form object.");
            return;
        }

        const allFieldWrappers = targetFormObj.find(ApplicationConfiguration.DomSelectors.FIELD_WRAPPER_ELEMENTS);

        // If no field wrappers are found, there's nothing to initialize.
        if (allFieldWrappers.length === 0) {
            // console.debug("No field wrappers to initialize for form:", targetFormObj.attr('id') || 'unnamed'); // Optional debug
            return;
        }

        // Process each field wrapper to check for existing error messages.
        allFieldWrappers.each(function () {
            const $currentFieldWrapper = $(this);
            const containsErrorMessage = $currentFieldWrapper.find(ApplicationConfiguration.DomSelectors.ERROR_MESSAGE_SPAN).length > 0;

            // Apply the error state if an error message is present.
            updateFieldWrapperErrorState($currentFieldWrapper, containsErrorMessage);
        });
    }

    /**
     * Orchestrates the attachment of all necessary event listeners and
     * the execution of initial display setup routines once the DOM is ready.
     */
    function attachEventDelegatesAndInitializeView() {
        // Step 1: Configure the initial visual appearance of validation message spans.
        applyInitialValidationSpanStyling();

        // Step 2: Attach a submit event listener to all forms.
        // Using .on() for more flexible event handling compared to shorthand .submit().
        $(ApplicationConfiguration.DomSelectors.ALL_FORMS).on('submit', function (eventObject) {
            // 'this' refers to the native DOM element of the form.
            const $formBeingProcessed = $(this);
            handleFormSubmissionResult($formBeingProcessed);
            // jQuery Validation's .valid() method automatically prevents default submission
            // if validation fails, so no explicit event.preventDefault() is needed here.
        });

        // Step 3: Initialize the error states for all forms when the page first loads.
        // This is crucial for forms that might contain server-side validation errors.
        $(ApplicationConfiguration.DomSelectors.ALL_FORMS).each(function () {
            setupInitialFormErrorDisplay($(this));
        });
    }

    // Public API: Expose only the initialization function.
    return {
        startUp: attachEventDelegatesAndInitializeView
    };

})(); // Self-executing function to create a module scope.

// Execute the main initialization routine when the entire DOM is ready.
$(document).ready(function () {
    FormInteractionProcessor.startUp();
});


// --- Configuration Module for jQuery Validation Plugin Defaults ---

/**
 * This self-executing module configures the default behavior of the
 * jQuery Validation plugin, specifically how it highlights and unhighlights
 * form elements based on their validation status.
 */
const ValidationPluginGlobalDefaults = (function () {
    // Crucial Guard Clause: Check if the jQuery Validation plugin is loaded.
    if (typeof $.validator === 'undefined') {
        console.warn("jQuery Validation plugin is not detected. Skipping default configuration.");
        return; // Exit if the validator object is not available.
    }

    // Apply global default settings to the jQuery Validation plugin.
    $.validator.setDefaults({
        /**
         * Function executed when a form element fails validation.
         * @param {HTMLElement} invalidElement - The native DOM element that failed validation.
         */
        highlight: function (invalidElement) {
            // Find the nearest ancestor wrapper element that serves as the field container.
            // Using .parents() with ':first' ensures we get the most immediate parent with the class.
            const $fieldWrapper = $(invalidElement).parents(`.${ApplicationConfiguration.CssTokens.FIELD_CONTAINER_CLASS}:first`);

            // Verify that a wrapper was found before attempting to modify its classes.
            if ($fieldWrapper.length > 0) {
                $fieldWrapper.addClass(ApplicationConfiguration.CssTokens.ERROR_INDICATION_CLASS);
            } else {
                // console.debug(`No field wrapper found for invalid element:`, invalidElement); // Optional debug
            }
        },
        /**
         * Function executed when a form element passes validation (or becomes valid).
         * @param {HTMLElement} validElement - The native DOM element that passed validation.
         */
        unhighlight: function (validElement) {
            // Find the closest ancestor wrapper element for the validated field.
            // .closest() searches up the DOM tree for the first element that matches the selector.
            const $fieldWrapper = $(validElement).closest(`.${ApplicationConfiguration.CssTokens.FIELD_CONTAINER_CLASS}`);

            // Verify that a wrapper was found.
            if ($fieldWrapper.length > 0) {
                $fieldWrapper.removeClass(ApplicationConfiguration.CssTokens.ERROR_INDICATION_CLASS);
            }
        }
        // Additional default options could be added here, such as `errorPlacement` or `success`.
        // Example of a custom `success` handler:
        // success: function (errorLabelElement, validatedFieldElement) {
        //     const $fieldContainer = $(validatedFieldElement).closest(`.${ApplicationConfiguration.CssTokens.FIELD_CONTAINER_CLASS}`);
        //     if ($fieldContainer.length > 0) {
        //         $fieldContainer.removeClass(ApplicationConfiguration.CssTokens.ERROR_INDICATION_CLASS);
        //     }
        //     errorLabelElement.remove(); // Remove the error label if using default error placement
        // }
    });

    // This module's purpose is purely configuration; it doesn't expose any public methods.
    return {};
})();