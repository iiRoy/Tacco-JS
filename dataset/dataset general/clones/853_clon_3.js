!function(jObject){if("object"==typeof exports)module.exports=jObject();else if("function"==typeof define&&define.amd)define(jObject);else{var globalScopeRef;
"undefined"!=typeof window?globalScopeRef=window:"undefined"!=typeof global?globalScopeRef=global:"undefined"!=typeof self&&(globalScopeRef=self);
globalScopeRef.dataProcessor=jObject()}}(function(){var internalDefine,exportedModule,exportedElements;return (function moduleBootstrap(allDefinitions, moduleRegistry, entryModuleKeys){
function obtainModule(moduleIdentifier, skipExternalCheck){
if(!moduleRegistry[moduleIdentifier]){
if(!allDefinitions[moduleIdentifier]){
var browserFallbackRequire=typeof require=="function"&&require;
if(!skipExternalCheck&&browserFallbackRequire)return browserFallbackRequire(moduleIdentifier,!0);
if(typeof internalRequireGlobal !== "undefined" && internalRequireGlobal)return internalRequireGlobal(moduleIdentifier,!0);
throw new Error("Unable to locate module '"+moduleIdentifier+"' in definitions or global scope.");
}
var moduleWrapper=moduleRegistry[moduleIdentifier]={exports:{}};
allDefinitions[moduleIdentifier][0].call(moduleWrapper.exports,function(reqPath){var targetModule=allDefinitions[moduleIdentifier][1][reqPath];return obtainModule(targetModule?targetModule:reqPath)},moduleWrapper,moduleWrapper.exports,moduleBootstrap,allDefinitions,moduleRegistry,entryModuleKeys)}
return moduleRegistry[moduleIdentifier].exports}
var internalRequireGlobal=typeof require=="function"&&require;
for(var keyIndex=0;keyIndex<entryModuleKeys.length;keyIndex++)obtainModule(entryModuleKeys[keyIndex]);
return obtainModule(entryModuleKeys[0])})({1:[function(moduleImporter,moduleContainer,moduleExports){
// This module provides a robust binary data container,
// akin to Node.js Buffer, for browser environments.
// It leverages Typed Arrays for performance where available,
// falling back to standard JavaScript objects otherwise.
// Original author: Feross Aboukhadijeh <feross@feross.org>
// License: MIT

var base64Util = moduleImporter('base64-js');
var ieee754Converter = moduleImporter('ieee754');

moduleExports.ByteStream = BinaryDataContainer;
moduleExports.LegacyByteContainer = BinaryDataContainer; // For backward compatibility / alias
moduleExports.MAX_DISPLAY_BYTES = 50; // Maximum bytes to display in inspect output
BinaryDataContainer.allocationPoolSize = 8192; // Default pool size for pre-allocated buffers

/**
 * Determines if the current JavaScript environment supports Typed Arrays
 * and if they can be augmented with additional properties.
 * This is crucial for maintaining Node.js Buffer API compatibility.
 */
BinaryDataContainer.supportsOptimizedArrays = (function () {
  try {
    var tempArrayBuffer = new ArrayBuffer(0);
    var testUint8Array = new Uint8Array(tempArrayBuffer);
    // Test for property augmentation and subarray method presence.
    // Firefox 4-29 had issues with property augmentation on Uint8Array instances.
    testUint8Array.customProperty = function () { return 42; };
    return testUint8Array.customProperty() === 42 &&
           typeof testUint8Array.subarray === 'function';
  } catch (err) {
    return false; // Typed Arrays or augmentation not supported.
  }
})();

/**
 * Creates a new BinaryDataContainer instance.
 * Instances are either augmented Uint8Arrays (preferred) or plain objects.
 *
 * @param {string|number|Array|Uint8Array|BinaryDataContainer} inputSource - The data source for the container.
 * @param {string} [inputEncoding='utf8'] - The encoding of the inputSource if it's a string.
 * @param {boolean} [skipZeroFill=false] - If true, a numeric length won't be zero-filled.
 * @returns {BinaryDataContainer} A new binary data container.
 */
function BinaryDataContainer (inputSource, inputEncoding, skipZeroFill) {
  // Ensure 'new' keyword is used for proper instantiation.
  if (!(this instanceof BinaryDataContainer)) {
    return new BinaryDataContainer(inputSource, inputEncoding, skipZeroFill);
  }

  var sourceType = typeof inputSource;

  // Handle base64 string padding for compatibility with Node's implementation.
  if (inputEncoding === 'base64' && sourceType === 'string') {
    inputSource = trimInputString(inputSource);
    // Pad with '=' characters if length is not a multiple of 4.
    while (inputSource.length % 4 !== 0) {
      inputSource += '=';
    }
  }

  // Determine the byte length of the container.
  var containerSize;
  if (sourceType === 'number') {
    containerSize = validateAndCoerceLength(inputSource);
  } else if (sourceType === 'string') {
    containerSize = BinaryDataContainer.getByteCount(inputSource, inputEncoding);
  } else if (sourceType === 'object' && inputSource !== null) {
    // Assume array-like object with a 'length' property.
    containerSize = validateAndCoerceLength(inputSource.length);
  } else {
    throw new Error('First argument must be a number, string, or array-like object.');
  }

  var instanceHandle;
  if (BinaryDataContainer.supportsOptimizedArrays) {
    // Preferred path: Return an augmented Uint8Array for performance.
    instanceHandle = BinaryDataContainer._enhanceUint8Array(new Uint8Array(containerSize));
  } else {
    // Fallback path: Use 'this' instance and manually manage properties.
    instanceHandle = this;
    instanceHandle.length = containerSize;
    instanceHandle.isAugmentedContainer = true; // Custom flag for detection.
  }

  var elementIndex;
  // Initialize the container based on the input source.
  if (BinaryDataContainer.supportsOptimizedArrays && typeof inputSource.byteLength === 'number') {
    // Optimization: Directly set content from a Typed Array.
    instanceHandle._assignTypedArrayContent(inputSource);
  } else if (isLikeAnArray(inputSource)) {
    // Process array-like objects byte by byte.
    for (elementIndex = 0; elementIndex < containerSize; elementIndex++) {
      if (BinaryDataContainer.isBinaryDataContainer(inputSource)) {
        instanceHandle[elementIndex] = inputSource.readUInt8(elementIndex);
      } else {
        instanceHandle[elementIndex] = inputSource[elementIndex];
      }
    }
  } else if (sourceType === 'string') {
    instanceHandle.write(inputSource, 0, inputEncoding);
  } else if (sourceType === 'number' && !BinaryDataContainer.supportsOptimizedArrays && !skipZeroFill) {
    // For non-typed array fallback, zero-fill if not skipped.
    for (elementIndex = 0; elementIndex < containerSize; elementIndex++) {
      instanceHandle[elementIndex] = 0;
    }
  }

  return instanceHandle;
}

// --- STATIC METHODS ---

/**
 * Checks if a given string is a recognized binary encoding.
 * @param {string} codecName - The encoding name to check.
 * @returns {boolean} True if the encoding is recognized, false otherwise.
 */
BinaryDataContainer.isEncoding = function (codecName) {
  var normalizedCodec = String(codecName || '').toLowerCase();
  switch (normalizedCodec) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;
    default:
      return false;
  }
};

/**
 * Checks if an object is an instance of BinaryDataContainer.
 * @param {*} candidate - The object to test.
 * @returns {boolean} True if the object is a BinaryDataContainer instance.
 */
BinaryDataContainer.isBinaryDataContainer = function (candidate) {
  // Check for the custom flag set in the constructor.
  return Boolean(candidate !== null && candidate !== undefined && candidate.isAugmentedContainer);
};

/**
 * Calculates the byte length of a string given an encoding.
 * @param {string} sourceString - The string to measure.
 * @param {string} [charEncoding='utf8'] - The encoding to use.
 * @returns {number} The byte length.
 */
BinaryDataContainer.getByteCount = function (sourceString, charEncoding) {
  var calculatedLength;
  var processedString = String(sourceString); // Ensure string type.
  var effectiveEncoding = (charEncoding || 'utf8').toLowerCase();

  switch (effectiveEncoding) {
    case 'hex':
      calculatedLength = processedString.length / 2;
      break;
    case 'utf8':
    case 'utf-8':
      calculatedLength = convertUtf8StringToBytes(processedString).length;
      break;
    case 'ascii':
    case 'binary':
    case 'raw':
      calculatedLength = processedString.length;
      break;
    case 'base64':
      calculatedLength = convertBase64StringToBytes(processedString).length;
      break;
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      calculatedLength = processedString.length * 2;
      break;
    default:
      throw new Error('Unsupported encoding for byte length calculation: ' + effectiveEncoding);
  }
  return calculatedLength;
};

/**
 * Concatenates a list of BinaryDataContainer instances into a single new instance.
 * @param {Array<BinaryDataContainer>} containerArray - An array of containers to concatenate.
 * @param {number} [overallLength] - Optional, the total length of the concatenated container.
 * @returns {BinaryDataContainer} A new container with combined data.
 */
BinaryDataContainer.combineContainers = function (containerArray, overallLength) {
  ensureCondition(isLikeAnArray(containerArray), 'Input for combineContainers must be an Array.');

  if (containerArray.length === 0) {
    return new BinaryDataContainer(0);
  } else if (containerArray.length === 1) {
    return containerArray[0];
  }

  var idx;
  if (typeof overallLength !== 'number') {
    overallLength = 0;
    for (idx = 0; idx < containerArray.length; idx++) {
      overallLength += containerArray[idx].length;
    }
  }

  var combinedResult = new BinaryDataContainer(overallLength);
  var currentPosition = 0;
  for (idx = 0; idx < containerArray.length; idx++) {
    var currentContainer = containerArray[idx];
    currentContainer.copyTo(combinedResult, currentPosition);
    currentPosition += currentContainer.length;
  }
  return combinedResult;
};

// --- INSTANCE METHODS ---

/**
 * Writes a string into the buffer at a specified offset with a given encoding.
 * @param {string} sourceString - The string to write.
 * @param {number} [startOffset=0] - The offset in the buffer to start writing.
 * @param {number} [maxBytes] - The maximum number of bytes to write.
 * @param {string} [writeEncoding='utf8'] - The encoding of the string.
 * @returns {number} The number of bytes written.
 */
BinaryDataContainer.prototype.write = function (sourceString, startOffset, maxBytes, writeEncoding) {
  var parsedArgs = parseWriteArgs(sourceString, startOffset, maxBytes, writeEncoding, this.length);
  sourceString = parsedArgs.str;
  startOffset = parsedArgs.offset;
  maxBytes = parsedArgs.length;
  writeEncoding = parsedArgs.encoding;

  var bytesWrittenCount;
  switch (writeEncoding) {
    case 'hex':
      bytesWrittenCount = writeHexContent(this, sourceString, startOffset, maxBytes);
      break;
    case 'utf8':
    case 'utf-8':
      bytesWrittenCount = writeUtf8Content(this, sourceString, startOffset, maxBytes);
      break;
    case 'ascii':
      bytesWrittenCount = writeAsciiContent(this, sourceString, startOffset, maxBytes);
      break;
    case 'binary':
      bytesWrittenCount = writeBinaryContent(this, sourceString, startOffset, maxBytes);
      break;
    case 'base64':
      bytesWrittenCount = writeBase64Content(this, sourceString, startOffset, maxBytes);
      break;
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      bytesWrittenCount = writeUtf16leContent(this, sourceString, startOffset, maxBytes);
      break;
    default:
      throw new Error('Unknown or unsupported encoding for writing: ' + writeEncoding);
  }
  return bytesWrittenCount;
};

/**
 * Converts the buffer's content to a string with a specified encoding.
 * @param {string} [outputEncoding='utf8'] - The encoding to use for the string.
 * @param {number} [startIndex=0] - The starting byte offset.
 * @param {number} [endIndex] - The ending byte offset (exclusive).
 * @returns {string} The string representation of the buffer segment.
 */
BinaryDataContainer.prototype.toString = function (outputEncoding, startIndex, endIndex) {
  var currentInstance = this;

  outputEncoding = String(outputEncoding || 'utf8').toLowerCase();
  startIndex = Number(startIndex) || 0;
  endIndex = (endIndex !== undefined) ? Number(endIndex) : currentInstance.length;

  // Optimized path for empty strings.
  if (endIndex === startIndex) {
    return '';
  }

  var resultString;
  switch (outputEncoding) {
    case 'hex':
      resultString = extractHexSegment(currentInstance, startIndex, endIndex);
      break;
    case 'utf8':
    case 'utf-8':
      resultString = extractUtf8Segment(currentInstance, startIndex, endIndex);
      break;
    case 'ascii':
      resultString = extractAsciiSegment(currentInstance, startIndex, endIndex);
      break;
    case 'binary':
      resultString = extractBinarySegment(currentInstance, startIndex, endIndex);
      break;
    case 'base64':
      resultString = extractBase64Segment(currentInstance, startIndex, endIndex);
      break;
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      resultString = extractUtf16leSegment(currentInstance, startIndex, endIndex);
      break;
    default:
      throw new Error('Unknown or unsupported encoding for toString: ' + outputEncoding);
  }
  return resultString;
};

/**
 * Returns a JSON representation of the buffer.
 * @returns {{type: string, data: number[]}}
 */
BinaryDataContainer.prototype.toJSON = function () {
  // Use the internal typed array if available, otherwise 'this' (the object itself).
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this.internalTypedArray || this, 0)
  };
};

/**
 * Copies a segment of the current buffer to a target buffer.
 * @param {BinaryDataContainer} targetBuffer - The destination buffer.
 * @param {number} [targetStart=0] - The offset in the target buffer to start writing.
 * @param {number} [sourceStart=0] - The offset in the source buffer to start reading.
 * @param {number} [sourceEnd] - The offset in the source buffer to stop reading (exclusive).
 */
BinaryDataContainer.prototype.copyTo = function (targetBuffer, targetStart, sourceStart, sourceEnd) {
  var currentSource = this;

  // Default values for offsets and lengths.
  var targetOffset = targetStart || 0;
  var srcOffset = sourceStart || 0;
  var srcLimit = sourceEnd !== undefined ? sourceEnd : currentSource.length;

  // Guard clauses for invalid inputs.
  ensureCondition(srcLimit >= srcOffset, 'Source end offset must be greater than or equal to source start offset.');
  ensureCondition(targetOffset >= 0 && targetOffset < targetBuffer.length, 'Target start offset out of bounds.');
  ensureCondition(srcOffset >= 0 && srcOffset < currentSource.length, 'Source start offset out of bounds.');
  ensureCondition(srcLimit >= 0 && srcLimit <= currentSource.length, 'Source end offset out of bounds.');

  // If no bytes to copy or buffers are empty, return early.
  if (srcLimit === srcOffset || targetBuffer.length === 0 || currentSource.length === 0) {
    return;
  }

  // Adjust sourceEnd if it would overflow the target buffer.
  var bytesToCopy = srcLimit - srcOffset;
  if (targetBuffer.length - targetOffset < bytesToCopy) {
    bytesToCopy = targetBuffer.length - targetOffset;
  }

  // Perform the copy operation.
  if (bytesToCopy < 100 || !BinaryDataContainer.supportsOptimizedArrays) {
    // Fallback to byte-by-byte copy for small segments or non-typed arrays.
    for (var i = 0; i < bytesToCopy; i++) {
      targetBuffer[i + targetOffset] = currentSource[i + srcOffset];
    }
  } else {
    // Optimized path using subarray and set for Typed Arrays.
    targetBuffer._assignTypedArrayContent(currentSource.subarray(srcOffset, srcOffset + bytesToCopy), targetOffset);
  }
};

/**
 * Creates a new BinaryDataContainer that references a portion of the original.
 * @param {number} [startIndex=0] - The start offset of the slice.
 * @param {number} [endIndex] - The end offset of the slice (exclusive).
 * @returns {BinaryDataContainer} A new container representing the slice.
 */
BinaryDataContainer.prototype.slice = function (startIndex, endIndex) {
  var currentLength = this.length;
  var effectiveStart = constrainValue(startIndex, currentLength, 0);
  var effectiveEnd = constrainValue(endIndex, currentLength, currentLength);

  if (BinaryDataContainer.supportsOptimizedArrays) {
    // For Typed Arrays, subarray creates a new view without copying data.
    return BinaryDataContainer._enhanceUint8Array(this.subarray(effectiveStart, effectiveEnd));
  } else {
    // For fallback objects, a new buffer must be created and populated.
    var sliceByteLength = effectiveEnd - effectiveStart;
    var newSliceContainer = new BinaryDataContainer(sliceByteLength, undefined, true); // skip zero-fill
    for (var i = 0; i < sliceByteLength; i++) {
      newSliceContainer[i] = this[i + effectiveStart];
    }
    return newSliceContainer;
  }
};

// Deprecated Node.js Buffer methods, kept for compatibility, without console warnings.
BinaryDataContainer.prototype.get = function (byteOffset) {
  return this.readUInt8(byteOffset);
};

BinaryDataContainer.prototype.set = function (value, byteOffset) {
  return this.writeUInt8(value, byteOffset);
};

/**
 * Reads an unsigned 8-bit integer from the buffer at the specified offset.
 * @param {number} byteOffset - The offset to start reading from.
 * @param {boolean} [suppressChecks=false] - If true, skips offset validation.
 * @returns {number} The unsigned 8-bit integer.
 */
BinaryDataContainer.prototype.readUInt8 = function (byteOffset, suppressChecks) {
  if (!suppressChecks) {
    // Explicit validation for byteOffset.
    ensureCondition(byteOffset !== undefined && byteOffset !== null, 'Offset parameter is missing.');
    ensureCondition(byteOffset >= 0 && byteOffset < this.length, 'Attempted to read beyond buffer boundaries.');
  }

  // If checks are suppressed or passed, directly access the byte.
  return this[byteOffset];
};

/**
 * Reads an unsigned 16-bit integer from the buffer at the specified offset.
 * @param {BinaryDataContainer} dataBuffer - The buffer instance.
 * @param {number} byteOffset - The offset to start reading from.
 * @param {boolean} isLittleEndian - True for little-endian, false for big-endian.
 * @param {boolean} [suppressChecks=false] - If true, skips offset and endianness validation.
 * @returns {number} The unsigned 16-bit integer.
 */
function readUnsignedInt16 (dataBuffer, byteOffset, isLittleEndian, suppressChecks) {
  if (!suppressChecks) {
    ensureCondition(typeof isLittleEndian === 'boolean', 'Endianness parameter must be a boolean.');
    ensureCondition(byteOffset !== undefined && byteOffset !== null, 'Offset parameter is missing.');
    ensureCondition(byteOffset >= 0 && byteOffset + 1 < dataBuffer.length, 'Attempted to read beyond buffer boundaries for UInt16.');
  }

  var val;
  if (isLittleEndian) {
    val = dataBuffer[byteOffset] | (dataBuffer[byteOffset + 1] << 8);
  } else {
    val = (dataBuffer[byteOffset] << 8) | dataBuffer[byteOffset + 1];
  }
  return val;
}


// --- INTERNAL HELPER FUNCTIONS ---

/**
 * Ensures a value is a non-negative integer, coercing if possible.
 * Throws an error if the value is invalid.
 * @param {*} value - The value to coerce.
 * @returns {number} The coerced integer length.
 */
function validateAndCoerceLength (value) {
  if (value < 0) {
    throw new Error('Length must be a non-negative number.');
  }
  var coerced = ~~value; // Equivalent to Math.floor(value) for positive numbers
  if (coerced !== value) {
    // Handle cases where value is float or NaN
    coerced = 0; // Default to 0 for invalid numbers to prevent errors, or throw?
  }
  return coerced;
}

/**
 * Trims whitespace from a string.
 * @param {string} inputStr - The string to trim.
 * @returns {string} The trimmed string.
 */
function trimInputString (inputStr) {
  return inputStr.replace(/[^A-Za-z0-9+/=]/g, '');
}

/**
 * Checks if an object behaves like an array (has a 'length' property and is indexable).
 * @param {*} obj - The object to check.
 * @returns {boolean} True if array-like, false otherwise.
 */
function isLikeAnArray (obj) {
  return Array.isArray(obj) || (obj && typeof obj === 'object' && typeof obj.length === 'number');
}

/**
 * Asserts a condition, throwing an error if false.
 * @param {boolean} condition - The condition to check.
 * @param {string} message - The error message if the condition is false.
 */
function ensureCondition (condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed.');
  }
}

/**
 * Converts a UTF-8 string to a byte array.
 * @param {string} str - The string to convert.
 * @returns {number[]} An array of byte values.
 */
function convertUtf8StringToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i);
    if (charCode < 0x80) { // 1-byte sequence
      byteArray.push(charCode);
    } else if (charCode < 0x800) { // 2-byte sequence
      byteArray.push(0xC0 | (charCode >> 6),
                     0x80 | (charCode & 0x3F));
    } else if (charCode < 0xD800 || charCode >= 0xE000) { // 3-byte sequence
      byteArray.push(0xE0 | (charCode >> 12),
                     0x80 | ((charCode >> 6) & 0x3F),
                     0x80 | (charCode & 0x3F));
    } else { // 4-byte sequence (surrogate pairs)
      i++;
      charCode = 0x10000 + (((charCode & 0x3FF) << 10) | (str.charCodeAt(i) & 0x3FF));
      byteArray.push(0xF0 | (charCode >> 18),
                     0x80 | ((charCode >> 12) & 0x3F),
                     0x80 | ((charCode >> 6) & 0x3F),
                     0x80 | (charCode & 0x3F));
    }
  }
  return byteArray;
}

