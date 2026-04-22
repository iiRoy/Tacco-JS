(function( moduleInitializer ) {
	// Check for AMD (Asynchronous Module Definition) support
	if (typeof define !== 'undefined' && define.amd) {
		define(['jquery'], moduleInitializer);
	} 
	// Check for CommonJS module support (Node.js, Webpack, etc.)
	else if (typeof module !== 'undefined' && module.exports) {
		// Use a local variable for jQuery, acquired via require
		const jq = require('jquery');
		module.exports = moduleInitializer( jq );
	} 
	// Fallback for global scope (browser environment without module loader)
	else {
		// Attach the scroll monitoring functionality to the window object
		window.viewportTracker = moduleInitializer( jQuery );
	}
})(function( jq ) {
	
	// The main object that will be exposed by this module
	const scrollTracker = {};
	
	// Cache jQuery-wrapped window and document elements for performance
	let windowElement = jq(window);
	let documentElement = jq(document);

	// Array to hold all active viewport monitors
	let activeMonitors = [];

	// Define constants for various event types
	const ITEM_VISIBILITY_CHANGE = 'visibilityChange';
	const ITEM_ENTERED_VIEW = 'enterViewport';
	const ITEM_FULLY_ENTERED_VIEW = 'fullyEnterViewport';
	const ITEM_EXITED_VIEW = 'exitViewport';
	const ITEM_PARTIALLY_EXITED_VIEW = 'partiallyExitViewport';
	const ITEM_LOCATION_CHANGE = 'locationChange';
	const ITEM_STATE_CHANGE = 'stateChange';

	// List of all supported event types
	const monitorEventTypes = [
		ITEM_VISIBILITY_CHANGE,
		ITEM_ENTERED_VIEW,
		ITEM_FULLY_ENTERED_VIEW,
		ITEM_EXITED_VIEW,
		ITEM_PARTIALLY_EXITED_VIEW,
		ITEM_LOCATION_CHANGE,
		ITEM_STATE_CHANGE
	];

	// Default offset values for monitor boundaries
	const standardOffsets = { top: 0, bottom: 0 };

	// Publicly accessible viewport metrics
	scrollTracker.currentViewportTop;
	scrollTracker.currentViewportBottom;
	scrollTracker.currentDocumentHeight;
	scrollTracker.currentViewportHeight = windowElement.height(); // Initialize with current height

	// Internal state variables for tracking changes
	let lastKnownDocumentHeight;
	let lastTriggeringEvent; // Stores the event object from the last scroll/resize event

	/**
	 * Updates the current viewport and document dimensions.
	 * Also triggers a location recalculation for monitors if document height changes.
	 */
	function updateViewportMetrics() {
		scrollTracker.currentViewportTop = windowElement.scrollTop();
		scrollTracker.currentViewportBottom = scrollTracker.currentViewportTop + scrollTracker.currentViewportHeight;
		
		// Get document height. Note: height() can be expensive, so we check for changes.
		const newDocumentHeight = documentElement.height();
		scrollTracker.currentDocumentHeight = newDocumentHeight;

		// If the document height has changed, all monitor locations might need re-evaluation
		if (scrollTracker.currentDocumentHeight !== lastKnownDocumentHeight) {
			let monitorIndex = activeMonitors.length;
			while( monitorIndex-- ) {
				activeMonitors[monitorIndex].determineElementBounds();
			}
			lastKnownDocumentHeight = scrollTracker.currentDocumentHeight;
		}
	}

	/**
	 * Recalculates viewport dimensions and then updates and triggers all monitors.
	 */
	function refreshMonitorStatesAndNotify() {
		// Always update viewport height on a refresh
		scrollTracker.currentViewportHeight = windowElement.height();
		updateViewportMetrics();
		processMonitorsAndDispatch();
	}

	// Timer for debouncing resize events
	let refreshScheduleTimer;

	/**
	 * Debounces the refresh operation to prevent excessive calls during rapid events like resizing.
	 */
	function scheduleRefresh() {
		clearTimeout(refreshScheduleTimer);
		// Schedule the refresh to happen after a short delay
		refreshScheduleTimer = setTimeout( refreshMonitorStatesAndNotify, 100 );
	}

	/**
	 * Iterates through all active monitors, first updating their states, then triggering their callbacks.
	 * This two-pass approach ensures all monitor states are current before any callbacks are fired.
	 */
	function processMonitorsAndDispatch() {
		// First pass: Update all monitors' internal states (e.g., isInViewport, isFullyInViewport)
		let monitorIndex = activeMonitors.length;
		while( monitorIndex-- ) {
			activeMonitors[monitorIndex].assessState();
		}

		// Second pass: Trigger callbacks based on the updated states
		monitorIndex = activeMonitors.length;
		while( monitorIndex-- ) {
			activeMonitors[monitorIndex].triggerCallbacks();
		}
	}

	/**
	 * Constructor for a ViewportMonitor instance.
	 * Tracks the visibility and position of a specific DOM element or a defined coordinate.
	 *
	 * @param {HTMLElement|number|object} itemToMonitor - The DOM element, a number representing a fixed scroll position, or an object with 'top'/'bottom' properties.
	 * @param {number|object} [boundaryOffsets] - Custom offsets for the monitor's boundaries. Can be a number (applied to top/bottom) or an object {top: N, bottom: M}.
	 */
	function ViewportMonitor( itemToMonitor, boundaryOffsets ) {
		const self = this; // Maintain a reference to 'this' for internal functions

		this.monitoredItem = itemToMonitor;
		
		// Determine the effective offsets for this monitor
		if (typeof boundaryOffsets === 'number') {
			this.boundaryOffsets = { top: boundaryOffsets, bottom: boundaryOffsets };
		} else {
			this.boundaryOffsets = jq.extend({}, standardOffsets, boundaryOffsets);
		}

		// Store for event handlers, organized by event type
		this.eventHandlers = {}; 
		for (let i = 0, len = monitorEventTypes.length; i < len; i++) {
			self.eventHandlers[monitorEventTypes[i]] = [];
		}

		// Flag to prevent location recalculation if locked
		this.disabledTracking = false;

		// Internal state variables to track previous visibility status
		let previousInViewStatus;
		let previousFullyInViewStatus;
		let previousAboveViewStatus;
		let previousBelowViewStatus;

		/**
		 * Dispatches a list of callbacks for a specific event type.
		 * Removes 'one-time' handlers after they are triggered.
		 * @param {Array<object>} handlersList - Array of handler objects {callback: Function, isOne: boolean}.
		 */
		function dispatchCallbacks( handlersList ) {
			if (handlersList.length === 0) {
				return;
			}
			let handlerIndex = handlersList.length;
			while( handlerIndex-- ) {
				const currentHandler = handlersList[handlerIndex];
				// Call the handler function with the monitor instance and the last event
				currentHandler.callback.call( self, lastTriggeringEvent );
				if (currentHandler.isOne) {
					// Remove one-time handlers
					handlersList.splice(handlerIndex, 1);
				}
			}
		}

		/**
		 * Triggers appropriate callbacks based on changes in the monitor's viewport state.
		 */
		this.triggerCallbacks = function triggerCallbacks() {
			
			// Element just entered the viewport
			if (this.isInViewport && !previousInViewStatus) {
				dispatchCallbacks( this.eventHandlers[ITEM_ENTERED_VIEW] );
			}
			// Element just fully entered the viewport
			if (this.isFullyInViewport && !previousFullyInViewStatus) {
				dispatchCallbacks( this.eventHandlers[ITEM_FULLY_ENTERED_VIEW] );
			}

			// Visibility state (above/below) has changed significantly
			if (this.isAboveViewport !== previousAboveViewStatus || 
				this.isBelowViewport !== previousBelowViewStatus) {

				dispatchCallbacks( this.eventHandlers[ITEM_VISIBILITY_CHANGE] );
				
				// Handle cases where the element is completely skipped over
				if (!previousFullyInViewStatus && !this.isFullyInViewport && (previousInViewStatus || this.isInViewport)) {
					// This means it was not fully in view, and is still not fully in view, but its state changed
					// Could imply it passed through partially or fully, but ended up not fully in view.
					// This block is for complex transitions, might be redundant with others.
				}
				if (!previousInViewStatus && !this.isInViewport && (previousFullyInViewStatus || this.isFullyInViewport)) {
					// Similar to above, but for general in-viewport status
				}
			}

			// Element just partially exited (was fully in, now not)
			if (!this.isFullyInViewport && previousFullyInViewStatus) {
				dispatchCallbacks( this.eventHandlers[ITEM_PARTIALLY_EXITED_VIEW] );
			}
			// Element just completely exited the viewport
			if (!this.isInViewport && previousInViewStatus) {
				dispatchCallbacks( this.eventHandlers[ITEM_EXITED_VIEW] );
			}
			// General visibility status (in/out) has changed
			if (this.isInViewport !== previousInViewStatus) {
				dispatchCallbacks( this.eventHandlers[ITEM_VISIBILITY_CHANGE] );
			}

			// If any core state property has changed, trigger the general state change event
			if (previousInViewStatus !== this.isInViewport ||
				previousFullyInViewStatus !== this.isFullyInViewport ||
				previousAboveViewStatus !== this.isAboveViewport ||
				previousBelowViewStatus !== this.isBelowViewport) {
				dispatchCallbacks( this.eventHandlers[ITEM_STATE_CHANGE] );
			}

			// Update previous state for the next check
			previousInViewStatus = this.isInViewport;
			previousFullyInViewStatus = this.isFullyInViewport;
			previousAboveViewStatus = this.isAboveViewport;
			previousBelowViewStatus = this.isBelowViewport;
		};

		/**
		 * Determines the current top, bottom, and height of the monitored item.
		 * This method updates the monitor's `top`, `bottom`, and `height` properties.
		 * It also triggers a `ITEM_LOCATION_CHANGE` event if the position has shifted.
		 */
		this.determineElementBounds = function() {
			if (this.disabledTracking) {
				return; // Do nothing if tracking is disabled
			}

			const previousTop = this.top;
			const previousBottom = this.bottom;

			// Handle different types of monitored items
			if (this.monitoredItem instanceof Element) { // A DOM element
				// Temporarily make 'none' display elements visible to get accurate dimensions
				const originalDisplay = this.monitoredItem.style.display;
				if (originalDisplay === 'none') {
					this.monitoredItem.style.display = '';
				}
				
				const itemPosition = jq(this.monitoredItem).offset();
				this.top = itemPosition.top;
				this.bottom = itemPosition.top + this.monitoredItem.offsetHeight;

				// Restore original display if it was changed
				if (originalDisplay === 'none') {
					this.monitoredItem.style.display = originalDisplay;
				}

			} else if (typeof this.monitoredItem === 'number' && Number.isFinite(this.monitoredItem)) { // A fixed scroll position number
				// Positive number is a direct scroll position, negative is from document bottom
				if (this.monitoredItem >= 0) {
					this.top = this.bottom = this.monitoredItem;
				} else {
					this.top = this.bottom = scrollTracker.currentDocumentHeight + this.monitoredItem;
				}

			} else if (this.monitoredItem && typeof this.monitoredItem === 'object' && 
					   Number.isFinite(this.monitoredItem.top) && Number.isFinite(this.monitoredItem.bottom)) { 
				// An object with explicit top and bottom properties
				this.top = this.monitoredItem.top;
				this.bottom = this.monitoredItem.bottom;
			} else {
				// Fallback or error for unsupported item types
				console.warn('ViewportMonitor created with an unsupported item type:', this.monitoredItem);
				this.top = this.bottom = 0; // Default to 0 to prevent errors
			}

			// Apply custom offsets to the calculated boundaries
			this.top -= this.boundaryOffsets.top;
			this.bottom += this.boundaryOffsets.bottom;
			this.height = this.bottom - this.top;

			// Trigger location change event if position has genuinely changed
			if ( (previousTop !== undefined && previousBottom !== undefined) && (this.top !== previousTop || this.bottom !== previousBottom) ) {
				dispatchCallbacks( this.eventHandlers[ITEM_LOCATION_CHANGE] );
			}
		};

		// Perform initial calculations and state assessment
		this.determineElementBounds();
		this.assessState();

		// Initialize previous state variables after the first assessment
		previousInViewStatus = this.isInViewport;
		previousFullyInViewStatus = this.isFullyInViewport;
		previousAboveViewStatus = this.isAboveViewport;
		previousBelowViewStatus = this.isBelowViewport;
	}

	// Prototype methods for ViewportMonitor
	ViewportMonitor.prototype = {
		/**
		 * Attaches an event handler for a specific event type.
		 * @param {string} eventType - The type of event to listen for (e.g., 'enterViewport').
		 * @param {Function} handlerFunction - The callback function to execute.
		 * @param {boolean} [isOneTime] - If true, the handler will be removed after its first execution.
		 */
		attach: function( eventType, handlerFunction, isOneTime ) {
			// Basic validation for the callback function
			if (typeof handlerFunction !== 'function') {
				console.error('Invalid callback provided for event type:', eventType);
				return;
			}

			// Immediately trigger the callback if the current state matches the event
			// This provides immediate feedback for newly attached listeners
			let shouldTriggerImmediately = false;
			switch (eventType) {
				case ITEM_VISIBILITY_CHANGE:
					// If it's not in view and above, or similar initial states
					if (!this.isInViewport && this.isAboveViewport || (!this.isInViewport && this.isBelowViewport)) {
						shouldTriggerImmediately = true;
					}
					break;
				case ITEM_ENTERED_VIEW:
					if (this.isInViewport) { shouldTriggerImmediately = true; }
					break;
				case ITEM_FULLY_ENTERED_VIEW:
					if (this.isFullyInViewport) { shouldTriggerImmediately = true; }
					break;
				case ITEM_EXITED_VIEW:
					if (!this.isInViewport && (this.isAboveViewport || this.isBelowViewport)) { shouldTriggerImmediately = true; }
					break;
				case ITEM_PARTIALLY_EXITED_VIEW:
					if (!this.isFullyInViewport && (this.isAboveViewport || this.isBelowViewport)) { shouldTriggerImmediately = true; }
					break;
			}
			
			if (shouldTriggerImmediately) {
				handlerFunction.call(this, lastTriggeringEvent);
				if (isOneTime) {
					return; // If it's a one-time event and triggered, no need to add to list
				}
			}

			// Add the handler to the appropriate event type list
			if (this.eventHandlers[eventType]) {
				this.eventHandlers[eventType].push({ callback: handlerFunction, isOne: isOneTime });
			} else {
				throw new Error(`Attempted to add a viewport monitor listener for an unknown event type: '${eventType}'. Valid options are: ${monitorEventTypes.join(', ')}`);
			}
		},

		/**
		 * Detaches a previously added event handler.
		 * @param {string} eventType - The type of event from which to remove the handler.
		 * @param {Function} handlerFunction - The specific callback function to remove.
		 */
		detach: function( eventType, handlerFunction ) {
			if (this.eventHandlers[eventType]) {
				for (let i = 0, item; (item = this.eventHandlers[eventType][i]); i++) {
					if (item.callback === handlerFunction) {
						this.eventHandlers[eventType].splice(i, 1);
						break;
					}
				}
			} else {
				throw new Error(`Attempted to remove a viewport monitor listener for an unknown event type: '${eventType}'. Valid options are: ${monitorEventTypes.join(', ')}`);
			}
		},

		/**
		 * Attaches a one-time event handler. The handler will be automatically removed after its first execution.
		 * @param {string} eventType - The type of event to listen for.
		 * @param {Function} handlerFunction - The callback function to execute once.
		 */
		attachOnce: function( eventType, handlerFunction ) {
			this.attach( eventType, handlerFunction, true);
		},

		/**
		 * Recalculates the height of the monitored item, useful if its dimensions change dynamically.
		 * Note: This only updates height and bottom, not the top position.
		 */
		updateDimensions: function() {
			if (this.monitoredItem instanceof Element) {
				this.height = this.monitoredItem.offsetHeight + this.boundaryOffsets.top + this.boundaryOffsets.bottom;
				this.bottom = this.top + this.height;
			} else {
				// For non-element items (numbers/objects), height is generally fixed or derived differently
				// A warning might be appropriate here if this method is called on such items.
				console.warn('updateDimensions called on a non-element monitor. This method is primarily for DOM elements.');
			}
		},

		/**
		 * Assesses and updates the current visibility state of the monitored item relative to the viewport.
		 * Sets properties like `isInViewport`, `isFullyInViewport`, `isAboveViewport`, `isBelowViewport`.
		 */
		assessState: function() {
			// Check if the item's top is above the viewport's bottom or its bottom is below the viewport's top
			this.isInViewport = (this.top <= scrollTracker.currentViewportBottom && this.bottom >= scrollTracker.currentViewportTop);
			
			// Check if the item is fully within the viewport
			// This includes cases where the item spans the entire viewport (tall elements)
			this.isFullyInViewport = (this.top >= scrollTracker.currentViewportTop && this.bottom <= scrollTracker.currentViewportBottom) ||
								 (this.isAboveViewport && this.isBelowViewport); // Element is taller than viewport and spans it

			// Check if the item is entirely above the viewport
			this.isAboveViewport = this.bottom < scrollTracker.currentViewportTop;
			// Check if the item is entirely below the viewport
			this.isBelowViewport = this.top > scrollTracker.currentViewportBottom;
		},

		/**
		 * Removes the monitor from the tracking system and clears all its event handlers.
		 */
		removeMonitor: function() {
			const index = activeMonitors.indexOf(this);
			if (index > -1) {
				activeMonitors.splice(index, 1);
			}
			// Clear all stored callbacks to prevent memory leaks
			for (let i = 0, len = monitorEventTypes.length; i < len; i++) {
				this.eventHandlers[monitorEventTypes[i]].length = 0;
			}
		},

		/**
		 * Disables automatic recalculation of the element's position.
		 * The element's position will remain fixed at its last known value.
		 */
		disableTracking: function() {
			this.disabledTracking = true;
		},

		/**
		 * Enables automatic recalculation of the element's position.
		 * The element's position will be updated on scroll/resize events again.
		 */
		enableTracking: function() {
			this.disabledTracking = false;
		}
	};

	/**
	 * Creates a dynamic event handler method for a given event type.
	 * This allows methods like `monitor.enterViewport(callback)` to be generated.
	 * @param {string} eventType - The event type string.
	 * @returns {Function} A function that attaches a handler for the specified event type.
	 */
	const createEventBindingFunction = function (eventType) {
		return function( handlerFunction, isOneTime ) {
			this.attach.call(this, eventType, handlerFunction, isOneTime);
		};
	};

	// Dynamically add event-specific methods to the ViewportMonitor prototype
	for (let i = 0, len = monitorEventTypes.length; i < len; i++) {
		const type =  monitorEventTypes[i];
		ViewportMonitor.prototype[type] = createEventBindingFunction(type);
	}

	// Perform initial viewport calculation when the module loads
	updateViewportMetrics();

	/**
	 * Main scroll event listener. Updates viewport metrics and then processes all monitors.
	 * @param {Event} event - The native scroll event object.
	 */
	function scrollActivityListener(event) {
		lastTriggeringEvent = event; // Store the last event
		updateViewportMetrics();
		processMonitorsAndDispatch();
	}

	// Attach global event listeners to the window
	windowElement.on('scroll', scrollActivityListener);
	windowElement.on('resize', scheduleRefresh); // Debounce resize events

	/**
	 * Creates and registers a new ViewportMonitor for an element or position.
	 * @param {HTMLElement|string|number|object} item - The item to monitor. Can be a DOM element, a jQuery selector string, a number (scroll position), or an object {top, bottom}.
	 * @param {number|object} [offsets] - Custom boundary offsets.
	 * @returns {ViewportMonitor} The newly created monitor instance.
	 */
	scrollTracker.createMonitor = scrollTracker.registerMonitor = function( item, offsets ) {
		let resolvedItem = item;
		// If a string is provided, assume it's a jQuery selector
		if (typeof item === 'string') {
			resolvedItem = jq(item)[0]; // Get the first DOM element
		}
		// If a jQuery object is provided, extract the raw DOM element
		if (item instanceof jq) {
			resolvedItem = item[0];
		}
		
		// Create the monitor instance
		const newMonitor = new ViewportMonitor( resolvedItem, offsets );
		activeMonitors.push(newMonitor); // Add to the global list of monitors
		newMonitor.assessState(); // Ensure its state is immediately assessed
		return newMonitor;
	};

	/**
	 * Forces an immediate update of all monitors.
	 * Useful if content changes outside of scroll/resize events.
	 */
	scrollTracker.update = function() {
		lastTriggeringEvent = null; // Clear the last event reference
		updateViewportMetrics();
		processMonitorsAndDispatch();
	};

	/**
	 * Forces all monitors to recalculate their element locations,
	 * then updates their states and triggers callbacks.
	 * This is particularly useful if the document layout or element positions change.
	 */
	scrollTracker.forceLocationRecalculation = function() {
		// Reset document height to 0 to force all monitors to recalculate their positions
		// within updateViewportMetrics, as it checks if documentHeight has changed.
		lastKnownDocumentHeight = 0; 
		scrollTracker.update();
	};
	
	// Return the public API of the module
	return scrollTracker;
});