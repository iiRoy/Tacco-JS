let activeCallFrame = null;
let exceptionHandlerDepth = 0;
let lastJavaScriptErrorInstance = null;

// Polyfills for Typed Arrays, ensuring they default to standard Arrays if undefined
globalThis.Int8Array = globalThis.Int8Array || Array;
globalThis.Int16Array = globalThis.Int16Array || Array;
globalThis.Int32Array = globalThis.Int32Array || Array;
globalThis.Uint8Array = globalThis.Uint8Array || Array;
globalThis.Uint16Array = globalThis.Uint16Array || Array;
globalThis.Uint32Array = globalThis.Uint32Array || Array;
globalThis.Float32Array = globalThis.Float32Array || Array;
globalThis.Float64Array = globalThis.Float64Array || Array;

// Nim Type Information (NTI) descriptors
// These objects describe the structure and behavior of Nim types for cloning and runtime operations.
// The 'kind' property often refers to a specific Nim type category (e.g., 17 for object, 24 for sequence).
const nimTypeInfo_3648 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_3650 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_37154 = { size: 0, kind: 24, base: null, node: null, finalizer: null };
const nimTypeInfo_3640 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_3644 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_3660 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_104 = { size: 0, kind: 31, base: null, node: null, finalizer: null }; // Represents an integer type
const nimTypeInfo_14009 = { size: 0, kind: 18, base: null, node: null, finalizer: null }; // Represents a tuple or record
const nimTypeInfo_3608 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_3711 = { size: 0, kind: 22, base: null, node: null, finalizer: null };
const nimTypeInfo_140 = { size: 0, kind: 29, base: null, node: null, finalizer: null }; // Represents a string type
const nimTypeInfo_3706 = { size: 0, kind: 22, base: null, node: null, finalizer: null };
const nimTypeInfo_3626 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_3656 = { size: 0, kind: 17, base: null, node: null, finalizer: null };
const nimTypeInfo_138 = { size: 0, kind: 28, base: null, node: null, finalizer: null }; // Represents a Nim string (sequence of chars)
const nimTypeInfo_37199 = { size: 0, kind: 24, base: null, node: null, finalizer: null }; // Represents a Nim sequence

// Establish base types for inheritance
nimTypeInfo_37199.base = nimTypeInfo_138;

// Nim Type Node (NNI) descriptors - define the fields within complex types.
// 'sons' describes child fields, their offsets, types, and names.
const nimTypeNode_3656 = { kind: 2, len: 0, offset: 0, typ: null, name: null, sons: [] };
nimTypeInfo_3656.node = nimTypeNode_3656; // Link node to its type info

nimTypeInfo_3706.base = nimTypeInfo_3626;
nimTypeInfo_3711.base = nimTypeInfo_3626;

const nimTypeNode_3626 = {
  kind: 2, len: 5, offset: 0, typ: null, name: null,
  sons: [
    { kind: 1, offset: "parent", len: 0, typ: nimTypeInfo_3706, name: "parent", sons: null },
    { kind: 1, offset: "name", len: 0, typ: nimTypeInfo_140, name: "name", sons: null },
    { kind: 1, offset: "message", len: 0, typ: nimTypeInfo_138, name: "msg", sons: null },
    { kind: 1, offset: "trace", len: 0, typ: nimTypeInfo_138, name: "trace", sons: null },
    { kind: 1, offset: "up", len: 0, typ: nimTypeInfo_3711, name: "up", sons: null }
  ]
};
nimTypeInfo_3626.node = nimTypeNode_3626;

const nimTypeNode_3608 = { kind: 2, len: 0, offset: 0, typ: null, name: null, sons: [] };
nimTypeInfo_3608.node = nimTypeNode_3608;

nimTypeInfo_3626.base = nimTypeInfo_3608;
nimTypeInfo_3656.base = nimTypeInfo_3626;

const nimTypeNode_14009 = {
  kind: 2, len: 2, offset: 0, typ: null, name: null,
  sons: [
    { kind: 1, offset: "Field0", len: 0, typ: nimTypeInfo_140, name: "Field0", sons: null },
    { kind: 1, offset: "Field1", len: 0, typ: nimTypeInfo_104, name: "Field1", sons: null }
  ]
};
nimTypeInfo_14009.node = nimTypeNode_14009;

const nimTypeNode_3660 = { kind: 2, len: 0, offset: 0, typ: null, name: null, sons: [] };
nimTypeInfo_3660.node = nimTypeNode_3660;
nimTypeInfo_3660.base = nimTypeInfo_3626;

const nimTypeNode_3644 = { kind: 2, len: 0, offset: 0, typ: null, name: null, sons: [] };
nimTypeInfo_3644.node = nimTypeNode_3644;

const nimTypeNode_3640 = { kind: 2, len: 0, offset: 0, typ: null, name: null, sons: [] };
nimTypeInfo_3640.node = nimTypeNode_3640;
nimTypeInfo_3640.base = nimTypeInfo_3626;
nimTypeInfo_3644.base = nimTypeInfo_3640;

nimTypeInfo_37154.base = nimTypeInfo_138;

const nimTypeNode_3650 = { kind: 2, len: 0, offset: 0, typ: null, name: null, sons: [] };
nimTypeInfo_3650.node = nimTypeNode_3650;
nimTypeInfo_3650.base = nimTypeInfo_3626;

const nimTypeNode_3648 = { kind: 2, len: 0, offset: 0, typ: null, name: null, sons: [] };

/**
 * Creates a lookup set (object) from a list of numbers or number ranges.
 * @param {Array<number|Array<number>>} args - Numbers or [start, end] ranges to include in the set.
 * @returns {object} A dictionary where keys are numbers and values are true.
 */
