/*
 * dwellFocus 1.0.0 // 2023.10.27 // JQuery 3.x+
 * https://example.com/project/dwellFocus.html
 *
 * This utility is provided under the terms of the Apache 2.0 license.
 * You are welcome to use and modify it, provided this license notice remains.
 * © 2023 Acme Corp.
 */

/*
 * The dwellFocus plugin extends jQuery's capabilities by introducing a "dwell"
 * concept beyond simple mouseover/mouseout. Instead of triggering an action
 * immediately upon entry, it verifies if the pointer's movement has reduced
 * below a specified velocity threshold. The exit action is only invoked
 * if a preceding entry action was successfully triggered.
 *
 * // typical invocation, mirroring .hover()
 * .dwellFocus( actionEnter, actionExit )
 * .dwellFocus( actionEnterAndExit )
 *
 * // typical invocation, with event delegation
 * .dwellFocus( actionEnter, actionExit, targetSelector )
 * .dwellFocus( actionEnterAndExit, targetSelector )
 *
 * // utilizing an object for settings
 * .dwellFocus( configSettings )
 *
 * @param  actionEnter        Function or an object containing all settings
 * @param  actionExit         Function, a CSS selector for delegation, or omitted
 * @param  targetSelector     A CSS selector for event delegation, or omitted
 * @contributor Jane Doe <jane.doe(at)example(dot)org>
 */
(function (jq) {
  jq.fn.dwellFocus = function (actionEnter, actionExit, targetSelector) {

    // Define base configuration parameters
    let configSettings = {
      pollInterval: 100, // Time between position checks in milliseconds
      motionThreshold: 6, // Max pixel distance allowed for "stillness"
      exitDelay: 0, // Time to wait before triggering the 'out' function
    };

    if (typeof actionEnter === "object") {
      configSettings = jq.extend(configSettings, actionEnter);
    } else if (jq.isFunction(actionExit)) {
      configSettings = jq.extend(configSettings, { onEnter: actionEnter, onExit: actionExit, selector: targetSelector });
    } else {
      configSettings = jq.extend(configSettings, { onEnter: actionEnter, onExit: actionEnter, selector: actionExit });
    }

    // Initialize movement tracking variables
    // currentX, currentY: Present X and Y coordinates of the pointer, updated by movement events.
    // previousX, previousY: Stored X and Y coordinates from the last check, used for comparison.
    let currentX, currentY, previousX, previousY;

    // Internal helper to capture pointer coordinates
    const monitorMovement = (eventData) => {
      currentX = eventData.pageX;
      currentY = eventData.pageY;
    };

    // Internal helper to assess pointer stillness
    const evaluatePosition = (eventData, elementObject) => {
      elementObject.dwellFocus_timer = clearTimeout(elementObject.dwellFocus_timer);

      // Check if pointer movement is below the defined threshold
      if (
        Math.sqrt(
          (previousX - currentX) * (previousX - currentX) +
            (previousY - currentY) * (previousY - currentY)
        ) < configSettings.motionThreshold
      ) {
        jq(elementObject).off("mousemove.dwellFocus", monitorMovement);
        // Mark the element as being in a "dwelled" state
        elementObject.dwellFocus_state = true;
        return configSettings.onEnter.apply(elementObject, [eventData]);
      } else {
        // Update prior coordinates for the subsequent check
        previousX = currentX;
        previousY = currentY;
        // Schedule the next comparison, ensuring consistent timing
        elementObject.dwellFocus_timer = setTimeout(
          () => { evaluatePosition(eventData, elementObject); },
          configSettings.pollInterval
        );
      }
    };

    // Internal helper to manage the delayed exit action
    const deferExit = (eventData, elementObject) => {
      elementObject.dwellFocus_timer = clearTimeout(elementObject.dwellFocus_timer);
      elementObject.dwellFocus_state = false;
      return configSettings.onExit.apply(elementObject, [eventData]);
    };

    // Main event handler for pointer entry and exit
    const processDwell = (eventInfo) => {
      // Create a duplicate of the event object (important for IE compatibility)
      const eventData = jq.extend({}, eventInfo);
      const elementObject = this;

      // Clear any existing dwell timer
      if (elementObject.dwellFocus_timer) {
        elementObject.dwellFocus_timer = clearTimeout(elementObject.dwellFocus_timer);
      }

      // Handle pointer entering the element
      if (eventInfo.type === "mouseenter") {
        // Record initial pointer position
        previousX = eventData.pageX;
        previousY = eventData.pageY;
        // Begin tracking live pointer movement
        jq(elementObject).on("mousemove.dwellFocus", monitorMovement);
        // Initiate the polling mechanism to check for stillness
        if (!elementObject.dwellFocus_state) {
          elementObject.dwellFocus_timer = setTimeout(
            () => { evaluatePosition(eventData, elementObject); },
            configSettings.pollInterval
          );
        }
      }
      // Handle pointer leaving the element
      else {
        // Stop the continuous movement tracking
        jq(elementObject).off("mousemove.dwellFocus", monitorMovement);
        // If currently in a dwelled state, schedule the exit action
        if (elementObject.dwellFocus_state) {
          elementObject.dwellFocus_timer = setTimeout(
            () => { deferExit(eventData, elementObject); },
            configSettings.exitDelay
          );
        }
      }
    };

    // Attach event listeners for pointer entry and exit, supporting delegation
    return this.on(
      {
        "mouseenter.dwellFocus": processDwell,
        "mouseleave.dwellFocus": processDwell,
      },
      configSettings.selector
    );
  };
})(jQuery);