// InputVerifier version 2.0 (Prototype.js compatible)
// (C) 2023 Acme Corp. - All rights reserved.
// This software is provided under the terms of the Apache 2.0 License.

var InputVerifier = Class.create();

/*
 *  InputVerifier primary class definition.
 *  Handles field-level verification.
 */
// Static properties and methods for InputVerifier.
Object.extend(
  InputVerifier,
  {  
    BUILD_INFO:  '2.0 alpha', // Current software version.
    
    // Constants for different input element types.
    AREA_INPUT:    10,
    PLAIN_INPUT:   11,
    SECRET_INPUT:  12,
    TOGGLE_INPUT:  13,
    CHOICE_INPUT:  14,
    DOC_INPUT:     15,

    /**
     *  Execute verification for a collection of verifier objects.
     *  
     *  @param checkItems {Array} - a list of InputVerifier instances
     *  @returns {boolean} - true if all checks succeed, false otherwise						
     */
    runBatchChecks: function( checkItems ) {
      var overallStatus = true;
      for ( let idx = 0, total = checkItems.length; idx < total; ++idx ) {
        let currentStatus = checkItems[idx].runCheck();
        if ( overallStatus ) {
          overallStatus = currentStatus;
        }
      }
      return overallStatus;
    }

  }
);

// Prototype methods for InputVerifier instances.
InputVerifier.prototype = {
    
  successStyle:      'verifier-pass',
  failureStyle:      'verifier-fail',
  feedbackStyle:     'verifier-message',
  successFieldStyle: 'verifier-field-pass',
  failureFieldStyle: 'verifier-field-fail',
    
  /**
   *	Constructor for an InputVerifier instance. Sets up real-time validation for a form field.
   *	
   *	@param inputNode {mixed} - DOM element reference or its string ID
   *	@param settings {Object} - Configuration object with various options
   *
   *	`settings` properties:
   *	  `passMessage` {string} - Text to display on successful validation (empty string or false to hide).
   *	                           (DEFAULT: "Validated!")
   *      `preCheckHook` {Function} - Callback before validation logic.
   *	                           (DEFAULT: function(){})
   *      `prePassHook` {Function}  - Callback before `onPassHook`.
   *	                           (DEFAULT: function(){})
   *	  `onPassHook` {Function} - Callback when field passes verification.
   *	                           (DEFAULT: function(){ this.placeFeedback(this.buildMsgSpan()); this.applyFieldStyle(); } )
   *      `postPassHook` {Function}   - Callback after `onPassHook`.
   *	                           (DEFAULT: function(){})
   *      `preFailHook` {Function} - Callback before `onFailHook`.
   *	                           (DEFAULT: function(){})	
   *	  `onFailHook` {Function} - Callback when field fails verification.
   *	                           (DEFAULT: function(){ this.placeFeedback(this.buildMsgSpan()); this.applyFieldStyle(); })
   *      `postFailHook` {Function}  - Callback after `onFailHook`.
   *	                           (DEFAULT: function(){})
   *      `postCheckHook` {Function} - Callback after validation logic.
   *	                           (DEFAULT: function(){})
   *	  `insertAfterRef` {mixed} - Reference or ID of the node to insert feedback message after.
   *	                           (DEFAULT: the field being verified)
   *      `checkOnBlurOnly` {boolean} - If true, validation only occurs on blur, not keyup.
   *	                           (DEFAULT: false)
   *      `debounceDelay` {number} - Milliseconds to wait after last keystroke before validating.
   *	                           (DEFAULT: 0)
   *      `checkOnSubmitOnly` {boolean} - If true, validation only occurs when the parent form is submitted.
   *	                           (DEFAULT: false)
   */
  initVerifier: function( inputNode, settings ) {
    // Initial setup for critical properties.
    if ( !inputNode ) throw new Error( "InputVerifier::initVerifier - No input element reference or ID provided!" );
    this.targetElement = $( inputNode );
    if ( !this.targetElement ) throw new Error( "InputVerifier::initVerifier - No element matching reference or ID '" + inputNode + "' found!" );
    
    // Properties determined after initial element assignment.
    this.targetKind = this.getKind();
    this.ruleSet = [];
    this.owningForm = this.targetElement.form;

    // Merge default configuration with provided settings.
    this.configSettings = Object.extend(
      {
        passMessage:         'Validated!',
        insertAfterRef:      this.targetElement,
        checkOnBlurOnly:     false,
        debounceDelay:       0,
        checkOnSubmitOnly:   false,
        // Custom callback points (hooks).
        preCheckHook:        function(){},
        prePassHook:         function(){},
        onPassHook:          function(){ this.placeFeedback( this.buildMsgSpan() ); this.applyFieldStyle(); },
        postPassHook:        function(){},
        preFailHook:         function(){},
        onFailHook:          function(){ this.placeFeedback( this.buildMsgSpan() ); this.applyFieldStyle(); },
        postFailHook:        function(){},
        postCheckHook:       function(){},
      },
      settings || {}
    );
    
    let refNode = this.configSettings.insertAfterRef || this.targetElement;
    this.configSettings.insertAfterRef = $( refNode );
    
    // Copy all configuration settings directly to the instance.
    Object.extend( this, this.configSettings );

    // If part of a form, register with the form manager.
    if ( this.owningForm ) {
      this.formManager = FormValidator.getManager( this.owningForm );
      this.formManager.addControl( this );
    }

    // Event binding. Event handlers are cached for later removal.
    this.onFocusHandler = this.handleFocus.bindAsEventListener( this );
    Event.observe( this.targetElement, 'focus', this.onFocusHandler );
    
    if ( !this.checkOnSubmitOnly ) {
      switch ( this.targetKind ) {
        case InputVerifier.TOGGLE_INPUT:
          this.onClickHandler = this.runCheck.bindAsEventListener( this );
          Event.observe( this.targetElement, 'click', this.onClickHandler );
          // Fall through to add change event for consistency.
        case InputVerifier.CHOICE_INPUT:
        case InputVerifier.DOC_INPUT:
          this.onChangeHandler = this.runCheck.bindAsEventListener( this );
          Event.observe( this.targetElement, 'change', this.onChangeHandler );
          break;
        default:
          if ( !this.checkOnBlurOnly ) {
            this.onKeyupHandler = this.delayCheck.bindAsEventListener( this );
            Event.observe( this.targetElement, 'keyup', this.onKeyupHandler );
          }
          this.onBlurHandler = this.runCheck.bindAsEventListener( this );
          Event.observe( this.targetElement, 'blur', this.onBlurHandler );
      }
    }
  },
  
  /**
   *	Disposes of the verifier instance: detaches event listeners and unregisters from any form manager.
   */
  dispose: function() {
  	if ( this.formManager ) {
		// Remove this control from its associated FormValidator.
		this.formManager.removeControl( this );
		// If no controls remain in the form, decommission the FormValidator instance.
		this.formManager.decommission();
	}
    // Clean up all attached event listeners.
	let inputRef = this.targetElement;
    Event.stopObserving( inputRef, 'focus', this.onFocusHandler );
    if ( !this.checkOnSubmitOnly ) {
      switch ( this.targetKind ) {
        case InputVerifier.TOGGLE_INPUT:
          Event.stopObserving( inputRef, 'click', this.onClickHandler );
          // Intentional fall-through to handle change event as well.
        case InputVerifier.CHOICE_INPUT:
        case InputVerifier.DOC_INPUT:
          Event.stopObserving( inputRef, 'change', this.onChangeHandler );
          break;
        default:
          if ( !this.checkOnBlurOnly ) {
            Event.stopObserving( inputRef, 'keyup', this.onKeyupHandler );
          }
          Event.stopObserving( inputRef, 'blur', this.onBlurHandler );
      }
    }
    this.ruleSet = []; // Clear all validation rules.
	this.clearAllStyles(); // Remove any displayed feedback or field styles.
  },
  
  /**
   *	Appends a new verification rule to the InputVerifier instance.
   *
   *	@param ruleFunc {Function} - The specific function to use for validation (e.g., Validate.Presence).
   *	@param ruleParams {Object} - Optional parameters for the validation function.
   *  @returns {object} - The current InputVerifier instance for method chaining.
   */
  addRule: function( ruleFunc, ruleParams ) {
    this.ruleSet.push( { type: ruleFunc, params: ruleParams || {} } );
    return this;
  },
  
  /**
   *	Removes a specific validation rule from the InputVerifier instance.
   *  The arguments must exactly match those used when the rule was added.
   *
   *	@param ruleFunc {Function} - The validation function to be removed.
   *	@param ruleParams {Object} - The parameters for the rule to be removed.
   *  @returns {object} - The current InputVerifier instance for method chaining.
   */
  removeRule: function( ruleFunc, ruleParams ) {
	this.ruleSet = this.ruleSet.reject( function( rule ) {
	  return ( rule.type == ruleFunc && rule.params == ruleParams );
	} );
	return this;
  },
    
  /**
   * Initiates a debounced validation check, waiting a specified duration after the last input. 
   */
  delayCheck: function( eventObj ) {
    if ( this.debounceDelay >= 300 ) this.clearAllStyles(); // Clear feedback if delay is substantial.
    if ( this.delayTimer ) clearTimeout( this.delayTimer );
    this.delayTimer = setTimeout( this.runCheck.bind( this ), this.debounceDelay );
  },
    
  /**
   * Handles the blur event: marks field as unfocused and triggers validation.
   */
  handleBlur: function() {
    this.isFocused = false;
    this.runCheck();
  },
    
  /**
   * Handles the focus event: marks field as focused and clears existing feedback.
   */
  handleFocus: function() {
    this.isFocused = true;
    this.clearAllStyles();
  },
		
  /**
   *	Determines the specific type of the target input element.
   *
   *	@returns {number} - A constant representing the element type (e.g., InputVerifier.PLAIN_INPUT).
   */
  getKind: function() {
	let nodeNameUpper = this.targetElement.nodeName.toUpperCase();
	let typeUpper = this.targetElement.type.toUpperCase();
    
    switch ( true ) {
      case ( nodeNameUpper == 'TEXTAREA' ):
        return InputVerifier.AREA_INPUT;
      case ( nodeNameUpper == 'INPUT' && typeUpper == 'TEXT' ):
        return InputVerifier.PLAIN_INPUT;
      case ( nodeNameUpper == 'INPUT' && typeUpper == 'PASSWORD' ):
        return InputVerifier.SECRET_INPUT;
      case ( nodeNameUpper == 'INPUT' && typeUpper == 'CHECKBOX' ):
        return InputVerifier.TOGGLE_INPUT;
      case ( nodeNameUpper == 'INPUT' && typeUpper == 'FILE' ):
        return InputVerifier.DOC_INPUT;
      case ( nodeNameUpper == 'SELECT' ):
        return InputVerifier.CHOICE_INPUT;
      case ( nodeNameUpper == 'INPUT' ):
        throw new Error( 'InputVerifier::getKind - Verification not supported for input type: ' + typeUpper.toLowerCase() + '!' );
      default:
        throw new Error( 'InputVerifier::getKind - Target must be an input, select, or textarea; received: ' + nodeNameUpper.toLowerCase() + '!' );
    }
  },
    
  /**
   *	Iterates through all registered validation rules for the instance, executing each sequentially.
   *
   *	@returns {boolean} - True if all rules pass, false if any rule fails.
   */
  performRules: function() {
    this.checkFailed = false;
    for ( let idx = 0, total = this.ruleSet.length; idx < total; ++idx ) {
	  this.checkFailed = !this.checkItem( this.ruleSet[idx].type, this.ruleSet[idx].params );
      if ( this.checkFailed ) return false;	// Stop at the first failure.
    }
    this.statusMsg = this.passMessage; // Set success message if all rules passed.
    return true;
  },
    
  /**
   *	Executes a single validation function on the target element and manages any exceptions.
   *
   *	@param ruleFunc {Function} - The validation function to apply (e.g., Validate.Existence).
   *	@param ruleParams {Object} - Parameters specific to the validation rule.
   *  @returns {boolean} - True if the validation passes, false otherwise.
   */
  checkItem: function( ruleFunc, ruleParams ) {
  	// Determine if feedback should be shown even when the field is empty.
	switch ( ruleFunc ) {
    	case Validate.Presence:
        case Validate.Confirmation:
        case Validate.Acceptance:
    		this.showEmptyMsg = true;
    		break;
		case Validate.Custom:
			if ( ruleParams.displayMessageWhenEmpty ) this.showEmptyMsg = true;
			break;
    }
    
	// Retrieve the element's value, handling select and checkbox types specially.
    let currentVal = ( this.targetKind == InputVerifier.CHOICE_INPUT )
                   ? this.targetElement.options[this.targetElement.selectedIndex].value
                   : this.targetElement.value;     
    
    if ( ruleFunc == Validate.Acceptance ) {
      if ( this.targetKind != InputVerifier.TOGGLE_INPUT ) {
        throw new Error( 'InputVerifier::checkItem - Acceptance validation requires a checkbox input!' );
      }
      currentVal = this.targetElement.checked;
    }
    
	// Perform the actual validation.
    let passed = true;
    try {    
      ruleFunc( currentVal, ruleParams );
    } catch ( issue ) {
      if ( issue instanceof Validate.Error ) {
        // Only show message if value is not empty, or if specifically configured to show for empty values.
        if ( currentVal !== '' || ( currentVal === '' && this.showEmptyMsg ) ) {
          this.checkFailed = true;	
		  // Prototype's error messages might include stack trace, strip it.
          this.statusMsg = issue.message.split('\n')[0];
          passed = false;
        }
      } else {
        throw issue; // Re-throw unexpected errors.
      }
    } finally {
      return passed;
    }
  },
    
  /**
   *	Executes all configured validation rules and triggers appropriate callback hooks.
   *
   *  @returns {boolean} - True if all rules pass, false if any rule fails.
   */
  runCheck: function() {
  	if ( !this.targetElement.disabled ) { // Only validate if the element is not disabled.
		this.preCheckHook();
		let passed = this.performRules();
		if ( passed ) {
			this.prePassHook();
			this.onPassHook();
			this.postPassHook();
			return true;
		} else {
			this.preFailHook();
			this.onFailHook();
			this.postFailHook();
			return false;
		}
		this.postCheckHook(); // This line is unreachable in the original if/else structure.
	} else {
      return true; // Disabled fields are considered valid.
    }
  },
  
  /**
   *  Activates the target input element, making it interactive.
   *
   *  @returns {object} - The current InputVerifier instance for method chaining.
   */
  activate: function() {
  	this.targetElement.disabled = false;
	return this;
  },
  
  /**
   *  Deactivates the target input element, making it non-interactive, and clears any feedback.
   *
   *  @returns {object} - The current InputVerifier instance for method chaining.
   */
  deactivate: function() {
  	this.targetElement.disabled = true;
	this.clearAllStyles(); // Remove visual feedback when disabling.
	return this;
  },
    
  /* Message Display Utilities
   * 
   * These methods are primarily called within the `onPassHook` and `onFailHook` callbacks.
   * If you customize those hooks, you might need to implement your own display logic
   * or invoke these functions to retain default feedback behavior.
   */
   
  /**
   *	Generates a new HTML span element containing the current status message.
   *
   *  @returns {HTMLElement} - A `<span>` element populated with the message text.
   */
  buildMsgSpan: function() {
    let msgSpan = document.createElement( 'span' );
    let msgText = document.createTextNode( this.statusMsg );
    msgSpan.appendChild( msgText );
    return msgSpan;
  },
    
  /**
   *  Injects a provided message element into the DOM, replacing any existing feedback.
   *
   *  @param feedbackNode {HTMLElement} - The element node (e.g., a span) to be inserted.
   */
  placeFeedback: function( feedbackNode ) {
    this.clearFeedback(); // Remove previous feedback first.
    // Do not insert if validation passed and no specific success message is configured.
    if ( !this.checkFailed && !this.passMessage ) return;
    
    // Only insert if field has value, or if configured to show message for empty fields.
    if ( ( this.showEmptyMsg && ( this.targetKind == InputVerifier.TOGGLE_INPUT || this.targetElement.value == '' ) ) || this.targetElement.value != '' ) {
      let styleName = this.checkFailed ? this.failureStyle : this.successStyle;
	  $( feedbackNode ).addClassName( this.feedbackStyle + ' ' + styleName );
	  let parentNode = this.insertAfterRef.up(); // Get parent of the reference node.
      if ( nextSiblingNode = this.insertAfterRef.next() ) { // If there's a next sibling.
        parentNode.insertBefore( feedbackNode, nextSiblingNode );
      } else { // Otherwise, append to parent.
        parentNode.appendChild( feedbackNode );
      }
    }
  },
    
  /**
   *  Applies a CSS class to the target field reflecting its current validation status.
   */
  applyFieldStyle: function() { 
    this.clearFieldStyle(); // Remove any previous status classes.
    if ( !this.checkFailed ) {
      // Apply success style only if message is shown for empty or field has value.
      if ( this.showEmptyMsg || this.targetElement.value != '' ) {
        if ( !this.targetElement.hasClassName( this.successFieldStyle ) ) {
          this.targetElement.addClassName( this.successFieldStyle );
        }
      }
    } else {
      // Apply failure style.
      if ( !this.targetElement.hasClassName( this.failureFieldStyle ) ) {
        this.targetElement.addClassName( this.failureFieldStyle );
      }
    }
  },
    
  /**
   *	Removes any validation feedback message currently displayed in the DOM.
   */
  clearFeedback: function() {
	let nextElement = this.insertAfterRef.next( '.' + this.feedbackStyle );
    if ( nextElement ) nextElement.remove();
  },
    
  /**
   *  Removes all validation status classes from the target input element.
   */
  clearFieldStyle: function() {
    this.targetElement.removeClassName( this.failureFieldStyle );
    this.targetElement.removeClassName( this.successFieldStyle );
  },
    
  /**
   *  Removes both the validation feedback message and field status classes.
   */
  clearAllStyles: function() {
    this.clearFeedback();
    this.clearFieldStyle();
  }
   
}; // End of InputVerifier prototype.

