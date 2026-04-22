/*
 * LiveValidation version 1.4 for prototype.js library.
 * This file is part of the LiveValidation project.
 * (c) 2007-2010 Alec Hill (http://www.livevalidation.com)
 * Licensed under the MIT License.
 */

var LiveValidation = Class.create(); // Initialize the core LiveValidation class.

/* *******************************************************************
 *                  LiveValidation Class Definition
 * *******************************************************************/

// Static properties and methods for LiveValidation.
Object.extend(LiveValidation, {

    VERSION: '1.4 prototype', // Library version string.

    /* Element type constants for internal use */
    TEXTAREA: 1,
    TEXT: 2,
    PASSWORD: 3,
    CHECKBOX: 4,
    SELECT: 5,
    FILE: 6,

    /**
     * Mass validation function: Validates an array of LiveValidation objects.
     *
     * @param {Array} validations - An array of LiveValidation instances to process.
     * @returns {Boolean} - True if all validations pass, false if any validation fails.
     */
    massValidate: function(validations) {
        var ret = true; // Assume success initially.
        for (var i = 0, len = validations.length; i < len; ++i) {
            var valid = validations[i].validate(); // Perform validation for current object.
            if (ret) {
                ret = valid; // If previous were valid, update with current result.
            }
        }
        return ret; // Return overall validation status.
    }

});

/* *******************************************************************
 *                 LiveValidation Prototype Definition
 * *******************************************************************/

