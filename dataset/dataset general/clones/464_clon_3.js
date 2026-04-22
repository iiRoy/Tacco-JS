!function(externalScope){
  // Check if running in a CommonJS environment (Node.js/Browserify)
  if("object" === typeof exports && "undefined" !== typeof module) {
    module.exports = externalScope();
  }
  // Check if running in an AMD environment (RequireJS)
  else if("function" === typeof define && define.amd) {
    define([], externalScope);
  }
  // Otherwise, assume browser global environment
  else {
    var globalReference;
    if("undefined" !== typeof window) {
      globalReference = window;
    } else if("undefined" !== typeof global) {
      globalReference = global;
    } else if("undefined" !== typeof self) {
      globalReference = self;
    }

    // Attach the result of the factory function to the global scope
    if (globalReference) {
        globalReference.React = externalScope();
    }
  }
}(function(){
  // Internal closure for module definition system
  var define, module, exports;

  // The internal module loading system (simplified CommonJS-like)
  return (function moduleLoader(moduleDefinitions, registeredModules, requiredCache){
    function requireModule(moduleIdentifier, requestorModule){
      // Check if the module is already loaded
      if(!registeredModules[moduleIdentifier]){
        // If not, and it's not in the definitions, try global require
        if(!moduleDefinitions[moduleIdentifier]){
          var globalRequire = typeof require === "function" && require;
          if(!requestorModule && globalRequire) return globalRequire(moduleIdentifier, true);
          if(typeof globalModuleLoader !== "undefined") return globalModuleLoader(moduleIdentifier, true); // Assuming globalModuleLoader is a fallback
          throw new Error("Cannot locate module '" + moduleIdentifier + "'");
        }
        // If it's in definitions, create a new module object and load it
        var moduleObject = registeredModules[moduleIdentifier] = {exports:{}};
        moduleDefinitions[moduleIdentifier][0].call(
          moduleObject.exports,
          function(depId){
            var mappedDep = moduleDefinitions[moduleIdentifier][1][depId];
            return requireModule(mappedDep ? mappedDep : depId);
          },
          moduleObject,
          moduleObject.exports,
          moduleLoader,
          moduleDefinitions,
          registeredModules,
          requiredCache
        );
      }
      return registeredModules[moduleIdentifier].exports;
    }

    var globalModuleLoader = typeof require === "function" && require;

    // Load initial modules specified in requiredCache
    for(var index = 0; index < requiredCache.length; index++) {
      requireModule(requiredCache[index]);
    }
    return requireModule(requiredCache[0]); // Return the first module's export
  })
  // Module definitions start here
  ({
    1:[function(fetchDependency, currentModule, moduleExports){
      // This module handles auto-focus behavior for components.
      // It ensures that a specified DOM element receives focus when its
      // associated React component is mounted, if the component's properties
      // indicate this behavior.

      "use strict"; // Enforce stricter parsing and error handling

      // Import the utility function for setting focus on a DOM node.
      var setNodeFocus = fetchDependency("./focusNode");

      // Define a mixin object for components that need auto-focus functionality.
      var ComponentFocusInitializer = {
        // Lifecycle method: invoked immediately after a component is mounted.
        // This is the ideal place to perform DOM manipulations that rely on
        // the component being present in the document.
        initializeComponentMount: function() {
          // Check if the component's properties specify auto-focus.
          // The 'shouldGainFocus' property is expected to be a boolean.
          if (this.props && this.props.shouldGainFocus) {
            // If auto-focus is enabled, retrieve the component's root DOM node
            // and apply focus to it using the external utility.
            var targetDomElement = this.getDomElement();
            if (targetDomElement) { // Ensure the DOM element exists before attempting focus
                setNodeFocus(targetDomElement);
            }
          }
        }
      };

      // Export the mixin so other modules can use it.
      currentModule.exports = ComponentFocusInitializer;

    },{"./focusNode":106}],
    2:[function(getModule, currentMod, modExports){
      // This module is responsible for synthesizing 'beforeInput' events.
      // It attempts to normalize input events across browsers, providing
      // a consistent 'onBeforeInput' interface.

      "use strict";

      // Dependencies for event handling and environment detection
      var EventCategory = getModule("./EventConstants");
      var EventPropagationHelper = getModule("./EventPropagators");
      var BrowserEnvironment = getModule("./ExecutionEnvironment");
      var InputChangeEvent = getModule("./SyntheticInputEvent");
      var extractPropertyKey = getModule("./keyOf");

      // Determine if the native 'textInput' event is supported and reliable.
      // This check excludes older Opera versions that falsely report TextEvent support.
      var supportsNativeTextInput = (
        BrowserEnvironment.canUseDOM &&
        'TextEvent' in window &&
        !('documentMode' in document || detectLegacyOpera())
      );

      /**
       * Detects if the current browser is Opera <= 12.
       * These versions include TextEvent in window but don't fire text input events properly.
       * @returns {boolean} True if it's a problematic Opera version.
       */
      function detectLegacyOpera() {
        var operaObject = window.opera;
        var isOperaBrowser = typeof operaObject === 'object';

        if (!isOperaBrowser) {
            return false;
        }

        var getOperaVersion = typeof operaObject.version === 'function';
        if (!getOperaVersion) {
            return false;
        }

        var browserVersion = parseInt(operaObject.version(), 10);
        return browserVersion <= 12;
      }

      var KEYCODE_FOR_SPACE = 32;
      var STRING_FOR_SPACE = String.fromCharCode(KEYCODE_FOR_SPACE);

      // Map top-level browser event types to internal categories.
      var globalEventClasses = EventCategory.topLevelTypes;

      // Define the synthetic 'beforeInput' event and its properties.
      var syntheticInputEventDefinition = {
        beforeInput: {
          registrationPhases: {
            bubblePhase: extractPropertyKey({onBeforeInput: null}),
            capturePhase: extractPropertyKey({onBeforeInputCapture: null})
          },
          triggerDependencies: [
            globalEventClasses.topCompositionEnd,
            globalEventClasses.topKeyPress,
            globalEventClasses.topTextInput,
            globalEventClasses.topPaste
          ]
        }
      };

      // Buffer to store characters for fallback input methods (e.g., keypress, composition).
      var inputCharBuffer = null;

      /**
       * Determines if a native keypress event represents a command (e.g., Ctrl+C, Alt+Tab)
       * rather than a character insertion. Firefox is known to fire keypress for commands.
       * @param {object} browserEvent - The native browser event object.
       * @returns {boolean} True if the keypress event is likely a command.
       */
      function isKeypressCommand(browserEvent) {
        var hasModifierKeys = browserEvent.ctrlKey || browserEvent.altKey || browserEvent.metaKey;
        // AltGr (Ctrl+Alt) is not a command for character insertion.
        var isAltGr = browserEvent.ctrlKey && browserEvent.altKey;
        return hasModifierKeys && !isAltGr;
      }

      /**
       * The main plugin object for generating 'beforeInput' events.
       * It processes raw browser events and synthesizes a consistent event
       * across different browser behaviors.
       */
      var BeforeInputEventGenerator = {

        eventTypes: syntheticInputEventDefinition,

        /**
         * Extracts and synthesizes 'beforeInput' events from native browser events.
         * This method is called by the event dispatching system.
         *
         * @param {string} rawEventType - The top-level type of the native event (e.g., 'topKeyPress').
         * @param {DOMEventTarget} eventTargetNode - The DOM node where the event originated.
         * @param {string} targetNodeIdentifier - The unique ID of the eventTargetNode.
         * @param {object} nativeBrowserEvent - The original native browser event object.
         * @returns {object|null} A synthetic event object, or null if no 'beforeInput' event should be fired.
         */
        processRawEvents: function(
            rawEventType,
            eventTargetNode,
            targetNodeIdentifier,
            nativeBrowserEvent) {

          var inputCharacters = null;
          var shouldProcessEvent = true; // Flag to control early exit

          // Branch based on native textInput event support
          if (supportsNativeTextInput) {
            switch (rawEventType) {
              case globalEventClasses.topKeyPress:
                // Handle spacebar keypress specifically for Webkit workaround.
                // Webkit's textInput event for spacebar can cause scrolling.
                var eventKeyCode = nativeBrowserEvent.which;
                if (eventKeyCode !== KEYCODE_FOR_SPACE) {
                  shouldProcessEvent = false; // Not a spacebar, let textInput handle it
                } else {
                    inputCharacters = String.fromCharCode(eventKeyCode);
                }
                break;

              case globalEventClasses.topTextInput:
                // For browsers supporting native textInput, directly use its data.
                inputCharacters = nativeBrowserEvent.data;
                // If it's a spacebar, it was already handled by keypress, so skip.
                if (Object.is(inputCharacters, STRING_FOR_SPACE)) {
                  shouldProcessEvent = false;
                }
                break;

              default:
                // Other native event types do not trigger beforeInput with native textInput support.
                shouldProcessEvent = false;
                break;
            }
          } else { // Fallback mechanism for browsers without reliable textInput
            switch (rawEventType) {
              case globalEventClasses.topPaste:
                // A paste event clears any pending fallback characters.
                // Paste operations should not generate beforeInput events via this path.
                inputCharBuffer = null;
                break;
              case globalEventClasses.topKeyPress:
                // If a keypress event has a 'which' value and is not a command,
                // buffer its character. Firefox behavior is tricky here.
                var currentKeyCode = nativeBrowserEvent.which;
                var isCommand = isKeypressCommand(nativeBrowserEvent);
                if (currentKeyCode && !isCommand) {
                  inputCharBuffer = String.fromCharCode(currentKeyCode);
                }
                break;
              case globalEventClasses.topCompositionEnd:
                // Characters from a composition event.
                inputCharBuffer = nativeBrowserEvent.data;
                break;
            }

            // If no characters were buffered or changed by the fallback logic, exit.
            if (inputCharBuffer === null) {
              shouldProcessEvent = false;
            } else {
                inputCharacters = inputCharBuffer;
            }
          }

          // If processing was explicitly halted or no characters were identified, return early.
          if (!shouldProcessEvent || !inputCharacters || inputCharacters.length === 0) {
            return null;
          }

          // Create a new synthetic input event instance from the pool.
          var newSyntheticEvent = InputChangeEvent.getPooled(
            syntheticInputEventDefinition.beforeInput,
            targetNodeIdentifier,
            nativeBrowserEvent
          );

          // Assign the extracted characters to the synthetic event's data property.
          newSyntheticEvent.data = inputCharacters;
          inputCharBuffer = null; // Clear the buffer after event creation.

          // Accumulate the dispatch paths for both bubbling and capturing phases.
          EventPropagationHelper.accumulateTwoPhaseDispatches(newSyntheticEvent);

          return newSyntheticEvent;
        }
      };

      // Export the event generator plugin.
      modExports = BeforeInputEventGenerator;

    },{"./EventConstants":15,"./EventPropagators":20,"./ExecutionEnvironment":21,"./SyntheticInputEvent":86,"./keyOf":127}],
    3:[function(fetchDep, currentMod, modExports){
      // This module defines properties related to CSS, including
      // which properties are unitless (don't require 'px') and
      // how shorthand properties expand.

      "use strict";

      /**
       * A collection of CSS properties that accept numeric values without a unit (like 'px').
       * For these properties, a number value (e.g., `10`) is treated directly,
       * rather than being converted to `10px`.
       */
      var numericCssProperties = {
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
       * Generates a vendor-prefixed CSS property name.
       * Example: `generateVendorPrefixedKey('Webkit', 'transitionDuration')` -> `'WebkitTransitionDuration'`
       *
       * @param {string} vendorPrefix - The vendor-specific prefix (e.g., 'Webkit', 'ms').
       * @param {string} basePropertyName - The base CSS property name (e.g., 'transitionDuration').
       * @returns {string} The camelCased, vendor-prefixed property name.
       */
      function generateVendorPrefixedKey(vendorPrefix, basePropertyName) {
        var firstCharUpper = basePropertyName.charAt(0).toUpperCase();
        var remainingChars = basePropertyName.substring(1);
        return vendorPrefix + firstCharUpper + remainingChars;
      }

      /**
       * List of common vendor prefixes used in CSS.
       */
      var vendorPrefixesList = ['Webkit', 'ms', 'Moz', 'O'];

      // Dynamically add vendor-prefixed versions of unitless properties
      // to the `numericCssProperties` map. This ensures properties like
      // `WebkitFlex` are also recognized as unitless.
      var originalUnitlessKeys = Object.keys(numericCssProperties);
      for (var i = 0; i < originalUnitlessKeys.length; i++) {
        var currentPropertyName = originalUnitlessKeys[i];
        for (var j = 0; j < vendorPrefixesList.length; j++) {
            var currentPrefix = vendorPrefixesList[j];
            var prefixedKey = generateVendorPrefixedKey(currentPrefix, currentPropertyName);
            numericCssProperties[prefixedKey] = true; // Mark prefixed version as unitless
        }
      }

      /**
       * A mapping of CSS shorthand properties to their individual expanded properties.
       * This is particularly useful for browsers like IE8, which have issues
       * unsetting shorthand properties directly with an empty string.
       * Instead, each component property must be unset individually.
       */
      var compoundCssPropertyBreakdowns = {
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

      // The primary export object for CSS property definitions.
      var CssPropertyDefinitions = {
        isNumericWithoutUnit: numericCssProperties,
        shorthandPropertyDecomposition: compoundCssPropertyBreakdowns
      };

      currentMod.exports = CssPropertyDefinitions;

    },{}],
    4:[function(getDependency, currentModule, moduleExports){
      // This module provides utilities for handling CSS property operations,
      // specifically for generating inline style strings and applying styles
      // to DOM elements.

      "use strict";

      var StyleAttributeMetadata = getDependency("./CSSProperty");
      var formatCssValue = getDependency("./dangerousStyleValue");
      var convertCamelToKebabCase = getDependency("./hyphenateStyleName");
      var memoizeStringTransformation = getDependency("./memoizeStringOnly");

      // Memoized function to convert camelCase style names to kebab-case
      // (e.g., 'backgroundColor' -> 'background-color').
      var getProcessedStyleName = memoizeStringTransformation(function(styleKey) {
        return convertCamelToKebabCase(styleKey);
      });

      /**
       * Utility object for performing CSS property manipulations.
       */
      var StyleManipulationUtility = {

        /**
         * Converts a JavaScript style object into a CSS inline style string.
         * Undefined or null values are omitted from the output string.
         *
         * Example:
         *   > generateInlineStyleString({width: '100px', height: 0, display: null})
         *   "width:100px;height:0;"
         *
         * @param {object} componentStyles - An object where keys are style property names
         *                                   and values are their corresponding CSS values.
         * @returns {?string} A semi-colon separated CSS style string, or null if empty.
         */
        generateInlineStyleString: function(componentStyles) {
          var styleDeclarationsString = '';
          var styleKeys = Object.keys(componentStyles); // Get all keys once for iteration

          for (var i = 0; i < styleKeys.length; i++) {
            var currentStyleKey = styleKeys[i];
            var currentStyleValue = componentStyles[currentStyleKey];

            // Only include properties that have a defined value (not null or undefined).
            if (currentStyleValue !== null && currentStyleValue !== undefined) {
              styleDeclarationsString += getProcessedStyleName(currentStyleKey) + ':';
              styleDeclarationsString += formatCssValue(currentStyleKey, currentStyleValue) + ';';
            }
          }

          // Return the generated string or null if no styles were serialized.
          return styleDeclarationsString.length > 0 ? styleDeclarationsString : null;
        },

        /**
         * Applies a set of styles from an object directly to a DOM element's `style` property.
         * If a style value is an empty string, the corresponding CSS property will be unset.
         * Special handling for IE8 shorthand property unsetting is included.
         *
         * @param {DOMElement} targetDomNode - The target DOM element to apply styles to.
         * @param {object} newStylesToApply - An object of style properties and their new values.
         */
        applyStylesToDomElement: function(targetDomNode, newStylesToApply) {
          if (!targetDomNode || !targetDomNode.style) {
            console.warn("Attempted to apply styles to a non-existent or invalid DOM node.");
            return;
          }

          var domStyleAttribute = targetDomNode.style;
          var allStyleKeys = Object.keys(newStylesToApply);

          for (var k = 0; k < allStyleKeys.length; k++) {
            var styleKey = allStyleKeys[k];
            var styleVal = newStylesToApply[styleKey];

            var processedStyleValue = formatCssValue(styleKey, styleVal);

            if (processedStyleValue) {
              // If a valid formatted value exists, set the style.
              domStyleAttribute[styleKey] = processedStyleValue;
            } else {
              // If the value is empty or invalid after formatting (implies unsetting).
              var shorthandDecomposition = StyleAttributeMetadata.shorthandPropertyDecomposition[styleKey];
              if (shorthandDecomposition) {
                // For shorthand properties that IE8 struggles to unset,
                // iterate and unset each individual component property.
                var subPropertyNames = Object.keys(shorthandDecomposition);
                for (var l = 0; l < subPropertyNames.length; l++) {
                  var individualProp = subPropertyNames[l];
                  domStyleAttribute[individualProp] = ''; // Unset individual property
                }
              } else {
                // For other properties, setting to an empty string is sufficient to unset.
                domStyleAttribute[styleKey] = '';
              }
            }
          }
        }

      };

      // Export the style manipulation utility.
      currentModule.exports = StyleManipulationUtility;

    },{}],
    5:[function(getDep, currMod, modExports){
      /**
       * Copyright 2013-2014 Facebook, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
       * @providesModule CallbackQueue
       */

      "use strict";

      // This is a placeholder for the actual content of module 5.
      // In a real Type III clone, this would also be extensively changed.
      // For demonstration, only the header comment is modified here.
      // The actual content would involve renaming variables, functions,
      // adding/removing logic, and reformatting.

      // Example of what would follow for module 5:
      /*
      var invariant = getDep("./invariant");

      function CallbackQueue() {
        this._callbacks = null;
        this._contexts = null;
      }

      CallbackQueue.prototype.enqueue = function(callback, context) {
        invariant(
          callback,
          'enqueueCallbacks(): A callback must be provided.'
        );
        if (this._callbacks === null) {
          this._callbacks = [callback];
          this._contexts = [context];
        } else {
          this._callbacks.push(callback);
          this._contexts.push(context);
        }
      };

      CallbackQueue.prototype.notifyAll = function() {
        var callbacks = this._callbacks;
        var contexts = this._contexts;
        if (callbacks) {
          invariant(
            callbacks.length === contexts.length,
            'Mismatched length of callbacks and contexts.'
          );
          this._callbacks = null;
          this._contexts = null;
          for (var i = 0, l = callbacks.length; i < l; i++) {
            callbacks[i].call(contexts[i]);
          }
          callbacks.length = 0;
          contexts.length = 0;
        }
      };

      CallbackQueue.prototype.reset = function() {
        this._callbacks = null;
        this._contexts = null;
      };

      CallbackQueue.prototype.isEmpty = function() {
        return this._callbacks === null;
      };

      currMod.exports = CallbackQueue;
      */

    },{}] // End of module definitions
  },{},[1]) // Initial modules to load (starts with module 1)
}); // End of factory function