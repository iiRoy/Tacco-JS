/*
 * This module contains utility functions, primarily
 * for mimicking OCaml runtime behavior in JavaScript.
 * It was originally derived from a js_of_ocaml compilation target.
 */

/**
 * Throws an exception with a custom tag and argument.
 * @param {number|string} exceptionTag - The identifier for the exception.
 * @param {*} exceptionPayload - The data associated with the exception.
 */
const raiseCustomException = (exceptionTag, exceptionPayload) => {
  throw [0, exceptionTag, exceptionPayload];
};

/**
 * Throws an exception with a custom tag and a string message.
 * The message is wrapped in a special string object.
 * @param {number|string} exceptionTag - The identifier for the exception.
 * @param {string} messageText - The string message for the exception.
 */
const raiseStringException = (exceptionTag, messageText) => {
  raiseCustomException(exceptionTag, new WrappedStringContainer(messageText));
};

/**
 * Raises an "Invalid_argument" exception with a given message.
 * @param {string} errorMessage - The message for the invalid argument exception.
 */
const signalInvalidArgument = (errorMessage) => {
  // Assuming 'runtime_global_storage[4]' holds the 'Invalid_argument' tag.
  raiseStringException(runtime_global_storage[4], errorMessage);
};

/**
 * Raises an array bounds error.
 */
const signalOutOfBoundsError = () => {
  signalInvalidArgument("index out of bounds");
};

/**
 * Repeats a string 'count' times.
 * Implements an efficient binary exponentiation-like approach.
 * @param {number} count - The number of times to repeat the string.
 * @param {string} charSequence - The string to repeat.
 * @returns {string} The repeated string.
 */
const repeatStringEfficiently = (count, charSequence) => {
  if (count <= 0) {
    return "";
  }
  if (count === 1) {
    return charSequence;
  }
  if (count % 2 === 1) { // Odd count
    return repeatStringEfficiently(count - 1, charSequence) + charSequence;
  }
  // Even count
  const halfRepeated = repeatStringEfficiently(count / 2, charSequence);
  return halfRepeated + halfRepeated;
};

/**
 * Represents a mutable string-like object, capable of storing
 * data as bytes, a JavaScript string, or an array of character codes.
 * This structure is typical for OCaml string representation in JS.
 * @param {string|null} initialBytes - Optional initial byte string.
 */
function ByteStringWrapper(initialBytes) {
  if (initialBytes !== null && initialBytes !== undefined) {
    this._byteData = initialBytes;
    this._fullByteData = initialBytes;
    this._currentLength = initialBytes.length;
    this._lastAccessedIndex = initialBytes.length;
  } else {
    this._byteData = null;
    this._fullByteData = null;
    this._currentLength = null;
    this._lastAccessedIndex = 0;
  }
}

