/**
 * React v0.9.0 - Cloned for Type I Analysis
 *
 * This file is a Type I clone of the original React v0.9.0 source.
 * Only whitespace and comments have been modified.
 * All functional code, variable names, and expressions are identical.
 */
! function (e) {
    // Check for CommonJS environment (Node.js)
    if ("object" == typeof exports) {
        module.exports = e();
    }
    // Check for AMD environment (RequireJS)
    else if ("function" == typeof define && define.amd) {
        define(e);
    }
    // Fallback to browser global scope
    else {
        var f;
        // Determine the global object based on environment
        if ("undefined" != typeof window) {
            f = window;
        } else if ("undefined" != typeof global) {
            f = global;
        } else if ("undefined" != typeof self) {
            f = self;
        }
        // Assign the React library to the determined global object
        f.React = e();
    }
}(function () {
    // Define `define`, `module`, `exports` for browserify compatibility
    var define, module, exports;

    // This is the browserify boilerplate for bundling modules.
    // It creates a module loader `s` and then loads the entry point.
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    throw new Error("Cannot find module '" + o + "'");
                }
                var f = n[o] = {
                    exports: {}
                };
                t[o][0].call(f.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, f, f.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })({
        1: [function (require, module, exports) {
            /**
             * Copyright (c) 2013-2014 Facebook, Inc. (http://www.facebook.com)
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
             * This module provides a mixin for components that need to automatically
             * receive focus when mounted.
             */

            "use strict"; // Enforce strict mode for better code quality and error handling.

            /**
             * AutoFocusMixin is a simple mixin that provides a componentDidMount
             * lifecycle method to automatically focus a DOM node if `autoFocus`
             * prop is set to true.
             */
            var AutoFocusMixin = {

                /**
                 * Invoked once, immediately after the initial rendering of the component.
                 * At this point, you can access any DOM element or child component.
                 */
                componentDidMount: function () {
                    // Check if the autoFocus prop is enabled for this component instance.
                    if (this.props.autoFocus) {
                        // If autoFocus is true, attempt to focus the underlying DOM node.
                        this.getDOMNode().focus();
                    }
                }
            };

            // Export the AutoFocusMixin for use by other modules.
            module.exports = AutoFocusMixin;

        }, {}],
        2: [function (require, module, exports) {
            /**
             * Copyright (c) 2013-2014 Facebook, Inc. (http://www.facebook.com)
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
             */

            "use strict"; // Enable strict JavaScript mode.

            /**
             * CSS properties that accept numbers as values but are not
             * automatically appended with "px" (pixel) units by React.
             * These are typically properties like `opacity`, `zIndex`, `flex`, etc.
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
             * Prepends a vendor-specific prefix to a CSS property key,
             * converting it to camelCase if necessary.
             *
             * @param {string} prefix The vendor prefix (e.g., 'Webkit', 'Moz').
             * @param {string} key The original style name (e.g., 'transitionDuration').
             * @return {string} The prefixed and camelCased style name (e.g., 'WebkitTransitionDuration').
             */
            function prefixKey(prefix, key) {
                // Capitalize the first letter of the key and concatenate with the prefix.
                return prefix + key.charAt(0).toUpperCase() + key.substring(1);
            }

            /**
             * An array of common vendor prefixes used in CSS.
             * These are applied to `isUnitlessNumber` properties to support
             * various browser implementations.
             */
            var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

            // Iterates over the `isUnitlessNumber` properties and adds
            // vendor-prefixed versions to the map. This is crucial for cross-browser
            // compatibility, especially for older IE versions.
            // Using Object.keys here prevents an infinite loop in IE8 when
            // iterating over newly added properties.
            Object.keys(isUnitlessNumber).forEach(function (prop) {
                prefixes.forEach(function (prefix) {
                    // For each unitless property, add its prefixed version to the map.
                    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
                });
            });

            /**
             * Defines expansions for shorthand CSS properties.
             * In some browsers (notably IE8), directly unsetting shorthand properties
             * (e.g., `node.style.background = ''`) can cause issues.
             * For such cases, React expands the shorthand into its individual
             * longhand properties and unsets each one separately.
             * The 4-value 'clock' properties (margin, padding, border-width)
             * and `list-style` generally behave correctly.
             *
             * @see http://bugs.jquery.com/ticket/12385 for more context.
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
             * The main CSSProperty object, exposing utilities for handling CSS properties.
             */
            var CSSProperty = {
                isUnitlessNumber: isUnitlessNumber,
                shorthandPropertyExpansions: shorthandPropertyExpansions
            };

            // Export the CSSProperty utility module.
            module.exports = CSSProperty;

        }, {}],
        3: [function (require, module, exports) {
            /**
             * Copyright (c) 2013-2014 Facebook, Inc. (http://www.facebook.com)
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
             * This module provides utilities for manipulating CSS properties on DOM elements.
             */

            "use strict"; // Enforce strict mode for cleaner code.

            // Import necessary modules for CSS property handling.
            var CSSProperty = require("./CSSProperty"); // Provides `isUnitlessNumber` and `shorthandPropertyExpansions`.

            var dangerousStyleValue = require("./dangerousStyleValue"); // Handles special casing of style values (e.g., 'px' suffix).
            var escapeTextForBrowser = require("./escapeTextForBrowser"); // Escapes text for safe browser rendering.
            var hyphenate = require("./hyphenate"); // Converts camelCase to kebab-case (e.g., 'fontSize' -> 'font-size').
            var memoizeStringOnly = require("./memoizeStringOnly"); // Caches results for string inputs.

            /**
             * Memoized function to process style names for browser compatibility.
             * It hyphenates the style name (e.g., 'backgroundColor' -> 'background-color')
             * and then escapes it for safe use in CSS.
             */
            var processStyleName = memoizeStringOnly(function (styleName) {
                return escapeTextForBrowser(hyphenate(styleName));
            });

            /**
             * CSSPropertyOperations provides methods to serialize and apply CSS styles.
             */
            var CSSPropertyOperations = {

                /**
                 * Serializes a JavaScript style object into a CSS style string,
                 * suitable for use as an inline `style` attribute value.
                 *
                 * Example:
                 *   `createMarkupForStyles({width: '200px', height: 0})`
                 *   returns `"width:200px;height:0;"`
                 *
                 * Undefined or null style values are ignored during serialization.
                 *
                 * @param {object} styles A mapping of style property names to their values.
                 * @return {?string} The serialized CSS style string, or null if no styles are present.
                 */
                createMarkupForStyles: function (styles) {
                    var serialized = ''; // Initialize an empty string for the serialized styles.
                    for (var styleName in styles) {
                        // Iterate over each property in the styles object.
                        if (!styles.hasOwnProperty(styleName)) {
                            // Ensure we only process own properties, not inherited ones.
                            continue;
                        }
                        var styleValue = styles[styleName]; // Get the value for the current style property.
                        if (styleValue != null) {
                            // Only process non-null and non-undefined style values.
                            serialized += processStyleName(styleName) + ':'; // Append processed style name and a colon.
                            serialized += dangerousStyleValue(styleName, styleValue) + ';'; // Append processed style value and a semicolon.
                        }
                    }
                    return serialized || null; // Return the serialized string or null if empty.
                },

                /**
                 * Sets multiple style properties on a given DOM node.
                 * If a style value is an empty string (`''`), the corresponding style
                 * property will be unset (cleared). This method handles browser-specific
                 * quirks, especially for IE8 with shorthand properties.
                 *
                 * @param {DOMElement} node The DOM element to apply styles to.
                 * @param {object} styles A mapping of style property names to their values.
                 */
                setValueForStyles: function (node, styles) {
                    var style = node.style; // Get the style object of the DOM node.
                    for (var styleName in styles) {
                        // Iterate through the provided styles.
                        if (!styles.hasOwnProperty(styleName)) {
                            // Skip inherited properties.
                            continue;
                        }
                        var styleValue = dangerousStyleValue(styleName, styles[styleName]); // Process the style value.
                        if (styleValue) {
                            // If the processed style value is not empty/falsy, apply it.
                            style[styleName] = styleValue;
                        } else {
                            // If the styleValue is empty (meaning the property should be unset).
                            var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
                            if (expansion) {
                                // This is a shorthand property that IE8 might not like unsetting directly.
                                // So, we expand it and unset each individual component property.
                                for (var individualStyleName in expansion) {
                                    // Iterate over the longhand properties within the shorthand expansion.
                                    style[individualStyleName] = ''; // Unset each individual style.
                                }
                            } else {
                                // It's a non-shorthand property or a shorthand that behaves well.
                                style[styleName] = ''; // Directly unset the property.
                            }
                        }
                    }
                }

            };

            // Export the CSSPropertyOperations utility module.
            module.exports = CSSPropertyOperations;

        }, {
            "./CSSProperty": 2,
            "./dangerousStyleValue": 94,
            "./escapeTextForBrowser": 96,
            "./hyphenate": 107,
            "./memoizeStringOnly": 116
        }],
        4: [function (require, module, exports) {
            /**
             * Copyright (c) 2013-2014 Facebook, Inc. (http://www.facebook.com)
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
             * @providesModule ChangeEventPlugin
             *
             * This plugin is responsible for normalizing `change` events across browsers,
             * especially for IE8/9 which have peculiar behavior.
             */

            "use strict"; // Enable strict mode.

            // Import core event system utilities.
            var EventConstants = require("./EventConstants"); // Defines top-level event types.
            var EventPluginHub = require("./EventPluginHub"); // Manages event dispatching.
            var EventPropagators = require("./EventPropagators"); // Handles event bubbling/capturing.
            var ExecutionEnvironment = require("./ExecutionEnvironment"); // Detects browser environment capabilities.
            var ReactUpdates = require("./ReactUpdates"); // Manages batched updates.
            var SyntheticEvent = require("./SyntheticEvent"); // Base class for synthetic events.

            // Import browser-specific utilities.
            var isEventSupported = require("./isEventSupported"); // Checks if a native event is supported.
            var isTextInputElement = require("./isTextInputElement"); // Checks if an element is a text input.
            var keyOf = require("./keyOf"); // Utility for creating unique keys.

            var topLevelTypes = EventConstants.topLevelTypes; // Convenient access to top-level event type constants.

            /**
             * Definition of the 'change' synthetic event.
             * Specifies its phased registration names (bubbled and captured)
             * and the native browser events it depends on.
             */
            var eventTypes = {
                change: {
                    phasedRegistrationNames: {
                        bubbled: keyOf({
                            onChange: null
                        }), // For event bubbling phase.
                        captured: keyOf({
                            onChangeCapture: null
                        }) // For event capturing phase.
                    },
                    dependencies: [
                        topLevelTypes.topBlur,
                        topLevelTypes.topChange,
                        topLevelTypes.topClick,
                        topLevelTypes.topFocus,
                        topLevelTypes.topInput,
                        topLevelTypes.topKeyDown,
                        topLevelTypes.topKeyUp,
                        topLevelTypes.topSelectionChange
                    ]
                }
            };

            /**
             * SECTION: Variables for IE shims related to active element tracking.
             * These variables help manage the state of the currently focused element
             * for IE-specific change event handling.
             */
            var activeElement = null; // Currently tracked DOM element.
            var activeElementID = null; // ID of the currently tracked DOM element.
            var activeElementValue = null; // Value of the currently tracked DOM element.
            var activeElementValueProp = null; // Descriptor for the 'value' property.

            /**
             * SECTION: Logic for handling the `change` event.
             * This section focuses on detecting and dispatching change events
             * consistently across different browser behaviors.
             */

            /**
             * Determines if a given element should trigger a change event
             * based on its type (e.g., SELECT or file INPUT).
             *
             * @param {DOMElement} elem The DOM element to check.
             * @return {boolean} True if the element should use the change event logic.
             */
            function shouldUseChangeEvent(elem) {
                return (
                    elem.nodeName === 'SELECT' || // Standard change event for SELECT elements.
                    (elem.nodeName === 'INPUT' && elem.type === 'file') // Standard change event for file input elements.
                );
            }

            /**
             * Flag indicating whether the native 'change' event bubbles up the DOM tree.
             * This is typically true in modern browsers but not in older IE.
             */
            var doesChangeEventBubble = false;
            if (ExecutionEnvironment.canUseDOM) {
                // Check if the DOM is available to perform feature detection.
                // The `handleChange` comment in the original code refers to this logic.
                doesChangeEventBubble = isEventSupported('change') && (
                    !('documentMode' in document) || document.documentMode > 8 // Exclude IE8 and below from bubbling detection.
                );
            }

            /**
             * Manually dispatches a synthetic change event.
             * This is used when the native 'change' event does not bubble or is
             * not reliably triggered, requiring custom event tracking.
             *
             * @param {object} nativeEvent The underlying browser event.
             */
            function manualDispatchChangeEvent(nativeEvent) {
                var event = SyntheticEvent.getPooled(
                    eventTypes.change, // The synthetic event type.
                    activeElementID, // The React ID of the target element.
                    nativeEvent // The original native event.
                );
                EventPropagators.accumulateTwoPhaseDispatches(event); // Prepare event for bubbling and capturing phases.

                // Explanation for batching:
                // If 'change' and 'propertychange' events bubbled reliably, we'd simply
                // bind to them through React's top-level event system. Since they don't,
                // we manually listen and enqueue the abstract event.
                //
                // Batching `ReactUpdates.batchedUpdates` is crucial here. It ensures that
                // all event handlers (including those on ancestor elements) run before
                // React performs its next re-render cycle. Without batching, controlled
                // components might not work correctly, as the component could re-render
                // and revert its value before all change handlers have executed.
                // See: https://github.com/facebook/react/issues/708.
                ReactUpdates.batchedUpdates(runEventInBatch, event);
            }

            /**
             * Enqueues and processes an event within a batch update.
             *
             * @param {SyntheticEvent} event The synthetic event to process.
             */
            function runEventInBatch(event) {
                EventPluginHub.enqueueEvents(event); // Add the event to the queue.
                EventPluginHub.processEventQueue(); // Process all events in the queue.
            }

            /**
             * Starts monitoring change events for a given target element in IE8.
             * This involves attaching an `onchange` event listener directly.
             *
             * @param {DOMElement} target The DOM element to watch.
             * @param {string} targetID The React ID of the target element.
             */
            function startWatchingForChangeEventIE8(target, targetID) {
                activeElement = target; // Store the target element.
                activeElementID = targetID; // Store its ID.
                activeElement.attachEvent('onchange', manualDispatchChangeEvent); // Attach the IE-specific event listener.
            }

            /**
             * Stops monitoring change events for the currently tracked element in IE8.
             * Cleans up references and detaches the event listener.
             */
            function stopWatchingForChangeEventIE8() {
                if (!activeElement) {
                    // If no element is being watched, do nothing.
                    return;
                }
                activeElement.detachEvent('onchange', manualDispatchChangeEvent); // Detach the event listener.
                activeElement = null; // Clear the element reference.
                activeElementID = null; // Clear the ID reference.
            }

            /**
             * Returns the React ID of the target element if a change event
             * should be fired based on the top-level event type.
             *
             * @param {string} topLevelType The top-level native event type.
             * @param {DOMElement} topLevelTarget The native DOM target.
             * @param {string} topLevelTargetID The React ID of the native DOM target.
             * @return {?string} The targetID if a change event is indicated, otherwise null.
             */
            function getTargetIDForChangeEvent(
                topLevelType,
                topLevelTarget,
                topLevelTargetID
            ) {
                if (topLevelType === topLevelTypes.topChange) {
                    // If the top-level event is a native 'change', return its ID.
                    return topLevelTargetID;
                }
                return null; // No change event indicated by this top-level type.
            }

            /**
             * Handles focus and blur events for IE8 to manage the tracking
             * of change events.
             *
             * @param {string} topLevelType The top-level native event type.
             * @param {DOMElement} topLevelTarget The native DOM target.
             * @param {string} topLevelTargetID The React ID of the native DOM target.
             */
            function handleEventsForChangeEventIE8(
                topLevelType,
                topLevelTarget,
                topLevelTargetID
            ) {
                if (topLevelType === topLevelTypes.topFocus) {
                    // On focus, start watching the element for changes.
                    // stopWatching() is called as a safeguard, though it should be a no-op
                    // if blur events are correctly handled.
                    stopWatchingForChangeEventIE8();
                    startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
                } else if (topLevelType === topLevelTypes.topBlur) {
                    // On blur, stop watching the element.
                    stopWatchingForChangeEventIE8();
                }
            }


            /**
             * SECTION: Logic for handling the `input` event.
             * This section focuses on detecting and dispatching changes for
             * text input elements, especially considering IE's `propertychange` event.
             */

            /**
             * Flag indicating whether the native 'input' event is supported and reliable.
             * IE9 claims to support 'input' but fails to trigger it on text deletion,
             * so it's excluded here.
             */
            var isInputEventSupported = false;
            if (ExecutionEnvironment.canUseDOM) {
                // Check for DOM availability.
                isInputEventSupported = isEventSupported('input') && (
                    !('documentMode' in document) || document.documentMode > 9 // Exclude IE9 and below.
                );
            }

            /**
             * (For old IE.) A custom getter/setter for the `value` property
             * of the active element. This allows React to intercept and track
             * changes to the value that might not trigger a native 'input' event.
             */
            var newValueProp = {
                get: function () {
                    // Delegate to the original getter of the 'value' property.
                    return activeElementValueProp.get.call(this);
                },
                set: function (val) {
                    // Cast the new value to a string for consistent equality checks.
                    activeElementValue = '' + val;
                    // Delegate to the original setter of the 'value' property.
                    activeElementValueProp.set.call(this, val);
                }
            };

            /**
             * (For old IE.) Starts tracking `propertychange` events on the given element.
             * It also overrides the element's `value` property getter/setter
             * to distinguish between user-initiated changes and programmatic changes.
             *
             * @param {DOMElement} target The DOM element to track.
             * @param {string} targetID The React ID of the target element.
             */
            function startWatchingForValueChange(target, targetID) {
                activeElement = target; // Store the target element.
                activeElementID = targetID; // Store its ID.
                activeElementValue = target.value; // Store the current value.
                // Get the original property descriptor for 'value' from the element's prototype.
                activeElementValueProp = Object.getOwnPropertyDescriptor(
                    target.constructor.prototype,
                    'value'
                );

                // Override the 'value' property with our custom getter/setter.
                Object.defineProperty(activeElement, 'value', newValueProp);
                // Attach the IE-specific 'onpropertychange' event listener.
                activeElement.attachEvent('onpropertychange', handlePropertyChange);
            }

            /**
             * (For old IE.) Removes event listeners and cleans up tracking for
             * the currently watched element, if any.
             */
            function stopWatchingForValueChange() {
                if (!activeElement) {
                    // If no element is being tracked, do nothing.
                    return;
                }

                // Restore the original 'value' property definition by deleting the override.
                delete activeElement.value;
                activeElement.detachEvent('onpropertychange', handlePropertyChange); // Detach the event listener.

                // Clear all tracking variables.
                activeElement = null;
                activeElementID = null;
                activeElementValue = null;
                activeElementValueProp = null;
            }

            /**
             * (For old IE.) Handles a native `propertychange` event.
             * If the changed property is 'value' and the value has actually
             * changed from the tracked `activeElementValue`, it manually dispatches
             * a synthetic change event.
             *
             * @param {object} nativeEvent The native browser `propertychange` event.
             */
            function handlePropertyChange(nativeEvent) {
                // We are only interested in changes to the 'value' property.
                if (nativeEvent.propertyName !== 'value') {
                    return;
                }
                var value = nativeEvent.srcElement.value; // Get the new value.
                if (value === activeElementValue) {
                    // If the value hasn't actually changed, ignore the event.
                    return;
                }
                activeElementValue = value; // Update the tracked value.

                manualDispatchChangeEvent(nativeEvent); // Dispatch a synthetic change event.
            }

            /**
             * If an `input` event should trigger a `change` event, this function
             * returns the target's React ID.
             *
             * @param {string} topLevelType The top-level native event type.
             * @param {DOMElement} topLevelTarget The native DOM target.
             * @param {string} topLevelTargetID The React ID of the native DOM target.
             * @return {?string} The targetID if an input event indicates a change, otherwise null.
             */
            function getTargetIDForInputEvent(
                topLevelType,
                topLevelTarget,
                topLevelTargetID
            ) {
                if (topLevelType === topLevelTypes.topInput) {
                    // In modern browsers (not IE8 or IE9), the native 'input' event
                    // directly corresponds to what we want for an abstract change event.
                    return topLevelTargetID;
                }
                return null;
            }

            // For IE8 and IE9, a special handler is needed for input events.
            function handleEventsForInputEventIE(
                topLevelType,
                topLevelTarget,