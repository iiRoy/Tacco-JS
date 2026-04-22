/*
 * Copyright (C) Contoso Corporation. All rights reserved.
 * Client-Side Form Validation Module
 */

// Global namespace for application validation utilities
const App = App || {};
App.Validation = App.Validation || {};

/**
 * Utility functions for common validation tasks.
 * @namespace App.Validation.Utils
 */
App.Validation.Utils = {
    /**
     * Checks if a string is null, undefined, or empty after trimming.
     * @param {string} inputString - The string to check.
     * @returns {boolean} True if the string is empty or null, false otherwise.
     */
    isStringEmptyOrNull: function(inputString) {
        if (typeof inputString !== 'string') {
            return true; // Treat non-strings as empty for this context
        }
        return !inputString || inputString.trim().length === 0;
    },

    /**
     * Checks if an array is null, undefined, or has no elements.
     * @param {Array} targetArray - The array to check.
     * @returns {boolean} True if the array is empty or null, false otherwise.
     */
    isArrayEmptyOrNull: function(targetArray) {
        return !Array.isArray(targetArray) || targetArray.length === 0;
    },

    /**
     * Removes all child nodes from a given DOM element.
     * @param {HTMLElement} parentElement - The parent element.
     */
    clearChildren: function(parentElement) {
        if (parentElement) {
            parentElement.innerHTML = '';
        }
    },

    /**
     * Sets the text content of a DOM element.
     * @param {HTMLElement} targetElement - The element to update.
     * @param {string} newText - The text to set.
     */
    setElementText: function(targetElement, newText) {
        if (targetElement) {
            targetElement.textContent = newText;
        }
    }
};

/**
 * Represents a basic validation check.
 * @typedef {object} ValidationCheck
 * @property {string} errorMessageText - The message to display if validation fails.
 * @property {function} ruleProcessor - The function that performs the validation.
 * @property {string} ruleIdentifier - An identifier for the validation rule.
 */

/**
 * Represents a field's validation configuration received from the server.
 * @typedef {object} JsonFieldConfiguration
 * @property {string} FieldName
 * @property {string} ValidationMessageId
 * @property {boolean} ReplaceValidationMessageContents
 * @property {Array<JsonValidationRule>} ValidationRules
 */

/**
 * Represents a validation rule for a field.
 * @typedef {object} JsonValidationRule
 * @property {string} RuleName
 * @property {string} ErrorMessage
 * @property {object} Parameters - Additional parameters for the rule.
 */

/**
 * Represents a form's overall validation configuration.
 * @typedef {object} JsonFormConfiguration
 * @property {string} FormId
 * @property {string} ValidationSummaryId
 * @property {boolean} ReplaceValidationSummary
 * @property {Array<JsonFieldConfiguration>} Fields
 */

/**
 * A simple object factory for validation context (placeholder, can be removed).
 * @returns {object} An empty object.
 */
App.Validation.createValidationContext = function() {
    return {};
};

/**
 * Handles number input validation.
 * @class
 * @memberof App.Validation
 */
App.Validation.NumberInputValidator = function() {
    // Constructor is intentionally empty as there's no instance-specific state needed for `validate`
};

/**
 * Static method to create a delegate for number validation.
 * @param {JsonValidationRule} rule - The validation rule configuration.
 * @returns {function(string, App.Validation.createValidationContext): boolean|string} A bound validation function.
 */
App.Validation.NumberInputValidator.buildValidator = function(rule) {
    // For this specific validator, the rule object might contain locale-specific parsing info
    // which is not used here but could be passed to `parseFloat` or a more advanced parser.
    const instance = new App.Validation.NumberInputValidator();
    return instance.checkValue.bind(instance); // Using bind for modern JS
};

App.Validation.NumberInputValidator.prototype = {
    /**
     * Validates if the given value is a valid number.
     * @param {string} valueToExamine - The string value to validate.
     * @param {App.Validation.createValidationContext} validationContext - The validation context (unused here).
     * @returns {boolean} True if the value is a valid number or empty, false otherwise.
     */
    checkValue: function(valueToExamine, validationContext) {
        // Guard against non-string inputs if necessary, though context implies string
        if (typeof valueToExamine !== 'string') {
            return false;
        }

        if (App.Validation.Utils.isStringEmptyOrNull(valueToExamine)) {
            return true; // Empty string is considered valid (optional input)
        }

        const parsedNumber = parseFloat(valueToExamine); // Using parseFloat for more general number parsing
        return !isNaN(parsedNumber);
    }
};