/*
 *  FormValidator class definition.
 *  Manages form-wide validation by coordinating individual InputVerifier objects.
 */
/**
 *  This class is an internal helper for InputVerifier. It links an InputVerifier
 *  instance to its parent form.
 * 
 *  Developers typically won't interact with this class directly, unless customizing
 *  behavior via the `formManager` property of an InputVerifier object, or for
 *  handling fields not directly children of a form.
 */

var FormValidator = Class.create();

// Static properties and methods for FormValidator.
Object.extend( FormValidator, {

	/**
	 *  Central repository for all FormValidator instances, keyed by form ID.
	 */
	registry: {},
	
	/**
	 *	Retrieves an existing FormValidator instance for a given form, or creates a new one if none exists.
	 *	
	 *	@param formNode {mixed} - A DOM element reference to a form, or its string ID.
	 *  @returns {object} - The FormValidator instance.
	 */
	getManager: function( formNode ) {
	  if ( !formNode ) throw new Error( "FormValidator::getManager - No form element reference or ID provided!" );
	  let formRef = $( formNode );
	  let uniqueId = Math.random() * Math.random(); // Generate a unique ID if form has none.
	  if ( !formRef.id ) formRef.id = 'form_' + uniqueId.toString().replace( /\./, '' ) + new Date().valueOf();
	  if ( !FormValidator.registry[formRef.id] ) {
        FormValidator.registry[formRef.id] = new FormValidator( formRef );
      }
	  return FormValidator.registry[formRef.id];
	}

} );

