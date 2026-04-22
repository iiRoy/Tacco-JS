/*
 * Core Framework v0.11.1
 */
!function(globalObject){
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = globalObject();
  } else if (typeof define === "function" && define.amd) {
    define([], globalObject);
  } else {
    var libraryTarget;
    if (typeof window !== "undefined") {
      libraryTarget = window;
    } else if (typeof global !== "undefined") {
      libraryTarget = global;
    } else if (typeof self !== "undefined") {
      libraryTarget = self;
    }
    libraryTarget.CoreFramework = globalObject();
  }
}(function(){
  var definitionProvider, moduleInterface, exportInterface;
  return (function moduleLoader(moduleDefinitions, moduleCache, requiredModuleIDs){
    function resolveModule(moduleIdentifier, requestFromParent){
      if (!moduleCache[moduleIdentifier]){
        if (!moduleDefinitions[moduleIdentifier]){
          var globalRequire = typeof require === "function" && require;
          if (!requestFromParent && globalRequire) return globalRequire(moduleIdentifier, true);
          if (moduleLoaderInstance) return moduleLoaderInstance(moduleIdentifier, true);
          throw new Error("Cannot locate module '" + moduleIdentifier + "'");
        }
        var moduleObject = moduleCache[moduleIdentifier] = {exports:{}};
        moduleDefinitions[moduleIdentifier][0].call(moduleObject.exports, function(depPath){
          var resolvedDep = moduleDefinitions[moduleIdentifier][1][depPath];
          return resolveModule(resolvedDep ? resolvedDep : depPath);
        }, moduleObject, moduleObject.exports, moduleLoader, moduleDefinitions, moduleCache, requiredModuleIDs);
      }
      return moduleCache[moduleIdentifier].exports;
    }
    var moduleLoaderInstance = typeof require === "function" && require;
    for (var i = 0; i < requiredModuleIDs.length; i++) resolveModule(requiredModuleIDs[i]);
    return resolveModule(requiredModuleIDs[0]);
  })({1:[function(fetchModule, moduleOutput, exportContents){
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
 * @module ElementFocusHelper
 * @checks static-only
 */

"use strict";

var activateElement = fetchModule("./activateElement");

var ElementFocusHelper = {
  // Invoked after the component has been mounted to the DOM.
  onComponentMounted: function() {
    if (this.properties.automaticFocus) {
      activateElement(this.retrieveDOMElement());
    }
  }
};

moduleOutput.exports = ElementFocusHelper;

},{"./activateElement":106}],2:[function(fetchModule, moduleOutput, exportContents){
/*
 * Copyright 2013 Meta Platforms, Inc.
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
 * @module PreInputEventHandler
 * @checks static-only
 */

"use strict";

var EventTypeNames      = fetchModule("./EventTypeNames");
var EventDistributors   = fetchModule("./EventDistributors");
var RuntimeContext      = fetchModule("./RuntimeContext");
var VirtualInputEvent   = fetchModule("./VirtualInputEvent");

var propertyIdentifier  = fetchModule("./propertyIdentifier");

var isTextInputEventSupported = (
  RuntimeContext.canUseBrowserDOM &&
  'TextEvent' in window &&
  !('documentMode' in document || isLegacyOpera())
);

/**
 * Opera versions up to 12 support TextEvent in window, but do not properly fire
 * text input events. For these, we must rely on the keypress event.
 */
function isLegacyOpera() {
  var browserOpera = window.opera;
  return (
    typeof browserOpera === 'object' &&
    typeof browserOpera.version === 'function' &&
    parseInt(browserOpera.version(), 10) <= 12
  );
}

var KEY_SPACE_CODE = 32;
var KEY_SPACE_CHAR = String.fromCharCode(KEY_SPACE_CODE);

var rootLevelTypes = EventTypeNames.rootLevelTypes;

// Event definitions and their associated registration names.
var inputEventDefinitions = {
  preInput: {
    stagedRegistrationNames: {
      bubbled: propertyIdentifier({onPreInput: null}),
      captured: propertyIdentifier({onPreInputCapture: null})
    },
    requiredEvents: [
      rootLevelTypes.rootCompositionFinish,
      rootLevelTypes.rootKeyStrike,
      rootLevelTypes.rootTextInput,
      rootLevelTypes.rootPaste
    ]
  }
};

// Storage for characters pending insertion from keypress or composition.
var bufferedCharacters = null;

/**
 * Determines if a native keypress event should be considered a command.
 * This distinction is necessary because Firefox triggers `keypress` for system commands
 * (like cut, copy, or select-all) even when no actual character is input.
 */
function isKeyboardCommand(browserEvent) {
  return (
    (browserEvent.ctrlKey || browserEvent.altKey || browserEvent.metaKey) &&
    // The combination of ctrlKey and altKey often indicates AltGr, which is not a command.
    !(browserEvent.ctrlKey && browserEvent.altKey)
  );
}

/**
 * Generates an `onPreInput` event, aligning with the W3C draft for input events:
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event handler leverages the native `textInput` event, which is available
 * in modern browsers like Chrome, Safari, Opera, and IE. This event fires
 * after `onKeyPress` and `onCompositionEnd`, but prior to `onInput`.
 *
 * While `beforeInput` is specified in standards, it's not widely implemented.
 * The `input` event also lacks detailed information about the actual characters
 * inserted. Therefore, `textInput` is the preferred mechanism to capture
 * characters inserted into the target DOM node.
 */
var PreInputEventHandler = {

  inputEventDefinitions: inputEventDefinitions,

  /**
   * @param {string} sourceEventType The type of the top-level event from `EventTypeNames`.
   * @param {DOMEventTarget} sourceTargetElement The root DOM node where the event listener is attached.
   * @param {string} sourceTargetIdentifier The unique ID of the `sourceTargetElement`.
   * @param {object} browserEvent The original native browser event.
   * @return {*} A collection of synthetic events to be dispatched.
   * @see {EventPluginHub.extractEvents}
   */
  processRawEvents: function(
      sourceEventType,
      sourceTargetElement,
      sourceTargetIdentifier,
      browserEvent) {

    var inputCharacters;

    if (isTextInputEventSupported) {
      switch (sourceEventType) {
        case rootLevelTypes.rootKeyStrike:
          /**
           * If native `textInput` events are available, we aim to utilize them.
           * However, a specific edge case involves the spacebar key.
           * In Webkit, preventing the default action on a spacebar `textInput` event
           * prevents character insertion but also triggers the browser's default
           * spacebar behavior, which is page scrolling.
           *
           * This issue is being tracked at:
           * https://code.google.com/p/chromium/issues/detail?id=355103
           *
           * To circumvent this problem, the keypress event is used for spacebar,
           * as if `textInput` events were not available for this specific key.
           */
          var keyCodeValue = browserEvent.which;
          if (keyCodeValue !== KEY_SPACE_CODE) {
            return;
          }

          inputCharacters = String.fromCharCode(keyCodeValue);
          break;

        case rootLevelTypes.rootTextInput:
          // Capture the characters intended for addition to the DOM.
          inputCharacters = browserEvent.data;

          // If the character is a spacebar character, it means we've already
          // processed it at the keypress level, so we exit early.
          if (inputCharacters === KEY_SPACE_CHAR) {
            return;
          }

          // Otherwise, continue processing.
          break;

        default:
          // For any other types of native events, no action is required.
          return;
      }
    } else {
      switch (sourceEventType) {
        case rootLevelTypes.rootPaste:
          // If a paste event occurs shortly after a keypress, discard any pending
          // input characters. Paste events should not trigger PreInput events.
          bufferedCharacters = null;
          break;
        case rootLevelTypes.rootKeyStrike:
          /**
           * As of Firefox v27, keypress events can fire even when no character
           * will actually be inserted. Several scenarios exist:
           *
           * - `which` is `0`. This applies to arrow keys, the Escape key, etc.
           *
           * - `which` contains the pressed key code, but no character is generated.
           *   For example, 'AltGr + d' in Polish layouts. No modified character
           *   results, and no character is inserted into the document, but Firefox
           *   still fires a keypress for char code `100`. No `input` event will follow.
           *
           * - `which` contains the pressed key code, but a command combination
           *   is being used (e.g., `Cmd+C`). No character is inserted, and no
           *   `input` event will occur.
           */
          if (browserEvent.which && !isKeyboardCommand(browserEvent)) {
            bufferedCharacters = String.fromCharCode(browserEvent.which);
          }
          break;
        case rootLevelTypes.rootCompositionFinish:
          bufferedCharacters = browserEvent.data;
          break;
      }

      // If no changes have accumulated in the fallback buffer, it means no relevant
      // event has fired, and we can stop processing.
      if (bufferedCharacters === null) {
        return;
      }

      inputCharacters = bufferedCharacters;
    }

    // If no characters are to be inserted, no PreInput event should be triggered.
    if (!inputCharacters) {
      return;
    }

    var syntheticEvent = VirtualInputEvent.getEventInstance(
      inputEventDefinitions.preInput,
      sourceTargetIdentifier,
      browserEvent
    );

    syntheticEvent.payload = inputCharacters;
    bufferedCharacters = null;
    EventDistributors.collectAndPropagate(syntheticEvent);
    return syntheticEvent;
  }
};

moduleOutput.exports = PreInputEventHandler;

},{"./EventTypeNames":15,"./EventDistributors":20,"./RuntimeContext":21,"./VirtualInputEvent":86,"./propertyIdentifier":127}],3:[function(fetchModule, moduleOutput, exportContents){
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
 * @module StylePropertyInfo
 */

"use strict";

/**
 * CSS properties that accept numeric values but do not imply "px" units.
 */
var numericStyleProperties = {
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
 * Creates a vendor-prefixed style key.
 *
 * @param {string} vendorPrefix Vendor-specific prefix, e.g., "Webkit".
 * @param {string} styleName The base style name, e.g., "transitionDuration".
 * @return {string} The style name prefixed with `vendorPrefix`, correctly camelCased,
 *                  e.g., "WebkitTransitionDuration".
 */
function createVendorPrefixedKey(vendorPrefix, styleName) {
  return vendorPrefix + styleName.charAt(0).toUpperCase() + styleName.substring(1);
}

/**
 * Vendor prefixes used for style properties.
 */
var vendorPrefixes = ['Webkit', 'ms', 'Moz', 'O'];

// To ensure consistent behavior, we iterate over the known unitless properties
// and add their vendor-prefixed variants to the `numericStyleProperties` map.
// Using `Object.keys` here prevents infinite loops in older IE versions
// when iterating over newly added properties.
Object.keys(numericStyleProperties).forEach(function(styleProperty) {
  vendorPrefixes.forEach(function(vendor) {
    numericStyleProperties[createVendorPrefixedKey(vendor, styleProperty)] = numericStyleProperties[styleProperty];
  });
});

/**
 * Shorthand style properties that IE8 struggles to unset with `element.style[prop] = ''`.
 * For these, individual sub-properties must be unset.
 * Properties like `margin`, `padding`, `border-width` (4-value clock properties)
 * and `list-style` generally work fine.
 */
var expandedStyleProperties = {
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

var StylePropertyInfo = {
  numericStyleProperties: numericStyleProperties,
  expandedStyleProperties: expandedStyleProperties
};

moduleOutput.exports = StylePropertyInfo;

},{}],4:[function(fetchModule, moduleOutput, exportContents){
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
 * @module StyleManipulationUtilities
 * @checks static-only
 */

"use strict";

var StylePropertyInfo       = fetchModule("./StylePropertyInfo");

var formatDangerousStyleValue = fetchModule("./formatDangerousStyleValue");
var dashCaseStyleName       = fetchModule("./dashCaseStyleName");
var cacheStringResult       = fetchModule("./cacheStringResult");

var formatStyleKey = cacheStringResult(function(styleKey) {
  return dashCaseStyleName(styleKey);
});

/**
 * Utility functions for handling CSS properties.
 */
var StyleManipulationUtilities = {

  /**
   * Serializes a map of style properties into a string suitable for inline styles:
   *
   *   > generateStyleMarkup({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined or null values are ignored for easier declarative style declarations.
   * The resulting string must be HTML-escaped before insertion into the DOM.
   *
   * @param {object} styleObject An object mapping style property names to their values.
   * @return {?string} The serialized style string, or null if empty.
   */
  generateStyleMarkup: function(styleObject) {
    var markupString = '';
    for (var propName in styleObject) {
      if (!styleObject.hasOwnProperty(propName)) {
        continue;
      }
      var currentValue = styleObject[propName];
      if (currentValue != null) {
        markupString += formatStyleKey(propName) + ':';
        markupString += formatDangerousStyleValue(propName, currentValue) + ';';
      }
    }
    return markupString || null;
  },

  /**
   * Applies multiple style values to a given DOM element. If a value is an empty
   * string (''), the corresponding style property will be unset.
   *
   * @param {DOMElement} domElement The DOM node to apply styles to.
   * @param {object} styleObject An object mapping style property names to their values.
   */
  applyStylesToElement: function(domElement, styleObject) {
    var elementStyle = domElement.style;
    for (var propName in styleObject) {
      if (!styleObject.hasOwnProperty(propName)) {
        continue;
      }
      var formattedValue = formatDangerousStyleValue(propName, styleObject[propName]);
      if (formattedValue) {
        elementStyle[propName] = formattedValue;
      } else {
        var expansion = StylePropertyInfo.expandedStyleProperties[propName];
        if (expansion) {
          // This is a shorthand property that IE8 struggles to unset.
          // We unset each individual component property to ensure compatibility.
          for (var subPropertyName in expansion) {
            elementStyle[subPropertyName] = '';
          }
        } else {
          elementStyle[propName] = '';
        }
      }
    }
  }

};

moduleOutput.exports = StyleManipulationUtilities;

},{"./StylePropertyInfo":3,"./formatDangerousStyleValue":101,"./dashCaseStyleName":118,"./cacheStringResult":129}],5:[function(fetchModule, moduleOutput, exportContents){
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
 * @module EventQueueProcessor
 */