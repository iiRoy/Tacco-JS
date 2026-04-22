(function($) {

    /**
     * FormShield jQuery Plugin for Enhanced Form Management
     *
     * This module provides extended functionalities for HTML forms,
     * including client-side validation and interactive field behaviors.
     * It builds upon the foundational concepts of modern form design.
     *
     * Original concept by: Developer A
     * Enhanced by: Engineer B for improved parent traversal logic
     * Further developed by: Architect C for dynamic text input styling
     * Optimized and extended by: Lead Dev D with validation states and data attributes
     * Validation routines integrated by: Core Team E, adapted from an internal library.
     *
     * @see https://example.com/formshield-docs/
     * @license Apache-2.0 https://www.apache.org/licenses/LICENSE-2.0
     */
    $.fn.formShield = function(userOptions) {

        /**
         * Consolidates default settings with user-provided options.
         *
         * @type {object}
         */
        const pluginConfig = $.extend(
            true, // Deep merge
            $.fn.formShield.defaults,
            userOptions
        );

        /**
         * Stores internationalization strings for messages and labels.
         *
         * @type {object}
         */
        const i18nMessages = $.fn.formShield.localization;

        /**
         * Utility for localizing messages with placeholders.
         *
         * @param {string} msgKey The key for the message in `i18nMessages`.
         * @param {...*} formatArgs Arguments to substitute into the message.
         * @returns {string} The localized and formatted message.
         */
        const getLocalizedMessage = function(msgKey) {
            let messageTemplate = i18nMessages[msgKey] || `Missing message for key: ${msgKey}`;
            let formattedMessage = messageTemplate.split('%');
            let output = formattedMessage[0];
            const placeholderPattern = /^([ds])(.*)$/;

            for (let i = 1; i < formattedMessage.length; i++) {
                const matchResult = placeholderPattern.exec(formattedMessage[i]);
                if (!matchResult || arguments[i] === undefined || arguments[i] === null) {
                    output += '%' + formattedMessage[i]; // Keep original if no match or arg missing
                    continue;
                }
                const [_, type, restOfString] = matchResult;
                const argValue = arguments[i];

                if (type === 'd') {
                    output += Number.parseInt(argValue, 10);
                } else if (type === 's') {
                    output += String(argValue);
                }
                output += restOfString;
            }
            return output;
        };

        /**
         * Collection of client-side validation routines.
         * Each routine returns `true` if valid, or an error message string if invalid.
         *
         * @type {object}
         */
        this.validationEngines = {

            /**
             * Extracts a numeric parameter value from an element's class list.
             * E.g., for class "checkMin-val-10", it extracts 10.
             *
             * @param {string} parameterClassPrefix The prefix for the class, e.g., 'checkMin'.
             * @param {string} elementCssClasses A space-separated string of CSS classes.
             * @param {number} defaultValue A default numeric value if not found.
             * @returns {number} The extracted numeric value or the default.
             */
            retrieveClassParameter: function(parameterClassPrefix, elementCssClasses, defaultValue) {
                let extractedValue = defaultValue;
                const classesArray = elementCssClasses.split(/\s+/);
                for (let i = 0; i < classesArray.length; i++) {
                    if (classesArray[i] === parameterClassPrefix) {
                        // Check if the next class is in the 'val-X' format
                        if (classesArray[i + 1] && classesArray[i + 1].startsWith('val-')) {
                            const valuePart = classesArray[i + 1].substring(4);
                            const parsed = Number.parseInt(valuePart, 10);
                            if (!Number.isNaN(parsed)) {
                                extractedValue = parsed;
                                break;
                            }
                        }
                    }
                }
                return extractedValue;
            },

            /**
             * Checks if a field's value is not empty after trimming whitespace.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            validatePresence: function(fieldEl, fieldLabel) {
                if (!fieldLabel) {
                    console.warn("Validation: Field label missing for required check.");
                }

                const fieldType = fieldEl.prop('type');
                if (fieldType === 'radio') {
                    const groupName = fieldEl.prop('name');
                    if ($(`input[name="${groupName}"]:checked`).length > 0) {
                        return true;
                    }
                    return getLocalizedMessage('requiredRadio', fieldLabel);
                }
                if (fieldType === 'checkbox') {
                    if (fieldEl.is(":checked")) {
                        return true;
                    }
                    return getLocalizedMessage('requiredCheckbox', fieldLabel);
                }

                if (fieldEl.val().trim() === '') {
                    return getLocalizedMessage('requiredField', fieldLabel);
                }
                return true;
            },

            /**
             * Ensures field value meets a minimum length requirement.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            verifyMinLength: function(fieldEl, fieldLabel) {
                const minLen = this.retrieveClassParameter('verifyMinLength', fieldEl.attr('class'), 0);
                const currentValue = fieldEl.val();

                if (minLen > 0 && currentValue.length < minLen) {
                    return getLocalizedMessage('minLength', fieldLabel, minLen);
                }
                return true;
            },

            /**
             * Verifies that a numeric field's value is at least a specified minimum.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            verifyMinValue: function(fieldEl, fieldLabel) {
                const minVal = this.retrieveClassParameter('verifyMinValue', fieldEl.attr('class'), 0);
                const numericValue = Number.parseInt(fieldEl.val(), 10);

                if (Number.isNaN(numericValue) || numericValue < minVal) {
                    return getLocalizedMessage('minValue', fieldLabel, minVal);
                }
                return true;
            },

            /**
             * Ensures field value does not exceed a maximum length requirement.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            verifyMaxLength: function(fieldEl, fieldLabel) {
                const maxLen = this.retrieveClassParameter('verifyMaxLength', fieldEl.attr('class'), 0);
                const currentValue = fieldEl.val();

                if (maxLen > 0 && currentValue.length > maxLen) {
                    return getLocalizedMessage('maxLength', fieldLabel, maxLen);
                }
                return true;
            },

            /**
             * Verifies that a numeric field's value does not exceed a specified maximum.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            verifyMaxValue: function(fieldEl, fieldLabel) {
                const maxVal = this.retrieveClassParameter('verifyMaxValue', fieldEl.attr('class'), 0);
                const numericValue = Number.parseInt(fieldEl.val(), 10);

                if (Number.isNaN(numericValue) || numericValue > maxVal) {
                    return getLocalizedMessage('maxValue', fieldLabel, maxVal);
                }
                return true;
            },

            /**
             * Checks if the field's value matches the value of another specified field.
             * Expects a class like "matchField-other_field_name".
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            matchFieldValue: function(fieldEl, fieldLabel) {
                const classes = fieldEl.attr('class').split(/\s+/);
                let targetFieldName = '';

                for (let i = 0; i < classes.length; i++) {
                    if (classes[i] === 'matchField') { // Changed from validateSameAs
                        if (classes[i + 1] && !classes[i + 1].startsWith('val-')) { // Ensure it's not a val-parameter
                            targetFieldName = classes[i + 1];
                            break;
                        }
                    }
                }

                if (!targetFieldName) {
                    return true; // No target field specified, validation passes by default.
                }

                const comparisonField = $(`input[name="${targetFieldName}"]`);
                if (comparisonField.length === 0) {
                    console.warn(`FormShield: Comparison field "${targetFieldName}" not found for "${fieldEl.prop('name')}".`);
                    return true;
                }

                if (comparisonField.val() !== fieldEl.val()) {
                    const comparisonFieldLabel = comparisonField.closest(`div.${pluginConfig.fieldContainerClass}`).find('label').text().replace(/\s*\*\s*$/, '');
                    return getLocalizedMessage('notMatching', fieldLabel, comparisonFieldLabel);
                }
                return true;
            },

            /**
             * Validates if the field contains a properly formatted email address.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isValidEmail: function(fieldEl, fieldLabel) {
                if (fieldEl.val().trim() === '') return true; // Allow empty
                const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if (emailRegex.test(fieldEl.val())) {
                    return true;
                }
                return getLocalizedMessage('invalidEmail', fieldLabel);
            },

            /**
             * Validates if the field contains a properly formatted URL.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isValidUrl: function(fieldEl, fieldLabel) {
                if (fieldEl.val().trim() === '') return true; // Allow empty
                const urlRegex = /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i;
                if (urlRegex.test(fieldEl.val())) {
                    return true;
                }
                return getLocalizedMessage('invalidUrl', fieldLabel);
            },

            /**
             * Checks if the field's value is a valid number (integer or float).
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isNumeric: function(fieldEl, fieldLabel) {
                const value = fieldEl.val().trim();
                if (value === '') return true; // Allow empty
                const numericRegex = /^(?:-?\d+(?:\.\d*)?|-?\.\d+)$/;
                if (numericRegex.test(value)) {
                    return true;
                }
                return getLocalizedMessage('notANumber', fieldLabel);
            },

            /**
             * Checks if the field's value is a valid integer.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isInteger: function(fieldEl, fieldLabel) {
                const value = fieldEl.val().trim();
                if (value === '') return true; // Allow empty
                const integerRegex = /^-?\d+$/;
                if (integerRegex.test(value)) {
                    return true;
                }
                return getLocalizedMessage('notAnInteger', fieldLabel);
            },

            /**
             * Checks if the field's value contains only alphabetical characters.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isAlphabetical: function(fieldEl, fieldLabel) {
                const value = fieldEl.val().trim();
                if (value === '') return true; // Allow empty
                const alphaRegex = /^[a-zA-Z]+$/;
                if (alphaRegex.test(value)) {
                    return true;
                }
                return getLocalizedMessage('notAlpha', fieldLabel);
            },

            /**
             * Checks if the field's value contains only alphanumeric characters.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isAlphanumeric: function(fieldEl, fieldLabel) {
                const value = fieldEl.val().trim();
                if (value === '') return true; // Allow empty
                const alphaNumRegex = /^\w+$/; // \w includes letters, numbers, and underscore
                if (alphaNumRegex.test(value)) {
                    return true;
                }
                return getLocalizedMessage('notAlphaNum', fieldLabel);
            },

            /**
             * Validates if the field contains a simple phrase (letters, numbers, basic punctuation).
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isSimplePhrase: function(fieldEl, fieldLabel) {
                const value = fieldEl.val();
                if (value === '') return true; // Allow empty
                const phraseRegex = /^[\w\d\.\-_\(\)\*'# :,]+$/i;
                if (phraseRegex.test(value)) {
                    return true;
                }
                return getLocalizedMessage('invalidPhrase', fieldLabel);
            },

            /**
             * Checks if the field's value is a valid phone number format.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isPhoneNumber: function(fieldEl, fieldLabel) {
                const value = fieldEl.val().trim();
                if (value === '') return true; // Allow empty
                const phoneRegex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
                if (phoneRegex.test(value)) {
                    return true;
                }
                return getLocalizedMessage('invalidPhone', fieldLabel);
            },

            /**
             * Validates if the field contains a date in MM/DD/YYYY format.
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            isValidDate: function(fieldEl, fieldLabel) {
                const value = fieldEl.val().trim();
                if (value === '') return true; // Allow empty
                const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[1-2][0-9]|3[0-1])\/(19|20)\d{2}$/;
                if (dateRegex.test(value)) {
                    return true;
                }
                return getLocalizedMessage('invalidDate', fieldLabel);
            },

            /**
             * Executes a custom validation function defined globally (on `window`).
             * Expects a class like "customValidation-myGlobalFunction".
             *
             * @param {jQuery} fieldEl The jQuery object for the input field.
             * @param {string} fieldLabel The user-friendly label for the field.
             * @returns {boolean|string} True if valid, error message otherwise.
             */
            executeCustomValidation: function(fieldEl, fieldLabel) {
                const classes = fieldEl.attr('class').split(/\s+/);
                let customFunctionName = '';

                for (let i = 0; i < classes.length; i++) {
                    if (classes[i] === 'customValidation') { // Changed from validateCallback
                        if (classes[i + 1] && !classes[i + 1].startsWith('val-')) {
                            customFunctionName = classes[i + 1];
                            break;
                        }
                    }
                }

                if (!customFunctionName) {
                    console.warn(`FormShield: "customValidation" class found but no function name specified for field "${fieldEl.prop('name')}".`);
                    return true; // No custom function specified, passes by default
                }

                const customFunc = window[customFunctionName];
                if (typeof customFunc === 'function') {
                    return customFunc(fieldEl, fieldLabel);
                }

                console.error(`FormShield: Custom validation function "${customFunctionName}" not found or not a function.`);
                return getLocalizedMessage('missingCallback', fieldLabel, customFunctionName);
            }
        };

        /**
         * Displays a formatted error message block above the form.
         *
         * @param {jQuery} targetForm The jQuery object for the form.
         * @param {string} alertTitle The main title for the error message.
         * @param {string[]} errorMessages An array of individual error messages.
         * @returns {boolean} Always returns false.
         */
        const displayFormAlert = function(targetForm, alertTitle, errorMessages) {
            const errorContainerId = 'formShieldErrorDisplay';
            const existingError = $(`#${errorContainerId}`);

            if (existingError.length) {
                existingError.slideUp(pluginConfig.animationSpeed, function() {
                    $(this).remove();
                });
            }

            const alertBox = $('<div>')
                .attr('id', errorContainerId)
                .addClass(pluginConfig.errorDisplayClass)
                .html(`<h3>${alertTitle}</h3>`);

            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                const errorList = $('<ol>');
                errorMessages.forEach(msg => errorList.append($('<li>').text(msg)));
                alertBox.append(errorList);
            } else if (typeof errorMessages === 'string' && errorMessages.length > 0) {
                alertBox.append($('<p>').text(errorMessages));
            }


            targetForm.prepend(alertBox);
            $('html, body').animate({
                scrollTop: targetForm.offset().top
            }, pluginConfig.scrollSpeed);
            alertBox.slideDown(pluginConfig.animationSpeed);

            return false;
        };

        /**
         * Displays a formatted success message block above the form.
         *
         * @param {jQuery} targetForm The jQuery object for the form.
         * @param {string} successTitle The main title for the success message.
         * @returns {boolean} Always returns false.
         */
        const displayFormSuccess = function(targetForm, successTitle) {
            const successContainerId = 'formShieldSuccessDisplay';
            const existingSuccess = $(`#${successContainerId}`);

            if (existingSuccess.length) {
                existingSuccess.slideUp(pluginConfig.animationSpeed, function() {
                    $(this).remove();
                });
            }

            const successBox = $('<div>')
                .attr('id', successContainerId)
                .addClass(pluginConfig.successDisplayClass)
                .html(`<h3>${successTitle}</h3>`);

            targetForm.prepend(successBox);
            $('html, body').animate({
                scrollTop: targetForm.offset().top
            }, pluginConfig.scrollSpeed);
            successBox.slideDown(pluginConfig.animationSpeed);

            return false;
        };

        // Main plugin logic for each selected form
        return this.each(function() {
            const currentForm = $(this);
            let formSubmitted = false; // Flag to prevent unsaved changes warning on submission

            /**
             * Applies visual feedback (valid/invalid states) to a form input field.
             *
             * @param {jQuery} inputElement The jQuery object for the input field.
             * @param {boolean} isValid True if the input passed validation, false otherwise.
             * @param {string} feedbackMessage The validation message to display (error or original hint).
             */
            const applyValidationFeedback = function(inputElement, isValid, feedbackMessage) {
                const fieldContainer = inputElement.closest(`div.${pluginConfig.fieldContainerClass}`);
                const hintParagraph = fieldContainer.find('p.formHint');

                // Toggle CSS classes on the container
                fieldContainer
                    .toggleClass(pluginConfig.invalidCssClass, !isValid)
                    .toggleClass(pluginConfig.errorCssClass, !isValid)
                    .toggleClass(pluginConfig.validCssClass, isValid);

                // Manage hint text display
                if (!isValid) {
                    // Store original hint text if not already stored
                    if (!hintParagraph.data('original-hint-text')) {
                        hintParagraph.data('original-hint-text', hintParagraph.html());
                    }
                    if (feedbackMessage) {
                        hintParagraph.html(feedbackMessage);
                    }
                } else {
                    // Restore original hint text if it was stored
                    const originalHint = hintParagraph.data('original-hint-text');
                    if (originalHint) {
                        hintParagraph.html(originalHint);
                        hintParagraph.removeData('original-hint-text'); // Clean up data
                    }
                }
            };

            /**
             * Initializes input fields with default values and styling.
             * Attaches focus/blur handlers for placeholder-like behavior.
             */
            currentForm.find(pluginConfig.inputFieldSelector).each(function() {
                const fieldElement = $(this);
                const initialValue = fieldElement.val();
                const defaultValue = fieldElement.data('default-value');

                // Store original text color for restoration
                fieldElement.data('original-text-color', fieldElement.css('color'));

                // Apply default value and placeholder color if empty or matches default
                if (initialValue === defaultValue || !initialValue) {
                    fieldElement.filter(':not(select)').css("color", pluginConfig.placeholderColor);
                    fieldElement.val(defaultValue);
                }

                // Add focus handler for placeholder behavior
                fieldElement.on('focus', function() {
                    if ($(this).val() === $(this).data('default-value')) {
                        $(this).val('');
                        $(this).css('color', $(this).data('original-text-color'));
                    }
                });

                // Add blur handler to restore placeholder behavior
                fieldElement.on('blur', function() {
                    if ($(this).val() === '') {
                        $(this).filter(':not(select)').css('color', pluginConfig.placeholderColor);
                        $(this).val($(this).data('default-value'));
                    }
                });
            });

            /**
             * Logic for warning users about unsaved changes before leaving the page.
             */
            if (pluginConfig.warnOnUnsavedChanges || currentForm.hasClass(pluginConfig.unsavedChangesClass)) {
                let initialFormData = currentForm.serialize();

                // On form submission, disable the warning temporarily
                currentForm.on('submit', function() {
                    formSubmitted = true;
                });

                $(window).on('beforeunload', function() {
                    if (!formSubmitted && currentForm.serialize() !== initialFormData) {
                        // Most browsers prevent custom messages here, but returning a string triggers the default prompt.
                        return getLocalizedMessage('unsavedChangesWarning');
                    }
                });
            }

            // More validation logic and event binding would go here
            // e.g., currentForm.on('submit', function(e) { /* ... */ });
            // or currentForm.find(pluginConfig.inputFieldSelector).on('blur', function() { /* ... */ });
        });
    };

    /**
     * Default options for the FormShield plugin.
     * Can be overridden by passing an object to `$.fn.formShield()`.
     *
     * @type {object}
     */
    $.fn.formShield.defaults = {
        fieldContainerClass: 'ctrlHolder', // Class for the div wrapping each input
        inputFieldSelector: 'input, textarea, select', // Selector for fields to initialize
        invalidCssClass: 'errorField', // Class added to container for invalid fields
        errorCssClass: 'validationError', // Another class for error state (can be same as invalid)
        validCssClass: 'validationSuccess', // Class added to container for valid fields
        placeholderColor: '#b3b3b3', // Color for default/placeholder text
        warnOnUnsavedChanges: false, // Enable/disable beforeunload warning
        unsavedChangesClass: 'notifyUnsaved', // Class on form to enable warnOnUnsavedChanges
        errorDisplayClass: 'formAlertBox-error', // CSS class for form-level error message box
        successDisplayClass: 'formAlertBox-success', // CSS class for form-level success message box
        animationSpeed: 300, // Speed for slide animations (ms)
        scrollSpeed: 500 // Speed for scroll-to-top animation (ms)
    };

    /**
     * Default localization strings for the FormShield plugin.
     * Extend this object via `$.fn.formShield.localization = $.extend(...)` for other languages.
     *
     * @type {object}
     */
    $.fn.formShield.localization = {
        requiredField: 'The "%s" field is mandatory.',
        requiredRadio: 'Please select an option for "%s".',
        requiredCheckbox: 'You must check the "%s" box.',
        minLength: 'The "%s" must be at least %d characters long.',
        maxLength: 'The "%s" cannot exceed %d characters.',
        minValue: 'The value for "%s" must be at least %d.',
        maxValue: 'The value for "%s" cannot exceed %d.',
        notMatching: 'The "%s" field does not match "%s".',
        invalidEmail: 'Please enter a valid email address for "%s".',
        invalidUrl: 'Please enter a valid URL for "%s".',
        notANumber: 'The "%s" field must contain a valid number.',
        notAnInteger: 'The "%s" field must contain a whole number.',
        notAlpha: 'The "%s" field should only contain letters.',
        notAlphaNum: 'The "%s" field should only contain letters and numbers.',
        invalidPhrase: 'The "%s" field contains invalid characters.',
        invalidPhone: 'Please enter a valid phone number for "%s".',
        invalidDate: 'Please enter a date in MM/DD/YYYY format for "%s".',
        missingCallback: 'Custom validation function "%s" not found for "%s".',
        unsavedChangesWarning: 'You have unsaved changes on this form. Are you sure you want to leave?',
        formErrorTitle: 'Please correct the following issues:',
        formSuccessTitle: 'Form submitted successfully!'
    };

})(jQuery);