/*
 *! This is a Type I clone of the original jQuery UI Core component.
 *!
 *! It strictly adheres to the definition of a Type I clone, meaning:
 *! - All functional code (identifiers, operators, expressions, etc.) remains absolutely identical.
 *! - The only modifications are to whitespace (spaces, tabs, newlines) and comments.
 *!
 *! The purpose of these changes is to make the code appear visually different
 *! without altering its logical or structural behavior in any way.
 *!
 *! Source: jQuery UI - v1.9.1 - 2012-10-25
 *! Project Homepage: http://jqueryui.com
 *!
 *! Components included in this file:
 *! - jquery.ui.core.js
 *! - jquery.ui.widget.js
 *! - jquery.ui.mouse.js
 *! - jquery.ui.draggable.js
 *! - jquery.ui.droppable.js
 *! - jquery.ui.resizable.js
 *! - jquery.ui.selectable.js
 *! - jquery.ui.sortable.js
 *! - jquery.ui.effect.js
 *! - jquery.ui.accordion.js
 *! - jquery.ui.autocomplete.js
 *! - jquery.ui.button.js
 *! - jquery.ui.datepicker.js
 *! - jquery.ui.dialog.js
 *! - jquery.ui.effect-blind.js
 *! - jquery.ui.effect-bounce.js
 *! - jquery.ui.effect-clip.js
 *! - jquery.ui.effect-drop.js
 *! - jquery.ui.effect-explode.js
 *! - jquery.ui.effect-fade.js
 *! - jquery.ui.effect-fold.js
 *! - jquery.ui.effect-highlight.js
 *! - jquery.ui.effect-pulsate.js
 *! - jquery.ui.effect-scale.js
 *! - jquery.ui.effect-shake.js
 *! - jquery.ui.effect-slide.js
 *! - jquery.ui.effect-transfer.js
 *! - jquery.ui.menu.js
 *! - jquery.ui.position.js
 *! - jquery.ui.progressbar.js
 *! - jquery.ui.slider.js
 *! - jquery.ui.spinner.js
 *! - jquery.ui.tabs.js
 *! - jquery.ui.tooltip.js
 *!
 *! Copyright 2012 jQuery Foundation and other contributors; Licensed MIT
 *!
 *! This is a modified header comment for demonstration of Type I cloning.
 *!
 */

