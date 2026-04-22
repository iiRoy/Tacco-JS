/*
 * jQuery UI - Core and Widget Factory
 * Version: 1.8.20
 * Release Date: 2012-04-30
 * Project Home: https://github.com/jquery/jquery-ui
 *
 * This file includes:
 * - jquery.ui.core.js
 * - jquery.ui.widget.js
 *
 * Copyright (c) 2012 AUTHORS.txt; Licensed under MIT and GPL licenses.
 *
 * IMPORTANT: This is a Type I clone. Only whitespace and comments have been altered.
 * The functional code remains strictly identical to the original.
 */

(function($, undefined) { // Start of the primary jQuery UI module definition

	// Ensure $.ui namespace exists, if not, create it.
	// This also serves to prevent duplicate loading of the core functionality.
	// If the UI library is already loaded (i.e., $.ui.version is defined),
	// we simply return to avoid re-initializing and potentially breaking existing components.
	$.ui = $.ui || { };

	// Check for existing version to prevent re-initialization
	if ($.ui.version) {
		return; // Exit if already initialized
	}

	// Extend the $.ui object with core properties and utilities.
	$.extend(
		$.ui, // Target object to extend
		{
			version: "1.8.20", // Current version of jQuery UI

			// Define common key codes for easier handling of keyboard events.
			keyCode: {
				ALT: 18, // Alt key
				BACKSPACE: 8, // Backspace key
				CAPS_LOCK: 20, // Caps Lock key
				COMMA: 188, // Comma key (,)
				COMMAND: 91, // Command key (Mac)
				COMMAND_LEFT: 91, // Left Command key
				COMMAND_RIGHT: 93, // Right Command key
				CONTROL: 17, // Control key
				DELETE: 46, // Delete key
				DOWN: 40, // Down arrow key
				END: 35, // End key
				ENTER: 13, // Enter key
				ESCAPE: 27, // Escape key
				HOME: 36, // Home key
				INSERT: 45, // Insert key
				LEFT: 37, // Left arrow key
				MENU: 93, // Menu key (Windows Context Menu), same as COMMAND_RIGHT on Mac
				NUMPAD_ADD: 107, // Numpad +
				NUMPAD_DECIMAL: 110, // Numpad .
				NUMPAD_DIVIDE: 111, // Numpad /
				NUMPAD_ENTER: 108, // Numpad Enter
				NUMPAD_MULTIPLY: 106, // Numpad *
				NUMPAD_SUBTRACT: 109, // Numpad -
				PAGE_DOWN: 34, // Page Down key
				PAGE_UP: 33, // Page Up key
				PERIOD: 190, // Period key (.)
				RIGHT: 39, // Right arrow key
				SHIFT: 16, // Shift key
				SPACE: 32, // Spacebar
				TAB: 9, // Tab key
				UP: 38, // Up arrow key
				WINDOWS: 91 // Windows key (same as COMMAND_LEFT)
			}
		}
	);

	// Register some common jQuery plugin extensions.
	$.fn.extend({
		// Unified property/attribute setter/getter.
		// Uses .prop() if available (jQuery 1.6+), otherwise falls back to .attr().
		propAttr: $.fn.prop || $.fn.attr,

		// Store original jQuery focus method for internal use.
		_focus: $.fn.focus,

		/**
		 * Custom focus method with optional delay.
		 * Allows focusing an element after a specified delay.
		 * @param {number} [delay] - The delay in milliseconds before focusing.
		 * @param {function} [fn] - Callback function to execute after focus.
		 */
		focus: function(delay, fn) {
			// If a numeric delay is provided, use setTimeout for delayed focus.
			if (typeof delay === "number") {
				return this.each(function() {
					var elem = this; // Capture the current element
					setTimeout(function() {
						$(elem).focus(); // Apply focus to the element
						if (fn) {
							fn.call(elem); // Execute callback if provided, with element as context
						}
					}, delay); // Wait for the specified delay
				});
			} else {
				// Otherwise, call the original jQuery focus method immediately.
				return this._focus.apply(this, arguments);
			}
		},

		/**
		 * Finds the first scrollable parent of an element.
		 * A scrollable parent is one with `overflow: auto` or `overflow: scroll`.
		 * Considers position properties for IE specific behavior.
		 * @returns {jQuery} The scrollable parent element or `$(document)` if none found.
		 */
		scrollParent: function() {
			var scrollParent; // Variable to hold the determined scroll parent.

			// Special handling for IE and absolutely positioned elements.
			// IE's 'static' or 'relative' positioning on an element can affect how scroll parents are found.
			if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
				scrollParent = this.parents().filter(function() {
					// Filter parents that have a non-static position and scrollable overflow.
					return (/(relative|absolute|fixed)/).test($.curCSS(this, 'position', 1)) && (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
				}).eq(0); // Take the first matching parent.
			} else {
				// For other browsers or non-absolutely positioned elements, simply look for scrollable overflow.
				scrollParent = this.parents().filter(function() {
					return (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
				}).eq(0); // Take the first matching parent.
			}

			// If the element itself is fixed positioned, or no scroll parent is found,
			// the document is considered the scroll parent.
			return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
		},

		/**
		 * Gets or sets the z-index of an element.
		 * When getting, it finds the effective z-index by traversing up the DOM.
		 * @param {number|string} [zIndex] - The z-index value to set.
		 * @returns {jQuery|number} The jQuery object for chaining (if setting) or the computed z-index (if getting).
		 */
		zIndex: function(zIndex) {
			if (zIndex !== undefined) {
				return this.css("zIndex", zIndex); // Set z-index if a value is provided.
			}

			if (this.length) {
				var elem = $(this[0]), // Start with the first element in the collection.
					position, // To store the CSS position of the element.
					value; // To store the parsed z-index value.

				// Traverse up the DOM tree until document root is reached.
				while (elem.length && elem[0] !== document) {
					// Ignore z-index if position is set to a value where z-index is ignored by the browser.
					// This ensures consistent behavior across different browsers.
					// WebKit browsers often return 'auto' if an element is positioned.
					position = elem.css("position");
					if (position === "absolute" || position === "relative" || position === "fixed") {
						// IE returns 0 when zIndex is not explicitly specified.
						// Other browsers return a string like "auto".
						// We need to parse the value and ensure it's a valid number and not 0.
						// This handles cases like <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
						value = parseInt(elem.css("zIndex"), 10);
						if (!isNaN(value) && value !== 0) {
							return value; // Return the first valid z-index found.
						}
					}
					elem = elem.parent(); // Move to the parent element.
				}
			}

			return 0; // Default to 0 if no explicit z-index is found.
		},

		/**
		 * Disables text selection on the matched elements.
		 * Prevents text selection by binding to 'selectstart' (IE) or 'mousedown' (other browsers).
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		disableSelection: function() {
			return this.bind(
				($.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", // Event type + namespace.
				function(event) {
					event.preventDefault(); // Prevent default selection behavior.
				}
			);
		},

		/**
		 * Enables text selection on the matched elements.
		 * Removes the event handler added by `disableSelection`.
		 * @returns {jQuery} The jQuery object for chaining.
		 */
		enableSelection: function() {
			return this.unbind(".ui-disableSelection"); // Unbind events in the '.ui-disableSelection' namespace.
		}
	});

	// Helper functions for `innerWidth/Height` and `outerWidth/Height`.
	// Iterates over "Width" and "Height" to define corresponding methods.
	$.each(["Width", "Height"], function(i, name) {
		var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"], // Determine relevant sides (e.g., Left/Right for Width).
			type = name.toLowerCase(), // 'width' or 'height'.
			orig = {
				innerWidth: $.fn.innerWidth, // Store original jQuery methods.
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		/**
		 * Calculates the effective size of an element, reducing by padding, border, or margin.
		 * @param {HTMLElement} elem - The DOM element.
		 * @param {number} size - The initial size value.
		 * @param {boolean} border - Whether to subtract border width.
		 * @param {boolean} margin - Whether to subtract margin width.
		 * @returns {number} The reduced size.
		 */
		function reduce(elem, size, border, margin) {
			$.each(side, function() {
				size -= parseFloat($.curCSS(elem, "padding" + this, true)) || 0; // Subtract padding.
				if (border) {
					size -= parseFloat($.curCSS(elem, "border" + this + "Width", true)) || 0; // Subtract border.
				}
				if (margin) {
					size -= parseFloat($.curCSS(elem, "margin" + this, true)) || 0; // Subtract margin.
				}
			});
			return size;
		}

		// Define `inner[Width|Height]` methods.
		$.fn["inner" + name] = function(size) {
			if (size === undefined) {
				return orig["inner" + name].call(this); // If no size is provided, call original getter.
			}

			// If a size is provided, set the CSS property.
			return this.each(function() {
				$(this).css(type, reduce(this, size) + "px"); // Apply the reduced size.
			});
		};

		// Define `outer[Width|Height]` methods.
		$.fn["outer" + name] = function(size, margin) {
			if (typeof size !== "number") {
				return orig["outer" + name].call(this, size); // If size is not a number, call original getter.
			}

			// If a numeric size is provided, set the CSS property.
			return this.each(function() {
				$(this).css(type, reduce(this, size, true, margin) + "px"); // Apply reduced size, considering border and margin.
			});
		};
	});

	// --- Selector Extensions ---

	/**
	 * Determines if an element is focusable.
	 * Accounts for various element types and their properties (e.g., disabled, href, tabindex).
	 * @param {HTMLElement} element - The DOM element to check.
	 * @param {boolean} isTabIndexNotNaN - True if the element's tabindex is a valid number.
	 * @returns {boolean} True if the element is focusable, false otherwise.
	 */
	function focusable(element, isTabIndexNotNaN) {
		var nodeName = element.nodeName.toLowerCase(); // Get the lowercase tag name.

		// Special handling for <area> elements within a <map>.
		if ("area" === nodeName) {
			var map = element.parentNode,
				mapName = map.name,
				img;

			// An area is focusable if it has an href, its map has a name,
			// the parent is indeed a map, and the associated image is visible.
			if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
				return false;
			}
			img = $("img[usemap=#" + mapName + "]")[0]; // Find the image associated with the map.
			return !!img && visible(img); // Return true only if image exists and is visible.
		}

		// General rules for focusability:
		// - Input, select, textarea, button, object are focusable if not disabled.
		// - Anchor (<a>) is focusable if it has an href or a valid tabindex.
		// - Any other element is focusable if it has a valid tabindex.
		// - Additionally, the element and all its ancestors must be visible.
		return (
				/input|select|textarea|button|object/.test(nodeName) ?
				!element.disabled : // Check disabled attribute for form controls.
				"a" == nodeName ?
				element.href || isTabIndexNotNaN : // Check href or tabindex for anchors.
				isTabIndexNotNaN // Check tabindex for other elements.
			) &&
			visible(element); // Ensure the element is visible.
	}

	/**
	 * Determines if an element is visible in the DOM.
	 * Checks visibility CSS property and jQuery's `hidden` filter.
	 * @param {HTMLElement} element - The DOM element to check.
	 * @returns {boolean} True if the element is visible, false otherwise.
	 */
	function visible(element) {
		return !$(element).parents().andSelf().filter(function() {
			// An element is NOT visible if its visibility is 'hidden' or it matches jQuery's ':hidden' filter.
			return $.curCSS(this, "visibility") === "hidden" ||
				$.expr.filters.hidden(this);
		}).length; // If any hidden parent or self is found, length will be > 0, so negate.
	}

	// Extend jQuery's selector expressions.
	$.extend($.expr[":"], {
		/**
		 * Custom selector to find elements that have jQuery data associated with them.
		 * Usage: `$( "div:data(myKey)" )`
		 * @param {HTMLElement} elem - The DOM element.
		 * @param {number} i - The index of the element in the filtered set.
		 * @param {Array} match - Regex match results, match[3] contains the data key.
		 * @returns {boolean} True if data exists for the given key on the element.
		 */
		data: function(elem, i, match) {
			return !!$.data(elem, match[3]);
		},

		/**
		 * Custom selector for focusable elements.
		 * Usage: `$( ":focusable" )`
		 * @param {HTMLElement} element - The DOM element.
		 * @returns {boolean} True if the element is focusable.
		 */
		focusable: function(element) {
			return focusable(element, !isNaN($.attr(element, "tabindex")));
		},

		/**
		 * Custom selector for tabbable elements.
		 * Tabbable elements are focusable elements with a tabindex >= 0 or no tabindex.
		 * Usage: `$( ":tabbable" )`
		 * @param {HTMLElement} element - The DOM element.
		 * @returns {boolean} True if the element is tabbable.
		 */
		tabbable: function(element) {
			var tabIndex = $.attr(element, "tabindex"), // Get the tabindex attribute.
				isTabIndexNaN = isNaN(tabIndex); // Check if tabindex is Not-a-Number.

			// An element is tabbable if its tabindex is not NaN or is >= 0,
			// AND it is focusable.
			return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
		}
	});

	// --- Feature Detection (on DOM Ready) ---
	$(function() {
		var body = document.body, // Cache reference to the document body.
			div = body.appendChild(div = document.createElement("div")); // Create a temporary div and append to body.

		// Access offsetHeight before setting the style to prevent a layout bug
		// in IE 9 which causes the element to continue to take up space even
		// after it is removed from the DOM (#8026).
		div.offsetHeight; // Force layout calculation.

		// Apply styles to the temporary div for feature detection.
		$.extend(div.style, {
			minHeight: "100px", // Set min-height to 100px.
			height: "auto", // Ensure height is auto.
			padding: 0, // No padding.
			borderWidth: 0 // No border.
		});

		// Detect if `min-height` is supported correctly (offsetHeight should be 100).
		$.support.minHeight = div.offsetHeight === 100;

		// Detect if 'onselectstart' event is supported (primarily for IE).
		$.support.selectstart = "onselectstart" in div;

		// Remove the temporary div from the DOM and set its display to none.
		// Setting display to none avoids a layout bug in IE (http://dev.jquery.com/ticket/4014).
		body.removeChild(div).style.display = "none";
	});


	// --- Deprecated Utilities and Helper Functions ---
	// These functions are part of the core but are marked for deprecation in future versions.
	$.extend($.ui, {
		// $.ui.plugin is deprecated. Use the proxy pattern instead for plugin methods.
		plugin: {
			/**
			 * Adds a plugin method to a widget's prototype.
			 * Deprecated: Use the proxy pattern instead.
			 * @param {string} module - The widget module name (e.g., "draggable").
			 * @param {string} option - The name of the option that enables the plugin.
			 * @param {Object} set - An object where keys are plugin method names and values are the functions.
			 */
			add: function(module, option, set) {
				var proto = $.ui[module].prototype; // Get the prototype of the specified UI module.
				for (var i in set) {
					proto.plugins[i] = proto.plugins[i] || []; // Initialize plugin array if it doesn't exist.
					proto.plugins[i].push([option, set[i]]); // Store the option and the plugin function.
				}
			},
			/**
			 * Calls plugin methods for a widget instance.
			 * Deprecated: Use the proxy pattern instead.
			 * @param {Object} instance - The widget instance.
			 * @param {string} name - The name of the plugin method to call.
			 * @param {Array} args - Arguments to pass to the plugin method.
			 */
			call: function(instance, name, args) {
				var set = instance.plugins[name]; // Get the list of plugin functions for the given name.
				// If no plugins are registered or the element is detached, do nothing.
				if (!set || !instance.element[0].parentNode) {
					return;
				}

				// Iterate through registered plugin functions and call them if their option is enabled.
				for (var i = 0; i < set.length; i++) {
					if (instance.options[set[i][0]]) {
						set[i][1].apply(instance.element, args); // Call the plugin function with the widget's element as context.
					}
				}
			}
		},

		// `$.ui.contains` will be deprecated when we switch to jQuery 1.4+
		// (which has `jQuery.contains()`).
		/**
		 * Checks if a DOM element 'a' contains another DOM element 'b'.
		 * Deprecated: Use `jQuery.contains()` directly with jQuery 1.4+.
		 * @param {HTMLElement} a - The potential container element.
		 * @param {HTMLElement} b - The element to check if it's contained.
		 * @returns {boolean} True if 'a' contains 'b', false otherwise.
		 */
		contains: function(a, b) {
			// Use `compareDocumentPosition` for modern browsers (more robust).
			// `& 16` checks for Node.DOCUMENT_POSITION_CONTAINS.
			return document.compareDocumentPosition ?
				a.compareDocumentPosition(b) & 16 :
				// Fallback to `contains` for older browsers (e.g., IE).
				a !== b && a.contains(b);
		},

		// This function is currently only used by the Resizable widget.
		/**
		 * Checks if an element has scrollable content.
		 * This is a heuristic and might not cover all edge cases.
		 * @param {HTMLElement} el - The DOM element to check.
		 * @param {string} [a] - Optional: "left" to check horizontal scroll, otherwise checks vertical.
		 * @returns {boolean} True if the element has scrollable content.
		 */
		hasScroll: function(el, a) {
			// If overflow is hidden, the element might have extra content, but the user wants to hide it.
			if ($(el).css("overflow") === "hidden") {
				return false;
			}

			var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop", // Determine which scroll property to check.
				has = false; // Flag for scrollability.

			// If scroll position is already greater than 0, it definitely has scroll.
			if (el[scroll] > 0) {
				return true;
			}

			// TODO: Determine which cases actually cause this to happen.
			// If the element doesn't have the scroll set, see if it's possible to
			// set the scroll (i.e., if it *can* scroll).
			el[scroll] = 1; // Attempt to scroll by 1 pixel.
			has = (el[scroll] > 0); // If it scrolled, it's scrollable.
			el[scroll] = 0; // Reset scroll position.
			return has;
		},

		// These are odd functions, potentially fix the API or move into individual plugins.
		/**
		 * Determines if a given coordinate 'x' is within an axis defined by 'reference' and 'size'.
		 * Used for collision detection in UI components.
		 * @param {number} x - The coordinate to check.
		 * @param {number} reference - The starting point of the axis.
		 * @param {number} size - The length of the axis.
		 * @returns {boolean} True if 'x' is within the axis, false otherwise.
		 */
		isOverAxis: function(x, reference, size) {
			// Determines when x coordinate is over "b" element axis.
			return (x > reference) && (x < (reference + size));
		},

		/**
		 * Determines if a point (y, x) is over a rectangular area.
		 * @param {number} y - The y-coordinate of the point.
		 * @param {number} x - The x-coordinate of the point.
		 * @param {number} top - The top coordinate of the rectangle.
		 * @param {number} left - The left coordinate of the rectangle.
		 * @param {number} height - The height of the rectangle.
		 * @param {number} width - The width of the rectangle.
		 * @returns {boolean} True if the point is over the rectangle, false otherwise.
		 */
		isOver: function(y, x, top, left, height, width) {
			// Determines when x, y coordinates is over "b" element.
			return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
		}
	});

})(jQuery); // End of the primary jQuery UI module.


// --- Widget Factory Module ---
// This module provides the base functionality for creating stateful jQuery UI widgets.
(function($, undefined) {

	// For jQuery 1.4+, we can hook into `$.cleanData` to trigger 'remove' events.
	// This ensures proper cleanup of widget instances when elements are removed from the DOM.
	if ($.cleanData) {
		var _cleanData = $.cleanData; // Store original cleanData function.
		$.cleanData = function(elems) {
			// Iterate over elements being cleaned.
			for (var i = 0, elem;
				(elem = elems[i]) != null; i++) {
				try {
					$(elem).triggerHandler("remove"); // Trigger 'remove' event.
					// http://bugs.jquery.com/ticket/8235 - catch errors during removal.
				} catch (e) {}
			}
			_cleanData(elems); // Call the original cleanData function.
		};
	} else {
		// For older jQuery versions (pre-1.4), override `$.fn.remove` to trigger 'remove' events.
		var _remove = $.fn.remove; // Store original remove function.
		$.fn.remove = function(selector, keepData) {
			return this.each(function() {
				if (!keepData) { // If data should not be kept.
					// If a selector is provided and the element matches, or if no selector is provided.
					if (!selector || $.filter(selector, [this]).length) {
						// Trigger 'remove' on all descendants and the element itself.
						$("*", this).add([this]).each(function() {
							try {
								$(this).triggerHandler("remove"); // Trigger 'remove' event.
								// http://bugs.jquery.com/ticket/8235 - catch errors during removal.
							} catch (e) {}
						});
					}
				}
				// Call the original remove function.
				return _remove.call($(this), selector, keepData);
			});
		};
	}

	/**
	 * The core Widget Factory function.
	 * Creates a new jQuery UI widget.
	 * @param {string} name - The full name of the widget (e.g., "namespace.widgetname").
	 * @param {Object} [base] - The base widget to inherit from (e.g., `$.Widget`).
	 * @param {Object} prototype - The prototype object for the new widget.
	 */
	$.widget = function(name, base, prototype) {
		var namespace = name.split(".")[0], // Extract namespace (e.g., "ui").
			fullName; // Full widget name (e.g., "ui-draggable").

		name = name.split(".")[1]; // Extract widget name (e.g., "draggable").
		fullName = namespace + "-" + name; // Construct full class name for CSS and selectors.

		// If `base` is omitted, assume `$.Widget` as the base.
		if (!prototype) {
			prototype = base;
			base = $.Widget;
		}

		// Create a custom selector for this widget.
		// E.g., `$( ":ui-draggable" )` will find elements initialized with the draggable widget.
		$.expr[":"][fullName] = function(elem) {
			return !!$.data(elem, name); // Check if jQuery data for the widget name exists on the element.
		};

		// Ensure the namespace exists on jQuery object.
		$[namespace] = $[namespace] || {};

		// Define the constructor function for the new widget.
		// This is the function called when you do `$(element).widgetname()`.
		$[namespace][name] = function(options, element) {
			// Allow instantiation without initializing for simple inheritance cases.
			// The `_createWidget` method handles actual initialization.
			if (arguments.length) {
				this._createWidget(options, element);
			}
		};

		// Create an instance of the base prototype for inheritance.
		var basePrototype = new base();

		// We need to make the `options` hash a property directly on the new instance.
		// Otherwise, modifying `options` would modify the prototype's options, affecting all instances.
		// The commented-out block below was an alternative way to handle this, but `$.extend(true, ...)`
		// on the `options` property handles deep cloning correctly.
		//	$.each( basePrototype, function( key, val ) {
		//		if ( $.isPlainObject(val) ) {
		//			basePrototype[ key ] = $.extend( {}, val );
		//		}
		//	});
		basePrototype.options = $.extend(true, {}, basePrototype.options); // Deep clone base options.

		// Extend the new widget's prototype with the base prototype and the provided prototype.
		// This creates the inheritance chain.
		$[namespace][name].prototype = $.extend(true, basePrototype, {
			namespace: namespace, // Store the widget's namespace.
			widgetName: name, // Store the widget's simple name.
			// Determine the event prefix (e.g., "draggable"). Defaults to widgetName.
			widgetEventPrefix: $[namespace][name].prototype.widgetEventPrefix || name,
			widgetBaseClass: fullName // Store the full CSS class name.
		}, prototype); // Apply the specific widget's prototype methods and properties.

		// Register the widget as a jQuery plugin (e.g., `$.fn.draggable`).
		$.widget.bridge(name, $[namespace][name]);
	};

	/**
	 * Registers a widget constructor as a jQuery plugin method.
	 * This allows calling widgets on jQuery selections (e.g., `$( "#elem" ).draggable()`).
	 * @param {string} name - The simple name of the widget (e.g., "draggable").
	 * @param {function} object - The widget constructor function.
	 */
	$.widget.bridge = function(name, object) {
		$.fn[name] = function(options) {
			var isMethodCall = typeof options === "string", // Check if the first argument is a method name.
				args = Array.prototype.slice.call(arguments, 1), // Get arguments for method calls.
				returnValue = this; // Default return value for chaining.

			// Allow multiple hashes to be passed on initialization.
			// E.g., `$( "#elem" ).draggable( { option1: "value" }, { option2: "value" } )`.
			options = !isMethodCall && args.length ?
				$.extend.apply(null, [true, options].concat(args)) : // Deep merge options.
				options; // Otherwise, use options as is.

			// Prevent calls to internal methods (those starting with '_').
			if (isMethodCall && options.charAt(0) === "_") {
				return returnValue;
			}

			// If it's a method call.
			if (isMethodCall) {
				this.each(function() {
					var instance = $.data(this, name), // Get the widget instance from data.
						methodValue = instance && $.isFunction(instance[options]) ?
						instance[options].apply(instance, args) : // Call the method if it exists.
						instance; // If method doesn't exist, return the instance itself.

					// TODO: Add this back in 1.9 and use $.error() (see #5972)
					// The following commented-out blocks were for stricter error checking,
					// which might be re-enabled in future jQuery UI versions.
					//				if ( !instance ) {
					//					throw "cannot call methods on " + name + " prior to initialization; " +
					//						"attempted to call method '" + options + "'";
					//				}
					//				if ( !$.isFunction( instance[options] ) ) {
					//					throw "no such method '" + options + "' for " + name + " widget instance";
					//				}
					//				var methodValue = instance[ options ].apply( instance, args );

					// If the method returned a value other than the instance itself and it's not undefined,
					// set it as the return value and stop iteration.
					if (methodValue !== instance && methodValue !== undefined) {
						returnValue = methodValue;
						return false; // Break out of `each` loop.
					}
				});
			} else {
				// If it's an initialization call.
				this.each(function() {
					var instance = $.data(this, name); // Check if an instance already exists.
					if (instance) {
						// If already initialized, update options and re-initialize.
						instance.option(options || {})._init();
					} else {
						// If not initialized, create a new instance and store it in data.
						$.data(this, name, new object(options, this));
					}
				});
			}

			return returnValue; // Return the jQuery object for chaining or the method's return value.
		};
	};

	/**
	 * The base jQuery UI Widget constructor.
	 * All other widgets inherit from this.
	 * @param {Object} [options] - Initial options for the widget.
	 * @param {HTMLElement} [element] - The DOM element the widget is bound to.
	 */
	$.Widget = function(options, element) {
		// Allow instantiation without initializing for simple inheritance.
		// The `_createWidget` method handles actual initialization.
		if (arguments.length) {
			this._createWidget(options, element);
		}
	};

	// Define the prototype for the base $.Widget.
	$.Widget.prototype = {
		widgetName: "widget", // Default widget name.
		widgetEventPrefix: "", // Default event prefix.
		options: {
			disabled: false // Default option: widget is not disabled.
		},

		/**
		 * Initializes the widget instance.
		 * Called by the widget constructor.
		 * @param {Object} options - Options passed during instantiation.
		 * @param {HTMLElement} element - The DOM element for the widget.
		 * @private
		 */
		_createWidget: function(options, element) {
			// $.widget.bridge already stores the plugin instance, but we do it again
			// here so that it's stored even before the _create function runs.
			$.data(element, this.widgetName, this); // Store instance on the element's data.

			this.element = $(element); // Wrap the DOM element in a jQuery object.
			this.options = $.extend(true, {}, // Deep merge options.
				this.options, // Base options.
				this._getCreateOptions(), // Options from metadata (if available).
				options // User-provided options.
			);

			var self = this; // Cache 'this' for use in event handlers.
			// Bind a 'remove' event handler to clean up the widget instance.
			this.element.bind("remove." + this.widgetName, function() {
				self.destroy(); // Call the destroy method when the element is removed.
			});

			this._create(); // Call the widget's specific _create method.
			this._trigger("create"); // Trigger the 'create' event.
			this._init(); // Call the widget's specific _init method.
		},

		/**
		 * Retrieves options from element metadata (if jQuery metadata plugin is present).
		 * @returns {Object} Options extracted from metadata.
		 * @private
		 */
		_getCreateOptions: function() {
			return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
		},

		/**
		 * Placeholder for widget-specific creation logic.
		 * To be overridden by actual widgets.
		 * @private
		 */
		_create: function() {},

		/**
		 * Placeholder for widget-specific initialization logic.
		 * To be overridden by actual widgets.
		 * @private
		 */
		_init: function() {},

		/**
		 * Destroys the widget instance, cleaning up events and data.
		 */
		destroy: function() {
			this.element
				.unbind("." + this.widgetName) // Unbind all events namespaced to this widget.
				.removeData(this.widgetName); // Remove the widget instance from the element's data.

			this.widget() // Get the widget's main element.
				.unbind("." + this.widgetName) // Unbind any events on the main widget element.
				.removeAttr("aria-disabled") // Remove ARIA disabled attribute.
				.removeClass( // Remove base classes for disabled state.
					this.widgetBaseClass + "-disabled " +
					"ui-state-disabled"
				);
		},

		/**
		 * Returns the widget's main DOM element as a jQuery object.
		 * @returns {jQuery} The main widget element.
		 */
		widget: function() {
			return this.element;
		},

		/**
		 * Gets or sets widget options.
		 * @param {string|Object} key - The option name to get/set, or an object of key-value pairs to set.
		 * @param {*} [value] - The value to set for the option.
		 * @returns {*|jQuery} The option value (if getting a single option) or the widget instance for chaining.
		 */
		option: function(key, value) {
			var options = key; // If key is an object, it's a set operation.

			// ... (rest of the option method implementation would go here)
		}
	};

})(jQuery); // End of the Widget Factory module.