/**
 * Manages validation for an entire HTML form.
 * @class
 * @memberof App.Validation
 * @param {HTMLFormElement} formElementRef - The HTML form element.
 * @param {HTMLElement} [summaryElementRef] - The element to display validation summary messages.
 */
App.Validation.FormValidationManager = function(formElementRef, summaryElementRef) {
    if (!(formElementRef instanceof HTMLFormElement)) {
        console.error("FormValidationManager: Invalid form element provided.");
        return; // Early exit if formElementRef is not a valid form
    }

    /** @private {Array<string>} Stores validation error messages for the form. */
    this.validationMessages = [];
    /** @public {Array<App.Validation.FormFieldManager>} List of field managers associated with this form. */
    this.managedFields = [];
    /** @private {HTMLFormElement} Reference to the form DOM element. */
    this.targetForm = formElementRef;
    /** @private {HTMLElement} Reference to the validation summary DOM element. */
    this.summaryDisplayElement = summaryElementRef || null;
    /** @private {HTMLElement} Reference to the UL element within the summary, if present. */
    this.summaryListElement = null;

    /** @private {Function} Bound click event handler for the form. */
    this.clickListener = this.handleFormClick.bind(this);
    /** @private {Function} Bound submit event handler for the form. */
    this.submitListener = this.handleFormSubmission.bind(this);

    /** @private {HTMLButtonElement|HTMLInputElement|null} Tracks the last clicked submit button. */
    this.submitTriggeredBy = null;

    /** @public {boolean} Flag to indicate if the validation summary content should be replaced. */
    this.replaceSummaryContent = false;

    // Attach this manager instance to the form element for easy retrieval.
    this.targetForm[App.Validation.FormValidationManager.FORM_VALIDATION_TAG] = this;

    // Discover the unordered list within the summary element if it exists.
    if (this.summaryDisplayElement) {
        const ulChildren = this.summaryDisplayElement.getElementsByTagName('ul');
        if (ulChildren.length > 0) {
            this.summaryListElement = ulChildren[0];
        } else {
            // Optionally create a UL if none exists and summaryDisplayElement is present.
            this.summaryListElement = document.createElement('ul');
            this.summaryDisplayElement.appendChild(this.summaryListElement);
        }
    }
};

/** @static {string} CSS class for validation summary when errors are present. */
App.Validation.FormValidationManager.ERROR_CLASS_SUMMARY = 'validation-summary-errors';
/** @static {string} CSS class for validation summary when no errors are present. */
App.Validation.FormValidationManager.VALID_CLASS_SUMMARY = 'validation-summary-valid';
/** @static {string} Custom attribute name to store the form manager instance on the form element. */
App.Validation.FormValidationManager.FORM_VALIDATION_TAG = 'data-form-validator-instance';

/**
 * Initializes form validation for all configurations found in `window.clientFormConfigData`.
 * This is typically called on page load.
 * @static
 */
App.Validation.FormValidationManager.initializeAllForms = function() {
    const allFormConfigurations = window.clientFormConfigData;
    if (App.Validation.Utils.isArrayEmptyOrNull(allFormConfigurations)) {
        return; // No configurations to process
    }

    // Process configurations in reverse to allow `pop()` to be used if preferred
    for (let i = allFormConfigurations.length - 1; i >= 0; i--) {
        const currentFormConfig = allFormConfigurations[i];
        App.Validation.FormValidationManager.processFormConfiguration(currentFormConfig);
        allFormConfigurations.splice(i, 1); // Remove processed configuration
    }
};

/**
 * Retrieves the `FormValidationManager` instance associated with a given form element.
 * @static
 * @param {HTMLFormElement} formElement - The HTML form element.
 * @returns {App.Validation.FormValidationManager|undefined} The manager instance, or undefined if not found.
 */
App.Validation.FormValidationManager.getManagerForForm = function(formElement) {
    if (!formElement || !(formElement instanceof HTMLFormElement)) {
        console.warn("Attempted to retrieve manager for an invalid form element.");
        return undefined;
    }
    return formElement[App.Validation.FormValidationManager.FORM_VALIDATION_TAG];
};

