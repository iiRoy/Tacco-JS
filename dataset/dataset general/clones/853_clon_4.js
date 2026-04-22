(function (globalScope, factoryProducer) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factoryProducer();
  } else if (typeof define === 'function' && define.amd) {
    define(factoryProducer);
  } else {
    globalScope.binarySequencer = factoryProducer();
  }
})(typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this, function () {

  const ensureNonNegativeInteger = (value) => Math.max(0, Math.floor(Number(value) || 0));
  const adjustIndex = (val, maxBound, defaultVal) => {
    let num = Number(val);
    if (isNaN(num)) return defaultVal;
    num = Math.floor(num);
    return Math.min(Math.max(0, num), maxBound);
  };
  const throwCustomError = (message) => { throw new Error(message); };
  const trimWhitespace = (text) => text.replace(/^\s+|\s+$/g, '');

  // Manual Base64 Conversion Logic
  const base64CharSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const base64LookupTable = new Array(256);
  for (let i = 0; i < base64CharSet.length; i++) base64LookupTable[base64CharSet.charCodeAt(i)] = i;

  function stringToRawBase64Bytes(textInput) {
    textInput = trimWhitespace(textInput);
    while (textInput.length % 4 !== 0) {
      textInput += '=';
    }
    let byteResults = [];
    let position = 0;
    while (position < textInput.length) {
      const v1 = base64LookupTable[textInput.charCodeAt(position++)];
      const v2 = base64LookupTable[textInput.charCodeAt(position++)];
      const v3 = base64LookupTable[textInput.charCodeAt(position++)];
      const v4 = base64LookupTable[textInput.charCodeAt(position++)];

      const combinedVal = (v1 << 18) | (v2 << 12) | (v3 << 6) | v4;

      byteResults.push((combinedVal >> 16) & 0xFF);
      if (v3 !== 64) byteResults.push((combinedVal >> 8) & 0xFF);
      if (v4 !== 64) byteResults.push(combinedVal & 0xFF);
    }
    return byteResults;
  }

  function rawBase64BytesToString(byteDataArray) {
    let outputString = '';
    let position = 0;
    while (position < byteDataArray.length) {
      const b_a = byteDataArray[position++];
      const b_b = byteDataArray[position++];
      const b_c = byteDataArray[position++];

      const triple = (b_a << 16) | (b_b << 8) | b_c;

      const ch1 = triple >> 18 & 0x3F;
      const ch2 = triple >> 12 & 0x3F;
      const ch3 = isNaN(b_b) ? 64 : (triple >> 6 & 0x3F);
      const ch4 = isNaN(b_c) ? 64 : (triple & 0x3F);

      outputString += base64CharSet[ch1] + base64CharSet[ch2] + base64CharSet[ch3] + base64CharSet[ch4];
    }
    return outputString;
  }

  // UTF-8 Conversion using Web APIs (if available) or fallback manual implementation
  const utf8Encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const utf8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;

  function stringToUtf8ByteList(inputString) {
    if (utf8Encoder) {
      return Array.from(utf8Encoder.encode(inputString));
    }
    // Manual UTF-8 encoding fallback
    let byteCollection = [];
    for (let charIdx = 0; charIdx < inputString.length; charIdx++) {
      let codePoint = inputString.charCodeAt(charIdx);
      if (codePoint < 0x80) {
        byteCollection.push(codePoint);
      } else if (codePoint < 0x800) {
        byteCollection.push(0xC0 | (codePoint >> 6));
        byteCollection.push(0x80 | (codePoint & 0x3F));
      } else if (codePoint < 0xD800 || codePoint >= 0xE000) { // BMP characters
        byteCollection.push(0xE0 | (codePoint >> 12));
        byteCollection.push(0x80 | ((codePoint >> 6) & 0x3F));
        byteCollection.push(0x80 | (codePoint & 0x3F));
      } else { // Surrogate pair
        charIdx++;
        let nextCodePoint = inputString.charCodeAt(charIdx);
        codePoint = 0x10000 + (((codePoint & 0x3FF) << 10) | (nextCodePoint & 0x3FF));
        byteCollection.push(0xF0 | (codePoint >> 18));
        byteCollection.push(0x80 | ((codePoint >> 12) & 0x3F));
        byteCollection.push(0x80 | ((codePoint >> 6) & 0x3F));
        byteCollection.push(0x80 | (codePoint & 0x3F));
      }
    }
    return byteCollection;
  }

  function utf8ByteListToString(bytesList) {
    if (utf8Decoder) {
      return utf8Decoder.decode(new Uint8Array(bytesList));
    }
    // Manual UTF-8 decoding fallback
    let resultingString = '';
    let currentByteIndex = 0;
    while (currentByteIndex < bytesList.length) {
      let currentByte = bytesList[currentByteIndex++];
      let characterValue;
      if (currentByte < 0x80) {
        characterValue = currentByte;
      } else if ((currentByte & 0xE0) === 0xC0) {
        characterValue = ((currentByte & 0x1F) << 6) | (bytesList[currentByteIndex++] & 0x3F);
      } else if ((currentByte & 0xF0) === 0xE0) {
        characterValue = ((currentByte & 0x0F) << 12) | ((bytesList[currentByteIndex++] & 0x3F) << 6) | (bytesList[currentByteIndex++] & 0x3F);
      } else if ((currentByte & 0xF8) === 0xF0) {
        characterValue = ((currentByte & 0x07) << 18) | ((bytesList[currentByteIndex++] & 0x3F) << 12) | ((bytesList[currentByteIndex++] & 0x3F) << 6) | (bytesList[currentByteIndex++] & 0x3F);
      } else {
        characterValue = 0xFFFD; // Unicode Replacement Character
      }
      resultingString += String.fromCharCode(characterValue);
    }
    return resultingString;
  }

  // ASCII/Binary Conversion
  function stringToAsciiByteList(inputString) {
    return Array.from(inputString).map(char => char.charCodeAt(0) & 0xFF);
  }

  function asciiByteListToString(bytesList) {
    return String.fromCharCode(...bytesList);
  }

  // Hexadecimal Conversion
  const hexDigitChars = '0123456789abcdef';
  function stringToHexByteList(hexString) {
    let byteList = [];
    hexString = hexString.replace(/[^0-9a-fA-F]/g, '');
    if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
    }
    for (let i = 0; i < hexString.length; i += 2) {
      byteList.push(parseInt(hexString.substr(i, 2), 16));
    }
    return byteList;
  }

  function hexByteListToString(byteData) {
    let output = '';
    for (let i = 0; i < byteData.length; i++) {
      output += hexDigitChars[(byteData[i] >> 4) & 0xF] + hexDigitChars[byteData[i] & 0xF];
    }
    return output;
  }

  // UTF-16LE / UCS-2 Conversion
  function stringToUtf16leByteList(inputString) {
    let byteList = [];
    for (let i = 0; i < inputString.length; i++) {
      const code = inputString.charCodeAt(i);
      byteList.push(code & 0xFF);
      byteList.push((code >> 8) & 0xFF);
    }
    return byteList;
  }

  function utf16leByteListToString(byteData) {
    let result = '';
    for (let i = 0; i < byteData.length; i += 2) {
      const code = byteData[i] | (byteData[i + 1] << 8);
      result += String.fromCharCode(code);
    }
    return result;
  }

  // Encoding Dispatch Table (alternative to switch statements)
  const encodingOperationMap = {
    'hex': { toBytes: stringToHexByteList, fromBytes: hexByteListToString },
    'utf8': { toBytes: stringToUtf8ByteList, fromBytes: utf8ByteListToString },
    'utf-8': { toBytes: stringToUtf8ByteList, fromBytes: utf8ByteListToString },
    'ascii': { toBytes: stringToAsciiByteList, fromBytes: asciiByteListToString },
    'binary': { toBytes: stringToAsciiByteList, fromBytes: asciiByteListToString },
    'base64': { toBytes: stringToRawBase64Bytes, fromBytes: rawBase64BytesToString },
    'raw': { toBytes: stringToAsciiByteList, fromBytes: asciiByteListToString },
    'ucs2': { toBytes: stringToUtf16leByteList, fromBytes: utf16leByteListToString },
    'ucs-2': { toBytes: stringToUtf16leByteList, fromBytes: utf16leByteListToString },
    'utf16le': { toBytes: stringToUtf16leByteList, fromBytes: utf16leByteListToString },
    'utf-16le': { toBytes: stringToUtf16leByteList, fromBytes: utf16leByteListToString }
  };

  // Internal helper for checking array-like objects
  const isArrayLikeOrTypedArray = (candidate) => Array.isArray(candidate) || (candidate && typeof candidate.byteLength === 'number' && candidate.byteLength >= 0);

  // Main class for binary data handling
  class OctetBlock {
    constructor(sourceParameter, conversionMethod, omitInitialFill) {
      if (!(this instanceof OctetBlock)) {
        return new OctetBlock(sourceParameter, conversionMethod, omitInitialFill);
      }

      this._byteElements = []; // Internal storage: plain JavaScript array
      this._isOctetBlockInstance = true; // Unique identifier for type checking

      let determinedElementCount = 0;
      const parameterKind = typeof sourceParameter;

      if (parameterKind === 'number') {
        determinedElementCount = ensureNonNegativeInteger(sourceParameter);
        if (!omitInitialFill) {
            this._byteElements = new Array(determinedElementCount).fill(0);
        } else {
            this._byteElements = new Array(determinedElementCount);
        }
      } else if (parameterKind === 'string') {
        const schemeDetails = encodingOperationMap[String(conversionMethod || 'utf8').toLowerCase()];
        if (!schemeDetails) throwCustomError('Unsupported encoding method.');
        const byteList = schemeDetails.toBytes(sourceParameter);
        determinedElementCount = byteList.length;
        this._byteElements = byteList;
      } else if (parameterKind === 'object' && sourceParameter !== null) {
        if (sourceParameter instanceof OctetBlock) {
          determinedElementCount = sourceParameter.byteLength;
          this._byteElements = Array.from(sourceParameter._byteElements);
        } else if (isArrayLikeOrTypedArray(sourceParameter)) {
          determinedElementCount = ensureNonNegativeInteger(sourceParameter.length);
          this._byteElements = Array.from(sourceParameter).map(val => val & 0xFF);
        } else {
          throwCustomError('Invalid object type for OctetBlock construction.');
        }
      } else {
        throwCustomError('First argument must be a number, string, or array-like object.');
      }

      this.byteLength = determinedElementCount; // Public length property
    }

    // Static utility methods
    static validateEncoding(scheme) {
      return !!encodingOperationMap[String(scheme).toLowerCase()];
    }

    static isOctetBlock(potentialInstance) {
      return !!(potentialInstance !== null && potentialInstance !== undefined && potentialInstance._isOctetBlockInstance);
    }

    static determineByteCount(text, scheme) {
      const schemeDetails = encodingOperationMap[String(scheme || 'utf8').toLowerCase()];
      if (!schemeDetails) throwCustomError('Unsupported encoding method.');

      // For some encodings, length can be calculated without full conversion
      const lowerScheme = String(scheme).toLowerCase();
      if (lowerScheme === 'hex') return Math.ceil(text.replace(/[^0-9a-fA-F]/g, '').length / 2);
      if (lowerScheme.startsWith('utf16le') || lowerScheme.startsWith('ucs2')) return text.length * 2;
      if (lowerScheme === 'base64') return Math.floor(text.replace(/=/g, '').length * 3 / 4); // Approximation for actual bytes
      
      // Otherwise, convert to bytes to get accurate length
      return schemeDetails.toBytes(text).length;
    }

    static combineBlocks(blockList, totalDesiredLength) {
      if (!Array.isArray(blockList)) throwCustomError('Input list must be an Array.');
      if (blockList.length === 0) return new OctetBlock(0);
      if (blockList.length === 1 && OctetBlock.isOctetBlock(blockList[0])) return blockList[0];

      let accumulatedBytes = [];
      if (typeof totalDesiredLength !== 'number') {
        totalDesiredLength = 0;
        for (const block of blockList) {
          if (!OctetBlock.isOctetBlock(block)) throwCustomError('All list elements must be OctetBlock instances.');
          totalDesiredLength += block.byteLength;
        }
      }

      for (const block of blockList) {
        accumulatedBytes.push(...block._byteElements);
      }
      return new OctetBlock(accumulatedBytes.slice(0, totalDesiredLength));
    }

    // Instance methods
    inject(textSource, startIndex, maxBytesToInject, method) {
      startIndex = adjustIndex(startIndex, this.byteLength, 0);
      let remainingCapacity = this.byteLength - startIndex;
      maxBytesToInject = adjustIndex(maxBytesToInject, remainingCapacity, remainingCapacity);

      method = String(method || 'utf8').toLowerCase();
      const schemeDetails = encodingOperationMap[method];
      if (!schemeDetails) throwCustomError('Unsupported encoding method for injection.');

      const bytesToProcess = schemeDetails.toBytes(textSource);
      const actualBytesWritten = Math.min(bytesToProcess.length, maxBytesToInject);

      for (let i = 0; i < actualBytesWritten; i++) {
        this._byteElements[startIndex + i] = bytesToProcess[i];
      }
      return actualBytesWritten;
    }

    representAs(method, startPosition, endPosition) {
      const currentBytes = this._byteElements;
      startPosition = adjustIndex(startPosition, currentBytes.length, 0);
      endPosition = adjustIndex(endPosition, currentBytes.length, currentBytes.length);

      if (endPosition <= startPosition) return '';

      const portionBytes = currentBytes.slice(startPosition, endPosition);

      method = String(method || 'utf8').toLowerCase();
      const schemeDetails = encodingOperationMap[method];
      if (!schemeDetails) throwCustomError('Unsupported encoding method for representation.');

      return schemeDetails.fromBytes(portionBytes);
    }

    serializeToJSON() {
      return {
        typeIdentifier: 'OctetDataBlock',
        dataContent: Array.from(this._byteElements)
      };
    }

    duplicateTo(targetBlock, targetOffset, sourceStart, sourceEnd) {
      if (!OctetBlock.isOctetBlock(targetBlock)) throwCustomError('Target must be an OctetBlock.');

      sourceStart = adjustIndex(sourceStart, this.byteLength, 0);
      sourceEnd = adjustIndex(sourceEnd, this.byteLength, this.byteLength);
      targetOffset = adjustIndex(targetOffset, targetBlock.byteLength, 0);

      const transferCount = Math.min(sourceEnd - sourceStart, targetBlock.byteLength - targetOffset);

      for (let i = 0; i < transferCount; i++) {
        targetBlock._byteElements[targetOffset + i] = this._byteElements[sourceStart + i];
      }
    }

    extractSubBlock(startingIndex, endingIndex) {
      const totalLen = this.byteLength;
      startingIndex = adjustIndex(startingIndex, totalLen, 0);
      endingIndex = adjustIndex(endingIndex, totalLen, totalLen);

      const newByteElements = this._byteElements.slice(startingIndex, endingIndex);
      return new OctetBlock(newByteElements);
    }

    retrieveSingleByte(index) {
      if (index < 0 || index >= this.byteLength) throwCustomError('Index is outside block boundaries.');
      return this._byteElements[index];
    }
  }

  // Use a Proxy to enable direct numeric index access, a different strategy
  const OctetBlockAccessHandler = {
    get(target, propKey, receiver) {
      if (typeof propKey === 'string' && /^\d+$/.test(propKey)) {
        const index = Number(propKey);
        if (index >= 0 && index < target.byteLength) {
          return target._byteElements[index];
        }
      }
      return Reflect.get(target, propKey, receiver);
    },
    set(target, propKey, value, receiver) {
      if (typeof propKey === 'string' && /^\d+$/.test(propKey)) {
        const index = Number(propKey);
        if (index >= 0 && index < target.byteLength) {
          target._byteElements[index] = value & 0xFF; // Ensure value is a byte
          return true;
        }
        return false; // Cannot set out of bounds
      }
      return Reflect.set(target, propKey, value, receiver);
    }
  };

  function createOctetBlockInstance(sourceParam, conversionMethod, omitInitialFill) {
    const blockInstance = new OctetBlock(sourceParam, conversionMethod, omitInitialFill);
    return new Proxy(blockInstance, OctetBlockAccessHandler);
  }

  // Expose static methods on the factory function
  createOctetBlockInstance.validateEncoding = OctetBlock.validateEncoding;
  createOctetBlockInstance.isOctetBlock = OctetBlock.isOctetBlock;
  createOctetBlockInstance.determineByteCount = OctetBlock.determineByteCount;
  createOctetBlockInstance.combineBlocks = OctetBlock.combineBlocks;

  createOctetBlockInstance.dataPoolSize = 8192; // Mimic a common buffer property

  return createOctetBlockInstance;
});