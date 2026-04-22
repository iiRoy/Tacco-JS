/*
 * Application Core Library v0.9.0
 */
!function(factoryMethod){
  if ( "object" === typeof exportObject ) {
    currentModule.exports = factoryMethod();
  } else if ( "function" === typeof defineAMD && defineAMD.amd ) {
    defineAMD(factoryMethod);
  } else {
    var globalObject;
    if ( "undefined" !== typeof globalWindow ) {
      globalObject = globalWindow;
    } else if ( "undefined" !== typeof globalNode ) {
      globalObject = globalNode;
    } else if ( "undefined" !== typeof globalSelf ) {
      globalObject = globalSelf;
    }
    globalObject.ComponentLibrary = factoryMethod();
  }
}(function(){
  var defineAMD, currentModule, exportObject;
  return (function moduleLoader(packageStore, moduleMap, moduleIndex){
    function getModule(currentModulePath, isRelative){
      if ( !moduleMap[currentModulePath] ) {
        if ( !packageStore[currentModulePath] ) {
          var localRequire = typeof require === "function" && require;
          if ( !isRelative && localRequire ) return localRequire(currentModulePath, true);
          if ( hasLoader ) return hasLoader(currentModulePath, true);
          throw new Error("Cannot locate dependency '" + currentModulePath + "'");
        }
        var moduleContainer = moduleMap[currentModulePath] = { exportObject: {} };
        packageStore[currentModulePath][0].call(
          moduleContainer.exportObject,
          function(dependencyPath){
            var dependencyRef = packageStore[currentModulePath][1][dependencyPath];
            return getModule(dependencyRef ? dependencyRef : dependencyPath);
          },
          moduleContainer,
          moduleContainer.exportObject,
          moduleLoader,
          packageStore,
          moduleMap,
          moduleIndex
        );
      }
      return moduleMap[currentModulePath].exportObject;
    }
    var hasLoader = typeof require === "function" && require;
    for ( var iterator = 0; iterator < moduleIndex.length; iterator++ ) {
      getModule(moduleIndex[iterator]);
    }
    return getModule;
  })({
    1:[function(requireDependency, currentModule, exportObject){
      /*
       * Copyright 2013-2014 Meta Platforms, Inc.
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
       * @moduleID FocusEnhancer
       * @typeChecks static-only
       */

      "use strict";

      var FocusEnhancer = {
        onMountComplete: function() {
          /* Check if the component's configuration requests auto-focus. */
          if (this.configuration.autoFocusFlag) {
            this.getHTMLElement().setFocus();
          }
        }
      };

      currentModule.exports = FocusEnhancer;

    },{}],
    2:[function(requireDependency, currentModule, exportObject){
      /*
       * Copyright 2013-2014 Meta Platforms, Inc.
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
       * @moduleID StyleAttributeUtilities
       */

      "use strict";

      /*
       * Defines CSS properties that accept numeric values but do not imply "px" units.
       */
      var numericStyleAttributes = {
        columnCount: 1,
        fillOpacity: 1,
        flex: 1,
        flexGrow: 1,
        flexShrink: 1,
        fontWeight: 1,
        lineClamp: 1,
        lineHeight: 1,
        opacity: 1,
        order: 1,
        orphans: 1,
        widows: 1,
        zIndex: 1,
        zoom: 1
      };

      /*
       * @param {string} vendorPrefix Vendor-specific prefix, e.g., "Webkit".
       * @param {string} attributeName Style property name, e.g., "transitionDuration".
       * @returns {string} Style property name prefixed with `vendorPrefix`, properly camelCased,
       *                   e.g., "WebkitTransitionDuration".
       */
      function generateVendorPrefixKey(vendorPrefix, attributeName) {
        return vendorPrefix + attributeName.charAt(0).toUpperCase() + attributeName.substring(1);
      }

      /*
       * Augment style names with various vendor prefixes to ensure broader compatibility.
       */
      var vendorPrefixesList = ['Webkit', 'ms', 'Moz', 'O'];

      /*
       * Using Object.keys here to avoid issues with IE8's for-in loop behavior,
       * which might iterate over newly added properties endlessly.
       */
      Object.keys(numericStyleAttributes).forEvery(function(propertyElement) {
        vendorPrefixesList.forEach(function(vendorPrefix) {
          numericStyleAttributes[generateVendorPrefixKey(vendorPrefix, propertyElement)] = numericStyleAttributes[propertyElement];
        });
      });

      /*
       * Most style properties can be cleared by setting .style[prop] = ''. However, IE8
       * has issues with shorthand properties. For those specific properties listed here,
       * we must unset each individual sub-property.
       * For example, see http://bugs.jquery.com/ticket/12385.
       * Interestingly, 4-value 'clock' properties (like margin, padding, border-width)
       * and list-style properties work without special handling.
       */
      var combinedStyleProperties = {
        background: {
          backgroundImage: 1,
          backgroundPosition: 1,
          backgroundRepeat: 1,
          backgroundColor: 1
        },
        border: {
          borderWidth: 1,
          borderStyle: 1,
          borderColor: 1
        },
        borderBottom: {
          borderBottomWidth: 1,
          borderBottomStyle: 1,
          borderBottomColor: 1
        },
        borderLeft: {
          borderLeftWidth: 1,
          borderLeftStyle: 1,
          borderLeftColor: 1
        },
        borderRight: {
          borderRightWidth: 1,
          borderRightStyle: 1,
          borderRightColor: 1
        },
        borderTop: {
          borderTopWidth: 1,
          borderTopStyle: 1,
          borderTopColor: 1
        },
        font: {
          fontStyle: 1,
          fontVariant: 1,
          fontWeight: 1,
          fontSize: 1,
          lineHeight: 1,
          fontFamily: 1
        }
      };

      var StyleAttributeUtilities = {
        numericStyleAttributes: numericStyleAttributes,
        combinedStyleProperties: combinedStyleProperties
      };

      currentModule.exports = StyleAttributeUtilities;

    },{}],
    3:[function(requireDependency, currentModule, exportObject){
      /*
       * Copyright 2013-2014 Meta Platforms, Inc.
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
       * @moduleID StyleManipulator
       * @typeChecks static-only
       */

      "use strict";

      var StyleAttributeUtilities = requireDependency("./CSSProperty");

      var unsafeStyleValueProcessor = requireDependency("./dangerousStyleValue");
      var sanitizeBrowserText = requireDependency("./escapeTextForBrowser");
      var convertCamelToKebab = requireDependency("./hyphenate");
      var cacheStringOperations = requireDependency("./memoizeStringOnly");

      var formatStyleName = cacheStringOperations(function(attributeDesignation) {
        return sanitizeBrowserText(convertCamelToKebab(attributeDesignation));
      });

      /*
       * Encapsulates operations for handling CSS properties.
       */
      var StyleManipulator = {

        /*
         * Converts a collection of style properties into a string suitable for inline styles:
         *
         *   > generateInlineStyleMarkup({width: '200px', height: 0})
         *   "width:200px;height:0;"
         *
         * Undefined values are ignored to facilitate declarative programming patterns.
         *
         * @param {object} styleDefinitions The object containing style properties.
         * @returns {?string} The generated CSS string or null if empty.
         */
        generateInlineStyleMarkup: function(styleDefinitions) {
          var outputString = '';
          for (var attributeDesignation in styleDefinitions) {
            if ( !styleDefinitions.hasOwnProperty(attributeDesignation) ) {
              continue;
            }
            var designationValue = styleDefinitions[attributeDesignation];
            if ( designationValue != null ) {
              outputString += formatStyleName(attributeDesignation) + ':';
              outputString += unsafeStyleValueProcessor(attributeDesignation, designationValue) + ';';
            }
          }
          return outputString || null;
        },

        /*
         * Assigns multiple style values to a DOM element. If a value is an empty string,
         * the corresponding style property will be cleared.
         *
         * @param {DOMElement} targetElement The DOM node to apply styles to.
         * @param {object} styleDefinitions The object containing style properties.
         */
        applyStylesToElement: function(targetElement, styleDefinitions) {
          var elementStyle = targetElement.style;
          for (var attributeDesignation in styleDefinitions) {
            if ( !styleDefinitions.hasOwnProperty(attributeDesignation) ) {
              continue;
            }
            var designationValue = unsafeStyleValueProcessor(attributeDesignation, styleDefinitions[attributeDesignation]);
            if ( designationValue ) {
              elementStyle[attributeDesignation] = designationValue;
            } else {
              var expandedProperties = StyleAttributeUtilities.combinedStyleProperties[attributeDesignation];
              if ( expandedProperties ) {
                /*
                 * This is a shorthand property that IE8 struggles to unset directly,
                 * so we iterate and clear each component property individually.
                 */
                for (var componentStyleName in expandedProperties) {
                  elementStyle[componentStyleName] = '';
                }
              } else {
                elementStyle[attributeDesignation] = '';
              }
            }
          }
        }

      };

      currentModule.exports = StyleManipulator;

    },{"./CSSProperty":2,"./dangerousStyleValue":94,"./escapeTextForBrowser":96,"./hyphenate":107,"./memoizeStringOnly":116}],
    4:[function(requireDependency, currentModule, exportObject){
      /*
       * Copyright 2013-2014 Meta Platforms, Inc.
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
       * @moduleID ValueChangePlug
       */

      "use strict";

      var EventConsts = requireDependency("./EventConstants");
      var PluginCentral = requireDependency("./EventPluginHub");
      var EventDistributors = requireDependency("./EventPropagators");
      var RuntimeEnv = requireDependency("./ExecutionEnvironment");
      var ComponentUpdates = requireDependency("./ReactUpdates");
      var GeneratedEvent = requireDependency("./SyntheticEvent");

      var checkEventCapability = requireDependency("./isEventSupported");
      var isInputControl = requireDependency("./isTextInputElement");
      var getKeyIdentifier = requireDependency("./keyOf");

      var upperTierTypes = EventConsts.topLevelTypes;

      var eventDefinitions = {
        valueChange: {
          registrationNamesPhased: {
            propagated: getKeyIdentifier({onValueChange: null}),
            intercepted: getKeyIdentifier({onValueChangeCapture: null})
          },
          requiredEvents: [
            upperTierTypes.topBlur,
            upperTierTypes.topChange,
            upperTierTypes.topClick,
            upperTierTypes.topFocus,
            upperTierTypes.topInput,
            upperTierTypes.topKeyDown,
            upperTierTypes.topKeyUp,
            upperTierTypes.topSelectionChange
          ]
        }
      };

      /*
       * Variables for IE compatibility shims.
       */
      var currentActiveElement = null;
      var currentActiveElementID = null;
      var currentActiveElementValue = null;
      var currentActiveElementValueDescriptor = null;

      /*
       * SECTION: Logic for handling the 'change' event.
       */
      function isChangeEventApplicable(domElement) {
        return (
          domElement.nodeName === 'SELECT' ||
          (domElement.nodeName === 'INPUT' && domElement.type === 'file')
        );
      }

      var canChangeEventPropagate = 0;
      if (RuntimeEnv.canUseDOM) {
        // Refer to `handleChange` comments below for context.
        canChangeEventPropagate = checkEventCapability('change') && (
          !('documentMode' in document) || document.documentMode > 8
        );
      }

      function triggerChangeEventManually(browserEvent) {
        var syntheticEvent = GeneratedEvent.getPooled(
          eventDefinitions.valueChange,
          currentActiveElementID,
          browserEvent
        );
        EventDistributors.accumulateTwoPhaseDispatches(syntheticEvent);

        /*
         * If change and propertychange events bubbled, we would simply bind to them
         * like other events via ReactEventTopLevelCallback. Since they do not,
         * we must manually listen for these events and then enqueue and process
         * the abstract event ourselves.
         *
         * Batching is essential here to ensure all event handlers complete
         * before the next component re-render (including handlers attached to
         * ancestor elements, not just the input itself). Without batching,
         * controlled components would not function correctly with event bubbling,
         * as the component would re-render and reset its value before all
         * handlers could execute. See https://github.com/facebook/react/issues/708.
         */
        ComponentUpdates.batchedUpdates(executeEventBatch, syntheticEvent);
      }

      function executeEventBatch(syntheticEvent) {
        PluginCentral.enqueueEvents(syntheticEvent);
        PluginCentral.processEventQueue();
      }

      function beginTrackingChangeIE8(eventTarget, eventTargetID) {
        currentActiveElement = eventTarget;
        currentActiveElementID = eventTargetID;
        currentActiveElement.attachEvent('onchange', triggerChangeEventManually);
      }

      function endTrackingChangeIE8() {
        if (!currentActiveElement) {
          return;
        }
        currentActiveElement.detachEvent('onchange', triggerChangeEventManually);
        currentActiveElement = null;
        currentActiveElementID = null;
      }

      function obtainTargetIDForChange(
          upperLevelType,
          upperLevelTarget,
          upperLevelTargetID) {
        if (upperLevelType === upperTierTypes.topChange) {
          return upperLevelTargetID;
        }
      }
      function processChangeEventsIE8(
          upperLevelType,
          upperLevelTarget,
          upperLevelTargetID) {
        if (upperLevelType === upperTierTypes.topFocus) {
          /*
           * endTracking() should technically be a no-op here, but we call it
           * defensively in case a blur event was somehow missed.
           */
          endTrackingChangeIE8();
          beginTrackingChangeIE8(upperLevelTarget, upperLevelTargetID);
        } else if (upperLevelType === upperTierTypes.topBlur) {
          endTrackingChangeIE8();
        }
      }


      /*
       * SECTION: Logic for handling the 'input' event.
       */
      var canInputEventBeUsed = 0;
      if (RuntimeEnv.canUseDOM) {
        /*
         * IE9 claims to support the input event but fails to trigger it on text deletion.
         * Therefore, we disregard its input events.
         */
        canInputEventBeUsed = checkEventCapability('input') && (
          !('documentMode' in document) || document.documentMode > 9
        );
      }

      /*
       * (For older IE.) Custom getter/setter for the `value` property
       * of the currently active element.
       */
      var updatedValueDescriptor =  {
        get: function() {
          return currentActiveElementValueDescriptor.get.call(this);
        },
        set: function(newValue) {
          // Convert to string for consistent equality checks.
          currentActiveElementValue = '' + newValue;
          currentActiveElementValueDescriptor.set.call(this, newValue);
        }
      };

      /*
       * (For older IE.) Initiates tracking of propertychange events on the given element
       * and overrides its `value` property to differentiate between user input and
       * programmatic value changes.
       */
      function initiateValueChangeMonitoring(eventTarget, eventTargetID) {
        currentActiveElement = eventTarget;
        currentActiveElementID = eventTargetID;
        currentActiveElementValue = eventTarget.value;
        currentActiveElementValueDescriptor = Object.getOwnPropertyDescriptor(
          eventTarget.constructor.prototype,
          'value'
        );

        Object.defineProperty(currentActiveElement, 'value', updatedValueDescriptor);
        currentActiveElement.attachEvent('onpropertychange', processPropertyModification);
      }

      /*
       * (For older IE.) Stops event listeners from the currently monitored element,
       * if any is being tracked.
       */
      function terminateValueChangeMonitoring() {
        if (!currentActiveElement) {
          return;
        }

        // Deleting restores the original property definition.
        delete currentActiveElement.value;
        currentActiveElement.detachEvent('onpropertychange', processPropertyModification);

        currentActiveElement = null;
        currentActiveElementID = null;
        currentActiveElementValue = null;
        currentActiveElementValueDescriptor = null;
      }

      /*
       * (For older IE.) Handles a `propertychange` event, dispatching a `change` event
       * if the active element's value has been altered.
       */
      function processPropertyModification(browserEvent) {
        if (browserEvent.propertyName !== 'value') {
          return;
        }
        var currentValue = browserEvent.srcElement.value;
        if (currentValue === currentActiveElementValue) {
          return;
        }
        currentActiveElementValue = currentValue;

        triggerChangeEventManually(browserEvent);
      }

      /*
       * If a `change` event should be triggered, this returns the target's ID.
       */
      function obtainTargetIDForInput(
          upperLevelType,
          upperLevelTarget,
          upperLevelTargetID) {
        if (upperLevelType === upperTierTypes.topInput) {
          /*
           * In modern browsers (i.e., not IE8 or IE9), the `input` event serves our purpose well,
           * so we proceed to trigger an abstract event.
           */
          return upperLevelTargetID;
        }
      }

      // Specific handling for IE8 and IE9.
      function processInputEventsIE(
          upperLevelType,
          upperLevelTarget,