/**
 * Finds all form elements within a given form that match a specific name.
 * Handles cases where multiple inputs share the same name (e.g., radio buttons, checkboxes).
 * @static
 * @param {HTMLFormElement} parentForm - The parent form element.
 * @param {string} inputName - The 'name' attribute of the elements to find.
 * @returns {Array<HTMLElement>} An array of matching DOM elements.
 */
App.Validation.FormValidationManager.getNamedFormElements = function(parentForm, inputName) {
    if (!parentForm || !inputName) {
        return [];
    }

    const matchingElements = [];
    const elementsByName = document.getElementsByName(inputName);

    for (let i = 0; i < elementsByName.length; i++) {
        const currentElement = elementsByName[i];
        // Ensure the element is actually within the specified form
        if (parentForm.contains(currentElement)) { // Modern equivalent of _isElementInHierarchy
            matchingElements.push(currentElement);
        }
    }
    return matchingElements;
};

/**
 * Parses a JSON form configuration object and initializes a `FormValidationManager`.
 * @static
 * @param {JsonFormConfiguration} configObject - The JSON configuration for the form.
 * @returns {App.Validation.FormValidationManager|null} The initialized form manager or null if form not found.
 */
App.Validation.FormValidationManager.processFormConfiguration = function(configObject) {
    if (!configObject || !configObject.FormId) {
        console.error("Invalid form configuration object received.");
        return null;
    }

    const formRef = document.getElementById(configObject.FormId);
    if (!formRef) {
        console.warn(`Form element with ID '${configObject.FormId}' not found. Skipping validation setup.`);
        return null;
    }

    const summaryRef = App.Validation.Utils.isStringEmptyOrNull(configObject.ValidationSummaryId) ?
                       null : document.getElementById(configObject.ValidationSummaryId);

    const activeFormManager = new App.Validation.FormValidationManager(formRef, summaryRef);
    activeFormManager.replaceSummaryContent = configObject.ReplaceValidationSummary;
    activeFormManager.activateEventHandlers();

    if (configObject.Fields && configObject.Fields.length > 0) {
        for (const fieldConfig of configObject.Fields) {
            const inputElements = App.Validation.FormValidationManager.getNamedFormElements(formRef, fieldConfig.FieldName);
            if (App.Validation.Utils.isArrayEmptyOrNull(inputElements)) {
                console.warn(`No input elements found for field name '${fieldConfig.FieldName}' in form '${configObject.FormId}'. Skipping field.`);
                continue;
            }

            const messageDisplayRef = App.Validation.Utils.isStringEmptyOrNull(fieldConfig.ValidationMessageId) ?
                                      null : document.getElementById(fieldConfig.ValidationMessageId);

            const fieldManager = new App.Validation.FormFieldManager(activeFormManager);
            fieldManager.inputElements.push(...inputElements); // Using spread for addRange
            fieldManager.messageDisplayElement = messageDisplayRef;
            fieldManager.replaceMessageContent = fieldConfig.ReplaceValidationMessageContents;

            if (fieldConfig.ValidationRules && fieldConfig.ValidationRules.length > 0) {
                for (const validationRule of fieldConfig.ValidationRules) {
                    const ruleProcessor = App.Validation.ValidatorRegistry.fetchValidatorProcessor(validationRule);
                    if (ruleProcessor) {
                        const validationCheck = {
                            errorMessageText: validationRule.ErrorMessage,
                            ruleProcessor: ruleProcessor,
                            ruleIdentifier: validationRule.RuleName || 'unknown' // Added new fragment
                        };
                        fieldManager.validationChecks.push(validationCheck);
                    } else {
                        console.warn(`No validator found for rule '${validationRule.RuleName}'. Skipping rule for field '${fieldConfig.FieldName}'.`);
                    }
                }
            }
            fieldManager.setupFieldMonitoring();
            activeFormManager.managedFields.push(fieldManager);
        }
    }

    // Integrate with any existing form submission callbacks (e.g., from other frameworks)
    formRef.validationCallbacks = formRef.validationCallbacks || [];
    formRef.validationCallbacks.push(() => {
        // Return true if no errors, false otherwise
        return App.Validation.Utils.isArrayEmptyOrNull(activeFormManager.performValidation('submit'));
    });

    return activeFormManager;
};

