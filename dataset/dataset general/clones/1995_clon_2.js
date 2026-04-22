/*
  Range Input Manager by interface-weaver v1.0 (https://www.interface-weaver.com/)

  Distributed under a Creative Commons Attribution-ShareAlike 4.0 International License (https://creativecommons.org/licenses/by-sa/4.0/)

  Permissions granted:

  *  To replicate, share, display, and perform the creative work
  *  To adapt the material
  *  To utilize the work for commercial purposes

  Conditions apply:

    Attribution:
    ------------
    Credit must be given to the original creator as specified.

    ShareAlike:
    -----------
    If you modify, transform, or build upon this work, you must release your contributions under the same license as the original.

  *  For any redistribution, the license terms of this work must be clearly communicated.
  *  These conditions can be waived with explicit permission from the copyright holder.

  Adjustments (c) 2023 CodeForge (marked as CF).
  Released under identical licensing terms.
*/

var slideWrangler = (
  function() {
    var trackers = {},
      nextId = 0,
      scrollActive = true;

    // Disables the mouse wheel interaction for all sliders.
    var disableScroll = function() {
      scrollActive = false;
    };

    // Attaches an event handler to an element.
    var attachHandler = function(
      elementRef,
      triggerType,
      callbackFunc
    ) {
      if (elementRef.attachEvent) {
        elementRef["e" + triggerType + callbackFunc] = callbackFunc;
        elementRef[triggerType + callbackFunc] = function() {
          elementRef["e" + triggerType + callbackFunc](window.event);
        };
        elementRef.attachEvent("on" + triggerType, elementRef[triggerType + callbackFunc]);
      } else {
        elementRef.addEventListener(triggerType, callbackFunc, true);
      }
    };

    // Removes an event handler from an element.
    var detachHandler = function(
      elementRef,
      triggerType,
      callbackFunc
    ) {
      if (elementRef.detachEvent) {
        try {
          elementRef.detachEvent("on" + triggerType, elementRef[triggerType + callbackFunc]);
          elementRef[triggerType + callbackFunc] = null;
        } catch (errorObject) {}; // Ignore potential errors during detachment.
      } else {
        elementRef.removeEventListener(triggerType, callbackFunc, true);
      }
    };

    // Prevents default event behavior and stops propagation.
    var haltPropagation = function(eventObject) {
      if (eventObject == null) eventObject = document.parentWindow.event;
      if (eventObject.stopPropagation) {
        eventObject.stopPropagation();
        eventObject.preventDefault();
      };

      /*@cc_on@*/
      /*@if(@_win32)
      eventObject.cancelBubble = true;
      eventObject.returnValue = false;
      /*@end@*/

      return false;
    };

    // Combines multiple NodeLists into a single array.
    var combineElements = function() {
      if (!arguments.length) {
        return [];
      };
      var combinedList = [];
      for (var i = 0; i < arguments.length; i++) {
        for (var j = 0, listItem; listItem = arguments[i][j]; j++) {
          combinedList[combinedList.length] = listItem;
        };
      };
      return combinedList;
    };

    // Function by Artem B. with a slight modification by interface-weaver.
    var interpretCallbacks = function(callbackStrings) {
      if (callbackStrings == null) {
        return {};
      };
      var callbackFunction,
        eventType,
        callbackRegistry = {},
        pathSegments,
        targetObject;
      for (var i = 0, functionName; functionName = callbackStrings[i]; i++) {
        eventType = functionName.match(/(fd_slider_cb_(update|create|destroy|redraw|move|focus|blur)_)([^\s|$]+)/i)[1];
        functionName = functionName.replace(new RegExp("^" + eventType), "").replace(/-/g, ".");
        eventType = eventType.replace(/^fd_slider_cb_/i, "").replace(/_$/, "");

        try {
          if (functionName.indexOf(".") != -1) {
            pathSegments = functionName.split('.');
            targetObject = window;
            for (var x = 0, pathSegment; pathSegment = targetObject[pathSegments[x]]; x++) {
              if (pathSegment instanceof Function) {
                (function() {
                  var invokedMethod = pathSegment;
                  callbackFunction = function(data) {
                    invokedMethod.apply(targetObject, [data])
                  };
                })();
              } else {
                targetObject = pathSegment;
              };
            };
          } else {
            callbackFunction = window[functionName];
          };

          if (!(callbackFunction instanceof Function)) continue;
          if (!(eventType in callbackRegistry)) {
            callbackRegistry[eventType] = [];
          };
          callbackRegistry[eventType][callbackRegistry[eventType].length] = callbackFunction;
        } catch (errorObject) {}; // Suppress errors if callback parsing fails.
      };
      return callbackRegistry;
    };

    // Parses class names relevant to the slider.
    var interpretStyles = function(classStrings) {
      if (classStrings == null) {
        return "";
      };
      var classNamesList = [];
      for (var i = 0, styleName; styleName = classStrings[i]; i++) {
        classNamesList[classNamesList.length] = styleName.replace(/^fd_slider_cn_/, "");
      };
      return classNamesList.join(" ");
    };

    // Instantiates a new slider.
    var buildSlide = function(configOptions) {
      if (!configOptions.inputElement || !configOptions.inputElement.id) {
        return false;
      };
      deconstructOne(configOptions.inputElement.id);
      trackers[configOptions.inputElement.id] = new RangeAdjuster(configOptions);
      return true;
    };

    // Initializes all eligible input elements as sliders.
    var initializeAll = function(targetElement) {
      var rangePattern = /fd_range_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/i,
        incrementPattern = /fd_inc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
        maxIncrementPattern = /fd_maxinc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
        keyboardIncrementPattern = /fd_kbinc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
        keyboardJumpPattern = /fd_kbhop_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
        callbackPattern = /((fd_slider_cb_(update|create|destroy|redraw|move|focus|blur)_)([^\s|$]+))/ig,
        classNamePattern = /(fd_slider_cn_([a-zA-Z0-9_\-]+))/ig,
        inputElements = targetElement && targetElement.tagName && targetElement.tagName.search(/input|select/i) != -1 ? [targetElement] : combineElements(document.getElementsByTagName('input'), document.getElementsByTagName('select')),
        valueRange,
        tempVar,
        configOptions;

      for (var i = 0, inputElem; inputElem = inputElements[i]; i++) {
        if ((inputElem.tagName.toLowerCase() == "input" && inputElem.type == "text" && (inputElem.className.search(rangePattern) != -1 || inputElem.className.search(/fd_slider/) != -1)) || (inputElem.tagName.toLowerCase() == "select" && inputElem.className.search(/fd_slider/) != -1)) {
          // If no specific element was passed and the slider already exists, skip it.
          if (!targetElement && inputElem.id && document.getElementById("fd-slider-" + inputElem.id)) {
            continue;
          };

          // Generate an ID if none exists.
          if (!inputElem.id) {
            inputElem.id = "sldr" + nextId++;
          };

          configOptions = {
            inputElement: inputElem,
            stepIncrement: inputElem.className.search(incrementPattern) != -1 ? inputElem.className.match(incrementPattern)[0].replace("fd_inc_", "").replace("d", ".") : "1",
            maxStepIncrease: inputElem.className.search(maxIncrementPattern) != -1 ? inputElem.className.match(maxIncrementPattern)[0].replace("fd_maxinc_", "").replace("d", ".") : false,
            keyboardStep: inputElem.className.search(keyboardIncrementPattern) != -1 ? inputElem.className.match(keyboardIncrementPattern)[0].replace("fd_kbinc_", "").replace("d", ".") : "1",
            keyboardJump: inputElem.className.search(keyboardJumpPattern) != -1 ? inputElem.className.match(keyboardJumpPattern)[0].replace("fd_kbhop_", "").replace("d", ".") : false,
            valueRange: [0, 100],
            eventCallbacks: interpretCallbacks(inputElem.className.match(callbackPattern)),
            styleClasses: interpretStyles(inputElem.className.match(classNamePattern)),
            smoothMotion: inputElem.className.search(/fd_tween/i) != -1,
            isVertical: inputElem.className.search(/fd_vertical/i) != -1,
            concealInput: inputElem.className.search(/fd_hide_input/i) != -1,
            snapOnClick: inputElem.className.search(/fd_jump/i) != -1,
            ariaComplete: inputElem.className.search(/fd_full_aria/i) != -1,
            noScrollWheel: inputElem.className.search(/fd_disable_mousewheel/i) != -1
          };

          if (inputElem.tagName.toLowerCase() == "select") {
            configOptions.valueRange = [0, inputElem.options.length - 1];
          } else if (inputElem.className.search(rangePattern) != -1) {
            valueRange = inputElem.className.match(rangePattern)[0].replace("fd_range_", "").replace(/d/g, ".").split("_");
            configOptions.valueRange = [valueRange[0], valueRange[1]];
          };

          buildSlide(configOptions);
        };
      };
      // CF: Trigger a custom event when all sliders are loaded
      $(document).trigger('slidersLoaded');
      return true;
    };

    // Destroys a specific slider by ID.
    var deconstructOne = function(sliderId) {
      if (sliderId in trackers) {
        trackers[sliderId].eliminate();
        delete trackers[sliderId];
        return true;
      };
      return false;
    };

    // Destroys all active sliders.
    var deconstructAll = function(eventObject) {
      for (currentSlider in trackers) {
        trackers[currentSlider].eliminate();
      };
    };

    // Cleans up resources when the page unloads.
    var tearDown = function(eventObject) {
      deconstructAll();
      trackers = null;
      detachHandler(window, "unload", tearDown);
      detachHandler(window, "resize", reposition);
      clearOnloadHook();
    };

    // Recalculates slider positions on window resize.
    var reposition = function(eventObject) {
      for (currentSlider in trackers) {
        trackers[currentSlider].onResize();
      };
    };

    // CF: forces a recalculation and update of the slider's visual state.
    var recalibrate = function(eventObject) {
      for (currentSlider in trackers) {
        trackers[currentSlider].reset();
      };
    };

    // Removes the initial load event handler.
    var clearOnloadHook = function() {
      detachHandler(window, "load", initializeAll);
      /*@cc_on@*/
      /*@if(@_win32)
      detachHandler(window, "load",   function() { setTimeout(onload, 200) });
      /*@end@*/
    };

    function RangeAdjuster(configOptions) {
      var inputElement = configOptions.inputElement,
        elementTag = inputElement.tagName.toLowerCase(),
        lowerBound = +configOptions.valueRange[0],
        upperBound = +configOptions.valueRange[1],
        valueSpan = Math.abs(upperBound - lowerBound),
        stepIncrement = elementTag == "select" ? 1 : +configOptions.stepIncrement || 1,
        maxStepIncrease = configOptions.maxStepIncrease ? configOptions.maxStepIncrease : stepIncrement * 2,
        keyboardStep = configOptions.keyboardStep ? +configOptions.keyboardStep : 1,
        keyboardJump = configOptions.keyboardJump ? +configOptions.keyboardJump : keyboardStep * 2,
        decimalPlaces = configOptions.stepIncrement.search(".") != -1 ? configOptions.stepIncrement.substr(configOptions.stepIncrement.indexOf(".") + 1, configOptions.stepIncrement.length - 1).length : 0,
        numSteps = Math.ceil(valueSpan / stepIncrement),
        smoothMotion = !!configOptions.smoothMotion,
        ariaComplete = !!configOptions.ariaComplete,
        concealInput = !!configOptions.concealInput,
        snapOnClick = smoothMotion ? false : !!configOptions.snapOnClick,
        isVertical = !!configOptions.isVertical,
        eventCallbacks = configOptions.eventCallbacks,
        styleClasses = configOptions.styleClasses,
        noScrollWheel = !!configOptions.noScrollWheel,
        animationTimer = null,
        keyboardActive = true,
        adjusterHeight = 0,
        adjusterWidth = 0,
        tweenPositionX = 0,
        tweenStartValue = 0,
        tweenChangeValue = 0,
        tweenDuration = 0,
        animationFrame = 0,
        coordX = 0,
        coordY = 0,
        maxPixels = 0,
        handlePosition = 0,
        destinationPosition = 0,
        pointerPosition = 0,
        pixelDelta = 0,
        pixelStep = 0,
        instanceRef = this,
        changeRecords = {},
        initialValue = null,
        mainContainer,
        innerContainer,
        grabberElement,
        trackBar;

      if (upperBound < lowerBound) {
        stepIncrement = -stepIncrement;
        maxStepIncrease = -maxStepIncrease;
      };

      // Removes all event listeners and clears references for garbage collection.
      function eradicateSlider() {
        try {
          detachHandler(mainContainer, "mouseover", handleMouseOver);
          detachHandler(mainContainer, "mouseout", handleMouseOut);
          detachHandler(mainContainer, "mousedown", handleMouseDown);
          detachHandler(grabberElement, "focus", handleFocus);
          detachHandler(grabberElement, "blur", handleBlur);
          if (!window.opera) {
            detachHandler(grabberElement, "keydown", handleKeyDown);
            detachHandler(grabberElement, "keypress", handleKeyPress);
          } else {
            detachHandler(grabberElement, "keypress", handleKeyDown);
          };
          detachHandler(grabberElement, "mousedown", handleGrabberMouseDown);
          detachHandler(grabberElement, "mouseup", handleGrabberMouseUp);

          if (scrollActive && !noScrollWheel) {
            if (window.addEventListener && !window.devicePixelRatio) window.removeEventListener('DOMMouseScroll', monitorScrollWheel, false);
            else {
              detachHandler(document, "mousewheel", monitorScrollWheel);
              detachHandler(window, "mousewheel", monitorScrollWheel);
            };
          };
        } catch (errorObject) {}; // Silently handle errors during cleanup.
        innerContainer = trackBar = grabberElement = mainContainer = animationTimer = null;
        invokeCallback("destroy");
        eventCallbacks = null;
      };

      // Recalculates slider dimensions and position.
      function recalculateLayout() {
        locate();
        // Internet Explorer needs a try-catch block here.
        try {
          var containerWidth = mainContainer.offsetWidth,
            containerHeight = mainContainer.offsetHeight,
            grabberWidth = grabberElement.offsetWidth,
            grabberHeight = grabberElement.offsetHeight,
            barHeight = trackBar.offsetHeight,
            barWidth = trackBar.offsetWidth;

          maxPixels = isVertical ? containerHeight - grabberHeight : containerWidth - grabberWidth;
          pixelStep = maxPixels / numSteps;
          pixelDelta = maxPixels / Math.ceil(valueSpan / maxStepIncrease);

          adjusterWidth = containerWidth;
          adjusterHeight = containerHeight;

          convertValueToPixels();
        } catch (errorObject) {};
        invokeCallback("redraw");
      };

      // Invokes registered callbacks for a given event type.
      function invokeCallback(eventType) {

        var callbackData = {
          "elem": inputElement,
          "value": elementTag == "select" ? inputElement.options[inputElement.selectedIndex].value : inputElement.value
        };
        if (eventType in eventCallbacks) {
          for (var i = 0, callbackFunction; callbackFunction = eventCallbacks[eventType][i]; i++) {
            callbackFunction(callbackData);
          };
        };
      };

      // Handles focus event on the slider.
      function handleFocus(eventObject) {
        mainContainer.className = mainContainer.className.replace('focused', '') + ' focused';
        if (scrollActive && !noScrollWheel) {
          attachHandler(window, 'DOMMouseScroll', monitorScrollWheel);
          attachHandler(document, 'mousewheel', monitorScrollWheel);
          if (!window.opera) attachHandler(window, 'mousewheel', monitorScrollWheel);
        };
        invokeCallback("focus");
      };

      // Handles blur event on the slider.
      function handleBlur(eventObject) {
        mainContainer.className = mainContainer.className.replace(/focused|fd-fc-slider-hover|fd-slider-hover/g, '');
        if (scrollActive && !noScrollWheel) {
          detachHandler(document, 'mousewheel', monitorScrollWheel);
          detachHandler(window, 'DOMMouseScroll', monitorScrollWheel);
          if (!window.opera) detachHandler(window, 'mousewheel', monitorScrollWheel);
        };
        invokeCallback("blur");
      };

      // Tracks mouse wheel movement to adjust slider value.
      function monitorScrollWheel(eventObject) {
        if (!keyboardActive) return;
        eventObject = eventObject || window.event;
        var scrollDelta = 0;

        if (eventObject.wheelDelta) {
          scrollDelta = eventObject.wheelDelta / 120;
          if (window.opera && window.opera.version() < 9.2) scrollDelta = -scrollDelta;
        } else if (eventObject.detail) {
          scrollDelta = -eventObject.detail / 3;
        };

        if (isVertical) {
          scrollDelta = -scrollDelta;
        };

        if (scrollDelta) {
          var tempPos = isVertical ? grabberElement.offsetTop : grabberElement.offsetLeft;
          tempPos = (scrollDelta < 0) ? Math.ceil(tempPos + pixelDelta) : Math.floor(tempPos - pixelDelta);
          convertPixelsToValue(Math.min(Math.max(tempPos, 0), maxPixels));
        }
        return haltPropagation(eventObject);
      };

      // Prevents default key press actions for slider control.
      function handleKeyPress(eventObject) {
        eventObject = eventObject || document.parentWindow.event;
        if ((eventObject.keyCode >= 33 && eventObject.keyCode <= 40) || !keyboardActive || eventObject.keyCode == 45 || eventObject.keyCode == 46) {
          return haltPropagation(eventObject);
        };
        return true;
      };

      // Handles keyboard input for slider adjustment.
      function handleKeyDown(eventObject) {
        if (!keyboardActive) return true;

        eventObject = eventObject || document.parentWindow.event;
        var keyCodeVal = eventObject.keyCode != null ? eventObject.keyCode : eventObject.charCode;

        if (keyCodeVal < 33 || (keyCodeVal > 40 && (keyCodeVal != 45 && keyCodeVal != 46))) return true;

        var currentValue = elementTag == "input" ? parseFloat(inputElement.value) : inputElement.selectedIndex;
        if (isNaN(currentValue) || currentValue < Math.min(lowerBound, upperBound)) currentValue = Math.min(lowerBound, upperBound);

        if (keyCodeVal == 37 || keyCodeVal == 40 || keyCodeVal == 46 || keyCodeVal == 34) {
          // left, down, ins, page down
          currentValue -= (eventObject.ctrlKey || keyCodeVal == 34 ? keyboardJump : keyboardStep)
        } else if (keyCodeVal == 39 || keyCodeVal == 38 || keyCodeVal == 45 || keyCodeVal == 33) {
          // right, up, del, page up
          currentValue += (eventObject.ctrlKey || keyCodeVal == 33 ? keyboardJump : keyboardStep)
        } else if (keyCodeVal == 35) {
          // max
          currentValue = upperBound;
        } else if (keyCodeVal == 36) {
          // min
          currentValue = lowerBound;
        };

        convertValueToPixels(currentValue);
        invokeCallback("update");

        // Opera doesn't allow cancelling key events, so arrow keys and Home/End may scroll.
        return haltPropagation(eventObject);
      };

      // Applies hover styles on mouse over.
      function handleMouseOver(eventObject) {
        /*@cc_on@*/
        /*@if(@_jscript_version <= 5.6)
        if(this.className.search(/focused/) != -1) {
                this.className = this.className.replace("fd-fc-slider-hover", "") +' fd-fc-slider-hover';
                return;
        }
        /*@end@*/
        this.className = this.className.replace(/fd\-slider\-hover/g, "") + ' fd-slider-hover';
      };

      // Removes hover styles on mouse out.
      function handleMouseOut(eventObject) {
        /*@cc_on@*/
        /*@if(@_jscript_version <= 5.6)
        if(this.className.search(/focused/) != -1) {
                this.className = this.className.replace("fd-fc-slider-hover", "");
                return;
        }
        /*@end@*/
        this.className = this.className.replace(/fd\-slider\-hover/g, "");
      };

      // Handles mouse button release on the grabber.
      function handleGrabberMouseUp(eventObject) {
        eventObject = eventObject || window.event;
        detachHandler(document, 'mousemove', monitorPointer);
        detachHandler(document, 'mouseup', handleGrabberMouseUp);

        keyboardActive = true;

        // Opera may fire blur on mouseup; attempt to restore focus.
        if (window.opera) try {
          setTimeout(function() {
            onfocus();
          }, 0);
        } catch (errorObject) {};
        document.body.className = document.body.className.replace(/slider-drag-vertical|slider-drag-horizontal/g, "");

        return haltPropagation(eventObject);
      };

      // Handles mouse button down on the grabber.
      function handleGrabberMouseDown(eventObject) {
        eventObject = eventObject || window.event;
        pointerPosition = isVertical ? eventObject.clientY : eventObject.clientX;
        handlePosition = parseInt(isVertical ? grabberElement.offsetTop : grabberElement.offsetLeft) || 0;
        keyboardActive = false;

        clearTimeout(animationTimer);
        animationTimer = null;

        attachHandler(document, 'mousemove', monitorPointer);
        attachHandler(document, 'mouseup', handleGrabberMouseUp);

        // Force focus on the grabber for mouse events in some browsers.
        if (window.devicePixelRatio || (document.all && !window.opera)) try {
          setTimeout(function() {
            grabberElement.focus();
          }, 0);
        } catch (errorObject) {};

        document.body.className += " slider-drag-" + (isVertical ? "vertical" : "horizontal");
      };

      // Handles mouse button release on the main slider area.
      function handleMouseUp(eventObject) {
        eventObject = eventObject || window.event;
        detachHandler(document, 'mouseup', handleMouseUp);
        if (!smoothMotion) {
          clearTimeout(animationTimer);
          animationTimer = null;
          keyboardActive = true;
        };
        return haltPropagation(eventObject);
      };

      // Tracks mouse movement to update slider position.
      function monitorPointer(eventObject) {
        eventObject = eventObject || window.event;
        convertPixelsToValue(alignToClosestValue(handlePosition + (isVertical ? eventObject.clientY - pointerPosition : eventObject.clientX - pointerPosition)));
      };

      // Handles mouse button down on the main slider area.
      function handleMouseDown(eventObject) {
        eventObject = eventObject || window.event;
        var targetElement;
        if (eventObject.target) targetElement = eventObject.target;
        else if (eventObject.srcElement) targetElement = eventObject.srcElement;
        if (targetElement.nodeType == 3) targetElement = targetElement.parentNode;

        if (targetElement.className.search("fd-slider-handle") != -1) {
          return true;
        };

        try {
          setTimeout(function() {
            grabberElement.focus();
          }, 0);
        } catch (errorObject) {};

        clearTimeout(animationTimer);
        locate();

        animationTimer = null;
        keyboardActive = false;

        var positionX = 0,
          scrollLeftOffset = 0,
          scrollTopOffset = 0;

        // IE document type quirks.
        if (document.documentElement && document.documentElement.scrollTop) {
          scrollTopOffset = document.documentElement.scrollTop;
          scrollLeftOffset = document.documentElement.scrollLeft;