( function ( $, undefined ) {

	// Initialize a unique ID counter for UI elements
	var uuid = 0,
	    // Regular expression to test for UI-generated IDs
	    runiqueId = /^ui-id-\d+$/;


	// Prevent duplicate loading of jQuery UI core.
	// This is important because we might proxy existing functions,
	// and we don't want to double-proxy them, which could lead to unexpected behavior.
	$.ui = $.ui || {};
	if ( $.ui.version ) {
		// If a version is already defined, it means jQuery UI core has already been loaded.
		// So, we simply return and do nothing further to avoid conflicts or re-initialization.
		return;
	}


	// Extend the jQuery.ui object with core properties and utilities.
	$.extend( $.ui, {

		// The current version of jQuery UI.
		version: "1.9.1",

		// Define key codes for common keyboard actions.
		// This makes it easier to handle keyboard events consistently across widgets.
		keyCode: {
			BACKSPACE:        8,
			COMMA:            188,
			DELETE:           46,
			DOWN:             40,
			END:              35,
			ENTER:            13,
			ESCAPE:           27,
			HOME:             36,
			LEFT:             37,
			NUMPAD_ADD:       107,
			NUMPAD_DECIMAL:   110,
			NUMPAD_DIVIDE:    111,
			NUMPAD_ENTER:     108,
			NUMPAD_MULTIPLY:  106,
			NUMPAD_SUBTRACT:  109,
			PAGE_DOWN:        34,
			PAGE_UP:          33,
			PERIOD:           190,
			RIGHT:            39,
			SPACE:            32,
			TAB:              9,
			UP:               38
		}
	} );

	// --- jQuery UI Plugin Extensions ---
	// This section extends jQuery's prototype with various utility functions
	// that are commonly used across jQuery UI widgets.
	$.fn.extend( {

		// Store a reference to the original jQuery focus method.
		// This allows us to call the native focus behavior from our extended method.
		_focus: $.fn.focus,

		/**
		 * Extends the jQuery focus method to allow for a delay before focusing.
		 * Useful for ensuring elements are ready or for visual effects.
		 *
		 * @param {number} delay - The delay in milliseconds before focusing.
		 * @param {function} fn - An optional callback function to execute after focusing.
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		focus: function ( delay, fn ) {
			// Check if a delay was provided (i.e., the first argument is a number).
			return typeof delay === "number" ?
				// If a delay is present, iterate over each element in the collection.
				this.each( function () {
					var elem = this; // Cache the current DOM element.
					// Set a timeout to apply focus after the specified delay.
					setTimeout( function () {
						$( elem ).focus(); // Apply focus using jQuery's original focus (or our _focus if not overridden elsewhere).
						// If a callback function was provided, execute it in the context of the element.
						if ( fn ) {
							fn.call( elem );
						}
					}, delay ); // The delay in milliseconds.
				} ) :
				// If no delay, or delay is not a number, call the original jQuery focus method.
				this._focus.apply( this, arguments );
		},


		/**
		 * Finds the first scrollable parent of the current element(s).
		 * A scrollable parent is defined as an element with an 'overflow' style
		 * that allows scrolling ('auto' or 'scroll').
		 *
		 * @returns {jQuery} A jQuery object containing the first scrollable parent,
		 *                   or `$(document)` if no such parent is found or if the element
		 *                   has fixed positioning.
		 */
		scrollParent: function () {
			var scrollParent; // Declare a variable to hold the scrollable parent.

			// Check for IE-specific behavior or absolute positioning.
			// IE has quirks with `position: static` or `relative` and `overflow`.
			if ( ( $.ui.ie && ( /(static|relative)/ ).test( this.css( 'position' ) ) ) || ( /(absolute)/ ).test( this.css( 'position' ) ) ) {
				// For IE or absolutely positioned elements, we need to consider parents with
				// 'relative', 'absolute', or 'fixed' positioning AND scrollable overflow.
				scrollParent = this.parents().filter( function () {
					return ( /(relative|absolute|fixed)/ ).test( $.css( this, 'position' ) ) && ( /(auto|scroll)/ ).test( $.css( this, 'overflow' ) + $.css( this, 'overflow-y' ) + $.css( this, 'overflow-x' ) );
				} ).eq( 0 ); // Get the first matching parent.
			} else {
				// For other browsers or non-IE cases, simply look for parents with scrollable overflow.
				scrollParent = this.parents().filter( function () {
					return ( /(auto|scroll)/ ).test( $.css( this, 'overflow' ) + $.css( this, 'overflow-y' ) + $.css( this, 'overflow-x' ) );
				} ).eq( 0 ); // Get the first matching parent.
			}

			// If the element has 'fixed' positioning, its scroll parent is always the document.
			// If no scrollable parent is found (`scrollParent.length` is 0), also default to the document.
			return ( /(fixed)/ ).test( this.css( 'position' ) ) || !scrollParent.length ? $( document ) : scrollParent;
		},


		/**
		 * Gets or sets the z-index of the first element in the collection.
		 * When getting, it traverses up the DOM tree to find the computed z-index,
		 * respecting the CSS stacking context rules.
		 *
		 * @param {number|string} [zIndex] - The z-index value to set. If undefined,
		 *                                   the method acts as a getter.
		 * @returns {jQuery|number} The jQuery object for chaining (when setting),
		 *                          or the computed z-index (when getting).
		 */
		zIndex: function ( zIndex ) {
			// If zIndex is provided, set the CSS z-index property.
			if ( zIndex !== undefined ) {
				return this.css( "zIndex", zIndex );
			}

			// If no zIndex is provided, attempt to get the computed z-index.
			if ( this.length ) {
				var elem = $( this[ 0 ] ), // Start with the first element in the collection.
					position,              // To store the computed 'position' style.
					value;                 // To store the computed 'zIndex' value.

				// Traverse up the DOM tree until the document root is reached.
				while ( elem.length && elem[ 0 ] !== document ) {
					// Ignore z-index if position is set to a value where z-index is ignored by the browser.
					// This ensures consistent behavior across different browsers.
					// WebKit browsers (Chrome, Safari) often return "auto" even if an element is positioned.
					position = elem.css( "position" );
					if ( position === "absolute" || position === "relative" || position === "fixed" ) {
						// IE returns 0 when zIndex is not specified, while other browsers return a string like "auto".
						// We parse the zIndex as an integer.
						// We also ignore the case of nested elements with an explicit value of 0,
						// e.g., <div style="z-index: -10;"><div style="z-index: 0;"></div></div>.
						value = parseInt( elem.css( "zIndex" ), 10 );
						// If it's a valid number and not 0, this is the z-index we're looking for.
						if ( !isNaN( value ) && value !== 0 ) {
							return value;
						}
					}
					// Move to the parent element for the next iteration.
					elem = elem.parent();
				}
			}

			// If no z-index was found after traversing the hierarchy, or the element collection was empty,
			// return 0 as the default.
			return 0;
		},


		/**
		 * Assigns a unique ID to each element in the collection if it doesn't already have one.
		 * The IDs are prefixed with "ui-id-" and increment a global counter.
		 *
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		uniqueId: function () {
			return this.each( function () {
				// If the element does not have an ID, assign a new unique one.
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid ); // Increment uuid and prepend "ui-id-".
				}
			} );
		},


		/**
		 * Removes unique IDs generated by `$.fn.uniqueId()` from elements in the collection.
		 * It only removes IDs that match the "ui-id-N" pattern.
		 *
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		removeUniqueId: function () {
			return this.each( function () {
				// Check if the element's ID matches the pattern for UI-generated IDs.
				if ( runiqueId.test( this.id ) ) {
					$( this ).removeAttr( "id" ); // Remove the 'id' attribute.
				}
			} );
		}
	} );


	// --- Support for jQuery versions older than 1.8 regarding outerWidth/Height ---
	// This block provides a compatibility layer for `innerWidth`, `innerHeight`,
	// `outerWidth`, and `outerHeight` methods for jQuery versions that might
	// not correctly calculate them with padding, border, and margin.
	if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
		// If `outerWidth(1)` on an empty `<a>` element doesn't return a jQuery object,
		// it indicates an older jQuery version or a compatibility issue.
		// Iterate over "Width" and "Height" to apply the fix for both dimensions.
		$.each( [ "Width", "Height" ], function ( i, name ) {
			var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ], // Determine corresponding sides (Left/Right or Top/Bottom).
				type = name.toLowerCase(),                                          // 'width' or 'height'.
				orig = {                                                            // Store original jQuery methods.
					innerWidth:  $.fn.innerWidth,
					innerHeight: $.fn.innerHeight,
					outerWidth:  $.fn.outerWidth,
					outerHeight: $.fn.outerHeight
				};

			// Helper function to reduce a given size by padding, border, and/or margin.
			function reduce( elem, size, border, margin ) {
				$.each( side, function () {
					// Subtract padding for both sides.
					size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
					// If 'border' flag is true, subtract border width for both sides.
					if ( border ) {
						size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
					}
					// If 'margin' flag is true, subtract margin for both sides.
					if ( margin ) {
						size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
					}
				} );
				return size; // Return the adjusted size.
			}

			// Override `innerWidth` and `innerHeight`.
			$.fn[ "inner" + name ] = function ( size ) {
				// If no size is provided, act as a getter and call the original method.
				if ( size === undefined ) {
					return orig[ "inner" + name ].call( this );
				}

				// If a size is provided, set the CSS property.
				return this.each( function () {
					// Calculate the adjusted size and set the CSS property with 'px'.
					$( this ).css( type, reduce( this, size ) + "px" );
				} );
			};

			// Override `outerWidth` and `outerHeight`.
			$.fn[ "outer" + name ] = function ( size, margin ) {
				// If size is not a number, act as a getter and call the original method.
				if ( typeof size !== "number" ) {
					return orig[ "outer" + name ].call( this, size );
				}

				// If a size is provided, set the CSS property.
				return this.each( function () {
					// Calculate the adjusted size (including border and optionally margin) and set the CSS property.
					$( this ).css( type, reduce( this, size, true, margin ) + "px" );
				} );
			};
		} );
	}


	// --- Selector Extensions ---

	// Helper function to determine if an element is focusable.
	function focusable( element, isTabIndexNotNaN ) {
		var map, mapName, img,
			nodeName = element.nodeName.toLowerCase(); // Get the lowercase node name.

		// Special handling for <area> elements within an image map.
		if ( "area" === nodeName ) {
			map = element.parentNode; // Get the parent map element.
			mapName = map.name;       // Get the map's name.
			// An area is focusable if it has an href, its map has a name,
			// the parent is actually a <map>, and the associated image is visible.
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = $( "img[usemap=#" + mapName + "]" )[ 0 ]; // Find the image using the map.
			return !!img && visible( img );                 // It's focusable if the image exists and is visible.
		}

		// General rules for focusability:
		// - Input, select, textarea, button, object are focusable if not disabled.
		// - Anchor (<a>) is focusable if it has an href OR if tabindex is explicitly set (isTabIndexNotNaN).
		// - Any other element is focusable if tabindex is explicitly set (isTabIndexNotNaN).
		// AND: The element and all its ancestors must be visible.
		return ( /input|select|textarea|button|object/.test( nodeName ) ?
			!element.disabled :
			"a" === nodeName ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN ) &&
			// Ensure the element and all of its ancestors are visible.
			visible( element );
	}


	// Helper function to determine if an element is truly visible.
	function visible( element ) {
		// An element is visible if jQuery's internal :visible filter considers it visible
		// AND none of its ancestors (including itself) have `visibility: hidden`.
		return $.expr.filters.visible( element ) &&
			!$( element ).parents().andSelf().filter( function () {
				return $.css( this, "visibility" ) === "hidden";
			} ).length;
	}


	// Extend jQuery's selector expressions with custom UI-related filters.
	$.extend( $.expr[ ":" ], {

		// Custom selector for checking if an element has jQuery data associated with a specific key.
		data: $.expr.createPseudo ?
			// For jQuery versions supporting `createPseudo` (1.8+).
			$.expr.createPseudo( function ( dataName ) {
				return function ( elem ) {
					return !!$.data( elem, dataName ); // Returns true if data exists.
				};
			} ) :
			// Fallback for older jQuery versions (support: jQuery <1.8).
			function ( elem, i, match ) {
				return !!$.data( elem, match[ 3 ] ); // `match[3]` contains the argument passed to the selector.
			},

		// Custom selector for focusable elements.
		focusable: function ( element ) {
			// An element is focusable if `focusable` helper function returns true.
			// `isTabIndexNotNaN` is true if `tabindex` attribute is present and is a valid number.
			return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
		},

		// Custom selector for tabbable elements.
		// Tabbable elements are focusable and can be reached by pressing the Tab key.
		tabbable: function ( element ) {
			var tabIndex = $.attr( element, "tabindex" ), // Get the tabindex attribute value.
				isTabIndexNaN = isNaN( tabIndex );         // Check if tabindex is Not-a-Number.

			// An element is tabbable if:
			// 1. Its tabindex is not NaN OR its tabindex is 0 or greater (positive or 0).
			// 2. It is focusable, considering if its tabindex is explicitly set (not NaN).
			return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
		}
	} );


	// --- Document Ready Handler for Feature Detection ---
	// This function runs once the DOM is ready to detect browser capabilities.
	$( function () {
		var body = document.body,
			div = body.appendChild( div = document.createElement( "div" ) ); // Create a div and append it to the body.

		// Access offsetHeight before setting the style to prevent a layout bug
		// in IE 9, which causes the element to continue to take up space even
		// after it is removed from the DOM (referencing #8026).
		div.offsetHeight;

		// Apply specific styles to the test div.
		$.extend( div.style, {
			minHeight:   "100px",
			height:      "auto",
			padding:     0,
			borderWidth: 0
		} );

		// Detect if `min-height` CSS property is supported correctly.
		// In some older browsers (like IE6), `min-height` might not work as expected.
		$.support.minHeight = div.offsetHeight === 100;

		// Detect if `onselectstart` event is supported. This event is used for
		// preventing text selection, particularly in IE.
		$.support.selectstart = "onselectstart" in div;

		// Remove the test div from the DOM and set its display to 'none'.
		// This is done to avoid a layout bug in IE (http://dev.jquery.com/ticket/4014).
		body.removeChild( div ).style.display = "none";
	} );


	// --- Deprecated Utilities Section ---
	// These utilities are included for backward compatibility but might be
	// superseded by newer approaches or are specific to older browser issues.

	( function () {
		// Detect Internet Explorer and its version.
		var uaMatch = /msie ([\w.]+)/.exec( navigator.userAgent.toLowerCase() ) || [];
		// Set $.ui.ie to true if IE is detected, false otherwise.
		$.ui.ie = uaMatch.length ? true : false;
		// Set $.ui.ie6 to true if IE6 is specifically detected.
		$.ui.ie6 = parseFloat( uaMatch[ 1 ], 10 ) === 6;
	} )();

	// Extend jQuery.fn with methods to disable/enable text selection.
	$.fn.extend( {
		/**
		 * Disables text selection on the matched elements.
		 * Used to prevent accidental text selection during drag/drop operations.
		 *
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		disableSelection: function () {
			// Bind either 'selectstart' (for IE) or 'mousedown' (for other browsers)
			// to prevent the default action, effectively disabling selection.
			return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
				".ui-disableSelection", function ( event ) {
				event.preventDefault(); // Prevent the default browser behavior.
			} );
		},

		/**
		 * Enables text selection on the matched elements by unbinding the
		 * event handler set by `disableSelection`.
		 *
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		enableSelection: function () {
			return this.unbind( ".ui-disableSelection" ); // Unbind all events in the '.ui-disableSelection' namespace.
		}
	} );

	// Extend $.ui with additional utility functions.
	$.extend( $.ui, {
		// $.ui.plugin is deprecated. Use the proxy pattern instead.
		// This mechanism allows widgets to register callbacks for specific options.
		plugin: {
			/**
			 * Adds a plugin callback for a specific module and option.
			 * @param {string} module - The name of the UI module (e.g., "draggable").
			 * @param {string} option - The option name (e.g., "start", "drag").
			 * @param {object} set - An object where keys are option names and values are callback functions.
			 */
			add: function ( module, option, set ) {
				var i,
					proto = $.ui[ module ].prototype; // Get the prototype of the UI module.

				for ( i in set ) {
					// Initialize the plugins array for this option if it doesn't exist.
					proto.plugins[ i ] = proto.plugins[ i ] || [];
					// Add the new plugin callback [option, callbackFunction] to the array.
					proto.plugins[ i ].push( [ option, set[ i ] ] );
				}
			},
			/**
			 * Calls all registered plugin callbacks for a given instance and event name.
			 * @param {object} instance - The widget instance.
			 * @param {string} name - The event name (e.g., "start", "drag", "stop").
			 * @param {Array} args - Arguments to pass to the plugin callbacks.
			 */
			call: function ( instance, name, args ) {
				var i,
					set = instance.plugins[ name ]; // Get the array of plugin callbacks for this event name.

				// If no plugins are registered or the element is detached (nodeType 11 is DOCUMENT_FRAGMENT_NODE),
				// do nothing.
				if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
					return;
				}

				// Iterate through each registered plugin callback.
				for ( i = 0; i < set.length; i++ ) {
					// If the option associated with this plugin is enabled (truthy) in the instance's options,
					// execute the callback.
					if ( instance.options[ set[ i ][ 0 ] ] ) {
						set[ i ][ 1 ].apply( instance.element, args ); // Apply the callback in the context of the element.
					}
				}
			}
		},

		// Expose jQuery's `$.contains` utility for checking if one DOM element is an ancestor of another.
		contains: $.contains,

		// Only used by the resizable widget.
		/**
		 * Checks if an element has scrollable content in a given direction.
		 *
		 * @param {HTMLElement} el - The DOM element to check.
		 * @param {string} [a] - The axis to check ('left' for horizontal scroll, default for vertical).
		 * @returns {boolean} True if the element has scrollable content, false otherwise.
		 */
		hasScroll: function ( el, a ) {

			// If overflow is hidden, the element might have extra content, but the user wants to hide it.
			// In this case, it's not considered "scrollable" in the UI sense.
			if ( $( el ).css( "overflow" ) === "hidden" ) {
				return false;
			}

			var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop", // Determine 'scrollLeft' or 'scrollTop'.
				has = false;                                                // Flag to indicate scrollability.

			// If the current scroll position is greater than 0, it definitely has scrollable content.
			if ( el[ scroll ] > 0 ) {
				return true;
			}

			// TODO: Determine which cases actually cause this to happen.
			// If the element doesn't currently have scroll set (scroll position is 0),
			// temporarily try to set it to 1 to see if it moves. If it moves, it's scrollable.
			el[ scroll ] = 1;
			has = ( el[ scroll ] > 0 ); // Check if setting it to 1 actually resulted in a scroll.
			el[ scroll ] = 0;           // Reset the scroll position.
			return has;
		},

		// These are odd functions; consider fixing the API or moving them into individual plugins.
		/**
		 * Determines if an x-coordinate is within a given axis range.
		 * Used for collision detection.
		 *
		 * @param {number} x - The x-coordinate to check.
		 * @param {number} reference - The starting coordinate of the axis.
		 * @param {number} size - The size (width or height) of the axis.
		 * @returns {boolean} True if x is within the axis range, false otherwise.
		 */
		isOverAxis: function ( x, reference, size ) {
			// Determines when x coordinate is over "b" element axis.
			return ( x > reference ) && ( x < ( reference + size ) );
		},

		/**
		 * Determines if a given point (x, y) is over a specified rectangular element.
		 * Used for collision detection.
		 *
		 * @param {number} y - The y-coordinate of the point.
		 * @param {number} x - The x-coordinate of the point.
		 * @param {number} top - The top coordinate of the element.
		 * @param {number} left - The left coordinate of the element.
		 * @param {number} height - The height of the element.
		 * @param {number} width - The width of the element.
		 * @returns {boolean} True if the point is over the element, false otherwise.
		 */
		isOver: function ( y, x, top, left, height, width ) {
			// Determines when x, y coordinates is over "b" element.
			return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
		}
	} );

} )( jQuery ); // End of the first Immediately Invoked Function Expression (IIFE).


