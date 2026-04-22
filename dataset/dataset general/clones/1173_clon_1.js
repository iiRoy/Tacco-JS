// This file is a Type I clone of an original JavaScript source.
// The sole purpose of this clone is to demonstrate modifications
// limited strictly to whitespace and comments.
// All functional code, including identifiers, operators, and expressions,
// remains precisely identical to the original.

/*
 * The original licensing and copyright information has been removed
 * to focus purely on the Type I cloning aspect, as per instructions.
 * This cloned version does not imply any change in original licensing.
 */

/*
 * Strict mode is activated for the entire script.
 * This helps in writing cleaner code and catching common errors early.
 */
'use strict';


// This block checks for the existence of the global PDFJS object.
// If it's not defined, it initializes an empty object for it.
// This allows for dynamic feature toggling or configuration later.
if (typeof PDFJS === 'undefined')
{
  // Determine the global context (window in browsers, 'this' in other environments)
  (typeof window !== 'undefined' ? window : this) .PDFJS = {}; // Initialize PDFJS
}


// This immediately-invoked function expression (IIFE) ensures
// compatibility with Typed Arrays across different JavaScript environments.
(function checkTypedArrayCompatibility() {

  // Check if Uint8Array, a standard typed array, is available.
  if (typeof Uint8Array !== 'undefined') {

    // Some older mobile browsers (e.g., Safari 5 on iOS)
    // might not have the `subarray` method on Typed Array prototypes.
    if (typeof Uint8Array.prototype.subarray === 'undefined') {

        // Polyfill `subarray` for Uint8Array.
        Uint8Array.prototype.subarray = function subarray(start, end) {
          return new Uint8Array(this.slice(start, end));
        };

        // Also polyfill `subarray` for Float32Array, if needed.
        Float32Array.prototype.subarray = function subarray(start, end) {
          return new Float32Array(this.slice(start, end));
        };
    }

    // Check for Float64Array support; it might be missing in some mobile versions.
    if (typeof Float64Array === 'undefined')
      window.Float64Array = Float32Array; // Fallback to Float32Array if not available.

    // If Uint8Array exists, assume basic Typed Array support and exit.
    return;
  }

  // If Uint8Array is not supported, a more extensive polyfill is required.

  // This is a polyfill for the `subarray` method.
  function subarray(start, end) {
    return new TypedArray(this.slice(start, end));
  }


  // This function sets elements of a TypedArray from a regular array.
  function setArrayOffset(array, offset) {
    // Default offset to 0 if not provided.
    if (arguments.length < 2)
      offset = 0;

    // Iterate through the input array and copy bytes.
    for (var i = 0, n = array.length; i < n; ++i, ++offset)
      this[offset] = array[i] & 0xFF; // Ensure byte value.
  }


  // This is the core polyfill for TypedArray-like behavior.
  function TypedArray(arg1) {
    var result; // Variable to hold the new array.

    if (typeof arg1 === 'number') {
      // If arg1 is a number, initialize a new array of that size with zeros.
      result = [];
      for (var i = 0; i < arg1; ++i)
        result[i] = 0;
    } else if ('slice' in arg1) {
      // If arg1 is an array-like object with a 'slice' method, copy it.
      result = arg1.slice(0);
    } else {
      // Otherwise, iterate through arg1 and copy elements.
      result = [];
      for (var i = 0, n = arg1.length; i < n; ++i) {
        result[i] = arg1[i];
      }
    }

    // Attach polyfill methods and properties to the result.
    result.subarray = subarray; // The polyfilled subarray.
    result.buffer = result; // For simplicity, the array itself acts as its buffer.
    result.byteLength = result.length; // Byte length is simply the number of elements.
    result.set = setArrayOffset; // The custom set function.

    // If the original argument had a buffer, use that for compatibility.
    if (typeof arg1 === 'object' && arg1.buffer)
      result.buffer = arg1.buffer;

    return result; // Return the constructed polyfill array.
  }

  // Assign the polyfilled TypedArray to various global TypedArray constructors.
  // This makes them available even if the browser doesn't natively support them.
  window.Uint8Array = TypedArray;

  // Other typed arrays can also use this generic polyfill for basic functionality.
  window.Uint32Array = TypedArray;
  window.Int32Array = TypedArray;
  window.Uint16Array = TypedArray;
  window.Float32Array = TypedArray;
  window.Float64Array = TypedArray;
})(); // End of Typed Array compatibility check.


