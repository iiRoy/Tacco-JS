/*
 * Responsive Font - Version 1.3 - Updated 2014-05-12
 * Find me on Twitter: https://twitter.com/gagnon_KA
 *
 * Copyright (c) 2013 Karl-André Gagnon. All rights reserved.
 * Project hosted on GitHub: https://github.com/kagagnon/Responsive-Font/
 *
 * This script is not yet fully compatibility tested across all browsers.
 * Known to work in IE8, Firefox, Chrome, and Safari.
 * Please report any compatibility issues on the GitHub project page.
 */


// -----------------------------------------------------------------------------
// Configuration Options for Responsive Font
// These settings control the behavior of the font sizing.
// -----------------------------------------------------------------------------


/*
 * rf.value          = 'px';        // (string) Specifies the CSS font-size unit (e.g., 'px', 'em', '%').
 *                                  // This defines the unit for the calculated font size.
 *
 * rf.throttle       = false;       // (boolean) If true, updates are throttled during window resize events
 *                                  // to improve performance. If false, updates occur on every resize frame.
 *
 * rf.throttleDelay  = 500;         // (integer) [Required if rf.throttle is true] The delay in milliseconds
 *                                  // after the last resize event before the font size recalculation occurs.
 *
 * rf.override       = false;       // (boolean) If true, the generated CSS rule will include '!important'
 *                                  // to ensure it overrides other styles. Otherwise, standard CSS cascade applies.
 *
 * rf.mediaOrientation = 'width';   // ('width'|'height') Determines whether media queries for font scaling
 *                                  // should primarily be based on the viewport's width or height.
 *
 *
 * Options can be updated directly:
 * rf.value = '%'; // Example: Sets the font unit to percentage.
 *
 * Or using the `rf.options()` method for multiple changes:
 * rf.options({
 *     value        : 'px',
 *     throttle     : true,
 *     throttleDelay: 1000,
 *     override     : true
 * });
 */


// -----------------------------------------------------------------------------
// Public API Methods
// These are the functions and properties available for interacting with Responsive Font.
// -----------------------------------------------------------------------------


/*
 * rf('selector')
 *      - 'selector': A CSS selector string (e.g., 'h1', '.my-class', '#some-id').
 *      - Creates a new Responsive Font instance for the specified selector.
 *      - Returns a `cssFile` object, which represents the managed style.
 *
 * rf.allObj(callback(index, obj cssFile))
 *      - `callback`: A function that will be executed for each `cssFile` instance.
 *          - `this`: Within the callback, `this` refers to the current `cssFile` object.
 *          - `index`: The zero-based index of the current `cssFile` object in the internal list.
 *          - `cssFile`: The current `cssFile` object.
 *      - Iterates through all created `cssFile` objects, executing the provided callback.
 *
 * cssFile.changeSelector('selector')
 *      - 'selector': The new CSS selector string.
 *      - Modifies the selector for the current `cssFile` instance.
 *      - Returns the `cssFile` object for chaining.
 *
 * cssFile.setQueryPoint({width : value[, width : value, ...]}, orientation)
 *      - `queries`: An object where keys are viewport breakpoints (integers in px)
 *                   and values are the corresponding font sizes (integers).
 *      - `orientation`: (string, optional) Specifies 'width' or 'height' for these specific queries.
 *                       If omitted, `rf.mediaOrientation` is used.
 *      - Defines breakpoints and their associated font sizes for responsive scaling.
 *      - Returns the `cssFile` object for chaining.
 *
 * cssFile.fontValue([value])
 *      - `value`: (string, optional) The CSS font-size unit (e.g., 'px', 'em').
 *      - If `value` is provided, sets the font size unit for this `cssFile` instance.
 *      - If `value` is omitted, returns the current font size unit for this instance.
 *      - Returns the `cssFile` object for chaining if a `value` is provided.
 *
 * cssFile.update()
 *      - Manually triggers a recalculation and update of the font size for this instance.
 *      - Returns the `cssFile` object for chaining.
 *
 * cssFile.remove()
 *      - Deletes the `cssFile` object and removes its associated `<style>` tag from the DOM.
 *      - Returns `void`.
 *
 * cssFile.isImportant(value)
 *      - `value`: (boolean) If true, the font size rule will be marked as `!important`.
 *                 If false, `!important` is removed. If undefined, defaults to true.
 *      - Controls the `!important` declaration for the font style.
 *      - Returns the `cssFile` object for chaining.
 */