// Prototype methods for FormValidator instances.
FormValidator.prototype = {
  
  // Callback hooks for form-level events.
  preFormCheck:   function(){},
  onFormPass:     function(){},
  onFormFail:     function(){},
  postFormCheck:  function(){},

  /**
   *	Constructor for FormValidator. Sets up validation for all associated InputVerifier fields upon form submission.
   *	
   *	@param formNode {HTMLFormElement} - The DOM element reference for the form to manage.
   */
  initManager: function( formNode ) {
    this.targetElement = $( formNode );
    this.controlledFields = []; // Array to hold InputVerifier instances for this form.
    
    // Intercept form submission: capture the original handler and insert our own.
	// This approach is used instead of Event.observe to ensure our validation runs
	// before any inline submit handlers, which often appear to execute first.
	this.originalSubmitHandler = this.targetElement.onsubmit || function(){};
	this.targetElement.onsubmit = function( eventObj ) {
      // Original logic:
      // 1. Validate all fields managed by this FormValidator.
      // 2. If validation passes, call the original form's onsubmit handler.
      // 3. If either step fails, prevent form submission.
      let formManagerInstance = FormValidator.getManager( this ); // 'this' here refers to the form element.
      let validationResult = formManagerInstance.validate();
      
      let originalSubmitResult = true;
      if ( validationResult ) {
        originalSubmitResult = ( formManagerInstance.originalSubmitHandler( eventObj || window.event ) !== false );
      }

      if ( !validationResult || !originalSubmitResult ) {
        if ( eventObj ) {
          Event.stop( eventObj ); // Prevent default submission action for Prototype.
        }
        return false; // Prevent form submission.
      }
      return true; // Allow form submission.
    };
  },
  
  /**
   *	Adds an InputVerifier field to this form manager's collection.
   *
   *	@param control {object} - The InputVerifier instance to add.
   */
  addControl: function( control ) {
    this.controlledFields.push( control );
  },
  
  /**
   *	Removes an InputVerifier field from this form manager's collection.
   *
   *	@param control {object} - The InputVerifier instance to remove.
   */
  removeControl: function( control ) {
    this.controlledFields = this.controlledFields.without( control );
  },
  
  /**
   *	Executes validation for all fields managed by this FormValidator instance.
   *
   *	@returns {boolean} - True if all fields pass validation, false otherwise.
   */
  validate: function() {
    let overallStatus = true;
    this.preFormCheck();
    for ( let idx = 0, total = this.controlledFields.length; idx < total; ++idx ) {
      let currentStatus = this.controlledFields[idx].runCheck();
      if ( overallStatus ) overallStatus = currentStatus; // Preserve failure status.
    }
    if ( overallStatus ) {
      this.onFormPass();
    } else {
      this.onFormFail();
    }
    this.postFormCheck();
    return overallStatus;
  },
  
  /**
   *	Decommissions this FormValidator instance: restores original submit handler and cleans up.
   *
   *	@param formRef {mixed} - A DOM element reference or ID of the form to decommission.
   */
  decommission: function() {
    Event.stopObserving( this.targetElement, 'submit', this.targetElement.onsubmit ); // Stop observing our custom submit.
    this.targetElement.onsubmit = this.originalSubmitHandler; // Restore the original submit handler.
    // Dispose of all associated InputVerifier fields.
    this.controlledFields.each( function( control ) { control.dispose(); } );
    // Remove this instance from the global registry.
    delete FormValidator.registry[this.targetElement.id];
  }

}; // End of FormValidator prototype.