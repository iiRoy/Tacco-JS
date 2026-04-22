// React v0.11.2 - Modified Version
// This script provides a core application framework, inspired by early React implementations.
!function( initArg ) {
  // Check if running in a CommonJS-like environment (Node.js, Browserify, Webpack)
  if ( typeof exportObj === 'object' && typeof moduleRef !== 'undefined' ) {
    moduleRef.exportObj = initArg();
  }
  // Check if running in an AMD environment (RequireJS)
  else if ( typeof defineFunc === 'function' && defineFunc.amd ) {
    defineFunc( [], initArg );
  }
  // Otherwise, attach to the global scope (browser, web worker)
  else {
    var targetScope;
    // Prioritize `window` for browser environments
    if ( typeof globalWindow !== 'undefined' ) {
      targetScope = globalWindow;
    }
    // Fallback to `global` for Node.js-like global objects
    else if ( typeof rootGlobal !== 'undefined' ) {
      targetScope = rootGlobal;
    }
    // Fallback to `self` for Web Workers
    else if ( typeof selfRef !== 'undefined' ) {
      targetScope = selfRef;
    }
    targetScope.AppCore = initArg();
  }
}(
  // Main factory function that will be executed to get the core library
  function() {
    var defineFunc, moduleRef, exportObj; // Local variables for module system compatibility

    // This is a simplified module bundling and loading system (similar to Browserify's output).
    return ( function reqFunc( moduleDefinitions, loadedModuleCache, entryModuleIds ) {
      // Internal function to load a module by its unique identifier.
      function getModuleById( moduleId, isRecursiveCall ) {
        // If the module is already in the cache, return its exports immediately.
        if ( !loadedModuleCache[ moduleId ] ) {
          // If the module definition doesn't exist, try to use a global require.
          if ( !moduleDefinitions[ moduleId ] ) {
            var localRequireRef = typeof require === 'function' && require;
            // If not a recursive call and a global require is available, use it.
            if ( !isRecursiveCall && localRequireRef ) {
              return localRequireRef( moduleId, !0 );
            }
            // If the initial global require was captured, use that.
            if ( primaryRequire ) {
              return primaryRequire( moduleId, !0 );
            }
            // If module cannot be found, throw an error.
            throw new Error( "Cannot locate component with ID '" + moduleId + "'" );
          }
          // Create a new module object and store it in the cache.
          var currentModuleWrapper = loadedModuleCache[ moduleId ] = { exportObj: {} };
          // Execute the module's factory function, providing necessary arguments.
          moduleDefinitions[ moduleId ][ 0 ].call(
            currentModuleWrapper.exportObj,
            function( dependencyId ) {
              // Resolve the dependency ID using internal mappings, if any.
              var resolvedDepId = moduleDefinitions[ moduleId ][ 1 ][ dependencyId ];
              return getModuleById( resolvedDepId ? resolvedDepId : dependencyId );
            },
            currentModuleWrapper,
            currentModuleWrapper.exportObj,
            reqFunc,
            moduleDefinitions,
            loadedModuleCache,
            entryModuleIds
          );
        }
        return loadedModuleCache[ moduleId ].exportObj;
      }

      // Capture the global 'require' if it exists for initial module loading.
      var primaryRequire = typeof require === 'function' && require;

      // Load all specified entry point modules.
      for ( var k = 0; k < entryModuleIds.length; k++ ) {
        getModuleById( entryModuleIds[ k ] );
      }
      return getModuleById; // Return the module loading function.
    })(
      // Object containing all module definitions.
      {
        1: [
          function( _request_, moduleRef, exportObj ) {
            // Copyright 2013-2014 Meta Platforms, Inc.
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            // http://www.apache.org/licenses/LICENSE-2.0
            //
            // Unless required by applicable law or agreed to in writing, software
            // distributed under the License is distributed on an "AS IS" BASIS,
            // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            // See the License for the specific language governing permissions and
            // limitations under the License.
            //
            // @moduleName FocusOnMountBehavior
            // @typechecks static-only

            "use strict";

            // Import a helper function to set focus on a DOM element.
            var activateElement = _request_( "./focusNode" );

            /**
             * This mixin provides functionality to automatically focus a component's
             * associated DOM node immediately after it has been mounted to the document.
             */
            var FocusOnMountBehavior = {
              /**
               * Lifecycle hook: invoked immediately after a component is mounted.
               * This is the ideal place to perform DOM manipulations.
               */
              onComponentMounted: function() {
                // Check if the component's properties indicate that it should gain focus.
                if ( this.properties.shouldFocus ) {
                  // Call the utility to apply focus to the component's primary HTML element.
                  activateElement( this.getHtmlElement() );
                }
              }
            };

            // Expose the focus-on-mount behavior for other modules to use.
            moduleRef.exportObj = FocusOnMountBehavior;
          },
          { "./focusNode": 106 }
        ],
        2: [
          function( _request_, moduleRef, exportObj ) {
            // Copyright 2013 Meta Platforms, Inc.
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            // http://www.apache.org/licenses/LICENSE-2.0
            //
            // Unless required by applicable law or agreed to in writing, software
            // distributed under the License is distributed on an "AS IS" BASIS,
            // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            // See the License for the specific language governing permissions and
            // limitations under the License.
            //
            // @moduleName PreInputEvtProcessor
            // @typechecks static-only

            "use strict";

            // Import dependencies for event handling and environment detection.
            var EvtConsts = _request_( "./EventConstants" );
            var EvtDistributors = _request_( "./EventPropagators" );
            var ExecContext = _request_( "./ExecutionEnvironment" );
            var SynthTextInputEvt = _request_( "./SyntheticInputEvent" );

            // Utility to derive object keys.
            var propKeyName = _request_( "./keyOf" );

            // Determine if the native `TextEvent` can be reliably used for input character detection.
            var hasTextInputCapability = (
              ExecContext.canUseDOM &&
              'TextEvent' in globalWindow &&
              !( 'documentMode' in domDocument || isOldOperaBrowser() )
            );

            /**
             * Detects specific versions of Opera (up to 12) that falsely report `TextEvent`
             * support but do not actually fire the events correctly.
             * In these cases, a `keypress` fallback is necessary.
             */
            function isOldOperaBrowser() {
              var operaObject = globalWindow.opera;
              return (
                typeof operaObject === 'object' &&
                typeof operaObject.browserVersion === 'function' &&
                parseInt( operaObject.browserVersion(), 10 ) <= 12
              );
            }

            // Numeric code for the spacebar key.
            var SPACE_KEY_CODE = 32;
            // Character representation of the spacebar.
            var SPACE_KEY_CHAR = String.fromCharCode( SPACE_KEY_CODE );

            // Reference to the top-level event types for easy access.
            var mainEvtTypes = EvtConsts.topLevelTypes;

            // Defines the `preInput` event and its associated properties and dependencies.
            var evtDefinitions = {
              preInput: {
                regNamesByPhase: {
                  bubblePhase: propKeyName( { onPreInput: undefined } ),
                  capturePhase: propKeyName( { onPreInputCapture: undefined } )
                },
                depEvents: [
                  mainEvtTypes.mainCompositionEnd,
                  mainEvtTypes.mainKeyPress,
                  mainEvtTypes.mainTextInput,
                  mainEvtTypes.mainPaste
                ]
              }
            };

            // A temporary buffer to store characters derived from fallback events like keypress.
            var cachedInputChars = undefined;

            /**
             * Determines if a given native keypress event represents a command (e.g., Ctrl+C, Alt+Tab).
             * Browsers like Firefox may fire `keypress` for commands without inserting text.
             *
             * @param {object} domEvent The native browser event object.
             * @return {boolean} True if the keypress is a command, false otherwise.
             */
            function isCmdKeyPress( domEvent ) {
              return (
                ( domEvent.controlKey || domEvent.alternateKey || domEvent.metaKeyActive ) &&
                // Specifically exclude AltGr (Ctrl+Alt) as it typically inserts characters.
                !( domEvent.controlKey && domEvent.alternateKey )
              );
            }

            /**
             * This plugin is responsible for generating a synthetic `onPreInput` event.
             * This event aims to standardize the detection of text input before it's
             * committed to the DOM, similar to the W3C Input Events specification.
             *
             * It prioritizes native `textInput` events (Chrome, Safari, Opera, IE) when available,
             * as they provide the most accurate character data. For other browsers or edge cases,
             * it falls back to `keypress` and `compositionEnd` events to infer input.
             */
            var PreInputEvtProcessor = {
              evtDefinitions: evtDefinitions,

              /**
               * Analyzes a native event and, if applicable, extracts data to create
               * synthetic `preInput` events.
               *
               * @param {string} mainTriggerType The top-level event type (e.g., 'topKeyPress').
               * @param {DOMEventTarget} mainTargetElement The DOM element that received the event.
               * @param {string} mainTargetId The unique ID of the target element.
               * @param {object} domEvent The raw native browser event object.
               * @return {?object} A synthetic `preInput` event, or null/undefined if none is generated.
               */
              getTriggeredEvents: function(
                mainTriggerType,
                mainTargetElement,
                mainTargetId,
                domEvent
              ) {
                var insertedCharacters; // Variable to hold the characters identified as input.

                if ( hasTextInputCapability ) {
                  // If native `TextEvent` is supported, we primarily rely on it.
                  switch ( mainTriggerType ) {
                    case mainEvtTypes.mainKeyPress:
                      /**
                       * Special handling for the spacebar key in Webkit-based browsers.
                       * While `textInput` is generally preferred, preventing default on a spacebar
                       * `textInput` event in Webkit cancels character insertion but also triggers
                       * page scrolling. To avoid this, we process spacebar `keypress` separately.
                       * (Refer to Chromium bug: https://code.google.com/p/chromium/issues/detail?id=355103)
                       */
                      var detectedKeyCode = domEvent.keyCodeVal;
                      if ( detectedKeyCode !== SPACE_KEY_CODE ) {
                        return; // Ignore non-spacebar keypress events if textInput is available.
                      }
                      insertedCharacters = String.fromCharCode( detectedKeyCode );
                      break;

                    case mainEvtTypes.mainTextInput:
                      // Directly use the data provided by the native `textInput` event.
                      insertedCharacters = domEvent.eventData;

                      // If the inserted character is a space, it was already handled by the keypress logic.
                      // We exit to prevent duplicate event generation.
                      if ( insertedCharacters === SPACE_KEY_CHAR ) {
                        return;
                      }
                      // Otherwise, proceed with processing.
                      break;

                    default:
                      // For any other native event types, no `preInput` event is generated.
                      return;
                  }
                } else {
                  // Fallback logic for environments without reliable `TextEvent` support.
                  switch ( mainTriggerType ) {
                    case mainEvtTypes.mainPaste:
                      // A paste event clears any pending fallback characters, as it's a distinct input mechanism.
                      cachedInputChars = undefined;
                      break;
                    case mainEvtTypes.mainKeyPress:
                      /**
                       * Firefox (v27+) may fire `keypress` events even when no character is inserted.
                       * This includes events for:
                       * - Keys with `keyCodeVal` 0 (e.g., arrow keys, Escape).
                       * - Keys where a `keyCodeVal` exists but no character results (e.g., AltGr+D in Polish).
                       * - Key combinations that are commands (e.g., Cmd+C).
                       * We only capture characters if `keyCodeVal` is present and it's not a command.
                       */
                      if ( domEvent.keyCodeVal && !isCmdKeyPress( domEvent ) ) {
                        cachedInputChars = String.fromCharCode( domEvent.keyCodeVal );
                      }
                      break;
                    case mainEvtTypes.mainCompositionEnd:
                      // For composition end, the event data directly provides the inserted characters.
                      cachedInputChars = domEvent.eventData;
                      break;
                  }

                  // If no characters were accumulated from the fallback events, no action is needed.
                  if ( cachedInputChars === undefined ) {
                    return;
                  }
                  insertedCharacters = cachedInputChars;
                }

                // If, after all processing, no characters are identified, do not fire an event.
                if ( !insertedCharacters ) {
                  return;
                }

                // Obtain a synthetic event object from the pool to conserve memory.
                var syntheticEvent = SynthTextInputEvt.obtainFromPool(
                  evtDefinitions.preInput,
                  mainTargetId,
                  domEvent
                );

                syntheticEvent.eventData = insertedCharacters; // Attach the detected characters.
                cachedInputChars = undefined; // Clear the cache after the event is created.
                EvtDistributors.dispatchInTwoPhases( syntheticEvent ); // Dispatch the event through the two-phase system.
                return syntheticEvent; // Return the generated synthetic event.
              }
            };

            // Export the event processor for `beforeInput` events.
            moduleRef.exportObj = PreInputEvtProcessor;
          },
          {
            "./EventConstants": 15,
            "./EventPropagators": 20,
            "./ExecutionEnvironment": 21,
            "./SyntheticInputEvent": 86,
            "./keyOf": 127
          }
        ],
        3: [
          function( _request_, moduleRef, exportObj ) {
            // Copyright 2013-2014 Meta Platforms, Inc.
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            // http://www.apache.org/licenses/LICENSE-2.0
            //
            // Unless required by applicable law or agreed to in writing, software
            // distributed under the License is distributed on an "AS IS" BASIS,
            // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            // See the License for the specific language governing permissions and
            // limitations under the License.
            //
            // @moduleName StylePropInfo

            "use strict";

            /**
             * Defines CSS properties that take numeric values but are not
             * automatically appended with "px" units. These properties
             * include things like `opacity`, `zIndex`, `flex`, etc.
             */
            var numericStyleProps = {
              columnCountProp: !0,
              fillOpacityProp: !0,
              flexProp: !0,
              flexGrowProp: !0,
              flexShrinkProp: !0,
              fontWeightProp: !0,
              lineClampProp: !0,
              lineHeightProp: !0,
              opacityProp: !0,
              orderProp: !0,
              orphansProp: !0,
              widowsProp: !0,
              zIndexProp: !0,
              zoomProp: !0
            };

            /**
             * Creates a vendor-prefixed version of a CSS style property name.
             * For example, given "Webkit" and "transitionDuration", it returns "WebkitTransitionDuration".
             * The first letter of the style key is capitalized.
             *
             * @param {string} vendorPrefix The vendor prefix, e.g., "Webkit".
             * @param {string} styleKey The base style property name, e.g., "transitionDuration".
             * @return {string} The vendor-prefixed, camelCased style name.
             */
            function addVendorPrefix( vendorPrefix, styleKey ) {
              return vendorPrefix + styleKey.charAt( 0 ).toUpperCase() + styleKey.substring( 1 );
            }

            /**
             * A list of common vendor prefixes used in CSS.
             * These are applied to unitless numeric properties to ensure
             * their prefixed forms are also recognized as unitless.
             */
            var vendorPrefixes = [ 'Webkit', 'ms', 'Moz', 'O' ];

            // Dynamically extend `numericStyleProps` to include vendor-prefixed versions.
            // This loop iterates over all standard unitless properties.
            Object.keys( numericStyleProps ).forEach( function( propertyName ) {
              // For each property, it generates and adds its vendor-prefixed variants.
              vendorPrefixes.forEach( function( currentPrefix ) {
                numericStyleProps[ addVendorPrefix( currentPrefix, propertyName ) ] = numericStyleProps[ propertyName ];
              });
            });

            /**
             * Defines the expansion of shorthand CSS properties into their
             * individual longhand components. This is crucial for handling
             * older browsers (like IE8) which may not correctly unset shorthand
             * properties by setting their value to an empty string.
             * (Reference: http://bugs.jquery.com/ticket/12385 for more context).
             */
            var shorthandStyleDetails = {
              backgroundStyle: {
                backgroundImageProp: !0,
                backgroundPositionProp: !0,
                backgroundRepeatProp: !0,
                backgroundColorProp: !0
              },
              borderStyle: {
                borderWidthProp: !0,
                borderStyleProp: !0,
                borderColorProp: !0
              },
              borderBottomStyle: {
                borderBottomWidthProp: !0,
                borderBottomStyleProp: !0,
                borderBottomColorProp: !0
              },
              borderLeftStyle: {
                borderLeftWidthProp: !0,
                borderLeftStyleProp: !0,
                borderLeftColorProp: !0
              },
              borderRightStyle: {
                borderRightWidthProp: !0,
                borderRightStyleProp: !0,
                borderRightColorProp: !0
              },
              borderTopStyle: {
                borderTopWidthProp: !0,
                borderTopStyleProp: !0,
                borderTopColorProp: !0
              },
              fontStyle: {
                fontStyleProp: !0,
                fontVariantProp: !0,
                fontWeightProp: !0,
                fontSizeProp: !0,
                lineHeightProp: !0,
                fontFamilyProp: !0
              }
            };

            // The main object containing metadata about CSS properties.
            var StylePropInfo = {
              numericStyleProps: numericStyleProps,
              shorthandStyleDetails: shorthandStyleDetails
            };

            // Export the CSS property information for use by other modules.
            moduleRef.exportObj = StylePropInfo;
          },
          {}
        ],
        4: [
          function( _request_, moduleRef, exportObj ) {
            // Copyright 2013-2014 Meta Platforms, Inc.
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            // http://www.apache.org/licenses/LICENSE-2.0
            //
            // Unless required by applicable law or agreed to in writing, software
            // distributed under the License is distributed on an "AS IS" BASIS,
            // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            // See the License for the specific language governing permissions and
            // limitations under the License.
            //
            // @moduleName StyleManipulator
            // @typechecks static-only

            "use strict";

            // Import the module containing CSS property definitions and metadata.
            var StylePropInfo = _request_( "./CSSProperty" );

            // Import utility functions for handling style values and names.
            var formatStyleValue = _request_( "./dangerousStyleValue" );
            var dashCaseStyleName = _request_( "./hyphenateStyleName" );
            var cacheStringProcessor = _request_( "./memoizeStringOnly" );

            /**
             * A memoized function to convert camelCased CSS property names into
             * their hyphenated (dash-cased) equivalents for use in style strings.
             * This avoids repeated computations for common style names.
             */
            var cachedDashCaseName = cacheStringProcessor( function( propertyName ) {
              return dashCaseStyleName( propertyName );
            });

            /**
             * Provides a set of operations for effectively managing and applying
             * CSS styles to DOM elements, including serialization and direct manipulation.
             */
            var StyleManipulator = {

              /**
               * Serializes a JavaScript object of CSS style properties into a single
               * CSS style string, suitable for use in an HTML `style` attribute.
               *
               * Example: `generateStyleString({width: '200px', height: 0})` results in `"width:200px;height:0;"`.
               * Properties with `undefined` or `null` values are intentionally ignored.
               * The resulting string should be HTML-escaped before insertion into the DOM.
               *
               * @param {object} styleMap An object where keys are CSS property names and values are their corresponding style values.
               * @return {?string} The generated CSS style string, or `null` if the input style map was empty or contained no valid values.
               */
              generateStyleString: function( styleMap ) {
                var resultString = '';
                // Iterate over each property in the provided style map.
                for ( var propertyName in styleMap ) {
                  // Ensure that only own properties are processed, not inherited ones.
                  if ( !styleMap.hasOwnProperty( propertyName ) ) {
                    continue;
                  }
                  var propertyValue = styleMap[ propertyName ];
                  // Only include properties that have a defined and non-null value.
                  if ( propertyValue !== undefined && propertyValue !== null ) {
                    resultString += cachedDashCaseName( propertyName ) + ':';
                    resultString += formatStyleValue( propertyName, propertyValue ) + ';';
                  }
                }
                return resultString || null; // Return the string or null if empty.
              },

              /**
               * Applies a collection of CSS style properties directly to a DOM element's
               * `style` object. If a style value is an empty string, the corresponding
               * style property will be unset. This method includes special handling for
               * IE8's behavior with shorthand CSS properties.
               *
               * @param {DOMElement} domElement The HTML element to which styles will be applied.
               * @param {object} styleMap An object containing CSS property names and their desired values.
               */
              applyStylesToElement: function( domElement, styleMap ) {
                var elementStyle = domElement.style; // Direct reference to the element's style object.
                // Iterate through each style property in the input map.
                for ( var propertyName in styleMap ) {
                  // Process only properties directly defined on the styleMap object.
                  if ( !styleMap.hasOwnProperty( propertyName ) ) {
                    continue;
                  }
                  // Format the style value (e.g., append 'px' if needed, handle vendor prefixes).
                  var propertyValue = formatStyleValue( propertyName, styleMap[ propertyName ] );
                  if ( propertyValue ) {
                    // If a valid value exists, apply it directly.
                    elementStyle[ propertyName ] = propertyValue;
                  } else {
                    // If the value is empty or `null` (indicating unset), check for shorthand properties.
                    var shorthandDetails = StylePropInfo.shorthandStyleDetails[ propertyName ];
                    if ( shorthandDetails ) {
                      // For shorthand properties that IE8 struggles to unset,
                      // unset each of their individual component properties.
                      for ( var subPropertyName in shorthandDetails ) {
                        elementStyle[ subPropertyName ] = '';
                      }
                    } else {
                      // For non-shorthand properties, setting to an empty string is sufficient to unset.
                      elementStyle[ propertyName ] = '';
                    }
                  }
                }
              }
            };

            // Export the style manipulation utilities.
            moduleRef.exportObj = StyleManipulator;
          },
          {
            "./CSSProperty": 3,
            "./dangerousStyleValue": 101,
            "./hyphenateStyleName": 118,
            "./memoizeStringOnly": 129
          }
        ],
        5: [
          function( _request_, moduleRef, exportObj ) {
            // Copyright 2013-2014 Meta Platforms, Inc.
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            // http://www.apache.org/licenses/LICENSE-2.0
            //
            // Unless required by applicable law or agreed to in writing, software
            // distributed under the License is distributed on an "AS IS" BASIS,
            // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            // See the License for the specific language governing permissions and
            // limitations under the License.
            //
            // @moduleName FunctionCallQueue