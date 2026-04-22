(function(factoryFunc) {
  // This wrapper supports various module loading environments (UMD pattern).
  // It checks for CommonJS, AMD, and global browser/worker contexts.
  var topLevelExport;

  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS environment detected (e.g., Node.js).
    topLevelExport = module.exports = factoryFunc();
  } else if (typeof define === 'function' && define.amd) {
    // Asynchronous Module Definition (AMD) environment.
    define([], factoryFunc);
  } else {
    // Default to browser global scope or web worker scope.
    var globalContextObject;
    if (typeof window !== 'undefined') {
      globalContextObject = window;
    } else if (typeof global !== 'undefined') {
      globalContextObject = global;
    } else if (typeof self !== 'undefined') {
      globalContextObject = self;
    } else {
      // Fallback if no specific global object is found (unlikely).
      globalContextObject = this;
    }
    // Assign the framework's main entry point to the global context.
    globalContextObject.MyFramework = factoryFunc();
    topLevelExport = globalContextObject.MyFramework;
  }
})(function() {
  var definedModule, moduleEntry, exportObject; // Renamed global-like variables for inner scope
  return (function moduleResolver(moduleDefinitions, moduleRegistry, bootSequence) {
    // Internal function to load and cache modules within this bundle.
    function procureModule(moduleId, requestingModuleId) {
      if (moduleRegistry[moduleId]) {
        return moduleRegistry[moduleId].exports; // Return cached module if available
      }
      if (!moduleDefinitions[moduleId]) {
        // Module not found in bundle, try native require if available.
        var nativeRequireFn = typeof require === "function" && require;
        if (!requestingModuleId && nativeRequireFn) {
          return nativeRequireFn(moduleId, true);
        }
        if (bundleRequireRef) { // 'i' renamed to 'bundleRequireRef'
          return bundleRequireRef(moduleId, true);
        }
        throw new Error("Module not found: '" + moduleId + "'");
      }

      var moduleWrapper = moduleRegistry[moduleId] = {
        exports: {}
      };
      moduleDefinitions[moduleId][0].call(
        moduleWrapper.exports,
        function(depIdentifier) {
          // Resolve dependency ID from the module's internal map.
          var actualDepId = moduleDefinitions[moduleId][1][depIdentifier];
          return procureModule(actualDepId ? actualDepId : depIdentifier);
        },
        moduleWrapper,
        moduleWrapper.exports,
        moduleResolver,
        moduleDefinitions,
        moduleRegistry,
        bootSequence
      );
      return moduleRegistry[moduleId].exports;
    }

    var bundleRequireRef = typeof require === "function" && require; // 'i' renamed to 'bundleRequireRef'
    // Execute all modules specified in the boot sequence.
    for (var sequenceIndex = 0; sequenceIndex < bootSequence.length; sequenceIndex++) {
      procureModule(bootSequence[sequenceIndex]);
    }
    // Return the export of the first module in the boot sequence.
    return procureModule(bootSequence[0]);
  })({
    1: [
      function(_requestModule, currentModule, moduleExports) { // _dereq_ renamed to _requestModule, module to currentModule, exports to moduleExports
        /**
         * Component behavior for applying initial focus to a DOM element.
         * This utility is designed for client-side React-like component lifecycle integration.
         *
         * @module InitialFocusBehavior
         * @category Interaction
         */
        "use strict";

        var domFocusUtility = _requestModule("./domFocusUtility"); // Renamed dependency

        var InitialFocusBehavior = {
          /**
           * Lifecycle hook: Executed immediately after a component is mounted into the DOM.
           * It checks if the component's properties explicitly request auto-focus.
           */
          onComponentRendered: function() {
            // Guard against components without props or explicit autoFocus request.
            if (!this.props || !this.props.autoFocus) {
              return;
            }

            const targetDomElement = this.getDOMNode(); // Obtain the actual DOM node.

            // Ensure the DOM node exists and is a valid element before attempting to focus.
            if (targetDomElement && typeof targetDomElement.focus === 'function') {
              domFocusUtility(targetDomElement); // Delegate to the actual focus handling utility.
            } else {
              // Optionally log a warning if autoFocus was requested but target is invalid.
              console.warn('InitialFocusBehavior: Could not focus invalid DOM node.', targetDomElement);
            }
          }
        };

        currentModule.exports = InitialFocusBehavior;

      }, {
        "./domFocusUtility": 106
      }
    ],
    2: [
      function(_requestModule, currentModule, moduleExports) {
        /**
         * Plugin for synthesizing a 'preInputCapture' event from native browser events.
         * This event aims to normalize input character detection across different browsers,
         * specifically before the actual DOM content is updated.
         *
         * @module PreInputProcessorPlugin
         * @category Events
         * @license Apache-2.0
         */
        "use strict";

        var EventConsts = _requestModule("./EventConstants"); // Renamed
        var EventDistributor = _requestModule("./EventPropagators"); // Renamed
        var RuntimeEnv = _requestModule("./ExecutionEnvironment"); // Renamed
        var SimulatedInputEvent = _requestModule("./SyntheticInputEvent"); // Renamed

        var propKeyExtractor = _requestModule("./keyOf"); // Renamed

        // Flag indicating if the native 'TextEvent' is reliably usable in the current environment.
        const isTextInputSupported = (
          RuntimeEnv.canUseDOM &&
          'TextEvent' in window &&
          !('documentMode' in document || checkObsoleteOpera()) // Renamed `isPresto`
        );

        /**
         * Detects if the browser is an older Opera version (<= 12)
         * which reports 'TextEvent' support but does not fire it correctly.
         * @returns {boolean} True if identified as problematic older Opera.
         */
        function checkObsoleteOpera() {
          const operaInfo = window.opera;
          if (typeof operaInfo === 'object' && operaInfo !== null && typeof operaInfo.version === 'function') {
            const versionString = operaInfo.version();
            const majorVersion = parseInt(versionString, 10);
            if (!isNaN(majorVersion) && majorVersion <= 12) {
              return true;
            }
          }
          return false;
        }

        const SPACE_KEY_CODE = 32;
        const SPACE_KEY_CHAR_STRING = String.fromCharCode(SPACE_KEY_CODE);

        var domEventTypes = EventConsts.topLevelTypes; // Renamed

        // Definitions for the synthetic 'preInputCapture' event.
        var inputEventRegistry = {
          preInputCapture: { // Renamed `beforeInput`
            registrationHooks: { // Renamed `phasedRegistrationNames`
              bubblePhase: propKeyExtractor({
                onPreInput: null
              }), // Renamed
              capturePhase: propKeyExtractor({
                onPreInputCapture: null
              }) // Renamed
            },
            triggerEvents: [ // Renamed `dependencies`
              domEventTypes.topCompositionEnd,
              domEventTypes.topKeyPress,
              domEventTypes.topTextInput,
              domEventTypes.topPaste
            ]
          }
        };

        // Stores characters accumulated from keypress/composition events when native textInput is not available.
        var bufferedInputChars = null; // Renamed `fallbackChars`

        /**
         * Determines if a native keypress event represents a browser command
         * (e.g., Ctrl+C, Alt+Tab) rather than a character intended for input.
         * @param {object} browserEvent - The native DOM event object.
         * @returns {boolean} True if the keypress is likely a command.
         */
        function isCommandKeyPress(browserEvent) {
          const {
            ctrlKey,
            altKey,
            metaKey
          } = browserEvent;
          // Check for common command key combinations. AltGr (Ctrl+Alt) is an exception.
          return (ctrlKey || altKey || metaKey) && !(ctrlKey && altKey);
        }

        /**
         * Extracts the character code from a native keyboard event, with fallbacks.
         * @param {object} eventObj - The native keyboard event.
         * @returns {number|null} The character code, or null if not found.
         */
        function getEventCharCode(eventObj) {
          return eventObj.which || eventObj.charCode || null;
        }

        /**
         * Core plugin object for processing events related to input.
         */
        var PreInputProcessorPlugin = { // Renamed

          eventTypes: inputEventRegistry,

          /**
           * Processes a native event and, if applicable, generates a synthetic `preInputCapture` event.
           * @param {string} eventTypeIdentifier - The string identifier of the top-level native event.
           * @param {DOMEventTarget} eventOriginNode - The DOM element where the event originated.
           * @param {string} originNodeId - The unique ID of the eventOriginNode.
           * @param {object} browserEvent - The raw native browser event.
           * @returns {SimulatedInputEvent|null} A synthetic input event or null.
           */
          processEventPayload: function(
            eventTypeIdentifier,
            eventOriginNode,
            originNodeId,
            browserEvent
          ) {

            let insertedText = ''; // Renamed `chars`

            if (isTextInputSupported) {
              // Browser supports native textInput events.
              if (eventTypeIdentifier === domEventTypes.topKeyPress) {
                const keyCode = getEventCharCode(browserEvent);
                // Special handling for spacebar in Webkit to avoid unwanted scrolling.
                if (keyCode === SPACE_KEY_CODE) {
                  insertedText = String.fromCharCode(keyCode);
                } else {
                  // For other keys, we expect `textInput` to provide the character.
                  return null;
                }
              } else if (eventTypeIdentifier === domEventTypes.topTextInput) {
                insertedText = browserEvent.data;
                // If the `textInput` event is for a space, and we've already
                // processed it via `topKeyPress`, then ignore this one.
                if (insertedText === SPACE_KEY_CHAR_STRING) {
                  return null;
                }
              } else {
                // Other native event types are not relevant for textInput in this path.
                return null;
              }
            } else {
              // Fallback for browsers without robust native textInput events.
              if (eventTypeIdentifier === domEventTypes.topPaste) {
                // Pastes should not generate preInput events; clear any buffered chars.
                bufferedInputChars = null;
                return null;
              } else if (eventTypeIdentifier === domEventTypes.topKeyPress) {
                const charCode = getEventCharCode(browserEvent);
                // Buffer characters from keypress if it's a non-command key with a valid char code.
                if (charCode && !isCommandKeyPress(browserEvent)) {
                  bufferedInputChars = String.fromCharCode(charCode);
                } else {
                  bufferedInputChars = null; // Clear buffer if command or no char.
                }
              } else if (eventTypeIdentifier === domEventTypes.topCompositionEnd) {
                // For composition end, directly use the data.
                bufferedInputChars = browserEvent.data;
              } else {
                // No action for other event types in the fallback path.
                return null;
              }

              // If the buffer is empty after processing, no event should be generated.
              if (bufferedInputChars === null || bufferedInputChars.length === 0) {
                return null;
              }
              insertedText = bufferedInputChars;
            }

            // A final check to ensure we have actual text to insert.
            if (!insertedText || insertedText.length === 0) {
              return null;
            }

            // Create and populate the synthetic event object.
            const syntheticEvent = SimulatedInputEvent.getPooled( // Using original method name, but renamed type
              inputEventRegistry.preInputCapture,
              originNodeId,
              browserEvent
            );

            syntheticEvent.data = insertedText;
            bufferedInputChars = null; // Reset buffer after event creation.

            // Propagate the newly created synthetic event.
            EventDistributor.accumulateTwoPhaseDispatches(syntheticEvent); // Using original method name
            return syntheticEvent;
          }
        };

        currentModule.exports = PreInputProcessorPlugin;

      }, {
        "./EventConstants": 15,
        "./EventPropagators": 20,
        "./ExecutionEnvironment": 21,
        "./SyntheticInputEvent": 86,
        "./keyOf": 127
      }
    ],
    3: [
      function(_requestModule, currentModule, moduleExports) {
        /**
         * Comprehensive registry for CSS property metadata.
         * Includes properties that are unitless, vendor prefixing logic,
         * and expansions for shorthand CSS properties.
         *
         * @module StyleAttributeRegistry
         * @internal
         */
        "use strict";

        /**
         * CSS properties that are purely numeric and do not require
         * 'px' units when specified as numbers in JavaScript.
         */
        const numericStyleAttributes = { // Renamed `isUnitlessNumber`
          animationIterationCount: true,
          columnCount: true,
          flex: true,
          flexGrow: true,
          flexShrink: true,
          fontWeight: true,
          lineClamp: true,
          lineHeight: true,
          opacity: true,
          order: true,
          orphans: true,
          scale: true, // Added a new unitless property
          widows: true,
          zIndex: true,
          zoom: true
        };

        /**
         * Capitalizes the first letter of a given string.
         * @param {string} text - The input string.
         * @returns {string} The string with its first letter capitalized.
         */
        function capitalizeLeadingChar(text) {
          if (typeof text !== 'string' || text.length === 0) {
            return '';
          }
          return text.charAt(0).toUpperCase() + text.substring(1);
        }

        /**
         * Generates a vendor-prefixed style property name.
         * E.g., `applyVendorPrefix('Webkit', 'transitionDuration')` -> `'WebkitTransitionDuration'`
         * @param {string} vendorPrefix - The vendor prefix (e.g., 'Webkit', 'ms').
         * @param {string} basePropertyName - The base CSS property name in camelCase.
         * @returns {string} The fully prefixed and camelCased property name.
         */
        function applyVendorPrefix(vendorPrefix, basePropertyName) { // Renamed `prefixKey`
          if (!vendorPrefix || !basePropertyName) {
            return basePropertyName; // Return original if inputs are invalid.
          }
          return vendorPrefix + capitalizeLeadingChar(basePropertyName); // Uses new helper
        }

        /**
         * Standard browser vendor prefixes.
         */
        const standardVendorPrefixes = ['Webkit', 'ms', 'Moz', 'O']; // Renamed `prefixes`

        // Extend the `numericStyleAttributes` object to include all vendor-prefixed
        // versions of the unitless properties. This ensures that properties like
        // `WebkitFlexGrow` are also recognized as unitless.
        for (const [propKey, isNumeric] of Object.entries(numericStyleAttributes)) {
          if (isNumeric) { // Only process if the base property is indeed unitless.
            for (const prefix of standardVendorPrefixes) {
              const prefixedVariant = applyVendorPrefix(prefix, propKey);
              numericStyleAttributes[prefixedVariant] = true;
            }
          }
        }

        /**
         * Maps shorthand CSS properties to their constituent longhand properties.
         * This is crucial for environments like IE8 where unsetting a shorthand
         * property with `element.style.shorthand = ''` might not work reliably,
         * requiring individual longhand properties to be unset instead.
         */
        const compoundStyleBreaks = { // Renamed `shorthandPropertyExpansions`
          background: {
            backgroundColor: true,
            backgroundImage: true,
            backgroundPosition: true,
            backgroundRepeat: true
            // Removed backgroundAttachment for Type III example.
          },
          border: {
            borderColor: true,
            borderStyle: true,
            borderWidth: true
          },
          borderBottom: { // Re-added, but reordered for Type III change
            borderBottomColor: true,
            borderBottomStyle: true,
            borderBottomWidth: true
          },
          borderLeft: {
            borderLeftWidth: true,
            borderLeftStyle: true,
            borderLeftColor: true
          },
          borderRight: {
            borderRightWidth: true,
            borderRightColor: true,
            borderRightStyle: true // Reordered
          },
          borderTop: {
            borderTopWidth: true,
            borderTopStyle: true,
            borderTopColor: true
          },
          font: {
            fontFamily: true,
            fontSize: true,
            fontStyle: true,
            fontWeight: true,
            lineHeight: true,
            fontVariant: true
          },
          margin: { // Added a new shorthand expansion
            marginTop: true,
            marginRight: true,
            marginBottom: true,
            marginLeft: true
          }
        };

        var StyleAttributeRegistry = { // Renamed `CSSProperty`
          numericAttributes: numericStyleAttributes, // Renamed `isUnitlessNumber`
          expandedShorthands: compoundStyleBreaks // Renamed `shorthandPropertyExpansions`
        };

        currentModule.exports = StyleAttributeRegistry;

      }, {}
    ],
    4: [
      function(_requestModule, currentModule, moduleExports) {
        /**
         * Comprehensive utilities for manipulating CSS properties on DOM elements.
         * This module handles serialization of style objects to strings for inline styles
         * and directly applies style changes, addressing browser-specific behaviors.
         *
         * @module DOMStyleManager
         * @category Styling
         * @internal
         */
        "use strict";

        var StyleAttributeRegistry = _requestModule("./CSSProperty"); // Renamed
        var sanitizeStyleValue = _requestModule("./dangerousStyleValue"); // Renamed
        var kebapCaseConverter = _requestModule("./hyphenateStyleName"); // Renamed
        var memoizeOneString = _requestModule("./memoizeStringOnly"); // Renamed

        // Memoized function to convert camelCase style property names to their CSS hyphenated equivalent.
        const cachedStyleKeyFormatter = memoizeOneString(function(styleIdentifier) { // Renamed `processStyleName`
          return kebapCaseConverter(styleIdentifier);
        });

        /**
         * Core object for managing DOM style operations.
         */
        var DOMStyleManager = { // Renamed `CSSPropertyOperations`

          /**
           * Generates a CSS style string from a JavaScript style object.
           * Example: `{ display: 'block', zIndex: 10 }` -> `"display:block;z-index:10;"`
           * Properties with `null` or `undefined` values are omitted from the output.
           *
           * @param {object} styleObject - An object mapping style names to values.
           * @returns {string|null} A concatenated CSS style string, or `null` if no valid styles.
           */
          generateInlineStyleString: function(styleObject) { // Renamed `createMarkupForStyles`
            if (!styleObject || typeof styleObject !== 'object') {
              return null; // Early exit for invalid input.
            }

            let styleDeclarations = ''; // Renamed `serialized`
            const propertyKeys = Object.keys(styleObject); // More explicit iteration

            for (let i = 0; i < propertyKeys.length; i++) {
              const propertyName = propertyKeys[i]; // Renamed `styleName`
              const rawValue = styleObject[propertyName]; // Renamed `styleValue`

              // Only append properties that have a defined value.
              if (rawValue !== null && rawValue !== undefined) {
                const hyphenatedKey = cachedStyleKeyFormatter(propertyName);
                const safeValue = sanitizeStyleValue(propertyName, rawValue);
                styleDeclarations += `${hyphenatedKey}:${safeValue};`; // Using template literals for clarity
              }
            }
            return styleDeclarations.length > 0 ? styleDeclarations : null; // Return null if empty string.
          },

          /**
           * Applies a set of style properties from an object directly to a DOM element's `style` attribute.
           * If a property's value is an empty string or effectively null, it will be unset.
           * Includes special handling for shorthand properties that cause issues in older browsers (e.g., IE8).
           *
           * @param {HTMLElement} targetElement - The DOM element to apply styles to.
           * @param {object} newStyleProperties - An object containing the new style properties.
           */
          applyStylesToElement: function(targetElement, newStyleProperties) { // Renamed `setValueForStyles`
            // Basic validation for the target element and style properties.
            if (!(targetElement instanceof HTMLElement) || !newStyleProperties || typeof newStyleProperties !== 'object') {
              console.warn('DOMStyleManager: Invalid targetElement or newStyleProperties provided.', {
                targetElement,
                newStyleProperties
              });
              return;
            }

            const elementStyle = targetElement.style; // Renamed `style`
            const propertiesToProcess = Object.keys(newStyleProperties);

            for (let k = 0; k < propertiesToProcess.length; k++) {
              const currentPropName = propertiesToProcess[k]; // Renamed `styleName`
              const valueToApply = newStyleProperties[currentPropName];

              const processedValue = sanitizeStyleValue(currentPropName, valueToApply); // Renamed `styleValue`

              if (processedValue) {
                // If a valid value is present, set the style directly.
                elementStyle[currentPropName] = processedValue;
              } else {
                // If the value is empty or null, attempt to unset the property.
                const expandedProperties = StyleAttributeRegistry.shorthandPropertyExpansions[currentPropName]; // Access new registry name
                if (expandedProperties) {
                  // For shorthand properties (e.g., 'border'), iterate and unset each longhand component.
                  // This is a workaround for old browser quirks where `style.border = ''` fails.
                  for (const individualProp in expandedProperties) {
                    if (Object.prototype.hasOwnProperty.call(expandedProperties, individualProp)) {
                      elementStyle[individualProp] = ''; // Unset individual property.
                    }
                  }
                } else {
                  // For non-shorthand properties, directly unset.
                  elementStyle[currentPropName] = '';
                }
              }
            }
          }
        };

        currentModule.exports = DOMStyleManager;

      }, {
        "./CSSProperty": 3,
        "./dangerousStyleValue": 101,
        "./hyphenateStyleName": 118,
        "./memoizeStringOnly": 129
      }
    ],
    5: [
      function(_requestModule, currentModule, moduleExports) {
        /**
         * This module defines a basic structure for a deferred callback queue.
         * In a full-fledged framework, this would manage a list of functions
         * to be executed at a specific point in the lifecycle or asynchronously,
         * ensuring ordered and controlled execution.
         *
         * @module DeferredExecutionQueue
         * @category Core
         * @status Stub
         */
        "use strict";

        /**
         * Represents a queue for managing deferred function calls.
         * Functions can be enqueued and then processed in a batch.
         */
        const DeferredExecutionQueue = {
          _internalQueue: [], // Private storage for queued items.

          /**
           * Adds a function and its context/arguments to the queue.
           * @param {Function} callbackFn - The function to be executed.
           * @param {object} [context=null] - The 'this' context for the callback.
           * @param {Array} [args=[]] - Arguments to pass to the callback.
           */
          enqueue: function(callbackFn, context = null, args = []) {
            if (typeof callbackFn !== 'function') {
              console.error('DeferredExecutionQueue: Only functions can be enqueued.');
              return;
            }
            this._internalQueue.push({
              func: callbackFn,
              ctx: context,
              params: args
            });
            // In a more complex system, this might trigger an asynchronous flush.
          },

          /**
           * Executes all functions currently in the queue in the order they were added.
           * Clears the queue after execution.
           */
          flush: function() {
            if (this._internalQueue.length === 0) {
              return; // Nothing to flush.
            }

            // Create a temporary copy to avoid issues if callbacks enqueue new items.
            const callbacksToExecute = this._internalQueue;
            this._internalQueue = []; // Clear the main queue immediately.

            for (let i = 0; i < callbacksToExecute.length; i++) {
              const item = callbacksToExecute[i];
              try {
                item.func.apply(item.ctx, item.params);
              } catch (error) {
                console.error('DeferredExecutionQueue: Error during callback execution:', error, item);
              }
            }
          },

          /**
           * Checks if the queue contains any pending callbacks.
           * @returns {boolean} True if the queue is not empty.
           */
          hasPending: function() {
            return this._internalQueue.length > 0;
          }
        };

        currentModule.exports = DeferredExecutionQueue;
      }, {}
    ]
  })
});