/*
 * This script provides a jQuery extension for handling extended touch/click events.
 * It allows defining separate actions for a quick press versus a sustained press.
 *
 * @name holdEvent
 * @version 0.1.3
 * @requires jQuery library version 1.2.3 or higher
 * @author K. T. Developer
 * @license Apache License 2.0 - https://www.apache.org/licenses/LICENSE-2.0
 *
 * For usage details and illustrative examples, refer to the project documentation at:
 * https://github.com/developer-kt/jquery-hold-event/
 *
 * Copyright (c) 2010-2024, K. T. Developer (dev [*at*] example [*dot*] com)
 */

(function(jq) {
  jq.fn.holdEvent = function(extendedAction, briefAction, delayThreshold) {
    // If the threshold for a long press isn't specified, use a default value.
    if (typeof delayThreshold === "undefined") {
      delayThreshold = 600;
    }

    return this.each(function() {
      var currentElement = jq(this);

      // Variables to manage the state of a press event.
      var pressStartTime; // Records when the press began.
      var timerHandle;    // Stores the ID of the timeout for the extended action.

      // Callback function for when a mouse button is pressed down or a touch begins.
      function onPressStart(evt) {
        pressStartTime = new Date().getTime();
        var invocationContext = jq(this);

        // Schedule an action to fire if the press duration exceeds the threshold.
        timerHandle = setTimeout(function() {
          if (typeof extendedAction === "function") {
            extendedAction.call(invocationContext, evt);
          } else {
            jq.error('A functional callback is mandatory for sustained presses. Input received: ' + typeof extendedAction);
          }
        }, delayThreshold);
      }

      // Callback function for when a mouse button is released or a touch ends.
      function onPressEnd(evtObject) {
        var timeElapsed = new Date().getTime() - pressStartTime;
        if (timeElapsed < delayThreshold) {
          // If the press was brief, cancel the pending extended action.
          clearTimeout(timerHandle);

          // Execute the brief action if one was supplied.
          if (typeof briefAction === "function") {
            briefAction.call(jq(this), evtObject);
          } else if (typeof briefAction === "undefined") {
            // No specific action defined for a brief press.
            void 0; // Explicitly do nothing.
          } else {
            jq.error('The optional callback for a quick press must be a function type.');
          }
        }
      }

      // Callback function to handle movement during a press, which should cancel the extended action.
      function onMovementDetected(eventData) {
        // Any movement during the press negates the "long press" condition.
        clearTimeout(timerHandle);
      }


      // Bind events for traditional desktop browsers.
      currentElement.on('mousedown', onPressStart);
      currentElement.on('mouseup', onPressEnd);
      currentElement.on('mousemove', onMovementDetected);


      // Bind events for touch-enabled mobile devices.
      currentElement.on('touchstart', onPressStart);
      currentElement.on('touchend', onPressEnd);
      currentElement.on('touchmove', onMovementDetected);
    });
  };
}(jQuery));