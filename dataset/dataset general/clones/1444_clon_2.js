/*
 *  Client-side Validation Module for jQuery Integration
 *  Provides a system for declarative form validation using HTML attributes.
 *  (C) Example Corporation. All rights reserved.
 */

/*global document: true, jQuery: true */
/*jslint browser: true, white: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */

(function (jQ) {
    // Alias for the core jQuery Validator object
    var _jqValidator = jQ.validator;
    // Dynamic collection for managing validation rule processors
    let ruleProcessors;
    // Unique data attribute key for storing form validation context
    const _formValidationDataKey = "formValidationState";

    // Assigns rule properties (value and message) to an options object
    function assignRuleProperties(ruleOpts, ruleIdentifier, ruleValue) {
        ruleOpts.rules[ruleIdentifier] = ruleValue;
        if (ruleOpts.message) {
            ruleOpts.messages[ruleIdentifier] = ruleOpts.message;
        }
    }

    // Splits a string by commas and removes leading/trailing whitespace from parts
    function divideAndClean(inputString) {
        return inputString.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/g);
    }

    // Extracts the prefix part of a field name (e.g., "Parent.Child.Property" -> "Parent.Child.")
    function getFieldSegment(fullFieldName) {
        return fullFieldName.substring(0, fullFieldName.lastIndexOf(".") + 1);
    }

    // Prepends a given segment to a field name if it starts with a wildcard
    function prependSegment(valueName, currentPrefix) {
        if (valueName.indexOf("_all.") === 0) {
            valueName = valueName.replace("_all.", currentPrefix);
        }
        return valueName;
    }

    // Handler for individual input validation errors
    function onInputError(validationError, targetElement) {
        // 'this' context refers to the form element
        let feedbackContainer = jQ(this).find("[data-feedback-for='" + targetElement[0].name + "']");
        // Check if the error message should replace existing content in the container
        let shouldReplace = jQ.parseJSON(feedbackContainer.attr("data-replace-feedback")) !== false;

        feedbackContainer.removeClass("field-feedback-pass").addClass("field-feedback-fail");
        // Store the container reference with the error object
        validationError.data("feedbackSection", feedbackContainer);

        if (shouldReplace) {
            feedbackContainer.empty(); // Clear any previous content
            validationError.removeClass("input-failure-style").appendTo(feedbackContainer);
        } else {
            validationError.hide(); // Hide the error if not replacing
        }
    }

    // Handler for overall form validation errors (summary display)
    function onFormErrors(targetForm, validatorInstance) {
        // 'this' context refers to the form element
        let summaryContainer = jQ(this).find("[data-summary-feedback=true]");
        let errorList = summaryContainer.find("ul");

        // If a summary list element exists and there are validation failures
        if (errorList && errorList.length && validatorInstance.errorList.length) {
            errorList.empty(); // Clear previous error messages
            summaryContainer.addClass("summary-feedback-failures").removeClass("summary-feedback-success");

            // Append each individual error message to the summary list
            jQ.each(validatorInstance.errorList, function () {
                jQ("<li />").html(this.message).appendTo(errorList);
            });
        }
    }

    // Handler for successful validation of an individual input
    function onInputSuccess(validatedError) {
        // 'this' context refers to the form element
        let associatedContainer = validatedError.data("feedbackSection");
        let willReplace = jQ.parseJSON(associatedContainer.attr("data-replace-feedback"));

        if (associatedContainer) {
            associatedContainer.addClass("field-feedback-pass").removeClass("field-feedback-fail");
            validatedError.removeData("feedbackSection"); // Clean up stored data

            if (willReplace) {
                associatedContainer.empty(); // Clear the container if it was replacing
            }
        }
    }

    // Retrieves or initializes the validation context object for a given form
    function getValidationContext(targetForm) {
        let currentForm = jQ(targetForm);
        let formState = currentForm.data(_formValidationDataKey);

        if (!formState) {
            formState = {
                // Configuration options passed to jQuery Validate's .validate() method
                settings: {
                    errorClass: "input-failure-style",
                    errorElement: "label",
                    errorPlacement: jQ.proxy(onInputError, targetForm),
                    invalidHandler: jQ.proxy(onFormErrors, targetForm),
                    messages: {},
                    rules: {},
                    success: jQ.proxy(onInputSuccess, targetForm)
                },
                // Method to bind validation to the form
                bindValidation: function () {
                    currentForm.validate(this.settings);
                },
                // Executes validation and returns the validity status
                performValidation: function () {
                    currentForm.validate();
                    return currentForm.valid();
                }
            };
            currentForm.data(_formValidationDataKey, formState);
        }

        return formState;
    }

    // Public API for seamless client-side validation
    _jqValidator.seamlessValidation = {
        processors: [], // Array to hold registered rule processors

        // Analyzes a single HTML input element for validation attributes
        processInputNode: function (inputNode, skipBinding) {
            // <summary>
            // Parses a specific HTML element to extract validation attributes.
            // </summary>
            // <param name="inputNode" domElement="true">The HTML element to be processed.</param>
            // <param name="skipBinding" type="Boolean">[Optional] Set to true to defer attaching
            // validation to the form. Useful for batch processing. Default is false.</param>
            let $inputNode = jQ(inputNode);
            let parentForm = $inputNode.parents("form")[0];
            let validationDetails, fieldRules, fieldMessages;

            if (!parentForm) { // Validation requires a containing form
                return;
            }

            validationDetails = getValidationContext(parentForm);
            validationDetails.settings.rules[inputNode.name] = fieldRules = {};
            validationDetails.settings.messages[inputNode.name] = fieldMessages = {};

            // Iterate over each registered validation processor
            jQ.each(this.processors, function () {
                let attributePrefix = "data-valctrl-" + this.name;
                let attributeMessage = $inputNode.attr(attributePrefix);
                let parameterValues = {};

                // If the data-valctrl- attribute is present
                if (attributeMessage !== undefined) {
                    attributePrefix += "-"; // Append hyphen for parameter attributes

                    // Collect all defined parameters for the current adapter
                    jQ.each(this.params, function () {
                        parameterValues[this] = $inputNode.attr(attributePrefix + this);
                    });

                    // Invoke the adapter's logic to set up jQuery Validate rules
                    this.adapt({
                        element: inputNode,
                        form: parentForm,
                        message: attributeMessage,
                        params: parameterValues,
                        rules: fieldRules,
                        messages: fieldMessages
                    });
                }
            });

            // If immediate binding is not skipped, attach validation to the form
            if (!skipBinding) {
                validationDetails.bindValidation();
            }
        },

        // Processes all HTML elements within a specified selector for validation
        processAllForms: function (targetSelector) {
            // <summary>
            // Scans all HTML elements matching the provided selector. It identifies input elements
            // marked with [data-val=true] and configures validation based on 'data-valctrl-*' attributes.
            // </summary>
            // <param name="targetSelector" type="String">Any valid jQuery selector string.</param>
            jQ(targetSelector).find(":input[data-val=true]").each(function () {
                _jqValidator.seamlessValidation.processInputNode(this, true);
            });

            // Iterate through all forms to ensure validation is properly initialized
            jQ("form").each(function () {
                let currentInfo = getValidationContext(this);
                if (currentInfo) {
                    currentInfo.bindValidation();
                }
            });
        }
    };

    // Assign the rule processors collection to the global variable
    ruleProcessors = _jqValidator.seamlessValidation.processors;

    ruleProcessors.register = function (processorName, parameters, adaptationFunction) {
        // <summary>Adds a new adapter to translate unobtrusive HTML into jQuery Validate validation.</summary>
        // <param name="processorName" type="String">The name for the adapter, matching 'data-valctrl-nnnn'.</param>
        // <param name="parameters" type="Array" optional="true">[Optional] An array of parameter names (strings)
        // extracted from 'data-valctrl-nnnn-mmmm' attributes.</param>
        // <param name="adaptationFunction" type="Function">The function that converts HTML attributes
        // into jQuery Validate rules and/or messages.</param>
        // <returns type="jQuery.validator.seamlessValidation.processors" />
        if (!adaptationFunction) { // If called without parameters array
            adaptationFunction = parameters;
            parameters = [];
        }
        this.push({ name: processorName, params: parameters, adapt: adaptationFunction });
        return this;
    };

    ruleProcessors.registerBoolean = function (processorName, ruleIdentifier) {
        // <summary>Adds an adapter for a boolean jQuery Validate rule (no specific parameters).</summary>
        // <param name="processorName" type="String">The adapter's name, used in 'data-valctrl-nnnn'.</param>
        // <param name="ruleIdentifier" type="String" optional="true">[Optional] The jQuery Validate rule name.
        // Defaults to 'processorName' if not provided.</param>
        // <returns type="jQuery.validator.seamlessValidation.processors" />
        return this.register(processorName, function (opts) {
            assignRuleProperties(opts, ruleIdentifier || processorName, true);
        });
    };

    ruleProcessors.registerMinMax = function (processorName, minRuleIdentifier, maxRuleIdentifier, minMaxRuleIdentifier, minHtmlAttribute, maxHtmlAttribute) {
        // <summary>Adds an adapter for min/max validation, supporting min-only, max-only, and both.</summary>
        // <param name="processorName" type="String">The adapter's name ('data-valctrl-nnnn').</param>
        // <param name="minRuleIdentifier" type="String">The jQuery Validate rule for minimum value only.</param>
        // <param name="maxRuleIdentifier" type="String">The jQuery Validate rule for maximum value only.</param>
        // <param name="minMaxRuleIdentifier" type="String">The jQuery Validate rule for both min and max values.</param>
        // <param name="minHtmlAttribute" type="String" optional="true">[Optional] HTML attribute for min value. Defaults to "lowerBound".</param>
        // <param name="maxHtmlAttribute" type="String" optional="true">[Optional] HTML attribute for max value. Defaults to "upperBound".</param>
        // <returns type="jQuery.validator.seamlessValidation.processors" />
        return this.register(processorName, [minHtmlAttribute || "lowerBound", maxHtmlAttribute || "upperBound"], function (opts) {
            let minimumVal = opts.params.lowerBound;
            let maximumVal = opts.params.upperBound;

            if (minimumVal && maximumVal) {
                assignRuleProperties(opts, minMaxRuleIdentifier, [minimumVal, maximumVal]);
            } else if (minimumVal) {
                assignRuleProperties(opts, minRuleIdentifier, minimumVal);
            } else if (maximumVal) {
                assignRuleProperties(opts, maxRuleIdentifier, maximumVal);
            }
        });
    };

    ruleProcessors.registerSingleValue = function (processorName, htmlAttributeName, ruleIdentifier) {
        // <summary>Adds an adapter for a jQuery Validate rule that takes a single parameter value.</summary>
        // <param name="processorName" type="String">The adapter's name ('data-valctrl-nnnn').</param>
        // <param name="htmlAttributeName" type="String">[Optional] The HTML attribute containing the value. Defaults to "valueKey".</param>
        // <param name="ruleIdentifier" type="String" optional="true">[Optional] The jQuery Validate rule name. Defaults to 'processorName'.</param>
        // <returns type="jQuery.validator.seamlessValidation.processors" />
        return this.register(processorName, [htmlAttributeName || "valueKey"], function (opts) {
            assignRuleProperties(opts, ruleIdentifier || processorName, opts.params[htmlAttributeName]);
        });
    };

    // Define a custom jQuery Validate method for regular expression matching
    _jqValidator.defineMethod("patternMatch", function (currentValue, targetElement, validationParameters) {
        let regexResult;
        if (this.optional(targetElement)) {
            return true;
        }

        regexResult = new RegExp(validationParameters).exec(currentValue);
        return (regexResult && (regexResult.index === 0) && (regexResult[0].length === currentValue.length));
    });

    // Register various standard validation adapters
    ruleProcessors.registerSingleValue("allowFile", "fileTypes").registerSingleValue("matchPattern", "regularExpression");
    ruleProcessors.registerBoolean("paymentCard").registerBoolean("calendarDate").registerBoolean("numeralsOnly").registerBoolean("electronicMail").registerBoolean("numericValue").registerBoolean("webAddress");
    ruleProcessors.registerMinMax("textLength", "minimumLength", "maximumLength", "boundedLength").registerMinMax("valueRange", "lowerBound", "upperBound", "valueRange");
    ruleProcessors.register("matchesField", ["comparisonField"], function (opts) {
        let fieldSegment = getFieldSegment(opts.element.name);
        let otherFieldName = opts.params.comparisonField;
        let fullOtherFieldName = prependSegment(otherFieldName, fieldSegment);
        let comparisonElement = jQ(opts.form).find(":input[name=" + fullOtherFieldName + "]")[0];

        assignRuleProperties(opts, "isSameAs", comparisonElement);
    });
    ruleProcessors.register("mandatory", function (opts) {
        // jQuery Validate treats "mandatory" checkbox as requiring it to be checked
        if (opts.element.tagName.toUpperCase() !== "FORM_INPUT" || opts.element.type.toUpperCase() !== "CHECK_BOX") {
            assignRuleProperties(opts, "mandatory", true);
        }
    });
    ruleProcessors.register("serverCheck", ["endpoint", "requestMethod", "dependentFields"], function (opts) {
        let requestConfig = {
            endpoint: opts.params.endpoint,
            requestMethod: opts.params.requestMethod || "HTTP_GET",
            data: {}
        };
        let fieldSegment = getFieldSegment(opts.element.name);

        jQ.each(divideAndClean(opts.params.dependentFields || opts.element.name), function (idx, fieldIdentifier) {
            let parameterName = prependSegment(fieldIdentifier, fieldSegment);
            requestConfig.data[parameterName] = function () {
                return jQ(opts.form).find(":input[name='" + parameterName + "']").val();
            };
        });

        assignRuleProperties(opts, "serverCheck", requestConfig);
    });

    // Initialize seamless validation when the DOM is fully loaded
    jQ(function () {
        _jqValidator.seamlessValidation.processAllForms(document);
    });
}(jQuery));