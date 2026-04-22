/**
 * Centralized event management system for application components.
 *
 * This module facilitates inter-component communication through a publish-subscribe
 * mechanism, allowing various parts of the application to react to state changes
 * and commands.
 */
const AppBus = AppBus || {};

// Configuration for verbose output in the developer console.
AppBus.IsVerbose = false;
// A registry of events that, once triggered, should immediately notify
// any new subscribers.
AppBus.ProcessedOnceEvents = new Set();
// Internal version tracker for the event bus.
AppBus.Version = '1.1.0-alpha';

/**
 * Registers a callback function to be executed when a specific event occurs.
 * This system leverages jQuery's event delegation capabilities.
 *
 * @param {string|string[]|object} eventKeys - One or more event names, or an object mapping events to handlers.
 * @param {string|Function} targetSelectorOrHandler - A CSS selector for delegated events, or the handler function itself.
 * @param {Function} [handlerFunc] - The function to execute when the event fires (required if targetSelectorOrHandler is a selector).
 * @param {object} [contextData] - Optional data to pass to the handler function.
 */
AppBus.RegisterHandler = function(eventKeys, targetSelectorOrHandler, handlerFunc, contextData) {
	"use strict";

	const docElement = jQuery(document);
	let actualHandler = handlerFunc;
	let selectorString = targetSelectorOrHandler;
	let additionalData = contextData;

	// Validate essential parameters early.
	if (!eventKeys || (typeof eventKeys !== 'string' && !Array.isArray(eventKeys) && typeof eventKeys !== 'object')) {
		AppBus.OutputMessage("Invalid event key(s) provided for subscription.", 'error');
		return;
	}

	if (typeof targetSelectorOrHandler === 'function') {
		actualHandler = targetSelectorOrHandler;
		selectorString = undefined; // No selector, direct binding
		additionalData = handlerFunc; // If data was passed as 3rd arg
	}

	if (typeof actualHandler !== 'function') {
		AppBus.OutputMessage("A valid handler function is required for event subscription.", 'error');
		return;
	}

	const processSingleEvent = (eventKey) => {
		if (selectorString) {
			docElement.on(eventKey, selectorString, additionalData, actualHandler);
		} else {
			docElement.on(eventKey, additionalData, actualHandler);
		}

		// If this event has already been marked as 'processed once',
		// trigger the handler immediately for this new subscription.
		if (AppBus.ProcessedOnceEvents.has(eventKey)) {
			// Trigger with an empty payload as the original event's context might be lost.
			AppBus.EmitEvent(eventKey, [], false); // Do not re-mark as ephemeral
			AppBus.OutputMessage(`Immediately notifying new subscriber for previously fired ephemeral event: '${eventKey}'`, 'info');
		}
	};

	// Handle different input types for eventKeys
	if (Array.isArray(eventKeys)) {
		eventKeys.forEach(processSingleEvent);
	} else if (typeof eventKeys === 'object' && eventKeys !== null) {
		// If eventKeys is an object mapping events to handlers (jQuery style)
		// Note: This path assumes targetSelectorOrHandler is the actual handler,
		// and handlerFunc is contextData.
		const eventMap = eventKeys;
		let mapHandler = targetSelectorOrHandler;
		let mapData = handlerFunc;

		if (typeof mapHandler !== 'function') {
			// This case is not directly handled by the original code's jQuery.on() interpretation
			// for object-style input. We'll simplify to assume object maps directly to handlers.
			AppBus.OutputMessage("Object-based event subscription expects handler as second argument.", 'error');
			return;
		}

		Object.entries(eventMap).forEach(([key, value]) => {
			if (typeof value === 'function') {
				// Each value in the object is a handler for its key
				docElement.on(key, mapData, value); // mapData is contextData here
				if (AppBus.ProcessedOnceEvents.has(key)) {
					AppBus.EmitEvent(key, [], false);
				}
			} else {
				AppBus.OutputMessage(`Skipping invalid handler for event '${key}' in object subscription.`, 'warn');
			}
		});

	} else { // Single string event key
		processSingleEvent(eventKeys);
	}
};