ByteStringWrapper.prototype = {
  _jsStringCache: null,
  _byteData: null,
  _fullByteData: null,
  _charCodeArray: null,
  _currentLength: null,
  _lastAccessedIndex: 0,

  /**
   * Converts the internal byte representation to a standard JavaScript string (UTF-8).
   * Caches the result.
   * @returns {string} The JavaScript string.
   */
  toStandardJSString: function() {
    if (this._jsStringCache !== null) {
      return this._jsStringCache;
    }
    const fullBytes = this.getCompleteByteData();
    // Using escape/decodeURIComponent for legacy UTF-8 handling from byte data
    return (this._jsStringCache = decodeURIComponent(escape(fullBytes)));
  },

  /**
   * Converts a cached JavaScript string or char code array to byte data.
   * Caches the result and updates length/last accessed index.
   * @returns {string} The byte string.
   */
  convertAndCacheBytes: function() {
    let byteRepresentation;
    if (this._jsStringCache !== null) {
      // Using unescape/encodeURIComponent for legacy UTF-8 handling to byte data
      byteRepresentation = unescape(encodeURIComponent(this._jsStringCache));
    } else if (this._charCodeArray !== null) {
      byteRepresentation = "";
      const charArray = this._charCodeArray;
      const arrayLen = charArray.length;
      for (let i = 0; i < arrayLen; i++) {
        byteRepresentation += String.fromCharCode(charArray[i]);
      }
    } else {
      byteRepresentation = ""; // Fallback if no data present
    }
    this._byteData = byteRepresentation;
    this._fullByteData = byteRepresentation;
    this._lastAccessedIndex = byteRepresentation.length;
    this._currentLength = byteRepresentation.length;
    return byteRepresentation;
  },

  /**
   * Retrieves the byte data, converting if necessary.
   * @returns {string} The byte string.
   */
  getRawByteData: function() {
    let currentBytes = this._byteData;
    if (currentBytes === null) {
      currentBytes = this.convertAndCacheBytes();
    }
    return currentBytes;
  },

  /**
   * Retrieves the complete byte data, padding with null characters if needed.
   * @returns {string} The complete byte string.
   */
  getCompleteByteData: function() {
    let completeBytes = this._fullByteData;
    if (completeBytes !== null) {
      return completeBytes;
    }
    let currentBytes = this._byteData;
    if (currentBytes === null) {
      currentBytes = this.convertAndCacheBytes();
    }

    if (this._lastAccessedIndex < this._currentLength) {
      currentBytes += repeatStringEfficiently(this._currentLength - this._lastAccessedIndex, '\0');
      this._byteData = currentBytes; // Update _byteData as well
      this._lastAccessedIndex = this._currentLength;
    }
    this._fullByteData = currentBytes;
    return completeBytes;
  },

  /**
   * Converts the internal byte data to an array of character codes.
   * Clears string and byte caches.
   * @returns {number[]} An array of character codes.
   */
  convertToCharCodeArray: function() {
    let currentBytes = this._byteData;
    if (currentBytes === null) {
      currentBytes = this.convertAndCacheBytes();
    }
    const charCodeArr = [];
    const lastIdx = this._lastAccessedIndex;
    for (let i = 0; i < lastIdx; i++) {
      charCodeArr.push(currentBytes.charCodeAt(i));
    }
    const totalLen = this._currentLength;
    for (let i = lastIdx; i < totalLen; i++) {
      charCodeArr.push(0); // Pad with nulls
    }

    this._jsStringCache = null;
    this._byteData = null;
    this._fullByteData = null;
    this._lastAccessedIndex = this._currentLength;
    this._charCodeArray = charCodeArr;
    return charCodeArr;
  },

  /**
   * Retrieves the character code array, converting if necessary.
   * @returns {number[]} An array of character codes.
   */
  getCharCodeArray: function() {
    let charArr = this._charCodeArray;
    if (!charArr) {
      charArr = this.convertToCharCodeArray();
    }
    return charArr;
  },

  /**
   * Retrieves the length of the string. Converts to bytes if length is not set.
   * @returns {number} The length of the string.
   */
  getByteLength: function() {
    if (this._currentLength !== null) {
      return this._currentLength;
    }
    this.convertAndCacheBytes(); // Ensure length is set
    return this._currentLength;
  },

  /**
   * Overrides `toString()` for standard JavaScript string representation.
   * @returns {string} The standard JavaScript string.
   */
  toString: function() {
    return this._jsStringCache || this.toStandardJSString();
  },

  /**
   * Overrides `valueOf()` for primitive value representation.
   * @returns {string} The standard JavaScript string.
   */
  valueOf: function() {
    return this._jsStringCache || this.toStandardJSString();
  },

  /**
   * Copies a segment of the string's byte data into a target array.
   * @param {number} sourceOffset - Starting index in this string.
   * @param {Array} targetArray - The array to copy into.
   * @param {number} targetOffset - Starting index in the target array.
   * @param {number} lengthToCopy - Number of bytes to copy.
   */
  blitIntoArray: function(sourceOffset, targetArray, targetOffset, lengthToCopy) {
    const sourceArr = this._charCodeArray;
    if (sourceArr) {
      // Optimized copy for arrays, handling overlapping ranges
      if (targetOffset <= sourceOffset) {
        for (let idx = 0; idx < lengthToCopy; idx++) {
          targetArray[targetOffset + idx] = sourceArr[sourceOffset + idx];
        }
      } else {
        for (let idx = lengthToCopy - 1; idx >= 0; idx--) {
          targetArray[targetOffset + idx] = sourceArr[sourceOffset + idx];
        }
      }
    } else {
      let byteStr = this._byteData;
      if (byteStr === null) {
        byteStr = this.convertAndCacheBytes();
      }
      const actualBytesAvailable = this._lastAccessedIndex - sourceOffset;
      const bytesToCopyFromRaw = Math.min(lengthToCopy, actualBytesAvailable);

      for (let idx = 0; idx < bytesToCopyFromRaw; idx++) {
        targetArray[targetOffset + idx] = byteStr.charCodeAt(sourceOffset + idx);
      }
      // Pad with zeros if requested length exceeds available bytes
      for (let idx = bytesToCopyFromRaw; idx < lengthToCopy; idx++) {
        targetArray[targetOffset + idx] = 0;
      }
    }
  },

  /**
   * Retrieves the character code at a specific index.
   * @param {number} index - The zero-based index.
   * @returns {number} The character code, or 0 if out of bounds.
   */
  getCharAtIndex: function(index) {
    const charArr = this._charCodeArray;
    if (charArr) {
      return charArr[index];
    }
    const byteStr = this._byteData;
    if (byteStr === null) {
      this.convertAndCacheBytes(); // Ensure byte data is ready
    }
    return (index < this._lastAccessedIndex) ? byteStr.charCodeAt(index) : 0;
  },

  /**
   * Retrieves the character code at a specific index with bounds checking.
   * @param {number} index - The zero-based index.
   * @returns {number} The character code.
   * @throws If index is out of bounds.
   */
  getCharSafe: function(index) {
    if (this._currentLength === null) {
      this.convertAndCacheBytes();
    }
    if (index < 0 || index >= this._currentLength) {
      signalOutOfBoundsError();
    }
    return this.getCharAtIndex(index);
  },

  /**
   * Sets the character code at a specific index.
   * Converts to array representation if needed, clears string/byte caches.
   * @param {number} index - The zero-based index.
   * @param {number} charCode - The character code to set.
   */
  setCharAtIndex: function(index, charCode) {
    let charArr = this._charCodeArray;
    if (!charArr) {
      // If no array, try to append if it's the next char in sequence
      if (this._lastAccessedIndex === index) {
        this._byteData += String.fromCharCode(charCode & 0xff);
        this._lastAccessedIndex++;
        this._currentLength = Math.max(this._currentLength, this._lastAccessedIndex); // Update total length if extending
        return;
      }
      charArr = this.convertToCharCodeArray(); // Otherwise, convert to array
    } else if (this._byteData !== null) {
      // If array exists but byte data is also present, clear byte/string caches
      this._byteData = null;
      this._fullByteData = null;
      this._jsStringCache = null;
    }
    charArr[index] = charCode & 0xff; // Ensure byte range
  },

  /**
   * Sets the character code at a specific index with bounds checking.
   * @param {number} index - The zero-based index.
   * @param {number} charCode - The character code to set.
   * @throws If index is out of bounds.
   */
  setCharSafe: function(index, charCode) {
    if (this._currentLength === null) {
      this.convertAndCacheBytes();
    }
    if (index < 0 || index >= this._currentLength) {
      signalOutOfBoundsError();
    }
    this.setCharAtIndex(index, charCode);
  },

  /**
   * Fills a section of the string with a given character code.
   * Converts to array representation if needed.
   * @param {number} startOffset - Starting index for filling.
   * @param {number} fillLength - Number of positions to fill.
   * @param {number} fillCharCode - The character code to fill with.
   */
  fillSection: function(startOffset, fillLength, fillCharCode) {
    // Optimization: if filling with nulls beyond last accessed, and already null-padded, do nothing.
    if (startOffset >= this._lastAccessedIndex && this._lastAccessedIndex > 0 && fillCharCode === 0) {
      return;
    }
    let charArr = this._charCodeArray;
    if (!charArr) {
      charArr = this.convertToCharCodeArray();
    } else if (this._byteData !== null) {
      // Clear caches if array exists but byte data is also present
      this._byteData = null;
      this._fullByteData = null;
      this._jsStringCache = null;
    }
    const endOffset = startOffset + fillLength;
    for (let i = startOffset; i < endOffset; i++) {
      charArr[i] = fillCharCode;
    }
  },

  /**
   * Compares this string with another ByteStringWrapper.
   * @param {ByteStringWrapper} otherString - The string to compare with.
   * @returns {number} -1 if less, 0 if equal, 1 if greater.
   */
  compareWith: function(otherString) {
    // Optimized comparison if both strings are already JS strings
    if (this._jsStringCache !== null && otherString._jsStringCache !== null) {
      if (this._jsStringCache < otherString._jsStringCache) return -1;
      if (this._jsStringCache > otherString._jsStringCache) return 1;
      return 0;
    }
    // Fallback to byte-level comparison
    const bytesA = this.getCompleteByteData();
    const bytesB = otherString.getCompleteByteData();
    if (bytesA < bytesB) return -1;
    if (bytesA > bytesB) return 1;
    return 0;
  },

  /**
   * Checks if this string is equal to another ByteStringWrapper.
   * @param {ByteStringWrapper} otherString - The string to compare with.
   * @returns {boolean} True if equal, false otherwise.
   */
  isEqual: function(otherString) {
    if (this._jsStringCache !== null && otherString._jsStringCache !== null) {
      return this._jsStringCache === otherString._jsStringCache;
    }
    return this.getCompleteByteData() === otherString.getCompleteByteData();
  },

  /**
   * Checks if this string is lexicographically less than another ByteStringWrapper.
   * @param {ByteStringWrapper} otherString - The string to compare with.
   * @returns {boolean} True if less than, false otherwise.
   */
  isLessThan: function(otherString) {
    if (this._jsStringCache !== null && otherString._jsStringCache !== null) {
      return this._jsStringCache < otherString._jsStringCache;
    }
    return this.getCompleteByteData() < otherString.getCompleteByteData();
  },

  /**
   * Checks if this string is lexicographically less than or equal to another ByteStringWrapper.
   * @param {ByteStringWrapper} otherString - The string to compare with.
   * @returns {boolean} True if less than or equal, false otherwise.
   */
  isLessOrEqual: function(otherString) {
    if (this._jsStringCache !== null && otherString._jsStringCache !== null) {
      return this._jsStringCache <= otherString._jsStringCache;
    }
    return this.getCompleteByteData() <= otherString.getCompleteByteData();
  }
};

