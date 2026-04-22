/* This file contains polyfills and compatibility fixes for various browser environments.
 * It ensures that certain modern JavaScript features and DOM APIs are available,
 * or provides equivalent fallback implementations where they are not natively supported.
 *
 * This code is part of a document rendering library, ensuring broad compatibility.
 */

'use strict';

// Establish a global object for library-specific configurations.
// This allows for dynamic adjustments to core functionalities.
if (typeof globalThis.DOC_LIB_CORE === 'undefined') {
  globalThis.DOC_LIB_CORE = {};
}

// Verify and enhance support for binary arrays (Typed Arrays).
// This is crucial for efficient data handling in the library.
(function verifyBinaryBufferSupport() {
  const rootScope = globalThis; // Use globalThis for environment consistency.

  if (typeof rootScope.Uint8Array !== 'undefined') {
    // Some older mobile environments might lack 'subarray' method.
    // We add it as a polyfill if missing.
    if (typeof rootScope.Uint8Array.prototype.subarray === 'undefined') {
      rootScope.Uint8Array.prototype.subarray = function subSlice(startPoint, endPoint) {
        return new Uint8Array(this.slice(startPoint, endPoint));
      };
      rootScope.Float32Array.prototype.subarray = function subSlice(startPoint, endPoint) {
        return new Float32Array(this.slice(startPoint, endPoint));
      };
      if (rootScope.console) rootScope.console.debug('Binary array subarray polyfilled.');
    }

    // Handle cases where Float64Array might be absent.
    if (typeof rootScope.Float64Array === 'undefined') {
      rootScope.Float64Array = rootScope.Float32Array; // Fallback to 32-bit floats.
      if (rootScope.console) rootScope.console.debug('Float64Array polyfilled with Float32Array.');
    }
    return; // Native support is sufficient or polyfilled.
  }

  // Fallback implementation for Typed Arrays if not available at all.
  function customSubArray(beginOffset, endOffset) {
    return new CustomNumericArray(this.slice(beginOffset, endOffset));
  }

  function assignArrayContent(sourceArray, startPosition) {
    let currentOffset = startPosition || 0; // Default to 0 if not provided.
    for (let i = 0, len = sourceArray.length; i < len; ++i, ++currentOffset) {
      this[currentOffset] = sourceArray[i] & 0xFF; // Ensure byte range.
    }
  }

  function CustomNumericArray(initialArg) {
    let internalData;
    if (typeof initialArg === 'number') {
      internalData = Array(initialArg).fill(0); // Initialize with zeros.
    } else if (initialArg && 'slice' in initialArg) {
      internalData = initialArg.slice(0); // Copy existing array-like content.
    } else {
      internalData = [];
      if (initialArg && initialArg.length) {
        for (let k = 0, total = initialArg.length; k < total; ++k) {
          internalData[k] = initialArg[k];
        }
      }
    }

    internalData.subarray = customSubArray;
    internalData.buffer = internalData; // Self-reference for buffer property.
    internalData.byteLength = internalData.length;
    internalData.set = assignArrayContent;

    if (initialArg && typeof initialArg === 'object' && initialArg.buffer) {
      internalData.buffer = initialArg.buffer; // Preserve original buffer reference if available.
    }

    return internalData;
  }

  // Assign custom implementation to global Typed Array constructors.
  rootScope.Uint8Array = CustomNumericArray;
  rootScope.Uint32Array = CustomNumericArray;
  rootScope.Int32Array = CustomNumericArray;
  rootScope.Uint16Array = CustomNumericArray;
  rootScope.Float32Array = CustomNumericArray;
  rootScope.Float64Array = CustomNumericArray;

  if (rootScope.console) rootScope.console.warn('Full Typed Array polyfill engaged due to lack of native support.');
})();

// Ensure 'URL' object is available, falling back to 'webkitURL' if necessary.
(function standardizeURLObject() {
  const currentScope = globalThis;
  if (!currentScope.URL) {
    currentScope.URL = currentScope.webkitURL;
    if (currentScope.console && currentScope.URL) {
      currentScope.console.info('URL object polyfilled using webkitURL.');
    } else if (currentScope.console) {
      currentScope.console.error('URL object not found or polyfill failed.');
    }
  }
})();