LiveValidation.prototype = {

    validClass: 'LV_valid', // CSS class for valid state message.
    invalidClass: 'LV_invalid', // CSS class for invalid state message.
    messageClass: 'LV_validation_message', // Base CSS class for validation messages.
    validFieldClass: 'LV_valid_field', // CSS class for valid field state.
    invalidFieldClass: 'LV_invalid_field', // CSS class for invalid field state.

    /**
     * LiveValidation constructor. Attaches real-time validation to a form field.
     *
     * @param {mixed} element - DOM element reference or ID string of the element to validate.
     * @param {Object} optionsObj - Configuration options for the LiveValidation instance.
     *
     * OptionsObj properties include:
     *   - validMessage {String}: Message to show on successful validation (default: "Thankyou!").
     *   - beforeValidation {Function}: Callback before validation (default: empty function).
     *   - beforeValid {Function}: Callback before onValid (default: empty function).
     *   - onValid {Function}: Callback on valid state (default: inserts message, adds field class).
     *   - afterValid {Function}: Callback after onValid (default: empty function).
     *   - beforeInvalid {Function}: Callback before onInvalid (default: empty function).
     *   - onInvalid {Function}: Callback on invalid state (default: inserts message, adds field class).
     *   - afterInvalid {Function}: Callback after onInvalid (default: empty function).
     *   - afterValidation {Function}: Callback after validation (default: empty function).
     *   - insertAfterWhatNode {mixed}: Node to insert message after (default: the validated element).
     *   - onlyOnBlur {Boolean}: Validate only on blur, not on keyup (default: false).
     *   - wait {Integer}: Delay in ms after keystroke before validation (default: 0).
     *   - onlyOnSubmit {Boolean}: Validate only when the form is submitted (default: false).
     */
    initialize: function(element, optionsObj) {
        // Ensure an element is provided, throw error if not.
        if (!element) throw new Error("LiveValidation::initialize - No element reference or element id has been provided!");
        this.element = $(element); // Convert element argument to a Prototype extended element.
        // Check if the element actually exists in the DOM.
        if (!this.element) throw new Error("LiveValidation::initialize - No element with reference or id of '" + element + "' exists!");

        // Set up essential properties.
        this.elementType = this.getElementType(); // Determine the type of the HTML element.
        this.validations = []; // Array to store validation rules.
        this.form = this.element.form; // Reference to the parent form, if any.

        // Merge default options with provided options.
        this.options = Object.extend({
            validMessage: 'Thankyou!', // Default success message.
            insertAfterWhatNode: this.element, // Default message insertion point.
            onlyOnBlur: false, // Default to validate on keyup and blur.
            wait: 0, // Default no delay.
            onlyOnSubmit: false, // Default to validate in real-time.
            // Hook functions (callbacks).
            beforeValidation: function() {},
            beforeValid: function() {},
            onValid: function() {
                this.insertMessage(this.createMessageSpan());
                this.addFieldClass();
            },
            afterValid: function() {},
            beforeInvalid: function() {},
            onInvalid: function() {
                this.insertMessage(this.createMessageSpan());
                this.addFieldClass();
            },
            afterInvalid: function() {},
            afterValidation: function() {},
        }, optionsObj || {}); // Apply user-defined options, if any.

        // Resolve insertAfterWhatNode to a Prototype extended element.
        var node = this.options.insertAfterWhatNode || this.element;
        this.options.insertAfterWhatNode = $(node);

        // Copy options directly to the instance for easier access.
        Object.extend(this, this.options);

        // Register with the LiveValidationForm if a form exists.
        if (this.form) {
            this.formObj = LiveValidationForm.getInstance(this.form);
            this.formObj.addField(this);
        }

        // Set up event listeners for real-time validation.
        // Cached callbacks to allow easy removal later.
        this.cFocus = this.doOnFocus.bindAsEventListener(this);
        Event.observe(this.element, 'focus', this.cFocus);

        if (!this.onlyOnSubmit) {
            switch (this.elementType) {
                case LiveValidation.CHECKBOX:
                    this.cClick = this.validate.bindAsEventListener(this);
                    Event.observe(this.element, 'click', this.cClick);
                    // Fall through to add a change event as well for checkboxes.
                case LiveValidation.SELECT:
                case LiveValidation.FILE:
                    this.cChange = this.validate.bindAsEventListener(this);
                    Event.observe(this.element, 'change', this.cChange);
                    break;
                default: // For text, password, textarea inputs.
                    if (!this.onlyOnBlur) {
                        this.cKeyup = this.deferValidation.bindAsEventListener(this);
                        Event.observe(this.element, 'keyup', this.cKeyup);
                    }
                    this.cBlur = this.validate.bindAsEventListener(this);
                    Event.observe(this.element, 'blur', this.cBlur);
            }
        }
    },

    /**
     * Destroys the LiveValidation instance, removing event listeners and
     * deregistering from any associated LiveValidationForm.
     */
    destroy: function() {
        if (this.formObj) {
            // Remove this field from its associated LiveValidationForm.
            this.formObj.removeField(this);
            // Destroy the LiveValidationForm instance if no fields remain.
            this.formObj.destroy();
        }

        // Remove all attached event observers from the element.
        var el = this.element;
        Event.stopObserving(el, 'focus', this.cFocus);
        if (!this.onlyOnSubmit) {
            switch (this.elementType) {
                case LiveValidation.CHECKBOX:
                    Event.stopObserving(el, 'click', this.cClick);
                case LiveValidation.SELECT:
                case LiveValidation.FILE:
                    Event.stopObserving(el, 'change', this.cChange);
                    break;
                default:
                    if (!this.onlyOnBlur) Event.stopObserving(el, 'keyup', this.cKeyup);
                    Event.stopObserving(el, 'blur', this.cBlur);
            }
        }

        this.validations = []; // Clear all validation rules.
        this.removeMessageAndFieldClass(); // Clean up any displayed messages/classes.
    },

    /**
     * Adds a validation rule to the LiveValidation object.
     *
     * @param {Function} validationFunction - The validation function (e.g., Validate.Presence).
     * @param {Object} validationParamsObj - Parameters specific to the validation function.
     * @returns {Object} - The LiveValidation instance for method chaining.
     */
    add: function(validationFunction, validationParamsObj) {
        this.validations.push({
            type: validationFunction,
            params: validationParamsObj || {}
        });
        return this; // Enable chaining.
    },

    /**
     * Removes a specific validation rule from the LiveValidation object.
     * Arguments must exactly match those used when 'add' was called.
     *
     * @param {Function} validationFunction - The validation function to remove.
     * @param {Object} validationParamsObj - Parameters of the validation function to remove.
     * @returns {Object} - The LiveValidation instance for method chaining.
     */
    remove: function(validationFunction, validationParamsObj) {
        this.validations = this.validations.reject(function(v) {
            return (v.type == validationFunction && v.params == validationParamsObj);
        });
        return this; // Enable chaining.
    },

    /**
     * Defers validation by a specified 'wait' time after the last keystroke.
     * Used for 'keyup' events to avoid validating on every single key press.
     *
     * @param {Event} e - The event object (not directly used but passed by event listener).
     */
    deferValidation: function(e) {
        // Remove previous message/class if wait time is significant to avoid stale feedback.
        if (this.wait >= 300) this.removeMessageAndFieldClass();
        if (this.timeout) clearTimeout(this.timeout); // Clear any existing timeout.
        // Set a new timeout to call validate() after 'this.wait' milliseconds.
        this.timeout = setTimeout(this.validate.bind(this), this.wait);
    },

    /**
     * Event handler for 'blur' event. Sets focused flag to false and triggers validation.
     */
    doOnBlur: function() {
        this.focused = false; // Mark element as not focused.
        this.validate(); // Perform validation.
    },

    /**
     * Event handler for 'focus' event. Sets focused flag to true and clears previous messages/classes.
     */
    doOnFocus: function() {
        this.focused = true; // Mark element as focused.
        this.removeMessageAndFieldClass(); // Clear feedback from previous validation.
    },

    /**
     * Determines the type of the HTML element being validated.
     *
     * @returns {Number} - One of the LiveValidation.TEXTAREA, LiveValidation.TEXT, etc., constants.
     * @throws {Error} - If the element type is not supported.
     */
    getElementType: function() {
        var nn = this.element.nodeName.toUpperCase(); // Node name (e.g., 'INPUT', 'TEXTAREA').
        var nt = this.element.type.toUpperCase(); // Input type (e.g., 'TEXT', 'PASSWORD').

        // Use switch(true) for cleaner conditional checks.
        switch (true) {
            case (nn == 'TEXTAREA'):
                return LiveValidation.TEXTAREA;
            case (nn == 'INPUT' && nt == 'TEXT'):
                return LiveValidation.TEXT;
            case (nn == 'INPUT' && nt == 'PASSWORD'):
                return LiveValidation.PASSWORD;
            case (nn == 'INPUT' && nt == 'CHECKBOX'):
                return LiveValidation.CHECKBOX;
            case (nn == 'INPUT' && nt == 'FILE'):
                return LiveValidation.FILE;
            case (nn == 'SELECT'):
                return LiveValidation.SELECT;
            case (nn == 'INPUT'):
                // Handle unsupported input types.
                throw new Error('LiveValidation::getElementType - Cannot use LiveValidation on an ' + nt.toLowerCase() + ' input!');
            default:
                // Handle entirely unsupported element types.
                throw new Error('LiveValidation::getElementType - Element must be an input, select, or textarea - ' + nn.toLowerCase() + ' was given!');
        }
    },

    /**
     * Executes all validation rules added to this LiveValidation object.
     * Stops on the first failure.
     *
     * @returns {Boolean} - True if all validations pass, false otherwise.
     */
    doValidations: function() {
        this.validationFailed = false; // Reset failure flag.
        for (var i = 0, len = this.validations.length; i < len; ++i) {
            // Perform individual validation and update failure status.
            this.validationFailed = !this.validateElement(this.validations[i].type, this.validations[i].params);
            if (this.validationFailed) return false; // Exit early on first failure.
        }
        this.message = this.validMessage; // Set success message if all passed.
        return true; // All validations passed.
    },

    /**
     * Performs a single validation check on the element's value.
     * Catches and processes Validate.Error exceptions.
     *
     * @param {Function} validationFunction - The validation function to apply.
     * @param {Object} validationParamsObj - Parameters for the validation function.
     * @returns {Boolean} - True if validation passed, false if it failed or threw a Validate.Error.
     */
    validateElement: function(validationFunction, validationParamsObj) {
        // Determine if message should be displayed even when field is empty.
        this.displayMessageWhenEmpty = false; // Reset flag.
        switch (validationFunction) {
            case Validate.Presence:
            case Validate.Confirmation:
            case Validate.Acceptance:
                this.displayMessageWhenEmpty = true;
                break;
            case Validate.Custom:
                if (validationParamsObj.displayMessageWhenEmpty) this.displayMessageWhenEmpty = true;
                break;
        }

        // Get element value, handling SELECT and CHECKBOX types specially.
        var value = (this.elementType == LiveValidation.SELECT) ?
            this.element.options[this.element.selectedIndex].value :
            this.element.value;

        // Special handling for Validate.Acceptance (requires checkbox).
        if (validationFunction == Validate.Acceptance) {
            if (this.elementType != LiveValidation.CHECKBOX) {
                throw new Error('LiveValidation::validateElement - Element to validate acceptance must be a checkbox!');
            }
            value = this.element.checked; // For acceptance, value is checkbox's checked state.
        }

        var isValid = true; // Assume valid initially.
        try {
            validationFunction(value, validationParamsObj); // Execute the validation function.
        } catch (error) {
            if (error instanceof Validate.Error) {
                // If it's a validation error and we should display a message.
                if (value !== '' || (value === '' && this.displayMessageWhenEmpty)) {
                    this.validationFailed = true;
                    // Extract the message, ignoring potential stack trace in Opera 10.
                    this.message = error.message.split('\n')[0];
                    isValid = false; // Mark as invalid.
                }
            } else {
                throw error; // Re-throw other types of errors.
            }
        } finally {
            return isValid; // Return validation status.
        }
    },

    /**
     * Initiates the validation process for the element.
     * Executes all validation rules and triggers appropriate callbacks.
     *
     * @returns {Boolean} - True if all validations pass, false otherwise.
     */
    validate: function() {
        if (!this.element.disabled) { // Only validate if the element is not disabled.
            this.beforeValidation(); // Call beforeValidation hook.
            var isValid = this.doValidations(); // Perform all validations.
            if (isValid) {
                this.beforeValid(); // Call beforeValid hook.
                this.onValid(); // Call onValid hook.
                this.afterValid(); // Call afterValid hook.
                return true; // Validation successful.
            } else {
                this.beforeInvalid(); // Call beforeInvalid hook.
                this.onInvalid(); // Call onInvalid hook.
                this.afterInvalid(); // Call afterInvalid hook.
                return false; // Validation failed.
            }
            this.afterValidation(); // Call afterValidation hook regardless of success/failure.
        } else {
            return true; // Disabled elements are considered valid.
        }
    },

    /**
     * Enables the validation field.
     *
     * @returns {LiveValidation} - The LiveValidation instance for chaining.
     */
    enable: function() {
        this.element.disabled = false; // Enable the HTML element.
        return this;
    },

    /**
     * Disables the validation field and removes any associated messages or styles.
     *
     * @returns {LiveValidation} - The LiveValidation instance for chaining.
     */
    disable: function() {
        this.element.disabled = true; // Disable the HTML element.
        this.removeMessageAndFieldClass(); // Clean up visual feedback.
        return this;
    },

    /* *******************************************************************
     *                  Message Insertion Helper Methods
     * These methods are primarily used within the default onValid and onInvalid
     * callbacks. If custom callbacks are used, these might need to be called
     * explicitly or reimplemented.
     * *******************************************************************/

    /**
     * Creates a span element containing the validation message.
     *
     * @returns {HTMLSpanElement} - A new span element with the message text.
     */
    createMessageSpan: function() {
        var span = document.createElement('span'); // Create a new span element.
        var textNode = document.createTextNode(this.message); // Create a text node with the message.
        span.appendChild(textNode); // Add the text node to the span.
        return span;
    },

    /**
     * Inserts the provided element (typically a message span) into the DOM,
     * replacing any existing message.
     *
     * @param {HTMLElement} elementToInsert - The HTML element to insert.
     */
    insertMessage: function(elementToInsert) {
        this.removeMessage(); // First, remove any previously displayed message.
        // Do not insert a message if validation passed and validMessage is empty/false.
        if (!this.validationFailed && !this.validMessage) return;

        // Insert message only if field is not empty OR if message should display when empty (e.g., Presence).
        if ((this.displayMessageWhenEmpty && (this.elementType == LiveValidation.CHECKBOX || this.element.value == '')) || this.element.value != '') {
            var className = this.validationFailed ? this.invalidClass : this.validClass; // Determine CSS class based on validation status.
            $(elementToInsert).addClassName(this.messageClass + ' ' + className); // Apply message classes.

            var parent = this.insertAfterWhatNode.up(); // Get the parent of the insertion point.
            if (nxtSibling = this.insertAfterWhatNode.next()) { // Check if there's a next sibling.
                parent.insertBefore(elementToInsert, nxtSibling); // Insert before the next sibling.
            } else {
                parent.appendChild(elementToInsert); // Append to the parent if no next sibling.
            }
        }
    },

    /**
     * Applies a CSS class to the validated field based on its current validation status.
     */
    addFieldClass: function() {
        this.removeFieldClass(); // Remove any existing field classes first.
        if (!this.validationFailed) {
            // If valid, apply valid field class, but only if not empty or displayMessageWhenEmpty is true.
            if (this.displayMessageWhenEmpty || this.element.value != '') {
                if (!this.element.hasClassName(this.validFieldClass)) this.element.addClassName(this.validFieldClass);
            }
        } else {
            // If invalid, apply invalid field class.
            if (!this.element.hasClassName(this.invalidFieldClass)) this.element.addClassName(this.invalidFieldClass);
        }
    },

    /**
     * Removes the validation message element from the DOM, if it exists.
     */
    removeMessage: function() {
        // Find the next sibling that has the messageClass.
        var nxtEl = this.insertAfterWhatNode.next('.' + this.messageClass);
        if (nxtEl) nxtEl.remove(); // If found, remove it.
    },

    /**
     * Removes the validation status CSS classes (valid/invalid) from the field.
     */
    removeFieldClass: function() {
        this.element.removeClassName(this.invalidFieldClass); // Remove invalid class.
        this.element.removeClassName(this.validFieldClass); // Remove valid class.
    },

    /**
     * A utility method to remove both the validation message and field classes.
     * Ensures a clean state for the field.
     */
    removeMessageAndFieldClass: function() {
        this.removeMessage(); // Clear the message.
        this.removeFieldClass(); // Clear the field class.
    }

}; // End of LiveValidation.prototype object.