/**
 * A specialized ByteStringWrapper for wrapping existing JavaScript strings.
 * @param {string} initialString - The string to wrap.
 */
function WrappedStringContainer(initialString) {
  this._jsStringCache = initialString;
}
WrappedStringContainer.prototype = Object.create(ByteStringWrapper.prototype);
WrappedStringContainer.prototype.constructor = WrappedStringContainer;


/**
 * Creates a new ByteStringWrapper with a predefined length and empty byte data.
 * @param {number} desiredLength - The desired length of the string.
 */
function PreallocatedByteString(desiredLength) {
  this._byteData = "";
  this._currentLength = desiredLength;
  this._lastAccessedIndex = 0; // Initialize last accessed index
}
PreallocatedByteString.prototype = Object.create(ByteStringWrapper.prototype);
PreallocatedByteString.prototype.constructor = PreallocatedByteString;


/**
 * Retrieves an element from an OCaml-style array.
 * OCaml arrays often have a tag at index 0 and data starting at index 1.
 * @param {Array} targetArray - The array to access.
 * @param {number} dataIndex - The logical index (0-based) within the OCaml data.
 * @returns {*} The element at the specified logical index.
 * @throws If dataIndex is out of bounds.
 */
const retrieveArrayElement = (targetArray, dataIndex) => {
  // Check for array bounds, considering the OCaml tag at index 0
  const effectiveLength = targetArray.length - 1;
  if (dataIndex < 0 || dataIndex >= effectiveLength) {
    signalOutOfBoundsError();
  }
  return targetArray[dataIndex + 1];
};

/**
 * Sets an element in an OCaml-style array.
 * OCaml arrays often have a tag at index 0 and data starting at index 1.
 * @param {Array} targetArray - The array to modify.
 * @param {number} dataIndex - The logical index (0-based) within the OCaml data.
 * @param {*} newValue - The value to set.
 * @returns {number} Always 0 (for OCaml compatibility).
 * @throws If dataIndex is out of bounds.
 */
const assignArrayElement = (targetArray, dataIndex, newValue) => {
  const effectiveLength = targetArray.length - 1;
  if (dataIndex < 0 || dataIndex >= effectiveLength) {
    signalOutOfBoundsError();
  }
  targetArray[dataIndex + 1] = newValue;
  return 0; // OCaml functions often return 0 for side-effect operations
};

/**
 * Generic function caller for OCaml functions, handling currying/partial application.
 * @param {Function} func - The function to call.
 * @param {Array} argsList - The arguments to apply.
 * @returns {*} The result of the function call or a partially applied function.
 */
const executeOcamlFunction = (func, argsList) => {
  // If 'func' is a wrapper for a curried function, unwrap it.
  if (func.fun) {
    return executeOcamlFunction(func.fun, argsList);
  }

  const expectedArgCount = func.length;
  const suppliedArgCount = argsList.length;
  const argDifference = expectedArgCount - suppliedArgCount;

  if (argDifference === 0) {
    // Exact number of arguments, call directly.
    return func.apply(null, argsList);
  } else if (argDifference < 0) {
    // Too many arguments, apply first 'expectedArgCount' and then curry the rest.
    const initialResult = func.apply(null, argsList.slice(0, expectedArgCount));
    return executeOcamlFunction(initialResult, argsList.slice(expectedArgCount));
  } else {
    // Too few arguments, return a new function that takes the remaining arguments.
    return (nextArg) => executeOcamlFunction(func, argsList.concat([nextArg]));
  }
};

/**
 * Parses a format string for integer formatting.
 * @param {string|ByteStringWrapper} formatString - The format specifier.
 * @returns {object} An object containing parsed format options.
 */
const parseIntegerFormat = (formatString) => {
  const fmt = formatString.toString(); // Ensure it's a JS string
  const strLength = fmt.length;
  if (strLength > 31) { // Arbitrary limit for sanity, matches original
    signalInvalidArgument("format_int: format too long");
  }

  const formatOptions = {
    alignment: '+', // '+' for right-justified, '-' for left-justified
    signDisplay: '-', // '-', '+', ' ' for sign handling
    paddingChar: ' ', // ' ' or '0'
    alternativeForm: false, // '#' for alternative form (0o, 0x)
    baseValue: 0, // Base for number conversion (e.g., 10, 16)
    isSignedConversion: false, // True if conversion expects signed integer
    minimumWidth: 0,
    uppercaseOutput: false,
    signIndicator: 1, // 1 for positive, -1 for negative
    precisionValue: -1, // -1 for no precision, otherwise number of digits
    conversionType: 'f' // Default for float, or 'd' for int etc.
  };

  let charIndex = 0;
  while (charIndex < strLength) {
    const char = fmt.charAt(charIndex);
    switch (char) {
      case '-':
        formatOptions.alignment = '-';
        break;
      case '+':
      case ' ':
        formatOptions.signDisplay = char;
        break;
      case '0':
        formatOptions.paddingChar = '0';
        break;
      case '#':
        formatOptions.alternativeForm = true;
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        formatOptions.minimumWidth = 0;
        // Parse multi-digit width
        let currentDigit = fmt.charCodeAt(charIndex) - 48;
        while (currentDigit >= 0 && currentDigit <= 9) {
          formatOptions.minimumWidth = formatOptions.minimumWidth * 10 + currentDigit;
          charIndex++;
          if (charIndex >= strLength) break;
          currentDigit = fmt.charCodeAt(charIndex) - 48;
        }
        charIndex--; // Decrement to re-evaluate the last char in the next loop iteration
        break;
      case '.':
        formatOptions.precisionValue = 0;
        charIndex++;
        // Parse multi-digit precision
        let precDigit = fmt.charCodeAt(charIndex) - 48;
        while (precDigit >= 0 && precDigit <= 9) {
          formatOptions.precisionValue = formatOptions.precisionValue * 10 + precDigit;
          charIndex++;
          if (charIndex >= strLength) break;
          precDigit = fmt.charCodeAt(charIndex) - 48;
        }
        charIndex--; // Decrement to re-evaluate the last char
        break;
      case 'd':
      case 'i':
        formatOptions.isSignedConversion = true; // Fallthrough intentional
      case 'u':
        formatOptions.baseValue = 10;
        break;
      case 'x':
        formatOptions.baseValue = 16;
        break;
      case 'X':
        formatOptions.baseValue = 16;
        formatOptions.uppercaseOutput = true;
        break;
      case 'o':
        formatOptions.baseValue = 8;
        break;
      case 'e':
      case 'f':
      case 'g':
        formatOptions.isSignedConversion = true;
        formatOptions.conversionType = char;
        break;
      case 'E':
      case 'F':
      case 'G':
        formatOptions.isSignedConversion = true;
        formatOptions.uppercaseOutput = true;
        formatOptions.conversionType = char.toLowerCase();
        break;
      // No default case needed, unrecognized chars are ignored as per OCaml spec
    }
    charIndex++;
  }
  return formatOptions;
};

