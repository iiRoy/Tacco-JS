function dispatchRuntimeError(errorTag, errorArgument) {
  throw [0, errorTag, errorArgument];
}

function dispatchStringError(errorTag, messageString) {
  dispatchRuntimeError(errorTag, new WrappedString(messageString));
}

function throwInvalidInput(messageText) {
  dispatchStringError(runtimeGlobals[4], messageText);
}

function throwIndexOutOfBounds() {
  throwInvalidInput("Array index out of bounds");
}

function stringReplicator(count, charToRepeat) {
  let resultBuffer = "";
  if (count <= 0) {
    return resultBuffer;
  }
  let currentCount = count;
  let currentString = charToRepeat;
  while (currentCount > 0) {
    if (currentCount % 2 === 1) {
      resultBuffer += currentString;
    }
    currentString += currentString;
    currentCount = Math.floor(currentCount / 2);
  }
  return resultBuffer;
}

function ByteSequence(initialValue) {
  if (initialValue !== null && initialValue !== undefined) {
    this.rawBytes = this.paddedBytes = initialValue;
    this.dataEndIndex = this.effectiveLength = initialValue.length;
  } else {
    this.rawBytes = null;
    this.paddedBytes = null;
    this.dataEndIndex = 0;
    this.effectiveLength = 0;
  }
}

