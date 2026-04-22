;(function(jq, undef) {
  // This module provides an enhanced touch event handler for jQuery,
  // simulating a 'tap' gesture with configurable movement tolerance.

  // --- Module-level Constants and Variables ---
  // Default maximum distance a touch can move and still be considered a 'tap'.
  const DEFAULT_MOVEMENT_TOLERANCE = 15; // Pixels
  // Counter to assign unique IDs to each element instance using the plugin.
  let nextUniqueControlId = 0;
  // Global lock to prevent multiple simultaneous tap gestures across different elements.
  // Stores the controlInstanceId of the element currently holding the lock, or null if free.
  let activeGestureLock = null;

  /**
   * Calculates the Euclidean distance between two points.
   * @param {object} point1 - First point with coordX and coordY properties.
   * @param {object} point2 - Second point with coordX and coordY properties.
   * @returns {number} The distance between the points.
   */
  function calculateDistance(point1, point2) {
    // Basic validation to ensure points are defined before calculation.
    if (!point1 || !point2 || typeof point1.coordX === 'undefined' || typeof point2.coordX === 'undefined') {
      return 0;
    }
    const deltaX = point1.coordX - point2.coordX;
    const deltaY = point1.coordY - point2.coordY;
    // Using `*` instead of `Math.pow` for minor optimization and readability.
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  // --- jQuery Plugin Definition: .touchPress() ---
  // Extends jQuery's prototype to add a new method for handling touch/click gestures.
  jq.fn.touchPress = function(movementTolerance, actionHandler, mobileOnly) {
    // --- Parameter Reordering and Default Assignment ---
    // If the first argument is a function, it implies the default tolerance should be used.
    if (typeof movementTolerance === 'function') {
      // Shift arguments: actionHandler becomes the first param, mobileOnly the second.
      mobileOnly = actionHandler;
      actionHandler = movementTolerance;
      movementTolerance = DEFAULT_MOVEMENT_TOLERANCE; // Assign the default tolerance.
    }

    // --- Early Exit: Guard Clause for Empty Selection ---
    // If the jQuery selection is empty, there's nothing to apply the plugin to.
    if (this.length === 0) {
      return this; // Return 'this' for chainability.
    }

    // --- Feature Detection: Check for Touch Support ---
    // Determines if the current environment supports touch events.
    const isTouchDevice = (typeof window.ontouchstart !== 'undefined');

    // --- Touch Device Logic ---
    if (isTouchDevice) {
      // Iterate over each selected DOM element to apply the touch listeners.
      this.each(function() {
        // --- Per-element State Variables ---
        // Tracks the total displacement during a touch gesture for this specific element.
        let currentDisplacement = 0;
        // Stores the screen coordinates (x, y) where the touch gesture began.
        let initialContactPoint = null;
        // Flag indicating if a touch gesture is currently active on this element.
        let isGestureActive = false;
        // Assign a unique ID to this element's instance of the plugin.
        const controlInstanceId = ++nextUniqueControlId;
        // Reference to the raw DOM element.
        const domElement = this;
        // jQuery-wrapped reference to the DOM element for event binding.
        const $targetElement = jq(this);

        // --- Event Listener: touchstart ---
        // Fired when a touch point is placed on the touch surface.
        $targetElement.on('touchstart.touchPress', function(eventObject) {
          const rawEvent = eventObject.originalEvent;

          // Prevent default browser actions (like scrolling or zooming)
          // if the event is cancelable. This ensures the tap gesture takes precedence.
          if (rawEvent && eventObject.cancelable) {
            eventObject.preventDefault();
          }

          // Global gesture lock mechanism:
          // If another element has already acquired the lock, this element cannot start a gesture.
          if (activeGestureLock !== null && activeGestureLock !== controlInstanceId) {
            return; // Exit early if another element is active.
          }
          activeGestureLock = controlInstanceId; // Acquire the lock for this element.

          isGestureActive = true; // Mark the gesture as active.
          currentDisplacement = 0; // Reset displacement for the new gesture.

          // Ensure valid touch data is available from the original event.
          if (rawEvent && rawEvent.touches && rawEvent.touches.length > 0) {
            const firstTouch = rawEvent.touches[0];
            initialContactPoint = {
              coordX: firstTouch.screenX,
              coordY: firstTouch.screenY
            };
          } else {
            // If touch data is invalid, immediately abort the gesture.
            isGestureActive = false;
            activeGestureLock = null; // Release the lock.
          }
        });

        // --- Event Listener: touchend ---
        // Fired when a touch point is removed from the touch surface.
        $targetElement.on('touchend.touchPress', function(eventObject) {
          // Release the global lock if this element was holding it.
          if (activeGestureLock === controlInstanceId) {
            activeGestureLock = null;
          }

          // If no gesture was active or it was previously aborted, do nothing.
          if (!isGestureActive) {
            return;
          }
          isGestureActive = false; // Deactivate the gesture state.

          // Check if the total movement during the gesture was within the allowed tolerance.
          if (currentDisplacement < movementTolerance) {
            // If movement was minimal, consider it a successful 'tap'.
            // Execute the provided action handler, binding `this` to the DOM element
            // and passing the event object.
            actionHandler.apply(domElement, [eventObject]);
          } else {
            // If movement exceeded tolerance, trigger a custom 'gesture-aborted' event.
            $targetElement.trigger('gesture-aborted.touchPress');
          }
          // Clear the initial contact point to prepare for the next gesture.
          initialContactPoint = null;
        });

        // --- Event Listener: touchmove ---
        // Fired when a touch point is moved along the touch surface.
        $targetElement.on('touchmove.touchPress', function(eventObject) {
          // Ignore movement if no gesture is active or if this element doesn't hold the lock.
          if (!isGestureActive || activeGestureLock !== controlInstanceId) {
            return;
          }

          const rawEvent = eventObject.originalEvent;
          // Validate that there's active touch data and an initial starting point.
          if (!rawEvent || rawEvent.touches.length === 0 || initialContactPoint === null) {
            isGestureActive = false; // Abort gesture if touch data is lost.
            activeGestureLock = null; // Release the lock.
            return;
          }

          const currentTouchObject = rawEvent.touches[0];
          const currentPoint = {
            coordX: currentTouchObject.screenX,
            coordY: currentTouchObject.screenY
          };

          // Calculate the current total displacement from the start point.
          currentDisplacement = calculateDistance(initialContactPoint, currentPoint);

          // If the displacement exceeds the defined tolerance, abort the tap gesture.
          if (currentDisplacement > movementTolerance) {
            // Trigger a custom event indicating movement exceeded the threshold.
            $targetElement.trigger('movement-exceeded.touchPress');
            isGestureActive = false; // Deactivate the gesture.
            activeGestureLock = null; // Release the lock.
          }
        });

        // --- Event Listener: touchcancel ---
        // Fired when a touch gesture is interrupted (e.g., system alert, multiple touches).
        $targetElement.on('touchcancel.touchPress', function(eventObject) {
          // If this element held the lock, it must be released.
          if (activeGestureLock === controlInstanceId) {
            activeGestureLock = null;
          }
          // Reset the gesture state and signal that the tap was aborted.
          isGestureActive = false;
          initialContactPoint = null; // Clear initial point data.
          $targetElement.trigger('gesture-aborted.touchPress'); // Trigger custom event.
        });
      });
    } else if (!mobileOnly) {
      // --- Non-Touch Device Fallback Logic ---
      // If the device does not support touch events AND the 'mobileOnly' flag is not set,
      // fall back to a standard click event for desktop environments.
      this.on('click.touchPress', actionHandler); // Use .on() for modern event binding.
    }

    // Return the jQuery object to maintain chainability.
    return this;
  };
})(window.jQuery || window.$); // Pass jQuery or its alias "$" into the IIFE.