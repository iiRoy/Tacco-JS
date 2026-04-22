// This module provides a robust and extensible client-side validation framework for forms.
// It tracks form elements, applies a set of defined validation rules, and manages visual feedback.
const _formValidatorUtility = {
    // Internal configuration options for the validation system.
    _settings: {
        errorDisplayClass: 'validation-feedback-message', // CSS class for individual error messages.
        defaultRuleFailureMessage: 'This field does not meet the requirements.', // Generic message for unspecified rule failures.
        invalidFieldClass: 'is-invalid-field', // CSS class applied to invalid input elements.
        validFieldClass: 'is-valid-field' // CSS class applied to valid input elements.
    },

    // A collection of all forms registered with the validation utility.
    // Each entry stores the form's jQuery object, its validation schema, and the success callback.
    registeredForms: {},

    // An internal cache to store references to DOM elements (inputs and their feedback containers).
    // This minimizes redundant DOM queries and improves performance.
    trackedElements: {},

    /**
     * Safely retrieves the current value of a specified input element from the internal cache.
     * This abstraction ensures consistent value retrieval across all validation routines.
     * @param {string} elementIdentifier - The unique ID string of the input element.
     * @returns {string} The trimmed string value of the input, or an empty string if the element is not found or has no value.
     */
    _getFieldValue: (elementIdentifier) => {
        const elementRecord = _formValidatorUtility.trackedElements[elementIdentifier];
        if (!elementRecord || !elementRecord.domElement || elementRecord.domElement.length === 0) {
            console.warn(`Validation Framework: Could not retrieve value for element '${elementIdentifier}'. It is not properly tracked or does not exist in the DOM.`);
            return '';
        }
        // Assuming 'domElement' is a jQuery object.
        return String(elementRecord.domElement.val() || '').trim();
    },

    // A comprehensive set of built-in validation functions.
    // Each function accepts an element ID and a rule-specific payload, returning a boolean indicating validity.
    validationRoutines: {
        /**
         * Verifies if the element's value strictly matches a provided comparison value or another element's value.
         * @param {string} elementId - The ID of the input element being validated.
         * @param {object} rulePayload - An object containing 'comparisonValue' (the value or ID to compare against) and an optional 'compareWithElementId'.
         * @returns {boolean} True if the values are strictly equal, false otherwise.
         */
        isIdenticalTo: function(elementId, rulePayload) {
            const currentFieldData = _formValidatorUtility._getFieldValue(elementId);
            let targetComparisonData = rulePayload.comparisonValue;

            // Handle comparison against another input element dynamically.
            if (typeof targetComparisonData === 'string' && targetComparisonData.startsWith('#')) {
                // If 'comparisonValue' is an ID string (e.g., "#passwordConfirm"), retrieve its value.
                targetComparisonData = _formValidatorUtility._getFieldValue(targetComparisonData.substring(1));
            } else if (rulePayload.compareWithElementId) {
                // An explicit 'compareWithElementId' property takes precedence.
                targetComparisonData = _formValidatorUtility._getFieldValue(rulePayload.compareWithElementId);
            }

            return currentFieldData === String(targetComparisonData).trim();
        },
        /**
         * Checks if the numeric value of the element is strictly less than a specified numeric threshold.
         * @param {string} elementId - The ID of the input element.
         * @param {object} rulePayload - Contains 'numericThreshold' (the upper bound for comparison).
         * @returns {boolean} True if the value is numerically less, false otherwise.
         */
        isNumericallySmallerThan: function(elementId, rulePayload) {
            const currentNumericValue = parseFloat(_formValidatorUtility._getFieldValue(elementId));
            const comparisonThreshold = parseFloat(rulePayload.numericThreshold);
            return !isNaN(currentNumericValue) && !isNaN(comparisonThreshold) && currentNumericValue < comparisonThreshold;
        },
        /**
         * Checks if the numeric value of the element is strictly greater than a specified numeric threshold.
         * @param {string} elementId - The ID of the input element.
         * @param {object} rulePayload - Contains 'numericThreshold' (the lower bound for comparison).
         * @returns {boolean} True if the value is numerically greater, false otherwise.
         */
        isNumericallyLargerThan: function(elementId, rulePayload) {
            const currentNumericValue = parseFloat(_formValidatorUtility._getFieldValue(elementId));
            const comparisonThreshold = parseFloat(rulePayload.numericThreshold);
            return !isNaN(currentNumericValue) && !isNaN(comparisonThreshold) && currentNumericValue > comparisonThreshold;
        },
        /**
         * Ensures the element's value meets or exceeds a minimum character length.
         * @param {string} elementId - The ID of the input element.
         * @param {object} rulePayload - Contains 'minimumLength' (the required minimum number of characters).
         * @returns {boolean} True if the length is sufficient, false otherwise.
         */
        hasMinimumLength: function(elementId, rulePayload) {
            return _formValidatorUtility._getFieldValue(elementId).length >= rulePayload.minimumLength;
        },
        /**
         * Ensures the element's value does not exceed a maximum character length.
         * @param {string} elementId - The ID of the input element.
         * @param {object} rulePayload - Contains 'maximumLength' (the allowed maximum number of characters).
         * @returns {boolean} True if the length is within limits, false otherwise.
         */
        hasMaximumLength: function(elementId, rulePayload) {
            return _formValidatorUtility._getFieldValue(elementId).length <= rulePayload.maximumLength;
        },
        /**
         * Tests the element's value against a provided regular expression pattern.
         * @param {string} elementId - The ID of the input element.
         * @param {object} rulePayload - Contains 'regexPattern' (a RegExp object to apply).
         * @returns {boolean} True if the value matches the pattern, false otherwise.
         */
        matchesRegex: function(elementId, rulePayload) {
            if (!(rulePayload.regexPattern instanceof RegExp)) {
                console.error(`Validation Framework: Rule 'matchesRegex' for '${elementId}' requires a valid RegExp object in 'regexPattern'.`);
                return false; // Fail safe if pattern is invalid.
            }
            return rulePayload.regexPattern.test(_formValidatorUtility._getFieldValue(elementId));
        },
        /**
         * Validates if the element's value adheres to a standard email address format.
         * @param {string} elementId - The ID of the input element.
         * @param {object} rulePayload - (Optional) Rule-specific overrides, not directly used by this routine itself.
         * @returns {boolean} True if the value is a valid email, false otherwise.
         */
        isEmailFormatValid: function(elementId, rulePayload) {
            // A common, yet not exhaustive, regex for email validation.
            const emailValidationPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            // Reuses the generic regex matching routine for consistency.
            return _formValidatorUtility.validationRoutines.matchesRegex(elementId, { regexPattern: emailValidationPattern, failureMessage: 'Please provide a correctly formatted email address.' });
        },
        /**
         * Checks if the element's value is not empty after trimming whitespace.
         * @param {string} elementId - The ID of the input element.
         * @param {object} rulePayload - (Optional) Rule-specific overrides.
         * @returns {boolean} True if the field contains non-whitespace characters, false otherwise.
         */
        isMandatory: function(elementId, rulePayload) {
            return _formValidatorUtility._getFieldValue(elementId).length > 0;
        }
    },

    /**
     * Executes all specified validation rules for a single input element.
     * It updates the element's visual state and displays feedback messages.
     * @param {string} elementId - The ID of the input element to be validated.
     * @param {object} validationSchema - An object defining the validation rules and their parameters for this element.
     * @returns {boolean} True if all rules pass for the element, false otherwise.
     */
    checkIndividualElementValidity: function(elementId, validationSchema) {
        let allValidationsPassed = true;
        let elementRecord = _formValidatorUtility.trackedElements[elementId];

        // Ensure the element is tracked; if not, attempt to locate and cache it.
        if (!elementRecord || !elementRecord.domElement || elementRecord.domElement.length === 0) {
            const domTargetElement = $(`#${elementId}`);
            if (domTargetElement.length === 0) {
                console.warn(`Validation Framework: Element with ID '${elementId}' specified in validation schema was not found in the DOM. Skipping validation for this element.`);
                return true; // Consider as valid if element doesn't exist to avoid blocking form submission.
            }
            // Cache the element and its feedback container for future use.
            elementRecord = _formValidatorUtility.trackedElements[elementId] = {
                domElement: domTargetElement,
                feedbackContainer: $(`#error-${elementId}`) // Assumes error container ID pattern.
            };
        }

        const { domElement, feedbackContainer } = elementRecord;

        // Reset visual state and clear previous error messages.
        domElement.removeClass(_formValidatorUtility._settings.invalidFieldClass).removeClass(_formValidatorUtility._settings.validFieldClass);
        if (feedbackContainer && feedbackContainer.length > 0) {
            feedbackContainer.empty().hide();
        }

        // Iterate through each rule defined for the current element.
        for (const ruleKey of Object.keys(validationSchema)) {
            const ruleParameters = validationSchema[ruleKey];
            const ruleExecutor = _formValidatorUtility.validationRoutines[ruleKey];

            // Guard: Log a warning if an unknown rule is specified and skip it.
            if (!ruleExecutor) {
                console.warn(`Validation Framework: Encountered an undefined validation rule '${ruleKey}' for element '${elementId}'. Please ensure it is registered.`);
                continue;
            }

            // Execute the validation function.
            if (!ruleExecutor(elementId, ruleParameters)) {
                allValidationsPassed = false; // A single failure makes the element invalid.

                // Display the specific error message if a feedback container is present.
                if (feedbackContainer && feedbackContainer.length > 0) {
                    const failureMessage = ruleParameters.failureMessage || _formValidatorUtility._settings.defaultRuleFailureMessage;
                    feedbackContainer.append(`<div class="${_formValidatorUtility._settings.errorDisplayClass}" data-validation-rule="${ruleKey}">${failureMessage}</div>`);
                    feedbackContainer.show();
                }
            }
        }

        // Apply appropriate CSS class to the input based on the validation outcome.
        domElement.addClass(allValidationsPassed ? _formValidatorUtility._settings.validFieldClass : _formValidatorUtility._settings.invalidFieldClass);

        return allValidationsPassed;
    },

    /**
     * Orchestrates the validation of multiple input elements, typically representing an entire form.
     * It aggregates the results from individual element validations.
     * @param {object} elementsForValidation - An object mapping element IDs to their validation schemas.
     * @returns {boolean} True if ALL elements successfully pass their validations, false otherwise.
     */
    processFormElementValidations: function(elementsForValidation) {
        let overallFormValidity = true;
        const allElementIds = Object.keys(elementsForValidation);

        // Iterate over all elements designated for validation.
        for (const currentElementIdentifier of allElementIds) {
            // The form is considered invalid if even one element fails its checks.
            if (!_formValidatorUtility.checkIndividualElementValidity(currentElementIdentifier, elementsForValidation[currentElementIdentifier])) {
                overallFormValidity = false;
            }
        }
        return overallFormValidity;
    }
};