/**
 * Converts an ASCII string to a byte array.
 * @param {string} str - The string to convert.
 * @returns {number[]} An array of byte values.
 */
function convertAsciiStringToBytes (str) {
  var arr = new Array(str.length);
  for (var i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xFF; // Only lower 8 bits for ASCII.
  }
  return arr;
}

/**
 * Converts a Base64 string to a byte array.
 * @param {string} str - The Base64 string.
 * @returns {number[]} An array of byte values.
 */
function convertBase64StringToBytes (str) {
  return base64Util.toByteArray(str);
}

/**
 * Converts a UTF-16LE string to a byte array.
 * @param {string} str - The UTF-16LE string.
 * @returns {number[]} An array of byte values.
 */
function convertUtf16leStringToBytes (str) {
  var len = str.length;
  var bytes = new Array(len * 2);
  var p = 0;
  for (var i = 0; i < len; i++) {
    var code = str.charCodeAt(i);
    bytes[p++] = code & 0xFF;
    bytes[p++] = code >>> 8;
  }
  return bytes;
}

/**
 * Copies bytes from a source array to a target buffer.
 * @param {number[]} sourceBytes - The array of bytes to copy.
 * @param {BinaryDataContainer} targetBuffer - The destination buffer.
 * @param {number} targetOffset - The offset in the target buffer.
 * @param {number} maxBytesToCopy - Maximum number of bytes to copy.
 * @returns {number} The number of bytes actually copied.
 */
