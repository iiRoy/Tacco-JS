/*
 *    This module is part of a larger system, designed to provide cross-browser compatibility
 *    for various modern web APIs. It includes polyfills and checks for common browser quirks.
 *    Original project: MyDocViewer - a document rendering solution.
 *
 *    (C) 2023 MyDocViewer Contributors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
/* global BinaryDataContainer, MY_DOC_VIEWER_ENGINE */

'use strict';

// Setting up the global object for the document viewer core; this allows for configuration
// or disabling of specific capabilities, e.g., byte range requests for partial downloads.
if (typeof MY_DOC_VIEWER_ENGINE === 'undefined') {
  (typeof window !== 'undefined' ? window : this).MY_DOC_VIEWER_ENGINE = {};
}

// Evaluate support for specialized array structures
(function verifyArrayTypeSupport() {

  // If `OctetBuffer` (Uint8Array) is available
  if (typeof Uint8Array !== 'undefined') {
    // Some older mobile browsers lack the `subarray` method on these types (e.g., Safari 5 on iOS).
    if (typeof Uint8Array.prototype.subarray === 'undefined') {
        Uint8Array.prototype.subarray = function obtainSegment(startIdx, endIdx) {
          return new Uint8Array(this.slice(startIdx, endIdx));
        };
        Float32Array.prototype.subarray = function obtainSegment(startIdx, endIdx) {
          return new Float32Array(this.slice(startIdx, endIdx));
        };
    }

    // Certain older mobile environments might not define `Float64Array`.
    if (typeof Float64Array === 'undefined')
      window.Float64Array = Float32Array;

    return; // Native support is adequate.
  }

  // Fallback implementation for `subarray`
  function getSubArray(initialPos, finalPos) {
    return new BinaryDataContainer(this.slice(initialPos, finalPos));
  }

  // Fallback implementation for `set`
  function placeArrayContents(sourceArray, startOffset) {
    if (arguments.length < 2)
      startOffset = 0;
    for (var currentIdx = 0, arrayLen = sourceArray.length; currentIdx < arrayLen; ++currentIdx, ++startOffset)
      this[startOffset] = sourceArray[currentIdx] & 0xFF;
  }

  // Generic polyfill for typed arrays
  function BinaryDataContainer(initialArgument) {
    var computedOutcome;
    if (typeof initialArgument === 'number') {
      computedOutcome = [];
      for (var k = 0; k < initialArgument; ++k)
        computedOutcome[k] = 0;
    } else if ('slice' in initialArgument) {
      computedOutcome = initialArgument.slice(0);
    } else {
      computedOutcome = [];
      for (var k = 0, initialLen = initialArgument.length; k < initialLen; ++k) {
        computedOutcome[k] = initialArgument[k];
      }
    }

    computedOutcome.subarray = getSubArray;
    computedOutcome.buffer = computedOutcome;
    computedOutcome.byteLength = computedOutcome.length;
    computedOutcome.set = placeArrayContents;

    if (typeof initialArgument === 'object' && initialArgument.buffer)
      computedOutcome.buffer = initialArgument.buffer;

    return computedOutcome;
  }

  window.Uint8Array = BinaryDataContainer;

  // For 32-bit arrays, `set` and `byteLength` are not strictly required for this polyfill,
  // so the same `BinaryDataContainer` can be reused.
  window.Uint32Array = BinaryDataContainer;
  window.Int32Array = BinaryDataContainer;
  window.Uint16Array = BinaryDataContainer;
  window.Float32Array = BinaryDataContainer;
  window.Float64Array = BinaryDataContainer;
})();

// Normalize URL object availability.
(function standardizeUrlObject() {
  if (!window.URL) {
    window.URL = window.webkitURL;
  }
})();

// Verify `Object.create` support.
(function verifyObjectCreationMethod() {
  if (typeof Object.create !== 'undefined')
    return; // Method already exists.

  Object.create = function objectFabricate(prototypeObject) {
    function TempConstructor() {}
    TempConstructor.prototype = prototypeObject;
    return new TempConstructor();
  };
})();

