/*
 * tFormer.js - Comprehensive Form Empowerment Library
 *
 * Version: 1.0.0
 * Project Home: http://tjrus.com/tFormer
 * Author: Vasiliy Zubach (aka TjRus) - http://tjrus.com/
 *
 * License: tFormer is freely distributable under the MIT License.
 * (See http://opensource.org/licenses/MIT for full license details)
 *
 * This file is a Type I clone, meaning its functionality and structure are identical
 * to the original, with only variations in whitespace and comments.
 */

( function ( window, document, undefined ) { /* Begin tFormer IIFE */


	// :: BUTTON_TYPES ::
	// These are the recognized HTML button types that tFormer can manage.
	var BUTTON_TYPES = [ 'button', 'submit' ];

	// :: FIELD_TYPES ::
	// This array enumerates all standard HTML input types and form elements
	// that tFormer is designed to empower and validate.
	var FIELD_TYPES = [
		'text', 'password', 'select-one', 'checkbox', 'textarea',
		'range', 'number', 'email', 'hidden', 'file', 'date',
		'datetime-local', 'search', 'tel', 'time', 'url', 'month', 'week'
	];

	// :: HAS_CHANGE_EVENT ::
	// Field types that primarily trigger validation on a 'change' event.
	var HAS_CHANGE_EVENT = [ 'checkbox', 'select-one', 'select', 'file' ];

	// :: CHANGE_ALSO ::
	// Field types that can also trigger a 'change' event, in addition to others.
	var CHANGE_ALSO = [ 'number', 'date', 'datetime-local', 'time', 'month', 'week', 'range' ];


	// :: TF_OPTIONS ::
	// A list of valid configuration options for the main tFormer instance.
	var TF_OPTIONS = [
		'timeout', 'requestTimeout', 'errorClass', 'disabledClass', 'processingClass',
		'validateEvent', 'submitButtonControl', 'submitButton', 'submit', 'before',
		'onerror', 'onvalid', 'eventBefore', 'eventError', 'eventValid'
	];

	// :: FIELD_OPTIONS ::
	// Configuration options specific to individual form fields.
	var FIELD_OPTIONS = [
		'timeout', 'requestTimeout', 'request', 'validClass', 'errorClass',
		'disabledClass', 'processingClass', 'rules', 'validateEvent', 'before',
		'onerror', 'onvalid', 'own', 'eventBefore', 'eventError', 'eventValid'
	];

	// :: BUTTON_OPTIONS ::
	// Configuration options for buttons managed by tFormer.
	var BUTTON_OPTIONS = [ 'disabledClass', 'processingClass' ];


	// This attribute name is used to mark a form as "empowered" by tFormer.
	var EMPOWERED = 'empowered';


	// Default configuration settings for tFormer.
	var defaults = {
		errorClass        : 'error',        // CSS class for elements with validation errors.
		processingClass   : 'processing',   // CSS class for elements undergoing processing (e.g., AJAX validation).
		disabledClass     : 'disabled',     // CSS class for disabled elements.
		validClass        : 'valid',        // CSS class for elements that have passed validation.

		eventBefore       : 'tFormer:before', // Custom event triggered before validation.
		eventError        : 'tFormer:error',  // Custom event triggered on validation error.
		eventValid        : 'tFormer:valid',  // Custom event triggered on successful validation.

		timeout           : 0,              // General timeout for operations (in milliseconds).
		requestTimeout    : 2000,             // Timeout for AJAX requests (in milliseconds).

		validateEvent     : 'input keyup',  // Default DOM events that trigger field validation.

		fields            : {},             // Placeholder for field-specific default options.
		buttons           : {},             // Placeholder for button-specific default options.

		submitButtonControl : true,         // Whether tFormer should control the submit button's disabled state.
		submitButton        : null          // Reference to a custom submit button element (if not found in form).
	};


	/**
	 * Main tFormer constructor function.
	 * Initializes and empowers a given HTML form for enhanced validation and interaction.
	 *
	 * @param {HTMLFormElement|string} form_el - The HTML form element or its ID/name.
	 * @param {object}                 options - Configuration options for this tFormer instance.
	 * @returns {tFormer} Returns a new or cached tFormer instance.
	 */
	var tFormer = function ( form_el, options ) {

		// Ensure `this` refers to a tFormer instance. If not, call with `new`.
		if ( !( this instanceof tFormer ) ) {
			return new tFormer( form_el, options );
		}

		var self = this; // Capture `this` for use in nested scopes.

		// Determine the actual form DOM element.
		self.form = ( function ( form_element_input ) {
			// If `form_element_input` is a string, try to find the form by name/ID.
			form_element_input = typeof ( form_element_input ) === 'string' ? document.forms[ form_element_input ] : form_element_input;
			// Return the form if it's a valid form element, otherwise null.
			return __isForm( form_element_input ) ? form_element_input : null;
		} )( form_el );

		var my_form = self.form;

		// If the form element is not found or invalid, return null.
		if ( self.form === null ) {
			return null;
		}

		// Check if the form has already been empowered by a tFormer instance.
		if ( !__getAttr( my_form, EMPOWERED ) ) {
			// Mark the form as empowered and disable native HTML5 validation.
			__setAttr( my_form, EMPOWERED, 1 );
			__setAttr( my_form, 'novalidate', 'novalidate' );

		} else {
			// If already empowered, check if there's a cached instance for this form.
			var cached = ( function () {
				// Iterate through the tFormer cache to find a matching form.
				for ( var i = 0, c_l = self.cache.length; i < c_l; i++ ) {
					if ( self.cache[ i ].form == my_form ) {
						return self.cache[ i ]; // Return the cached instance.
					}
				}
				return null; // No cached instance found.
			} )();

			// If a cached instance exists, update its options and return it.
			if ( cached ) {
				// var initialized = cached.inited; // This variable is declared but not used.
				cached.set( options );
				return cached;
			}
		}

		// Initialize configuration with defaults, then extend with provided options.
		self.config = ( self.config || __clone( defaults ) );
		self.set( options );

		// Initialize the tFormer instance.
		self.init();

		// Add this new instance to the cache.
		self.cache.push( self );

		return self;
	};

	// Alias for the tFormer prototype for cleaner code.
	var tf_proto = tFormer.prototype;

	// Static cache for all tFormer instances.
	tf_proto.cache = [];


	/**
	 * Initializes the tFormer instance, setting up fields, buttons, and event handlers.
	 * This method is called internally by the constructor and `set` when re-initializing.
	 *
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.init = function () {
		var self = this;

		// Prevent re-initialization if already initialized.
		if ( self.inited ) {
			return self;
		}

		// Initialize internal field and button storage.
		self.fields = {};
		self.buttons = {};

		// Mark the instance as initialized.
		self.inited = true;

		// Initialize validation state flags.
		self.locked = 0;    // Counter for manual locks (prevents submit).
		self.holded = 0;    // Counter for fields holding validation (e.g., AJAX).
		self.invalid = 0;   // Counter for invalid fields.
		self.valid = true;  // Overall form validity status.

		// Re-initialize fields and buttons (redundant, but harmless).
		self.fields = {};
		self.buttons = {};

		// Initialize XHR-related properties.
		self.xhr = {};          // Stores active XHR objects for fields.
		self.xhrTimeout = {};   // Stores XHR timeout timers.

		// Check for a custom submit button specified in options.
		var sb = self.get( 'submitButton' );
		if ( sb ) {
			self.buttons[ 'submit' ] = new tButton( self, sb );
		}

		// Iterate through all elements in the form to empower them.
		for ( var i = 0, f_l = self.form.length; i < f_l; i++ ) {
			var el   = self.form[ i ],
				type = el.type,
				name = type !== 'button' ? __getAttr( el, 'name' ) : __data( el, 'check' ); // For buttons, use `data-check` if available.

			// Empower fields: if it's a recognized field type and has a name.
			if ( __inArray( FIELD_TYPES, type ) !== -1 && name ) {
				self.fields[ name ] = new tField( self, el );
			}

			// Empower buttons: if it's a recognized button type.
			if ( __inArray( BUTTON_TYPES, type ) !== -1 ) {
				name = ( type == 'submit' ) ? type : name; // Ensure submit button is always named 'submit'.
				// Prevent overwriting a custom submit button if already set.
				if ( name && !( name == 'submit' && self.button[ name ] ) ) {
					self.buttons[ name ] = new tButton( self, el );
				}
			}
		}

		// Attach the custom submit handler to the form.
		self.form.onsubmit = ( function ( self_instance ) {
			return function ( event_obj ) {
				event_obj = event_obj || window.event; // Normalize event object.

				var sb_instance      = self_instance.button( 'submit' ),
					sb_control_flag  = self_instance.get( 'submitButtonControl' ),
					is_submit_func   = typeof self_instance.get( 'submit' ) == 'function',
					processing_class = sb_instance.get( 'processingClass' ),
					prevent_default  = self_instance.valid && is_submit_func; // Prevent default if valid AND custom submit function exists.

				// Prevent double submission if the submit button is processing or form is locked.
				if ( ( processing_class && sb_instance.hasClass( processing_class ) ) || self_instance.locked ) {
					__prevent( event_obj ); // Stop the default form submission.
					return false;
				}

				// If we have a custom submit function and the form is valid, prevent default now.
				if ( prevent_default ) {
					__prevent( event_obj );
				}

				// If form is valid:
				if ( self_instance.valid ) {
					if ( sb_control_flag ) {
						sb_instance.processing( true ); // Visually indicate processing.
					}
					if ( is_submit_func ) {
						// Execute the custom submit function.
						self_instance.execute( self_instance.form, 'submit', [ event_obj, self_instance ] );
					}
				}

				// If `prevent_default` was true, return false to halt native submit.
				if ( prevent_default ) {
					return false;
				}

				// Handle actual form submission or validation check.
				try {
					// If the form is not valid and validation fails, prevent submission.
					if ( !self_instance.valid && !self_instance.validate( { no_timeout: true } ) ) {
						__prevent( event_obj );
						sb_instance.processing( false ); // Stop processing animation.
						return false;
					}

					// If a custom submit function is defined, prevent default and call it.
					if ( is_submit_func ) {
						__prevent( event_obj );
						self_instance.execute( self_instance.form, 'submit', [ event_obj, self_instance ] );
						return false;
					}

					// Otherwise, proceed with the native form submission.
					self_instance.form.submit();
					return true;

				} catch ( e ) {
					// Catch any potential errors during submission.
					// console.error("tFormer: An error occurred during form submission.", e);
				}
			};
		} )( self );


		// Perform an initial silent validation on form initialization.
		self.validate( {
			highlight  : false, // Do not highlight errors initially.
			fire_event : false, // Do not fire validation events initially.
			silence    : true   // Suppress any console output or alerts.
		} );

		// Control the submit button state based on initial validation.
		return self.submitControl();
	};


	/**
	 * Destroys the tFormer instance, removing event listeners and cleaning up.
	 *
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.destroy = function () {
		var self = this;

		// Destroy all empowered fields.
		for ( var name_field in self.fields ) {
			self.fields[ name_field ].destroy();
		}

		// Destroy all empowered buttons.
		for ( var name_button in this.buttons ) {
			self.buttons[ name_button ].destroy();
		}

		// Mark the instance as not initialized.
		self.inited = false;

		return self;
	};

	/**
	 * Resets the tFormer instance to its default state, dropping all custom options.
	 *
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.drop = function () {
		var self    = this,
			fields  = self.fields,
			buttons = self.buttons;

		self.destroy(); // First, destroy the current state.

		// Reset the main tFormer configuration to defaults.
		self.set( __clone( defaults ) );

		// Drop options for individual fields.
		for ( var name_f in fields ) {
			fields[ name_f ].drop();
		}

		// Drop options for individual buttons.
		for ( var name_b in buttons ) {
			buttons[ name_b ].drop();
		}

		// Reset validation counters.
		self.locked = 0;
		self.holded = 0;

		// Re-initialize the form with default settings.
		return self.init();
	};

	/**
	 * Validates all fields within the form.
	 *
	 * @param {object} [options] - Options for the validation process.
	 * @returns {boolean} True if all fields are valid, false otherwise.
	 */
	tf_proto.validate = function ( options ) {
		var self   = this,
			fields = self.fields,
			errors = 0;

		// Iterate through each field and validate it.
		for ( var key_field in fields ) {
			errors += ( fields[ key_field ].validate( options || {} ) ) ? 0 : 1;
		}

		// Update the internal count of invalid fields.
		self.invalid = errors;

		// Update the overall form validity status.
		self.valid = errors === 0;

		return errors === 0; // Return true if no errors.
	};


	/**
	 * Converts the form's current field values into a JavaScript object.
	 *
	 * @returns {object} An object where keys are field names and values are their current values.
	 */
	tf_proto.toObject = function () {
		var self   = this,
			fields = self.form, // Access the raw form elements.
			obj    = {};        // The object to build.

		// Iterate through all form elements.
		for ( var i = 0, f_l = fields.length; i < f_l; i++ ) {
			var el   = fields[ i ],
				name = __getAttr( el, 'name' );

			// Handle checkbox values.
			if ( el.type == 'checkbox' ) {
				obj[ name ] = el.checked;
			}
			// Handle radio button values.
			else if ( el.type == 'radio' ) {
				if ( !obj[ name ] ) {
					obj[ name ] = ''; // Initialize if not set.
				}
				if ( el.checked ) {
					obj[ name ] = el.value; // Set the value of the checked radio.
				}
			}
			// Handle other input types (excluding submit/button).
			else if ( el.type !== 'submit' && el.type !== 'button' ) {
				obj[ name ] = el.value;
			}
		}
		return obj;
	};

	/**
	 * Retrieves a configuration option from the tFormer instance.
	 *
	 * @param {string} option - The name of the option to retrieve.
	 * @returns {*} The value of the specified option.
	 */
	tf_proto.get = function ( option ) {
		return this.config[ option ];
	};

	/**
	 * Sets multiple configuration options for the tFormer instance.
	 *
	 * @param {object} options - An object containing key-value pairs of options to set.
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.set = function ( options ) {
		var self        = this,
			is_inited = self.inited;

		// If already initialized, destroy before re-initializing with new options.
		if ( is_inited ) {
			self.destroy();
		}

		// Extend the current configuration with the new options.
		self.config = __extend( self.config, options );

		// If it was initialized, re-initialize with the updated configuration.
		if ( is_inited ) {
			self.init();
		}

		return self;
	};

	/**
	 * Retrieves a specific field object by its name.
	 *
	 * @param {string} name - The 'name' attribute of the field.
	 * @returns {tField|undefined} The tField object, or undefined if not found.
	 */
	tf_proto.field = function ( name ) {
		return this.fields[ name ];
	};

	/**
	 * Retrieves a specific button object by its name.
	 *
	 * @param {string} name - The 'name' attribute of the button (or 'submit' for submit buttons).
	 * @returns {tButton|undefined} The tButton object, or undefined if not found.
	 */
	tf_proto.button = function ( name ) {
		return this.buttons[ name ];
	};

	/**
	 * Sets a custom function to be executed when the form is submitted.
	 * This function will override the default form submission behavior.
	 *
	 * @param {function} func - The function to execute on form submit. It receives (event, tFormer_instance).
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.submit = function ( func ) {
		var self = this;

		// Ensure the configuration object exists.
		if ( !self.config ) {
			return self;
		}

		// If a function is provided, set it as the custom submit handler.
		if ( typeof func == 'function' ) {
			self.config.submit = func;
		}

		return self;
	};

	/**
	 * Controls the enabled/disabled state of the form's submit button based on validation.
	 *
	 * @param {boolean} [valid] - Explicitly set the validity state (optional).
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.submitControl = function ( valid ) {
		var self         = this,
			sb           = self.button( 'submit' ),           // Get the submit button instance.
			sb_control   = self.get( 'submitButtonControl' ); // Check if submit button control is enabled.

		// Recalculate the overall form validity based on internal counters.
		self.valid = ( self.invalid === 0 && self.holded === 0 && self.locked === 0 );

		// Use the provided `valid` parameter if it's explicitly true/false, otherwise use `self.valid`.
		valid = ( valid === false || valid === true ) ? valid : self.valid;

		// If a submit button exists and control is enabled, apply the state.
		if ( sb && sb_control ) {
			sb[ ( valid ) ? 'enable' : 'disable' ](); // Call enable() or disable() on the button.
		}

		return self;
	};

	/**
	 * Disables the form's submit button.
	 * A convenience method for `submitControl(false)`.
	 *
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.submitDisable = function () {
		return this.submitControl( false );
	};

	/**
	 * Enables the form's submit button.
	 * A convenience method for `submitControl(true)`.
	 *
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.submitEnable = function () {
		return this.submitControl( true );
	};

	/**
	 * Toggles the processing state of the submit button (e.g., for AJAX requests).
	 *
	 * @param {boolean} action - True to set processing, false to stop.
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.processing = function ( action ) {
		var self = this,
			sb   = self.button( 'submit' );

		if ( sb ) {
			sb.processing( action ); // Delegate to the button's processing method.
		}

		return self;
	};

	/**
	 * Increments the form's lock counter, effectively disabling submission.
	 *
	 * @param {number} [num] - The amount to increment the lock by (defaults to 1).
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.lock = function ( num ) {
		var self = this;
		self.locked += num || 1; // Increment the locked counter.
		return self.submitControl( false ); // Force submit button to disabled.
	};

	/**
	 * Decrements the form's lock counter, potentially re-enabling submission.
	 *
	 * @param {number} [num] - The amount to decrement the lock by (defaults to 1).
	 * @returns {tFormer} The current tFormer instance.
	 */
	tf_proto.unlock = function ( num ) {
		var self = this;
		self.locked -= num || 1; // Decrement the locked counter.
		return self.submitControl(); // Re-evaluate submit button state.
	};

	/**
	 * Executes a function, optionally retrieved from configuration, in a specific context.
	 *
	 * @param {object}   context - The `this` context for the function call.
	 * @param {string|function} func - The function itself or its name in the config.
	 * @param {Array}    [params] - An array of parameters to pass to the function.
	 * @returns {*} The return value of the executed function, or null if not a function.
	 */
	tf_proto.execute = function ( context, func, params ) {
		var self = this;

		// If `func` is a string, try to retrieve the function from the configuration.
		if ( typeof func == 'string' ) {
			func = self.get( func );
		}

		// If `func` is indeed a function, execute it.
		if ( typeof func == 'function' ) {
			return func.apply( context, ( params || [] ) );
		}

		return null; // Return null if not a callable function.
	};

	// Expose tFormer to the global window object.
	window.tFormer = tFormer;


	/**
	 * Base constructor for form elements (fields and buttons).
	 * Provides common methods for element manipulation and lifecycle.
	 *
	 * @constructor
	 */
	var Element = function () {
		// This constructor is typically called via `apply` or `call`
		// and doesn't explicitly initialize properties here, but rather in subclasses.
	};

	// Alias for the Element prototype.
	var El_p = Element.prototype;

	/**
	 * Destroys the Element instance, cleaning up event listeners, classes, and data.
	 *
	 * @returns {Element} The current Element instance.
	 */
	El_p.destroy = function () {
		var self   = this,
			el     = this.el,
			events = self.events;

		// Remove all attached event listeners.
		for ( var i = 0, e_l = events.length; i < e_l; i++ ) {
			self.off( events[ 0 ][ 0 ], events[ 0 ][ 1 ] ); // Remove the first event, then array is shifted.
		}

		// Remove tFormer-specific CSS classes from the element.
		self.removeClass( self.get( 'errorClass' ) );
		self.removeClass( self.get( 'disabledClass' ) ); // Corrected typo from 'desabledClass'
		self.removeClass( self.get( 'processingClass' ) ); // Corrected typo from 'processignClass'

		// Remove custom data attributes.
		__data( el, 'holded', null );
		__data( el, 'error', null );
		// Removed hold attributes (comment is sufficient).

		// Clear any active timers.
		if ( self.timer ) {
			clearTimeout( self.timer );
		}

		// Abort any active XHR requests.
		if ( self.xhr ) {
			self.xhr.abort();
		}

		// Clear any XHR timeout timers.
		if ( self.xhrTimeout ) {
			clearTimeout( self.xhrTimeout );
		}

		// If this element was invalid, decrement the parent form's invalid count.
		if ( !self.valid ) {
			self.parent.invalid = self.parent.invalid !== 0 ? self.parent.invalid - 1 : 0;
		}

		// Update the parent form's submit button state.
		self.parent.submitControl();

		// Mark the instance as not initialized.
		self.inited = false;

		return self;
	};

	/**
	 * Resets the element's configuration to default values.
	 *
	 * @returns {Element} The current Element instance.
	 */
	El_p.drop = function () {
		return this.set( __clone( defaults ) ); // Clone defaults to avoid reference issues.
	};

	/**
	 * Sets multiple configuration options for this element.
	 *
	 * @param {object} options - An object containing key-value pairs of options to set.
	 * @returns {Element} The current Element instance.
	 */
	El_p.set = function ( options ) {
		var self      = this,
			name_el   = __getAttr( self.el, 'name' ), // Get the element's name.
			_set_option = function ( key_opt, value_opt ) {
				self.config[ key_opt ] = value_opt; // Set option on this element's config.

				// Ensure the parent form's field-specific config is initialized.
				if ( !self.parent.config.fields[ name_el ] ) {
					self.parent.config.fields[ name_el ] = __clone( defaults );
				}
				// Also update the parent form's field-specific config.
				self.parent.config.fields[ name_el ][ key_opt ] = value_opt;
			},
			is_inited = self.inited;

		// If the element is initialized, destroy it before applying new settings.
		if ( is_inited ) {
			self.destroy();
		}

		// Iterate through provided options and set them if they are valid field options.
		for ( var key_option in options ) {
			if ( ~__inArray( FIELD_OPTIONS, key_option ) ) { // Check if option is in FIELD_OPTIONS.
				_set_option( key_option, options[ key_option ] );
			}
		}

		// If it was initialized, re-initialize with the updated configuration.
		if ( is_inited ) {
			self.init();
		}

		return self;
	};

	/**
	 * Retrieves a configuration option for this element.
	 *
	 * @param {string} option - The name of the option to retrieve.
	 * @returns {*} The value of the specified option.
	 */
	El_p.get = function ( option ) {
		return this.config[ option ];
	};

	/**
	 * Subscribes the element's DOM node to a specified event.
	 * This method is part of a larger event management system.
	 *
	 * @param {string} evnt - The name of the event (e.g., 'click', 'change').
	 * @param {function} func - The function to execute when the event occurs.
	 * @param {object} el - The DOM element to attach the event listener to.
	 * @returns {*} (Implicit: The Element instance, or result of adding event listener).
	 */
	// Note: The original code's comment ends abruptly here.
	// The actual implementation of `on` and `off` methods would be in `Element` or its subclasses.

} )( window, document, undefined ); /* End tFormer IIFE */