// Provide Object.create polyfill for older environments.
(function polyfillObjectCreationMethod() {
  if (typeof Object.create !== 'undefined') {
    return; // Native implementation exists.
  }

  Object.create = function createObjectShim(prototypeObject) {
    if (typeof prototypeObject !== 'object' && prototypeObject !== null) {
      throw new TypeError('Object prototype may only be an Object or null.');
    }
    function InterimConstructor() {}
    InterimConstructor.prototype = prototypeObject;
    const newInstance = new InterimConstructor();
    if (globalThis.console) globalThis.console.debug('Object.create polyfilled.');
    return newInstance;
  };
})();

// Implement Object.defineProperty for environments lacking full support.
(function patchPropertyDefinition() {
  if (typeof Object.defineProperty !== 'undefined') {
    let propertyDefWorks = true;
    try {
      // Test for common browser quirks with defineProperty.
      Object.defineProperty(new Image(), 'testId', { value: 'dummy' });
      const DummyClass = function() {};
      Object.defineProperty(new DummyClass(), 'testProp', { value: '', configurable: true });
    } catch (err) {
      propertyDefWorks = false;
      if (globalThis.console) globalThis.console.warn('Object.defineProperty native implementation has issues:', err);
    }
    if (propertyDefWorks) return;
  }

  // Fallback implementation for Object.defineProperty.
  Object.defineProperty = function definePropertyShim(targetObj, propName, propDescriptor) {
    if (!targetObj || typeof targetObj !== 'object') {
      if (globalThis.console) globalThis.console.warn('definePropertyShim called with non-object target:', targetObj);
      return targetObj;
    }
    delete targetObj[propName]; // Remove existing property to redefine.
    if ('get' in propDescriptor && typeof targetObj.__defineGetter__ === 'function') {
      targetObj.__defineGetter__(propName, propDescriptor.get);
    }
    if ('set' in propDescriptor && typeof targetObj.__defineSetter__ === 'function') {
      targetObj.__defineSetter__(propName, propDescriptor.set);
    }
    if ('value' in propDescriptor) {
      // Create a getter/setter pair to emulate a value property.
      if (typeof targetObj.__defineSetter__ === 'function' && typeof targetObj.__defineGetter__ === 'function') {
        targetObj.__defineSetter__(propName, function(newValue) {
          this.__defineGetter__(propName, function() { return newValue; });
          return newValue;
        });
        targetObj[propName] = propDescriptor.value; // Set initial value.
      } else {
        targetObj[propName] = propDescriptor.value; // Direct assignment as a last resort.
      }
    }
    if (globalThis.console) globalThis.console.debug('Object.defineProperty polyfilled for property:', propName);
    return targetObj;
  };
})();

// Polyfill Object.keys for enumerating object properties.
(function implementObjectKeyRetrieval() {
  if (typeof Object.keys !== 'undefined') {
    return; // Native support is present.
  }

  Object.keys = function getObjectKeysShim(inputObject) {
    if (typeof inputObject !== 'object' || inputObject === null) {
      throw new TypeError('Object.keys called on non-object or null.');
    }
    const propertyList = [];
    for (const key in inputObject) {
      // Ensure only own enumerable properties are included.
      if (Object.prototype.hasOwnProperty.call(inputObject, key)) {
        propertyList.push(key);
      }
    }
    if (globalThis.console) globalThis.console.debug('Object.keys polyfilled.');
    return propertyList;
  };
})();