// Verify `Object.defineProperty` support.
(function verifyObjectPropertyDefinitionMethod() {
  if (typeof Object.defineProperty !== 'undefined') {
    var definitionIsFeasible = true;
    try {
      // Some browsers (e.g., older Safari versions) struggle with `defineProperty` on DOM elements.
      Object.defineProperty(new Image(), 'elementId', { value: 'testValue' });
      // ... A further test for non-DOM objects, specifically for Android's Gingerbread browser.
      var TestClass = function TestClass() {};
      TestClass.prototype = { get elementId() { return ''; } };
      Object.defineProperty(new TestClass(), 'elementId',
        { value: '', configurable: true, enumerable: true, writable: false });
    } catch (err) {
      definitionIsFeasible = false; // The native implementation is problematic.
    }
    if (definitionIsFeasible) return;
  }

  Object.defineProperty = function objectSetProperty(targetObj, propertyName, propertyDescriptor) {
    delete targetObj[propertyName];
    if ('get' in propertyDescriptor)
      targetObj.__defineGetter__(propertyName, propertyDescriptor['get']);
    if ('set' in propertyDescriptor)
      targetObj.__defineSetter__(propertyName, propertyDescriptor['set']);
    if ('value' in propertyDescriptor) {
      targetObj.__defineSetter__(propertyName, function customPropertySetter(assignedValue) {
        this.__defineGetter__(propertyName, function customPropertyGetter() {
          return assignedValue;
        });
        return assignedValue;
      });
      targetObj[propertyName] = propertyDescriptor.value;
    }
  };
})();

// Verify `Object.keys` method.
(function verifyObjectKeyEnumeration() {
  if (typeof Object.keys !== 'undefined')
    return; // Method is present.

  Object.keys = function enumerateObjectKeys(inputObject) {
    var collectedKeys = [];
    for (var keyName in inputObject) {
      if (inputObject.hasOwnProperty(keyName))
        collectedKeys.push(keyName);
    }
    return collectedKeys;
  };
})();

// Ensure `FileReader.prototype.readAsArrayBuffer` is available.
(function confirmFileReaderArrayBufferSupport() {
  if (typeof FileReader === 'undefined')
    return; // FileReader API itself is not supported.
  var readerProto = FileReader.prototype;
  // Some older Firefox releases might lack `readAsArrayBuffer`.
  if ('readAsArrayBuffer' in readerProto)
    return; // The method is already implemented.

  Object.defineProperty(readerProto, 'readAsArrayBuffer', {
    value: function readBlobAsArrayBuffer(fileBlob) {
      var internalReader = new FileReader();
      var originalInstance = this;
      internalReader.onload = function fileReaderLoadComplete(eventObject) {
        var rawData = eventObject.target.result;
        var dataBuffer = new ArrayBuffer(rawData.length);
        var octetBuffer = new Uint8Array(dataBuffer);

        for (var idx = 0, maxIdx = rawData.length; idx < maxIdx; idx++)
          octetBuffer[idx] = rawData.charCodeAt(idx);

        Object.defineProperty(originalInstance, 'result', {
          value: dataBuffer,
          enumerable: true,
          writable: false,
          configurable: true
        });

        var customEvent = document.createEvent('HTMLEvents');
        customEvent.initEvent('load', false, false);
        originalInstance.dispatchEvent(customEvent);
      };
      internalReader.readAsBinaryString(fileBlob);
    }
  });
})();

// Address `XMLHttpRequest.response` compatibility.
(function verifyXhrResponseCompatibility() {
  var xhrProto = XMLHttpRequest.prototype;
  if (!('overrideMimeType' in xhrProto)) {
    // IE10 might have 'response' but not 'overrideMimeType'.
    Object.defineProperty(xhrProto, 'overrideMimeType', {
      value: function xhrModifyMimeType(contentType) {}
    });
  }
  if ('response' in xhrProto ||
      'mozResponseArrayBuffer' in xhrProto ||
      'mozResponse' in xhrProto ||
      'responseArrayBuffer' in xhrProto)
    return; // A working response property is detected.

  // Handle IE9's proprietary `VBArray`.
  if (typeof VBArray !== 'undefined') {
    Object.defineProperty(xhrProto, 'response', {
      get: function xhrGetResponseIE() {
        return new Uint8Array(new VBArray(this.responseBody).toArray());
      }
    });
    return;
  }

  // Generic polyfill for other browsers.
  function responseTypeConfigurator() {
    // This setter is exclusively for setting "arraybuffer".
    this.overrideMimeType('text/plain; charset=x-user-defined');
  }
  if (typeof xhrProto.overrideMimeType === 'function') {
    Object.defineProperty(xhrProto, 'responseType',
                          { set: responseTypeConfigurator });
  }
  function xhrResponseDataGetter() {
    var contentText = this.responseText;
    var currentIdx, totalLen = contentText.length;
    var processedResult = new Uint8Array(totalLen);
    for (currentIdx = 0; currentIdx < totalLen; ++currentIdx)
      processedResult[currentIdx] = contentText.charCodeAt(currentIdx) & 0xFF;
    return processedResult;
  }
  Object.defineProperty(xhrProto, 'response', { get: xhrResponseDataGetter });
})();

