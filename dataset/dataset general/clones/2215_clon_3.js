/*
 * Motionator.js - Enhanced CSS3 transition and transformation library
 * Copyright (c) 2023 Advanced UI Solutions Inc.
 * Licensed under the Apache License, Version 2.0.
 *
 * Project Home: https://www.example.com/motionator
 * Source Code: https://github.com/advanced-ui/motionator
 *
 * Re-engineered by CodeCloneGen for modern browser compatibility and performance.
 */

(function($lib) {
  "use strict";

  // Global configuration and utility namespace for Motionator.
  $lib.motionKit = {
    moduleVersion: "1.0.0", // Current module revision identifier.

    // Mapping of CSS property names to their canonical transition group names.
    // This helps in grouping properties for 'transition-property' generation.
    // For example, all margin-related properties fall under 'margin'.
    cssPropertyAliases: {
      marginLeft    : 'margin',
      marginRight   : 'margin',
      marginBottom  : 'margin',
      marginTop     : 'margin',
      paddingLeft   : 'padding',
      paddingRight  : 'padding',
      paddingBottom : 'padding',
      paddingTop    : 'padding'
    },

    // A flag to globally enable or disable all motion effects.
    // If set to 'false', animations will complete instantly.
    animationsActive: true,

    // Determines if the 'transitionend' event should be used for completion callbacks.
    // Setting this to 'false' will use a setTimeout fallback.
    awaitTransitionEnd: false,

    // Default animation duration in milliseconds.
    defaultDuration: 250,

    // Default easing function for animations.
    defaultEasing: 'ease'
  };

  // Temporary DOM element for feature detection.
  const featureTestDiv = document.createElement('div');
  const browserCapabilities = {}; // Object to store detected browser features.

  // Helper to convert camelCase to kebab-case (CSS property names).
  const convertToKebabCase = (camelCaseString) => {
    return camelCaseString.replace(/([A-Z])/g, '-$1').toLowerCase();
  };

  // Helper to ensure a value has a unit or assign a default one.
  const applyUnit = (val, defaultUnit) => {
    if (typeof val === 'number' || (typeof val === 'string' && val.match(/^[0-9.]+$/))) {
      return `${val}${defaultUnit}`;
    }
    return val;
  };

  // Helper to parse a numeric value from a string (e.g., "10px" -> 10).
  const parseNumericValue = (val) => {
    if (typeof val === 'string') {
      const match = val.match(/^(-?\d*\.?\d+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return parseFloat(val) || 0;
  };

  // Helper to convert milliseconds to a CSS time string (e.g., 250ms).
  const toMsString = (durationValue) => {
    return `${parseFloat(durationValue)}ms`;
  };

  // Utility to find the browser-specific prefix for a CSS property.
  // Example: 'transition' => 'WebkitTransition'
  function resolveVendorSpecificProperty(cssProperty) {
    const vendorPrefixes = ['Moz', 'Webkit', 'O', 'ms'];
    const capitalizedProperty = cssProperty.charAt(0).toUpperCase() + cssProperty.slice(1);

    if (cssProperty in featureTestDiv.style) { return cssProperty; }

    for (let i = 0; i < vendorPrefixes.length; i++) {
      const prefixedProperty = vendorPrefixes[i] + capitalizedProperty;
      if (prefixedProperty in featureTestDiv.style) { return prefixedProperty; }
    }
    return null; // Property not supported with any known prefix.
  }

  // Determines if 3D CSS transforms are supported by the browser.
  function detect3DTransformSupport() {
    const transformKey = browserCapabilities.transform;
    if (!transformKey) return false; // No transform support at all.

    featureTestDiv.style[transformKey] = '';
    featureTestDiv.style[transformKey] = 'rotateY(90deg)';
    return featureTestDiv.style[transformKey] !== '';
  }

  // Simple browser detection for specific behaviors (e.g., Chrome 3D scaling bug).
  const isBrowserChrome = navigator.userAgent.toLowerCase().includes('chrome');

  // Populate browser capabilities.
  browserCapabilities.transitionProperty = resolveVendorSpecificProperty('transition');
  browserCapabilities.transitionDelayProperty = resolveVendorSpecificProperty('transitionDelay');
  browserCapabilities.transformProperty = resolveVendorSpecificProperty('transform');
  browserCapabilities.transformOriginProperty = resolveVendorSpecificProperty('transformOrigin');
  browserCapabilities.supports3DTransforms = detect3DTransformSupport();

  // Extend jQuery's support object with our findings.
  $lib.extend($lib.support, browserCapabilities);

  // Map of vendor-prefixed transition property to its corresponding 'transitionend' event name.
  const vendorTransitionEndEvents = {
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  // Determine the correct 'transitionend' event name for the current browser.
  const finalTransitionEventName = browserCapabilities.transitionProperty ?
                                   vendorTransitionEndEvents[browserCapabilities.transitionProperty] :
                                   null;
  browserCapabilities.transitionEndEvent = finalTransitionEventName;

  // Clean up the temporary DOM element to prevent memory leaks.
  featureTestDiv = null;

  // Predefined easing functions for CSS transitions.
  $lib.motionEasings = {
    standard: 'ease',
    easeIn:   'ease-in',
    easeOut:  'ease-out',
    easeInOut: 'ease-in-out',
    springy:  'cubic-bezier(0,1,.5,1)',
    linear:   'linear' // Added a common linear easing.
  };

  // --- Custom CSS Hooks for Transformations ---

  // Hook for the 'transform' CSS property.
  // Allows direct manipulation of transform properties via jQuery's .css()
  $lib.cssHooks.transform = {
    get: function(element) {
      return $lib(element).data('motionState');
    },
    set: function(element, transformValue) {
      // Ensure element and its style property exist.
      if (!element || !element.style) return;

      let currentMotionState = transformValue;
      if (!(currentMotionState instanceof EffectState)) {
        currentMotionState = new EffectState(transformValue);
      }

      // Apply 3D transforms conditionally based on browser support and known issues.
      // Chrome's WebkitTransform might have issues with 3D scaling outside viewport.
      const transformKey = browserCapabilities.transformProperty;
      if (transformKey === 'WebkitTransform' && !isBrowserChrome) {
        element.style[transformKey] = currentMotionState.toCssString(true); // Force 3D for Webkit if not Chrome.
      } else {
        element.style[transformKey] = currentMotionState.toCssString(); // Standard or 2D.
      }

      $lib(element).data('motionState', currentMotionState);
    }
  };

  // Hook for 'transformOrigin' CSS property.
  $lib.cssHooks.transformOrigin = {
    get: function(element) {
      return element.style[browserCapabilities.transformOriginProperty];
    },
    set: function(element, value) {
      if (!element || !element.style) return;
      element.style[browserCapabilities.transformOriginProperty] = value;
    }
  };

  // Hook for 'transition' CSS property.
  $lib.cssHooks.transition = {
    get: function(element) {
      return element.style[browserCapabilities.transitionProperty];
    },
    set: function(element, value) {
      if (!element || !element.style) return;
      element.style[browserCapabilities.transitionProperty] = value;
    }
  };

  // --- Helper for creating CSS hooks for individual transform properties ---
  function setupCssAccessor(propName, isTranslational = false) {
    // If a hook for this property already exists, skip.
    if ($lib.cssHooks[propName]) { return; }

    $lib.cssHooks[propName] = {
      get: function(element) {
        const motionState = $lib(element).data('motionState');
        return motionState ? motionState.retrieveValue(propName) : undefined;
      },
      set: function(element, value) {
        let motionState = $lib(element).data('motionState');
        if (!motionState) {
          motionState = new EffectState();
          $lib(element).data('motionState', motionState);
        }
        motionState.setValue(propName, value);
        // Apply the updated transform.
        $lib(element).css(browserCapabilities.transformProperty, motionState.toCssString());
      }
    };
  }

  // Register individual CSS hooks for common transform properties.
  setupCssAccessor('scale');
  setupCssAccessor('translate');
  setupCssAccessor('rotate');
  setupCssAccessor('rotateX');
  setupCssAccessor('rotateY');
  setupCssAccessor('rotateZ'); // Added rotateZ for completeness.
  setupCssAccessor('rotate3d');
  setupCssAccessor('perspective');
  setupCssAccessor('skewX');
  setupCssAccessor('skewY');
  setupCssAccessor('x', true); // Translational property.
  setupCssAccessor('y', true); // Translational property.
  setupCssAccessor('z', true); // Added z for 3D translation.

  // --- EffectState Class: Manages a set of CSS transform properties ---
  // This object represents the current transformation state of an element.
  function EffectState(initialDescriptorString) {
    // Initialize internal translation values.
    this._translateX = 0;
    this._translateY = 0;
    this._translateZ = 0; // Initialize Z translation.

    if (typeof initialDescriptorString === 'string') {
      this.parseDescriptorString(initialDescriptorString);
    }
    return this;
  }

  EffectState.prototype = {
    // Assigns a property value from a string (e.g., 'scale', '2,4').
    applyFromString: function(propertyName, stringValue) {
      const values = (typeof stringValue === 'string') ? stringValue.split(',') :
                     (Array.isArray(stringValue)) ? stringValue :
                     [stringValue];

      values.unshift(propertyName); // Prepend property name for the setter.
      this.setValue.apply(this, values);
    },

    // Sets a transformation property.
    // Example: `state.setValue('scale', 2, 4);`
    setValue: function(propName) {
      const propertyArgs = Array.prototype.slice.call(arguments, 1);
      if (this.setHandlers[propName]) {
        this.setHandlers[propName].apply(this, propertyArgs);
      } else {
        // Fallback for direct assignment if no specific handler exists.
        this[propName] = propertyArgs.join(',');
      }
    },

    // Retrieves the value of a transformation property.
    retrieveValue: function(propName) {
      if (this.getHandlers[propName]) {
        return this.getHandlers[propName].apply(this);
      } else {
        return this[propName] || 0;
      }
    },

    // Handlers for setting specific transform properties.
    setHandlers: {
      rotation: function(angle) {
        this.rotate = applyUnit(angle, 'deg');
      },
      rotateX: function(angle) {
        this.rotateX = applyUnit(angle, 'deg');
      },
      rotateY: function(angle) {
        this.rotateY = applyUnit(angle, 'deg');
      },
      rotateZ: function(angle) { // Handler for rotateZ.
        this.rotateZ = applyUnit(angle, 'deg');
      },
      scaling: function(xFactor, yFactor) {
        this.scale = `${xFactor},${yFactor === undefined ? xFactor : yFactor}`;
      },
      skewX: function(angle) {
        this.skewX = applyUnit(angle, 'deg');
      },
      skewY: function(angle) {
        this.skewY = applyUnit(angle, 'deg');
      },
      perspective: function(distance) {
        this.perspective = applyUnit(distance, 'px');
      },
      x: function(xCoord) {
        this.setValue('translation', xCoord, null, null); // Set X, keep Y and Z.
      },
      y: function(yCoord) {
        this.setValue('translation', null, yCoord, null); // Set Y, keep X and Z.
      },
      z: function(zCoord) { // Handler for Z translation.
        this.setValue('translation', null, null, zCoord); // Set Z, keep X and Y.
      },
      translation: function(xCoord, yCoord, zCoord) {
        // Use current values if arguments are null or undefined.
        if (xCoord !== null && xCoord !== undefined) {
          this._translateX = applyUnit(xCoord, 'px');
        }
        if (yCoord !== null && yCoord !== undefined) {
          this._translateY = applyUnit(yCoord, 'px');
        }
        if (zCoord !== null && zCoord !== undefined) { // Handle Z coordinate.
          this._translateZ = applyUnit(zCoord, 'px');
        }

        this.translate = `${this._translateX},${this._translateY},${this._translateZ}`;
      }
    },

    // Handlers for retrieving specific transform properties.
    getHandlers: {
      x: function() {
        return this._translateX || 0;
      },
      y: function() {
        return this._translateY || 0;
      },
      z: function() { // Getter for Z translation.
        return this._translateZ || 0;
      },
      scaling: function() {
        const scaleValues = (this.scale || "1,1").split(',').map(parseFloat);
        return (scaleValues[0] === scaleValues[1]) ? scaleValues[0] : scaleValues;
      },
      rotation3d: function() {
        const rotationValues = (this.rotate3d || "0,0,0,0deg").split(',');
        for (let i = 0; i <= 3; i++) {
          if (rotationValues[i]) { rotationValues[i] = parseNumericValue(rotationValues[i]); }
        }
        if (rotationValues[3]) { rotationValues[3] = applyUnit(rotationValues[3], 'deg'); }
        return rotationValues;
      }
    },

    // Parses a CSS transform string (e.g., "rotate(90deg) scale(2)") and populates properties.
    parseDescriptorString: function(inputString) {
      const instanceRef = this;
      inputString.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(fullMatch, propName, propValue) {
        instanceRef.applyFromString(propName, propValue);
      });
    },

    // Converts the internal state to a CSS transform string.
    toCssString: function(force3dTransform = false) {
      const transformComponents = [];

      for (const propKey in this) {
        // Only process own properties that are not internal (starting with '_').
        if (!this.hasOwnProperty(propKey) || propKey.startsWith('_')) {
          continue;
        }

        // Skip 3D transformations if browser doesn't support them, unless explicitly forced.
        if (!browserCapabilities.supports3DTransforms && !force3dTransform && (
          propKey === 'rotateX' || propKey === 'rotateY' || propKey === 'rotateZ' ||
          propKey === 'perspective' || propKey === 'rotate3d' ||
          propKey === 'transformOrigin')) {
          continue;
        }

        // Apply 3D variants for 'scale' and 'translate' if forced for Webkit or 3D supported.
        if (force3dTransform && propKey === 'scale') {
          transformComponents.push(`scale3d(${this[propKey]},1)`);
        } else if (force3dTransform && propKey === 'translate') {
          // Ensure translate3d includes Z-component.
          const currentTranslate = this[propKey] || '0px,0px,0px';
          const parts = currentTranslate.split(',');
          const xVal = parts[0] || '0px';
          const yVal = parts[1] || '0px';
          const zVal = parts[2] || '0px'; // Ensure Z exists.
          transformComponents.push(`translate3d(${xVal},${yVal},${zVal})`);
        } else if (propKey === 'rotate' || propKey === 'rotateX' || propKey === 'rotateY' || propKey === 'rotateZ' ||
                   propKey === 'skewX' || propKey === 'skewY' || propKey === 'perspective' || propKey === 'scale' ||
                   propKey === 'translate') {
          transformComponents.push(`${propKey}(${this[propKey]})`);
        }
      }

      return transformComponents.join(" ");
    }
  };

  // --- Utility functions for queuing and property handling ---

  // Executes a function immediately or enqueues it based on queue settings.
  function executeOrEnqueue(element, queueName, func) {
    if (queueName === true) {
      element.queue(func);
    } else if (queueName) {
      element.queue(queueName, func);
    } else {
      func();
    }
  }

  // Extracts relevant CSS property names from a style object for transition-property.
  function extractCssProperties(styleObject) {
    const propertyList = [];

    $lib.each(styleObject, function(propKey) {
      let cssKey = $lib.camelCase(propKey); // Convert to camelCase first.
      cssKey = $lib.motionKit.cssPropertyAliases[cssKey] || cssKey; // Apply aliases.
      cssKey = convertToKebabCase(cssKey); // Convert back to kebab-case for CSS.

      if ($lib.inArray(cssKey, propertyList) === -1) {
        propertyList.push(cssKey);
      }
    });

    return propertyList;
  }

  // Generates the CSS 'transition' property string.
  function generateTransitionString(propertiesToAnimate, animationDuration, animationEasing, animationDelay) {
    const affectedProperties = extractCssProperties(propertiesToAnimate);

    // Resolve easing alias.
    const resolvedEasing = $lib.motionEasings[animationEasing] || animationEasing;

    // Build the duration/easing/delay attributes.
    let attributeString = `${toMsString(animationDuration)} ${resolvedEasing}`;
    if (parseInt(animationDelay, 10) > 0) {
      attributeString += ` ${toMsString(animationDelay)}`;
    }

    // Combine all properties with their transition attributes.
    const transitionDefinitions = [];
    $lib.each(affectedProperties, function(idx, propName) {
      transitionDefinitions.push(`${propName} ${attributeString}`);
    });

    return transitionDefinitions.join(', ');
  }

  // --- Main jQuery Plugin: $.fn.applyMotion ---
  // Provides a CSS transition-based animation method for jQuery elements.
  //
  // Usage:
  //   $lib("...").applyMotion({ opacity: 0.1, scale: 0.3 });
  //   $lib("...").applyMotion({ opacity: 0.1, duration: 500, easing: 'easeIn', complete: function() { ... } });
  //   $lib("...").applyMotion({ opacity: 0.1, scale: 0.3 }, 500, 'springy', function() { ... });
  //
  $lib.fn.applyMotion = function(animationOptions, durationArg, easingArg, completeCallbackArg) {
    const targetElements = this;
    const isAnimationsEnabled = $lib.motionKit.animationsActive;

    // Default settings for the animation.
    const defaultSettings = {
      duration: $lib.motionKit.defaultDuration,
      easing: $lib.motionKit.defaultEasing,
      delay: 0,
      queue: true,
      complete: null,
      properties: {}
    };

    // Parse arguments: handle various signatures.
    let settings = {};
    if (typeof animationOptions === 'object' && animationOptions !== null) {
      settings = $lib.extend({}, defaultSettings, animationOptions);
      // Extract properties from the options object if specified directly.
      if (animationOptions.properties) {
        settings.properties = animationOptions.properties;
        delete settings.properties;
      } else {
        // If properties not explicitly nested, assume top-level are properties.
        for (const key in animationOptions) {
          if (defaultSettings.hasOwnProperty(key)) {
            continue; // Skip options keys.
          }
          if (['duration', 'easing', 'delay', 'queue', 'complete'].includes(key)) {
            settings[key] = animationOptions[key];
          } else {
            settings.properties[key] = animationOptions[key];
          }
        }
      }
    }

    // Handle positional arguments overriding options object.
    if (typeof durationArg !== 'undefined') {
      settings.duration = durationArg;
    }
    if (typeof easingArg !== 'undefined') {
      settings.easing = easingArg;
    }
    if (typeof completeCallbackArg !== 'undefined') {
      settings.complete = completeCallbackArg;
    }

    // Handle callback as second or third argument.
    if (typeof settings.duration === 'function') {
      settings.complete = settings.duration;
      settings.duration = defaultSettings.duration; // Reset to default.
    }
    if (typeof settings.easing === 'function') {
      settings.complete = settings.easing;
      settings.easing = defaultSettings.easing; // Reset to default.
    }

    const { properties, duration, easing, delay, queue, complete } = settings;

    // If animations are globally disabled or no properties to animate, complete instantly.
    if (!isAnimationsEnabled || Object.keys(properties).length === 0) {
      if (typeof complete === 'function') {
        executeOrEnqueue(targetElements, queue, function() {
          complete.apply(this);
        });
      }
      return targetElements;
    }

    const transitionPropName = browserCapabilities.transitionProperty;
    const transformPropName = browserCapabilities.transformProperty;
    const transitionEndEvent = browserCapabilities.transitionEndEvent;
    const awaitTransitionEnd = $lib.motionKit.awaitTransitionEnd;

    // If no transition support, fallback to instant completion.
    if (!transitionPropName) {
      if (typeof complete === 'function') {
        executeOrEnqueue(targetElements, queue, function() {
          $lib(this).css(properties); // Apply final CSS values.
          complete.apply(this);
        });
      }
      return targetElements;
    }

    const transitionValue = generateTransitionString(properties, duration, easing, delay);

    // Timeout threshold for transition completion (to avoid hanging on un-triggered events).
    const TRANSITION_TIMEOUT_BUFFER = 50; // Milliseconds buffer.
    const transitionTimeout = duration + delay + TRANSITION_TIMEOUT_BUFFER;

    // Iterate over each matched element to apply the transition.
    targetElements.each(function(idx, element) {
      const $element = $lib(element);
      let data = $element.data('motionator') || {}; // Store internal data.

      // Function to clean up transition styles and data.
      const clearTransitionStyles = function() {
        $element.off(transitionEndEvent, onTransitionCompleted); // Remove event listener.
        $element.css(transitionPropName, ''); // Clear transition property.
        if (data.timerId) {
          clearTimeout(data.timerId); // Clear fallback timeout.
          data.timerId = null;
        }
        $element.data('motionator', data);
      };

      // Callback for when the transition completes (either by event or timeout).
      const onTransitionCompleted = function(event) {
        // Ensure the event is for the current element and not a child's transition.
        if (event && event.target !== element) {
          return;
        }
        clearTransitionStyles();
        if (typeof complete === 'function') {
          complete.apply(element);
        }
      };

      // Enqueue the animation sequence.
      executeOrEnqueue($element, queue, function() {
        const self = this;
        $lib(self).data('motionator', data); // Ensure data is attached.

        // Clear any ongoing transitions before starting a new one.
        clearTransitionStyles();

        // Set the transition styles.
        $lib(self).css(transitionPropName, transitionValue);

        // Apply the target CSS properties.
        // Use a small timeout to ensure the transition property is set before target properties.
        setTimeout(function() {
          $lib(self).css(properties);
        }, 1); // A minimal delay.

        // Attach transition end event listener, or use a timeout fallback.
        if (awaitTransitionEnd && transitionEndEvent) {
          $lib(self).one(transitionEndEvent, onTransitionCompleted);
        }

        // Set a fallback timeout in case the transitionend event doesn't fire.
        data.timerId = setTimeout(function() {
          if (awaitTransitionEnd && transitionEndEvent) {
            // If event was expected, clean up listener.
            $lib(self).off(transitionEndEvent, onTransitionCompleted);
          }
          onTransitionCompleted.apply(self); // Manually trigger completion.
        }, transitionTimeout);
      });
    });

    return targetElements;
  };

  // Add an alias for convenience, similar to the original.
  $lib.fn.motion = $lib.fn.applyMotion;

})(jQuery); // Pass jQuery as $lib to avoid conflicts.