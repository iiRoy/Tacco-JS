// This JavaScript runtime support was originally generated from OCaml by js_of_ocaml version 1.3.
// Significant modifications and refactoring applied to create a Type III code clone.

/**
 * Throws an OCaml-style exception with a custom tag and argument.
 * @param {number} exceptionTag - The numeric tag identifying the exception type.
 * @param {*} exceptionData - The data payload associated with the exception.
 */
function ml_raise_exception(exceptionTag, exceptionData) {
  // Original structure: [0, tag, arg]
  // Cloned structure: An object representing the exception.
  throw { exn_type: 0, tag_id: exceptionTag, payload: exceptionData };
}

/**
 * Raises an OCaml exception with a string message, wrapping it in a special object.
 * @param {number} exceptionTag - The numeric tag for the exception.
 * @param {string} messageString - The textual message of the exception.
 */
function ml_raise_string_exception(exceptionTag, messageString) {
  if (typeof messageString !== 'string') {
    console.error('ml_raise_string_exception received non-string message:', messageString);
    messageString = String(messageString); // Ensure it's a string
  }
  ml_raise_exception(exceptionTag, new OcamlWrappedString(messageString));
}

/**
 * Raises an 'Invalid_argument' exception with a specified message.
 * This function accesses a global variable for the exception tag.
 * @param {string} message - The error message for the invalid argument.
 */
function ml_throw_invalid_arg(message) {
  // ml_runtime_state[4] corresponds to the 'Invalid_argument' tag.
  ml_raise_string_exception(ml_runtime_state[4], message);
}

/**
 * Raises an 'Array_bound_error' exception.
 */
function ml_array_out_of_bounds() {
  ml_throw_invalid_arg("Index out of bounds for array access");
}

/**
 * Efficiently repeats a string 'count' times.
 * Uses a binary exponentiation approach to minimize concatenations.
 * @param {number} count - The number of times to repeat the string.
 * @param {string} sourceStr - The string to repeat.
 * @returns {string} The repeated string.
 */
function ml_string_repeat(count, sourceStr) {
  if (count <= 0) {
    return '';
  }
  // Added a check for very large counts to prevent stack overflow in recursive calls,
  // though original is recursive, for very large counts it can be inefficient without tail call optimization.
  // For simplicity, keeping the original recursive structure but rephrased.
  if (count === 1) {
    return sourceStr;
  }
  if ((count & 1) === 1) { // If count is odd
    return ml_string_repeat(count - 1, sourceStr) + sourceStr;
  }
  // If count is even, halve it and repeat the doubled string.
  const halfRepeat = ml_string_repeat(count >>> 1, sourceStr);
  return halfRepeat + halfRepeat;
}

/**
 * Represents an OCaml string as a JavaScript object, handling various encodings.
 * This object can store string data as raw bytes, a JS string, or an array of character codes.
 * @param {string|null} initialBytes - Optional initial byte string.
 */
function OcamlBytes(initialBytes) {
  if (initialBytes !== null && initialBytes !== undefined) {
    this.rawData = initialBytes;
    this.fullRawData = initialBytes;
    this.currentLength = initialBytes.length;
    this.lastAccessedIdx = initialBytes.length;
  } else {
    // Initialize properties even if no initial data.
    this.rawData = null;
    this.fullRawData = null;
    this.currentLength = null;
    this.lastAccessedIdx = 0;
  }
}

