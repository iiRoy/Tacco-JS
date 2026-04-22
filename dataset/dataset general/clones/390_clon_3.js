// DataEntryValidator 2.0 (Prototype.js-enhanced edition)
// Copyright (c) 2023-2024 Your Name/Company (www.yourdomain.com)
// DataEntryValidator is licensed under the terms of the Apache 2.0 License

var FormElementValidator = Class.create();

/*********************************************** FormElementValidator Class Definition ***********************************/

/*** Static Utilities and Constants ***/

Object.extend(FormElementValidator, {

  CURRENT_REV: '2.0-alpha.1', // Updated version string

  /*** Field Types Enumeration ***/
  FIELD_TYPE_TEXTAREA:   10,
  FIELD_TYPE_TEXT_INPUT: 11,
  FIELD_TYPE_PASSWORD:   12,
  FIELD_TYPE_CHECKBOX:   13,
  FIELD_TYPE_SELECT:     14,
  FIELD_TYPE_FILE:       15,
  FIELD_TYPE_RADIO:      16, // Added new field type

  /**
   *	Processes an array of FormElementValidator instances, triggering validation for each.
   *
   *	@param {Array<FormElementValidator>} validatorInstances - An array of validator objects.
   *	@returns {boolean} - True if all validators pass, false otherwise.
   */
  batchValidateElements: function(validatorInstances) {
    if (!validatorInstances || !Array.isArray(validatorInstances) || validatorInstances.length === 0) {
      // Added guard clause for empty or invalid input
      console.warn("FormElementValidator::batchValidateElements - No validator instances provided or array is empty.");
      return true; // Or throw an error, depending on desired behavior
    }

    let allChecksPass = true; // Use 'let' for block scope
    // Using forEach for a slightly different loop structure
    validatorInstances.forEach(function(currentValidator) {
      if (currentValidator instanceof FormElementValidator) { // Added type check
        const isValid = currentValidator.performValidation(); // Renamed method
        if (!isValid) {
          allChecksPass = false; // If any fails, the whole batch fails
        }
      } else {
        console.warn("FormElementValidator::batchValidateElements - Non-validator object found in array:", currentValidator);
      }
    });
    return allChecksPass;
  }

});

/*** Instance Methods and Properties ***/