// Polyfill FileReader.prototype.readAsArrayBuffer.
(function fixFileReaderBufferReading() {
  const currentRoot = globalThis;
  if (typeof currentRoot.FileReader === 'undefined') {
    return; // FileReader API not available.
  }
  const readerProto = currentRoot.FileReader.prototype;
  if ('readAsArrayBuffer' in readerProto) {
    return; // Method already exists.
  }

  Object.defineProperty(readerProto, 'readAsArrayBuffer', {
    value: function readArrayBufferPoly(fileBlob) {
      const internalReader = new currentRoot.FileReader();
      const outerReaderInstance = this;

      internalReader.onload = function(loadEvent) {
        const rawData = loadEvent.target.result;
        const dataLength = rawData.length;
        const targetBuffer = new currentRoot.ArrayBuffer(dataLength);
        const targetUint8Array = new currentRoot.Uint8Array(targetBuffer);

        for (let byteIndex = 0; byteIndex < dataLength; byteIndex++) {
          targetUint8Array[byteIndex] = rawData.charCodeAt(byteIndex) & 0xFF;
        }

        // Define the result property on the original FileReader instance.
        Object.defineProperty(outerReaderInstance, 'result', {
          value: targetBuffer,
          enumerable: true,
          writable: false,
          configurable: true
        });

        // Dispatch a custom 'load' event.
        const completionEvent = currentRoot.document.createEvent('HTMLEvents');
        completionEvent.initEvent('load', false, false);
        outerReaderInstance.dispatchEvent(completionEvent);
      };
      internalReader.readAsBinaryString(fileBlob);
      if (currentRoot.console) currentRoot.console.debug('FileReader.readAsArrayBuffer polyfilled.');
    },
    configurable: true,
    writable: true // Ensure it can be redefined later if needed.
  });
})();

// Enhance XMLHttpRequest compatibility, especially for 'response' property.
(function enhanceXHRResponseHandling() {
  const xhrProto = globalThis.XMLHttpRequest.prototype;

  // Polyfill overrideMimeType for older IE versions.
  if (!('overrideMimeType' in xhrProto)) {
    Object.defineProperty(xhrProto, 'overrideMimeType', {
      value: function dummyOverrideMimeType(mimeType) {
        // This is a no-op polyfill, as functionality cannot be truly replicated.
        if (globalThis.console) globalThis.console.debug('XHR.overrideMimeType polyfilled (no-op).');
      },
      configurable: true,
      writable: true
    });
  }

  // Check if response property (or similar) already exists.
  if ('response' in xhrProto ||
      'mozResponseArrayBuffer' in xhrProto ||
      'mozResponse' in xhrProto ||
      'responseArrayBuffer' in xhrProto) {
    return; // Native or vendor-specific support is present.
  }

  // Handle IE9's VBArray for response body.
  if (typeof globalThis.VBArray !== 'undefined') {
    Object.defineProperty(xhrProto, 'response', {
      get: function getVBArrayResponse() {
        try {
          return new globalThis.Uint8Array(new globalThis.VBArray(this.responseBody).toArray());
        } catch (e) {
          if (globalThis.console) globalThis.console.error('Failed to convert XHR responseBody with VBArray:', e);
          return new globalThis.Uint8Array(0); // Return empty array on error.
        }
      },
      configurable: true
    });
    if (globalThis.console) globalThis.console.info('XHR.response polyfilled using VBArray (IE9).');
    return;
  }

  // Generic fallback for other browsers.
  function responseTypeSetterShim(value) {
    if (value === 'arraybuffer' && typeof this.overrideMimeType === 'function') {
      this.overrideMimeType('text/plain; charset=x-user-defined');
      if (globalThis.console) globalThis.console.debug('XHR responseType set to arraybuffer, mimetype overridden.');
    }
  }

  if (typeof xhrProto.overrideMimeType === 'function') {
    Object.defineProperty(xhrProto, 'responseType', {
      set: responseTypeSetterShim,
      configurable: true
    });
  }

  function responseGetterShim() {
    const rawText = this.responseText;
    const textLength = rawText.length;
    const byteArray = new globalThis.Uint8Array(textLength);
    for (let currentIdx = 0; currentIdx < textLength; ++currentIdx) {
      byteArray[currentIdx] = rawText.charCodeAt(currentIdx) & 0xFF;
    }
    return byteArray;
  }
  Object.defineProperty(xhrProto, 'response', {
    get: responseGetterShim,
    configurable: true
  });
  if (globalThis.console) globalThis.console.info('XHR.response polyfilled for text-based conversion.');
})();