function transferBytes (sourceBytes, targetBuffer, targetOffset, maxBytesToCopy) {
  var bytesWritten = 0;
  var targetLength = targetBuffer.length;
  var sourceLength = sourceBytes.length;

  // Ensure targetOffset is within bounds and maxBytesToCopy is valid.
  targetOffset = Math.max(0, targetOffset || 0);
  maxBytesToCopy = maxBytesToCopy === undefined ? (targetLength - targetOffset) : Math.min(maxBytesToCopy, (targetLength - targetOffset));
  maxBytesToCopy = Math.min(maxBytesToCopy, sourceLength); // Don't copy more than available in source.

  for (var i = 0; i < maxBytesToCopy; i++) {
    if (i + targetOffset >= targetLength) break; // Prevent writing out of bounds
    targetBuffer[i + targetOffset] = sourceBytes[i];
    bytesWritten++;
  }
  return bytesWritten;
}

/**
 * Decodes a percent-encoded UTF-8 character sequence.
 * @param {string} encodedStr - The percent-encoded string.
 * @returns {string} The decoded string.
 */
function decodePercentEncodedUtf8Char (encodedStr) {
  try {
    return decodeURIComponent(encodedStr);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // Replacement character for invalid sequences.
  }
}

/**
 * Converts a single byte value to its two-character hexadecimal representation.
 * @param {number} byteValue - The byte value (0-255).
 * @returns {string} The hexadecimal string.
 */
