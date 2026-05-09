////////////////////////////////////////////////////////////////////////////////
//
// jQuery Form Plugin - Version: 3.15 (09-SEP-2012)
//
// Required: jQuery v1.3.2 or later
//
// For usage examples and comprehensive documentation, please visit:
//      http://malsup.com/jquery/form/
//
// This project's source code repository can be found at:
//      https://github.com/malsup/form
//
// This plugin is dual licensed under both the MIT and GPL licenses.
// For full license details, refer to:
//      MIT: http://malsup.github.com/mit-license.txt
//      GPL: http://malsup.github.com/gpl-license-v2.txt
//
////////////////////////////////////////////////////////////////////////////////
/*global ActiveXObject alert */
;
( function ( $ ) {
"use strict" ;

/*
 *  IMPORTANT USAGE INFORMATION:
 *  ----------------------------
 *  Please note that `ajaxSubmit` and `ajaxForm` functions are mutually exclusive.
 *  Do not attempt to use both on the same form element.
 *
 *  Use `ajaxSubmit` when you intend to bind your own custom submit handler
 *  to the form. For example, consider the following pattern:
 *
 *  $( document ).ready( function () {
 *      $( '#myForm' ).on( 'submit', function ( e ) {
 *          e.preventDefault(); // Crucial: Prevents the default form submission.
 *          $( this ).ajaxSubmit( {
 *              target: '#output' // Specifies where the response should be loaded.
 *          } );
 *      } );
 *  } );
 *
 *  Conversely, use `ajaxForm` when you prefer the plugin to manage
 *  all necessary event binding for you automatically. For instance:
 *
 *  $( document ).ready( function () {
 *      $( '#myForm' ).ajaxForm( {
 *          target: '#output' // Again, defines the target element for the response.
 *      } );
 *  } );
 *
 *  Additionally, `ajaxForm` supports event delegation (requires jQuery v1.7+).
 *  This allows you to set up form handling even if the form element
 *  does not exist in the DOM at the time `ajaxForm` is called:
 *
 *  $( '#myForm' ).ajaxForm( {
 *      delegation: true,    // Enable delegation mode.
 *      target: '#output'    // Output target.
 *  } );
 *
 *  When `ajaxForm` is employed, the `ajaxSubmit` function will be internally
 *  invoked by the plugin at the appropriate moment during the form submission process.
 */


// --- Feature Detection Block ---
// This section identifies browser capabilities for advanced AJAX features.
var feature = {};

// Checks if the File API is supported by attempting to access `files` property on a file input.
feature.fileapi = $( "<input type='file'/>" ) . get( 0 ) . files !== undefined ;
// Checks for native FormData object support, crucial for XMLHttpRequest Level 2 file uploads.
feature.formdata = window.FormData !== undefined ;


/**
 * Extends jQuery's prototype to include `ajaxSubmit()`.
 * This function provides a direct mechanism for submitting an HTML form using AJAX.
 * It processes form data and handles the submission, potentially using iframes
 * or XMLHttpRequest Level 2 depending on browser capabilities and configuration.
 *
 * @param {Object|Function} options Configuration options for the AJAX submission,
 *                                  or a success callback function.
 * @returns {jQuery} The jQuery object for chaining.
 */
$.fn.ajaxSubmit = function ( options ) {
	/*jshint scripturl:true */

	// Early exit: If no elements are selected, there's nothing to submit.
	// This addresses an issue (http://dev.jquery.com/ticket/2752).
	if ( !this.length ) {
		log( 'ajaxSubmit: Skipping submit process as no element was selected.' ) ;
		return this ;
	}


	var method,                                  // Stores the HTTP method (GET/POST).
		action,                                  // Stores the form's action attribute.
		url,                                     // The target URL for submission.
		$form = this ;                           // Reference to the jQuery form object.

	// If options is a function, assume it's the success callback.
	if ( typeof options == 'function' ) {
		options = { success: options } ;
	}

	// Retrieve form attributes.
	method = this.attr( 'method' ) ;
	action = this.attr( 'action' ) ;

	// Determine the submission URL.
	url = ( typeof action === 'string' ) ? $ . trim( action ) : '' ;
	url = url || window.location.href || '' ; // Fallback to current URL.

	if ( url ) {
		// Clean the URL: remove any hash values to ensure a clean target.
		url = ( url.match( /^([^#]+)/ ) || [] ) [ 1 ] ;
	}

	// Merge default options with user-provided options.
	options = $ . extend( true, {
		url:  url,                               // The URL to submit the form to.
		success: $ . ajaxSettings.success,       // Default success handler.
		type: method || 'GET',                   // Use form's method or default to GET.
		// iframeSrc determines the source for the iframe used in older browsers for file uploads.
		// Uses 'javascript:false' for HTTPS to prevent security warnings, otherwise 'about:blank'.
		iframeSrc: /^https/i.test( window.location.href || '' ) ? 'javascript:false' : 'about:blank'
	}, options ) ;

	// Hook for manipulating form data before extraction and serialization.
	// This is particularly useful for rich text editors (e.g., TinyMCE, FCKEditor)
	// which may need to update their hidden textareas before form submission.
	var veto = {} ;
	this.trigger( 'form-pre-serialize', [ this, options, veto ] ) ;
	if ( veto.veto ) {
		log( 'ajaxSubmit: Submit vetoed via the "form-pre-serialize" trigger.' ) ;
		return this ;
	}

	// Provide an opportunity to alter form data using a `beforeSerialize` callback.
	// If this callback returns `false`, the submission is aborted.
	if ( options.beforeSerialize && options.beforeSerialize( this, options ) === false ) {
		log( 'ajaxSubmit: Submit aborted via the "beforeSerialize" callback.' ) ;
		return this ;
	}

	// Determine if traditional parameter serialization is required.
	// This option is important for compatibility with certain server-side frameworks.
	var traditional = options.traditional ;
	if ( traditional === undefined ) {
		traditional = $ . ajaxSettings.traditional ; // Fallback to global AJAX setting.
	}

	// Initialize an array to store form elements and serialize the form.
	var elements = [] ;
	var qx,                                      // Placeholder for extra data query string.
		a = this.formToArray( options.semantic, elements ) ; // Serialized form data.

	// If `options.data` is provided, treat it as `extraData` and serialize it.
	if ( options.data ) {
		options.extraData = options.data ;
		qx = $ . param( options.data, traditional ) ;
	}

	// Allow a `beforeSubmit` callback to inspect or modify the serialized data
	// and potentially abort the submission.
	if ( options.beforeSubmit && options.beforeSubmit( a, this, options ) === false ) {
		log( 'ajaxSubmit: Submit aborted via the "beforeSubmit" callback.' ) ;
		return this ;
	}

	// Fire a 'form-submit-validate' event, allowing validation logic to veto submission.
	this.trigger( 'form-submit-validate', [ a, this, options, veto ] ) ;
	if ( veto.veto ) {
		log( 'ajaxSubmit: Submit vetoed via the "form-submit-validate" trigger.' ) ;
		return this ;
	}

	// Construct the query string from the serialized form array.
	var q = $ . param( a, traditional ) ;
	if ( qx ) {
		// Append extra data if it exists.
		q = ( q ? ( q + '&' + qx ) : qx ) ;
	}

	// Adjust URL and data based on HTTP method.
	if ( options.type.toUpperCase() == 'GET' ) {
		options.url += ( options.url.indexOf( '?' ) >= 0 ? '&' : '?' ) + q ;
		options.data = null ;  // Data is passed in URL for GET requests.
	}
	else {
		options.data = q ; // Data is the query string for POST requests.
	}

	// Prepare an array of callbacks to be executed on success.
	var callbacks = [] ;
	if ( options.resetForm ) {
		callbacks.push( function () { $form.resetForm() ; } ) ;
	}
	if ( options.clearForm ) {
		callbacks.push( function () { $form.clearForm( options.includeHidden ) ; } ) ;
	}

	// Handle target loading if no specific `dataType` is provided.
	if ( !options.dataType && options.target ) {
		var oldSuccess = options.success || function () {} ; // Preserve original success callback.
		callbacks.push( function ( data ) {
			var fn = options.replaceTarget ? 'replaceWith' : 'html' ; // Determine replacement method.
			$( options.target ) [ fn ] ( data ) . each( oldSuccess, arguments ) ;
		} ) ;
	}
	else if ( options.success ) {
		callbacks.push( options.success ) ; // Add the primary success callback.
	}

	// Override the `options.success` function to manage multiple callbacks.
	options.success = function ( data, status, xhr ) { // jQuery 1.4+ passes xhr as 3rd argument.
		var context = options.context || this ;    // Establish the execution context.
		for ( var i = 0, max = callbacks.length ; i < max ; i++ ) {
			callbacks[i] . apply( context, [ data, status, xhr || $form, $form ] ) ;
		}
	} ;

	// Check for file inputs to determine upload method.
	var fileInputs = $( 'input:file:enabled[value]', this ) ; // Select enabled file inputs with values. (Issue #113)
	var hasFileInputs = fileInputs.length > 0 ;
	var mp = 'multipart/form-data' ;
	var multipart = ( $form.attr( 'enctype' ) == mp || $form.attr( 'encoding' ) == mp ) ;

	// Determine if File API and FormData are available for modern XHR uploads.
	var fileAPI = feature.fileapi && feature.formdata ;
	log( "fileAPI :" + fileAPI ) ;

	// Decide whether to use an iframe for submission.
	// Iframe is used if there are file inputs or the form is multipart, AND File API is not available.
	var shouldUseFrame = ( hasFileInputs || multipart ) && !fileAPI ;

	// `options.iframe` allows the user to explicitly force iframe mode.
	// As of 06-NOV-09, iframe mode is the default if a file input is detected.
	if ( options.iframe !== false && ( options.iframe || shouldUseFrame ) ) {
		// Special handling for Safari to prevent hangs.
		// Reference: http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
		if ( options.closeKeepAlive ) {
			$ . get( options.closeKeepAlive, function () {
				fileUploadIframe( a ) ;
			} ) ;
		}
		else {
			fileUploadIframe( a ) ;
		}
	}
	// If modern File API is available and files are present, use XHR Level 2.
	else if ( ( hasFileInputs || multipart ) && fileAPI ) {
		fileUploadXhr( a ) ;
	}
	// Otherwise, proceed with a standard jQuery AJAX request.
	else {
		$ . ajax( options ) ;
	}

	// Clear the elements array to release references.
	for ( var k = 0 ; k < elements.length ; k++ ) {
		elements[k] = null ;
	}

	// Fire a 'form-submit-notify' event to indicate completion of submission process.
	this.trigger( 'form-submit-notify', [ this, options ] ) ;
	return this ;


	/**
	 * Helper function for deep serialization of extra data.
	 * Converts a jQuery-serialized string into an object.
	 * @param {Object} extraData The object to be serialized.
	 * @returns {Object} A decoded object.
	 */
	function deepSerialize( extraData ) {
		var serialized = $ . param( extraData ) . split( '&' ) ;
		var len = serialized.length ;
		var result = {} ;
		var i, part ;

		for ( i = 0 ; i < len ; i++ ) {
			part = serialized[i] . split( '=' ) ;
			result[ decodeURIComponent( part[0] ) ] = decodeURIComponent( part[1] ) ;
		}
		return result ;
	}

	/**
	 * Handles XMLHttpRequest Level 2 file uploads using FormData.
	 * (Big thanks to francois2metz for insights here!)
	 * @param {Array} a Serialized form data array.
	 */
	function fileUploadXhr( a ) {
		var formdata = new FormData() ;

		// Append serialized form elements to FormData.
		for ( var i = 0 ; i < a.length ; i++ ) {
			formdata.append( a[i].name, a[i].value ) ;
		}

		// Append any additional data specified in options.extraData.
		if ( options.extraData ) {
			var serializedData = deepSerialize( options.extraData ) ;
			for ( var p in serializedData ) {
				if ( serializedData.hasOwnProperty( p ) ) {
					formdata.append( p, serializedData[p] ) ;
				}
			}
		}

		// Clear options.data as it's now handled by FormData.
		options.data = null ;

		// Create AJAX settings for XHR2 upload.
		var s = $ . extend( true, {}, $ . ajaxSettings, options, {
			contentType: false,       // Let browser set content type for FormData.
			processData: false,       // Prevent jQuery from processing data.
			cache: false,             // Disable caching.
			type: 'POST'              // Force POST for file uploads.
		} ) ;

		// Implement upload progress tracking if `options.uploadProgress` is provided.
		if ( options.uploadProgress ) {
			// Workaround: jqXHR object does not directly expose the upload property.
			s.xhr = function () {
				var xhr = jQuery.ajaxSettings.xhr() ;
				if ( xhr.upload ) {
					xhr.upload.onprogress = function ( event ) {
						var percent = 0 ;
						var position = event.loaded || event.position ; /* event.position is deprecated */
						var total = event.total ;
						if ( event.lengthComputable ) {
							percent = Math.ceil( position / total * 100 ) ;
						}
						options.uploadProgress( event, position, total, percent ) ;
					} ;
				}
				return xhr ;
			} ;
		}

		// Data is already set in `formdata`, so ensure `s.data` is null before `beforeSend`.
		s.data = null ;

		// Capture original `beforeSend` and inject FormData into the options object
		// before it's passed to the actual AJAX call.
		var beforeSend = s.beforeSend ;
		s.beforeSend = function ( xhr, o ) {
			o.data = formdata ; // Assign the FormData object.
			if ( beforeSend ) {
				beforeSend.call( this, xhr, o ) ; // Call original `beforeSend` if it existed.
			}
		} ;
		$ . ajax( s ) ; // Execute the AJAX request.
	}


	/**
	 * Private function for handling file uploads using an iframe.
	 * This method is used for browsers without XMLHttpRequest Level 2 support.
	 * (Hat tip to YAHOO! for early iframe upload techniques!)
	 * @param {Array} a Serialized form data array.
	 */
	function fileUploadIframe( a ) {
		var form = $form[0],                       // The native DOM form element.
			el, i, s, g, id, $io, io, xhr, sub, n, // Various local variables.
			timedOut, timeoutHandle ;              // For managing request timeouts.

		var useProp = !!$ . fn.prop ;              // Feature detection for `prop()` method.

		// Check for form elements named/id'd 'submit'.
		// This can interfere with form.submit() in some browsers.
		if ( $ ( ':input[name=submit],:input[id=submit]', form ) . length ) {
			alert( 'Error: Form elements must not have name or id of "submit".' ) ;
			return ;
		}

		// If serialized data array 'a' is provided, ensure all involved inputs are enabled.
		if ( a ) {
			for ( i = 0 ; i < elements.length ; i++ ) {
				el = $ ( elements[i] ) ;
				if ( useProp ) {
					el.prop( 'disabled', false ) ; // Use .prop() if available.
				}
				else {
					el.removeAttr( 'disabled' ) ;  // Fallback to .removeAttr().
				}
			}
		}

		// Extend default AJAX settings with current options.
		s = $ . extend( true, {}, $ . ajaxSettings, options ) ;
		s.context = s.context || s ;               // Ensure context is set.

		// Generate a unique ID for the iframe.
		id = 'jqFormIO' + ( new Date() . getTime() ) ;

		// Determine if an existing iframe target is specified or create a new one.
		if ( s.iframeTarget ) {
			$io = $ ( s.iframeTarget ) ;
			n = $io.attr( 'name' ) ;
			if ( !n ) {
				$io.attr( 'name', id ) ;
			}
			else {
				id = n ; // Use existing name if present.
			}
		}
		else {
			// Create a new hidden iframe element.
			$io = $ ( '<iframe name="' + id + '" src="' + s.iframeSrc + '" />' ) ;
			$io.css( { position: 'absolute', top: '-1000px', left: '-1000px' } ) ;
		}
		io = $io[0] ; // Get the native DOM iframe element.


		// Create a mock XHR object to provide a consistent interface.
		xhr = {
			aborted: 0,
			responseText: null,
			responseXML: null,
			status: 0,
			statusText: 'n/a',
			getAllResponseHeaders: function () {},
			getResponseHeader: function () {},
			setRequestHeader: function () {},
			abort: function ( status ) {
				var e = ( status === 'timeout' ? 'timeout' : 'aborted' ) ;
				log( 'Abort initiated for upload: ' + e ) ;
				this.aborted = 1 ;

				// Attempt to stop document loading in the iframe (Issue #214).
				if ( io.contentWindow.document.execCommand ) {
					try {
						io.contentWindow.document.execCommand( 'Stop' ) ;
					}
					catch ( ignore ) {
						// Ignore errors if command fails.
					}
				}
				$io.attr( 'src', s.iframeSrc ) ; // Reset iframe src to abort ongoing operation.
				xhr.error = e ; // Store error state.

				// Trigger error and complete callbacks.
				if ( s.error ) {
					s.error.call( s.context, xhr, e, status ) ;
				}
				if ( g ) {
					$ . event.trigger( "ajaxError", [ xhr, s, e ] ) ;
				}
				if ( s.complete ) {
					s.complete.call( s.context, xhr, e ) ;
				}
			}
		} ;

		g = s.global ; // Check if global AJAX events should be triggered.

		// Trigger global ajaxStart event if this is the first active AJAX request.
		if ( g && 0 === $ . active++ ) {
			$ . event.trigger( "ajaxStart" ) ;
		}
		// Trigger global ajaxSend event.
		if ( g ) {
			$ . event.trigger( "ajaxSend", [ xhr, s ] ) ;
		}

		// Execute `beforeSend` callback. If it returns false, abort the submission.
		if ( s.beforeSend && s.beforeSend.call( s.context, xhr, s ) === false ) {
			if ( s.global ) {
				$ . active-- ;
			}
			return ;
		}
		// If XHR was aborted by `beforeSend`, return.
		if ( xhr.aborted ) {
			return ;
		}

		// Add information about the submitting element (e.g., clicked submit button) to data.
		sub = form.clk ;
		if ( sub ) {
			n = sub.name ;
			if ( n && !sub.disabled ) {
				s.extraData = s.extraData || {} ;
				s.extraData[n] = sub.value ;
				if ( sub.type == "image" ) {
					s.extraData[n + '.x'] = form.clk_x ;
					s.extraData[n + '.y'] = form.clk_y ;
				}
			}
		}

		// Define constants for abort types.
		var CLIENT_TIMEOUT_ABORT = 1 ;
		var SERVER_ABORT = 2 ;

		/**
		 * Retrieves the document object from an iframe.
		 * Handles cross-browser differences for iframe content access.
		 * @param {HTMLIFrameElement} frame The iframe element.
		 * @returns {Document} The document object of the iframe.
		 */
		function getDoc( frame ) {
			var doc = frame.contentWindow ? frame.contentWindow.document :
				frame.contentDocument ? frame.contentDocument : frame.document ;
			return doc ;
		}

		// Rails CSRF hack: Add CSRF token to extraData if available.
		var csrf_token = $ ( 'meta[name=csrf-token]' ) . attr( 'content' ) ;
		var csrf_param = $ ( 'meta[name=csrf-param]' ) . attr( 'content' ) ;
		if ( csrf_param && csrf_token ) {
			s.extraData = s.extraData || {} ;
			s.extraData[csrf_param] = csrf_token ;
		}

		/**
		 * Executes the actual form submission.
		 * This function is often deferred slightly to allow DOM updates to render.
		 */
		function doSubmit() {
			// Store original form attributes to restore them later.
			var t = $form.attr( 'target' ),
				a = $form.attr( 'action' ) ;

			// Update form attributes in an IE-friendly way for iframe submission.
			form.setAttribute( 'target', id ) ; // Direct DOM manipulation for target.
			if ( !method ) {
				form.setAttribute( 'method', 'POST' ) ; // Default to POST if not specified.
			}
			if ( a != s.url ) {
				form.setAttribute( 'action', s.url ) ; // Set action to the determined URL.
			}

			// Handle encoding for multipart forms.
			if ( !s.skipEncodingOverride && ( !method || /post/i.test( method ) ) ) {
				$form.attr( {
					encoding: 'multipart/form-data',
					enctype:  'multipart/form-data'
				} ) ;
			}

			// Implement client-side timeout support.
			if ( s.timeout ) {
				timeoutHandle = setTimeout( function () { timedOut = true ; cb( CLIENT_TIMEOUT_ABORT ) ; }, s.timeout ) ;
			}

			/**
			 * Periodically checks the iframe's document state for server aborts.
			 * This helps detect if the server closed the connection prematurely.
			 */
			function checkState() {
				try {
					var state = getDoc( io ) . readyState ;
					log( 'Iframe document state = ' + state ) ;
					if ( state && state.toLowerCase() == 'uninitialized' ) {
						setTimeout( checkState, 50 ) ;
					}
				}
				catch ( e ) {
					log( 'Server abort detected: ', e, ' (', e.name, ')' ) ;
					cb( SERVER_ABORT ) ;
					if ( timeoutHandle ) {
						clearTimeout( timeoutHandle ) ;
					}
					timeoutHandle = undefined ;
				}
			}

			// Add "extra" data as hidden input fields to the form if provided in options.
			var extraInputs = [] ;
			try {
				if ( s.extraData ) {
					for ( var n in s.extraData ) {
						if ( s.extraData.hasOwnProperty( n ) ) {
							// Handle complex objects with 'name' and 'value' properties (e.g., from $.param).
							if ( $ . isPlainObject( s.extraData[n] ) &&
								s.extraData[n].hasOwnProperty( 'name' ) &&
								s.extraData[n].hasOwnProperty( 'value' ) )
							{
								extraInputs.push(
									$ ( '<input type="hidden" name="' + s.extraData[n].name + '">' )
										.attr( 'value', s.extraData[n].value )
										.appendTo( form ) [0]
								) ;
							}
							else {
								extraInputs.push(
									$ ( '<input type="hidden" name="' + n + '">' )
										.attr( 'value', s.extraData[n] )
										.appendTo( form ) [0]
								) ;
							}
						}
					}
				}

				// If no iframe target is specified, append the iframe to the body.
				if ( !s.iframeTarget ) {
					$io.appendTo( 'body' ) ;
					// Attach load event listener to the iframe.
					if ( io.attachEvent ) {
						io.attachEvent( 'onload', cb ) ;
					}
					else {
						io.addEventListener( 'load', cb, false ) ;
					}
				}
				setTimeout( checkState, 15 ) ; // Start checking for server aborts.
				form.submit() ; // Trigger the form submission.
			}
			finally {
				// Clean up: restore original form attributes and remove temporary inputs.
				form.setAttribute( 'action', a ) ;
				if ( t ) {
					form.setAttribute( 'target', t ) ;
				}
				else {
					$form.removeAttr( 'target' ) ;
				}
				$ ( extraInputs ) . remove() ; // Remove the dynamically added hidden inputs.
			}
		}

		// Decide whether to submit synchronously or with a slight delay.
		if ( s.forceSync ) {
			doSubmit() ;
		}
		else {
			setTimeout( doSubmit, 10 ) ; // A small delay allows DOM updates to render.
		}

		var data,                                  // Response data from the iframe.
			doc,                                   // Iframe's document object.
			domCheckCount = 50,                    // Counter for DOM readiness checks.
			callbackProcessed ;                    // Flag to prevent multiple callback executions.

		/**
		 * Callback function executed when the iframe finishes loading.
		 * @param {Event} e The load event.
		 */
		function cb( e ) {
			// Prevent processing if XHR was aborted or callback already processed.
			if ( xhr.aborted || callbackProcessed ) {
				return ;
			}
			try {
				doc = getDoc( io ) ; // Get the iframe's document.