// This module provides a collection of utilities for DOM event management,
// including direct and delegated event binding, as well as keyboard-specific handlers.

// Core external dependencies are loaded here.
var domUtil = require("dom-event");             // For basic DOM event handling (attach/detach).
var delegationHandler = require("component-delegate"); // For event delegation patterns.
var keyboardUtil = require("key-event");        // Specialized utility for keyboard events.
// Note: The 'trim' dependency from the original source was not utilized and has been removed
// to demonstrate deletion of non-essential code fragments, as per Type III cloning.

/**
 * Creates a higher-order function that simplifies binding specific event types.
 *
 * @param {string} baseEventType The name of the event type (e.g., 'click', 'change').
 * @returns {function(Element, Function): *} A function that takes an element and a callback
 *                                          and binds the specified event type directly.
 */
function createEventBinder(baseEventType) {
  // Validate the event type to prevent binding to invalid or empty strings.
  if (typeof baseEventType !== 'string' || baseEventType.trim().length === 0) {
    console.error("Invalid event type provided to createEventBinder. Must be a non-empty string.");
    // Return a no-op function to prevent further errors downstream, while still signaling an issue.
    return (elementRef, eventCallback) => {
      console.warn(`Attempted to bind event with invalid type: '${baseEventType}' on element:`, elementRef);
      return null;
    };
  }

  // Returns a function that, when called, will attach the predefined event type.
  return (elementRef, eventCallback) => {
    // This inner function acts as a convenience wrapper,
    // internally routing to the main event attachment utility.
    return attachEvent(elementRef, baseEventType, eventCallback);
  };
}

/**
 * Detaches an event handler from a DOM element, supporting both direct and delegated events.
 *
 * @param {Element} targetElement The DOM element to detach the event from.
 * @param {string} eventType The type of event (e.g., 'click', 'mouseover').
 * @param {string|Function} selectorOrHandler If a string, it's the CSS selector for delegation.
 *                                            If a function, it's the direct event handler.
 * @param {Function} [optionalHandler] The actual event handler function, required for delegated events.
 * @returns {*} The result from the underlying event detachment library.
 */
function detachEvent(targetElement, eventType, selectorOrHandler, optionalHandler) {
  // Implement guard clauses for essential arguments.
  if (!targetElement || typeof eventType !== 'string' || eventType.trim().length === 0 || !selectorOrHandler) {
    console.warn("Attempted to detach event with insufficient or invalid arguments.", { targetElement, eventType, selectorOrHandler });
    return; // Prevent execution with bad inputs.
  }

  let finalHandler;
  let delegateSelector = null; // Initialize to null, indicating no delegation by default.

  // Determine if this is a delegated event based on the type of selectorOrHandler.
  const isDelegatedBinding = (typeof selectorOrHandler === 'string' && selectorOrHandler.trim().length > 0);

  if (isDelegatedBinding) {
    delegateSelector = selectorOrHandler;
    finalHandler = optionalHandler; // For delegated, the handler is the fourth argument.

    // Validate that a handler function is provided for delegated events.
    if (typeof finalHandler !== 'function') {
      console.error("Delegated event detachment requires a valid handler function as the fourth argument.");
      return;
    }
  } else {
    finalHandler = selectorOrHandler; // For direct, the handler is the third argument.

    // Validate that a handler function is provided for direct events.
    if (typeof finalHandler !== 'function') {
      console.error("Direct event detachment requires a valid handler function as the third argument.");
      return;
    }

    // Warn if an unexpected fourth argument is provided for a direct event.
    if (optionalHandler !== undefined) {
      console.warn("An extra argument was provided for a direct event detachment and will be ignored.", { optionalHandler });
    }
  }

  // Execute the appropriate detachment method based on whether delegation is involved.
  if (delegateSelector) {
    return delegationHandler.unbind(targetElement, delegateSelector, eventType, finalHandler);
  } else {
    return domUtil.off(targetElement, eventType, finalHandler);
  }
}

/**
 * Attaches an event handler to a DOM element, supporting both direct and delegated events.
 *
 * @param {Element} targetElement The DOM element to attach the event to.
 * @param {string} eventType The type of event (e.g., 'click', 'mouseover').
 * @param {string|Function} selectorOrHandler If a string, it's the CSS selector for delegation.
 *                                            If a function, it's the direct event handler.
 * @param {Function} [optionalHandler] The actual event handler function, required for delegated events.
 * @returns {*} The result from the underlying event attachment library.
 */