function byteToHexPair (byteValue) {
  return byteValue < 16 ? '0' + byteValue.toString(16) : byteValue.toString(16);
}

/**
 * Clamps a value within a specified range.
 * @param {number} value - The value to clamp.
 * @param {number} max - The maximum boundary.
 * @param {number} min - The minimum boundary.
 * @returns {number} The clamped value.
 */
function constrainValue (value, max, min) {
  value = Number(value || 0);
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/**
 * Internal utility to parse arguments for write method.
 * Handles the legacy argument order.
 */
function parseWriteArgs(str, offset, len, enc, bufLen) {
  var effectiveOffset, effectiveLength, effectiveEncoding;

  if (Number.isFinite(offset)) {
    // Modern signature: (str, offset, length, encoding)
    effectiveOffset = Number(offset) || 0;
    if (!Number.isFinite(len)) {
      effectiveEncoding = len; // length was omitted, encoding is in its place
      effectiveLength = undefined;
    } else {
      effectiveLength = Number(len);
      effectiveEncoding = enc;
    }
  } else {
    // Legacy signature: (str, encoding, offset, length)
    effectiveEncoding = offset;
    effectiveOffset = len;
    effectiveLength = enc;
  }

  effectiveOffset = Number(effectiveOffset) || 0;
  var remainingBytes = bufLen - effectiveOffset;
  effectiveLength = effectiveLength === undefined ? remainingBytes : Number(effectiveLength);
  if (effectiveLength > remainingBytes) {
    effectiveLength = remainingBytes;
  }

  effectiveEncoding = String(effectiveEncoding || 'utf8').toLowerCase();

  return {
    str: str,
    offset: effectiveOffset,
    length: effectiveLength,
    encoding: effectiveEncoding
  };
}


// --- INTERNAL WRITE FUNCTIONS (PRIVATE) ---

/**
 * Writes a hex string into the buffer.
 */
function writeHexContent (targetBuffer, sourceString, startOffset, maxBytes) {
  ensureCondition(sourceString.length % 2 === 0, 'Invalid hex string: must have an even number of characters.');

  var strLen = sourceString.length;
  var actualBytesToWrite = Math.min(maxBytes, strLen / 2); // Max bytes to write based on string length.
  var bytesProcessed = 0;

  for (var i = 0; i < actualBytesToWrite; i++) {
    var byteValue = parseInt(sourceString.substring(i * 2, (i * 2) + 2), 16);
    ensureCondition(!isNaN(byteValue), 'Invalid hex character found in string.');
    targetBuffer[startOffset + i] = byteValue;
    bytesProcessed++;
  }
  // Store characters written for compatibility (Node's Buffer._charsWritten)
  targetBuffer.bytesProcessedCount = bytesProcessed * 2;
  return bytesProcessed;
}

/**
 * Writes a UTF-8 string into the buffer.
 */
function writeUtf8Content (targetBuffer, sourceString, startOffset, maxBytes) {
  var bytes = convertUtf8StringToBytes(sourceString);
  var written = transferBytes(bytes, targetBuffer, startOffset, maxBytes);
  targetBuffer.bytesProcessedCount = written; // Store bytes written, not chars.
  return written;
}

/**
 * Writes an ASCII string into the buffer.
 */
function writeAsciiContent (targetBuffer, sourceString, startOffset, maxBytes) {
  var bytes = convertAsciiStringToBytes(sourceString);
  var written = transferBytes(bytes, targetBuffer, startOffset, maxBytes);
  targetBuffer.bytesProcessedCount = written;
  return written;
}

/**
 * Writes a binary string (alias for ASCII) into the buffer.
 */
function writeBinaryContent (targetBuffer, sourceString, startOffset, maxBytes) {
  return writeAsciiContent(targetBuffer, sourceString, startOffset, maxBytes);
}

/**
 * Writes a Base64 string into the buffer.
 */
function writeBase64Content (targetBuffer, sourceString, startOffset, maxBytes) {
  var bytes = convertBase64StringToBytes(sourceString);
  var written = transferBytes(bytes, targetBuffer, startOffset, maxBytes);
  targetBuffer.bytesProcessedCount = written;
  return written;
}

/**
 * Writes a UTF-16LE string into the buffer.
 */
function writeUtf16leContent (targetBuffer, sourceString, startOffset, maxBytes) {
  var bytes = convertUtf16leStringToBytes(sourceString);
  var written = transferBytes(bytes, targetBuffer, startOffset, maxBytes);
  targetBuffer.bytesProcessedCount = written;
  return written;
}


// --- INTERNAL SLICE/READ FUNCTIONS (PRIVATE) ---

/**
 * Extracts a Base64 string segment from the buffer.
 */
function extractBase64Segment (dataBuffer, startIndex, endIndex) {
  if (startIndex === 0 && endIndex === dataBuffer.length) {
    return base64Util.fromByteArray(dataBuffer);
  } else {
    // Create a temporary slice to convert to base64.
    return base64Util.fromByteArray(dataBuffer.slice(startIndex, endIndex));
  }
}

/**
 * Extracts a UTF-8 string segment from the buffer.
 */
function extractUtf8Segment (dataBuffer, startIndex, endIndex) {
  var result = '';
  var tempAccumulator = '';
  var effectiveEnd = Math.min(dataBuffer.length, endIndex);

  for (var i = startIndex; i < effectiveEnd; i++) {
    var currentByte = dataBuffer[i];
    if (currentByte <= 0x7F) { // ASCII byte, can be appended directly.
      result += decodePercentEncodedUtf8Char(tempAccumulator) + String.fromCharCode(currentByte);
      tempAccumulator = '';
    } else {
      // Non-ASCII byte, accumulate for percent-encoding decoding.
      tempAccumulator += '%' + currentByte.toString(16);
    }
  }

  return result + decodePercentEncodedUtf8Char(tempAccumulator); // Decode any remaining accumulated bytes.
}

/**
 * Extracts an ASCII string segment from the buffer.
 */
function extractAsciiSegment (dataBuffer, startIndex, endIndex) {
  var asciiResult = '';
  var effectiveEnd = Math.min(dataBuffer.length, endIndex);

  for (var i = startIndex; i < effectiveEnd; i++) {
    asciiResult += String.fromCharCode(dataBuffer[i]);
  }
  return asciiResult;
}

/**
 * Extracts a binary string segment (alias for ASCII) from the buffer.
 */
function extractBinarySegment (dataBuffer, startIndex, endIndex) {
  return extractAsciiSegment(dataBuffer, startIndex, endIndex);
}

/**
 * Extracts a hex string segment from the buffer.
 */
function extractHexSegment (dataBuffer, startIndex, endIndex) {
  var currentLength = dataBuffer.length;

  var effectiveStart = startIndex < 0 ? 0 : startIndex;
  var effectiveEnd = endIndex < 0 || endIndex > currentLength ? currentLength : endIndex;

  var hexOutput = '';
  for (var i = effectiveStart; i < effectiveEnd; i++) {
    hexOutput += byteToHexPair(dataBuffer[i]);
  }
  return hexOutput;
}

/**
 * Extracts a UTF-16LE string segment from the buffer.
 */
function extractUtf16leSegment (dataBuffer, startIndex, endIndex) {
  var byteSegment = dataBuffer.slice(startIndex, endIndex);
  var utf16Result = '';
  for (var i = 0; i < byteSegment.length; i += 2) {
    // Combine two bytes into a 16-bit character code (little-endian).
    utf16Result += String.fromCharCode(byteSegment[i] | (byteSegment[i + 1] << 8));
  }
  return utf16Result;
}

// --- AUGMENTATION FOR TYPED ARRAYS ---

/**
 * Augments a Uint8Array instance with BinaryDataContainer prototype methods.
 * This function is internal and only used when Typed Arrays are supported.
 * @param {Uint8Array} uint8ArrayInstance - The Uint8Array to augment.
 * @returns {BinaryDataContainer} The augmented instance.
 */
BinaryDataContainer._enhanceUint8Array = function (uint8ArrayInstance) {
  // Directly assign prototype methods to the Uint8Array instance.
  // This avoids modifying the global Uint8Array prototype.
  Object.setPrototypeOf(uint8ArrayInstance, BinaryDataContainer.prototype);
  uint8ArrayInstance.isAugmentedContainer = true; // Custom flag.
  // Add a reference to the underlying typed array for toJSON.
  uint8ArrayInstance.internalTypedArray = uint8ArrayInstance;
  // Add a _set method for optimized copying from other typed arrays.
  uint8ArrayInstance._assignTypedArrayContent = uint8ArrayInstance.set;
  return uint8ArrayInstance;
};

// Expose the internal readUInt16 for other modules if needed, but keep its name.
moduleExports._readUInt16 = readUnsignedInt16;

},{
"base64-js":2,
"ieee754":3
}],2:[function(moduleImporter,moduleContainer,moduleExports){
// base64-js: https://github.com/beatgammit/base64-js
// Copyright (c) 2014-2015, Feross Aboukhadijeh. All rights reserved.
// License: MIT
'use strict';

var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encode(buf, urlsafe) {
  var out = [];
  var i;
  var len = buf.length;
  var extraBytes = len % 3; // # of bytes that don't fit in 3-byte blocks

  for (i = 0; i < len;) {
    var tmp =
      (buf[i++] << 16) |
      (buf[i++] << 8) |
      (buf[i++] << 0);
    out.push(
      lookup[(tmp >> 18) & 0x3F] +
      lookup[(tmp >> 12) & 0x3F] +
      lookup[(tmp >> 6) & 0x3F] +
      lookup[(tmp >> 0) & 0x3F]
    );
  }

  // Pad the end with '=' to align on 4-char boundaries.
  // Note: extraBytes === 0 means no padding needed.
  if (extraBytes === 1) {
    var lastByte = buf[len - 1];
    out.pop();
    out.push(
      lookup[(lastByte >> 2) & 0x3F] +
      lookup[(lastByte << 4) & 0x3F] +
      '=='
    );
  } else if (extraBytes === 2) {
    var lastTwoBytes = (buf[len - 2] << 8) | buf[len - 1];
    out.pop();
    out.push(
      lookup[(lastTwoBytes >> 10) & 0x3F] +
      lookup[(lastTwoBytes >> 4) & 0x3F] +
      lookup[(lastTwoBytes << 2) & 0x3F] +
      '='
    );
  }

  return out.join('');
}

function decode(base64Str) {
  var i;
  var len = base64Str.length;
  var p = 0;
  var bytes = [];

  // Remove padding characters and invalid base64 chars.
  base64Str = base64Str.replace(/[^A-Za-z0-9+/=]/g, '');

  for (i = 0; i < len;) {
    var enc1 = lookup.indexOf(base64Str[i++]);
    var enc2 = lookup.indexOf(base64Str[i++]);
    var enc3 = lookup.indexOf(base64Str[i++]);
    var enc4 = lookup.indexOf(base64Str[i++]);

    var combined = (enc1 << 18) | (enc2 << 12) | (enc3 << 6) | enc4;

    bytes[p++] = (combined >> 16) & 0xFF;
    if (enc3 !== 64) { // 64 is '='
      bytes[p++] = (combined >> 8) & 0xFF;
      if (enc4 !== 64) {
        bytes[p++] = combined & 0xFF;
      }
    }
  }

  return bytes;
}

moduleExports.fromByteArray = encode;
moduleExports.toByteArray = decode;

},{}],3:[function(moduleImporter,moduleContainer,moduleExports){
// ieee754: https://github.com/feross/ieee754
// Copyright (c) 2008, Fair Oaks Labs, Inc.
// All rights reserved.
// License: BSD-3-Clause

moduleExports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var bias = (1 << (eLen - 1)) - 1;
  var val = -1;
  var k = isLE ? -1 : 1;
  var idx = isLE ? (nBytes - 1) : 0;
  var s = buffer[idx];

  idx += k;
  e = s & ((1 << (-eLen + 1)) - 1);
  s >>= (-eLen + 1);
  s &= 1;

  for (; eLen > 0; eLen--) {
    e = e * 256 + buffer[idx];
    idx += k;
  }

  for (m = val = 0; mLen > 0; mLen--) {
    val = val * 256 + buffer[idx];
    idx += k;
  }

  e = e - bias;
  val = val * Math.pow(2, -mLen);

  return (s ? -1 : 1) * (val + 1) * Math.pow(2, e);
};

moduleExports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var bias = (1 << (eLen - 1)) - 1;
  var i = isLE ? (nBytes - 1) : 0;
  var k = isLE ? -1 : 1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = (1 << eLen) - 1;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + bias >= (1 << eLen) - 1) {
      e = (1 << eLen) - 1;
      m = 0;
    } else if (e + bias < 1) {
      m = value / Math.pow(2, (1 - bias));
      e = 1 - bias;
    } else {
      m = (value * c) - 1;
      e = e + bias;
    }
  }

  for (; mLen >= 8; buffer[i] = m & 0xff, i += k, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[i] = e & 0xff, i += k, e /= 256, eLen -= 8) {}

  buffer[i - k] |= s * 128;
};

},{}]
},{},[1]))
});