App.Validation.FormValidationManager.prototype = {
    /**
     * Adds a single error message to the form's validation summary.
     * @param {string} msg - The error message string.
     */
    addSingleMessage: function(msg) {
        if (!App.Validation.Utils.isStringEmptyOrNull(msg)) {
            this.addMultipleMessages([msg]);
        }
    },

    /**
     * Adds multiple error messages to the form's validation summary.
     * @param {Array<string>} messagesArray - An array of error message strings.
     */
    addMultipleMessages: function(messagesArray) {
        if (!App.Validation.Utils.isArrayEmptyOrNull(messagesArray)) {
            this.validationMessages.push(...messagesArray); // Using spread for addRange
            this.updateSummaryDisplay();
        }
    },

    /**
     * Clears all error messages from the form's validation summary.
     */
    resetMessages: function() {
        if (this.validationMessages) { // Ensure array exists before clearing
            this.validationMessages.length = 0; // Clear array efficiently
            this.updateSummaryDisplay();
        }
    },

    /**
     * Displays the error state in the validation summary element.
     * Populates the summary list with current error messages.
     */
    showErrorState: function() {
        if (!this.summaryDisplayElement) {
            return; // No summary element to display in
        }

        if (this.summaryListElement) {
            App.Validation.Utils.clearChildren(this.summaryListElement); // Remove existing children

            for (const msg of this.validationMessages) {
                const listItem = document.createElement('li');
                App.Validation.Utils.setElementText(listItem, msg);
                this.summaryListElement.appendChild(listItem);
            }
        }

        // Apply CSS classes
        this.summaryDisplayElement.classList.remove(App.Validation.FormValidationManager.VALID_CLASS_SUMMARY);
        this.summaryDisplayElement.classList.add(App.Validation.FormValidationManager.ERROR_CLASS_SUMMARY);
    },

    /**
     * Displays the valid state in the validation summary element (clears errors).
     */
    showValidState: function() {
        const summaryElem = this.summaryDisplayElement;
        if (summaryElem) {
            if (this.summaryListElement) {
                App.Validation.Utils.clearChildren(this.summaryListElement);
            }
            // Apply CSS classes
            summaryElem.classList.remove(App.Validation.FormValidationManager.ERROR_CLASS_SUMMARY);
            summaryElem.classList.add(App.Validation.FormValidationManager.VALID_CLASS_SUMMARY);
        }
    },

    /**
     * Attaches event handlers for dynamic validation (click, submit).
     */
    activateEventHandlers: function() {
        this.targetForm.addEventListener('click', this.clickListener);
        this.targetForm.addEventListener('submit', this.submitListener);
    },

    /**
     * Locates a submit button element from a DOM event target.
     * @private
     * @param {EventTarget} element - The event target.
     * @returns {HTMLElement|null} The submit button element or null.
     */
    locateSubmitTrigger: function(element) {
        if (!element || element.disabled) {
            return null;
        }

        const tagName = element.tagName.toUpperCase();
        if (tagName === 'INPUT' && (element.type === 'submit' || element.type === 'image')) {
            return element;
        } else if (tagName === 'BUTTON' && element.type === 'submit') {
            return element;
        }
        return null;
    },

    /**
     * Handles click events on the form to identify the clicked submit button.
     * @private
     * @param {Event} event - The DOM click event.
     */
    handleFormClick: function(event) {
        if (event.target) {
            this.submitTriggeredBy = this.locateSubmitTrigger(event.target);
        }
    },

    /**
     * Handles form submission events, performing validation before submission.
     * @private
     * @param {Event} event - The DOM submit event.
     */
    handleFormSubmission: function(event) {
        if (!this.targetForm) {
            console.error("FormSubmissionHandler: Target form is missing.");
            return;
        }

        // Check if the submit button explicitly disables validation
        if (this.submitTriggeredBy && this.submitTriggeredBy.disableValidation) {
            return;
        }

        const collectedErrors = this.performValidation('submit');
        if (!App.Validation.Utils.isArrayEmptyOrNull(collectedErrors)) {
            event.preventDefault(); // Prevent form submission if validation fails
        }
    },

    /**
     * Updates the display of the validation summary based on current error count.
     * @private
     */
    updateSummaryDisplay: function() {
        if (this.validationMessages.length === 0) {
            this.showValidState();
        } else {
            this.showErrorState();
        }
    },

    /**
     * Executes validation for all managed fields.
     * @param {string} triggerEvent - The event that triggered validation (e.g., 'submit', 'blur').
     * @returns {Array<string>} An array of accumulated error messages.
     */
    performValidation: function(triggerEvent) {
        const allFieldErrors = [];
        if (App.Validation.Utils.isArrayEmptyOrNull(this.managedFields)) {
            return allFieldErrors; // No fields to validate
        }

        for (const fieldManager of this.managedFields) {
            // Only validate if the field has elements and the first one is not disabled
            if (fieldManager.inputElements.length > 0 && !fieldManager.inputElements[0].disabled) {
                const fieldSpecificErrors = fieldManager.performFieldValidation(triggerEvent);
                if (!App.Validation.Utils.isArrayEmptyOrNull(fieldSpecificErrors)) {
                    allFieldErrors.push(...fieldSpecificErrors); // Collect errors
                }
            } else if (fieldManager.inputElements.length > 0 && fieldManager.inputElements[0].disabled) {
                console.debug(`Skipping validation for disabled field: ${fieldManager.inputElements[0].name || fieldManager.inputElements[0].id}`);
            }
        }

        // If configured, update the form's validation summary with collected errors
        if (this.replaceSummaryContent) {
            this.resetMessages();
            this.addMultipleMessages(allFieldErrors);
        }

        return allFieldErrors;
    }
};