/**
 * Allows developers to extend the validation framework by registering custom validation routines.
 * @param {string} customRuleName - A unique string identifier for the new validation rule.
 * @param {Function} customRuleImplementation - The function that defines the validation logic.
 *   This function should accept a jQuery element object and the rule's payload, returning a boolean.
 */
const registerCustomValidationRule = function(customRuleName, customRuleImplementation) {
    if (typeof customRuleImplementation !== 'function') {
        console.error(`Validation Framework: Attempt to register custom rule '${customRuleName}' with an invalid implementation type. A function is required.`);
        return;
    }
    // Wrap the custom implementation to conform to the internal routine signature (elementId, rulePayload).
    _formValidatorUtility.validationRoutines[customRuleName] = function(elementId, rulePayload) {
        const elementRecord = _formValidatorUtility.trackedElements[elementId];
        // Provide the actual jQuery element to the custom function.
        if (!elementRecord || !elementRecord.domElement) {
            console.warn(`Validation Framework: Custom rule '${customRuleName}' invoked for untracked element '${elementId}'.`);
            return false; // Default to invalid if element is not properly managed.
        }
        return customRuleImplementation(elementRecord.domElement, rulePayload);
    };
};

/**
 * Extends the jQuery prototype to enable easy attachment of validation rules to forms.
 * This method initializes form validation and configures the form's submit event handler.
 * @param {object} formValidationSchema - An object detailing the validation rules for inputs within the form.
 * @param {Function} onSubmitSuccessHandler - A callback function to be executed if all form validations pass upon submission.
 * @returns {jQuery} The jQuery object of the form, allowing for method chaining.
 */