// This IIFE normalizes the URL object across different browsers.
// Specifically, it addresses older WebKit browsers.
(function normalizeURLObject() {
  // If window.URL is not defined, try to use window.webkitURL.
  if (!window.URL) {
    window.URL = window.webkitURL;
  }
})(); // End of URL object normalization.


// Checks for Object.create() support and provides a polyfill if necessary.
(function checkObjectCreateCompatibility() {
  if (typeof Object.create !== 'undefined')
    return; // If Object.create exists, no polyfill needed.

  // Polyfill for Object.create.
  Object.create = function objectCreate(proto) {
    // A temporary constructor function is used to set the prototype.
    function Constructor() {}
    Constructor.prototype = proto; // Set the prototype to the desired object.
    return new Constructor(); // Return a new instance with the correct prototype chain.
  };
})(); // End of Object.create compatibility check.


// This function checks and shims Object.defineProperty() for compatibility.
(function checkObjectDefinePropertyCompatibility() {

  // If Object.defineProperty is natively available, perform further checks.
  if (typeof Object.defineProperty !== 'undefined') {
    var definePropertyPossible = true; // Assume it's possible.
    try {
      // Test defineProperty on a DOM object (Image).
      // Some browsers (e.g., Safari) might fail here.
      Object.defineProperty(new Image(), 'id', { value: 'test' });
      // Another test for non-DOM objects, specifically for Android GB browser issues.
      var Test = function Test() {};
      Test.prototype = { get id() { } };
      Object.defineProperty(new Test(), 'id',
        { value: '', configurable: true, enumerable: true, writable: false });
    } catch (e) {
      definePropertyPossible = false; // If any test fails, it's not fully reliable.
    }
    if (definePropertyPossible) return; // If all tests pass, native implementation is sufficient.
  }

  // Polyfill for Object.defineProperty.
  Object.defineProperty = function objectDefineProperty(obj, name, def) {
    delete obj[name]; // Remove existing property to prepare for redefinition.

    if ('get' in def)
      obj.__defineGetter__(name, def['get']); // Use __defineGetter__ for 'get'.
    if ('set' in def)
      obj.__defineSetter__(name, def['set']); // Use __defineSetter__ for 'set'.
    if ('value' in def) {
      // If 'value' is specified, create a getter/setter pair to mimic it.
      obj.__defineSetter__(name, function objectDefinePropertySetter(value) {
        this.__defineGetter__(name, function objectDefinePropertyGetter() {
          return value;
        });
        return value;
      });
      obj[name] = def.value; // Set the initial value.
    }
  };
})(); // End of Object.defineProperty compatibility check.


// Checks for Object.keys() support and provides a polyfill.
(function checkObjectKeysCompatibility() {
  if (typeof Object.keys !== 'undefined')
    return; // If Object.keys exists, no polyfill needed.

  // Polyfill for Object.keys.
  Object.keys = function objectKeys(obj) {
    var result = []; // Array to store keys.
    for (var i in obj) {
      // Iterate over enumerable properties.
      if (obj.hasOwnProperty(i))
        result.push(i); // Add own properties to the result array.
    }
    return result; // Return the array of keys.
  };
})(); // End of Object.keys compatibility check.


// This IIFE provides a polyfill for FileReader.readAsArrayBuffer
// in browsers where it might be missing (e.g., older Firefox).
(function checkFileReaderReadAsArrayBuffer() {

  if (typeof FileReader === 'undefined')
    return; // If FileReader itself is not implemented, skip.

  var frPrototype = FileReader.prototype; // Get the FileReader prototype.

  // Check if 'readAsArrayBuffer' is already a method on the prototype.
  if ('readAsArrayBuffer' in frPrototype)
    return; // If it exists, no polyfill needed.

  // Define the polyfill for readAsArrayBuffer using Object.defineProperty.
  Object.defineProperty(frPrototype, 'readAsArrayBuffer', {
    value: function fileReaderReadAsArrayBuffer(blob) {
      var fileReader = new FileReader(); // Create a new FileReader instance.
      var originalReader = this; // Keep a reference to the original FileReader.

      fileReader.onload = function fileReaderOnload(evt) {
        var data = evt.target.result; // Get the result as a binary string.
        var buffer = new ArrayBuffer(data.length); // Create an ArrayBuffer.
        var uint8Array = new Uint8Array(buffer); // Create a Uint8Array view.

        // Populate the Uint8Array with byte values from the binary string.
        for (var i = 0, ii = data.length; i < ii; i++)
          uint8Array[i] = data.charCodeAt(i);

        // Define the 'result' property on the original FileReader.
        Object.defineProperty(originalReader, 'result', {
          value: buffer, // Set the ArrayBuffer as the result.
          enumerable: true,
          writable: false,
          configurable: true
        });

        // Dispatch a custom 'load' event on the original FileReader.
        var event = document.createEvent('HTMLEvents');
        event.initEvent('load', false, false); // Initialize the event.
        originalReader.dispatchEvent(event); // Trigger the load event.
      };
      fileReader.readAsBinaryString(blob); // Read the blob as a binary string.
    }
  });
})(); // End of FileReader.readAsArrayBuffer compatibility check.