/**
 * Manages validation for a single form field or a group of related input elements.
 * @class
 * @memberof App.Validation
 * @param {App.Validation.FormValidationManager} parentFormManager - The manager for the parent form.
 */
App.Validation.FormFieldManager = function(parentFormManager) {
    /** @private {Array<string>} Stores validation error messages specific to this field. */
    this.fieldErrors = [];
    /** @public {Array<HTMLElement>} List of DOM elements (inputs) associated with this field. */
    this.inputElements = [];
    /** @public {Array<ValidationCheck>} List of validation checks to perform for this field. */
    this.validationChecks = [];
    /** @public {App.Validation.FormValidationManager} Reference to the parent form manager. */
    this.parentFormManager = parentFormManager;

    /** @public {string|null} A default error message for the field. */
    this.defaultErrorMessage = null;
    /** @public {boolean} Flag to indicate if the validation message element content should be replaced. */
    this.replaceMessageContent = false;
    /** @public {HTMLElement|null} The DOM element where field-specific validation messages are displayed. */
    this.messageDisplayElement = null;

    /** @private {Function} Bound blur event handler. */
    this.onBlurListener = this.onInputBlur.bind(this);
    /** @private {Function} Bound change event handler. */
    this.onChangeListener = this.onInputChange.bind(this);
    /** @private {Function} Bound input event handler. */
    this.onInputListener = this.onInputEvent.bind(this);
    /** @private {Function} Bound propertychange event handler (for older IE). */
    this.onPropertyChangeListener = this.onPropertyUpdate.bind(this);
};

/** @static {string} Custom attribute name to mark if an input's value has changed. */
App.Validation.FormFieldManager.DATA_MODIFIED_FLAG = 'data-value-changed';
/** @static {string} Custom attribute name to mark if validation has been run on an input. */
App.Validation.FormFieldManager.DATA_VALIDATION_PERFORMED_FLAG = 'data-validation-run';
/** @static {string} CSS class for input elements when they have errors. */
App.Validation.FormFieldManager.INPUT_ERROR_CLASS = 'input-validation-error';
/** @static {string} CSS class for input elements when they are valid. */
App.Validation.FormFieldManager.INPUT_VALID_CLASS = 'input-validation-valid';
/** @static {string} CSS class for field message elements when they have errors. */
App.Validation.FormFieldManager.MESSAGE_ERROR_CLASS = 'field-validation-error';
/** @static {string} CSS class for field message elements when they are valid. */
App.Validation.FormFieldManager.MESSAGE_VALID_CLASS = 'field-validation-valid';