FormElementValidator.prototype = {

  successCssClass: 'dv_success',
  failureCssClass: 'dv_failure',
  feedbackMsgClass: 'dv_feedback_message',
  successFieldCss: 'dv_field_success',
  failureFieldCss: 'dv_field_failure',
  // Added a new property for custom error messages
  customErrorMsgPrefix: 'Validation Error: ',

  /**
   *	Constructor for FormElementValidator. Sets up real-time validation for a form field.
   *
   *	@param {mixed} targetElementRef - DOM element reference or string ID of the field to validate.
   *	@param {object} configOptions - Configuration object for this validator instance.
   *
   *	ConfigOptions properties:
   *		- passMsg {String}          - Message shown on successful validation (empty string/false to suppress). (DEFAULT: "Input is valid!")
   *		- preValidationHook {Function} - Callback before validation logic. (DEFAULT: function(){})
   *		- onValidationSuccess {Function} - Callback when field passes. (DEFAULT: function(){ this.displayFeedbackMessage(this.generateFeedbackSpan()); this.applyFieldStyling(); })
   *		- postValidationSuccess {Function} - Callback after onValidationSuccess. (DEFAULT: function(){})
   *		- preValidationFailure {Function} - Callback before onValidationFailure. (DEFAULT: function(){})
   *		- onValidationFailure {Function} - Callback when field fails. (DEFAULT: function(){ this.displayFeedbackMessage(this.generateFeedbackSpan()); this.applyFieldStyling(); })
   *		- postValidationFailure {Function} - Callback after onValidationFailure. (DEFAULT: function(){})
   *		- postValidationHook {Function} - Callback after validation, regardless of result. (DEFAULT: function(){})
   *		- msgInsertionPoint {mixed} - Reference or ID of node to insert feedback message after. (DEFAULT: the validated field itself)
   *		- validateOnBlurOnly {boolean} - If true, validation only triggers on blur. (DEFAULT: false)
   *		- debounceDelay {Number} - Milliseconds to wait after last keystroke before validating. (DEFAULT: 0)
   *		- validateOnFormSubmitOnly {boolean} - If true, validation only occurs on form submission. (DEFAULT: false)
   */
  initialize: function(targetElementRef, configOptions) {
    if (!targetElementRef) {
      throw new Error("FormElementValidator::initialize - No target element reference or ID supplied!");
    }
    this.targetElement = $(targetElementRef); // Use Prototype's $() for element retrieval
    if (!this.targetElement) {
      throw new Error("FormElementValidator::initialize - Element with reference or ID '" + targetElementRef + "' not found!");
    }

    // Assign fundamental properties
    this.fieldType = this.determineElementType(); // Renamed method
    this.validationRoutines = []; // Renamed property
    this.parentForm = this.targetElement.form; // Renamed property

    // Merge default options with provided configurations
    const defaultOptions = { // Use const for default options
      passMsg: 'Input is valid!',
      msgInsertionPoint: this.targetElement,
      validateOnBlurOnly: false,
      debounceDelay: 0,
      validateOnFormSubmitOnly: false,
      // Hooks (renamed)
      preValidationHook: function() {},
      preValidationSuccess: function() {}, // Changed name from 'beforeValid'
      onValidationSuccess: function() {
        this.displayFeedbackMessage(this.generateFeedbackSpan());
        this.applyFieldStyling();
      },
      postValidationSuccess: function() {},
      preValidationFailure: function() {}, // Changed name from 'beforeInvalid'
      onValidationFailure: function() {
        this.displayFeedbackMessage(this.generateFeedbackSpan());
        this.applyFieldStyling();
      },
      postValidationFailure: function() {},
      postValidationHook: function() {},
    };
    this.options = Object.extend(defaultOptions, configOptions || {});

    // Directly copy options to instance properties for easier access (Type II)
    Object.extend(this, this.options);

    // Ensure msgInsertionPoint is a Prototype-wrapped element
    this.msgInsertionPoint = $(this.msgInsertionPoint);
    if (!this.msgInsertionPoint) { // Added guard for insertion point
      console.warn("FormElementValidator::initialize - Message insertion point not found, defaulting to target element.");
      this.msgInsertionPoint = this.targetElement;
    }


    // Integrate with FormValidationManager if a parent form exists
    if (this.parentForm) {
      this.formManager = FormValidationManager.retrieveManagerInstance(this.parentForm); // Renamed class and method
      this.formManager.registerField(this); // Renamed method
    }

    // Event observation setup
    this.cachedFocusHandler = this.handleFocusEvent.bindAsEventListener(this); // Renamed property and method
    Event.observe(this.targetElement, 'focus', this.cachedFocusHandler);

    // Only set up real-time events if not validating only on submit
    if (!this.validateOnFormSubmitOnly) {
      this.setupRealtimeValidationEvents(); // Refactored event setup into a new method (Type III)
    }
  },

  /**
   *	Internal method to set up event listeners for real-time validation.
   */
  setupRealtimeValidationEvents: function() {
    const el = this.targetElement;
    switch (this.fieldType) {
      case FormElementValidator.FIELD_TYPE_CHECKBOX:
      case FormElementValidator.FIELD_TYPE_RADIO: // Added new field type case
        this.cachedClickHandler = this.performValidation.bindAsEventListener(this);
        Event.observe(el, 'click', this.cachedClickHandler);
        // Fall through to add change event for checkboxes/radios as well
      case FormElementValidator.FIELD_TYPE_SELECT:
      case FormElementValidator.FIELD_TYPE_FILE:
        this.cachedChangeHandler = this.performValidation.bindAsEventListener(this);
        Event.observe(el, 'change', this.cachedChangeHandler);
        break;
      default:
        // For text inputs, password, textarea
        if (!this.validateOnBlurOnly) {
          this.cachedKeyupHandler = this.throttleValidation.bindAsEventListener(this); // Renamed method
          Event.observe(el, 'keyup', this.cachedKeyupHandler);
        }
        this.cachedBlurHandler = this.performValidation.bindAsEventListener(this); // Renamed method
        Event.observe(el, 'blur', this.cachedBlurHandler);
        break;
    }
  },

  /**
   *	Removes all associated events and cleans up the validator instance.
   */
  destroy: function() {
    // Cleanup form manager association
    if (this.formManager) {
      this.formManager.deregisterField(this); // Renamed method
      // The form manager will decide if it needs to destroy itself
      // this.formManager.destroy(); // Removed this line, as manager should manage its own lifecycle
    }

    // Stop observing events
    const el = this.targetElement;
    if (!el) return; // Added guard for element existence

    Event.stopObserving(el, 'focus', this.cachedFocusHandler);

    if (!this.validateOnFormSubmitOnly) {
      switch (this.fieldType) {
        case FormElementValidator.FIELD_TYPE_CHECKBOX:
        case FormElementValidator.FIELD_TYPE_RADIO: // Added new field type case
          Event.stopObserving(el, 'click', this.cachedClickHandler);
          // Fall through
        case FormElementValidator.FIELD_TYPE_SELECT:
        case FormElementValidator.FIELD_TYPE_FILE:
          Event.stopObserving(el, 'change', this.cachedChangeHandler);
          break;
        default:
          if (!this.validateOnBlurOnly) Event.stopObserving(el, 'keyup', this.cachedKeyupHandler);
          Event.stopObserving(el, 'blur', this.cachedBlurHandler);
          break;
      }
    }
    this.validationRoutines = []; // Clear validation routines
    this.clearVisualFeedback(); // Renamed method
    // Nullify references to aid garbage collection (Type III addition)
    this.targetElement = null;
    this.parentForm = null;
    this.formManager = null;
    this.options = null;
  },

  /**
   *	Adds a validation function to be executed for this element.
   *
   *	@param {Function} checkFunction - The validation function (e.g., Validate.Presence).
   *	@param {object} [checkParams={}] - Optional parameters for the validation function.
   *  @returns {FormElementValidator} - The current validator instance for chaining.
   */
  addValidationRule: function(checkFunction, checkParams) {
    if (typeof checkFunction !== 'function') { // Added type validation
      throw new Error("FormElementValidator::addValidationRule - Provided checkFunction is not a function.");
    }
    this.validationRoutines.push({
      rule: checkFunction,
      params: checkParams || {}
    });
    return this;
  },

  /**
   *	Removes a specific validation rule from the validator instance.
   *	Arguments must exactly match those used during `addValidationRule`.
   *
   *	@param {Function} checkFunction - The validation function to remove.
   *	@param {object} [checkParams={}] - Parameters associated with the function.
   *  @returns {FormElementValidator} - The current validator instance for chaining.
   */
  removeValidationRule: function(checkFunction, checkParams) {
    const paramsToMatch = checkParams || {};
    this.validationRoutines = this.validationRoutines.filter(function(routine) {
      // Use filter instead of reject for clarity and to potentially restructure logic (Type III)
      return !(routine.rule === checkFunction && Object.toQueryString(routine.params) === Object.toQueryString(paramsToMatch));
      // Object.toQueryString is a Prototype.js way to compare objects by their string representation,
      // assuming params are simple objects. More robust deep comparison might be needed for complex objects.
    });
    return this;
  },

  /**
   * Makes the validation wait for the specified `debounceDelay` after the last keystroke.
   */
  throttleValidation: function() {
    // If a delay is set, clear existing timers and set a new one
    if (this.debounceDelay && this.debounceDelay > 0) {
      this.clearVisualFeedback(); // Clear feedback immediately for better UX
      if (this.validationTimeoutId) {
        clearTimeout(this.validationTimeoutId);
      }
      this.validationTimeoutId = setTimeout(this.performValidation.bind(this), this.debounceDelay);
    } else {
      // If no delay, validate immediately
      this.performValidation();
    }
  },

  /**
   * Handles the focus event by clearing previous feedback.
   */
  handleFocusEvent: function() {
    this.clearVisualFeedback(); // Renamed method
  },

  /**
   *	Determines the type of the DOM element being validated.
   *
   *	@returns {Number} - A constant representing the element type.
   *	@throws {Error} If the element is not a supported type.
   */
  determineElementType: function() {
    const nodeNameUpper = this.targetElement.nodeName.toUpperCase();
    const inputTypeUpper = this.targetElement.type ? this.targetElement.type.toUpperCase() : ''; // Handle elements without 'type' attribute

    // Early exit for common types (Type III: reordering for common cases)
    if (nodeNameUpper === 'TEXTAREA') return FormElementValidator.FIELD_TYPE_TEXTAREA;
    if (nodeNameUpper === 'SELECT') return FormElementValidator.FIELD_TYPE_SELECT;

    // Handle INPUT types
    if (nodeNameUpper === 'INPUT') {
      switch (inputTypeUpper) {
        case 'TEXT':
          return FormElementValidator.FIELD_TYPE_TEXT_INPUT;
        case 'PASSWORD':
          return FormElementValidator.FIELD_TYPE_PASSWORD;
        case 'CHECKBOX':
          return FormElementValidator.FIELD_TYPE_CHECKBOX;
        case 'RADIO': // Added new field type
          return FormElementValidator.FIELD_TYPE_RADIO;
        case 'FILE':
          return FormElementValidator.FIELD_TYPE_FILE;
        // Added a default case for unsupported input types (Type III)
        default:
          throw new Error('FormElementValidator::determineElementType - Unsupported INPUT type: ' + inputTypeUpper.toLowerCase() + '!');
      }
    }

    // If not an INPUT, TEXTAREA, or SELECT
    throw new Error('FormElementValidator::determineElementType - Element must be an input, select, or textarea. Received: ' + nodeNameUpper.toLowerCase() + '!');
  },

  /**
   *	Iterates through all registered validation routines and executes them.
   *
   *	@returns {boolean} - True if all routines pass, false if any fail.
   */
  executeValidationRoutines: function() {
    this.hasAnyValidationFailed = false; // Renamed property
    for (let i = 0; i < this.validationRoutines.length; ++i) { // Use let for block scope
      const currentRoutine = this.validationRoutines[i];
      // Renamed method call and parameter
      this.hasAnyValidationFailed = !this.evaluateSingleRule(currentRoutine.rule, currentRoutine.params);
      if (this.hasAnyValidationFailed) {
        return false; // Stop on first failure
      }
    }
    this.feedbackMessage = this.passMsg; // Renamed property
    return true;
  },

  /**
   *	Performs a single validation check on the element's value.
   *
   *	@param {Function} checkFunction - The validation function to use (e.g., Validate.Presence).
   *	@param {object} [checkParams={}] - Parameters for the validation function.
   *  @returns {boolean} - True if the validation passes, false otherwise.
   */
  evaluateSingleRule: function(checkFunction, checkParams) {
    const params = checkParams || {}; // Ensure params is an object

    let shouldDisplayMessageForEmpty = false; // Renamed property and variable
    // Determine if message should be shown even if value is empty
    switch (checkFunction) {
      case Validate.Presence:
      case Validate.Confirmation:
      case Validate.Acceptance:
        shouldDisplayMessageForEmpty = true;
        break;
      case Validate.Custom:
        // Check for a specific 'showWhenEmpty' flag in custom validation parameters
        if (params.showWhenEmpty) shouldDisplayMessageForEmpty = true;
        break;
    }

    let fieldValue;
    // Handle value extraction based on field type (Type III: simplified logic)
    if (this.fieldType === FormElementValidator.FIELD_TYPE_SELECT) {
      fieldValue = this.targetElement.options[this.targetElement.selectedIndex].value;
    } else if (this.fieldType === FormElementValidator.FIELD_TYPE_CHECKBOX || this.fieldType === FormElementValidator.FIELD_TYPE_RADIO) {
      fieldValue = this.targetElement.checked;
      if (checkFunction === Validate.Acceptance && this.fieldType !== FormElementValidator.FIELD_TYPE_CHECKBOX) {
        throw new Error('FormElementValidator::evaluateSingleRule - Acceptance validation is only applicable to checkboxes!');
      }
    } else {
      fieldValue = this.targetElement.value;
    }

    let rulePassed = true;
    try {
      checkFunction(fieldValue, params);
    } catch (error) {
      if (error instanceof Validate.Error) {
        // Only set failure message if field has value OR it's a rule that displays for empty fields
        if (fieldValue !== '' || shouldDisplayMessageForEmpty) {
          this.hasAnyValidationFailed = true;
          // Prepend a custom prefix to the error message (Type III addition)
          this.feedbackMessage = this.customErrorMsgPrefix + error.message.split('\n')[0];
          rulePassed = false;
        }
      } else {
        // Re-throw unexpected errors
        throw error;
      }
    } finally {
      // This ensures 'rulePassed' is returned correctly even if an error is caught and handled.
    }
    return rulePassed;
  },

  /**
   *	Initiates the validation process and triggers appropriate callbacks.
   *
   *    @returns {boolean} - True if all validations pass, false otherwise.
   */
  performValidation: function() {
    if (this.targetElement.disabled) {
      return true; // Skip validation for disabled elements
    }

    this.preValidationHook(); // Renamed hook

    const validationResult = this.executeValidationRoutines(); // Renamed method

    if (validationResult) {
      this.preValidationSuccess(); // Renamed hook
      this.onValidationSuccess(); // Renamed hook
      this.postValidationSuccess(); // Renamed hook
    } else {
      this.preValidationFailure(); // Renamed hook
      this.onValidationFailure(); // Renamed hook
      this.postValidationFailure(); // Renamed hook
    }
    this.postValidationHook(); // Renamed hook
    return validationResult;
  },

  /**
   *  Enables the target form element.
   *
   *  @returns {FormElementValidator} - The current validator instance for chaining.
   */
  enableField: function() {
    if (!this.targetElement.disabled) return this; // Added guard
    this.targetElement.disabled = false;
    return this;
  },

  /**
   *  Disables the target form element and removes any associated feedback.
   *
   *  @returns {FormElementValidator} - The current validator instance for chaining.
   */
  disableField: function() {
    if (this.targetElement.disabled) return this; // Added guard
    this.targetElement.disabled = true;
    this.clearVisualFeedback(); // Renamed method
    return this;
  },

  /** Message Handling Methods ***********************************************************************************
   * These methods are primarily used within the onValidationSuccess and onValidationFailure callbacks.
   * If you override the default callbacks, you may need to call these functions explicitly for visual feedback.
   **************************************************************************************************************/

  /**
   *	Creates a span element containing the current feedback message.
   *
   *    @returns {HTMLSpanElement} - A span element populated with the feedback message.
   */
  generateFeedbackSpan: function() {
    const feedbackSpan = document.createElement('span');
    feedbackSpan.appendChild(document.createTextNode(this.feedbackMessage || '')); // Handle potentially empty message
    return feedbackSpan;
  },

  /**
   *  Inserts the provided element (typically a message span) into the DOM, replacing any existing feedback.
   *
   *  @param {HTMLElement} elementToInsert - The HTML element node to insert.
   */
  displayFeedbackMessage: function(elementToInsert) {
    if (!elementToInsert) return; // Guard against null element

    this.clearFeedbackMessage(); // Renamed method

    // Only insert if there's a failure OR if a valid message is specified AND the field is not empty
    const shouldShowMessage = this.hasAnyValidationFailed || (this.passMsg && (this.targetElement.value !== '' || this.fieldType === FormElementValidator.FIELD_TYPE_CHECKBOX || this.fieldType === FormElementValidator.FIELD_TYPE_RADIO));

    if (!shouldShowMessage) {
      return; // Do not insert message if conditions aren't met
    }

    const cssClass = this.hasAnyValidationFailed ? this.failureCssClass : this.successCssClass;
    $(elementToInsert).addClassName(this.feedbackMsgClass + ' ' + cssClass);

    const insertionParent = this.msgInsertionPoint.up(); // Get the parent of the insertion point
    if (!insertionParent) {
      console.warn("FormElementValidator::displayFeedbackMessage - Could not find parent for message insertion point.");
      return;
    }

    // Find the next sibling of the insertion point
    let nextSiblingNode = this.msgInsertionPoint.next();
    // Fallback if next() doesn't work or finds wrong node (Type III: more robust sibling finding)
    while (nextSiblingNode && nextSiblingNode.nodeType !== 1) { // Skip text nodes etc.
      nextSiblingNode = nextSiblingNode.nextSibling;
    }

    if (nextSiblingNode) {
      insertionParent.insertBefore(elementToInsert, nextSiblingNode);
    } else {
      insertionParent.appendChild(elementToInsert);
    }
  },

  /**
   *  Applies the appropriate CSS class to the field based on its validation status.
   */
  applyFieldStyling: function() {
    this.clearFieldStyling(); // Renamed method

    // Only apply styling if field has a value or it's a checkbox/radio
    const shouldApplyStyling = (this.targetElement.value !== '' || this.fieldType === FormElementValidator.FIELD_TYPE_CHECKBOX || this.fieldType === FormElementValidator.FIELD_TYPE_RADIO);

    if (!shouldApplyStyling) return;

    if (this.hasAnyValidationFailed) {
      this.targetElement.addClassName(this.failureFieldCss);
    } else {
      this.targetElement.addClassName(this.successFieldCss);
    }
  },

  /**
   *	Removes any validation feedback message element if it exists.
   */
  clearFeedbackMessage: function() {
    // Find the message element by class name, relative to the insertion point
    const existingMessage = this.msgInsertionPoint.next('.' + this.feedbackMsgClass); // Using Prototype's next(selector)
    if (existingMessage) {
      existingMessage.remove();
    }
  },

  /**
   *  Removes any validation-related CSS classes from the field.
   */
  clearFieldStyling: function() {
    this.targetElement.removeClassName(this.failureFieldCss);
    this.targetElement.removeClassName(this.successFieldCss);
  },

  /**
   *  Removes both the feedback message and the field's styling classes.
   */
  clearVisualFeedback: function() {
    this.clearFeedbackMessage();
    this.clearFieldStyling();
  }

};