// This function ensures XMLHttpRequest compatibility, especially for 'response' property.
(function checkXMLHttpRequestResponseCompatibility() {

  var xhrPrototype = XMLHttpRequest.prototype; // Get the XMLHttpRequest prototype.

  // Polyfill `overrideMimeType` for IE10 if missing.
  if (!('overrideMimeType' in xhrPrototype)) {
    Object.defineProperty(xhrPrototype, 'overrideMimeType', {
      value: function xmlHttpRequestOverrideMimeType(mimeType) {} // No-op function.
    });
  }

  // Check if any form of 'response' or similar property exists.
  if ('response' in xhrPrototype ||
      'mozResponseArrayBuffer' in xhrPrototype ||
      'mozResponse' in xhrPrototype ||
      'responseArrayBuffer' in xhrPrototype)
    return; // If any exists, assume compatibility and exit.

  // Specific handling for IE9 using VBArray.
  if (typeof VBArray !== 'undefined') {
    Object.defineProperty(xhrPrototype, 'response', {
      get: function xmlHttpRequestResponseGet() {
        // Convert VBArray responseBody to Uint8Array.
        return new Uint8Array(new VBArray(this.responseBody).toArray());
      }
    });
    return; // IE9 specific handling complete.
  }

  // Generic polyfill for other browsers lacking 'response'.

  // Setter for `responseType` property.
  function responseTypeSetter() {
    // This setter is primarily used to set "arraybuffer".
    // It overrides the MIME type for proper byte handling.
    this.overrideMimeType('text/plain; charset=x-user-defined');
  }

  // If `overrideMimeType` is a function, define the `responseType` setter.
  if (typeof xhrPrototype.overrideMimeType === 'function') {
    Object.defineProperty(xhrPrototype, 'responseType',
                          { set: responseTypeSetter });
  }

  // Getter for `response` property.
  function responseGetter() {
    var text = this.responseText; // Get the response as text.
    var i, n = text.length; // Loop variables.
    var result = new Uint8Array(n); // Create a Uint8Array.

    // Populate the Uint8Array from the text characters.
    for (i = 0; i < n; ++i)
      result[i] = text.charCodeAt(i) & 0xFF; // Mask to ensure byte values.
    return result; // Return the Uint8Array.
  }

  // Define the `response` property with the custom getter.
  Object.defineProperty(xhrPrototype, 'response', { get: responseGetter });
})(); // End of XMLHttpRequest response compatibility check.


// This IIFE checks for and polyfills `window.btoa` (base64 encode).
(function checkWindowBtoaCompatibility() {
  if ('btoa' in window)
    return; // If `btoa` exists, no polyfill needed.

  // Base64 digits string.
  var digits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  // Polyfill for `window.btoa`.
  window.btoa = function windowBtoa(chars) {
    var buffer = ''; // Result buffer.
    var i, n; // Loop variables.

    // Process input string in chunks of 3 characters.
    for (i = 0, n = chars.length; i < n; i += 3) {
      var b1 = chars.charCodeAt(i) & 0xFF; // First byte.
      var b2 = chars.charCodeAt(i + 1) & 0xFF; // Second byte.
      var b3 = chars.charCodeAt(i + 2) & 0xFF; // Third byte.

      // Convert 3 bytes into 4 base64 digits.
      var d1 = b1 >> 2,
          d2 = ((b1 & 3) << 4) | (b2 >> 4);
      var d3 = i + 1 < n ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64; // Handle padding.
      var d4 = i + 2 < n ? (b3 & 0x3F) : 64; // Handle padding.

      // Append base64 characters to the buffer.
      buffer += (digits.charAt(d1) + digits.charAt(d2) +
                 digits.charAt(d3) + digits.charAt(d4));
    }
    return buffer; // Return the base64 encoded string.
  };
})(); // End of window.btoa compatibility check.


