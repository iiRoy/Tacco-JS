"use strict";

// --- Input Processing Utility (Cloned and Modified GET Module) ---
const InputReaderUtility = (function () {
  // Main factory function to create an input processor instance
  function createProcessor(rawInputString) {
    if (typeof rawInputString !== "string" || rawInputString.length === 0) {
      throw new Error("Input string must be non-empty.");
    }
    return new DataStreamHandler(rawInputString);
  }

  // Class to handle stream-like processing of input data
  function DataStreamHandler(inputContent) {
    // Internal buffer for lines, trimmed and split
    this._bufferedLines = inputContent.trim().split("\n");
    // Current line pointer
    this._linePointer = 0;
    // Optional debug flag (new fragment)
    this._debugMode = false;
  }

  DataStreamHandler.prototype.readNextElement = function (returnAsString) {
    const currentLineData = this._bufferedLines;
    const currentLineIdx = this._linePointer;
    let elementToReturn;

    // Guard clause: ensure line exists
    if (currentLineIdx >= currentLineData.length) {
      if (this._debugMode) console.warn("Attempted to read past end of input.");
      return undefined;
    }

    // Process the current line for single element extraction
    // Original: if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();
    // Cloned: check if it's still a string (hasn't been split yet)
    if (typeof currentLineData[currentLineIdx] === "string") {
      const parts = currentLineData[currentLineIdx].split(" ");
      // Reverse elements to pop from the end efficiently
      currentLineData[currentLineIdx] = parts.reverse();
    }

    // Extract the last element
    elementToReturn = currentLineData[currentLineIdx].pop();

    // If the line is now empty, advance to the next line
    if (currentLineData[currentLineIdx].length === 0) {
      this._linePointer++;
    }

    // Convert to number if not requested as string
    if (returnAsString) {
      return elementToReturn;
    } else {
      return Number(elementToReturn);
    }
  };

  DataStreamHandler.prototype.readEntireLine = function (returnAsString) {
    const lines = this._bufferedLines;
    const currentIdx = this._linePointer;

    // Guard clause: check for out-of-bounds access
    if (currentIdx >= lines.length) {
        if (this._debugMode) console.warn("Attempted to read line beyond input bounds.");
        return returnAsString ? [] : [];
    }

    // Extract and advance line pointer
    const lineContent = lines[currentIdx];
    this._linePointer = currentIdx + 1; // Increment after use

    // Split the line by space
    const elements = lineContent.split(" ");

    // Return as strings or numbers
    if (returnAsString) {
      return elements;
    } else {
      return elements.map(item => Number(item));
    }
  };

  DataStreamHandler.prototype.readBlockOfLines = function (numLines, returnAsString) {
    const startIdx = this._linePointer;
    const endIdx = startIdx + numLines;

    // Guard clause: check if requested block exceeds available lines
    if (endIdx > this._bufferedLines.length) {
      if (this._debugMode) console.warn(`Requested ${numLines} lines, but only ${this._bufferedLines.length - startIdx} available.`);
      numLines = this._bufferedLines.length - startIdx; // Adjust numLines to available
    }

    // Extract the slice of lines
    const slicedLines = this._bufferedLines.slice(startIdx, endIdx);
    // Advance the line pointer by the number of lines read
    this._linePointer += numLines;

    // Map each line to an array of elements
    const processedBlock = slicedLines.map(aLine => aLine.split(" "));

    // Return as strings or numbers (matrix format)
    if (returnAsString) {
      return processedBlock;
    } else {
      return processedBlock.map(row => row.map(item => Number(item)));
    }
  };

  DataStreamHandler.prototype.readRawLineBlock = function (count, asIs) {
    const currentPosition = this._linePointer;
    const finalPosition = currentPosition + count;

    // Ensure we don't read beyond the available lines
    const actualCount = Math.min(count, this._bufferedLines.length - currentPosition);

    const rawSegment = this._bufferedLines.slice(currentPosition, finalPosition);
    this._linePointer = finalPosition; // Update pointer

    // Return raw strings or convert to numbers
    if (asIs) {
      return rawSegment;
    } else {
      // New fragment: add validation for non-numeric lines if `asIs` is false
      return rawSegment.map(line => {
        const num = Number(line);
        if (isNaN(num)) {
          if (this._debugMode) console.warn(`Line "${line}" is not purely numeric, but conversion to number requested.`);
          // Fallback or error, depending on desired behavior. Here, return NaN.
        }
        return num;
      });
    }
  };

  return createProcessor;
})();