/*************************************** FormValidationManager Class Definition ****************************************/
/**
 * This class internally manages FormElementValidator instances associated with a specific HTML form.
 * It primarily handles form submission validation.
 *
 * Developers typically interact with this indirectly via FormElementValidator instances,
 * but can access it through a validator's `formManager` property for advanced customization.
 */

var FormValidationManager = Class.create();

/*** Static Properties and Methods ***/

Object.extend(FormValidationManager, {

  /**
   *  A registry to hold all active FormValidationManager instances, keyed by form ID.
   */
  managerInstances: {},

  /**
   *	Retrieves an existing FormValidationManager instance for a given form, or creates a new one.
   *
   *	@param {mixed} formElement - A DOM element reference or ID string for the form.
   *	@returns {FormValidationManager} - The manager instance for the specified form.
   *	@throws {Error} If no form element is provided.
   */
  retrieveManagerInstance: function(formElement) {
    if (!formElement) {
      throw new Error("FormValidationManager::retrieveManagerInstance - No form element reference or ID provided!");
    }
    const targetForm = $(formElement); // Use Prototype's $()
    if (!targetForm) { // Added guard for element existence
      throw new Error("FormValidationManager::retrieveManagerInstance - Form element not found for: " + formElement);
    }

    // Ensure the form has an ID; generate a unique one if missing
    if (!targetForm.id) {
      targetForm.id = 'form_mngr_' + Math.floor(Math.random() * 1000000) + '_' + Date.now();
    }

    if (!FormValidationManager.managerInstances[targetForm.id]) {
      FormValidationManager.managerInstances[targetForm.id] = new FormValidationManager(targetForm);
    }
    return FormValidationManager.managerInstances[targetForm.id];
  },

  /**
   * Deletes a manager instance from the registry. (Type III addition)
   * @param {string} formId - The ID of the form whose manager should be removed.
   */
  removeManagerInstance: function(formId) {
    if (FormValidationManager.managerInstances[formId]) {
      delete FormValidationManager.managerInstances[formId];
    }
  }

});