App.Validation.FormFieldManager.prototype = {
    /**
     * Adds a single error message specific to this field.
     * @param {string} msg - The error message string.
     */
    addFieldError: function(msg) {
        if (!App.Validation.Utils.isStringEmptyOrNull(msg)) {
            this.addMultipleFieldErrors([msg]);
        }
    },

    /**
     * Adds multiple error messages specific to this field.
     * @param {Array<string>} messagesArray - An array of error message strings.
     */
    addMultipleFieldErrors: function(messagesArray) {
        if (!App.Validation.Utils.isArrayEmptyOrNull(messagesArray)) {
            this.fieldErrors.push(...messagesArray);
            this.updateFieldDisplay();
        }
    },

    /**
     * Clears all error messages for this field.
     */
    clearFieldErrors: function() {
        if (this.fieldErrors) { // Ensure array exists
            this.fieldErrors.length = 0;
            this.updateFieldDisplay();
        }
    },

    /**
     * Renders the error state for the field: updates message element and input elements.
     * Displays the first error message if `replaceMessageContent` is true.
     */
    renderErrorState: function() {
        const msgElem = this.messageDisplayElement;
        if (msgElem) {
            if (this.replaceMessageContent && this.fieldErrors.length > 0) {
                App.Validation.Utils.setElementText(msgElem, this.fieldErrors[0]);
            }
            msgElem.classList.remove(App.Validation.FormFieldManager.MESSAGE_VALID_CLASS);
            msgElem.classList.add(App.Validation.FormFieldManager.MESSAGE_ERROR_CLASS);
        }

        for (const inputElem of this.inputElements) {
            inputElem.classList.remove(App.Validation.FormFieldManager.INPUT_VALID_CLASS);
            inputElem.classList.add(App.Validation.FormFieldManager.INPUT_ERROR_CLASS);
        }
    },

    /**
     * Renders the valid state for the field: clears message element and updates input elements.
     */
    renderValidState: function() {
        const msgElem = this.messageDisplayElement;
        if (msgElem) {
            if (this.replaceMessageContent) {
                App.Validation.Utils.setElementText(msgElem, '');
            }
            msgElem.classList.remove(App.Validation.FormFieldManager.MESSAGE_ERROR_CLASS);
            msgElem.classList.add(App.Validation.FormFieldManager.MESSAGE_VALID_CLASS);
        }

        for (const inputElem of this.inputElements) {
            inputElem.classList.remove(App.Validation.FormFieldManager.INPUT_ERROR_CLASS);
            inputElem.classList.add(App.Validation.FormFieldManager.INPUT_VALID_CLASS);
        }
    },

    /**
     * Handles the 'blur' event for an input element.
     * @private
     * @param {Event} event - The DOM blur event.
     */
    onInputBlur: function(event) {
        const target = event.target;
        if (target && (target[App.Validation.FormFieldManager.DATA_MODIFIED_FLAG] || target[App.Validation.FormFieldManager.DATA_VALIDATION_PERFORMED_FLAG])) {
            this.performFieldValidation('blur');
        }
    },

    /**
     * Handles the 'change' event for an input element.
     * @private
     * @param {Event} event - The DOM change event.
     */
    onInputChange: function(event) {
        if (event.target) {
            event.target[App.Validation.FormFieldManager.DATA_MODIFIED_FLAG] = true;
        }
    },

    /**
     * Handles the 'input' event for an input element.
     * @private
     * @param {Event} event - The DOM input event.
     */
    onInputEvent: function(event) {
        const target = event.target;
        if (target) {
            target[App.Validation.FormFieldManager.DATA_MODIFIED_FLAG] = true;
            if (target[App.Validation.FormFieldManager.DATA_VALIDATION_PERFORMED_FLAG]) {
                this.performFieldValidation('input');
            }
        }
    },

    /**
     * Handles the 'propertychange' event for an input element (IE specific).
     * @private
     * @param {Event} event - The DOM propertychange event.
     */
    onPropertyUpdate: function(event) {
        // rawEvent might be specific to Sys.UI.DomEvent, adapt for native event
        const propertyName = event.propertyName || (event.rawEvent && event.rawEvent.propertyName);
        const target = event.target;

        if (target && propertyName === 'value') {
            target[App.Validation.FormFieldManager.DATA_MODIFIED_FLAG] = true;
            if (target[App.Validation.FormFieldManager.DATA_VALIDATION_PERFORMED_FLAG]) {
                this.performFieldValidation('input');
            }
        }
    },

    /**
     * Sets up event listeners for all input elements managed by this field manager.
     */
    setupFieldMonitoring: function() {
        for (const element of this.inputElements) {
            if (!element) {
                console.warn("Attempted to set up monitoring for a null/undefined element.");
                continue;
            }

            // Modern browsers use 'input' event for real-time changes
            // For older IE (documentMode < 9), 'propertychange' on 'value' is needed
            const compatMode = document.documentMode;
            const supportsPropertyChange = compatMode && compatMode < 9; // Simplified check

            if (supportsPropertyChange && element.attachEvent) { // Check for attachEvent for older IE
                 // Using attachEvent for propertychange on older IE
                element.attachEvent('onpropertychange', this.onPropertyChangeListener);
            } else {
                element.addEventListener('input', this.onInputListener);
            }
            element.addEventListener('change', this.onChangeListener);
            element.addEventListener('blur', this.onBlurListener);
        }
    },

    /**
     * Updates the field's display (message element and input styles) based on current error count.
     * @private
     */
    updateFieldDisplay: function() {
        if (this.fieldErrors.length === 0) {
            this.renderValidState();
        } else {
            this.renderErrorState();
        }
    },

    /**
     * Performs all validation checks for the field.
     * @param {string} triggerEvent - The event that triggered validation.
     * @returns {Array<string>} An array of error messages for this field.
     */
    performFieldValidation: function(triggerEvent) {
        this.clearFieldErrors(); // Clear previous errors before re-validating

        if (App.Validation.Utils.isArrayEmptyOrNull(this.inputElements)) {
            return []; // No elements to validate
        }

        const valueToValidate = this.inputElements[0].value; // Typically validate the first element's value

        for (const validationCheck of this.validationChecks) {
            const validationResult = validationCheck.ruleProcessor(valueToValidate, App.Validation.createValidationContext());

            if (typeof validationResult === 'string') {
                // Validator returned an error message directly
                this.addFieldError(validationResult);
            } else if (validationResult === false) {
                // Validator returned false, use configured error message
                this.addFieldError(validationCheck.errorMessageText);
            }
            // If true, no error, continue
        }

        // Mark all elements as having had validation performed
        for (const element of this.inputElements) {
            element[App.Validation.FormFieldManager.DATA_VALIDATION_PERFORMED_FLAG] = true;
        }

        return this.fieldErrors;
    },

    /**
     * Formats an error message string based on the validator's return value.
     * This function is not directly used in the current Type III clone,
     * as validators now return boolean or string directly.
     * It's kept as a placeholder to reflect the original structure.
     * @private
     * @param {boolean|string} validatorReturnValue - The return value from a validator.
     * @param {string} fieldErrorMessage - The default error message for the field.
     * @returns {string} The formatted error string.
     */
    formatErrorMessage: function(validatorReturnValue, fieldErrorMessage) {
        // This method is largely superseded by direct string/boolean returns from validators
        // but here's how it would operate:
        if (typeof validatorReturnValue === 'string') {
            return validatorReturnValue; // Validator provided a specific message
        }
        return fieldErrorMessage; // Use the default field message
    }
};