/**
 * Applies formatting options to a raw string representation of a number.
 * @param {object} formatSettings - The parsed format options.
 * @param {string} rawNumberString - The string representation of the number.
 * @returns {WrappedStringContainer} The formatted string wrapped in a special object.
 */
const finalizeNumericFormatting = (formatSettings, rawNumberString) => {
  if (formatSettings.uppercaseOutput) {
    rawNumberString = rawNumberString.toUpperCase();
  }

  let currentLength = rawNumberString.length;
  // Account for sign character if applicable
  if (formatSettings.isSignedConversion && (formatSettings.signIndicator < 0 || formatSettings.signDisplay !== '-')) {
    currentLength++;
  }
  // Account for alternative form prefixes (0o, 0x)
  if (formatSettings.alternativeForm) {
    if (formatSettings.baseValue === 8) currentLength++;
    if (formatSettings.baseValue === 16) currentLength += 2;
  }

  let outputBuffer = "";

  // 1. Pre-padding (if right-justified with spaces)
  if (formatSettings.alignment === '+' && formatSettings.paddingChar === ' ') {
    for (let i = currentLength; i < formatSettings.minimumWidth; i++) {
      outputBuffer += ' ';
    }
  }

  // 2. Sign
  if (formatSettings.isSignedConversion) {
    if (formatSettings.signIndicator < 0) {
      outputBuffer += '-';
    } else if (formatSettings.signDisplay !== '-') {
      outputBuffer += formatSettings.signDisplay;
    }
  }

  // 3. Alternative form prefix
  if (formatSettings.alternativeForm) {
    if (formatSettings.baseValue === 8) outputBuffer += '0';
    if (formatSettings.baseValue === 16) outputBuffer += "0x";
  }

  // 4. Pre-padding (if right-justified with zeros)
  if (formatSettings.alignment === '+' && formatSettings.paddingChar === '0') {
    for (let i = currentLength; i < formatSettings.minimumWidth; i++) {
      outputBuffer += '0';
    }
  }

  // 5. The number itself
  outputBuffer += rawNumberString;

  // 6. Post-padding (if left-justified)
  if (formatSettings.alignment === '-') {
    for (let i = currentLength; i < formatSettings.minimumWidth; i++) {
      outputBuffer += ' ';
    }
  }

  return new WrappedStringContainer(outputBuffer);
};

/**
 * Formats an integer according to a given format string.
 * @param {string|ByteStringWrapper} formatString - The format specifier.
 * @param {number} integerValue - The integer to format.
 * @returns {WrappedStringContainer} The formatted integer.
 */
const formatIntegerToString = (formatString, integerValue) => {
  // Shortcut for common case
  if (formatString.toString() === "%d") {
    return new WrappedStringContainer("" + integerValue);
  }

  const formatSettings = parseIntegerFormat(formatString);

  let num = integerValue;
  if (num < 0) {
    if (formatSettings.isSignedConversion) {
      formatSettings.signIndicator = -1;
      num = -num;
    } else {
      num >>>= 0; // Convert to unsigned 32-bit for unsigned formats
    }
  }

  let stringRepresentation = num.toString(formatSettings.baseValue);

  // Apply precision for integer formats
  if (formatSettings.precisionValue >= 0) {
    formatSettings.paddingChar = ' '; // Precision overrides '0' padding
    const neededZeros = formatSettings.precisionValue - stringRepresentation.length;
    if (neededZeros > 0) {
      stringRepresentation = repeatStringEfficiently(neededZeros, '0') + stringRepresentation;
    }
  }

  return finalizeNumericFormatting(formatSettings, stringRepresentation);
};

/**
 * Compares two 64-bit integers represented as OCaml arrays.
 * OCaml 64-bit integers are typically arrays like [tag, low_low, low_high, high_low, high_high].
 * This function compares the significant parts (indices 1, 2, 3 in this case).
 * @param {Array<number>} int64_a - The first 64-bit integer array.
 * @param {Array<number>} int64_b - The second 64-bit integer array.
 * @returns {number} -1 if int64_a < int64_b, 0 if equal, 1 if int64_a > int64_b.
 */
const compareInt64 = (int64_a, int64_b) => {
  // Compare high parts (index 3 represents a higher-order word)
  // Shift by 16 as per original, though exact meaning depends on OCaml int64 representation.
  const a_high = int64_a[3] << 16;
  const b_high = int64_b[3] << 16;
  if (a_high > b_high) return 1;
  if (a_high < b_high) return -1;

  // Compare middle parts (index 2)
  if (int64_a[2] > int64_b[2]) return 1;
  if (int64_a[2] < int64_b[2]) return -1;

  // Compare low parts (index 1)
  if (int64_a[1] > int64_b[1]) return 1;
  if (int64_a[1] < int64_b[1]) return -1;

  return 0; // They are equal
};

/**
 * Compares two standard JavaScript numbers.
 * @param {number} num_a - The first number.
 * @param {number} num_b - The second number.
 * @returns {number} -1 if num_a < num_b, 0 if equal, 1 if num_a > num_b.
 */
const compareIntegers = (num_a, num_b) => {
  if (num_a < num_b) return -1;
  if (num_a === num_b) return 0;
  return 1;
};

