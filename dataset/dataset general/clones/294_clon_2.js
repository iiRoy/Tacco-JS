(function ( contextWindow, currentDocument, undefinedVal ){

	// action button varieties
	var ACTION_BUTTON_VARIETIES = ['button', 'submit'];
	// all input field types that can be enhanced by FormPilot
	var INPUT_FIELD_VARIETIES = ['text', 'password', 'select-one', 'checkbox', 'textarea', 'range', 'number', 'email', 'hidden', 'file', 'date', 'datetime-local', 'search', 'tel', 'time', 'url', 'month', 'week'];
	// fields that only trigger a 'change' event
	var ON_CHANGE_ONLY = ['checkbox', 'select-one', 'select', 'file'];
	// fields that also trigger a 'change' event
	var CHANGE_ALSO_TRIGGERS = ['number', 'date', 'datetime-local', 'time', 'month', 'week', 'range'];

	// FormPilot configuration settings
	var PILOT_SETTINGS = ['delayDuration', 'requestDelayDuration', 'errorStyle', 'disabledStyle', 'processingStyle', 'validationTrigger', 'submitButtonManagement', 'mainSubmitButton', 'onSubmitAction', 'beforeValidationHook', 'onErrorHook', 'onValidHook', 'eventBeforeValidation', 'eventErrorOccurred', 'eventValidationSuccessful'];
	var INPUT_SETTINGS = ['delayDuration', 'requestDelayDuration', 'dataRequest', 'validStyle', 'errorStyle', 'disabledStyle', 'processingStyle', 'validationRules', 'validationTrigger', 'beforeValidationHook', 'onErrorHook', 'onValidHook', 'isCustom', 'eventBeforeValidation', 'eventErrorOccurred', 'eventValidationSuccessful'];
	var BUTTON_SETTINGS = ['disabledStyle', 'processingStyle'];


	var IS_ENHANCED = 'is-enhanced';

	var standardOptions = {
		errorStyle         : 'input-error',
		processingStyle    : 'input-processing',
		disabledStyle      : 'input-disabled',
		validStyle         : 'input-valid',

		eventBeforeValidation: 'formPilot:before',
		eventErrorOccurred   : 'formPilot:error',
		eventValidationSuccessful: 'formPilot:valid',

		delayDuration       : 0,
		requestDelayDuration: 2000,

		validationTrigger: 'input keyup',

		inputElements : {},
		actionButtons: {},

		submitButtonManagement: true,
		mainSubmitButton       : null
	};

	/**
	 * Main FormPilot constructor
	 * @param formElement - the form DOM element to be enhanced
	 * @param configurationOptions - FormPilot configuration settings
	 * @returns {FormPilot}
	 */
	var FormPilot = function ( formElement, configurationOptions ){
		if ( !(this instanceof FormPilot) ) {
			return new FormPilot( formElement, configurationOptions );
		}

		var currentInstance = this;
		// our primary form DOM element
		currentInstance.targetForm = (function ( formElement ){
			formElement = typeof(formElement) === 'string' ? currentDocument.forms[formElement] : formElement;
			return __isFormElement( formElement ) ? formElement : null;
		})( formElement );

		var myTargetForm = currentInstance.targetForm;
		if ( currentInstance.targetForm === null ) {
			return null;
		}

		if ( !__getDomAttribute( myTargetForm, IS_ENHANCED ) ) {
			__setDomAttribute( myTargetForm, IS_ENHANCED, 1 );
			__setDomAttribute( myTargetForm, 'novalidate', 'novalidate' );
		} else {
			var cachedInstance = (function (){
				for ( var i = 0, cacheLength = currentInstance.instanceCache.length; i < cacheLength; i++ ) {
					if ( currentInstance.instanceCache[i].targetForm == myTargetForm ) {
						return currentInstance.instanceCache[i];
					}
				}
				return null;
			})();
			if ( cachedInstance ) {
				var alreadyInitialized = cachedInstance.isInitialized;
				cachedInstance.updateSettings( configurationOptions );
				return cachedInstance;
			}
		}
		currentInstance.settings = (currentInstance.settings || __deepCopy( standardOptions ));
		currentInstance.updateSettings( configurationOptions );

		currentInstance.initializePilot();
		currentInstance.instanceCache.push( currentInstance );
		return currentInstance;
	};
	var pilotPrototype = FormPilot.prototype;
	pilotPrototype.instanceCache = [];


	pilotPrototype.initializePilot = function (){
		var currentInstance = this;
		if ( currentInstance.isInitialized ) {
			return currentInstance;
		}

		currentInstance.inputElements = {};
		currentInstance.actionButtons = {};

		currentInstance.isInitialized = true;

		currentInstance.isLocked = 0;
		currentInstance.isHeld = 0;
		currentInstance.invalidCount = 0;
		currentInstance.isValid = true;

		currentInstance.inputElements = {};
		currentInstance.actionButtons = {};

		// AJAX request handling
		currentInstance.ajaxRequests = {};
		currentInstance.ajaxTimeouts = {};

		var mainButton = currentInstance.getSetting( 'mainSubmitButton' );
		if ( mainButton ) {
			currentInstance.actionButtons['submit'] = new FormButton( currentInstance, mainButton );
		}

		for ( var i = 0, formLength = currentInstance.targetForm.length; i < formLength; i++ ) {
			var domElement = currentInstance.targetForm[i],
				elementType = domElement.type,
				elementName = elementType !== 'button' ? __getDomAttribute( domElement, 'name' ) : __getStoredData( domElement, 'check' );

			if ( __contains( INPUT_FIELD_VARIETIES, elementType ) !== -1 && elementName ) {
				currentInstance.inputElements[elementName] = new FormInput( currentInstance, domElement );
			}

			if ( __contains( ACTION_BUTTON_VARIETIES, elementType ) !== -1 ) {
				elementName = (elementType == 'submit') ? elementType : elementName;
				if ( elementName && !(elementName == 'submit' && currentInstance.actionButtons[elementName]) ) {
					currentInstance.actionButtons[elementName] = new FormButton( currentInstance, domElement );
				}
			}
		}

		currentInstance.targetForm.onsubmit = (function ( pilotInstance ){
			return function ( submitEvent ){
				submitEvent = submitEvent || contextWindow.event;

				var submitBtn = pilotInstance.getButton( 'submit' ),
					btnControlEnabled = pilotInstance.getSetting( 'submitButtonManagement' ),
					submitActionIsFunction = typeof pilotInstance.getSetting( 'onSubmitAction' ) == 'function',
					shouldPreventDefault = pilotInstance.isValid && submitActionIsFunction;

				// prevent double submission
				if ( (submitBtn.getSetting( 'processingStyle' ) && submitBtn.hasCssClass( submitBtn.getSetting( 'processingStyle' ) )) || pilotInstance.isLocked ) {
					__preventEventDefault( submitEvent );
					return false;
				}

				if ( shouldPreventDefault ) {
					__preventEventDefault( submitEvent );
				}
				if ( pilotInstance.isValid ) {
					if ( btnControlEnabled ) {
						submitBtn.setProcessing( true );
					}
					if ( submitActionIsFunction ) {
						pilotInstance.executeFunction( pilotInstance.targetForm, 'onSubmitAction', [submitEvent, pilotInstance] );
					}
				}
				if ( shouldPreventDefault ) {
					return false;
				}

				try {
					if ( !pilotInstance.isValid && !pilotInstance.performValidation( { no_delay: true } ) ) {
						__preventEventDefault( submitEvent );
						submitBtn.setProcessing( false );
						return false;
					}

					if ( submitActionIsFunction ) {
						__preventEventDefault( submitEvent );
						pilotInstance.executeFunction( pilotInstance.targetForm, 'onSubmitAction', [submitEvent, pilotInstance] );
						return false;
					}
					pilotInstance.targetForm.submit();
					return true;

				} catch ( error ) {
				}
			};
		})( currentInstance );


		currentInstance.performValidation( {
			highlightErrors : false,
			triggerEvents: false,

			silentMode: true
		} );
		return currentInstance.manageSubmitButton();
	};


	pilotPrototype.destroyPilot = function (){
		var currentInstance = this;
		for ( var elementName in currentInstance.inputElements ) {
			currentInstance.inputElements[elementName].destroyElement();
		}
		for ( var elementName in this.actionButtons ) {
			currentInstance.actionButtons[elementName].destroyElement();
		}
		currentInstance.isInitialized = false;
		return currentInstance;
	};

	// function for resetting options to defaults
	pilotPrototype.resetOptions = function (){
		var currentInstance = this,
			inputFieldReferences = currentInstance.inputElements,
			actionButtonReferences = currentInstance.actionButtons;
		currentInstance.destroyPilot();
		currentInstance.updateSettings( __deepCopy( standardOptions ) );
		for ( var elementName in inputFieldReferences ) {
			inputFieldReferences[elementName].resetElementOptions();
		}
		for ( var elementName in actionButtonReferences ) {
			actionButtonReferences[elementName].resetElementOptions();
		}
		currentInstance.isLocked = 0;
		return currentInstance.initializePilot();
	};

	pilotPrototype.performValidation = function ( validationOptions ){
		var currentInstance = this,
			inputFieldReferences = currentInstance.inputElements,
			validationErrors = 0;

		for ( var fieldKey in inputFieldReferences ) {
			validationErrors += (inputFieldReferences[fieldKey].validateElement( validationOptions || {} )) ? 0 : 1;
		}
		currentInstance.invalidCount = validationErrors;
		currentInstance.isValid = validationErrors === 0;
		return validationErrors === 0;
	};


	pilotPrototype.toObject = function (){
		var currentInstance = this,
			formFields = currentInstance.targetForm,
			dataObject = {};

		for ( var i = 0, fieldLength = formFields.length; i < fieldLength; i++ ) {
			var domElement = formFields[i],
				elementName = __getDomAttribute( domElement, 'name' );
			if ( domElement.type == 'checkbox' ) {
				dataObject[elementName] = domElement.checked;
			} else if ( domElement.type == 'radio' ) {
				if ( !dataObject[elementName] ) {
					dataObject[elementName] = '';
				}
				if ( domElement.checked ) {
					dataObject[elementName] = domElement.value;
				}
			} else if (domElement.type !== 'submit' && domElement.type !== 'button'){
				dataObject[elementName] = domElement.value;
			}
		}
		return dataObject;
	};

	pilotPrototype.getSetting = function ( settingName ){
		return this.settings[settingName];
	};

	pilotPrototype.updateSettings = function ( newOptions ){
		var currentInstance = this,
			wasInitialized = currentInstance.isInitialized;
		if ( wasInitialized ) {
			currentInstance.destroyPilot();
		}
		currentInstance.settings = __mergeObjects( currentInstance.settings, newOptions );
		if ( wasInitialized ) {
			currentInstance.initializePilot();
		}
		return currentInstance;
	};

	/**
	 * Get input field object to interact with
	 * @param {string} fieldIdentifier - name of the field
	 * @returns {*} - FormInput Object
	 */
	pilotPrototype.getInput = function ( fieldIdentifier ){
		return this.inputElements[fieldIdentifier];
	};

	/**
	 * Get button object to interact with
	 * @param {string} buttonIdentifier - name of the button
	 * @returns {*} - FormButton Object
	 */
	pilotPrototype.getButton = function ( buttonIdentifier ){
		return this.actionButtons[buttonIdentifier];
	};

	/**
	 * Overwrite the default form submit function with a custom one
	 * (the browser's native form submit will be prevented)
	 * @param {function} submitHandler - function to execute on form submission
	 * @returns {*}
	 */
	pilotPrototype.setSubmitHandler = function ( submitHandler ){
		var currentInstance = this;
		if ( !currentInstance.settings ) {
			return currentInstance;
		}
		if ( typeof submitHandler == 'function' ) {
			currentInstance.settings.onSubmitAction = submitHandler;
		}
		return currentInstance;
	};

	/**
	 * Form Submit button control function
	 * (enabling/disabling based on validation status)
	 * @param {!boolean} formValidity - indicates if the current form is valid
	 * @returns {*}
	 */
	pilotPrototype.manageSubmitButton = function ( formValidity ){
		var currentInstance = this,
			submitBtn = currentInstance.getButton( 'submit' ),
			btnControlEnabled = currentInstance.getSetting( 'submitButtonManagement' );

		currentInstance.isValid = (currentInstance.invalidCount === 0 && currentInstance.isHeld === 0 && currentInstance.isLocked === 0);
		formValidity = (formValidity === false || formValidity === true) ? formValidity : currentInstance.isValid;

		if ( submitBtn && btnControlEnabled ) {
			submitBtn[(formValidity) ? 'enableButton' : 'disableButton']();
		}
		return currentInstance;
	};
	/**
	 * Disable the submit button
	 * @returns {*}
	 */
	pilotPrototype.disableSubmit = function (){
		return this.manageSubmitButton( false );
	};
	/**
	 * Enable the submit button
	 * @returns {*}
	 */
	pilotPrototype.enableSubmit = function (){
		return this.manageSubmitButton( true );
	};

	/**
	 * Submit button processing state control
	 * @returns {*}
	 */
	pilotPrototype.setProcessingState = function ( processingAction ){
		var currentInstance = this,
			submitBtn = currentInstance.getButton( 'submit' );
		if ( submitBtn ) {
			submitBtn.setProcessing( processingAction );
		}
		return currentInstance;
	};

	/**
	 * Lock the form, preventing submission
	 * @returns {*}
	 */
	pilotPrototype.lockForm = function ( lockAmount ){
		var currentInstance = this;
		currentInstance.isLocked += lockAmount || 1;
		return currentInstance.manageSubmitButton( false );
	};

	/**
	 * Unlock the form, allowing submission
	 * @returns {*}
	 */
	pilotPrototype.unlockForm = function ( unlockAmount ){
		var currentInstance = this;
		currentInstance.isLocked -= unlockAmount || 1;
		return currentInstance.manageSubmitButton();
	};

	/**
	 * Execute a specified function
	 * @param executionContext
	 * @param functionRef
	 * @param functionParameters
	 * @returns {*}
	 */
	pilotPrototype.executeFunction = function ( executionContext, functionRef, functionParameters ){
		var currentInstance = this;
		if ( typeof functionRef == 'string' ) {
			functionRef = currentInstance.getSetting( functionRef );
		}
		if ( typeof functionRef == 'function' ) {
			return functionRef.apply( executionContext, (functionParameters || []) );
		}
		return null;
	};

	contextWindow.FormPilot = FormPilot;


	/**
	 * Base form element constructor
	 * @returns {*}
	 * @constructor
	 */
	var FormElement = function (){
	};
	var ElementPrototype = FormElement.prototype;
	ElementPrototype.destroyElement = function (){
		var currentInstance = this,
			domElement = this.domElement,
			eventListeners = currentInstance.attachedEvents;

		for ( var i = 0, eventCount = eventListeners.length; i < eventCount; i++ ) {
			currentInstance.removeEventListener( eventListeners[0][0], eventListeners[0][1] );
		}

		currentInstance.removeCssClass( currentInstance.getSetting( 'errorStyle' ) );
		currentInstance.removeCssClass( currentInstance.getSetting( 'disabledStyle' ) );
		currentInstance.removeCssClass( currentInstance.getSetting( 'processingStyle' ) );

		__setStoredData( domElement, 'is-held', null );
		__setStoredData( domElement, 'has-error', null );
		// clear stored attributes

		if ( currentInstance.elementTimer ) {
			clearTimeout( currentInstance.elementTimer );
		}
		if ( currentInstance.ajaxRequest ) {
			currentInstance.ajaxRequest.abort();
		}
		if ( currentInstance.ajaxRequestTimeout ) {
			clearTimeout( currentInstance.ajaxRequestTimeout );
		}

		if ( !currentInstance.isValid ) {
			currentInstance.parentPilot.invalidCount = currentInstance.parentPilot.invalidCount !== 0 ? currentInstance.parentPilot.invalidCount - 1 : 0;
		}

		currentInstance.parentPilot.manageSubmitButton();

		currentInstance.isInitialized = false;
		return currentInstance;
	};

	ElementPrototype.resetElementOptions = function (){
		return this.updateSettings( __deepCopy( standardOptions ) );
	};

	ElementPrototype.updateSettings = function ( newOptions ){
		var currentInstance = this,
			elementName = __getDomAttribute( currentInstance.domElement, 'name' ),
			_applySetting = function ( key, value ){
				currentInstance.config[key] = value;
				if ( !currentInstance.parentPilot.settings.inputElements[elementName] ) {
					currentInstance.parentPilot.settings.inputElements[elementName] = __deepCopy( standardOptions );
				}
				currentInstance.parentPilot.settings.inputElements[elementName][key] = value;
			},
			wasInitialized = currentInstance.isInitialized;

		if ( wasInitialized ) {
			currentInstance.destroyElement();
		}
		for ( var key in newOptions ) {
			if ( ~__contains( INPUT_SETTINGS, key ) ) {
				_applySetting( key, newOptions[key] );
			}
		}
		if ( wasInitialized ) {
			currentInstance.initializeElement();
		}
		return currentInstance;
	};

	ElementPrototype.getSetting = function ( settingName ){
		return this.config[settingName];
	};

	/**
	 * Subscribe this.domElement to a specific event
	 * @param {string} eventName - name of the event
	 * @param {function} handlerFunction - function to execute when the event occurs
	 * @param {object} targetElement - DOM element to attach the event to
	 * @returns {*}
	 */