ByteSequence.prototype = {
  jsStringRepresentation: null,
  rawBytes: null,
  paddedBytes: null,
  byteArr: null,
  effectiveLength: null,
  dataEndIndex: 0,

  toJsStringRepresentation: function() {
    if (this.jsStringRepresentation !== null) {
      return this.jsStringRepresentation;
    }
    const fullBytes = this.getCompleteBytes();
    this.jsStringRepresentation = decodeURIComponent(escape(fullBytes));
    return this.jsStringRepresentation;
  },

  materializeBytes: function() {
    let byteContent = "";
    if (this.jsStringRepresentation !== null) {
      byteContent = unescape(encodeURIComponent(this.jsStringRepresentation));
    } else if (this.byteArr !== null) {
      for (let i = 0; i < this.byteArr.length; i++) {
        byteContent += String.fromCharCode(this.byteArr[i]);
      }
    } else {
      // If neither string nor array form is available, and rawBytes is null,
      // it implies an empty string or uninitialized.
      // For now, we assume it's meant to be empty if no data.
      // This is a slight deviation but makes sense for initialization.
    }

    this.rawBytes = this.paddedBytes = byteContent;
    this.dataEndIndex = this.effectiveLength = byteContent.length;
    return byteContent;
  },

  getRawBytes: function() {
    if (this.rawBytes === null) {
      this.rawBytes = this.materializeBytes();
    }
    return this.rawBytes;
  },

  getCompleteBytes: function() {
    if (this.paddedBytes !== null) {
      return this.paddedBytes;
    }

    let currentBytes = this.rawBytes;
    if (currentBytes === null) {
      currentBytes = this.materializeBytes();
    }

    if (this.dataEndIndex < this.effectiveLength) {
      const paddingNeeded = this.effectiveLength - this.dataEndIndex;
      currentBytes += stringReplicator(paddingNeeded, '\0');
      this.rawBytes = currentBytes;
      this.dataEndIndex = this.effectiveLength;
    }
    this.paddedBytes = currentBytes;
    return currentBytes;
  },

  convertToArray: function() {
    if (this.byteArr !== null) {
      return this.byteArr;
    }

    const currentBytes = this.getRawBytes();
    const resultArr = new Array(this.effectiveLength);
    const actualDataLen = this.dataEndIndex;

    for (let i = 0; i < actualDataLen; i++) {
      resultArr[i] = currentBytes.charCodeAt(i);
    }
    for (let i = actualDataLen; i < this.effectiveLength; i++) {
      resultArr[i] = 0;
    }

    this.jsStringRepresentation = null;
    this.rawBytes = null;
    this.paddedBytes = null;
    this.dataEndIndex = this.effectiveLength;
    this.byteArr = resultArr;
    return resultArr;
  },

  getByteArray: function() {
    if (this.byteArr === null) {
      this.byteArr = this.convertToArray();
    }
    return this.byteArr;
  },

  getLength: function() {
    if (this.effectiveLength === null) {
      this.materializeBytes();
    }
    return this.effectiveLength;
  },

  toStringDefault: function() {
    return this.jsStringRepresentation || this.toJsStringRepresentation();
  },

  valueOfDefault: function() {
    return this.jsStringRepresentation || this.toJsStringRepresentation();
  },

  copyToBuffer: function(sourceOffset, targetArray, targetOffset, lengthToCopy) {
    const sourceArray = this.byteArr;

    if (sourceArray) {
      if (targetOffset <= sourceOffset) {
        for (let i = 0; i < lengthToCopy; i++) {
          targetArray[targetOffset + i] = sourceArray[sourceOffset + i];
        }
      } else {
        for (let i = lengthToCopy - 1; i >= 0; i--) {
          targetArray[targetOffset + i] = sourceArray[sourceOffset + i];
        }
      }
    } else {
      let currentBytes = this.rawBytes;
      if (currentBytes === null) {
        currentBytes = this.materializeBytes();
      }

      const bytesAvailable = this.dataEndIndex - sourceOffset;
      if (lengthToCopy <= bytesAvailable) {
        for (let i = 0; i < lengthToCopy; i++) {
          targetArray[targetOffset + i] = currentBytes.charCodeAt(sourceOffset + i);
        }
      } else {
        for (let i = 0; i < bytesAvailable; i++) {
          targetArray[targetOffset + i] = currentBytes.charCodeAt(sourceOffset + i);
        }
        for (let i = bytesAvailable; i < lengthToCopy; i++) {
          targetArray[targetOffset + i] = 0;
        }
      }
    }
  },

  getByteAt: function(index) {
    const currentArray = this.byteArr;
    if (currentArray) {
      return currentArray[index];
    }
    const currentBytes = this.getRawBytes();
    return (index < this.dataEndIndex) ? currentBytes.charCodeAt(index) : 0;
  },

  getByteAtChecked: function(index) {
    if (this.effectiveLength === null) {
      this.materializeBytes();
    }
    if (index < 0 || index >= this.effectiveLength) {
      throwIndexOutOfBounds();
    }
    return this.getByteAt(index);
  },

  setByteAt: function(index, charValue) {
    let currentArray = this.byteArr;
    const byteMask = 0xff;

    if (!currentArray) {
      if (this.dataEndIndex === index) {
        this.rawBytes += String.fromCharCode(charValue & byteMask);
        this.dataEndIndex++;
        this.effectiveLength = this.dataEndIndex;
        return 0;
      }
      currentArray = this.convertToArray();
    } else if (this.rawBytes !== null) {
      this.rawBytes = this.paddedBytes = this.jsStringRepresentation = null;
    }
    currentArray[index] = charValue & byteMask;
    return 0;
  },

  setByteAtChecked: function(index, charValue) {
    if (this.effectiveLength === null) {
      this.materializeBytes();
    }
    if (index < 0 || index >= this.effectiveLength) {
      throwIndexOutOfBounds();
    }
    this.setByteAt(index, charValue);
  },

  fillRange: function(offset, length, fillValue) {
    if (offset >= this.dataEndIndex && this.dataEndIndex && fillValue === 0) {
      return;
    }
    let currentArray = this.byteArr;
    if (!currentArray) {
      currentArray = this.convertToArray();
    } else if (this.rawBytes !== null) {
      this.rawBytes = this.paddedBytes = this.jsStringRepresentation = null;
    }
    const endIndex = offset + length;
    for (let i = offset; i < endIndex; i++) {
      currentArray[i] = fillValue;
    }
  },

  compareSequences: function(otherSequence) {
    if (this.jsStringRepresentation !== null && otherSequence.jsStringRepresentation !== null) {
      if (this.jsStringRepresentation < otherSequence.jsStringRepresentation) return -1;
      if (this.jsStringRepresentation > otherSequence.jsStringRepresentation) return 1;
      return 0;
    }
    const myFullBytes = this.getCompleteBytes();
    const otherFullBytes = otherSequence.getCompleteBytes();
    if (myFullBytes < otherFullBytes) return -1;
    if (myFullBytes > otherFullBytes) return 1;
    return 0;
  },

  isEqual: function(otherSequence) {
    if (this.jsStringRepresentation !== null && otherSequence.jsStringRepresentation !== null) {
      return this.jsStringRepresentation === otherSequence.jsStringRepresentation;
    }
    return this.getCompleteBytes() === otherSequence.getCompleteBytes();
  },

  isLessThan: function(otherSequence) {
    if (this.jsStringRepresentation !== null && otherSequence.jsStringRepresentation !== null) {
      return this.jsStringRepresentation < otherSequence.jsStringRepresentation;
    }
    return this.getCompleteBytes() < otherSequence.getCompleteBytes();
  },

  isLessOrEqual: function(otherSequence) {
    if (this.jsStringRepresentation !== null && otherSequence.jsStringRepresentation !== null) {
      return this.jsStringRepresentation <= otherSequence.jsStringRepresentation;
    }
    return this.getCompleteBytes() <= otherSequence.getCompleteBytes();
  }
};