/**
 * Removes a previously registered event handler.
 *
 * @param {string|string[]} eventKeys - The event name(s) to unsubscribe from.
 * @param {string} [targetElement] - The CSS selector used for delegated events.
 */
AppBus.RemoveListener = function(eventKeys, targetElement) {
	"use strict";

	let keysToDeregister = Array.isArray(eventKeys) ? eventKeys : [eventKeys];

	if (!keysToDeregister || keysToDeregister.length === 0) {
		AppBus.OutputMessage("No event key(s) provided for deregistration.", 'warn');
		return;
	}

	jQuery(document).off(keysToDeregister.join(' '), targetElement);
	AppBus.OutputMessage(`Deregistered handlers for event(s): ${keysToDeregister.join(', ')}`, 'info');
};

/**
 * Dispatches a new event across the application.
 *
 * Global events typically follow a `system:action` naming convention (e.g., `core:init`).
 * Specific module actions might be `module:item:status` (e.g., `table:data:updated`).
 * The jQuery object is always prepended to the payload array for convenience.
 *
 * @param {string} eventName - The unique identifier for the event.
 * @param {Array<any>} [payload=[]] - An array of arguments to pass to event handlers.
 * @param {boolean} [markAsEphemeral=false] - If true, this event will be registered as 'processed once',
 *                                            meaning new subscribers will be immediately notified.
 * @returns {boolean} True if the event was successfully triggered, false otherwise.
 */
AppBus.EmitEvent = function(eventName, payload = [], markAsEphemeral = false) {
	"use strict";

	if (typeof eventName !== 'string' || eventName.trim() === '') {
		AppBus.OutputMessage("Cannot emit an event without a valid string name.", 'error');
		return false;
	}

	AppBus.OutputMessage(`Dispatching event: '${eventName}'`, 'log');

	// Ensure payload is an array and prepend jQuery.
	const eventArgs = Array.isArray(payload) ? [...payload] : [payload];
	eventArgs.unshift(jQuery);

	try {
		jQuery(document).trigger(eventName, eventArgs);
		if (markAsEphemeral) {
			AppBus.ProcessedOnceEvents.add(eventName);
			AppBus.OutputMessage(`Event '${eventName}' marked as ephemeral.`, 'info');
		}
		return true;
	} catch (error) {
		AppBus.OutputMessage(`Error dispatching event '${eventName}': ${error.message}`, 'error');
		return false;
	}
};

/**
 * Logs a message to the console if AppBus.IsVerbose is enabled.
 * Supports different log levels.
 *
 * @param {string} messageText - The message content to log.
 * @param {string} [logSeverity='log'] - The severity level ('log', 'info', 'warn', 'error', 'debug').
 */
AppBus.OutputMessage = function(messageText, logSeverity = 'log') {
	"use strict";

	if (!AppBus.IsVerbose) {
		return; // Exit if verbose logging is disabled.
	}

	// Ensure console exists and has the requested method.
	if (typeof console === 'object' && console !== null) {
		const effectiveSeverity = logSeverity in console ? logSeverity : 'log';
		console[effectiveSeverity](`[AppBus] ${messageText}`);
	}
};

/**
 * Retrieves the currently active responsive breakpoint name.
 * Assumes a 'whim' jQuery plugin is available.
 *
 * @returns {string|undefined} The name of the current breakpoint (e.g., 'small', 'medium', 'large'), or undefined if not available.
 */
AppBus.GetActiveBreakpoint = function() {
	"use strict";

	// Guard clause: Check if the 'whim' plugin is available.
	if (typeof jQuery.fn.whim !== 'function') {
		AppBus.OutputMessage("jQuery 'whim' plugin not found. Cannot determine current breakpoint.", 'warn');
		return undefined;
	}
	return jQuery.fn.whim('currentBreakpoint');
};

/**
 * Resolves a configuration value based on the current responsive breakpoint.
 * It searches for a key matching the current breakpoint, then progressively
 * smaller breakpoints if a direct match isn't found, or uses a 'default' key.
 *
 * @param {object} configMap - An object containing breakpoint-keyed values (e.g., `{ small: 'value1', large: 'value2', default: 'fallback' }`).
 * @returns {any|undefined} The resolved value, or undefined if no suitable value is found.
 */
