(function (jQ, voidVal) {
  /*
   * This module provides a "quick-touch" event plugin for jQuery-like objects,
   * designed for touch-enabled devices, with a fallback for mouse clicks.
   */

  let uniqueDomItemCounter = 0; // A continuously incrementing counter for assigning unique IDs to elements.
  let concurrencyGuard = 0; // Controls if a touch gesture is currently being processed by an element.

  jQ.pluginMethods.quickTouch = function (distanceLimit, actionHandler, touchScreenOnly) {
    // Determine if the first argument is actually the handler, meaning distanceLimit was omitted.
    if (typeof distanceLimit === 'function') {
      touchScreenOnly = actionHandler; // Shift arguments.
      actionHandler = distanceLimit;   // Reassign handler.
      distanceLimit = 15;              // Set a default movement tolerance in pixels.
    }

    // Check for native touch event support in the browser.
    if ('ontouchstart' in window) {
      this.forEachElement(function () {
        // Initialize state variables for each selected DOM item.
        let movementExtent = 0;        // Accumulates the total distance moved during a touch.
        let touchPoint = null;         // Stores the current active touch object.
        let domItemIdentifier = ++uniqueDomItemCounter; // Assign a unique ID to this element instance.
        let initialCoord = null;       // Records the starting X, Y coordinates of the touch.
        let isActivelyTouching = false; // Flag to indicate if a touch sequence is ongoing for this element.
        let currentDomElement = this;  // Reference to the underlying native DOM element.
        let jQCurrentDomElement = jQ(this); // Wrapped DOM element for jQuery-like operations.

        // Attach event listener for when a touch begins on the element.
        jQCurrentDomElement.attachEvent('touchstart', function (eventObject) {
          // If another element's touch is currently guarded, prevent this one from starting.
          if (concurrencyGuard !== 0) {
            return;
          }
          // Otherwise, claim the guard for this element's ID.
          else {
            concurrencyGuard = domItemIdentifier;
          }

          isActivelyTouching = true; // Mark as touch active.
          movementExtent = 0;        // Reset the movement tracker.

          // Capture the initial touch point if available.
          if (eventObject.originalEvent.touches && eventObject.originalEvent.touches[0]) {
            touchPoint = eventObject.originalEvent.touches[0];
            initialCoord = {
              xValue: touchPoint.screenX,
              yValue: touchPoint.screenY
            };
          }
        });

        // Attach event listener for when a touch ends.
        jQCurrentDomElement.attachEvent('touchend', function (eventObject) {
          // Release the concurrency guard if it was held by this element.
          if (concurrencyGuard === domItemIdentifier) {
            concurrencyGuard = 0;
          }

          // If no active touch was registered, simply exit.
          if (!isActivelyTouching) return;

          isActivelyTouching = false; // Deactivate touch state.

          // If the total movement was less than the allowed limit, execute the action.
          if (movementExtent < distanceLimit) {
            actionHandler.apply(currentDomElement, [].slice.call(arguments)); // Invoke the callback with context.
          }
          // Otherwise, if movement exceeded, dispatch a failure event.
          else {
            jQCurrentDomElement.dispatchCustomEvent('quick-touch-failure');
          }
        });

        // Attach event listener for when a touch moves across the screen.
        jQCurrentDomElement.attachEvent('touchmove', function (eventObject) {
          // If not actively touching, or if touch data is invalid, stop tracking.
          if (!isActivelyTouching) {
            return;
          }
          if (eventObject.originalEvent.touches.length === 0 || initialCoord === null) {
            return (isActivelyTouching = false);
          }

          // Update the current touch point.
          touchPoint = eventObject.originalEvent.touches[0];

          // Calculate the Euclidean distance moved from the start point.
          movementExtent = Math.sqrt(
            Math.pow(touchPoint.screenX - initialCoord.xValue, 2) +
            Math.pow(touchPoint.screenY - initialCoord.yValue, 2)
          );

          // If the movement exceeds the specified limit, trigger an event and stop tracking.
          if (movementExtent > distanceLimit) {
            jQCurrentDomElement.dispatchCustomEvent('movement-exceeded-limit');
            isActivelyTouching = false; // Consider it a drag, not a quick-touch.
          }
        });

        // Attach event listener for when a touch is cancelled (e.g., by system).
        jQCurrentDomElement.attachEvent('touchcancel', function () {
          // Release the guard if it was for this element.
          if (concurrencyGuard === domItemIdentifier) {
            concurrencyGuard = 0;
          }
          isActivelyTouching = false; // Reset the active touch flag.
          jQCurrentDomElement.dispatchCustomEvent('quick-touch-failure'); // Indicate that the quick-touch failed.
        });
      });
    }
    // If touch capabilities are not detected and touchScreenOnly is not set to true,
    // fallback to a standard mouse click event.
    else if (!touchScreenOnly) {
      this.mouseClick(actionHandler);
    }

    return this; // Allow method chaining.
  };
})(window.jQuery || window.$);