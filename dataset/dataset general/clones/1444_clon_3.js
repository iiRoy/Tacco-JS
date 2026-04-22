/*
 * Validation Utility for Front-End Forms
 * Copyright (c) 2023 Acme Corp. All rights reserved.
 *
 * This module extends jQuery Validate to provide unobtrusive client-side validation
 * based on data attributes in HTML elements. It processes form elements,
 * extracts validation rules, and integrates them with the jQuery Validate plugin.
 *
 * This software is provided under an MIT-style license.
 */

/* eslint-disable no-unused-vars, no-undef, strict, one-var, eqeqeq, no-plusplus */
/* global document: false, jQuery: false */

(function (jq) {
    // Reference to the core jQuery Validation engine
    const jqValidationEngine = jq.validator;
    // Collection of validation rule adapters
    let validationRuleAdapters;
    // Data attribute key for storing validation configuration on a form
    const formValidationStore = "formValidationConfig";

    /**
     * Helper to assign validation properties for a given rule.
     * @param {object} ruleOptions - Options object for the adapter.
     * @param {string} ruleKey - The name of the validation rule (e.g., 'required').
     * @param {*} ruleValue - The value associated with the rule (e.g., true, a number, an array).
     */
    function assignValidationRule(ruleOptions, ruleKey, ruleValue) {
        if (!ruleOptions || !ruleKey) {
            console.warn("Attempted to assign validation rule with missing options or key.");
            return;
        }
        ruleOptions.rules[ruleKey] = ruleValue;
        if (ruleOptions.message && typeof ruleOptions.message === 'string' && ruleOptions.message.trim() !== '') {
            ruleOptions.messages[ruleKey] = ruleOptions.message;
        }
    }

    /**
     * Splits a comma-separated string into an array of trimmed strings.
     * @param {string} inputStr - The string to split.
     * @returns {string[]} An array of trimmed strings.
     */
    function parseAndCleanStringList(inputStr) {
        if (typeof inputStr !== 'string') {
            return [];
        }
        return inputStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    /**
     * Extracts the model prefix from a field name (e.g., "User.Address.City" -> "User.Address.").
     * @param {string} fieldIdentifier - The full name of the form field.
     * @returns {string} The model prefix, or an empty string if none.
     */
    function retrieveModelPrefix(fieldIdentifier) {
        const lastDotIndex = fieldIdentifier.lastIndexOf(".");
        return (lastDotIndex === -1) ? "" : fieldIdentifier.substring(0, lastDotIndex + 1);
    }

    /**
     * Replaces a wildcard model prefix in a field name with a specific prefix.
     * @param {string} rawName - The field name, potentially with a wildcard.
     * @param {string} actualPrefix - The actual model prefix to insert.
     * @returns {string} The field name with the prefix applied.
     */
    function applyModelPrefix(rawName, actualPrefix) {
        if (rawName.startsWith("*.")) {
            return rawName.replace("*.", actualPrefix);
        }
        return rawName;
    }

    /**
     * Custom error placement handler for individual field validation messages.
     * This function is bound to the form element.
     * @param {jQuery} validationMsgElement - The jQuery object for the error message.
     * @param {jQuery} inputFieldElement - The jQuery object for the input field.
     */
    function handleFieldErrorDisplay(validationMsgElement, inputFieldElement) {
        // 'this' refers to the form DOM element
        const formContext = jq(this);
        const fieldName = inputFieldElement[0].name;
        const errorContainer = formContext.find(`[data-valmsg-for='${fieldName}']`);

        if (errorContainer.length === 0) {
            // No specific container found, default behavior or skip.
            // For Type III, we can choose to log or just return. Let's log.
            console.warn(`No validation message container found for field: ${fieldName}`);
            return;
        }

        const shouldReplace = errorContainer.data("valmsg-replace") !== false; // data() automatically parses JSON

        errorContainer.removeClass("field-validation-valid").addClass("field-validation-error");
        // Store a reference to the container on the error element itself for later cleanup
        validationMsgElement.data("associatedContainer", errorContainer);

        if (shouldReplace) {
            errorContainer.empty(); // Clear existing content
            validationMsgElement.removeClass("input-validation-error").appendTo(errorContainer);
        } else {
            validationMsgElement.hide(); // Hide if not replacing, just mark container.
        }
    }

    /**
     * Custom handler for displaying a summary of all validation errors in a form.
     * This function is bound to the form element.
     * @param {HTMLFormElement} currentForm - The DOM form element.
     * @param {object} validationInstance - The jQuery Validation instance.
     */
    function handleFormErrorSummary(currentForm, validationInstance) {
        // 'this' refers to the form DOM element
        const formContext = jq(this);
        const summaryPanel = formContext.find("[data-valmsg-summary=true]");

        if (summaryPanel.length === 0) {
            return; // No summary panel configured.
        }

        let summaryList = summaryPanel.find("ul");

        // If no ul exists, create one. This is an addition.
        if (summaryList.length === 0) {
            summaryList = jq("<ul />").appendTo(summaryPanel);
        }

        if (summaryList.length > 0 && validationInstance.errorList.length > 0) {
            summaryList.empty(); // Clear previous errors
            summaryPanel.addClass("validation-summary-errors").removeClass("validation-summary-valid");

            // Iterate through detected errors and append them to the list
            validationInstance.errorList.forEach(errItem => {
                jq("<li />").html(errItem.message).appendTo(summaryList);
            });
        } else if (validationInstance.errorList.length === 0) {
            // If there are no errors, ensure the summary panel is hidden or valid.
            summaryPanel.removeClass("validation-summary-errors").addClass("validation-summary-valid");
            summaryList.empty(); // Clear list even if valid
        }
    }

    /**
     * Custom success handler for individual field validation. Clears messages.
     * This function is bound to the form element.
     * @param {jQuery} validationMsgElement - The jQuery object for the error message that is now valid.
     */
    function handleFieldValidationSuccess(validationMsgElement) {
        // 'this' refers to the form DOM element
        const associatedContainer = validationMsgElement.data("associatedContainer");

        if (associatedContainer && associatedContainer.length > 0) {
            associatedContainer.addClass("field-validation-valid").removeClass("field-validation-error");
            // Clean up the stored reference
            validationMsgElement.removeData("associatedContainer");

            const shouldReplace = associatedContainer.data("valmsg-replace") !== false;
            if (shouldReplace) {
                associatedContainer.empty(); // Clear content if it was replacing.
            } else {
                validationMsgElement.show(); // If not replacing, just show it (it was hidden).
            }
        }
    }

    /**
     * Retrieves or creates the validation configuration for a given form.
     * This is a factory function that ensures each form has its own validation setup.
     * @param {HTMLFormElement} targetFormElement - The DOM form element.
     * @returns {object} The validation configuration object for the form.
     */
    function getFormValidationConfiguration(targetFormElement) {
        const formWrapper = jq(targetFormElement);
        let formConfig = formWrapper.data(formValidationStore);

        // If no configuration exists, initialize it.
        if (!formConfig) {
            formConfig = {
                // Options structure passed to jQuery Validate's validate() method
                settings: {
                    errorClass: "input-validation-error-field",
                    errorElement: "span",
                    errorPlacement: jq.proxy(handleFieldErrorDisplay, targetFormElement),
                    invalidHandler: jq.proxy(handleFormErrorSummary, targetFormElement),
                    messages: {}, // Stores custom messages per field/rule
                    rules: {},    // Stores validation rules per field
                    success: jq.proxy(handleFieldValidationSuccess, targetFormElement)
                },
                /**
                 * Attaches the validation settings to the form using jQuery Validate.
                 */
                activateValidation: function () {
                    formWrapper.validate(this.settings);
                },
                /**
                 * Triggers form validation and returns its validity status.
                 * Used by unobtrusive AJAX.
                 * @returns {boolean} True if the form is valid, false otherwise.
                 */
                performValidation: function () {
                    // Ensure validation is initialized if not already
                    if (!formWrapper.data("validator")) {
                        this.activateValidation();
                    }
                    return formWrapper.valid();
                }
            };
            formWrapper.data(formValidationStore, formConfig);
        }

        return formConfig;
    }

    // Exported unobtrusive validation functionality
    jqValidationEngine.unobtrusiveValidation = {
        ruleAdapters: [], // Holds all registered adapters

        /**
         * Parses a single HTML element for unobtrusive validation attributes.
         * @param {HTMLElement} elementToParse - The HTML element to be parsed.
         * @param {boolean} [deferFormAttachment=false] - If true, skips attaching validation to the form immediately.
         *                                                 Useful when parsing multiple elements to attach once at the end.
         */
        processElement: function (elementToParse, deferFormAttachment = false) {
            const wrappedElement = jq(elementToParse);
            const parentForm = wrappedElement.parents("form")[0];

            if (!parentForm) {
                // Client-side validation requires a form context.
                console.warn("Element is not part of a form, skipping unobtrusive validation processing.", elementToParse);
                return;
            }

            const formValidationContext = getFormValidationConfiguration(parentForm);
            const fieldRules = formValidationContext.settings.rules[elementToParse.name] = {};
            const fieldMessages = formValidationContext.settings.messages[elementToParse.name] = {};

            // Iterate through all registered adapters to find matching data attributes
            this.ruleAdapters.forEach(adapter => {
                const dataAttributeKey = `data-val-${adapter.name}`;
                const validationMessage = wrappedElement.attr(dataAttributeKey);

                // Check if the primary data-val attribute for this adapter exists
                if (validationMessage !== undefined) {
                    const parameterValues = {};
                    const parameterAttributePrefix = `${dataAttributeKey}-`;

                    // Collect any additional parameters specified by the adapter
                    adapter.params.forEach(paramName => {
                        parameterValues[paramName] = wrappedElement.attr(parameterAttributePrefix + paramName);
                    });

                    // Call the adapter's `adapt` function to apply rules and messages
                    adapter.adapt({
                        element: elementToParse,
                        form: parentForm,
                        message: validationMessage,
                        params: parameterValues,
                        rules: fieldRules,
                        messages: fieldMessages
                    });
                }
            });

            // If not deferring, attach validation to the form now.
            if (!deferFormAttachment) {
                formValidationContext.activateValidation();
            }
        },

        /**
         * Parses all HTML elements within a specified selector for unobtrusive validation attributes.
         * It looks for input elements decorated with `data-val="true"` and applies validation.
         * @param {string|HTMLElement|Document} scopeSelector - A jQuery selector, DOM element, or Document to scope the search.
         */
        scanAndApplyValidation: function (scopeSelector) {
            const elementsToValidate = jq(scopeSelector).find(":input[data-val=true]");

            // First pass: process all relevant input elements, deferring form attachment.
            elementsToValidate.each((idx, el) => {
                jqValidationEngine.unobtrusiveValidation.processElement(el, true);
            });

            // Second pass: iterate through all forms to ensure validation is attached.
            // This handles cases where a form might have been partially parsed or has no data-val=true inputs.
            jq("form").each((idx, formEl) => {
                const formInfo = getFormValidationConfiguration(formEl);
                if (formInfo) {
                    formInfo.activateValidation(); // Ensure .validate() is called on all forms.
                }
            });
        }
    };

    // Assign the ruleAdapters reference for convenience
    validationRuleAdapters = jqValidationEngine.unobtrusiveValidation.ruleAdapters;

    /**
     * Adds a new validation adapter to the collection.
     * @param {string} adapterId - The identifier for the adapter (matches `data-val-ID`).
     * @param {string[]} [parameterNames=[]] - An array of additional parameter names (matches `data-val-ID-PARAM`).
     * @param {function(object): void} adaptationFn - The function that applies the rules and messages.
     * @returns {object} The `validationRuleAdapters` object for chaining.
     */
    validationRuleAdapters.add = function (adapterId, parameterNames, adaptationFn) {
        // Handle optional `parameterNames` argument
        if (!adaptationFn && typeof parameterNames === 'function') {
            adaptationFn = parameterNames;
            parameterNames = [];
        } else if (!parameterNames) {
            parameterNames = [];
        }

        if (typeof adaptationFn !== 'function') {
            console.error(`Adapter '${adapterId}' must provide an adaptation function.`);
            return this;
        }

        this.push({ name: adapterId, params: parameterNames, adapt: adaptationFn });
        return this; // Enable chaining
    };

    /**
     * Adds an adapter for a boolean-based validation rule (e.g., `required`, `email`).
     * @param {string} adapterId - The data-val attribute name.
     * @param {string} [ruleKey] - The jQuery Validate rule name. Defaults to `adapterId`.
     * @returns {object} The `validationRuleAdapters` object for chaining.
     */
    validationRuleAdapters.addBooleanRule = function (adapterId, ruleKey) {
        return this.add(adapterId, function (adapterOptions) {
            assignValidationRule(adapterOptions, ruleKey || adapterId, true);
        });
    };

    /**
     * Adds an adapter for validation rules that can have min, max, or range values.
     * @param {string} adapterId - The data-val attribute name.
     * @param {string} minRuleKey - Rule for min-only.
     * @param {string} maxRuleKey - Rule for max-only.
     * @param {string} rangeRuleKey - Rule for both min and max.
     * @param {string} [minAttr='min'] - Name of the HTML attribute for min.
     * @param {string} [maxAttr='max'] - Name of the HTML attribute for max.
     * @returns {object} The `validationRuleAdapters` object for chaining.
     */
    validationRuleAdapters.addMinMaxRangeRule = function (adapterId, minRuleKey, maxRuleKey, rangeRuleKey, minAttr = "min", maxAttr = "max") {
        return this.add(adapterId, [minAttr, maxAttr], function (adapterOptions) {
            const minValue = adapterOptions.params[minAttr];
            const maxValue = adapterOptions.params[maxAttr];

            // Ensure values are not just empty strings, but truly present.
            const hasMin = typeof minValue === 'string' && minValue.length > 0;
            const hasMax = typeof maxValue === 'string' && maxValue.length > 0;

            if (hasMin && hasMax) {
                assignValidationRule(adapterOptions, rangeRuleKey, [minValue, maxValue]);
            } else if (hasMin) {
                assignValidationRule(adapterOptions, minRuleKey, minValue);
            } else if (hasMax) {
                assignValidationRule(adapterOptions, maxRuleKey, maxValue);
            }
        });
    };

    /**
     * Adds an adapter for validation rules that take a single value parameter.
     * @param {string} adapterId - The data-val attribute name.
     * @param {string} [attributeName='val'] - The HTML attribute name containing the value.
     * @param {string} [ruleKey] - The jQuery Validate rule name. Defaults to `adapterId`.
     * @returns {object} The `validationRuleAdapters` object for chaining.
     */
    validationRuleAdapters.addSingleParameterRule = function (adapterId, attributeName = "val", ruleKey) {
        return this.add(adapterId, [attributeName], function (adapterOptions) {
            const paramValue = adapterOptions.params[attributeName];
            if (paramValue !== undefined) { // Check for undefined, allowing empty string as a valid value
                assignValidationRule(adapterOptions, ruleKey || adapterId, paramValue);
            }
        });
    };

    // Register a custom method with jQuery Validate for regular expressions.
    jqValidationEngine.addMethod("regex", function (fieldValue, inputElement, regexPattern) {
        if (this.optional(inputElement)) {
            return true; // Optional fields don't require validation if empty.
        }
        if (!regexPattern || typeof regexPattern !== 'string') {
            console.error("Invalid regex pattern provided for validation.");
            return false;
        }

        try {
            const regexMatcher = new RegExp(regexPattern);
            const matchResult = regexMatcher.exec(fieldValue);
            // Ensure full string match from start to end.
            return (matchResult !== null && matchResult.index === 0 && matchResult[0].length === fieldValue.length);
        } catch (e) {
            console.error("Error creating or executing regex:", e);
            return false;
        }
    }, "Please enter a valid value."); // Default message for regex if not specified via data-val-regex

    // --- Registering standard validation adapters ---

    // Single value rules
    validationRuleAdapters
        .addSingleParameterRule("accept", "exts")
        .addSingleParameterRule("regex", "pattern");

    // Boolean rules
    validationRuleAdapters
        .addBooleanRule("creditcard")
        .addBooleanRule("date")
        .addBooleanRule("digits")
        .addBooleanRule("email")
        .addBooleanRule("number")
        .addBooleanRule("url");

    // Min/Max/Range rules
    validationRuleAdapters
        .addMinMaxRangeRule("length", "minlength", "maxlength", "rangelength")
        .addMinMaxRangeRule("range", "min", "max", "range");

    // Custom adapter for 'equalto' (compares against another field)
    validationRuleAdapters.add("equalto", ["other"], function (adapterOptions) {
        const modelPrefix = retrieveModelPrefix(adapterOptions.element.name);
        const comparisonTarget = adapterOptions.params.other;

        if (!comparisonTarget) {
            console.warn("Equalto adapter requires 'other' parameter.", adapterOptions.element);
            return;
        }

        const fullComparisonTargetName = applyModelPrefix(comparisonTarget, modelPrefix);
        // Find the target element using its full name within the form
        const targetComparisonElement = jq(adapterOptions.form).find(`:input[name='${fullComparisonTargetName}']`)[0];

        if (targetComparisonElement) {
            assignValidationRule(adapterOptions, "equalTo", targetComparisonElement);
        } else {
            console.error(`Equalto target element not found: ${fullComparisonTargetName}`);
        }
    });

    // Custom adapter for 'required' (with special handling for checkboxes)
    validationRuleAdapters.add("required", function (adapterOptions) {
        const tagName = adapterOptions.element.tagName.toUpperCase();
        const inputType = adapterOptions.element.type ? adapterOptions.element.type.toUpperCase() : '';

        // jQuery Validate treats "required" differently for checkboxes (needs at least one checked).
        // This ensures standard "required" behavior for all other input types.
        if (tagName !== "INPUT" || inputType !== "CHECKBOX") {
            assignValidationRule(adapterOptions, "required", true);
        }
        // For checkboxes, jQuery Validate's default `required` rule already handles it correctly
        // as "at least one checked" if `required: true` is set.
        // So, we only explicitly set it for non-checkboxes to avoid confusion or double application.
    });

    // Custom adapter for 'remote' validation
    validationRuleAdapters.add("remote", ["url", "type", "fields"], function (adapterOptions) {
        const ajaxConfig = {
            url: adapterOptions.params.url,
            type: adapterOptions.params.type || "GET",
            data: {}
        };

        if (!ajaxConfig.url) {
            console.warn("Remote validation adapter requires a 'url' parameter.", adapterOptions.element);
            return;
        }

        const modelPrefix = retrieveModelPrefix(adapterOptions.element.name);
        const dependentFields = adapterOptions.params.fields || adapterOptions.element.name;

        // Add dependent field values to the AJAX data payload
        parseAndCleanStringList(dependentFields).forEach(dependentFieldName => {
            const ajaxParamName = applyModelPrefix(dependentFieldName, modelPrefix);
            ajaxConfig.data[ajaxParamName] = function () {
                // Dynamically retrieve the value at the time of validation
                return jq(adapterOptions.form).find(`:input[name='${ajaxParamName}']`).val();
            };
        });

        assignValidationRule(adapterOptions, "remote", ajaxConfig);
    });

    // --- Initialization on Document Ready ---
    jq(function () {
        // Scan the entire document for validation attributes and apply them.
        jqValidationEngine.unobtrusiveValidation.scanAndApplyValidation(window.document);
    });

}(jQuery));