// Polyfill window.btoa (Base64 encoding).
(function ensureBase64Encoding() {
  if ('btoa' in globalThis) {
    return; // Native btoa exists.
  }

  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  globalThis.btoa = function encodeBase64Shim(inputString) {
    let outputBuffer = '';
    let charIndex = 0;
    const stringLength = inputString.length;

    // Process input in chunks of 3 bytes.
    while (charIndex < stringLength) {
      const val1 = inputString.charCodeAt(charIndex++) & 0xFF;
      const val2 = inputString.charCodeAt(charIndex++) & 0xFF;
      const val3 = inputString.charCodeAt(charIndex++) & 0xFF;

      const idx1 = val1 >> 2;
      const idx2 = ((val1 & 0x03) << 4) | (val2 >> 4);
      const idx3 = ((val2 & 0x0F) << 2) | (val3 >> 6);
      const idx4 = val3 & 0x3F;

      outputBuffer += base64Chars.charAt(idx1) +
                      base64Chars.charAt(idx2) +
                      base64Chars.charAt(isNaN(val2) ? 64 : idx3) +
                      base64Chars.charAt(isNaN(val3) ? 64 : idx4);
    }
    if (globalThis.console) globalThis.console.debug('window.btoa polyfilled.');
    return outputBuffer;
  };
})();

// Polyfill window.atob (Base64 decoding).
(function ensureBase64Decoding() {
  if ('atob' in globalThis) {
    return; // Native atob exists.
  }

  // Refactored from https://github.com/davidchambers/Base64.js
  const base64DecodingMap =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  globalThis.atob = function decodeBase64Shim(encodedInput) {
    if (!encodedInput) {
      if (globalThis.console) globalThis.console.warn('atob polyfill received empty input.');
      return '';
    }

    let cleanedInput = String(encodedInput).replace(/=+$/, ''); // Remove padding characters.
    if (cleanedInput.length % 4 === 1) {
      throw new Error('Invalid or malformed Base64 string length.');
    }

    let bitAccumulator = 0;
    let byteCounter = 0;
    let charIndex = 0;
    let decodedOutput = '';

    while (charIndex < cleanedInput.length) {
      const charCode = base64DecodingMap.indexOf(cleanedInput.charAt(charIndex++));
      if (charCode < 0) { // Invalid character.
        if (globalThis.console) globalThis.console.warn('atob polyfill encountered invalid character.');
        continue;
      }

      bitAccumulator = (bitAccumulator << 6) | charCode;
      byteCounter += 6;

      if (byteCounter >= 8) {
        byteCounter -= 8;
        decodedOutput += String.fromCharCode((bitAccumulator >>> byteCounter) & 0xFF);
      }
    }
    if (globalThis.console) globalThis.console.debug('window.atob polyfilled.');
    return decodedOutput;
  };
})();

// Polyfill Function.prototype.bind.
(function patchFunctionBinding() {
  if (typeof Function.prototype.bind !== 'undefined') {
    return; // Native bind exists.
  }

  Function.prototype.bind = function functionBindShim(contextObj) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    const originalFunction = this;
    const initialArgs = Array.prototype.slice.call(arguments, 1); // Capture arguments from bind call.

    const boundFunction = function() {
      // Combine initial args with arguments from the actual call.
      const runtimeArgs = initialArgs.concat(Array.prototype.slice.call(arguments));
      // Apply the original function with the specified context and combined arguments.
      return originalFunction.apply(contextObj, runtimeArgs);
    };
    if (globalThis.console) globalThis.console.debug('Function.prototype.bind polyfilled.');
    return boundFunction;
  };
})();

