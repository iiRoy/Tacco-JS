/*
 * webQuery.triggerEvent - replicate browser user input actions
 *
 * This utility allows programmatic simulation of mouse and keyboard events.
 * It is designed to extend webQuery functionality, providing a way
 * to test user interactions without direct user input.
 *
 * Distributed under an open-source license.
 *
 */

;(function(jQ) {

// Extend webQuery's prototype to add our new event emulation method
jQ.fn.addFunctionality({
	emulateAction: function(actionKind, configSettings) {
		// Iterate over each selected DOM element
		return this.forEachElement(function() {
			// Merge default options with user-provided settings, prioritizing user settings
			var finalConfig = jQ.assignDefaults({}, jQ.InteractionEmulator.defaultSettings, configSettings || {});
			// Create a new emulator instance and perform the action on the current element
			new jQ.InteractionEmulator(this, actionKind, finalConfig);
		});
	}
});

/**
 * Constructor for the InteractionEmulator.
 * Manages the generation and dispatch of simulated events.
 * @param {HTMLElement} targetElement - The element on which the event is performed.
 * @param {string} actionKind - The type of action (e.g., "click", "keydown", "drag").
 * @param {object} actionOptions - Configuration options for the action.
 */
jQ.InteractionEmulator = function(targetElement, actionKind, actionOptions) {
	this.currentElement = targetElement;
	this.actionOptions = actionOptions;

	// Check if the action is a special 'drag' operation requiring a sequence of events
	if (new RegExp("^drag$").test(actionKind)) {
		// Dynamically call the corresponding method for complex actions like dragging
		this[actionKind].apply(this, [this.currentElement, actionOptions]);
	} else {
		// For standard events, use the generic event simulation method
		this.performEventTrigger(targetElement, actionKind, actionOptions);
	}
};

// Extend the emulator's prototype with core event handling methods
jQ.assignDefaults(jQ.InteractionEmulator.prototype, {
	/**
	 * Orchestrates the creation and dispatch of a specific event.
	 * @param {HTMLElement} targetElem - The DOM element receiving the event.
	 * @param {string} eventType - The name of the event (e.g., "mousedown").
	 * @param {object} eventConfigs - Configuration for the event.
	 * @returns {Event} The created event object.
	 */
	performEventTrigger: function(targetElem, eventType, eventConfigs) {
		var eventObject = this.craftEvent(eventType, eventConfigs);
		this.dispatchGeneratedEvent(targetElem, eventType, eventObject, eventConfigs);
		return eventObject;
	},

	/**
	 * Creates a browser event object based on its type.
	 * Determines if it's a mouse or keyboard event and calls the appropriate generator.
	 * @param {string} eventType - The type of event to create.
	 * @param {object} eventConfigs - Additional properties for the event.
	 * @returns {Event} A newly created event object, or undefined if type is unknown.
	 */
	craftEvent: function(eventType, eventConfigs) {
		// Regular expression to match various mouse events
		if (new RegExp("^mouse(over|out|down|up|move)|(dbl)?click$").test(eventType)) {
			return this.generateMouseEvent(eventType, eventConfigs);
		}
		// Regular expression to match keyboard events
		else if (new RegExp("^key(up|down|press)$").test(eventType)) {
			return this.generateKeyboardEvent(eventType, eventConfigs);
		}
	},

	/**
	 * Generates a synthetic mouse event object compatible with browser APIs.
	 * @param {string} typeOfEvent - Mouse event type (e.g., "click", "mousemove").
	 * @param {object} optionsPayload - Custom options for the mouse event.
	 * @returns {MouseEvent} A browser-compatible mouse event.
	 */
	generateMouseEvent: function(typeOfEvent, optionsPayload) {
		var eventObjectInstance;
		// Define default properties for mouse events, then merge with user options
		var eventProps = jQ.assignDefaults({
			bubbles: true, cancelable: (typeOfEvent != "mousemove"), view: window, detail: 0,
			screenX: 0, screenY: 0, clientX: 0, clientY: 0,
			ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
			button: 0, associatedTarget: undefined
		}, optionsPayload);

		// Resolve the related target element for certain mouse events, if provided
		var resolvedAssociatedTarget = jQ(eventProps.associatedTarget)[0];

		// Use modern DOM Level 2/3 event creation if available (W3C standard)
		if (jQ.isFunction(document.createEvent)) {
			eventObjectInstance = document.createEvent("MouseEvents");
			eventObjectInstance.initMouseEvent(typeOfEvent, eventProps.bubbles, eventProps.cancelable, eventProps.view, eventProps.detail,
				eventProps.screenX, eventProps.screenY, eventProps.clientX, eventProps.clientY,
				eventProps.ctrlKey, eventProps.altKey, eventProps.shiftKey, eventProps.metaKey,
				eventProps.button, eventProps.associatedTarget || document.body.parentNode);
		}
		// Fallback for older Internet Explorer versions using createEventObject
		else if (document.createEventObject) {
			eventObjectInstance = document.createEventObject();
			jQ.assignDefaults(eventObjectInstance, eventProps);
			// Map button values for IE compatibility (e.g., left click button:0 becomes 1)
			eventObjectInstance.button = { 0:1, 1:4, 2:2 }[eventObjectInstance.button] || eventObjectInstance.button;
		}
		return eventObjectInstance;
	},

	/**
	 * Creates a synthetic keyboard event object compatible with browser APIs.
	 * Handles differences in event creation across browsers.
	 * @param {string} typeOfEvent - Keyboard event type (e.g., "keydown", "keyup").
	 * @param {object} optionsPayload - Custom options for the keyboard event.
	 * @returns {KeyboardEvent} A browser-compatible keyboard event.
	 */
	generateKeyboardEvent: function(typeOfEvent, optionsPayload) {
		var eventObjectInstance;

		// Set default properties for keyboard events, then merge user options
		var eventProps = jQ.assignDefaults({ bubbles: true, cancelable: true, view: window,
			ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
			keyCode: 0, charCode: 0
		}, optionsPayload);

		// Attempt to use standard DOM Level 2/3 event creation (KeyEvents interface)
		if (jQ.isFunction(document.createEvent)) {
			try {
				eventObjectInstance = document.createEvent("KeyEvents");
				eventObjectInstance.initKeyEvent(typeOfEvent, eventProps.bubbles, eventProps.cancelable, eventProps.view,
					eventProps.ctrlKey, eventProps.altKey, eventProps.shiftKey, eventProps.metaKey,
					eventProps.keyCode, eventProps.charCode);
			} catch(issue) {
				// Fallback for browsers that don't support KeyEvents directly, using generic 'Events'
				eventObjectInstance = document.createEvent("Events");
				eventObjectInstance.initEvent(typeOfEvent, eventProps.bubbles, eventProps.cancelable);
				jQ.assignDefaults(eventObjectInstance, { view: eventProps.view,
					ctrlKey: eventProps.ctrlKey, altKey: eventProps.altKey, shiftKey: eventProps.shiftKey, metaKey: eventProps.metaKey,
					keyCode: eventProps.keyCode, charCode: eventProps.charCode
				});
			}
		}
		// Fallback for older Internet Explorer using createEventObject
		else if (document.createEventObject) {
			eventObjectInstance = document.createEventObject();
			jQ.assignDefaults(eventObjectInstance, eventProps);
		}
		// Adjust keyCode/charCode for specific browser inconsistencies, notably IE and Opera
		if (jQ.browser && (jQ.browser.msie || jQ.browser.opera)) {
			eventObjectInstance.keyCode = (eventProps.charCode > 0) ? eventProps.charCode : eventProps.keyCode;
			eventObjectInstance.charCode = undefined; // Ensure charCode is not set if keyCode is used
		}
		return eventObjectInstance;
	},

	/**
	 * Dispatches the generated event to the target element using appropriate browser methods.
	 * @param {HTMLElement} targetElem - The DOM element to dispatch the event to.
	 * @param {string} eventType - The type of event being dispatched (for IE 'on' prefix).
	 * @param {Event} eventObj - The event object to dispatch.
	 * @returns {Event} The dispatched event object.
	 */
	dispatchGeneratedEvent: function(targetElem, eventType, eventObj) {
		if (targetElem.dispatchEvent) {
			targetElem.dispatchEvent(eventObj); // Modern W3C standard
		} else if (targetElem.fireEvent) {
			targetElem.fireEvent('on' + eventType, eventObj); // Legacy IE method
		}
		return eventObj;
	},

	/**
	 * Simulates a drag-and-drop operation by dispatching a sequence of mouse events.
	 * This method assumes the element is initially at rest and then dragged.
	 * @param {HTMLElement} actionTarget - The element to be dragged.
	 */
	performDragOperation: function(actionTarget) {
		var instanceRef = this, // Reference to the current emulator instance
			elementCenter = this.locateCenterPoint(this.currentElement),
			actionOptions = this.actionOptions,
			posX = Math.floor(elementCenter.x),
			posY = Math.floor(elementCenter.y),
			deltaX = actionOptions.deltaX || 0, // Horizontal displacement
			deltaY = actionOptions.deltaY || 0, // Vertical displacement
			dragTarget = this.currentElement; // The element being actively dragged

		var coordinates = { clientX: posX, clientY: posY };

		// Sequence of events for a drag operation:
		// 1. Mouse down on the target element
		this.performEventTrigger(dragTarget, "mousedown", coordinates);
		// 2. Initial mouse move to start the drag (slight movement)
		coordinates = { clientX: posX + 1, clientY: posY + 1 };
		this.performEventTrigger(document, "mousemove", coordinates);
		// 3. Mouse move to the final drag position
		coordinates = { clientX: posX + deltaX, clientY: posY + deltaY };
		this.performEventTrigger(document, "mousemove", coordinates);
		// 4. Another mouse move at the final position (common for some drag implementations)
		this.performEventTrigger(document, "mousemove", coordinates);
		// 5. Mouse up to end the drag operation
		this.performEventTrigger(dragTarget, "mouseup", coordinates);
	},

	/**
	 * Calculates the approximate center coordinates of a given element within the viewport.
	 * @param {HTMLElement} elementToMeasure - The element to find the center of.
	 * @returns {{x: number, y: number}} Object containing the x and y coordinates of the center.
	 */
	locateCenterPoint: function(elementToMeasure) {
		var targetWrapped = jQ(this.currentElement), // Wrap the element with webQuery
			elementOffset = targetWrapped.offset(); // Get its position relative to the document
		return {
			x: elementOffset.left + targetWrapped.outerWidth() / 2,
			y: elementOffset.top + targetWrapped.outerHeight() / 2
		};
	}
});

// Add static properties and default configurations to the emulator class itself
jQ.assignDefaults(jQ.InteractionEmulator, {
	defaultSettings: {
		animationSpeed: 'synchronized' // Specifies default speed for animations, if any
	},
	// Define virtual key codes for common keyboard actions
	KEY_CODE_TAB: 9,
	KEY_CODE_ENTER: 13,
	KEY_CODE_ESCAPE: 27,
	KEY_CODE_PAGE_UP: 33,
	KEY_CODE_PAGE_DOWN: 34,
	KEY_CODE_END: 35,
	KEY_CODE_HOME: 36,
	KEY_CODE_LEFT_ARROW: 37,
	KEY_CODE_UP_ARROW: 38,
	KEY_CODE_RIGHT_ARROW: 39,
	KEY_CODE_DOWN_ARROW: 40
});

})(webQuery); // Pass webQuery (renamed jQuery) into the IIFE