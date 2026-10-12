// This module provides advanced arbitrary-precision integer arithmetic capabilities.
// It addresses the limitation of standard JavaScript numbers, which cannot accurately
// represent integers beyond 2^53 - 1 (approximately 9 * 10^15).
// For inputs like 10^9, products can reach 10^18, necessitating BigInt support.
// This implementation avoids relying on native BigInt features for broader compatibility,
// but includes a wrapper for environments that do support it.
var largeIntegerFactory = function (undefSentinel) {
  "use strict";

  // Configuration constants for internal array representation
  const CHUNK_BASE_VAL = 10_000_000; // Base for each chunk (10^7)
  const CHUNK_LOG_BASE = 7;         // Log10 of CHUNK_BASE_VAL
  const JAVASCRIPT_MAX_SAFE_INT = 9007199254740991; // 2^53 - 1
  const MAX_SAFE_INT_COMPONENTS = getChunkArrayFromSmall(JAVASCRIPT_MAX_SAFE_INT); // Chunk representation of MAX_SAFE_INT

  // Default character set for base conversions
  const DEFAULT_ALPHANUM_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

  // Check for native BigInt support once
  const nativeBigIntAvailable = typeof BigInt === "function";

  /**
   * Base constructor for all numerical entities (BigNumber, SmallNumber, NativeBigIntWrapper).
   * Acts as a factory function.
   * @param {*} value - The value to parse.
   * @param {number} [base] - The base of the input value if string.
   * @param {string} [charSet] - Custom alphabet for base conversion.
   * @param {boolean} [caseSens] - Whether alphabet is case sensitive.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} An instance of a big number type.
   */
  function NumericalEntityBase(value, base, charSet, caseSens) {
    if (typeof value === "undefined" || value === null) {
      return NumericalEntityBase.ZERO; // Return pre-defined zero instance
    }
    // If a base is provided, and it's not simply decimal with default alphabet, parse it explicitly.
    if (typeof base !== "undefined") {
      return (+base === 10 && !charSet)
        ? parseInputToBigNumber(value)
        : parseStringWithBase(value, base, charSet, caseSens);
    }
    return parseInputToBigNumber(value);
  }

  /**
   * Represents a large integer using an array of number chunks.
   * @param {number[]} chunkArr - Array of number chunks.
   * @param {boolean} isNegative - True if the number is negative.
   */
  function BigNumber(chunkArr, isNegative) {
    this.digitChunks = chunkArr;
    this.isNegative = isNegative;
    this.isSmall = false; // Flag to indicate it's not a SmallNumber
  }
  BigNumber.prototype = Object.create(NumericalEntityBase.prototype); // Inherit from base

  /**
   * Represents a small integer that fits within standard JavaScript's safe integer range.
   * @param {number} val - The small integer value.
   */
  function SmallNumber(val) {
    this.numericValue = val;
    this.isNegative = val < 0;
    this.isSmall = true; // Flag to indicate it's a SmallNumber
  }
  SmallNumber.prototype = Object.create(NumericalEntityBase.prototype); // Inherit from base

  /**
   * Wrapper for native BigInt objects, used when `BigInt` is available.
   * @param {BigInt} val - The native BigInt value.
   */
  function NativeBigIntWrapper(val) {
    this.nativeVal = val;
  }
  NativeBigIntWrapper.prototype = Object.create(NumericalEntityBase.prototype); // Inherit from base

  /**
   * Checks if a number can be precisely represented by JavaScript's number type.
   * @param {number} num - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function canFitInJSNumber(num) {
    return -JAVASCRIPT_MAX_SAFE_INT <= num && num <= JAVASCRIPT_MAX_SAFE_INT;
  }

  /**
   * Converts a small JavaScript number into an array of chunks.
   * @param {number} num - The number to convert.
   * @returns {number[]} Array of number chunks.
   */
  function getChunkArrayFromSmall(num) {
    if (num < CHUNK_BASE_VAL) return [num];
    if (num < CHUNK_BASE_VAL * CHUNK_BASE_VAL) return [num % CHUNK_BASE_VAL, Math.floor(num / CHUNK_BASE_VAL)];
    // For numbers larger than 10^14, but still within MAX_SAFE_INT
    return [num % CHUNK_BASE_VAL, Math.floor(num / CHUNK_BASE_VAL) % CHUNK_BASE_VAL, Math.floor(num / (CHUNK_BASE_VAL * CHUNK_BASE_VAL))];
  }

  /**
   * Converts an array of chunks back into a small JavaScript number if possible.
   * @param {number[]} chunks - Array of number chunks.
   * @returns {number|number[]} The converted number or the original chunks if too large.
   */
  function convertToSmallNumberFromChunks(chunks) {
    normalizeChunks(chunks); // Remove leading zeros
    const numChunks = chunks.length;
    // Check if the number of chunks is small enough and the absolute value is within MAX_SAFE_INT
    if (numChunks < 4 && compareAbsoluteChunks(chunks, MAX_SAFE_INT_COMPONENTS) < 0) {
      switch (numChunks) {
        case 0:
          return 0;
        case 1:
          return chunks[0];
        case 2:
          return chunks[0] + chunks[1] * CHUNK_BASE_VAL;
        case 3:
          return chunks[0] + (chunks[1] + chunks[2] * CHUNK_BASE_VAL) * CHUNK_BASE_VAL;
      }
    }
    return chunks; // Return chunks if it cannot be represented as a small number
  }

  /**
   * Removes leading zero chunks from a chunk array.
   * @param {number[]} chunkArray - The array of chunks to trim.
   */
  function normalizeChunks(chunkArray) {
    let i = chunkArray.length;
    while (i > 0 && chunkArray[--i] === 0);
    chunkArray.length = i + 1;
  }

  /**
   * Creates and initializes a new array with zeros.
   * @param {number} size - The desired size of the array.
   * @returns {number[]} An array filled with zeros.
   */
  function initializeChunkArray(size) {
    const freshArray = new Array(size);
    for (let k = 0; k < size; ++k) {
      freshArray[k] = 0;
    }
    return freshArray;
  }

  /**
   * Truncates a number towards zero (floor for positive, ceil for negative).
   * @param {number} num - The number to truncate.
   * @returns {number} The truncated integer.
   */
  function floorOrCeil(num) {
    return num > 0 ? Math.floor(num) : Math.ceil(num);
  }

  /**
   * Adds two chunk arrays (representing positive numbers).
   * Assumes 'a' is longer or equal in length to 'b'.
   * @param {number[]} a_chunks - First operand's chunks.
   * @param {number[]} b_chunks - Second operand's chunks.
   * @returns {number[]} Resulting chunk array.
   */
  function addChunkArrays(a_chunks, b_chunks) {
    const lenA = a_chunks.length;
    const lenB = b_chunks.length;
    const resultChunks = new Array(lenA);
    let currentCarry = 0;
    let tempSum;

    for (let k = 0; k < lenB; ++k) {
      tempSum = a_chunks[k] + b_chunks[k] + currentCarry;
      currentCarry = tempSum >= CHUNK_BASE_VAL ? 1 : 0;
      resultChunks[k] = tempSum - currentCarry * CHUNK_BASE_VAL;
    }

    for (let k = lenB; k < lenA; ++k) {
      tempSum = a_chunks[k] + currentCarry;
      currentCarry = tempSum === CHUNK_BASE_VAL ? 1 : 0;
      resultChunks[k] = tempSum - currentCarry * CHUNK_BASE_VAL;
    }

    if (currentCarry > 0) {
      resultChunks.push(currentCarry);
    }
    return resultChunks;
  }

  /**
   * Adds two chunk arrays, handling length differences.
   * @param {number[]} firstArr - First chunk array.
   * @param {number[]} secondArr - Second chunk array.
   * @returns {number[]} Resulting chunk array.
   */
  function flexibleAddChunks(firstArr, secondArr) {
    // Ensure the first array is always the longer one for `addChunkArrays`
    if (firstArr.length >= secondArr.length) {
      return addChunkArrays(firstArr, secondArr);
    }
    return addChunkArrays(secondArr, firstArr);
  }

  /**
   * Adds a small value (carry) to a chunk array.
   * @param {number[]} chunkArr - The array of chunks.
   * @param {number} smallCarry - The small integer value to add.
   * @returns {number[]} Resulting chunk array.
   */
  function addSmallValueToChunks(chunkArr, smallCarry) {
    const len = chunkArr.length;
    const resultArr = new Array(len);
    let currentCarry = smallCarry;
    let tempSum;

    for (let k = 0; k < len; ++k) {
      tempSum = chunkArr[k] + currentCarry; // No need to subtract CHUNK_BASE_VAL initially if adding
      currentCarry = Math.floor(tempSum / CHUNK_BASE_VAL);
      resultArr[k] = tempSum % CHUNK_BASE_VAL;
    }

    while (currentCarry > 0) {
      resultArr.push(currentCarry % CHUNK_BASE_VAL);
      currentCarry = Math.floor(currentCarry / CHUNK_BASE_VAL);
    }
    return resultArr;
  }

  // --- Addition methods ---
  BigNumber.prototype.plusOp = function (val) {
    const otherNum = parseInputToBigNumber(val);
    // If signs are different, it's effectively a subtraction
    if (this.isNegative !== otherNum.isNegative) {
      return this.subtractOp(otherNum.negate());
    }
    const myChunks = this.digitChunks;
    const otherChunks = otherNum.digitChunks;

    if (otherNum.isSmall) {
      // Optimize for adding a small number
      return new BigNumber(addSmallValueToChunks(myChunks, Math.abs(otherNum.numericValue)), this.isNegative);
    }
    return new BigNumber(flexibleAddChunks(myChunks, otherChunks), this.isNegative);
  };
  BigNumber.prototype.add = BigNumber.prototype.plusOp; // Alias for compatibility

  SmallNumber.prototype.plusOp = function (val) {
    const otherNum = parseInputToBigNumber(val);
    const myVal = this.numericValue;

    // If signs are different, it's effectively a subtraction
    if ((myVal < 0) !== otherNum.isNegative) {
      return this.subtractOp(otherNum.negate());
    }

    if (otherNum.isSmall) {
      // Both are small numbers, try direct addition
      const sum = myVal + otherNum.numericValue;
      if (canFitInJSNumber(sum)) {
        return new SmallNumber(sum);
      }
      // If sum exceeds safe integer, convert to BigNumber
      // The larger absolute value dictates the sign for this case.
      const sumAbsChunks = addSmallValueToChunks(getChunkArrayFromSmall(Math.abs(otherNum.numericValue)), Math.abs(myVal));
      return new BigNumber(sumAbsChunks, myVal < 0);
    }

    // One is small, other is BigNumber. Add small value to BigNumber chunks.
    // The larger absolute value dictates the sign.
    return new BigNumber(addSmallValueToChunks(otherNum.digitChunks, Math.abs(myVal)), otherNum.isNegative);
  };
  SmallNumber.prototype.add = SmallNumber.prototype.plusOp;

  NativeBigIntWrapper.prototype.plusOp = function (val) {
    return new NativeBigIntWrapper(this.nativeVal + parseInputToBigNumber(val).nativeVal);
  };
  NativeBigIntWrapper.prototype.add = NativeBigIntWrapper.prototype.plusOp;

  /**
   * Subtracts chunk array 'b' from 'a'. Assumes a >= b (absolute values).
   * @param {number[]} a_chunks - Minuend chunks.
   * @param {number[]} b_chunks - Subtrahend chunks.
   * @returns {number[]} Resulting chunk array.
   */
  function subtractChunkArrays(a_chunks, b_chunks) {
    const lenA = a_chunks.length;
    const lenB = b_chunks.length;
    const resultChunks = new Array(lenA);
    let currentBorrow = 0;
    let difference;

    for (let k = 0; k < lenB; ++k) {
      difference = a_chunks[k] - currentBorrow - b_chunks[k];
      if (difference < 0) {
        difference += CHUNK_BASE_VAL;
        currentBorrow = 1;
      } else {
        currentBorrow = 0;
      }
      resultChunks[k] = difference;
    }

    // Propagate borrow through remaining chunks of 'a'
    for (let k = lenB; k < lenA; ++k) {
      difference = a_chunks[k] - currentBorrow;
      if (difference < 0) {
        difference += CHUNK_BASE_VAL;
      } else {
        // If no borrow, subsequent chunks are unchanged, copy directly
        resultChunks[k++] = difference;
        while (k < lenA) {
          resultChunks[k] = a_chunks[k];
          k++;
        }
        break;
      }
      resultChunks[k] = difference;
    }
    normalizeChunks(resultChunks);
    return resultChunks;
  }

  /**
   * Performs subtraction between two BigNumbers, handling signs and converting to SmallNumber if possible.
   * @param {number[]} chunksA - First operand's chunks.
   * @param {number[]} chunksB - Second operand's chunks.
   * @param {boolean} currentSign - The sign of the result if `chunksA >= chunksB`.
   * @returns {BigNumber|SmallNumber} The result of the subtraction.
   */
  function performFlexibleSubtraction(chunksA, chunksB, currentSign) {
    let resultValue;
    // Compare absolute values to determine which is larger
    if (compareAbsoluteChunks(chunksA, chunksB) >= 0) {
      resultValue = subtractChunkArrays(chunksA, chunksB);
    } else {
      // If b is absolutely larger, swap and invert the sign
      resultValue = subtractChunkArrays(chunksB, chunksA);
      currentSign = !currentSign;
    }

    resultValue = convertToSmallNumberFromChunks(resultValue);
    if (typeof resultValue === "number") {
      if (currentSign) resultValue = -resultValue;
      return new SmallNumber(resultValue);
    }
    return new BigNumber(resultValue, currentSign);
  }

  /**
   * Subtracts a small value from a chunk array.
   * @param {number[]} chunkArr - The array of chunks.
   * @param {number} smallVal - The small integer value to subtract.
   * @param {boolean} isNegativeResult - The expected sign of the result.
   * @returns {BigNumber|SmallNumber} The result of the subtraction.
   */
  function subtractSmallValueFromChunks(chunkArr, smallVal, isNegativeResult) {
    const len = chunkArr.length;
    const resultArr = new Array(len);
    let currentBorrow = -smallVal; // Negative carry for subtraction
    let difference;

    for (let k = 0; k < len; ++k) {
      difference = chunkArr[k] + currentBorrow;
      currentBorrow = Math.floor(difference / CHUNK_BASE_VAL);
      difference %= CHUNK_BASE_VAL;
      resultArr[k] = difference < 0 ? difference + CHUNK_BASE_VAL : difference;
    }
    const finalResult = convertToSmallNumberFromChunks(resultArr);
    if (typeof finalResult === "number") {
      if (isNegativeResult && finalResult !== 0) return new SmallNumber(-finalResult); // Apply sign if needed, but not to zero
      return new SmallNumber(finalResult);
    }
    return new BigNumber(finalResult, isNegativeResult);
  }

  // --- Subtraction methods ---
  BigNumber.prototype.subtractOp = function (val) {
    const otherNum = parseInputToBigNumber(val);
    // If signs are different, it's effectively an addition
    if (this.isNegative !== otherNum.isNegative) {
      return this.plusOp(otherNum.negate());
    }
    const myChunks = this.digitChunks;
    const otherChunks = otherNum.digitChunks;

    if (otherNum.isSmall) {
      // Optimize for subtracting a small number
      return subtractSmallValueFromChunks(myChunks, Math.abs(otherNum.numericValue), this.isNegative);
    }
    return performFlexibleSubtraction(myChunks, otherChunks, this.isNegative);
  };
  BigNumber.prototype.minus = BigNumber.prototype.subtractOp;

  SmallNumber.prototype.subtractOp = function (val) {
    const otherNum = parseInputToBigNumber(val);
    const myVal = this.numericValue;

    // If signs are different, it's effectively an addition
    if ((myVal < 0) !== otherNum.isNegative) {
      return this.plusOp(otherNum.negate());
    }

    if (otherNum.isSmall) {
      // Both are small, direct subtraction
      const diff = myVal - otherNum.numericValue;
      if (canFitInJSNumber(diff)) {
        return new SmallNumber(diff);
      }
      // Fallback if product is too large for small number
      const myAbsChunks = getChunkArrayFromSmall(Math.abs(myVal));
      const otherAbsChunks = getChunkArrayFromSmall(Math.abs(otherNum.numericValue));
      return performFlexibleSubtraction(myAbsChunks, otherAbsChunks, myVal < 0);
    }
    // Small minus BigNumber. Treat as -(BigNumber - SmallNumber)
    return subtractSmallValueFromChunks(otherNum.digitChunks, Math.abs(myVal), !(myVal >= 0)); // Sign inversion
  };
  SmallNumber.prototype.minus = SmallNumber.prototype.subtractOp;

  NativeBigIntWrapper.prototype.subtractOp = function (val) {
    return new NativeBigIntWrapper(this.nativeVal - parseInputToBigNumber(val).nativeVal);
  };
  NativeBigIntWrapper.prototype.minus = NativeBigIntWrapper.prototype.subtractOp;

  // --- Negation and Absolute Value ---
  BigNumber.prototype.negate = function () {
    // Zero is neither positive nor negative
    if (this.isZero()) return NumericalEntityBase.ZERO;
    return new BigNumber(this.digitChunks, !this.isNegative);
  };
  SmallNumber.prototype.negate = function () {
    if (this.isZero()) return NumericalEntityBase.ZERO;
    return new SmallNumber(-this.numericValue);
  };
  NativeBigIntWrapper.prototype.negate = function () {
    if (this.nativeVal === 0n) return NumericalEntityBase.ZERO;
    return new NativeBigIntWrapper(-this.nativeVal);
  };

  BigNumber.prototype.absoluteValue = function () {
    return new BigNumber(this.digitChunks, false); // Always positive
  };
  SmallNumber.prototype.absoluteValue = function () {
    return new SmallNumber(Math.abs(this.numericValue));
  };
  NativeBigIntWrapper.prototype.absoluteValue = function () {
    return new NativeBigIntWrapper(this.nativeVal >= 0n ? this.nativeVal : -this.nativeVal);
  };

  // --- Multiplication helpers ---
  /**
   * Multiplies two chunk arrays using the standard long multiplication algorithm.
   * @param {number[]} arrA - First operand's chunks.
   * @param {number[]} arrB - Second operand's chunks.
   * @returns {number[]} Resulting chunk array.
   */
  function multiplyChunksLong(arrA, arrB) {
    const lenA = arrA.length;
    const lenB = arrB.length;
    const resultLen = lenA + lenB;
    const resultChunks = initializeChunkArray(resultLen); // Result can have at most lenA + lenB chunks

    for (let i = 0; i < lenA; ++i) {
      const chunkA = arrA[i];
      let currentCarry = 0;
      for (let j = 0; j < lenB; ++j) {
        const chunkB = arrB[j];
        const product = chunkA * chunkB + resultChunks[i + j] + currentCarry;
        currentCarry = Math.floor(product / CHUNK_BASE_VAL);
        resultChunks[i + j] = product % CHUNK_BASE_VAL;
      }
      resultChunks[i + lenB] += currentCarry; // Add remaining carry
    }
    normalizeChunks(resultChunks);
    return resultChunks;
  }

  /**
   * Multiplies a chunk array by a small integer.
   * @param {number[]} chunkArr - The array of chunks.
   * @param {number} smallMultiplier - The small integer multiplier.
   * @returns {number[]} Resulting chunk array.
   */
  function multiplyChunksBySmall(chunkArr, smallMultiplier) {
    const len = chunkArr.length;
    const resultArr = new Array(len);
    let currentCarry = 0;
    let product;

    for (let k = 0; k < len; ++k) {
      product = chunkArr[k] * smallMultiplier + currentCarry;
      currentCarry = Math.floor(product / CHUNK_BASE_VAL);
      resultArr[k] = product % CHUNK_BASE_VAL;
    }

    while (currentCarry > 0) {
      resultArr.push(currentCarry % CHUNK_BASE_VAL);
      currentCarry = Math.floor(currentCarry / CHUNK_BASE_VAL);
    }
    return resultArr;
  }

  /**
   * Pads a chunk array with zeros at the beginning (effectively shifting left).
   * @param {number[]} chunks - The array of chunks.
   * @param {number} numZeros - Number of zeros to prepend.
   * @returns {number[]} The shifted array.
   */
  function prependZeros(chunks, numZeros) {
    const zeroPad = [];
    for (let k = 0; k < numZeros; ++k) zeroPad.push(0);
    return zeroPad.concat(chunks);
  }

  /**
   * Implements Karatsuba multiplication for chunk arrays.
   * A recursive algorithm for faster multiplication of large numbers.
   * @param {number[]} x_chunks - First operand's chunks.
   * @param {number[]} y_chunks - Second operand's chunks.
   * @returns {number[]} Resulting chunk array.
   */
  function karatsubaMultiply(x_chunks, y_chunks) {
    const maxLen = Math.max(x_chunks.length, y_chunks.length);

    // Base case: fall back to long multiplication for smaller arrays
    if (maxLen <= 30) {
      return multiplyChunksLong(x_chunks, y_chunks);
    }

    // Split point for Karatsuba
    const splitPoint = Math.ceil(maxLen / 2);

    // Split numbers into two halves
    const x1 = x_chunks.slice(splitPoint);
    const x0 = x_chunks.slice(0, splitPoint);
    const y1 = y_chunks.slice(splitPoint);
    const y0 = y_chunks.slice(0, splitPoint);

    // Recursive steps
    const z2 = karatsubaMultiply(x1, y1); // x1 * y1
    const z0 = karatsubaMultiply(x0, y0); // x0 * y0
    const z1 = karatsubaMultiply(flexibleAddChunks(x0, x1), flexibleAddChunks(y0, y1)); // (x0+x1)*(y0+y1)

    // Combine results: z2 * B^(2*m) + (z1 - z2 - z0) * B^m + z0
    const middleTerm = subtractChunkArrays(subtractChunkArrays(z1, z2), z0);
    const term1 = prependZeros(z2, 2 * splitPoint); // z2 shifted
    const term2 = prependZeros(middleTerm, splitPoint); // (z1 - z2 - z0) shifted

    const product = flexibleAddChunks(flexibleAddChunks(term1, term2), z0);
    normalizeChunks(product);
    return product;
  }

  /**
   * Heuristic to decide whether to use Karatsuba algorithm.
   * @param {number} len1 - Length of first chunk array.
   * @param {number} len2 - Length of second chunk array.
   * @returns {boolean} True if Karatsuba should be used.
   */
  function shouldUseKaratsuba(len1, len2) {
    // This is a common heuristic, might need tuning for specific CHUNK_BASE_VAL
    // The original library uses -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0
    // Simplified to a threshold check for demonstration.
    return len1 * len2 > 900; // Example: if total 'cells' are above a threshold
  }

  BigNumber.prototype.timesOp = function (val) {
    const otherNum = parseInputToBigNumber(val);
    const myChunks = this.digitChunks;
    const otherChunks = otherNum.digitChunks;
    const resultSign = this.isNegative !== otherNum.isNegative;

    // Handle special cases for small numbers
    if (otherNum.isSmall) {
      const otherValAbs = Math.abs(otherNum.numericValue);
      if (otherValAbs === 0) return NumericalEntityBase.ZERO;
      if (otherValAbs === 1) return resultSign ? this.negate() : this;
      if (otherValAbs < CHUNK_BASE_VAL) {
        return new BigNumber(multiplyChunksBySmall(myChunks, otherValAbs), resultSign);
      }
      // If small number is large enough to be represented by multiple chunks
      return new BigNumber(multiplyChunksLong(myChunks, getChunkArrayFromSmall(otherValAbs)), resultSign);
    }

    // General case: two BigNumbers
    if (shouldUseKaratsuba(myChunks.length, otherChunks.length)) {
      return new BigNumber(karatsubaMultiply(myChunks, otherChunks), resultSign);
    }
    return new BigNumber(multiplyChunksLong(myChunks, otherChunks), resultSign);
  };
  BigNumber.prototype.multiply = BigNumber.prototype.timesOp;

  SmallNumber.prototype.timesOp = function (val) {
    const otherNum = parseInputToBigNumber(val);
    const myVal = this.numericValue;
    const resultSign = (myVal < 0) !== otherNum.isNegative;

    if (otherNum.isSmall) {
      const product = myVal * otherNum.numericValue;
      if (canFitInJSNumber(product)) {
        return new SmallNumber(product);
      }
      // Fallback if product is too large for small number
      const myAbsChunks = getChunkArrayFromSmall(Math.abs(myVal));
      const otherAbsChunks = getChunkArrayFromSmall(Math.abs(otherNum.numericValue));
      return new BigNumber(multiplyChunksLong(myAbsChunks, otherAbsChunks), resultSign);
    }

    // Small number times BigNumber
    const otherAbsChunks = otherNum.digitChunks;
    const myAbsVal = Math.abs(myVal);
    if (myAbsVal === 0) return NumericalEntityBase.ZERO;
    if (myAbsVal === 1) return resultSign ? otherNum.negate() : otherNum;

    return new BigNumber(multiplyChunksBySmall(otherAbsChunks, myAbsVal), resultSign);
  };
  SmallNumber.prototype.multiply = SmallNumber.prototype.timesOp;

  NativeBigIntWrapper.prototype.timesOp = function (val) {
    return new NativeBigIntWrapper(this.nativeVal * parseInputToBigNumber(val).nativeVal);
  };
  NativeBigIntWrapper.prototype.multiply = NativeBigIntWrapper.prototype.timesOp;

  // --- Squaring ---
  /**
   * Squares a chunk array using a specialized algorithm.
   * @param {number[]} chunks - The array of chunks to square.
   * @returns {number[]} Resulting chunk array.
   */
  function squareChunks(chunks) {
    const len = chunks.length;
    const resultLen = 2 * len;
    const resultArr = initializeChunkArray(resultLen);

    for (let i = 0; i < len; ++i) {
      const chunk_i = chunks[i];
      let currentCarry = 0;
      
      // Calculate a_i * a_i part
      let product_ii = chunk_i * chunk_i + resultArr[i + i];
      currentCarry = Math.floor(product_ii / CHUNK_BASE_VAL);
      resultArr[i + i] = product_ii % CHUNK_BASE_VAL;

      // Calculate 2 * a_i * a_j for j > i
      for (let j = i + 1; j < len; ++j) {
        const chunk_j = chunks[j];
        const product_ij = 2 * (chunk_i * chunk_j) + resultArr[i + j] + currentCarry;
        currentCarry = Math.floor(product_ij / CHUNK_BASE_VAL);
        resultArr[i + j] = product_ij % CHUNK_BASE_VAL;
      }
      resultArr[i + len] += currentCarry; // Add remaining carry
    }
    normalizeChunks(resultArr);
    return resultArr;
  }

  BigNumber.prototype.squareOp = function () {
    return new BigNumber(squareChunks(this.digitChunks), false); // Square is always positive
  };
  SmallNumber.prototype.squareOp = function () {
    const squaredVal = this.numericValue * this.numericValue;
    if (canFitInJSNumber(squaredVal)) return new SmallNumber(squaredVal);
    // If result exceeds safe integer, convert to BigNumber
    return new BigNumber(squareChunks(getChunkArrayFromSmall(Math.abs(this.numericValue))), false);
  };
  NativeBigIntWrapper.prototype.squareOp = function () {
    return new NativeBigIntWrapper(this.nativeVal * this.nativeVal);
  };

  // --- Division and Modulo Helpers ---
  // The original divmod1 and divmod2 are sophisticated algorithms (Knuth's D-algorithm variant).
  // I will rename and slightly reformat them, but keep their core logic intact as they are complex.

  /**
   * Implements Knuth's Division Algorithm D for multi-precision division.
   * This is a normalized division algorithm.
   * @param {number[]} dividendChunks - Numerator chunks.
   * @param {number[]} divisorChunks - Denominator chunks.
   * @returns {[number[], number[]]} Array containing quotient chunks and remainder chunks.
   */
  function divideAndModNormalized(dividendChunks, divisorChunks) {
    const lenDividend = dividendChunks.length;
    const lenDivisor = divisorChunks.length;
    const quotientResult = initializeChunkArray(lenDividend); // Max possible length for quotient

    // Normalization step: ensure divisor's most significant digit is large enough
    // This scales both dividend and divisor to prevent issues with small leading digits.
    const divisorMSD = divisorChunks[lenDivisor - 1]; // Most significant digit of divisor
    const normalizationFactor = Math.ceil(CHUNK_BASE_VAL / (2 * divisorMSD));
    
    // Apply normalization factor to both dividend and divisor
    const scaledDividend = multiplyChunksBySmall(dividendChunks, normalizationFactor);
    const scaledDivisor = multiplyChunksBySmall(divisorChunks, normalizationFactor);

    // After scaling, the dividend might gain an extra chunk
    if (scaledDividend.length <= lenDividend) scaledDividend.push(0);
    // Divisor also might gain a chunk
    scaledDivisor.push(0); // This ensures `scaledDivisor[lenDivisor]` is accessible

    // Update MSD of scaled divisor
    const scaledDivisorMSD = scaledDivisor[lenDivisor - 1];

    let currentQuotientDigit, shiftIndex, currentCarry, currentBorrow;
    let tempProduct;

    // Main loop for calculating quotient digits
    for (shiftIndex = lenDividend - lenDivisor; shiftIndex >= 0; --shiftIndex) {
      // Estimate quotient digit
      // Handle cases where `scaledDividend[shiftIndex + lenDivisor]` might be zero or too small
      if (scaledDividend[shiftIndex + lenDivisor] === scaledDivisorMSD) {
        currentQuotientDigit = CHUNK_BASE_VAL - 1; // Max possible digit
      } else {
        currentQuotientDigit = Math.floor(
          (scaledDividend[shiftIndex + lenDivisor] * CHUNK_BASE_VAL + scaledDividend[shiftIndex + lenDivisor - 1]) / scaledDivisorMSD
        );
      }

      // Adjust quotient digit estimate
      // Multiply divisor by estimated digit and check if it's too large
      currentCarry = 0;
      currentBorrow = 0;
      const tempDivisorLen = scaledDivisor.length;
      for (let k = 0; k < tempDivisorLen; ++k) {
        currentCarry += currentQuotientDigit * scaledDivisor[k];
        const quotientPart = Math.floor(currentCarry / CHUNK_BASE_VAL);
        currentBorrow += scaledDividend[shiftIndex + k] - (currentCarry % CHUNK_BASE_VAL);
        currentCarry = quotientPart;

        if (currentBorrow < 0) {
          scaledDividend[shiftIndex + k] = currentBorrow + CHUNK_BASE_VAL;
          currentBorrow = -1;
        } else {
          scaledDividend[shiftIndex + k] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // If the estimated digit was too large, subtract divisor from dividend
      while (currentBorrow !== 0) {
        currentQuotientDigit--;
        currentCarry = 0;
        for (let k = 0; k < tempDivisorLen; ++k) {
          currentCarry += scaledDividend[shiftIndex + k] - CHUNK_BASE_VAL + scaledDivisor[k];
          if (currentCarry < 0) {
            scaledDividend[shiftIndex + k] = currentCarry + CHUNK_BASE_VAL;
            currentCarry = 0;
          } else {
            scaledDividend[shiftIndex + k] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      quotientResult[shiftIndex] = currentQuotientDigit;
    }

    // Denormalize remainder by dividing by the normalization factor
    const finalRemainder = divideChunksBySmall(scaledDividend, normalizationFactor)[0];
    return [convertToSmallNumberFromChunks(quotientResult), convertToSmallNumberFromChunks(finalRemainder)];
  }

  /**
   * Implements a simpler, iterative division algorithm.
   * Less efficient for very large numbers than `divideAndModNormalized`.
   * @param {number[]} dividendChunks - Numerator chunks.
   * @param {number[]} divisorChunks - Denominator chunks.
   * @returns {[number[], number[]]} Array containing quotient chunks and remainder chunks.
   */
  function divideAndModIterative(dividendChunks, divisorChunks) {
    let lenDividend = dividendChunks.length;
    const lenDivisor = divisorChunks.length;
    const quotientArr = [];
    let currentPartialDividend = []; // Stores the current part of dividend being divided

    // Loop through dividend chunks from most significant to least significant
    while (lenDividend > 0) {
      currentPartialDividend.unshift(dividendChunks[--lenDividend]); // Add next chunk to the front
      normalizeChunks(currentPartialDividend); // Remove leading zeros from partial

      // If current partial dividend is smaller than divisor, quotient digit is 0
      if (compareAbsoluteChunks(currentPartialDividend, divisorChunks) < 0) {
        quotientArr.push(0);
        continue;
      }

      // Estimate quotient digit
      const currentPartialLen = currentPartialDividend.length;
      let highX = currentPartialDividend[currentPartialLen - 1] * CHUNK_BASE_VAL + (currentPartialLen > 1 ? currentPartialDividend[currentPartialLen - 2] : 0);
      let highY = divisorChunks[lenDivisor - 1] * CHUNK_BASE_VAL + (lenDivisor > 1 ? divisorChunks[lenDivisor - 2] : 0);

      // Adjust highX if it has more chunks than highY, to make estimate more accurate
      if (currentPartialLen > lenDivisor) {
        highX = (highX + 1) * CHUNK_BASE_VAL; // Give it a boost for estimation
      }

      let estimatedDigit = Math.ceil(highX / highY);

      let tempProduct;
      // Refine estimated digit by trial multiplication and subtraction
      do {
        tempProduct = multiplyChunksBySmall(divisorChunks, estimatedDigit);
        if (compareAbsoluteChunks(tempProduct, currentPartialDividend) <= 0) break; // If product is <= partial dividend, digit is good
        estimatedDigit--;
      } while (estimatedDigit > 0); // Decrement until it fits

      quotientArr.push(estimatedDigit);
      currentPartialDividend = subtractChunkArrays(currentPartialDividend, tempProduct); // Subtract the product
    }
    quotientArr.reverse(); // Digits were added in reverse order
    return [convertToSmallNumberFromChunks(quotientArr), convertToSmallNumberFromChunks(currentPartialDividend)];
  }

  /**
   * Divides a chunk array by a small integer.
   * @param {number[]} chunkArr - The array of chunks (dividend).
   * @param {number} smallDivisor - The small integer divisor.
   * @returns {[number[], number]} Array containing quotient chunks and remainder (single number).
   */
  function divideChunksBySmall(chunkArr, smallDivisor) {
    const len = chunkArr.length;
    const quotientArr = initializeChunkArray(len);
    let currentRemainder = 0;
    let tempDividend, quotientDigit;

    // Process chunks from most significant to least significant
    for (let k = len - 1; k >= 0; --k) {
      tempDividend = currentRemainder * CHUNK_BASE_VAL + chunkArr[k];
      quotientDigit = floorOrCeil(tempDividend / smallDivisor);
      currentRemainder = tempDividend - quotientDigit * smallDivisor;
      quotientArr[k] = quotientDigit | 0; // Ensure integer
    }
    return [quotientArr, currentRemainder | 0]; // Return quotient chunks and final remainder
  }

  /**
   * Performs division and modulo operation for any combination of BigNumber types.
   * @param {BigNumber|SmallNumber|NativeBigIntWrapper} selfNum - The dividend.
   * @param {BigNumber|SmallNumber|NativeBigIntWrapper} otherNumVal - The divisor.
   * @returns {[BigNumber|SmallNumber|NativeBigIntWrapper, BigNumber|SmallNumber|NativeBigIntWrapper]} Array with quotient and remainder.
   */
  function flexibleDivideAndModulo(selfNum, otherNumVal) {
    const otherNum = parseInputToBigNumber(otherNumVal);

    // If native BigInt is available, use it directly for simplicity
    if (nativeBigIntAvailable && selfNum instanceof NativeBigIntWrapper && otherNum instanceof NativeBigIntWrapper) {
      return [
        new NativeBigIntWrapper(selfNum.nativeVal / otherNum.nativeVal),
        new NativeBigIntWrapper(selfNum.nativeVal % otherNum.nativeVal)
      ];
    }

    let myChunks = selfNum.digitChunks;
    let otherChunks = otherNum.digitChunks;

    // Handle division by zero
    if (otherNum.isZero()) {
      throw new Error("Cannot divide by zero.");
    }

    // Special handling for small numbers
    if (selfNum.isSmall) {
      if (otherNum.isSmall) {
        // Both are small, direct calculation
        const quot = floorOrCeil(selfNum.numericValue / otherNum.numericValue);
        const rem = selfNum.numericValue % otherNum.numericValue;
        return [new SmallNumber(quot), new SmallNumber(rem)];
      }
      // Small number divided by BigNumber (result is 0 with self as remainder)
      return [NumericalEntityBase.ZERO, selfNum];
    }

    // BigNumber divided by SmallNumber
    if (otherNum.isSmall) {
      const otherVal = otherNum.numericValue;
      if (otherVal === 1) return [selfNum, NumericalEntityBase.ZERO];
      if (otherVal === -1) return [selfNum.negate(), NumericalEntityBase.ZERO]; // Dividing by -1 negates
      const otherAbsVal = Math.abs(otherVal);

      if (otherAbsVal < CHUNK_BASE_VAL) {
        // If small divisor fits in one chunk
        const [quotientChunks, remainderVal] = divideChunksBySmall(myChunks, otherAbsVal);
        const finalQuotient = convertToSmallNumberFromChunks(quotientChunks);
        let finalRemainder = remainderVal;

        if (selfNum.isNegative) finalRemainder = -finalRemainder; // Remainder takes sign of dividend

        if (typeof finalQuotient === "number") {
          // If quotient is also small
          if (selfNum.isNegative !== otherNum.isNegative) finalQuotient = -finalQuotient;
          return [new SmallNumber(finalQuotient), new SmallNumber(finalRemainder)];
        }
        // Quotient is BigNumber, remainder is SmallNumber
        return [new BigNumber(finalQuotient, selfNum.isNegative !== otherNum.isNegative), new SmallNumber(finalRemainder)];
      }
      // If small divisor is large enough to be represented by multiple chunks
      // Convert it to chunk array for general division
      otherChunks = getChunkArrayFromSmall(otherAbsVal);
    }

    // General case: BigNumber divided by BigNumber
    const absComparison = compareAbsoluteChunks(myChunks, otherChunks);

    if (absComparison === -1) {
      // Dividend is absolutely smaller than divisor
      return [NumericalEntityBase.ZERO, selfNum];
    }
    if (absComparison === 0) {
      // Absolute values are equal, quotient is 1 or -1
      const quotientSign = selfNum.isNegative !== otherNum.isNegative;
      return [quotientSign ? NumericalEntityBase.MINUS_ONE : NumericalEntityBase.ONE, NumericalEntityBase.ZERO];
    }

    let divisionResult;
    // Heuristic to choose division algorithm
    if (myChunks.length + otherChunks.length <= 200) { // For moderately large numbers, DivMod1 (normalized) is often faster
      divisionResult = divideAndModNormalized(myChunks, otherChunks);
    } else { // For very large numbers, DivMod2 (iterative) can sometimes be better depending on implementation details
      // Note: The original library's divMod1 and divMod2 are both variants of Knuth's.
      // divMod1 is the D-algorithm, divMod2 is a more direct iterative subtraction.
      // The heuristic might be reversed or tuned. For Type III, just choosing one path.
      divisionResult = divideAndModIterative(myChunks, otherChunks);
    }

    let quotient = divisionResult[0];
    let remainder = divisionResult[1];
    const quotientIsNegative = selfNum.isNegative !== otherNum.isNegative;
    const remainderIsNegative = selfNum.isNegative; // Remainder takes sign of dividend

    // Convert quotient to appropriate type
    if (typeof quotient === "number") {
      if (quotientIsNegative && quotient !== 0) quotient = -quotient;
      quotient = new SmallNumber(quotient);
    } else {
      quotient = new BigNumber(quotient, quotientIsNegative);
    }

    // Convert remainder to appropriate type
    if (typeof remainder === "number") {
      if (remainderIsNegative && remainder !== 0) remainder = -remainder;
      remainder = new SmallNumber(remainder);
    } else {
      remainder = new BigNumber(remainder, remainderIsNegative);
    }

    return [quotient, remainder];
  }

  // --- Division and Modulo methods ---
  BigNumber.prototype.divmod = function (val) {
    const [quotient, remainder] = flexibleDivideAndModulo(this, val);
    return { quotient: quotient, remainder: remainder };
  };
  NativeBigIntWrapper.prototype.divmod = SmallNumber.prototype.divmod = BigNumber.prototype.divmod;

  BigNumber.prototype.divideOp = function (val) {
    return flexibleDivideAndModulo(this, val)[0];
  };
  NativeBigIntWrapper.prototype.divideOp = function (val) {
    return new NativeBigIntWrapper(this.nativeVal / parseInputToBigNumber(val).nativeVal);
  };
  SmallNumber.prototype.divideOp = BigNumber.prototype.divideOp; // Alias
  BigNumber.prototype.over = SmallNumber.prototype.over = NativeBigIntWrapper.prototype.over = BigNumber.prototype.divideOp;

  BigNumber.prototype.moduloOp = function (val) {
    return flexibleDivideAndModulo(this, val)[1];
  };
  NativeBigIntWrapper.prototype.moduloOp = function (val) {
    return new NativeBigIntWrapper(this.nativeVal % parseInputToBigNumber(val).nativeVal);
  };
  SmallNumber.prototype.moduloOp = BigNumber.prototype.moduloOp; // Alias
  BigNumber.prototype.remainder = SmallNumber.prototype.remainder = NativeBigIntWrapper.prototype.remainder = BigNumber.prototype.moduloOp;

  // --- Exponentiation (Pow) ---
  BigNumber.prototype.power = function (exponentVal) {
    const exponent = parseInputToBigNumber(exponentVal);
    const base = this.absoluteValue(); // Use absolute value for calculations
    let tempResult;
    let expVal;

    // Handle special cases for exponent
    if (exponent.isZero()) return NumericalEntityBase.ONE;
    if (base.isZero()) return NumericalEntityBase.ZERO;
    if (base.isUnit()) { // 1^x = 1, (-1)^x = 1 if even, -1 if odd
      if (this.equals(NumericalEntityBase.MINUS_ONE)) {
        return exponent.isEven() ? NumericalEntityBase.ONE : NumericalEntityBase.MINUS_ONE;
      }
      return NumericalEntityBase.ONE;
    }

    // Negative exponents result in fractions, which this library doesn't handle (returns 0)
    if (exponent.isNegative()) {
      return NumericalEntityBase.ZERO;
    }

    // Exponent must be a small integer
    if (!exponent.isSmall) {
      throw new Error(`The exponent ${exponent.toString()} is too large for this power operation.`);
    }
    expVal = exponent.numericValue;

    // If base is small, try direct Math.pow first
    if (this.isSmall) {
      if (canFitInJSNumber(tempResult = Math.pow(this.numericValue, expVal))) {
        return new SmallNumber(floorOrCeil(tempResult));
      }
    }

    // Binary exponentiation (exponentiation by squaring)
    let currentBase = this;
    let finalProduct = NumericalEntityBase.ONE;

    while (true) {
      if ((expVal & 1) === 1) { // If exponent is odd
        finalProduct = finalProduct.timesOp(currentBase);
        expVal--; // Decrement exponent
      }
      if (expVal === 0) break; // If exponent is zero, we're done
      expVal /= 2; // Divide exponent by 2
      currentBase = currentBase.squareOp(); // Square the base
    }
    return finalProduct;
  };
  SmallNumber.prototype.power = BigNumber.prototype.power;

  NativeBigIntWrapper.prototype.power = function (exponentVal) {
    const exponent = parseInputToBigNumber(exponentVal);
    const baseNative = this.nativeVal;
    const expNative = exponent.nativeVal;

    const nativeZero = 0n, nativeOne = 1n, nativeTwo = 2n;

    if (expNative === nativeZero) return NumericalEntityBase.ONE;
    if (baseNative === nativeZero) return NumericalEntityBase.ZERO;
    if (baseNative === nativeOne) return NumericalEntityBase.ONE;
    if (baseNative === -nativeOne) return exponent.isEven() ? NumericalEntityBase.ONE : NumericalEntityBase.MINUS_ONE;

    if (exponent.isNegative()) return new NativeBigIntWrapper(nativeZero); // Native BigInt throws for negative exponents

    let currentBase = this;
    let finalProduct = NumericalEntityBase.ONE;
    let currentExp = expNative;

    while (true) {
      if ((currentExp & nativeOne) === nativeOne) {
        finalProduct = finalProduct.timesOp(currentBase);
        currentExp--;
      }
      if (currentExp === nativeZero) break;
      currentExp /= nativeTwo;
      currentBase = currentBase.squareOp();
    }
    return finalProduct;
  };

  // --- Modular Exponentiation (ModPow) ---
  BigNumber.prototype.modularPower = function (exponentVal, modulusVal) {
    let exponent = parseInputToBigNumber(exponentVal);
    let modulus = parseInputToBigNumber(modulusVal);

    if (modulus.isZero()) {
      throw new Error("Cannot compute modular exponentiation with modulus 0.");
    }

    let result = NumericalEntityBase.ONE;
    let currentBase = this.moduloOp(modulus); // Base modulo modulus

    // Handle negative exponent: modular inverse
    if (exponent.isNegative()) {
      exponent = exponent.timesOp(NumericalEntityBase.MINUS_ONE); // Make exponent positive
      currentBase = currentBase.modularInverse(modulus); // Calculate modular inverse of base
    }

    // Binary exponentiation (exponentiation by squaring)
    while (exponent.isPositive()) {
      if (currentBase.isZero()) return NumericalEntityBase.ZERO; // Optimization
      if (exponent.isOdd()) {
        result = result.timesOp(currentBase).moduloOp(modulus);
      }
      exponent = exponent.divideOp(NumericalEntityBase.TWO);
      currentBase = currentBase.squareOp().moduloOp(modulus);
    }
    return result;
  };
  NativeBigIntWrapper.prototype.modularPower = SmallNumber.prototype.modularPower = BigNumber.prototype.modularPower;

  // --- Comparison helpers ---
  /**
   * Compares the absolute values of two chunk arrays.
   * @param {number[]} chunks1 - First chunk array.
   * @param {number[]} chunks2 - Second chunk array.
   * @returns {number} -1 if chunks1 < chunks2, 0 if equal, 1 if chunks1 > chunks2.
   */
  function compareAbsoluteChunks(chunks1, chunks2) {
    if (chunks1.length !== chunks2.length) {
      return chunks1.length > chunks2.length ? 1 : -1;
    }
    // Compare chunk by chunk from most significant to least significant
    for (let k = chunks1.length - 1; k >= 0; --k) {
      if (chunks1[k] !== chunks2[k]) {
        return chunks1[k] > chunks2[k] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical
  }

  BigNumber.prototype.compareAbsolute = function (val) {
    const otherNum = parseInputToBigNumber(val);
    if (otherNum.isSmall) {
      // If other is small, compare with its absolute value as chunks
      return compareAbsoluteChunks(this.digitChunks, getChunkArrayFromSmall(Math.abs(otherNum.numericValue)));
    }
    return compareAbsoluteChunks(this.digitChunks, otherNum.digitChunks);
  };
  SmallNumber.prototype.compareAbsolute = function (val) {
    const otherNum = parseInputToBigNumber(val);
    const myAbsVal = Math.abs(this.numericValue);
    if (otherNum.isSmall) {
      const otherAbsVal = Math.abs(otherNum.numericValue);
      return myAbsVal === otherAbsVal ? 0 : (myAbsVal > otherAbsVal ? 1 : -1);
    }
    // Compare small number with BigNumber by converting small to chunks
    return compareAbsoluteChunks(getChunkArrayFromSmall(myAbsVal), otherNum.digitChunks);
  };
  NativeBigIntWrapper.prototype.compareAbsolute = function (val) {
    let myAbs = this.nativeVal >= 0n ? this.nativeVal : -this.nativeVal;
    let otherAbs = parseInputToBigNumber(val).nativeVal;
    otherAbs = otherAbs >= 0n ? otherAbs : -otherAbs;
    return myAbs === otherAbs ? 0 : (myAbs > otherAbs ? 1 : -otherAbs > myAbs ? -1 : 1);
  };

  // --- Comparison methods ---
  BigNumber.prototype.compareWith = function (val) {
    // Handle special JavaScript number comparisons (Infinity, -Infinity)
    if (val === Infinity) return -1;
    if (val === -Infinity) return 1;

    const otherNum = parseInputToBigNumber(val);

    // Different signs: straightforward comparison
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1; // If `this` is positive and `other` is negative, `this` is greater
    }

    // Same signs: compare absolute values, then apply sign modifier
    const absComparison = this.compareAbsolute(otherNum);
    return this.isNegative ? -absComparison : absComparison; // Invert result if negative
  };
  BigNumber.prototype.compareTo = BigNumber.prototype.compareWith;

  SmallNumber.prototype.compareWith = function (val) {
    if (val === Infinity) return -1;
    if (val === -Infinity) return 1;

    const otherNum = parseInputToBigNumber(val);
    const myVal = this.numericValue;

    if (otherNum.isSmall) {
      // Both are small, direct comparison
      return myVal === otherNum.numericValue ? 0 : (myVal > otherNum.numericValue ? 1 : -1);
    }
    // SmallNumber vs BigNumber
    // Different signs: straightforward
    if ((myVal < 0) !== otherNum.isNegative) {
      return (myVal < 0) ? -1 : 1; // If `this` is negative, it's smaller than positive `other`
    }
    // Same signs: SmallNumber is always "smaller" in magnitude than a BigNumber
    // unless the BigNumber is 0 which is handled by isZero().
    // So if same sign, and other is BigNumber, this is smaller if positive, larger if negative
    return myVal < 0 ? 1 : -1;
  };
  SmallNumber.prototype.compareTo = SmallNumber.prototype.compareWith;

  NativeBigIntWrapper.prototype.compareWith = function (val) {
    if (val === Infinity) return -1;
    if (val === -Infinity) return 1;
    const myVal = this.nativeVal;
    const otherVal = parseInputToBigNumber(val).nativeVal;
    return myVal === otherVal ? 0 : (myVal > otherVal ? 1 : -1);
  };
  NativeBigIntWrapper.prototype.compareTo = NativeBigIntWrapper.prototype.compareWith;

  // --- Equality and Inequality methods ---
  BigNumber.prototype.isEqualTo = function (val) {
    return this.compareWith(val) === 0;
  };
  NativeBigIntWrapper.prototype.eq = NativeBigIntWrapper.prototype.isEqualTo =
    SmallNumber.prototype.eq = SmallNumber.prototype.isEqualTo =
    BigNumber.prototype.eq = BigNumber.prototype.isEqualTo;

  BigNumber.prototype.isNotEqualTo = function (val) {
    return this.compareWith(val) !== 0;
  };
  NativeBigIntWrapper.prototype.neq = NativeBigIntWrapper.prototype.isNotEqualTo =
    SmallNumber.prototype.neq = SmallNumber.prototype.isNotEqualTo =
    BigNumber.prototype.neq = BigNumber.prototype.isNotEqualTo;

  BigNumber.prototype.isGreaterThan = function (val) {
    return this.compareWith(val) > 0;
  };
  NativeBigIntWrapper.prototype.gt = NativeBigIntWrapper.prototype.isGreaterThan =
    SmallNumber.prototype.gt = SmallNumber.prototype.isGreaterThan =
    BigNumber.prototype.gt = BigNumber.prototype.isGreaterThan;

  BigNumber.prototype.isLesserThan = function (val) {
    return this.compareWith(val) < 0;
  };
  NativeBigIntWrapper.prototype.lt = NativeBigIntWrapper.prototype.isLesserThan =
    SmallNumber.prototype.lt = SmallNumber.prototype.isLesserThan =
    BigNumber.prototype.lt = BigNumber.prototype.isLesserThan;

  BigNumber.prototype.isGreaterOrEqual = function (val) {
    return this.compareWith(val) >= 0;
  };
  NativeBigIntWrapper.prototype.geq = NativeBigIntWrapper.prototype.isGreaterOrEqual =
    SmallNumber.prototype.geq = SmallNumber.prototype.isGreaterOrEqual =
    BigNumber.prototype.geq = BigNumber.prototype.isGreaterOrEqual;

  BigNumber.prototype.isLesserOrEqual = function (val) {
    return this.compareWith(val) <= 0;
  };
  NativeBigIntWrapper.prototype.leq = NativeBigIntWrapper.prototype.isLesserOrEqual =
    SmallNumber.prototype.leq = SmallNumber.prototype.isLesserOrEqual =
    BigNumber.prototype.leq = BigNumber.prototype.isLesserOrEqual;

  // --- Type/Property checks ---
  BigNumber.prototype.isEven = function () {
    // Check the least significant chunk
    return (this.digitChunks[0] & 1) === 0;
  };
  SmallNumber.prototype.isEven = function () {
    return (this.numericValue & 1) === 0;
  };
  NativeBigIntWrapper.prototype.isEven = function () {
    return (this.nativeVal & 1n) === 0n;
  };

  BigNumber.prototype.isOdd = function () {
    return (this.digitChunks[0] & 1) === 1;
  };
  SmallNumber.prototype.isOdd = function () {
    return (this.numericValue & 1) === 1;
  };
  NativeBigIntWrapper.prototype.isOdd = function () {
    return (this.nativeVal & 1n) === 1n;
  };

  BigNumber.prototype.isPositive = function () {
    return !this.isNegative && !this.isZero(); // Explicitly check for zero
  };
  SmallNumber.prototype.isPositive = function () {
    return this.numericValue > 0;
  };
  NativeBigIntWrapper.prototype.isPositive = function () {
    return this.nativeVal > 0n;
  };

  BigNumber.prototype.isNegative = function () {
    return this.isNegative;
  };
  SmallNumber.prototype.isNegative = function () {
    return this.numericValue < 0;
  };
  NativeBigIntWrapper.prototype.isNegative = function () {
    return this.nativeVal < 0n;
  };

  BigNumber.prototype.isUnit = function () {
    // A BigNumber is a unit if it's 1 or -1
    return this.compareAbsolute(NumericalEntityBase.ONE) === 0 && (this.isPositive() || this.isNegative());
  };
  SmallNumber.prototype.isUnit = function () {
    return Math.abs(this.numericValue) === 1;
  };
  NativeBigIntWrapper.prototype.isUnit = function () {
    return this.absoluteValue().nativeVal === 1n;
  };

  BigNumber.prototype.isZero = function () {
    // A BigNumber is zero if its chunk array is empty or contains only [0]
    return this.digitChunks.length === 0 || (this.digitChunks.length === 1 && this.digitChunks[0] === 0);
  };
  SmallNumber.prototype.isZero = function () {
    return this.numericValue === 0;
  };
NativeBigIntWrapper.prototype.isZero = function () {
    return this.nativeVal === 0n;
  };

  BigNumber.prototype.isDivisibleBy = function (val) {
    const otherNum = parseInputToBigNumber(val);
    if (otherNum.isZero()) return false; // Cannot divide by zero
    if (otherNum.isUnit()) return true; // Divisible by 1 or -1
    if (otherNum.compareAbsolute(NumericalEntityBase.TWO) === 0) return this.isEven(); // Divisible by 2 if even
    return this.moduloOp(otherNum).isZero();
  };
  NativeBigIntWrapper.prototype.isDivisibleBy = SmallNumber.prototype.isDivisibleBy = BigNumber.prototype.isDivisibleBy;

  // --- Primality Tests ---
  /**
   * Checks if a number is one of the small prime numbers.
   * @param {BigNumber|SmallNumber|NativeBigIntWrapper} num - The number to check.
   * @returns {boolean|undefined} True if it's a small prime, false if composite, undefined if unknown.
   */
  function isTrivialPrime(num) {
    const absNum = num.absoluteValue();
    if (absNum.isUnit()) return false; // 1 is not prime
    if (absNum.isEqualTo(NumericalEntityBase.TWO) || absNum.isEqualTo(NumericalEntityBase.THREE) || absNum.isEqualTo(NumericalEntityBase.FIVE)) {
      return true;
    }
    if (absNum.isEven() || absNum.isDivisibleBy(NumericalEntityBase.THREE) || absNum.isDivisibleBy(NumericalEntityBase.FIVE)) {
      return false; // Divisible by 2, 3, or 5 (and not 2, 3, 5 itself)
    }
    if (absNum.isLesserThan(NumericalEntityBase(49))) return true; // Primes up to 47 are covered by this and previous checks
    return undefSentinel; // Undefined means further testing needed
  }

  /**
   * Performs the Miller-Rabin primality test.
   * @param {BigNumber} candidateN - The number to test for primality.
   * @param {number[]} testWitnesses - Array of small prime bases (witnesses).
   * @returns {boolean} True if likely prime, false if composite.
   */
  function runMillerRabinTest(candidateN, testWitnesses) {
    const nMinusOne = candidateN.decrement(); // n - 1
    let d = nMinusOne;
    let s = 0; // s such that n-1 = d * 2^s and d is odd

    // Find d and s
    while (d.isEven()) {
      d = d.divideOp(NumericalEntityBase.TWO);
      s++;
    }

    // Loop through each witness 'a'
    for (let k = 0; k < testWitnesses.length; ++k) {
      const a = largeIntegerFactory(testWitnesses[k]); // Convert witness to BigNumber
      if (candidateN.isLesserThan(a)) continue; // Witness must be less than n

      let x = a.modularPower(d, candidateN); // x = a^d mod n

      if (x.isUnit() || x.isEqualTo(nMinusOne)) continue; // Likely prime for this witness

      let isComposite = true;
      for (let r = 0; r < s - 1; ++r) {
        x = x.squareOp().moduloOp(candidateN); // x = x^2 mod n
        if (x.isUnit()) return false; // Definitely composite
        if (x.isEqualTo(nMinusOne)) {
          isComposite = false; // Likely prime for this witness, break inner loop
          break;
        }
      }
      if (isComposite) return false; // Definitely composite
    }
    return true; // Passed all tests, likely prime
  }

  BigNumber.prototype.isProbablyPrime = function (strictMode) {
    const knownPrime = isTrivialPrime(this);
    if (knownPrime !== undefSentinel) return knownPrime; // Return if it's a small prime or composite

    const absNum = this.absoluteValue();
    const bitLength = absNum.bitLength().toJSNumber();

    // Use a fixed set of witnesses for smaller numbers (up to 64-bit)
    if (bitLength <= 64) {
      return runMillerRabinTest(absNum, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
    }

    // For larger numbers, determine number of iterations based on log(N)
    const naturalLogN = Math.log(2) * bitLength; // log_e(N)
    // The number of witnesses 't' determines the probability of error.
    // 'strictMode' parameter can influence the number of tests.
    const numTests = Math.ceil(strictMode === true ? 2 * Math.pow(naturalLogN, 2) : naturalLogN);

    const witnesses = [];
    for (let k = 0; k < numTests; ++k) {
      // Choose witnesses from 2 up to some limit (or randomly)
      witnesses.push(largeIntegerFactory(k + 2)); // Use small sequential numbers as witnesses
    }
    return runMillerRabinTest(absNum, witnesses);
  };
  NativeBigIntWrapper.prototype.isProbablyPrime = SmallNumber.prototype.isProbablyPrime = BigNumber.prototype.isProbablyPrime;

  BigNumber.prototype.isProbablePrimeWithRounds = function (iterations, randomGenerator) {
    const knownPrime = isTrivialPrime(this);
    if (knownPrime !== undefSentinel) return knownPrime;

    const absNum = this.absoluteValue();
    const testRounds = iterations === undefSentinel ? 5 : iterations; // Default to 5 rounds

    const witnesses = [];
    for (let k = 0; k < testRounds; ++k) {
      // Generate random witnesses between 2 and n-2
      witnesses.push(largeIntegerFactory.generateRandomBetween(NumericalEntityBase.TWO, absNum.minus(NumericalEntityBase.TWO), randomGenerator));
    }
    return runMillerRabinTest(absNum, witnesses);
  };
  NativeBigIntWrapper.prototype.isProbablePrimeWithRounds = SmallNumber.prototype.isProbablePrimeWithRounds = BigNumber.prototype.isProbablePrimeWithRounds;

  // --- Modular Inverse (Extended Euclidean Algorithm) ---
  BigNumber.prototype.modularInverse = function (modulusNum) {
    let tempT = NumericalEntityBase.ZERO, newTempT = NumericalEntityBase.ONE;
    let currentMod = parseInputToBigNumber(modulusNum);
    let currentVal = this.absoluteValue(); // Use absolute value for calculations
    let quotient, lastT, lastR;

    // Extended Euclidean Algorithm
    while (!currentVal.isZero()) {
      quotient = currentMod.divideOp(currentVal);
      lastT = tempT;
      lastR = currentMod;

      tempT = newTempT;
      currentMod = currentVal;

      newTempT = lastT.subtractOp(quotient.multiply(newTempT));
      currentVal = lastR.subtractOp(quotient.multiply(currentVal));
    }

    // If GCD is not 1, modular inverse does not exist
    if (!currentMod.isUnit()) {
      throw new Error(`${this.toString()} and ${modulusNum.toString()} are not coprime, modular inverse does not exist.`);
    }

    // Ensure result is positive
    if (tempT.isLesserThan(NumericalEntityBase.ZERO)) {
      tempT = tempT.plusOp(modulusNum);
    }

    // If original number was negative, negate the result
    if (this.isNegative()) {
      return tempT.negate();
    }
    return tempT;
  };
  NativeBigIntWrapper.prototype.modularInverse = SmallNumber.prototype.modularInverse = BigNumber.prototype.modularInverse;

  // --- Increment/Decrement ---
  BigNumber.prototype.increment = function () {
    const myChunks = this.digitChunks;
    if (this.isNegative) {
      // If negative, incrementing means subtracting 1 from absolute value
      return subtractSmallValueFromChunks(myChunks, 1, this.isNegative);
    }
    // If positive, add 1
    return new BigNumber(addSmallValueToChunks(myChunks, 1), this.isNegative);
  };
  SmallNumber.prototype.increment = function () {
    const myVal = this.numericValue;
    if (myVal + 1 < JAVASCRIPT_MAX_SAFE_INT) return new SmallNumber(myVal + 1);
    // If incrementing exceeds safe integer, convert to BigNumber
    return new BigNumber(MAX_SAFE_INT_COMPONENTS, false);
  };
  NativeBigIntWrapper.prototype.increment = function () {
    return new NativeBigIntWrapper(this.nativeVal + 1n);
  };

  BigNumber.prototype.decrement = function () {
    const myChunks = this.digitChunks;
    if (this.isNegative) {
      // If negative, decrementing means adding 1 to absolute value
      return new BigNumber(addSmallValueToChunks(myChunks, 1), true);
    }
    // If positive, subtract 1
    return subtractSmallValueFromChunks(myChunks, 1, this.isNegative);
  };
  SmallNumber.prototype.decrement = function () {
    const myVal = this.numericValue;
    if (myVal - 1 > -JAVASCRIPT_MAX_SAFE_INT) return new SmallNumber(myVal - 1);
    // If decrementing goes below safe integer, convert to BigNumber
    return new BigNumber(MAX_SAFE_INT_COMPONENTS, true); // MAX_SAFE_INT_COMPONENTS with negative sign
  };
  NativeBigIntWrapper.prototype.decrement = function () {
    return new NativeBigIntWrapper(this.nativeVal - 1n);
  };

  // Pre-calculate powers of 2 for bitwise operations
  const powersOfTwoArray = [1];
  while (2 * powersOfTwoArray[powersOfTwoArray.length - 1] <= CHUNK_BASE_VAL) {
    powersOfTwoArray.push(2 * powersOfTwoArray[powersOfTwoArray.length - 1]);
  }
  const powersArrayLength = powersOfTwoArray.length;
  const largestPowerOfTwo = powersOfTwoArray[powersArrayLength - 1];

  function isShiftValueSmall(num) {
    return Math.abs(num) <= CHUNK_BASE_VAL; // Check if shift amount fits in a chunk
  }

  BigNumber.prototype.leftShift = function (shiftAmountVal) {
    const shiftAmount = parseInputToBigNumber(shiftAmountVal).toJSNumber();
    if (!isShiftValueSmall(shiftAmount)) {
      throw new Error(`Shift amount ${shiftAmount} is too large.`);
    }
    if (shiftAmount < 0) return this.rightShift(-shiftAmount);
    if (this.isZero()) return this; // Shifting zero results in zero

    let currentResult = this;
    let remainingShift = shiftAmount;

    // Apply shifts by multiplying by powers of two
    while (remainingShift >= powersArrayLength) {
      currentResult = currentResult.multiply(largestPowerOfTwo);
      remainingShift -= (powersArrayLength - 1); // Account for the power used
    }
    return currentResult.multiply(powersOfTwoArray[remainingShift]);
  };
  NativeBigIntWrapper.prototype.leftShift = SmallNumber.prototype.leftShift = BigNumber.prototype.leftShift;

  BigNumber.prototype.rightShift = function (shiftAmountVal) {
    let divisionResult;
    const shiftAmount = parseInputToBigNumber(shiftAmountVal).toJSNumber();

    if (!isShiftValueSmall(shiftAmount)) {
      throw new Error(`Shift amount ${shiftAmount} is too large.`);
    }
    if (shiftAmount < 0) return this.leftShift(-shiftAmount);

    let currentResult = this;
    let remainingShift = shiftAmount;

    // Apply shifts by dividing by powers of two
    while (remainingShift >= powersArrayLength) {
      // For negative numbers, right shift rounds towards negative infinity.
      // E.g., -5 >> 1 = -3. So if remainder is non-zero, quotient needs adjustment.
      if (currentResult.isZero() || (currentResult.isNegative() && currentResult.isUnit())) {
        return currentResult; // Shifting -1 right results in -1. Shifting 0 right results in 0.
      }
      divisionResult = flexibleDivideAndModulo(currentResult, largestPowerOfTwo);
      currentResult = divisionResult[1].isNegative() && !divisionResult[1].isZero() ? divisionResult[0].decrement() : divisionResult[0];
      remainingShift -= (powersArrayLength - 1);
    }
    divisionResult = flexibleDivideAndModulo(currentResult, powersOfTwoArray[remainingShift]);
    return divisionResult[1].isNegative() && !divisionResult[1].isZero() ? divisionResult[0].decrement() : divisionResult[0];
  };
  NativeBigIntWrapper.prototype.rightShift = SmallNumber.prototype.rightShift = BigNumber.prototype.rightShift;

  /**
   * Generic bitwise operation function.
   * Processes numbers chunk by chunk, applying the bitwise function.
   * @param {BigNumber} xNum - First operand.
   * @param {BigNumber} yNum - Second operand.
   * @param {function(number, number): number} bitwiseFn - The bitwise function (e.g., `(a,b) => a & b`).
   * @returns {BigNumber} Result of the bitwise operation.
   */
  function applyChunkwiseBitwise(xNum, yNum, bitwiseFn) {
    const xIsNegative = xNum.isNegative();
    const yIsNegative = yNum.isNegative();

    // Use two's complement representation for negative numbers
    let xRemaining = xIsNegative ? xNum.not() : xNum;
    let yRemaining = yIsNegative ? yNum.not() : yNum;

    const resultChunks = [];
    let xChunk = 0, yChunk = 0;
    let xDivModRes, yDivModRes;

    // Iterate while there are still non-zero chunks
    while (!xRemaining.isZero() || !yRemaining.isZero()) {
      xDivModRes = flexibleDivideAndModulo(xRemaining, largestPowerOfTwo);
      xChunk = xDivModRes[1].toJSNumber();
      if (xIsNegative) {
        xChunk = largestPowerOfTwo - 1 - xChunk; // Apply two's complement logic
      }

      yDivModRes = flexibleDivideAndModulo(yRemaining, largestPowerOfTwo);
      yChunk = yDivModRes[1].toJSNumber();
      if (yIsNegative) {
        yChunk = largestPowerOfTwo - 1 - yChunk; // Apply two's complement logic
      }

      xRemaining = xDivModRes[0];
      yRemaining = yDivModRes[0];

      resultChunks.push(bitwiseFn(xChunk, yChunk));
    }

    // Determine the sign of the overall result based on the most significant bit (conceptually)
    const finalSignBit = bitwiseFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
    let finalResult = finalSignBit !== 0 ? largeIntegerFactory.MINUS_ONE : largeIntegerFactory.ZERO;

    // Reconstruct the number from result chunks
    for (let k = resultChunks.length - 1; k >= 0; --k) {
      finalResult = finalResult.multiply(largestPowerOfTwo).add(largeIntegerFactory(resultChunks[k]));
    }
    return finalResult;
  }

  BigNumber.prototype.bitwiseNot = function () {
    return this.negate().decrement(); // ~N = -(N+1)
  };
  NativeBigIntWrapper.prototype.bitwiseNot = SmallNumber.prototype.bitwiseNot = BigNumber.prototype.bitwiseNot;
  BigNumber.prototype.not = BigNumber.prototype.bitwiseNot; // Alias

  BigNumber.prototype.bitwiseAnd = function (val) {
    return applyChunkwiseBitwise(this, val, (a, b) => a & b);
  };
  NativeBigIntWrapper.prototype.bitwiseAnd = SmallNumber.prototype.bitwiseAnd = BigNumber.prototype.bitwiseAnd;
  BigNumber.prototype.and = BigNumber.prototype.bitwiseAnd; // Alias

  BigNumber.prototype.bitwiseOr = function (val) {
    return applyChunkwiseBitwise(this, val, (a, b) => a | b);
  };
  NativeBigIntWrapper.prototype.bitwiseOr = SmallNumber.prototype.bitwiseOr = BigNumber.prototype.bitwiseOr;
  BigNumber.prototype.or = BigNumber.prototype.bitwiseOr; // Alias

  BigNumber.prototype.bitwiseXor = function (val) {
    return applyChunkwiseBitwise(this, val, (a, b) => a ^ b);
  };
  NativeBigIntWrapper.prototype.bitwiseXor = SmallNumber.prototype.bitwiseXor = BigNumber.prototype.bitwiseXor;
  BigNumber.prototype.xor = BigNumber.prototype.bitwiseXor; // Alias

  // --- Bit Length ---
  // LOBMASK_I = 1 << 30
  // LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
  // These constants are likely for internal optimizations related to bitwise operations,
  // specifically for finding the lowest one bit (LOB).
  // For Type III clone, I'll keep the `roughLOB` function, but simplify the mask if possible or just rename.
  const LOWEST_ONE_BIT_MASK_JS = 1 << 30; // A power of 2
  const LOWEST_ONE_BIT_MASK_CHUNKS = (CHUNK_BASE_VAL & -CHUNK_BASE_VAL) * (CHUNK_BASE_VAL & -CHUNK_BASE_VAL) | LOWEST_ONE_BIT_MASK_JS;

  /**
   * Estimates the lowest one bit value of a number (used for GCD optimization).
   * @param {BigNumber|SmallNumber|NativeBigIntWrapper} num - The number.
   * @returns {number|BigInt} The approximate lowest one bit.
   */
  function estimateLowestOneBit(num) {
    const internalVal = num.isSmall ? num.numericValue : (nativeBigIntAvailable && num instanceof NativeBigIntWrapper ? num.nativeVal : num.digitChunks[0] + (num.digitChunks[1] || 0) * CHUNK_BASE_VAL);
    // Apply bitwise AND with its two's complement to get the LOB
    const lobCandidate = typeof internalVal === "number"
      ? internalVal | LOWEST_ONE_BIT_MASK_JS
      : (typeof internalVal === "bigint" ? internalVal | BigInt(LOWEST_ONE_BIT_MASK_JS) : internalVal | LOWEST_ONE_BIT_MASK_CHUNKS);
    return lobCandidate & -lobCandidate;
  }

  /**
   * Calculates the integer logarithm of a value to a given base.
   * Used for bitLength calculation.
   * @param {BigNumber} targetValue - The number for which to calculate log.
   * @param {BigNumber} logBase - The base of the logarithm.
   * @returns {{p: BigNumber, e: number}} Object with power (p) and exponent (e).
   */
  function calculateIntegerLogarithm(targetValue, logBase) {
    if (logBase.compareWith(targetValue) <= 0) {
      const { p: previousPower, e: previousExp } = calculateIntegerLogarithm(targetValue, logBase.squareOp());
      const currentPowerTimesBase = previousPower.multiply(logBase);
      return currentPowerTimesBase.compareWith(targetValue) <= 0
        ? { p: currentPowerTimesBase, e: previousExp * 2 + 1 }
        : { p: previousPower, e: previousExp * 2 };
    }
    return { p: largeIntegerFactory.ONE, e: 0 };
  }

  BigNumber.prototype.bitLength = function () {
    let currentNum = this;
    // For negative numbers, bit length is for |N+1| (two's complement representation)
    if (currentNum.isLesserThan(NumericalEntityBase.ZERO)) {
      currentNum = currentNum.negate().decrement();
    }
    if (currentNum.isZero()) {
      return NumericalEntityBase.ZERO;
    }
    // Log base 2 of N, then add 1 to get number of bits
    return largeIntegerFactory(calculateIntegerLogarithm(currentNum, NumericalEntityBase.TWO).e).add(NumericalEntityBase.ONE);
  };
  NativeBigIntWrapper.prototype.bitLength = SmallNumber.prototype.bitLength = BigNumber.prototype.bitLength;

  // --- Utility functions (min, max, gcd, lcm, random) ---
  /**
   * Returns the maximum of two BigNumber instances.
   * @param {*} num1 - First number.
   * @param {*} num2 - Second number.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The larger number.
   */
  function getMaximum(num1, num2) {
    const parsedNum1 = parseInputToBigNumber(num1);
    const parsedNum2 = parseInputToBigNumber(num2);
    return parsedNum1.isGreaterThan(parsedNum2) ? parsedNum1 : parsedNum2;
  }

  /**
   * Returns the minimum of two BigNumber instances.
   * @param {*} num1 - First number.
   * @param {*} num2 - Second number.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The smaller number.
   */
  function getMinimum(num1, num2) {
    const parsedNum1 = parseInputToBigNumber(num1);
    const parsedNum2 = parseInputToBigNumber(num2);
    return parsedNum1.isLesserThan(parsedNum2) ? parsedNum1 : parsedNum2;
  }

  /**
   * Calculates the greatest common divisor (GCD) of two numbers using the binary GCD algorithm.
   * @param {*} numA - First number.
   * @param {*} numB - Second number.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The GCD.
   */
  function greatestCommonDivisor(numA, numB) {
    let a = parseInputToBigNumber(numA).absoluteValue();
    let b = parseInputToBigNumber(numB).absoluteValue();

    if (a.isEqualTo(b)) return a;
    if (a.isZero()) return b;
    if (b.isZero()) return a;

    let commonFactor = NumericalEntityBase.ONE;
    let temp;

    // Remove common factors of 2
    while (a.isEven() && b.isEven()) {
      const lobA = estimateLowestOneBit(a);
      const lobB = estimateLowestOneBit(b);
      const minLob = getMinimum(largeIntegerFactory(lobA), largeIntegerFactory(lobB));
      a = a.divideOp(minLob);
      b = b.divideOp(minLob);
      commonFactor = commonFactor.multiply(minLob);
    }

    // Remove factors of 2 from 'a'
    while (a.isEven()) {
      a = a.divideOp(estimateLowestOneBit(a));
    }

    // Main loop of binary GCD
    do {
      while (b.isEven()) {
        b = b.divideOp(estimateLowestOneBit(b));
      }
      if (a.isGreaterThan(b)) {
        temp = b;
        b = a;
        a = temp;
      }
      b = b.subtractOp(a);
    } while (!b.isZero());

    return commonFactor.isUnit() ? a : a.multiply(commonFactor);
  }

  /**
   * Calculates the least common multiple (LCM) of two numbers.
   * LCM(a, b) = |a * b| / GCD(a, b)
   * @param {*} numA - First number.
   * @param {*} numB - Second number.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The LCM.
   */
  function leastCommonMultiple(numA, numB) {
    const a = parseInputToBigNumber(numA).absoluteValue();
    const b = parseInputToBigNumber(numB).absoluteValue();
    if (a.isZero() || b.isZero()) return NumericalEntityBase.ZERO; // LCM of 0 and any number is 0
    return a.divideOp(greatestCommonDivisor(a, b)).multiply(b);
  }

  /**
   * Generates a random BigNumber between a (inclusive) and b (inclusive).
   * @param {*} lowerBound - The lower bound.
   * @param {*} upperBound - The upper bound.
   * @param {function(): number} [customRNG] - Optional custom random number generator (defaults to Math.random).
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} A random number within the range.
   */
  function generateRandomBetween(lowerBound, upperBound, customRNG) {
    const low = getMinimum(lowerBound, upperBound);
    const high = getMaximum(lowerBound, upperBound);
    const rng = customRNG || Math.random;

    const range = high.subtract(low).add(NumericalEntityBase.ONE);

    // If the range is small enough, use direct Math.random multiplication
    if (range.isSmall) {
      return low.add(Math.floor(rng() * range.numericValue));
    }

    // For large ranges, generate number chunk by chunk
    const rangeChunks = convertToBaseRepresentation(range, CHUNK_BASE_VAL).value;
    const resultChunks = [];
    let isRestricted = true; // Flag to ensure digits don't exceed the range's digits

    for (let k = 0; k < rangeChunks.length; ++k) {
      const upperLimitForChunk = isRestricted ? rangeChunks[k] : CHUNK_BASE_VAL;
      const randomDigit = floorOrCeil(rng() * upperLimitForChunk);
      resultChunks.push(randomDigit);
      if (randomDigit < upperLimitForChunk) {
        isRestricted = false; // Once a digit is less than its upper limit, subsequent digits can be anything up to CHUNK_BASE_VAL-1
      }
    }
    // Construct BigNumber from random chunks and add to lower bound
    return low.add(NumericalEntityBase.fromChunkArray(resultChunks, CHUNK_BASE_VAL, false));
  }

  // --- Base Conversion and String Representation ---
  /**
   * Parses a string representation of a number in a given base.
   * @param {string} textValue - The string to parse.
   * @param {number} inputBase - The base of the input string.
   * @param {string} [customAlphabet] - Custom characters for the base.
   * @param {boolean} [isCaseSensitive] - Whether the alphabet is case-sensitive.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The parsed number.
   */
  const parseStringWithBase = function (textValue, inputBase, customAlphabet, isCaseSensitive) {
    let currentAlphabet = customAlphabet || DEFAULT_ALPHANUM_CHARS;
    textValue = String(textValue);

    // Normalize case if not sensitive
    if (!isCaseSensitive) {
      textValue = textValue.toLowerCase();
      currentAlphabet = currentAlphabet.toLowerCase();
    }

    const valueLength = textValue.length;
    let charIndex;
    const absoluteBase = Math.abs(inputBase);
    const alphabetMapping = {};

    // Create a mapping from character to digit value
    for (charIndex = 0; charIndex < currentAlphabet.length; ++charIndex) {
      alphabetMapping[currentAlphabet[charIndex]] = charIndex;
    }

    // Validate input string characters
    for (charIndex = 0; charIndex < valueLength; ++charIndex) {
      const char = textValue[charIndex];
      if (char === "-") continue; // Allow negative sign

      if (char in alphabetMapping) {
        if (alphabetMapping[char] >= absoluteBase) {
          // Special case for base 1: '1' is the only digit
          if (!(char === "1" && absoluteBase === 1)) {
            throw new Error(`Character '${char}' is not a valid digit in base ${inputBase}.`);
          }
        }
      }
    }

    const baseBigNum = parseInputToBigNumber(inputBase);
    const digitValues = [];
    const isNegativeInput = textValue[0] === "-";

    // Extract digits and convert to BigNumber instances
    for (charIndex = isNegativeInput ? 1 : 0; charIndex < textValue.length; ++charIndex) {
      const char = textValue[charIndex];
      if (char in alphabetMapping) {
        digitValues.push(parseInputToBigNumber(alphabetMapping[char]));
      } else if (char === "<") {
        // Handle custom digit format like <123>
        const startIndex = charIndex;
        do {
          charIndex++;
        } while (textValue[charIndex] !== ">" && charIndex < textValue.length);
        digitValues.push(parseInputToBigNumber(textValue.slice(startIndex + 1, charIndex)));
      } else {
        throw new Error(`Character '${char}' is not a valid character in the provided alphabet or format.`);
      }
    }
    return constructFromBaseChunks(digitValues, baseBigNum, isNegativeInput);
  };

  /**
   * Constructs a BigNumber from an array of BigNumber digits and a base.
   * @param {BigNumber[]} digitsArray - Array of BigNumber digits.
   * @param {BigNumber} baseNum - The base of the number system.
   * @param {boolean} isNeg - Whether the resulting number is negative.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The constructed number.
   */
  function constructFromBaseChunks(digitsArray, baseNum, isNeg) {
    let resultNum = NumericalEntityBase.ZERO;
    let currentPower = NumericalEntityBase.ONE;

    // Horner's method for polynomial evaluation
    for (let k = digitsArray.length - 1; k >= 0; --k) {
      resultNum = resultNum.add(digitsArray[k].timesOp(currentPower));
      currentPower = currentPower.timesOp(baseNum);
    }
    return isNeg ? resultNum.negate() : resultNum;
  }

  /**
   * Converts a single digit to its string representation using a given alphabet.
   * @param {number} digitValue - The digit value.
   * @param {string} alphabetChars - The alphabet string.
   * @returns {string} The string representation of the digit.
   */
  function digitToCharString(digitValue, alphabetChars) {
    if (digitValue < alphabetChars.length) {
      return alphabetChars[digitValue];
    }
    return `<${digitValue}>`; // Fallback for digits outside alphabet range
  }

  /**
   * Converts a BigNumber to its representation in a specified base.
   * @param {BigNumber|SmallNumber|NativeBigIntWrapper} num - The number to convert.
   * @param {BigNumber} targetBase - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit values and sign.
   */
  function convertToBaseRepresentation(num, targetBase) {
    let base = parseInputToBigNumber(targetBase);

    if (base.isZero()) {
      if (num.isZero()) return { value: [0], isNegative: false };
      throw new Error("Cannot convert non-zero numbers to base 0.");
    }
    // Handling base -1 is complex and niche, the original library does it, I will simplify/omit details or keep as is.
    // The original code for base -1 is quite specific, I will keep it for functional parity.
    if (base.isEqualTo(NumericalEntityBase.MINUS_ONE)) {
      if (num.isZero()) return { value: [0], isNegative: false };
      if (num.isNegative()) {
        // Example: -5 in base -1 is "10101"
        const onesAndZeros = Array.from({ length: -num.toJSNumber() }, (v, i) => i % 2 === 0 ? [1] : [0]);
        return { value: [].concat(...onesAndZeros), isNegative: false };
      }
      // Example: 5 in base -1 is "101"
      const zerosAndOnes = Array.from({ length: num.toJSNumber() - 1 }, (v, i) => i % 2 === 0 ? [0] : [1]);
      zerosAndOnes.unshift([1]);
      return { value: [].concat(...zerosAndOnes), isNegative: false };
    }

    let isResultNegative = false;
    if (num.isNegative() && base.isPositive()) {
      isResultNegative = true;
      num = num.absoluteValue();
    }

    if (base.isUnit()) {
      if (num.isZero()) return { value: [0], isNegative: false };
      // Base 1 means '1' repeated N times.
      const onesArray = Array.from({ length: num.toJSNumber() }, () => 1);
      return { value: onesArray, isNegative: isResultNegative };
    }

    const outputDigits = [];
    let currentRemainder;
    let currentDividend = num;

    while (currentDividend.isNegative() || currentDividend.compareAbsolute(base) >= 0) {
      const { quotient, remainder } = currentDividend.divmod(base);
      currentDividend = quotient;
      currentRemainder = remainder;

      // Handle negative remainders by adjusting quotient and remainder
      if (currentRemainder.isNegative()) {
        currentRemainder = base.minus(currentRemainder).absoluteValue(); // Make remainder positive
        currentDividend = currentDividend.increment(); // Adjust quotient
      }
      outputDigits.push(currentRemainder.toJSNumber());
    }
    outputDigits.push(currentDividend.toJSNumber()); // Push the last quotient
    return { value: outputDigits.reverse(), isNegative: isResultNegative };
  }

  /**
   * Converts a BigNumber to its string representation in a specified base.
   * @param {BigNumber|SmallNumber|NativeBigIntWrapper} num - The number to convert.
   * @param {number} base - The target base.
   * @param {string} [alphabet] - Custom alphabet characters.
   * @returns {string} The string representation.
   */
  function toFormattedBaseString(num, base, alphabet) {
    const { value: digits, isNegative } = convertToBaseRepresentation(num, base);
    const digitStrings = digits.map(x => digitToCharString(x, alphabet));
    return (isNegative ? "-" : "") + digitStrings.join("");
  }

  BigNumber.prototype.toDigitArray = function (radix) {
    return convertToBaseRepresentation(this, radix);
  };
  SmallNumber.prototype.toDigitArray = BigNumber.prototype.toDigitArray;
  NativeBigIntWrapper.prototype.toDigitArray = BigNumber.prototype.toDigitArray;

  BigNumber.prototype.toString = function (radix, alphabet) {
    if (radix === undefSentinel) radix = 10;
    if (radix !== 10) return toFormattedBaseString(this, radix, alphabet);

    const myChunks = this.digitChunks;
    let chunkLength = myChunks.length;
    if (chunkLength === 0) return "0"; // Handle zero case

    let stringRep = String(myChunks[--chunkLength]); // Start with most significant chunk
    const padding = "0000000"; // For zero-padding chunks
    let currentChunk;

    while (chunkLength >= 0) {
      currentChunk = String(myChunks[chunkLength--]);
      // Pad with leading zeros if necessary (e.g., 10000000 becomes "010000000" if previous was 1)
      stringRep += padding.slice(currentChunk.length) + currentChunk;
    }
    // Remove leading zeros from the entire string if any, though normalizeChunks should handle it
    // And add sign
    return (this.isNegative ? "-" : "") + stringRep;
  };
  SmallNumber.prototype.toString = function (radix, alphabet) {
    if (radix === undefSentinel) radix = 10;
    if (radix !== 10) return toFormattedBaseString(this, radix, alphabet);
    return String(this.numericValue);
  };
  NativeBigIntWrapper.prototype.toString = SmallNumber.prototype.toString; // Native BigInt uses its own toString

  // JSON serialization (uses toString)
  NativeBigIntWrapper.prototype.toJSON = BigNumber.prototype.toJSON = SmallNumber.prototype.toJSON = function () {
    return this.toString();
  };

  // ValueOf for primitive conversion (often used implicitly by JS)
  BigNumber.prototype.valueOf = function () {
    // This is problematic as it can lose precision. Explicit `toJSNumber` is better.
    return parseInt(this.toString(), 10);
  };
  BigNumber.prototype.toJSNumber = BigNumber.prototype.valueOf;

  SmallNumber.prototype.valueOf = function () {
    return this.numericValue;
  };
  SmallNumber.prototype.toJSNumber = SmallNumber.prototype.valueOf;

  NativeBigIntWrapper.prototype.valueOf = NativeBigIntWrapper.prototype.toJSNumber = function () {
    // This can also lose precision if the native BigInt is too large for JS Number
    return Number(this.nativeVal);
  };

  // --- Parsing functions ---
  /**
   * Parses a string into a BigNumber. Handles scientific notation and validation.
   * @param {string} strVal - The string value.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The parsed number.
   */
  function parseStringIntoBigNumber(strVal) {
    // Attempt to parse as a standard JS number first if it fits
    if (canFitInJSNumber(+strVal)) {
      const num = +strVal;
      if (num === floorOrCeil(num)) { // Check if it's an integer
        return nativeBigIntAvailable ? new NativeBigIntWrapper(BigInt(num)) : new SmallNumber(num);
      }
      throw new Error(`Invalid integer format: ${strVal}. Contains decimal part.`);
    }

    let isNegative = strVal[0] === "-";
    if (isNegative) strVal = strVal.slice(1); // Remove sign for parsing magnitude

    const exponentialParts = strVal.split(/e/i);
    if (exponentialParts.length > 2) throw new Error(`Invalid integer format: ${strVal}. Multiple 'e' characters.`);

    if (exponentialParts.length === 2) {
      // Handle scientific notation (e.g., "1.23e+5")
      let exponentStr = exponentialParts[1];
      if (exponentStr[0] === "+") exponentStr = exponentStr.slice(1); // Remove leading '+'
      const exponentNum = +exponentStr;

      if (exponentNum !== floorOrCeil(exponentNum) || !canFitInJSNumber(exponentNum)) {
        throw new Error(`Invalid exponent: ${exponentNum} is not a valid integer exponent.`);
      }

      let mantissaText = exponentialParts[0];
      const decimalPointIndex = mantissaText.indexOf(".");
      if (decimalPointIndex >= 0) {
        // Adjust exponent for decimal places in mantissa
        exponentNum -= (mantissaText.length - decimalPointIndex - 1);
        mantissaText = mantissaText.slice(0, decimalPointIndex) + mantissaText.slice(decimalPointIndex + 1);
      }

      if (exponentNum < 0) {
        throw new Error("Cannot include negative exponent part for integers (results in fraction).");
      }
      // Pad with zeros based on exponent
      mantissaText += "0".repeat(exponentNum);
      strVal = mantissaText;
    }

    // Final validation for integer string format (digits only)
    if (!/^([0-9][0-9]*)$/.test(strVal)) {
      throw new Error(`Invalid integer format: ${strVal}. Contains non-digit characters.`);
    }

    // If native BigInt is available, just use it
    if (nativeBigIntAvailable) {
      return new NativeBigIntWrapper(BigInt(isNegative ? `-${strVal}` : strVal));
    }

    // Manual parsing for BigNumber (array of chunks)
    const chunkArray = [];
    let currentMax = strVal.length;
    const chunkSize = CHUNK_LOG_BASE; // Number of digits per chunk
    let currentMin = currentMax - chunkSize;

    while (currentMax > 0) {
      chunkArray.push(+strVal.slice(Math.max(0, currentMin), currentMax));
      currentMin -= chunkSize;
      currentMax -= chunkSize;
    }
    normalizeChunks(chunkArray);
    return new BigNumber(chunkArray, isNegative);
  }

  /**
   * Parses a standard JavaScript number into a BigNumber.
   * @param {number} numVal - The number value.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} The parsed number.
   */
  function parseNumberIntoBigNumber(numVal) {
    if (nativeBigIntAvailable) {
      return new NativeBigIntWrapper(BigInt(numVal));
    }
    if (canFitInJSNumber(numVal)) {
      if (numVal !== floorOrCeil(numVal)) {
        throw new Error(`${numVal} is not an integer.`);
      }
      return new SmallNumber(numVal);
    }
    // If number is too large for safe integer, convert to string and parse
    return parseStringIntoBigNumber(numVal.toString());
  }

  /**
   * Coerces various input types into a BigNumber instance.
   * This is the primary entry point for converting inputs.
   * @param {*} input - The value to convert.
   * @returns {BigNumber|SmallNumber|NativeBigIntWrapper} A BigNumber instance.
   */
  function parseInputToBigNumber(input) {
    if (input instanceof BigNumber || input instanceof SmallNumber || input instanceof NativeBigIntWrapper) {
      return input; // Already an instance, return directly
    }
    if (typeof input === "number") {
      return parseNumberIntoBigNumber(input);
    }
    if (typeof input === "string") {
      return parseStringIntoBigNumber(input);
    }
    if (typeof input === "bigint" && nativeBigIntAvailable) {
      return new NativeBigIntWrapper(input);
    }
    // For other types, try to convert to string or throw.
    if (input && typeof input.valueOf === 'function') {
      const val = input.valueOf();
      if (typeof val === 'number' || typeof val === 'string' || typeof val === 'bigint') {
        return parseInputToBigNumber(val);
      }
    }
    throw new Error(`Unsupported input type for BigNumber: ${typeof input}`);
  }

  // Pre-populate common small integer instances for efficiency
  // This is a common optimization for BigInt libraries.
  for (let i = 0; i < 1000; ++i) {
    NumericalEntityBase[i] = parseInputToBigNumber(i);
    if (i > 0) NumericalEntityBase[-i] = parseInputToBigNumber(-i);
  }
  // Add some specific named constants
  NumericalEntityBase.ONE = NumericalEntityBase[1];
  NumericalEntityBase.ZERO = NumericalEntityBase[0];
  NumericalEntityBase.MINUS_ONE = NumericalEntityBase[-1];
  NumericalEntityBase.TWO = NumericalEntityBase[2]; // Added for convenience

  // Expose utility functions on the factory object
  NumericalEntityBase.getMaximum = getMaximum;
  NumericalEntityBase.getMinimum = getMinimum;
  NumericalEntityBase.greatestCommonDivisor = greatestCommonDivisor;
  NumericalEntityBase.leastCommonMultiple = leastCommonMultiple;
  NumericalEntityBase.isInstance = function (x) {
    return x instanceof BigNumber || x instanceof SmallNumber || x instanceof NativeBigIntWrapper;
  };
  NumericalEntityBase.generateRandomBetween = generateRandomBetween;
  NumericalEntityBase.fromChunkArray = function (digitChunks, base, isNegative) {
    // Ensure digits are BigNumber instances before passing to constructFromBaseChunks
    const parsedDigits = digitChunks.map(parseInputToBigNumber);
    return constructFromBaseChunks(parsedDigits, parseInputToBigNumber(base || 10), isNegative);
  };

  return NumericalEntityBase;
}();

// Export for CommonJS and AMD environments
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
  module.exports = largeIntegerFactory;
}
if (typeof define === "function" && define.amd) {
  define(function () { return largeIntegerFactory; });
}

// --- Main application logic ---
// This function processes input for a specific problem, likely from competitive programming.
// It calculates the minimum product of two numbers from a set of three,
// but only if at least one of the input numbers is odd.
const ProblemSolver = (inputString) => {
  // Parse the input string into an array of numbers.
  // Using regular expression to handle multiple spaces.
  const numericalComponents = inputString.trim().split(/\s+/).map(str => parseInt(str, 10));

  // --- Add a guard clause for invalid number of inputs ---
  if (numericalComponents.length < 3) {
    console.error("Error: Expected at least three numerical inputs.");
    return largeIntegerFactory.ZERO; // Return zero or throw an error based on problem spec
  }

  let anyComponentIsEven = false; // Flag to track if any input number is even

  // Check if any of the input numerical components are even.
  // Original code had a bug here, always checking Sarr[1]. This version fixes it
  // to iterate over all elements as per common problem interpretation.
  // Using Array.prototype.some for a more functional approach.
  anyComponentIsEven = numericalComponents.some(num => (num % 2) === 0);

  let calculatedMinimumProduct = largeIntegerFactory.ZERO; // Initialize with zero

  // The core logic is executed only if NO component is even (i.e., all components are odd).
  // This is a specific condition for the problem.
  if (!anyComponentIsEven) {
    // Convert input numbers to largeIntegerFactory instances for safe multiplication
    const num1 = largeIntegerFactory(numericalComponents[0]);
    const num2 = largeIntegerFactory(numericalComponents[1]);
    const num3 = largeIntegerFactory(numericalComponents[2]);

    // Calculate the three possible products of pairs
    const productAB = num1.multiply(num2);
    const productAC = num1.multiply(num3);
    const productBC = num2.multiply(num3);

    // Find the minimum among these products using the library's comparison functions
    calculatedMinimumProduct = largeIntegerFactory.getMinimum(
      productAB,
      largeIntegerFactory.getMinimum(productAC, productBC)
    );
  } else {
    // If any component IS even, the problem likely implies a different outcome,
    // or zero if the context is to find the minimum product of *any* two when an even number exists.
    // Given the original code initializes result to 0 and only changes it if !haveEven,
    // it implies `0` is the default or base case when an even number IS present.
    // So, if an even number is present, the result remains 0.
    // No change needed for `calculatedMinimumProduct` as it's already `ZERO`.
    // We can add a debug log here for clarity.
    // console.debug("One or more input numbers are even. Returning zero as per problem logic.");
  }

  // Output the final calculated minimum product to the console.
  console.log(calculatedMinimumProduct.toString());

  // Return the result for potential further use or testing.
  return calculatedMinimumProduct;
};

// Execute the solver with input from standard input (e.g., '/dev/stdin' on Linux/macOS)
// This pattern is common in competitive programming environments.
// Added a check for `process` to prevent errors in browser environments.
if (typeof process !== 'undefined' && process.stdin && typeof process.stdin.fd === 'number') {
  ProblemSolver(require('fs').readFileSync(process.stdin.fd, 'utf8'));
} else {
  // Fallback for environments without process.stdin (e.g., browser or node without /dev/stdin access)
  // You might want to define a default test input here for local testing.
  // ProblemSolver("1 3 5"); // Example test input - should output 3
  // ProblemSolver("2 3 5"); // Example test input - should output 0 (due to even number)
}