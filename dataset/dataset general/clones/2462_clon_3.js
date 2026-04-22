/*
 * Synthetic Event Dispatcher for jQuery
 *
 * This module enables programmatic simulation of browser events like mouse clicks, key presses,
 * and drag interactions on DOM elements, utilizing jQuery's utility functions.
 * It's designed to mimic native browser event behavior as closely as possible.
 *
 * Copyright 2023, EventForge Inc. (http://eventforge.com)
 * All rights reserved under the EventForge Open License v1.0.
 */

;(function(jq) {

    // Extend jQuery's prototype to add a new method for triggering synthetic events.
    jq.fn.extend({
        triggerSynthetic: function(eventKind, eventSettings) {
            // Process each element in the current jQuery selection.
            return this.each(function() {
                // Establish a configuration object, merging defaults with provided settings.
                // Ensure eventSettings is an object, providing an empty one if null/undefined.
                var finalSettings = jq.extend(
                    {},
                    jq.eventEmulator.defaultConfiguration,
                    eventSettings || {}
                );

                // Instantiate the event emulator and perform the desired action.
                new jq.eventEmulator(this, eventKind, finalSettings);
            });
        }
    });

    /**
     * @constructor
     * Represents the core event emulation utility.
     * @param {HTMLElement} targetElement - The DOM element on which the event is to be triggered.
     * @param {string} eventType - The type of event to simulate (e.g., "click", "mousedown", "drag").
     * @param {object} configObject - Configuration options for the event.
     */
    jq.eventEmulator = function(targetElement, eventType, configObject) {
        // Store the target DOM node and the event configuration for later use.
        this.targetNode = targetElement;
        this.configuration = configObject;

        // Determine the appropriate action based on the event type.
        // Special handling for 'drag' events, otherwise dispatch a standard event.
        var processedEventType = eventType.toLowerCase();
        if (processedEventType === 'drag') {
            this.handleDragInteraction(this.targetNode, this.configuration);
        } else {
            this.dispatchSyntheticEvent(targetElement, eventType, configObject);
        }
    };

    // Define the prototype methods for the eventEmulator.
    jq.extend(jq.eventEmulator.prototype, {

        /**
         * Orchestrates the creation and dispatch of a synthetic event.
         * @param {HTMLElement} targetElem - The element for the event.
         * @param {string} typeOfEvent - The event type string.
         * @param {object} optionsPayload - Configuration for the event.
         * @returns {Event|null} The dispatched event object, or null if creation failed.
         */
        dispatchSyntheticEvent: function(targetElem, typeOfEvent, optionsPayload) {
            var generatedEvent = this.craftEventObject(typeOfEvent, optionsPayload);

            // Only proceed if an event object was successfully created.
            if (generatedEvent) {
                this.triggerNativeEvent(targetElem, typeOfEvent, generatedEvent);
                return generatedEvent;
            }
            return null; // Indicate failure to create event.
        },

        /**
         * Factory method to create an appropriate event object based on its type.
         * @param {string} eventDesignation - The type of event (e.g., "click", "keydown").
         * @param {object} eventProps - Properties to assign to the event.
         * @returns {Event|null} A browser-native event object, or null if type is unsupported.
         */
        craftEventObject: function(eventDesignation, eventProps) {
            var eventCategory;
            // Classify the event type to delegate to the correct creation function.
            if (/^mouse(over|out|down|up|move)|(dbl)?click$/.test(eventDesignation)) {
                eventCategory = 'mouse';
            } else if (/^key(up|down|press)$/.test(eventDesignation)) {
                eventCategory = 'keyboard';
            } else {
                eventCategory = 'unknown'; // Unrecognized event type.
            }

            // Use a switch statement for clearer delegation.
            switch (eventCategory) {
                case 'mouse':
                    return this.assembleMouseEvent(eventDesignation, eventProps);
                case 'keyboard':
                    return this.assembleKeyboardEvent(eventDesignation, eventProps);
                default:
                    console.warn('EventEmulator: Unsupported event type for creation:', eventDesignation);
                    return null;
            }
        },

        /**
         * Assembles a mouse event object with specified properties.
         * @param {string} mouseEventType - The specific mouse event (e.g., "click").
         * @param {object} mouseEventAttrs - Attributes for the mouse event.
         * @returns {MouseEvent} A configured MouseEvent object.
         */
        assembleMouseEvent: function(mouseEventType, mouseEventAttrs) {
            var eventInstance;
            // Define default mouse event properties and merge with provided attributes.
            var eventProperties = jq.extend({
                bubbles: true,
                cancelable: (mouseEventType !== "mousemove"), // Mousemove is typically not cancelable.
                view: window,
                detail: 0,
                screenX: 0, screenY: 0, clientX: 0, clientY: 0,
                ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
                button: 0,
                relatedTarget: null // Default to null for no related target.
            }, mouseEventAttrs);

            // Handle relatedTarget for mouseover/mouseout events.
            var relatedElement = jq(eventProperties.relatedTarget)[0];
            if (relatedElement) {
                eventProperties.relatedTarget = relatedElement;
            } else if (mouseEventType === 'mouseout' || mouseEventType === 'mouseover') {
                // Provide a fallback relatedTarget if none is specified for hover events.
                eventProperties.relatedTarget = document.body;
            }

            // Use W3C standard for event creation if available.
            if (typeof document.createEvent === 'function') {
                eventInstance = document.createEvent("MouseEvents");
                eventInstance.initMouseEvent(
                    mouseEventType,
                    eventProperties.bubbles, eventProperties.cancelable, eventProperties.view, eventProperties.detail,
                    eventProperties.screenX, eventProperties.screenY, eventProperties.clientX, eventProperties.clientY,
                    eventProperties.ctrlKey, eventProperties.altKey, eventProperties.shiftKey, eventProperties.metaKey,
                    eventProperties.button, eventProperties.relatedTarget
                );
            } else if (document.createEventObject) {
                // Fallback for older IE versions.
                eventInstance = document.createEventObject();
                jq.extend(eventInstance, eventProperties);
                // Adjust button values for IE's non-standard mapping.
                var ieButtonMap = { 0: 1, 1: 4, 2: 2 };
                eventInstance.button = ieButtonMap[eventInstance.button] || eventInstance.button;
            } else {
                console.error("EventEmulator: No supported method for creating mouse events.");
                return null;
            }
            return eventInstance;
        },

        /**
         * Assembles a keyboard event object.
         * @param {string} keyboardEventType - The specific keyboard event (e.g., "keydown").
         * @param {object} keyEventAttrs - Attributes for the keyboard event.
         * @returns {KeyboardEvent} A configured KeyboardEvent object.
         */
        assembleKeyboardEvent: function(keyboardEventType, keyEventAttrs) {
            var keyEventInstance;
            // Define default keyboard event properties and merge with provided attributes.
            var keyProperties = jq.extend({
                bubbles: true, cancelable: true, view: window,
                ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
                keyCode: 0, charCode: 0
            }, keyEventAttrs);

            if (typeof document.createEvent === 'function') {
                try {
                    // Attempt to use the standard KeyEvents interface.
                    keyEventInstance = document.createEvent("KeyEvents");
                    keyEventInstance.initKeyEvent(
                        keyboardEventType, keyProperties.bubbles, keyProperties.cancelable, keyProperties.view,
                        keyProperties.ctrlKey, keyProperties.altKey, keyProperties.shiftKey, keyProperties.metaKey,
                        keyProperties.keyCode, keyProperties.charCode
                    );
                } catch (error) {
                    // Fallback to generic Events interface if KeyEvents is not fully supported.
                    keyEventInstance = document.createEvent("Events");
                    keyEventInstance.initEvent(keyboardEventType, keyProperties.bubbles, keyProperties.cancelable);
                    jq.extend(keyEventInstance, {
                        view: keyProperties.view,
                        ctrlKey: keyProperties.ctrlKey, altKey: keyProperties.altKey, shiftKey: keyProperties.shiftKey, metaKey: keyProperties.metaKey,
                        keyCode: keyProperties.keyCode, charCode: keyProperties.charCode
                    });
                }
            } else if (document.createEventObject) {
                // Fallback for older IE versions.
                keyEventInstance = document.createEventObject();
                jq.extend(keyEventInstance, keyProperties);
            } else {
                console.error("EventEmulator: No supported method for creating keyboard events.");
                return null;
            }

            // Note: The original code contained a browser-specific hack for IE/Opera
            // regarding keyCode/charCode. This is generally not needed in modern browsers
            // and is omitted here for simplicity and broader compatibility.

            return keyEventInstance;
        },

        /**
         * Dispatches the prepared event object to the target element.
         * @param {HTMLElement} targetElement - The element to dispatch the event on.
         * @param {string} _eventType - The string type of the event (ignored for dispatchEvent, used for fireEvent).
         * @param {Event} eventObject - The event object to dispatch.
         * @returns {Event} The dispatched event object.
         */
        triggerNativeEvent: function(targetElement, _eventType, eventObject) {
            // Prefer W3C standard dispatchEvent.
            if (targetElement.dispatchEvent) {
                targetElement.dispatchEvent(eventObject);
            } else if (targetElement.fireEvent) {
                // Fallback for older IE versions, prepending 'on'.
                targetElement.fireEvent('on' + _eventType, eventObject);
            } else {
                console.warn("EventEmulator: Target element does not support event dispatching.");
            }
            return eventObject;
        },

        /**
         * Simulates a drag interaction, involving mousedown, multiple mousemove, and mouseup events.
         * @param {HTMLElement} elementToDrag - The element to initiate the drag on.
         * @param {object} dragOptions - Options including dx (delta X) and dy (delta Y).
         */
        handleDragInteraction: function(elementToDrag, dragOptions) {
            // Reference to 'this' for use in nested scopes.
            var selfRef = this;
            // Compute the starting center coordinates for the drag.
            var initialPosition = selfRef.computeElementCenter(elementToDrag);

            // Extract movement deltas, defaulting to zero if not provided.
            var deltaX = dragOptions.dx || 0;
            var deltaY = dragOptions.dy || 0;

            // Round coordinates to nearest integer for event precision.
            var startX = Math.round(initialPosition.x);
            var startY = Math.round(initialPosition.y);

            // Define initial and intermediate coordinates for events.
            var currentCoords;
            var intermediateStep = 0.5; // For a smoother intermediate move.

            // 1. Simulate mouse down at the initial position.
            currentCoords = { clientX: startX, clientY: startY };
            selfRef.dispatchSyntheticEvent(elementToDrag, "mousedown", currentCoords);

            // 2. Simulate a small initial mouse move to indicate drag start.
            currentCoords = { clientX: startX + Math.round(deltaX * 0.1), clientY: startY + Math.round(deltaY * 0.1) };
            selfRef.dispatchSyntheticEvent(document, "mousemove", currentCoords);

            // 3. Simulate an intermediate mouse move.
            currentCoords = { clientX: startX + Math.round(deltaX * intermediateStep), clientY: startY + Math.round(deltaY * intermediateStep) };
            selfRef.dispatchSyntheticEvent(document, "mousemove", currentCoords);

            // 4. Simulate the final mouse move to the target position.
            currentCoords = { clientX: startX + deltaX, clientY: startY + deltaY };
            selfRef.dispatchSyntheticEvent(document, "mousemove", currentCoords);

            // 5. Simulate mouse up at the final position.
            selfRef.dispatchSyntheticEvent(elementToDrag, "mouseup", currentCoords);
        },

        /**
         * Calculates the center coordinates (x, y) of a given DOM element.
         * @param {HTMLElement} targetDomNode - The element for which to find the center.
         * @returns {{x: number, y: number}} An object with x and y coordinates.
         */
        computeElementCenter: function(targetDomNode) {
            var jqueryElem = jq(targetDomNode);
            var offsetData = jqueryElem.offset();

            // Calculate center by adding half of the width/height to the top/left offset.
            return {
                x: offsetData.left + (jqueryElem.outerWidth() * 0.5),
                y: offsetData.top + (jqueryElem.outerHeight() * 0.5)
            };
        }
    });

    // Extend the static properties of the eventEmulator.
    jq.extend(jq.eventEmulator, {
        // Default configuration settings for all simulated events.
        defaultConfiguration: {
            animationDuration: 'auto', // Placeholder for potential animation timing.
            simulatedAccuracy: 'high' // Indicates precision of simulation.
        },
        // Virtual key codes for common keyboard keys.
        KEY_CODE_TAB: 9,
        KEY_CODE_ENTER: 13,
        KEY_CODE_ESCAPE: 27,
        KEY_CODE_PAGE_UP: 33,
        KEY_CODE_PAGE_DOWN: 34,
        KEY_CODE_END: 35,
        KEY_CODE_HOME: 36,
        KEY_CODE_ARROW_LEFT: 37,
        KEY_CODE_ARROW_UP: 38,
        KEY_CODE_ARROW_RIGHT: 39,
        KEY_CODE_ARROW_DOWN: 40,
        KEY_CODE_DELETE: 46 // Added a new key code for demonstration.
    });

})(jQuery);