jQuery.fn.attachFormValidation = function(formValidationSchema, onSubmitSuccessHandler) {
    const formUniqueId = this.attr('id');

    // Mandate that forms must have an ID for proper tracking and management.
    if (!formUniqueId) {
        console.error('Validation Framework: Cannot attach validation to a form without a unique ID attribute. Please provide an ID.');
        return this; // Return jQuery object for chaining.
    }

    // Prevent re-initialization if validation is already attached to this form.
    if (!_formValidatorUtility.registeredForms[formUniqueId]) {
        _formValidatorUtility.registeredForms[formUniqueId] = {
            formReference: this, // Store the jQuery object reference of the form.
            validationConfig: formValidationSchema,
            successCallback: onSubmitSuccessHandler
        };

        // Proactively cache all relevant input elements and their feedback containers for this form.
        // This is a performance optimization to avoid repeated DOM lookups during validation.
        for (const inputKey in formValidationSchema) {
            if (Object.prototype.hasOwnProperty.call(formValidationSchema, inputKey)) {
                if (!_formValidatorUtility.trackedElements[inputKey]) {
                    _formValidatorUtility.trackedElements[inputKey] = {
                        domElement: $(`#${inputKey}`),
                        feedbackContainer: $(`#error-${inputKey}`)
                    };
                }
            }
        }

        // Attach the submit event handler to intercept form submissions.
        this.on('submit', function(eventTrigger) {
            const currentFormRecord = _formValidatorUtility.registeredForms[$(this).attr('id')];

            // Safety check: if for some reason the form record is missing, prevent submission.
            if (!currentFormRecord) {
                console.error(`Validation Framework: Form record for ID '${$(this).attr('id')}' not found during submit event. Preventing default submission.`);
                eventTrigger.preventDefault();
                return;
            }

            // Execute all validations for the form's inputs.
            if (_formValidatorUtility.processFormElementValidations(currentFormRecord.validationConfig)) {
                // If all validations pass, invoke the user-defined success callback.
                if (typeof currentFormRecord.successCallback === 'function') {
                    currentFormRecord.successCallback(eventTrigger);
                }
                // If no success callback is provided, the form will submit normally by default.
            } else {
                // If any validation fails, prevent the default form submission.
                eventTrigger.preventDefault();
            }
        });
    }
    return this; // Maintain jQuery chainability.
};