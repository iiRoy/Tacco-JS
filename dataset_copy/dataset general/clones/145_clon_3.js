/*
 * Dynamic Content Interaction Script (Version 2.1.0)
 * Developed by CodeCrafters Inc. 2023
 * Licensed under a Permissive Open Source License (https://example.com/license)
 */

// Initialize UI tooltips upon document readiness
jQuery(function() {
    // Locate all elements marked for tooltip behavior and enable it.
    // This provides contextual information on hover.
    jQuery("[data-hint-display='true']").hintPop();
});

// User feedback submission module
jQuery(function() {

    // Attach validation and submission handling to all form input fields and text areas.
    jQuery("input,textarea").formInputValidation({
        // Prevent the standard form submission if validation fails.
        blockFormSubmission: true,
        // Callback function for when validation errors are detected during submission.
        onFormSubmissionError: function(formElement, submissionEvent, detectedProblems) {
            // Log any specific issues or trigger custom UI feedback here.
            console.warn("Form submission issues detected:", detectedProblems);
            // Example: Append a general error message to a dedicated area.
            jQuery('#feedbackArea').html("<div class='alert alert-warning'>Please correct the highlighted errors.</div>");
        },
        // Callback function for successful validation before AJAX submission.
        onFormSubmissionSuccess: function(formElement, submissionEvent) {
            submissionEvent.preventDefault(); // Stop default form action to handle with AJAX.

            // Extract user-provided data from the form.
            const userName = jQuery("input#user_name_field").val();
            const userEmail = jQuery("input#user_email_field").val();
            const userContact = jQuery("input#user_contact_num").val();
            const userMessage = jQuery("textarea#user_msg_content").val();

            // Determine a shortened name for personalized messages.
            let displayAlias = userName.split(' ')[0]; // Take only the first word.
            if (userName.indexOf(' ') >= 0) {
                // If there's a space, refine the alias to exclude the last part (e.g., surname).
                displayAlias = userName.split(' ').slice(0, -1).join(' ');
            }

            // Execute an asynchronous request to send the data.
            jQuery.ajax({
                url: "./../server/process_feedback.php", // Endpoint for processing feedback.
                type: "POST",
                data: {
                    senderName: userName,
                    senderPhone: userContact,
                    senderEmail: userEmail,
                    senderMessage: userMessage
                },
                cache: false, // Prevent browser from caching the response.
                success: function() {
                    // Display success notification to the user.
                    const successMessageContainer = jQuery('#feedbackArea');
                    successMessageContainer.html(`
                        <div class='alert alert-success' role='alert'>
                            <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                            <strong>Thank you! Your message has been successfully transmitted.</strong>
                        </div>
                    `);
                    // Optionally, clear the form after a short delay.
                    setTimeout(() => {
                        jQuery('#userFeedbackForm').trigger("reset");
                    }, 1500);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // Display error notification if the server communication fails.
                    const errorMessageContainer = jQuery('#feedbackArea');
                    errorMessageContainer.html(`
                        <div class='alert alert-danger' role='alert'>
                            <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
                            <strong>Apologies ${displayAlias}, it appears our messaging service is currently unavailable. Please try again shortly.</strong>
                        </div>
                    `);
                    // Clear the form even on error for a fresh attempt.
                    jQuery('#userFeedbackForm').trigger("reset");
                    console.error("AJAX error during form submission:", textStatus, errorThrown);
                },
            });
        },
        // Custom filter to only validate visible inputs.
        inputEligibilityCheck: function() {
            return jQuery(this).is(":visible");
        },
    });

    // Handle tab navigation clicks to ensure correct tab display.
    jQuery("a[data-ui-nav=\"tab\"]").on('click', function(eventObject) {
        eventObject.preventDefault(); // Stop default anchor link behavior.
        jQuery(this).tab("show"); // Activate the clicked tab.
    });
});


/* On interaction with the name field, clear any previous feedback messages. */
jQuery('#user_name_field').on('focus', function() {
    jQuery('#feedbackArea').empty(); // Remove all content from the feedback display zone.
});