/**
 * Registry for validation rule processors.
 * @namespace App.Validation.ValidatorRegistry
 */
App.Validation.ValidatorRegistry = {
    _registeredProcessors: {},

    /**
     * Registers a validator function for a specific rule name.
     * @param {string} ruleName - The name of the validation rule (e.g., 'required', 'number').
     * @param {function(JsonValidationRule): function} processorFactory - A function that returns a validator function.
     */
    register: function(ruleName, processorFactory) {
        this._registeredProcessors[ruleName] = processorFactory;
    },

    /**
     * Retrieves the appropriate validator function for a given validation rule configuration.
     * @param {JsonValidationRule} ruleConfig - The JSON configuration object for the validation rule.
     * @returns {function(string, App.Validation.createValidationContext): boolean|string|null} The validator function, or null if not found.
     */
    fetchValidatorProcessor: function(ruleConfig) {
        if (!ruleConfig || !ruleConfig.RuleName) {
            console.error("Invalid rule configuration provided to ValidatorRegistry.");
            return null;
        }
        const factory = this._registeredProcessors[ruleConfig.RuleName];
        if (factory && typeof factory === 'function') {
            return factory(ruleConfig);
        }
        return null; // Validator not found
    }
};

// Register default validators
App.Validation.ValidatorRegistry.register('Number', App.Validation.NumberInputValidator.buildValidator);

// Auto-initialize validation on page load
document.addEventListener('DOMContentLoaded', App.Validation.FormValidationManager.initializeAllForms);