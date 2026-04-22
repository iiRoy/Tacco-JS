/**
 * js.formVal v1.0 - Advanced HTML5 Form Validation Module
 * Enhances form elements with robust validation capabilities.
 * Dependencies: jQuery 1.x+
 */

(function(jq) {
    // --- Utility Functions ---

    /**
     * Checks if a property on an object is a native host method or object.
     * @param {object} targetObject - The object to check.
     * @param {string} methodName - The name of the method/property.
     * @returns {boolean} True if it's a native feature, false otherwise.
     */
    var checkNativeFeature = function(targetObject, methodName) {
        var propertyType = typeof targetObject[methodName];
        var funcOrObjRegex = new RegExp('^function|object$', 'i');
        // Check if type is function/object and property exists, or if type is 'unknown' (IE specific)
        return Boolean((funcOrObjRegex.test(propertyType) && targetObject[methodName]) || propertyType === 'unknown');
    };

    // --- Feature Detection ---
    // Creating a temporary input element to test browser's native HTML5 form support.
    var testInputElem = document.createElement("input");
    var nativeSupport = {
        attrSupport: { // Support for native HTML5 input attributes
            isRequired: Boolean('required' in testInputElem),
            hasPattern: Boolean('pattern' in testInputElem),
            hasMin: Boolean('min' in testInputElem),
            hasMax: Boolean('max' in testInputElem)
        },
        apiSupport: { // Support for native HTML5 validation APIs
            validityObj: checkNativeFeature(testInputElem, 'validity'),
            checkValidation: checkNativeFeature(testInputElem, 'checkValidity'),
            setCustomValidation: checkNativeFeature(testInputElem, 'setCustomValidity')
        }
    };

    // --- Core Validation Logic for Non-Native Browsers ---

    /**
     * Initializes validation for a single form field when native HTML5 validation is absent or overridden.
     * This function is returned by an IIFE to encapsulate private helper functions.
     * @returns {Function} The actual field setup function.
     */
    var initializeFieldValidation = (function() {
        // If native validity API is present, we might not need this extensive polyfill for internal logic,
        // but we still want to apply classes and trigger custom events.
        if (nativeSupport.apiSupport.validityObj) {
            return function(jQueryElement, configSettings) {
                const domInput = jQueryElement[0];
                if (!domInput || !domInput.validity) return; // Guard
                
                // Ensure control object exists
                if (!domInput.control) domInput.control = {};

                // A simplified 'performValidation' for native browsers
                domInput.control.performValidation = function() {
                    const isValid = domInput.validity.valid;
                    if (isValid) {
                        jQueryElement.removeClass(configSettings.classes.invalid).addClass(configSettings.classes.valid);
                    } else {
                        jQueryElement.removeClass(configSettings.classes.valid).addClass(configSettings.classes.invalid);
                    }
                    jQueryElement.trigger(isValid ? 'fieldValid' : 'fieldInvalid');
                };

                // Bind to native events, which will update validity and then our classes
                jQueryElement.on('input change', domInput.control.performValidation);
                // Initial update
                domInput.control.performValidation();

                // Polyfill checkValidity and setCustomValidity even for native,
                // so our custom events are always triggered.
                if (!nativeSupport.apiSupport.setCustomValidation) {
                    domInput.setCustomValidity = function(msg) {
                        // Native browsers might not expose validity.customError directly writable,
                        // but setting validationMessage usually implies custom error.
                        // We'll rely on the browser's validity object for the actual state.
                        domInput.validationMessage = msg || '';
                        // Re-trigger validation to update classes/events
                        domInput.control.performValidation();
                    };
                }
                if (!nativeSupport.apiSupport.checkValidation) {
                    domInput.checkValidity = function() {
                        domInput.control.performValidation();
                        const isValid = domInput.validity.valid;
                        jQueryElement.trigger(isValid ? 'valid' : 'invalid'); // Standard events
                        return isValid;
                    };
                }
            };
        }

        // --- Polyfill helpers for browsers without native HTML5 validation ---

        /**
         * Tests a value against a regular expression pattern.
         * @param {string} valueToTest - The input value.
         * @param {RegExp} patternToMatch - The regular expression.
         * @returns {boolean} True if the value matches the pattern, false otherwise.
         */
        var validatePatternMatch = function(valueToTest, patternToMatch) {
            return patternToMatch.test(valueToTest);
        };

        // Common validation patterns for specific input types
        var validationPatterns = {
            'email': new RegExp("^[a-z0-9_.%+-]+@[0-9a-z.-]+\\.[a-z.]{2,6}$", "i"),
            'url': new RegExp("^[a-z][-\.+a-z]*:\/\/[^\s]*$", "i") // Updated URL regex for better coverage
        };

        /**
         * The main function to set up validation for a single form field.
         * This will be returned by the IIFE if native validation is not fully supported.
         * @param {jQuery} jQueryElement - The jQuery wrapped input element.
         * @param {object} configSettings - The plugin configuration options.
         */
        return function(jQueryElement, configSettings) {
            const domInput = jQueryElement[0];

            // Guard clause: ensure we have a DOM element and it's an input-like field
            if (!domInput || !/input|select|textarea/i.test(domInput.tagName)) {
                console.warn("Skipping formGuard validation setup for non-input element:", jQueryElement);
                return;
            }

            const inputType = domInput.getAttribute('type');

            // Ensure a control object exists on the DOM element for our custom properties
            if (!domInput.control) {
                domInput.control = {};
            }

            // Initialize custom validity object and message for polyfill
            // These will be reset at the start of each validation run
            domInput.validationMessage = '';
            domInput.validity = {
                customError: false,
                patternMismatch: false,
                rangeOverflow: false,
                rangeUnderflow: false,
                stepMismatch: false,
                tooLong: false,
                typeMismatch: false,
                valid: true, // Will be updated based on other properties
                valueMissing: false
            };
            const currentValidity = domInput.validity; // Shorthand

            // Add 'required' class if the attribute is present
            if (domInput.hasAttribute('required')) {
                jQueryElement.addClass(configSettings.classes.required);
            }

            // --- Define individual validation operations ---
            // Each operation function should return a message string if invalid, otherwise undefined.
            const validationOperations = [
                {   // Custom error check (highest priority if set)
                    isActive: true, // Always active to check if customError is set
                    operation: function() {
                        if (currentValidity.customError) {
                            return domInput.validationMessage;
                        }
                    }
                },
                {   // Required field check
                    isActive: domInput.hasAttribute('required'),
                    operation: function() {
                        if (!domInput.value.trim()) { // Check for non-empty value after trimming whitespace
                            currentValidity.valueMissing = true;
                            return configSettings.messages.required;
                        }
                        currentValidity.valueMissing = false;
                    }
                },
                {   // Email or URL type mismatch
                    isActive: inputType === 'email' || inputType === 'url',
                    operation: function() {
                        const val = domInput.value.trim();
                        if (val && !validatePatternMatch(val, validationPatterns[inputType])) {
                            currentValidity.typeMismatch = true;
                            return configSettings.messages[inputType];
                        }
                        currentValidity.typeMismatch = false;
                    }
                },
                {   // Number type mismatch, range, and step checks
                    isActive: inputType === 'number',
                    operation: function() {
                        const val = domInput.value.trim();
                        const numVal = Number(val);

                        // Reset these flags before re-checking
                        currentValidity.typeMismatch = false;
                        currentValidity.rangeOverflow = false;
                        currentValidity.rangeUnderflow = false;
                        currentValidity.stepMismatch = false;

                        if (val === "") { // Empty value is handled by 'required'
                            return;
                        }

                        if (!Number.isFinite(numVal)) { // Stricter number check
                            currentValidity.typeMismatch = true;
                            return configSettings.messages.number;
                        }

                        const minAttr = domInput.getAttribute('min');
                        const maxAttr = domInput.getAttribute('max');
                        const stepAttr = domInput.getAttribute('step');

                        if (minAttr !== null && numVal < Number(minAttr)) {
                            currentValidity.rangeUnderflow = true;
                            return configSettings.messages.min;
                        }
                        if (maxAttr !== null && numVal > Number(maxAttr)) {
                            currentValidity.rangeOverflow = true;
                            return configSettings.messages.max;
                        }

                        if (stepAttr !== null && stepAttr !== 'any') {
                            const step = Number(stepAttr);
                            // To check step mismatch, we need a base value (usually min, or 0 if no min)
                            const base = minAttr !== null ? Number(minAttr) : 0;
                            // Check if (value - base) is a multiple of step
                            // Use a small epsilon for floating point comparison issues
                            if (step > 0 && Math.abs((numVal - base) % step) > 0.000001) {
                                currentValidity.stepMismatch = true;
                                return configSettings.messages.step; // New message for step
                            }
                        }
                    }
                },
                {   // Generic pattern attribute check
                    isActive: domInput.hasAttribute('pattern'),
                    operation: function() {
                        const val = domInput.value.trim();
                        const patternAttr = domInput.getAttribute('pattern');
                        if (val && patternAttr) {
                            try {
                                const customPattern = new RegExp(patternAttr);
                                if (!customPattern.test(val)) {
                                    currentValidity.patternMismatch = true;
                                    return configSettings.messages.pattern;
                                }
                            } catch (e) {
                                console.error("Invalid regex pattern in 'pattern' attribute for element:", domInput, e);
                            }
                        }
                        currentValidity.patternMismatch = false;
                    }
                },
                {   // Maxlength check (HTML5 'maxlength' attribute)
                    isActive: domInput.hasAttribute('maxlength') && domInput.tagName.toLowerCase() !== 'select', // Select doesn't have maxlength
                    operation: function() {
                        const val = domInput.value;
                        const maxLength = Number(domInput.getAttribute('maxlength'));
                        if (maxLength > 0 && val.length > maxLength) {
                            currentValidity.tooLong = true;
                            return configSettings.messages.tooLong; // New message for tooLong
                        }
                        currentValidity.tooLong = false;
                    }
                }
            ];

            // Filter active checks for the current field
            const activeChecksChain = validationOperations.filter(check => check.isActive).map(check => check.operation);

            /**
             * The actual validation function attached to the DOM element's control object.
             * It executes all active validation checks and updates the field's validity state.
             */
            domInput.control.performValidation = function() {
                // Reset validity flags before running checks (except customError, which is set externally)
                currentValidity.valueMissing = false;
                currentValidity.patternMismatch = false;
                currentValidity.rangeOverflow = false;
                currentValidity.rangeUnderflow = false;
                currentValidity.stepMismatch = false;
                currentValidity.tooLong = false;
                currentValidity.typeMismatch = false;
                domInput.validationMessage = ''; // Clear message initially

                let validationMessageText = undefined;

                // Execute all validation operations in order.
                // The first operation returning a message takes precedence for display.
                for (let i = 0; i < activeChecksChain.length; i++) {
                    const currentCheckMessage = activeChecksChain[i]();
                    if (currentCheckMessage && !validationMessageText) { // Only set if not already set
                        validationMessageText = currentCheckMessage;
                    }
                    // Continue to run all checks to ensure all validity flags are updated correctly.
                }

                // If customError is set, it overrides other messages
                if (currentValidity.customError) {
                    validationMessageText = domInput.validationMessage; // Use the message set by setCustomValidity
                } else {
                    domInput.validationMessage = validationMessageText || ""; // Set the final validation message
                }

                // Determine overall 'valid' status based on all individual validity flags
                currentValidity.valid = !(
                    currentValidity.customError ||
                    currentValidity.valueMissing ||
                    currentValidity.tooLong ||
                    currentValidity.typeMismatch ||
                    currentValidity.patternMismatch ||
                    currentValidity.rangeOverflow ||
                    currentValidity.rangeUnderflow ||
                    currentValidity.stepMismatch
                );

                // Apply appropriate CSS classes based on validity
                if (currentValidity.valid) {
                    jQueryElement.removeClass(configSettings.classes.invalid).addClass(configSettings.classes.valid);
                } else {
                    jQueryElement.removeClass(configSettings.classes.valid).addClass(configSettings.classes.invalid);
                }
                
                // Trigger custom events for valid/invalid state
                jQueryElement.trigger(currentValidity.valid ? 'fieldValid' : 'fieldInvalid');
            };

            // Bind validation to input events
            jQueryElement.on('input change', domInput.control.performValidation);

            // Initial validation call to set initial state and classes
            domInput.control.performValidation();

            // Polyfill setCustomValidity method if not native
            if (!nativeSupport.apiSupport.setCustomValidation) {
                domInput.setCustomValidity = function(msg) {
                    currentValidity.customError = Boolean(msg); // Set to true if msg is non-empty
                    domInput.validationMessage = msg || '';
                    domInput.control.performValidation(); // Re-run validation to update state
                };
            }

            // Polyfill checkValidity method if not native
            if (!nativeSupport.apiSupport.checkValidation) {
                domInput.checkValidity = function() {
                    domInput.control.performValidation(); // Ensure state is up-to-date
                    const isValid = Boolean(currentValidity.valid);
                    jQueryElement.trigger(isValid ? 'valid' : 'invalid'); // Trigger standard events too
                    return isValid;
                };
            }
        };
    })(); // End of initializeFieldValidation IIFE

    /**
     * Configures error message display for a form field.
     * This function creates an error element and binds events to show/hide messages.
     * @param {jQuery} jQueryElement - The jQuery wrapped input element.
     * @param {object} configSettings - The plugin configuration options.
     */
    var configureErrorMessageDisplay = function(jQueryElement, configSettings) {
        const domInput = jQueryElement[0];
        if (!domInput || !domInput.control) {
             console.warn("Cannot configure error display for element without control object:", jQueryElement);
             return;
        }

        // Only create custom error display if native validity API is absent or forced by configuration
        if (!nativeSupport.apiSupport.validityObj || configSettings.error.forceCustomDisplay) {
            // Create the error element using the provided factory function
            domInput.control.errorDisplay = configSettings.error.createErrorElement.apply(jQueryElement);

            // Bind to custom 'fieldInvalid' event (triggered by performValidation)
            jQueryElement.on('fieldInvalid', function(event) {
                jq(this.control.errorDisplay).text(this.validationMessage).show();
                // Prevent default browser validation UI if not native or if forced to use custom
                if (!nativeSupport.apiSupport.validityObj || configSettings.error.forceCustomDisplay) {
                     event.preventDefault();
                }
            });

            // Bind to custom 'fieldValid' event
            jQueryElement.on('fieldValid', function() {
                jq(this.control.errorDisplay).text('').hide(); // Clear and hide on valid
            });

            // Show/hide error message on focus/blur for immediate feedback
            jQueryElement.on('focus', function() {
                // If it's currently invalid, show the message immediately on focus
                if (!this.validity.valid) {
                    jq(this.control.errorDisplay).show();
                }
            }).on('blur', function() {
                // Always hide on blur. Message will reappear if still invalid on next validation or focus.
                jq(this.control.errorDisplay).hide();
            });
        }
    };

    // --- Main Plugin Definition ---

    /**
     * jQuery plugin entry point for form validation.
     * Applies validation to selected form elements.
     * @param {object} userOptions - User-provided configuration to override defaults.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jq.fn.formGuard = function(userOptions) {
        // Default configuration settings
        const defaultConfiguration = {
            classes: {
                valid: 'is-valid',      // Class for valid fields
                invalid: 'is-invalid',  // Class for invalid fields
                required: 'is-required' // Class for required fields
            },
            messages: {
                required: "This field is required.",
                pattern: "Please follow the specified format.",
                email: "Please enter a valid email address.",
                url: "Please enter a valid URL.",
                number: "Please enter a numeric value.",
                max: "Value is too high.",
                min: "Value is too low.",
                step: "Please enter a valid step value.", // New message
                tooLong: "Input is too long." // New message
            },
            error: {
                forceCustomDisplay: false, // Force custom error messages even if native validity is present
                createErrorElement: function() { // Function to create the error message element
                    const errorSpan = jq('<span class="validation-error-msg" style="display:none;"></span>');
                    // Insert the error message after the input field
                    jq(this).after(errorSpan);
                    return errorSpan;
                }
            },
            // New option: whether to force form.checkValidity polyfill and custom submit handling.
            // If true, our custom messages will display on submit regardless of native support.
            forceFormValidationPolyfill: false
        };

        // Merge user options with defaults
        const configSettings = jq.extend(true, {}, defaultConfiguration, userOptions);

        // Define a constant for frequently used selectors to exclude non-validatable inputs
        const FIELD_SELECTOR = ':input:not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="hidden"]):not([disabled])';

        return this.filter('form').each(function() {
            const currentForm = jq(this);
            const formDomElement = this; // Get the raw DOM form element

            // Iterate over all relevant input fields within the form
            currentForm.find(FIELD_SELECTOR).each(function() {
                const currentField = jq(this);

                // Ensure a control object for custom properties and methods
                if (!this.control) {
                    this.control = {};
                }

                // Setup error message display for the field
                configureErrorMessageDisplay(currentField, configSettings);
                // Initialize field-level validation logic
                initializeFieldValidation(currentField, configSettings);
            });

            // --- Form-level Validation (Polyfill checkValidity and submit handling) ---

            // Check if the form itself has a native checkValidity method
            const formNativeCheckValidityPresent = checkNativeFeature(formDomElement, 'checkValidity');

            // Polyfill form.checkValidity if not native or if forced by configuration
            if (!formNativeCheckValidityPresent || configSettings.forceFormValidationPolyfill) {
                formDomElement.checkValidity = function() {
                    let allFieldsAreValid = true;
                    // Trigger validation on all fields to update their state and messages
                    currentForm.find(FIELD_SELECTOR).each(function() {
                        // Ensure each field's custom checkValidity is called (which runs performValidation)
                        // This will update the field's validity state and trigger 'fieldValid'/'fieldInvalid'
                        if (this.checkValidity && !this.checkValidity()) {
                            allFieldsAreValid = false;
                        }
                    });
                    // Trigger form-level events
                    currentForm.trigger(allFieldsAreValid ? 'formValid' : 'formInvalid');
                    return allFieldsAreValid;
                };

                // Bind to the form's submit event for custom validation handling
                currentForm.on('submit', function(event) {
                    // Perform the custom form validation
                    if (!formDomElement.checkValidity()) {
                        event.preventDefault(); // Stop form submission if invalid

                        // Find the first invalid field and focus it, possibly select its content
                        const invalidInputElements = currentForm.find(FIELD_SELECTOR).filter(function() {
                            return !this.validity.valid;
                        });

                        if (invalidInputElements.length > 0) {
                            const firstInvalidField = invalidInputElements.first();
                            firstInvalidField.focus();
                            // If it's a text-like input, select its content for easier correction
                            if (firstInvalidField.is('input[type="text"], input[type="email"], input[type="url"], input[type="number"], textarea')) {
                                firstInvalidField.select();
                            }
                        }
                        // Trigger a custom 'formValidationFailed' event
                        currentForm.trigger('formValidationFailed');
                        return false; // Prevent submission
                    } else {
                        // If valid, allow submission. Values should already be correct in the DOM.
                        currentForm.trigger('formValidationSuccess');
                        return true; // Allow submission
                    }
                });
            } else {
                 // If native form validation is used, we still want our field classes to update.
                 // The 'initializeFieldValidation' handles this through event binding.
                 // We can also bind to the native 'invalid' event on the form to catch global issues.
                 currentForm.on('invalid', function(event) {
                     // This event bubbles up from native validation.
                     // Prevent default to stop browser's default message, then focus the invalid field.
                     event.preventDefault();
                     const targetField = jq(event.target);
                     targetField.focus();
                     // Trigger our custom fieldInvalid event so the error message shows up.
                     targetField.trigger('fieldInvalid');
                     currentForm.trigger('formInvalid'); // Trigger form invalid event
                     currentForm.trigger('formValidationFailed');
                 });
                 currentForm.on('submit', function() {
                     // If native, and submit happens, it means all good.
                     currentForm.trigger('formValid'); // Trigger form valid event
                     currentForm.trigger('formValidationSuccess');
                 });
            }
        });
    };
})(jQuery);