AppBus.FindAdaptiveSetting = function(configMap) {
	"use strict";

	if (typeof configMap !== 'object' || configMap === null) {
		AppBus.OutputMessage("Invalid configuration map provided for adaptive setting resolution.", 'error');
		return undefined;
	}

	const currentLayoutState = AppBus.GetActiveBreakpoint();
	let resolvedValue = configMap.default; // Start with the default fallback.

	// Define breakpoint thresholds in ascending order.
	const breakpointPriorities = {
		'tiny': 0, // Added a new smaller breakpoint
		'small': 480,
		'medium': 768, // Changed value
		'large': 992,
		'xlarge': 1200, // Changed value
		'xxlarge': 1400 // Added a new larger breakpoint
	};

	// Create an array of breakpoint names sorted by their size.
	const sortedBreakpoints = Object.keys(breakpointPriorities)
		.sort((a, b) => breakpointPriorities[a] - breakpointPriorities[b]);

	let foundMatch = false;
	for (const bpName of sortedBreakpoints) {
		// If the current breakpoint is reached or exceeded,
		// and a value exists for this breakpoint, use it.
		// We're looking for the *most specific* value up to the current breakpoint.
		if (breakpointPriorities[bpName] <= breakpointPriorities[currentLayoutState] || !currentLayoutState) {
			if (Object.prototype.hasOwnProperty.call(configMap, bpName)) {
				resolvedValue = configMap[bpName];
				foundMatch = true;
			}
		} else if (foundMatch) {
			// Once we've found a match for a breakpoint *before* the current one,
			// and we've passed the current breakpoint's size, we should stop
			// and use the last found value. This ensures "nearest" smaller.
			break;
		}
	}

	// Final check: if currentLayoutState itself has a direct match, it overrides.
	if (currentLayoutState && Object.prototype.hasOwnProperty.call(configMap, currentLayoutState)) {
		resolvedValue = configMap[currentLayoutState];
	}

	return resolvedValue;
};

/**
 * Determines if the current view is considered "desktop" (large or higher).
 *
 * @returns {boolean} True if the current breakpoint is 'large' or an even larger one, false otherwise.
 */
AppBus.IsDesktopView = function() {
	"use strict";

	const currentLayout = AppBus.GetActiveBreakpoint();
	// Updated regex to be more explicit for 'large' and potentially 'xlarge', 'xxlarge'
	return currentLayout ? /(large|xlarge|xxlarge)/.test(currentLayout) : false;
};

/**
 * Determines if the current view is considered "mobile" (small or lower).
 *
 * @returns {boolean} True if the current breakpoint is 'small' or an even smaller one, false otherwise.
 */
AppBus.IsMobileView = function() {
	"use strict";

	const currentLayout = AppBus.GetActiveBreakpoint();
	// Updated regex to include the new 'tiny' breakpoint
	return currentLayout ? /(small|tiny)/.test(currentLayout) : false;
};

// --- Additional utility function for Type III change ---
/**
 * Provides a simple mechanism to check if a specific event has ever been emitted as ephemeral.
 *
 * @param {string} eventIdentifier - The name of the event to check.
 * @returns {boolean} True if the event has been marked as processed, false otherwise.
 */
AppBus.HasEventOccurred = function(eventIdentifier) {
	"use strict";
	return AppBus.ProcessedOnceEvents.has(eventIdentifier);
};

// Self-initialization or configuration on load
(function() {
	AppBus.OutputMessage(`AppBus module initialized. Version: ${AppBus.Version}`, 'info');
	// Example of adding a guard against re-initialization if AppBus already exists with a different version
	if (window.AppBus && window.AppBus.Version && window.AppBus.Version !== AppBus.Version) {
		AppBus.OutputMessage(`Warning: AppBus version mismatch detected. Current: ${window.AppBus.Version}, New: ${AppBus.Version}`, 'warn');
	}
})();