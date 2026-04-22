((globalJquery) => {
    'use strict';

    // Helper to retrieve an error message from an element's attributes or provide a fallback.
    const getElementValidationMessage = (targetElement, defaultText) => {
        return targetElement.attr(globalJquery.fn.formValidator.defaults.messageAttribute) ||
               targetElement.attr('placeholder') ||
               defaultText;
    };

    // Helper to visually mark an element and its container as invalid or valid.
    const toggleInputErrorState = (inputElement, enableError) => {
        const errorStylingClass = globalJquery.fn.formValidator.defaults.invalidInputClass;
        const parentContainer = inputElement.closest(globalJquery.fn.formValidator.defaults.formGroupContainer);

        if (enableError) {
            parentContainer.addClass(errorStylingClass);
            inputElement.attr('aria-invalid', 'true');
        } else {
            parentContainer.removeClass(errorStylingClass);
            inputElement.removeAttr('aria-invalid');
        }
    };

    // The main form validation jQuery plugin.
    globalJquery.fn.formValidator = function (customConfig) {
        // Merge default and custom configuration options.
        const activeConfiguration = globalJquery.extend(true, {}, globalJquery.fn.formValidator.defaults, customConfig);

        // Helper to get a RegExp object from a key or a direct regex string.
        const retrieveValidationPattern = (patternKey) => {
            let patternDefinition = globalJquery.fn.formValidator.patterns[patternKey];
            if (patternDefinition instanceof RegExp) {
                return patternDefinition;
            }
            try {
                // Attempt to create a RegExp if the key itself is a regex string.
                return new RegExp(patternKey);
            } catch (error) {
                console.warn(`Validation pattern error: Could not parse '${patternKey}'. Ensure it's a valid key or regex string.`, error);
                return null;
            }
        };

        // Attach the validation logic to the form's submit event.
        return this.on('submit.formValidator', function (submissionEvent) {
            const currentFormElement = globalJquery(this);
            let detectedValidationErrors = [];
            let collectedFormInputData = {};

            // Execute the pre-validation hook.
            activeConfiguration.beforeValidationHook.call(currentFormElement[0]);

            // Clear all previous error indicators from the form.
            currentFormElement.find(`.${activeConfiguration.invalidInputClass}`).removeClass(activeConfiguration.invalidInputClass);
            currentFormElement.find('[aria-invalid="true"]').removeAttr('aria-invalid');
            currentFormElement.find('[data-bs-toggle="tooltip"], [data-original-title]').tooltip('dispose'); // Clean up any tooltips

            // Function to gather all relevant input values from the form.
            const gatherInputValues = () => {
                const harvestedInputData = {};
                currentFormElement.find('input, textarea, select')
                    .filter(":visible, [type='hidden']") // Consider visible and hidden inputs
                    .each(function () {
                        const inputField = globalJquery(this);
                        const inputFieldName = inputField.prop('name');
                        const inputFieldType = inputField.prop('type');

                        // Skip elements without a name attribute or if their immediate parent is hidden.
                        if (!inputFieldName || !inputField.parent().is(':visible')) {
                            return;
                        }

                        let fieldValue;
                        if (inputFieldType === 'checkbox' || inputFieldType === 'radio') {
                            fieldValue = inputField.prop('checked') ? inputField.val() : null;
                        } else {
                            fieldValue = inputField.val();
                        }

                        // Handle multiple inputs with the same name (e.g., multiple checkboxes).
                        if (inputFieldName in harvestedInputData) {
                            // Ensure the existing data is an array before concatenating.
                            harvestedInputData[inputFieldName] = [].concat(harvestedInputData[inputFieldName]);
                            if (fieldValue !== null) { // Only add if it has a value (e.g., checked checkbox).
                                harvestedInputData[inputFieldName].push(fieldValue);
                            }
                        } else {
                            harvestedInputData[inputFieldName] = fieldValue;
                        }
                    });
                return harvestedInputData;
            };

            collectedFormInputData = gatherInputValues();

            // Iterate over all elements designated for validation.
            currentFormElement.find('[data-validation-pattern],[required],[data-matches-field],[data-input-type]')
                .filter(':visible, [type="hidden"]')
                .each(function () {
                    const currentInputEl = globalJquery(this);
                    const inputName = currentInputEl.prop('name');
                    let inputValue = collectedFormInputData[inputName];

                    // Skip validation for elements without a name or if their value wasn't collected.
                    if (!inputName || inputValue === undefined) {
                        return;
                    }

                    // Treat unchecked checkboxes/radios as having an empty value for validation.
                    if ((currentInputEl.prop('type') === 'checkbox' || currentInputEl.prop('type') === 'radio') && !currentInputEl.prop('checked')) {
                        inputValue = '';
                    }

                    // Handle array values (e.g., multiple selections).
                    if (Array.isArray(inputValue)) {
                        // For arrays, only check if it's required and has no selected items.
                        if (currentInputEl.is('[required]') && inputValue.filter(item => item !== null && item !== '').length === 0) {
                            detectedValidationErrors.push({
                                element: currentInputEl[0],
                                message: getElementValidationMessage(currentInputEl, activeConfiguration.defaultRequiredMessage),
                                type: 'mandatory-array'
                            });
                            if (activeConfiguration.stopOnFirstFailure) return false; // Break .each loop
                        }
                        return; // Skip further pattern/match validation for arrays.
                    }

                    const isMandatoryField = currentInputEl.is('[required]');
                    const validationPatternKey = currentInputEl.attr('data-validation-pattern') || currentInputEl.attr('data-input-type');
                    const fieldToMatchName = currentInputEl.attr('data-matches-field');

                    let currentFieldIsValid = true;
                    let validationIssueMessage = '';
                    let validationIssueType = '';

                    // 1. Mandatory field check
                    if (isMandatoryField && (inputValue === null || inputValue === '' || (typeof inputValue === 'string' && inputValue.trim() === ''))) {
                        currentFieldIsValid = false;
                        validationIssueMessage = getElementValidationMessage(currentInputEl, activeConfiguration.defaultRequiredMessage);
                        validationIssueType = 'mandatory';
                    }

                    // 2. Pattern validation (if not already failed and has a non-empty string value)
                    if (currentFieldIsValid && inputValue && typeof inputValue === 'string' && inputValue.length > 0 && validationPatternKey) {
                        const regexPattern = retrieveValidationPattern(validationPatternKey);
                        if (regexPattern && !regexPattern.test(inputValue)) {
                            currentFieldIsValid = false;
                            validationIssueMessage = getElementValidationMessage(currentInputEl, activeConfiguration.defaultPatternMessage);
                            validationIssueType = 'pattern-mismatch';
                        }
                    }

                    // 3. Match field validation (if not already failed)
                    if (currentFieldIsValid && fieldToMatchName) {
                        const matchingFieldValue = collectedFormInputData[fieldToMatchName];
                        if (inputValue !== matchingFieldValue) {
                            currentFieldIsValid = false;
                            validationIssueMessage = getElementValidationMessage(currentInputEl, activeConfiguration.defaultMatchMessage);
                            validationIssueType = 'field-mismatch';

                            // Also mark the paired field as invalid if it's part of the mismatch.
                            const matchedTargetElement = currentFormElement.find(`[name="${fieldToMatchName}"]`);
                            if (matchedTargetElement.length && !detectedValidationErrors.some(err => err.element === matchedTargetElement[0])) {
                                detectedValidationErrors.push({
                                    element: matchedTargetElement[0],
                                    message: getElementValidationMessage(matchedTargetElement, activeConfiguration.defaultMatchMessage),
                                    type: 'field-mismatch-pair'
                                });
                            }
                        }
                    }

                    // If the current field failed any validation, record the error.
                    if (!currentFieldIsValid) {
                        detectedValidationErrors.push({
                            element: currentInputEl[0],
                            message: validationIssueMessage,
                            type: validationIssueType
                        });
                        if (activeConfiguration.stopOnFirstFailure) {
                            return false; // Exit the .each loop immediately.
                        }
                    }
                }); // End of validation loop for each input

            // Determine the final outcome and trigger appropriate callbacks.
            if (detectedValidationErrors.length > 0) {
                submissionEvent.preventDefault(); // Stop form submission.
                activeConfiguration.onValidationFailure.call(currentFormElement[0], submissionEvent, detectedValidationErrors, collectedFormInputData);
            } else {
                activeConfiguration.onValidationSuccess.call(currentFormElement[0], submissionEvent, collectedFormInputData);
            }
        }).attr('novalidate', ''); // Apply HTML5 novalidate attribute to disable native validation.
    };

    // Default configuration options for the formValidator plugin.
    globalJquery.fn.formValidator.defaults = {
        beforeValidationHook: function () { /* Executed before validation starts */ },
        onValidationSuccess: function () { /* Executed if all fields are valid */ },
        onValidationFailure: function () { /* Executed if any field fails validation */ },
        stopOnFirstFailure: false, // If true, validation stops after the first error.
        invalidInputClass: 'is-invalid', // CSS class applied to invalid input's container.
        messageAttribute: 'data-val-msg', // Attribute to read custom validation messages from.
        formGroupContainer: '.form-group, .mb-3, .row', // Selector for the input's parent container.
        defaultRequiredMessage: 'This field is mandatory.',
        defaultPatternMessage: 'The input value is not in a recognized format.',
        defaultMatchMessage: 'The values entered do not match.',
    };

    // Predefined regular expressions for common validation patterns.
    globalJquery.fn.formValidator.patterns = {
        'alpha-text': /^[A-Za-z\s.'-]+$/, // Letters, spaces, apostrophes, hyphens.
        'full-name': /^[A-Za-z\s.'-]+\s[A-Za-z\s.'-]+$/i, // Requires at least two words.
        'numeric-digits': /^\d+$/, // Only non-negative integers.
        'web-url': /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i, // Comprehensive URL pattern.
        'iso-date': /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/, // YYYY-MM-DD or YYYY/MM/DD.
        'email-address': /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'phone-number-int': /^\+?(\d[\d\-. ]+)?(\(?\d{2,}\)?)[\d\-. ]+\d$/, // Flexible international phone number.
        'us-zip-code': /^\d{5}(?:[-\s]\d{4})?$/, // Standard 5-digit or 5+4 US zip.
    };

    // Bootstrap 5+ specific integration helper for form validation.
    globalJquery.fn.bsValidatorIntegration = function (successHandler, initialPayload) {
        return this.formValidator({
            beforeValidationHook: function () {
                const currentForm = globalJquery(this);
                // Clear any existing Bootstrap error indicators.
                currentForm.find(`.${globalJquery.fn.formValidator.defaults.invalidInputClass}`).removeClass(globalJquery.fn.formValidator.defaults.invalidInputClass);
                currentForm.find('[aria-invalid="true"]').removeAttr('aria-invalid');
                // Dispose of any active tooltips to prevent orphaned popovers.
                currentForm.find('[data-bs-toggle="tooltip"], [data-original-title]').tooltip('dispose');
                // Optionally clear and hide a general error alert.
                currentForm.find('.alert.alert-danger').hide().empty();
            },
            onValidationSuccess: function (eventObj, validatedData) {
                if (typeof (successHandler) === 'function') {
                    successHandler.call(this, eventObj, validatedData);
                }
            },
            onValidationFailure: function (eventObj, errorDetails) {
                const currentForm = globalJquery(this);
                let firstInvalidField = null;

                // Process each detected validation error.
                errorDetails.forEach((errorEntry, index) => {
                    const errorInputEl = globalJquery(errorEntry.element);
                    toggleInputErrorState(errorInputEl, true); // Apply visual error state.

                    const displayErrorMsg = errorEntry.message || getElementValidationMessage(errorInputEl, 'Invalid input provided.');

                    // Integrate Bootstrap tooltips for field-specific error messages.
                    errorInputEl.tooltip({
                        trigger: 'manual', // Tooltip is shown programmatically.
                        placement: 'top',
                        title: displayErrorMsg,
                        container: 'body' // Prevents tooltip being clipped by overflow.
                    }).tooltip('show'); // Display the tooltip.

                    // Keep track of the very first invalid element to focus on it later.
                    if (index === 0) {
                        firstInvalidField = errorInputEl;
                        // Populate and show a general error alert if available.
                        const formAlert = currentForm.find('.alert.alert-danger');
                        if (formAlert.length) {
                            formAlert.text(`Please correct the following: ${displayErrorMsg}`).show();
                        }
                    }
                });

                // Focus on the first field that has an error.
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
            },
        });
    };

})(jQuery);