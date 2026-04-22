// This module provides core framework functionalities, replacing older systems.

(function(globalScope, voidValue) {
  // Reference to the browser's navigator object
  var browserAgent = globalScope.navigator;

  // Check if the current environment is a mobile or portable device
  var isHandheldDevice = /FFOS|Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(browserAgent.userAgent);

  // Polyfill or retrieve the browser's requestAnimationFrame function
  globalScope.requestNextFrame = (function() {
    return globalScope.requestAnimationFrame ||
           globalScope.webkitRequestAnimationFrame ||
           globalScope.mozRequestAnimationFrame ||
           globalScope.oRequestAnimationFrame ||
           globalScope.msRequestAnimationFrame ||
           function(actionFn) { // Fallback to setTimeout if rAF is not available
             globalScope.setTimeout(actionFn, Math.floor(1000.0 / 60.0));
           };
  })();

  // Main initialization function for the core framework
  symphony = function(actionMap, scopeData, targetNode) {
    // If no specific DOM element is provided, default to the global window
    if (targetNode === voidValue) {
      targetNode = globalScope;
    }
    // If a string is provided, try to find the element by selector
    else if (typeof targetNode === "string") {
      targetNode = document.querySelector(targetNode);
    }

    // Determine the effective context for operations
    var processingContext = scopeData || actionMap;

    // Iterate through the provided event configurations
    for (var eventName in actionMap) {
      // If a handler for this event type exists in the symphony object, call it
      if (typeof symphony[eventName] === "function") {
        symphony[eventName](targetNode, actionMap[eventName], processingContext);
      }
    }

    // Initialize scaling properties within the context
    processingContext.renderScale = 1;
    processingContext.inverseScale = 1;

    // Ensure the multitouch prevention flag is set, defaulting to false
    processingContext.blockMultiFinger = processingContext.blockMultiFinger || false;

    // If automatic display fitting is enabled
    if (processingContext.autoFitDisplay) {
      // Attach a listener for window resize events
      globalScope.addEventListener("resize", function() {
        symphony.fitDisplayToWindow(targetNode, processingContext);
      });

      // Perform an initial fit to screen
      symphony.fitDisplayToWindow(targetNode, processingContext);
    }

    // Set up a recurring interval for the primary update loop
    globalScope.setInterval(symphony.updateLoop, Math.floor(1000.0 / 60.0));
    // Alternate method for continuous updates: globalScope.requestNextFrame(symphony.updateLoop);

    // Set a flag indicating whether mouse input is active based on device type
    symphony.isMouseActive = !isHandheldDevice;
  };

  // Utility function to merge properties from source objects into a target object
  symphony.assignProps = function() {
    for (var counter1 = 1; counter1 < arguments.length; counter1++) {
      for (var propertyKey in arguments[counter1]) {
        arguments[0][propertyKey] = arguments[counter1][propertyKey];
      }
    }

    return arguments[0]; // Return the modified target object
  };

  // Mapping of gamepad button indices to descriptive names
  symphony.controlPadMap = {
    0: "buttonA",
    1: "buttonB",
    2: "buttonX",
    3: "buttonY",
    4: "leftBumper",
    5: "rightBumper",
    6: "leftTrigger",
    7: "rightTrigger",
    8: "selectButton",
    9: "startButton",
    12: "dpadUp",
    13: "dpadDown",
    14: "dpadLeft",
    15: "dpadRight"
  };

  // Mapping of keyboard key codes to descriptive names
  symphony.keyboardCodes = {
    37: "arrowLeft",
    38: "arrowUp",
    39: "arrowRight",
    40: "arrowDown",
    45: "insertKey",
    46: "deleteKey",
    8: "backspaceKey",
    9: "tabKey",
    13: "enterKey",
    16: "shiftKey",
    17: "ctrlKey",
    18: "altKey",
    19: "pauseBreak",
    20: "capsLock",
    27: "escapeKey",
    32: "spacebar",
    33: "pageUp",
    34: "pageDown",
    35: "endKey",
    112: "f1Key",
    113: "f2Key",
    114: "f3Key",
    115: "f4Key",
    116: "f5Key",
    117: "f6Key",
    118: "f7Key",
    119: "f8Key",
    120: "f9Key",
    121: "f10Key",
    122: "f11Key",
    123: "f12Key",
    144: "numLock",
    145: "scrollLock",
    186: "semicolonKey",
    187: "equalsSign",
    188: "commaKey",
    189: "dashKey",
    190: "periodKey",
    191: "slashKey",
    192: "backtickKey",
    219: "openBracket",
    220: "backslashKey",
    221: "closeBracket",
    222: "singleQuote"
  };

  // Extend the main symphony object with various utility functions and properties
  symphony.assignProps(symphony, {

    // Array to store the state of connected gamepads
    controllerStatus: [],

    // Object to hold collections of event listeners
    listenerRegistry: {},

    // Method to add a new event listener
    registerListener: function(signalType, actionFn) {
      if (!this.listenerRegistry[signalType]) {
        this.listenerRegistry[signalType] = [];
      }
      this.listenerRegistry[signalType].push(actionFn);
    },

    // Method to dispatch a custom signal (event)
    dispatchSignal: function(signalType) {
      var argumentArray = [];

      // Collect all arguments passed after the first one (signalType)
      for (var counter1 = 1; counter1 < arguments.length; counter1++) {
        argumentArray.push(arguments[counter1]);
      }

      var activeListeners = this.listenerRegistry[signalType];

      // If no listeners are registered for this signal, exit
      if (!activeListeners) {
        return;
      }

      // Invoke each registered listener with the collected arguments
      for (var counter1 = 0; counter1 < activeListeners.length; counter1++) {
        activeListeners[counter1].apply(this, argumentArray);
      }
    },

    // Calculates the Euclidean distance between two points
    calcDistance: function(coord1X, coord1Y, coord2X, coord2Y) {
      return Math.sqrt((coord2X - coord1X) * (coord2X - coord1X) + (coord2Y - coord1Y) * (coord2Y - coord1Y));
    },

    // The main game/application update loop
    updateLoop: function() {

      // Check for gamepad API support
      if (browserAgent.getGamepads || browserAgent.webkitGetGamepads) {

        var inputDevices = browserAgent.getGamepads ? browserAgent.getGamepads() : browserAgent.webkitGetGamepads();

        // Iterate through all connected gamepads
        for (var counter1 = 0; counter1 < inputDevices.length; counter1++) {
          var currentDevice = inputDevices[counter1];

          // Skip if the current device is not connected or invalid
          if (!currentDevice) {
            continue;
          }

          // Initialize gamepad state if it doesn't exist for this index
          if (!symphony.controllerStatus[counter1]) {
            symphony.controllerStatus[counter1] = currentDevice;
          }

          var previousState = symphony.controllerStatus[counter1];

          var buttonStates = [];

          // Check for changes in analog stick axes
          if (previousState.axes[0] !== currentDevice.axes[0] || previousState.axes[1] !== currentDevice.axes[1]) {
            symphony.dispatchSignal("controllerMove", currentDevice.axes[0], currentDevice.axes[1], counter1);
          }

          // Map d-pad axis values to virtual buttons (0=up, 1=down, 2=left, 3=right)
          buttonStates[0] = currentDevice.axes[1] < 0 ? 1 : 0;
          buttonStates[1] = currentDevice.axes[1] > 0 ? 1 : 0;
          buttonStates[2] = currentDevice.axes[0] < 0 ? 1 : 0;
          buttonStates[3] = currentDevice.axes[0] > 0 ? 1 : 0;

          // Combine standard buttons with virtual d-pad buttons
          buttonStates = currentDevice.buttons.concat(buttonStates);

          // Check for button press/release events
          for (var counter2 = 0; counter2 < buttonStates.length; counter2++) {
            if (previousState.buttons[counter2] === 0 && buttonStates[counter2] === 1) {
              symphony.dispatchSignal("controllerButtonDown", symphony.controlPadMap[counter2], counter1);
            }
            if (previousState.buttons[counter2] === 1 && buttonStates[counter2] === 0) {
              symphony.dispatchSignal("controllerButtonUp", symphony.controlPadMap[counter2], counter1);
            }
          }

          // Update the stored state for the current gamepad
          symphony.controllerStatus[counter1] = {
            buttons: buttonStates,
            axes: currentDevice.axes
          };
        }

      }

      // Alternative for continuous updates: globalScope.requestNextFrame(symphony.updateLoop);
    },

    // Calculates the mouse/pointer coordinates relative to a given element
    getPointerCoordinates: function(inputEvent, domElement) {
      var cumulativeOffsetX = 0,
        cumulativeOffsetY = 0,
        finalX = 0,
        finalY = 0,
        activeElement = domElement || inputEvent.target || inputEvent.srcElement,
        pointerX = 0,
        pointerY = 0;

      // Traverse up the DOM tree to accumulate offsets from parent elements
      do {
        cumulativeOffsetX += activeElement.offsetLeft;
        cumulativeOffsetY += activeElement.offsetTop;
      }
      while ((activeElement = activeElement.offsetParent));

      // Adjust event object for touch input (use the first touch point)
      if (inputEvent.changedTouches && inputEvent.changedTouches[0] !== voidValue) {
        inputEvent = inputEvent.changedTouches[0];
      }

      // Use pageX/pageY for modern browsers
      if (inputEvent.pageX || inputEvent.pageY) {
        pointerX = inputEvent.pageX;
        pointerY = inputEvent.pageY;
      }
      // Fallback for older IE versions (clientX/clientY)
      else if (inputEvent.clientX || inputEvent.clientY) {
        pointerX = inputEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        pointerY = inputEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      // Calculate final coordinates relative to the target element
      finalX = pointerX - cumulativeOffsetX;
      finalY = pointerY - cumulativeOffsetY;

      return {
        x: finalX,
        y: finalY
      };
    },

    // Registers a callback for continuous frame updates
    onFrameUpdate: function(domElement, actionFn, scopeData) {

      var lastUpdateTime = Date.now();

      function frameStepper() {
        var timeDelta = Date.now() - lastUpdateTime;
        lastUpdateTime = Date.now();
        globalScope.requestNextFrame(frameStepper);
        actionFn.call(scopeData, timeDelta, lastUpdateTime);
      };

      globalScope.requestNextFrame(frameStepper);
    },

    // Registers a callback for rendering updates (aliased to onFrameUpdate)
    onDisplayRefresh: function(domElement, actionFn, scopeData) {

      var lastUpdateTime = Date.now();

      function frameStepper() {
        var timeDelta = Date.now() - lastUpdateTime;
        lastUpdateTime = Date.now();
        globalScope.requestNextFrame(frameStepper);
        actionFn.call(scopeData, timeDelta, lastUpdateTime);
      };

      globalScope.requestNextFrame(frameStepper);
    },

    // Registers a callback for mouse movement events
    onPointerMove: function(domElement, actionFn, scopeData) {
      domElement.addEventListener("mousemove", function(inputEvent) {

        // Only proceed if mouse input is active
        if (!symphony.isMouseActive) {
          return;
        }

        var currentCoords = symphony.getPointerCoordinates(inputEvent, domElement);
        actionFn.call(scopeData, currentCoords.x * scopeData.inverseScale | 0, currentCoords.y * scopeData.inverseScale | 0);
      });

      return this;
    },

    // Registers a callback for mouse button down events
    onPointerDown: function(domElement, actionFn, scopeData) {

      domElement.addEventListener("mousedown", function(inputEvent) {

        // Only proceed if mouse input is active
        if (!symphony.isMouseActive) {
          return;
        }

        var currentCoords = symphony.getPointerCoordinates(inputEvent, domElement);
        // Store the starting position of the mouse press
        scopeData.initialPointerPosition = {
          x: currentCoords.x * scopeData.inverseScale | 0,
          y: currentCoords.y * scopeData.inverseScale | 0
        };
        actionFn.call(scopeData, currentCoords.x * scopeData.inverseScale | 0, currentCoords.y * scopeData.inverseScale | 0, inputEvent.button);
      });

      return this;
    },

    // Registers a callback for mouse button up events
    onPointerUp: function(domElement, actionFn, scopeData) {

      domElement.addEventListener("mouseup", function(inputEvent) {

        // Only proceed if mouse input is active
        if (!symphony.isMouseActive) {
          return;
        }

        var currentCoords = symphony.getPointerCoordinates(inputEvent, domElement);
        actionFn.call(scopeData, currentCoords.x * scopeData.inverseScale | 0, currentCoords.y * scopeData.inverseScale | 0, inputEvent.button);
      });

      return this;
    },

    // Registers a callback for mouse wheel scroll events
    onScrollWheel: function(domElement, actionFn, scopeData) {

      var scrollEventNames = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];

      for (var counter1 = scrollEventNames.length; counter1;) {

        domElement.addEventListener(scrollEventNames[--counter1], function(inputEvent) {

          // Only proceed if mouse input is active
          if (!symphony.isMouseActive) {
            return;
          }

          var originalEvent = inputEvent || globalScope.event,
            argumentArray = [].slice.call(arguments, 1),
            scrollDelta = 0,
            scrollDeltaX = 0,
            scrollDeltaY = 0,
            absScrollDelta = 0,
            absScrollDeltaXY = 0,
            tempFunc; // Declared but unused, matches original structure

          inputEvent.type = "mousewheel"; // Normalize event type

          // Handle old-school scrollwheel delta
          if (originalEvent.wheelDelta) {
            scrollDelta = originalEvent.wheelDelta;
          }

          // Handle Firefox 'detail' property
          if (originalEvent.detail) {
            scrollDelta = originalEvent.detail * -1;
          }

          // Handle modern 'wheel' event delta (deltaY)
          if (originalEvent.deltaY) {
            scrollDeltaY = originalEvent.deltaY * -1;
            scrollDelta = scrollDeltaY;
          }

          // Webkit specific deltaY
          if (originalEvent.wheelDeltaY !== voidValue) {
            scrollDeltaY = originalEvent.wheelDeltaY;
          }

          var finalScrollValue = scrollDelta ? scrollDelta : scrollDeltaY;

          // Invoke the callback with the normalized scroll direction
          actionFn.call(scopeData, finalScrollValue / Math.abs(finalScrollValue));

          inputEvent.preventDefault(); // Prevent default browser scrolling

        }, false);
      }
    },

    // Registers a callback for touch movement events
    onTouchDrag: function(domElement, actionFn, scopeData) {
      domElement.addEventListener("touchmove", function(touchInput) {
        // Prevent multi-finger gestures if configured
        if (scopeData.blockMultiFinger && touchInput.touches.length > 1) {
          return;
        }
        touchInput.preventDefault(); // Prevent default scrolling/zooming
        var currentCoords = symphony.getPointerCoordinates(touchInput, domElement);


        actionFn.call(scopeData, currentCoords.x * scopeData.inverseScale | 0, currentCoords.y * scopeData.inverseScale | 0, touchInput.touches);
      });
    },

    // Registers a callback for touch start events
    onTouchBegin: function(domElement, actionFn, scopeData) {

      domElement.addEventListener("touchstart", function(touchInput) {

        // Prevent multi-finger gestures on start if configured (for first touch)
        if (scopeData.blockMultiFinger && touchInput.touches.length > 0) {
          return;
        }

        var currentCoords = symphony.getPointerCoordinates(touchInput, domElement);

        // Store the initial touch position
        scopeData.initialPointerPosition = {
          x: currentCoords.x * scopeData.inverseScale | 0,
          y: currentCoords.y * scopeData.inverseScale | 0
        };

        actionFn.call(scopeData, currentCoords.x * scopeData.inverseScale | 0, currentCoords.y * scopeData.inverseScale | 0, touchInput.touches);
      });
    },

    // Registers a callback for touch end events
    onTouchEnd: function(domElement, actionFn, scopeData) {
      domElement.addEventListener("touchend", function(touchInput) {
        // Prevent multi-finger gestures on end if configured
        if (scopeData.blockMultiFinger && touchInput.touches.length > 0) {
          return;
        }
        var currentCoords = symphony.getPointerCoordinates(touchInput, domElement);

        actionFn.call(scopeData, currentCoords.x * scopeData.inverseScale | 0, currentCoords.y * scopeData.inverseScale | 0, touchInput.touches);
      });
    },

    // Registers a callback for click events (with a small movement tolerance)
    onTapClick: function(domElement, actionFn, scopeData) {
      this.onPointerUp(domElement, function(coordX, coordY) {
        // Only trigger click if the pointer hasn't moved significantly since pointer down
        if (symphony.calcDistance(coordX, coordY, scopeData.initialPointerPosition.x, scopeData.initialPointerPosition.y) < 5) {
          actionFn.call(scopeData, coordX, coordY);
        }
      }, scopeData);
    },

    // Registers a callback for keyboard key down events
    onKeyPressDown: function(domElement, actionFn, scopeData) {

      document.addEventListener("keydown", function(inputEvent) {
        var pressedKeyName;
        // Check if key is alphanumeric based on its 'which' property
        if (inputEvent.which >= 48 && inputEvent.which <= 90) {
          pressedKeyName = String.fromCharCode(inputEvent.which).toLowerCase();
        }
        // Otherwise, use the predefined keycode map
        else {
          pressedKeyName = symphony.keyboardCodes[inputEvent.which];
        }
        actionFn.call(scopeData, pressedKeyName);
      });
      return this;
    },

    // Registers a callback for keyboard key up events
    onKeyPressUp: function(domElement, actionFn, scopeData) {

      document.addEventListener("keyup", function(inputEvent) {
        var pressedKeyName;
        // Check if key is alphanumeric based on its 'which' property
        if (inputEvent.which >= 48 && inputEvent.which <= 90) {
          pressedKeyName = String.fromCharCode(inputEvent.which).toLowerCase();
        } else {
          pressedKeyName = symphony.keyboardCodes[inputEvent.which];
        }
        actionFn.call(scopeData, pressedKeyName);
      });
      return this;
    },

    // Registers a callback for gamepad button down events
    onControllerButtonDown: function(domElement, actionFn, scopeData) {

      symphony.registerListener("controllerButtonDown", function(buttonKey, controllerIndex) {
        actionFn.call(scopeData, buttonKey, controllerIndex);
      });

      return this;
    },

    // Registers a callback for gamepad button up events
    onControllerButtonUp: function(domElement, actionFn, scopeData) {

      symphony.registerListener("controllerButtonUp", function(buttonKey, controllerIndex) {
        actionFn.call(scopeData, buttonKey, controllerIndex);
      });

      return this;
    },

    // Registers a callback for gamepad axis movement events
    onControllerAxisMove: function(domElement, actionFn, scopeData) {

      symphony.registerListener("controllerMove", function(axisX, axisY, controllerIndex) {
        actionFn.call(scopeData, axisX, axisY, controllerIndex);
      });

      return this;
    },


    // Registers a callback for window resize events
    onWindowResize: function(domElement, actionFn, scopeData) {
      globalScope.addEventListener("resize", function() {
        actionFn.call(scopeData, globalScope.innerWidth, globalScope.innerHeight);
      });

      // Optionally, trigger the callback immediately on registration:
      // actionFn.call(scopeData, globalScope.innerWidth, globalScope.innerHeight);

      return this;
    },

    // Registers a callback for dropping image files onto the document
    onImageDrop: function(domElement, actionFn, scopeData) {

      document.addEventListener('drop', function(inputEvent) {
        inputEvent.stopPropagation(); // Stop event propagation
        inputEvent.preventDefault(); // Prevent default browser behavior

        var droppedFile = inputEvent.dataTransfer.files[0];

        // Ensure the dropped item is an image by checking its MIME type
        if (!(/image/i).test(droppedFile.type)) {
          return false;
        }
        var fileReaderInstance = new FileReader();

        // Callback when the file has been loaded
        fileReaderInstance.onload = function(fileLoadEvent) {
          var loadedImage = new Image();

          // Callback when the image has finished loading
          loadedImage.onload = function() {
            actionFn.call(scopeData, this); // 'this' refers to the loadedImage object
          };

          loadedImage.src = fileLoadEvent.target.result; // Set image source from file data URL
        };

        fileReaderInstance.readAsDataURL(droppedFile); // Read the file content as a data URL

      });

      // Prevent default dragover behavior to allow drops
      document.addEventListener("dragover", function(inputEvent) {
        inputEvent.preventDefault();
      });

      return this;
    },

    // Adjusts the target element's dimensions to fit the window while maintaining aspect ratio
    fitDisplayToWindow: function(domElement, scopeData) {
      var currentDisplayScale = globalScope.innerWidth / scopeData.designWidth;

      // If scaling by width makes the height too large, scale by height instead
      if (scopeData.designHeight * currentDisplayScale > globalScope.innerHeight) {
        currentDisplayScale = globalScope.innerHeight / scopeData.designHeight;
      }
      // No explicit return statement is needed as the original function also implicitly returns `undefined`.
    }
  });

})(window, undefined);