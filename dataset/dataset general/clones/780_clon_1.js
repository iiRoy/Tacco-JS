/*
 * CUBICstate breakdance
 * http://cubicstate.com
 *
 * Date: 28/02/2014
 * Version 1.0.1 - This is an extensively modified version regarding whitespace and comments.
 *
 * This file contains the core logic for the breakdance library,
 * managing responsive breakpoints and related functionalities.
 */


/**
 * container object for our breakdance namespace
 *
 * @return object The public API of the breakdance library.
 */
var breakdance = function (window, document, $) {

	// =========================
	// instance variables - These private variables store the state of the breakdance library.
	var _breakpoints = {};              // Stores all user-defined script-based breakpoints.
	var _domHelper = null;              // A hidden DOM element used for measuring sizes (font, width).
	var _fontTestInterval = 500;        // Interval (in milliseconds) for checking font size changes.
	var _fontTimer = null;              // The timer object for the font size check interval.
	var _fontBase = null;               // Reference font size for detecting changes in em units.
	var _currentBreakpoint = null;      // The name of the currently active breakpoint.
	var _prevBreakpoint = null;         // The name of the previously active breakpoint.

	var _bpTags = ["mobile", "tablet", "default", "large"]; // Default CSS-based breakpoint tags.


	// =========================
	// CONSTRUCTOR
	// This section handles the initialization of the library.

	/**
	 * Initiates all necessary tests and event listeners once the document is ready.
	 *
	 * @method init
	 * @return Void
	 */
	var init = function () {
		$(function () {
			createDOMHelper(); // Create the DOM helper element first.

			// Attach resize event handler to the window.
			$(window).on("resize", function () {
				testBreakPoints(); // Re-evaluate breakpoints on window resize.
				draw();            // Trigger a 'draw' event.
			});

			// Start monitoring for font size changes, which can affect 'em' based breakpoints.
			_fontBase = getDOMHelperHeight(); // Get initial font size reference.
			startFontWatch();                 // Begin the font size watch interval.

			// Perform an initial breakpoint check right after setup.
			testBreakPoints();

			// Trigger an initial 'draw' event now that everything is initialized.
			draw();
		});
	};

	// =========================
	// METHODS
	// This section defines all the core functionalities of the breakdance library.

	/**
	 * Triggers a custom 'draw' event on the window.
	 * This can be used by other modules to respond to layout changes.
	 *
	 * @method draw
	 * @return Void
	 */
	var draw = function () {
		$(window).trigger("draw");
	};

	/**
	 * Performs tests against any script-based breakpoints that have been defined.
	 * This method takes precedence if script breakpoints are present.
	 *
	 * @method testScriptBreakPoints
	 * @return Void
	 */
	var testScriptBreakPoints = function () {
		// Iterate through all defined script breakpoints.
		var bp = null;
		for (var bpName in _breakpoints) {
			if (testBP(bpName)) {
				bp = bpName; // Found an active breakpoint.
				break;       // Exit loop as soon as the first matching breakpoint is found.
			}
		}

		// Only fire a breakpoint event if the active breakpoint has actually changed.
		if (_currentBreakpoint != bp) {
			_prevBreakpoint = _currentBreakpoint; // Store the previous breakpoint.
			_currentBreakpoint = bp;              // Update to the new current breakpoint.
			setBodyClass();                       // Update the body class.
			triggerBreakpoint();                  // Announce the breakpoint change.
		}
	};

	/**
	 * Performs tests against CSS-based breakpoints, typically identified via pseudo-elements.
	 * This is used when no script-based breakpoints are defined.
	 *
	 * @method testCSSBreakPoints
	 * @return Void
	 */
	var testCSSBreakPoints = function () {
		// Attempt to retrieve the responsive tag from CSS.
		var tag = getResponsiveTag();
		if (tag.length && (tag != _currentBreakpoint)) {
			// console.log(_currentBreakpoint + " - " + tag); // Debugging line.
			_prevBreakpoint = _currentBreakpoint; // Update previous breakpoint.
			_currentBreakpoint = tag;             // Set the new current breakpoint.
			setBodyClass();                       // Update the body class to reflect the change.
			triggerBreakpoint();                  // Trigger appropriate events.
		}
	};

	/**
	 * Triggers custom events related to breakpoint changes.
	 * Events include `[breakpointName]On`, `[previousBreakpointName]Off`, and a general `breakpoint` event.
	 *
	 * @method triggerBreakpoint
	 * @return Void
	 */
	var triggerBreakpoint = function () {
		if (_currentBreakpoint) {
			$(window).trigger(_currentBreakpoint + "On"); // Event for the new breakpoint becoming active.
		}
		if (_prevBreakpoint) {
			$(window).trigger(_prevBreakpoint + "Off");   // Event for the old breakpoint becoming inactive.
		}
		$(window).trigger("breakpoint", [_currentBreakpoint, _prevBreakpoint]); // General breakpoint change event.
	};

	/**
	 * This is the primary method called to evaluate and update the active breakpoint.
	 * It prioritizes script-based breakpoints over CSS-based ones.
	 *
	 * @method testBreakPoints
	 * @return Void
	 */
	var testBreakPoints = function () {
		if (countBreakpoints()) {
			// If script-based breakpoints are defined, use them.
			testScriptBreakPoints();
		} else {
			// Otherwise, fall back to CSS-based breakpoints.
			testCSSBreakPoints();
		}
	};

	/**
	 * Removes any existing breakpoint-related classes from the 'body' element
	 * and applies the class corresponding to the currently active breakpoint.
	 *
	 * @method setBodyClass
	 * @return Void
	 */
	var setBodyClass = function () {
		var classes = ""; // String to build up classes to remove.

		// Determine which set of breakpoint classes to manage.
		if (countBreakpoints()) {
			// If using script-based breakpoints, generate classes from defined names.
			for (var bpName in _breakpoints) {
				classes += bpName + " ";
			}
		} else {
			// If using CSS-based breakpoints, use the predefined tags.
			for (var i in _bpTags) {
				classes += _bpTags[i] + " ";
			}
		}

		// Remove all potential breakpoint classes from the body.
		$("body").removeClass(classes);

		// Add the class for the current active breakpoint, if one exists.
		if (_currentBreakpoint) {
			$("body").addClass(_currentBreakpoint);
		}
	};

	/**
	 * Initializes and starts the interval timer that periodically checks for changes in font size.
	 * This is crucial for 'em' unit based breakpoints.
	 *
	 * @method startFontWatch
	 * @return Void
	 */
	var startFontWatch = function () {
		_fontTimer = setInterval(testFontSize, _fontTestInterval);
	};

	/**
	 * Clears the interval timer that was used to test for changes in font size, effectively stopping the watch.
	 *
	 * @method stopFontWatch
	 * @return Void
	 */
	var stopFontWatch = function () {
		clearTimeout(_fontTimer); // Stop the interval.
	};

	/**
	 * Compares the current height of the DOM helper element (which reflects the base font size)
	 * against a previously stored value. If a change is detected, breakpoints are re-evaluated.
	 *
	 * @method testFontSize
	 * @return Void
	 */
	var testFontSize = function () {
		var h = getDOMHelperHeight(); // Get the current height (font size).
		if (h != _fontBase) {
			testBreakPoints(); // Font size changed, re-evaluate breakpoints.
			_fontBase = h;     // Update the baseline font size.
		}
	};

	/**
	 * Returns the name of the currently active breakpoint.
	 *
	 * @method currentBreakpoint
	 * @return string The name of the current breakpoint, or null if none is active.
	 */
	var currentBreakpoint = function () {
		return _currentBreakpoint;
	};

	/**
	 * Appends a hidden div element to the body. This element is used
	 * internally to accurately measure CSS units (like 'em', 'px', '%')
	 * and detect changes in font size.
	 *
	 * @method createDOMHelper
	 * @return Void
	 */
	var createDOMHelper = function () {
		_domHelper = $('<div> </div>'); // Create a new div element.
		_domHelper.css({
			position: "absolute", // Position absolutely to take it out of document flow.
			visibility: "hidden", // Make it invisible.
			fontSize: "1em",      // Set font size to 1em for relative measurements.
			height: "1em",        // Set height to 1em.
			width: "1em",         // Set width to 1em.
			padding: 0,           // Remove padding.
			margin: 0,            // Remove margin.
			top: 0,               // Position at top.
			left: -200            // Position off-screen to avoid any visual impact.
		});
		$("body").append(_domHelper); // Add the helper element to the body.
	};

	/**
	 * Resets the width of our DOM helper element to 'auto'.
	 * This is typically done after a specific width measurement has been taken.
	 *
	 * @method resetDOMHelper
	 * @return Void
	 */
	var resetDOMHelper = function () {
		_domHelper.css({
			width: "auto" // Reset width to auto.
		});
	};

	/**
	 * Determines the computed pixel width of our DOM helper element
	 * when its CSS width property is set to a given value (e.g., "600px", "30em", "50%").
	 *
	 * @method getDOMHelperWidth
	 * @param string w - The CSS width value to apply (e.g., "600", "600px", "30em").
	 * @return integer The computed width in pixels.
	 */
	var getDOMHelperWidth = function (w) {
		_domHelper.css({
			width: w // Apply the specified width.
		});
		var width = _domHelper.outerWidth(); // Get the computed outer width.
		resetDOMHelper();                    // Reset the helper's width.
		return width;
	};

	/**
	 * Determines the current height of our DOM helper element.
	 * This is primarily used to get the computed pixel value of "1em".
	 *
	 * @method getDOMHelperHeight
	 * @return integer The computed height in pixels.
	 */
	var getDOMHelperHeight = function () {
		return _domHelper.outerHeight();
	};

	/**
	 * Retrieves the current responsive tag (breakpoint name) as defined in CSS
	 * using the `content` property of a `::after` pseudo-element on the body.
	 *
	 * @method getResponsiveTag
	 * @return string The responsive tag, or "default" if not found or an error occurs.
	 */
	var getResponsiveTag = function () {
		// Reference: http://tech.particulate.me/javascript/2013/10/10/how-to-conveniently-check-for-responsive-breakpoints-in-javascript/
		try {
			// Attempt to get the computed 'content' property from the body's ::after pseudo-element.
			var tag = window.getComputedStyle(document.body, ':after').getPropertyValue('content');
			tag = tag.replace(/"/g, ''); // Firefox bugfix: remove quotes.
			return tag;
		} catch (e) {
			return "default"; // Fallback to "default" if any error occurs (e.g., pseudo-element not found).
		}
	};

	/**
	 * Sets the array of CSS-defined tag names that breakdance should recognize
	 * when managing body classes for CSS-based breakpoints.
	 *
	 * @method setResponsiveTags
	 * @param array pTags - An array of strings, where each string is a CSS-defined tag name.
	 * @return Void
	 */
	var setResponsiveTags = function (pTags) {
		_bpTags = pTags; // Update the internal array of breakpoint tags.
	};

	/**
	 * Returns the current height of the browser window.
	 *
	 * @method height
	 * @return integer The window height in pixels.
	 */
	var height = function () {
		return $(window).height();
	};

	/**
	 * Returns the current width of the browser window.
	 *
	 * @method width
	 * @return integer The window width in pixels.
	 */
	var width = function () {
		return $(window).width();
	};

	/**
	 * Clears all currently defined script-based breakpoints, resetting the internal _breakpoints object.
	 *
	 * @method clearBreakpoints
	 * @return void
	 */
	var clearBreakpoints = function () {
		_breakpoints = {}; // Reinitialize the breakpoints object to empty.
	};

	/**
	 * Adds a new script-defined breakpoint to the system.
	 * This allows for custom, programmatic breakpoint definitions.
	 *
	 * @method addBreakpoint
	 * @param string name - The unique name for this breakpoint (e.g., "desktop", "custom").
	 * @param [string] minWidth - Optional minimum width for the breakpoint (e.g., "600", "600px", "30em").
	 * @param [string] maxWidth - Optional maximum width for the breakpoint (e.g., "800", "800px", "40em").
	 * @return void
	 */
	var addBreakpoint = function (name, minWidth, maxWidth) {
		// Assign default values if minWidth or maxWidth are not provided.
		if (minWidth == undefined) minWidth = 0;
		if (maxWidth == undefined) maxWidth = 99999999; // A very large number to represent infinity.

		// Store the breakpoint definition.
		_breakpoints[name] = {
			min: minWidth,
			max: maxWidth
		};
	};

	/**
	 * Removes a previously added script-defined breakpoint by its name.
	 *
	 * @method removeBreakpoint
	 * @param string name - The name of the breakpoint to remove.
	 * @return void
	 */
	var removeBreakpoint = function (name) {
		delete _breakpoints[name]; // Remove the property from the _breakpoints object.
	};

	/**
	 * Returns the total number of currently defined script-based breakpoints.
	 *
	 * @method countBreakpoints
	 * @return integer The count of script-defined breakpoints.
	 */
	var countBreakpoints = function () {
		var count = 0;
		for (var bpName in _breakpoints) {
			count++; // Increment count for each property in _breakpoints.
		}
		return count;
	};


	/**
	 * Tests a specific script-defined breakpoint against the current window width.
	 * It converts min/max width values (which can be 'em', 'px', etc.) to pixels
	 * using the DOM helper and then checks if the window width falls within this range.
	 *
	 * @method testBP
	 * @param string name - The name of the scripted breakpoint to test.
	 * @return boolean True if the breakpoint is active, false otherwise.
	 */
	var testBP = function (name) {
		var bp = _breakpoints[name]; // Get the breakpoint object.
		if (bp) {
			// Convert min/max width values to pixels using the DOM helper.
			var min = getDOMHelperWidth(bp.min);
			var max = getDOMHelperWidth(bp.max);
			var w = width(); // Get the current window width.

			// Check if the window width is within the breakpoint's range (inclusive).
			if ((w >= min) && (w <= max)) {
				return true;
			}
		}
		return false; // Breakpoint not found or not active.
	};

	/**
	 * Returns an object containing the width and height of the viewport.
	 * This method aims for cross-browser compatibility to get accurate viewport dimensions.
	 *
	 * @method getViewport
	 * @return object An object with `width` and `height` properties.
	 */
	// Reference: http://stackoverflow.com/questions/1766861/find-the-exact-height-and-width-of-the-viewport-in-a-cross-browser-way-no-proto
	var getViewport = function () {
		var w; // Variable for width.
		var h; // Variable for height.

		// Most standards-compliant browsers (Mozilla/Netscape/Opera/IE7+) use window.innerWidth/innerHeight.
		if (typeof window.innerWidth != 'undefined') {
			w = window.innerWidth;
			h = window.innerHeight;
		} else if (typeof document.documentElement != 'undefined'
			&& typeof document.documentElement.clientWidth !=
			'undefined' && document.documentElement.clientWidth != 0) {
			// IE6 in standards-compliant mode (with a valid doctype).
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
		} else {
			// Older versions of IE use document.getElementsByTagName('body')[0].clientWidth/clientHeight.
			w = document.getElementsByTagName('body')[0].clientWidth;
			h = document.getElementsByTagName('body')[0].clientHeight;
		}
		return { width: w, height: h }; // Return the viewport dimensions.
	};


	// =========================
	// Public method declarations
	// This object exposes the public API of the breakdance library.
	var pub = {
		testBreakPoints: testBreakPoints,       // Manually trigger breakpoint testing.
		setResponsiveTags: setResponsiveTags,   // Set CSS-based responsive tags.
		addBreakpoint: addBreakpoint,           // Add a script-based breakpoint.
		removeBreakpoint: removeBreakpoint,     // Remove a script-based breakpoint.
		currentBreakpoint: currentBreakpoint,   // Get the name of the current breakpoint.
		height: height,                         // Get window height.
		width: width,                           // Get window width.
		getViewport: getViewport                // Get viewport dimensions.
	};

	// =========================
	// Initialization and Return
	init();      // Call the initialization function immediately.
	return pub;  // Return the public interface.
}(this, this.document, this.jQuery); // Invoke the IIFE, passing window, document, and jQuery.