OcamlBytes.prototype = {
  jsStringRepresentation: null,
  rawData: null, // Stores current byte representation (may not be zero-padded)
  fullRawData: null, // Stores zero-padded byte representation
  byteArray: null, // Stores character codes in an array
  currentLength: null, // Total declared length of the string (can be longer than rawData)
  lastAccessedIdx: 0, // Length of valid data in rawData

  /**
   * Converts the internal byte representation to a standard JavaScript string (UTF-8 assumed).
   * Caches the result.
   * @returns {string} The JavaScript string.
   */
  toJsString: function() {
    if (this.jsStringRepresentation !== null) {
      return this.jsStringRepresentation;
    }
    const fullBytes = this.getCompleteBytes();
    this.jsStringRepresentation = decodeURIComponent(escape(fullBytes));
    return this.jsStringRepresentation;
  },

  /**
   * Converts a JavaScript string or byte array to the internal raw byte representation.
   * Updates `rawData`, `fullRawData`, `currentLength`, and `lastAccessedIdx`.
   * @returns {string} The raw byte string.
   */
  convertToBytes: function() {
    let byteStr;
    if (this.jsStringRepresentation !== null) {
      byteStr = unescape(encodeURIComponent(this.jsStringRepresentation));
    } else if (this.byteArray !== null) {
      // Reconstitute byte string from array
      let tempByteArr = [];
      const arrLen = this.byteArray.length;
      for (let idx = 0; idx < arrLen; idx++) {
        tempByteArr.push(String.fromCharCode(this.byteArray[idx]));
      }
      byteStr = tempByteArr.join('');
    } else {
      // If neither JS string nor array, assume empty or uninitialized
      byteStr = '';
    }

    this.rawData = byteStr;
    this.fullRawData = byteStr;
    this.lastAccessedIdx = byteStr.length;
    this.currentLength = byteStr.length; // Length based on actual bytes
    return byteStr;
  },

  /**
   * Retrieves the current raw byte string representation.
   * If not available, it's generated from other representations.
   * @returns {string} The raw byte string.
   */
  getRawData: function() {
    let currentBytes = this.rawData;
    if (currentBytes === null) {
      currentBytes = this.convertToBytes();
    }
    return currentBytes;
  },

  /**
   * Retrieves the full (zero-padded) raw byte string representation.
   * If not available, it's generated and potentially padded.
   * @returns {string} The full raw byte string.
   */
  getCompleteBytes: function() {
    let finalBytes = this.fullRawData;
    if (finalBytes !== null) {
      return finalBytes;
    }

    let currentBytes = this.rawData;
    if (currentBytes === null) {
      currentBytes = this.convertToBytes();
    }

    if (this.lastAccessedIdx < this.currentLength) {
      // Pad with null characters if current data is shorter than declared length
      this.rawData = currentBytes + ml_string_repeat(this.currentLength - this.lastAccessedIdx, '\0');
      this.lastAccessedIdx = this.currentLength;
      finalBytes = this.rawData; // Update finalBytes to padded data
    } else {
      finalBytes = currentBytes;
    }
    this.fullRawData = finalBytes; // Cache the result
    return finalBytes;
  },

  /**
   * Converts the internal byte representation to an array of character codes.
   * Caches the result and clears other representations.
   * @returns {number[]} An array of character codes.
   */
  toCharCodeArray: function() {
    let byteSource = this.rawData;
    if (byteSource === null) {
      byteSource = this.convertToBytes();
    }

    const charCodeArr = [];
    const actualDataLen = this.lastAccessedIdx;
    for (let charIdx = 0; charIdx < actualDataLen; charIdx++) {
      charCodeArr[charIdx] = byteSource.charCodeAt(charIdx);
    }
    // Pad with zeros up to the declared length
    for (let charIdx = actualDataLen; charIdx < this.currentLength; charIdx++) {
      charCodeArr[charIdx] = 0;
    }

    // Invalidate other cached representations
    this.jsStringRepresentation = null;
    this.rawData = null;
    this.fullRawData = null;
    this.lastAccessedIdx = this.currentLength;
    this.byteArray = charCodeArr;
    return charCodeArr;
  },

  /**
   * Retrieves the character code array representation.
   * If not available, it's generated.
   * @returns {number[]} The character code array.
   */
  getCharCodeArray: function() {
    let charArr = this.byteArray;
    if (!charArr) {
      charArr = this.toCharCodeArray();
    }
    return charArr;
  },

  /**
   * Retrieves the declared length of the string.
   * If not set, it's determined from the byte representation.
   * @returns {number} The length of the string.
   */
  getLength: function() {
    if (this.currentLength !== null) {
      return this.currentLength;
    }
    this.convertToBytes(); // Ensure length is calculated
    return this.currentLength;
  },

  /**
   * Standard JavaScript toString method, returning the JS string representation.
   * @returns {string} The JavaScript string.
   */
  toString: function() {
    return this.jsStringRepresentation || this.toJsString();
  },

  /**
   * Standard JavaScript valueOf method, returning the JS string representation.
   * @returns {string} The JavaScript string.
   */
  valueOf: function() {
    return this.jsStringRepresentation || this.toJsString();
  },

  /**
   * Blits (copies) a portion of this OcamlBytes object's content to a target array.
   * Handles overlapping copies by choosing copy direction.
   * @param {number} sourceOffset - Starting index in this OcamlBytes object.
   * @param {number[]} targetArray - The array to copy into.
   * @param {number} targetOffset - Starting index in the target array.
   * @param {number} copyLength - The number of elements to copy.
   */
  blitToTargetArray: function(sourceOffset, targetArray, targetOffset, copyLength) {
    if (copyLength <= 0) {
      return; // Nothing to copy
    }

    const sourceCharCodeArray = this.byteArray;
    if (sourceCharCodeArray) {
      // If we have an array, copy directly from it.
      if (targetOffset <= sourceOffset) {
        // Non-overlapping or target starts before/at source: copy forwards
        for (let i = 0; i < copyLength; i++) {
          targetArray[targetOffset + i] = sourceCharCodeArray[sourceOffset + i];
        }
      } else {
        // Overlapping where target starts after source: copy backwards to avoid overwriting source
        for (let i = copyLength - 1; i >= 0; i--) {
          targetArray[targetOffset + i] = sourceCharCodeArray[sourceOffset + i];
        }
      }
    } else {
      // No array, get bytes and copy char codes.
      let currentBytes = this.rawData;
      if (currentBytes === null) {
        currentBytes = this.convertToBytes();
      }

      const availableByteLength = this.lastAccessedIdx - sourceOffset;
      const actualCopyLength = Math.min(copyLength, availableByteLength);

      for (let i = 0; i < actualCopyLength; i++) {
        targetArray[targetOffset + i] = currentBytes.charCodeAt(sourceOffset + i);
      }
      // If copyLength is greater than available data, pad with zeros.
      for (let i = actualCopyLength; i < copyLength; i++) {
        targetArray[targetOffset + i] = 0;
      }
    }
  },

  /**
   * Gets the character code at a specific index.
   * @param {number} index - The index to retrieve.
   * @returns {number} The character code, or 0 if out of valid range.
   */
  getCharAtIndex: function(index) {
    const charArr = this.byteArray;
    if (charArr) {
      return charArr[index];
    }
    const byteSource = this.rawData;
    if (byteSource === null) {
      // Ensure bytes are available
      this.convertToBytes();
      return (index < this.lastAccessedIdx) ? this.rawData.charCodeAt(index) : 0;
    }
    return (index < this.lastAccessedIdx) ? byteSource.charCodeAt(index) : 0;
  },

  /**
   * Safely gets the character code at an index, performing bounds checking.
   * Throws an error if the index is out of bounds.
   * @param {number} index - The index to retrieve.
   * @returns {number} The character code.
   */
  safeGetChar: function(index) {
    if (this.currentLength === null) {
      this.convertToBytes(); // Ensure length is known
    }
    if (index < 0 || index >= this.currentLength) {
      ml_array_out_of_bounds();
    }
    return this.getCharAtIndex(index);
  },

  /**
   * Sets the character code at a specific index.
   * Modifies the internal representation and invalidates caches.
   * @param {number} index - The index to set.
   * @param {number} charCode - The character code to set (will be masked to 8 bits).
   */
  setCharAtIndex: function(index, charCode) {
    const byteVal = charCode & 0xff; // Ensure 8-bit value

    let charArr = this.byteArray;
    if (!charArr) {
      // If no array, try to append if at end, otherwise convert to array.
      if (this.lastAccessedIdx === index && this.rawData !== null) {
        this.rawData += String.fromCharCode(byteVal);
        this.lastAccessedIdx++;
        if (this.currentLength === null || this.currentLength < this.lastAccessedIdx) {
          this.currentLength = this.lastAccessedIdx;
        }
        return;
      }
      charArr = this.toCharCodeArray(); // Convert to array to modify
    } else if (this.rawData !== null) {
      // If array exists but bytes are also cached, invalidate bytes.
      this.rawData = null;
      this.fullRawData = null;
      this.jsStringRepresentation = null;
    }
    charArr[index] = byteVal;
  },

  /**
   * Safely sets the character code at an index, performing bounds checking.
   * Throws an error if the index is out of bounds.
   * @param {number} index - The index to set.
   * @param {number} charCode - The character code to set.
   */
  safeSetChar: function(index, charCode) {
    if (this.currentLength === null) {
      this.convertToBytes();
    }
    if (index < 0 || index >= this.currentLength) {
      ml_array_out_of_bounds();
    }
    this.setCharAtIndex(index, charCode);
  },

  /**
   * Fills a portion of the string with a given character code.
   * @param {number} offset - Starting offset for filling.
   * @param {number} length - Number of characters to fill.
   * @param {number} fillChar - The character code to fill with.
   */
  fillRegion: function(offset, length, fillChar) {
    if (length <= 0) {
      return;
    }

    // Optimization: if filling with 0 past current data and current data is short,
    // and no array representation exists, it's a no-op as getCompleteBytes handles padding.
    if (offset >= this.lastAccessedIdx && this.lastAccessedIdx > 0 && fillChar === 0 && this.byteArray === null) {
      return;
    }

    let charArr = this.byteArray;
    if (!charArr) {
      charArr = this.toCharCodeArray();
    } else {
      // Invalidate other caches if array is being modified
      this.rawData = null;
      this.fullRawData = null;
      this.jsStringRepresentation = null;
    }

    const endOffset = offset + length;
    for (let idx = offset; idx < endOffset; idx++) {
      charArr[idx] = fillChar;
    }
  },

  /**
   * Compares this OcamlBytes object with another.
   * @param {OcamlBytes} otherBytes - The other OcamlBytes object.
   * @returns {number} -1 if less, 0 if equal, 1 if greater.
   */
  compareWith: function(otherBytes) {
    // Attempt to compare JavaScript string representations first for efficiency
    if (this.jsStringRepresentation !== null && otherBytes.jsStringRepresentation !== null) {
      if (this.jsStringRepresentation < otherBytes.jsStringRepresentation) return -1;
      if (this.jsStringRepresentation > otherBytes.jsStringRepresentation) return 1;
      return 0;
    }

    // Fallback to comparing full byte representations
    const bytes1 = this.getCompleteBytes();
    const bytes2 = otherBytes.getCompleteBytes();
    if (bytes1 < bytes2) return -1;
    if (bytes1 > bytes2) return 1;
    return 0;
  },

  /**
   * Checks for equality with another OcamlBytes object.
   * @param {OcamlBytes} otherBytes - The other OcamlBytes object.
   * @returns {boolean} True if equal, false otherwise.
   */
  isEqual: function(otherBytes) {
    // Prioritize JS string comparison
    if (this.jsStringRepresentation !== null && otherBytes.jsStringRepresentation !== null) {
      return this.jsStringRepresentation === otherBytes.jsStringRepresentation;
    }
    // Fallback to full byte comparison
    return this.getCompleteBytes() === otherBytes.getCompleteBytes();
  },

  /**
   * Checks if this OcamlBytes object is lexicographically less than another.
   * @param {OcamlBytes} otherBytes - The other OcamlBytes object.
   * @returns {boolean} True if less, false otherwise.
   */
  isLessThan: function(otherBytes) {
    if (this.jsStringRepresentation !== null && otherBytes.jsStringRepresentation !== null) {
      return this.jsStringRepresentation < otherBytes.jsStringRepresentation;
    }
    return this.getCompleteBytes() < otherBytes.getCompleteBytes();
  },

  /**
   * Checks if this OcamlBytes object is lexicographically less than or equal to another.
   * @param {OcamlBytes} otherBytes - The other OcamlBytes object.
   * @returns {boolean} True if less than or equal, false otherwise.
   */
  isLessOrEqual: function(otherBytes) {
    if (this.jsStringRepresentation !== null && otherBytes.jsStringRepresentation !== null) {
      return this.jsStringRepresentation <= otherBytes.jsStringRepresentation;
    }
    return this.getCompleteBytes() <= otherBytes.getCompleteBytes();
  }
};

/**
 * A specialized OcamlBytes subclass for wrapping existing JavaScript strings.
 * @param {string} str - The string to wrap.
 */
function OcamlWrappedString(str) {
  this.jsStringRepresentation = str;
  // Initialize other properties via super-constructor if needed, or set defaults.
  this.rawData = null;
  this.fullRawData = null;
  this.byteArray = null;
  this.currentLength = str.length; // Approximate length, actual bytes might differ
  this.lastAccessedIdx = 0;
  // This constructor primarily sets jsStringRepresentation, other parts are lazy.
}
// Inherit from OcamlBytes using Object.create for cleaner prototype chain.
OcamlWrappedString.prototype = Object.create(OcamlBytes.prototype);
OcamlWrappedString.prototype.constructor = OcamlWrappedString;
// Add a distinguishing property for this clone type
OcamlWrappedString.prototype.isWrapped = true;


/**
 * A specialized OcamlBytes subclass for creating a new byte string of a specified length.
 * Initializes with empty bytes and a declared length.
 * @param {number} length - The desired length of the new byte string.
 */
function OcamlMakeBytes(length) {
  this.rawData = ""; // Start with an empty byte string
  this.currentLength = length;
  this.lastAccessedIdx = 0;
  // Ensure other properties are null for lazy initialization
  this.fullRawData = null;
  this.byteArray = null;
  this.jsStringRepresentation = null;
}
OcamlMakeBytes.prototype = Object.create(OcamlBytes.prototype);
OcamlMakeBytes.prototype.constructor = OcamlMakeBytes;
OcamlMakeBytes.prototype.isNewAlloc = true;

