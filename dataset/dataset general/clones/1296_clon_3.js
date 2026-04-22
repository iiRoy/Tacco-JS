const engagedInteractiveElements = new Map();

/**
 * Ensures a consistent numeric timestamp from an event object.
 * Handles cases where `event.timeStamp` might be an object with a `getTime` method.
 * @param {Event} interactionEvent - The DOM event object.
 * @returns {number} The normalized timestamp value.
 */
function getReliableEventTime(interactionEvent) {
  // Check for older browser compatibility where timeStamp might be a Date object.
  return (typeof interactionEvent.timeStamp === 'object' && typeof interactionEvent.timeStamp.getTime === 'function')
    ? interactionEvent.timeStamp.getTime()
    : interactionEvent.timeStamp;
}

/**
 * Sets up an interactive UI component within its designated display area,
 * attaching relevant event listeners for pointer (touch and mouse) interactions.
 * This function handles initial positioning, sizing, and event delegation.
 *
 * @param {object} uiComponent - The interactive component instance, expected to have methods like:
 *                               `setVisualPosition(x, y)`, `setGraphicalDimensions(width, height)`,
 *                               `handleInteractionStart(pointers, timestamp)`,
 *                               `handleInteractionMove(pointers, timestamp, scale)`,
 *                               `handleInteractionEnd(timestamp)`,
 *                               `processScrollInput(delta, timestamp, clientX, clientY)`.
 * @param {HTMLElement} displayArea - The DOM element that serves as the visual container and event target.
 */