; (function (context) {
	// -------------------------------------------------------------------------
	// Core Utility Functions and Polyfills
	// These are internal helper functions not exposed to the public API.
	// -------------------------------------------------------------------------

	// Polyfill for Array.prototype.indexOf for IE compatibility
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (searchElement, fromIndex) {
			var i,
				pivot = (fromIndex) ? fromIndex : 0,
				length;

			if (!this) {
				throw new TypeError(); // Ensure 'this' is defined
			}

			length = this.length; // Cache array length

			if (length === 0 || pivot >= length) {
				return -1; // Empty array or pivot out of bounds
			}

			if (pivot < 0) {
				pivot = length - Math.abs(pivot); // Handle negative pivot
			}

			for (i = pivot; i < length; i++) {
				if (this[i] === searchElement) {
					return i; // Element found
				}
			}
			return -1; // Element not found
		};
	}

	// Internal utility functions
	var utils = {
		// Retrieves current viewport dimensions
		viewport: function () {
			var e = window,
				a = 'inner';
			if (!('innerWidth' in window)) {
				// Fallback for older IE
				a = 'client';
				e = document.documentElement || document.body;
			}
			return {
				width: e[a + 'Width'],
				height: e[a + 'Height']
			};
		},

		// Handles window resize events, applying throttling if configured
		resize: function () {
			if (rf.throttle) {
				clearTimeout(utils.resize.timer); // Clear previous timer
				utils.resize.timer = setTimeout(utils.loopObj, rf.throttleDelay) // Set new throttled timer
			} else {
				utils.loopObj() // Update immediately
			}
		},

		// Iterates through all registered cssFile objects and updates them
		loopObj: function () {
			for (var c = 0, l = allObj.length; c < l; c++) {
				allObj[c].update(); // Call update method on each object
			}
		}
	}

	// -------------------------------------------------------------------------
	// Event Binding and Global Initialization
	// Attaches the resize event listener and sets up the global 'rf' object.
	// -------------------------------------------------------------------------

	// Bind the resize event listener to the window
	if (context.addEventListener) {
		context.addEventListener('resize', utils.resize, false); // Modern browsers
	} else {
		context.attachEvent('onresize', utils.resize); // IE fallback
	}
	utils.resize.timer; // Placeholder for the throttle timer ID

	// Declare 'rf' variable and expose it globally via 'context' (window)
	var rf;
	context.rf = rf = function (selector) {
		// Public function to create a new Responsive Font instance
		return new cssFile(selector);
	}

	// -------------------------------------------------------------------------
	// Default Configuration Options
	// These are the initial settings for the Responsive Font plugin.
	// -------------------------------------------------------------------------

	rf.value = 'px'; // Default font size unit
	rf.throttle = false; // Throttling disabled by default
	rf.throttleDelay = 500; // Default throttle delay (ms)
	rf.override = false; // '!important' disabled by default
	rf.mediaOrientation = 'width'; // Default media query orientation

	// Method to update multiple options at once
	rf.options = function (objOptions) {
		for (x in objOptions) {
			if (objOptions.hasOwnProperty(x)) { // Ensure direct properties
				rf[x] = objOptions[x];
			}
		}
	}

	// Method to iterate through all created cssFile objects
	rf.allObj = function (callback) {
		// Loops through each registered object and executes the callback
		for (var c = 0, l = allObj.length; c < l; c++) {
			callback.call(allObj[c], c, allObj[c]); // 'this' in callback refers to cssFile
		}
	}

	// Array to keep track of all active cssFile instances
	var allObj = [];

	// -------------------------------------------------------------------------
	// cssFile Constructor Function
	// Represents a single managed CSS selector and its responsive properties.
	// -------------------------------------------------------------------------

	function cssFile(selector) {
		// Add this new instance to the global list
		allObj.push(this);

		// Initialize instance-specific settings, inheriting from global 'rf'
		this.selector = selector;
		this.watchPoint = {
			width: {},
			height: {}
		}; // Stores breakpoints
		this.setValue = rf.value;
		this.mediaOrientation = rf.mediaOrientation;
		this.important = rf.override ? '!important' : ''; // '!important' status

		// Create and append a <style> element to the document head
		this.styleTag = document.createElement('style');
		document.getElementsByTagName('head')[0].appendChild(this.styleTag);
		this.styleTag.setAttribute('type', 'text/css');

		// Initialize the style tag's content
		try {
			this.styleTag.innerHTML = this.selector + '{}'; // Modern browsers
		} catch (error) {
			this.styleTag.styleSheet.cssText = this.selector + '{}'; // IE fallback
		}
	}

	// -------------------------------------------------------------------------
	// cssFile Prototype Methods
	// These methods define the behavior for individual Responsive Font instances.
	// -------------------------------------------------------------------------

	cssFile.prototype = {
		// Changes the CSS selector for this instance
		changeSelector: function (newSelector) {
			this.selector = newSelector;
			// Update the selector in the style tag's innerHTML
			this.styleTag.innerHTML = this.styleTag.innerHTML.replace(/.*\{/, this.selector + '{');
			return this;
		},

		// Sets media query breakpoints and their corresponding font sizes
		setQueryPoint: function (queries, orientation) {

			if (typeof orientation !== 'string') {
				orientation = ''; // Default to empty string if not a string
			}

			// Normalize orientation input
			orientation = orientation.toLowerCase() === "height" ? "height" :
				orientation.toLowerCase() === "width" ? "width" : null;

			// If orientation is still null, use the default mediaOrientation
			if (orientation === null) {
				orientation = this.mediaOrientation.match(/^(width|height)$/g) ? this.mediaOrientation.toLowerCase() : "width";
			}

			// Assign query points
			for (x in queries) {
				if (queries.hasOwnProperty(x)) {
					this.watchPoint[orientation][x] = queries[x];
				}
			}

			return this.update() // Trigger an update after setting queries
		},

		// Gets or sets the font size unit
		fontValue: function (value) {
			if (typeof value === 'undefined') {
				return this.setValue; // Return current value if no argument
			} else {
				this.setValue = value; // Set new value
				return this.update(); // Trigger update
			}
		},

		// Recalculates and updates the font size based on current viewport and queries
		update: function () {
			var mediaQueries = utils.viewport(), // Current viewport dimensions
				arrWidth = [],
				arrHeight = [],
				minWidth,
				maxWidth,
				minHeight,
				maxHeight;

			// Populate width breakpoints array
			for (x in this.watchPoint.width) {
				if (this.watchPoint.width.hasOwnProperty(x)) {
					arrWidth.push(x);
				}
			}

			// Populate height breakpoints array
			for (x in this.watchPoint.height) {
				if (this.watchPoint.height.hasOwnProperty(x)) {
					arrHeight.push(x);
				}
			}

			// Sort width breakpoints numerically
			arrWidth = arrWidth.sort(function (a, b) {
				return +a > +b ? 1 : -1;
			});

			// Sort height breakpoints numerically
			arrHeight = arrHeight.sort(function (a, b) {
				return +a > +b ? 1 : -1;
			});

			var widthValue; // Declare widthValue outside the loop
			// Calculate font size based on width queries
			if (arrWidth.length > 0) {

				for (var c = 0, l = arrWidth.length; c < l; c++) {
					if (arrWidth[c] <= mediaQueries.width) {
						minWidth = arrWidth[c];
						maxWidth = arrWidth[c + 1];
					} else {
						break; // Break if current breakpoint is larger than viewport
					}
				}

				if (!minWidth && minWidth != 0) { // If no minWidth found (i.e., viewport is smaller than first breakpoint)
					minWidth = arrWidth[0] || 0; // Use the smallest breakpoint or 0
				}

				if (typeof this.watchPoint.width[minWidth] !== 'undefined') {
					if (typeof maxWidth !== 'undefined') {
						// Linear interpolation between two breakpoints
						var lowerVal = this.watchPoint.width[minWidth],
							higherVal = this.watchPoint.width[maxWidth],
							widthValue = (((mediaQueries.width - minWidth) / (maxWidth - minWidth)) * (higherVal - lowerVal)) + lowerVal;
					} else {
						// Use the value of the last applicable breakpoint
						widthValue = this.watchPoint.width[minWidth];
					}
				}
			}

			var heightValue; // Declare heightValue outside the loop
			// Calculate font size based on height queries
			if (arrHeight.length > 0) {

				for (var i = 0, l = arrHeight.length; i < l; i++) {
					if (arrHeight[i] <= mediaQueries.height) {
						minHeight = arrHeight[i];
						maxHeight = arrHeight[i + 1];
					} else {
						break; // Break if current breakpoint is larger than viewport
					}
				}

				if (!minHeight && minHeight != 0) { // If no minHeight found
					minHeight = arrHeight[0] || 0; // Use smallest breakpoint or 0
				}

				if (typeof this.watchPoint.height[minHeight] !== 'undefined') {
					if (typeof maxHeight !== 'undefined') {
						// Linear interpolation for height
						var lowerVal = this.watchPoint.height[minHeight],
							higherVal = this.watchPoint.height[maxHeight],
							heightValue = (((mediaQueries.height - minHeight) / (maxHeight - minHeight)) * (higherVal - lowerVal)) + lowerVal;
					} else {
						heightValue = this.watchPoint.height[minHeight];
					}
				}
			}

			// Combine width and height values if both are present, otherwise use the available one
			var factor = +!!widthValue + +!!heightValue; // Converts booleans to 0 or 1, then sums

			var css = 'font-size : ' + (((widthValue || 0) + (heightValue || 0)) / (factor || 1)) + this.setValue + this.important;

			// Update the style tag's content with the new CSS rule
			try {
				this.styleTag.innerHTML = this.styleTag.innerHTML.replace(/\{.*\}/, '{' + css + '}'); // Modern browsers
			} catch (error) {
				// IE fallback for innerHTML replacement (regex for multiline content)
				this.styleTag.styleSheet.cssText = this.styleTag.styleSheet.cssText.replace(/\{[\s\S]*\}/m, '{' + css + '}');
			}

			return this // Enable method chaining
		},

		// Removes this cssFile instance and its associated style tag
		remove: function () {
			// Remove from the global list of objects
			allObj.splice(allObj.indexOf(this), 1);
			// Remove the style tag from the DOM
			document.getElementsByTagName('head')[0].removeChild(this.styleTag);
		},

		// Sets or unsets the '!important' flag for the font size rule
		isImportant: function (isIt) {
			if (isIt === undefined || isIt) {
				this.important = '!important'; // Set to important
			} else {
				this.important = ''; // Remove important
			}
			return this.update(); // Trigger an update to apply the change
		}
	}
})(window) // Pass 'window' as context for global access