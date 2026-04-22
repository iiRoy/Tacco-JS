(function(exportHandler){
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = exportHandler();
  } else if (typeof define === 'function' && define.amd) {
    define(exportHandler);
  } else {
    var globalRef;
    if (typeof window !== 'undefined') {
      globalRef = window;
    } else if (typeof global !== 'undefined') {
      globalRef = global;
    } else if (typeof self !== 'undefined') {
      globalRef = self;
    }
    if (globalRef) {
      globalRef.ComponentKernel = exportHandler();
    }
  }
})(function(){
  var defineModule, exportModule, moduleExports;
  return (function moduleLoader(codeMap, registryMap, requiredModules){
    function requireModule(moduleId, optionalContext){
      if (!registryMap[moduleId]){
        if (!codeMap[moduleId]){
          var dynamicRequire = typeof require === 'function' && require;
          if (!optionalContext && dynamicRequire) {
            return dynamicRequire(moduleId, true);
          }
          if (moduleLoader.internalRequire) {
            return moduleLoader.internalRequire(moduleId, true);
          }
          throw new Error("Missing module: '" + moduleId + "'");
        }
        var moduleEntry = registryMap[moduleId] = { exports: {} };
        codeMap[moduleId][0].call(
          moduleEntry.exports,
          function(dependencyId){
            var resolvedDependency = codeMap[moduleId][1][dependencyId];
            return requireModule(resolvedDependency ? resolvedDependency : dependencyId);
          },
          moduleEntry,
          moduleEntry.exports,
          moduleLoader,
          codeMap,
          registryMap,
          requiredModules
        );
      }
      return registryMap[moduleId].exports;
    }
    var internalModuleResolver = typeof require === 'function' && require;
    for (var k = 0; k < requiredModules.length; k++) {
      requireModule(requiredModules[k]);
    }
    return requireModule(requiredModules[0]);
  })({
    // Module 1: Focus Activation Helper
    1: [function(localRequire, currentModule, moduleExports){
      // Copyright (c) 2013-2014 Facebook, Inc.
      // This source code is licensed under the Apache License, Version 2.0.
      // See the LICENSE file in the root directory for full license information.

      // @module FocusActivationHelper
      // @typechecks static-only

      "use strict";

      /**
       * Provides a mixin to automatically focus a DOM element upon component mount
       * if an 'initialFocus' property is set to true.
       */
      const FocusActivationHelper = {
        /**
         * Lifecycle method invoked immediately after a component is mounted.
         * Checks for an 'initialFocus' prop and attempts to focus the associated DOM node.
         */
        onComponentMount: function() {
          const componentProps = this.properties || this.props; // Allow for different prop naming
          if (componentProps && componentProps.initialFocus) {
            const domNodeAccessor = this.retrieveElementReference || this.getDOMNode;
            if (typeof domNodeAccessor === 'function') {
              const targetNode = domNodeAccessor.call(this);
              if (targetNode && typeof targetNode.focus === 'function') {
                targetNode.focus();
                // Optionally, could add a flag to prevent refocussing or log for debugging.
                // console.log('Attempted to focus element:', targetNode);
              }
            }
          }
        }
      };

      currentModule.exports = FocusActivationHelper;

    },{}],
    // Module 2: Style Property Definitions
    2: [function(localRequire, currentModule, moduleExports){
      // Copyright (c) 2013-2014 Facebook, Inc.
      // This source code is licensed under the Apache License, Version 2.0.
      // See the LICENSE file in the root directory for full license information.

      // @module StylePropertyDefinitions

      "use strict";

      /**
       * A collection of CSS properties that are numeric but do not require
       * a unit suffix (like 'px') when specified in JavaScript style objects.
       */
      const unitlessNumericStyles = {
        columnCount: true,
        fillOpacity: true,
        flex: true,
        flexGrow: true,
        flexShrink: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        widows: true,
        zIndex: true,
        zoom: true
      };

      /**
       * Generates a vendor-prefixed style key from a base key.
       * E.g., ('Webkit', 'transitionDuration') -> 'WebkitTransitionDuration'
       * @param {string} vendorPrefix - The prefix string (e.g., 'Webkit').
       * @param {string} baseKey - The original style key (e.g., 'transitionDuration').
       * @returns {string} The vendor-prefixed and camelCased style key.
       */
      function createVendorKey(vendorPrefix, baseKey) {
        if (!baseKey || baseKey.length === 0) {
          return ''; // Handle edge case for empty baseKey
        }
        const firstChar = baseKey.charAt(0).toUpperCase();
        const restOfString = baseKey.substring(1);
        return vendorPrefix + firstChar + restOfString;
      }

      /**
       * Common vendor prefixes for CSS properties.
       */
      const browserVendorPrefixes = ['Webkit', 'ms', 'Moz', 'O'];

      // Extend the unitlessNumericStyles object to include vendor-prefixed versions
      // of properties that are inherently unitless.
      // Using Object.keys to avoid issues with iterating newly added properties in older IE versions.
      Object.keys(unitlessNumericStyles).forEach(function(propName) {
        browserVendorPrefixes.forEach(function(prefix) {
          const prefixedProp = createVendorKey(prefix, propName);
          unitlessNumericStyles[prefixedProp] = unitlessNumericStyles[propName];
        });
      });

      /**
       * Mapping of CSS shorthand properties to their expanded individual properties.
       * This is primarily used for cross-browser compatibility, especially with IE8,
       * which struggles with unsetting shorthand properties directly.
       */
      const expandedStyleDefinitions = {
        background: {
          backgroundImage: true,
          backgroundPosition: true,
          backgroundRepeat: true,
          backgroundColor: true
        },
        border: {
          borderWidth: true,
          borderStyle: true,
          borderColor: true
        },
        borderBottom: {
          borderBottomWidth: true,
          borderBottomStyle: true,
          borderBottomColor: true
        },
        borderLeft: {
          borderLeftWidth: true,
          borderLeftStyle: true,
          borderLeftColor: true
        },
        borderRight: {
          borderRightWidth: true,
          borderRightStyle: true,
          borderRightColor: true
        },
        borderTop: {
          borderTopWidth: true,
          borderTopStyle: true,
          borderTopColor: true
        },
        font: {
          fontStyle: true,
          fontVariant: true,
          fontWeight: true,
          fontSize: true,
          lineHeight: true,
          fontFamily: true
        }
      };

      const StylePropertyDefinitions = {
        unitlessNumericStyles: unitlessNumericStyles,
        expandedStyleDefinitions: expandedStyleDefinitions
      };

      currentModule.exports = StylePropertyDefinitions;

    },{}],
    // Module 3: Style Manipulation Utilities
    3: [function(localRequire, currentModule, moduleExports){
      // Copyright (c) 2013-2014 Facebook, Inc.
      // This source code is licensed under the Apache License, Version 2.0.
      // See the LICENSE file in the root directory for full license information.

      // @module StyleManipulationUtilities
      // @typechecks static-only

      "use strict";

      const StyleAttributeData = localRequire("./StylePropertyDefinitions"); // Renamed from CSSProperty
      const formatStyleValue = localRequire("./safeStyleValueProcessor"); // Renamed from dangerousStyleValue
      const sanitizeHtmlText = localRequire("./sanitizeHtmlText"); // Renamed from escapeTextForBrowser
      const camelToDashCase = localRequire("./camelToDashCase"); // Renamed from hyphenate
      const memoizeSingleArg = localRequire("./memoizeSingleArg"); // Renamed from memoizeStringOnly

      /**
       * Memoized function to convert a style name to its browser-safe,
       * hyphenated, and escaped form.
       */
      const processStyleNameForBrowser = memoizeSingleArg(function(styleName) {
        return sanitizeHtmlText(camelToDashCase(styleName));
      });

      /**
       * Provides utility functions for handling CSS properties on DOM elements.
       */
      const StyleManipulationUtilities = {

        /**
         * Converts a JavaScript style object into a CSS-compatible inline style string.
         * Example: {width: '200px', height: 0} -> "width:200px;height:0;"
         * Null or undefined values for style properties are ignored.
         *
         * @param {object} styleObject - The object containing style key-value pairs.
         * @returns {?string} A serialized CSS style string, or null if no styles are present.
         */
        generateInlineStyleString: function(styleObject) {
          if (!styleObject) {
            return null; // Early exit for null/undefined input
          }

          let styleSerialization = '';
          const styleKeys = Object.keys(styleObject);

          if (styleKeys.length === 0) {
            return null; // Return null if the object is empty
          }

          for (let i = 0; i < styleKeys.length; i++) {
            const styleKey = styleKeys[i];
            const styleValue = styleObject[styleKey];

            // Only process if the value is not null or undefined
            if (styleValue !== null && styleValue !== undefined) {
              const processedKey = processStyleNameForBrowser(styleKey);
              const formattedValue = formatStyleValue(styleKey, styleValue);
              styleSerialization += `${processedKey}:${formattedValue};`;
            }
          }
          return styleSerialization || null;
        },

        /**
         * Applies a set of styles from an object to a given DOM node.
         * If a style value is an empty string, the corresponding CSS property is unset.
         * Handles IE8-specific issues with shorthand property unsetting.
         *
         * @param {DOMElement} targetNode - The DOM element to apply styles to.
         * @param {object} stylesToApply - An object containing style key-value pairs.
         */
        applyStylesToElement: function(targetNode, stylesToApply) {
          if (!targetNode || !targetNode.style || !stylesToApply) {
            return; // Guard against invalid inputs
          }

          const elementStyle = targetNode.style;
          const styleKeys = Object.keys(stylesToApply);

          for (let i = 0; i < styleKeys.length; i++) {
            const styleKey = styleKeys[i];
            const rawStyleValue = stylesToApply[styleKey];
            const processedStyleValue = formatStyleValue(styleKey, rawStyleValue);

            if (processedStyleValue) {
              elementStyle[styleKey] = processedStyleValue;
            } else {
              // If processedStyleValue is falsy (e.g., empty string), unset the property.
              // Check if it's a shorthand property that needs special handling for IE8.
              const expansionMap = StyleAttributeData.expandedStyleDefinitions[styleKey];
              if (expansionMap) {
                // For shorthand properties that IE8 dislikes unsetting,
                // unset each individual component property.
                for (const individualStyleKey in expansionMap) {
                  if (expansionMap.hasOwnProperty(individualStyleKey)) {
                    elementStyle[individualStyleKey] = '';
                  }
                }
              } else {
                elementStyle[styleKey] = '';
              }
            }
          }
        }
      };

      currentModule.exports = StyleManipulationUtilities;

    },{"./StylePropertyDefinitions":2,"./safeStyleValueProcessor":94,"./sanitizeHtmlText":96,"./camelToDashCase":107,"./memoizeSingleArg":116}],
    // Module 4: Form Interaction Handler
    4: [function(localRequire, currentModule, moduleExports){
      // Copyright (c) 2013-2014 Facebook, Inc.
      // This source code is licensed under the Apache License, Version 2.0.
      // See the LICENSE file in the root directory for full license information.

      // @module FormInteractionHandler

      "use strict";

      const InteractionConstants = localRequire("./InteractionConstants"); // Renamed from EventConstants
      const EventDispatchHub = localRequire("./EventDispatchHub"); // Renamed from EventPluginHub
      const EventPathPropagator = localRequire("./EventPathPropagator"); // Renamed from EventPropagators
      const RuntimeEnvironment = localRequire("./RuntimeEnvironment"); // Renamed from ExecutionEnvironment
      const ComponentUpdates = localRequire("./ComponentUpdates"); // Renamed from ReactUpdates
      const SyntheticBrowserEvent = localRequire("./SyntheticBrowserEvent"); // Renamed from SyntheticEvent

      const isDomEventSupported = localRequire("./isDomEventSupported"); // Renamed from isEventSupported
      const isTextInputElement = localRequire("./isTextInputElement"); // Renamed from isTextInputElement
      const generateUniqueKey = localRequire("./generateUniqueKey"); // Renamed from keyOf

      const domEventCategories = InteractionConstants.topLevelEventNames; // Renamed from topLevelTypes

      const formEventDefinitions = {
        valueChange: { // Renamed from 'change'
          propagationNames: {
            bubble: generateUniqueKey({onValueChange: null}), // Renamed from bubbled
            capture: generateUniqueKey({onValueChangeCapture: null}) // Renamed from captured
          },
          dependentEvents: [
            domEventCategories.onBlur, // Renamed from topLevelTypes.topBlur
            domEventCategories.onChange, // Renamed from topLevelTypes.topChange
            domEventCategories.onClick, // Renamed from topLevelTypes.topClick
            domEventCategories.onFocus, // Renamed from topLevelTypes.topFocus
            domEventCategories.onInput, // Renamed from topLevelTypes.topInput
            domEventCategories.onKeyDown, // Renamed from topLevelTypes.topKeyDown
            domEventCategories.onKeyUp, // Renamed from topLevelTypes.topKeyUp
            domEventCategories.onSelectionChange // Renamed from topLevelTypes.topSelectionChange
          ]
        }
      };

      // --- IE Legacy Shims for `change` event ---
      let currentActiveElement = null;
      let currentActiveElementId = null;
      let currentElementCachedValue = null;
      let originalValuePropertyDescriptor = null; // Stores original property descriptor for value

      /**
       * Determines if the native 'change' event should be used for a given element.
       * This is typically for <select> and file <input> elements.
       * @param {HTMLElement} element - The DOM element to check.
       * @returns {boolean} True if the change event is applicable.
       */
      function isNativeChangeEventApplicable(element) {
        if (!element || !element.nodeName) {
          return false;
        }
        const nodeName = element.nodeName.toUpperCase();
        return (nodeName === 'SELECT' || (nodeName === 'INPUT' && element.type === 'file'));
      }

      let doesChangeEventBubbleNatively = false;
      if (RuntimeEnvironment.isBrowserEnvironment) {
        // Check if the 'change' event bubbles in the current browser.
        // Older IE versions (<= IE8) do not bubble 'change' events.
        const docMode = document.documentMode;
        doesChangeEventBubbleNatively = isDomEventSupported('change') && (
          typeof docMode === 'undefined' || docMode > 8
        );
      }

      /**
       * Dispatches a synthetic change event manually, often used for IE legacy handling.
       * @param {Event} originalEvent - The native DOM event.
       */
      function dispatchSyntheticChangeEvent(originalEvent) {
        const syntheticEvent = SyntheticBrowserEvent.createPooled(
          formEventDefinitions.valueChange,
          currentActiveElementId,
          originalEvent
        );
        EventPathPropagator.accumulateTwoPhaseDispatches(syntheticEvent);

        // Batched updates ensure all event handlers run before the next re-render.
        // This is critical for controlled components and event bubbling.
        ComponentUpdates.batchUpdates(processEventBatch, syntheticEvent);
      }

      /**
       * Processes a batch of events by enqueuing and dispatching them.
       * @param {SyntheticBrowserEvent} eventToProcess - The synthetic event to process.
       */
      function processEventBatch(eventToProcess) {
        EventDispatchHub.enqueueEvents(eventToProcess);
        EventDispatchHub.processEventQueue();
      }

      /**
       * Initiates watching for change events on an element using IE8's attachEvent.
       * @param {HTMLElement} element - The DOM element to watch.
       * @param {string} elementId - The ID of the element.
       */
      function startLegacyChangeEventObservation(element, elementId) {
        currentActiveElement = element;
        currentActiveElementId = elementId;
        if (element && typeof element.attachEvent === 'function') {
          element.attachEvent('onchange', dispatchSyntheticChangeEvent);
        }
      }

      /**
       * Stops watching for change events and cleans up IE8 event listeners.
       */
      function stopLegacyChangeEventObservation() {
        if (!currentActiveElement) {
          return;
        }
        if (typeof currentActiveElement.detachEvent === 'function') {
          currentActiveElement.detachEvent('onchange', dispatchSyntheticChangeEvent);
        }
        currentActiveElement = null;
        currentActiveElementId = null;
      }

      /**
       * Determines the target ID for a change event based on top-level event type.
       * @param {string} type - The top-level event type.
       * @param {HTMLElement} target - The top-level DOM target.
       * @param {string} targetId - The top-level target ID.
       * @returns {string|undefined} The target ID if it's a relevant change event.
       */
      function resolveChangeEventTargetId(type, target, targetId) {
        if (type === domEventCategories.onChange) {
          return targetId;
        }
        return undefined; // Explicitly return undefined
      }

      /**
       * Handles event flow for legacy IE8 change events, particularly focus/blur.
       * @param {string} topEventType - The top-level event type.
       * @param {HTMLElement} topEventTarget - The DOM element that received the event.
       * @param {string} topTargetID - The unique ID of the target element.
       */
      function manageLegacyChangeEventFlow(topEventType, topEventTarget, topTargetID) {
        if (topEventType === domEventCategories.onFocus) {
          // Ensure no previous watch is active, then start a new one.
          stopLegacyChangeEventObservation();
          startLegacyChangeEventObservation(topEventTarget, topTargetID);
        } else if (topEventType === domEventCategories.onBlur) {
          stopLegacyChangeEventObservation();
        }
      }


      // --- IE Legacy Shims for `input` event (propertychange) ---
      let isInputEventSupportedNatively = false;
      if (RuntimeEnvironment.isBrowserEnvironment) {
        // IE9 claims to support input event but it's buggy (doesn't trigger on text deletion).
        // So, we treat IE9 like older IE for input event handling.
        const docMode = document.documentMode;
        isInputEventSupportedNatively = isDomEventSupported('input') && (
          typeof docMode === 'undefined' || docMode > 9
        );
      }

      /**
       * Custom property descriptor for the 'value' property of an active element.
       * This allows us to intercept value changes in legacy IE.
       */
      const customValuePropertyDefinition = {
        get: function() {
          return originalValuePropertyDescriptor.get.call(this);
        },
        set: function(newValue) {
          // Cache the new value as a string for comparison.
          currentElementCachedValue = '' + newValue;
          originalValuePropertyDescriptor.set.call(this, newValue);
        }
      };

      /**
       * Starts tracking 'propertychange' events on an element in legacy IE,
       * overriding its 'value' property to distinguish user input from JS changes.
       * @param {HTMLElement} element - The DOM element to track.
       * @param {string} elementId - The ID of the element.
       */
      function initiateValueTrackingForLegacyInput(element, elementId) {
        currentActiveElement = element;
        currentActiveElementId = elementId;
        currentElementCachedValue = element.value;

        // Store the original 'value' property descriptor before overriding.
        originalValuePropertyDescriptor = Object.getOwnPropertyDescriptor(
          element.constructor.prototype,
          'value'
        );

        // Override the 'value' property.
        Object.defineProperty(currentActiveElement, 'value', customValuePropertyDefinition);

        // Attach 'onpropertychange' listener.
        if (typeof element.attachEvent === 'function') {
          element.attachEvent('onpropertychange', handlePropertyChangeDetection);
        }
      }

      /**
       * Stops tracking value changes and restores the original 'value' property.
       */
      function terminateValueTrackingForLegacyInput() {
        if (!currentActiveElement) {
          return;
        }

        // Restore the original property definition.
        // 'delete' works here because the property was defined on the instance, not prototype.
        delete currentActiveElement.value;
        if (typeof currentActiveElement.detachEvent === 'function') {
          currentActiveElement.detachEvent('onpropertychange', handlePropertyChangeDetection);
        }

        currentActiveElement = null;
        currentActiveElementId = null;
        currentElementCachedValue = null;
        originalValuePropertyDescriptor = null;
      }

      /**
       * Handles a 'propertychange' event in legacy IE. If the 'value' property changes,
       * and the new value is different from the cached value, a synthetic change event is dispatched.
       * @param {Event} nativeEvent - The native 'propertychange' DOM event.
       */
      function handlePropertyChangeDetection(nativeEvent) {
        if (!nativeEvent || nativeEvent.propertyName !== 'value') {
          return;
        }

        const currentSourceElement = nativeEvent.srcElement;
        if (!currentSourceElement) {
          return; // Guard against missing source element
        }

        const latestValue = currentSourceElement.value;
        if (latestValue === currentElementCachedValue) {
          return; // No actual value change relevant to user interaction.
        }

        currentElementCachedValue = latestValue; // Update cached value.
        dispatchSyntheticChangeEvent(nativeEvent);
      }

      /**
       * Returns the target ID if the given event corresponds to an 'input' event
       * that should trigger an abstract change event.
       * @param {string} topEventType - The top-level event type.
       * @param {HTMLElement} topEventTarget - The DOM element that received the event.
       * @param {string} topTargetID - The unique ID of the target element.
       * @returns {string|undefined} The target ID if an input event is relevant.
       */
      function resolveInputEventTargetId(topEventType, topEventTarget, topTargetID) {
        if (topEventType === domEventCategories.onInput) {
          // For modern browsers, the 'input' event directly signals a change.
          return topTargetID;
        }
        return undefined;
      }

      /**
       * Handles events for input elements in legacy IE (IE8 and IE9).
       * This involves starting/stopping value tracking based on focus/blur.
       * @param {string} topEventType - The top-level event type.
       * @param {HTMLElement} topEventTarget - The DOM element that received the event.
       * @param {string} topTargetID - The unique ID of the target element.
       */
      function manageLegacyInputEventFlow(topEventType, topEventTarget, topTargetID) {
        // The original code snippet was cut off here.
        // Based on typical IE legacy patterns, this function would likely
        // manage start/stop tracking of value changes based on focus/blur events.
        // Assuming the intent is similar to handleEventsForChangeEventIE8.

        if (topEventType === domEventCategories.onFocus) {
          // Stop any existing tracking before starting a new one.
          terminateValueTrackingForLegacyInput();
          initiateValueTrackingForLegacyInput(topEventTarget, topTargetID);
        } else if (topEventType === domEventCategories.onBlur) {
          terminateValueTrackingForLegacyInput();
        }
      }

      const FormInteractionHandler = {
        // Public API surfaces, if any, would be exposed here.
        // For a Type III clone, some internal functions might be exposed
        // or made private based on the desired refactoring.
        // This module primarily sets up event handling mechanisms.
        isNativeChangeEventApplicable: isNativeChangeEventApplicable,
        doesChangeEventBubbleNatively: doesChangeEventBubbleNatively,
        isInputEventSupportedNatively: isInputEventSupportedNatively,
        resolveChangeEventTargetId: resolveChangeEventTargetId,
        manageLegacyChangeEventFlow: manageLegacyChangeEventFlow,
        resolveInputEventTargetId: resolveInputEventTargetId,
        manageLegacyInputEventFlow: manageLegacyInputEventFlow,
        formEventDefinitions: formEventDefinitions // Expose the definitions
      };

      currentModule.exports = FormInteractionHandler;

    },{"./InteractionConstants":90,"./EventDispatchHub":97,"./EventPathPropagator":98,"./RuntimeEnvironment":99,"./ComponentUpdates":100,"./SyntheticBrowserEvent":101,"./isDomEventSupported":102,"./isTextInputElement":103,"./generateUniqueKey":104}]
  },{},[1])});