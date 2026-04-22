/*
 *	jQuery.h5form - HTML5 Forms Plugin - Version 2.13.1 / English Edition
 *
 *	Authored by: Yoshiyuki Mikomde (http://www.rapidexp.com/h5form)
 *
 *	Copyright (c) 2012 - 2013 Yoshiyuki Mikome. All rights reserved.
 *	(http://www.rapidexp.com)
 *	Dual licensed under MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Designed for use with the jQuery library:
 *	http://jquery.com
 *
 */
( function( $ ) {

	$.fn.h5form = function( options ) {

		// Check User Agent string for browser specifics
		var ua = window.navigator.userAgent.toLowerCase(),
			msie = document.documentMode || parseInt( ua.replace( /.*msie (\d+).*/, '$1' ) ),
			firefox = parseInt( ua.replace( /.*firefox\/(\d+).*/, '$1' ) ),
			chrome = parseInt( ua.replace( /.*chrome\/(\d+).*/, '$1' ) ),
			// Opera versions can appear as "opara/9.80" or "opera 10.10"
			opera = parseInt( ua.replace( /.*opera[\/ ](\d+).*/, '$1' ) ),
			// Safari versions typically include "Version/5.0 Safari/533.16"
			safari = parseInt( ua.replace( /.*version\/(\d+).*safari.*/, '$1' ) ),
			android = parseInt( ua.replace( /.*android (\d+).*/, '$1' ) );

		// Helper function to get outerHTML, especially for older Firefox
		var outerHTML = function( ui ) {
			// Firefox 10 or earlier does not natively support outerHTML
			var obj = ui.get( 0 );
			return obj.outerHTML || new XMLSerializer().serializeToString( obj );
		};

		// Default configuration settings for the plugin
		var defaults = {
			exprResponse : '.h5form-response, .h5form-reversed', // Selectors for response/error messages
			exprBehind : '.h5fom-behind', // Selector for elements to disable behind messages
			styleErr : { backgroundColor : 'mistyrose' }, // Style for error fields
			classPlaceholder : 'h5form-placeholder', // Class for custom placeholder
			msgEmpty : 'Please enter this field.', // Message for empty required fields
			msgUnselect : 'Please select an item.', // Message for unselected required selects/radios
			msgUncheck : 'Please check this checkbox.', // Message for unchecked required checkboxes
			msgPattern : 'Does not match the required pattern.', // Message for pattern mismatch
			msgEmail : 'E-mail address is not correct.', // Message for invalid email
			msgUrl : 'URL is not correct.', // Message for invalid URL
			msgNumber : 'Number is not correct.', // Message for invalid number
			msgDatetime : 'Date time is not correct.', // Message for invalid datetime
			msgDate : 'Date is not correct.', // Message for invalid date
			msgTime : 'Time is not correct.', // Message for invalid time
			msgStep : 'Step is not correct.', // Message for invalid step
			msgMin : 'Please be greater than or equal to #.', // Message for value below min
			msgMax : 'Please be less than or equal to #.', // Message for value above max
			msgMaxlen : 'Too many # characters.', // Message for exceeding maxlength
			classRange : 'h5form-range', // Class for custom range slider
			classSpinTime : 'h5form-spinTime', // Class for custom time spinner
			classDatetime : 'h5form-datetime', // Class for custom datetime input
			datepicker : { // Options for jQuery UI Datepicker
				onClose : function() { $( this ).blur(); }
			},
			maskDate : '9999-99-99', // Mask for date input
			maskMonth : '9999-99', // Mask for month input
			maskTime : '99:99', // Mask for time input
			msgSpin : 'Press Shift to vary a hour, or press Ctrl for with short steps.', // Spin control message
			options : {}, // Additional dynamic options
			dynamicHtml : '.h5form-dynamic' // Selector for dynamic HTML content
		};
		// Merge default options with user-provided options
		var opts = $.extend( {}, defaults, options );

		// Feature detection for various HTML5 input types and attributes
		var test1 = $( '<input>' ).hide().appendTo( $( 'body' ) ).get( 0 ), // Temporary input element for testing
			test2 = $( 'textarea:first' ).get( 0 ) || new Object(), // Temporary textarea element for testing
			reqCustomValidity = !( 'setCustomValidity' in test1 ) || android, // Needs custom validity polyfill
			reqAutofocus = !( 'autofocus' in test1 ), // Needs autofocus polyfill
			reqRequired = !( 'required' in test1 ) || android, // Needs required polyfill
			reqPattern = !( 'pattern' in test1 ) || android, // Needs pattern polyfill
			reqEmail = reqUrl = reqCustomValidity || reqPattern || android, // Email/URL polyfill often tied to others
			reqPlaceholder = !( 'placeholder' in test1 ), // Needs placeholder polyfill
			// Android often behaves differently, e.g., reqSpin = false and reqNumber = true
			// reqNumber provides min/max validation
			reqSpin = !( 'step' in test1 ) || !( 'min' in test1 ) || !!firefox || !!msie, // Needs spinbox polyfill
			reqNumber = ( !!android || reqSpin && !( msie > 9 ) ), // Needs number polyfill
			reqRange = reqNumber && !( firefox > 22 ), // Needs range polyfill
			reqDateTimeLocal = !( opera > 8 || chrome > 24 ), // Needs datetime-local polyfill
			reqDateTime = !( opera > 8 ), // Needs datetime polyfill
			reqDate = reqDateTimeLocal && !( chrome > 21 ), // Needs date polyfill
			reqTime = reqDateTimeLocal && !( chrome > 22 ), // Needs time polyfill
			reqMonth = reqDateTimeLocal, // Detailed Chrome version for month unknown, assume polyfill needed
			reqMaxlength = !( 'maxLength' in test2 ), // Needs maxlength polyfill for textarea
			reqFormAttr = !( 'form' in test1 ) || !( 'formAction' in test1 ) || android, // Needs form attribute polyfill
			reqDatalist = !( 'autocomplete' in test1 ) || !( 'list' in test1 ), // Needs datalist polyfill
			reqBugButton = ( msie && msie < 8 ), // IE < 8 button bug
			reqBugEnter = ( msie && msie < 9 ) || android; // IE < 9 or Android enter key bug

		// Evaluate dynamic options from opts.options
		for ( name in opts.options ) {
			eval( name + '=' + opts.options[ name ] + ';' );
		}

		// Clean up the temporary input element
		$( 'input:last' ).remove();

		var validatable = ':input:enabled:not(:button, :submit, [type="hidden"])';

		// Clear balloons on interaction
		if ( 'on' in $( document ) ) {
			// Using .on() for jQuery 1.7+ (replaces .live() removed in 1.9)
			$( document ).on( 'click', validatable, function() {
				$( this ).siblings( opts.exprResponse ).remove();
				$( opts.exprBehind ).removeAttr( 'disabled' );
			} )
			.on( 'click', opts.exprResponse, function() {
				$( this ).remove();
			} );
		} else {
			// Fallback for older jQuery versions using .live()
			$( validatable ).live( 'click', function() {
				$( this ).siblings( opts.exprResponse ).remove();
				$( opts.exprBehind ).removeAttr( 'disabled' );
			} );
			$( opts.exprResponse ).live( 'click', function() {
				$( this ).remove();
			} );
		}
		// Focus on the first server-side error if present
		if ( $( opts.exprResponse ).length ) {
			var ui = $( opts.exprResponse ).eq( 0 ).next( ':input' );
			if ( ui.is( ':hidden' ) ) {
				ui = ui.parent().find( ':input:not(:hidden)' );
			}
			ui.eq( 0 ).focus();
		}

		// Helper to safely get an attribute value
		var getAttr = function( ui, name ) {
			var attr = ui.attr( name );
			return ( attr == undefined ) ? '' : attr;
		};

		/*
		 * Change Type of an input element.
		 * This function converts an input element to a different type while preserving
		 * its attributes.
		 * @param {object} ui -- The jQuery element to modify.
		 * @param {string} type -- The new type for the input (e.g., 'text').
		 * @param {string} orgType -- The original type of the input (for class naming).
		 * @return {object} -- The newly created and replaced jQuery element.
		 */
		var typeTo = function( ui, type, orgType ) {
			var at = ui.get( 0 ).attributes,
				ui2 = $( '<input type="' + type + '">' ),
				flg = [ 'required', /*'disabled',*/ 'readonly', 'checked' ]; // Attributes to handle specially

			for ( i = at.length - 1; i >= 0; i-- ) {
				name = at[ i ].nodeName;
				value = at[ i ].nodeValue;
				if ( !value && $.inArray( name, flg ) >= 0 ) {
					value = name; // For boolean attributes like 'required'
				}
				if ( name && value ) {
					if ( name != 'type' ) {
						ui2.attr( name, value );
					}
				}
			}
			ui2.addClass( 'h5form-' + orgType ); // Add a class indicating original type

			return ui2.replaceAll( ui ); // Replace the original element with the new one
		};

		/*
		 * Set a custom validity message for an element.
		 * This function handles both native setCustomValidity and a polyfill for older browsers.
		 * @param {object} ui -- The jQuery element to set validity for.
		 * @param {string} message -- The custom validity message (empty string clears it).
		 * @return {object} -- The jQuery element itself.
		 */
		var $firstTime = true, // Flag to indicate if it's the first validation pass
			$novalidate = false, // Flag indicating if the form has novalidate attribute
			setCustomValidity = function( ui, message ) {
			if ( $novalidate ) message = ''; // If form has novalidate, ignore custom messages (Opera compatibility)
			if ( ui.is( validatable ) ) {
				// Append title to message if available
				if ( message && ( title = getAttr( ui, 'title' ) ) ) {
					message = $.trim( message + '\n' + title );
				}
				// Apply custom validity based on feature detection
				if ( reqCustomValidity ) {
					if ( message ) {
						ui.data( 'customValidity', message.replace( /\n/, '<br />' ) ); // Store message
					} else {
						ui.removeData( 'customValidity' ); // Clear stored message
					}

					// Apply error styling if not the first time validation and style is defined
					if ( !$firstTime && opts.styleErr ) {
						if ( message ) {
							ui.css( opts.styleErr );
						} else {
							for ( key in opts.styleErr ) {
								ui.css( key, '' ); // Clear error style
							}
						}
					}
				} else {
					ui.get( 0 ).setCustomValidity( message ); // Use native setCustomValidity
				}
			}
			return ui;
		};
		$.fn.h5form.setCustomValidity = setCustomValidity; // Expose as a plugin method

		/*
		 * Check the validity of an element or a set of elements.
		 * This function uses either native checkValidity or the custom validity data.
		 * @param {object} ui -- The jQuery element(s) to check.
		 * @return {boolean} -- True if all elements are valid, false otherwise.
		 */
		$.fn.h5form.checkValidity = function( ui ) {
			var result = true;
			ui.each( function() {
				if ( reqCustomValidity ) {
					if ( $( this ).data( 'customValidity' ) ) {
						return ( result = false ); // Found custom validity message, so invalid
					}
				} else {
					if ( !$( this ).get( 0 ).checkValidity() ) {
						return ( result = false ); // Native checkValidity failed
					}
				}
			} );
			return result;
		};

		// Displays an error balloon next to the input element
		var showBalloon = function( ui, message ) {
			if ( !ui.prev().is( opts.exprResponse ) ) {
				var m = opts.exprResponse.match( /^\.([^, ]+),? *\.?([^, ]*)/ ), // Parse response class names
				name = ( $( window ).width() - ui.offset().left < 300 && !!m[ 2 ] ) ?
					m[ 2 ] : m[ 1 ]; // Choose class based on screen space
				ui.before( '<span class="' + name + '"></span>' ); // Insert balloon
				$( opts.exprBehind ).attr( 'disabled', 'disabled' ); // Disable background elements
			}
			ui.prev().html( '<p>' +
						   message.replace( /\n/, '<br/>' ) + '</p>' ); // Set balloon content
 			ui.focus().select(); // Focus and select input (focus alone doesn't work in IE)
		};
		$.fn.h5form.showBalloon = showBalloon; // Expose as a plugin method

		// Iterate over each form selected by the plugin call
		return $( this ).each( function() {

			// Private properties for the current form
			var form = $( this ),
				elmAutofocus, // Element that should receive autofocus
				validatableElements = form.find( validatable ); // All validatable elements within the form

			// Check for novalidate attribute (handles simple 'novalidate' as well as 'novalidate="novalidate"')
			$novalidate = !!outerHTML( form ).match( /^[^>]+ novalidate/ );

			// Event handler for number input key presses
			var evNumber = function( ev ) {
				var allow = [ 8, 9, 35, 36, 37, 39, 46, 58, 186, 190 ]; // Allowed non-numeric keys
				var cc = ev.charCode || ev.keyCode;
				return ( ( $.inArray( cc, allow ) >= 0 ) || ( cc >= 48 && cc <= 57 ) ); // Allow digits
			}
			var spinShift = false, // State for Shift key during spin
				spinCtrl = false; // State for Ctrl key during spin

			// Spin accelerator event handler
			var spinAcc = ( function( ev, flag ) {
				var cc = ev.charCode || ev.keyCode;
				if ( cc == 17 ) spinCtrl = flag; // Ctrl key
				if ( cc == 16 ) spinShift = flag; // Shift key
			} );

			// Bind spin accelerator events globally on body
			$( 'body' )
				.unbind( 'keydown', spinAcc ) // Ensure no duplicate bindings
				.unbind( 'keyup', spinAcc )
				.keydown( function( ev ) { spinAcc( ev, true ); } ) // Set flag on keydown
				.keyup( function( ev ) { spinAcc( ev, false ); } ); // Clear flag on keyup

			// Function to handle time spinning
			var spinTime = function( ui, isDown ) {
				var min = attr2num( ui, 'min', 0 ),
					max = attr2num( ui, 'max', 86400 ), // Max seconds in a day
					step = step0 = attr2num( ui, 'step', 60 ), // Default step is 1 minute
					base = 0,
					val = str2sec( ui.val(), true ); // Convert current value to seconds

				// Adjust step based on Shift/Ctrl keys
				if ( spinShift ) step = 3600; // Shift for hours
				else if ( spinCtrl ) step = step0; // Ctrl for original step
				else step = ( step0 < 600 ) ? 600 : step0; // Default step (at least 10 minutes)

				// Calculate new value
				val = val - ( ( val - base ) % step ) + step * ( ( isDown ) ? -1 : 1 );

				// Apply min/max constraints
				if ( ( max || max == '0' ) && val > max ) val = max;
				if ( ( min || min == '0' ) && val < min ) val = min;

				ui.val( sec2str( val, step % 60, true ) ); // Convert back to string and set value
				return ui;
			};

			/*
			 * Initializes a control element, applying necessary polyfills and event handlers.
			 * @param {object} elm -- The jQuery element(s) to initialize.
			 * @param {boolean} firstTime -- True if this is the initial setup, false otherwise.
			 * @return {object} -- The jQuery element(s).
			 */
			var initControl = function( elm, firstTime ) {
				$firstTime = firstTime; // Set global flag

				return elm.each( function() {

					var ui = $( this ),
						type = getAttr( ui, 'type' ).toLowerCase(); // Get element type

					// Handle autofocus attribute if not natively supported
					if ( reqAutofocus && !elmAutofocus && getAttr( ui, 'autofocus' ) ) {
						elmAutofocus = ui;
					}

					// Placeholder polyfill
					var placeholder = getAttr( ui, 'placeholder' );
					if ( reqPlaceholder && placeholder ) {
						$( this ).prev( '.' + opts.classPlaceholder ).remove(); // Remove existing placeholder if any
						var phld = $( '<span />' ).insertBefore( ui )
							.addClass( opts.classPlaceholder )
							.text( placeholder ).click( function() { ui.focus(); } ); // Click placeholder to focus input
						var evPlaceholder = ( function() {
							if ( ui.val().length > 0 ) phld.hide(); else phld.show(); // Show/hide based on input value
						} );
						ui.bind( 'keyup keydown cut past', evPlaceholder ).keyup() // Bind events and trigger initial check
						  .removeAttr( 'placeholder' ); // Remove native placeholder
					}

					// Spinner polyfill (requires jQuery UI spinner)
					if ( 'spinner' in ui ) {
						if ( reqSpin && type == "number" )
						{
							ui = typeTo( ui, 'text', type ).spinner() // Convert to text, apply spinner
								.unbind( 'keydown', evNumber ).keydown( evNumber ); // Bind number key event
						}
						if ( reqTime && type == 'time' )
						{
							ui = typeTo( ui, 'text', type ).spinner( { spin: function() { return false; } } ); // Convert to text, apply spinner (disable default spin)

							if ( ( 'mask' in ui ) ) {
								ui.unbind( 'mask' ).mask( opts.maskTime ); // Apply input mask
							}

							wi = ui.spinner( 'widget' ); // Get spinner widget
							wi.find( '.ui-icon' )
							.attr( 'title', opts.msgSpin ) // Add tooltip
							.click( function() {
								spinTime( ui, $( this ).parents( '.ui-spinner' ).find( '.ui-icon' ).index( $( this ) ) ).change().blur(); // Handle spin button clicks
							} );
						}
					}
					// Datepicker polyfill (requires jQuery UI Datepicker)
					if ( ( reqDate && type == 'date' ) || ( reqMonth && type == 'month' ) ) {
						var mask;
						if ( 'datepicker' in ui ) {
							var option = opts.datepicker;
							switch( type ) {
							case 'date':
								option.dateFormat = 'yy-mm-dd';
								option.minDate = getAttr( ui, 'min' );
								option.maxDate = getAttr( ui, 'max' );
								mask = opts.maskDate;
								break;
							case 'month':
								option.dateFormat = 'yy-mm';
								mask = opts.maskMonth;
								// Datepicker has a bug with minDate and maxDate for 'yy-mm' format
								option.minDate = '';
								option.maxDate = '';
								break;
							}
							ui = typeTo( ui, 'text', type ).datepicker( option ); // Convert to text, apply datepicker
						}
						if ( 'mask' in ui ) {
							ui.unbind( 'mask' ).mask( mask ); // Apply input mask
						}
					}
					// Slider polyfill (requires jQuery UI Slider)
					if ( reqRange && ( type == 'range' ) && ( 'slider' in ui ) ) {
						var min = attr2num( ui, 'min', 0 ),
							max = attr2num( ui, 'max', 100 ),
							step = attr2num( ui, 'step', 1 ),
							val = attr2num( ui, 'val', ( min + max ) / 2 - ( ( min + max ) / 2 % step ) ); // Calculate initial value

						ui.hide().css( { width: 0, margin:0 } ).after( '<span class="' + opts.classRange +
										'"><div></div></span>' ).val( val ); // Hide original, insert slider container
						ui.next().children().slider( {
							min: min, max: max, step: step, value: val,
							change: function( ev, sl ) {
								ui.val( $( this ).slider( 'value' ) ); // Update hidden input value on slider change
							}
						} );
					}

					// Maxlength polyfill for textareas
					if ( reqMaxlength && ui.is( 'textarea' ) &&
						( maxlength = getAttr( ui, 'maxlength' ) ) ) {
						// Keypress event to enforce maxlength
						var evKeypress = ( function( ev ) {
							var cc = ev.charCode || ev.keyCode;
							return ( ( $.inArray( cc, [ 8, 9, 37, 39, 46 ] ) >= 0 ) || // Allow navigation/delete keys
									( this.value.length < maxlength ) ); // Allow input if not exceeding maxlength
						} );
						ui.unbind( 'keypress', evKeypress ).keypress( evKeypress ); // Bind and rebind event
					}

					// Datetime and Datetime-local polyfill
					if ( ( isLocal = ( reqDateTimeLocal && type == 'datetime-local' ) ) || ( reqDateTime && type == 'datetime' ) ) {
						ui = typeTo( ui, 'text', type ); // Convert to text input
						var val = getLocalDatetime( ui.val(), isLocal ), // Parse initial value
							min = getLocalDatetime( getAttr( ui, 'min' ), isLocal ), // Parse min attribute
							max = getLocalDatetime( getAttr( ui, 'max' ), isLocal ), // Parse max attribute
							tz = ( type == 'datetime' ) ?
								'<span class="h5form-timezone">' + getTZ() + '</span>' : ''; // Timezone for 'datetime'

						ui.hide().after(
							'<span class="' + opts.classDatetime + '">' + // Wrapper for date and time inputs

							'<input type="date" value="' + val[ 0 ] + '"' + // Date part
							' min="' + min[ 0 ] + '" max="' + max[ 0 ] + '"' +
							' size="' + getAttr( ui, 'size' ) + '"' +
							' class="' + getAttr( ui, 'class' ) + '"' +
							' title="' + getAttr( ui, 'title' ) + '">' +

							'<input type="time" value="' + val[ 1 ] + '"' + // Time part
							' step="' + attr2num( ui, 'step', 60 ) + '"' +
							' size="' + getAttr( ui, 'size' ) + '"' +
							' class="' + getAttr( ui, 'class' ) + '"' +
							' title="' + getAttr( ui, 'title' ) + '">' +
							tz + // Timezone span
							'</span>' );
						if ( getAttr( ui, 'required' ) ) {
							ui.removeAttr( 'required' ); // Remove required from hidden input
							initControl( ui.next().children().attr( 'required', 'required' ) ); // Apply required to new inputs
						} else {
							initControl( ui.next().children() ); // Initialize new date/time inputs
						}
					}
					// Datalist polyfill (requires jQuery UI Autocomplete)
					if ( ( reqDatalist ) &&
						( list = getAttr( ui, 'list' ) ) && // Get list ID
						( list = $( '#' + list ) ) && // Find datalist element
						( 'autocomplete' in ui ) ) // Check if jQuery UI Autocomplete is available
					{
						var arr = new Array();
						if ( list.find( 'option' ).length ) {
							list.find( 'option' ).each( function() {
								arr.push( $( this ).val() ); // Populate array from <option> tags
							} );
						} else if ( str = list.attr( 'data-option' ) ) {
							arr = $.parseJSON( str ); // Populate from data-option attribute (JSON string)
						}
						// Avoid conflicts with the browser's native datalist behavior
						ui.removeAttr( 'list' );

						ui.autocomplete( {
							source: arr, // Set autocomplete source
							// Handling for IME (Input Method Editor)
							search: function( ev, ui ) {
								if ( ev.keyCode == 229 ) return false; // Ignore IME composition events
								return true;
							}

						} )
						.keyup( function( ev ) {
							// Trigger search on Enter key for IME output
							if ( ev.keyCode == 13 ) $( this ).autocomplete( 'search' );
						} );
					}

					/*
					 * Change event handler for validation and specific browser bug workarounds.
					 * @return {boolean} -- True if changes were necessary, false otherwise.
					 */
					var evChange = ( function() {

						var isNecessary = false,
							name = ui.attr( 'name' ),
							isChecked = $( '[name="' + name + '"]:checked' ).length,
							isEmpty = ( ( ui.val() == '' ) ||
									   ( ui.is( ':checkbox, :radio' ) && !isChecked ) );

						// Clear validity messages first (NOTE: null is invalid in Opera)
						setCustomValidity( $( '[name="' + name + '"]' ), '' );

						// Workaround for IE < 9 and Android enter key bug
						if ( reqBugEnter && !ui.is( 'select, textarea, button' ) ) {
							// Keypress event attach for handling Enter key
							var evKeypress2 = ( function( ev ) {
								var cc = ev.charCode || ev.keyCode;
								if ( cc == 13 ) { // Enter key pressed
									if ( android &&
										( idx = validatableElements.index( ui ) + 1 ) < validatableElements.length ) {
										validatableElements.eq( idx ).focus(); // Focus next element on Android
									} else {
										form.find( '[type="submit"]' ).eq( 0 ).focus().click(); // Submit form
									}
									return false; // Prevent default Enter key behavior
								}
								return true;
							} );
							ui.unbind( 'keypress', evKeypress2 ).keypress( evKeypress2 ); // Bind event
							isNecessary = true;
						}

						// Required attribute polyfill
						if ( reqRequired && getAttr( ui, 'required' ) ) {
							isNecessary = true;
							if ( isEmpty ) {
								var msg = opts.msgEmpty;
								if ( ui.is( 'select, :radio' ) ) msg = opts.msgUnselect; // Specific message for select/radio
								if ( ui.is( ':checkbox' ) ) msg = opts.msgUncheck; // Specific message for checkbox
								setCustomValidity( ui, msg ); // Set custom validity message
								return true; // Indicate change was necessary
							}
						}
						// Pattern attribute polyfill