// Implement HTMLElement.dataset property.
(function implementDatasetProperty() {
  if (typeof globalThis.HTMLElement === 'undefined') return; // HTMLElement not available.

  const tempDiv = globalThis.document.createElement('div');
  if ('dataset' in tempDiv) {
    return; // Native dataset exists.
  }

  Object.defineProperty(globalThis.HTMLElement.prototype, 'dataset', {
    get: function() {
      // Return cached dataset if already computed.
      if (this._cachedDataset) {
        return this._cachedDataset;
      }

      const currentElement = this;
      const dataStore = {};
      const attributeCount = currentElement.attributes.length;

      for (let i = 0; i < attributeCount; i++) {
        const currentAttr = currentElement.attributes[i];
        if (currentAttr.name.startsWith('data-')) {
          // Convert kebab-case to camelCase for the key.
          const dataKey = currentAttr.name.substring(5).replace(/-([a-z])/g, (match, char) => char.toUpperCase());
          dataStore[dataKey] = currentAttr.value;
        }
      }

      // Cache the dataset on the element.
      Object.defineProperty(currentElement, '_cachedDataset', {
        value: dataStore,
        writable: false,
        enumerable: false, // Hide from enumeration.
        configurable: true
      });
      if (globalThis.console) globalThis.console.debug('HTMLElement.dataset polyfilled for element:', currentElement.tagName);
      return dataStore;
    },
    enumerable: true,
    configurable: true
  });
})();

// Implement HTMLElement.classList property.
(function implementClassListProperty() {
  if (typeof globalThis.HTMLElement === 'undefined') return; // HTMLElement not available.

  const testElement = globalThis.document.createElement('div');
  if ('classList' in testElement) {
    return; // Native classList exists.
  }

  function modifyClassList(targetElement, className, shouldAdd, shouldRemove) {
    let currentClasses = targetElement.className || '';
    let classArray = currentClasses.split(/\s+/g).filter(Boolean); // Split and remove empty strings.

    const classIndex = classArray.indexOf(className);
    const classExists = classIndex !== -1;

    if (shouldAdd && !classExists) {
      classArray.push(className);
    } else if (shouldRemove && classExists) {
      classArray.splice(classIndex, 1);
    }
    targetElement.className = classArray.join(' ');
    return classExists; // Return whether the class existed before the operation.
  }

  const classListMethods = {
    add: function(name) {
      modifyClassList(this._elementRef, name, true, false);
    },
    contains: function(name) {
      return modifyClassList(this._elementRef, name, false, false);
    },
    remove: function(name) {
      modifyClassList(this._elementRef, name, false, true);
    },
    toggle: function(name) {
      const existed = modifyClassList(this._elementRef, name, true, true);
      return !existed; // Toggle returns true if class was added, false if removed.
    }
  };

  Object.defineProperty(globalThis.HTMLElement.prototype, 'classList', {
    get: function() {
      if (this._cachedClassList) {
        return this._cachedClassList;
      }

      const classListProxy = Object.create(classListMethods, {
        _elementRef: { // Store a reference to the actual element.
          value: this,
          writable: false,
          enumerable: false,
          configurable: true
        }
      });

      Object.defineProperty(this, '_cachedClassList', {
        value: classListProxy,
        writable: false,
        enumerable: false,
        configurable: true
      });
      if (globalThis.console) globalThis.console.debug('HTMLElement.classList polyfilled for element:', this.tagName);
      return classListProxy;
    },
    enumerable: true,
    configurable: true
  });
})();

// Normalize console API for environments where it might be missing or incomplete.
(function normalizeConsoleAPI() {
  const currentGlobal = globalThis;
  if (!('console' in currentGlobal)) {
    currentGlobal.console = {
      log: function() {},
      error: function() {},
      warn: function() {},
      info: function() {},
      debug: function() {}
    };
    currentGlobal.console.log('Console object polyfilled.');
  } else if (!('bind' in currentGlobal.console.log) && typeof currentGlobal.console.log === 'object') {
    // Some older IE versions have console methods as host objects that lack 'bind'.
    // Wrap them to ensure they are proper functions.
    const originalLog = currentGlobal.console.log;
    const originalError = currentGlobal.console.error;
    const originalWarn = currentGlobal.console.warn;

    currentGlobal.console.log = function(message) { return originalLog(message); };
    currentGlobal.console.error = function(message) { return originalError(message); };
    currentGlobal.console.warn = function(message) { return originalWarn(message); };
    if (!currentGlobal.console.info) currentGlobal.console.info = currentGlobal.console.log;
    if (!currentGlobal.console.debug) currentGlobal.console.debug = currentGlobal.console.log;
    currentGlobal.console.info('Console methods wrapped for compatibility (e.g., IE9).');
  }
})();