/**
 * Deep comparison function for OCaml-style values.
 * Handles various types: strings, arrays (records, variants, 64-bit ints), and primitives.
 * Uses a stack for iterative comparison of nested structures.
 * @param {*} val_a - The first value.
 * @param {*} val_b - The second value.
 * @param {boolean} requireTotalOrder - If true, distinguishes NaN from itself.
 * @returns {number} -1 if val_a < val_b, 0 if equal, 1 if val_a > val_b.
 */
const compareOcamlValues = (val_a, val_b, requireTotalOrder) => {
  const comparisonStack = [];

  // Main comparison loop, handles recursion via stack
  for (;;) {
    // If values are strictly equal and total order not required, they are equal.
    if (!(requireTotalOrder && val_a === val_b)) {
      if (val_a instanceof ByteStringWrapper) {
        if (val_b instanceof ByteStringWrapper) {
          // If different string objects but same content, compare them.
          if (val_a !== val_b) {
            const stringComparisonResult = val_a.compareWith(val_b);
            if (stringComparisonResult !== 0) {
              return stringComparisonResult;
            }
          }
        } else {
          return 1; // String is "greater" than non-string
        }
      } else if (Array.isArray(val_a) && (val_a[0] | 0) === val_a[0]) {
        // val_a is an OCaml-style array (variant, record, etc.) with integer tag at index 0.
        const tagA = val_a[0];

        // Handle OCaml "forward pointers" (tag 250)
        if (tagA === 250) {
          val_a = val_a[1];
          continue; // Re-evaluate with unwrapped value
        }

        if (Array.isArray(val_b) && (val_b[0] | 0) === val_b[0]) {
          // val_b is also an OCaml-style array.
          const tagB = val_b[0];

          if (tagB === 250) {
            val_b = val_b[1];
            continue; // Re-evaluate with unwrapped value
          } else if (tagA !== tagB) {
            return (tagA < tagB) ? -1 : 1; // Different tags, compare tags
          } else {
            // Same tags, special handling for specific tags or generic array comparison.
            switch (tagA) {
              case 248: { // OCaml record header (size followed by fields)
                const recordSizeComparison = compareIntegers(val_a[2], val_b[2]);
                if (recordSizeComparison !== 0) {
                  return recordSizeComparison;
                }
                break;
              }
              case 255: { // OCaml 64-bit integer
                const int64Comparison = compareInt64(val_a, val_b);
                if (int64Comparison !== 0) {
                  return int64Comparison;
                }
                break;
              }
              default:
                // Generic array comparison: first by length, then elements.
                if (val_a.length !== val_b.length) {
                  return (val_a.length < val_b.length) ? -1 : 1;
                }
                if (val_a.length > 1) { // If more than just tag, push for element-wise comparison
                  comparisonStack.push(val_a, val_b, 1); // Push arrays and starting index
                }
                break;
            }
          }
        } else {
          return 1; // Array is "greater" than non-array (or non-OCaml array)
        }
      } else if (val_b instanceof ByteStringWrapper || (Array.isArray(val_b) && (val_b[0] | 0) === val_b[0])) {
        return -1; // Non-string/non-OCaml array is "less" than string/OCaml array
      } else {
        // Primitive values or plain JS objects/arrays
        if (val_a < val_b) return -1;
        if (val_a > val_b) return 1;
        // Special NaN handling for total order
        if (requireTotalOrder && val_a !== val_b) {
          if (val_a === val_a) return 1; // NaN !== NaN, so if val_a is NaN, it's greater
          if (val_b === val_b) return -1; // If val_b is NaN, it's greater
        }
      }
    }

    // If stack is empty, all comparisons finished, values are equal.
    if (comparisonStack.length === 0) return 0;

    // Pop next comparison from stack
    const currentIdx = comparisonStack.pop();
    val_b = comparisonStack.pop();
    val_a = comparisonStack.pop();

    // If there are more elements in the current arrays to compare, push back for next iteration.
    if (currentIdx + 1 < val_a.length) {
      comparisonStack.push(val_a, val_b, currentIdx + 1);
    }
    // Set val_a and val_b to their current elements for the next loop iteration.
    val_a = val_a[currentIdx];
    val_b = val_b[currentIdx];
  }
};

/**
 * Standard OCaml comparison function (total order).
 * @param {*} itemA - The first item.
 * @param {*} itemB - The second item.
 * @returns {number} -1 if itemA < itemB, 0 if equal, 1 if itemA > itemB.
 */
const compareOcamlItems = (itemA, itemB) => compareOcamlValues(itemA, itemB, true);

/**
 * Checks if value X is greater than or equal to value Y using OCaml comparison rules.
 * @param {*} valX - The first value.
 * @param {*} valY - The second value.
 * @returns {number} 1 if valX >= valY, 0 otherwise.
 */
const checkGreaterOrEqual = (valX, valY) => +(compareOcamlValues(valX, valY, false) >= 0);

/**
 * Parses the sign and base prefix from a string.
 * @param {ByteStringWrapper} inputString - The string to parse.
 * @returns {Array<number>} An array containing [startIndex, signMultiplier, numericBase].
 */
const parseSignAndBase = (inputString) => {
  let currentPos = 0;
  let numericBase = 10;
  // Check for leading minus sign
  const signMultiplier = (inputString.getCharAtIndex(0) === 45) ? (currentPos++, -1) : 1;

  // Check for '0x', '0o', '0b' prefixes
  if (inputString.getCharAtIndex(currentPos) === 48) {
    const nextChar = inputString.getCharAtIndex(currentPos + 1);
    switch (nextChar) {
      case 120: // 'x'
      case 88: // 'X'
        numericBase = 16;
        currentPos += 2;
        break;
      case 111: // 'o'
      case 79: // 'O'
        numericBase = 8;
        currentPos += 2;
        break;
      case 98: // 'b'
      case 66: // 'B'
        numericBase = 2;
        currentPos += 2;
        break;
    }
  }
  return [currentPos, signMultiplier, numericBase];
};

/**
 * Converts a character code to its numeric digit value based on base (0-9, A-Z, a-z).
 * @param {number} charCode - The ASCII/Unicode character code.
 * @returns {number} The digit value (0-35) or -1 if not a valid digit.
 */
const getDigitValue = (charCode) => {
  if (charCode >= 48 && charCode <= 57) return charCode - 48; // '0'-'9'
  if (charCode >= 65 && charCode <= 90) return charCode - 55; // 'A'-'Z' (10-35)
  if (charCode >= 97 && charCode <= 122) return charCode - 87; // 'a'-'z' (10-35)
  return -1; // Not a valid digit
};

// Global storage for OCaml runtime exceptions and other data.
const runtime_global_storage = [0]; // Index 0 is often unused or for a tag

