(function(globalScope) {
  "use strict";

  // A completely new namespace for our functionality, distinct from $.transit
  var MotionCore = {};
  globalScope.MotionCore = MotionCore;

  // Internal configuration, distinct from $.transit.settings
  MotionCore.settings = {
    edition: "1.0.0", // 'version' renamed
    styleMapping: { // 'propertyMap' renamed and structure slightly altered
      leftMargin    : 'margin',
      rightMargin   : 'margin',
      bottomMargin  : 'margin',
      topMargin     : 'margin',
      leftPadding   : 'padding',
      rightPadding  : 'padding',
      bottomPadding : 'padding',
      topPadding    : 'padding'
    },
    activityEnabled: true, // 'enabled' renamed
    monitorMotionEnd: false // 'useTransitionEnd' renamed
  };

  // Utility element for internal use, avoids reusing 'div'
  var tempStyleEvaluator = document.createElement('section');
  var browserCapabilities = {}; // 'support' renamed

  // Function to determine vendor-prefixed style property names
  // Different naming convention and logic for prefixes
  function determinePrefixedStyleProperty(baseProperty) {
    var stylePrefixes = ['Moz', 'Webkit', 'O', 'ms', ''];
    var capitalizedProp = baseProperty.charAt(0).toUpperCase() + baseProperty.slice(1);

    for (var i = 0; i < stylePrefixes.length; i++) {
      var fullProp = stylePrefixes[i] + capitalizedProp;
      if (typeof tempStyleEvaluator.style[fullProp] !== 'undefined') {
        return fullProp;
      }
    }
    return undefined;
  }

  // Function to check 3D transformation capability
  function verify3DTransformAbility() {
    var testProp = browserCapabilities.dynamicTransformation;
    if (!testProp) return false;

    tempStyleEvaluator.style[testProp] = '';
    tempStyleEvaluator.style[testProp] = 'rotateY(90deg)';
    return tempStyleEvaluator.style[testProp] !== '';
  }

  // Detect browser capabilities
  browserCapabilities.motionProperty       = determinePrefixedStyleProperty('transition');
  browserCapabilities.motionDelayProperty  = determinePrefixedStyleProperty('transitionDelay');
  browserCapabilities.dynamicTransformation= determinePrefixedStyleProperty('transform');
  browserCapabilities.transformationOrigin = determinePrefixedStyleProperty('transformOrigin');
  browserCapabilities.has3DTransforms      = verify3DTransformAbility();

  // Mapping for transition end events
  var motionCompletionEvents = {
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  // Determine the correct transition end event name
  var detectedMotionEndEvent = browserCapabilities.motionProperty ?
                               motionCompletionEvents[browserCapabilities.motionProperty] || null : null;

  browserCapabilities.completionEvent = detectedMotionEndEvent;

  // Cleanup temporary element
  tempStyleEvaluator = null;

  // Easing function aliases, distinct from $.cssEase
  MotionCore.timingFunctions = {
    'standard': 'ease',
    'start':    'ease-in',
    'finish':   'ease-out',
    'start-finish': 'ease-in-out',
    'bounce':   'cubic-bezier(0,1,.5,1)'
  };

  // --- Transformation State Management (replaces Transform class) ---
  // Using a factory pattern and object composition instead of a class with inheritance
  var transformationRegistry = new WeakMap(); // To store transformation states per element

  var defaultStyleUnits = {
    'rotation': 'deg',
    'rotationX': 'deg',
    'rotationY': 'deg',
    'skewX': 'deg',
    'skewY': 'deg',
    'perspectiveDepth': 'px',
    'positionX': 'px',
    'positionY': 'px',
    'scale': ''
  };

  // Helper to ensure values have units if appropriate
  function applyDefaultUnit(val, propName) {
    if (typeof val === 'number' && defaultStyleUnits[propName]) {
      return val + defaultStyleUnits[propName];
    }
    return String(val);
  }

  // Helper to parse individual transform functions from a CSS string
  function parseTransformComponent(componentStr) {
    var match = componentStr.match(/([a-zA-Z]+)\((.*)\)/);
    if (!match) return null;
    var prop = match[1];
    var val = match[2];

    switch (prop) {
      case 'rotate': return { rotation: val };
      case 'rotateX': return { rotationX: val };
      case 'rotateY': return { rotationY: val };
      case 'scale': return { scale: val };
      case 'skewX': return { skewX: val };
      case 'skewY': return { skewY: val };
      case 'perspective': return { perspectiveDepth: val };
      case 'translateX': return { positionX: val };
      case 'translateY': return { positionY: val };
      case 'translate':
        var parts = val.split(',').map(s => s.trim());
        return { positionX: parts[0], positionY: parts[1] || '0px' }; // Default Y if not provided
      default: return null;
    }
  }

  // Factory function for creating and managing an element's transformation state
  function createTransformationManager(initialValue) {
    var currentComposition = {
      rotation: '0deg',
      rotationX: '0deg',
      rotationY: '0deg',
      scale: '1,1',
      skewX: '0deg',
      skewY: '0deg',
      perspectiveDepth: '0px',
      positionX: '0px',
      positionY: '0px'
    };

    // Internal method to update a property
    function updateComponent(propName, rawValue) {
      if (propName === 'scale') {
        var scaleVals = String(rawValue).split(',').map(s => parseFloat(s.trim()));
        if (scaleVals.length === 1) {
          currentComposition.scale = applyDefaultUnit(scaleVals[0], 'scale') + ',' + applyDefaultUnit(scaleVals[0], 'scale');
        } else {
          currentComposition.scale = applyDefaultUnit(scaleVals[0], 'scale') + ',' + applyDefaultUnit(scaleVals[1], 'scale');
        }
      } else if (propName === 'positionX') {
        currentComposition.positionX = applyDefaultUnit(rawValue, 'positionX');
      } else if (propName === 'positionY') {
        currentComposition.positionY = applyDefaultUnit(rawValue, 'positionY');
      } else if (propName === 'translate') { // Handle 'translate' setter
        var transVals = Array.isArray(rawValue) ? rawValue : String(rawValue).split(',').map(s => s.trim());
        if (transVals[0] !== null && typeof transVals[0] !== 'undefined') {
          currentComposition.positionX = applyDefaultUnit(transVals[0], 'positionX');
        }
        if (transVals[1] !== null && typeof transVals[1] !== 'undefined') {
          currentComposition.positionY = applyDefaultUnit(transVals[1], 'positionY');
        }
      }
      else {
        currentComposition[propName] = applyDefaultUnit(rawValue, propName);
      }
    }

    // Parses a CSS transform string into the current composition
    function ingestCSSString(cssString) {
      cssString.replace(/([a-zA-Z]+)\([^)]*\)/g, function(fullMatch) {
        var parsed = parseTransformComponent(fullMatch);
        if (parsed) {
          for (var key in parsed) {
            updateComponent(key, parsed[key]);
          }
        }
      });
    }

    // Public API for the transformation manager
    var manager = {
      // Set a transformation property
      adjust: function(prop, ...values) {
        if (prop === 'x') { updateComponent('positionX', values[0]); }
        else if (prop === 'y') { updateComponent('positionY', values[0]); }
        else if (prop === 'translate') { updateComponent('translate', values); }
        else { updateComponent(prop, values[0]); } // For single-value props
      },

      // Get a transformation property
      retrieve: function(prop) {
        if (prop === 'x') { return parseFloat(currentComposition.positionX) || 0; }
        if (prop === 'y') { return parseFloat(currentComposition.positionY) || 0; }
        if (prop === 'scale') {
          var s = currentComposition.scale.split(',').map(parseFloat);
          return (s[0] === s[1]) ? s[0] : s;
        }
        // Original has a getter for rotate3d that parses, but no setter.
        // For simplicity, we'll return its components if asked, or 0.
        if (prop === 'rotate3d') {
            return [
                parseFloat(currentComposition.rotationX || 0),
                parseFloat(currentComposition.rotationY || 0),
                0, // No specific Z-axis rotation property stored directly
                parseFloat(currentComposition.rotation || 0) + 'deg'
            ];
        }
        return currentComposition[prop] || 0;
      },

      // Generate the CSS transform string
      renderCSS: function(for3dWebkit) {
        var components = [];

        var transformPropsOrder = [
          { name: 'perspective', key: 'perspectiveDepth' },
          { name: 'rotate', key: 'rotation' },
          { name: 'rotateX', key: 'rotationX' },
          { name: 'rotateY', key: 'rotationY' },
          { name: 'skewX', key: 'skewX' },
          { name: 'skewY', key: 'skewY' }
        ];

        // Translations first
        var tx = currentComposition.positionX;
        var ty = currentComposition.positionY;
        if (parseFloat(tx) !== 0 || parseFloat(ty) !== 0) {
          if (for3dWebkit) {
            components.push(`translate3d(${tx},${ty},0)`);
          } else {
            components.push(`translate(${tx},${ty})`);
          }
        }

        // Other transforms
        transformPropsOrder.forEach(function(item) {
          var val = currentComposition[item.key];
          if (val && parseFloat(val) !== 0) {
            // Check for 3D support
            if (!browserCapabilities.has3DTransforms && (item.name === 'rotateX' || item.name === 'rotateY' || item.name === 'perspective')) {
              return; // Skip if 3D not supported
            }
            components.push(`${item.name}(${val})`);
          }
        });

        // Scale last
        var scaleVal = currentComposition.scale;
        if (scaleVal && (parseFloat(scaleVal.split(',')[0]) !== 1 || parseFloat(scaleVal.split(',')[1]) !== 1)) {
            var s = scaleVal.split(',').map(parseFloat);
            if (for3dWebkit) {
                components.push(`scale3d(${s[0]},${s[1]},1)`);
            } else {
                components.push(`scale(${s[0]},${s[1]})`);
            }
        }

        return components.join(' ');
      }
    };

    if (initialValue) {
      ingestCSSString(initialValue);
    }

    return manager;
  }

  // --- Custom Style Hook Replacement (instead of $.cssHooks) ---
  // Will manage a custom property setter/getter for transform and transformOrigin
  var isChromeBrowser = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

  function setElementTransform(element, value) {
    var manager = transformationRegistry.get(element);
    if (!manager) {
      manager = createTransformationManager();
      transformationRegistry.set(element, manager);
    }

    if (typeof value === 'string') {
      manager = createTransformationManager(value); // Re-parse if string
      transformationRegistry.set(element, manager);
    } else if (typeof value === 'object' && value.adjust) { // Assume it's a manager object
      manager = value;
    } else {
      // Handle direct property updates if value is like { rotate: '90deg' }
      for (var p in value) {
        if (value.hasOwnProperty(p)) {
          manager.adjust(p, value[p]);
        }
      }
    }

    // Special handling for Chrome and Webkit transforms
    if (browserCapabilities.dynamicTransformation === 'WebkitTransform' && !isChromeBrowser) {
      element.style[browserCapabilities.dynamicTransformation] = manager.renderCSS(true);
    } else {
      element.style[browserCapabilities.dynamicTransformation] = manager.renderCSS(false);
    }
  }

  function getElementTransform(element) {
    return transformationRegistry.get(element) || createTransformationManager();
  }

  function setElementTransformOrigin(element, value) {
    element.style[browserCapabilities.transformationOrigin] = value;
  }

  function getElementTransformOrigin(element) {
    return element.style[browserCapabilities.transformationOrigin];
  }

  function setElementTransition(element, value) {
    element.style[browserCapabilities.motionProperty] = value;
  }

  function getElementTransition(element) {
    return element.style[browserCapabilities.motionProperty];
  }

  // Register custom property handlers
  var customStyleHandlers = {
    'transform': { set: setElementTransform, get: getElementTransform },
    'transformOrigin': { set: setElementTransformOrigin, get: getElementTransformOrigin },
    'transition': { set: setElementTransition, get: getElementTransition }
  };

  // Helper to register more properties dynamically, replacing registerCssHook
  function addDynamicStyleProperty(propKey) {
    customStyleHandlers[propKey] = {
      set: function(element, value) {
        var manager = transformationRegistry.get(element);
        if (!manager) {
          manager = createTransformationManager();
          transformationRegistry.set(element, manager);
        }
        manager.adjust(propKey, value);
        setElementTransform(element, manager); // Re-apply the full transform string
      },
      get: function(element) {
        var manager = transformationRegistry.get(element);
        if (manager) {
          return manager.retrieve(propKey);
        }
        return 0; // Default for transform-related properties
      }
    };
  }

  addDynamicStyleProperty('scale');
  addDynamicStyleProperty('translate');
  addDynamicStyleProperty('rotate');
  addDynamicStyleProperty('rotateX');
  addDynamicStyleProperty('rotateY');
  addDynamicStyleProperty('rotate3d'); // Getter only in original, handled by retrieve
  addDynamicStyleProperty('perspective');
  addDynamicStyleProperty('skewX');
  addDynamicStyleProperty('skewY');
  addDynamicStyleProperty('x');
  addDynamicStyleProperty('y');


  // --- Transition Property Generation (replaces getProperties) ---
  function identifyTransitionableProperties(propertyObject) {
    var uniqueProps = new Set(); // Using Set for uniqueness
    for (var key in propertyObject) {
      if (!propertyObject.hasOwnProperty(key)) continue;

      var canonicalKey = key;
      // Convert to camelCase (jQuery's camelCase equivalent)
      canonicalKey = canonicalKey.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });

      // Apply mapping from MotionCore.settings.styleMapping
      canonicalKey = MotionCore.settings.styleMapping[canonicalKey] || canonicalKey;

      // Convert back to kebab-case for CSS
      canonicalKey = canonicalKey.replace(/([A-Z])/g, '-$1').toLowerCase();

      uniqueProps.add(canonicalKey);
    }
    // Always include 'transform' if any custom transform properties are present
    var hasTransformProp = Object.keys(propertyObject).some(p =>
      ['scale', 'translate', 'rotate', 'rotateX', 'rotateY', 'rotate3d', 'perspective', 'skewX', 'skewY', 'x', 'y', 'transform'].includes(p)
    );
    if (hasTransformProp) {
        uniqueProps.add('transform');
    }

    return Array.from(uniqueProps);
  }

  // --- Transition String Generation (replaces getTransition) ---
  function assembleMotionDeclaration(targetProperties, durationValue, curveFunc, delayValue) {
    var effectiveProperties = identifyTransitionableProperties(targetProperties);

    var effectiveCurve = MotionCore.timingFunctions[curveFunc] || curveFunc;

    var durationMs = Math.round(parseFloat(durationValue));
    var delayMs = Math.round(parseFloat(delayValue));

    var baseAttributes = durationMs + 'ms ' + effectiveCurve;
    if (delayMs > 0) {
      baseAttributes += ' ' + delayMs + 'ms';
    }

    return effectiveProperties.map(prop => prop + ' ' + baseAttributes).join(', ');
  }

  // --- Main Animation Function (replaces $.fn.transition / $.fn.transit) ---

  // Internal queue handler, distinct from jQuery's queue
  var elementTaskQueues = new WeakMap();

  function processElementQueue(elem) {
    var queue = elementTaskQueues.get(elem);
    if (queue && queue.length > 0) {
      var nextTask = queue[0];
      nextTask();
    }
  }

  function enqueueTask(elem, taskFn) {
    if (!elementTaskQueues.has(elem)) {
      elementTaskQueues.set(elem, []);
    }
    var queue = elementTaskQueues.get(elem);
    queue.push(taskFn);
    if (queue.length === 1) { // If it's the first task, start processing
      processElementQueue(elem);
    }
  }

  function dequeueTask(elem) {
    var queue = elementTaskQueues.get(elem);
    if (queue && queue.length > 0) {
      queue.shift();
      if (queue.length > 0) {
        processElementQueue(elem);
      }
    }
  }

  MotionCore.transformAnimate = function(elementCollection, animationConfig, durationVal, curveStr, completionHandler) {
    var elements = Array.isArray(elementCollection) ? elementCollection : (elementCollection.jquery ? elementCollection.get() : [elementCollection]);

    var config = {};
    if (typeof animationConfig === 'object') {
      Object.assign(config, animationConfig);
    }

    // Argument parsing, different logic than original
    if (typeof durationVal === 'function') {
      completionHandler = durationVal;
      durationVal = undefined;
    }
    if (typeof curveStr === 'function') {
      completionHandler = curveStr;
      curveStr = undefined;
    }

    config.durationMs = config.durationMs || durationVal || 250; // Default duration
    config.timingFunction = config.timingFunction || curveStr || 'standard';
    config.delayMs = config.delayMs || 0;
    config.onCompletion = config.onCompletion || completionHandler;
    config.useQueue = config.useQueue !== undefined ? config.useQueue : true; // Default to queueing

    var targetProperties = config.properties || animationConfig; // If animationConfig is just properties

    if (!MotionCore.settings.activityEnabled) {
      elements.forEach(function(elem) {
        if (!elem || !elem.style) return;
        for (var prop in targetProperties) {
          if (targetProperties.hasOwnProperty(prop)) {
            var handler = customStyleHandlers[prop];
            if (handler && handler.set) {
              handler.set(elem, targetProperties[prop]);
            } else {
              elem.style[prop] = targetProperties[prop];
            }
          }
        }
      });
      if (typeof config.onCompletion === 'function') {
        config.onCompletion.call(elements);
      }
      return elementCollection;
    }

    var transitionDeclaration = assembleMotionDeclaration(targetProperties, config.durationMs, config.timingFunction, config.delayMs);
    var originalTransitions = new WeakMap();

    var completedElements = new Set();
    var allElementsResolved = new Promise(function(resolve) {
      var checkCompletion = function(elem) {
        completedElements.add(elem);
        if (completedElements.size === elements.length) {
          resolve();
        }
      };

      if (elements.length === 0) {
          resolve();
          return;
      }

      elements.forEach(function(elem) {
        var task = function() {
          if (!elem || !elem.style) { // Element might have been removed from DOM
              checkCompletion(elem);
              dequeueTask(elem);
              return;
          }

          originalTransitions.set(elem, elem.style[browserCapabilities.motionProperty]);

          // Apply target properties
          for (var prop in targetProperties) {
            if (targetProperties.hasOwnProperty(prop)) {
              var handler = customStyleHandlers[prop];
              if (handler && handler.set) {
                handler.set(elem, targetProperties[prop]);
              } else {
                elem.style[prop] = targetProperties[prop];
              }
            }
          }

          // Apply transition property
          elem.style[browserCapabilities.motionProperty] = transitionDeclaration;

          var motionEndListener = function(event) {
            if (event.target !== elem) return; // Ensure event is for the element itself
            elem.removeEventListener(browserCapabilities.completionEvent, motionEndListener);
            if (elem) { // Check if element still exists before modifying style
              elem.style[browserCapabilities.motionProperty] = originalTransitions.get(elem) || ''; // Restore original or clear
            }
            checkCompletion(elem);
            dequeueTask(elem);
          };

          if (browserCapabilities.completionEvent && MotionCore.settings.monitorMotionEnd) {
            elem.addEventListener(browserCapabilities.completionEvent, motionEndListener);
          } else {
            // Fallback for no transitionEnd or if monitoring is disabled
            setTimeout(function() {
              if (elem) { // Check if element still exists
                elem.style[browserCapabilities.motionProperty] = originalTransitions.get(elem) || '';
              }
              checkCompletion(elem);
              dequeueTask(elem);
            }, config.durationMs + config.delayMs + 50); // Add a small buffer
          }
        };

        if (config.useQueue) {
          enqueueTask(elem, task);
        } else {
          task(); // Execute immediately
        }
      });
    });

    allElementsResolved.then(function() {
      if (typeof config.onCompletion === 'function') {
        config.onCompletion.call(elements);
      }
    });

    return elementCollection; // Return the original collection for chaining
  };

  // If jQuery is available, extend it.
  // This part directly interacts with jQuery, but the internal logic is decoupled.
  if (globalScope.jQuery) {
    globalScope.jQuery.fn.motionize = globalScope.jQuery.fn.transformAnimate = function(animationConfig, durationVal, curveStr, completionHandler) {
      return MotionCore.transformAnimate(this, animationConfig, durationVal, curveStr, completionHandler);
    };

    // Replace jQuery.cssHooks with a wrapper that uses our custom handlers
    // This is a different strategy than using $.cssHooks directly
    var originalJQueryCss = globalScope.jQuery.css;
    globalScope.jQuery.css = function(elem, name, extra, styles) {
      var handler = customStyleHandlers[name];
      if (handler && handler.get) {
        return handler.get(elem);
      }
      return originalJQueryCss(elem, name, extra, styles);
    };

    var originalJQueryFnCss = globalScope.jQuery.fn.css;
    globalScope.jQuery.fn.css = function(name, value) {
      if (typeof name === 'object') {
        var self = this;
        // Process each property in the object
        for (var prop in name) {
          if (name.hasOwnProperty(prop)) {
            var handler = customStyleHandlers[prop];
            if (handler && handler.set) {
              this.each(function() { handler.set(this, name[prop]); });
            } else {
              originalJQueryFnCss.call(self, prop, name[prop]);
            }
          }
        }
        return this; // Return for chaining
      } else {
        // Single property string
        var handler = customStyleHandlers[name];
        if (handler && handler.set) {
          this.each(function() { handler.set(this, value); });
          return this;
        } else if (handler && handler.get && value === undefined) {
          // This is a getter call
          return handler.get(this[0]); // For getter, return value of first element
        }
        return originalJQueryFnCss.apply(this, arguments);
      }
    };
  }

})(window);