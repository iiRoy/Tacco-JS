/*
 * Centralized system for managing application-wide notifications.
 *
 * Given that the software is modularized into distinct components,
 * a signal-based architecture is employed to communicate state
 * changes and actions between different modules.
 */
var SYS_EVENTS = SYS_EVENTS || {};

SYS_EVENTS.IsVerbose = false;
SYS_EVENTS.SingleFireQueue = new Array();

/**
 * Registers a function to be executed when a specific signal is dispatched.
 * This utilizes jQuery's event binding mechanism internally, adhering to its
 * parameter conventions.
 *
 * For more details, consult the jQuery .on() documentation.
 *
 * @param {string|object} signalTypes - One or more event names to register.
 * @param {string|function} targetElement - CSS selector or the callback function.
 * @param {function} callbackFn - The function to invoke upon event trigger.
 * @param {object} contextData - Optional data to pass to the handler.
 */
SYS_EVENTS.RegisterHandler = function (signalTypes, targetElement, callbackFn, contextData) {
	"use strict";
	// Check if the second argument is a function, implying a direct document-level bind
	if (typeof targetElement === 'function') {
		// If multiple signal types are provided as an object
		if (typeof signalTypes === 'object') {
			jQuery.each(signalTypes, function (indexVal, currentSignal) {
				jQuery(document).on(currentSignal, targetElement);
				// If this is a single-fire event, trigger it immediately if already pending
				if (jQuery.inArray(currentSignal, SYS_EVENTS.SingleFireQueue) !== -1) {
					SYS_EVENTS.DispatchEvent(currentSignal, new Array());
				}
			});
		}
		// Single signal type provided
		else {
			jQuery(document).on(signalTypes, targetElement);
			// Check for single-fire status
			if (jQuery.inArray(signalTypes, SYS_EVENTS.SingleFireQueue) !== -1) {
				SYS_EVENTS.DispatchEvent(signalTypes, new Array());
			}
		}
	}
	// The second argument is a selector, indicating delegated event handling
	else {
		// If multiple signal types are provided as an array
		if (typeof signalTypes === 'array') {
			jQuery.each(signalTypes, function (counter, msgType) {
				jQuery(document).on(msgType, targetElement, contextData, callbackFn);
				// If this is a single-fire event, trigger it immediately if already pending
				if (jQuery.inArray(msgType, SYS_EVENTS.SingleFireQueue) !== -1) {
					SYS_EVENTS.DispatchEvent(msgType, new Array());
				}
			});
		}
		// Single signal type provided
		else {
			jQuery(document).on(signalTypes, targetElement, contextData, callbackFn);
			// Check for single-fire status
			if (jQuery.inArray(signalTypes, SYS_EVENTS.SingleFireQueue) !== -1) {
				SYS_EVENTS.DispatchEvent(signalTypes, new Array());
			}
		}
	}
};

/**
 * Deregisters a previously attached function callback from event notifications.
 *
 * Refer to the jQuery .off() documentation for usage details.
 *
 * @param {string|Array} signalTypes - The event name(s) to detach.
 * @param {string} targetElement - Optional CSS selector used for delegation.
 */
SYS_EVENTS.RemoveHandler = function (signalTypes, targetElement) {
	"use strict";

	// Ensure signalTypes is an array for consistent processing if a single string is given
	if (typeof signalTypes === 'string') {
		signalTypes = new Array(signalTypes);
	}

	jQuery(document).off(signalTypes, targetElement);
};

/**
 * Initiates and broadcasts a new application event.
 *
 * Global system events should be prefixed with 'app:', e.g., 'app:initialized'.
 * Specific module actions should be named accordingly, like 'module:data:updated'.
 * The jQuery object will always be passed as the first argument to subscribed functions.
 *
 * @param {string} eventType - The unique identifier for the event.
 * @param {Array} parameters - An array of data to pass to event handlers.
 * @param {boolean} fireOnceFlag - If true, marks this event as a one-time event.
 */
SYS_EVENTS.DispatchEvent = function (eventType, parameters, fireOnceFlag) {
	"use strict";

	SYS_EVENTS.OutputDiagnostic('triggering ' + eventType);

	// Ensure parameters is an array for safety
	if (typeof parameters !== "object") {
		parameters = new Array();
	}

	// Prepend jQuery object to the arguments passed to handlers
	parameters.unshift(jQuery);
	jQuery(document).trigger(eventType, parameters);

	// If this event is designated as a one-time occurrence, add it to the queue
	if (fireOnceFlag) {
		SYS_EVENTS.SingleFireQueue.push(eventType);
	}
};