function buildNumberLookupSet(...args) {
  const numSet = {};
  for (let i = 0; i < args.length; ++i) {
    const item = args[i];
    if (typeof item === "object" && item !== null && item.length === 2) {
      for (let r = item[0]; r <= item[1]; ++r) {
        numSet[r] = true;
      }
    } else {
      numSet[item] = true;
    }
  }
  return numSet;
}
nimTypeInfo_3648.node = nimTypeNode_3648;
nimTypeInfo_3648.base = nimTypeInfo_3626;

// Predefined sets for various purposes (e.g., character codes, type kinds)
const kindSetForFatPointers = buildNumberLookupSet(17, 16, 4, 18, 27, 19, 23, 22, 21);

/**
 * Performs a deep clone of a Nim object based on its type information.
 * This function handles various Nim type kinds, including objects, sequences, and basic types.
 * @param {any} targetObject - The object to copy into (can be null/undefined for new creation).
 * @param {any} sourceObject - The object to copy from.
 * @param {object} typeInfo - The Nim type information descriptor (NTI).
 * @returns {any} The cloned object.
 */
function nimDeepClone(targetObject, sourceObject, typeInfo) {
  let result = null;

  // If the source is null/undefined, there's nothing to clone, return null.
  if (sourceObject == null) {
    return null;
  }

  switch (typeInfo.kind) {
    case 21: // Ref
    case 22: // Ptr
    case 23: // String (but Nim's string is usually 28/138 for seq[char])
    case 5: // Array (fixed size)
      result = isTypeFatPointer(typeInfo) ? [sourceObject[0], sourceObject[1]] : sourceObject;
      break;
    case 19: // Table / Object (Nim's `object` type with fields)
      if (targetObject == null) {
        targetObject = {};
      } else {
        // Clear existing properties in targetObject for a clean copy
        Object.keys(targetObject).forEach(key => delete targetObject[key]);
      }
      // Copy properties from sourceObject to targetObject
      for (const prop in sourceObject) {
        targetObject[prop] = sourceObject[prop];
      }
      result = targetObject;
      break;
    case 18: // Tuple / Record
    case 17: // Object (Nim's `object` type with inheritance)
      if (typeInfo.base != null) {
        result = nimDeepClone(targetObject, sourceObject, typeInfo.base);
      } else if (typeInfo.kind === 17) {
        result = targetObject == null ? { m_type: typeInfo } : targetObject;
      } else {
        result = targetObject == null ? {} : targetObject;
      }
      nimDeepCloneRecursiveHelper(result, sourceObject, typeInfo.node);
      break;
    case 24: // Sequence (dynamic array)
    case 4: // Set
    case 27: // Range
    case 16: // Array (fixed size, potentially different handling than case 5)
      if (sourceObject === null) {
        result = null;
      } else {
        const sourceLength = sourceObject.length;
        if (!Array.isArray(targetObject)) {
          targetObject = new Array(sourceLength);
        } else {
          targetObject.length = sourceLength;
        }
        result = targetObject;
        for (let i = 0; i < sourceLength; ++i) {
          result[i] = nimDeepClone(result[i], sourceObject[i], typeInfo.base);
        }
      }
      break;
    case 28: // Nim string (sequence of characters)
      result = sourceObject !== null ? sourceObject.slice(0) : null;
      break;
    default:
      // For primitive types or unsupported kinds, just assign the value directly.
      result = sourceObject;
  }
  return result;
}

/**
 * Converts a JavaScript string literal into a Nim string representation (array of char codes, null-terminated).
 * @param {string} jsString - The JavaScript string.
 * @returns {Array<number>} The Nim string.
 */
function createNimStringLiteral(jsString) {
  const length = jsString.length;
  const nimString = new Array(length + 1);
  for (let i = 0; i < length; ++i) {
    nimString[i] = jsString.charCodeAt(i);
  }
  nimString[length] = 0; // Null-terminator
  return nimString;
}

/**
 * Compares two Nim string representations for equality.
 * @param {Array<number>} str1 - The first Nim string.
 * @param {Array<number>} str2 - The second Nim string.
 * @returns {boolean} True if the strings are identical, false otherwise.
 */