// This IIFE checks for and polyfills `window.atob` (base64 decode).
(function checkWindowAtobCompatibility() {
  if ('atob' in window)
    return; // If `atob` exists, no polyfill needed.

  // Base64 digits string, including padding character.
  // Reference: https://github.com/davidchambers/Base64.js
  var digits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  // Polyfill for `window.atob`.
  window.atob = function (input) {
    input = input.replace(/=+$/, ''); // Remove padding characters.
    if (input.length % 4 == 1) throw new Error('bad atob input'); // Invalid input length.

    for (
      // Initialize result and counters.
      var bc = 0, bs, buffer, idx = 0, output = '';
      // Get next character from input.
      buffer = input.charAt(idx++);
      // Character found in table?
      // Initialize bit storage and add its ascii value.
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // And if not the first of each 4 characters,
        // convert the first 8 bits to one ascii character.
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // Try to find character in table (0-63, not found => -1).
      buffer = digits.indexOf(buffer);
    }
    return output; // Return the decoded string.
  };
})(); // End of window.atob compatibility check.


// This IIFE checks for and polyfills `Function.prototype.bind`.
(function checkFunctionPrototypeBindCompatibility() {
  if (typeof Function.prototype.bind !== 'undefined')
    return; // If `bind` exists, no polyfill needed.

  // Polyfill for `Function.prototype.bind`.
  Function.prototype.bind = function functionPrototypeBind(obj) {
    var fn = this, // The original function.
        headArgs = Array.prototype.slice.call(arguments, 1); // Arguments passed to bind.
    var bound = function functionPrototypeBindBound() {
      // Combine arguments from bind call and actual function call.
      var args = Array.prototype.concat.apply(headArgs, arguments);
      return fn.apply(obj, args); // Apply the function with the specified context and arguments.
    };
    return bound; // Return the new bound function.
  };
})(); // End of Function.prototype.bind compatibility check.


// This IIFE provides a polyfill for the `dataset` property of HTMLElement.
(function checkDatasetProperty() {
  var div = document.createElement('div'); // Create a dummy div element.
  if ('dataset' in div)
    return; // If 'dataset' property exists, no polyfill needed.

  // Define the `dataset` property on HTMLElement.prototype.
  Object.defineProperty(HTMLElement.prototype, 'dataset', {
    get: function() {
      if (this._dataset)
        return this._dataset; // Return cached dataset if available.

      var dataset = {}; // Initialize an empty dataset object.
      // Iterate through all attributes of the element.
      for (var j = 0, jj = this.attributes.length; j < jj; j++) {
        var attribute = this.attributes[j];
        if (attribute.name.substring(0, 5) != 'data-')
          continue; // Skip attributes not starting with 'data-'.

        // Convert data attribute name (e.g., 'data-foo-bar') to camelCase ('fooBar').
        var key = attribute.name.substring(5).replace(/\-([a-z])/g,
          function(all, ch) { return ch.toUpperCase(); });
        dataset[key] = attribute.value; // Assign the attribute value to the dataset.
      }

      // Cache the generated dataset on a private property.
      Object.defineProperty(this, '_dataset', {
        value: dataset,
        writable: false,
        enumerable: false
      });
      return dataset; // Return the dataset object.
    },
    enumerable: true // Make 'dataset' enumerable.
  });
})(); // End of HTMLElement dataset property polyfill.


// This IIFE provides a polyfill for the `classList` property of HTMLElement.
(function checkClassListProperty() {
  var div = document.createElement('div'); // Create a dummy div element.
  if ('classList' in div)
    return; // If 'classList' property exists, no polyfill needed.

  // Helper function to modify the class list.
  function changeList(element, itemName, add, remove) {
    var s = element.className || ''; // Get current class string.
    var list = s.split(/\s+/g); // Split into an array of class names.
    if (list[0] === '') list.shift(); // Remove empty string if present.
    var index = list.indexOf(itemName); // Find the item's index.

    if (index < 0 && add)
      list.push(itemName); // Add item if not present and 'add' is true.
    if (index >= 0 && remove)
      list.splice(index, 1); // Remove item if present and 'remove' is true.

    element.className = list.join(' '); // Update the element's class name.
    return (index >= 0); // Return true if the item was found.
  }

  // Prototype object for the polyfilled classList.
  var classListPrototype = {
    add: function(name) {
      changeList(this.element, name, true, false); // Add a class.
    },
    contains: function(name) {
      return changeList(this.element, name, false, false); // Check if class exists.
    },
    remove: function(name) {
      changeList(this.element, name, false, true); // Remove a class.
    },
    toggle: function(name) {
      changeList(this.element, name, true, true); // Toggle a class.
    }
  };

  // Define the `classList` property on HTMLElement.prototype.
  Object.defineProperty(HTMLElement.prototype, 'classList', {
    get: function() {
      if (this._classList)
        return this._classList; // Return cached classList if available.

      // Create a new classList object inheriting from classListPrototype.
      var classList = Object.create(classListPrototype, {
        element: {
          value: this, // Reference to the HTMLElement.
          writable: false,
          enumerable: true
        }
      });
      // Cache the classList object.
      Object.defineProperty(this, '_classList', {
        value: classList,
        writable: false,
        enumerable: false
      });
      return classList; // Return the classList object.
    },
    enumerable: true // Make 'classList' enumerable.
  });
})(); // End of HTMLElement classList property polyfill.