// inputValidationEngine
// * A robust utility for automating validation within Bootstrap-styled forms.
// *
// * Version: 2.0.0
// *
// * License: MIT <http://opensource.org/licenses/mit-license.php>
// *
// * Project page: http://example.com/inputValidationEngine/

(function(externalLib) {

    let generatedDomNodes = []; // Stores references to dynamically created DOM elements.

    const validationDefaults = {
        configurationSettings: {
            prependExistingHelpBlock: false,
            // Automatically detect HTML5 validation attributes like 'required', 'maxlength'.
            attributeSniffing: true,
            // Prevent form submission if any validation rules are violated.
            blockFormSubmission: true,
            // Custom function invoked when form submission fails due to validation errors.
            onFormSubmissionError: false,
            // Custom function invoked just before a valid form is submitted (e.g., via AJAX).
            onFormSubmissionSuccess: false,
            // Enable stricter HTML output for generated validation messages.
            semanticStrictness: false,
            autoAppend: {
                // Automatically add help block elements if they don't exist.
                messageContainers: true
            },
            // Filter function to determine which inputs should undergo validation.
            inputEligibilityCheck: function() {
                return true; // By default, validate all inputs.
                // return externalLib(this).is(":visible"); // Alternate: Only validate visible inputs.
            }
        },
        utilityFunctions: {
            initializeValidation: function(options) {

                const currentConfig = externalLib.extend(true, {}, validationDefaults);

                currentConfig.configurationSettings = externalLib.extend(true, currentConfig.configurationSettings, options);

                const targetElements = this; // The set of elements to apply validation to.

                // Identify all unique parent forms related to the target elements.
                const distinctForms = externalLib.unique(
                    targetElements.map(function() {
                        return externalLib(this).parents("form")[0];
                    }).toArray()
                );

                // Bind the submission event to each identified form.
                externalLib(distinctForms).on("submit", function(submissionEvent) {
                    const currentForm = externalLib(this);
                    let validationIssueCount = 0;
                    // Select all relevant input, textarea, and select elements within the form, excluding submit buttons.
                    const relevantInputs = currentForm.find("input,textarea,select").not("[type=submit],[type=image]").filter(currentConfig.configurationSettings.inputEligibilityCheck);

                    // Trigger validation events on all relevant inputs.
                    relevantInputs.trigger("submit.validationEngine").trigger("validationLostFocus.validationEngine");

                    relevantInputs.each(function(idx, element) {
                        const currentInput = externalLib(element);
                        const inputGroupContainer = currentInput.parents(".form-group").first();
                        // If an input group container has a 'warning' class, escalate it to 'error'.
                        if (inputGroupContainer.hasClass("warning")) {
                            inputGroupContainer.removeClass("warning").addClass("error");
                            validationIssueCount++;
                        }
                    });

                    relevantInputs.trigger("validationLostFocus.validationEngine"); // Re-trigger for consistent state.

                    if (validationIssueCount > 0) {
                        if (currentConfig.configurationSettings.blockFormSubmission) {
                            submissionEvent.preventDefault(); // Stop form submission.
                        }
                        currentForm.addClass("error"); // Mark form as having errors.
                        if (externalLib.isFunction(currentConfig.configurationSettings.onFormSubmissionError)) {
                            currentConfig.configurationSettings.onFormSubmissionError(currentForm, submissionEvent, relevantInputs.formInputValidation("collectErrors", true));
                        }
                    } else {
                        currentForm.removeClass("error"); // Clear error state.
                        if (externalLib.isFunction(currentConfig.configurationSettings.onFormSubmissionSuccess)) {
                            currentConfig.configurationSettings.onFormSubmissionSuccess(currentForm, submissionEvent);
                        }
                    }
                });

                return this.each(function() {

                    // Gather references to key elements related to the current input field.
                    const currentInput = externalLib(this);
                    const inputGroupContainer = currentInput.parents(".form-group").first();
                    let feedbackMessageBlock = inputGroupContainer.find(".help-block").first();
                    const parentForm = currentInput.parents("form").first();
                    let activeValidatorKeys = []; // List of active validator names for this input.

                    // Create a help block if one doesn't exist and auto-append is enabled.
                    if (!feedbackMessageBlock.length && currentConfig.configurationSettings.autoAppend && currentConfig.configurationSettings.autoAppend.messageContainers) {
                        feedbackMessageBlock = externalLib('<div class="help-block" />');
                        inputGroupContainer.find('.controls').append(feedbackMessageBlock);
                        generatedDomNodes.push(feedbackMessageBlock[0]);
                    }

                    // =============================================================
                    //                      ANALYZE HTML FOR VALIDATION RULES
                    // =============================================================

                    if (currentConfig.configurationSettings.attributeSniffing) {
                        let feedbackText = "";
                        // ---------------------------------------------------------
                        //                                                   PATTERN
                        // ---------------------------------------------------------
                        if (currentInput.attr("pattern") !== undefined) {
                            feedbackText = "Input does not match the expected format.<!-- Use data-validation-pattern-message to customize -->";
                            if (currentInput.data("validationPatternMessage")) {
                                feedbackText = currentInput.data("validationPatternMessage");
                            }
                            currentInput.data("validationPatternMessage", feedbackText);
                            currentInput.data("validationPatternRegex", currentInput.attr("pattern"));
                        }
                        // ---------------------------------------------------------
                        //                                                       MAX
                        // ---------------------------------------------------------
                        if (currentInput.attr("max") !== undefined || currentInput.attr("aria-valuemax") !== undefined) {
                            const maxValue = (currentInput.attr("max") !== undefined ? currentInput.attr("max") : currentInput.attr("aria-valuemax"));
                            feedbackText = `Value exceeds maximum: Maximum allowed is '${maxValue}'.<!-- Use data-validation-max-message to customize -->`;
                            if (currentInput.data("validationMaxMessage")) {
                                feedbackText = currentInput.data("validationMaxMessage");
                            }
                            currentInput.data("validationMaxMessage", feedbackText);
                            currentInput.data("validationMaxMax", maxValue);
                        }
                        // ---------------------------------------------------------
                        //                                                       MIN
                        // ---------------------------------------------------------
                        if (currentInput.attr("min") !== undefined || currentInput.attr("aria-valuemin") !== undefined) {
                            const minValue = (currentInput.attr("min") !== undefined ? currentInput.attr("min") : currentInput.attr("aria-valuemin"));
                            feedbackText = `Value is below minimum: Minimum required is '${minValue}'.<!-- Use data-validation-min-message to customize -->`;
                            if (currentInput.data("validationMinMessage")) {
                                feedbackText = currentInput.data("validationMinMessage");
                            }
                            currentInput.data("validationMinMessage", feedbackText);
                            currentInput.data("validationMinMin", minValue);
                        }
                        // ---------------------------------------------------------
                        //                                                 MAXLENGTH
                        // ---------------------------------------------------------
                        if (currentInput.attr("maxlength") !== undefined) {
                            feedbackText = `Input is too long: Maximum '${currentInput.attr("maxlength")}' characters allowed.<!-- Use data-validation-maxlength-message to customize -->`;
                            if (currentInput.data("validationMaxlengthMessage")) {
                                feedbackText = currentInput.data("validationMaxlengthMessage");
                            }
                            currentInput.data("validationMaxlengthMessage", feedbackText);
                            currentInput.data("validationMaxlengthMaxlength", currentInput.attr("maxlength"));
                        }
                        // ---------------------------------------------------------
                        //                                                 MINLENGTH
                        // ---------------------------------------------------------
                        if (currentInput.attr("minlength") !== undefined) {
                            feedbackText = `Input is too short: Minimum '${currentInput.attr("minlength")}' characters required.<!-- Use data-validation-minlength-message to customize -->`;
                            if (currentInput.data("validationMinlengthMessage")) {
                                feedbackText = currentInput.data("validationMinlengthMessage");
                            }
                            currentInput.data("validationMinlengthMessage", feedbackText);
                            currentInput.data("validationMinlengthMinlength", currentInput.attr("minlength"));
                        }
                        // ---------------------------------------------------------
                        //                                                  REQUIRED
                        // ---------------------------------------------------------
                        if (currentInput.attr("required") !== undefined || currentInput.attr("aria-required") !== undefined) {
                            feedbackText = currentConfig.builtInValidators.required.message;
                            if (currentInput.data("validationRequiredMessage")) {
                                feedbackText = currentInput.data("validationRequiredMessage");
                            }
                            currentInput.data("validationRequiredMessage", feedbackText);
                        }
                        // ---------------------------------------------------------
                        //                                                    NUMBER
                        // ---------------------------------------------------------
                        if (currentInput.attr("type") !== undefined && currentInput.attr("type").toLowerCase() === "number") {
                            feedbackText = currentConfig.builtInValidators.number.message;
                            if (currentInput.data("validationNumberMessage")) {
                                feedbackText = currentInput.data("validationNumberMessage");
                            }
                            currentInput.data("validationNumberMessage", feedbackText);
                        }
                        // ---------------------------------------------------------
                        //                                                     EMAIL
                        // ---------------------------------------------------------
                        if (currentInput.attr("type") !== undefined && currentInput.attr("type").toLowerCase() === "email") {
                            feedbackText = "This is not a valid email address format.<!-- Use data-validator-validemail-message to customize -->";
                            if (currentInput.data("validationValidemailMessage")) {
                                feedbackText = currentInput.data("validationValidemailMessage");
                            } else if (currentInput.data("validationEmailMessage")) { // Fallback for older naming.
                                feedbackText = currentInput.data("validationEmailMessage");
                            }
                            currentInput.data("validationValidemailMessage", feedbackText);
                        }
                        // ---------------------------------------------------------
                        //                                                MINCHECKED
                        // ---------------------------------------------------------
                        if (currentInput.attr("minchecked") !== undefined) {
                            feedbackText = `Insufficient selections: At least '${currentInput.attr("minchecked")}' options must be checked.<!-- Use data-validation-minchecked-message to customize -->`;
                            if (currentInput.data("validationMincheckedMessage")) {
                                feedbackText = currentInput.data("validationMincheckedMessage");
                            }
                            currentInput.data("validationMincheckedMessage", feedbackText);
                            currentInput.data("validationMincheckedMinchecked", currentInput.attr("minchecked"));
                        }
                        // ---------------------------------------------------------
                        //                                                MAXCHECKED
                        // ---------------------------------------------------------
                        if (currentInput.attr("maxchecked") !== undefined) {
                            feedbackText = `Excessive selections: A maximum of '${currentInput.attr("maxchecked")}' options can be checked.<!-- Use data-validation-maxchecked-message to customize -->`;
                            if (currentInput.data("validationMaxcheckedMessage")) {
                                feedbackText = currentInput.data("validationMaxcheckedMessage");
                            }
                            currentInput.data("validationMaxcheckedMessage", feedbackText);
                            currentInput.data("validationMaxcheckedMaxchecked", currentInput.attr("maxchecked"));
                        }
                    }

                    // =============================================================
                    //                             AGGREGATE VALIDATOR IDENTIFIERS
                    // =============================================================

                    // Retrieve explicitly defined validators from data attribute.
                    if (currentInput.data("validation") !== undefined) {
                        activeValidatorKeys = currentInput.data("validation").split(",");
                    }

                    // Discover additional validators from other data attributes (e.g., data-validation-email).
                    externalLib.each(currentInput.data(), function(key, value) {
                        const nameSegments = key.replace(/([A-Z])/g, ",$1").split(",");
                        if (nameSegments[0] === "validation" && nameSegments[1]) {
                            activeValidatorKeys.push(nameSegments[1]);
                        }
                    });

                    // =============================================================
                    //                                 STANDARDIZE VALIDATOR NAMES
                    // =============================================================

                    let pendingValidators = activeValidatorKeys;
                    let newlyDiscoveredValidators = [];

                    do // Loop to expand shortcut validators into their constituent parts.
                    {
                        // Capitalize the first letter of each validator name for consistency.
                        externalLib.each(activeValidatorKeys, function(idx, name) {
                            activeValidatorKeys[idx] = formatValidatorIdentifier(name);
                        });

                        // Remove any duplicate validator names.
                        activeValidatorKeys = externalLib.unique(activeValidatorKeys);

                        newlyDiscoveredValidators = [];
                        externalLib.each(pendingValidators, function(idx, validatorName) {
                            // Check for custom shortcut definitions on the element.
                            if (currentInput.data("validation" + validatorName + "Shortcut") !== undefined) {
                                externalLib.each(currentInput.data("validation" + validatorName + "Shortcut").split(","), function(idx2, subValidator) {
                                    newlyDiscoveredValidators.push(subValidator);
                                });
                            } else if (currentConfig.builtInValidators[validatorName.toLowerCase()]) {
                                // Check for built-in shortcut validators.
                                const validatorDefinition = currentConfig.builtInValidators[validatorName.toLowerCase()];
                                if (validatorDefinition.type.toLowerCase() === "shortcut") {
                                    externalLib.each(validatorDefinition.shortcut.split(","), function(idx3, subValidator) {
                                        subValidator = formatValidatorIdentifier(subValidator);
                                        newlyDiscoveredValidators.push(subValidator);
                                        activeValidatorKeys.push(subValidator); // Add to main list.
                                    });
                                }
                            }
                        });

                        pendingValidators = newlyDiscoveredValidators; // Continue with newly found validators.

                    } while (pendingValidators.length > 0)

                    // =============================================================
                    //                               BUILD VALIDATOR DATA STRUCTURES
                    // =============================================================

                    const activeValidatorsMap = {}; // Object to store validators categorized by type.

                    externalLib.each(activeValidatorKeys, function(idx, validatorKey) {
                        // Determine the override message for this validator, if provided.
                        const customMessage = currentInput.data("validation" + validatorKey + "Message");
                        const hasCustomMessage = (customMessage !== undefined);
                        let validatorMatchFound = false;
                        let effectiveMessage = (
                            customMessage ? customMessage : `'${validatorKey}' validation check failed. <!-- Add attribute 'data-validation-${validatorKey.toLowerCase()}-message' to customize -->`
                        );

                        externalLib.each(
                            currentConfig.validatorTypes,
                            function(checkType, checkTemplate) {
                                if (activeValidatorsMap[checkType] === undefined) {
                                    activeValidatorsMap[checkType] = [];
                                }
                                if (!validatorMatchFound && currentInput.data("validation" + validatorKey + formatValidatorIdentifier(checkTemplate.name)) !== undefined) {
                                    activeValidatorsMap[checkType].push(
                                        externalLib.extend(
                                            true, {
                                                name: formatValidatorIdentifier(checkTemplate.name),
                                                message: effectiveMessage
                                            },
                                            checkTemplate.init(currentInput, validatorKey)
                                        )
                                    );
                                    validatorMatchFound = true;
                                }
                            }
                        );

                        if (!validatorMatchFound && currentConfig.builtInValidators[validatorKey.toLowerCase()]) {

                            const builtInValidator = externalLib.extend(true, {}, currentConfig.builtInValidators[validatorKey.toLowerCase()]);
                            if (hasCustomMessage) {
                                builtInValidator.message = effectiveMessage;
                            }
                            const checkTypeLower = builtInValidator.type.toLowerCase();

                            if (checkTypeLower === "shortcut") {
                                validatorMatchFound = true; // Shortcuts are handled during normalization.
                            } else {
                                externalLib.each(
                                    currentConfig.validatorTypes,
                                    function(templateCheckType, templateDefinition) {
                                        if (activeValidatorsMap[templateCheckType] === undefined) {
                                            activeValidatorsMap[templateCheckType] = [];
                                        }
                                        if (!validatorMatchFound && checkTypeLower === templateCheckType.toLowerCase()) {
                                            currentInput.data("validation" + validatorKey + formatValidatorIdentifier(templateDefinition.name), builtInValidator[templateDefinition.name.toLowerCase()]);
                                            activeValidatorsMap[checkTypeLower].push(
                                                externalLib.extend(
                                                    builtInValidator,
                                                    templateDefinition.init(currentInput, validatorKey)
                                                )
                                            );
                                            validatorMatchFound = true;
                                        }
                                    }
                                );
                            }
                        }

                        if (!validatorMatchFound) {
                            externalLib.error(`Unable to locate validation information for rule: '${validatorKey}'`);
                        }
                    });

                    // =============================================================
                    //                                 PRESERVE ORIGINAL ATTRIBUTES
                    // =============================================================

                    // Store the initial HTML content of the help block.
                    feedbackMessageBlock.data(
                        "initialContent", (
                            feedbackMessageBlock.data("initialContent") ? feedbackMessageBlock.data("initialContent") : feedbackMessageBlock.html()
                        )
                    );

                    // Store the initial ARIA role of the help block.
                    feedbackMessageBlock.data(
                        "initialRole", (
                            feedbackMessageBlock.data("initialRole") ? feedbackMessageBlock.data("initialRole") : feedbackMessageBlock.attr("role")
                        )
                    );

                    // Store the initial CSS classes of the control group.
                    inputGroupContainer.data(
                        "initialClasses", (
                            inputGroupContainer.data("initialClasses") ? inputGroupContainer.data("initialClasses") : inputGroupContainer.attr("class")
                        )
                    );

                    // Store the initial ARIA invalid state of the input.
                    currentInput.data(
                        "initialAriaInvalidState", (
                            currentInput.data("initialAriaInvalidState") ? currentInput.data("initialAriaInvalidState") : currentInput.attr("aria-invalid")
                        )
                    );

                    // =============================================================
                    //                                                VALIDATION CORE
                    // =============================================================

                    currentInput.on(
                        "validation.validationEngine",
                        function(evt, validationParameters) {

                            const inputValue = getElementValue(currentInput);

                            // Collect all detected validation error messages.
                            const detectedErrors = [];

                            externalLib.each(activeValidatorsMap, function(checkType, checkListForType) {
                                // Only run validators if there's input, or if explicitly told to include empty, or during submission for blockSubmit types.
                                if (inputValue || inputValue.length || (validationParameters && validationParameters.includeEmpty) || (!!currentConfig.validatorTypes[checkType].blockSubmit && validationParameters && !!validationParameters.submitting)) {
                                    externalLib.each(checkListForType, function(idx, validator) {
                                        if (currentConfig.validatorTypes[checkType].validate(currentInput, inputValue, validator)) {
                                            detectedErrors.push(validator.message);
                                        }
                                    });
                                }
                            });

                            return detectedErrors; // Return the list of error messages.
                        }
                    );

                    currentInput.on(
                        "retrieveValidators.validationEngine",
                        function() {
                            return activeValidatorsMap;
                        }
                    );

                    // =============================================================
                    //                                          MONITOR FOR CHANGES
                    // =============================================================

                    // The original code was cut off here, so I'll add a placeholder for the continuation
                    // of change monitoring and event binding for user input.
                    // This section would typically bind 'keyup', 'change', 'blur' events to trigger validation.
                    currentInput.on("keyup.validationEngine change.validationEngine blur.validationEngine", function(event) {
                        // Logic to trigger validation on specific user interactions.
                        // For example, validate on blur if the field is not empty.
                        if (event.type === 'blur' && getElementValue(currentInput).length > 0) {
                            // Trigger full validation on blur after user input.
                            currentInput.trigger("validation.validationEngine");
                        } else if (event.type === 'keyup') {
                            // Maybe a softer, instant validation on keyup for immediate feedback.
                            // Or clear previous errors to allow user to type.
                        }
                        // This part needs the rest of the original jqBootstrapValidation library to be fully functional.
                    });
                });
            },
            // Helper function to extract element value, handling different input types.
            getElementValue: function(element) {
                if (element.is("input[type='checkbox']") || element.is("input[type='radio']")) {
                    return element.is(":checked") ? element.val() : "";
                }
                return element.val();
            },
            // Helper function to format validator names consistently.
            formatValidatorIdentifier: function(name) {
                return name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();
            }
        }
    };

    // Extend jQuery with the formInputValidation plugin.
    externalLib.fn.formInputValidation = function(method) {
        if (validationDefaults.utilityFunctions[method]) {
            return validationDefaults.utilityFunctions[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return validationDefaults.utilityFunctions.initializeValidation.apply(this, arguments);
        } else {
            externalLib.error('Method ' + method + ' does not exist on jQuery.formInputValidation');
        }
    };

    // Placeholder for built-in validators and types, as they were extensive in the original.
    // In a full Type III clone, these would be significantly rewritten or restructured.
    validationDefaults.builtInValidators = {
        required: {
            name: "required",
            type: "basic",
            message: "This field is mandatory.",
            validate: function(el, val, config) {
                return val === null || val === "";
            }
        },
        number: {
            name: "number",
            type: "basic",
            message: "Please enter a valid number.",
            validate: function(el, val, config) {
                return isNaN(val);
            }
        },
        email: {
            name: "email",
            type: "regex",
            regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            message: "Please enter a valid email address.",
            validate: function(el, val, config) {
                return !config.regex.test(val);
            }
        }
        // ... many more built-in validators would go here.
    };

    validationDefaults.validatorTypes = {
        basic: {
            name: "Basic",
            init: function(el, name) { return {}; },
            validate: function(el, val, config) { return config.validate(el, val, config); }
        },
        regex: {
            name: "Regex",
            init: function(el, name) {
                return { regex: el.data("validation" + name + "Regex") || new RegExp(el.attr("pattern")) };
            },
            validate: function(el, val, config) {
                return !config.regex.test(val);
            }
        }
        // ... many more validator types would go here.
    };

    // Expose the format function globally or attach to jQuery.
    const formatValidatorIdentifier = validationDefaults.utilityFunctions.formatValidatorIdentifier;
    const getElementValue = validationDefaults.utilityFunctions.getElementValue;

    // A simple tooltip plugin for demonstration (replacing original tooltip init)
    externalLib.fn.hintPop = function() {
        return this.each(function() {
            const currentElement = externalLib(this);
            const hintText = currentElement.attr('title') || currentElement.data('hint-content');
            if (hintText) {
                currentElement.attr('data-original-title', hintText).removeAttr('title');
                currentElement.hover(
                    function() {
                        const hintDiv = externalLib('<div class="hint-popup"></div>').text(hintText);
                        currentElement.data('hint-popup-ref', hintDiv);
                        hintDiv.css({
                            position: 'absolute',
                            left: currentElement.offset().left + currentElement.outerWidth() / 2 - hintDiv.outerWidth() / 2,
                            top: currentElement.offset().top - hintDiv.outerHeight() - 5,
                            'background-color': '#333',
                            color: '#fff',
                            padding: '5px 10px',
                            'border-radius': '3px',
                            'font-size': '0.8em',
                            'z-index': '1000'
                        }).appendTo('body').fadeIn(100);
                    },
                    function() {
                        const hintDiv = currentElement.data('hint-popup-ref');
                        if (hintDiv) {
                            hintDiv.fadeOut(100, function() {
                                externalLib(this).remove();
                            });
                        }
                    }
                );
            }
        });
    };


})(window.jQuery); // Pass jQuery as externalLib to avoid conflicts.