function WrappedString(str) {
  this.jsStringRepresentation = str;
  this.effectiveLength = str.length; // Set length directly for wrapped string
  this.dataEndIndex = str.length;
}
WrappedString.prototype = Object.create(ByteSequence.prototype);
WrappedString.prototype.constructor = WrappedString;
WrappedString.prototype.materializeBytes = function() {
    if (this.rawBytes === null) {
        const byteContent = unescape(encodeURIComponent(this.jsStringRepresentation));
        this.rawBytes = this.paddedBytes = byteContent;
        this.dataEndIndex = this.effectiveLength = byteContent.length;
        return byteContent;
    }
    return this.rawBytes;
};


function MutableByteSequence(initialLength) {
  this.rawBytes = "";
  this.effectiveLength = initialLength;
  this.dataEndIndex = 0; // Starts empty, fills up to initialLength
  this.byteArr = new Array(initialLength).fill(0); // Initialize array with zeros
}
MutableByteSequence.prototype = Object.create(ByteSequence.prototype);
MutableByteSequence.prototype.constructor = MutableByteSequence;
MutableByteSequence.prototype.materializeBytes = function() {
    if (this.byteArr === null) {
        // This case should ideally not happen if MutableByteSequence is properly initialized
        // or if operations correctly update byteArr.
        return this.rawBytes || "";
    }
    let byteContent = "";
    for (let i = 0; i < this.byteArr.length; i++) {
        byteContent += String.fromCharCode(this.byteArr[i]);
    }
    this.rawBytes = this.paddedBytes = byteContent;
    this.dataEndIndex = this.effectiveLength = byteContent.length;
    this.jsStringRepresentation = null; // Invalidate string cache
    return byteContent;
};
MutableByteSequence.prototype.convertToArray = function() {
    if (this.byteArr === null) {
        // If byteArr is null, it means it was invalidated by a string-based operation.
        // We need to re-create it from rawBytes.
        const currentBytes = this.getRawBytes();
        const resultArr = new Array(this.effectiveLength);
        const actualDataLen = this.dataEndIndex;

        for (let i = 0; i < actualDataLen; i++) {
            resultArr[i] = currentBytes.charCodeAt(i);
        }
        for (let i = actualDataLen; i < this.effectiveLength; i++) {
            resultArr[i] = 0;
        }
        this.byteArr = resultArr;
    }
    // For MutableByteSequence, byteArr is the primary representation, so always return it.
    return this.byteArr;
};
MutableByteSequence.prototype.setByteAt = function(index, charValue) {
    if (this.byteArr === null) {
        this.convertToArray(); // Ensure byteArr is materialized if it was invalidated
    }
    this.byteArr[index] = charValue & 0xff;
    this.rawBytes = this.paddedBytes = this.jsStringRepresentation = null; // Invalidate caches
    return 0;
};
MutableByteSequence.prototype.fillRange = function(offset, length, fillValue) {
    if (this.byteArr === null) {
        this.convertToArray(); // Ensure byteArr is materialized
    }
    this.jsStringRepresentation = this.rawBytes = this.paddedBytes = null; // Invalidate caches
    const endIndex = offset + length;
    for (let i = offset; i < endIndex; i++) {
        this.byteArr[i] = fillValue;
    }
};


function getArrayElement(sourceArray, elementIndex) {
  const adjustedIndex = elementIndex + 1;
  if (elementIndex < 0 || adjustedIndex >= sourceArray.length) {
    throwIndexOutOfBounds();
  }
  return sourceArray[adjustedIndex];
}

function setArrayElement(targetArray, elementIndex, newValue) {
  const adjustedIndex = elementIndex + 1;
  if (elementIndex < 0 || adjustedIndex >= targetArray.length) {
    throwIndexOutOfBounds();
  }
  targetArray[adjustedIndex] = newValue;
  return 0;
}

function dynamicFunctionCall(targetFunc, argumentList) {
  if (targetFunc.fun) {
    return dynamicFunctionCall(targetFunc.fun, argumentList);
  }

  const funcArity = targetFunc.length;
  const argumentDifference = funcArity - argumentList.length;

  if (argumentDifference === 0) {
    return targetFunc.apply(null, argumentList);
  } else if (argumentDifference < 0) {
    const initialCallResult = targetFunc.apply(null, argumentList.slice(0, funcArity));
    return dynamicFunctionCall(initialCallResult, argumentList.slice(funcArity));
  } else {
    return function(nextArgument) {
      return dynamicFunctionCall(targetFunc, argumentList.concat([nextArgument]));
    };
  }
}