/**
 * Raises a "Failure" exception with a given message.
 * @param {string} message - The message for the failure exception.
 */
const signalFailure = (message) => {
  // Assuming 'runtime_global_storage[3]' holds the 'Failure' tag.
  raiseStringException(runtime_global_storage[3], message);
};

/**
 * Converts a string representation to an integer.
 * Handles bases (binary, octal, decimal, hexadecimal) and signs.
 * @param {ByteStringWrapper} inputString - The string to convert.
 * @returns {number} The parsed integer.
 * @throws "Failure" if string is not a valid integer or out of 32-bit range.
 */
const convertStringToInt = (inputString) => {
  const [startIdx, sign, base] = parseSignAndBase(inputString);
  const maxUint32 = 0xFFFFFFFF; // Max unsigned 32-bit integer

  let currentIdx = startIdx;
  let char = inputString.getCharAtIndex(currentIdx);
  let digit = getDigitValue(char);

  if (digit < 0 || digit >= base) {
    signalFailure("int_of_string"); // First digit invalid
  }

  let resultAccumulator = digit;

  for (;;) {
    currentIdx++;
    char = inputString.getCharAtIndex(currentIdx);

    if (char === 95) { // Underscore for readability, skip it
      continue;
    }

    digit = getDigitValue(char);
    if (digit < 0 || digit >= base) {
      break; // End of number or invalid character
    }

    // Check for overflow before multiplication
    // This is a simplified check, full 32-bit signed overflow is more complex.
    // The original code uses 'res > threshold' which is essentially checking if
    // `base * res + d` would exceed 2^32-1 for unsigned, or max_int for signed.
    // For signed 32-bit, max is 2^31-1. For simplicity, we'll keep the threshold logic.
    if (resultAccumulator > (maxUint32 - digit) / base) {
        signalFailure("int_of_string"); // Potential overflow
    }

    resultAccumulator = base * resultAccumulator + digit;
  }

  // Ensure entire string was consumed (except for sign/base prefix)
  if (currentIdx !== inputString.getByteLength()) {
    signalFailure("int_of_string");
  }

  resultAccumulator = sign * resultAccumulator;

  // Check if result fits within signed 32-bit integer range
  if ((resultAccumulator | 0) !== resultAccumulator) {
    signalFailure("int_of_string");
  }

  return resultAccumulator;
};

/**
 * Provides a console object, mocking missing methods with no-ops.
 * This ensures console calls don't crash in environments without a full console.
 * @returns {object} A console-like object.
 */
const getSafeConsole = () => {
  const consoleObject = typeof console !== 'undefined' ? console : {};
  const standardMethods = [
    "log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"
  ];

  // Create a no-op function for missing methods.
  const noop = () => {};

  for (const method of standardMethods) {
    if (typeof consoleObject[method] !== 'function') {
      consoleObject[method] = noop;
    }
  }
  return consoleObject;
};

/**
 * Converts a JavaScript array into an OCaml-style array (prefixed with a tag 0).
 * @param {Array} jsArray - The JavaScript array.
 * @returns {Array} The OCaml-style array.
 */
const convertJsArrayToOcaml = (jsArray) => {
  return [0].concat(jsArray);
};

/**
 * Creates an OCaml-style vector (array) of a given length, initialized with a value.
 * @param {number} length - The desired length of the vector (excluding tag).
 * @param {*} initialValue - The value to initialize each element with.
 * @returns {Array} The OCaml-style vector.
 */
const createOcamlVector = (length, initialValue) => {
  const newVector = [0]; // OCaml array tag
  for (let i = 0; i < length; i++) {
    newVector.push(initialValue);
  }
  return newVector;
};

/**
 * Simulates OCaml's `ml_out_channels_list`, returning 0 (empty list).
 * In this context, it's typically a placeholder for a list of output channels.
 * @returns {number} Always 0.
 */
const getOutputChannelsList = () => 0;

/**
 * Performs 32-bit integer multiplication, mimicking OCaml's behavior.
 * This handles potential overflow by using bitwise operations.
 * @param {number} x - First integer.
 * @param {number} y - Second integer.
 * @returns {number} The 32-bit signed integer result of x * y.
 */
const performInt32Multiplication = (x, y) => {
  // Simulates 32-bit multiplication by splitting into high and low parts.
  // (x >> 16) * y handles the higher 16 bits of x times y.
  // (x & 0xffff) * y handles the lower 16 bits of x times y.
  // The sum is then bitwise ORed with 0 to ensure 32-bit signed integer result.
  return ((((x >> 16) * y) << 16) + (x & 0xFFFF) * y) | 0;
};

/**
 * Registers a global value in the runtime_global_storage.
 * @param {number} index - The index in the global storage (offset by 1).
 * @param {*} value - The value to store.
 */
const registerRuntimeGlobal = (index, value) => {
  runtime_global_storage[index + 1] = value;
};

// A map to store named values, useful for debugging or external access.
const globally_named_values = {};

/**
 * Registers a value with a specific name in the globally_named_values map.
 * @param {string} name - The name to associate with the value.
 * @param {*} value - The value to register.
 * @returns {number} Always 0.
 */
const registerNamedValue = (name, value) => {
  globally_named_values[name] = value;
  return 0;
};