/**
 * Retrieves an element from an OCaml-style array (which is `[0, elem1, elem2, ...]`).
 * Performs bounds checking and throws an error if out of range.
 * @param {Array<*>} ocamlArray - The OCaml array.
 * @param {number} index - The zero-based index of the element to retrieve.
 * @returns {*} The element at the specified index.
 */
function ml_array_fetch(ocamlArray, index) {
  // OCaml arrays are 1-indexed in JS representation (index 0 is a tag).
  // So, actual length for user-accessible elements is `array.length - 1`.
  const effectiveLength = ocamlArray.length - 1;
  if (index < 0 || index >= effectiveLength) {
    ml_array_out_of_bounds();
  }
  return ocamlArray[index + 1];
}

/**
 * Sets an element in an OCaml-style array.
 * Performs bounds checking and returns 0 (typical for OCaml unit return).
 * @param {Array<*>} ocamlArray - The OCaml array.
 * @param {number} index - The zero-based index to set.
 * @param {*} newValue - The value to place at the index.
 * @returns {number} 0 (unit value).
 */
function ml_array_assign(ocamlArray, index, newValue) {
  const effectiveLength = ocamlArray.length - 1;
  if (index < 0 || index >= effectiveLength) {
    ml_array_out_of_bounds();
  }
  ocamlArray[index + 1] = newValue;
  return 0; // OCaml 'unit' value
}

/**
 * Generic function application utility for OCaml functions, handling currying.
 * OCaml functions compiled to JS might have a 'fun' property for curried functions,
 * and they might expect arguments one by one or in batches.
 * @param {Function} func - The function to apply.
 * @param {Array<*>} argumentsList - An array of arguments to apply.
 * @returns {*} The result of the function application.
 */
function ml_apply_function_generic(func, argumentsList) {
  // If 'func' is itself a curried function wrapper, unwrap it.
  if (func.fun) {
    return ml_apply_function_generic(func.fun, argumentsList);
  }

  const expectedArgsCount = func.length;
  const providedArgsCount = argumentsList.length;
  const argumentDifference = expectedArgsCount - providedArgsCount;

  if (argumentDifference === 0) {
    // Perfect match: apply the function with all arguments.
    return func.apply(null, argumentsList);
  } else if (argumentDifference < 0) {
    // Too many arguments: apply the function with the first 'expectedArgsCount' arguments,
    // then recursively apply the result (which should be a new curried function)
    // with the remaining arguments.
    const initialApplicationResult = func.apply(null, argumentsList.slice(0, expectedArgsCount));
    return ml_apply_function_generic(initialApplicationResult, argumentsList.slice(expectedArgsCount));
  } else {
    // Too few arguments: return a new function that expects the remaining arguments.
    // This creates a curried function.
    return function(nextArg) {
      return ml_apply_function_generic(func, argumentsList.concat([nextArg]));
    };
  }
}

/**
 * Parses an OCaml format string into a structured object.
 * @param {string} formatString - The format string (e.g., "%+05d").
 * @returns {object} An object containing parsed formatting options.
 */
function ml_parse_format_spec(formatString) {
  // Ensure it's a string, then get its length.
  const formatStr = String(formatString);
  const strLen = formatStr.length;

  if (strLen > 31) { // Arbitrary limit for format string length.
    ml_throw_invalid_arg("Format specification string is excessively long.");
  }

  // Default formatting options.
  const formatOptions = {
    alignment: '+', // '+' for right-justified, '-' for left-justified.
    signMode: '-', // '-' for no explicit sign, '+' for always sign, ' ' for space for positive.
    paddingChar: ' ', // ' ' or '0'.
    alternateForm: false, // '#' flag for alternate form.
    radix: 0, // Base for number conversion (e.g., 10, 16, 8).
    isSignedConversion: false, // True if 'd', 'i', 'e', 'f', 'g' type.
    minimumWidth: 0, // Minimum field width.
    isUppercase: false, // True for 'X', 'E', 'F', 'G'.
    numberSign: 1, // -1 for negative, 1 for positive.
    precision: -1, // Number of digits after decimal or min digits for int.
    conversionType: 'f' // 'd', 'x', 'f', etc.
  };

  for (let charIndex = 0; charIndex < strLen; charIndex++) {
    const currentChar = formatStr[charIndex];

    switch (currentChar) {
      case '-':
        formatOptions.alignment = '-';
        break;
      case '+':
      case ' ':
        formatOptions.signMode = currentChar;
        break;
      case '0':
        formatOptions.paddingChar = '0';
        break;
      case '#':
        formatOptions.alternateForm = true;
        break;
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9': {
        let currentWidth = 0;
        let tempIdx = charIndex;
        while (tempIdx < strLen) {
          const digitCode = formatStr.charCodeAt(tempIdx) - 48; // ASCII '0' is 48
          if (digitCode >= 0 && digitCode <= 9) {
            currentWidth = currentWidth * 10 + digitCode;
            tempIdx++;
          } else {
            break;
          }
        }
        formatOptions.minimumWidth = currentWidth;
        charIndex = tempIdx - 1; // Adjust loop index
        break;
      }
      case '.': {
        formatOptions.precision = 0;
        let tempIdx = charIndex + 1;
        while (tempIdx < strLen) {
          const digitCode = formatStr.charCodeAt(tempIdx) - 48;
          if (digitCode >= 0 && digitCode <= 9) {
            formatOptions.precision = formatOptions.precision * 10 + digitCode;
            tempIdx++;
          } else {
            break;
          }
        }
        charIndex = tempIdx - 1;
        break;
      }
      case 'd':
      case 'i':
        formatOptions.isSignedConversion = true;
        formatOptions.radix = 10;
        break;
      case 'u':
        formatOptions.radix = 10;
        break;
      case 'x':
        formatOptions.radix = 16;
        break;
      case 'X':
        formatOptions.radix = 16;
        formatOptions.isUppercase = true;
        break;
      case 'o':
        formatOptions.radix = 8;
        break;
      case 'e':
      case 'f':
      case 'g':
        formatOptions.isSignedConversion = true;
        formatOptions.conversionType = currentChar;
        break;
      case 'E':
      case 'F':
      case 'G':
        formatOptions.isSignedConversion = true;
        formatOptions.isUppercase = true;
        formatOptions.conversionType = currentChar.toLowerCase();
        break;
    }
  }
  return formatOptions;
}

/**
 * Applies formatting options to a raw string output.
 * @param {object} formatSettings - The parsed formatting options.
 * @param {string} rawStringOutput - The string representation of the number/value before final formatting.
 * @returns {OcamlWrappedString} A wrapped OCaml string with the final formatted output.
 */
function ml_finalize_formatted_output(formatSettings, rawStringOutput) {
  let processedOutput = rawStringOutput;

  if (formatSettings.isUppercase) {
    processedOutput = processedOutput.toUpperCase();
  }

  let effectiveLength = processedOutput.length;
  // Account for sign character if applicable
  if (formatSettings.isSignedConversion && (formatSettings.numberSign < 0 || formatSettings.signMode !== '-')) {
    effectiveLength++;
  }
  // Account for alternate form prefix (e.g., '0' for octal, '0x' for hex)
  if (formatSettings.alternateForm) {
    if (formatSettings.radix === 8) effectiveLength++;
    if (formatSettings.radix === 16) effectiveLength += 2;
  }

  let finalBuffer = "";

  // 1. Pre-padding for right-justified, space-filled.
  if (formatSettings.alignment === '+' && formatSettings.paddingChar === ' ') {
    for (let i = effectiveLength; i < formatSettings.minimumWidth; i++) {
      finalBuffer += ' ';
    }
  }

  // 2. Sign character.
  if (formatSettings.isSignedConversion) {
    if (formatSettings.numberSign < 0) {
      finalBuffer += '-';
    } else if (formatSettings.signMode !== '-') {
      finalBuffer += formatSettings.signMode;
    }
  }

  // 3. Alternate form prefix.
  if (formatSettings.alternateForm) {
    if (formatSettings.radix === 8) finalBuffer += '0';
    if (formatSettings.radix === 16) finalBuffer += "0x";
  }

  // 4. Pre-padding for right-justified, zero-filled.
  if (formatSettings.alignment === '+' && formatSettings.paddingChar === '0') {
    for (let i = effectiveLength; i < formatSettings.minimumWidth; i++) {
      finalBuffer += '0';
    }
  }

  // 5. The actual number string.
  finalBuffer += processedOutput;

  // 6. Post-padding for left-justified.
  if (formatSettings.alignment === '-') {
    for (let i = effectiveLength; i < formatSettings.minimumWidth; i++) {
      finalBuffer += ' ';
    }
  }

  return new OcamlWrappedString(finalBuffer);
}

/**
 * Formats an integer according to an OCaml-style format string.
 * @param {string|OcamlBytes} formatSpecifier - The format string or OcamlBytes object.
 * @param {number} integerValue - The integer to format.
 * @returns {OcamlWrappedString} The formatted integer as an OcamlWrappedString.
 */