function decodeFormatString(formatInput) {
  const formatText = formatInput.toString();
  const textLength = formatText.length;

  if (textLength > 31) {
    throwInvalidInput("Format string too lengthy");
  }

  const formatSpec = {
    alignment: '+', // '+' for right-align, '-' for left-align
    signDisplay: '-', // '-' for default, '+' for always sign, ' ' for space for positive
    paddingChar: ' ', // ' ' or '0'
    alternativeForm: false,
    numericBase: 0,
    signedConversion: false,
    fieldWidth: 0,
    uppercaseOutput: false,
    signIndicator: 1, // 1 for positive, -1 for negative
    precision: -1,
    conversionType: 'f' // default float
  };

  for (let i = 0; i < textLength; i++) {
    const char = formatText.charAt(i);
    switch (char) {
      case '-':
        formatSpec.alignment = '-';
        break;
      case '+':
      case ' ':
        formatSpec.signDisplay = char;
        break;
      case '0':
        formatSpec.paddingChar = '0';
        break;
      case '#':
        formatSpec.alternativeForm = true;
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
        formatSpec.fieldWidth = 0;
        let digitVal;
        while ((digitVal = formatText.charCodeAt(i) - 48) >= 0 && digitVal <= 9) {
          formatSpec.fieldWidth = formatSpec.fieldWidth * 10 + digitVal;
          i++;
        }
        i--;
        break;
      case '.':
        formatSpec.precision = 0;
        i++;
        while ((digitVal = formatText.charCodeAt(i) - 48) >= 0 && digitVal <= 9) {
          formatSpec.precision = formatSpec.precision * 10 + digitVal;
          i++;
        }
        i--;
        break;
      case 'd':
      case 'i':
        formatSpec.signedConversion = true;
      case 'u':
        formatSpec.numericBase = 10;
        break;
      case 'x':
        formatSpec.numericBase = 16;
        break;
      case 'X':
        formatSpec.numericBase = 16;
        formatSpec.uppercaseOutput = true;
        break;
      case 'o':
        formatSpec.numericBase = 8;
        break;
      case 'e':
      case 'f':
      case 'g':
        formatSpec.signedConversion = true;
        formatSpec.conversionType = char;
        break;
      case 'E':
      case 'F':
      case 'G':
        formatSpec.signedConversion = true;
        formatSpec.uppercaseOutput = true;
        formatSpec.conversionType = char.toLowerCase();
        break;
    }
  }
  return formatSpec;
}

function applyFormatRules(formatSpec, rawOutputBuffer) {
  let processedBuffer = rawOutputBuffer;
  if (formatSpec.uppercaseOutput) {
    processedBuffer = processedBuffer.toUpperCase();
  }

  let currentLength = processedBuffer.length;
  if (formatSpec.signedConversion && (formatSpec.signIndicator < 0 || formatSpec.signDisplay !== '-')) {
    currentLength++;
  }
  if (formatSpec.alternativeForm) {
    if (formatSpec.numericBase === 8) currentLength++;
    if (formatSpec.numericBase === 16) currentLength += 2;
  }

  let finalBuffer = "";
  // Pad left with spaces if right-aligned and padding char is space
  if (formatSpec.alignment === '+' && formatSpec.paddingChar === ' ') {
    for (let i = currentLength; i < formatSpec.fieldWidth; i++) {
      finalBuffer += ' ';
    }
  }

  // Add sign prefix
  if (formatSpec.signedConversion) {
    if (formatSpec.signIndicator < 0) {
      finalBuffer += '-';
    } else if (formatSpec.signDisplay !== '-') {
      finalBuffer += formatSpec.signDisplay;
    }
  }

  // Add alternative form prefixes (0 for octal, 0x/0X for hex)
  if (formatSpec.alternativeForm) {
    if (formatSpec.numericBase === 8) finalBuffer += '0';
    if (formatSpec.numericBase === 16) finalBuffer += "0x";
  }

  // Pad left with zeros if right-aligned and padding char is zero
  if (formatSpec.alignment === '+' && formatSpec.paddingChar === '0') {
    for (let i = currentLength; i < formatSpec.fieldWidth; i++) {
      finalBuffer += '0';
    }
  }

  finalBuffer += processedBuffer;

  // Pad right with spaces if left-aligned
  if (formatSpec.alignment === '-') {
    for (let i = currentLength; i < formatSpec.fieldWidth; i++) {
      finalBuffer += ' ';
    }
  }
  return new WrappedString(finalBuffer);
}

function formatInteger(formatSpecifier, integerValue) {
  if (formatSpecifier.toString() === "%d") {
    return new WrappedString("" + integerValue);
  }

  const parsedFormat = decodeFormatString(formatSpecifier);
  let valueToFormat = integerValue;

  if (valueToFormat < 0) {
    if (parsedFormat.signedConversion) {
      parsedFormat.signIndicator = -1;
      valueToFormat = -valueToFormat;
    } else {
      valueToFormat >>>= 0; // Unsigned conversion
    }
  }

  let stringRepresentation = valueToFormat.toString(parsedFormat.numericBase);

  if (parsedFormat.precision >= 0) {
    parsedFormat.paddingChar = ' ';
    const paddingCount = parsedFormat.precision - stringRepresentation.length;
    if (paddingCount > 0) {
      stringRepresentation = stringReplicator(paddingCount, '0') + stringRepresentation;
    }
  }
  return applyFormatRules(parsedFormat, stringRepresentation);
}