function attachEvent(targetElement, eventType, selectorOrHandler, optionalHandler) {
  // Implement guard clauses for essential arguments.
  if (!targetElement || typeof eventType !== 'string' || eventType.trim().length === 0 || !selectorOrHandler) {
    console.warn("Attempted to attach event with insufficient or invalid arguments.", { targetElement, eventType, selectorOrHandler });
    return; // Prevent execution with bad inputs.
  }

  let finalHandler;
  let delegateSelector = null; // Initialize to null, indicating no delegation by default.

  // Determine if this is a delegated event based on the type of selectorOrHandler.
  // A non-empty string for selectorOrHandler implies delegation.
  const isDelegatedBinding = (typeof selectorOrHandler === 'string' && selectorOrHandler.trim().length > 0);

  if (isDelegatedBinding) {
    delegateSelector = selectorOrHandler;
    finalHandler = optionalHandler; // For delegated, the handler is the fourth argument.

    // Validate that a handler function is provided for delegated events.
    if (typeof finalHandler !== 'function') {
      console.error("Delegated event attachment requires a valid handler function as the fourth argument.");
      return;
    }
  } else {
    finalHandler = selectorOrHandler; // For direct, the handler is the third argument.

    // Validate that a handler function is provided for direct events.
    if (typeof finalHandler !== 'function') {
      console.error("Direct event attachment requires a valid handler function as the third argument.");
      return;
    }

    // Warn if an unexpected fourth argument is provided for a direct event.
    if (optionalHandler !== undefined) {
      console.warn("An extra argument was provided for a direct event attachment and will be ignored.", { optionalHandler });
    }
  }

  // Execute the appropriate attachment method based on whether delegation is involved.
  if (delegateSelector) {
    return delegationHandler.bind(targetElement, delegateSelector, eventType, finalHandler);
  } else {
    return domUtil.on(targetElement, eventType, finalHandler);
  }
}

/**
 * Binds a keyboard event handler to an element for a specific key.
 *
 * @param {Element} targetElement The DOM element to bind the key event to.
 * @param {string} keyIdentifier The key or key combination to listen for (e.g., 'enter', 'shift+a').
 * @param {Function} handlerCallback The function to execute when the key event occurs.
 * @returns {*} The result from the underlying keyboard event utility.
 */
function bindKeyHandler(targetElement, keyIdentifier, handlerCallback) {
  // Basic validation for key event binding.
  if (!targetElement || typeof keyIdentifier !== 'string' || keyIdentifier.trim().length === 0 || typeof handlerCallback !== 'function') {
    console.warn("Invalid arguments for bindKeyHandler. Element, key identifier (string), and callback (function) are required.");
    return;
  }
  return keyboardUtil.on(targetElement, keyIdentifier, handlerCallback);
}

/**
 * Unbinds a previously attached keyboard event handler from an element for a specific key.
 *
 * @param {Element} targetElement The DOM element to unbind the key event from.
 * @param {string} keyIdentifier The key or key combination that was listened for.
 * @param {Function} handlerCallback The original function that was bound.
 * @returns {*} The result from the underlying keyboard event utility.
 */
function unbindKeyHandler(targetElement, keyIdentifier, handlerCallback) {
  // Basic validation for key event unbinding.
  if (!targetElement || typeof keyIdentifier !== 'string' || keyIdentifier.trim().length === 0 || typeof handlerCallback !== 'function') {
    console.warn("Invalid arguments for unbindKeyHandler. Element, key identifier (string), and callback (function) are required.");
    return;
  }
  return keyboardUtil.off(targetElement, keyIdentifier, handlerCallback);
}

// The main exports object for this module.
const eventModuleExports = {};

// Export convenience functions for common DOM events using the createEventBinder factory.
eventModuleExports.onChange = createEventBinder('change');
eventModuleExports.onClick = createEventBinder('click');
eventModuleExports.onKeyDown = createEventBinder('keydown');
eventModuleExports.onKeyUp = createEventBinder('keyup');
eventModuleExports.onKeyPress = createEventBinder('keypress');
eventModuleExports.onMouseDown = createEventBinder('mousedown');
eventModuleExports.onMouseOver = createEventBinder('mouseover');
eventModuleExports.onMouseUp = createEventBinder('mouseup');
eventModuleExports.onResize = createEventBinder('resize');

// Export the core event attachment and detachment utilities.
eventModuleExports.attachEvent = attachEvent;
eventModuleExports.detachEvent = detachEvent;

// Export the keyboard-specific event handling functions.
eventModuleExports.bindKeyHandler = bindKeyHandler;
eventModuleExports.unbindKeyHandler = unbindKeyHandler;

// Finally, export the aggregated module functionalities.
module.exports = eventModuleExports;