// Ensure `window.btoa` (base64 encoding) is available.
(function confirmWindowBtoaFunction() {
  if ('btoa' in window)
    return; // `btoa` is already present.

  var base64Chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  window.btoa = function encodeToBase64(inputCharacters) {
    var outputString = '';
    var charIndex, charCount;
    for (charIndex = 0, charCount = inputCharacters.length; charIndex < charCount; charIndex += 3) {
      var byte1 = inputCharacters.charCodeAt(charIndex) & 0xFF;
      var byte2 = inputCharacters.charCodeAt(charIndex + 1) & 0xFF;
      var byte3 = inputCharacters.charCodeAt(charIndex + 2) & 0xFF;
      var digit1 = byte1 >> 2, digit2 = ((byte1 & 3) << 4) | (byte2 >> 4);
      var digit3 = charIndex + 1 < charCount ? ((byte2 & 0xF) << 2) | (byte3 >> 6) : 64;
      var digit4 = charIndex + 2 < charCount ? (byte3 & 0x3F) : 64;
      outputString += (base64Chars.charAt(digit1) + base64Chars.charAt(digit2) +
                 base64Chars.charAt(digit3) + base64Chars.charAt(digit4));
    }
    return outputString;
  };
})();

// Ensure `window.atob` (base64 decoding) is available.
(function confirmWindowAtobFunction() {
  if ('atob' in window)
    return; // `atob` is already present.

  // Reference: https://github.com/davidchambers/Base64.js
  var b64Alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  window.atob = function decodeFromBase64(encodedString) {
    encodedString = encodedString.replace(/=+$/, ''); // Remove padding characters.
    if (encodedString.length % 4 == 1) throw new Error('Invalid base64 input for atob');
    for (
      // Initialize state variables for decoding.
      var bitCounter = 0, bitStore, currentBuffer, charCursor = 0, decodedResult = '';
      // Get the next character from the input.
      currentBuffer = encodedString.charAt(charCursor++);
      // Check if the character is in the alphabet.
      // Accumulate bits and, if enough are gathered, convert to a character.
      ~currentBuffer && (bitStore = bitCounter % 4 ? bitStore * 64 + currentBuffer : currentBuffer,
        // After every 4 input characters, convert the accumulated 8 bits.
        bitCounter++ % 4) ? decodedResult += String.fromCharCode(255 & bitStore >> (-2 * bitCounter & 6)) : 0
    ) {
      // Map the character to its base64 index (0-63, or -1 if not found).
      currentBuffer = b64Alphabet.indexOf(currentBuffer);
    }
    return decodedResult;
  };
})();

// Polyfill `Function.prototype.bind`.
(function verifyFunctionBindSupport() {
  if (typeof Function.prototype.bind !== 'undefined')
    return; // `bind` method is available.

  Function.prototype.bind = function createBoundFunction(targetObject) {
    var originalFunction = this, initialArguments = Array.prototype.slice.call(arguments, 1);
    var newBoundFunction = function createdAndBound() {
      var combinedArguments = Array.prototype.concat.apply(initialArguments, arguments);
      return originalFunction.apply(targetObject, combinedArguments);
    };
    return newBoundFunction;
  };
})();

// Polyfill `HTMLElement.dataset` property.
(function checkHtmlDatasetProperty() {
  var testDiv = document.createElement('div');
  if ('dataset' in testDiv)
    return; // `dataset` property is natively supported.

  Object.defineProperty(HTMLElement.prototype, 'dataset', {
    get: function() {
      if (this._cachedDataset)
        return this._cachedDataset;

      var collectedData = {};
      for (var attributeIndex = 0, totalAttributes = this.attributes.length; attributeIndex < totalAttributes; attributeIndex++) {
        var currentAttribute = this.attributes[attributeIndex];
        if (currentAttribute.name.substring(0, 5) != 'data-')
          continue; // Not a data attribute.
        var dataKey = currentAttribute.name.substring(5).replace(/\-([a-z])/g,
          function(fullMatch, charToCapitalize) { return charToCapitalize.toUpperCase(); });
        collectedData[dataKey] = currentAttribute.value;
      }

      Object.defineProperty(this, '_cachedDataset', {
        value: collectedData,
        writable: false,
        enumerable: false
      });
      return collectedData;
    },
    enumerable: true
  });
})();