/* *******************************************************************
 *                 LiveValidationForm Class Definition
 * *******************************************************************
 * This class manages a form that contains LiveValidation fields.
 * It's primarily for internal use, handling form submission validation.
 * Developers might interact with it via a LiveValidation object's 'formObj' property.
 * *******************************************************************/

var LiveValidationForm = Class.create(); // Create the LiveValidationForm class.

/* Static members and methods for LiveValidationForm */
Object.extend(LiveValidationForm, {

    /**
     * Internal namespace to store instances of LiveValidationForm,
     * indexed by form ID.
     */
    instances: {},

    /**
     * Retrieves an existing LiveValidationForm instance for a given form element,
     * or creates a new one if it doesn't already exist.
     *
     * @param {mixed} element - DOM element reference or ID of the form.
     * @returns {LiveValidationForm} - The LiveValidationForm instance.
     * @throws {Error} - If no element is provided.
     */
    getInstance: function(element) {
        if (!element) throw new Error("LiveValidationForm::getInstance - No element reference or element id has been provided!");
        var el = $(element); // Ensure it's a Prototype extended element.
        var rand = Math.random() * Math.random(); // Generate a random number for ID if needed.

        // Assign a unique ID if the form doesn't have one.
        if (!el.id) el.id = 'formId_' + rand.toString().replace(/\./, '') + new Date().valueOf();

        // Create a new instance if one doesn't exist for this ID.
        if (!LiveValidationForm.instances[el.id]) {
            LiveValidationForm.instances[el.id] = new LiveValidationForm(el);
        }
        return LiveValidationForm.instances[el.id]; // Return the instance.
    }

});

/* *******************************************************************
 *             LiveValidationForm Prototype Definition
 * *******************************************************************/

LiveValidationForm.prototype = {

    // Callback hooks for form-level validation events.
    beforeValidation: function() {},
    onValid: function() {},
    onInvalid: function() {},
    afterValidation: function() {},

    /**
     * Constructor for LiveValidationForm.
     * Attaches form-level validation logic, particularly for submission.
     *
     * @param {HTMLFormElement} element - The DOM form element to manage.
     */
    initialize: function(element) {
        this.element = $(element); // Store the form element.
        this.fields = []; // Array to hold LiveValidation field objects associated with this form.

        // Capture the form's original onsubmit handler.
        // This is done directly rather than via Event.observe to ensure LiveValidation's handler
        // runs before any inline onsubmit handlers (e.g., from Rails helpers).
        this.oldOnSubmit = this.element.onsubmit || function() {};
        this.element.onsubmit = function(e) {