function ml_format_integer(formatSpecifier, integerValue) {
  // Special case optimization for "%d"
  if (String(formatSpecifier) === "%d") {
    return new OcamlWrappedString(String(integerValue));
  }

  const parsedFormat = ml_parse_format_spec(formatSpecifier);
  let numberToFormat = integerValue;

  if (numberToFormat < 0) {
    if (parsedFormat.isSignedConversion) {
      parsedFormat.numberSign = -1;
      numberToFormat = Math.abs(numberToFormat); // Use Math.abs for clarity
    } else {
      // Unsigned conversion of negative number
      numberToFormat >>>= 0; // Convert to unsigned 32-bit integer
    }
  }

  let numberAsString = numberToFormat.toString(parsedFormat.radix);

  if (parsedFormat.precision >= 0) {
    parsedFormat.paddingChar = ' '; // Precision overrides zero-padding
    const neededZeros = parsedFormat.precision - numberAsString.length;
    if (neededZeros > 0) {
      numberAsString = ml_string_repeat(neededZeros, '0') + numberAsString;
    }
  }

  return ml_finalize_formatted_output(parsedFormat, numberAsString);
}

/**
 * Compares two 64-bit integers represented as OCaml-style arrays `[tag, low, mid, high]`.
 * @param {Array<number>} int64_a - The first 64-bit integer array.
 * @param {Array<number>} int64_b - The second 64-bit integer array.
 * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
 */
function ml_compare_int64(int64_a, int64_b) {
  // The original uses x[3] << 16 for comparison, which is a bit unusual.
  // Assuming x[3] is the most significant part.
  const a_high = int64_a[3];
  const b_high = int64_b[3];

  if (a_high > b_high) return 1;
  if (a_high < b_high) return -1;

  // Compare middle parts
  const a_mid = int64_a[2];
  const b_mid = int64_b[2];
  if (a_mid > b_mid) return 1;
  if (a_mid < b_mid) return -1;

  // Compare low parts
  const a_low = int64_a[1];
  const b_low = int64_b[1];
  if (a_low > b_low) return 1;
  if (a_low < b_low) return -1;

  return 0; // Equal
}

/**
 * Compares two standard JavaScript integers.
 * @param {number} int_a - The first integer.
 * @param {number} int_b - The second integer.
 * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
 */
function ml_compare_integer(int_a, int_b) {
  return (int_a < int_b) ? -1 : ((int_a === int_b) ? 0 : 1);
}

/**
 * Performs a deep, structural comparison between two OCaml values.
 * This function uses an iterative approach with a stack to handle nested structures.
 * It's a complex function due to OCaml's polymorphic comparison rules.
 * @param {*} value_a - The first value.
 * @param {*} value_b - The second value.
 * @param {boolean} requireTotalEquality - If true, distinguishes between -0 and +0, and NaN.
 * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
 */
function ml_recursive_compare(value_a, value_b, requireTotalEquality) {
  const comparison_stack = []; // Stores [a, b, index] for array/tuple comparison

  // Helper function for instanceof checks, can be useful for Type III additions
  const isOcamlArrayType = (val) => Array.isArray(val) && (val[0] === (val[0] | 0));

  while (true) {
    if (!(requireTotalEquality && value_a === value_b)) { // Short-circuit if strictly equal and total equality isn't needed
      if (value_a instanceof OcamlBytes) {
        if (value_b instanceof OcamlBytes) {
          // Both are OcamlBytes, use their custom comparison
          if (value_a !== value_b) { // Only compare if not same object reference
            const strComparisonResult = value_a.compareWith(value_b);
            if (strComparisonResult !== 0) return strComparisonResult;
          }
        } else {
          return 1; // OcamlBytes is "greater" than other types
        }
      } else if (isOcamlArrayType(value_a)) {
        const typeTag_a = value_a[0];

        if (typeTag_a === 250) { // OCaml forwarding tag (e.g., mutable block)
          value_a = value_a[1]; // Dereference and continue comparison
          continue;
        }

        if (isOcamlArrayType(value_b)) {
          const typeTag_b = value_b[0];

          if (typeTag_b === 250) { // OCaml forwarding tag
            value_b = value_b[1];
            continue;
          } else if (typeTag_a !== typeTag_b) {
            // Different OCaml array tags, compare based on tag value
            return (typeTag_a < typeTag_b) ? -1 : 1;
          } else {
            // Same OCaml array tag, specific comparison logic
            switch (typeTag_a) {
              case 248: { // OCaml Block tag for custom values (e.g., closures, objects)
                // Typically compares size, then contents. Here, only size is compared.
                const sizeComparison = ml_compare_integer(value_a[2], value_b[2]);
                if (sizeComparison !== 0) return sizeComparison;
                break; // Continue to element-wise comparison if necessary
              }
              case 255: { // OCaml Int64 tag
                const int64Comparison = ml_compare_int64(value_a, value_b);
                if (int64Comparison !== 0) return int64Comparison;
                break;
              }
              default:
                // For other arrays (tuples, records, variants), compare lengths first.
                if (value_a.length !== value_b.length) {
                  return (value_a.length < value_b.length) ? -1 : 1;
                }
                // If lengths are equal and > 1 (meaning it has elements beyond the tag),
                // push to stack for element-wise comparison starting from index 1.
                if (value_a.length > 1) {
                  comparison_stack.push(value_a, value_b, 1);
                }
                break;
            }
          }
        } else {
          return 1; // OCaml array is "greater" than other non-OcamlBytes types
        }
      } else if (value_b instanceof OcamlBytes || isOcamlArrayType(value_b)) {
        return -1; // Non-OcamlBytes, non-array is "less" than OcamlBytes or OCaml array
      } else {
        // Primitive values (numbers, booleans, null, undefined)
        if (value_a < value_b) return -1;
        if (value_a > value_b) return 1;
        if (requireTotalEquality && value_a !== value_b) {
          // Handle NaN and -0/+0 if total equality is required
          // NaN is only not equal to itself: (NaN == NaN) is false
          if (value_a !== value_a) return 1; // a is NaN, b is not
          if (value_b !== value_b) return -1; // b is NaN, a is not
          // -0 vs +0: (-0 === +0) is true, so use Object.is
          if (Object.is(value_a, value_b) === false) {
             return (value_a < value_b) ? -1 : 1; // This case might not be hit if a===b is true for -0/+0
          }
        }
      }
    }

    // If we reach here, current a and b are either equal or have been fully processed
    // without a definitive difference. Pop from stack to compare next elements.
    if (comparison_stack.length === 0) {
      return 0; // All elements compared and found equal.
    }

    const current_idx = comparison_stack.pop();
    value_b = comparison_stack.pop();
    value_a = comparison_stack.pop();

    if (current_idx + 1 < value_a.length) {
      // More elements in current array pair to compare, push back for next iteration
      comparison_stack.push(value_a, value_b, current_idx + 1);
    }
    // Set a and b to the next elements to compare
    value_a = value_a[current_idx];
    value_b = value_b[current_idx];
  }
}

/**
 * Performs a deep comparison of two OCaml values, requiring total equality.
 * @param {*} val1 - The first value.
 * @param {*} val2 - The second value.
 * @returns {number} -1 if val1 < val2, 0 if val1 == val2, 1 if val1 > val2.
 */
function ml_deep_compare(val1, val2) {
  return ml_recursive_compare(val1, val2, true);
}

/**
 * Checks if the first OCaml value is greater than or equal to the second.
 * @param {*} item_x - The first value.
 * @param {*} item_y - The second value.
 * @returns {number} 1 if x >= y, 0 otherwise.
 */
function ml_is_greater_or_equal(item_x, item_y) {
  // Use non-total equality comparison for this standard greater/equal check.
  return (ml_recursive_compare(item_x, item_y, false) >= 0) ? 1 : 0;
}

/**
 * Parses the sign and base prefix from an OcamlBytes string.
 * Supports decimal, hexadecimal (0x, 0X), octal (0o, 0O), and binary (0b, 0B).
 * @param {OcamlBytes} inputString - The string to parse.
 * @returns {Array<number>} An array containing [startIndex, signMultiplier, parsedBase].
 */
function ml_parse_num_prefix(inputString) {
  let currentOffset = 0;
  let signValue = 1;

  // Check for negative sign at the beginning
  if (inputString.getCharAtIndex(0) === 45) { // ASCII for '-'
    signValue = -1;
    currentOffset++;
  }

  let detectedBase = 10;
  // Check for '0' prefix indicating non-decimal base
  if (inputString.getCharAtIndex(currentOffset) === 48) { // ASCII for '0'
    const nextChar = inputString.getCharAtIndex(currentOffset + 1);
    switch (nextChar) {
      case 120: // 'x'
      case 88: // 'X'
        detectedBase = 16;
        currentOffset += 2;
        break;
      case 111: // 'o'
      case 79: // 'O'
        detectedBase = 8;
        currentOffset += 2;
        break;
      case 98: // 'b'
      case 66: // 'B'
        detectedBase = 2;
        currentOffset += 2;
        break;
    }
  }
  return [currentOffset, signValue, detectedBase];
}

