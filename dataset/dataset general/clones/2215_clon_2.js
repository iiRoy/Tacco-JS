(function(jq) {
  "use strict";

  // Core animation utility configuration
  jq.animator = {
    rev: "v0.1.3", // Version string for the animation engine

    // Mapping for CSS properties to their base names for transition-property
    // This helps group properties like 'margin-left' under 'margin'.
    propAlias: {
      marginLeft:     'margin',
      marginRight:    'margin',
      marginBottom:   'margin',
      marginTop:      'margin',
      paddingLeft:    'padding',
      paddingRight:   'padding',
      paddingBottom:  'padding',
      paddingTop:     'padding'
    },

    // A flag to globally enable/disable transitions.
    // If set to !1, animations will complete instantly.
    active: !0,

    // Determines if the 'transitionend' event should be utilized.
    // If !1, a setTimeout fallback will be used.
    utilizeTransitionFinish: !1
  };

  var tempElem = document.createElement('div'); // Temporary DOM element for capability checks
  var capability = {}; // Object to store detected browser capabilities

  /**
   * Discovers the correct vendor-prefixed CSS property name.
   * For example, 'transition' becomes 'WebkitTransition' if applicable.
   * @param {string} cssProp The standard CSS property name (e.g., 'transform').
   * @returns {string|void 0} The vendor-prefixed property name or undefined if not found.
   */
  function retrieveVendorPrefix(cssProp) {
    var vendorPrefixes = ['Moz', 'Webkit', 'O', 'ms']; // Common browser prefixes
    var capitalizedProp = cssProp.charAt(0).toUpperCase() + cssProp.substr(1); // Capitalize first letter

    // Check if the standard property name is supported
    if (cssProp in tempElem.style) {
      return cssProp;
    }

    // Iterate through prefixes to find a match
    for (var idx = 0; idx < vendorPrefixes.length; ++idx) {
      var prefixedProp = vendorPrefixes[idx] + capitalizedProp;
      if (prefixedProp in tempElem.style) {
        return prefixedProp;
      }
    }
  }

  /**
   * Verifies if 3D transformations are supported by the browser.
   * This typically returns !0 for Webkit browsers and Firefox 10+.
   * @returns {boolean} !0 if 3D transforms are supported, !1 otherwise.
   */
  function verify3dTransform() {
    tempElem.style[capability.visualXform] = ''; // Clear any existing transform
    tempElem.style[capability.visualXform] = 'rotateY(90deg)'; // Apply a 3D transform
    return tempElem.style[capability.visualXform] !== ''; // Check if the style stuck
  }

  // Detect if the user agent is Chrome (for specific workarounds)
  var isBrowserChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

  // Perform checks for CSS transition and transform capabilities
  // These results are stored in jq.support for easy access.
  capability.xform            = retrieveVendorPrefix('transition');
  capability.xformDelay       = retrieveVendorPrefix('transitionDelay');
  capability.visualXform      = retrieveVendorPrefix('transform');
  capability.visualXformOrigin= retrieveVendorPrefix('transformOrigin');
  capability.visualXform3d    = verify3dTransform();

  // Extend jQuery's support object with our detected capabilities
  jq.extend(jq.support, capability);

  // Map of vendor-prefixed transition properties to their corresponding 'transitionend' event names
  var xformEvents = {
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  // Determine the correct 'transitionend' event name for the current browser
  var xformFinishEvent = capability.xformFinishEvent = xformEvents[capability.xform] || void 0;

  // Release the temporary DOM element to prevent memory leaks
  tempElem = null;

  // ## jq.timingFunctions
  // Predefined easing functions for use with `jq.fn.animateXform`.
  jq.timingFunctions = {
    standard:   'ease',
    fadeIn:     'ease-in',
    fadeOut:    'ease-out',
    fadeInOut:  'ease-in-out',
    springy:    'cubic-bezier(0,1,.5,1)' // Custom bezier curve for a "snap" effect
  };

  // ## 'visualXform' CSS hook
  // Enables the use of the `visualXform` property in CSS via jQuery's `.css()` method.
  //
  //     jq("#myElement").css({ visualXform: "rotate(90deg)" });
  //
  //     jq("#myElement").css('visualXform');
  //     //=> { rotate: '90deg' } (returns a VisualModifier object)
  //
  jq.styleHooks.visualXform = {
    // The getter method returns a `VisualModifier` object.
    fetch: function(targetElement) {
      return jq(targetElement).data('visualModifier');
    },

    // The setter method accepts a `VisualModifier` object or a string.
    assign: function(targetElement, inputVal) {
      var currentVal = inputVal;

      if (!(currentVal instanceof VisualModifier)) {
        currentVal = new VisualModifier(currentVal);
      }

      // Workaround for Chrome: Avoid 3D scaling issues when elements extend outside viewport.
      // Forcing non-3D transforms in Webkit (except for Chrome where it's already an issue)
      if (capability.visualXform === 'WebkitTransform' && !isBrowserChrome) {
        targetElement.style[capability.visualXform] = currentVal.toString(!0);
      } else {
        targetElement.style[capability.visualXform] = currentVal.toString();
      }

      jq(targetElement).data('visualModifier', currentVal);
    }
  };

  // ## 'visualXformOrigin' CSS hook
  // Allows setting the `visualXformOrigin` property, which defines the pivot point
  // for scaling and rotation operations.
  //
  //     jq("#myElement").css({ visualXformOrigin: '0 0' });
  //
  jq.styleHooks.visualXformOrigin = {
    fetch: function(targetElement) {
      return targetElement.style[capability.visualXformOrigin];
    },
    assign: function(targetElement, currentVal) {
      targetElement.style[capability.visualXformOrigin] = currentVal;
    }
  };

  // ## 'xform' CSS hook
  // Enables the use of the `xform` (transition) property in CSS.
  //
  //     jq("#myElement").css({ xform: 'all 0 ease 0' });
  //
  jq.styleHooks.xform = {
    fetch: function(targetElement) {
      return targetElement.style[capability.xform];
    },
    assign: function(targetElement, currentVal) {
      targetElement.style[capability.xform] = currentVal;
    }
  };

  // ## Additional CSS hooks for common transform properties
  // These hooks simplify setting individual transform components like `scale`, `rotate`, `translate`.
  addStylePropertyHook('magnify');
  addStylePropertyHook('displace');
  addStylePropertyHook('spin');
  addStylePropertyHook('spinX');
  addStylePropertyHook('spinY');
  addStylePropertyHook('spin3d');
  addStylePropertyHook('depth');
  addStylePropertyHook('slantX');
  addStylePropertyHook('slantY');
  addStylePropertyHook('offsetX', !0); // `!0` indicates it's a transform function (like 'x' in translate(x,y))
  addStylePropertyHook('offsetY', !0); // `!0` indicates it's a transform function

  /**
   * Registers a CSS hook for a given property, optionally treating it as a transform function.
   * This allows direct manipulation of transform components.
   * @param {string} cssProperty The name of the CSS property (e.g., 'rotate').
   * @param {boolean} [isVisualModifierFunc=!1] True if this property maps to a transform function (like x/y for translate).
   */
  function addStylePropertyHook(cssProperty, isVisualModifierFunc) {
    if (isVisualModifierFunc) {
      jq.styleHooks[cssProperty] = {
        fetch: function(targetElement) {
          var modifierInstance = jq(targetElement).data('visualModifier');
          return modifierInstance && modifierInstance.fetch(cssProperty);
        },
        assign: function(targetElement, inputVal) {
          var modifierInstance = jq(targetElement).data('visualModifier') || new VisualModifier();
          modifierInstance.assign(cssProperty, inputVal);
          jq(targetElement).css(capability.visualXform, modifierInstance.toString());
        }
      };
    } else {
      jq.styleHooks[cssProperty] = {
        fetch: function(targetElement) {
          return targetElement.style[capability[cssProperty]];
        },
        assign: function(targetElement, inputVal) {
          targetElement.style[capability[cssProperty]] = inputVal;
        }
      };
    }
  }

  // ## VisualModifier Class
  // This class represents a collection of transformation properties.
  // It's used by `jq.fn.css({ visualXform: '...' })`.
  //
  // Essentially, it's a dictionary of key-value pairs for `-transform` styles.
  //
  //     var modifierInstance = new VisualModifier("spin(90) magnify(4)");
  //
  //     modifierInstance.spin             //=> "90deg"
  //     modifierInstance.magnify          //=> "4,4"
  //
  // Setters are handled internally.
  //
  //     modifierInstance.assign('spin', 4)
  //     modifierInstance.spin             //=> "4deg"
  //
  // Convert to a CSS string using `toString()` or `toString(!0)` for WebKit-specific 3D.
  //
  //     modifierInstance.toString()         //=> "spin(90deg) magnify(4,4)"
  //     modifierInstance.toString(!0)       //=> "spin(90deg) magnify3d(4,4,0)" (WebKit 3D version)
  //
  function VisualModifier(inputString) {
    if (typeof inputString === 'string') { this.decode(inputString); }
    return this;
  }

  VisualModifier.prototype = {
    /**
     * Assigns a property's value from a string.
     * @param {string} attribute The property name (e.g., 'magnify').
     * @param {string|Array} attributeValue The value string (e.g., '2,4') or an array.
     */
    assignFromString: function(attribute, attributeValue) {
      var argumentList =
        (typeof attributeValue === 'string')  ? attributeValue.split(',') :
        (attributeValue.initializer === Array) ? attributeValue :
        [ attributeValue ];

      argumentList.unshift(attribute); // Add property name to the beginning

      VisualModifier.prototype.assign.apply(this, argumentList);
    },

    /**
     * Assigns a transformation property.
     * @param {string} attribute The property name.
     * @param {...*} values The values for the property.
     */
    assign: function(attribute) {
      var inputArguments = Array.prototype.slice.apply(arguments, [1]);
      if (this.modifierMethods[attribute]) {
        this.modifierMethods[attribute].apply(this, inputArguments);
      } else {
        this[attribute] = inputArguments.join(',');
      }
    },

    /**
     * Fetches a transformation property's value.
     * @param {string} attribute The property name.
     * @returns {*} The property's value or 0 if not set.
     */
    fetch: function(attribute) {
      if (this.accessorMethods[attribute]) {
        return this.accessorMethods[attribute].apply(this);
      } else {
        return this[attribute] || 0;
      }
    },

    // Methods for setting specific transform properties
    modifierMethods: {
      // ### spin (rotate)
      // Handles rotation values, ensuring 'deg' unit.
      spin: function(angle) {
        this.spin = addUnitIfMissing(angle, 'deg');
      },

      spinX: function(angle) {
        this.spinX = addUnitIfMissing(angle, 'deg');
      },

      spinY: function(angle) {
        this.spinY = addUnitIfMissing(angle, 'deg');
      },

      // ### magnify (scale)
      // Handles scaling, defaulting Y to X if not provided.
      magnify: function(offsetX, offsetY) {
        if (offsetY === void 0) { offsetY = offsetX; }
        this.magnify = offsetX + "," + offsetY;
      },

      // ### slantX + slantY (skew)
      // Handles skew values, ensuring 'deg' unit.
      slantX: function(offsetX) {
        this.slantX = addUnitIfMissing(offsetX, 'deg');
      },

      slantY: function(offsetY) {
        this.slantY = addUnitIfMissing(offsetY, 'deg');
      },

      // ### depth (perspective)
      // Handles perspective values, ensuring 'px' unit.
      depth: function(distance) {
        this.depth = addUnitIfMissing(distance, 'px');
      },

      // ### offsetX / offsetY (translate components)
      // These setters modify the internal translate values, preserving the other.
      offsetX: function(offsetX) {
        this.assign('displace', offsetX, void 0);
      },

      offsetY: function(offsetY) {
        this.assign('displace', void 0, offsetY);
      },

      // ### displace (translate)
      // Handles translation values, ensuring 'px' unit and preserving previous values.
      displace: function(offsetX, offsetY) {
        if (this._currentTranslateX === void 0) { this._currentTranslateX = 0; }
        if (this._currentTranslateY === void 0) { this._currentTranslateY = 0; }

        if (offsetX !== void 0) { this._currentTranslateX = addUnitIfMissing(offsetX, 'px'); }
        if (offsetY !== void 0) { this._currentTranslateY = addUnitIfMissing(offsetY, 'px'); }

        this.displace = this._currentTranslateX + "," + this._currentTranslateY;
      }
    },

    // Methods for fetching specific transform properties
    accessorMethods: {
      offsetX: function() {
        return this._currentTranslateX || 0;
      },

      offsetY: function() {
        return this._currentTranslateY || 0;
      },

      magnify: function() {
        var valArray = (this.magnify || "1,1").split(',');
        if (valArray[0]) { valArray[0] = parseFloat(valArray[0]); }
        if (valArray[1]) { valArray[1] = parseFloat(valArray[1]); }

        // If both scale values are identical, return a single number, otherwise return array.
        return (valArray[0] === valArray[1]) ? valArray[0] : valArray;
      },

      spin3d: function() {
        var valArray = (this.spin3d || "0,0,0,0deg").split(',');
        for (var idx = 0; idx <= 3; ++idx) {
          if (valArray[idx]) { valArray[idx] = parseFloat(valArray[idx]); }
        }
        if (valArray[3]) { valArray[3] = addUnitIfMissing(valArray[3], 'deg'); }

        return valArray;
      }
    },

    /**
     * Parses a CSS transform string into individual properties.
     * Called during object construction.
     * @param {string} inputString The transform string (e.g., "rotate(90) scale(2,2)").
     */
    decode: function(inputString) {
      var thisRef = this;
      inputString.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(fullMatch, attribute, attributeValue) {
        thisRef.assignFromString(attribute, attributeValue);
      });
    },

    /**
     * Converts the VisualModifier object into a CSS `transition` property string.
     * @param {boolean} [enable3d=!1] If !0, generates a WebKit-specific 3D string (e.g., scale3d).
     * @returns {string} The CSS transform string.
     */
    toString: function(enable3d) {
      var resultArray = [];

      for (var keyIter in this) {
        if (this.hasOwnProp(keyIter)) {
          // Skip 3D transformations if the browser doesn't support them.
          if ((!jq.support.visualXform3d) && (
            (keyIter === 'spinX') ||
            (keyIter === 'spinY') ||
            (keyIter === 'depth') ||
            (keyIter === 'visualXformOrigin'))) { continue; }

          // Skip internal properties (prefixed with '_')
          if (keyIter[0] !== '_') {
            if (enable3d && (keyIter === 'magnify')) {
              resultArray.push(keyIter + "3d(" + this[keyIter] + ",1)");
            } else if (enable3d && (keyIter === 'displace')) {
              resultArray.push(keyIter + "3d(" + this[keyIter] + ",0)");
            } else {
              resultArray.push(keyIter + "(" + this[keyIter] + ")");
            }
          }
        }
      }

      return resultArray.join(" ");
    }
  };

  /**
   * Executes a function immediately or adds it to jQuery's queue.
   * @param {jQuery} self The jQuery object context.
   * @param {boolean|string} taskQueue If !0, queues on default; if string, queues on named queue.
   * @param {Function} operation The function to execute or queue.
   */
  function executeOrEnqueue(self, taskQueue, operation) {
    if (taskQueue === !0) {
      self.queue(operation);
    } else if (taskQueue) {
      self.queue(taskQueue, operation);
    } else {
      operation();
    }
  }

  /**
   * Extracts an array of CSS property names suitable for `transition-property`.
   * @param {Object} styleProperties A dictionary of CSS properties.
   * @returns {Array<string>} An array of dasherized CSS property names.
   */
  function extractStyleProps(styleProperties) {
    var resultArray = [];

    jq.each(styleProperties, function(propKey) {
      propKey = jq.toCamelCase(propKey); // Convert "text-align" => "textAlign"
      propKey = jq.animator.propAlias[propKey] || propKey; // Map to alias if exists
      propKey = toKebabCase(propKey); // Convert back to dasherized "text-align"

      if (jq.containsItem(propKey, resultArray) === -1) { resultArray.push(propKey); }
    });

    return resultArray;
  }

  /**
   * Generates the CSS `transition` property string.
   *
   * Example:
   *
   *     composeTransitionString({ opacity: 1, spin: 30 }, 500, 'standard', 0);
   *     //=> 'opacity 500ms ease, -webkit-visualXform 500ms ease'
   *
   * @param {Object} animatedProps The properties being animated.
   * @param {number} animDuration The animation duration in milliseconds.
   * @param {string} timingFunc The easing function name.
   * @param {number} animDelay The animation delay in milliseconds.
   * @returns {string} The formatted CSS `transition` string.
   */
  function composeTransitionString(animatedProps, animDuration, timingFunc, animDelay) {
    // Get the base CSS properties involved in the transition.
    var propsToTransition = extractStyleProps(animatedProps);

    // Resolve easing aliases (e.g., 'fadeIn' => 'ease-in').
    if (jq.timingFunctions[timingFunc]) { timingFunc = jq.timingFunctions[timingFunc]; }

    // Build the duration, easing, and delay components.
    var attrString = '' + convertToMilliseconds(animDuration) + ' ' + timingFunc;
    if (parseInt(animDelay, 10) > 0) { attrString += ' ' + convertToMilliseconds(animDelay); }

    // Combine all properties with their transition attributes.
    var transitionList = [];
    jq.each(propsToTransition, function(idx, name) {
      transitionList.push(name + ' ' + attrString);
    });

    return transitionList.join(', ');
  }

  // ## jq.fn.animateXform
  // Functions like `jq.fn.animate()`, but leverages CSS transitions for performance.
  //
  //     jq("...").animateXform({ opacity: 0.1, magnify: 0.3 });
  //
  //     // With specific duration
  //     jq("...").animateXform({ opacity: 0.1, magnify: 0.3 }, 500);
  //
  //     // With duration and easing
  //     jq("...").animateXform({ opacity: 0.1, magnify: 0.3 }, 500, 'fadeIn');
  //
  //     // With callback function
  //     jq("...").animateXform({ opacity: 0.1, magnify: 0.3 }, function() { /* ... */ });
  //
  //     // With all parameters
  //     jq("...").animateXform({ opacity: 0.1, magnify: 0.3 }, 500, 'fadeIn', function() { /* ... */ });
  //
  //     // Alternate object syntax
  //     jq("...").animateXform({
  //       opacity: 0.1,
  //       animDuration: 200,
  //       startDelay: 40,
  //       timingFunc: 'fadeIn',
  //       onComplete: function() { /* ... */ }
  //      });
  //
  jq.fn.animateXform = jq.fn.xformAnimate = function(targetProps, animDuration, timingFunc, onComplete) {
    var elementContext  = this;
    var startDelay      = 0;
    var useQueue        = !0; // Default to queueing animations

    // Handle `.animateXform(targetProps, onComplete)` signature.
    if (typeof animDuration === 'function') {
      onComplete = animDuration;
      animDuration = void 0;
    }

    // Handle `.animateXform(targetProps, animDuration, onComplete)` signature.
    if (typeof timingFunc === 'function') {
      onComplete = timingFunc;
      timingFunc = void 0;
    }

    // Process alternate object syntax for options.
    if (typeof targetProps.timingFunc !== 'undefined') {
      timingFunc = targetProps.timingFunc;
      delete targetProps.timingFunc;
    }

    if (typeof targetProps.animDuration !== 'undefined') {
      animDuration = targetProps.animDuration;
      delete targetProps.animDuration;
    }

    if (typeof targetProps.startDelay !== 'undefined') {
      startDelay = targetProps.startDelay;
      delete targetProps.startDelay;
    }

    if (typeof targetProps.onComplete !== 'undefined') {
      onComplete = targetProps.onComplete;
      delete targetProps.onComplete;
    }

    if (typeof targetProps.useQueue !== 'undefined') {
      useQueue = targetProps.useQueue;
      delete targetProps.useQueue;
    }

    // Normalize duration and easing.
    if (animDuration === void 0) { animDuration = jq.fx.speeds._default; }
    if (timingFunc === void 0) { timingFunc = jq.timingFunctions.standard; }
    if (animDuration === null) { animDuration = 0; } // Ensure duration is a number

    animDuration = convertToMilliseconds(animDuration); // Convert to milliseconds
    startDelay = convertToMilliseconds(startDelay);     // Convert to milliseconds

    // Create a new VisualModifier to handle transform properties.
    var currentVisualModifier = new VisualModifier();

    var _internalValues = {};   // Stores CSS properties that need to be set
    var _internalDelays = {};   // Stores delays for specific properties
    var _internalQueue = useQueue; // Queueing behavior for this animation
    var _internalDuration = animDuration; // Animation duration
    var _internalEasing = timingFunc; // Easing function
    var _internalComplete = onComplete; // Completion callback

    // Iterate through target properties to prepare for animation.
    jq.each(targetProps, function(propName, propValue) {
      // Handle transform properties specially.
      if (jq.styleHooks[propName] && (propName === 'visualXform' || jq.styleHooks[propName].assign === addStylePropertyHook(!0))) {
        currentVisualModifier.assign(propName, propValue);
        _internalValues[propName] = currentVisualModifier.toString();
      } else if (propName in capability) {
        _internalValues[capability[propName]] = propValue;
      } else {
        _internalValues[propName] = propValue;
      }
    });

    // Create the transition string.
    var transitionSettings = composeTransitionString(_internalValues, _internalDuration, _internalEasing, _internalDelays[propName] || startDelay);

    // Iterate over each matched element to apply the transition.
    return this.each(function() {
      var currentElement = jq(this);
      var _storedOriginal = currentElement.data('__xformAnimateOriginal');

      // If this is the first transition for this element, store original styles.
      if (!_storedOriginal) {
        currentElement.data('__xformAnimateOriginal', (_storedOriginal = {}));
      }

      var _initialCSS = {}; // Store original inline styles
      var _initialTransitionSettings = {}; // Store original transition styles
      var _initialTransitionEndEvent = {}; // Store original transitionend event handler
      var _initialTransform = {}; // Store original transform style
      var _initialTransformOrigin = {}; // Store original transform-origin style

      // Function to execute the transition.
      var performTransition = function() {
        // Clear any existing transition timer to prevent conflicts.
        if (_storedOriginal._transitionTimer) {
          clearTimeout(_storedOriginal._transitionTimer);
        }

        // Event handler for `transitionend`.
        var finishHandler = function(eventObject) {
          // Ensure the event is for the current element and not a child.
          if (eventObject.target !== eventObject.currentTarget) { return; }

          // Remove the event handler.
          currentElement.unbind(xformFinishEvent, finishHandler);

          // Clear stored original transition properties.
          currentElement.css(_initialTransitionSettings);
          currentElement.css(_initialTransform);
          currentElement.css(_initialTransformOrigin);

          // Restore original styles.
          currentElement.css(_initialCSS);

          // Clear data related to this animation.
          currentElement.removeData('__xformAnimateOriginal');

          // Execute callback if provided.
          if (_internalComplete) { _internalComplete.apply(currentElement); }

          // Dequeue the next animation if queueing is enabled.
          if (_internalQueue) {
            currentElement.dequeue();
          }
        };

        // If transitions are disabled or duration is zero, complete instantly.
        if (_internalDuration === 0 || !jq.animator.active) {
          currentElement.css(_internalValues);
          if (_internalComplete) { _internalComplete.apply(currentElement); }
          if (_internalQueue) { currentElement.dequeue(); }
          return;
        }

        // Store current inline styles to restore them later.
        var currentStyle = currentElement.attr('style') || '';
        _initialCSS = { 'style' : currentStyle };

        // Store original transition-related CSS properties.
        _initialTransitionSettings[capability.xform] = currentElement.css(capability.xform);
        _initialTransitionSettings[capability.xformProperty] = currentElement.css(capability.xformProperty);
        _initialTransitionSettings[capability.xformDuration] = currentElement.css(capability.xformDuration);
        _initialTransitionSettings[capability.xformTimingFunc] = currentElement.css(capability.xformTimingFunc);
        _initialTransitionSettings[capability.xformDelay] = currentElement.css(capability.xformDelay);

        _initialTransform[capability.visualXform] = currentElement.css(capability.visualXform);
        _initialTransformOrigin[capability.visualXformOrigin] = currentElement.css(capability.visualXformOrigin);

        // Apply transition properties.
        currentElement.css({
          // Set transition properties
          // Using a slight delay to ensure the browser registers the changes before applying transition
          // (Fixes issues where transition sometimes doesn't apply for '0s' transitions)
          // Also, transitionEnd event might fire too early if duration is too short.
          // Forcing a minimum duration or using a timeout.
          transitionProperty: 'none',
          transitionDuration: '0s',
          transitionDelay: '0s',
          transitionTimingFunction: 'ease'
        });

        // Force a reflow to apply the 'none' transition immediately.
        currentElement.outerWidth();

        // Apply the target styles and the new transition string.
        currentElement.css(jq.extend(_initialValues, {
          [capability.xform]: transitionSettings
        }));

        // Bind the transitionend event.
        if (xformFinishEvent && jq.animator.utilizeTransitionFinish) {
          currentElement.bind(xformFinishEvent, finishHandler);
        } else {
          // Fallback to setTimeout if transitionend event is not supported or disabled.
          _storedOriginal._transitionTimer = setTimeout(finishHandler, _internalDuration + startDelay + 100); // Add a buffer
        }
      };

      // Execute or queue the transition.
      executeOrEnqueue(currentElement, _internalQueue, function() {
        // If there's a delay, schedule the transition.
        if (startDelay > 0) {
          _storedOriginal._transitionTimer = setTimeout(performTransition, startDelay);
        } else {
          performTransition();
        }
      });
    });
  };

  /**
   * Adds a unit (e.g., 'px', 'deg') to a numeric value if it's missing.
   * @param {number|string} numericValue The value.
   * @param {string} fallbackUnit The unit to append if missing.
   * @returns {string} The value with unit.
   */
  function addUnitIfMissing(numericValue, fallbackUnit) {
    if (typeof numericValue === 'string' && !numericValue.match(/^[\-0-9\.]+$/)) {
      return numericValue; // Already has a unit or is a non-numeric string
    }
    return "" + numericValue + fallbackUnit;
  }

  /**
   * Converts a duration value to milliseconds.
   * Handles 'fast', 'normal', 'slow' aliases.
   * @param {number|string} seconds The duration in seconds or an alias.
   * @returns {number} The duration in milliseconds.
   */
  function convertToMilliseconds(seconds) {
    var numericSeconds = parseFloat(seconds);
    if (jq.isNumeric(numericSeconds)) {
      return numericSeconds;
    }
    // Handle jQuery's speed aliases
    switch (seconds) {
      case 'fast': return 200;
      case 'normal': return 400;
      case 'slow': return 600;
      default: return 0; // Default to no duration
    }
  }

  /**
   * Converts a camelCase string to kebab-case (dasherized).
   * @param {string} inputString The camelCase string.
   * @returns {string} The kebab-case string.
   */
  function toKebabCase(inputString) {
    // Replace uppercase letters with a hyphen followed by the lowercase letter.
    // Also, handle cases like 'MsTransition' to 'ms-transition'.
    var resultString = inputString.replace(/([A-Z])/g, function(fullMatch) {
      return '-' + fullMatch.toLowerCase();
    });
    return resultString.charAt(0) === '-' ? resultString.substr(1) : resultString;
  }

})(jQuery); // Pass jQuery object into the IIFE