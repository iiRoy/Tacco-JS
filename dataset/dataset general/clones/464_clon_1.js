/*
 * React v0.11.1 - Core Library
 *
 * This file contains the initial setup for the React library,
 * including its UMD (Universal Module Definition) wrapper
 * and a simplified CommonJS-like module loader.
 *
 * The UMD pattern allows React to be used in various environments:
 * - CommonJS (Node.js, Browserify)
 * - AMD (RequireJS)
 * - Global scope (browser window)
 *
 * The internal module loader is a lightweight implementation
 * often used in bundled JavaScript files.
 */
! function(e) {
  // Check if we are in a CommonJS environment
  if (
    "object" == typeof exports &&
    "undefined" != typeof module
  ) {
    // Export the module for CommonJS compatibility
    module.exports = e();
  }
  // Check if we are in an AMD environment
  else if (
    "function" == typeof define &&
    define.amd
  ) {
    // Define the module for AMD compatibility
    define([], e);
  }
  // Otherwise, assume a global environment (e.g., browser window)
  else {
    var f; // Declare a variable 'f' to hold the global object reference
    // Determine the global object: window, global (Node.js-like), or self (Web Workers)
    "undefined" != typeof window ?
      f = window :
      "undefined" != typeof global ?
      f = global :
      "undefined" != typeof self &&
      (f = self);

    // Attach the React library to the determined global object
    f.React = e();
  }
}(
  // The factory function that produces the React library object
  function() {
    var define, module, exports; // Internal variables for the module system

    // This is a simplified module loader (often seen in Browserify bundles)
    return (
      function e(t, n, r) {
        // The internal 'require' function for this bundle
        function s(o, u) {
          // If the module is not yet loaded
          if (
            !n[o]
          ) {
            // If the module definition doesn't exist in the bundle
            if (
              !t[o]
            ) {
              var a = typeof require == "function" && require; // Try to get native 'require'
              if (!u && a)
                return a(o, !0); // Use native 'require' if available and not a "local" module
              if (i)
                return i(o, !0); // Use the bundle's 'require' if available
              // If module cannot be found, throw an error
              throw new Error("Cannot find module '" + o + "'");
            }
            // Initialize the module's exports object
            var f = n[o] = {
              exports: {}
            };
            // Execute the module's code
            t[o][0].call(
              f.exports,
              function(e) {
                var n = t[o][1][e]; // Get the module ID from the mapping
                return s(n ? n : e) // Recursively load dependencies
              },
              f,
              f.exports,
              e,
              t,
              n,
              r
            );
          }
          return n[o].exports; // Return the loaded module's exports
        }
        var i = typeof require == "function" && require; // Reference to native 'require'
        // Load all entry points (initial modules)
        for (var o = 0; o < r.length; o++)
          s(r[o]);
        return s; // Return the internal 'require' function
      }
    )
    (
      // Module definitions object
      {
        1: [
          function(_dereq_, module, exports) {
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
             * @providesModule AutoFocusMixin
             * @typechecks static-only
             *
             * This module provides a mixin for React components
             * that enables automatic focus management.
             */

            "use strict"; // Enforce strict mode for better code quality

            // Dependencies
            var focusNode = _dereq_("./focusNode"); // Helper to focus a DOM node

            /**
             * AutoFocusMixin
             * A mixin that provides auto-focusing capabilities to a component.
             */
            var AutoFocusMixin = {
              /**
               * Invoked once, immediately after the initial rendering of
               * `componentDidMount` occurs.
               * At this point, you can access any DOM element or child
               * component of your component.
               */
              componentDidMount: function() {
                // Check if the autoFocus prop is set to true
                if (
                  this.props.autoFocus
                ) {
                  // If autoFocus is true, focus the component's DOM node
                  focusNode(
                    this.getDOMNode()
                  );
                }
              }
            };

            // Export the AutoFocusMixin for use in other modules
            module.exports = AutoFocusMixin;

          }, {
            "./focusNode": 106
          }
        ],
        2: [
          function(_dereq_, module, exports) {
            /**
             * Copyright 2013 Facebook, Inc.
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
             * @providesModule BeforeInputEventPlugin
             * @typechecks static-only
             *
             * This module implements the BeforeInput event plugin.
             * It synthesizes 'beforeInput' events from native browser events.
             */

            "use strict";

            // Required modules for event handling and environment detection
            var EventConstants = _dereq_("./EventConstants");
            var EventPropagators = _dereq_("./EventPropagators");
            var ExecutionEnvironment = _dereq_("./ExecutionEnvironment");
            var SyntheticInputEvent = _dereq_("./SyntheticInputEvent");

            // Utility to create keys for object properties
            var keyOf = _dereq_("./keyOf");

            /**
             * Determines if the browser supports the native TextInputEvent.
             * This check accounts for browser quirks like Opera <= 12.
             */
            var canUseTextInputEvent = (
              ExecutionEnvironment.canUseDOM &&
              'TextEvent' in window &&
              !(
                'documentMode' in document ||
                isPresto()
              )
            );

            /**
             * Helper function to detect if the browser is Opera Presto engine
             * (versions <= 12). These versions have `TextEvent` but do not
             * fire text input events correctly.
             * @return {boolean} True if it's Opera Presto <= 12.
             */
            function isPresto() {
              var opera = window.opera;
              return (
                typeof opera === 'object' &&
                typeof opera.version === 'function' &&
                parseInt(opera.version(), 10) <= 12
              );
            }

            // Constants for the spacebar key
            var SPACEBAR_CODE = 32;
            var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

            // Access top-level event types from EventConstants
            var topLevelTypes = EventConstants.topLevelTypes;

            /**
             * Definition of event types and their properties for BeforeInputEventPlugin.
             * This includes phased registration names (bubbled/captured) and dependencies
             * on native top-level events.
             */
            var eventTypes = {
              beforeInput: {
                phasedRegistrationNames: {
                  bubbled: keyOf({
                    onBeforeInput: null
                  }),
                  captured: keyOf({
                    onBeforeInputCapture: null
                  })
                },
                dependencies: [
                  topLevelTypes.topCompositionEnd,
                  topLevelTypes.topKeyPress,
                  topLevelTypes.topTextInput,
                  topLevelTypes.topPaste
                ]
              }
            };

            // Variable to track characters inserted via keypress and composition events
            var fallbackChars = null;

            /**
             * Checks if a native keypress event is considered a command (e.g., Ctrl+C).
             * Browsers like Firefox fire `keypress` for commands even when no character
             * is inserted. This helps filter those out.
             * @param {object} nativeEvent The original DOM event.
             * @return {boolean} True if the keypress is a command, false otherwise.
             */
            function isKeypressCommand(nativeEvent) {
              return (
                (
                  nativeEvent.ctrlKey ||
                  nativeEvent.altKey ||
                  nativeEvent.metaKey
                ) &&
                // A special case: ctrlKey && altKey is AltGr, which is not a command.
                !(
                  nativeEvent.ctrlKey &&
                  nativeEvent.altKey
                )
              );
            }

            /**
             * The BeforeInputEventPlugin is responsible for synthesizing
             * `onBeforeInput` events. This event aims to match the W3C spec for
             * Input Events, providing information about characters being inserted
             * *before* they modify the DOM.
             *
             * It primarily relies on the native `textInput` event where available,
             * or falls back to `keypress` and `compositionend` events in other cases.
             */
            var BeforeInputEventPlugin = {

              eventTypes: eventTypes, // Expose the event types defined above

              /**
               * Extracts synthetic events from a native browser event.
               * This is the core logic for generating `beforeInput` events.
               *
               * @param {string} topLevelType The type of the native event (e.g., 'topKeyPress').
               * @param {DOMEventTarget} topLevelTarget The DOM node where the event originated.
               * @param {string} topLevelTargetID The React ID of the target component.
               * @param {object} nativeEvent The original native browser event object.
               * @return {?object} A synthetic event object, or null if no event should be fired.
               */
              extractEvents: function(
                topLevelType,
                topLevelTarget,
                topLevelTargetID,
                nativeEvent
              ) {

                var chars; // Variable to store the characters to be inserted

                // Branch based on whether native textInput event is supported
                if (
                  canUseTextInputEvent
                ) {
                  switch (topLevelType) {
                    case topLevelTypes.topKeyPress:
                      // Special handling for spacebar in Webkit when textInput is available.
                      // Preventing default on textInput for spacebar can cause scrolling.
                      // So, for spacebar, we treat it as if textInput is NOT available.
                      var which = nativeEvent.which;
                      if (which !== SPACEBAR_CODE) {
                        return; // Not a spacebar, and textInput will handle it, so do nothing here.
                      }
                      // For spacebar, extract char from keypress directly.
                      chars = String.fromCharCode(which);
                      break;

                    case topLevelTypes.topTextInput:
                      // For native textInput events, simply use the `data` property.
                      chars = nativeEvent.data;

                      // If the character is a spacebar, it was already handled by keypress.
                      // We bail here to avoid duplicate processing.
                      if (chars === SPACEBAR_CHAR) {
                        return;
                      }

                      // Otherwise, continue processing.
                      break;

                    default:
                      // For any other native event types, we do not generate a beforeInput event.
                      return;
                  }
                } else {
                  // Fallback strategy for browsers without native textInput events.
                  switch (topLevelType) {
                    case topLevelTypes.topPaste:
                      // If a paste event occurs, any previously tracked fallbackChars are invalid.
                      // Paste events should not trigger BeforeInput events directly.
                      fallbackChars = null;
                      break;
                    case topLevelTypes.topKeyPress:
                      // In some browsers (e.g., Firefox), keypress fires for non-character keys
                      // or command combinations. We need to filter these out.
                      if (
                        nativeEvent.which &&
                        !isKeypressCommand(nativeEvent)
                      ) {
                        fallbackChars = String.fromCharCode(nativeEvent.which);
                      }
                      break;
                    case topLevelTypes.topCompositionEnd:
                      // For composition events, the `data` field contains the composed text.
                      fallbackChars = nativeEvent.data;
                      break;
                  }

                  // If no relevant changes to fallbackChars occurred, no event is fired.
                  if (fallbackChars === null) {
                    return;
                  }

                  chars = fallbackChars; // Use the accumulated fallback characters
                }

                // If no characters are being inserted, no BeforeInput event is needed.
                if (
                  !chars
                ) {
                  return;
                }

                // Create a new SyntheticInputEvent instance from the pool.
                var event = SyntheticInputEvent.getPooled(
                  eventTypes.beforeInput, // Event type definition
                  topLevelTargetID, // React ID of the target
                  nativeEvent // Original native event
                );

                // Set the 'data' property of the synthetic event.
                event.data = chars;
                fallbackChars = null; // Reset fallback characters after use.

                // Accumulate two-phase dispatches (bubbling and capturing) for the event.
                EventPropagators.accumulateTwoPhaseDispatches(event);
                return event; // Return the generated synthetic event.
              }
            };

            // Export the BeforeInputEventPlugin.
            module.exports = BeforeInputEventPlugin;

          }, {
            "./EventConstants": 15,
            "./EventPropagators": 20,
            "./ExecutionEnvironment": 21,
            "./SyntheticInputEvent": 86,
            "./keyOf": 127
          }
        ],
        3: [
          function(_dereq_, module, exports) {
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
             * @providesModule CSSProperty
             *
             * This module defines properties related to CSS styling.
             * It includes lists of unitless CSS properties and shorthand expansions.
             */

            "use strict";

            /**
             * `isUnitlessNumber`
             * CSS properties that accept numbers but are not interpreted as "px".
             * For these properties, a number value should be used directly without 'px' suffix.
             */
            var isUnitlessNumber = {
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
             * `prefixKey`
             * Helper function to add a vendor prefix to a CSS property name.
             *
             * @param {string} prefix Vendor-specific prefix (e.g., 'Webkit').
             * @param {string} key The original style name (e.g., 'transitionDuration').
             * @return {string} The prefixed style name (e.g., 'WebkitTransitionDuration').
             */
            function prefixKey(prefix, key) {
              return prefix + key.charAt(0).toUpperCase() + key.substring(1);
            }

            /**
             * `prefixes`
             * List of common vendor prefixes used in CSS.
             * These are used to expand `isUnitlessNumber` to include prefixed versions.
             */
            var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

            // Expand the `isUnitlessNumber` object to include vendor-prefixed versions
            // for broader browser compatibility.
            // Using Object.keys to avoid issues with IE8's for-in loop behavior.
            Object.keys(isUnitlessNumber).forEach(
              function(prop) {
                prefixes.forEach(
                  function(prefix) {
                    isUnitlessNumber[
                      prefixKey(prefix, prop)
                    ] = isUnitlessNumber[prop];
                  }
                );
              }
            );

            /**
             * `shorthandPropertyExpansions`
             * A map of CSS shorthand properties to their individual longhand properties.
             * This is particularly useful for handling browser quirks (e.g., IE8)
             * when unsetting shorthand properties. Instead of setting shorthand to '',
             * we unset each individual component.
             */
            var shorthandPropertyExpansions = {
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

            /**
             * `CSSProperty`
             * An object encapsulating various CSS property definitions and utilities.
             */
            var CSSProperty = {
              isUnitlessNumber: isUnitlessNumber,
              shorthandPropertyExpansions: shorthandPropertyExpansions
            };

            // Export the CSSProperty utility object.
            module.exports = CSSProperty;

          }, {}
        ],
        4: [
          function(_dereq_, module, exports) {
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
             * @providesModule CSSPropertyOperations
             * @typechecks static-only
             *
             * This module provides utilities for manipulating CSS properties
             * on DOM elements, handling serialization and value setting.
             */

            "use strict";

            // Dependencies for CSS property handling
            var CSSProperty = _dereq_("./CSSProperty");

            var dangerousStyleValue = _dereq_("./dangerousStyleValue");
            var hyphenateStyleName = _dereq_("./hyphenateStyleName");
            var memoizeStringOnly = _dereq_("./memoizeStringOnly");

            /**
             * `processStyleName`
             * Memoized function to hyphenate a camelCased CSS style name.
             * This optimizes repeated calls with the same style name.
             */
            var processStyleName = memoizeStringOnly(
              function(styleName) {
                return hyphenateStyleName(styleName);
              }
            );

            /**
             * `CSSPropertyOperations`
             * An object containing methods for working with CSS properties.
             */
            var CSSPropertyOperations = {

              /**
               * `createMarkupForStyles`
               * Serializes a JavaScript style object into a CSS style string
               * suitable for inline HTML attributes (e.g., `style="..."`).
               *
               * @param {object} styles A JavaScript object where keys are
               *                        camelCased CSS property names and values
               *                        are their corresponding CSS values.
               * @return {?string} A semi-colon separated string of CSS declarations,
               *                   or null if the styles object is empty.
               */
              createMarkupForStyles: function(styles) {
                var serialized = ''; // Initialize an empty string for the serialized styles

                // Iterate over each style property in the provided object
                for (var styleName in styles) {
                  // Ensure the property belongs to the styles object itself, not its prototype chain
                  if (!styles.hasOwnProperty(styleName)) {
                    continue;
                  }
                  var styleValue = styles[styleName]; // Get the value of the current style property

                  // If the style value is not null or undefined, process it
                  if (styleValue != null) {
                    // Append the hyphenated property name and a colon
                    serialized += processStyleName(styleName) + ':';
                    // Append the potentially unit-suffixed or special-cased style value
                    serialized += dangerousStyleValue(styleName, styleValue) + ';';
                  }
                }
                // Return the serialized string, or null if it's empty
                return serialized || null;
              },

              /**
               * `setValueForStyles`
               * Directly applies a set of style properties to a DOM node's `style` object.
               * If a value is an empty string, the corresponding style property will be unset.
               *
               * @param {DOMElement} node The DOM element whose styles are to be modified.
               * @param {object} styles A JavaScript object of style properties and values.
               */
              setValueForStyles: function(node, styles) {
                var style = node.style; // Get a reference to the DOM node's style object

                // Iterate over each style property in the provided object
                for (var styleName in styles) {
                  // Ensure the property is directly on the styles object
                  if (!styles.hasOwnProperty(styleName)) {
                    continue;
                  }
                  // Get the processed style value (e.g., adds 'px' for certain numbers)
                  var styleValue = dangerousStyleValue(styleName, styles[styleName]);

                  if (styleValue) {
                    // If there's a valid style value, set it directly
                    style[styleName] = styleValue;
                  } else {
                    // If the styleValue is falsy (e.g., empty string), we need to unset it.
                    // Check if it's a shorthand property that IE8 struggles with.
                    var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
                    if (expansion) {
                      // For shorthand properties, unset each individual component.
                      // This is a workaround for IE8's behavior with shorthand properties.
                      for (var individualStyleName in expansion) {
                        style[individualStyleName] = '';
                      }
                    } else {
                      // For non-shorthand properties, simply set to an empty string to unset.
                      style[styleName] = '';
                    }
                  }
                }
              }

            };

            // Export the CSSPropertyOperations object.
            module.exports = CSSPropertyOperations;

          }, {
            "./CSSProperty": 3,
            "./dangerousStyleValue": 101,
            "./hyphenateStyleName": 118,
            "./memoizeStringOnly": 129
          }
        ],
        5: [
          function(_dereq_, module, exports) {
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
             *
             * This module defines the CallbackQueue class.
             * It manages a queue of callback functions.
             */