/*** Instance Methods and Properties ***/

FormValidationManager.prototype = {

  // Hooks (renamed)
  preFormValidation: function() {},
  onFormValid: function() {},
  onFormInvalid: function() {},
  postFormValidation: function() {},

  /**
   *	Constructor for FormValidationManager. Attaches validation logic to form submission.
   *
   *	@param {HTMLFormElement} formRef - The DOM element reference to the form.
   */
  initialize: function(formRef) {
    this.targetForm = $(formRef); // Renamed property
    if (!this.targetForm) { // Added guard
      throw new Error("FormValidationManager::initialize - Invalid form reference provided.");
    }
    this.managedFields = []; // Renamed property

    // Capture the original onsubmit handler and replace it
    // This approach is used to ensure our validation runs before any existing inline onSubmit scripts.
    this.originalOnSubmitHandler = this.targetForm.onsubmit || Prototype.emptyFunction; // Renamed property, using Prototype's emptyFunction

    // Bind the new submit handler
    this.newOnSubmitHandler = this.handleFormSubmission.bindAsEventListener(this); // Renamed method
    this.targetForm.onsubmit = this.newOnSubmitHandler;

    // Added a flag to track if the form is currently submitting (Type III addition)
    this.isSubmitting = false;
  },

  /**
   * Registers a FormElementValidator instance with this manager.
   *
   * @param {FormElementValidator} fieldValidator - The validator instance to register.
   */
  registerField: function(fieldValidator) {
    if (!(fieldValidator instanceof FormElementValidator)) { // Added type validation
      console.warn("FormValidationManager::registerField - Attempted to register a non-FormElementValidator object.");
      return;
    }
    if (!this.managedFields.includes(fieldValidator)) { // Avoid duplicates (Type III addition)
      this.managedFields.push(fieldValidator);
    }
  },

  /**
   * Deregisters a FormElementValidator instance from this manager.
   *
   * @param {FormElementValidator} fieldValidator - The validator instance to deregister.
   */
  deregisterField: function(fieldValidator) {
    this.managedFields = this.managedFields.without(fieldValidator); // Prototype.js Array method
    // If no fields remain, the manager should clean itself up (Type III: self-cleanup logic)
    if (this.managedFields.length === 0) {
      this.cleanupManager();
    }
  },

  /**
   * Executes validation for all registered fields and manages form submission.
   *
   * @param {Event} event - The form submission event.
   * @returns {boolean} - True if validation passes and form should submit, false otherwise.
   */
  handleFormSubmission: function(event) {
    // Prevent re-entry if already submitting
    if (this.isSubmitting) {
      Event.stop(event);
      return false;
    }

    this.isSubmitting = true; // Set submitting flag

    this.preFormValidation(); // Renamed hook

    let formIsValid = true;
    // Iterate through fields and perform validation. Stop if any field fails.
    for (let i = 0; i < this.managedFields.length; i++) {
      const currentField = this.managedFields[i];
      // Force validation even if onlyOnSubmit is false for this field
      const fieldValidationPassed = currentField.performValidation(); // Renamed method
      if (!fieldValidationPassed) {
        formIsValid = false;
        // Optionally, break here if you want to stop validating on the first error
        // break;
      }
    }

    if (formIsValid) {
      this.onFormValid(); // Renamed hook
      // If originalOnSubmitHandler returns false, prevent submission.
      // (Type III: more explicit check for original handler return value)
      const originalResult = this.originalOnSubmitHandler.call(this.targetForm, event);
      if (originalResult === false) {
        Event.stop(event);
        formIsValid = false; // Prevent submission
      }
    } else {
      this.onFormInvalid(); // Renamed hook
      Event.stop(event); // Prevent form submission
    }

    this.postFormValidation(); // Renamed hook
    this.isSubmitting = false; // Reset submitting flag

    return formIsValid;
  },

  /**
   * Cleans up the manager instance when it's no longer needed. (Type III addition)
   */
  cleanupManager: function() {
    // Restore original onsubmit handler
    if (this.targetForm) {
      this.targetForm.onsubmit = this.originalOnSubmitHandler;
      // Remove from static registry
      FormValidationManager.removeManagerInstance(this.targetForm.id);
    }
    this.targetForm = null;
    this.managedFields = []; // Clear array
    this.originalOnSubmitHandler = null;
    this.newOnSubmitHandler = null;
  }

};