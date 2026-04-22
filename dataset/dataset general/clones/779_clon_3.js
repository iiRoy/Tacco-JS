(function($, window, document, undefined) { // Encapsulate to avoid global pollution

    // --- Application Configuration & Core Utilities ---
    // This module manages client-side form validation, offering a flexible
    // and extensible system for various web applications.
    // Based on an original concept, with substantial modernizations and refactoring.

    // Configurable settings for styling, backend communication, and UI elements.
    // Adjust these values to integrate seamlessly with your project's design and API.
    const validationConfig = {
        apiEndpoint: '/api/form-validation-service.php', // URL for server-side validation checks
        errorTextColor: '#b94a48', // Text color for invalid fields
        errorBorderColor: '#b94a48', // Border color for invalid fields
        successTextColor: '#468847', // Text color for valid fields
        successBorderColor: '#468847', // Border color for valid fields
        requiredFieldSuffix: ' (Required input)', // Suffix for placeholders of mandatory, incomplete fields
        attributeNames: { // Centralized data attribute names for consistency
            isRequired: 'data-validate-mandatory',
            checkType: 'data-validation-kind',
            submitActionTrigger: 'data-form-action',
            onSuccessFunc: 'data-post-validation-hook',
            clearOnSubmit: 'data-reset-on-success'
        },
        styleClasses: { // Centralized CSS class names for styling
            issue: 'field-problem',
            incompleteHighlight: 'field-missing',
            valid: 'field-ok'
        }
    };

    // --- Foundational Helper Functions ---

    /**
     * Determines if a given value is considered "empty" or falsy in a broad sense.
     * This includes undefined, null, NaN, empty strings (after trimming), false boolean, or string '0'.
     * @param {any} testValue - The value to be evaluated.
     * @returns {boolean} True if the value is deemed empty/falsy, false otherwise.
     */
    const isValueConsideredEmpty = function(testValue) {
        if (typeof testValue === 'string') {
            testValue = testValue.trim();
        }
        // Comprehensive check for common empty/falsy representations
        return testValue === undefined || testValue === null || testValue === '' || testValue === false || testValue === 'false' || testValue === 0 || testValue === '0' || (typeof testValue === 'number' && isNaN(testValue));
    };

    /**
     * Checks if a larger string contains a specified smaller substring.
     * @param {string} fragment - The substring to locate.
     * @param {string} sourceString - The string to search within.
     * @returns {boolean} True if the fragment is found, false if not or if inputs are invalid.
     */
    const stringIncludesFragment = function(fragment, sourceString) {
        if (typeof sourceString !== 'string' || typeof fragment !== 'string') {
            return false; // Both inputs must be strings for a valid search.
        }
        return sourceString.includes(fragment);
    };

    // --- Custom Action Handler Example (Type III Addition) ---
    // This function serves as an example of a custom callback that can be executed
    // upon successful form validation, replacing a default form submission.
    const customSuccessCallbackExample = function(targetFormElement) {
        console.groupCollapsed('Custom Form Completion Handler Triggered');
        console.info('Form validation completed successfully!');
        console.log('Form data captured:', targetFormElement.serializeArray());
        console.groupEnd();
        // In a live application, this would typically involve an AJAX submission,
        // UI feedback (e.g., a success modal), or a page redirect.
        alert('All fields are valid! Your custom success function was invoked.');
    };

    // --- Dynamic CSS Injection (Type III Refinement) ---
    // Generates and injects a <style> block into the document head,
    // defining dynamic CSS rules based on the validation configuration.
    const dynamicallyAddStyles = function() {
        const generatedStyle = `<style type='text/css'>
            .val-tooltip-container { position: fixed; z-index:10000000; }
            input[type=text].${validationConfig.styleClasses.issue},
            input[type=password].${validationConfig.styleClasses.issue},
            textarea.${validationConfig.styleClasses.issue},
            select.${validationConfig.styleClasses.issue},
            .${validationConfig.styleClasses.issue} {
                border: 1px solid ${validationConfig.errorBorderColor};
                color: ${validationConfig.errorTextColor};
            }
            input[type=text].${validationConfig.styleClasses.incompleteHighlight},
            input[type=password].${validationConfig.styleClasses.incompleteHighlight},
            textarea.${validationConfig.styleClasses.incompleteHighlight},
            select.${validationConfig.styleClasses.incompleteHighlight},
            .${validationConfig.styleClasses.incompleteHighlight} {
                border: 2px solid ${validationConfig.errorBorderColor};
                color: ${validationConfig.errorTextColor};
            }
            input[type=text].${validationConfig.styleClasses.valid},
            input[type=password].${validationConfig.styleClasses.valid},
            textarea.${validationConfig.styleClasses.valid},
            select.${validationConfig.styleClasses.valid},
            .${validationConfig.styleClasses.valid} {
                border: 1px solid ${validationConfig.successBorderColor};
                color: ${validationConfig.successTextColor};
            }
        </style>`;
        $(generatedStyle).appendTo('head');
        console.info('Form validation system initialized. For module details: https://github.com/cthiggo/validate');
    };

    // --- Main Form Validation Module ---
    // This object encapsulates all logic for validating forms and individual input elements.
    const formValidationEngine = {

        // Expose the configured API endpoint for external use if necessary.
        ajaxValidationApi: validationConfig.apiEndpoint,

        /**
         * Initiates the form submission process, preventing default browser behavior,
         * performing validation, and executing appropriate success or failure handlers.
         * @param {jQuery} formElement - The jQuery object representing the form to be processed.
         * @param {jQuery} triggerButton - The jQuery object representing the button that initiated the submission.
         */
        initiateFormSubmission: function(formElement, triggerButton) {
            // Guard clause: Ensure valid jQuery objects are provided.
            if (!(formElement instanceof $) || formElement.length === 0) {
                console.error('Validation Engine: Invalid form element provided to initiateFormSubmission.');
                return;
            }
            if (!(triggerButton instanceof $) || triggerButton.length === 0) {
                console.warn('Validation Engine: Trigger button not found, proceeding with form validation without specific button context.');
            }

            // Prevent default form submission to manage it programmatically.
            formElement.off('submit.validation').on('submit.validation', function(event) {
                event.preventDefault();
            });

            // Determine the final action to take upon successful validation.
            let finalSuccessHandler = function() { formElement.submit(); }; // Default: native form submission
            const customHandlerName = triggerButton.attr(validationConfig.attributeNames.onSuccessFunc);

            // If a custom success handler is specified and exists in the global scope, use it.
            if (!isValueConsideredEmpty(customHandlerName) && typeof window[customHandlerName] === 'function') {
                finalSuccessHandler = function() { window[customHandlerName](formElement); };
            } else if (!isValueConsideredEmpty(customHandlerName)) {
                console.warn(`Validation Engine: Custom success function "${customHandlerName}" not found or not callable.`);
            }

            // Before starting new validation, clear any previous visual states.
            this._clearAllFieldStates(formElement);

            // Begin the comprehensive form validation procedure.
            this._validateAllFieldsInForm(
                formElement,
                // Callback for overall form success
                () => {
                    finalSuccessHandler(); // Execute the determined success action
                    if (triggerButton.is(`[${validationConfig.attributeNames.clearOnSubmit}]`)) {
                        this._resetFormInputValues(formElement); // Clear form fields if configured
                    }
                },
                // Callback for overall form failure
                () => {
                    this._emphasizeIncompleteFields(formElement); // Make warning fields more visually prominent
                    console.error('Validation Engine: Form submission halted due to incomplete or invalid fields.');
                    // Consider a more sophisticated UI notification instead of a simple alert.
                    alert('Please review and correct the highlighted fields.');
                }
            );
        },

        /**
         * Iterates through all relevant input fields within a form, validating each sequentially.
         * This ensures a thorough check of all fields before determining the form's overall validity.
         * @param {jQuery} formElement - The form whose fields are to be validated.
         * @param {Function} onFormSuccess - Callback to execute if all fields pass validation.
         * @param {Function} onFormFailure - Callback to execute if any field fails validation.
         * @private
         */
        _validateAllFieldsInForm: function(formElement, onFormSuccess, onFormFailure) {
            const relevantInputs = formElement.find('input, textarea, select')
                                                .filter(`[${validationConfig.attributeNames.isRequired}], [${validationConfig.attributeNames.checkType}]`)
                                                .not(':disabled, :hidden, [readonly]'); // Exclude non-interactive fields

            let currentIndex = 0;
            const processNextField = () => {
                // Base case: All inputs have been processed.
                if (currentIndex >= relevantInputs.length) {
                    if (this._isFormCurrentlyValid(formElement)) {
                        onFormSuccess();
                    } else {
                        onFormFailure();
                    }
                    return;
                }

                const currentField = $(relevantInputs[currentIndex]);
                currentIndex++; // Advance to the next input for the subsequent call.

                // Type III Addition: Skip re-validating fields that already have a status.
                // This optimizes performance for fields that might be re-triggered by multiple events.
                if (currentField.hasClass(validationConfig.styleClasses.valid) ||
                    currentField.hasClass(validationConfig.styleClasses.issue) ||
                    currentField.hasClass(validationConfig.styleClasses.incompleteHighlight)) {
                    processNextField(); // Immediately move to the next field.
                    return;
                }

                // Validate the current field, then call processNextField in its completion callback.
                this._validateSingleField(currentField, processNextField);
            };

            processNextField(); // Initiate the sequential validation process.
        },

        /**
         * Validates a single input field based on its configured data attributes.
         * @param {jQuery} inputField - The jQuery object representing the input field.
         * @param {Function} [onCompletion] - Optional callback to execute after validation of this field.
         * @private
         */
        _validateSingleField: function(inputField, onCompletion) {
            // Guard clause: Ensure valid jQuery object.
            if (!(inputField instanceof $) || inputField.length === 0) {
                console.warn('Validation Engine: Invalid inputField provided for single field validation.');
                if (onCompletion) onCompletion();
                return;
            }

            const fieldValue = inputField.val();
            const isMandatory = inputField.is(`[${validationConfig.attributeNames.isRequired}]`);
            const validationKind = inputField.attr(validationConfig.attributeNames.checkType);

            // Type III Addition: If a field is neither mandatory nor has a specific validation type,
            // it's considered valid by default.
            if (!isMandatory && isValueConsideredEmpty(validationKind)) {
                this._applyFieldVisualStatus(inputField, 'valid');
                if (onCompletion) onCompletion();
                return;
            }

            if (isValueConsideredEmpty(fieldValue)) {
                if (isMandatory) {
                    this._applyFieldVisualStatus(inputField, 'issue', 'This field cannot be left empty.');
                } else {
                    this._applyFieldVisualStatus(inputField, 'valid'); // Not mandatory, empty is acceptable.
                }
                if (onCompletion) onCompletion();
                return;
            } else if (!isValueConsideredEmpty(validationKind)) {
                // If a validation type is specified and the field has a value, perform AJAX validation.
                this._performServerValidation(fieldValue, validationKind,
                    // Server validation success
                    () => {
                        this._applyFieldVisualStatus(inputField, 'valid');
                        if (onCompletion) onCompletion();
                    },
                    // Server validation failure
                    (errorMsg) => {
                        this._applyFieldVisualStatus(inputField, 'issue', errorMsg);
                        if (onCompletion) onCompletion();
                    }
                );
            } else {
                // Field has a value, no specific validation type, and not mandatory (or passed mandatory check).
                this._applyFieldVisualStatus(inputField, 'valid');
                if (onCompletion) onCompletion();
            }
        },

        /**
         * Executes an asynchronous request to a backend service for field validation.
         * @param {string} valueToCheck - The value of the field to send for validation.
         * @param {string} validationKind - The type of validation requested (e.g., 'email_format', 'unique_username').
         * @param {Function} onServerSuccess - Callback for a successful server response.
         * @param {Function} onServerFailure - Callback for a server-reported error or AJAX communication failure.
         * @private
         */
        _performServerValidation: function(valueToCheck, validationKind, onServerSuccess, onServerFailure) {
            $.post(this.ajaxValidationApi, { kind: validationKind, value: valueToCheck })
                .done(function(serverReplyData) {
                    // Assuming '1' indicates success, anything else is an error message.
                    if (serverReplyData === '1') {
                        onServerSuccess();
                    } else {
                        onServerFailure(serverReplyData);
                    }
                })
                .fail(function(xhr, status, error) {
                    console.error('Validation Engine: AJAX communication error during server validation:', status, error);
                    onServerFailure('Network or server error occurred.');
                });
        },

        /**
         * Applies visual styling and optional tooltip messages to an input field based on its validation state.
         * Includes specific handling for Chosen.js select boxes.
         * @param {jQuery} fieldElement - The jQuery object of the input field.
         * @param {'valid'|'issue'|'incompleteHighlight'} statusType - The validation status.
         * @param {string} [messageText] - Optional message for a tooltip.
         * @private
         */
        _applyFieldVisualStatus: function(fieldElement, statusType, messageText) {
            // Guard clause: Ensure valid jQuery object.
            if (!(fieldElement instanceof $) || fieldElement.length === 0) return;

            // Special handling for Chosen.js selects: apply classes to their wrapper element.
            if (fieldElement.is('select') && fieldElement.hasClass('chosen')) {
                this._adjustChosenWrapperStyling(fieldElement, (chosenWrapper) => {
                    this._clearFieldVisualState(chosenWrapper); // Clear wrapper's state first
                    chosenWrapper.addClass(validationConfig.styleClasses[statusType]);
                });
            }

            this._clearFieldVisualState(fieldElement); // Clear existing states from the actual input.
            fieldElement.addClass(validationConfig.styleClasses[statusType]);

            // Manage Bootstrap tooltips (Type III: enhanced tooltip control).
            if (messageText) {
                // Destroy any pre-existing tooltips to prevent duplicates or stale messages.
                if (fieldElement.data('bs.tooltip')) {
                    fieldElement.tooltip('dispose'); // Use dispose for Bootstrap 4+
                }
                fieldElement.tooltip({
                    title: messageText,
                    trigger: 'focus', // Show tooltip on focus
                    placement: 'bottom', // Position the tooltip below the element
                    container: 'body', // Append tooltip to body to avoid z-index issues with parent elements
                    template: '<div class="tooltip val-tooltip-container" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
                }).tooltip('show'); // Immediately display the newly created tooltip.
            } else {
                // If no message, ensure any existing tooltip is removed.
                if (fieldElement.data('bs.tooltip')) {
                    fieldElement.tooltip('dispose');
                }
            }
        },

        /**
         * Transforms fields marked with 'issue' status to 'incompleteHighlight' for greater emphasis,
         * typically used when a form submission is attempted with errors. Also updates placeholder text.
         * @param {jQuery} formElement - The form containing the fields to update.
         * @private
         */
        _emphasizeIncompleteFields: function(formElement) {
            // Guard clause: Ensure valid jQuery object.
            if (!(formElement instanceof $) || formElement.length === 0) return;

            const fieldsWithIssues = formElement.find(`:input.${validationConfig.styleClasses.issue}`);
            fieldsWithIssues.each(function() {
                const $field = $(this);
                $field.removeClass(validationConfig.styleClasses.issue);
                $field.addClass(validationConfig.styleClasses.incompleteHighlight);

                // Modify placeholder text to clearly indicate required status.
                const currentPlaceholder = $field.attr('placeholder');
                if (!isValueConsideredEmpty(currentPlaceholder) && !stringIncludesFragment(validationConfig.requiredFieldSuffix, currentPlaceholder)) {
                    $field.attr('placeholder', currentPlaceholder + validationConfig.requiredFieldSuffix);
                }
            });

            // Apply similar emphasis to Chosen.js wrapper elements.
            const chosenIssueWrappers = formElement.find(`.chosen-container.${validationConfig.styleClasses.issue}`);
            chosenIssueWrappers.each(function() {
                const $wrapper = $(this);
                $wrapper.removeClass(validationConfig.styleClasses.issue);
                $wrapper.addClass(validationConfig.styleClasses.incompleteHighlight);

                // Update the text within Chosen's default selection span.
                const chosenDefaultSpan = $wrapper.find('a.chosen-default span');
                const currentText = chosenDefaultSpan.text();
                if (!isValueConsideredEmpty(currentText) && !stringIncludesFragment(validationConfig.requiredFieldSuffix, currentText)) {
                    chosenDefaultSpan.text(currentText + validationConfig.requiredFieldSuffix);
                }
            });
        },

        /**
         * Clears all validation-related CSS classes and tooltips from a single input field.
         * Resets modified placeholder text to its original state.
         * @param {jQuery} fieldElement - The input field to reset.
         * @private
         */
        _clearFieldVisualState: function(fieldElement) {
            // Guard clause: Ensure valid jQuery object.
            if (!(fieldElement instanceof $) || fieldElement.length === 0) return;

            fieldElement.removeClass(validationConfig.styleClasses.valid);
            fieldElement.removeClass(validationConfig.styleClasses.issue);
            fieldElement.removeClass(validationConfig.styleClasses.incompleteHighlight);

            // Dispose of any active Bootstrap tooltips.
            if (fieldElement.data('bs.tooltip')) {
                fieldElement.tooltip('dispose');
            }

            // Reset placeholder text if it was modified with the required suffix.
            const currentPlaceholder = fieldElement.attr('placeholder');
            if (currentPlaceholder && stringIncludesFragment(validationConfig.requiredFieldSuffix, currentPlaceholder)) {
                fieldElement.attr('placeholder', currentPlaceholder.replace(validationConfig.requiredFieldSuffix, ''));
            }
        },

        /**
         * Clears all validation-related visual states (CSS classes, tooltips) from all fields within a form.
         * @param {jQuery} formElement - The form whose fields are to be reset.
         * @private
         */
        _clearAllFieldStates: function(formElement) {
            // Guard clause: Ensure valid jQuery object.
            if (!(formElement instanceof $) || formElement.length === 0) return;

            // Reset each input field and its potential Chosen.js wrapper.
            formElement.find(':input').each((index, element) => {
                this._clearFieldVisualState($(element));
            });
            formElement.find('.chosen-container').each((index, element) => {
                this._clearFieldVisualState($(element));
            });
        },

        /**
         * Resets the values of all input fields within a form to their default empty state.
         * @param {jQuery} formElement - The form whose input values are to be cleared.
         * @private
         */
        _resetFormInputValues: function(formElement) {
            // Guard clause: Ensure valid jQuery object.
            if (!(formElement instanceof $) || formElement.length === 0) return;

            formElement.find(':input').each((index, element) => {
                const $field = $(element);
                if ($field.is('input[type="checkbox"]') || $field.is('input[type="radio"]')) {
                    $field.prop('checked', false); // Uncheck checkboxes and radio buttons.
                } else if ($field.is('select')) {
                    $field.find('option:selected').prop('selected', false); // Deselect options.
                    $field.val(''); // Ensure select value is empty.
                    if ($field.hasClass('chosen')) {
                         $field.trigger('chosen:updated'); // Update Chosen.js display.
                    }
                } else {
                    $field.val(''); // Clear text-based input values.
                }
            });
            this._clearAllFieldStates(formElement); // Also clear any lingering validation states.
        },

        /**
         * Checks the current validation status of all relevant inputs in the form.
         * @param {jQuery} formElement - The form to evaluate.
         * @returns {boolean} True if all relevant inputs are currently marked as valid, false otherwise.
         * @private
         */
        _isFormCurrentlyValid: function(formElement) {
            // Guard clause: Ensure valid jQuery object.
            if (!(formElement instanceof $) || formElement.length === 0) return false;

            // Use .some() to efficiently detect if any relevant input is NOT in a 'valid' state.
            const anyInvalidInputFound = formElement.find('input, textarea, select')
                                            .filter(`[${validationConfig.attributeNames.isRequired}], [${validationConfig.attributeNames.checkType}]`)
                                            .not(':disabled, :hidden, [readonly]')
                                            .toArray() // Convert to a plain array to use Array.prototype.some
                                            .some(el => !$(el).hasClass(validationConfig.styleClasses.valid));

            return !anyInvalidInputFound; // The form is valid if no invalid inputs were found.
        },

        /**
         * Internal helper for applying styling to Chosen.js wrapper elements, as the original select is hidden.
         * @param {jQuery} originalSelectElement - The original `<select>` element with the 'chosen' class.
         * @param {Function} applyStylesToWrapperCallback - A callback function that receives the Chosen.js wrapper jQuery object.
         * @private
         */
        _adjustChosenWrapperStyling: function(originalSelectElement, applyStylesToWrapperCallback) {
            // Guard clause: Ensure it's a valid Chosen.js select.
            if (!(originalSelectElement instanceof $) || originalSelectElement.length === 0 || !originalSelectElement.is('select.chosen')) {
                console.warn('Validation Engine: Invalid Chosen.js select element provided for wrapper styling.');
                return;
            }
            const chosenWrapperId = originalSelectElement.attr('id') + '_chosen';
            const chosenWrapper = $(`#${chosenWrapperId}`);
            if (chosenWrapper.length > 0) {
                applyStylesToWrapperCallback(chosenWrapper);
            } else {
                console.warn(`Validation Engine: Chosen.js wrapper element not found for ID: ${chosenWrapperId}`);
            }
        }
    };

    // --- Document Ready Initialization Block ---
    // This section sets up event listeners and injects styles once the DOM is fully loaded.
    $(document).ready(function() {
        dynamicallyAddStyles(); // Inject custom CSS rules.

        // Event listener for input fields: validate on blur (focus out).
        // Targets any input, textarea, or select that is either mandatory or has a validation type.
        $(`*[${validationConfig.attributeNames.isRequired}], *[${validationConfig.attributeNames.checkType}]`)
            .on('focusout.validation', function() {
                formValidationEngine._validateSingleField($(this));
            });

        // Event listener for Chosen.js select boxes: validate on change.
        // Chosen.js triggers a 'change' event on the original select element itself.
        $('select.chosen').on('change.validation', function() {
            formValidationEngine._validateSingleField($(this));
        });

        // Event listener for custom form submission buttons.
        // These buttons will trigger the validation engine's submission process.
        $(`*[${validationConfig.attributeNames.submitActionTrigger}]`).on('click.validation', function(event) {
            event.preventDefault(); // Crucially prevent the default button action.
            const $clickedButton = $(this);
            const $parentForm = $clickedButton.closest('form');
            if ($parentForm.length > 0) {
                formValidationEngine.initiateFormSubmission($parentForm, $clickedButton);
            } else {
                console.error('Validation Engine: A submit action trigger button was clicked but is not associated with any form.');
                // Additional error handling or user feedback might be implemented here.
            }
        });
    });

    // Optionally expose the validation engine and example custom handler to the global scope
    // This allows for manual invocation or debugging from the browser console.
    window.formValidationEngine = formValidationEngine;
    window.customSuccessCallbackExample = customSuccessCallbackExample;

})(jQuery, window, document);