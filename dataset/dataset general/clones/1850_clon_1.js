// This file contains a Type I clone of the original jQuery UI core library.
// It is intended to be functionally identical, with only changes to whitespace and comments.

// Original copyright and licensing information:
/*
 * jQuery UI @VERSION - This is a modified version of the original source.
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * For more details, visit the official documentation at:
 * http://docs.jquery.com/UI
 *
 * This version includes extensive whitespace and comment modifications for cloning purposes.
 */

;
jQuery.ui || ( function ( $ ) {
	// Private variables for internal use within this scope.
	// _remove stores the original $.fn.remove method before it's overridden.
	var _remove = $.fn.remove,
		// isFF2 checks if the browser is Firefox 2 or older, used for specific WAI-ARIA handling.
		isFF2 = $.browser.mozilla && ( parseFloat( $.browser.version ) < 1.9 ) ;


	// The main jQuery UI object, containing core utilities and settings.
	$.ui = {
		// The current version of jQuery UI.
		version: "@VERSION",

		// $.ui.plugin is a deprecated utility. Developers are encouraged to use the proxy pattern instead.
		plugin: {
			// Adds a plugin method to a specific UI module.
			add: function ( module, option, set ) {
				// Retrieve the prototype of the target UI module.
				var proto = $.ui[ module ].prototype ;
				// Iterate over the provided set of methods.
				for ( var i in set ) {
					// Initialize the plugins array for this method if it doesn't exist.
					proto.plugins[ i ] = proto.plugins[ i ] || [ ] ;
					// Add the new plugin method to the array.
					proto.plugins[ i ].push( [ option, set[ i ] ] ) ;
				}
			},
			// Calls a plugin method on a given instance.
			call: function ( instance, name, args ) {
				// Get the set of plugin methods for the given name.
				var set = instance.plugins[ name ] ;
				// If no set exists or the element is detached, do nothing.
				if ( ! set || ! instance.element[ 0 ].parentNode ) { return ; }

				// Loop through all registered plugin methods.
				for ( var i = 0; i < set.length; i ++ ) {
					// If the option for this plugin is enabled in the instance's options.
					if ( instance.options[ set[ i ][ 0 ] ] ) {
						// Apply the plugin method in the context of the instance's element.
						set[ i ][ 1 ].apply( instance.element, args ) ;
					}
				}
			}
		},

		// Determines if one DOM element contains another.
		contains: function ( a, b ) {
			// Use native compareDocumentPosition if available (modern browsers).
			return document.compareDocumentPosition
				? a.compareDocumentPosition( b ) & 16
				// Fallback for older browsers (IE).
				: a !== b && a.contains( b ) ;
		},

		// Checks if an element has scrollable content.
		hasScroll: function ( el, a ) {

			// If overflow is set to 'hidden', it means the user wants to hide any extra content.
			// In this case, we consider it not scrollable, as content is intentionally not visible.
			if ( $( el ).css( 'overflow' ) == 'hidden' ) {
				// No scroll is present or desired.
				return false ;
			}

			// Determine whether to check horizontal (scrollLeft) or vertical (scrollTop) scroll.
			var scroll = ( a && a == 'left' ) ? 'scrollLeft' : 'scrollTop' ,
				// Initialize a flag to track if scroll is present.
				has = false ;

			// If the scroll position is already greater than 0, it means the element is scrollable.
			if ( el[ scroll ] > 0 ) {
				// Scroll is definitely present.
				return true ;
			}

			// TODO: Investigate specific scenarios that lead to this condition.
			// If the element's scroll position is 0, we temporarily attempt to set it to 1
			// to determine if it *can* be scrolled.
			el[ scroll ] = 1 ;
			// Check if setting it to 1 actually resulted in a scroll position greater than 0.
			has = ( el[ scroll ] > 0 ) ;
			// Reset the scroll position back to 0 to avoid side effects.
			el[ scroll ] = 0 ;
			// Return the result of the scrollability check.
			return has ;
		},

		// Determines if a given coordinate 'x' is within the bounds of a reference axis.
		isOverAxis: function ( x, reference, size ) {
			// The coordinate 'x' must be greater than the reference point
			// AND less than the reference point plus its size.
			return ( x > reference ) && ( x < ( reference + size ) ) ;
		},

		// Determines if given coordinates (y, x) are over a specified rectangular area.
		isOver: function ( y, x, top, left, height, width ) {
			// This checks both the vertical (y, top, height) and horizontal (x, left, width) axes.
			return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width ) ;
		},

		// Key code definitions for common keyboard keys.
		keyCode: {
			BACKSPACE:        8, // Backspace key.
			CAPS_LOCK:        20, // Caps Lock key.
			COMMA:            188, // Comma key.
			CONTROL:          17, // Control key.
			DELETE:           46, // Delete key.
			DOWN:             40, // Down arrow key.
			END:              35, // End key.
			ENTER:            13, // Enter key.
			ESCAPE:           27, // Escape key.
			HOME:             36, // Home key.
			INSERT:           45, // Insert key.
			LEFT:             37, // Left arrow key.
			NUMPAD_ADD:       107, // Numpad Add key.
			NUMPAD_DECIMAL:   110, // Numpad Decimal key.
			NUMPAD_DIVIDE:    111, // Numpad Divide key.
			NUMPAD_ENTER:     108, // Numpad Enter key.
			NUMPAD_MULTIPLY:  106, // Numpad Multiply key.
			NUMPAD_SUBTRACT:  109, // Numpad Subtract key.
			PAGE_DOWN:        34, // Page Down key.
			PAGE_UP:          33, // Page Up key.
			PERIOD:           190, // Period key.
			RIGHT:            39, // Right arrow key.
			SHIFT:            16, // Shift key.
			SPACE:            32, // Spacebar key.
			TAB:              9, // Tab key.
			UP:               38 // Up arrow key.
		}
	} ;


	// WAI-ARIA normalization for Firefox 2.
	// This block addresses specific accessibility attribute handling for older Firefox versions.
	if ( isFF2 ) {
		// Store original jQuery methods.
		var attr       = $.attr,
			removeAttr = $.fn.removeAttr,
			// Namespace for WAI-ARIA attributes.
			ariaNS     = "http://www.w3.org/2005/07/aaa",
			// Regular expression to identify ARIA attributes.
			ariaState  = /^aria-/,
			// Regular expression for WAIROLE attributes.
			ariaRole   = /^wairole:/ ;

		// Override jQuery's $.attr method to handle WAI-ARIA specific attributes.
		$.attr = function ( elem, name, value ) {
			// Determine if a value is being set.
			var set = value !== undefined ;

			// Handle the 'role' attribute specifically.
			return ( name == 'role'
				// If setting a value for 'role'.
				? ( set
					// Prepend "wairole:" for setting.
					? attr.call( this, elem, name, "wairole:" + value )
					// Remove "wairole:" prefix when getting.
					: ( attr.apply( this, arguments ) || "" ).replace( ariaRole, "" ) )
				// Handle other 'aria-' attributes.
				: ( ariaState.test( name )
					// If setting an 'aria-' attribute.
					? ( set
						// Use setAttributeNS for namespaced attributes.
						? elem.setAttributeNS( ariaNS,
							name.replace( ariaState, "aaa:" ), value )
						// Get the attribute using original attr method with namespace.
						: attr.call( this, elem, name.replace( ariaState, "aaa:" ) ) )
					// For any other attributes, use the original $.attr method.
					: attr.apply( this, arguments ) ) ) ;
		} ;

		// Override jQuery's $.fn.removeAttr method to handle WAI-ARIA specific attributes.
		$.fn.removeAttr = function ( name ) {
			// Check if the attribute name is an 'aria-' attribute.
			return ( ariaState.test( name )
				// If it is an 'aria-' attribute, iterate through elements and remove with namespace.
				? this.each( function ( ) {
					this.removeAttributeNS( ariaNS, name.replace( ariaState, "" ) ) ;
				} )
				// Otherwise, call the original removeAttr method.
				: removeAttr.call( this, name ) ) ;
		} ;
	}


	// Extending jQuery's prototype ($.fn) with UI-specific methods.
	$.fn.extend( {
		// Store the original focus method to be able to call it later.
		_focus: $.fn.focus,
		// Custom focus method that allows for a delay before focusing.
		focus: function ( delay, fn ) {
			// If 'delay' is a number, apply delayed focus.
			return typeof delay === 'number'
				? this.each( function ( ) {
					var elem = this ;
					// Set a timeout for the focus action.
					setTimeout( function ( ) {
						$( elem ).focus( ) ;
						// If a callback function 'fn' is provided, execute it.
						( fn && fn.call( elem ) ) ;
					}, delay ) ;
				} )
				// Otherwise, call the original focus method immediately.
				: this._focus.apply( this, arguments ) ;
		},

		// Overrides the default jQuery remove method to trigger a custom "remove" event.
		remove: function ( ) {
			// Safari has a native 'remove' event that actually deletes DOM elements.
			// To avoid conflicts and ensure custom logic runs, we use triggerHandler instead of trigger (#3037).
			// Iterate over all children and the element itself to trigger the remove event.
			$( "*", this ).add( this ).each( function ( ) {
				$( this ).triggerHandler( "remove" ) ;
			} ) ;
			// Call the original jQuery remove method to perform the actual DOM removal.
			return _remove.apply( this, arguments ) ;
		},

		// Enables text selection for the elements.
		enableSelection: function ( ) {
			// Set 'unselectable' attribute to 'off' (for IE).
			return this
				.attr( 'unselectable', 'off' )
				// Clear '-moz-user-select' CSS property (for Firefox).
				.css( 'MozUserSelect', '' )
				// Unbind the 'selectstart.ui' event handler.
				.unbind( 'selectstart.ui' ) ;
		},

		// Disables text selection for the elements.
		disableSelection: function ( ) {
			// Set 'unselectable' attribute to 'on' (for IE).
			return this
				.attr( 'unselectable', 'on' )
				// Set '-moz-user-select' CSS property to 'none' (for Firefox).
				.css( 'MozUserSelect', 'none' )
				// Bind a 'selectstart.ui' event handler that prevents default action.
				.bind( 'selectstart.ui', function ( ) {
					return false ;
				} ) ;
		},

		// Finds the first scrollable parent of the element.
		scrollParent: function ( ) {
			var scrollParent ;
			// Special handling for IE and elements with 'static' or 'relative' position, or 'absolute' position.
			if ( ( $.browser.msie && ( /(static|relative)/ ).test( this.css( 'position' ) ) ) || ( /absolute/ ).test( this.css( 'position' ) ) ) {
				// Filter parents for those that have a non-static position and scrollable overflow.
				scrollParent = this.parents( ).filter( function ( ) {
					return ( /(relative|absolute|fixed)/ ).test( $.curCSS( this, 'position', 1 ) ) && ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) ) ;
				} ).eq( 0 ) ; // Get the first matching parent.
			} else {
				// For other browsers or positions, filter parents for scrollable overflow.
				scrollParent = this.parents( ).filter( function ( ) {
					return ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) ) ;
				} ).eq( 0 ) ; // Get the first matching parent.
			}

			// If the element has 'fixed' position or no scrollable parent is found,
			// return the document as the scroll parent; otherwise, return the found scrollParent.
			return ( /fixed/ ).test( this.css( 'position' ) ) || ! scrollParent.length ? $( document ) : scrollParent ;
		}
	} ) ;


	// Additional custom selectors for jQuery.
	$.extend( $.expr[ ':' ], {
		// Selector for elements that have jQuery data associated with a specific key.
		data: function ( elem, i, match ) {
			// Returns true if $.data(elem, match[3]) is truthy.
			return !! $.data( elem, match[ 3 ] ) ;
		},

		// Selector for focusable elements.
		focusable: function ( element ) {
			var nodeName = element.nodeName.toLowerCase( ) ,
				tabIndex = $.attr( element, 'tabindex' ) ;
			// Elements are focusable if they are input, select, textarea, button, object and not disabled.
			return ( /input|select|textarea|button|object/ .test( nodeName )
				? ! element.disabled
				// Or if they are an anchor or area with an href or a valid tabindex.
				: 'a' == nodeName || 'area' == nodeName
					? element.href || ! isNaN( tabIndex )
					// Or if they have a valid tabindex.
					: ! isNaN( tabIndex ) )
				// Additionally, the element and all its ancestors must be visible.
				// The browser might report an area as hidden, so special handling is needed.
				&& ! $( element )[ 'area' == nodeName ? 'parents' : 'closest' ]( ':hidden' ).length ;
		},

		// Selector for tabbable elements (focusable elements that can be reached via Tab key).
		tabbable: function ( element ) {
			var tabIndex = $.attr( element, 'tabindex' ) ;
			// A tabbable element must have a valid or non-negative tabindex and also be focusable.
			return ( isNaN( tabIndex ) || tabIndex >= 0 ) && $( element ).is( ':focusable' ) ;
		}
	} ) ;


	// The $.widget factory is a central component for creating jQuery UI plugins.
	// It extracts common boilerplate code, simplifying plugin development.
	$.widget = function ( name, prototype ) {
		// Split the widget name into namespace and actual name.
		var namespace = name.split( "." )[ 0 ] ,
			fullName ;
		name = name.split( "." )[ 1 ] ;
		// Construct the full widget name, e.g., "ui-draggable".
		fullName = namespace + '-' + name ;

		// Create a custom jQuery selector for this plugin, e.g., ":ui-draggable".
		$.expr[ ':' ][ fullName ] = function ( elem ) {
			// The selector returns true if the element has data associated with the widget name.
			return !! $.data( elem, name ) ;
		} ;

		// Create the jQuery plugin method, e.g., $.fn.draggable().
		$.fn[ name ] = function ( options ) {
			// Determine if the call is a method call (string) or an initialization (object).
			var isMethodCall = ( typeof options == 'string' ) ,
				// Extract arguments after the first one.
				args = Array.prototype.slice.call( arguments, 1 ) ,
				// Initialize return value to the jQuery object itself.
				returnValue = this ;

			// Prevent calls to internal methods (those starting with '_').
			if ( isMethodCall && options.substring( 0, 1 ) == '_' ) {
				// If an internal method is called, simply return the jQuery object.
				return returnValue ;
			}

			// Branch based on whether it's a method call or initialization.
			( isMethodCall
				// If it's a method call:
				? this.each( function ( ) {
					var instance = $.data( this, name ) ,
						// Get the method's return value, or the instance itself if method doesn't exist.
						methodValue = ( instance && $.isFunction( instance[ options ] )
							? instance[ options ].apply( instance, args )
							: instance ) ;
					// If the method returned a different value than the instance, update returnValue.
					if ( methodValue !== instance ) {
						returnValue = methodValue ;
						// Stop iteration if a value was returned.
						return false ;
					}
				} )
				// If it's an initialization:
				: this.each( function ( ) {
					// Initialize a new widget instance if one doesn't exist, then call _init().
					( $.data( this, name ) ||
						$.data( this, name, new $[ namespace ][ name ]( this, options ) )._init( ) ) ;
				} ) ) ;

			// Return the jQuery object or the method's return value.
			return returnValue ;
		} ;

		// Ensure the namespace object exists (e.g., $.ui = {}).
		$[ namespace ] = $[ namespace ] || { } ;
		// Create the widget constructor function, e.g., $.ui.draggable.
		$[ namespace ][ name ] = function ( element, options ) {
			var self = this ;

			// Assign core properties to the instance.
			this.namespace       = namespace ;
			this.widgetName      = name ;
			// Determine the event prefix, e.g., "draggable".
			this.widgetEventPrefix = $[ namespace ][ name ].eventPrefix || name ;
			// Assign the base CSS class, e.g., "ui-draggable".
			this.widgetBaseClass = fullName ;

			// Merge options from defaults, plugin defaults, metadata, and user-provided options.
			this.options = $.extend( true, { } ,
				$.widget.defaults, // Global widget defaults.
				$[ namespace ][ name ].defaults, // Specific widget defaults.
				$.metadata && $.metadata.get( element )[ name ], // Options from element metadata.
				options // User-provided options.
			) ;

			// Wrap the element with jQuery and bind custom events.
			this.element = $( element )
				// Bind 'setData' event for setting options.
				.bind( 'setData.' + name, function ( event, key, value ) {
					// Only process if the event targets the current element.
					if ( event.target == element ) {
						return self._setData( key, value ) ;
					}
				} )
				// Bind 'getData' event for getting options.
				.bind( 'getData.' + name, function ( event, key ) {
					// Only process if the event targets the current element.
					if ( event.target == element ) {
						return self._getData( key ) ;
					}
				} )
				// Bind 'remove' event to call the destroy method.
				.bind( 'remove', function ( ) {
					return self.destroy( ) ;
				} ) ;
		} ;

		// Extend the widget's prototype with the base widget prototype and the provided prototype.
		$[ namespace ][ name ].prototype = $.extend( { } , $.widget.prototype, prototype ) ;
	} ;

	// Base prototype for all jQuery UI widgets.
	$.widget.prototype = {
		// _init is called after the widget is created. It's meant for initialization logic.
		_init: function ( ) { /* No-op by default */ },
		// Destroys the widget, cleaning up its associated data and classes.
		destroy: function ( ) {
			// Remove widget data from the element.
			this.element.removeData( this.widgetName )
				// Remove disabled classes.
				.removeClass( this.widgetBaseClass + '-disabled' + ' ' + this.namespace + '-state-disabled' )
				// Remove aria-disabled attribute.
				.removeAttr( 'aria-disabled' ) ;

			// Return the instance for chaining.
			return this ;
		},

		// Gets or sets widget options.
		option: function ( key, value ) {
			var options = key ,
				self = this ;

			// If 'key' is a string, it's either getting a single option or setting one.
			if ( typeof key == "string" ) {
				// If 'value' is undefined, it's a getter.
				if ( value === undefined ) {
					return this._getData( key ) ;
				}
				// Otherwise, it's a setter for a single option.
				options = { } ;
				options[ key ] = value ;
			}

			// Iterate over the options (either the single one or a map).
			$.each( options, function ( key, value ) {
				self._setData( key, value ) ;
			} ) ;

			// Return the instance for chaining.
			return self ;
		},
		// Internal method to retrieve an option value.
		_getData: function ( key ) {
			return this.options[ key ] ;
		},
		// Internal method to set an option value.
		_setData: function ( key, value ) {
			this.options[ key ] = value ;

			// Special handling if the 'disabled' option is changed.
			if ( key == 'disabled' ) {
				this.element
					// Add or remove disabled classes based on the 'value'.
					[ value ? 'addClass' : 'removeClass' ](
						this.widgetBaseClass + '-disabled' + ' ' +
						this.namespace + '-state-disabled' )
					// Set the 'aria-disabled' attribute accordingly.
					.attr( "aria-disabled", value ) ;
			}
		},

		// Enables the widget.
		enable: function ( ) {
			this._setData( 'disabled', false ) ;
			return this ;
		},
		// Disables the widget.
		disable: function ( ) {
			this._setData( 'disabled', true ) ;
			return this ;
		},

		// Triggers a widget-specific event.
		_trigger: function ( type, event, data ) {
			// Get the callback function from options (if defined).
			var callback = this.options[ type ] ,
				// Determine the full event name (e.g., "draggablecreate").
				eventName = ( type == this.widgetEventPrefix
					? type : this.widgetEventPrefix + type ) ;

			// Create a jQuery event object.
			event = $.Event( event ) ;
			event.type = eventName ;

			// Copy original event properties over to the new event.
			// This is necessary because $.Event doesn't automatically fix properties
			// from an already fixed event.
			if ( event.originalEvent ) {
				for ( var i = $.event.props.length, prop ; i ; ) {
					prop = $.event.props[ -- i ] ;
					event[ prop ] = event.originalEvent[ prop ] ;
				}
			}

			// Trigger the event on the widget's element.
			this.element.trigger( event, data ) ;

			// Return false if the callback explicitly returned false or event was default prevented.
			return ! ( $.isFunction( callback ) && callback.call( this.element[ 0 ], event, data ) === false
				|| event.isDefaultPrevented( ) ) ;
		}
	} ;

	// Default options for all widgets.
	$.widget.defaults = {
		disabled: false // Widgets are enabled by default.
	} ;


	/**
	 * Mouse Interaction Plugin
	 * This module provides common mouse interaction logic for UI widgets.
	 * It handles mouse down, move, and up events, including delay and distance thresholds.
	 **/

	$.ui.mouse = {
		// Initializes mouse event handling for the widget.
		_mouseInit: function ( ) {
			var self = this ;

			this.element
				// Bind mousedown event to start mouse interaction.
				.bind( 'mousedown.' + this.widgetName, function ( event ) {
					return self._mouseDown( event ) ;
				} )
				// Bind click event to prevent default if _preventClickEvent is true.
				.bind( 'click.' + this.widgetName, function ( event ) {
					if ( self._preventClickEvent ) {
						self._preventClickEvent = false ;
						event.stopImmediatePropagation( ) ;
						return false ;
					}
				} ) ;

			// Prevent text selection in IE to improve drag behavior.
			if ( $.browser.msie ) {
				this._mouseUnselectable = this.element.attr( 'unselectable' ) ;
				this.element.attr( 'unselectable', 'on' ) ;
			}

			// Initialize the 'started' flag.
			this.started = false ;
		},

		// TODO: Ensure that destroying one instance of the mouse plugin does not
		// inadvertently affect other active instances of the mouse plugin.
		// Destroys mouse event handling, unbinding events and restoring state.
		_mouseDestroy: function ( ) {
			// Unbind all events with the widget's namespace.
			this.element.unbind( '.' + this.widgetName ) ;

			// Restore text selection in IE if it was modified.
			( $.browser.msie
				&& this.element.attr( 'unselectable', this._mouseUnselectable ) ) ;
		},

		// Handles the mousedown event.
		_mouseDown: function ( event ) {
			// Ensure event.originalEvent exists.
			event.originalEvent = event.originalEvent || { } ;
			// Prevent multiple widgets from handling the same mouse event.
			if ( event.originalEvent.mouseHandled ) {
				return ;
			}

			// If a mouse operation was started but mouseup was missed (e.g., mouse out of window),
			// simulate a mouseup to clean up.
			( this._mouseStarted && this._mouseUp( event ) ) ;

			// Store the initial mousedown event.
			this._mouseDownEvent = event ;

			var self        = this ,
				// Check if the left mouse button was pressed.
				btnIsLeft   = ( event.which == 1 ) ,
				// Determine if the target element is a 'cancel' element (should prevent interaction).
				elIsCancel  = ( typeof this.options.cancel == "string" ? $( event.target ).parents( ).add( event.target ).filter( this.options.cancel ).length : false ) ;
			// If not left button, or target is a cancel element, or _mouseCapture returns false,
			// let the event propagate normally.
			if ( ! btnIsLeft || elIsCancel || ! this._mouseCapture( event ) ) {
				return true ;
			}

			// Set mouseDelayMet flag based on whether a delay is configured.
			this.mouseDelayMet = ! this.options.delay ;
			// If a delay is configured, set a timeout to mark mouseDelayMet as true.
			if ( ! this.mouseDelayMet ) {
				this._mouseDelayTimer = setTimeout( function ( ) {
					self.mouseDelayMet = true ;
				}, this.options.delay ) ;
			}

			// If both distance and delay conditions are met, attempt to start the mouse interaction.
			if ( this._mouseDistanceMet( event ) && this._mouseDelayMet( event ) ) {
				this._mouseStarted = ( this._mouseStart( event ) !== false ) ;
				// If _mouseStart returned false, prevent default and return true.
				if ( ! this._mouseStarted ) {
					event.preventDefault( ) ;
					return true ;
				}
			}

			// Create delegates for mousemove and mouseup to maintain 'this' context.
			this._mouseMoveDelegate = function ( event ) {
				return self._mouseMove( event ) ;
			} ;
			this._mouseUpDelegate = function ( event ) {
				return self._mouseUp( event ) ;
			} ;
			// Bind global mousemove and mouseup events to the document.
			$( document )
				.bind( 'mousemove.' + this.widgetName, this._mouseMoveDelegate )
				.bind( 'mouseup.' + this.widgetName, this._mouseUpDelegate ) ;

			// Prevent selection of text. In Safari, this needs special handling to avoid
			// breaking select boxes.
			( $.browser.safari || event.preventDefault( ) ) ;

			// Mark the original event as handled to prevent other widgets from processing it.
			event.originalEvent.mouseHandled = true ;
			return true ;
		},

		// Handles the mousemove event.
		_mouseMove: function ( event ) {
			// In IE, if the mouse button is not pressed during a mousemove, it indicates
			// that a mouseup occurred outside the window, so we simulate a mouseup.
			if ( $.browser.msie && ! event.button ) {
				return this._mouseUp( event ) ;
			}

			// If the mouse interaction has started, perform the drag action.
			if ( this._mouseStarted ) {
				this._mouseDrag( event ) ;
				return event.preventDefault( ) ;
			}

			// If the interaction hasn't started yet, but distance and delay conditions are met,
			// attempt to start the interaction.
			if ( this._mouseDistanceMet( event ) && this._mouseDelayMet( event ) ) {
				this._mouseStarted =
					( this._mouseStart( this._mouseDownEvent, event ) !== false ) ;
				// If started, perform drag; otherwise, clean up with mouseup.
				( this._mouseStarted ? this._mouseDrag( event ) : this._mouseUp( event ) ) ;
			}

			// Return true if the mouse interaction has NOT started, false otherwise.
			return ! this._mouseStarted ;
		},

		// Handles the mouseup event.
		_mouseUp: function ( event ) {
			// Unbind the global mousemove and mouseup event handlers.
			$( document )
				.unbind( 'mousemove.' + this.widgetName, this._mouseMoveDelegate )
				.unbind( 'mouseup.' + this.widgetName, this._mouseUpDelegate ) ;

			// If the mouse interaction was active.
			if ( this._mouseStarted ) {
				this._mouseStarted = false ;
				// Determine if a click event should be prevented (e.g., if it was a drag).
				this._preventClickEvent = ( event.target == this._mouseDownEvent.target ) ;
				// Call the _mouseStop method to finalize the interaction.
				this._mouseStop( event ) ;
			}

			// Return false to prevent default click behavior if _preventClickEvent was set.
			return false ;
		}
} ) ;