// --- Input stream instance (cloned from 'o') ---
const inputHandler = InputReaderUtility(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Multi-dimensional array creation utility (cloned from xArray, but removed as it's unused in the problem context) ---
// The original xArray function used `eval`, which is generally unsafe and can be replaced by direct recursive array creation
// if it were actually needed. Since it's not used in the main logic, it's deleted as a non-essential fragment.

// --- Large Number Library (Cloned and Heavily Modified bigInt Module) ---
const LargeNumberFactory = (function (undefined) {
  "use strict";

  // Core constants for chunking and precision
  const CHUNK_SIZE_BASE = 1e7; // Each chunk stores up to 10^7 - 1
  const CHUNK_LOGARITHM = 7; // log10(CHUNK_SIZE_BASE)
  const MAX_SAFE_JS_NUMBER = 9007199254740991; // 2^53 - 1, original was slightly off by 1
  const MAX_SAFE_JS_NUMBER_CHUNKS = convertJsNumToChunks(MAX_SAFE_JS_NUMBER);
  const LOG_MAX_SAFE_JS_NUMBER = Math.log(MAX_SAFE_JS_NUMBER);
  const KARATSUBA_THRESHOLD_CHUNKS = 35; // New constant for Karatsuba multiplication threshold

  // Helper function to determine if a number can be precisely represented by JavaScript's native Number type
  function canRepresentPrecisely(num) {
    return -MAX_SAFE_JS_NUMBER < num && num < MAX_SAFE_JS_NUMBER;
  }

  // Converts a JavaScript number to an array of chunks (base CHUNK_SIZE_BASE)
  function convertJsNumToChunks(numVal) {
    if (numVal < CHUNK_SIZE_BASE) return [numVal];
    if (numVal < CHUNK_SIZE_BASE * CHUNK_SIZE_BASE) return [numVal % CHUNK_SIZE_BASE, Math.floor(numVal / CHUNK_SIZE_BASE)];
    return [numVal % CHUNK_SIZE_BASE, Math.floor(numVal / CHUNK_SIZE_BASE) % CHUNK_SIZE_BASE, Math.floor(numVal / (CHUNK_SIZE_BASE * CHUNK_SIZE_BASE))];
  }

  // Converts an array of chunks back to a JavaScript number if possible
  function convertChunksToJsNum(chunkArr) {
    removeLeadingZeros(chunkArr); // Ensure no leading zeros
    const numChunks = chunkArr.length;
    if (numChunks < 4 && compareAbsoluteChunks(chunkArr, MAX_SAFE_JS_NUMBER_CHUNKS) < 0) {
      switch (numChunks) {
        case 0: return 0;
        case 1: return chunkArr[0];
        case 2: return chunkArr[0] + chunkArr[1] * CHUNK_SIZE_BASE;
        case 3: return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_SIZE_BASE) * CHUNK_SIZE_BASE; // Original was slightly different, this is more explicit
        default: break; // Should not reach here for numChunks < 4
      }
    }
    return chunkArr; // Return as chunk array if it's too large for JS native
  }

  // Removes leading zero chunks from an array
  function removeLeadingZeros(chunkVector) {
    let currentLength = chunkVector.length;
    if (currentLength === 0) { // New fragment: handle empty array
      chunkVector.push(0);
      return;
    }
    for (let k = currentLength - 1; k >= 0; --k) {
      if (chunkVector[k] !== 0) {
        chunkVector.length = k + 1;
        return;
      }
    }
    chunkVector.length = 1; // All zeros, so set length to 1 with value 0
    chunkVector[0] = 0;
  }

  // Creates and initializes an array with zeros
  function makeZeroFilledArray(arrayLength) {
    const newArray = new Array(arrayLength);
    for (let k = 0; k < arrayLength; k++) { // Changed while to for loop
      newArray[k] = 0;
    }
    return newArray;
  }

  // Truncates a number (floor for positive, ceil for negative)
  function floorOrCeil(num) {
    return (num > 0) ? Math.floor(num) : Math.ceil(num);
  }

  // Base class for LargeNumber operations
  function AbstractLargeNumber() {
    // Placeholder, concrete implementations are in LargeNumInternal and SmallNumInternal
  }

  // Represents a large number using an array of chunks
  function LargeNumInternal(chunkValues, isNegativeFlag) {
    this.numericChunks = chunkValues; // Renamed from 'value'
    this.isNegative = isNegativeFlag; // Renamed from 'sign'
    this.isJsNative = false; // Renamed from 'isSmall'
  }
  LargeNumInternal.prototype = Object.create(AbstractLargeNumber.prototype);

  // Represents a small number that fits within JavaScript's native Number type
  function SmallNumInternal(jsValue) {
    this.jsValue = jsValue; // Renamed from 'value'
    this.isNegative = jsValue < 0; // Renamed from 'sign'
    this.isJsNative = true; // Renamed from 'isSmall'
  }
  SmallNumInternal.prototype = Object.create(AbstractLargeNumber.prototype);

  // Factory function (formerly Integer)
  function LargeNumber(val, baseRadix) {
    // New fragment: Handle null/undefined input explicitly
    if (val === null || typeof val === "undefined") {
      return LargeNumber.zero;
    }
    if (typeof baseRadix !== "undefined") {
      // Original: +radix===10
      if (Number(baseRadix) === 10) { // Explicitly convert radix to number
        return normalizeInputToLargeNumber(val);
      } else {
        return parseStringWithBase(val, baseRadix);
      }
    }
    return normalizeInputToLargeNumber(val);
  }

  // --- Core Arithmetic Operations ---

  // Adds two chunk arrays (a >= b in length)
  function chunkwiseAdd(arrA, arrB) {
    const lenA = arrA.length, lenB = arrB.length;
    const resultChunks = new Array(lenA);
    let currentCarry = 0;
    let tempSum;

    for (let i = 0; i < lenB; i++) {
      tempSum = arrA[i] + arrB[i] + currentCarry;
      currentCarry = Math.floor(tempSum / CHUNK_SIZE_BASE);
      resultChunks[i] = tempSum % CHUNK_SIZE_BASE;
    }
    for (let i = lenB; i < lenA; i++) {
      tempSum = arrA[i] + currentCarry;
      currentCarry = Math.floor(tempSum / CHUNK_SIZE_BASE);
      resultChunks[i] = tempSum % CHUNK_SIZE_BASE;
    }
    if (currentCarry > 0) {
      resultChunks.push(currentCarry);
    }
    return resultChunks;
  }

  // Adds two chunk arrays, handling different lengths
  function flexibleChunkAdd(arrX, arrY) {
    if (arrX.length >= arrY.length) return chunkwiseAdd(arrX, arrY);
    return chunkwiseAdd(arrY, arrX); // Ensure the longer array is first
  }

  // Adds a small integer to a chunk array (used for `addSmall` in original)
  function addSmallIntToChunks(chunkArr, smallIntVal) {
    const len = chunkArr.length;
    const result = new Array(len);
    let carry = smallIntVal; // Renamed carry from original
    let tempSum;

    for (let i = 0; i < len; i++) {
      tempSum = chunkArr[i] + carry; // Original was a bit different: `a[i] - base + carry`
      carry = Math.floor(tempSum / CHUNK_SIZE_BASE);
      result[i] = tempSum % CHUNK_SIZE_BASE;
    }
    // New fragment: handle remaining carry more explicitly
    while (carry > 0) {
      result.push(carry % CHUNK_SIZE_BASE);
      carry = Math.floor(carry / CHUNK_SIZE_BASE);
    }
    return result;
  }

  LargeNumInternal.prototype.add = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    // If signs are different, it's a subtraction
    if (this.isNegative !== otherNum.isNegative) {
      return this.subtract(otherNum.flipSign());
    }
    const thisChunks = this.numericChunks;
    const otherChunks = otherNum.numericChunks;

    if (otherNum.isJsNative) {
      // Original: Math.abs(b)
      return new LargeNumInternal(addSmallIntToChunks(thisChunks, Math.abs(otherNum.jsValue)), this.isNegative);
    }
    return new LargeNumInternal(flexibleChunkAdd(thisChunks, otherChunks), this.isNegative);
  };
  LargeNumInternal.prototype.plus = LargeNumInternal.prototype.add;

  SmallNumInternal.prototype.add = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    const thisVal = this.jsValue;

    // If signs are different, it's a subtraction
    // Original: a<0!==n.sign
    if ((thisVal < 0 && !otherNum.isNegative) || (thisVal >= 0 && otherNum.isNegative)) {
      return this.subtract(otherNum.flipSign());
    }

    const otherValNum = otherNum.jsValue;
    if (otherNum.isJsNative) {
      const sum = thisVal + otherValNum;
      if (canRepresentPrecisely(sum)) return new SmallNumInternal(sum);
      // Fallback to large number arithmetic if sum exceeds JS precision
      // Original: b=smallToArray(Math.abs(b))
      const sumChunks = addSmallIntToChunks(convertJsNumToChunks(Math.abs(otherValNum)), Math.abs(thisVal));
      return new LargeNumInternal(sumChunks, thisVal < 0);
    }
    // If other number is LargeNumInternal, convert this to chunks and add
    return new LargeNumInternal(addSmallIntToChunks(otherNum.numericChunks, Math.abs(thisVal)), thisVal < 0);
  };
  SmallNumInternal.prototype.plus = SmallNumInternal.prototype.add;

  // Subtracts chunk array 'b' from 'a' (a >= b in absolute value)
  function chunkwiseSubtract(arrA, arrB) {
    const lenA = arrA.length, lenB = arrB.length;
    const result = new Array(lenA);
    let currentBorrow = 0;
    let tempDiff;

    for (let i = 0; i < lenB; i++) {
      tempDiff = arrA[i] - currentBorrow - arrB[i];
      if (tempDiff < 0) {
        tempDiff += CHUNK_SIZE_BASE;
        currentBorrow = 1;
      } else {
        currentBorrow = 0;
      }
      result[i] = tempDiff;
    }
    // Continue for remaining digits of A
    for (let i = lenB; i < lenA; i++) {
      tempDiff = arrA[i] - currentBorrow;
      if (tempDiff < 0) {
        tempDiff += CHUNK_SIZE_BASE;
      } else {
        result[i++] = tempDiff; // Original had this break; here, this is slightly different
        // New fragment: fill remaining elements
        while (i < lenA) {
          result[i] = arrA[i];
          i++;
        }
        break; // Exit after copying remaining elements
      }
      result[i] = tempDiff;
    }
    removeLeadingZeros(result);
    return result;
  }

  // Subtracts two numbers, handling signs and lengths
  function flexibleChunkSubtract(arrA, arrB, resultIsNegative) {
    let finalValue;
    // Original: if(compareAbs(a,b)>=0)
    const absComparisonResult = compareAbsoluteChunks(arrA, arrB);
    if (absComparisonResult >= 0) {
      finalValue = chunkwiseSubtract(arrA, arrB);
    } else {
      finalValue = chunkwiseSubtract(arrB, arrA);
      resultIsNegative = !resultIsNegative; // Flip sign if B was larger
    }
    finalValue = convertChunksToJsNum(finalValue);
    if (typeof finalValue === "number") {
      if (resultIsNegative) finalValue = -finalValue;
      return new SmallNumInternal(finalValue);
    }
    return new LargeNumInternal(finalValue, resultIsNegative);
  }

  // Subtracts a small integer from a chunk array
  function subtractSmallIntFromChunks(chunkArr, smallVal, resultIsNegative) {
    const len = chunkArr.length;
    const result = new Array(len);
    let carry = -smallVal; // Renamed from original 'carry' to 'borrow' conceptually
    let tempDiff;

    for (let i = 0; i < len; i++) {
      tempDiff = chunkArr[i] + carry;
      carry = Math.floor(tempDiff / CHUNK_SIZE_BASE);
      result[i] = tempDiff % CHUNK_SIZE_BASE;
      if (result[i] < 0) result[i] += CHUNK_SIZE_BASE; // Ensure positive chunk
    }
    const finalResult = convertChunksToJsNum(result);
    if (typeof finalResult === "number") {
      if (resultIsNegative) finalResult = -finalResult;
      return new SmallNumInternal(finalResult);
    }
    return new LargeNumInternal(finalResult, resultIsNegative);
  }

  LargeNumInternal.prototype.subtract = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    // If signs are different, it's an addition
    if (this.isNegative !== otherNum.isNegative) {
      return this.add(otherNum.flipSign());
    }
    const thisChunks = this.numericChunks;
    const otherChunks = otherNum.numericChunks;

    if (otherNum.isJsNative) {
      return subtractSmallIntFromChunks(thisChunks, Math.abs(otherNum.jsValue), this.isNegative);
    }
    return flexibleChunkSubtract(thisChunks, otherChunks, this.isNegative);
  };
  LargeNumInternal.prototype.minus = LargeNumInternal.prototype.subtract;

  SmallNumInternal.prototype.subtract = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    const thisVal = this.jsValue;

    // If signs are different, it's an addition
    // Original: a<0!==n.sign
    if ((thisVal < 0 && !otherNum.isNegative) || (thisVal >= 0 && otherNum.isNegative)) {
      return this.add(otherNum.flipSign());
    }

    const otherValNum = otherNum.jsValue;
    if (otherNum.isJsNative) {
      const difference = thisVal - otherValNum;
      if (canRepresentPrecisely(difference)) return new SmallNumInternal(difference);
      // Fallback to large number arithmetic
      return subtractSmallIntFromChunks(convertJsNumToChunks(Math.abs(otherValNum)), Math.abs(thisVal), thisVal >= 0);
    }
    // If other number is LargeNumInternal, convert this to chunks and subtract
    return subtractSmallIntFromChunks(otherNum.numericChunks, Math.abs(thisVal), thisVal >= 0);
  };
  SmallNumInternal.prototype.minus = SmallNumInternal.prototype.subtract;

  LargeNumInternal.prototype.flipSign = function () {
    return new LargeNumInternal(this.numericChunks, !this.isNegative);
  };
  SmallNumInternal.prototype.flipSign = function () {
    const newSign = !this.isNegative;
    const newSmall = new SmallNumInternal(-this.jsValue);
    newSmall.isNegative = newSign; // Explicitly set, as constructor infers from value
    return newSmall;
  };

  LargeNumInternal.prototype.absoluteValue = function () {
    return new LargeNumInternal(this.numericChunks, false);
  };
  SmallNumInternal.prototype.absoluteValue = function () {
    return new SmallNumInternal(Math.abs(this.jsValue));
  };

  // Multiplies two chunk arrays using standard long multiplication
  function longMultiplication(arrA, arrB) {
    const lenA = arrA.length, lenB = arrB.length;
    const result = makeZeroFilledArray(lenA + lenB);
    let productTerm, currentCarry;

    for (let i = 0; i < lenA; ++i) {
      const chunkA_i = arrA[i];
      currentCarry = 0; // Reset carry for each chunk of A
      for (let j = 0; j < lenB; ++j) {
        // Original: product=a_i*b_j+r[i+j]; carry=Math.floor(product/base); r[i+j]=product-carry*base; r[i+j+1]+=carry
        // Cloned: more explicit steps
        productTerm = chunkA_i * arrB[j] + result[i + j] + currentCarry;
        currentCarry = Math.floor(productTerm / CHUNK_SIZE_BASE);
        result[i + j] = productTerm % CHUNK_SIZE_BASE;
      }
      result[i + lenB] += currentCarry; // Add any remaining carry to the next position
    }
    removeLeadingZeros(result);
    return result;
  }

  // Multiplies a chunk array by a small integer
  function multiplyChunksBySmallInt(chunkArr, smallInt) {
    const len = chunkArr.length;
    const result = new Array(len);
    let currentCarry = 0;
    let product;

    for (let i = 0; i < len; i++) {
      product = chunkArr[i] * smallInt + currentCarry;
      currentCarry = Math.floor(product / CHUNK_SIZE_BASE);
      result[i] = product % CHUNK_SIZE_BASE;
    }
    while (currentCarry > 0) {
      result.push(currentCarry % CHUNK_SIZE_BASE);
      currentCarry = Math.floor(currentCarry / CHUNK_SIZE_BASE);
    }
    return result;
  }

  // Prepends zeros to a chunk array (for shifting)
  function prependZeros(chunkArr, numZeros) {
    const newArr = [];
    for (let i = 0; i < numZeros; ++i) newArr.push(0);
    return newArr.concat(chunkArr);
  }

  // Karatsuba multiplication algorithm
  function karatsubaProduct(arrX, arrY) {
    const len = Math.max(arrX.length, arrY.length);
    if (len < KARATSUBA_THRESHOLD_CHUNKS) return longMultiplication(arrX, arrY); // Use long multiplication for small inputs

    const halfLen = Math.ceil(len / 2);
    const xLow = arrX.slice(0, halfLen);
    const xHigh = arrX.slice(halfLen);
    const yLow = arrY.slice(0, halfLen);
    const yHigh = arrY.slice(halfLen);

    const productLow = karatsubaProduct(xLow, yLow); // ac
    const productHigh = karatsubaProduct(xHigh, yHigh); // bd
    const sumX = flexibleChunkAdd(xLow, xHigh);
    const sumY = flexibleChunkAdd(yLow, yHigh);
    const productSums = karatsubaProduct(sumX, sumY); // (a+b)(c+d) = ac + ad + bc + bd

    const middleTerm = chunkwiseSubtract(chunkwiseSubtract(productSums, productLow), productHigh); // ad + bc

    // Result = bd * (BASE^(2*halfLen)) + (ad+bc) * (BASE^halfLen) + ac
    const finalProduct = flexibleChunkAdd(
      flexibleChunkAdd(productLow, prependZeros(middleTerm, halfLen)),
      prependZeros(productHigh, 2 * halfLen)
    );
    removeLeadingZeros(finalProduct);
    return finalProduct;
  }

  // Heuristic to decide whether to use Karatsuba
  function shouldUseKaratsuba(len1, len2) {
    // Original: -.012*l1-.012*l2+15e-6*l1*l2>0
    // Cloned: simplified heuristic
    return (len1 * len2) > (len1 + len2) * 80; // A different heuristic for demonstration
  }

  LargeNumInternal.prototype.multiply = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    const thisChunks = this.numericChunks;
    const otherChunks = otherNum.numericChunks;
    const resultIsNegative = this.isNegative !== otherNum.isNegative;

    if (otherNum.isJsNative) {
      const otherJsVal = otherNum.jsValue;
      if (otherJsVal === 0) return LargeNumber.zero;
      if (otherJsVal === 1) return this;
      if (otherJsVal === -1) return this.flipSign();
      const absOtherJsVal = Math.abs(otherJsVal);
      if (absOtherJsVal < CHUNK_SIZE_BASE) {
        return new LargeNumInternal(multiplyChunksBySmallInt(thisChunks, absOtherJsVal), resultIsNegative);
      }
      // If small number is still large, convert to chunks
      return new LargeNumInternal(longMultiplication(thisChunks, convertJsNumToChunks(absOtherJsVal)), resultIsNegative);
    }

    if (shouldUseKaratsuba(thisChunks.length, otherChunks.length)) {
      return new LargeNumInternal(karatsubaProduct(thisChunks, otherChunks), resultIsNegative);
    }
    return new LargeNumInternal(longMultiplication(thisChunks, otherChunks), resultIsNegative);
  };
  LargeNumInternal.prototype.times = LargeNumInternal.prototype.multiply;

  // Helper for small number multiplication
  function multiplySmallAndChunkArray(smallJsVal, chunkArr, resultIsNegative) {
    if (smallJsVal < CHUNK_SIZE_BASE) {
      return new LargeNumInternal(multiplyChunksBySmallInt(chunkArr, smallJsVal), resultIsNegative);
    }
    return new LargeNumInternal(longMultiplication(chunkArr, convertJsNumToChunks(smallJsVal)), resultIsNegative);
  }

  LargeNumInternal.prototype._multiplyBySmallValue = function (otherSmallNum) {
    if (otherSmallNum.jsValue === 0) return LargeNumber.zero;
    if (otherSmallNum.jsValue === 1) return this;
    if (otherSmallNum.jsValue === -1) return this.flipSign();
    return multiplySmallAndChunkArray(Math.abs(otherSmallNum.jsValue), this.numericChunks, this.isNegative !== otherSmallNum.isNegative);
  };

  SmallNumInternal.prototype._multiplyBySmallValue = function (otherSmallNum) {
    const product = otherSmallNum.jsValue * this.jsValue;
    if (canRepresentPrecisely(product)) {
      return new SmallNumInternal(product);
    }
    return multiplySmallAndChunkArray(Math.abs(otherSmallNum.jsValue), convertJsNumToChunks(Math.abs(this.jsValue)), this.isNegative !== otherSmallNum.isNegative);
  };

  SmallNumInternal.prototype.multiply = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    // New fragment: direct multiplication for two SmallNumInternal
    if (otherNum.isJsNative) {
        const product = this.jsValue * otherNum.jsValue;
        if (canRepresentPrecisely(product)) {
            return new SmallNumInternal(product);
        }
    }
    return otherNum._multiplyBySmallValue(this);
  };
  SmallNumInternal.prototype.times = SmallNumInternal.prototype.multiply;

  // Squares a large number
  function selfMultiply(chunkArr) {
    const len = chunkArr.length;
    const result = makeZeroFilledArray(len + len);
    let currentCarry, product;

    for (let i = 0; i < len; i++) {
      const chunk_i = chunkArr[i];
      currentCarry = 0 - chunk_i * chunk_i; // Initialize carry based on diagonal term (new fragment: slightly different calculation)
      for (let j = i; j < len; j++) {
        product = 2 * (chunk_i * chunkArr[j]) + result[i + j] + currentCarry;
        currentCarry = Math.floor(product / CHUNK_SIZE_BASE);
        result[i + j] = product % CHUNK_SIZE_BASE;
      }
      result[i + len] = currentCarry; // Carry to the next higher-order chunk
    }
    removeLeadingZeros(result);
    return result;
  }

  LargeNumInternal.prototype.square = function () {
    return new LargeNumInternal(selfMultiply(this.numericChunks), false);
  };
  SmallNumInternal.prototype.square = function () {
    const squaredVal = this.jsValue * this.jsValue;
    if (canRepresentPrecisely(squaredVal)) return new SmallNumInternal(squaredVal);
    return new LargeNumInternal(selfMultiply(convertJsNumToChunks(Math.abs(this.jsValue))), false);
  };

  // --- Division and Modulo Operations ---

  // Division with normalization (Knuth's algorithm D)
  function longDivModFast(dividendChunks, divisorChunks) {
    const dividendLen = dividendChunks.length, divisorLen = divisorChunks.length;
    const quotient = makeZeroFilledArray(divisorLen);
    const divisorMostSignificantDigit = divisorChunks[divisorLen - 1];
    const normalizationFactor = Math.ceil(CHUNK_SIZE_BASE / (2 * divisorMostSignificantDigit)); // d
    const normalizedRemainder = multiplyChunksBySmallInt(dividendChunks, normalizationFactor);
    const normalizedDivisor = multiplyChunksBySmallInt(divisorChunks, normalizationFactor);
    let quotientGuess, shiftIdx, currentCarry, currentBorrow, tempLen, qDigit;

    if (normalizedRemainder.length <= dividendLen) normalizedRemainder.push(0);
    normalizedDivisor.push(0); // Pad divisor to make length comparison easier

    const newDivisorMSD = normalizedDivisor[divisorLen - 1]; // Recalculate after normalization

    for (shiftIdx = dividendLen - divisorLen; shiftIdx >= 0; shiftIdx--) {
      // Guess quotient digit
      quotientGuess = CHUNK_SIZE_BASE - 1;
      if (normalizedRemainder[shiftIdx + divisorLen] !== newDivisorMSD) {
        quotientGuess = Math.floor((normalizedRemainder[shiftIdx + divisorLen] * CHUNK_SIZE_BASE + normalizedRemainder[shiftIdx + divisorLen - 1]) / newDivisorMSD);
      }

      currentCarry = 0;
      currentBorrow = 0;
      tempLen = normalizedDivisor.length;

      // Multiply and subtract
      for (let i = 0; i < tempLen; i++) {
        currentCarry += quotientGuess * normalizedDivisor[i];
        qDigit = Math.floor(currentCarry / CHUNK_SIZE_BASE);
        currentBorrow += normalizedRemainder[shiftIdx + i] - (currentCarry % CHUNK_SIZE_BASE);
        currentCarry = qDigit;
        if (currentBorrow < 0) {
          normalizedRemainder[shiftIdx + i] = currentBorrow + CHUNK_SIZE_BASE;
          currentBorrow = -1;
        } else {
          normalizedRemainder[shiftIdx + i] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // Adjust quotient guess if subtraction resulted in borrow
      while (currentBorrow !== 0) {
        quotientGuess--;
        currentCarry = 0;
        for (let i = 0; i < tempLen; i++) {
          currentCarry += normalizedRemainder[shiftIdx + i] - CHUNK_SIZE_BASE + normalizedDivisor[i];
          if (currentCarry < 0) {
            normalizedRemainder[shiftIdx + i] = currentCarry + CHUNK_SIZE_BASE;
            currentCarry = 0;
          } else {
            normalizedRemainder[shiftIdx + i] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      quotient[shiftIdx] = quotientGuess;
    }

    const unNormalizedRemainder = divModBySmallInt(normalizedRemainder, normalizationFactor)[0]; // Un-normalize remainder
    return [convertChunksToJsNum(quotient), convertChunksToJsNum(unNormalizedRemainder)];
  }

  // Slower division algorithm (used for very large numbers or specific cases)
  function longDivModSlow(dividendChunks, divisorChunks) {
    const dividendLen = dividendChunks.length, divisorLen = divisorChunks.length;
    const quotientResult = [];
    let partialDividend = [];
    let currentDividendLen, highDividendPart, highDivisorPart, quotientEstimate;

    while (dividendLen > 0) {
      partialDividend.unshift(dividendChunks[dividendLen - 1]); // Take one chunk from dividend
      dividendLen--;
      removeLeadingZeros(partialDividend); // Trim partial dividend
      // If partial dividend is smaller than divisor, quotient digit is 0
      if (compareAbsoluteChunks(partialDividend, divisorChunks) < 0) {
        quotientResult.push(0);
        continue;
      }
      currentDividendLen = partialDividend.length;
      highDividendPart = partialDividend[currentDividendLen - 1] * CHUNK_SIZE_BASE + partialDividend[currentDividendLen - 2];
      highDivisorPart = divisorChunks[divisorLen - 1] * CHUNK_SIZE_BASE + divisorChunks[divisorLen - 2];

      if (currentDividendLen > divisorLen) {
        highDividendPart = (highDividendPart + 1) * CHUNK_SIZE_BASE; // Adjust estimate for length difference
      }
      quotientEstimate = Math.ceil(highDividendPart / highDivisorPart);

      let tempProduct;
      do {
        tempProduct = multiplyChunksBySmallInt(divisorChunks, quotientEstimate);
        if (compareAbsoluteChunks(tempProduct, partialDividend) <= 0) break; // Found good estimate
        quotientEstimate--;
      } while (quotientEstimate);

      quotientResult.push(quotientEstimate);
      partialDividend = chunkwiseSubtract(partialDividend, tempProduct); // Update partial dividend
    }
    quotientResult.reverse();
    return [convertChunksToJsNum(quotientResult), convertChunksToJsNum(partialDividend)];
  }

  // Divides a chunk array by a small integer
  function divModBySmallInt(chunkArr, smallIntDivisor) {
    const len = chunkArr.length;
    const quotient = makeZeroFilledArray(len);
    let currentRemainder = 0;
    let tempDividend, qDigit;

    for (let i = len - 1; i >= 0; --i) {
      tempDividend = currentRemainder * CHUNK_SIZE_BASE + chunkArr[i];
      qDigit = floorOrCeil(tempDividend / smallIntDivisor);
      currentRemainder = tempDividend - qDigit * smallIntDivisor;
      quotient[i] = qDigit | 0; // Ensure integer
    }
    return [quotient, currentRemainder | 0];
  }

  // Central function for division and modulo logic
  function performDivisionAndModulo(dividendObj, divisorObj) {
    const divisor = normalizeInputToLargeNumber(divisorObj);
    const dividendChunks = dividendObj.numericChunks;
    const divisorChunks = divisor.numericChunks;
    let quotientResult, remainderResult;

    if (divisor.isZeroValue()) throw new Error("Cannot divide by zero");

    if (dividendObj.isJsNative) {
      if (divisor.isJsNative) {
        return [new SmallNumInternal(floorOrCeil(dividendObj.jsValue / divisor.jsValue)), new SmallNumInternal(dividendObj.jsValue % divisor.jsValue)];
      }
      // If dividend is small, and divisor is large, quotient is 0, remainder is dividend
      return [LargeNumber.zero, dividendObj];
    }

    // If divisor is small
    if (divisor.isJsNative) {
      const smallDivisorVal = divisor.jsValue;
      if (smallDivisorVal === 1) return [dividendObj, LargeNumber.zero];
      if (smallDivisorVal === -1) return [dividendObj.flipSign(), LargeNumber.zero];

      const absSmallDivisor = Math.abs(smallDivisorVal);
      if (absSmallDivisor < CHUNK_SIZE_BASE) {
        const dmResult = divModBySmallInt(dividendChunks, absSmallDivisor);
        quotientResult = convertChunksToJsNum(dmResult[0]);
        remainderResult = dmResult[1];
        if (dividendObj.isNegative) remainderResult = -remainderResult;

        if (typeof quotientResult === "number") {
          if (dividendObj.isNegative !== divisor.isNegative) quotientResult = -quotientResult;
          return [new SmallNumInternal(quotientResult), new SmallNumInternal(remainderResult)];
        }
        return [new LargeNumInternal(quotientResult, dividendObj.isNegative !== divisor.isNegative), new SmallNumInternal(remainderResult)];
      }
      // If small divisor is still large, convert to chunks
      // Fall through to general division
    }

    const comparison = compareAbsoluteChunks(dividendChunks, divisorChunks);
    if (comparison === -1) return [LargeNumber.zero, dividendObj]; // Dividend < Divisor
    if (comparison === 0) return [LargeNumber.from(dividendObj.isNegative === divisor.isNegative ? 1 : -1), LargeNumber.zero]; // Dividend == Divisor

    // Choose division algorithm based on length
    // Original: a.length+b.length<=200
    if (dividendChunks.length + divisorChunks.length <= 250) { // Slightly different threshold
      [quotientResult, remainderResult] = longDivModFast(dividendChunks, divisorChunks);
    } else {
      [quotientResult, remainderResult] = longDivModSlow(dividendChunks, divisorChunks);
    }

    const quotientSign = dividendObj.isNegative !== divisor.isNegative;
    const remainderSign = dividendObj.isNegative;

    let finalQuotient, finalRemainder;

    if (typeof quotientResult === "number") {
      if (quotientSign) quotientResult = -quotientResult;
      finalQuotient = new SmallNumInternal(quotientResult);
    } else finalQuotient = new LargeNumInternal(quotientResult, quotientSign);

    if (typeof remainderResult === "number") {
      if (remainderSign) remainderResult = -remainderResult;
      finalRemainder = new SmallNumInternal(remainderResult);
    } else finalRemainder = new LargeNumInternal(remainderResult, remainderSign);

    return [finalQuotient, finalRemainder];
  }

  LargeNumInternal.prototype.getQuotientAndRemainder = function (otherVal) {
    const result = performDivisionAndModulo(this, otherVal);
    return { quotient: result[0], remainder: result[1] };
  };
  SmallNumInternal.prototype.getQuotientAndRemainder = LargeNumInternal.prototype.getQuotientAndRemainder;

  LargeNumInternal.prototype.getQuotient = function (otherVal) {
    return performDivisionAndModulo(this, otherVal)[0];
  };
  SmallNumInternal.prototype.getQuotient = LargeNumInternal.prototype.getQuotient;
  LargeNumInternal.prototype.over = LargeNumInternal.prototype.getQuotient;
  SmallNumInternal.prototype.over = SmallNumInternal.prototype.getQuotient;

  LargeNumInternal.prototype.getRemainder = function (otherVal) {
    return performDivisionAndModulo(this, otherVal)[1];
  };
  SmallNumInternal.prototype.getRemainder = LargeNumInternal.prototype.getRemainder;
  LargeNumInternal.prototype.remainder = LargeNumInternal.prototype.getRemainder;
  SmallNumInternal.prototype.remainder = SmallNumInternal.prototype.getRemainder;

  // --- Exponentiation ---
  LargeNumInternal.prototype.powerOf = function (exponentVal) {
    const exponentNum = normalizeInputToLargeNumber(exponentVal);
    const baseValue = this.numericChunks;
    const expValue = exponentNum.jsValue; // For small exponent, use JS native value

    if (expValue === 0) return LargeNumber.one;
    if (baseValue[0] === 0 && baseValue.length === 1) return LargeNumber.zero; // Base is 0
    if (baseValue[0] === 1 && baseValue.length === 1) return LargeNumber.one; // Base is 1
    if (this.isOneOrMinusOne() && this.isNegative) { // Base is -1
      return exponentNum.isEvenNumber() ? LargeNumber.one : LargeNumber.minusOne;
    }
    if (exponentNum.isNegativeValue()) {
      return LargeNumber.zero; // Negative exponents result in fractions/0 for integers
    }
    if (!exponentNum.isJsNative) {
      throw new Error("Exponent " + exponentNum.outputAsString() + " is too large for current implementation.");
    }

    if (this.isJsNative) {
      const result = Math.pow(this.jsValue, expValue);
      if (canRepresentPrecisely(result)) return new SmallNumInternal(floorOrCeil(result));
    }

    let currentBase = this;
    let resultAccumulator = LargeNumber.one;

    // Binary exponentiation (exponentiation by squaring)
    while (true) {
      if (expValue & 1) { // If exponent is odd
        resultAccumulator = resultAccumulator.times(currentBase);
      }
      // New fragment: explicit check for exponent becoming zero before squaring
      if (expValue === 0) break;
      currentBase = currentBase.square();
      // Original: b/=2;
      exponentVal = Math.floor(expValue / 2); // Use floor division
    }
    return resultAccumulator;
  };
  SmallNumInternal.prototype.powerOf = LargeNumInternal.prototype.powerOf;

  LargeNumInternal.prototype.modularExponentiation = function (exponent, modulus) {
    exponent = normalizeInputToLargeNumber(exponent);
    modulus = normalizeInputToLargeNumber(modulus);

    if (modulus.isZeroValue()) throw new Error("Cannot compute modPow with modulus 0");

    let result = LargeNumber.one;
    let base = this.getRemainder(modulus); // Base = this % modulus

    // New fragment: early exit for base being zero
    if (base.isZeroValue() && !exponent.isZeroValue()) return LargeNumber.zero;

    while (exponent.isPositiveValue()) {
      if (exponent.isOddNumber()) {
        result = result.multiply(base).getRemainder(modulus);
      }
      exponent = exponent.getQuotient(2); // exponent = floor(exponent / 2)
      base = base.square().getRemainder(modulus);
    }
    return result;
  };
  SmallNumInternal.prototype.modularExponentiation = LargeNumInternal.prototype.modularExponentiation;

  // --- Comparison Operations ---

  // Compares absolute values of two chunk arrays
  function compareAbsoluteChunks(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    // Iterate from MSB to LSB
    for (let i = arrA.length - 1; i >= 0; i--) {
      if (arrA[i] !== arrB[i]) return arrA[i] > arrB[i] ? 1 : -1;
    }
    return 0; // Equal
  }

  LargeNumInternal.prototype.compareAbsoluteWith = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    const thisChunks = this.numericChunks;
    const otherChunks = otherNum.numericChunks;

    if (otherNum.isJsNative) { // If other is small, this (large) is always greater
      return 1;
    }
    return compareAbsoluteChunks(thisChunks, otherChunks);
  };

  SmallNumInternal.prototype.compareAbsoluteWith = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    const thisAbsVal = Math.abs(this.jsValue);
    const otherChunks = otherNum.numericChunks;

    if (otherNum.isJsNative) {
      const otherAbsVal = Math.abs(otherNum.jsValue);
      return (thisAbsVal === otherAbsVal) ? 0 : (thisAbsVal > otherAbsVal ? 1 : -1);
    }
    return -1; // Small number is always smaller than a large number (in absolute value)
  };

  LargeNumInternal.prototype.compareWith = function (otherVal) {
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;

    const otherNum = normalizeInputToLargeNumber(otherVal);
    const thisChunks = this.numericChunks;
    const otherChunks = otherNum.numericChunks;

    // Compare signs first
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1; // If this is positive and other is negative, this is greater (1)
    }

    // If signs are the same
    if (otherNum.isJsNative) { // If other is small, and both have same sign, this (large) is greater (if positive) or smaller (if negative)
      return this.isNegative ? -1 : 1;
    }
    // Both are LargeNumInternal and have same sign
    const absComparison = compareAbsoluteChunks(thisChunks, otherChunks);
    return absComparison * (this.isNegative ? -1 : 1); // Flip result if negative
  };
  LargeNumInternal.prototype.compareTo = LargeNumInternal.prototype.compareWith;

  SmallNumInternal.prototype.compareWith = function (otherVal) {
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;

    const otherNum = normalizeInputToLargeNumber(otherVal);
    const thisVal = this.jsValue;
    const otherValJs = otherNum.jsValue;

    if (otherNum.isJsNative) {
      return (thisVal === otherValJs) ? 0 : (thisVal > otherValJs ? 1 : -1);
    }

    // If other is LargeNumInternal
    // Original: if(a<0!==n.sign)
    // Cloned: explicit check for sign difference
    if ((thisVal < 0 && !otherNum.isNegative) || (thisVal >= 0 && otherNum.isNegative)) {
      return thisVal < 0 ? -1 : 1; // If this is negative and other is positive, this is smaller (-1)
    }
    // Both are SmallNumInternal and LargeNumInternal, but have same sign
    // Since this is SmallNumInternal, it's always "smaller" in magnitude if `otherNum` is LargeNumInternal
    return thisVal < 0 ? 1 : -1; // If negative, SmallNum is "larger" (less negative). If positive, SmallNum is "smaller".
  };
  SmallNumInternal.prototype.compareTo = SmallNumInternal.prototype.compareWith;

  // --- Equality and Relational Operators ---
  LargeNumInternal.prototype.isEqualTo = function (otherVal) { return this.compareWith(otherVal) === 0; };
  SmallNumInternal.prototype.isEqualTo = LargeNumInternal.prototype.isEqualTo;
  LargeNumber.prototype.eq = LargeNumber.prototype.isEqualTo; // Add to factory directly

  LargeNumInternal.prototype.isNotEqualTo = function (otherVal) { return this.compareWith(otherVal) !== 0; };
  SmallNumInternal.prototype.isNotEqualTo = LargeNumInternal.prototype.isNotEqualTo;
  LargeNumber.prototype.neq = LargeNumber.prototype.isNotEqualTo;

  LargeNumInternal.prototype.isGreaterThan = function (otherVal) { return this.compareWith(otherVal) > 0; };
  SmallNumInternal.prototype.isGreaterThan = LargeNumInternal.prototype.isGreaterThan;
  LargeNumber.prototype.gt = LargeNumber.prototype.isGreaterThan;

  LargeNumInternal.prototype.isLesserThan = function (otherVal) { return this.compareWith(otherVal) < 0; };
  SmallNumInternal.prototype.isLesserThan = LargeNumInternal.prototype.isLesserThan;
  LargeNumber.prototype.lt = LargeNumber.prototype.isLesserThan;

  LargeNumInternal.prototype.isGreaterOrEqualTo = function (otherVal) { return this.compareWith(otherVal) >= 0; };
  SmallNumInternal.prototype.isGreaterOrEqualTo = LargeNumInternal.prototype.isGreaterOrEqualTo;
  LargeNumber.prototype.geq = LargeNumber.prototype.isGreaterOrEqualTo;

  LargeNumInternal.prototype.isLesserOrEqualTo = function (otherVal) { return this.compareWith(otherVal) <= 0; };
  SmallNumInternal.prototype.isLesserOrEqualTo = LargeNumInternal.prototype.isLesserOrEqualTo;
  LargeNumber.prototype.leq = LargeNumber.prototype.isLesserOrEqualTo;

  // --- Property Checkers ---
  LargeNumInternal.prototype.isEvenNumber = function () { return (this.numericChunks[0] & 1) === 0; };
  SmallNumInternal.prototype.isEvenNumber = function () { return (this.jsValue & 1) === 0; };

  LargeNumInternal.prototype.isOddNumber = function () { return (this.numericChunks[0] & 1) === 1; };
  SmallNumInternal.prototype.isOddNumber = function () { return (this.jsValue & 1) === 1; };

  LargeNumInternal.prototype.isPositiveValue = function () { return !this.isNegative; };
  SmallNumInternal.prototype.isPositiveValue = function () { return this.jsValue > 0; };

  LargeNumInternal.prototype.isNegativeValue = function () { return this.isNegative; };
  SmallNumInternal.prototype.isNegativeValue = function () { return this.jsValue < 0; };

  LargeNumInternal.prototype.isOneOrMinusOne = function () { return false; }; // Large numbers are not typically units unless explicitly checked
  SmallNumInternal.prototype.isOneOrMinusOne = function () { return Math.abs(this.jsValue) === 1; };

  LargeNumInternal.prototype.isZeroValue = function () { return false; }; // If it were zero, it would be SmallNumInternal(0)
  SmallNumInternal.prototype.isZeroValue = function () { return this.jsValue === 0; };

  LargeNumInternal.prototype.isDivisibleByValue = function (otherVal) {
    const otherNum = normalizeInputToLargeNumber(otherVal);
    const otherJsVal = otherNum.jsValue;
    if (otherJsVal === 0) return false;
    if (otherJsVal === 1) return true;
    if (otherJsVal === 2) return this.isEvenNumber();
    return this.getRemainder(otherNum).isEqualTo(LargeNumber.zero);
  };
  SmallNumInternal.prototype.isDivisibleByValue = LargeNumInternal.prototype.isDivisibleByValue;

  // --- Primality Testing ---
  function checkSmallPrime(numObj) {
    const absNum = numObj.absoluteValue();
    if (absNum.isOneOrMinusOne()) return false;
    if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
    if (absNum.isEvenNumber() || absNum.isDivisibleByValue(3) || absNum.isDivisibleByValue(5)) return false;
    if (absNum.isLesserThan(25)) return true; // Primes up to 23
    return undefined; // Not determined by basic checks
  }

  LargeNumInternal.prototype.checkPrimality = function () {
    const basicCheckResult = checkSmallPrime(this);
    if (basicCheckResult !== undefined) return basicCheckResult;

    const num = this.absoluteValue();
    const numMinusOne = num.decrementValue(); // n-1
    const witnessBases = [2, 3, 5, 7, 11, 13, 17, 19];
    let dVal = numMinusOne; // d
    let sCount = 0; // s

    // Original: while(b.isEven())b=b.divide(2);
    while (dVal.isEvenNumber()) {
      dVal = dVal.getQuotient(2);
      sCount++; // New fragment: track 's' for Miller-Rabin
    }

    for (let i = 0; i < witnessBases.length; i++) {
      let x = LargeNumber(witnessBases[i]).modularExponentiation(dVal, num);
      if (x.isEqualTo(LargeNumber.one) || x.isEqualTo(numMinusOne)) continue;

      let primeCandidate = true; // Assume prime until proven composite
      for (let r = 0; r < sCount; r++) { // Loop s-1 times
        x = x.square().getRemainder(num);
        if (x.isEqualTo(numMinusOne)) {
          primeCandidate = false; // Witness passed
          break;
        }
      }
      if (primeCandidate) return false; // Found a composite witness
    }
    return true; // Likely prime
  };
  SmallNumInternal.prototype.checkPrimality = LargeNumInternal.prototype.checkPrimality;

  LargeNumInternal.prototype.checkProbablePrimality = function (numIterations) {
    const basicCheckResult = checkSmallPrime(this);
    if (basicCheckResult !== undefined) return basicCheckResult;

    const num = this.absoluteValue();
    const testCount = numIterations === undefined ? 5 : numIterations; // Default iterations
    const numMinusTwo = num.subtract(2); // New fragment: precompute n-2
    if (numMinusTwo.isLesserThan(LargeNumber.one)) return true; // Handle small numbers (2,3,4)

    for (let i = 0; i < testCount; i++) {
      const randomBase = LargeNumber.generateRandomBetween(LargeNumber(2), numMinusTwo); // a in [2, n-2]
      if (!randomBase.modularExponentiation(num.decrementValue(), num).isOneOrMinusOne()) {
        return false; // Composite
      }
    }
    return true; // Probable prime
  };
  SmallNumInternal.prototype.checkProbablePrimality = LargeNumInternal.prototype.checkProbablePrimality;

  // --- Modular Inverse (Extended Euclidean Algorithm) ---
  LargeNumInternal.prototype.modularInverse = function (modulus) {
    let t = LargeNumber.zero, newT = LargeNumber.one;
    let r = normalizeInputToLargeNumber(modulus);
    let newR = this.absoluteValue();
    let lastT, lastR, quotient;

    // New fragment: guard against invalid modulus or co-prime issues
    if (modulus.isZeroValue() || modulus.isOneOrMinusOne()) {
        throw new Error("Modulus must be greater than 1 for modular inverse.");
    }
    if (this.isZeroValue() || this.compareAbsoluteWith(modulus) >= 0 && this.getRemainder(modulus).isZeroValue()) {
        throw new Error("Cannot compute modular inverse for " + this.outputAsString() + " mod " + modulus.outputAsString() + " (not coprime).");
    }

    while (!newR.isZeroValue()) {
      quotient = r.getQuotient(newR);
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.subtract(quotient.multiply(newT));
      newR = lastR.subtract(quotient.multiply(newR));
    }

    if (!r.isEqualTo(LargeNumber.one)) {
      throw new Error(this.outputAsString() + " and " + modulus.outputAsString() + " are not coprime");
    }

    if (t.compareWith(0) === -1) { // If t is negative
      t = t.add(modulus);
    }
    if (this.isNegativeValue()) {
      return t.flipSign();
    }
    return t;
  };
  SmallNumInternal.prototype.modularInverse = LargeNumInternal.prototype.modularInverse;

  // --- Increment/Decrement ---
  LargeNumInternal.prototype.incrementValue = function () { // next
    const currentChunks = this.numericChunks;
    if (this.isNegative) {
      return subtractSmallIntFromChunks(currentChunks, 1, this.isNegative); // -5 becomes -4
    }
    return new LargeNumInternal(addSmallIntToChunks(currentChunks, 1), this.isNegative);
  };
  SmallNumInternal.prototype.incrementValue = function () { // next
    const val = this.jsValue;
    if (val + 1 < MAX_SAFE_JS_NUMBER) return new SmallNumInternal(val + 1);
    return new LargeNumInternal(MAX_SAFE_JS_NUMBER_CHUNKS, false);
  };

  LargeNumInternal.prototype.decrementValue = function () { // prev
    const currentChunks = this.numericChunks;
    if (this.isNegative) {
      return new LargeNumInternal(addSmallIntToChunks(currentChunks, 1), true); // -4 becomes -5
    }
    return subtractSmallIntFromChunks(currentChunks, 1, this.isNegative);
  };
  SmallNumInternal.prototype.decrementValue = function () { // prev
    const val = this.jsValue;
    if (val - 1 > -MAX_SAFE_JS_NUMBER) return new SmallNumInternal(val - 1);
    return new LargeNumInternal(MAX_SAFE_JS_NUMBER_CHUNKS, true); // MAX_INT_ARR becomes MAX_INT_ARR with negative sign
  };

  // --- Bitwise Operations ---
  const chunkPowersOfTwo = [1];
  while (2 * chunkPowersOfTwo[chunkPowersOfTwo.length - 1] <= CHUNK_SIZE_BASE) {
    chunkPowersOfTwo.push(2 * chunkPowersOfTwo[chunkPowersOfTwo.length - 1]);
  }
  const chunkPowersCount = chunkPowersOfTwo.length;
  const maxChunkPowerOfTwo = chunkPowersOfTwo[chunkPowersCount - 1];

  function isShiftAmountSmall(shiftAmount) {
    return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && Math.abs(Number(shiftAmount)) <= CHUNK_SIZE_BASE || (shiftAmount instanceof LargeNumInternal && shiftAmount.numericChunks.length <= 1);
  }

  LargeNumInternal.prototype.bitwiseShiftLeft = function (shiftAmount) {
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(`Shift amount ${String(shiftAmount)} is too large.`);
    }
    let sVal = Number(shiftAmount);
    if (sVal < 0) return this.bitwiseShiftRight(-sVal);

    let currentResult = this;
    if (currentResult.isZeroValue()) return currentResult;

    // Shift by full chunk powers
    for (; sVal >= chunkPowersCount; sVal -= (chunkPowersCount - 1)) { // Changed while to for loop
      currentResult = currentResult.multiply(maxChunkPowerOfTwo);
    }
    // Shift by remaining smaller power
    return currentResult.multiply(chunkPowersOfTwo[sVal]);
  };
  SmallNumInternal.prototype.bitwiseShiftLeft = LargeNumInternal.prototype.bitwiseShiftLeft;

  LargeNumInternal.prototype.bitwiseShiftRight = function (shiftAmount) {
    let sVal = Number(shiftAmount);
    if (!isShiftAmountSmall(sVal)) {
      throw new Error(`Shift amount ${String(sVal)} is too large.`);
    }
    if (sVal < 0) return this.bitwiseShiftLeft(-sVal);

    let currentResult = this;

    // Shift by full chunk powers
    for (; sVal >= chunkPowersCount; sVal -= (chunkPowersCount - 1)) { // Changed while to for loop
      if (currentResult.isZeroValue() || (currentResult.isNegativeValue() && currentResult.isOneOrMinusOne())) {
        return currentResult;
      }
      const [quotient, remainder] = performDivisionAndModulo(currentResult, LargeNumber(maxChunkPowerOfTwo));
      currentResult = remainder.isNegativeValue() ? quotient.decrementValue() : quotient;
    }
    // Shift by remaining smaller power
    const [quotient, remainder] = performDivisionAndModulo(currentResult, LargeNumber(chunkPowersOfTwo[sVal]));
    return remainder.isNegativeValue() ? quotient.decrementValue() : quotient;
  };
  SmallNumInternal.prototype.bitwiseShiftRight = LargeNumInternal.prototype.bitwiseShiftRight;

  const LOW_BIT_MASK_JS = 1 << 30; // Original: LOBMASK_I
  const LOW_BIT_MASK_CHUNK = (CHUNK_SIZE_BASE & -CHUNK_SIZE_BASE) * (CHUNK_SIZE_BASE & -CHUNK_SIZE_BASE) | LOW_BIT_MASK_JS; // Original: LOBMASK_BI

  function performBitwiseOp(numX, numY, operationFn) {
    numY = normalizeInputToLargeNumber(numY);
    const xIsNegative = numX.isNegativeValue();
    const yIsNegative = numY.isNegativeValue();

    let xRemaining = xIsNegative ? numX.bitwiseNot() : numX;
    let yRemaining = yIsNegative ? numY.bitwiseNot() : numY;

    let xChunkVal = 0, yChunkVal = 0;
    let xDivModResult = null, yDivModResult = null;
    const bitwiseResultChunks = [];

    while (!xRemaining.isZeroValue() || !yRemaining.isZeroValue()) {
      xDivModResult = performDivisionAndModulo(xRemaining, LargeNumber(maxChunkPowerOfTwo));
      xChunkVal = xDivModResult[1].getJsNumber();
      if (xIsNegative) {
        xChunkVal = maxChunkPowerOfTwo - 1 - xChunkVal;
      }

      yDivModResult = performDivisionAndModulo(yRemaining, LargeNumber(maxChunkPowerOfTwo));
      yChunkVal = yDivModResult[1].getJsNumber();
      if (yIsNegative) {
        yChunkVal = maxChunkPowerOfTwo - 1 - yChunkVal;
      }

      xRemaining = xDivModResult[0];
      yRemaining = yDivModResult[0];
      bitwiseResultChunks.push(operationFn(xChunkVal, yChunkVal));
    }

    let finalSum = (operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0) ? LargeNumber.minusOne : LargeNumber.zero;

    // Reconstruct the number from bitwise result chunks
    for (let i = bitwiseResultChunks.length - 1; i >= 0; i--) {
      finalSum = finalSum.multiply(maxChunkPowerOfTwo).add(LargeNumber(bitwiseResultChunks[i]));
    }
    return finalSum;
  }

  LargeNumInternal.prototype.bitwiseNot = function () { return this.flipSign().decrementValue(); };
  SmallNumInternal.prototype.bitwiseNot = LargeNumInternal.prototype.bitwiseNot;

  LargeNumInternal.prototype.bitwiseAnd = function (otherVal) { return performBitwiseOp(this, otherVal, (a, b) => a & b); };
  SmallNumInternal.prototype.bitwiseAnd = LargeNumInternal.prototype.bitwiseAnd;

  LargeNumInternal.prototype.bitwiseOr = function (otherVal) { return performBitwiseOp(this, otherVal, (a, b) => a | b); };
  SmallNumInternal.prototype.bitwiseOr = LargeNumInternal.prototype.bitwiseOr;

  LargeNumInternal.prototype.bitwiseXor = function (otherVal) { return performBitwiseOp(this, otherVal, (a, b) => a ^ b); };
  SmallNumInternal.prototype.bitwiseXor = LargeNumInternal.prototype.bitwiseXor;

  // --- Miscellaneous Utilities ---

  function findLowestSetBit(numObj) {
    const chunkData = numObj.numericChunks;
    // Original: x=typeof v==="number"?v|LOBMASK_I:v[0]+v[1]*BASE|LOBMASK_BI;
    const tempVal = (typeof chunkData === "number") ? chunkData | LOW_BIT_MASK_JS : chunkData[0] + chunkData[1] * CHUNK_SIZE_BASE | LOW_BIT_MASK_CHUNK;
    return tempVal & -tempVal;
  }

  // Calculates integer logarithm (base 2)
  function calcIntegerLog(valueNum, baseNum) {
    if (baseNum.compareWith(valueNum) <= 0) {
      const tempResult = calcIntegerLog(valueNum, baseNum.square());
      const p = tempResult.p;
      const e = tempResult.e;
      const t = p.multiply(baseNum);
      return t.compareWith(valueNum) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
    }
    return { p: LargeNumber(1), e: 0 };
  }

  LargeNumInternal.prototype.getBitLength = function () {
    let currentNum = this;
    if (currentNum.isLesserThan(LargeNumber.zero)) {
      currentNum = currentNum.flipSign().decrementValue();
    }
    if (currentNum.isEqualTo(LargeNumber.zero)) {
      return LargeNumber.zero;
    }
    return LargeNumber(calcIntegerLog(currentNum, LargeNumber(2)).e).add(LargeNumber(1));
  };
  SmallNumInternal.prototype.getBitLength = LargeNumInternal.prototype.getBitLength;

  function getMaximum(valA, valB) {
    valA = normalizeInputToLargeNumber(valA);
    valB = normalizeInputToLargeNumber(valB);
    return valA.isGreaterThan(valB) ? valA : valB;
  }
  function getMinimum(valA, valB) {
    valA = normalizeInputToLargeNumber(valA);
    valB = normalizeInputToLargeNumber(valB);
    return valA.isLesserThan(valB) ? valA : valB;
  }

  function greatestCommonDivisor(numA, numB) {
    let currentA = normalizeInputToLargeNumber(numA).absoluteValue();
    let currentB = normalizeInputToLargeNumber(numB).absoluteValue();

    if (currentA.isEqualTo(currentB)) return currentA;
    if (currentA.isZeroValue()) return currentB;
    if (currentB.isZeroValue()) return currentA;

    let commonFactor = LargeNumber.one;
    let tempVal;

    while (currentA.isEvenNumber() && currentB.isEvenNumber()) {
      // Original: d=Math.min(roughLOB(a),roughLOB(b)); a=a.divide(d); b=b.divide(d); c=c.multiply(d)
      const lowestBitA = findLowestSetBit(currentA);
      const lowestBitB = findLowestSetBit(currentB);
      const minLowestBit = Math.min(lowestBitA, lowestBitB); // This is a JS number
      currentA = currentA.getQuotient(minLowestBit);
      currentB = currentB.getQuotient(minLowestBit);
      commonFactor = commonFactor.multiply(minLowestBit);
    }
    while (currentA.isEvenNumber()) {
      currentA = currentA.getQuotient(findLowestSetBit(currentA));
    }

    do {
      while (currentB.isEvenNumber()) {
        currentB = currentB.getQuotient(findLowestSetBit(currentB));
      }
      if (currentA.isGreaterThan(currentB)) {
        tempVal = currentB;
        currentB = currentA;
        currentA = tempVal;
      }
      currentB = currentB.subtract(currentA);
    } while (!currentB.isZeroValue());

    return commonFactor.isOneOrMinusOne() ? currentA : currentA.multiply(commonFactor);
  }

  function leastCommonMultiple(numA, numB) {
    numA = normalizeInputToLargeNumber(numA).absoluteValue();
    numB = normalizeInputToLargeNumber(numB).absoluteValue();
    return numA.getQuotient(greatestCommonDivisor(numA, numB)).multiply(numB);
  }

  function generateRandomBetween(lowerBound, upperBound) {
    let low = getMinimum(lowerBound, upperBound);
    let high = getMaximum(lowerBound, upperBound);
    const range = high.subtract(low).add(1);

    if (range.isJsNative) {
      return low.add(Math.floor(Math.random() * range.jsValue));
    }

    const rangeChunkLength = range.numericChunks.length - 1;
    const resultChunks = [];
    let restrictedToRange = true;

    for (let i = rangeChunkLength; i >= 0; i--) {
      const upperLimit = restrictedToRange ? range.numericChunks[i] : CHUNK_SIZE_BASE;
      const digit = floorOrCeil(Math.random() * upperLimit);
      resultChunks.unshift(digit);
      if (digit < upperLimit) restrictedToRange = false;
    }
    const finalResult = convertChunksToJsNum(resultChunks);
    return low.add(typeof finalResult === "number" ? new SmallNumInternal(finalResult) : new LargeNumInternal(finalResult, false));
  }

  // --- Parsing and Serialization ---

  const digitToCharMap = "0123456789abcdefghijklmnopqrstuvwxyz";

  function digitToChar(digitVal) {
    if (digitVal <= 35) {
      return digitToCharMap.charAt(digitVal);
    }
    return `<${digitVal}>`; // For bases > 36, use custom representation
  }

  function parseStringWithBase(textString, baseVal) {
    const stringLength = textString.length;
    // New fragment: basic input validation
    if (stringLength === 0) return LargeNumber.zero;

    let isInputNegative = textString[0] === "-";
    let processedText = isInputNegative ? textString.substring(1) : textString;
    const absBase = Math.abs(Number(baseVal)); // Ensure base is numeric

    // Initial character validation (rewritten)
    for (let i = 0; i < processedText.length; i++) {
      const char = processedText[i].toLowerCase();
      const charCode = char.charCodeAt(0);
      let digitValue;
      if (charCode >= 48 && charCode <= 57) { // '0'-'9'
        digitValue = charCode - 48;
      } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'
        digitValue = charCode - 87;
      } else if (char === "<") { // Custom digit format <val>
        let endIndex = processedText.indexOf(">", i + 1);
        if (endIndex === -1) throw new Error(`Malformed custom digit in base ${baseVal}: ${processedText.substring(i)}`);
        digitValue = Number(processedText.substring(i + 1, endIndex));
        i = endIndex; // Advance index past custom digit
      } else {
        throw new Error(`Invalid character '${char}' for base ${baseVal}.`);
      }
      if (digitValue >= absBase) {
        throw new Error(`Digit '${char}' is too large for base ${baseVal}.`);
      }
    }

    // Optimized path for small bases and small numbers
    if (baseVal >= 2 && baseVal <= 36) {
      // Original: if(length<=LOG_MAX_INT/Math.log(base))
      if (stringLength <= LOG_MAX_SAFE_JS_NUMBER / Math.log(baseVal)) {
        const parsedJsNum = parseInt(processedText, baseVal);
        if (!isNaN(parsedJsNum)) return new SmallNumInternal(parsedJsNum);
      }
    }

    const baseAsLargeNum = normalizeInputToLargeNumber(baseVal);
    const digitValues = [];
    for (let i = 0; i < processedText.length; i++) {
        const char = processedText[i].toLowerCase();
        const charCode = char.charCodeAt(0);
        if (charCode >= 48 && charCode <= 57) digitValues.push(LargeNumber(char));
        else if (charCode >= 97 && charCode <= 122) digitValues.push(LargeNumber(charCode - 87));
        else if (char === "<") {
            let start = i;
            do { i++; } while (processedText[i] !== ">");
            digitValues.push(LargeNumber(processedText.slice(start + 1, i)));
        } else throw new Error(`Invalid character '${char}' in base ${baseVal}`);
    }
    return constructFromDigitArray(digitValues, baseAsLargeNum, isInputNegative);
  }

  function constructFromDigitArray(digitsArray, baseNum, isNegative) {
    let accumulatedValue = LargeNumber.zero;
    let currentPower = LargeNumber.one; // Starts as base^0

    // Iterate from right to left (least significant digit to most significant)
    for (let i = digitsArray.length - 1; i >= 0; i--) {
      accumulatedValue = accumulatedValue.add(digitsArray[i].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNegative ? accumulatedValue.flipSign() : accumulatedValue;
  }

  function convertToBaseArray(numObj, baseNum) {
    baseNum = LargeNumber(baseNum);
    // New fragment: handle edge cases for base
    if (baseNum.isZeroValue()) {
      if (numObj.isZeroValue()) return { value: [0], isNegative: false };
      throw new Error("Cannot convert non-zero numbers to base 0.");
    }
    if (baseNum.isEqualTo(LargeNumber.minusOne)) {
      // Base -1 (negabase) is complex, original implementation was specific. Reimplementing to be more generic.
      if (numObj.isZeroValue()) return { value: [0], isNegative: false };
      throw new Error("Conversion to base -1 is not fully supported in this clone."); // Simplified for clone
    }

    let isResultNegative = false;
    let currentNum = numObj;
    if (numObj.isNegativeValue() && baseNum.isPositiveValue()) {
      isResultNegative = true;
      currentNum = numObj.absoluteValue();
    }

    if (baseNum.isEqualTo(LargeNumber.one)) {
      if (currentNum.isZeroValue()) return { value: [0], isNegative: false };
      // For base 1, array is just '1' repeated N times.
      // Original: Array.apply(null,Array(+n)).map(Number.prototype.valueOf,1)
      const count = currentNum.getJsNumber(); // Assumes n fits in JS number for base 1
      const onesArray = new Array(count).fill(1);
      return { value: onesArray, isNegative: isResultNegative };
    }

    const outputDigits = [];
    let divModResult;

    // Loop until currentNum is smaller than base (or 0)
    while (currentNum.isNegativeValue() || currentNum.compareAbsoluteWith(baseNum) >= 0) {
      divModResult = performDivisionAndModulo(currentNum, baseNum);
      currentNum = divModResult[0]; // Quotient
      let digit = divModResult[1]; // Remainder

      if (digit.isNegativeValue()) {
        digit = baseNum.subtract(digit).absoluteValue(); // Adjust negative remainder
        currentNum = currentNum.incrementValue(); // Adjust quotient
      }
      outputDigits.push(digit.getJsNumber());
    }
    outputDigits.push(currentNum.getJsNumber()); // Add the last quotient

    return { value: outputDigits.reverse(), isNegative: isResultNegative };
  }

  function convertToBaseString(numObj, baseNum) {
    const baseArrayResult = convertToBaseArray(numObj, baseNum);
    return (baseArrayResult.isNegative ? "-" : "") + baseArrayResult.value.map(digitToChar).join("");
  }

  LargeNumInternal.prototype.outputAsBaseArray = function (radix) { return convertToBaseArray(this, radix); };
  SmallNumInternal.prototype.outputAsBaseArray = LargeNumInternal.prototype.outputAsBaseArray;

  LargeNumInternal.prototype.outputAsString = function (radix) {
    const actualRadix = radix === undefined ? 10 : radix;
    if (actualRadix !== 10) return convertToBaseString(this, actualRadix);

    const chunkData = this.numericChunks;
    let len = chunkData.length;
    let resultString = String(chunkData[--len]); // Start with MSB
    const zeroPadding = "0000000"; // For CHUNK_LOGARITHM = 7

    while (--len >= 0) {
      const chunkString = String(chunkData[len]);
      resultString += zeroPadding.slice(chunkString.length) + chunkString;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + resultString;
  };
  SmallNumInternal.prototype.outputAsString = function (radix) {
    const actualRadix = radix === undefined ? 10 : radix;
    if (actualRadix !== 10) return convertToBaseString(this, actualRadix);
    return String(this.jsValue);
  };

  LargeNumInternal.prototype.serializeToJSON = SmallNumInternal.prototype.serializeToJSON = function () {
    return this.outputAsString();
  };

  LargeNumInternal.prototype.getJsValue = function () { return parseInt(this.outputAsString(), 10); };
  LargeNumInternal.prototype.getJsNumber = LargeNumInternal.prototype.getJsValue;
  SmallNumInternal.prototype.getJsValue = function () { return this.jsValue; };
  SmallNumInternal.prototype.getJsNumber = SmallNumInternal.prototype.getJsValue;

  function parseStringInput(rawString) {
    if (!rawString || typeof rawString !== 'string') { // New fragment: additional check
        throw new Error("Invalid string input: " + rawString);
    }
    let isNegativeInput = false;
    if (rawString.startsWith("-")) {
      isNegativeInput = true;
      rawString = rawString.substring(1);
    }

    const exponentSplit = rawString.split(/e/i);
    if (exponentSplit.length > 2) throw new Error("Invalid integer format: " + rawString);

    if (exponentSplit.length === 2) {
      let expPart = exponentSplit[1];
      if (expPart.startsWith("+")) expPart = expPart.substring(1);
      const exponentValue = Number(expPart);
      if (!Number.isInteger(exponentValue) || !canRepresentPrecisely(exponentValue)) {
        throw new Error("Invalid exponent: " + exponentValue + " is not a valid integer exponent.");
      }

      let mantissaText = exponentSplit[0];
      const decimalPointIndex = mantissaText.indexOf(".");
      if (decimalPointIndex >= 0) {
        // Adjust exponent for decimal places
        const decimalDigitsCount = mantissaText.length - decimalPointIndex - 1;
        exponentValue -= decimalDigitsCount;
        mantissaText = mantissaText.slice(0, decimalPointIndex) + mantissaText.slice(decimalPointIndex + 1);
      }
      if (exponentValue < 0) {
        throw new Error("Cannot handle negative exponents for integer parsing (results in non-integer).");
      }
      // Pad with zeros for positive exponent
      mantissaText += "0".repeat(exponentValue);
      rawString = mantissaText;
    }

    // Validate string content (only digits)
    if (!/^([0-9][0-9]*)$/.test(rawString)) {
      throw new Error("Invalid integer string: " + rawString);
    }

    const chunkArray = [];
    let maxLength = rawString.length;
    const chunkSize = CHUNK_LOGARITHM; // Original: l
    let currentMin = maxLength - chunkSize;

    while (maxLength > 0) {
      chunkArray.push(Number(rawString.slice(Math.max(0, currentMin), maxLength)));
      maxLength -= chunkSize;
      currentMin -= chunkSize;
    }
    removeLeadingZeros(chunkArray);
    return new LargeNumInternal(chunkArray, isNegativeInput);
  }

  function parseNumberInput(numVal) {
    if (canRepresentPrecisely(numVal)) {
      if (!Number.isInteger(numVal)) throw new Error(numVal + " is not an integer.");
      return new SmallNumInternal(numVal);
    }
    return parseStringInput(numVal.toString());
  }

  // Universal input normalizer
  function normalizeInputToLargeNumber(input) {
    if (typeof input === "number") {
      return parseNumberInput(input);
    }
    if (typeof input === "string") {
      return parseStringInput(input);
    }
    // New fragment: handle BigInt native type if available (future-proofing)
    if (typeof input === "bigint") {
        return parseStringInput(input.toString());
    }
    // Assume it's already a LargeNumber object
    return input;
  }

  // Initialize common LargeNumber constants
  for (let i = 0; i < 1000; i++) { // Only pre-cache up to 999
    LargeNumber[i] = new SmallNumInternal(i);
    if (i > 0) LargeNumber[-i] = new SmallNumInternal(-i);
  }
  LargeNumber.one = LargeNumber[1];
  LargeNumber.zero = LargeNumber[0];
  LargeNumber.minusOne = LargeNumber[-1];

  // Attach static methods to the factory
  LargeNumber.getMaximum = getMaximum;
  LargeNumber.getMinimum = getMinimum;
  LargeNumber.greatestCommonDivisor = greatestCommonDivisor;
  LargeNumber.leastCommonMultiple = leastCommonMultiple;
  LargeNumber.isLargeNumberInstance = function (obj) { return obj instanceof LargeNumInternal || obj instanceof SmallNumInternal; };
  LargeNumber.generateRandomBetween = generateRandomBetween;
  LargeNumber.createFromArray = function (digits, base, isNegative) {
    return constructFromDigitArray(digits.map(normalizeInputToLargeNumber), normalizeInputToLargeNumber(base || 10), isNegative);
  };
  LargeNumber.from = normalizeInputToLargeNumber; // New fragment: simplified alias for parseValue

  return LargeNumber;
})();

// --- Main Program Logic ---
const MODULUS_VALUE_JS = 1e9 + 7;
const MODULUS_VALUE_LN = LargeNumberFactory(MODULUS_VALUE_JS); // Pre-compute BigInt version of modulus
const LN_ZERO = LargeNumberFactory.zero; // Re-alias for convenience

function solveProblem() {
  // Read number of elements
  const totalElementsCount = inputHandler.readNextElement();
  // Read array of numbers
  const inputNumbersArray = inputHandler.readEntireLine();

  // Calculate LCM of all input numbers
  let currentLcm = LargeNumberFactory.from(inputNumbersArray[0]);
  for (let idx = 1; idx < totalElementsCount; ++idx) {
    const nextNum = LargeNumberFactory.from(inputNumbersArray[idx]);
    currentLcm = LargeNumberFactory.leastCommonMultiple(currentLcm, nextNum);
  }
  currentLcm = currentLcm.getRemainder(MODULUS_VALUE_LN);

  // Calculate sum of modular inverses
  let finalSumResult = LN_ZERO;
  for (let idx = 0; idx < totalElementsCount; ++idx) {
    const currentNumber = LargeNumberFactory.from(inputNumbersArray[idx]);
    // New fragment: Guard against zero or non-coprime numbers for modInv
    if (currentNumber.isZeroValue() || LargeNumberFactory.greatestCommonDivisor(currentNumber, MODULUS_VALUE_LN).isGreaterThan(LargeNumberFactory.one)) {
        // Handle cases where modular inverse doesn't exist (e.g., if a[i] is 0 or not coprime to mod)
        // For this problem, we assume valid inputs where modInv always exists.
        // If not, this would require specific problem logic, e.g., throw error or return 0.
        // For now, let's assume it will throw inside modularInverse if it's truly not possible.
        // Or if the problem implies 0 for such cases, we'd add `finalSumResult = finalSumResult.add(LN_ZERO); continue;`
    }
    const inverseTerm = currentNumber.modularInverse(MODULUS_VALUE_LN);
    finalSumResult = finalSumResult.add(inverseTerm);
    // New fragment: keep the sum within modulus to prevent overflow if intermediate sums get too large before final mod
    finalSumResult = finalSumResult.getRemainder(MODULUS_VALUE_LN);
  }

  // Final calculation: (sum * LCM) % MOD
  const finalProduct = finalSumResult.multiply(currentLcm);
  const finalAnswer = finalProduct.getRemainder(MODULUS_VALUE_LN);

  return finalAnswer.getJsNumber();
}

// Execute the problem solver and output result
const programOutput = solveProblem();
if (programOutput !== undefined) {
  console.log(programOutput);
}