/**
 * Writes a diagnostic message to the console, contingent on the system's verbosity setting.
 *
 * @param {string} diagnosticText - The message content to output.
 * @param {string} severity - The logging category (e.g., 'standard', 'information', 'critical').
 */
SYS_EVENTS.OutputDiagnostic = function (diagnosticText, severity) {
	"use strict";

	if (SYS_EVENTS.IsVerbose !== false) {
		// Default severity level if none is specified
		if (typeof severity === "undefined") {
			severity = 'standard';
		}
		// Check if console object is available
		if (window.console) {
			switch (severity) {
				case 'standard':
					window.console.log(diagnosticText);
					break;
				case 'information':
					window.console.info(diagnosticText);
					break;
				case 'diagnostic':
					window.console.debug(diagnosticText);
					break;
				case 'critical':
					window.console.error(diagnosticText);
					break;
			}
		}
	}
};

/**
 * Retrieves the descriptive name of the current viewport breakpoint.
 *
 * @returns {string} The name of the active screen class (e.g., 'xs', 'md', 'lg').
 */
SYS_EVENTS.GetViewportSize = function () {
	"use strict";

	return jQuery.fn.responsiveUtil('activeScreenClass');
};

/**
 * Fetches a configuration value based on the closest matching viewport breakpoint.
 *
 * For example, given a configuration object with 'xs' and 'lg' keys,
 * it will return the 'xs' value for 'xs', 'sm', and 'md' viewports,
 * and the 'lg' value for 'lg', 'xl', and 'xxl' viewports.
 *
 * If the configuration object contains a 'base' key, its value will be used
 * as a fallback if no specific breakpoint value is found, instead of
 * inheriting from a smaller breakpoint.
 *
 * @param {object} settingsObject - An object mapping breakpoint names to values.
 *
 * @return {any} The value corresponding to the current or nearest breakpoint.
 */
SYS_EVENTS.SelectConfigByViewport = function (settingsObject) {
	"use strict";

	var activeScreenClass = jQuery.fn.responsiveUtil('activeScreenClass'),
		priorValue = undefined,
		foundEntry = false,
		proceedForward = false,
		defaultVal = settingsObject ? settingsObject["base"] : undefined,
		extractedSetting,
		screenCategories = {
			'xs': 480,
			'sm': 750,
			'md': 896,
			'lg': 992,
			'xl': 1120,
			'xxl': 1400
		};

	jQuery.each(screenCategories, function (indexKey, threshold) {
		// Skip if threshold is invalid or if we're not yet at the current breakpoint and not proceeding
		if (threshold < 1 || (!proceedForward && threshold > screenCategories[activeScreenClass])) {
			return;
		}

		// If a value exists for the current threshold
		if (typeof settingsObject[threshold] !== "undefined") {
			extractedSetting = settingsObject[threshold];
			proceedForward = false;
			foundEntry = true;
		} else {
			foundEntry = false;
		}

		// If the current threshold matches the active screen class
		if (threshold === screenCategories[activeScreenClass]) {
			// If no specific value was found for this breakpoint, use the default
			if (!foundEntry) {
				extractedSetting = defaultVal;
				proceedForward = true;
			}
		}
	});

	return extractedSetting;
};

/**
 * Determines if the user interface is currently rendered for desktop-sized screens.
 *
 * @return {boolean} True if the active viewport is considered a desktop size.
 */
SYS_EVENTS.IsDesktopView = function () {
	"use strict";

	var activeScreenClass = jQuery.fn.responsiveUtil('activeScreenClass');

	return (/^lg|xl|xxl$/.test(activeScreenClass));
};

/**
 * Determines if the user interface is currently rendered for mobile-sized screens.
 *
 * @return {boolean} True if the active viewport is considered a mobile size.
 */
SYS_EVENTS.IsMobileView = function () {
	"use strict";

	var activeScreenClass = jQuery.fn.responsiveUtil('activeScreenClass');

	return (/^xs|sm$/.test(activeScreenClass));
};