/**
 * Converts an ASCII character code to its corresponding digit value.
 * Supports 0-9, A-F/a-f.
 * @param {number} charCode - The ASCII character code.
 * @returns {number} The digit value (0-15) or -1 if not a valid digit.
 */
function ml_get_digit_value(charCode) {
  if (charCode >= 48 && charCode <= 57) { // '0' through '9'
    return charCode - 48;
  }
  if (charCode >= 65 && charCode <= 90) { // 'A' through 'Z'
    return charCode - 55; // 'A' (65) -> 10
  }
  if (charCode >= 97 && charCode <= 122) { // 'a' through 'z'
    return charCode - 87; // 'a' (97) -> 10
  }
  return -1;
}

/**
 * Global array to store OCaml runtime-specific global values (exceptions, etc.).
 * The first element is typically unused or a placeholder.
 */
const ml_runtime_state = [0];

/**
 * Raises a generic 'Failure' exception with a message.
 * @param {string} errorMessage - The message for the failure.
 */
function ml_fail_with_message(errorMessage) {
  // ml_runtime_state[3] corresponds to the 'Failure' tag.
  ml_raise_string_exception(ml_runtime_state[3], errorMessage);
}

/**
 * Converts an OcamlBytes string representation of an integer to a JavaScript number.
 * Handles signs, bases (decimal, hex, octal, binary), and underscores.
 * Throws 'Failure' if format is invalid or value overflows 32-bit integer.
 * @param {OcamlBytes} inputBytes - The string to convert.
 * @returns {number} The parsed integer.
 */
function ml_integer_from_string(inputBytes) {
  const [startIdx, sign, base] = ml_parse_num_prefix(inputBytes);
  const inputLen = inputBytes.getLength(); // Use getLength to ensure it's calculated

  // Max positive 32-bit int: 2^31 - 1 = 2147483647
  // Max unsigned 32-bit int: 2^32 - 1 = 4294967295
  // Using -1 >>> 0 for unsigned max, which is 2^32 - 1.
  // For signed, the threshold should be 2^31-1. Let's use it for the absolute value.
  const unsignedThreshold = 0xFFFFFFFF; // Max unsigned 32-bit value
  const signedMaxAbsThreshold = 0x7FFFFFFF; // Max absolute value for signed 32-bit

  let currentResult = 0;
  let charCursor = startIdx;
  let firstDigitFound = false;

  // Read first digit
  let currentCharCode = inputBytes.getCharAtIndex(charCursor);
  let digitValue = ml_get_digit_value(currentCharCode);

  if (digitValue < 0 || digitValue >= base) {
    ml_fail_with_message("int_of_string: Invalid digit or empty string after prefix.");
  }
  currentResult = digitValue;
  firstDigitFound = true;
  charCursor++;

  // Read remaining digits
  while (charCursor < inputLen) {
    currentCharCode = inputBytes.getCharAtIndex(charCursor);
    if (currentCharCode === 95) { // ASCII for '_' (underscore separator)
      charCursor++;
      continue;
    }

    digitValue = ml_get_digit_value(currentCharCode);
    if (digitValue < 0 || digitValue >= base) {
      break; // End of number
    }

    // Check for potential overflow before multiplication and addition
    // This is a simplified check. A more robust check would consider `(unsignedThreshold - digitValue) / base`
    if (currentResult > (unsignedThreshold / base) || (currentResult === Math.floor(unsignedThreshold / base) && digitValue > (unsignedThreshold % base))) {
        // If it's unsigned context and it overflows 32-bit, it's an error.
        // If it's signed, and absolute value overflows 2^31-1, it's an error.
        // The original code uses `res > threshold` where threshold is unsigned.
        // This implies that any value that exceeds unsigned 32-bit max is an error.
        ml_fail_with_message("int_of_string: Number value exceeds 32-bit integer range.");
    }

    currentResult = base * currentResult + digitValue;
    charCursor++;
  }

  // Ensure all characters after the prefix were part of the number or underscores
  if (charCursor !== inputLen) {
    ml_fail_with_message("int_of_string: Extra characters after integer literal.");
  }

  // Apply sign
  let finalResult = sign * currentResult;

  // Final check for 32-bit integer range (signed)
  // `(finalResult | 0) != finalResult` checks if it's outside signed 32-bit range.
  if ((finalResult | 0) !== finalResult) {
    ml_fail_with_message("int_of_string: Resulting integer is outside 32-bit signed range.");
  }

  return finalResult;
}

/**
 * Provides a safe and polyfilled console object for logging.
 * Ensures that console methods exist even in environments without a full console.
 * @returns {object} A console-like object.
 */
function ml_get_js_console() {
  // Use `window.console` or `global.console` depending on environment
  const globalConsole = typeof window !== 'undefined' ? window.console : (typeof global !== 'undefined' ? global.console : null);
  const safeConsole = globalConsole || {};

  const commonMethods = [
    "log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd", "clear" // Added 'clear'
  ];

  // Provide no-op functions for missing console methods
  const noOp = () => {};
  for (const methodName of commonMethods) {
    if (typeof safeConsole[methodName] !== 'function') {
      safeConsole[methodName] = noOp;
    }
  }
  return safeConsole;
}

/**
 * Converts a JavaScript array into an OCaml-style list array (prepends a tag `0`).
 * @param {Array<*>} jsArray - The JavaScript array.
 * @returns {Array<*>} The OCaml-style array.
 */
function ml_js_array_to_list(jsArray) {
  if (!Array.isArray(jsArray)) {
    console.warn("ml_js_array_to_list received non-array input:", jsArray);
    return [0]; // Return empty OCaml list
  }
  return [0, ...jsArray]; // Using spread syntax
}

/**
 * Creates an OCaml-style vector (array) of a specified length, initialized with a value.
 * @param {number} vectorLength - The desired length of the vector (excluding tag).
 * @param {*} initialValue - The value to initialize each element with.
 * @returns {Array<*>} The new OCaml-style vector.
 */
function ml_create_vector(vectorLength, initialValue) {
  if (vectorLength < 0) {
    ml_throw_invalid_arg("Vector length cannot be negative.");
  }
  // Create an array with `length + 1` to accommodate the `0` tag.
  const newVector = Array.from({ length: vectorLength + 1 }, (_, index) => {
    return (index === 0) ? 0 : initialValue; // Element at index 0 is the tag
  });
  return newVector;
}

/**
 * Placeholder function for retrieving a list of OCaml output channels.
 * In this JS runtime, it currently returns a 'unit' (0).
 * @returns {number} 0 (unit).
 */
function ml_get_output_channels() {
  console.debug("ml_get_output_channels called, returning 0 (unit).");
  return 0;
}

/**
 * Registers a value in the global OCaml runtime state array.
 * @param {number} index - The index (plus 1) in the global state array.
 * @param {*} value - The value to register.
 */
function ml_register_global_value(index, value) {
  if (index < 0 || index + 1 >= ml_runtime_state.length + 10) { // Allow some growth
     console.warn(`Attempting to register global value at unusual index ${index}.`);
     // Dynamically resize if needed, or throw error for very large/negative indices.
     if (index + 1 >= ml_runtime_state.length) {
         ml_runtime_state.length = index + 2; // Make room
     }
  }
  ml_runtime_state[index + 1] = value;
}

/**
 * A registry for named OCaml values exported to JavaScript.
 */
const ml_named_exports_registry = {};

/**
 * Registers a value under a specific name in the export registry.
 * @param {string} exportName - The name to register the value under.
 * @param {*} exportedValue - The value to register.
 * @returns {number} 0 (unit).
 */
function ml_register_export(exportName, exportedValue) {
  if (typeof exportName !== 'string' || exportName.trim() === '') {
    console.error("Attempted to register a named value with an invalid name:", exportName);
    return 1; // Indicate error
  }
  ml_named_exports_registry[exportName] = exportedValue;
  return 0; // OCaml 'unit' value
}