function configureInteractiveElement(uiComponent, displayArea) {
  // --- Input Parameter Validation ---
  if (!uiComponent || !displayArea || typeof uiComponent.setVisualPosition !== 'function') {
    console.warn('Interactive element configuration skipped: Invalid component or display area provided.');
    return;
  }

  // --- Initial Component Setup ---
  const elementBoundingBox = displayArea.getBoundingClientRect();
  const areaBorderLeft = displayArea.clientLeft;
  const areaBorderTop = displayArea.clientTop;

  // Position and size the component based on the container's metrics.
  uiComponent.setVisualPosition(
    elementBoundingBox.left + areaBorderLeft,
    elementBoundingBox.top + areaBorderTop
  );
  uiComponent.setGraphicalDimensions(displayArea.clientWidth, displayArea.clientHeight);

  // --- Feature Detection: Touch vs. Mouse ---
  const supportsTouch = 'ontouchstart' in window;
  const eventListenerOptions = { passive: false }; // Ensure `preventDefault` can be called.

  if (supportsTouch) {
    // --- Touch Event Management ---

    displayArea.addEventListener('touchstart', function(touchEvt) {
      const currentMoment = getReliableEventTime(touchEvt);
      const primaryTouch = touchEvt.targetTouches[0];

      if (primaryTouch && primaryTouch.identifier !== undefined) {
        // Register the component with the unique identifier of the touch point.
        engagedInteractiveElements.set(primaryTouch.identifier, uiComponent);
        uiComponent.handleInteractionStart(touchEvt.targetTouches, currentMoment);
        touchEvt.preventDefault(); // Prevent default browser actions like scrolling/zooming.
      } else {
        console.info('Touch event detected without a valid identifier. Skipping registration.');
      }
    }, eventListenerOptions);

    document.addEventListener('touchmove', function(touchEvt) {
      const currentMoment = getReliableEventTime(touchEvt);
      const movedTouches = touchEvt.changedTouches;

      // Iterate through all touch points that have changed state.
      for (let touchIndex = 0; touchIndex < movedTouches.length; touchIndex++) {
        const individualTouch = movedTouches[touchIndex];
        const associatedComponent = engagedInteractiveElements.get(individualTouch.identifier);

        // If a component is actively engaged by this touch identifier, process its movement.
        if (associatedComponent) {
          associatedComponent.handleInteractionMove([individualTouch], currentMoment, touchEvt.scale || 1.0);
        }
      }
      // Note: No global preventDefault here. Individual component's handleInteractionMove should manage.
    }, eventListenerOptions);

    document.addEventListener('touchend', function(touchEvt) {
      const currentMoment = getReliableEventTime(touchEvt);
      const endedTouches = touchEvt.changedTouches;

      // Process all touch points that have been lifted.
      for (let touchIndex = 0; touchIndex < endedTouches.length; touchIndex++) {
        const individualTouch = endedTouches[touchIndex];
        const associatedComponent = engagedInteractiveElements.get(individualTouch.identifier);

        if (associatedComponent) {
          associatedComponent.handleInteractionEnd(currentMoment);
          engagedInteractiveElements.delete(individualTouch.identifier); // Deregister the component.
        }
      }
    }, eventListenerOptions);

    document.addEventListener('touchcancel', function(touchEvt) {
      const currentMoment = getReliableEventTime(touchEvt);
      const cancelledTouches = touchEvt.changedTouches;

      // Handle cancelled touches similarly to ended touches for proper cleanup.
      for (let touchIndex = 0; touchIndex < cancelledTouches.length; touchIndex++) {
        const individualTouch = cancelledTouches[touchIndex];
        const associatedComponent = engagedInteractiveElements.get(individualTouch.identifier);

        if (associatedComponent) {
          associatedComponent.handleInteractionEnd(currentMoment);
          engagedInteractiveElements.delete(individualTouch.identifier); // Deregister.
        }
      }
    }, eventListenerOptions);

  } else {
    // --- Mouse Event Management (Fallback for non-touch devices) ---
    let isMouseDragActive = false; // Internal state to track active mouse-down-and-drag.

    displayArea.addEventListener('mousedown', function(mouseEvt) {
      const currentMoment = getReliableEventTime(mouseEvt);
      // Create a simplified pointer object to mimic touch event structure for consistency.
      const simulatedPointer = [{
        clientX: mouseEvt.pageX,
        clientY: mouseEvt.pageY
      }];

      uiComponent.handleInteractionStart(simulatedPointer, currentMoment);
      isMouseDragActive = true; // Activate mouse interaction state.
      mouseEvt.preventDefault(); // Prevent browser's default text selection or dragging behavior.
    }, eventListenerOptions);

    document.addEventListener('mousemove', function(mouseEvt) {
      // Only proceed if a mouse button is currently pressed and dragging.
      if (!isMouseDragActive) {
        return;
      }

      const currentMoment = getReliableEventTime(mouseEvt);
      const simulatedPointer = [{
        clientX: mouseEvt.pageX,
        clientY: mouseEvt.pageY
      }];

      uiComponent.handleInteractionMove(simulatedPointer, currentMoment);
      mouseEvt.preventDefault(); // Suppress unwanted selection while dragging.
    }, eventListenerOptions);

    document.addEventListener('mouseup', function(mouseEvt) {
      // Only proceed if a mouse drag interaction was active.
      if (!isMouseDragActive) {
        return;
      }

      const currentMoment = getReliableEventTime(mouseEvt);
      uiComponent.handleInteractionEnd(currentMoment);
      isMouseDragActive = false; // Deactivate mouse interaction state.
    }, eventListenerOptions);

    // --- Mouse Scroll Event Handling ---

    // Standardized 'wheel' event for modern browsers (WebKit/Blink, Firefox).
    displayArea.addEventListener('wheel', function(wheelEvt) {
      const currentMoment = getReliableEventTime(wheelEvt);
      // Normalize scroll delta; `deltaY` is preferred, `wheelDelta` is older WebKit.
      const scrollAmount = wheelEvt.deltaY !== undefined ? -wheelEvt.deltaY : wheelEvt.wheelDelta;
      uiComponent.processScrollInput(scrollAmount, currentMoment, wheelEvt.pageX, wheelEvt.pageY);
      wheelEvt.preventDefault(); // Prevent page scrolling.
    }, eventListenerOptions);

    // Legacy 'DOMMouseScroll' for older Firefox versions.
    displayArea.addEventListener('DOMMouseScroll', function(scrollEvt) {
      const currentMoment = getReliableEventTime(scrollEvt);
      // Firefox's `detail` property is in lines, positive for down. Convert to approximate wheelDelta scale.
      const scrollAmount = scrollEvt.detail * -4;
      uiComponent.processScrollInput(scrollAmount, currentMoment, scrollEvt.pageX, scrollEvt.pageY);
      scrollEvt.preventDefault(); // Prevent page scrolling.
    }, eventListenerOptions);
  }
}