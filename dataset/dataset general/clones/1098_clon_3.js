/*
 * Client-Side Input Validation System 3.0, jQuery addon
 *
 * Copyright(c) 2024, Code Clone Expert
 * All rights reserved.
 *
 * Reimagined by a diligent AI assistant
 *
 * A robust form validation utility supporting custom rule definitions.
 * Distributed under the MIT License terms.
 */
(function(jqRef) {
    "use strict";

    // Core utilities and validation routines for the system
    const validationTools = {

        /**
         * Initializes the validation system for a given form element.
         * This acts as the primary setup entry point, ensuring base configurations are set.
         * @param {Object} setupOptions - Configuration parameters provided by the user.
         * @returns {Object} The jQuery object for chaining.
         */
        initializeSystem: function(setupOptions) {
            const currentForm = this; // The form element to which the plugin is applied.

            // Guard clause: Prevent re-initialization if already active.
            if (currentForm.data('inputValidator')) {
                return this;
            }

            // Store or update configuration settings for the form, merging with defaults.
            const activeSettings = validationTools._storeConfiguration(currentForm, setupOptions);

            // Attach click handlers to dynamically generated error messages for dismissal.
            // Using .on() for modern jQuery event delegation instead of deprecated .live().
            jqRef(document).on("click", ".validationErrorTip", function() {
                const self = jqRef(this);
                self.fadeOut(activeSettings.fadeDurationMs + 30, function() { // Fade out the prompt slightly longer.
                    // Remove the outer container and the prompt itself after fading.
                    self.parent('.validationErrorContainer').remove();
                    self.remove();
                });
            });

            return this; // Allow method chaining.
        },

        /**
         * Binds the validation engine to form submission and field interaction events.
         * Accepts an object of custom configuration parameters.
         * Example: jqRef("#myRegistrationForm").inputValidator('engage', { positionHint : "rightAligned" });
         * @param {Object} userPreferences - User-defined settings to override defaults.
         * @returns {Object} The jQuery object for chaining.
         */
        engage: function(userPreferences) {
            const currentForm = this;

            // Ensure this method is called on a form element.
            if (!currentForm.is("form")) {
                console.error("Input Validator: 'engage()' method must be invoked on a <form> element. Current element is not a form.");
                return this;
            }

            let activeSettings = currentForm.data('inputValidator');
            // Retrieve or save configuration settings.
            if (userPreferences) {
                activeSettings = validationTools._storeConfiguration(currentForm, userPreferences);
            } else if (!activeSettings) {
                // If no user preferences and no existing settings, initialize with defaults.
                activeSettings = validationTools._storeConfiguration(currentForm, null);
            }

            // Determine which attribute holds validation rules (data-validation-engine or class).
            const validationAttributeName = (currentForm.find("[data-validation-engine*=validate]").length > 0) ? "data-validation-engine" : "class";
            activeSettings.ruleAttribute = validationAttributeName;

            // Only proceed with binding if the system is configured to do so.
            if (activeSettings.isBound) {
                const validationSelector = `[${activeSettings.ruleAttribute}*=validate]`;

                // Bind event handlers for various input types.
                // General text inputs, selects, etc.
                currentForm.find(validationSelector).not("[type=checkbox]").not("[type=radio]").not(".datePickerInput")
                    .on(activeSettings.validationTriggerEvent, validationTools._handleFieldActivity);

                // Checkboxes and radio buttons.
                currentForm.find(`${validationSelector}[type=checkbox],${validationSelector}[type=radio]`)
                    .on("click", validationTools._handleFieldActivity);

                // Date pickers with a delay.
                currentForm.find(`${validationSelector}[class*=datePickerInput]`)
                    .on(activeSettings.validationTriggerEvent, {
                        delayMs: 300
                    }, validationTools._handleFieldActivity);
            }

            // Attach window resize event for dynamic prompt repositioning.
            if (activeSettings.autoPositionRefresh) {
                jqRef(window).on("resize", {
                    suppressAnimation: true,
                    targetForm: currentForm
                }, validationTools.refreshPromptPositions);
            }

            // Bind the form submission event.
            currentForm.on("submit", validationTools._handleSubmitAttempt);
            return this;
        },

        /**
         * Removes all validation bindings from the form and its fields.
         * Cleans up all associated data and event listeners.
         * @returns {Object} The jQuery object for chaining.
         */
        disengage: function() {
            const currentForm = this;

            // Ensure this method is called on a form element.
            if (!currentForm.is("form")) {
                console.error("Input Validator: 'disengage()' method must be invoked on a <form> element.");
                return this;
            }

            const activeSettings = currentForm.data('inputValidator');
            if (!activeSettings) {
                console.warn("Input Validator: Attempted to disengage a form without active settings. It might not have been engaged or already disengaged.");
                return this;
            }

            const validationSelector = `[${activeSettings.ruleAttribute}*=validate]`;

            // Unbind field-level events.
            currentForm.find(validationSelector).not("[type=checkbox]")
                .off(activeSettings.validationTriggerEvent, validationTools._handleFieldActivity);
            currentForm.find(`${validationSelector}[type=checkbox],${validationSelector}[type=radio]`)
                .off("click", validationTools._handleFieldActivity);

            // Unbind form submission event.
            currentForm.off("submit", validationTools._handleSubmitAttempt);

            // Unbind window resize event if it was attached.
            if (activeSettings.autoPositionRefresh) {
                jqRef(window).off("resize", validationTools.refreshPromptPositions);
            }

            // Remove all associated validation prompts from the DOM.
            validationTools.hideAllPrompts.call(currentForm);

            // Remove stored validation data from the form.
            currentForm.removeData('inputValidator');

            return this;
        },

        /**
         * Initiates validation for either the entire form or a specific field.
         * Note: This method only performs client-side field validation;
         * AJAX form-level validation is handled separately during submission.
         *
         * @returns {boolean} True if the validation passes, false otherwise.
         */
        performValidation: function() {
            const currentTarget = this;
            if (currentTarget.is("form")) {
                return validationTools._validateAllFields(currentTarget);
            } else {
                // Field-level validation.
                const parentForm = currentTarget.closest('form');
                const activeSettings = parentForm.data('inputValidator');
                if (!activeSettings) {
                    console.warn("Input Validator: No active settings found for form during field validation. Ensure the form is engaged.");
                    return false;
                }
                const fieldValidationResult = validationTools._validateSingleField(currentTarget, activeSettings);

                // Trigger success/failure callbacks based on current invalid fields.
                if (activeSettings.onValidationSuccess && activeSettings.invalidElements.length === 0) {
                    activeSettings.onValidationSuccess(parentForm);
                } else if (activeSettings.onValidationFailure && activeSettings.invalidElements.length > 0) {
                    activeSettings.onValidationFailure(parentForm);
                }

                return fieldValidationResult;
            }
        },

        /**
         * Recalculates and updates the positions of all displayed validation prompts.
         * Useful when the DOM structure changes dynamically (e.g., window resize, content expansion).
         * @param {Event} [event] - The event object, typically from a window resize.
         * @returns {Object} The jQuery object for chaining.
         */
        refreshPromptPositions: function(event) {
            let targetFormElement;
            let suppressAnimationFlag = false;

            // Determine the target form and animation preference based on event context.
            if (event && this === window) { // Check if the event is from window resize.
                targetFormElement = event.data.targetForm;
                suppressAnimationFlag = event.data.suppressAnimation;
            } else {
                // If called directly on a form or field.
                targetFormElement = jqRef(this).closest('form');
            }

            if (!targetFormElement || targetFormElement.length === 0) {
                console.warn("Input Validator: Could not find target form for prompt position refresh.");
                return this;
            }

            const activeSettings = targetFormElement.data('inputValidator');
            if (!activeSettings) {
                console.warn("Input Validator: No active settings found for form during prompt refresh. Skipping position update.");
                return this;
            }

            // Iterate over all validated fields that are currently visible and not disabled.
            targetFormElement.find(`[${activeSettings.ruleAttribute}*=validate]`).not(":disabled").each(function() {
                const currentField = jqRef(this);
                const currentPrompt = validationTools._getPromptElement(currentField);
                // Extract the content from the prompt if it exists.
                const promptDisplayContent = currentPrompt ? currentPrompt.find(".validationErrorContent").html() : undefined;

                if (currentPrompt && currentPrompt.length > 0) {
                    // Update the prompt's position without changing its content or type.
                    validationTools._repositionPrompt(currentField, currentPrompt, promptDisplayContent, undefined, false, activeSettings, suppressAnimationFlag);
                }
            });
            return this;
        },

        /**
         * Displays a validation prompt next to an element.
         * The element *must* have an ID attribute for prompt association.
         *
         * @param {string} messageText - The HTML content for the prompt.
         * @param {string} messageType - 'success' (green), 'loading' (black), or empty/other (red error).
         * @param {string} [positionHint] - Optional: 'topLeft', 'topRight', 'bottomLeft', 'centerRight', 'bottomRight'.
         * @param {boolean} [displayArrow] - Optional: Whether to show the arrow pointer on the prompt.
         * @returns {Object} The jQuery object for chaining.
         */
        displayPrompt: function(messageText, messageType, positionHint, displayArrow) {
            const targetElement = this;
            const parentForm = targetElement.closest('form');
            let activeSettings = parentForm.data('inputValidator');

            // If settings aren't found, try to initialize with defaults.
            if (!activeSettings) {
                activeSettings = validationTools._storeConfiguration(targetElement, null); // Pass null to get defaults.
            }

            // Override specific settings if provided.
            if (positionHint) {
                activeSettings.promptPlacement = positionHint;
            }
            activeSettings.showPointer = (displayArrow === true); // Ensure boolean.

            // Call the internal method to actually show the prompt.
            validationTools._renderPrompt(targetElement, messageText, messageType, false, activeSettings);
            return this;
        },

        /**
         * Hides validation prompts, either for the current element or its form.
         * Can be applied to individual fields or the entire form.
         * @returns {Object} The jQuery object for chaining.
         */
        hidePrompt: function() {
            const targetElement = this;
            const parentForm = targetElement.closest('form');

            // If no form is found, there's nothing to hide within its context.
            if (parentForm.length === 0) {
                return this;
            }

            const activeSettings = parentForm.data('inputValidator');
            const fadeDuration = activeSettings ? activeSettings.fadeDurationMs : 300; // Default if no settings.

            let promptIdentifier;
            if (targetElement.is("form")) {
                // Hiding prompts for the entire form.
                promptIdentifier = "formParent-" + validationTools._sanitizeClassName(targetElement.attr("id"));
            } else {
                // Hiding a specific field's prompt.
                promptIdentifier = validationTools._sanitizeClassName(targetElement.attr("id")) + "-validationError";
            }

            // Find and fade out the relevant prompts.
            jqRef('.' + promptIdentifier).fadeTo(fadeDuration, 0, function() { // Fade out completely (opacity 0).
                jqRef(this).parent('.validationErrorContainer').remove();
                jqRef(this).remove();
            });
            return this;
        },

        /**
         * Hides all validation prompts across the entire document.
         * This method operates globally across all forms.
         * @returns {Object} The jQuery object for chaining.
         */
        hideAllPrompts: function() {
            const currentContext = this; // Can be a form or any jQuery object.
            const formSettings = currentContext.closest('form').data('inputValidator');
            const fadeDuration = formSettings ? formSettings.fadeDurationMs : 300; // Use default if no settings.

            // Select all error prompts and fade them out.
            jqRef('.validationErrorTip').fadeTo(fadeDuration, 0, function() { // Fade out completely.
                jqRef(this).parent('.validationErrorContainer').remove();
                jqRef(this).remove();
            });
            return this;
        },

        /**
         * Event handler for field interactions (blur, click).
         * Triggers validation for the specific field.
         * @param {Event} event - The event object.
         */
        _handleFieldActivity: function(event) {
            const currentField = jqRef(this);
            const parentForm = currentField.closest('form');
            const activeSettings = parentForm.data('inputValidator');

            if (!activeSettings) {
                console.warn("Input Validator: No active settings found for form during field activity handling. Skipping field validation.");
                return;
            }

            activeSettings.triggerSource = "fieldInteraction";

            // Delay validation if specified in event data (e.g., for date pickers).
            const delayTime = (event.data && event.data.delayMs) ? event.data.delayMs : 0;

            window.setTimeout(() => {
                const validationPassed = validationTools._validateSingleField(currentField, activeSettings);

                // Execute callbacks based on the form's overall validation status (after this field).
                // Note: These callbacks are more typically for form-level validation completion.
                // For field-level, consider specific field-level callbacks if needed.
                if (validationPassed && activeSettings.invalidElements.length === 0 && activeSettings.onValidationSuccess) {
                    activeSettings.onValidationSuccess(parentForm);
                } else if (!validationPassed && activeSettings.invalidElements.length > 0 && activeSettings.onValidationFailure) {
                    activeSettings.onValidationFailure(parentForm);
                }
            }, delayTime);
        },

        /**
         * Event handler for form submission attempts.
         * Initiates full form validation and handles AJAX submission if configured.
         *
         * @returns {boolean} False if form submission should be cancelled (e.g., due to errors or AJAX handling).
         */
        _handleSubmitAttempt: function() {
            const currentForm = jqRef(this);
            const activeSettings = currentForm.data('inputValidator');

            if (!activeSettings) {
                console.error("Input Validator: No active settings found for form during submit attempt. Allowing default submission.");
                return true; // Allow submission if validator isn't properly initialized.
            }

            activeSettings.triggerSource = "formSubmission";

            // Perform client-side validation for all fields.
            const formIsValidClientSide = validationTools._validateAllFields(currentForm);

            // If AJAX form validation is enabled and client-side validation passed.
            if (formIsValidClientSide && activeSettings.useAjaxFormValidation) {
                validationTools._initiateAjaxFormValidation(currentForm, activeSettings);
                return false; // Prevent default form submission as AJAX will handle it.
            }

            // If a custom callback for validation completion is provided.
            if (typeof activeSettings.onValidationCompletion === 'function') {
                // The callback can return true to allow submission or false to prevent it.
                // !! ensures that an undefined return becomes false.
                return !!activeSettings.onValidationCompletion(currentForm, formIsValidClientSide);
            }

            return formIsValidClientSide; // Allow/prevent submission based on client-side validation.
        },

        /**
         * Checks the overall status of asynchronous field validations.
         * @param {Object} currentSettings - The active configuration settings.
         * @returns {boolean} True if all AJAX field validations have passed so far.
         */
        _checkOverallAjaxStatus: function(currentSettings) {
            let allAjaxValid = true;
            // Iterate through the cache of AJAX validation results.
            jqRef.each(currentSettings.ajaxValidationCache, (fieldId, isValid) => {
                if (!isValid) {
                    allAjaxValid = false;
                    return false; // Break the $.each loop.
                }
            });
            return allAjaxValid;
        },

        /**
         * Retrieves the AJAX validation status for a specific field.
         * @param {string} elementId - The ID of the field.
         * @param {Object} currentSettings - The active configuration settings.
         * @returns {boolean|undefined} True if valid, false if invalid, undefined if not checked.
         */
        _getAjaxFieldStatus: function(elementId, currentSettings) {
            // Returns true if cached as valid, false or undefined otherwise.
            return currentSettings.ajaxValidationCache[elementId] === true;
        },

        /**
         * Validates all fields within a form, displaying prompts as necessary.
         * This method focuses on client-side validation and scrolls to the first error.
         *
         * @param {Object} targetForm - The jQuery object representing the form.
         * @returns {boolean} True if the form is entirely valid, false otherwise.
         */
        _validateAllFields: function(targetForm) {
            const activeSettings = targetForm.data('inputValidator');
            if (!activeSettings) {
                console.error("Input Validator: No active settings found for form during full validation. Cannot proceed.");
                return false;
            }

            let encounteredError = false; // Flag to track if any error is found.
            let firstErrorElement = null; // Stores the first element with an error for scrolling.

            // Clear previous invalid fields and AJAX cache for a fresh validation run.
            activeSettings.invalidElements = [];
            activeSettings.ajaxValidationCache = {}; // Reset AJAX status for all fields.

            // Trigger a custom event to signal the start of form validation.
            targetForm.trigger("jqv.form.validating");

            const validatedFieldNames = new Set(); // To prevent validating fields with the same name multiple times (e.g., radio groups).

            // Iterate over all validated fields that are not disabled.
            targetForm.find(`[${activeSettings.ruleAttribute}*=validate]`).not(":disabled").each(function() {
                const currentField = jqRef(this);
                const fieldName = currentField.attr('name');

                // Skip fields that have already been processed (e.g., radio groups).
                if (!validatedFieldNames.has(fieldName)) {
                    const fieldHasError = !validationTools._validateSingleField(currentField, activeSettings); // _validateSingleField returns true for valid.
                    if (fieldHasError) {
                        encounteredError = true;
                        if (!firstErrorElement) {
                            // If it's the first error, store the element.
                            firstErrorElement = currentField;
                            // Adjust for prettySelect if the field is hidden.
                            if (currentField.is(":hidden") && activeSettings.usePrettySelect) {
                                firstErrorElement = targetForm.find(`#${activeSettings.prefixID}${currentField.attr('id')}${activeSettings.suffixID}`);
                            }
                        }
                    }
                    validatedFieldNames.add(fieldName); // Mark this field name as processed.

                    // If configured to stop on the first error, break the loop.
                    if (activeSettings.stopOnFirstError && encounteredError) {
                        return false; // Break the jQuery .each loop.
                    }
                }
            });

            // Trigger a custom event with the validation result.
            targetForm.trigger("jqv.form.result", [encounteredError]);

            if (encounteredError) {
                // If errors were found, handle scrolling and focusing.
                if (activeSettings.enableScrolling && firstErrorElement) {
                    const scrollTarget = firstErrorElement;
                    let targetVerticalPosition = scrollTarget.offset().top;
                    const targetHorizontalPosition = scrollTarget.offset().left;

                    // Adjust scroll target if prompt is positioned differently.
                    const promptPosType = activeSettings.promptPlacement;
                    if (typeof promptPosType === 'string' && promptPosType.includes(":")) {
                        // Extract base position type (e.g., 'bottomLeft:+20' -> 'bottomLeft').
                        const basePosition = promptPosType.substring(0, promptPosType.indexOf(":"));
                        if (basePosition !== "bottomRight" && basePosition !== "bottomLeft") {
                            const promptElem = validationTools._getPromptElement(scrollTarget);
                            if (promptElem && promptElem.length) {
                                targetVerticalPosition = promptElem.offset().top;
                            }
                        }
                    }

                    // Handle scrolling for overflow containers or the document.
                    if (activeSettings.isScrollableContainer) {
                        const overflowContainer = jqRef(activeSettings.scrollableContainerSelector);
                        if (overflowContainer.length === 0) {
                            console.warn("Input Validator: Scrollable container not found for scrolling to error: " + activeSettings.scrollableContainerSelector);
                            return false; // Prevent submission if scroll target is missing.
                        }
                        const containerScrollPosition = overflowContainer.scrollTop();
                        const containerOffsetTop = -parseInt(overflowContainer.offset().top, 10);

                        targetVerticalPosition += containerScrollPosition + containerOffsetTop - 5; // Adjust with some padding.
                        overflowContainer.animate({
                            scrollTop: targetVerticalPosition
                        }, activeSettings.scrollAnimationSpeed, function() {
                            if (activeSettings.focusOnError) {
                                scrollTarget.focus();
                            }
                        });
                    } else {
                        jqRef("html, body").not(":animated").animate({
                            scrollTop: targetVerticalPosition,
                            scrollLeft: targetHorizontalPosition
                        }, activeSettings.scrollAnimationSpeed, function() {
                            if (activeSettings.focusOnError) {
                                scrollTarget.focus();
                            }
                        });
                    }
                } else if (activeSettings.focusOnError && firstErrorElement) {
                    firstErrorElement.focus(); // Just focus if no scrolling.
                }
                return false; // Form is not valid.
            }
            return true; // Form is valid.
        },

        /**
         * Initiates an AJAX form validation request.
         * Sends all form data to a server endpoint for validation.
         *
         * @param {Object} targetForm - The jQuery object representing the form.
         * @param {Object} currentSettings - The active configuration settings.
         */
        _initiateAjaxFormValidation: function(targetForm, currentSettings) {
            const formData = targetForm.serialize(); // Serialize form data for submission.
            const requestMethod = currentSettings.ajaxMethod || "GET";
            const requestUrl = currentSettings.ajaxFormValidationUrl || targetForm.attr("action");
            const responseDataType = currentSettings.ajaxDataType || "json";

            jqRef.ajax({
                type: requestMethod,
                url: requestUrl,
                cache: false, // Prevent caching of validation responses.
                dataType: responseDataType,
                data: formData,
                context: {
                    form: targetForm,
                    settings: currentSettings,
                    validationToolsRef: validationTools // Pass reference to self for callbacks.
                },
                beforeSend: function(jqXHR, ajaxSettings) {
                    // Execute custom beforeSend callback if provided.
                    if (typeof this.settings.onBeforeAjaxFormValidation === 'function') {
                        return this.settings.onBeforeAjaxFormValidation(this.form, this.settings);
                    }
                    return true; // Allow request to proceed by default.
                },
                error: function(xhr, status, errorThrown) {
                    // Log AJAX errors.
                    console.error("Input Validator: AJAX form validation error occurred.", status, errorThrown, xhr);
                    if (typeof this.settings.onAjaxError === 'function') {
                        this.settings.onAjaxError(this.form, this.settings, xhr, status, errorThrown);
                    }
                    // Treat as failure to be safe if error handler doesn't prevent.
                    this.settings.onAjaxFormCompletion(false, this.form, null, this.settings);
                },
                success: function(serverResponse) {
                    const {
                        form,
                        settings,
                        validationToolsRef
                    } = this.context; // Access context variables.

                    if (serverResponse !== true) {
                        // Server returned specific validation feedback (array of errors/successes).
                        let formHasErrors = false;
                        if (Array.isArray(serverResponse)) {
                            for (let i = 0; i < serverResponse.length; i++) {
                                const validationFeedback = serverResponse[i];
                                const fieldId = validationFeedback[0];
                                const isValid = validationFeedback[1];
                                const messageKeyOrText = validationFeedback[2];

                                const targetField = jqRef(`#${fieldId}`); // Select the field by ID.
                                if (targetField.length === 1) { // Ensure the field exists.
                                    let displayMessage = messageKeyOrText;
                                    let promptClass = ""; // Default to red error.

                                    if (isValid) {
                                        // Field is valid according to server.
                                        promptClass = "success";
                                        if (messageKeyOrText && settings.allValidationRules[messageKeyOrText]) {
                                            const successText = settings.allValidationRules[messageKeyOrText].successMessage;
                                            if (successText) displayMessage = successText;
                                        }
                                        // If message is empty, close prompt, otherwise show green success.
                                        if (displayMessage === "" || !displayMessage) {
                                            validationToolsRef._clearPrompt(targetField);
                                        } else {
                                            validationToolsRef._renderPrompt(targetField, displayMessage, promptClass, false, settings, true);
                                        }
                                    } else {
                                        // Field is invalid according to server.
                                        formHasErrors = true;
                                        if (messageKeyOrText && settings.allValidationRules[messageKeyOrText]) {
                                            const errorText = settings.allValidationRules[messageKeyOrText].errorMessage;
                                            if (errorText) displayMessage = errorText;
                                        }
                                        validationToolsRef._renderPrompt(targetField, displayMessage, promptClass, false, settings, true);
                                    }
                                } else {
                                    console.warn(`Input Validator: AJAX response referenced unknown field ID: ${fieldId}`);
                                }
                            }
                        } else {
                            // Server response format unexpected but not `true`. Treat as error.
                            console.warn("Input Validator: Unexpected AJAX form validation response format. Expected boolean or array of arrays.", serverResponse);
                            formHasErrors = true;
                        }
                        // Call the completion callback with the overall form validity.
                        settings.onAjaxFormCompletion(!formHasErrors, form, serverResponse, settings);
                    } else {
                        // Server responded with `true`, meaning the entire form is valid.
                        settings.onAjaxFormCompletion(true, form, "", settings);
                    }
                }
            });
        },

        /**
         * Validates a single input field against its defined rules.
         *
         * @param {Object} inputElement - The jQuery object representing the field.
         * @param {Object} currentSettings - The active configuration settings for the form.
         * @param {boolean} [skipAjaxCheck=false] - If true, skips AJAX validation for this field.
         * @returns {boolean} True if the field is valid, false otherwise.
         */
        _validateSingleField: function(inputElement, currentSettings, skipAjaxCheck = false) {
            // Assign a unique ID if the field doesn't have one.
            if (!inputElement.attr("id")) {
                const generatedId = `validator-field-${jqRef.validationEngine.nextFieldId}`;
                inputElement.attr("id", generatedId);
                jqRef.validationEngine.nextFieldId++;
            }

            // Skip validation for hidden fields unless using prettySelect.
            if ((inputElement.is(":hidden") && !currentSettings.usePrettySelect) || inputElement.parent().is(":hidden")) {
                validationTools._clearPrompt(inputElement, true); // Ensure prompt is hidden if field is not validated.
                return true; // Consider valid if hidden and not special.
            }

            const ruleAttributeValue = inputElement.attr(currentSettings.ruleAttribute);
            const ruleMatcher = /validate\[(.*)\]/.exec(ruleAttributeValue);

            if (!ruleMatcher) {
                validationTools._clearPrompt(inputElement, true); // No rules, so no prompt.
                return true; // No validation rules found, so consider it valid.
            }

            const rawRulesString = ruleMatcher[1];
            // Split rules by `[`, `,`, or `]` and trim whitespace. Filter out empty strings.
            const fieldRules = rawRulesString.split(/\[|,|\]/).map(rule => rule.trim()).filter(rule => rule !== "");

            let isFieldValid = true;
            let errorMessageContent = "";
            let promptClassification = ""; // Default to error type.

            currentSettings.isError = false; // Reset error flag for this validation cycle.
            currentSettings.showPointer = true; // Default to showing the prompt arrow.

            const parentForm = inputElement.closest("form");

            // Iterate through each validation rule for the field.
            for (let i = 0; i < fieldRules.length; i++) {
                const currentRule = fieldRules[i];
                let ruleMessage = undefined; // Will hold error message if rule fails.

                // Process standard validation rules.
                switch (currentRule) {
                    case "required":
                        ruleMessage = validationTools._checkRequirement(parentForm, inputElement, currentRule, fieldRules, i, currentSettings, validationTools._isFieldRequired);
                        break;
                    case "custom":
                        // Placeholder for custom rule execution.
                        // The actual custom rule logic would be dynamically fetched and executed.
                        // For this clone, we assume _getErrorMessage handles this via settings.allValidationRules.
                        ruleMessage = validationTools._getErrorMessage(parentForm, inputElement, currentRule, fieldRules, i, currentSettings);
                        break;
                        // Add more cases for other built-in validation rules here (e.g., 'email', 'minSize', 'maxSize', 'number', 'url', 'date', 'regex', 'ajax').
                        // For 'ajax' rules, conditional logic to skip if skipAjaxCheck is true.
                    default:
                        // For any other rule (e.g., 'email', 'minSize', etc.)
                        ruleMessage = validationTools._getErrorMessage(parentForm, inputElement, currentRule, fieldRules, i, currentSettings);
                        break;
                }

                if (ruleMessage) {
                    isFieldValid = false;
                    errorMessageContent = ruleMessage;
                    currentSettings.isError = true;
                    // Break from the loop if an error is found and we are showing only one error per field.
                    break;
                }
            }

            // After checking all rules, display or clear the prompt.
            if (!isFieldValid) {
                validationTools._renderPrompt(inputElement, errorMessageContent, promptClassification, false, currentSettings);
                // Add to invalid elements list if not already present.
                if (!currentSettings.invalidElements.includes(inputElement[0])) {
                    currentSettings.invalidElements.push(inputElement[0]);
                }
                return false; // Field is invalid.
            } else {
                validationTools._clearPrompt(inputElement);
                // Remove from invalid elements if it was previously there.
                currentSettings.invalidElements = currentSettings.invalidElements.filter(el => el !== inputElement[0]);
                return true; // Field is valid.
            }
        },

        // --- Private Helper Methods ---

        /**
         * Stores or updates the validation configuration for a form.
         * Merges user options with default settings.
         * @param {Object} formElement - The jQuery object of the form.
         * @param {Object} userOpts - User-provided options.
         * @returns {Object} The merged configuration settings.
         */
        _storeConfiguration: function(formElement, userOpts) {
            // Default settings for the validation engine.
            const defaultSettings = {
                validationTriggerEvent: "blur", // Event that triggers field validation.
                promptPlacement: "topRight", // Position of validation prompts.
                fadeDurationMs: 500, // Duration of fade animations for prompts.
                autoPositionRefresh: true, // Automatically update prompt positions on window resize.
                isBound: true, // Whether events are bound automatically.
                useAjaxFormValidation: false, // Enable AJAX validation for the entire form.
                ajaxMethod: "GET",
                ajaxFormValidationUrl: null,
                ajaxDataType: "json",
                onValidationSuccess: null, // Callback on form success.
                onValidationFailure: null, // Callback on form failure.
                onValidationCompletion: null, // Callback after validation (client-side).
                onBeforeAjaxFormValidation: function() { return true; }, // Callback before AJAX form validation.
                onAjaxFormCompletion: function() {}, // Callback after AJAX form validation completes.
                onAjaxError: function() {}, // Callback on AJAX error.
                allValidationRules: {}, // Placeholder for custom rules and their messages.
                invalidElements: [], // List of currently invalid fields.
                ajaxValidationCache: {}, // Cache for AJAX field validation results.
                triggerSource: "programmatic", // How validation was triggered.
                enableScrolling: true, // Scroll to the first error.
                focusOnError: true, // Focus on the first error field.
                isScrollableContainer: false, // Is the form within a custom scrollable div?
                scrollableContainerSelector: "", // Selector for the scrollable container.
                stopOnFirstError: false, // Stop validating fields after the first error is found.
                usePrettySelect: false, // Special handling for hidden select fields.
                prefixID: 'jqv_', // Prefix for generated IDs for prettySelect.
                suffixID: '_field', // Suffix for generated IDs for prettySelect.
                scrollAnimationSpeed: 1100 // Speed for scroll animation.
            };

            // Retrieve existing settings or start with defaults.
            let currentSettings = formElement.data('inputValidator') || {};

            // Merge default settings with existing settings, then with user-provided options.
            // This ensures user options override everything.
            currentSettings = jqRef.extend(true, {}, defaultSettings, currentSettings, userOpts);

            formElement.data('inputValidator', currentSettings); // Store the updated settings.
            return currentSettings;
        },

        /**
         * Retrieves the prompt element associated with a given field.
         * @param {Object} fieldElement - The jQuery object of the input field.
         * @returns {Object|null} The jQuery object of the prompt, or null if not found.
         */
        _getPromptElement: function(fieldElement) {
            const fieldId = fieldElement.attr("id");
            if (!fieldId) {
                console.warn("Input Validator: Cannot retrieve prompt for field without an ID.", fieldElement);
                return jqRef(); // Return an empty jQuery object.
            }

            // Construct the class name used for the prompt.
            const promptClass = `${validationTools._sanitizeClassName(fieldId)}-validationError`;
            return jqRef(`.${promptClass}`);
        },

        /**
         * Renders or updates a validation prompt for a field.
         * @param {Object} fieldElement - The jQuery object of the input field.
         * @param {string} messageHtml - The HTML content for the prompt.
         * @param {string} typeClass - 'success', 'loading', or empty/other for error.
         * @param {boolean} [forceUpdate=false] - If true, forces prompt recreation.
         * @param {Object} settings - The active configuration settings.
         * @param {boolean} [noAnimation=false] - If true, skips fade animation.
         */
        _renderPrompt: function(fieldElement, messageHtml, typeClass, forceUpdate = false, settings, noAnimation = false) {
            const fieldId = fieldElement.attr("id");
            if (!fieldId) {
                console.warn("Input Validator: Cannot render prompt for field without an ID. Field:", fieldElement[0]);
                return;
            }

            const promptIdentifier = `${validationTools._sanitizeClassName(fieldId)}-validationError`;
            let existingPrompt = jqRef(`.${promptIdentifier}`);

            // If prompt exists and not forced to update, just update its content/class.
            if (existingPrompt.length > 0 && !forceUpdate) {
                existingPrompt.find(".validationErrorContent").html(messageHtml);
                existingPrompt.removeClass("validationError success loading").addClass(typeClass);
                // Reposition without animation.
                validationTools._repositionPrompt(fieldElement, existingPrompt, messageHtml, typeClass, forceUpdate, settings, true);
                return;
            }

            // If a prompt exists but we're forced to update or create new, remove old one first.
            if (existingPrompt.length > 0) {
                existingPrompt.parent('.validationErrorContainer').remove();
            }

            // Create new prompt HTML structure.
            const promptHtml = `<div class="validationErrorContainer">
                                    <div class="validationErrorTip ${promptIdentifier} validationError ${typeClass}">
                                        <div class="validationErrorContent">${messageHtml}</div>
                                        <div class="validationErrorArrow"></div>
                                    </div>
                                </div>`;

            // Append the prompt to the body (or a custom container if specified, though body is common).
            jqRef('body').append(promptHtml);
            const newPrompt = jqRef(`.${promptIdentifier}`);

            // Position the new prompt.
            validationTools._repositionPrompt(fieldElement, newPrompt, messageHtml, typeClass, forceUpdate, settings, noAnimation);

            // Animate the prompt appearance.
            if (!noAnimation) {
                newPrompt.fadeIn(settings.fadeDurationMs);
            }
        },

        /**
         * Clears (removes) the validation prompt for a specific field.
         * @param {Object} fieldElement - The jQuery object of the input field.
         * @param {boolean} [noAnimation=false] - If true, skips fade animation.
         */
        _clearPrompt: function(fieldElement, noAnimation = false) {
            const fieldId = fieldElement.attr("id");
            if (!fieldId) return;

            const promptIdentifier = `${validationTools._sanitizeClassName(fieldId)}-validationError`;
            const promptElement = jqRef(`.${promptIdentifier}`);

            if (promptElement.length > 0) {
                if (noAnimation) {
                    promptElement.parent('.validationErrorContainer').remove();
                    promptElement.remove();
                } else {
                    const formSettings = fieldElement.closest('form').data('inputValidator');
                    const fadeDuration = formSettings ? formSettings.fadeDurationMs : 300;
                    promptElement.fadeOut(fadeDuration, function() {
                        jqRef(this).parent('.validationErrorContainer').remove();
                        jqRef(this).remove();
                    });
                }
            }
        },

        /**
         * Repositions an existing validation prompt based on field and settings.
         * @param {Object} fieldElement - The jQuery object of the input field.
         * @param {Object} promptElement - The jQuery object of the prompt to reposition.
         * @param {string} promptText - The text content of the prompt (used for recalculating size if needed).
         * @param {string} typeClass - The type class ('success', 'loading', or '').
         * @param {boolean} forceUpdate - Whether to force a full update.
         * @param {Object} settings - The active configuration settings.
         * @param {boolean} noAnimation - If true, skips animation for repositioning.
         */
        _repositionPrompt: function(fieldElement, promptElement, promptText, typeClass, forceUpdate, settings, noAnimation) {
            // Ensure prompt is visible temporarily to get correct dimensions.
            promptElement.css({ visibility: 'hidden', display: 'block' });

            const fieldOffset = fieldElement.offset();
            const fieldWidth = fieldElement.outerWidth();
            const fieldHeight = fieldElement.outerHeight();
            const promptWidth = promptElement.outerWidth();
            const promptHeight = promptElement.outerHeight();

            let targetTop = fieldOffset.top;
            let targetLeft = fieldOffset.left;
            let arrowClass = "validationErrorArrow"; // Default arrow class.

            // Get base position type, removing any offset modifiers.
            const basePlacement = (typeof settings.promptPlacement === 'string' && settings.promptPlacement.includes(":")) ?
                settings.promptPlacement.substring(0, settings.promptPlacement.indexOf(":")) : settings.promptPlacement;

            // Basic positioning logic.
            switch (basePlacement) {
                case "topLeft":
                    targetTop -= promptHeight + 5;
                    targetLeft += fieldWidth / 2 - promptWidth / 2;
                    arrowClass += "Bottom";
                    break;
                case "bottomLeft":
                    targetTop += fieldHeight + 5;
                    targetLeft += fieldWidth / 2 - promptWidth / 2;
                    arrowClass += "Top";
                    break;
                case "centerRight":
                    targetTop += (fieldHeight / 2) - (promptHeight / 2);
                    targetLeft += fieldWidth + 10;
                    arrowClass += "Left";
                    break;
                case "topRight":
                default: // Default to topRight if not specified or unrecognized.
                    targetTop -= promptHeight + 5;
                    targetLeft += fieldWidth - promptWidth;
                    arrowClass += "Bottom";
                    break;
            }

            // Apply custom offsets if specified in promptPlacement (e.g., "topRight:+10,-5")
            if (typeof settings.promptPlacement === 'string' && settings.promptPlacement.includes(":")) {
                const offsetString = settings.promptPlacement.substring(settings.promptPlacement.indexOf(":") + 1);
                const offsets = offsetString.split(",").map(val => parseInt(val.trim(), 10));
                if (!isNaN(offsets[0])) targetLeft += offsets[0];
                if (!isNaN(offsets[1])) targetTop += offsets[1];
            }

            // Update prompt position.
            promptElement.css({
                top: targetTop,
                left: targetLeft,
                visibility: 'visible'
            });

            // Update arrow visibility/position based on settings.showPointer
            const arrowElement = promptElement.find(".validationErrorArrow");
            if (settings.showPointer) {
                arrowElement.show().removeClass("validationErrorArrowBottom validationErrorArrowTop validationErrorArrowLeft").addClass(arrowClass);
            } else {
                arrowElement.hide();
            }

            // Restore display property, potentially hiding it if it was hidden initially and not part of an animation.
            if (!noAnimation && promptElement.css('display') === 'none') {
                 promptElement.hide(); // Hide it again if it was hidden.
            }
        },

        /**
         * Retrieves the error message for a given field and rule.
         * This method would contain the logic for various built-in and custom rules.
         * @param {Object} formElem - The jQuery object of the form.
         * @param {Object} inputElem - The jQuery object of the input field.
         * @param {string} ruleName - The name of the validation rule.
         * @param {Array<string>} allRules - All rules applied to the field.
         * @param {number} ruleIndex - The index of the current rule in `allRules`.
         * @param {Object} settings - The active configuration settings.
         * @param {Function} [ruleFunction] - Optional: A specific function to execute for this rule, if it's a direct validation check.
         * @returns {string|undefined} The error message if validation fails, otherwise undefined.
         */
        _getErrorMessage: function(formElem, inputElem, ruleName, allRules, ruleIndex, settings, ruleFunction) {
            // This function would typically dispatch to specific rule handlers.
            // For this clone, we'll demonstrate a simplified structure.

            let errorMessage = undefined;
            const ruleDefinition = settings.allValidationRules[ruleName];

            if (ruleFunction) {
                // If a direct validation function is provided (e.g., for 'required').
                if (!ruleFunction(inputElem)) {
                    errorMessage = ruleDefinition?.errorMessage || `Validation failed for: ${ruleName}`;
                }
            } else if (ruleDefinition && ruleDefinition.validator) {
                // If the rule has a custom validator function defined in settings.
                const fieldValue = inputElem.val();
                if (!ruleDefinition.validator(fieldValue, inputElem, allRules, ruleIndex)) {
                    errorMessage = ruleDefinition.errorMessage || `Validation failed for: ${ruleName}`;
                }
            } else {
                // Fallback for rules without explicit functions (e.g., simple regex rules).
                // In a full implementation, this would involve more complex parsing of rules like min[5] or regex[pattern].
                errorMessage = `Missing validator for rule: ${ruleName}`;
            }

            return errorMessage;
        },

        /**
         * Validates if a field is required and has a value.
         * @param {Object} inputElem - The jQuery object of the input field.
         * @returns {boolean} True if the field has a value, false otherwise.
         */
        _isFieldRequired: function(inputElem) {
            const fieldType = inputElem.attr("type");
            const fieldValue = inputElem.val();

            if (fieldType === "checkbox" || fieldType === "radio") {
                return inputElem.is(":checked");
            } else if (inputElem.is("select")) {
                // For select, check if an option other than the default empty one is selected.
                // Assuming the first option or an option with value="" is the default.
                return (fieldValue !== null && fieldValue !== "");
            } else {
                // For text inputs, textareas, etc.
                return (fieldValue !== null && typeof fieldValue === 'string' && fieldValue.trim() !== "");
            }
        },

        /**
         * Sanitizes a string to be used as a valid CSS class name.
         * Replaces invalid characters with underscores.
         * @param {string} inputString - The string to sanitize (e.g., an element ID).
         * @returns {string} The sanitized string.
         */
        _sanitizeClassName: function(inputString) {
            if (typeof inputString !== 'string' || inputString === null) {
                return "";
            }
            // Replace non-alphanumeric characters (except hyphen and underscore) with underscores.
            // Ensure it doesn't start with a number or hyphen (common CSS class restrictions).
            return inputString.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^[0-9-]/, '_');
        }
    };

    // Attach the validation engine to jQuery's prototype.
    // Ensure it can be called as `jqRef(selector).inputValidator('method', args)`.
    jqRef.fn.inputValidator = function(methodName) {
        // Method calling logic.
        if (validationTools[methodName]) {
            return validationTools[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodName === 'object' || !methodName) {
            // Default to 'initializeSystem' if no method name or an options object is passed.
            return validationTools.initializeSystem.apply(this, arguments);
        } else {
            // Method does not exist.
            jqRef.error('Method ' + methodName + ' does not exist on jQuery.inputValidator');
        }
    };

    // Provide a way to access internal tools or settings if needed (e.g., for custom rule registration).
    // This allows extending functionality without modifying the core.
    jqRef.validationEngine = { // Renamed from $.validationEngine to avoid potential conflicts and match new plugin name.
        nextFieldId: 1, // Counter for generating unique field IDs.
        // Method to dynamically add or update a validation rule globally.
        addRule: function(ruleName, ruleDefinition) {
            // This would merge into the default settings' `allValidationRules`.
            // For simplicity, we'll expose a global rule store.
            if (!jqRef.validationEngine.globalRules) {
                jqRef.validationEngine.globalRules = {};
            }
            jqRef.validationEngine.globalRules[ruleName] = ruleDefinition;
            console.info(`Input Validator: Custom rule '${ruleName}' has been registered.`);
        },
        // A simple example rule for demonstration.
        globalRules: {
            'emailFormat': {
                validator: function(value) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                errorMessage: "Please enter a valid email address."
            },
            'minLength': {
                validator: function(value, field, rules, i) {
                    const min = parseInt(rules[i+1], 10); // Assuming rule is 'minLength[X]'
                    return value.length >= min;
                },
                errorMessage: "Minimum length is {0} characters." // Placeholder for dynamic message.
            }
        }
    };

})(jQuery);