function compare64BitInts(val1, val2) {
  const val1High = val1[3] << 16;
  const val2High = val2[3] << 16;

  if (val1High > val2High) return 1;
  if (val1High < val2High) return -1;
  if (val1[2] > val2[2]) return 1;
  if (val1[2] < val2[2]) return -1;
  if (val1[1] > val2[1]) return 1;
  if (val1[1] < val2[1]) return -1;
  return 0;
}

function compareIntegers(a, b) {
  if (a < b) return -1;
  if (a === b) return 0;
  return 1;
}

function deepValueComparison(valA, valB, fullComparisonMode) {
  const comparisonStack = [];
  let currentA = valA;
  let currentB = valB;

  for (;;) {
    if (!(fullComparisonMode && currentA === currentB)) {
      if (currentA instanceof ByteSequence) {
        if (currentB instanceof ByteSequence) {
          if (currentA !== currentB) {
            const cmpResult = currentA.compareSequences(currentB);
            if (cmpResult !== 0) return cmpResult;
          }
        } else {
          return 1; // ByteSequence is greater than non-ByteSequence
        }
      } else if (Array.isArray(currentA) && (currentA[0] | 0) === currentA[0]) {
        const typeTagA = currentA[0];
        if (typeTagA === 250) { // Forwarding tag
          currentA = currentA[1];
          continue;
        } else if (Array.isArray(currentB) && (currentB[0] | 0) === currentB[0]) {
          const typeTagB = currentB[0];
          if (typeTagB === 250) { // Forwarding tag
            currentB = currentB[1];
            continue;
          } else if (typeTagA !== typeTagB) {
            return (typeTagA < typeTagB) ? -1 : 1;
          } else {
            switch (typeTagA) {
              case 248: { // Block with hash
                const cmpResult = compareIntegers(currentA[2], currentB[2]);
                if (cmpResult !== 0) return cmpResult;
                break;
              }
              case 255: { // 64-bit integer
                const cmpResult = compare64BitInts(currentA, currentB);
                if (cmpResult !== 0) return cmpResult;
                break;
              }
              default:
                if (currentA.length !== currentB.length) {
                  return (currentA.length < currentB.length) ? -1 : 1;
                }
                if (currentA.length > 1) { // Push elements for deeper comparison
                  comparisonStack.push(currentA, currentB, 1);
                }
            }
          }
        } else {
          return 1; // Array with tag is greater than other non-array/non-ByteSequence
        }
      } else if (currentB instanceof ByteSequence || (Array.isArray(currentB) && (currentB[0] | 0) === currentB[0])) {
        return -1; // currentA is smaller than currentB (which is ByteSequence or tagged Array)
      } else {
        // Primitive values or untagged arrays/objects
        if (currentA < currentB) return -1;
        if (currentA > currentB) return 1;
        if (fullComparisonMode && currentA !== currentB) {
          // NaN comparison: NaN != NaN, so if A is NaN, B is not, A is greater.
          // If B is NaN, A is not, B is greater.
          if (currentA === currentA) return 1; // A is not NaN, B is NaN
          if (currentB === currentB) return -1; // B is not NaN, A is NaN
        }
      }
    }

    if (comparisonStack.length === 0) return 0;

    let index = comparisonStack.pop();
    currentB = comparisonStack.pop();
    currentA = comparisonStack.pop();

    if (index + 1 < currentA.length) {
      comparisonStack.push(currentA, currentB, index + 1);
    }
    currentA = currentA[index];
    currentB = currentB[index];
  }
}

function performDeepComparison(valA, valB) {
  return deepValueComparison(valA, valB, true);
}

function isGreaterOrEqual(operandX, operandY) {
  return +(performDeepComparison(operandX, operandY) >= 0);
}

function extractNumericBaseInfo(inputSequence) {
  let parseIndex = 0;
  let numericBase = 10;
  let signMultiplier = 1;

  if (inputSequence.getByteAt(0) === 45) { // ASCII for '-'
    signMultiplier = -1;
    parseIndex++;
  }

  if (inputSequence.getByteAt(parseIndex) === 48) { // ASCII for '0'
    const nextChar = inputSequence.getByteAt(parseIndex + 1);
    switch (nextChar) {
      case 120: // 'x'
      case 88: // 'X'
        numericBase = 16;
        parseIndex += 2;
        break;
      case 111: // 'o'
      case 79: // 'O'
        numericBase = 8;
        parseIndex += 2;
        break;
      case 98: // 'b'
      case 66: // 'B'
        numericBase = 2;
        parseIndex += 2;
        break;
    }
  }
  return [parseIndex, signMultiplier, numericBase];
}