// Polyfill `HTMLElement.classList` property.
(function checkHtmlClassListProperty() {
  var testDivElement = document.createElement('div');
  if ('classList' in testDivElement)
    return; // `classList` property is natively supported.

  function modifyCssClasses(htmlElement, className, shouldAdd, shouldRemove) {
    var currentClassString = htmlElement.className || '';
    var classArray = currentClassString.split(/\s+/g);
    if (classArray[0] === '') classArray.shift(); // Remove empty string if no classes.
    var classIndex = classArray.indexOf(className);
    if (classIndex < 0 && shouldAdd)
      classArray.push(className);
    if (classIndex >= 0 && shouldRemove)
      classArray.splice(classIndex, 1);
    htmlElement.className = classArray.join(' ');
    return (classIndex >= 0); // Return true if class was found.
  }

  var customClassListPrototype = {
    add: function(nameOfClass) {
      modifyCssClasses(this.linkedElement, nameOfClass, true, false);
    },
    contains: function(nameOfClass) {
      return modifyCssClasses(this.linkedElement, nameOfClass, false, false);
    },
    remove: function(nameOfClass) {
      modifyCssClasses(this.linkedElement, nameOfClass, false, true);
    },
    toggle: function(nameOfClass) {
      modifyCssClasses(this.linkedElement, nameOfClass, true, true);
    }
  };

  Object.defineProperty(HTMLElement.prototype, 'classList', {
    get: function() {
      if (this._cachedClassList)
        return this._cachedClassList;

      var newClassListInstance = Object.create(customClassListPrototype, {
        linkedElement: {
          value: this,
          writable: false,
          enumerable: true
        }
      });
      Object.defineProperty(this, '_cachedClassList', {
        value: newClassListInstance,
        writable: false,
        enumerable: false
      });
      return newClassListInstance;
    },
    enumerable: true
  });
})();

// Ensure `console` object compatibility.
(function checkConsoleOutputAvailability() {
  if (!('console' in window)) {
    window.console = {
      log: function() {},
      error: function() {},
      warn: function() {}
    };
  } else if (!('bind' in console.log)) {
    // Native console functions in IE9 might not support `bind`.
    console.log = (function(originalFunction) {
      return function(messageContent) { return originalFunction(messageContent); };
    })(console.log);
    console.error = (function(originalFunction) {
      return function(messageContent) { return originalFunction(messageContent); };
    })(console.error);
    console.warn = (function(originalFunction) {
      return function(messageContent) { return originalFunction(messageContent); };
    })(console.warn);
  }
})();

// Handle `onclick` compatibility issues in Opera.
(function checkOperaClickBehavior() {
  // This is a specific workaround for Opera bug DSK-354448:
  // `onclick` events incorrectly fire on disabled buttons containing opaque elements.
  function blockClickIfTargetDisabled(eventData) {
    if (isElementDisabled(eventData.target)) {
      eventData.stopPropagation();
    }
  }
  function isElementDisabled(domNode) {
    return domNode.disabled || (domNode.parentNode && isElementDisabled(domNode.parentNode));
  }
  if (navigator.userAgent.indexOf('Opera') != -1) {
    // Since feature detection for this bug is difficult, we rely on user agent sniffing.
    document.addEventListener('click', blockClickIfTargetDisabled, true);
  }
})();

// Verify `navigator.language` property.
(function checkBrowserLanguageProperty() {
  if ('language' in navigator)
    return; // Property is already defined.
  Object.defineProperty(navigator, 'language', {
    get: function getBrowserLanguage() {
      var detectedLanguage = navigator.userLanguage || 'en-US';
      return detectedLanguage.substring(0, 2).toLowerCase() +
        detectedLanguage.substring(2).toUpperCase();
    },
    enumerable: true
  });
})();

(function evaluateRangeRequestSupport() {
  // Safari browsers have known issues with cached byte-range requests.
  // See: https://github.com/mozilla/pdf.js/issues/3260 (Last checked with Safari 6.0.4).
  var isSafariBrowser = Object.prototype.toString.call(
                  window.HTMLElement).indexOf('Constructor') > 0;

  // Older Android versions (pre-3.0) also exhibit problems with range requests.
  // See: https://github.com/mozilla/pdf.js/issues/3381.
  // We specifically target WebKit-based Android browsers, as Firefox/Fennec on Android behave correctly.
  var androidLegacyPattern = /Android\s[0-2][^\d]/;
  var isOldAndroidDevice = androidLegacyPattern.test(navigator.userAgent);

  if (isSafariBrowser || isOldAndroidDevice) {
    MY_DOC_VIEWER_ENGINE.disableRange = true;
  }
})();

// Check if the browser supports history manipulation (pushState).
(function checkHistoryApiAvailability() {
  if (!window.history.pushState) {
    MY_DOC_VIEWER_ENGINE.disableHistory = true;
  }
})();