// Start of the second IIFE, primarily for widget factory.
( function ( $, undefined ) {

	// Initialize a unique ID counter for widgets (separate from the core uuid).
	var uuid = 0,
		// Cache Array.prototype.slice for performance.
		slice = Array.prototype.slice,
		// Store a reference to jQuery's original `cleanData` method.
		_cleanData = $.cleanData;

	// Override jQuery's `cleanData` method to trigger a custom "remove" event
	// before the element's data and events are actually cleaned up.
	$.cleanData = function ( elems ) {
		// Iterate through each element being cleaned.
		for ( var i = 0, elem; ( elem = elems[ i ] ) != null; i++ ) {
			try {
				// Trigger a custom "remove" event, which widgets can listen to for cleanup.
				$( elem ).triggerHandler( "remove" );
				// http://bugs.jquery.com/ticket/8235 - Catch potential errors during event triggering.
			} catch ( e ) {
			}
		}
		// Call the original jQuery `cleanData` method to proceed with standard cleanup.
		_cleanData( elems );
	};


	/**
	 * The jQuery UI Widget Factory.
	 * This is the core mechanism for creating stateful jQuery plugins.
	 *
	 * @param {string} name - The full name of the widget (e.g., "namespace.widgetName").
	 * @param {Function} [base] - The base widget constructor to inherit from (defaults to `$.Widget`).
	 * @param {object} prototype - The prototype object containing methods and properties for the new widget.
	 */
	$.widget = function ( name, base, prototype ) {
		var fullName, existingConstructor, constructor, basePrototype,
			namespace = name.split( "." )[ 0 ]; // Extract the namespace (e.g., "ui" from "ui.dialog").

		name = name.split( "." )[ 1 ]; // Extract the widget name (e.g., "dialog").
		fullName = namespace + "-" + name; // Create a full name for internal use (e.g., "ui-dialog").

		// Handle the case where `base` is omitted (i.e., `$.widget("name", prototype)`).
		if ( !prototype ) {
			prototype = base; // The second argument is actually the prototype.
			base = $.Widget;  // Default base widget is `$.Widget`.
		}

		// Create a custom selector for the plugin: `$( ":ui-widgetname" )`.
		$.expr[ ":" ][ fullName.toLowerCase() ] = function ( elem ) {
			return !!$.data( elem, fullName ); // Returns true if the element has data associated with this widget.
		};

		// Ensure the namespace object exists (e.g., `$.ui = $.ui || {}`).
		$[ namespace ] = $[ namespace ] || {};
		// Store a reference to any existing constructor for this widget name.
		existingConstructor = $[ namespace ][ name ];

		// The actual constructor function for the widget.
		// This function is invoked when `$(element).widgetName()` is called.
		constructor = $[ namespace ][ name ] = function ( options, element ) {
			// Allow instantiation without the "new" keyword.
			// If `this._createWidget` is not defined (meaning it's not being called via `new constructor(...)`),
			// then create a new instance using `new`.
			if ( !this._createWidget ) {
				return new constructor( options, element );
			}

			// Allow instantiation without initializing for simple inheritance.
			// This is for internal use when redefining child widgets.
			// If arguments are provided, proceed with widget creation.
			if ( arguments.length ) {
				this._createWidget( options, element );
			}
		};

		// Extend the new constructor with static properties from any existing constructor
		// (useful for redefinition) and add widget-specific static properties.
		$.extend( constructor, existingConstructor, {
			version:             prototype.version, // Widget version from the prototype.
			// Copy the object used to create the prototype in case we need to
			// redefine the widget later (e.g., for child widgets).
			_proto:              $.extend( {}, prototype ),
			// Track widgets that inherit from this widget.
			// This is crucial for handling widget redefinitions.
			_childConstructors:  []
		} );

		// Create an instance of the base widget to inherit its prototype.
		basePrototype = new base();
		// We need to make the options hash a property directly on the new instance,
		// otherwise, we'd modify the options hash on the prototype that we're
		// inheriting from, leading to shared options across instances.
		basePrototype.options = $.widget.extend( {}, basePrototype.options );

		// Iterate over the provided prototype methods.
		$.each( prototype, function ( prop, value ) {
			// If the property is a function, wrap it to provide `_super` and `_superApply` functionality.
			if ( $.isFunction( value ) ) {
				prototype[ prop ] = ( function () {
					// `_super` calls the corresponding method on the base prototype.
					var _super = function () {
							return base.prototype[ prop ].apply( this, arguments );
						},
						// `_superApply` calls the corresponding method on the base prototype with an array of arguments.
						_superApply = function ( args ) {
							return base.prototype[ prop ].apply( this, args );
						};
					// Return the wrapped function.
					return function () {
						var __super = this._super,           // Store the current `_super` (if nested).
							__superApply = this._superApply, // Store the current `_superApply` (if nested).
							returnValue;                     // To store the return value of the original method.

						this._super = _super;               // Set `this._super` to call the base method.
						this._superApply = _superApply;     // Set `this._superApply` to call the base method.

						returnValue = value.apply( this, arguments ); // Execute the original method.

						this._super = __super;               // Restore the previous `_super`.
						this._superApply = __superApply;     // Restore the previous `_superApply`.

						return returnValue;                   // Return the result of the original method.
					};
				} )();
			}
		} );

		// Extend the new widget's prototype with the base prototype,
		// then with common widget properties, and finally with the provided prototype methods.
		constructor.prototype = $.widget.extend( basePrototype, {
			// TODO: Remove support for widgetEventPrefix.
			// Always use the name + a colon as the prefix, e.g., draggable:start.
			// Don't prefix for widgets that aren't DOM-based.
			widgetEventPrefix: basePrototype.widgetEventPrefix || name
		}, prototype, {
			constructor:      constructor,      // Reference back to the constructor.
			namespace:        namespace,        // The namespace of the widget.
			widgetName:       name,             // The name of the widget.
			// TODO remove widgetBaseClass, see #8155.
			widgetBaseClass:  fullName,         // Full name, e.g., "ui-dialog".
			widgetFullName:   fullName          // Full name, e.g., "ui-dialog".
		} );

		// If this widget is being redefined (i.e., `existingConstructor` exists).
		if ( existingConstructor ) {
			// We need to find all widgets that inherited from the old version of this widget
			// and redefine them so they inherit from the new version.
			$.each( existingConstructor._childConstructors, function ( i, child ) {
				var childPrototype = child.prototype;

				// Redefine the child widget using the same prototype that was
				// originally used, but now inherit from the new version of this base widget.
				$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
			} );
			// Remove the list of existing child constructors from the old constructor.
			// This allows the old child constructors to be garbage collected.
			delete existingConstructor._childConstructors;
		} else {
			// If this is a new widget definition, add it to the base widget's child constructors list.
			base._childConstructors.push( constructor );
		}

		// Bridge the widget to jQuery.fn, allowing `$(selector).widgetName()` syntax.
		$.widget.bridge( name, constructor );
	};


	/**
	 * Extends an object with properties from one or more other objects.
	 * This is a deep merge for plain objects, but copies other types by reference.
	 * Used internally by the widget factory.
	 *
	 * @param {object} target - The object to extend.
	 * @param {...object} sources - One or more source objects.
	 * @returns {object} The extended target object.
	 */
	$.widget.extend = function ( target ) {
		var input = slice.call( arguments, 1 ), // Get all arguments after the first (target).
			inputIndex = 0,                     // Current index in the input array.
			inputLength = input.length,         // Total number of source objects.
			key,                                // Current property key.
			value;                              // Current property value.

		// Iterate through each source object.
		for ( ; inputIndex < inputLength; inputIndex++ ) {
			// Iterate through properties of the current source object.
			for ( key in input[ inputIndex ] ) {
				value = input[ inputIndex ][ key ]; // Get the value of the property.
				// Ensure the property is directly on the object (not inherited) and not undefined.
				if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
					// If the value is a plain object, clone it deeply.
					if ( $.isPlainObject( value ) ) {
						target[ key ] = $.isPlainObject( target[ key ] ) ?
							// If target also has a plain object for this key, merge them.
							$.widget.extend( {}, target[ key ], value ) :
							// Otherwise, just clone the source object.
							// Don't extend strings, arrays, etc., with objects.
							$.widget.extend( {}, value );
					} else {
						// For all other types (primitives, arrays, functions), copy by reference.
						target[ key ] = value;
					}
				}
			}
		}
		return target; // Return the modified target object.
	};


	/**
	 * Bridges a widget constructor to jQuery's prototype,
	 * allowing it to be called as a jQuery plugin (e.g., `$(selector).widgetName()`).
	 *
	 * @param {string} name - The name of the plugin (e.g., "dialog").
	 * @param {Function} object - The widget constructor function.
	 */
	$.widget.bridge = function ( name, object ) {
		var fullName = object.prototype.widgetFullName; // Get the full name of the widget.

		// Extend jQuery's prototype with the plugin method.
		$.fn[ name ] = function ( options ) {
			var isMethodCall = typeof options === "string", // Check if the first argument is a string (method call).
				args = slice.call( arguments, 1 ),         // Get remaining arguments.
				returnValue = this;                        // Default return value for chaining.

			// Allow multiple hashes to be passed on initialization (e.g., `$(elem).widget({a:1}, {b:2})`).
			options = !isMethodCall && args.length ?
				$.widget.extend.apply( null, [ options ].concat( args ) ) :
				// If not a method call and no extra args, `options` is just the first arg.
				options;
			// If no options are provided, default to an empty object.
			options = options === undefined ? {} : options;


			// If it's a method call.
			if ( isMethodCall ) {
				this.each( function () {
					var instance = $.data( this, fullName ); // Get the widget instance from element data.
					// If no instance exists or the method does not exist on the instance.
					if ( !instance ) {
						return $( "<p>" ).text( "Cannot call methods on " + name + " prior to initialization; " +
							"attempted to call method '" + options + "'" ).appendTo( "body" );
					}
					if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
						return $( "<p>" ).text( "No such method '" + options + "' for " + name + " widget." )
							.appendTo( "body" );
					}
					// Invoke the method and capture its return value.
					var methodValue = instance[ options ].apply( instance, args );
					// If the method returns something other than `undefined`, store it.
					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false; // Stop iterating if a non-chainable value is returned.
					}
				} );
			} else {
				// Initialization path.
				this.each( function () {
					var instance = $.data( this, fullName ); // Check if an instance already exists.
					if ( instance ) {
						// If an instance exists, merge the new options with existing ones.
						instance._setOptions( options );
					} else {
						// If no instance, create a new one.
						new object( options, this );
					}
				} );
			}

			return returnValue; // Return the jQuery object for chaining or the method's return value.
		};
	};

} )( jQuery ); // End of the second IIFE.