function compareNimStrings(str1, str2) {
  if (str1 === str2) {
    return true;
  }
  if (!str1 || !str2) {
    return false;
  }
  const len1 = str1.length;
  if (len1 !== str2.length) {
    return false;
  }
  for (let i = 0; i < len1; ++i) {
    if (str1[i] !== str2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Allocates a Nim-style array and fills it with deep copies of an initial element.
 * @param {number} size - The desired length of the array.
 * @param {any} initialElement - The element to fill the array with.
 * @param {object} elementTypeInfo - The Nim type information for the elements.
 * @returns {Array<any>} The newly created and filled Nim array.
 */
function allocateAndFillNimArray(size, initialElement, elementTypeInfo) {
  const newArray = new Array(size);
  for (let i = 0; i < size; ++i) {
    newArray[i] = nimDeepClone(null, initialElement, elementTypeInfo);
  }
  return newArray;
}

/**
 * Converts a JavaScript string (UTF-16) to a Nim string (UTF-8 encoded array of char codes, null-terminated).
 * @param {string} jsString - The input JavaScript string.
 * @returns {Array<number>} The Nim string representation.
 */
function convertJsStringToNimString(jsString) {
  const jsLength = jsString.length;
  const nimCharCodes = new Array(jsLength * 4 + 1); // Max possible length for UTF-8 (4 bytes per char) + null terminator
  let nimIndex = 0;

  for (let jsIndex = 0; jsIndex < jsLength; ++jsIndex) {
    let charCode = jsString.charCodeAt(jsIndex);

    if (charCode < 0x80) { // 1-byte sequence (0-127)
      nimCharCodes[nimIndex++] = charCode;
    } else if (charCode < 0x800) { // 2-byte sequence (128-2047)
      nimCharCodes[nimIndex++] = (charCode >> 6) | 0xC0;
      nimCharCodes[nimIndex++] = (charCode & 0x3F) | 0x80;
    } else if (charCode < 0xD800 || charCode >= 0xE000) { // 3-byte sequence (2048-55295, 57344-65535)
      nimCharCodes[nimIndex++] = (charCode >> 12) | 0xE0;
      nimCharCodes[nimIndex++] = ((charCode >> 6) & 0x3F) | 0x80;
      nimCharCodes[nimIndex++] = (charCode & 0x3F) | 0x80;
    } else { // 4-byte sequence (surrogate pair)
      // High surrogate: 0xD800 to 0xDBFF
      // Low surrogate:  0xDC00 to 0xDFFF
      if (jsIndex + 1 < jsLength) {
        const lowSurrogate = jsString.charCodeAt(++jsIndex);
        if (charCode >= 0xD800 && charCode <= 0xDBFF && lowSurrogate >= 0xDC00 && lowSurrogate <= 0xDFFF) {
          // Combine surrogate pair to get the actual Unicode code point
          charCode = 0x10000 + ((charCode & 0x3FF) << 10) + (lowSurrogate & 0x3FF);

          nimCharCodes[nimIndex++] = (charCode >> 18) | 0xF0;
          nimCharCodes[nimIndex++] = ((charCode >> 12) & 0x3F) | 0x80;
          nimCharCodes[nimIndex++] = ((charCode >> 6) & 0x3F) | 0x80;
          nimCharCodes[nimIndex++] = (charCode & 0x3F) | 0x80;
        } else {
          // Malformed surrogate pair, treat as replacement character or handle error
          nimCharCodes[nimIndex++] = 0xEF; // U+FFFD (Replacement Character)
          nimCharCodes[nimIndex++] = 0xBF;
          nimCharCodes[nimIndex++] = 0xBD;
        }
      } else {
        // Unpaired high surrogate at end of string
        nimCharCodes[nimIndex++] = 0xEF; // U+FFFD (Replacement Character)
        nimCharCodes[nimIndex++] = 0xBF;
        nimCharCodes[nimIndex++] = 0xBD;
      }
    }
  }

  nimCharCodes[nimIndex] = 0; // Null-terminator
  nimCharCodes.length = nimIndex + 1; // Trim the array to actual size
  return nimCharCodes;
}

/**
 * Converts a Nim string (array of char codes, null-terminated) back to a JavaScript string.
 * This function specifically handles UTF-8 decoding.
 * @param {Array<number>} nimString - The Nim string representation.
 * @returns {string} The decoded JavaScript string.
 */
function convertNimStringToJsonString(nimString) {
  if (!nimString || nimString.length === 0) {
    return "";
  }

  // Remove the null terminator from the effective length
  const effectiveLength = nimString.length - 1;
  if (effectiveLength === 0) {
    return "";
  }

  // Optimize for ASCII-only strings first
  let allAscii = true;
  for (let i = 0; i < effectiveLength; i++) {
    if (nimString[i] >= 128) {
      allAscii = false;
      break;
    }
  }

  if (allAscii) {
    return String.fromCharCode(...nimString.slice(0, effectiveLength));
  }

  // Fallback to decodeURIComponent for non-ASCII strings
  // This approach is generally safe and handles various encodings if treated as percent-encoded UTF-8.
  let encodedParts = [];
  for (let i = 0; i < effectiveLength; ++i) {
    const byte = nimString[i];
    // Convert byte to hex, then percent-encode it
    const hex = byte.toString(16).padStart(2, '0');
    encodedParts.push(`%${hex}`);
  }

  try {
    return decodeURIComponent(encodedParts.join(''));
  } catch (e) {
    // Fallback for malformed UTF-8, though decodeURIComponent is robust.
    // This part is rarely hit in practice if input was valid UTF-8.
    return encodedParts.map(part => String.fromCharCode(parseInt(part.substring(1), 16))).join('');
  }
}


/**
 * Dispatches a Nim exception. Sets the exception's name and trace, then throws it.
 * If no exception handler is active, it calls the unhandled exception routine.
 * @param {object} exceptionObject - The Nim exception object.
 * @param {string} exceptionName - The descriptive name for the exception (e.g., "IndexError").
 * @throws The exceptionObject.
 */
function dispatchNimException(exceptionObject, exceptionName) {
  exceptionObject.name = exceptionName;
  if (exceptionHandlerDepth === 0) {
    handleUncaughtNimException(exceptionObject);
  }
  exceptionObject.trace = nimDeepClone(null, getCurrentNimStackTrace(), nimTypeInfo_138);
  throw exceptionObject;
}

/**
 * Checks if an array index is within valid bounds. Throws an IndexError if not.
 * @param {number} index - The index to check.
 * @param {number} lowerBound - The minimum valid index (inclusive).
 * @param {number} upperBound - The maximum valid index (inclusive).
 * @returns {number} The validated index.
 * @throws {object} Nim IndexError.
 */
function validateArrayIndex(index, lowerBound, upperBound) {
  if (index < lowerBound || index > upperBound) {
    throwNimIndexError();
  }
  return index;
}

/**
 * Checks if a value is within a specified range. Throws a RangeError if not.
 * @param {number} value - The value to check.
 * @param {number} lowerBound - The minimum valid value (inclusive).
 * @param {number} upperBound - The maximum valid value (inclusive).
 * @returns {number} The validated value.
 * @throws {object} Nim RangeError.
 */
function validateValueRange(value, lowerBound, upperBound) {
  if (value < lowerBound || value > upperBound) {
    throwNimRangeError();
  }
  return value;
}

/**
 * Safely adds two integers, checking for 32-bit integer overflow/underflow.
 * @param {number} intA - The first integer.
 * @param {number} intB - The second integer.
 * @returns {number} The sum.
 * @throws {object} Nim OverflowError.
 */
function safeAddInt(intA, intB) {
  const sum = intA + intB;
  const MAX_INT32 = 2147483647;
  const MIN_INT32 = -2147483648;
  if (sum > MAX_INT32 || sum < MIN_INT32) {
    throwNimOverflowError();
  }
  return sum;
}

/**
 * Safely subtracts two integers, checking for 32-bit integer overflow/underflow.
 * @param {number} intA - The first integer.
 * @param {number} intB - The second integer.
 * @returns {number} The difference.
 * @throws {object} Nim OverflowError.
 */
function safeSubtractInt(intA, intB) {
  const difference = intA - intB;
  const MAX_INT32 = 2147483647;
  const MIN_INT32 = -2147483648;
  if (difference > MAX_INT32 || difference < MIN_INT32) {
    throwNimOverflowError();
  }
  return difference;
}

/**
 * Safely multiplies two integers, checking for 32-bit integer overflow/underflow.
 * @param {number} intA - The first integer.
 * @param {number} intB - The second integer.
 * @returns {number} The product.
 * @throws {object} Nim OverflowError.
 */
function safeMultiplyInt(intA, intB) {
  const product = intA * intB;
  const MAX_INT32 = 2147483647;
  const MIN_INT32 = -2147483648;
  if (product > MAX_INT32 || product < MIN_INT32) {
    throwNimOverflowError();
  }
  return product;
}

/**
 * Prints Nim string arguments to the console, converting them to JavaScript strings first.
 * Similar to Nim's `echo` procedure.
 * @param {...Array<number>} nimStrings - Nim string arguments to print.
 */
function nimPrintLine(...nimStrings) {
  const output = nimStrings.map(convertNimStringToJsonString).join('');
  console.log(output);
}

// Global runtime state variables
let isNimRuntimeInitialized = false; // Not explicitly used in this snippet, but often present
process.exitCode = 0; // Standard exit code for success
const globalExceptionCallback = [null]; // Placeholder for global exception hook
const localExceptionCallback = [null]; // Placeholder for local exception hook
const outOfMemoryCallback = [null]; // Placeholder for out-of-memory hook

/**
 * Determines if a Nim type represents a "fat pointer" (e.g., string, sequence, array).
 * Fat pointers typically contain both a pointer and a length/capacity.
 * @param {object} typeInfo - The Nim type information descriptor (NTI).
 * @returns {boolean} True if the type is a fat pointer, false otherwise.
 */
function isTypeFatPointer(typeInfo) {
  // Check if the base type's kind is present in the `kindSetForFatPointers`
  return !(typeInfo.base && kindSetForFatPointers[typeInfo.base.kind]);
}

/**
 * Recursive helper for `nimDeepClone` to copy fields defined by a type node.
 * @param {object} targetObject - The object being built (destination).
 * @param {object} sourceObject - The object being copied from.
 * @param {object} typeNode - The Nim type node (NNI) describing the fields.
 */
function nimDeepCloneRecursiveHelper(targetObject, sourceObject, typeNode) {
  if (!typeNode) {
    return;
  }

  switch (typeNode.kind) {
    case 0: // No fields to copy
      break;
    case 1: // Simple field copy
      targetObject[typeNode.offset] = nimDeepClone(targetObject[typeNode.offset], sourceObject[typeNode.offset], typeNode.typ);
      break;
    case 2: // Multiple fields (array of field descriptors)
      const fieldCount = typeNode.len;
      for (let i = 0; i < fieldCount; ++i) {
        nimDeepCloneRecursiveHelper(targetObject, sourceObject, typeNode.sons[i]);
      }
      break;
    case 3: // Field with sub-fields (e.g., variant part of an object)
      targetObject[typeNode.offset] = nimDeepClone(targetObject[typeNode.offset], sourceObject[typeNode.offset], typeNode.typ);
      for (let i = 0; i < typeNode.sons.length; ++i) {
        nimDeepCloneRecursiveHelper(targetObject, sourceObject, typeNode.sons[i][1]);
      }
      break;
  }
}

/**
 * Splits a Nim string by a single character delimiter.
 * @param {Array<number>} nimString - The Nim string to split.
 * @param {number} delimiterChar - The character code of the delimiter.
 * @param {number} maxSplits - The maximum number of splits to perform (-1 for all).
 * @returns {Array<Array<number>>} An array of Nim strings (sub-strings).
 */
function nimStringSplitByChar(nimString, delimiterChar, maxSplits) {
  let resultSegments = nimDeepClone(null, [], nimTypeInfo_37199);
  let currentIndex = 0;
  const nimStringLength = nimString ? nimString.length - 1 : 0; // Exclude null terminator
  let remainingSplits = maxSplits;

  while (currentIndex <= nimStringLength) {
    let segmentStart = currentIndex;
    let segmentEnd = currentIndex;

    // Find the end of the current segment or the delimiter
    while (segmentEnd < nimStringLength && nimString[segmentEnd] !== delimiterChar) {
      segmentEnd++;
    }

    if (remainingSplits === 0) {
      // If maxSplits is 0, the rest of the string is one segment
      segmentEnd = nimStringLength;
    }

    // Extract the segment
    const currentSegment = nimDeepClone(null, nimString.slice(segmentStart, segmentEnd).concat(0), nimTypeInfo_138);
    if (resultSegments) {
      resultSegments.push(currentSegment);
    } else {
      resultSegments = [currentSegment]; // Initialize if it was null
    }

    if (remainingSplits === 0) {
      break; // Stop splitting after maxSplits segments
    }
    if (remainingSplits > 0) {
      remainingSplits--;
    }

    currentIndex = segmentEnd + 1; // Move past the delimiter
  }
  return resultSegments;
}

/**
 * Appends a JavaScript string to a Nim string buffer (represented by an array wrapper).
 * @param {Array<Array<number>>} nimStringBuffer - A single-element array containing the Nim string to modify.
 * @param {number} _unused - An unused argument (historical Nim compiler artifact).
 * @param {string} jsStringToAppend - The JavaScript string to append.
 */
function appendToStringBuffer(nimStringBuffer, _unused, jsStringToAppend) {
  const nimString = nimStringBuffer[0];
  let currentNimLength = nimString.length - 1; // Exclude null terminator
  for (let i = 0; i < jsStringToAppend.length; ++i) {
    nimString[currentNimLength++] = jsStringToAppend.charCodeAt(i);
  }
  nimString[currentNimLength] = 0; // Re-add null terminator
  nimString.length = currentNimLength + 1; // Adjust array length
}

const MAX_STACK_FRAMES_TO_SHOW = 64;

/**
 * Generates formatted stack trace lines from a Nim call frame chain.
 * @param {object} currentFrame - The current Nim call frame object.
 * @returns {Array<number>} A Nim string containing the formatted stack trace.
 */
function generateStackTraceLines(currentFrame) {
  const stringBuffer = [createNimStringLiteral("")];
  let frameWalker = currentFrame;
  let frameCount = 0;
  let totalFrames = 0;

  // Use a temporary array to store frame information for reverse order printing
  const frameDetails = allocateAndFillNimArray(MAX_STACK_FRAMES_TO_SHOW, { Field0: null, Field1: 0 }, nimTypeInfo_14009);

  // Traverse the stack frames, storing info and counting total frames
  while (frameWalker != null && frameCount < MAX_STACK_FRAMES_TO_SHOW) {
    frameDetails[frameCount].Field0 = frameWalker.procname;
    frameDetails[frameCount].Field1 = frameWalker.line;
    frameCount++;
    totalFrames++;
    frameWalker = frameWalker.prev;
  }

  // Count remaining frames if more than MAX_STACK_FRAMES_TO_SHOW
  while (frameWalker != null) {
    totalFrames++;
    frameWalker = frameWalker.prev;
  }

  // Add "calls omitted" message if stack is truncated
  if (totalFrames > frameCount) {
    const omittedCount = totalFrames - frameCount;
    appendToStringBuffer(stringBuffer, 0, `(${omittedCount} calls omitted) ...\n`);
  }

  // Print frames in reverse order (most recent first)
  for (let i = frameCount - 1; i >= 0; --i) {
    const frame = frameDetails[i];
    appendToStringBuffer(stringBuffer, 0, frame.Field0);
    if (frame.Field1 > 0) {
      appendToStringBuffer(stringBuffer, 0, `, line: ${frame.Field1}`);
    }
    appendToStringBuffer(stringBuffer, 0, "\n");
  }
  return stringBuffer[0];
}

/**
 * Retrieves the formatted Nim stack trace from the current `activeCallFrame`.
 * @returns {Array<number>} A Nim string containing the stack trace.
 */
function getCurrentNimStackTrace() {
  const header = createNimStringLiteral("Traceback (most recent call last)\n");
  if (activeCallFrame != null) {
    const traceLines = generateStackTraceLines(activeCallFrame);
    // Concatenate header and trace lines
    const combinedTrace = header.slice(0, header.length - 1).concat(traceLines);
    combinedTrace.length = header.length + traceLines.length - 1; // Adjust length and ensure single null terminator
    return combinedTrace;
  } else {
    return createNimStringLiteral("No stack traceback available\n");
  }
}

/**
 * Handles an unhandled Nim exception, formats an error message, and throws a JavaScript Error.
 * @param {object} exceptionObject - The unhandled Nim exception.
 * @throws {Error|string} A JavaScript Error object or string message.
 */
function handleUncaughtNimException(exceptionObject) {
  const errorOutputBuffer = [createNimStringLiteral("")];

  let errorMessage = createNimStringLiteral("Error: unhandled exception");
  if (exceptionObject.message && exceptionObject.message.length > 1) { // Check for non-empty Nim string
    errorMessage = createNimStringLiteral("Error: unhandled exception: ");
    errorMessage = errorMessage.slice(0, errorMessage.length - 1).concat(exceptionObject.message);
    errorMessage.length = errorMessage.length + exceptionObject.message.length - 1; // Fix length
  }

  appendToStringBuffer(errorOutputBuffer, 0, convertNimStringToJsonString(errorMessage));
  appendToStringBuffer(errorOutputBuffer, 0, " [");
  appendToStringBuffer(errorOutputBuffer, 0, convertNimStringToJsonString(exceptionObject.name));
  appendToStringBuffer(errorOutputBuffer, 0, "]\n");

  const stackTrace = getCurrentNimStackTrace();
  appendToStringBuffer(errorOutputBuffer, 0, convertNimStringToJsonString(stackTrace));

  const jsErrorMessage = convertNimStringToJsonString(errorOutputBuffer[0]);
  activeCallFrame = null; // Clear stack frame on unhandled exception

  // Throw a native JavaScript Error for better debugging experience
  if (typeof Error !== "undefined") {
    throw new Error(jsErrorMessage);
  } else {
    throw jsErrorMessage;
  }
}

/**
 * Throws a Nim IndexError.
 */
function throwNimIndexError() {
  const errorInstance = {
    m_type: nimTypeInfo_3656,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  };
  errorInstance.message = nimDeepClone(null, createNimStringLiteral("index out of bounds"), nimTypeInfo_138);
  errorInstance.parent = null;
  dispatchNimException(errorInstance, "IndexError");
}

/**
 * Throws a Nim RangeError.
 */
function throwNimRangeError() {
  const errorInstance = {
    m_type: nimTypeInfo_3660,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  };
  errorInstance.message = nimDeepClone(null, createNimStringLiteral("value out of range"), nimTypeInfo_138);
  errorInstance.parent = null;
  dispatchNimException(errorInstance, "RangeError");
}

/**
 * Throws a Nim OverflowError.
 */
function throwNimOverflowError() {
  const errorInstance = {
    m_type: nimTypeInfo_3644,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  };
  errorInstance.message = nimDeepClone(null, createNimStringLiteral("over- or underflow"), nimTypeInfo_138);
  errorInstance.parent = null;
  dispatchNimException(errorInstance, "OverflowError");
}

/**
 * Applies a mapping function to each element of a Nim sequence (array).
 * @param {Array<any>} inputSequence - The input Nim sequence.
 * @param {function} mapFunction - The function to apply to each element.
 * @returns {Array<any>} A new Nim sequence containing the mapped results.
 */
function nimSeqTransform(inputSequence, mapFunction) {
  const currentFrame = { procname: "nimSeqTransform", prev: activeCallFrame, filename: "lib/pure/collections/sequtils.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 217;
  const inputLength = inputSequence ? inputSequence.length : 0;
  const validatedLength = validateValueRange(inputLength, 0, 2147483647);
  const resultSequence = new Array(validatedLength);
  for (let i = 0; i < validatedLength; ++i) {
    resultSequence[i] = 0; // Initialize with default value
  }

  currentFrame.line = 218;
  for (let i = 0; i < inputLength; ++i) {
    currentFrame.line = 219;
    const validatedIndex = validateArrayIndex(i, 0, inputLength - 1);
    resultSequence[validatedIndex] = mapFunction(inputSequence[validatedIndex]);
  }

  activeCallFrame = currentFrame.prev;
  return resultSequence;
}

/**
 * Splits a Nim string by any character present in a given character set.
 * @param {Array<number>} nimString - The Nim string to split.
 * @param {object} charSet - A lookup set (object) where keys are character codes to split by.
 * @param {number} maxSplits - The maximum number of splits to perform (-1 for all).
 * @returns {Array<Array<number>>} An array of Nim strings (sub-strings).
 */
function nimStringSplitByCharSet(nimString, charSet, maxSplits) {
  let resultSegments = nimDeepClone(null, [], nimTypeInfo_37154);
  let currentIndex = 0;
  const nimStringLength = nimString ? nimString.length - 1 : 0; // Exclude null terminator
  let remainingSplits = maxSplits;

  while (currentIndex <= nimStringLength) {
    let segmentStart = currentIndex;
    let segmentEnd = currentIndex;

    // Find the end of the current segment or a character from the set
    while (segmentEnd < nimStringLength && charSet[nimString[segmentEnd]] === undefined) {
      segmentEnd++;
    }

    if (remainingSplits === 0) {
      // If maxSplits is 0, the rest of the string is one segment
      segmentEnd = nimStringLength;
    }

    // Extract the segment
    const currentSegment = nimDeepClone(null, nimString.slice(segmentStart, segmentEnd).concat(0), nimTypeInfo_138);
    if (resultSegments) {
      resultSegments.push(currentSegment);
    } else {
      resultSegments = [currentSegment]; // Initialize if it was null
    }

    if (remainingSplits === 0) {
      break; // Stop splitting after maxSplits segments
    }
    if (remainingSplits > 0) {
      remainingSplits--;
    }

    currentIndex = segmentEnd + 1; // Move past the delimiter
  }
  return resultSegments;
}

// Character sets for parsing integers
const CharSet_DigitsAndSigns = buildNumberLookupSet(32, 9, 11, 13, 10, 12); // Whitespace for split
const CharSet_Digits = buildNumberLookupSet([48, 57]); // '0'-'9'
const CharSet_Digits_Or_Underscore = buildNumberLookupSet([48, 57], 95); // '0'-'9' or '_'

/**
 * Internal function to parse an integer from a Nim string.
 * @param {Array<number>} nimString - The Nim string to parse.
 * @param {Array<number>} outputValueWrapper - A single-element array to store the parsed integer.
 * @param {number} outputIndex - The index within outputValueWrapper to store the result (usually 0).
 * @param {number} startIndex - The starting index in nimString to begin parsing.
 * @returns {number} The number of characters successfully parsed.
 */
function parseIntegerInternal(nimString, outputValueWrapper, outputIndex, startIndex) {
  const currentFrame = { procname: "parseutils.parseIntegerInternal", prev: activeCallFrame, filename: "lib/pure/parseutils.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 232;
  let parsedCharCount = 0;
  currentFrame.line = 233;
  let signMultiplier = -1; // Default to negative if no sign, as per Nim's internal logic for negative accumulation
  currentFrame.line = 234;
  let currentStringIndex = startIndex;

  // Handle optional sign
  const firstChar = nimString[validateArrayIndex(currentStringIndex, 0, nimString.length - 1)];
  if (firstChar === 43) { // '+'
    currentFrame.line = 234;
    currentStringIndex = safeAddInt(currentStringIndex, 1);
    signMultiplier = 1; // Positive
  } else if (firstChar === 45) { // '-'
    currentFrame.line = 236;
    currentStringIndex = safeAddInt(currentStringIndex, 1);
    currentFrame.line = 237;
    signMultiplier = -1; // Explicitly negative
  } else {
    signMultiplier = 1; // No sign, assume positive
  }

  // Check if the next character is a digit
  const charAfterSign = nimString[validateArrayIndex(currentStringIndex, 0, nimString.length - 1)];
  if (CharSet_Digits[charAfterSign]) {
    currentFrame.line = 239;
    outputValueWrapper[outputIndex] = 0; // Initialize parsed value

    currentFrame.line = 240;
    // Parse digits
    while (CharSet_Digits_Or_Underscore[nimString[validateArrayIndex(currentStringIndex, 0, nimString.length - 1)]]) {
      const currentCharCode = nimString[validateArrayIndex(currentStringIndex, 0, nimString.length - 1)];
      currentFrame.line = 241;
      if (currentCharCode === 95) { // '_' character, skip
        currentStringIndex = safeAddInt(currentStringIndex, 1);
        continue;
      }

      // Accumulate value: result = result * 10 - (digit - '0')
      // Nim's internal parsing often accumulates negatively to handle MIN_INT overflow.
      const digitValue = safeSubtractInt(currentCharCode, 48); // '0' is 48
      outputValueWrapper[outputIndex] = safeSubtractInt(safeMultiplyInt(outputValueWrapper[outputIndex], 10), digitValue);

      currentFrame.line = 242;
      currentStringIndex = safeAddInt(currentStringIndex, 1);
    }
    currentFrame.line = 244;
    // Apply the sign multiplier (since we accumulated negatively for positive numbers too)
    outputValueWrapper[outputIndex] = safeMultiplyInt(outputValueWrapper[outputIndex], signMultiplier);
    currentFrame.line = 245;
    parsedCharCount = safeSubtractInt(currentStringIndex, startIndex);
  } else if (firstChar === 43 || firstChar === 45) { // Only a sign, no digits
      parsedCharCount = safeSubtractInt(currentStringIndex, startIndex); // Count only the sign
  } else {
      parsedCharCount = 0; // No sign, no digits, nothing parsed
  }

  activeCallFrame = currentFrame.prev;
  return parsedCharCount;
}

/**
 * Parses the biggest possible integer from a Nim string.
 * This is an intermediate step in Nim's integer parsing chain.
 * @param {Array<number>} nimString - The Nim string to parse.
 * @param {Array<number>} outputValueWrapper - A single-element array to store the parsed integer.
 * @param {number} outputIndex - The index within outputValueWrapper to store the result.
 * @param {number} startIndex - The starting index in nimString.
 * @returns {number} The number of characters successfully parsed.
 */
function parseBiggestIntegerNim(nimString, outputValueWrapper, outputIndex, startIndex) {
  const currentFrame = { procname: "parseutils.parseBiggestIntegerNim", prev: activeCallFrame, filename: "lib/pure/parseutils.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 253;
  const tempValueArray = [0]; // Use a temporary array for internal parsing
  currentFrame.line = 256;
  const parsedCount = parseIntegerInternal(nimString, tempValueArray, 0, startIndex);
  currentFrame.line = 257;
  outputValueWrapper[outputIndex] = tempValueArray[0]; // Transfer result
  activeCallFrame = currentFrame.prev;
  return parsedCount;
}

/**
 * Parses a 32-bit integer from a Nim string, with overflow checks.
 * @param {Array<number>} nimString - The Nim string to parse.
 * @param {Array<number>} outputValueWrapper - A single-element array to store the parsed integer.
 * @param {number} outputIndex - The index within outputValueWrapper to store the result.
 * @param {number} startIndex - The starting index in nimString.
 * @returns {number} The number of characters successfully parsed.
 */
function parseIntegerNim(nimString, outputValueWrapper, outputIndex, startIndex) {
  const currentFrame = { procname: "parseutils.parseIntegerNim", prev: activeCallFrame, filename: "lib/pure/parseutils.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 264;
  const tempValueArray = [0];
  currentFrame.line = 265;
  const parsedCount = parseBiggestIntegerNim(nimString, tempValueArray, 0, startIndex);

  const parsedInt = tempValueArray[0];
  const MAX_INT32 = 2147483647;
  const MIN_INT32 = -2147483648;

  if (parsedInt < MIN_INT32 || parsedInt > MAX_INT32) {
    currentFrame.line = 268;
    currentFrame.line = 2810;
    const errorInstance = {
      m_type: nimTypeInfo_3644,
      parent: null,
      name: null,
      message: null,
      trace: null,
      up: null
    };
    currentFrame.line = 2812;
    errorInstance.message = nimDeepClone(null, createNimStringLiteral("overflow during integer parsing"), nimTypeInfo_138);
    currentFrame.line = 2813;
    errorInstance.parent = null;
    dispatchNimException(errorInstance, "OverflowError");
  } else if (parsedCount !== 0) { // Only set output if something was actually parsed
    currentFrame.line = 270;
    outputValueWrapper[outputIndex] = validateValueRange(parsedInt, MIN_INT32, MAX_INT32);
  }

  activeCallFrame = currentFrame.prev;
  return parsedCount;
}

/**
 * Parses a Nim string into a 32-bit integer. Throws a ValueError if the entire string is not consumed or is empty.
 * @param {Array<number>} nimString - The Nim string to parse.
 * @returns {number} The parsed integer.
 * @throws {object} Nim ValueError.
 */
function parseNimIntegerStrict(nimString) {
  const outputValueArray = [0];
  const parsedLength = parseIntegerNim(nimString, outputValueArray, 0, 0);
  const nimStringLength = nimString ? nimString.length - 1 : 0;

  if (parsedLength !== nimStringLength || parsedLength === 0) {
    const errorInstance = {
      m_type: nimTypeInfo_3650,
      parent: null,
      name: null,
      message: null,
      trace: null,
      up: null
    };
    const errorMessage = createNimStringLiteral("invalid integer: ");
    const fullErrorMessage = errorMessage.slice(0, errorMessage.length - 1).concat(nimString);
    fullErrorMessage.length = errorMessage.length + nimString.length - 1; // Adjust length
    errorInstance.message = nimDeepClone(null, fullErrorMessage, nimTypeInfo_138);
    errorInstance.parent = null;
    dispatchNimException(errorInstance, "ValueError");
  }
  return outputValueArray[0];
}

/**
 * Raises a system fatal error (AssertionError).
 * @param {Array<number>} errorMessage - The Nim string message for the assertion.
 */
function systemFatalAssertion(errorMessage) {
  const currentFrame = { procname: "sysFatal.systemFatalAssertion", prev: activeCallFrame, filename: "lib/system.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 2830;
  const errorInstance = {
    m_type: nimTypeInfo_3648,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  };
  currentFrame.line = 2832;
  errorInstance.message = nimDeepClone(null, errorMessage, nimTypeInfo_138);
  currentFrame.line = 2833;
  dispatchNimException(errorInstance, "AssertionError");

  activeCallFrame = currentFrame.prev;
}

/**
 * Raises a Nim assertion failure.
 * @param {Array<number>} message - The Nim string message for the assertion.
 */
function raiseNimAssertion(message) {
  const currentFrame = { procname: "system.raiseNimAssertion", prev: activeCallFrame, filename: "lib/system.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 3771;
  systemFatalAssertion(message);

  activeCallFrame = currentFrame.prev;
}

/**
 * Processes a failed assertion, leading to a Nim assertion failure.
 * @param {Array<number>} assertionMessage - The Nim string message describing the failed assertion.
 */
function processFailedAssertion(assertionMessage) {
  const currentFrame = { procname: "system.processFailedAssertion", prev: activeCallFrame, filename: "lib/system.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 3778;
  raiseNimAssertion(assertionMessage);

  activeCallFrame = currentFrame.prev;
}

/**
 * The main application logic, processing input lines.
 * @param {Array<number>} rawInputString - The entire input as a single Nim string.
 */
function mainApplicationLogic(rawInputString) {
  const currentFrame = { procname: "aoj.mainApplicationLogic", prev: activeCallFrame, filename: "aoj.nim", line: 0 };
  activeCallFrame = currentFrame;

  currentFrame.line = 6;
  // Split the input string by newline characters
  const inputLines = nimStringSplitByChar(rawInputString, 10, -1); // 10 is char code for '\n'

  currentFrame.line = 7;
  let currentLineNimString = null;
  currentFrame.line = 3805;
  let lineIndex = 0;
  currentFrame.line = 3806;
  const totalLines = inputLines ? inputLines.length : 0;

  if (totalLines === 0) {
    // Handle empty input gracefully
    activeCallFrame = currentFrame.prev;
    return;
  }

  // Iterate over each line
  while (lineIndex < totalLines) {
    currentFrame.line = 3808;
    currentLineNimString = inputLines[validateArrayIndex(lineIndex, 0, inputLines.length - 1)];

    currentFrame.line = 9;
    // Split the current line by whitespace-like characters and parse each part as an integer
    const parsedIntegers = nimSeqTransform(
      nimStringSplitByCharSet(currentLineNimString, CharSet_DigitsAndSigns, -1),
      parseNimIntegerStrict
    );

    currentFrame.line = 10;
    const firstNum = parsedIntegers[validateArrayIndex(0, 0, parsedIntegers.length - 1)];
    currentFrame.line = 11;
    const secondNum = parsedIntegers[validateArrayIndex(1, 0, parsedIntegers.length - 1)];

    currentFrame.line = 12;
    // Calculate sum and print it
    const sumResult = safeAddInt(firstNum, secondNum);
    nimPrintLine(convertJsStringToNimString(sumResult.toString()));

    currentFrame.line = 3809;
    lineIndex = safeAddInt(lineIndex, 1);

    // Assertion to check if the sequence was modified during iteration (Nim runtime check)
    if ((inputLines ? inputLines.length : 0) !== totalLines) {
      currentFrame.line = 3810;
      processFailedAssertion(createNimStringLiteral("len(a) == L seq modified while iterating over it"));
    }
  }
  activeCallFrame = currentFrame.prev;
}

// Immediately-invoked function expression (IIFE) for application startup
(function () {
  "use strict";
  const inputBuffer = [];
  // Setup readline interface to capture standard input
  require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  }).on("line", function (lineData) {
    inputBuffer.push(lineData); // Store each line
  });

  // When standard input stream ends, process all collected lines
  process.stdin.on("end", function () {
    // Join all collected lines with newline characters and convert to Nim string
    const fullNimInput = createNimStringLiteral(inputBuffer.join("\n"));
    mainApplicationLogic(fullNimInput); // Call the main application logic
  });
})();