function parseCharToDigit(charAsciiCode) {
  if (charAsciiCode >= 48 && charAsciiCode <= 57) return charAsciiCode - 48; // '0'-'9'
  if (charAsciiCode >= 65 && charAsciiCode <= 90) return charAsciiCode - 55; // 'A'-'Z' (10-35)
  if (charAsciiCode >= 97 && charAsciiCode <= 122) return charAsciiCode - 87; // 'a'-'z' (10-35)
  return -1; // Not a valid digit for any base
}

var runtimeGlobals = [0];

function terminateWithError(message) {
  dispatchStringError(runtimeGlobals[3], message);
}

function convertStringToInt(inputString) {
  const [startIndex, sign, base] = extractNumericBaseInfo(inputString);
  const maxThreshold = 0xFFFFFFFF; // Max unsigned 32-bit integer

  let currentParseIndex = startIndex;
  let charCode = inputString.getByteAt(currentParseIndex);
  let digit = parseCharToDigit(charCode);

  if (digit < 0 || digit >= base) {
    terminateWithError("int_of_string: Invalid digit or base mismatch");
  }

  let resultAccumulator = digit;

  for (;;) {
    currentParseIndex++;
    charCode = inputString.getByteAt(currentParseIndex);

    if (charCode === 95) { // ASCII for '_' (underscore, often used as separator)
      continue;
    }

    digit = parseCharToDigit(charCode);
    if (digit < 0 || digit >= base) {
      break; // End of number or invalid character
    }

    const prevAccumulator = resultAccumulator;
    resultAccumulator = base * resultAccumulator + digit;

    // Overflow check - simple version for 32-bit signed int
    // This is a heuristic, a more robust check would involve checking before multiplication
    // if (Math.floor(resultAccumulator / base) !== prevAccumulator || resultAccumulator > maxThreshold) {
    if (resultAccumulator > maxThreshold && sign === 1) { // If positive and exceeds unsigned max
        terminateWithError("int_of_string: Integer overflow");
    }
    if (resultAccumulator > (maxThreshold + 1) && sign === -1) { // If negative and exceeds unsigned max + 1 (for -2^31)
        terminateWithError("int_of_string: Integer overflow");
    }
  }

  if (currentParseIndex !== inputString.getLength()) {
    terminateWithError("int_of_string: Extra characters after integer");
  }

  const finalResult = sign * resultAccumulator;
  if ((finalResult | 0) !== finalResult) { // Check if it fits in a 32-bit signed integer
    terminateWithError("int_of_string: Integer value out of 32-bit signed range");
  }
  return finalResult;
}

function retrieveConsoleLogger() {
  const currentConsole = this.console || {};
  const consoleMethods = [
    "log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"
  ];

  const dummyFunction = function() {};
  for (let i = 0; i < consoleMethods.length; i++) {
    const methodName = consoleMethods[i];
    if (typeof currentConsole[methodName] !== 'function') {
      currentConsole[methodName] = dummyFunction;
    }
  }
  return currentConsole;
}

function convertJsToArray(jsArray) {
  const result = new Array(jsArray.length + 1);
  result[0] = 0; // OCaml array tag
  for (let i = 0; i < jsArray.length; i++) {
    result[i + 1] = jsArray[i];
  }
  return result;
}

function createInitializedVector(vectorLength, initialValue) {
  const newVector = new Array(vectorLength + 1);
  newVector[0] = 0; // OCaml array tag
  for (let i = 1; i <= vectorLength; i++) {
    newVector[i] = initialValue;
  }
  return newVector;
}

function getOutputChannelList() {
  // Placeholder for OCaml channel list, returns 0 for empty list
  return 0;
}

function multiplySignedInts(x, y) {
  // Simulates 32-bit signed integer multiplication with bitwise operations
  // This is a common pattern for OCaml's integer multiplication in JS
  const highX = x >> 16;
  const lowX = x & 0xffff;
  const result = ((highX * y) << 16) + (lowX * y);
  return result | 0; // Ensure 32-bit signed integer result
}

function registerGlobalValue(index, value) {
  runtimeGlobals[index + 1] = value;
}

var registeredNamedEntities = new Map(); // Using Map for better performance and type safety

function registerNamedEntity(entityName, entityValue) {
  registeredNamedEntities.set(entityName, entityValue);
  return 0;
}

