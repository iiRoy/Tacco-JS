/*
This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

( function( jq, globalScope, domRef ){
	'use strict';

	// Internal collection of plugin operations
	const pluginActions = {
		/**
		 * Registers a new notification event listener and appends the alert to the DOM.
		 * @param {object} configParams - Configuration parameters for the notification.
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		registerNotification : function( configParams ){
			let alertContainer; // The actual DOM element holding the alert
			const contextElement = this; // Reference to the jQuery object on which the plugin was called

			// Merge user-provided settings with default notification options
			configParams = { ...defaultNotificationSettings, ...configParams };

			// Determine the UI framework to use based on configuration
			let currentFrameworkKey = 'customEnvelope'; // Default framework
			const configuredUiSystem = currentConfig.uiSystem.toLowerCase();

			if (configuredUiSystem.startsWith('jqueryui')) {
				currentFrameworkKey = 'jQueryUI';
			} else if (configuredUiSystem.startsWith('bootstrap')) {
				currentFrameworkKey = 'Bootstrap';
			} else if (configuredUiSystem.startsWith('foundation')) {
				currentFrameworkKey = 'FoundationFramework';
			}
			// No explicit else for 'customEnvelope' as it's the default

			// Create the visual alert element using the determined framework
			alertContainer = createVisualAlert(
				currentFrameworkKey,
				configParams.alertType,
				configParams.message,
				configParams.showCloseControl
			);
			
			// Initially hide the alert, it will be faded in later
			alertContainer.css('display', 'none'); 

			// Bind the event handler to the document, listening for the specified event name
			jq( domRef ).on( configParams.eventName, function( evt, additionalContent ){

				// If additional content is provided, append it to the existing message
				if( additionalContent ){
					const messageSpan = alertContainer.find( ".message" );
					messageSpan.append( ` ${additionalContent}` );
				}

				// Append the alert to the target element and fade it in
				contextElement.append( alertContainer );
				alertContainer.fadeIn( 'slow' );

				// If auto-dismiss is enabled, set a timeout to fade out and remove the alert
				if( configParams.autoDismiss ){
					const dismissTimer = globalScope.setTimeout( () => {
						alertContainer.fadeOut( 'slow', function(){
							jq( this ).remove(); // Remove the element from the DOM after fade out
						});
						globalScope.clearTimeout( dismissTimer ); // Clear the timeout
					}, currentConfig.dismissDelayMs );
				}

				// Execute the callback function if provided and is a function
				if( typeof configParams.completionCallback === 'function' ){
					configParams.completionCallback();
				}
			});

			return this; // Enable method chaining
		},

		/**
		 * Deregisters a notification event listener from the document.
		 * @param {string} eventIdentifier - The name of the event to deregister.
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		deregisterNotification : function( eventIdentifier ){
			// Remove all event handlers for the specified event identifier on the document
			return jq( domRef ).off( eventIdentifier );
		}
	};
	
	// Object to hold currently registered event configurations
	let registeredEvents = {};
	// Global configuration for the plugin instance
	let currentConfig;

	// Default settings for the entire plugin
	const pluginDefaultSettings = {
		uiSystem : 'none', // Specifies which UI framework to use (e.g., 'jqueryui', 'bootstrap', 'foundation', 'customenvelope')
		dismissDelayMs : 5000, // Default duration for auto-closing notifications in milliseconds
		enableLogging : false // New: Flag to enable console logging for debugging
	};

	// Default settings for individual notification events
	const defaultNotificationSettings = {
		alertType : 'info', // Type of alert: 'info', 'error', 'success'
		autoDismiss : false, // Whether the alert should automatically close
		showCloseControl : false, // Whether a close button should be displayed
		completionCallback : undefined, // Function to call after the alert is processed
		eventName: 'defaultEvent' // Default event name if not provided
	};

	// UI element templates and classes for various frameworks
	const uiComponentTemplates = {
		jQueryUI : {
			templateHtml : '<p><span class="ui-icon" style="float: left; margin-right: .3em;"></span>' + '<span class="message"></span></p>',
			successCssClass : 'ui-icon-info',
			errorCssClass : 'ui-icon-error',
			infoCssClass : 'ui-icon-info',
			closeButtonHtml : '<a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button"><span class="ui-icon ui-icon-closethick" style="float: right">close</span></a>',
			insertionTargetSelector : 'span:first',
			bindCloseAction : function( ){
				jq( this ).on( 'click', function(){
					jq( this ).closest('p').fadeOut( 'slow' ); // Find the closest parent 'p' element
				});
			}
		},
		Bootstrap : {
			templateHtml : '<div class="alert"><span class="message"></span></div>',
			successCssClass : 'alert-success',
			errorCssClass : 'alert-danger', // Changed from alert-error for Bootstrap 3/4/5
			infoCssClass : 'alert-info',
			closeButtonHtml : '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>', // Updated for modern Bootstrap
			insertionTargetSelector : null,
			bindCloseAction : function( ){
				jq( this ).on( 'click', function(){
					jq( this ).parent().fadeOut( 'slow' );
				});
			}
		},
		FoundationFramework : { // Renamed for clarity
			templateHtml : '<div class="alert-box"><span class="message"></span></div>',
			successCssClass : 'success',
			errorCssClass : 'alert',
			infoCssClass : null, // Foundation often uses 'secondary' for info, or no specific class
			closeButtonHtml : '<a href="#" class="close">x</a>',
			insertionTargetSelector : null,
			bindCloseAction : function( ){
				jq( this ).on( 'click', function(){
					jq( this ).parent().fadeOut( 'slow' );
				});
			}
		},
		CustomEnvelope : { // Renamed for clarity
			templateHtml : '<div class="env_container"><span class="message"></span></div>', // Removed 'Hello World' default message
			successCssClass : 'success',
			errorCssClass : 'error',
			infoCssClass : 'info', // Added info class for custom envelope
			closeButtonHtml : '<div class="close">&times;</div>',
			insertionTargetSelector : null,
			bindCloseAction : function( ){
				jq( this ).on( 'click', function(){
					jq( this ).parent().fadeOut( 'slow' );
				});
			}
		}
	};

	/**
	 * Creates a new alert element based on the specified framework and message details.
	 * @param {string} systemKey - The key of the UI framework to use (e.g., 'jQueryUI').
	 * @param {string} alertVariant - The type of alert ('info', 'error', 'success').
	 * @param {string} displayMessage - The message content for the alert.
	 * @param {boolean} includeDismissButton - Whether to add a close button.
	 * @returns {jQuery} The newly created jQuery alert element.
	 */
	const createVisualAlert = function( systemKey, alertVariant, displayMessage, includeDismissButton ){

		const templateConfig = uiComponentTemplates[ systemKey ];
		if (!templateConfig) {
			console.error(`Notifier: Unknown UI system key: ${systemKey}. Falling back to CustomEnvelope.`);
			systemKey = 'CustomEnvelope'; // Fallback
			templateConfig = uiComponentTemplates[systemKey];
		}

		const alertElement = jq( templateConfig.templateHtml );
		const targetSelector = templateConfig.insertionTargetSelector;
		let targetContainer = alertElement; // Default target is the alert itself

		// If a specific selector for adding classes is defined, use it
		if( typeof targetSelector === 'string' && targetSelector.length > 0 ){
			targetContainer = alertElement.find( targetSelector );
		}

		// Apply appropriate CSS class based on alert type
		switch (alertVariant) {
			case 'error':
				targetContainer.addClass( templateConfig.errorCssClass );
				break;
			case 'info':
				if( templateConfig.infoCssClass ){
					targetContainer.addClass( templateConfig.infoCssClass );
				}
				break;
			case 'success':
			default: // Default to success if type is unknown or not specified
				targetContainer.addClass( templateConfig.successCssClass );
				break;
		}

		// If a close button is requested, create and append it
		if( includeDismissButton ){
			const dismissBtn = jq( templateConfig.closeButtonHtml ).clone();

			// Bind the close action if defined for the framework
			if( templateConfig.bindCloseAction ){
				templateConfig.bindCloseAction.call( dismissBtn );
			}

			alertElement.prepend( dismissBtn ); // Prepend for better accessibility, usually close button is first
		}

		// Set the message content
		alertElement.find( '.message' ).html( displayMessage );

		return alertElement;
	};

	/**
	 * Main plugin method for initializing, configuring, and interacting with the notifier.
	 * @param {string|object|Array} inputOptions - Method name (string), plugin options (object), or event definitions (array).
	 * @param {Array} [eventDefinitions] - An array of event configurations if inputOptions is an object.
	 * @returns {jQuery} The jQuery object for chaining.
	 */
	jq.fn.notifier = function( inputOptions, eventDefinitions ){
		const callerContext = this;
		let methodName;

		// Handle method calls (e.g., `$(...).notifier('deregisterNotification', 'myEvent')`)
		if( typeof inputOptions === 'string' && pluginActions[inputOptions] ){
			methodName = inputOptions;
			// Apply the method with arguments, excluding the method name itself
			return pluginActions[ methodName ].apply( callerContext, Array.prototype.slice.call( arguments, 1 ) );
		}
		// If inputOptions is an array, it means event definitions are passed directly without global options
		else if( Array.isArray( inputOptions ) ){
			eventDefinitions = inputOptions;
		}

		// Merge new event definitions with existing ones
		registeredEvents = { ...registeredEvents, ...eventDefinitions };
		
		// If inputOptions is an object, it represents global plugin configurations
		if( typeof inputOptions === 'object' && inputOptions !== null ){
			currentConfig = { ...pluginDefaultSettings, ...inputOptions };
		} else {
			// Initialize with defaults if no options object is provided
			currentConfig = { ...pluginDefaultSettings };
		}

		// Validate and process the array of event definitions
		if( Array.isArray( eventDefinitions ) && eventDefinitions.length > 0 ){
			// Iterate over each event configuration
			eventDefinitions.forEach( eventObject => {
				// Ensure the event object is valid and has an eventName property
				if( typeof eventObject === 'object' && eventObject !== null && 'eventName' in eventObject ){
					// Register each notification using the internal add method
					pluginActions.registerNotification.call( callerContext, eventObject );
				} else if (currentConfig.enableLogging) {
					console.warn('Notifier: Invalid event definition encountered:', eventObject);
				}
			});
		} else if (currentConfig.enableLogging && eventDefinitions && eventDefinitions.length === 0) {
			console.info('Notifier: No event definitions provided to initialize.');
		}
	
		return this; // Allow jQuery method chaining
	};
}( jQuery, window, window.document ) );