// --- Main application logic (IIFE) ---
(function() {
  /**
   * Helper for calling functions, handles currying based on argument count.
   * @param {Function} targetFn - The function to invoke.
   * @param {*} singleArg - The argument to pass (or first argument if curried).
   * @returns {*} The result of the function or a partially applied function.
   */
  const curryApplicationHandler = (targetFn, singleArg) => {
    return targetFn.length === 1 ? targetFn(singleArg) : executeOcamlFunction(targetFn, [singleArg]);
  };

  // Predefined OCaml exceptions as ByteStringWrapper objects
  const failureException = [0, new ByteStringWrapper("Failure")];
  const invalidArgumentException = [0, new ByteStringWrapper("Invalid_argument")];

  // Register global exceptions
  registerRuntimeGlobal(6, [0, new ByteStringWrapper("Not_found")]);
  registerRuntimeGlobal(5, [0, new ByteStringWrapper("Division_by_zero")]);
  registerRuntimeGlobal(3, invalidArgumentException); // Index 3 for Invalid_argument (from original caml_global_data[3])
  registerRuntimeGlobal(2, failureException); // Index 2 for Failure (from original caml_global_data[2])

  // Common strings/constants used in the main logic
  const percentDFormat = new ByteStringWrapper("%d");
  const exitHookName = new ByteStringWrapper("Pervasives.do_at_exit");
  const emptyListSentinel = [0, 0, 0]; // Represents an empty OCaml list or similar structure
  const splitNIdentifier = new ByteStringWrapper("split_n");
  const noGameMessage = new ByteStringWrapper("NO GAME");
  const getInputIdentifier = new ByteStringWrapper("get_input");
  const whitespaceRegexPattern = new ByteStringWrapper("\\s"); // Regex for whitespace

  /**
   * Returns the maximum of two values.
   * @param {*} val1 - First value.
   * @param {*} val2 - Second value.
   * @returns {*} The greater of the two values.
   */
  const findMaximum = (val1, val2) => checkGreaterOrEqual(val1, val2) ? val1 : val2;

  /**
   * Recursively processes an OCaml-style list by prepending an element.
   * @param {Array|null} currentList - The list being processed (or null for end).
   * @param {Array} accumulatorList - The list being built.
   * @returns {Array} The new list with elements prepended.
   */
  const prependToListRecursive = (currentList, accumulatorList) => {
    if (currentList) {
      const headElement = currentList[1];
      return [0, headElement, prependToListRecursive(currentList[2], accumulatorList)];
    }
    return accumulatorList;
  };

  /**
   * Executes registered exit handlers.
   * Iterates through a list of output channels and attempts to close them.
   * @returns {number} Always 0.
   */
  const runExitHandlers = () => {
    let channelsList = getOutputChannelsList();
    while (channelsList) {
      const nextChannel = channelsList[2];
      try {
        // In original OCaml, this would call a close_channel function.
        // Here, it's an empty block, effectively a no-op.
      } catch (error) {
        // Suppress errors during exit handlers.
      }
      channelsList = nextChannel;
    }
    return 0;
  };
  registerNamedValue(exitHookName, runExitHandlers); // Register the exit handler

  /**
   * Converts a JavaScript array (with elements starting at index 1) into an OCaml-style list.
   * @param {Array} jsArray - The JavaScript array.
   * @returns {Array|number} The OCaml list (or 0 for empty).
   */
  const convertJsArrayToOcamlList = (jsArray) => {
    const effectiveLength = jsArray.length - 1 - 1; // Subtract 1 for tag, 1 for 0-indexing
    let currentIndex = effectiveLength;
    let ocamlList = 0; // Represents empty list

    while (currentIndex >= 0) {
      ocamlList = [0, jsArray[currentIndex + 1], ocamlList]; // Prepend elements
      currentIndex--;
    }
    return ocamlList;
  };

  /**
   * Reverses an OCaml-style list.
   * @param {Array|number} inputList - The OCaml list.
   * @returns {Array|number} The reversed OCaml list.
   */
  const reverseOcamlList = (inputList) => {
    if (inputList) {
      const head = inputList[1];
      return prependToListRecursive(head, reverseOcamlList(inputList[2]));
    }
    return 0; // Empty list
  };

  /**
   * Maps a function over an OCaml-style list.
   * @param {Function} mappingFn - The function to apply to each element.
   * @param {Array|number} inputList - The OCaml list.
   * @returns {Array|number} A new OCaml list with mapped elements.
   */
  const mapOcamlList = (mappingFn, inputList) => {
    if (inputList) {
      const tailList = inputList[2];
      const mappedHead = curryApplicationHandler(mappingFn, inputList[1]);
      return [0, mappedHead, mapOcamlList(mappingFn, tailList)];
    }
    return 0; // Empty list
  };

  // Constants for regex and array constructors
  const regexConstructor = RegExp;
  const arrayConstructor = Array;

  // Initial value for a linked list structure
  const linkedListHead = [0, 0];
  // Placeholder for a function that returns its input
  const identityFunction = (value) => value;

  /**
   * Converts a value to an OCaml-style wrapped string if it's not already an array.
   * @param {*} value - The value to convert.
   * @returns {Array|number} OCaml-style option type ([0, WrappedStringContainer] or 0 for None).
   */
  const wrapValueAsStringOption = (value) => {
    return value instanceof arrayConstructor ? 0 : [0, new WrappedStringContainer(value.toString())];
  };
  linkedListHead[1] = [0, wrapValueAsStringOption, linkedListHead[1]]; // Prepend to linked list

  const consoleLogger = getSafeConsole();

  /**
   * Applies a function to an argument. (Reverse application order compared to standard apply)
   * @param {*} arg - The argument.
   * @param {Function} func - The function.
   * @returns {*} The result of func(arg).
   */
  const applyFunctionToArg = (arg, func) => curryApplicationHandler(func, arg);

  /**
   * Converts any value to its string representation.
   * @param {*} value - The value to convert.
   * @returns {string} The string representation.
   */
  const convertToString = (value) => value.toString();

  /**
   * Logs a value to the console.
   * @param {*} valueToLog - The value to log.
   */
  const logToConsole = (valueToLog) => consoleLogger.log(convertToString(valueToLog));

  /**
   * Generates an OCaml-style list of integers from start (inclusive) to end (exclusive).
   * @param {number} startValue - The starting integer.
   * @param {number} endValue - The ending integer (exclusive).
   * @returns {Array|number} The OCaml list of integers.
   */
  const generateRangeList = (startValue, endValue) => {
    let resultList = 0; // Represents an empty OCaml list
    for (let current = endValue - 1; current >= startValue; current--) {
      resultList = [0, current, resultList];
    }
    return resultList;
  };

  /**
   * Swaps two elements in an OCaml-style array.
   * @param {Array} targetArray - The array to modify.
   * @param {number} indexA - Index of the first element.
   * @param {number} indexB - Index of the second element.
   */
  const swapArrayElements = (targetArray, indexA, indexB) => {
    const tempValue = retrieveArrayElement(targetArray, indexA);
    assignArrayElement(targetArray, indexA, retrieveArrayElement(targetArray, indexB));
    assignArrayElement(targetArray, indexB, tempValue);
  };

  /**
   * Splits an OCaml-style list into two parts: a prefix of a given length and the remainder.
   * @param {number} desiredLength - The length of the prefix.
   * @param {Array|number} sourceList - The OCaml list to split.
   * @returns {Array} An OCaml-style tuple: [0, [0, prefixList], remainderList].
   * @throws "Invalid_argument" if desiredLength is negative.
   */
  const splitListN = (desiredLength, sourceList) => {
    if (desiredLength < 0) {
      signalInvalidArgument(splitNIdentifier);
    }
    if (sourceList) {
      if (desiredLength > 0) {
        const [_, prefixTail, remainder] = splitListN(desiredLength - 1, sourceList[2]);
        return [0, [0, sourceList[1], prefixTail], remainder];
      }
      return [0, 0, sourceList]; // Prefix is empty, remainder is original list
    }
    // If sourceList is empty, and desiredLength > 0, this implies an error or specific behavior.
    // Original OCaml code implies [0,0,emptyListSentinel] if desiredLength is 0 and sourceList is 0
    // and throws if desiredLength > 0 and sourceList is 0.
    if (desiredLength === 0) return [0, 0, 0];
    throw [0, invalidArgumentException, splitNIdentifier];
  };

  /**
   * Converts a ByteStringWrapper to an integer.
   * @param {ByteStringWrapper} byteString - The string to convert.
   * @returns {number} The parsed integer.
   */
  const parseByteStringToInt = (byteString) => convertStringToInt(byteString);

  /**
   * Calculates a value based on array elements and a multiplier, then finds the maximum.
   * This seems to be a specific calculation for a game or puzzle.
   * @param {number} multiplierBase - The initial multiplier.
   * @param {Array} dataArray - The array of numbers.
   * @returns {number} The maximum calculated value.
   */
  const calculateMaxProductSum = (multiplierBase, dataArray) => {
    /**
     * Recursive helper to calculate the value starting from a given index.
     * @param {number} startIndex - The starting index in the dataArray.
     * @returns {number} The calculated value.
     */
    const computeValueFromIndex = (startIndex) => {
      // Check if current index (adjusted by multiplierBase) is out of bounds.
      // Original: aj.length-1 <= ((ak+al|0)-1|0)
      // dataArray.length-1 <= (startIndex + multiplierBase - 1)
      if (dataArray.length - 1 <= (startIndex + multiplierBase - 1)) {
        return -1; // Sentinel for invalid or end condition
      }

      let currentMultiplier = 1;
      let currentSum = 0;
      const loopEndIndex = multiplierBase - 1;

      if (loopEndIndex < 0) { // If multiplierBase is 0 or negative, sum is 0.
        currentSum = currentMultiplier; // Or 0, depends on exact logic. Original `ap` is `am` (1)
      } else {
        let loopIndex = 0;
        let runningProduct = 1;
        while (true) {
          runningProduct = performInt32Multiplication(runningProduct, retrieveArrayElement(dataArray, startIndex + loopIndex));
          loopIndex++;
          if (loopIndex > loopEndIndex) {
            currentSum = runningProduct;
            break;
          }
        }
      }
      // Recursively find the max of current sum and next starting position.
      return findMaximum(currentSum, computeValueFromIndex(startIndex + 1));
    };
    return computeValueFromIndex(0); // Start calculation from index 0
  };

  // Main execution block
  // Using a `label` for `continue` to mimic OCaml loop constructs.
  mainLoop: {
    // Read input from stdin
    const inputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

    // Process input:
    // 1. Split by whitespace regex.
    // 2. Apply identity function (no-op).
    // 3. Convert JS array to OCaml-style array.
    // 4. Convert OCaml-style array to OCaml list.
    // 5. Map each element to a WrappedStringContainer.
    const processedInputList = applyFunctionToArg(
      applyFunctionToArg(
        applyFunctionToArg(
          applyFunctionToArg(
            inputBuffer.split(new regexConstructor(convertToString(whitespaceRegexPattern))),
            identityFunction
          ),
          convertJsArrayToOcaml
        ),
        convertJsArrayToOcamlList
      ),
      (item) => curryApplicationHandler((val) => new WrappedStringContainer(val), item)
    );

    let currentInputData = processedInputList;

    for (;;) { // Infinite loop mimicking OCaml `for(;;)`
      if (currentInputData) {
        const nextDataSegment = currentInputData[2];
        const currentDataHead = currentInputData[1];

        // Parse first two numbers from input
        const firstNum = parseByteStringToInt(currentDataHead);
        const secondNum = parseByteStringToInt(nextDataSegment[1]);

        let isZeroZeroCase = false;
        if (firstNum === 0 && secondNum === 0) {
          isZeroZeroCase = true;
        }

        if (isZeroZeroCase) {
          // If 0 0, terminate loop
          currentInputData = 0; // Mark as processed
          break; // Exit the for(;;) loop
        } else {
          // Split the remaining list based on the first number
          const [_, [_, prefixList], remainderList] = splitListN(firstNum, nextDataSegment[2]);

          // Prepare game board data
          const gameBoardData = mapOcamlList(parseByteStringToInt, prefixList);

          let gameBoardArray;
          if (gameBoardData) {
            let tempArray = createOcamlVector(0, null); // Placeholder, will resize
            let arrayLength = 0;
            let currentListItem = gameBoardData;

            // First pass to determine length and populate temp array (if list was empty, this is skipped)
            while (currentListItem) {
              arrayLength++;
              currentListItem = currentListItem[2];
            }
            tempArray = createOcamlVector(arrayLength, null); // Re-create with correct size

            let currentArrayIndex = 0;
            currentListItem = gameBoardData; // Reset to head

            while (currentListItem) {
              assignArrayElement(tempArray, currentArrayIndex, currentListItem[1]);
              currentArrayIndex++;
              currentListItem = currentListItem[2];
            }
            gameBoardArray = tempArray;
          } else {
            gameBoardArray = [0]; // Empty OCaml array
          }

          const targetValue = calculateMaxProductSum(secondNum, gameBoardArray);

          // Generate all possible pairs of indices for swapping
          const indicesRange = generateRangeList(0, firstNum); // 0 to firstNum-1
          const allPairs = reverseOcamlList(mapOcamlList(
            (idxA) => mapOcamlList((idxB) => [0, idxA, idxB], generateRangeList(0, firstNum)),
            indicesRange
          )); // [0, [0,0], [0,1]], [0, [1,0], [1,1]]...

          let maxScore = -1; // Initialize with a low score

          // Iterate through all possible swaps
          let currentPairList = allPairs;
          while (currentPairList) {
            const currentPair = currentPairList[1];
            const idx1 = currentPair[1];
            const idx2 = currentPair[2];

            swapArrayElements(gameBoardArray, idx1, idx2); // Perform swap
            const currentScore = calculateMaxProductSum(secondNum, gameBoardArray);
            swapArrayElements(gameBoardArray, idx1, idx2); // Undo swap

            maxScore = findMaximum(maxScore, currentScore); // Update max score

            currentPairList = currentPairList[2];
          }

          // Output result
          if (maxScore < targetValue) {
            logToConsole(noGameMessage);
          } else {
            logToConsole(formatIntegerToString(percentDFormat, maxScore - targetValue));
          }

          currentInputData = remainderList; // Move to the next block of input
          continue mainLoop; // Continue the main `for(;;)` loop
        }
      }

      // If currentInputData is null/0, means we've processed all input or hit 0 0.
      runExitHandlers(); // Execute exit handlers
      return; // Exit the IIFE
    }
  }
  // This line should not be reached if the loop breaks or returns properly.
  // Original code uses `throw [0,a,g];` for a default error here.
  throw [0, failureException, getInputIdentifier]; // Fallback if loop logic fails
})();