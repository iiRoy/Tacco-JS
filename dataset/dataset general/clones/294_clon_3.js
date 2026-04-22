(function ( appWindow, docRoot, undefinedValue ){

	// Core application constants and configuration values.
	// These define various element classifications and operational parameters.

	const ACTION_ELEMENT_KINDS = ['button', 'submit']; // Recognizable button types
	const INPUT_ELEMENT_KINDS = ['text', 'password', 'select-one', 'checkbox', 'textarea', 'range', 'number', 'email', 'hidden', 'file', 'date', 'datetime-local', 'search', 'tel', 'time', 'url', 'month', 'week']; // All input types managed by this system
	const CHANGE_TRIGGERED_INPUTS = ['checkbox', 'select-one', 'select', 'file']; // Inputs that primarily trigger 'change' events
	const ADDITIONAL_CHANGE_INPUTS = ['number', 'date', 'datetime-local', 'time', 'month', 'week', 'range']; // Inputs that also benefit from 'change' events

	// Configuration keys for different levels of the system
	const FORM_CONFIG_KEYS = ['responseDelay', 'requestDelay', 'failureStyle', 'inactiveStyle', 'processingStyle', 'validationTrigger', 'submitButtonManagement', 'mainActionButton', 'onFormSubmission', 'beforeActionHook', 'onErrorCallback', 'onValidCallback', 'preEventHook', 'errorEventHook', 'validEventHook'];
	const INPUT_CONFIG_KEYS = ['responseDelay', 'requestDelay', 'requestEndpoint', 'successStyle', 'failureStyle', 'inactiveStyle', 'processingStyle', 'validationRules', 'validationTrigger', 'beforeActionHook', 'onErrorCallback', 'onValidCallback', 'isOwnedByForm', 'preEventHook', 'errorEventHook', 'validEventHook'];
	const ACTION_CONFIG_KEYS = ['inactiveStyle', 'processingStyle'];

	// Unique identifier for elements managed by FormPilot
	const PILOT_INITIATED_FLAG = 'data-form-pilot-managed';

	// Default operational settings for any form managed by FormPilot
	const standardSettings = {
		failureStyle     : 'validation-error',
		processingStyle  : 'action-pending',
		inactiveStyle    : 'action-disabled',
		successStyle     : 'validation-success',

		preEventHook : 'formPilot:preAction',
		errorEventHook : 'formPilot:actionError',
		validEventHook : 'formPilot:actionValid',

		responseDelay       : 0,
		requestDelay: 2000,

		validationTrigger: 'input keyup',

		inputFields : {},
		actionButtons: {},

		submitButtonManagement: true,
		mainActionButton       : null
	};

	/**
	 * A utility collection for DOM and object manipulation.
	 * @namespace PilotUtils
	 */
	const PilotUtils = {
		/**
		 * Determines if an element is an HTMLFormElement.
		 * @param {Element} elementToCheck - The DOM element to verify.
		 * @returns {boolean} True if the element is a form, false otherwise.
		 */
		isHTMLFormElement: (elementToCheck) => {
			return elementToCheck instanceof HTMLFormElement;
		},

		/**
		 * Retrieves a specific attribute from a DOM element.
		 * @param {Element} element - The DOM element.
		 * @param {string} attributeName - The name of the attribute.
		 * @returns {string|null} The attribute value or null if not found.
		 */
		retrieveAttribute: (element, attributeName) => {
			return element ? element.getAttribute(attributeName) : null;
		},

		/**
		 * Assigns an attribute to a DOM element.
		 * @param {Element} element - The DOM element.
		 * @param {string} attributeName - The name of the attribute.
		 * @param {string} attributeValue - The value to assign.
		 */
		assignAttribute: (element, attributeName, attributeValue) => {
			element && element.setAttribute(attributeName, attributeValue);
		},

		/**
		 * Checks if an item exists in an array.
		 * @param {Array} collection - The array to search.
		 * @param {*} item - The item to find.
		 * @returns {boolean} True if the item is found, false otherwise.
		 */
		isInArray: (collection, item) => {
			return collection.includes(item);
		},

		/**
		 * Manages data attributes on an element's dataset.
		 * @param {Element} element - The DOM element.
		 * @param {string} key - The data attribute key.
		 * @param {*} [value] - The value to set; if undefined, retrieves the value. If null, deletes the key.
		 * @returns {*} The retrieved value or the element itself for chaining.
		 */
		manageDataset: (element, key, value) => {
			if (!element || !element.dataset) return null;
			if (value === undefinedValue) {
				return element.dataset[key];
			} else if (value === null) {
				delete element.dataset[key];
			} else {
				element.dataset[key] = value;
			}
			return element;
		},

		/**
		 * Prevents the default action of an event.
		 * @param {Event} evt - The event object.
		 */
		haltEvent: (evt) => {
			evt && evt.preventDefault();
		},

		/**
		 * Performs a shallow clone of an object.
		 * @param {object} obj - The object to clone.
		 * @returns {object} A new object with the same properties.
		 */
		shallowClone: (obj) => {
			return Object.assign({}, obj);
		},

		/**
		 * Merges properties from source objects into a target object.
		 * @param {object} target - The object to merge into.
		 * @param {...object} sources - One or more source objects.
		 * @returns {object} The merged target object.
		 */
		mergeObjects: (target, ...sources) => {
			return Object.assign(target, ...sources);
		},

		/**
		 * Attempts to find a form element by ID or direct reference.
		 * @param {string|HTMLFormElement} reference - The form ID or element.
		 * @returns {HTMLFormElement|null} The found form element or null.
		 */
		getFormElement: (reference) => {
			if (typeof reference === 'string') {
				const foundEl = docRoot.getElementById(reference) || docRoot.querySelector(`form[name="${reference}"]`);
				return PilotUtils.isHTMLFormElement(foundEl) ? foundEl : null;
			}
			return PilotUtils.isHTMLFormElement(reference) ? reference : null;
		},

		/**
		 * Determines the primary identifier (name or ID) for a form element.
		 * @param {HTMLElement} element - The element.
		 * @returns {string|null} The name or ID, or null.
		 */
		determineElementName: (element) => {
			return element.name || element.id || null;
		}
	};

	/**
	 * Main FormPilot constructor. Orchestrates form behavior and validation.
	 * @param {string|HTMLFormElement} targetFormElement - The form to manage (ID or element reference).
	 * @param {object} [userOptions] - Custom configuration options.
	 * @returns {FormPilot|null} An initialized FormPilot instance or null if the form is invalid.
	 */
	const FormPilot = function ( targetFormElement, userOptions ){
		if ( !(this instanceof FormPilot) ) {
			return new FormPilot( targetFormElement, userOptions );
		}

		const instanceRef = this; // Self-reference for clarity

		// Attempt to resolve the target form element
		const currentForm = PilotUtils.getFormElement( targetFormElement );

		if ( !currentForm ) {
			console.error('FormPilot: Target form element not found or invalid.', targetFormElement);
			return null; // Exit if the form isn't valid
		}

		// Check if this form is already managed
		const existingFlag = PilotUtils.manageDataset( currentForm, PILOT_INITIATED_FLAG.replace('data-', '') );
		if ( existingFlag ) {
			// If managed, try to retrieve from a global registry
			const existingPilotInstance = FormPilot.registry.find( (item) => item.form === currentForm );
			if ( existingPilotInstance ) {
				existingPilotInstance.configure( userOptions ); // Update configuration of existing instance
				return existingPilotInstance;
			}
		}

		// Mark the form as managed and disable native validation
		PilotUtils.manageDataset( currentForm, PILOT_INITIATED_FLAG.replace('data-', ''), '1' );
		currentForm.setAttribute( 'novalidate', '' ); // Use empty string for boolean attributes

		instanceRef.form = currentForm;
		instanceRef.config = PilotUtils.shallowClone( standardSettings ); // Start with a fresh copy of defaults
		instanceRef.configure( userOptions || {} ); // Apply user-defined options

		instanceRef.setup(); // Initialize the form's fields and buttons
		FormPilot.registry.push( instanceRef ); // Add to global registry
		return instanceRef;
	};

	const FormPilotProto = FormPilot.prototype;

	// Global registry for all FormPilot instances
	FormPilot.registry = [];

	/**
	 * Initializes the FormPilot instance, setting up fields, buttons, and event handlers.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.setup = function (){
		const instanceRef = this;
		if ( instanceRef.isReady ) {
			return instanceRef; // Already set up
		}

		instanceRef.inputFields = {};
		instanceRef.actionButtons = {};

		instanceRef.isReady = true; // Mark as initialized

		instanceRef.lockCounter = 0; // Tracks locks preventing submission
		instanceRef.holdCounter = 0; // Tracks fields with pending async validation
		instanceRef.errorCount = 0; // Total validation errors
		instanceRef.isValid = true; // Overall form validity status

		// Clear previous XHR states
		instanceRef.activeXHR = {};
		instanceRef.xhrDelayTimers = {};

		// Handle the primary submit button if specified in config
		const mainActionEl = instanceRef.fetchConfig( 'mainActionButton' );
		if ( mainActionEl ) {
			instanceRef.actionButtons['submit'] = new FormActionButton( instanceRef, mainActionEl );
		}

		// Iterate through all form elements to identify and manage inputs/buttons
		Array.from( instanceRef.form.elements ).forEach( (element) => {
			const elementType = element.type;
			const elementName = PilotUtils.determineElementName( element );

			if ( !elementName ) {
				// Skip elements without a name or ID, they are unlikely to be form data or actionable
				return;
			}

			// Handle input fields
			if ( PilotUtils.isInArray( INPUT_ELEMENT_KINDS, elementType ) ) {
				instanceRef.inputFields[elementName] = new FormInputField( instanceRef, element );
			}
			// Handle action buttons
			else if ( PilotUtils.isInArray( ACTION_ELEMENT_KINDS, elementType ) ) {
				// Only add if not already added as the mainActionButton, or if it's not a submit button.
				// If it's a submit button, give it the 'submit' key, overriding any other name.
				const buttonKey = (elementType === 'submit') ? 'submit' : elementName;
				if ( !(buttonKey === 'submit' && instanceRef.actionButtons['submit']) ) {
					instanceRef.actionButtons[buttonKey] = new FormActionButton( instanceRef, element );
				}
			}
		});

		// Override native form submission
		instanceRef.form.onsubmit = ((pilotInstance) => {
			return function ( event ){
				PilotUtils.haltEvent( event ); // Always prevent default to take control

				const submitButtonRef = pilotInstance.getActionButton( 'submit' );
				const controlSubmit = pilotInstance.fetchConfig( 'submitButtonManagement' );
				const hasCustomSubmitHandler = typeof pilotInstance.fetchConfig( 'onFormSubmission' ) === 'function';
				const isCurrentlyProcessing = submitButtonRef && submitButtonRef.hasClass( submitButtonRef.fetchConfig('processingStyle') );

				// Prevent double submission or submission while locked
				if ( isCurrentlyProcessing || pilotInstance.lockCounter > 0 ) {
					return false;
				}

				// Perform a full validation before proceeding
				const formIsValid = pilotInstance.validateForm( { noDelay: true, suppressUI: true } );

				if ( !formIsValid ) {
					// If validation fails, ensure submit button is re-enabled if it was processing
					if ( controlSubmit && submitButtonRef ) {
						submitButtonRef.endProcessing();
					}
					return false;
				}

				// If custom submission handler exists, execute it
				if ( hasCustomSubmitHandler ) {
					if ( controlSubmit && submitButtonRef ) {
						submitButtonRef.startProcessing(); // Indicate processing
					}
					pilotInstance.invokeCallback( pilotInstance.form, 'onFormSubmission', [event, pilotInstance] );
					return false; // Custom handler takes over
				} else {
					// No custom handler, proceed with native form submission
					try {
						pilotInstance.form.submit();
					} catch ( submissionError ) {
						console.warn('FormPilot: Native form submission failed.', submissionError);
					}
					return true; // Allow native submission
				}
			};
		})( instanceRef );

		// Initial validation on setup, without highlighting errors immediately
		instanceRef.validateForm( {
			highlightErrors : false,
			triggerEvents: false,
			silent: true // Suppress console output for initial state
		} );
		return instanceRef.manageActionButtonState(); // Update submit button state
	};

	/**
	 * Cleans up the FormPilot instance, removing event listeners and states.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.destroy = function (){
		const instanceRef = this;
		if ( !instanceRef.isReady ) {
			return instanceRef; // Already destroyed or not set up
		}

		// Destroy all managed input fields
		for ( const fieldName in instanceRef.inputFields ) {
			instanceRef.inputFields[fieldName].destroy();
		}
		// Destroy all managed action buttons
		for ( const buttonName in instanceRef.actionButtons ) {
			instanceRef.actionButtons[buttonName].destroy();
		}

		// Remove the onsubmit handler
		instanceRef.form.onsubmit = null;

		// Remove the managed flag from the form element
		PilotUtils.manageDataset( instanceRef.form, PILOT_INITIATED_FLAG.replace('data-', ''), null );

		// Remove this instance from the global registry
		FormPilot.registry = FormPilot.registry.filter( (item) => item !== instanceRef );

		instanceRef.isReady = false; // Mark as not initialized
		return instanceRef;
	};

	/**
	 * Resets the form and its managed elements to their default configuration.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.resetToDefaults = function (){
		const instanceRef = this;
		const currentFields = instanceRef.inputFields;
		const currentButtons = instanceRef.actionButtons;

		instanceRef.destroy(); // Clean up current state
		instanceRef.configure( PilotUtils.shallowClone( standardSettings ) ); // Reapply default configuration

		// Reset individual field/button configurations (though destroy already cleans up their state)
		for ( const name in currentFields ) {
			currentFields[name].resetToDefaults();
		}
		for ( const name in currentButtons ) {
			currentButtons[name].resetToDefaults();
		}

		instanceRef.lockCounter = 0;
		instanceRef.holdCounter = 0;
		instanceRef.errorCount = 0;
		instanceRef.isValid = true;

		return instanceRef.setup(); // Re-initialize with defaults
	};

	/**
	 * Triggers validation for all managed input fields.
	 * @param {object} [validationOptions] - Options for the validation process.
	 * @returns {boolean} True if all fields are valid, false otherwise.
	 */
	FormPilotProto.validateForm = function ( validationOptions ){
		const instanceRef = this;
		let totalErrors = 0;

		// Use Object.values for cleaner iteration over fields
		Object.values( instanceRef.inputFields ).forEach( (field) => {
			if ( !field.validate( validationOptions || {} ) ) {
				totalErrors++;
			}
		});

		instanceRef.errorCount = totalErrors;
		instanceRef.isValid = (totalErrors === 0);
		return instanceRef.isValid;
	};

	/**
	 * Serializes form data into a plain JavaScript object.
	 * @returns {object} An object representing the form's current data.
	 */
	FormPilotProto.serializeForm = function (){
		const instanceRef = this;
		const formData = {};

		// Use Array.from and reduce for a more functional approach
		Array.from( instanceRef.form.elements ).reduce( (accumulator, element) => {
			const elementName = PilotUtils.determineElementName( element );
			if ( !elementName ) return accumulator; // Skip elements without a name

			switch ( element.type ) {
				case 'checkbox':
					accumulator[elementName] = element.checked;
					break;
				case 'radio':
					// Initialize if not present, then assign if checked
					accumulator[elementName] = accumulator[elementName] || '';
					if ( element.checked ) {
						accumulator[elementName] = element.value;
					}
					break;
				case 'submit':
				case 'button':
					// Skip action buttons
					break;
				default:
					accumulator[elementName] = element.value;
			}
			return accumulator;
		}, formData );

		return formData;
	};

	/**
	 * Retrieves a configuration option.
	 * @param {string} optionKey - The key of the option to retrieve.
	 * @returns {*} The value of the configuration option.
	 */
	FormPilotProto.fetchConfig = function ( optionKey ){
		return this.config[optionKey];
	};

	/**
	 * Updates the form's configuration with new options.
	 * @param {object} newOptions - An object containing new configuration settings.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.configure = function ( newOptions ){
		const instanceRef = this;
		if ( !newOptions || typeof newOptions !== 'object' ) {
			return instanceRef; // No valid options to apply
		}

		const wasReady = instanceRef.isReady;
		if ( wasReady ) {
			instanceRef.destroy(); // Temporarily destroy to re-initialize with new config
		}
		// Merge new options into the existing configuration
		instanceRef.config = PilotUtils.mergeObjects( instanceRef.config, newOptions );
		if ( wasReady ) {
			instanceRef.setup(); // Re-initialize with the updated configuration
		}
		return instanceRef;
	};

	/**
	 * Retrieves a managed input field object.
	 * @param {string} inputName - The name of the input field.
	 * @returns {FormInputField|undefined} The field object or undefined if not found.
	 */
	FormPilotProto.getInputField = function ( inputName ){
		return this.inputFields[inputName];
	};

	/**
	 * Retrieves a managed action button object.
	 * @param {string} buttonName - The name of the button.
	 * @returns {FormActionButton|undefined} The button object or undefined if not found.
	 */
	FormPilotProto.getActionButton = function ( buttonName ){
		return this.actionButtons[buttonName];
	};

	/**
	 * Sets a custom function to be executed when the form is submitted.
	 * @param {function} customSubmitFunction - The function to call on form submission.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.onSubmit = function ( customSubmitFunction ){
		const instanceRef = this;
		if ( typeof customSubmitFunction === 'function' ) {
			instanceRef.config.onFormSubmission = customSubmitFunction;
		}
		return instanceRef;
	};

	/**
	 * Manages the state of the submit button based on form validity.
	 * @param {boolean} [explicitValidity] - Optional explicit validity state.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.manageActionButtonState = function ( explicitValidity ){
		const instanceRef = this;
		const submitButtonRef = instanceRef.getActionButton( 'submit' );
		const shouldControl = instanceRef.fetchConfig( 'submitButtonManagement' );

		// Determine the effective validity based on current state or explicit override
		const effectiveValidity = (explicitValidity === true || explicitValidity === false)
			? explicitValidity
			: (instanceRef.errorCount === 0 && instanceRef.holdCounter === 0 && instanceRef.lockCounter === 0);

		instanceRef.isValid = effectiveValidity; // Update internal validity status

		if ( submitButtonRef && shouldControl ) {
			effectiveValidity ? submitButtonRef.enableButton() : submitButtonRef.disableButton();
		}
		return instanceRef;
	};

	/**
	 * Disables the submit button.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.disableSubmitButton = function (){
		return this.manageActionButtonState( false );
	};

	/**
	 * Enables the submit button.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.enableSubmitButton = function (){
		return this.manageActionButtonState( true );
	};

	/**
	 * Controls the processing state of the submit button.
	 * @param {boolean} isProcessing - True to set processing, false to end.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.setProcessingState = function ( isProcessing ){
		const instanceRef = this;
		const submitButtonRef = instanceRef.getActionButton( 'submit' );
		if ( submitButtonRef ) {
			isProcessing ? submitButtonRef.startProcessing() : submitButtonRef.endProcessing();
		}
		return instanceRef;
	};

	/**
	 * Increments the form's lock counter, disabling submission.
	 * @param {number} [count=1] - Number to add to the lock counter.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.acquireLock = function ( count = 1 ){
		const instanceRef = this;
		instanceRef.lockCounter += count;
		return instanceRef.disableSubmitButton();
	};

	/**
	 * Decrements the form's lock counter, potentially enabling submission.
	 * @param {number} [count=1] - Number to subtract from the lock counter.
	 * @returns {FormPilot} The current FormPilot instance.
	 */
	FormPilotProto.releaseLock = function ( count = 1 ){
		const instanceRef = this;
		instanceRef.lockCounter = Math.max(0, instanceRef.lockCounter - count); // Ensure non-negative
		return instanceRef.manageActionButtonState();
	};

	/**
	 * Executes a callback function if it's defined.
	 * @param {object} context - The 'this' context for the callback.
	 * @param {string} callbackKey - The key of the callback in the form's config.
	 * @param {Array} [parameters=[]] - Arguments to pass to the callback.
	 * @returns {*} The result of the callback or null.
	 */
	FormPilotProto.invokeCallback = function ( context, callbackKey, parameters = [] ){
		const instanceRef = this;
		let callbackRef = instanceRef.fetchConfig( callbackKey );

		if ( typeof callbackRef === 'function' ) {
			return callbackRef.apply( context, parameters );
		}
		return null;
	};

	appWindow.FormPilot = FormPilot; // Expose FormPilot globally


	/**
	 * Base class for all form controls (fields and buttons).
	 * @abstract
	 * @class BaseFormControl
	 */
	const BaseFormControl = function (){
		// Abstract base class, intended for inheritance.
		// Common properties like 'el', 'parent', 'config', 'events' are expected to be set by derived classes.
	};

	const BaseFormControlProto = BaseFormControl.prototype;

	/**
	 * Cleans up the control, removing event listeners and resetting its state.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.destroy = function (){
		const instanceRef = this;
		const element = instanceRef.element;
		const registeredEvents = instanceRef.events || [];

		// Remove all registered event listeners
		registeredEvents.forEach( ([eventType, handler]) => {
			element.removeEventListener( eventType, handler );
		});
		instanceRef.events = []; // Clear the event list

		// Remove all associated CSS classes
		element.classList.remove(
			instanceRef.fetchConfig( 'failureStyle' ),
			instanceRef.fetchConfig( 'inactiveStyle' ),
			instanceRef.fetchConfig( 'processingStyle' ),
			instanceRef.fetchConfig( 'successStyle' )
		);

		// Clean up data attributes
		PilotUtils.manageDataset( element, 'holdStatus', null );
		PilotUtils.manageDataset( element, 'errorStatus', null );

		// Clear any pending timers or XHRs
		if ( instanceRef.validationTimer ) {
			clearTimeout( instanceRef.validationTimer );
			instanceRef.validationTimer = null;
		}
		if ( instanceRef.xhrRequest ) {
			instanceRef.xhrRequest.abort();
			instanceRef.xhrRequest = null;
		}
		if ( instanceRef.xhrDelayTimer ) {
			clearTimeout( instanceRef.xhrDelayTimer );
			instanceRef.xhrDelayTimer = null;
		}

		// If this control was invalid, decrement the parent form's error count
		if ( instanceRef.parent && !instanceRef.isValid ) {
			instanceRef.parent.errorCount = Math.max(0, instanceRef.parent.errorCount - 1);
		}

		instanceRef.parent && instanceRef.parent.manageActionButtonState(); // Update form's button state

		instanceRef.isInitialized = false; // Mark as not initialized
		return instanceRef;
	};

	/**
	 * Resets the control's configuration to its default state.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.resetToDefaults = function (){
		return this.configure( PilotUtils.shallowClone( standardSettings ) );
	};

	/**
	 * Updates the control's configuration with new options.
	 * @param {object} newOptions - An object containing new configuration settings.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.configure = function ( newOptions ){
		const instanceRef = this;
		const elementName = PilotUtils.determineElementName( instanceRef.element );
		const wasInitialized = instanceRef.isInitialized;

		if ( wasInitialized ) {
			instanceRef.destroy(); // Clean up before reconfiguring
		}

		for ( const key in newOptions ) {
			// Only apply options relevant to a field/button
			if ( PilotUtils.isInArray( INPUT_CONFIG_KEYS, key ) || PilotUtils.isInArray( ACTION_CONFIG_KEYS, key ) ) {
				instanceRef.config[key] = newOptions[key];
				// Also update the form's nested config for this specific field/button
				if ( instanceRef.parent && instanceRef.parent.config.inputFields[elementName] ) {
					instanceRef.parent.config.inputFields[elementName][key] = newOptions[key];
				}
			}
		}

		if ( wasInitialized ) {
			instanceRef.setup(); // Re-initialize with the updated configuration
		}
		return instanceRef;
	};

	/**
	 * Retrieves a configuration option for this control.
	 * @param {string} optionKey - The key of the option to retrieve.
	 * @returns {*} The value of the configuration option.
	 */
	BaseFormControlProto.fetchConfig = function ( optionKey ){
		return this.config[optionKey];
	};

	/**
	 * Subscribes the control's element to a specified event.
	 * @param {string} eventType - The name of the event (e.g., 'click', 'input').
	 * @param {function} eventHandler - The function to execute when the event fires.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.on = function ( eventType, eventHandler ){
		const instanceRef = this;
		instanceRef.element.addEventListener( eventType, eventHandler );
		instanceRef.events.push( [eventType, eventHandler] ); // Store for later cleanup
		return instanceRef;
	};

	/**
	 * Unsubscribes the control's element from a specific event.
	 * @param {string} eventType - The name of the event.
	 * @param {function} eventHandler - The handler function to remove.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.off = function ( eventType, eventHandler ){
		const instanceRef = this;
		instanceRef.element.removeEventListener( eventType, eventHandler );
		// Remove from stored events list
		instanceRef.events = instanceRef.events.filter( ([type, handler]) => !(type === eventType && handler === eventHandler) );
		return instanceRef;
	};

	/**
	 * Checks if the control's element has a specific CSS class.
	 * @param {string} className - The CSS class name.
	 * @returns {boolean} True if the class is present, false otherwise.
	 */
	BaseFormControlProto.hasClass = function ( className ){
		return this.element.classList.contains( className );
	};

	/**
	 * Adds a CSS class to the control's element.
	 * @param {string} className - The CSS class name.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.addClass = function ( className ){
		this.element.classList.add( className );
		return this;
	};

	/**
	 * Removes a CSS class from the control's element.
	 * @param {string} className - The CSS class name.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.removeClass = function ( className ){
		this.element.classList.remove( className );
		return this;
	};

	/**
	 * Toggles a CSS class on the control's element.
	 * @param {string} className - The CSS class name.
	 * @param {boolean} [force] - If true, adds the class; if false, removes it.
	 * @returns {BaseFormControl} The current control instance.
	 */
	BaseFormControlProto.toggleClass = function ( className, force ){
		this.element.classList.toggle( className, force );
		return this;
	};

	/**
	 * FormInputField class, extending BaseFormControl, for managing form input elements.
	 * @param {FormPilot} parentPilot - The parent FormPilot instance.
	 * @param {HTMLElement} inputElement - The actual DOM input element.
	 * @constructor
	 * @augments BaseFormControl
	 */
	const FormInputField = function ( parentPilot, inputElement ){
		this.parent = parentPilot;
		this.element = inputElement;
		this.config = PilotUtils.shallowClone( standardSettings );
		this.events = []; // Array to store [eventType, handler] pairs for cleanup

		this.isValid = true; // Initial validity state
		this.validationTimer = null; // Timer for debouncing validation
		this.xhrRequest = null; // Active XHR for remote validation
		this.xhrDelayTimer = null; // Timer for XHR request delay

		this.setup(); // Initialize this field
	};

	const FormInputFieldProto = FormInputField.prototype = Object.create( BaseFormControlProto );
	FormInputFieldProto.constructor = FormInputField;

	/**
	 * Sets up the input field, attaching event listeners.
	 * @returns {FormInputField} The current field instance.
	 */
	FormInputFieldProto.setup = function (){
		const instanceRef = this;
		if ( instanceRef.isInitialized ) return instanceRef;

		const validationTriggers = instanceRef.fetchConfig( 'validationTrigger' ).split(' ');
		validationTriggers.forEach( (trigger) => {
			instanceRef.on( trigger, instanceRef.handleValidationEvent.bind(instanceRef) );
		});

		// Add 'change' event for specific input types if not already included
		if ( PilotUtils.isInArray( CHANGE_TRIGGERED_INPUTS, instanceRef.element.type ) ||
		     PilotUtils.isInArray( ADDITIONAL_CHANGE_INPUTS, instanceRef.element.type ) ) {
			if ( !PilotUtils.isInArray( validationTriggers, 'change' ) ) {
				instanceRef.on( 'change', instanceRef.handleValidationEvent.bind(instanceRef) );
			}
		}

		instanceRef.isInitialized = true;
		return instanceRef;
	};

	/**
	 * Handles events that trigger validation for this input field.
	 * @param {Event} event - The DOM event.
	 */
	FormInputFieldProto.handleValidationEvent = function ( event ){
		const instanceRef = this;
		const delay = instanceRef.fetchConfig( 'responseDelay' );

		clearTimeout( instanceRef.validationTimer );
		instanceRef.validationTimer = setTimeout( () => {
			instanceRef.validate(); // Perform validation after delay
		}, delay );
	};

	/**
	 * Validates the input field against its defined rules.
	 * @param {object} [options] - Validation options (e.g., suppressUI, noDelay).
	 * @returns {boolean} True if the field is valid, false otherwise.
	 */
	FormInputFieldProto.validate = function ( options = {} ){
		const instanceRef = this;
		const rules = instanceRef.fetchConfig( 'validationRules' );
		const value = instanceRef.element.value;
		let fieldIsValid = true; // Assume valid initially

		// Basic client-side validation logic (can be expanded)
		if ( rules && rules.required && !value.trim() ) {
			fieldIsValid = false;
		}
		// Add more rules here (e.g., pattern, minLength, maxLength)

		// Update UI based on validation result
		if ( !options.suppressUI ) {
			if ( fieldIsValid ) {
				instanceRef.removeClass( instanceRef.fetchConfig('failureStyle') ).addClass( instanceRef.fetchConfig('successStyle') );
			} else {
				instanceRef.removeClass( instanceRef.fetchConfig('successStyle') ).addClass( instanceRef.fetchConfig('failureStyle') );
			}
		}

		// Update parent form's error count and overall state
		if ( instanceRef.isValid !== fieldIsValid ) {
			instanceRef.isValid = fieldIsValid;
			if ( fieldIsValid ) {
				instanceRef.parent.errorCount = Math.max(0, instanceRef.parent.errorCount - 1);
			} else {
				instanceRef.parent.errorCount++;
			}
			if ( !options.silent ) {
				instanceRef.parent.manageActionButtonState();
			}
		}

		return fieldIsValid;
	};


	/**
	 * FormActionButton class, extending BaseFormControl, for managing form buttons.
	 * @param {FormPilot} parentPilot - The parent FormPilot instance.
	 * @param {HTMLElement} buttonElement - The actual DOM button element.
	 * @constructor
	 * @augments BaseFormControl
	 */
	const FormActionButton = function ( parentPilot, buttonElement ){
		this.parent = parentPilot;
		this.element = buttonElement;
		this.config = PilotUtils.shallowClone( standardSettings );
		this.events = [];

		this.setup();
	};

	const FormActionButtonProto = FormActionButton.prototype = Object.create( BaseFormControlProto );
	FormActionButtonProto.constructor = FormActionButton;

	/**
	 * Sets up the action button, applying initial states and listeners.
	 * @returns {FormActionButton} The current button instance.
	 */
	FormActionButtonProto.setup = function (){
		const instanceRef = this;
		if ( instanceRef.isInitialized ) return instanceRef;

		// Ensure the button is initially enabled unless explicitly disabled by config
		if ( !instanceRef.element.disabled ) {
			instanceRef.enableButton();
		} else {
			instanceRef.disableButton();
		}

		instanceRef.isInitialized = true;
		return instanceRef;
	};

	/**
	 * Enables the button, removing disabled styles.
	 * @returns {FormActionButton} The current button instance.
	 */
	FormActionButtonProto.enableButton = function (){
		this.element.disabled = false;
		this.removeClass( this.fetchConfig('inactiveStyle') );
		return this;
	};

	/**
	 * Disables the button, applying disabled styles.
	 * @returns {FormActionButton} The current button instance.
	 */
	FormActionButtonProto.disableButton = function (){
		this.element.disabled = true;
		this.addClass( this.fetchConfig('inactiveStyle') );
		return this;
	};

	/**
	 * Sets the button to a processing state.
	 * @returns {FormActionButton} The current button instance.
	 */
	FormActionButtonProto.startProcessing = function (){
		this.addClass( this.fetchConfig('processingStyle') );
		this.element.disabled = true; // Disable during processing
		return this;
	};

	/**
	 * Ends the button's processing state.
	 * @returns {FormActionButton} The current button instance.
	 */
	FormActionButtonProto.endProcessing = function (){
		this.removeClass( this.fetchConfig('processingStyle') );
		// Re-enable only if the form's overall state allows it
		if ( this.parent && this.parent.isValid && this.parent.lockCounter === 0 ) {
			this.element.disabled = false;
		}
		return this;
	};

})( window, document );