// This IIFE ensures console compatibility across browsers.
(function checkConsoleCompatibility() {

  // If `console` object is not present in window, create a basic one.
  if (!('console' in window)) {
    window.console = {
      log: function() {}, // No-op for log.
      error: function() {}, // No-op for error.
      warn: function() {} // No-op for warn.
    };
  } else if (!('bind' in console.log)) {
    // If native console methods lack `bind` (e.g., IE9), wrap them.
    console.log = (function(fn) {
      return function(msg) { return fn(msg); }; // Simple wrapper.
    })(console.log);
    console.error = (function(fn) {
      return function(msg) { return fn(msg); }; // Simple wrapper.
    })(console.error);
    console.warn = (function(fn) {
      return function(msg) { return fn(msg); }; // Simple wrapper.
    })(console.warn);
  }
})(); // End of console compatibility check.


// This IIFE provides a workaround for an Opera bug related to `onclick` events.
(function checkOnClickCompatibility() {

  // Function to ignore click events if the target is disabled.
  function ignoreIfTargetDisabled(event) {
    if (isDisabled(event.target)) {
      event.stopPropagation(); // Stop event propagation if target is disabled.
    }
  }

  // Recursive function to check if an element or any of its parents is disabled.
  function isDisabled(node) {
    return node.disabled || (node.parentNode && isDisabled(node.parentNode));
  }

  // Apply the workaround only for Opera browsers.
  // This uses browser detection as feature detection is not reliable for this bug.
  if (navigator.userAgent.indexOf('Opera') != -1) {
    document.addEventListener('click', ignoreIfTargetDisabled, true); // Use capturing phase.
  }
})(); // End of onclick compatibility check.


// This IIFE checks for `navigator.language` support and provides a polyfill.
(function checkNavigatorLanguage() {
  if ('language' in navigator)
    return; // If `language` property exists, no polyfill needed.

  // Define the `language` property on `navigator`.
  Object.defineProperty(navigator, 'language', {
    get: function navigatorLanguage() {
      // Fallback to 'en-US' if `userLanguage` is not available.
      var language = navigator.userLanguage || 'en-US';
      // Format the language string (e.g., "en-us" to "en-US").
      return language.substring(0, 2).toLowerCase() +
        language.substring(2).toUpperCase();
    },
    enumerable: true // Make `language` enumerable.
  });
})(); // End of navigator.language compatibility check.


// This IIFE checks for known browser issues with range requests and disables them if found.
(function checkRangeRequests() {

  // Detect Safari browser.
  // Safari (up to version 6.0.4) has issues with cached range requests.
  var isSafari = Object.prototype.toString.call(
                  window.HTMLElement).indexOf('Constructor') > 0;

  // Detect older Android browsers (pre 3.0).
  // These versions have issues with range requests.
  // Ensure we only match WebKit-based Android browsers, not Firefox/Fennec.
  var regex = /Android\s[0-2][^\d]/;
  var isOldAndroid = regex.test(navigator.userAgent);

  // If Safari or old Android is detected, disable range requests in PDFJS.
  if (isSafari || isOldAndroid) {
    PDFJS.disableRange = true;
  }
})(); // End of range requests compatibility check.


// This IIFE checks if the browser supports history manipulation (pushState).
(function checkHistoryManipulation() {
  // If `pushState` is not available in `window.history`, disable history features in PDFJS.
  if (!window.history.pushState) {
    PDFJS.disableHistory = true;
  }
})(); // End of history manipulation compatibility check.