// Address a specific Opera bug related to click events on disabled elements.
(function mitigateOperaClickBug() {
  // Check for Opera user agent, as this is a known browser-specific bug.
  if (navigator.userAgent.includes('Opera')) {
    function checkIfNodeIsDisabled(targetNode) {
      if (!targetNode) return false;
      return targetNode.disabled || (targetNode.parentNode && checkIfNodeIsDisabled(targetNode.parentNode));
    }

    function preventClickOnDisabled(clickEvent) {
      if (checkIfNodeIsDisabled(clickEvent.target)) {
        clickEvent.stopPropagation(); // Stop event propagation if target is disabled.
        if (globalThis.console) globalThis.console.debug('Opera click bug mitigated: event stopped on disabled element.');
      }
    }
    globalThis.document.addEventListener('click', preventClickOnDisabled, true);
    if (globalThis.console) globalThis.console.info('Opera click bug workaround applied.');
  }
})();

// Standardize navigator.language property.
(function standardizeNavigatorLanguage() {
  if ('language' in navigator) {
    return; // Native support exists.
  }
  Object.defineProperty(navigator, 'language', {
    get: function getStandardLanguage() {
      const customLang = navigator.userLanguage || navigator.browserLanguage || 'en-US';
      // Format to 'en-US' style (lowercase primary, uppercase secondary).
      const parts = customLang.split('-');
      let formattedLang = parts[0].toLowerCase();
      if (parts.length > 1) {
        formattedLang += '-' + parts[1].toUpperCase();
      }
      if (globalThis.console) globalThis.console.debug('navigator.language polyfilled:', formattedLang);
      return formattedLang;
    },
    enumerable: true,
    configurable: true
  });
})();

// Evaluate browser support for HTTP Range Requests.
(function evaluateRangeRequestSupport() {
  const currentWindow = globalThis;
  // Safari detection (heuristic based on HTMLElement constructor name).
  const isSafariBrowser = Object.prototype.toString.call(currentWindow.HTMLElement).indexOf('Constructor') > 0 ||
                          /Safari\//.test(navigator.userAgent) && !/Chrome\//.test(navigator.userAgent);

  // Older Android browser detection.
  const androidRegex = /Android\s[0-2]\./; // Matches Android versions 0.x, 1.x, 2.x
  const isLegacyAndroid = androidRegex.test(navigator.userAgent);

  if (isSafariBrowser || isLegacyAndroid) {
    currentWindow.DOC_LIB_CORE.noRangeRequests = true;
    if (currentWindow.console) {
      currentWindow.console.warn('Range requests disabled due to detected browser quirks (Safari/Legacy Android).');
    }
  } else {
    currentWindow.DOC_LIB_CORE.noRangeRequests = false;
    if (currentWindow.console) {
      currentWindow.console.info('Range requests expected to function correctly.');
    }
  }
})();

// Assess browser's history manipulation capabilities.
(function assessHistoryAPI() {
  const currentWindow = globalThis;
  if (!currentWindow.history || !currentWindow.history.pushState) {
    currentWindow.DOC_LIB_CORE.noHistoryControl = true;
    if (currentWindow.console) {
      currentWindow.console.warn('History API (pushState) not supported; history control disabled.');
    }
  } else {
    currentWindow.DOC_LIB_CORE.noHistoryControl = false;
    if (currentWindow.console) {
      currentWindow.console.info('History API (pushState) is available.');
    }
  }
})();