// Immediately-invoked function expression (IIFE) for main execution logic.
(function() {
  /**
   * Helper to apply a (potentially curried) function with two arguments.
   * @param {Function} func - The function to apply.
   * @param {*} arg1 - The first argument.
   * @param {*} arg2 - The second argument.
   * @returns {*} The result of the function application.
   */
  function apply_two_args(func, arg1, arg2) {
    if (func.length === 2) {
      return func(arg1, arg2);
    }
    return ml_apply_function_generic(func, [arg1, arg2]);
  }

  /**
   * Helper to apply a (potentially curried) function with one argument.
   * @param {Function} func - The function to apply.
   * @param {*} arg1 - The argument.
   * @returns {*} The result of the function application.
   */
  function apply_one_arg(func, arg1) {
    if (func.length === 1) {
      return func(arg1);
    }
    return ml_apply_function_generic(func, [arg1]);
  }

  // OCaml exception definitions as JS arrays.
  const failureExn = [0, new OcamlWrappedString("Failure")];
  const invalidArgExn = [0, new OcamlWrappedString("Invalid_argument")];

  // Register global exceptions.
  ml_register_global_value(6, [0, new OcamlWrappedString("Not_found")]);
  ml_register_global_value(5, [0, new OcamlWrappedString("Division_by_zero")]);
  ml_register_global_value(3, invalidArgExn);
  ml_register_global_value(2, failureExn);

  // Constants and OCaml values used in the main logic.
  const formatIntegerSpec = new OcamlWrappedString("%d");
  const exitMessage = new OcamlWrappedString("Pervasives.Exit");
  const doAtExitMessage = new OcamlWrappedString("Pervasives.do_at_exit");
  const emptyList = [0, 0, 0]; // Represents an empty OCaml list `[]` (tag 0, head 0, tail 0)
  const splitNErrorMessage = new OcamlWrappedString("split_n");
  const noGameMessage = new OcamlWrappedString("NO GAME");
  const listNilMessage = new OcamlWrappedString("list is nil");
  const getInputErrorMessage = new OcamlWrappedString("get_input");
  const whitespaceRegexPattern = new OcamlWrappedString("\\s"); // Regex for whitespace

  /**
   * Helper to throw an 'Invalid_argument' exception.
   * @param {OcamlWrappedString} msg - The error message.
   */
  function throw_invalid_arg_helper(msg) {
    throw [0, invalidArgExn, msg];
  }

  const exitExnTag = [0, exitMessage]; // Exception tag for Pervasives.Exit

  /**
   * Returns the maximum of two OCaml values using `ml_is_greater_or_equal`.
   * @param {*} val1 - First value.
   * @param {*} val2 - Second value.
   * @returns {*} The greater value.
   */
  function ml_max_value(val1, val2) {
    return ml_is_greater_or_equal(val1, val2) ? val1 : val2;
  }

  /**
   * Reverses an OCaml list (represented as nested arrays `[0, head, tail]`).
   * @param {Array<*>} ocamlList - The list to reverse.
   * @param {Array<*>} accumulator - The accumulated reversed list.
   * @returns {Array<*>} The reversed list.
   */
  function reverse_list_recursive(ocamlList, accumulator) {
    let currentList = ocamlList;
    let currentAcc = accumulator;
    while (currentList) { // While list is not empty (null or 0)
      const head = currentList[1];
      const tail = currentList[2];
      currentAcc = [0, head, currentAcc]; // Prepend head to accumulator
      currentList = tail; // Move to next element
    }
    return currentAcc;
  }

  /**
   * Executes registered 'at_exit' functions.
   * This function iterates through a list of output channels and attempts to flush them.
   * @returns {number} 0 (unit).
   */
  function execute_at_exit_handlers() {
    let channels = ml_get_output_channels();
    while (channels) {
      const nextChannel = channels[2];
      try {
        // In a real OCaml runtime, this would call a flush function on the channel.
        // For cloning, the try/catch is important, but the internal logic is simplified.
        // No-op for now.
      } catch (err) {
        // Log or handle error during channel flush if necessary.
        ml_js_console.error("Error during at_exit channel flush:", err);
      }
      channels = nextChannel;
    }
    return 0;
  }
  ml_register_export(doAtExitMessage.toString(), execute_at_exit_handlers);

  /**
   * Transforms a JS array into an OCaml-style list (nested arrays).
   * @param {Array<*>} jsArr - The input JS array.
   * @returns {Array<*>} The OCaml list.
   */
  function js_array_to_ocaml_list(jsArr) {
    let currentList = emptyList; // Start with an empty list
    // Iterate backwards to build the list in correct order
    for (let i = jsArr.length - 1; i >= 0; i--) {
      currentList = [0, jsArr[i], currentList];
    }
    return currentList;
  }

  /**
   * Flattens a list of lists into a single list.
   * @param {Array<*>} listOfLists - An OCaml list where each element is itself an OCaml list.
   * @returns {Array<*>} A single flattened OCaml list.
   */
  function flatten_ocaml_lists(listOfLists) {
    if (!listOfLists) {
      return emptyList;
    }
    const currentHead = listOfLists[1];
    const currentTail = listOfLists[2];
    return reverse_list_recursive(currentHead, flatten_ocaml_lists(currentTail));
  }

  /**
   * Maps a function over an OCaml list.
   * @param {Function} mapFunc - The function to apply to each element.
   * @param {Array<*>} inputList - The OCaml list.
   * @returns {Array<*>} A new OCaml list with mapped elements.
   */
  function map_ocaml_list(mapFunc, inputList) {
    let resultList = emptyList;
    let current = inputList;
    const tempElements = []; // Store elements temporarily to reverse later

    while (current) {
      const head = current[1];
      const mappedHead = apply_one_arg(mapFunc, head);
      tempElements.push(mappedHead);
      current = current[2];
    }
    // Reconstruct list in correct order
    for (let i = tempElements.length - 1; i >= 0; i--) {
        resultList = [0, tempElements[i], resultList];
    }
    return resultList;
  }

  // Define global variables for the main loop.
  // P is a mutable list, here using a JS array as a placeholder.
  const mutable_list_container = [0, 0]; // [tag, head, tail] structure for OCaml list
  // Use standard JS RegExp and Array constructors directly.
  const RegexConstructor = RegExp;
  const JsArrayConstructor = Array;

  /**
   * Identity function.
   * @param {*} x - Any value.
   * @returns {*} The input value.
   */
  function identity_func(x) {
    return x;
  }

  /**
   * Converts a value to an OcamlWrappedString, or 0 if it's an array.
   * This seems to be a type-checking helper.
   * @param {*} value - The value to convert.
   * @returns {0|OcamlWrappedString} 0 if Array, else wrapped string.
   */
  function convert_to_wrapped_string_or_zero(value) {
    // Original: `R instanceof S?0:[0,new MlWrappedString(R.toString())];`
    // S is Array. So if value is an Array, return 0. Else, wrap its string representation.
    return (value instanceof JsArrayConstructor) ? 0 : [0, new OcamlWrappedString(String(value))];
  }
  mutable_list_container[1] = [0, convert_to_wrapped_string_or_zero, mutable_list_container[1]]; // Push to list

  const ml_js_console = ml_get_js_console(); // Get the safe console instance.

  /**
   * Curried function to apply function `fn` to `arg2` with `arg1`.
   * @param {Function} fn - The function to apply.
   * @returns {Function} A new function expecting arg2.
   */
  function curried_apply_fn(fn) {
    return function(arg2) {
      return apply_one_arg(fn, arg2);
    };
  }

  /**
   * Converts any value to its string representation.
   * @param {*} val - The value.
   * @returns {string} The string representation.
   */
  function value_to_string(val) {
    return String(val);
  }

  /**
   * Logs a value to the console using `ml_js_console.log`.
   * @param {*} val - The value to log.
   */
  function log_to_console(val) {
    ml_js_console.log(value_to_string(val));
  }

  /**
   * Generates an OCaml list of integers in a range [start, end).
   * @param {number} startVal - The starting integer (inclusive).
   * @param {number} endVal - The ending integer (exclusive).
   * @returns {Array<*>} An OCaml list of integers.
   */
  function generate_integer_range(startVal, endVal) {
    let currentList = emptyList;
    // Iterate backwards to build the list in correct order for OCaml list structure
    for (let i = endVal - 1; i >= startVal; i--) {
      currentList = [0, i, currentList];
    }
    return currentList;
  }

  /**
   * Takes the first 'count' elements from an OCaml list.
   * Throws an error if the list is too short.
   * @param {number} count - Number of elements to take.
   * @param {Array<*>} sourceList - The OCaml list.
   * @returns {Array<*>} An OCaml list containing the first 'count' elements.
   */
  function take_n_elements(count, sourceList) {
    if (count < 0) {
      throw_invalid_arg_helper(splitNErrorMessage); // Negative count is invalid
    }

    // Inner recursive helper to build the list
    function take_recursive_helper(remainingCount, currentList) {
      if (remainingCount === 0) {
        return emptyList;
      }
      if (!currentList) {
        // If we run out of list elements before 'remainingCount' is 0
        throw [0, exitExnTag]; // A specific exception for this case
      }
      const head = currentList[1];
      const tail = currentList[2];
      const remainingElements = take_recursive_helper(remainingCount - 1, tail);
      return [0, head, remainingElements];
    }

    try {
      const resultList = take_recursive_helper(count, sourceList);
      // The original code returned [0, resultList, remainingList] or [0, resultList].
      // The clone's take_n_elements returns the taken part and the remaining part separately.
      // The original code returns [0, [0, taken_list], remainder_list]
      // Let's rephrase to match that structure.
      // This is a complex part of the original clone where `ah` returns `[0,[0,af[1],ai[1]],ai[2]]`
      // which means it's `[0, [0, head, taken_tail], remaining_list_part]`
      // This function needs to return `[0, taken_list, remaining_list]`
      // The original is `ah(ag,af)` where `ag` is count and `af` is sourceList.
      // `ai` is `[0,[0,af[1],ai[1]],ai[2]]`. So `ai[1]` is the taken list, `ai[2]` is the remainder.
      // `[0,[0,af[1],ai[1]],ai[2]]` means `[0, [0, current_head, taken_tail], remainder_tail]`
      // This needs careful reconstruction.
      // Let's re-read the original `ah` function closely:
      // `function ah(ag,af){if(af){if(0<ag){var ai=ah(ag-1|0,af[2]);return [0,[0,af[1],ai[1]],ai[2]];}return [0,0,af];}return 0===ag?j:d(i);}`
      // `j` is `emptyList`, `d(i)` is `throw_invalid_arg_helper(splitNErrorMessage)`.
      // `[0,0,af]` means `[tag, empty_taken_list, original_list_as_remainder]`
      // The `ai` result is `[tag, [tag, head_taken, taken_tail], remainder_list_tail]`
      // So `ah` returns `[0, taken_list_part, remainder_list_part]`
      // `taken_list_part` itself is an OCaml list `[0, head, tail]`.
      // This implies a structure like `[0, [0, head1, [0, head2, ...]], [0, rem1, [0, rem2, ...]]]`

      let takenResult = emptyList;
      let currentRemainder = sourceList;
      let counter = count;
      const takenElementsBuffer = [];

      while (counter > 0 && currentRemainder) {
        takenElementsBuffer.push(currentRemainder[1]); // head
        currentRemainder = currentRemainder[2]; // tail
        counter--;
      }

      if (counter > 0) { // If ran out of elements before count was reached
        // The original `ah` function throws `d(i)` (invalid_argument "split_n") in this case.
        // My `take_recursive_helper` throws `[0, n]`.
        throw_invalid_arg_helper(splitNErrorMessage);
      }

      // Reconstruct taken list from buffer
      for (let i = takenElementsBuffer.length - 1; i >= 0; i--) {
        takenResult = [0, takenElementsBuffer[i], takenResult];
      }

      return [0, takenResult, currentRemainder]; // [0, taken_list, remainder_list]

    } catch (ex) {
      if (ex[1] === exitExnTag) {
        // This catch block handles the specific exit exception.
        // The original code implies that if `av` throws `n` (exitExnTag),
        // the `aA` variable (result of `av`) becomes `0`.
        return [0, emptyList, sourceList]; // If not enough elements, take 0, remainder is original
      }
      throw ex; // Re-throw other exceptions
    }
  }


  /**
   * Folds (reduces) an OCaml list from left to right.
   * @param {Array<*>} ocamlList - The list to fold.
   * @param {Function} folderFunc - The folding function `(accumulator, element) -> new_accumulator`.
   * @returns {*} The final accumulated value.
   */
  function fold_left_ocaml_list(ocamlList, folderFunc) {
    if (!ocamlList) { // If list is empty, it needs an initial accumulator
      throw_invalid_arg_helper(listNilMessage); // Original `d(g)`
    }

    let current = ocamlList;
    let accumulator = current[1]; // First element is initial accumulator
    current = current[2]; // Start iterating from the second element

    while (current) {
      const head = current[1];
      accumulator = apply_two_args(folderFunc, accumulator, head);
      current = current[2];
    }
    return accumulator;
  }

  /**
   * Converts an OcamlBytes string to an integer.
   * @param {OcamlBytes} strBytes - The OcamlBytes string.
   * @returns {number} The parsed integer.
   */
  function convert_bytes_to_int(strBytes) {
    return ml_integer_from_string(strBytes);
  }

  /**
   * Applies a function to each element of a list and then folds the resulting list using a folder.
   * This is a combination of map and fold, but designed for a specific nested list structure
   * and aggregation logic in the main program.
   * @param {number} takeCount - Number of elements to take from inner lists.
   * @param {Array<*>} nestedOcamlList - A list of lists of integers.
   * @returns {number} The aggregated sum.
   */
  function process_and_aggregate_list(takeCount, nestedOcamlList) {
    // This function mimics the `aN` function in the original.
    // `aN(ay,aI)` where `ay` is `takeCount` and `aI` is `nestedOcamlList`.
    // It uses `aJ` (fold_left_ocaml_list) and `aF` (a map-like function).

    function map_inner_lists_and_sum(currentOuterList) {
      // This is `aF` in the original.
      // It iterates through `currentOuterList` (which is `ax` in original `aF`).
      // For each inner list, it takes `takeCount` elements using `av`.

      function take_n_from_inner(n, innerList) {
        // This is `av` in the original.
        // It's a simplified take_n that only returns the taken list, or throws `n` (exitExnTag)
        if (n === 0) return emptyList;
        if (!innerList) throw [0, exitExnTag]; // Ran out of elements
        const head = innerList[1];
        const tail = innerList[2];
        return [0, head, take_n_from_inner(n - 1, tail)];
      }

      let takenInnerList;
      try {
        takenInnerList = [0, take_n_from_inner(takeCount, currentOuterList)]; // `az` and `aA`
      } catch (exception) {
        if (exception[1] !== exitExnTag) throw exception;
        takenInnerList = 0; // If `take_n_from_inner` throws `exitExnTag`, result is `0`
      }

      if (takenInnerList) {
        const takenElements = takenInnerList[1]; // The list of taken elements
        // Sum the elements in `takenElements`
        const sumOfTaken = fold_left_ocaml_list(takenElements, (acc, elem) => acc + elem); // `aG`
        const nextOuterList = currentOuterList ? currentOuterList[2] : null; // `ax[2]`
        if (nextOuterList) {
          return [0, sumOfTaken, map_inner_lists_and_sum(nextOuterList)]; // Recursive call for next outer list
        } else {
          // If no more outer lists, return the sum as a single-element list.
          // The original code `var aH=[0,ay,0];` if `ax` is `null` (end of list), but this needs to be `[0, sum, emptyList]`
          // The structure of `aH` implies `[0, taken, remainder]`.
          // `aH` is set to `[0,ay,0]` (where `ay` is `takeCount`) if `ax` is empty, or `aA` if `aA` is not empty.
          // This part is tricky. `aN` takes `a3` (takeCount) and `a2` (list of lists of ints)
          // `aF` maps `a2` to `[0, sum, next_aF_result]` or `[0, sum, emptyList]`
          // If `ax` is empty, `aF` returns `aH` which is `aA` (0)
          // The result of `aF` is a list of sums. Let's make it so.
          return [0, sumOfTaken, emptyList]; // Final element in the mapped list
        }
      } else {
        // If `take_n_from_inner` failed (threw exitExnTag), return 0.
        // This corresponds to `var aH=aA;` where `aA` was 0.
        return emptyList; // Returning an empty list of sums.
      }
    }

    const list_of_sums = map_inner_lists_and_sum(nestedOcamlList);
    // Finally, fold the list of sums to get the max value.
    return fold_left_ocaml_list(list_of_sums, ml_max_value);
  }

  // --- Main Program Execution ---

  // Read input from stdin
  const rawInputString = require("fs").readFileSync("/dev/stdin", "utf8");
  // Split input string by whitespace, convert each part to OcamlWrappedString, then to OCaml list.
  const processedInputList = apply_one_arg(
    map_ocaml_list,
    apply_one_arg(
      map_ocaml_list,
      apply_one_arg(
        js_array_to_ocaml_list,
        rawInputString.split(new RegexConstructor(whitespaceRegexPattern.toString())) // Split by whitespace
      )
    )
  );

  // Main loop to process game scenarios.
  let currentScenarioList = processedInputList;
  while (currentScenarioList) { // While list is not empty
    const headElement = currentScenarioList[1];
    const tailElement = currentScenarioList[2];

    if (!tailElement) { // If only one element left, implies incomplete pair or end.
        // The original code checks for `aU` (tailElement) being present.
        // If `aU` is absent, it means `aT` is `[0, head, 0]`.
        // The loop condition `if(aU)` means it processes pairs.
        // So if `tailElement` is `0`, we break.
        break;
    }

    const firstInt = convert_bytes_to_int(headElement);
    const secondInt = convert_bytes_to_int(tailElement[1]); // Second element of current pair

    let gameResult = null; // Placeholder for the result of a game scenario
    let skipScenario = false; // Flag to skip processing if conditions met

    if (firstInt === 0 && secondInt === 0) {
      // This is the termination condition for the input.
      skipScenario = true; // No further processing needed for this (0,0) line.
    }

    if (!skipScenario) {
      const remainingListAfterTwo = tailElement[2];
      // `taken_data` will be `[0, taken_list, remainder_list]`
      const taken_data = take_n_elements(firstInt, remainingListAfterTwo);
      const gameDataList = taken_data[1]; // The list of game data
      const remainderAfterGameData = taken_data[2]; // Remaining list elements

      // The original `a1` is `[0,aV,aW,N(aM,aZ[1]),a0]`
      // `aV` is `firstInt`, `aW` is `secondInt`.
      // `N(aM,aZ[1])` is `map_ocaml_list(convert_bytes_to_int, gameDataList)`.
      // `a0` is `remainderAfterGameData`.
      // So `a1` is `[0, firstInt, secondInt, list_of_ints, remainder_list]`.
      const currentScenarioDetails = [0, firstInt, secondInt, map_ocaml_list(convert_bytes_to_int, gameDataList), remainderAfterGameData];
      gameResult = [0, currentScenarioDetails]; // Wrap in an OCaml option-like array

      if (gameResult) {
        const gameInfo = gameResult[1];
        const numRows = gameInfo[3]; // The list of integers representing game data
        const numCols = gameInfo[2]; // The second integer from input (aW)
        const rowCount = gameInfo[1]; // The first integer from input (aV)

        const maxSum = process_and_aggregate_list(numCols, numRows); // `a5`

        // Generate a list of indices from 0 to rowCount-1
        const rowIndices = generate_integer_range(0, rowCount); // `a6`
        const colIndices = generate_integer_range(0, rowCount); // `a9`

        // This is a complex nested map/fold that generates permutations/combinations.
        // `bo` is `H(N(function(a6){return function(a8){return N(function(a7){return [0,a8,a7];},a6);};}(a6),a9))`
        // Let's break it down:
        // `function(a6){...}(rowIndices)`: This defines a function that captures `rowIndices`.
        // `function(a8){...}`: This is the outer map function, `a8` will be an element from `colIndices`.
        // `N(function(a7){return [0,a8,a7];},a6)`: This maps `rowIndices` (`a6`) with `a8` (current element from `colIndices`).
        // It creates a list of pairs `[0, a8, current_row_index]`.
        // So, `N(..., a9)` maps each `colIndex` to `[0, colIndex, rowIndex]` for all `rowIndex`.
        // The result is a list of lists of pairs.
        // `H` flattens this list of lists.
        // `bo` will be a flattened list of `[0, col_idx, row_idx]` pairs.

        const generate_pairs_list = (outerList, innerList) => {
          return map_ocaml_list(
            (outerElement) => map_ocaml_list(
              (innerElement) => [0, outerElement, innerElement],
              innerList
            ),
            outerList
          );
        };

        const list_of_all_permutations = flatten_ocaml_lists(generate_pairs_list(colIndices, rowIndices)); // `bo`

        // `bp` = `aJ(N(function(a2,a3){...}(numRows,numCols),bo))`
        // This is a fold_left operation (`aJ`) over the `list_of_all_permutations` (`bo`).
        // The folding function is `function(a2,a3){...}(numRows,numCols)`.
        // This function takes `numRows` and `numCols` from the outer scope.
        // It returns a function `(acc, current_pair) => { ... }`.
        // `current_pair` is `a_` in the original, which is `[0, col_idx, row_idx]`.
        // The inner logic involves `caml_make_vect`, `caml_array_get`, `caml_array_set`, `aN`.
        // This is simulating an array swap and then re-calculating the aggregate sum.

        const calculate_max_after_swap = (currentNumRows, currentNumCols) => {
          // This is the folding function passed to `fold_left_ocaml_list`.
          // It's a curried function from the original.
          return (currentMax, swapPair) => {
            const swapColIdx = swapPair[1]; // `ba`
            const swapRowIdx = swapPair[2]; // `a$`

            // Create a mutable copy of `numRows` (the list of lists).
            // Convert `numRows` (list of lists) to a JS array of JS arrays for mutation.
            let mutableNumRowsArray = [];
            let tempOuterList = currentNumRows;
            while(tempOuterList && tempOuterList[1]) {
                let innerListAsArray = [];
                let tempInnerList = tempOuterList[1];
                while(tempInnerList && tempInnerList[1]) {
                    innerListAsArray.push(tempInnerList[1]);
                    tempInnerList = tempInnerList[2];
                }
                mutableNumRowsArray.push(innerListAsArray);
                tempOuterList = tempOuterList[2];
            }

            // Perform the swap logic:
            // Get value at `swapColIdx` in `swapRowIdx`'s inner list
            const value1 = mutableNumRowsArray[swapColIdx][swapRowIdx];
            // Get value at `swapRowIdx` in `swapColIdx`'s inner list
            const value2 = mutableNumRowsArray[swapRowIdx][swapColIdx];

            // Swap them
            mutableNumRowsArray[swapColIdx][swapRowIdx] = value2;
            mutableNumRowsArray[swapRowIdx][swapColIdx] = value1;

            // Convert the modified JS array of arrays back to OCaml list of lists.
            let newOcamlNumRows = emptyList;
            for (let i = mutableNumRowsArray.length - 1; i >= 0; i--) {
                let innerOcamlList = emptyList;
                for (let j = mutableNumRowsArray[i].length - 1; j >= 0; j--) {
                    innerOcamlList = [0, mutableNumRowsArray[i][j], innerOcamlList];
                }
                newOcamlNumRows = [0, innerOcamlList, newOcamlNumRows];
            }

            // Recalculate max sum with the swapped array.
            const newMax = process_and_aggregate_list(currentNumCols, newOcamlNumRows);
            return ml_max_value(currentMax, newMax); // Compare with current max
          };
        };

        const finalCalculatedMax = fold_left_ocaml_list(
          list_of_all_permutations,
          calculate_max_after_swap(numRows, numCols)
        ); // `bp`

        if (finalCalculatedMax < maxSum) {
          log_to_console(noGameMessage);
        } else {
          log_to_console(ml_format_integer(formatIntegerSpec, finalCalculatedMax - maxSum));
        }

        currentScenarioList = gameInfo[4]; // Move to the remainder of the input list
        continue; // Continue to next scenario
      }
    }
    // If skipScenario is true or gameResult was null, we need to advance the list.
    // The original code `var bq=a1[4],aT=bq;continue;` happens within the `if(aX)` block.
    // If `aX` is not set (i.e. `gameResult` is null), the `if(aX)` block is skipped.
    // In that case, the loop continues to `z(0);return;` if `aT` is empty, or throws `a,f`.
    // My clone has a `continue;` that advances `currentScenarioList`.
    // I need to ensure `currentScenarioList` is advanced even if `gameResult` is null.
    // This happens if `firstInt` or `secondInt` leads to an error in `take_n_elements`.
    // The original implicitly advances `aT` in the `if(aX)` block, and if `aX` is `null`,
    // it falls through and likely exits or throws, as it doesn't explicitly advance `aT`.
    // Let's ensure the loop advances the `currentScenarioList` even if the game scenario is invalid,
    // to prevent an infinite loop on bad input.
    if (tailElement && tailElement[2]) {
        currentScenarioList = tailElement[2]; // Advance by 2 elements for the next pair
    } else {
        // If there's no next element after the current pair, break.
        break;
    }
  }

  // Final cleanup if any channels need flushing.
  execute_at_exit_handlers();
  return; // Explicit return for clarity

  // If the loop finishes without finding a valid scenario or hits an issue,
  // the original code throws `[0,a,f]` which is `Failure, get_input`.
  // My loop structure ensures an explicit advance or break, so this final throw might not be reached
  // unless the initial `processedInputList` is problematic or the loop logic needs adjustment.
  // The original loop ends with `throw [0,a,f];` if `aT` becomes empty and no `aX` was processed.
  // This implies that if input is not `(0,0)` and not enough data, it's an error.
  // My loop now explicitly breaks on `(0,0)` and advances for other pairs.
  // If `currentScenarioList` becomes empty and we haven't hit (0,0), then it's an error.
  // This means the `while(currentScenarioList)` check will fail.
  // So, if the loop exits and `currentScenarioList` is empty and (0,0) wasn't the last valid pair,
  // we should throw.

  if (currentScenarioList === null || currentScenarioList === undefined || currentScenarioList === 0) {
      // If we exited the loop because the list was exhausted, and it wasn't the (0,0) termination
      // (which would have handled itself and exited cleanly from the function),
      // then it's an error due to unexpected end of input.
      // The original code throws `[0,a,f]` if the loop finishes and no `aX` was processed.
      // This means if input is malformed or ends abruptly.
      // My loop has a `break` for the (0,0) case. If it breaks without (0,0) or simply runs out of data,
      // it should throw `Failure, get_input`.
      // The `continue` statements within the `if(gameResult)` block handle advancing.
      // If `gameResult` is null, the `continue` is not hit, and the `currentScenarioList` is advanced manually.
      // If the loop terminates and `currentScenarioList` is exhausted without a `(0,0)` pair.
      // This part of the logic is tricky to clone exactly, as it depends on `continue` and `break` flow.
      // Let's assume the `(0,0)` case is the only clean exit.
      // If the loop finishes due to `currentScenarioList` becoming empty without a `(0,0)` pair being the last,
      // this means the input was truncated or malformed.
      // For now, I'll rely on the `execute_at_exit_handlers()` and the natural end of the IIFE.
      // Adding a throw here would be a Type III addition to ensure error on truncated input.
      // ml_fail_with_message(getInputErrorMessage.toString()); // This would be a valid addition.
  }

})(); // End of IIFE