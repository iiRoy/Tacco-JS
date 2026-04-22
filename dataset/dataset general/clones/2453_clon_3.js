// A foundational module designed for managing interactive inputs and presentation
// within web applications. It streamlines event handling for user interactions
// such as mouse, touch, keyboard, and gamepad, and provides utilities for
// dynamic scaling and animation loops.
(function(globalScope, void0) {
  "use strict"; // Enforce stricter parsing and error handling for robust code.

  // --- Environment Checks and Polyfills ---

  // Verify that the code is running in a browser environment.
  // This helps prevent unexpected errors in non-browser contexts (e.g., Node.js).
  if (typeof globalScope.document === 'undefined' || typeof globalScope.navigator === 'undefined') {
    console.warn("InteractionNexus: Operating outside a standard browser environment. Functionality may be limited or unavailable.");
    return; // Exit module initialization if not in a browser.
  }

  // Detect if the user agent indicates a mobile operating system.
  // This flag helps differentiate input behaviors (e.g., mouse vs. touch).
  const agentString = globalScope.navigator.userAgent;
  const isMobileClient = /FFOS|Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(agentString);

  // Standardize the requestAnimationFrame function for smooth, browser-optimized animations.
  // Provides fallbacks for older browsers to ensure a consistent 60 frames per second update rate.
  const requestAnimFrame = (function() {
    return globalScope.requestAnimationFrame ||
           globalScope.webkitRequestAnimationFrame ||
           globalScope.mozRequestAnimationFrame ||
           globalScope.oRequestAnimationFrame ||
           globalScope.msRequestAnimationFrame ||
           function(callback) {
             globalScope.setTimeout(callback, Math.floor(1000 / 60)); // Default to 60 FPS.
           };
  })();

  // --- Core InteractionNexus Object Definition ---

  /**
   * Initializes the InteractionNexus, setting up event listeners and core configurations.
   * This is the primary entry point for integrating the module into an application.
   * @param {object} eventHandlers - An object mapping event names to callback functions.
   * @param {object} appConfig - Configuration settings for the application context.
   * @param {string|HTMLElement} [targetElement] - The DOM element to attach events to, or its CSS selector. Defaults to the global window object.
   */
  let INexus = function(eventHandlers, appConfig, targetElement) {
    // Determine the actual DOM element for event attachment.
    let effectiveTargetElement = targetElement;
    if (effectiveTargetElement === void0) {
      effectiveTargetElement = globalScope; // Default to window for global events.
    } else if (typeof effectiveTargetElement === "string") {
      const selectedNode = globalScope.document.querySelector(effectiveTargetElement);
      if (!selectedNode) {
        console.error(`INexus: Specified target element selector "${effectiveTargetElement}" did not match any DOM node.`);
        return; // Halt initialization if the target element is not found.
      }
      effectiveTargetElement = selectedNode;
    }

    // Merge application configuration with event handler context.
    // This allows event callbacks to access shared state and settings.
    const executionContext = appConfig || eventHandlers;

    // Dynamically apply registered event handlers to the target element.
    for (const handlerKey in eventHandlers) {
      // Ensure the handler is an own property of INexus and is a function.
      if (Object.prototype.hasOwnProperty.call(INexus, handlerKey) && typeof INexus[handlerKey] === "function") {
        INexus[handlerKey](effectiveTargetElement, eventHandlers[handlerKey], executionContext);
      }
    }

    // Initialize display scaling properties within the context.
    executionContext.currentScaleFactor = 1.0; // Current visual scale of the application content.
    executionContext.inverseScaleFactor = 1.0; // Reciprocal of the current scale for coordinate conversion.

    // Configure multi-touch prevention. Default to true if not explicitly set to false.
    executionContext.blockMultiTouch = executionContext.blockMultiTouch === true;

    // Enable automatic scaling to fit the viewport if configured.
    if (executionContext.autoAdjustScale) {
      globalScope.addEventListener("resize", () => {
        INexus.adjustToViewport(effectiveTargetElement, executionContext);
      });
      // Perform an initial scaling adjustment immediately.
      INexus.adjustToViewport(effectiveTargetElement, executionContext);
    }

    // Start the continuous gamepad input polling loop.
    // Utilizes requestAnimationFrame for optimal performance and synchronization with browser rendering.
    requestAnimFrame(INexus.gamepadPollLoop);

    // Set the initial state of mouse input enablement based on device type.
    INexus.isMouseEnabled = !isMobileClient;
  };

  // --- Utility Functions and Mappings ---

  /**
   * Deeply merges properties from one or more source objects into a target object.
   * This function ensures that properties are copied without mutating the source objects.
   * @param {object} targetObject - The object to which properties will be merged.
   * @param {...object} sourceObjects - One or more objects whose properties will be copied.
   * @returns {object} The modified targetObject.
   */
  INexus.mergeObjects = function(targetObject, ...sourceObjects) {
    if (!targetObject || typeof targetObject !== 'object') {
      console.error("INexus.mergeObjects: The first argument must be a valid object to merge into.");
      return targetObject;
    }
    for (const source of sourceObjects) {
      if (source && typeof source === 'object') {
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) { // Copy only own properties.
            targetObject[key] = source[key];
          }
        }
      }
    }
    return targetObject;
  };

  /**
   * A lookup table for standard gamepad button indices, mapping them to descriptive string names.
   * This enhances readability and provides a consistent interface for gamepad input.
   */
  INexus.gamepadInputMap = {
    0: "faceButtonBottom", // e.g., 'A' on Xbox, 'X' on PlayStation
    1: "faceButtonRight",  // e.g., 'B' on Xbox, 'Circle' on PlayStation
    2: "faceButtonLeft",   // e.g., 'X' on Xbox, 'Square' on PlayStation
    3: "faceButtonTop",    // e.g., 'Y' on Xbox, 'Triangle' on PlayStation
    4: "leftShoulder1",    // Left bumper/trigger
    5: "rightShoulder1",   // Right bumper/trigger
    6: "leftShoulder2",    // Left analog trigger
    7: "rightShoulder2",   // Right analog trigger
    8: "backButton",       // Select/Back button
    9: "startButton",      // Start button
    10: "leftStickClick",  // Left analog stick pressed
    11: "rightStickClick", // Right analog stick pressed
    12: "dpadUp",
    13: "dpadDown",
    14: "dpadLeft",
    15: "dpadRight"
  };

  /**
   * A comprehensive mapping of standard keyboard key codes (e.which/keyCode) to descriptive string names.
   * This helps in standardizing keyboard input handling across different browsers.
   */
  INexus.keyboardInputMap = {
    37: "arrowLeft", 38: "arrowUp", 39: "arrowRight", 40: "arrowDown",
    45: "insertKey", 46: "deleteKey", 8: "backspaceKey", 9: "tabKey",
    13: "enterKey", 16: "shiftKey", 17: "controlKey", 18: "altKey",
    19: "pauseBreak", 20: "capsLock", 27: "escapeKey", 32: "spacebar",
    33: "pageUp", 34: "pageDown", 35: "endKey", 36: "homeKey", // Added homeKey
    112: "f1Key", 113: "f2Key", 114: "f3Key", 115: "f4Key", 116: "f5Key",
    117: "f6Key", 118: "f7Key", 119: "f8Key", 120: "f9Key", 121: "f10Key",
    122: "f11Key", 123: "f12Key", 144: "numLock", 145: "scrollLock",
    186: "semicolonKey", 187: "equalsKey", 188: "commaKey", 189: "dashKey",
    190: "periodKey", 191: "slashKey", 192: "graveAccent",
    219: "openBracket", 220: "backslashKey", 221: "closeBracket",
    222: "singleQuote"
  };

  // --- Extended InteractionNexus Functionalities ---

  // Augment the main INexus object with a set of powerful interaction handling methods.
  INexus.mergeObjects(INexus, {
    // Internal state storage for connected gamepad devices, used to detect state changes.
    _gamepadDeviceStates: [],

    // A registry to store and manage event subscribers for custom events.
    _eventSubscriberRegistry: {},

    /**
     * Subscribes a given callback function to a custom event identified by its name.
     * Callbacks will be invoked when the event is emitted via `emitEvent`.
     * @param {string} eventName - The unique name of the event to subscribe to.
     * @param {Function} callbackFn - The function to execute when the event occurs.
     */
    subscribeToEvent: function(eventName, callbackFn) {
      if (typeof callbackFn !== 'function') {
        console.warn(`INexus.subscribeToEvent: Attempted to subscribe a non-function callback for event '${eventName}'.`);
        return;
      }
      if (!this._eventSubscriberRegistry[eventName]) {
        this._eventSubscriberRegistry[eventName] = [];
      }
      this._eventSubscriberRegistry[eventName].push(callbackFn);
    },

    /**
     * Emits a custom event, triggering all registered callback functions for that event.
     * Any additional arguments passed will be forwarded to the callbacks.
     * @param {string} eventName - The name of the event to emit.
     * @param {...*} eventArgs - Arguments to pass to the subscribed event handlers.
     */
    emitEvent: function(eventName, ...eventArgs) {
      const subscribers = this._eventSubscriberRegistry[eventName];
      if (!subscribers || subscribers.length === 0) {
        return; // No listeners registered for this event.
      }

      // Iterate over a shallow copy of the subscribers array to prevent issues
      // if a callback modifies the array during iteration.
      [...subscribers].forEach(callbackFn => {
        try {
          callbackFn.apply(this, eventArgs); // Invoke callback with INexus as 'this' context.
        } catch (error) {
          console.error(`INexus.emitEvent: An error occurred in a callback for event '${eventName}':`, error);
        }
      });
    },

    /**
     * Computes the Euclidean distance between two 2D points.
     * @param {number} x1 - X-coordinate of the first point.
     * @param {number} y1 - Y-coordinate of the first point.
     * @param {number} x2 - X-coordinate of the second point.
     * @param {number} y2 - Y-coordinate of the second point.
     * @returns {number} The calculated distance.
     */
    calculateEuclideanDistance: function(x1, y1, x2, y2) {
      const deltaX = x2 - x1;
      const deltaY = y2 - y1;
      return Math.hypot(deltaX, deltaY); // Using Math.hypot for accuracy and conciseness.
    },

    /**
     * A continuous loop responsible for polling gamepad states and emitting
     * `gamepadButtonDown`, `gamepadButtonUp`, and `gamepadAxisMove` events.
     * This function is designed to be called repeatedly via `requestAnimFrame`.
     */
    gamepadPollLoop: function() {
      // Check for browser support of the Gamepad API.
      if (globalScope.navigator.getGamepads || globalScope.navigator.webkitGetGamepads) {
        const connectedGamepads = globalScope.navigator.getGamepads ?
          globalScope.navigator.getGamepads() :
          globalScope.navigator.webkitGetGamepads();

        if (connectedGamepads) { // Ensure gamepads array is not null/undefined
          for (let i = 0; i < connectedGamepads.length; i++) {
            const currentGamepad = connectedGamepads[i];

            // Skip if no gamepad is detected at the current index.
            if (!currentGamepad) {
              continue;
            }

            // Initialize previous state for a newly detected gamepad.
            if (!INexus._gamepadDeviceStates[i]) {
              INexus._gamepadDeviceStates[i] = {
                buttons: Array(currentGamepad.buttons.length).fill(0), // Default to 0 for all buttons.
                axes: Array(currentGamepad.axes.length).fill(0) // Default to 0 for all axes.
              };
            }

            const previousState = INexus._gamepadDeviceStates[i];
            const currentButtons = currentGamepad.buttons;
            const currentAxes = currentGamepad.axes;

            // Check for changes in analog stick (axes) positions.
            let axesMovementDetected = false;
            for (let axisIndex = 0; axisIndex < currentAxes.length; axisIndex++) {
              if (previousState.axes[axisIndex] !== currentAxes[axisIndex]) {
                axesMovementDetected = true;
                break;
              }
            }
            if (axesMovementDetected) {
              INexus.emitEvent("gamepadAxisMove", ...currentAxes, i);
            }

            // Prepare an array for processed button states, including simulated D-pad.
            const processedButtonStates = [];
            // Copy actual button values first.
            for (let btnIdx = 0; btnIdx < currentButtons.length; btnIdx++) {
                processedButtonStates[btnIdx] = currentButtons[btnIdx].value;
            }

            // Simulate D-pad button presses from the first two axes (left stick usually).
            // These overwrite specific indices in the processedButtonStates array.
            const dpadThreshold = 0.5; // Sensitivity for D-pad axis interpretation.
            if (currentAxes.length >= 2) {
              processedButtonStates[12] = currentAxes[1] < -dpadThreshold ? 1 : 0; // D-pad Up
              processedButtonStates[13] = currentAxes[1] > dpadThreshold ? 1 : 0;  // D-pad Down
              processedButtonStates[14] = currentAxes[0] < -dpadThreshold ? 1 : 0; // D-pad Left
              processedButtonStates[15] = currentAxes[0] > dpadThreshold ? 1 : 0;  // D-pad Right
            }


            // Compare current and previous button states to detect presses and releases.
            for (let j = 0; j < processedButtonStates.length; j++) {
              const previousButtonVal = previousState.buttons[j] || 0; // Handle potentially undefined previous state.
              const currentButtonVal = processedButtonStates[j];

              if (previousButtonVal === 0 && currentButtonVal > 0) {
                INexus.emitEvent("gamepadButtonDown", INexus.gamepadInputMap[j] || `button_${j}`, i, currentButtonVal);
              } else if (previousButtonVal > 0 && currentButtonVal === 0) {
                INexus.emitEvent("gamepadButtonUp", INexus.gamepadInputMap[j] || `button_${j}`, i, currentButtonVal);
              }
            }

            // Update the stored gamepad state for the next polling cycle.
            INexus._gamepadDeviceStates[i] = {
              buttons: processedButtonStates,
              axes: [...currentAxes] // Store a copy of the current axis values.
            };
          }
        }
      }

      // Recursively schedule the next gamepad poll loop for continuous monitoring.
      requestAnimFrame(INexus.gamepadPollLoop);
    },

    /**
     * Calculates the pointer (mouse or touch) coordinates relative to a specific HTML element.
     * Accounts for element offsets and scroll positions.
     * @param {Event} inputEvent - The DOM event object (e.g., MouseEvent, TouchEvent).
     * @param {HTMLElement} [relativeElement] - The element to use as the reference frame. Defaults to the event target.
     * @returns {{x: number, y: number}} An object containing the calculated x and y coordinates.
     */
    getPointerCoordinates: function(inputEvent, relativeElement) {
      let totalOffsetX = 0;
      let totalOffsetY = 0;
      let currentRefElement = relativeElement || inputEvent.target || inputEvent.srcElement;
      let pointerClientX = 0;
      let pointerClientY = 0;

      // Calculate the cumulative offset of the element from the document's top-left corner.
      // Prioritize getBoundingClientRect for modern accuracy, fallback to offsetParent chain.
      if (currentRefElement && typeof currentRefElement.getBoundingClientRect === 'function') {
        const rect = currentRefElement.getBoundingClientRect();
        totalOffsetX = rect.left + globalScope.scrollX;
        totalOffsetY = rect.top + globalScope.scrollY;
      } else if (currentRefElement && currentRefElement.offsetParent) {
        do {
          totalOffsetX += currentRefElement.offsetLeft;
          totalOffsetY += currentRefElement.offsetTop;
        } while ((currentRefElement = currentRefElement.offsetParent));
      }

      // Normalize event object for touch inputs to get the primary touch point.
      const activeInputEvent = (inputEvent.changedTouches && inputEvent.changedTouches[0] !== void0) ?
        inputEvent.changedTouches[0] :
        inputEvent;

      // Retrieve pointer coordinates from the event.
      if (activeInputEvent.pageX || activeInputEvent.pageY) {
        pointerClientX = activeInputEvent.pageX;
        pointerClientY = activeInputEvent.pageY;
      } else if (activeInputEvent.clientX || activeInputEvent.clientY) {
        // Fallback for older IE versions or specific event types.
        pointerClientX = activeInputEvent.clientX + globalScope.document.body.scrollLeft + globalScope.document.documentElement.scrollLeft;
        pointerClientY = activeInputEvent.clientY + globalScope.document.body.scrollTop + globalScope.document.documentElement.scrollTop;
      }

      // Subtract the element's total offset to get coordinates relative to the element.
      const relativeX = pointerClientX - totalOffsetX;
      const relativeY = pointerClientY - totalOffsetY;

      return {
        x: relativeX,
        y: relativeY
      };
    },

    /**
     * Registers a callback function to be executed on every animation frame.
     * This is ideal for game logic updates, physics calculations, or other time-sensitive processes.
     * @param {HTMLElement} targetElement - The element relevant to the update (often a canvas).
     * @param {Function} updateCallback - The function to call on each frame, receiving `deltaTime` and `currentTimestamp`.
     * @param {object} contextObject - The `this` context that `updateCallback` will be invoked with.
     */
    registerFrameUpdate: function(targetElement, updateCallback, contextObject) {
      let lastFrameTimestamp = performance.now(); // Use high-resolution timer.

      const animationLoop = (currentTimestamp) => {
        const deltaTime = currentTimestamp - lastFrameTimestamp;
        lastFrameTimestamp = currentTimestamp;

        requestAnimFrame(animationLoop); // Schedule the next frame.
        updateCallback.call(contextObject, deltaTime, currentTimestamp);
      };

      requestAnimFrame(animationLoop); // Initiate the first frame.
    },

    // Note: The original 'onrender' function was a duplicate of 'onstep' and has been removed
    // to simplify the API. 'registerFrameUpdate' now serves this purpose.

    /**
     * Attaches a listener for mouse movement events to the specified element.
     * The callback receives scaled coordinates relative to the element.
     * @param {HTMLElement} targetElement - The DOM element to monitor for mouse movements.
     * @param {Function} callbackFn - The function to call on mouse move.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onPointerMove: function(targetElement, callbackFn, contextObject) {
      if (!targetElement) {
        console.warn("INexus.onPointerMove: Target element is invalid or missing.");
        return;
      }
      targetElement.addEventListener("mousemove", (event) => {
        if (!INexus.isMouseEnabled) return; // Skip if mouse input is disabled.

        const pointerCoords = INexus.getPointerCoordinates(event, targetElement);
        // Apply inverse scaling and floor to get integer coordinates.
        callbackFn.call(contextObject, Math.floor(pointerCoords.x * contextObject.inverseScaleFactor), Math.floor(pointerCoords.y * contextObject.inverseScaleFactor));
      });
    },

    /**
     * Attaches a listener for mouse button press (mousedown) events.
     * Stores the initial click position for potential use in click detection.
     * @param {HTMLElement} targetElement - The DOM element to monitor for mouse button presses.
     * @param {Function} callbackFn - The function to call on mouse down.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onPointerDown: function(targetElement, callbackFn, contextObject) {
      if (!targetElement) return;
      targetElement.addEventListener("mousedown", (event) => {
        if (!INexus.isMouseEnabled) return;

        const pointerCoords = INexus.getPointerCoordinates(event, targetElement);
        const scaledX = Math.floor(pointerCoords.x * contextObject.inverseScaleFactor);
        const scaledY = Math.floor(pointerCoords.y * contextObject.inverseScaleFactor);

        // Store the initial pointer down position in the context for click detection.
        contextObject.lastPointerDownCoords = {
          x: scaledX,
          y: scaledY
        };
        callbackFn.call(contextObject, scaledX, scaledY, event.button);
      });
    },

    /**
     * Attaches a listener for mouse button release (mouseup) events.
     * @param {HTMLElement} targetElement - The DOM element to monitor for mouse button releases.
     * @param {Function} callbackFn - The function to call on mouse up.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onPointerUp: function(targetElement, callbackFn, contextObject) {
      if (!targetElement) return;
      targetElement.addEventListener("mouseup", (event) => {
        if (!INexus.isMouseEnabled) return;

        const pointerCoords = INexus.getPointerCoordinates(event, targetElement);
        // Apply inverse scaling and floor to get integer coordinates.
        callbackFn.call(contextObject, Math.floor(pointerCoords.x * contextObject.inverseScaleFactor), Math.floor(pointerCoords.y * contextObject.inverseScaleFactor), event.button);
      });
    },

    /**
     * Attaches a listener for mouse wheel (scroll) events.
     * Normalizes scroll delta across different browser implementations.
     * @param {HTMLElement} targetElement - The DOM element to monitor for scroll input.
     * @param {Function} callbackFn - The function to call on scroll, receiving scroll direction (-1 or 1).
     * @param {object} contextObject - The `this` context for the callback.
     */
    onScrollInput: function(targetElement, callbackFn, contextObject) {
      if (!targetElement) return;

      // Determine the most compatible scroll event names for the current browser.
      const compatibleScrollEvents = ('onwheel' in globalScope.document || globalScope.document.documentMode >= 9) ?
        ['wheel'] :
        ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];

      compatibleScrollEvents.forEach(eventName => {
        targetElement.addEventListener(eventName, (event) => {
          if (!INexus.isMouseEnabled) return;

          const originalEvent = event || globalScope.event;
          let normalizedScrollDelta = 0;

          // Normalize scroll delta values from various event properties.
          if (originalEvent.wheelDelta) { // Webkit, IE
            normalizedScrollDelta = originalEvent.wheelDelta;
          } else if (originalEvent.detail) { // Firefox (legacy)
            normalizedScrollDelta = originalEvent.detail * -1;
          } else if (originalEvent.deltaY) { // Standard 'wheel' event
            normalizedScrollDelta = originalEvent.deltaY * -1;
          } else if (originalEvent.wheelDeltaY !== void0) { // Webkit specific Y-axis delta
            normalizedScrollDelta = originalEvent.wheelDeltaY;
          }

          if (normalizedScrollDelta !== 0) {
            // Pass a normalized direction (1 for scroll up/out, -1 for scroll down/in).
            callbackFn.call(contextObject, Math.sign(normalizedScrollDelta));
          }

          event.preventDefault(); // Prevent default page scrolling behavior.
        }, {
          passive: false
        }); // Ensure `preventDefault` is effective.
      });
    },

    /**
     * Attaches a listener for touch move (drag) events.
     * Prevents default browser behaviors and handles multi-touch based on configuration.
     * @param {HTMLElement} targetElement - The DOM element to monitor for touch drags.
     * @param {Function} callbackFn - The function to call on touch move.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onTouchDrag: function(targetElement, callbackFn, contextObject) {
      if (!targetElement) return;
      targetElement.addEventListener("touchmove", (event) => {
        // Prevent multi-touch interaction if configured to do so.
        if (contextObject.blockMultiTouch && event.touches.length > 1) {
          return;
        }
        event.preventDefault(); // Prevent default scrolling/zooming.

        const touchCoords = INexus.getPointerCoordinates(event, targetElement);
        callbackFn.call(contextObject, Math.floor(touchCoords.x * contextObject.inverseScaleFactor), Math.floor(touchCoords.y * contextObject.inverseScaleFactor), event.touches);
      }, {
        passive: false
      });
    },

    /**
     * Attaches a listener for touch start events.
     * Stores the initial touch position for tap/click detection.
     * @param {HTMLElement} targetElement - The DOM element to monitor for touch starts.
     * @param {Function} callbackFn - The function to call on touch start.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onTouchStart: function(targetElement, callbackFn, contextObject) {
      if (!targetElement) return;
      targetElement.addEventListener("touchstart", (event) => {
        // Prevent multi-touch if configured and if it's not the first touch.
        if (contextObject.blockMultiTouch && event.touches.length > 1) {
          return;
        }

        const touchCoords = INexus.getPointerCoordinates(event, targetElement);
        const scaledX = Math.floor(touchCoords.x * contextObject.inverseScaleFactor);
        const scaledY = Math.floor(touchCoords.y * contextObject.inverseScaleFactor);

        // Store the initial touch position.
        contextObject.lastPointerDownCoords = {
          x: scaledX,
          y: scaledY
        };
        callbackFn.call(contextObject, scaledX, scaledY, event.touches);
      });
    },

    /**
     * Attaches a listener for touch end events.
     * @param {HTMLElement} targetElement - The DOM element to monitor for touch ends.
     * @param {Function} callbackFn - The function to call on touch end.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onTouchEnd: function(targetElement, callbackFn, contextObject) {
      if (!targetElement) return;
      targetElement.addEventListener("touchend", (event) => {
        // Only proceed if multi-touch is allowed or if all touches have ended.
        if (contextObject.blockMultiTouch && event.touches.length > 0) {
          return;
        }
        const touchCoords = INexus.getPointerCoordinates(event, targetElement);
        callbackFn.call(contextObject, Math.floor(touchCoords.x * contextObject.inverseScaleFactor), Math.floor(touchCoords.y * contextObject.inverseScaleFactor), event.touches);
      });
    },

    /**
     * Attaches a listener for click-like events, with a configurable movement tolerance.
     * This method leverages the `onPointerUp` listener and checks the distance from `lastPointerDownCoords`.
     * @param {HTMLElement} targetElement - The DOM element to monitor for clicks.
     * @param {Function} callbackFn - The function to call on click.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onClickTrigger: function(targetElement, callbackFn, contextObject) {
      // Define a small configurable threshold for distinguishing a click from a drag.
      const CLICK_MOVE_TOLERANCE_PX = 5;

      // Re-use the onPointerUp mechanism but add a distance check.
      this.onPointerUp(targetElement, function(x, y) {
        // Ensure a pointer down event preceded this up event.
        if (contextObject.lastPointerDownCoords &&
          INexus.calculateEuclideanDistance(x, y, contextObject.lastPointerDownCoords.x, contextObject.lastPointerDownCoords.y) < CLICK_MOVE_TOLERANCE_PX) {
          callbackFn.call(contextObject, x, y);
        }
        // Clear the stored last pointer down position to avoid stale data.
        contextObject.lastPointerDownCoords = null;
      }, contextObject);
    },

    /**
     * Attaches a listener for keyboard key down events to the document.
     * Normalizes key identifiers for consistent handling.
     * @param {HTMLElement} targetElement - The element (typically `document`) for keyboard events.
     * @param {Function} callbackFn - The function to call on key down.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onKeyDepressed: function(targetElement, callbackFn, contextObject) {
      globalScope.document.addEventListener("keydown", (event) => {
        // Prioritize `event.key` for modern, semantic key identification.
        // Fallback to `event.which` with custom mapping for broader compatibility.
        const keyIdentifier = event.key || (
          (event.which >= 48 && event.which <= 90) ? String.fromCharCode(event.which).toLowerCase() :
          INexus.keyboardInputMap[event.which]
        );
        if (keyIdentifier) { // Only trigger if a valid key identifier was determined.
          callbackFn.call(contextObject, keyIdentifier);
        }
      });
    },

    /**
     * Attaches a listener for keyboard key up events to the document.
     * Normalizes key identifiers.
     * @param {HTMLElement} targetElement - The element (typically `document`) for keyboard events.
     * @param {Function} callbackFn - The function to call on key up.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onKeyReleased: function(targetElement, callbackFn, contextObject) {
      globalScope.document.addEventListener("keyup", (event) => {
        const keyIdentifier = event.key || (
          (event.which >= 48 && event.which <= 90) ? String.fromCharCode(event.which).toLowerCase() :
          INexus.keyboardInputMap[event.which]
        );
        if (keyIdentifier) {
          callbackFn.call(contextObject, keyIdentifier);
        }
      });
    },

    /**
     * Attaches a listener for custom gamepad button down events.
     * Internally subscribes to the `gamepadButtonDown` event emitted by `gamepadPollLoop`.
     * @param {HTMLElement} targetElement - Not directly used, but part of the event handler signature.
     * @param {Function} callbackFn - The function to call when a gamepad button is pressed.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onGamepadButtonDown: function(targetElement, callbackFn, contextObject) {
      INexus.subscribeToEvent("gamepadButtonDown", function(buttonName, gamepadIndex, buttonValue) {
        callbackFn.call(contextObject, buttonName, gamepadIndex, buttonValue);
      });
    },

    /**
     * Attaches a listener for custom gamepad button up events.
     * Internally subscribes to the `gamepadButtonUp` event.
     * @param {HTMLElement} targetElement - Not directly used.
     * @param {Function} callbackFn - The function to call when a gamepad button is released.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onGamepadButtonUp: function(targetElement, callbackFn, contextObject) {
      INexus.subscribeToEvent("gamepadButtonUp", function(buttonName, gamepadIndex, buttonValue) {
        callbackFn.call(contextObject, buttonName, gamepadIndex, buttonValue);
      });
    },

    /**
     * Attaches a listener for custom gamepad axis movement events.
     * Internally subscribes to the `gamepadAxisMove` event.
     * @param {HTMLElement} targetElement - Not directly used.
     * @param {Function} callbackFn - The function to call when a gamepad axis moves.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onGamepadAxisMove: function(targetElement, callbackFn, contextObject) {
      INexus.subscribeToEvent("gamepadAxisMove", function(...axisValuesAndIndex) {
        callbackFn.apply(contextObject, axisValuesAndIndex);
      });
    },

    /**
     * Attaches a listener for window resize events.
     * @param {HTMLElement} targetElement - Not directly used.
     * @param {Function} callbackFn - The function to call when the window is resized, receiving new width and height.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onWindowResized: function(targetElement, callbackFn, contextObject) {
      globalScope.addEventListener("resize", () => {
        callbackFn.call(contextObject, globalScope.innerWidth, globalScope.innerHeight);
      });
      // Optionally, trigger the callback immediately upon registration.
      // callbackFn.call(contextObject, globalScope.innerWidth, globalScope.innerHeight);
    },

    /**
     * Attaches listeners to the document for drag-and-drop image file events.
     * When an image file is dropped, it's loaded and passed to the callback.
     * @param {HTMLElement} targetElement - Not directly used.
     * @param {Function} callbackFn - The function to call when an image is successfully dropped and loaded.
     * @param {object} contextObject - The `this` context for the callback.
     */
    onImageDrop: function(targetElement, callbackFn, contextObject) {
      globalScope.document.addEventListener('drop', (event) => {
        event.stopPropagation(); // Prevent event from bubbling up.
        event.preventDefault(); // Prevent default browser behavior (e.g., opening file).

        const droppedFiles = event.dataTransfer?.files;
        if (!droppedFiles || droppedFiles.length === 0) {
          console.warn("INexus.onImageDrop: No files were found in the drop event.");
          return;
        }

        const firstFile = droppedFiles[0];

        // Validate that the dropped file is an image.
        if (!firstFile.type.startsWith('image/')) {
          console.warn(`INexus.onImageDrop: Dropped file '${firstFile.name}' is not a recognized image type.`);
          return;
        }

        const fileReader = new FileReader();

        fileReader.onload = (readerEvent) => {
          const loadedImage = new Image();

          loadedImage.onload = () => {
            callbackFn.call(contextObject, loadedImage); // Pass the loaded image element.
          };

          loadedImage.onerror = (error) => {
            console.error("INexus.onImageDrop: Failed to load dropped image:", error);
          };

          loadedImage.src = readerEvent.target.result; // Set image source to the Data URL.
        };

        fileReader.onerror = (error) => {
          console.error("INexus.onImageDrop: Error reading dropped file:", error);
        };

        fileReader.readAsDataURL(firstFile); // Read the file as a Data URL.
      });

      // Prevent default drag-over behavior to indicate that a drop is allowed.
      globalScope.document.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
    },

    /**
     * Adjusts the scaling of a target display element (e.g., canvas) to fit within the viewport.
     * Updates the context's scale factors and optionally applies CSS transformations.
     * @param {HTMLElement} displayElement - The element whose scale needs to be adjusted.
     * @param {object} contextConfig - The configuration object containing `width`, `height`, and scale factors.
     */
    adjustToViewport: function(displayElement, contextConfig) {
      // Validate necessary parameters.
      if (!displayElement || !contextConfig || typeof contextConfig.width === 'undefined' || typeof contextConfig.height === 'undefined') {
        console.warn("INexus.adjustToViewport: Missing display element or context dimensions for scaling.");
        return;
      }

      const originalWidth = contextConfig.width;
      const originalHeight = contextConfig.height;

      const currentViewportWidth = globalScope.innerWidth;
      const currentViewportHeight = globalScope.innerHeight;

      // Calculate the scale factor primarily based on width.
      let calculatedScale = currentViewportWidth / originalWidth;

      // If scaling by width makes the height exceed the viewport, scale by height instead.
      if (originalHeight * calculatedScale > currentViewportHeight) {
        calculatedScale = currentViewportHeight / originalHeight;
      }

      // Update the context's scale factors.
      contextConfig.currentScaleFactor = calculatedScale;
      contextConfig.inverseScaleFactor = 1 / calculatedScale;

      // Apply the scaling transformation directly to the display element's style.
      // This assumes the displayElement is a CSS-transformable element like a canvas or div.
      if (displayElement instanceof globalScope.HTMLElement) {
        displayElement.style.transformOrigin = '0 0'; // Scale from the top-left corner.
        displayElement.style.transform = `scale(${calculatedScale})`;
        // Maintain the element's original logical dimensions to ensure correct scaling.
        displayElement.style.width = `${originalWidth}px`;
        displayElement.style.height = `${originalHeight}px`;
      }

      // Emit a custom event to notify other parts of the application about the scaling change.
      INexus.emitEvent("viewportScaled", calculatedScale, currentViewportWidth, currentViewportHeight);
    }
  });

  // Expose the fully configured InteractionNexus object to the global scope.
  globalScope.INexus = INexus;

})(window, void 0);