(function() {
  function executeFunction(funcRef, argVal) {
    return funcRef.length === 1 ? funcRef(argVal) : dynamicFunctionCall(funcRef, [argVal]);
  }

  const failureTag = [0, new ByteSequence("Failure")];
  const invalidArgTag = [0, new ByteSequence("Invalid_argument")];

  registerGlobalValue(6, [0, new ByteSequence("Not_found")]);
  registerGlobalValue(5, [0, new ByteSequence("Division_by_zero")]);
  registerGlobalValue(3, invalidArgTag);
  registerGlobalValue(2, failureTag);

  const decimalFormatString = new ByteSequence("%d");
  const exitHookName = new ByteSequence("Pervasives.do_at_exit");
  const emptyListSentinel = [0, 0, 0];
  const splitNErrorMsg = new ByteSequence("split_n");
  const noGameFoundMsg = new ByteSequence("NO GAME");
  const inputReadErrorMsg = new ByteSequence("get_input");
  const whitespaceRegexString = new ByteSequence("\\s");

  function maxOfTwo(val1, val2) {
    return isGreaterOrEqual(val1, val2) ? val1 : val2;
  }

  function listAppendRecursive(sourceList, targetList) {
    if (sourceList) {
      const head = sourceList[1];
      return [0, head, listAppendRecursive(sourceList[2], targetList)];
    }
    return targetList;
  }

  function flushOutputChannels(unit) {
    let channelIterator = getOutputChannelList(0);
    while (channelIterator) {
      const nextChannel = channelIterator[2];
      try {
        // Actual channel flushing logic would go here
      } catch (error) {
        // Handle error during flush
      }
      channelIterator = nextChannel;
    }
    return 0;
  }
  registerNamedEntity(exitHookName, flushOutputChannels);

  function transformArrayToList(jsArray) {
    let listHead = 0; // OCaml empty list is 0
    let currentIdx = jsArray.length - 1;
    while (currentIdx >= 0) {
      listHead = [0, jsArray[currentIdx + 1], listHead];
      currentIdx--;
    }
    return listHead;
  }

  function flattenListRecursive(inputList) {
    if (inputList) {
      const head = inputList[1];
      return listAppendRecursive(head, flattenListRecursive(inputList[2]));
    }
    return 0;
  }

  function mapListElements(mapperFunc, inputList) {
    if (inputList) {
      const head = inputList[1];
      const tail = inputList[2];
      const mappedHead = executeFunction(mapperFunc, head);
      return [0, mappedHead, mapListElements(mapperFunc, tail)];
    }
    return 0;
  }

  const prototypeRegistry = [0, 0]; // Used in original for MlString.prototype
  const RegExpConstructor = RegExp;
  const ArrayConstructor = Array;

  function identityFunction(value) {
    return value;
  }

  function wrapAsByteSequence(input) {
    return (input instanceof ArrayConstructor) ? 0 : [0, new WrappedString(input.toString())];
  }
  prototypeRegistry[1] = [0, wrapAsByteSequence, prototypeRegistry[1]];

  const consoleInstance = retrieveConsoleLogger(0);

  function applyFunctionToArguments(func, args) {
    return executeFunction(args, func);
  }

  function convertToString(value) {
    return value.toString();
  }

  function logToConsole(message) {
    consoleInstance.log(convertToString(message));
  }

  function generateRangeList(start, end) {
    let current = start;
    let result = 0; // Empty list
    while (current < end) {
      result = [0, current, result];
      current++;
    }
    // The original code builds the list in reverse order [end-1, ..., start]
    // So, we need to reverse the order of construction or the list itself.
    // The original logic `(X<Y?1:0),$=Z?[0,X,_(X+1|0,Y)]:Z;` suggests building it recursively from X to Y-1.
    // Let's match the recursive structure.
    if (start < end) {
      return [0, start, generateRangeList(start + 1, end)];
    } else {
      return 0; // Empty list
    }
  }

  function swapArrayElements(targetArray, indexA, indexB) {
    const tempVal = getArrayElement(targetArray, indexA);
    setArrayElement(targetArray, indexA, getArrayElement(targetArray, indexB));
    setArrayElement(targetArray, indexB, tempVal);
  }

  function splitListAtN(nValue, inputList) {
    if (inputList) {
      if (nValue > 0) {
        const remainingSplit = splitListAtN(nValue - 1, inputList[2]);
        return [0, [0, inputList[1], remainingSplit[1]], remainingSplit[2]];
      }
      return [0, 0, inputList];
    }
    if (nValue === 0) return emptyListSentinel; // [0,0,0] as in original
    dispatchRuntimeError(invalidArgTag, splitNErrorMsg);
  }

  function parseStringToInt(byteSequence) {
    return convertStringToInt(byteSequence);
  }

  function calculateMaxProfit(targetDuration, itemValuesArray) {
    function computeProductSum(currentStartIndex) {
      if (itemValuesArray.length - 1 <= (currentStartIndex + targetDuration - 1)) {
        return -1; // Sentinel for invalid or out of bounds
      }

      let currentProduct = 1;
      const initialLoopCounter = 0;
      const loopLimit = targetDuration - 1;

      for (let i = initialLoopCounter; i <= loopLimit; i++) {
        currentProduct = multiplySignedInts(currentProduct, getArrayElement(itemValuesArray, currentStartIndex + i));
      }
      return currentProduct;
    }

    let maxOverallProfit = -Infinity; // Initialize with a very small number

    for (let i = 0; i < itemValuesArray.length - targetDuration + 1; i++) {
        const currentWindowProduct = computeProductSum(i);
        if (currentWindowProduct !== -1) { // Check if it's a valid window
            maxOverallProfit = Math.max(maxOverallProfit, currentWindowProduct);
        }
    }
    return maxOverallProfit;
  }

  // Main application logic
  const fileSystem = require("fs");
  const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

  const stringWrapperMapper = function(jsString) {
    return new WrappedString(jsString);
  };
  const jsArrayConverter = function(jsArr) {
    return convertJsToArray(jsArr);
  };

  // Process input: split by whitespace, wrap, convert to JS array, then OCaml list
  const processedInputList = applyFunctionToArguments(
    applyFunctionToArguments(
      applyFunctionToArguments(
        applyFunctionToArguments(
          rawInputData.split(new RegExpConstructor(convertToString(whitespaceRegexString))),
          identityFunction
        ),
        jsArrayConverter
      ),
      transformArrayToList
    ),
    stringWrapperMapper
  );

  let inputIterator = processedInputList;

  inputLoop:
  while (inputIterator) {
    const nextInputSegment = inputIterator[2];
    if (!nextInputSegment) { // End of input
      break;
    }

    const firstIntVal = parseStringToInt(inputIterator[1]);
    const secondIntVal = parseStringToInt(nextInputSegment[1]);

    const isZeroZeroCase = (firstIntVal === 0 && secondIntVal === 0);

    let gameSetupResult = null;
    if (!isZeroZeroCase) {
      const splitListResult = splitListAtN(firstIntVal, nextInputSegment[2]);
      const remainingData = splitListResult[2];
      const itemsListForGame = mapListElements(parseStringToInt, splitListResult[1]);

      gameSetupResult = [0, [0, firstIntVal, secondIntVal, itemsListForGame, remainingData]];
    }

    if (gameSetupResult) {
      const currentCaseData = gameSetupResult[1];
      const targetValue = currentCaseData[2];
      const arraySize = currentCaseData[1];
      const rawItemsList = currentCaseData[3];

      let dynamicArray;
      if (rawItemsList) {
        let listLength = 0;
        let tempListIter = rawItemsList;
        while (tempListIter) {
          listLength++;
          tempListIter = tempListIter[2];
        }

        dynamicArray = createInitializedVector(listLength, 0);
        let arrayIndex = 0;
        let currentListIter = rawItemsList;
        while (currentListIter) {
          dynamicArray[arrayIndex + 1] = currentListIter[1];
          arrayIndex++;
          currentListIter = currentListIter[2];
        }
      } else {
        dynamicArray = createInitializedVector(0, 0); // Empty array if no items
      }

      const baseProfit = calculateMaxProfit(targetValue, dynamicArray);
      const initialRange = generateRangeList(0, arraySize);
      const permutationRange = generateRangeList(0, arraySize);

      // Generating permutations (pairs for swapping)
      const permutationPairs = flattenListRecursive(mapListElements(
        function(outerIndex) {
          return mapListElements(function(innerIndex) {
            return [0, outerIndex, innerIndex];
          }, permutationRange);
        }, initialRange
      ));

      let maxAchievedProfit = -Infinity; // Initialize with a very small number

      let permutationIterator = permutationPairs;
      while (permutationIterator) {
        const pair = permutationIterator[1];
        const nextPermutation = permutationIterator[2];

        // Perform swap
        swapArrayElements(dynamicArray, pair[1], pair[2]);

        // Calculate profit for the swapped array
        const currentProfit = calculateMaxProfit(targetValue, dynamicArray);

        // Update max profit
        maxAchievedProfit = maxOfTwo(maxAchievedProfit, currentProfit);

        // Swap back to restore original order for next permutation
        swapArrayElements(dynamicArray, pair[1], pair[2]);

        permutationIterator = nextPermutation;
      }

      if (maxAchievedProfit < baseProfit) {
        logToConsole(noGameFoundMsg);
      } else {
        logToConsole(formatInteger(decimalFormatString, maxAchievedProfit - baseProfit));
      }

      inputIterator = currentCaseData[4]; // Continue with the remaining input
      continue inputLoop;
    }

    flushOutputChannels(0); // Flush any pending output
    return; // Exit if zero-zero case or no game setup
  }

  dispatchRuntimeError(failureTag, inputReadErrorMsg); // Should not be reached if input ends cleanly
})();