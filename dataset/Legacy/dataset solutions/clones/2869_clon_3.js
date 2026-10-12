var largeNum = (function(void0) {
  "use strict";

  // Core configuration parameters for the arbitrary-precision numeric library.
  // chunkSize defines the base for internal representation (10^7).
  const chunkSize = 10000000;
  // chunkDigits is the number of decimal digits that each chunk can hold (log10(chunkSize)).
  const chunkDigits = 7;
  // maxSafeJSInt represents the largest integer JavaScript can reliably handle (2^53 - 1).
  const maxSafeJSInt = 9007199254740992;
  // maxSafeJSArr stores the chunk-array equivalent of maxSafeJSInt for comparisons.
  const maxSafeJSArr = nativeToChunkArray(maxSafeJSInt);
  // logMaxSafeJSInt is the natural logarithm of maxSafeJSInt, used to optimize base conversions.
  const logMaxSafeJSInt = Math.log(maxSafeJSInt);

  /**
   * Base constructor for all numeric types. Determines whether to create a SmallNumeric or LargeNumeric.
   * @param {*} initialValue - The input value (number, string, or existing NumericEntity).
   * @param {number} [baseRadix] - Optional radix for string parsing.
   * @returns {NumericEntity} An instance of SmallNumeric or LargeNumeric.
   */
  function NumericEntity(initialValue, baseRadix) {
    if (typeof initialValue === "undefined") {
      return NumericEntity.valZero; // Default to zero if no value is supplied.
    }
    if (typeof baseRadix !== "undefined") {
      // Handle string parsing with a specific radix.
      return +baseRadix === 10 ? parseInputToNumeric(initialValue) : parseStringWithBase(initialValue, baseRadix);
    }
    // Standard parsing for numbers, strings, or existing NumericEntity instances.
    return parseInputToNumeric(initialValue);
  }

  /**
   * Represents numbers that exceed JavaScript's safe integer limits, stored as an array of chunks.
   * @param {number[]} chunkValues - An array where each element is a 'chunk' of the large number.
   * @param {boolean} isNegativeFlag - True if the number is negative, false otherwise.
   */
  function LargeNumeric(chunkValues, isNegativeFlag) {
    this.chunkValues = chunkValues;
    this.isNegativeFlag = isNegativeFlag;
    this.isSmall = false; // Flag to indicate it's a large number.
  }
  LargeNumeric.prototype = Object.create(NumericEntity.prototype);

  /**
   * Represents numbers that can be precisely stored as standard JavaScript integers.
   * @param {number} numericValue - The native JavaScript number.
   */
  function SmallNumeric(numericValue) {
    this.numericValue = numericValue;
    this.isNegativeFlag = numericValue < 0;
    this.isSmall = true; // Flag to indicate it's a small number.
  }
  SmallNumeric.prototype = Object.create(NumericEntity.prototype);

  /**
   * Checks if a given number can be accurately represented by a native JavaScript integer.
   * @param {number} n - The number to verify.
   * @returns {boolean} True if within `maxSafeJSInt` bounds, false otherwise.
   */
  function canRepresentAsNative(n) {
    return -maxSafeJSInt < n && n < maxSafeJSInt;
  }

  /**
   * Converts a native JavaScript number into its base-`chunkSize` array representation.
   * @param {number} num - The number to convert.
   * @returns {number[]} An array of number chunks.
   */
  function nativeToChunkArray(num) {
    if (num < chunkSize) return [num];
    if (num < chunkSize * chunkSize) return [num % chunkSize, Math.floor(num / chunkSize)];
    return [num % chunkSize, Math.floor(num / chunkSize) % chunkSize, Math.floor(num / (chunkSize * chunkSize))];
  }

  /**
   * Attempts to convert a chunk-array back into a native JavaScript number.
   * @param {number[]} chunkArr - The array of chunks.
   * @returns {number|number[]} The native number if convertible, otherwise the original chunk-array.
   */
  function chunkArrayToNative(chunkArr) {
    normalizeChunks(chunkArr); // Clean up leading zeros.
    const currentLength = chunkArr.length;
    if (currentLength < 4 && compareAbsoluteValues(chunkArr, maxSafeJSArr) < 0) {
      switch (currentLength) {
        case 0:
          return 0;
        case 1:
          return chunkArr[0];
        case 2:
          return chunkArr[0] + chunkArr[1] * chunkSize;
        default: // case 3
          return chunkArr[0] + (chunkArr[1] + chunkArr[2] * chunkSize) * chunkSize;
      }
    }
    return chunkArr;
  }

  /**
   * Removes any leading zero chunks from a number chunk array.
   * @param {number[]} chunkVector - The array to normalize.
   */
  function normalizeChunks(chunkVector) {
    let currentIdx = chunkVector.length;
    while (currentIdx > 0 && chunkVector[--currentIdx] === 0);
    chunkVector.length = currentIdx + 1;
  }

  /**
   * Creates a new array initialized with zeros up to a specified size.
   * @param {number} size - The desired length of the array.
   * @returns {number[]} A new array filled with zeros.
   */
  function initZeroArray(size) {
    const freshArray = new Array(size);
    for (let currentIdx = 0; currentIdx < size; currentIdx++) {
      freshArray[currentIdx] = 0;
    }
    return freshArray;
  }

  /**
   * Truncates a floating-point number towards zero.
   * @param {number} num - The number to truncate.
   * @returns {number} The integer part of the number.
   */
  function floorOrCeil(num) {
    return num > 0 ? Math.floor(num) : Math.ceil(num);
  }

  /**
   * Performs element-wise addition of two chunk-arrays. Assumes positive numbers.
   * @param {number[]} arr1 - The first operand.
   * @param {number[]} arr2 - The second operand.
   * @returns {number[]} The chunk-array result.
   */
  function performAddition(arr1, arr2) {
    const len1 = arr1.length,
      len2 = arr2.length;
    const result = new Array(len1); // Result array size is at least as large as the longest input.
    let currentCarry = 0;
    let currentSum;
    let i;

    for (i = 0; i < len2; i++) {
      currentSum = arr1[i] + arr2[i] + currentCarry;
      currentCarry = currentSum >= chunkSize ? 1 : 0;
      result[i] = currentSum - currentCarry * chunkSize;
    }

    while (i < len1) {
      currentSum = arr1[i] + currentCarry;
      currentCarry = currentSum === chunkSize ? 1 : 0;
      result[i++] = currentSum - currentCarry * chunkSize;
    }

    if (currentCarry > 0) {
      result.push(currentCarry);
    }
    return result;
  }

  /**
   * Adds two chunk-arrays, ensuring the longer array is processed first for efficiency.
   * @param {number[]} arrA - First chunk-array.
   * @param {number[]} arrB - Second chunk-array.
   * @returns {number[]} The chunk-array sum.
   */
  function flexibleAddition(arrA, arrB) {
    return arrA.length >= arrB.length ? performAddition(arrA, arrB) : performAddition(arrB, arrA);
  }

  /**
   * Adds a native number (acting as a carry) to a chunk-array.
   * @param {number[]} arr - The chunk-array to modify.
   * @param {number} nativeCarry - The native number to add.
   * @returns {number[]} The modified chunk-array.
   */
  function addNativePart(arr, nativeCarry) {
    const currentLen = arr.length;
    const result = new Array(currentLen);
    let currentSum, i;

    for (i = 0; i < currentLen; i++) {
      currentSum = arr[i] - chunkSize + nativeCarry;
      nativeCarry = Math.floor(currentSum / chunkSize);
      result[i] = currentSum - nativeCarry * chunkSize;
      nativeCarry += 1;
    }

    while (nativeCarry > 0) {
      result[i++] = nativeCarry % chunkSize;
      nativeCarry = Math.floor(nativeCarry / chunkSize);
    }
    return result;
  }

  // --- Addition methods for LargeNumeric and SmallNumeric ---
  LargeNumeric.prototype.add = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return this.subtract(otherNum.flipSign()); // If signs differ, convert to subtraction.
    }

    const currentVal = this.chunkValues;
    const otherVal = otherNum.chunkValues;

    if (otherNum.isSmall) {
      return new LargeNumeric(addNativePart(currentVal, Math.abs(otherNum.numericValue)), this.isNegativeFlag);
    }
    return new LargeNumeric(flexibleAddition(currentVal, otherVal), this.isNegativeFlag);
  };
  Object.defineProperty(LargeNumeric.prototype, 'plus', {
    get: function() {
      return this.add;
    }
  });

  SmallNumeric.prototype.add = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    const thisVal = this.numericValue;

    if ((thisVal < 0) !== otherNum.isNegativeFlag) {
      return this.subtract(otherNum.flipSign()); // If signs differ, convert to subtraction.
    }

    const otherVal = otherNum.numericValue;

    if (otherNum.isSmall) {
      const sumResult = thisVal + otherVal;
      if (canRepresentAsNative(sumResult)) {
        return new SmallNumeric(sumResult);
      }
      return new LargeNumeric(addNativePart(nativeToChunkArray(Math.abs(otherVal)), Math.abs(thisVal)), thisVal < 0);
    }
    return new LargeNumeric(addNativePart(otherNum.chunkValues, Math.abs(thisVal)), thisVal < 0);
  };
  Object.defineProperty(SmallNumeric.prototype, 'plus', {
    get: function() {
      return this.add;
    }
  });

  /**
   * Performs subtraction of two chunk-arrays (arr1 - arr2), assuming arr1 >= arr2.
   * @param {number[]} arr1 - The minuend.
   * @param {number[]} arr2 - The subtrahend.
   * @returns {number[]} The chunk-array difference.
   */
  function performSubtraction(arr1, arr2) {
    const len1 = arr1.length,
      len2 = arr2.length;
    const result = new Array(len1);
    let currentBorrow = 0;
    let difference;
    let i;

    for (i = 0; i < len2; i++) {
      difference = arr1[i] - currentBorrow - arr2[i];
      if (difference < 0) {
        difference += chunkSize;
        currentBorrow = 1;
      } else {
        currentBorrow = 0;
      }
      result[i] = difference;
    }

    for (i = len2; i < len1; i++) {
      difference = arr1[i] - currentBorrow;
      if (difference < 0) {
        difference += chunkSize;
      } else {
        result[i++] = difference;
        break;
      }
      result[i] = difference;
    }

    for (; i < len1; i++) {
      result[i] = arr1[i];
    }

    normalizeChunks(result);
    return result;
  }

  /**
   * Manages subtraction between two chunk-arrays, handling operand order and sign.
   * @param {number[]} arrA - First chunk-array.
   * @param {number[]} arrB - Second chunk-array.
   * @param {boolean} initialSign - The sign before comparing magnitudes.
   * @returns {NumericEntity} The result of the subtraction.
   */
  function flexibleSubtraction(arrA, arrB, initialSign) {
    let resultValue;
    if (compareAbsoluteValues(arrA, arrB) >= 0) {
      resultValue = performSubtraction(arrA, arrB);
    } else {
      resultValue = performSubtraction(arrB, arrA);
      initialSign = !initialSign; // Flip sign if operands were swapped.
    }

    resultValue = chunkArrayToNative(resultValue);
    if (typeof resultValue === "number") {
      return new SmallNumeric(initialSign ? -resultValue : resultValue);
    }
    return new LargeNumeric(resultValue, initialSign);
  }

  /**
   * Subtracts a native number from a chunk-array.
   * @param {number[]} arr - The chunk-array minuend.
   * @param {number} nativeSubValue - The native number subtrahend.
   * @param {boolean} isNegative - The expected sign of the result.
   * @returns {NumericEntity} The result of the subtraction.
   */
  function subtractNativePart(arr, nativeSubValue, isNegative) {
    const currentLen = arr.length;
    const result = new Array(currentLen);
    let carry = -nativeSubValue;
    let difference;
    let i;

    for (i = 0; i < currentLen; i++) {
      difference = arr[i] + carry;
      carry = Math.floor(difference / chunkSize);
      difference %= chunkSize;
      result[i] = difference < 0 ? difference + chunkSize : difference;
    }

    const finalResult = chunkArrayToNative(result);
    if (typeof finalResult === "number") {
      return new SmallNumeric(isNegative ? -finalResult : finalResult);
    }
    return new LargeNumeric(finalResult, isNegative);
  }

  // --- Subtraction methods for LargeNumeric and SmallNumeric ---
  LargeNumeric.prototype.subtract = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return this.add(otherNum.flipSign()); // If signs differ, convert to addition.
    }

    const currentVal = this.chunkValues;
    const otherVal = otherNum.chunkValues;

    if (otherNum.isSmall) {
      return subtractNativePart(currentVal, Math.abs(otherNum.numericValue), this.isNegativeFlag);
    }
    return flexibleSubtraction(currentVal, otherVal, this.isNegativeFlag);
  };
  Object.defineProperty(LargeNumeric.prototype, 'minus', {
    get: function() {
      return this.subtract;
    }
  });

  SmallNumeric.prototype.subtract = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    const thisVal = this.numericValue;

    if ((thisVal < 0) !== otherNum.isNegativeFlag) {
      return this.add(otherNum.flipSign()); // If signs differ, convert to addition.
    }

    const otherVal = otherNum.numericValue;

    if (otherNum.isSmall) {
      return new SmallNumeric(thisVal - otherVal);
    }
    // Small number minus a large number (same sign).
    // Equivalent to -(large - small_abs).
    return flexibleSubtraction(otherNum.chunkValues, nativeToChunkArray(Math.abs(thisVal)), this.isNegativeFlag);
  };
  Object.defineProperty(SmallNumeric.prototype, 'minus', {
    get: function() {
      return this.subtract;
    }
  });

  // --- Sign manipulation methods ---
  LargeNumeric.prototype.flipSign = function() {
    return new LargeNumeric(this.chunkValues, !this.isNegativeFlag);
  };
  SmallNumeric.prototype.flipSign = function() {
    return new SmallNumeric(-this.numericValue);
  };

  LargeNumeric.prototype.absoluteValue = function() {
    return new LargeNumeric(this.chunkValues, false);
  };
  SmallNumeric.prototype.absoluteValue = function() {
    return new SmallNumeric(Math.abs(this.numericValue));
  };

  /**
   * Performs standard long multiplication for two chunk-arrays.
   * @param {number[]} arr1 - First operand.
   * @param {number[]} arr2 - Second operand.
   * @returns {number[]} The product as a chunk-array.
   */
  function longMultiplication(arr1, arr2) {
    const len1 = arr1.length,
      len2 = arr2.length;
    const result = initZeroArray(len1 + len2);
    let currentProduct, partialCarry;
    let i, j;

    for (i = 0; i < len1; ++i) {
      const chunk1 = arr1[i];
      partialCarry = 0;
      for (j = 0; j < len2; ++j) {
        const chunk2 = arr2[j];
        currentProduct = chunk1 * chunk2 + result[i + j] + partialCarry;
        partialCarry = Math.floor(currentProduct / chunkSize);
        result[i + j] = currentProduct - partialCarry * chunkSize;
      }
      result[i + len2] += partialCarry;
    }
    normalizeChunks(result);
    return result;
  }

  /**
   * Multiplies a chunk-array by a single native number.
   * @param {number[]} arr - The chunk-array.
   * @param {number} nativeFactor - The native number multiplier.
   * @returns {number[]} The product as a chunk-array.
   */
  function multiplyByNative(arr, nativeFactor) {
    const currentLen = arr.length;
    const result = new Array(currentLen);
    let currentCarry = 0;
    let currentProduct, i;

    for (i = 0; i < currentLen; i++) {
      currentProduct = arr[i] * nativeFactor + currentCarry;
      currentCarry = Math.floor(currentProduct / chunkSize);
      result[i] = currentProduct - currentCarry * chunkSize;
    }

    while (currentCarry > 0) {
      result[i++] = currentCarry % chunkSize;
      currentCarry = Math.floor(currentCarry / chunkSize);
    }
    return result;
  }

  /**
   * Shifts a chunk-array left by adding zeros.
   * @param {number[]} arr - The array to shift.
   * @param {number} shiftAmount - Number of zero chunks to prepend.
   * @returns {number[]} The shifted array.
   */
  function padWithZeros(arr, shiftAmount) {
    const padded = [];
    while (shiftAmount-- > 0) padded.push(0);
    return padded.concat(arr);
  }

  /**
   * Implements the Karatsuba algorithm for efficient multiplication of large numbers.
   * @param {number[]} xChunks - First operand chunks.
   * @param {number[]} yChunks - Second operand chunks.
   * @returns {number[]} The product chunks.
   */
  function karatsubaMultiply(xChunks, yChunks) {
    const maxLength = Math.max(xChunks.length, yChunks.length);

    if (maxLength <= 30) { // Threshold for switching to long multiplication.
      return longMultiplication(xChunks, yChunks);
    }

    const splitPoint = Math.ceil(maxLength / 2);
    const xHigh = xChunks.slice(splitPoint);
    const xLow = xChunks.slice(0, splitPoint);
    const yHigh = yChunks.slice(splitPoint);
    const yLow = yChunks.slice(0, splitPoint);

    const z0 = karatsubaMultiply(xLow, yLow);
    const z2 = karatsubaMultiply(xHigh, yHigh);
    const z1 = karatsubaMultiply(flexibleAddition(xLow, xHigh), flexibleAddition(yLow, yHigh));

    const term1 = padWithZeros(z2, 2 * splitPoint);
    const term2 = padWithZeros(performSubtraction(performSubtraction(z1, z2), z0), splitPoint);
    const product = flexibleAddition(flexibleAddition(term1, term2), z0);

    normalizeChunks(product);
    return product;
  }

  /**
   * Heuristic to determine if Karatsuba multiplication would be beneficial.
   * @param {number} len1 - Length of the first chunk-array.
   * @param {number} len2 - Length of the second chunk-array.
   * @returns {boolean} True if Karatsuba should be used.
   */
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
  }

  // --- Multiplication methods for LargeNumeric and SmallNumeric ---
  LargeNumeric.prototype.multiply = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    const currentVal = this.chunkValues;
    const otherVal = otherNum.chunkValues;
    const resultSign = this.isNegativeFlag !== otherNum.isNegativeFlag;
    let absoluteOtherVal;

    if (otherNum.isSmall) {
      const nativeOther = otherNum.numericValue;
      if (nativeOther === 0) return NumericEntity.valZero;
      if (nativeOther === 1) return this;
      if (nativeOther === -1) return this.flipSign();

      absoluteOtherVal = Math.abs(nativeOther);
      if (absoluteOtherVal < chunkSize) {
        return new LargeNumeric(multiplyByNative(currentVal, absoluteOtherVal), resultSign);
      }
      absoluteOtherVal = nativeToChunkArray(absoluteOtherVal);
    } else {
      absoluteOtherVal = otherVal;
    }

    if (shouldUseKaratsuba(currentVal.length, absoluteOtherVal.length)) {
      return new LargeNumeric(karatsubaMultiply(currentVal, absoluteOtherVal), resultSign);
    }
    return new LargeNumeric(longMultiplication(currentVal, absoluteOtherVal), resultSign);
  };
  Object.defineProperty(LargeNumeric.prototype, 'times', {
    get: function() {
      return this.multiply;
    }
  });

  /**
   * Multiplies a native number by a chunk-array.
   * @param {number} nativeVal - The native number.
   * @param {number[]} chunkArr - The chunk-array.
   * @param {boolean} resultSign - The sign of the result.
   * @returns {LargeNumeric} The product.
   */
  function multiplyNativeAndChunkArray(nativeVal, chunkArr, resultSign) {
    if (nativeVal < chunkSize) {
      return new LargeNumeric(multiplyByNative(chunkArr, nativeVal), resultSign);
    }
    return new LargeNumeric(longMultiplication(chunkArr, nativeToChunkArray(nativeVal)), resultSign);
  }

  LargeNumeric.prototype._multiplyBySmallValue = function(smallNumInstance) {
    if (smallNumInstance.numericValue === 0) return NumericEntity.valZero;
    if (smallNumInstance.numericValue === 1) return this;
    if (smallNumInstance.numericValue === -1) return this.flipSign();
    return multiplyNativeAndChunkArray(Math.abs(smallNumInstance.numericValue), this.chunkValues, this.isNegativeFlag !== smallNumInstance.isNegativeFlag);
  };
  SmallNumeric.prototype._multiplyBySmallValue = function(smallNumInstance) {
    const productNative = smallNumInstance.numericValue * this.numericValue;
    if (canRepresentAsNative(productNative)) {
      return new SmallNumeric(productNative);
    }
    return multiplyNativeAndChunkArray(Math.abs(smallNumInstance.numericValue), nativeToChunkArray(Math.abs(this.numericValue)), this.isNegativeFlag !== smallNumInstance.isNegativeFlag);
  };

  SmallNumeric.prototype.multiply = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    return otherNum._multiplyBySmallValue(this);
  };
  Object.defineProperty(SmallNumeric.prototype, 'times', {
    get: function() {
      return this.multiply;
    }
  });

  /**
   * Squares a chunk-array (multiplies it by itself).
   * @param {number[]} arr - The chunk-array to square.
   * @returns {number[]} The squared chunk-array.
   */
  function performSquaring(arr) {
    const len = arr.length;
    const result = initZeroArray(len + len);
    let currentProduct, currentCarry;
    let i, j;

    for (i = 0; i < len; i++) {
      const chunk_i = arr[i];
      currentCarry = 0 - chunk_i * chunk_i;
      for (j = i; j < len; j++) {
        const chunk_j = arr[j];
        currentProduct = (i === j ? 1 : 2) * (chunk_i * chunk_j) + result[i + j] + currentCarry;
        currentCarry = Math.floor(currentProduct / chunkSize);
        result[i + j] = currentProduct - currentCarry * chunkSize;
      }
      result[i + len] += currentCarry;
    }
    normalizeChunks(result);
    return result;
  }

  // --- Squaring methods ---
  LargeNumeric.prototype.square = function() {
    return new LargeNumeric(performSquaring(this.chunkValues), false);
  };
  SmallNumeric.prototype.square = function() {
    const squaredNative = this.numericValue * this.numericValue;
    if (canRepresentAsNative(squaredNative)) {
      return new SmallNumeric(squaredNative);
    }
    return new LargeNumeric(performSquaring(nativeToChunkArray(Math.abs(this.numericValue))), false);
  };

  /**
   * Implements Knuth's Algorithm D for efficient long division.
   * @param {number[]} numeratorChunks - The dividend's chunks.
   * @param {number[]} divisorChunks - The divisor's chunks.
   * @returns {[number[], number[]]} An array containing [quotient_chunks, remainder_chunks].
   */
  function longDivisionAlgorithm(numeratorChunks, divisorChunks) {
    const numLen = numeratorChunks.length;
    const divLen = divisorChunks.length;
    const quotientChunks = initZeroArray(divLen);

    const divisorMSD = divisorChunks[divLen - 1];
    const normalizationFactor = Math.ceil(chunkSize / (2 * divisorMSD));

    const normalizedNumerator = multiplyByNative(numeratorChunks, normalizationFactor);
    const normalizedDivisor = multiplyByNative(divisorChunks, normalizationFactor);

    if (normalizedNumerator.length <= numLen) normalizedNumerator.push(0);
    normalizedDivisor.push(0);

    let currentDivisorMSD = normalizedDivisor[divLen - 1];

    let quotientEstimate, shiftIndex, currentCarry, currentBorrow;
    let currentLoopLen, tempQuotient;

    for (shiftIndex = numLen - divLen; shiftIndex >= 0; shiftIndex--) {
      quotientEstimate = chunkSize - 1;
      if (normalizedNumerator[shiftIndex + divLen] !== currentDivisorMSD) {
        quotientEstimate = Math.floor((normalizedNumerator[shiftIndex + divLen] * chunkSize + normalizedNumerator[shiftIndex + divLen - 1]) / currentDivisorMSD);
      }

      currentCarry = 0;
      currentBorrow = 0;
      currentLoopLen = normalizedDivisor.length;

      for (let i = 0; i < currentLoopLen; i++) {
        currentCarry += quotientEstimate * normalizedDivisor[i];
        tempQuotient = Math.floor(currentCarry / chunkSize);
        currentBorrow += normalizedNumerator[shiftIndex + i] - (currentCarry - tempQuotient * chunkSize);
        currentCarry = tempQuotient;
        if (currentBorrow < 0) {
          normalizedNumerator[shiftIndex + i] = currentBorrow + chunkSize;
          currentBorrow = -1;
        } else {
          normalizedNumerator[shiftIndex + i] = currentBorrow;
          currentBorrow = 0;
        }
      }

      while (currentBorrow !== 0) {
        quotientEstimate -= 1;
        currentCarry = 0;
        for (let i = 0; i < currentLoopLen; i++) {
          currentCarry += normalizedNumerator[shiftIndex + i] - chunkSize + normalizedDivisor[i];
          if (currentCarry < 0) {
            normalizedNumerator[shiftIndex + i] = currentCarry + chunkSize;
            currentCarry = 0;
          } else {
            normalizedNumerator[shiftIndex + i] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      quotientChunks[shiftIndex] = quotientEstimate;
    }

    const remainder = divideByNativePart(normalizedNumerator, normalizationFactor)[0];
    normalizeChunks(remainder);

    return [chunkArrayToNative(quotientChunks), chunkArrayToNative(remainder)];
  }

  /**
   * A simpler, iterative division algorithm for comparison or smaller numbers.
   * @param {number[]} numeratorChunks - The dividend's chunks.
   * @param {number[]} divisorChunks - The divisor's chunks.
   * @returns {[number[], number[]]} An array containing [quotient_chunks, remainder_chunks].
   */
  function shortDivisionAlgorithm(numeratorChunks, divisorChunks) {
    let numLen = numeratorChunks.length;
    const quotientResult = [];
    let partialNumerator = [];
    let currentQuotientEstimate, xlen, highX, highY, checkResult;

    while (numLen > 0) {
      partialNumerator.unshift(numeratorChunks[--numLen]);
      normalizeChunks(partialNumerator);

      if (compareAbsoluteValues(partialNumerator, divisorChunks) < 0) {
        quotientResult.push(0);
        continue;
      }

      xlen = partialNumerator.length;
      highX = partialNumerator[xlen - 1] * chunkSize + partialNumerator[xlen - 2];
      highY = divisorChunks[divisorChunks.length - 1] * chunkSize + divisorChunks[divisorChunks.length - 2];
      if (xlen > divisorChunks.length) {
        highX = (highX + 1) * chunkSize;
      }
      currentQuotientEstimate = Math.ceil(highX / highY);

      do {
        checkResult = multiplyByNative(divisorChunks, currentQuotientEstimate);
        if (compareAbsoluteValues(checkResult, partialNumerator) <= 0) break;
        currentQuotientEstimate--;
      } while (currentQuotientEstimate > 0);

      quotientResult.push(currentQuotientEstimate);
      partialNumerator = performSubtraction(partialNumerator, checkResult);
    }

    quotientResult.reverse();
    return [chunkArrayToNative(quotientResult), chunkArrayToNative(partialNumerator)];
  }

  /**
   * Divides a chunk-array by a small native number.
   * @param {number[]} chunkVector - The dividend.
   * @param {number} nativeDivisor - The native number divisor.
   * @returns {[number[], number]} An array containing [quotient_chunks, native_remainder].
   */
  function divideByNativePart(chunkVector, nativeDivisor) {
    const currentLen = chunkVector.length;
    const quotient = initZeroArray(currentLen);
    let remainder = 0;
    let currentDividend, currentQuotient;

    for (let i = currentLen - 1; i >= 0; --i) {
      currentDividend = remainder * chunkSize + chunkVector[i];
      currentQuotient = floorOrCeil(currentDividend / nativeDivisor);
      remainder = currentDividend - currentQuotient * nativeDivisor;
      quotient[i] = currentQuotient | 0;
    }
    return [quotient, remainder | 0];
  }

  /**
   * Handles division and remainder for any NumericEntity combination.
   * @param {NumericEntity} dividendObj - The dividend.
   * @param {*} divisorVal - The divisor.
   * @returns {[NumericEntity, NumericEntity]} An array [quotient, remainder].
   */
  function flexibleDivisionAndRemainder(dividendObj, divisorVal) {
    const divisorNum = parseInputToNumeric(divisorVal);
    const dividendChunks = dividendObj.chunkValues;
    const divisorChunks = divisorNum.chunkValues;

    if (divisorNum.isZeroValue()) {
      throw new Error("Division by zero is not allowed.");
    }

    if (dividendObj.isSmall) {
      if (divisorNum.isSmall) {
        return [new SmallNumeric(floorOrCeil(dividendObj.numericValue / divisorNum.numericValue)), new SmallNumeric(dividendObj.numericValue % divisorNum.numericValue)];
      }
      return [NumericEntity.valZero, dividendObj];
    }

    if (divisorNum.isSmall) {
      const nativeDivisor = divisorNum.numericValue;
      if (nativeDivisor === 1) return [dividendObj, NumericEntity.valZero];
      if (nativeDivisor === -1) return [dividendObj.flipSign(), NumericEntity.valZero];

      const absoluteNativeDivisor = Math.abs(nativeDivisor);
      if (absoluteNativeDivisor < chunkSize) {
        const [quotientChunks, remainderNative] = divideByNativePart(dividendChunks, absoluteNativeDivisor);
        const finalQuotient = chunkArrayToNative(quotientChunks);
        const finalRemainder = dividendObj.isNegativeFlag ? -remainderNative : remainderNative;

        let quotientResult;
        if (typeof finalQuotient === "number") {
          quotientResult = new SmallNumeric(dividendObj.isNegativeFlag !== divisorNum.isNegativeFlag ? -finalQuotient : finalQuotient);
        } else {
          quotientResult = new LargeNumeric(finalQuotient, dividendObj.isNegativeFlag !== divisorNum.isNegativeFlag);
        }
        return [quotientResult, new SmallNumeric(finalRemainder)];
      }
    }

    const comparisonResult = compareAbsoluteValues(dividendChunks, divisorChunks);
    if (comparisonResult === -1) {
      return [NumericEntity.valZero, dividendObj];
    }
    if (comparisonResult === 0) {
      return [new SmallNumeric(dividendObj.isNegativeFlag === divisorNum.isNegativeFlag ? 1 : -1), NumericEntity.valZero];
    }

    const [quotientRaw, remainderRaw] = (dividendChunks.length + divisorChunks.length <= 200) ?
      longDivisionAlgorithm(dividendChunks, divisorChunks) :
      shortDivisionAlgorithm(dividendChunks, divisorChunks);

    const quotientSign = dividendObj.isNegativeFlag !== divisorNum.isNegativeFlag;
    const remainderSign = dividendObj.isNegativeFlag;

    let finalQuotient, finalRemainder;

    if (typeof quotientRaw === "number") {
      finalQuotient = new SmallNumeric(quotientSign ? -quotientRaw : quotientRaw);
    } else {
      finalQuotient = new LargeNumeric(quotientRaw, quotientSign);
    }

    if (typeof remainderRaw === "number") {
      finalRemainder = new SmallNumeric(remainderSign ? -remainderRaw : remainderRaw);
    } else {
      finalRemainder = new LargeNumeric(remainderRaw, remainderSign);
    }

    return [finalQuotient, finalRemainder];
  }

  // --- Division and Remainder methods ---
  LargeNumeric.prototype.getDivRem = function(otherValue) {
    const [quotient, remainder] = flexibleDivisionAndRemainder(this, otherValue);
    return {
      quotient: quotient,
      remainder: remainder
    };
  };
  SmallNumeric.prototype.getDivRem = LargeNumeric.prototype.getDivRem;

  LargeNumeric.prototype.getQuotient = function(otherValue) {
    return flexibleDivisionAndRemainder(this, otherValue)[0];
  };
  Object.defineProperty(SmallNumeric.prototype, 'over', {
    get: function() {
      return this.getQuotient;
    }
  });
  SmallNumeric.prototype.getQuotient = LargeNumeric.prototype.getQuotient;
  Object.defineProperty(LargeNumeric.prototype, 'over', {
    get: function() {
      return this.getQuotient;
    }
  });

  LargeNumeric.prototype.getRemainder = function(otherValue) {
    return flexibleDivisionAndRemainder(this, otherValue)[1];
  };
  Object.defineProperty(SmallNumeric.prototype, 'remainder', {
    get: function() {
      return this.getRemainder;
    }
  });
  SmallNumeric.prototype.getRemainder = LargeNumeric.prototype.getRemainder;
  Object.defineProperty(LargeNumeric.prototype, 'remainder', {
    get: function() {
      return this.getRemainder;
    }
  });

  // --- Exponentiation methods ---
  LargeNumeric.prototype.exponentiate = function(exponentValue) {
    const exponentNum = parseInputToNumeric(exponentValue);
    let resultValue, currentBase, currentResult;

    if (exponentNum.isZeroValue()) return NumericEntity.valOne;
    if (this.isZeroValue()) return NumericEntity.valZero;
    if (this.isOneOrMinusOne()) {
      if (this.isEqualTo(NumericEntity.valOne)) return NumericEntity.valOne;
      return exponentNum.isEvenNumber() ? NumericEntity.valOne : NumericEntity.valMinusOne;
    }
    if (exponentNum.isNegativeNumber()) {
      return NumericEntity.valZero; // Negative exponents for integers result in fractions.
    }
    if (!exponentNum.isSmall) {
      throw new Error(`The exponent ${exponentNum.toStringRepresentation()} is too large.`);
    }

    if (this.isSmall) {
      resultValue = Math.pow(this.numericValue, exponentNum.numericValue);
      if (canRepresentAsNative(resultValue)) {
        return new SmallNumeric(floorOrCeil(resultValue));
      }
    }

    currentBase = this;
    currentResult = NumericEntity.valOne;

    while (true) {
      if (!exponentNum.bitwiseAnd(1).isZeroValue()) {
        currentResult = currentResult.times(currentBase);
      }
      exponentNum = exponentNum.getQuotient(2);
      if (exponentNum.isZeroValue()) break;
      currentBase = currentBase.square();
    }
    return currentResult;
  };
  SmallNumeric.prototype.exponentiate = LargeNumeric.prototype.exponentiate;

  LargeNumeric.prototype.modularExponentiation = function(exponent, modulus) {
    let expNum = parseInputToNumeric(exponent);
    const modNum = parseInputToNumeric(modulus);

    if (modNum.isZeroValue()) {
      throw new Error("Cannot perform modular exponentiation with modulus 0.");
    }

    let result = NumericEntity.valOne;
    let currentBase = this.getRemainder(modNum);

    while (expNum.isPositiveNumber()) {
      if (currentBase.isZeroValue()) return NumericEntity.valZero;
      if (expNum.isOddNumber()) {
        result = result.multiply(currentBase).getRemainder(modNum);
      }
      expNum = expNum.getQuotient(2);
      currentBase = currentBase.square().getRemainder(modNum);
    }
    return result;
  };
  SmallNumeric.prototype.modularExponentiation = LargeNumeric.prototype.modularExponentiation;

  /**
   * Compares the absolute magnitudes of two chunk-arrays.
   * @param {number[]} arr1 - First array.
   * @param {number[]} arr2 - Second array.
   * @returns {number} -1 if arr1 < arr2, 0 if equal, 1 if arr1 > arr2.
   */
  function compareAbsoluteValues(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return arr1.length > arr2.length ? 1 : -1;
    }
    for (let i = arr1.length - 1; i >= 0; i--) {
      if (arr1[i] !== arr2[i]) return arr1[i] > arr2[i] ? 1 : -1;
    }
    return 0;
  }

  // --- Comparison methods ---
  LargeNumeric.prototype.compareAbsoluteValues = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    if (otherNum.isSmall) return 1;
    return compareAbsoluteValues(this.chunkValues, otherNum.chunkValues);
  };
  SmallNumeric.prototype.compareAbsoluteValues = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    const absThis = Math.abs(this.numericValue);
    if (otherNum.isSmall) {
      const absOther = Math.abs(otherNum.numericValue);
      return absThis === absOther ? 0 : (absThis > absOther ? 1 : -1);
    }
    return -1;
  };

  LargeNumeric.prototype.compareValues = function(otherValue) {
    if (otherValue === Infinity) return -1;
    if (otherValue === -Infinity) return 1;

    const otherNum = parseInputToNumeric(otherValue);
    const thisChunks = this.chunkValues;
    const otherChunks = otherNum.chunkValues;

    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return otherNum.isNegativeFlag ? 1 : -1;
    }

    if (otherNum.isSmall) {
      return this.isNegativeFlag ? -1 : 1;
    }
    return compareAbsoluteValues(thisChunks, otherChunks) * (this.isNegativeFlag ? -1 : 1);
  };
  Object.defineProperty(LargeNumeric.prototype, 'compareToValue', {
    get: function() {
      return this.compareValues;
    }
  });

  SmallNumeric.prototype.compareValues = function(otherValue) {
    if (otherValue === Infinity) return -1;
    if (otherValue === -Infinity) return 1;

    const otherNum = parseInputToNumeric(otherValue);
    const thisVal = this.numericValue;
    const otherVal = otherNum.numericValue;

    if (otherNum.isSmall) {
      return thisVal === otherVal ? 0 : (thisVal > otherVal ? 1 : -1);
    }
    if ((thisVal < 0) !== otherNum.isNegativeFlag) {
      return thisVal < 0 ? -1 : 1;
    }
    return thisVal < 0 ? 1 : -1;
  };
  Object.defineProperty(SmallNumeric.prototype, 'compareToValue', {
    get: function() {
      return this.compareValues;
    }
  });

  // --- Equality and Inequality methods ---
  LargeNumeric.prototype.isEqualTo = function(otherValue) {
    return this.compareValues(otherValue) === 0;
  };
  Object.defineProperty(SmallNumeric.prototype, 'isEq', {
    get: function() {
      return this.isEqualTo;
    }
  });
  SmallNumeric.prototype.isEqualTo = LargeNumeric.prototype.isEqualTo;
  Object.defineProperty(LargeNumeric.prototype, 'isEq', {
    get: function() {
      return this.isEqualTo;
    }
  });

  LargeNumeric.prototype.isNotEqualTo = function(otherValue) {
    return this.compareValues(otherValue) !== 0;
  };
  Object.defineProperty(SmallNumeric.prototype, 'isNeq', {
    get: function() {
      return this.isNotEqualTo;
    }
  });
  SmallNumeric.prototype.isNotEqualTo = LargeNumeric.prototype.isNotEqualTo;
  Object.defineProperty(LargeNumeric.prototype, 'isNeq', {
    get: function() {
      return this.isNotEqualTo;
    }
  });

  // --- Relational comparison methods ---
  LargeNumeric.prototype.isGreater = function(otherValue) {
    return this.compareValues(otherValue) > 0;
  };
  Object.defineProperty(SmallNumeric.prototype, 'isGt', {
    get: function() {
      return this.isGreater;
    }
  });
  SmallNumeric.prototype.isGreater = LargeNumeric.prototype.isGreater;
  Object.defineProperty(LargeNumeric.prototype, 'isGt', {
    get: function() {
      return this.isGreater;
    }
  });

  LargeNumeric.prototype.isLesser = function(otherValue) {
    return this.compareValues(otherValue) < 0;
  };
  Object.defineProperty(SmallNumeric.prototype, 'isLt', {
    get: function() {
      return this.isLesser;
    }
  });
  SmallNumeric.prototype.isLesser = LargeNumeric.prototype.isLesser;
  Object.defineProperty(LargeNumeric.prototype, 'isLt', {
    get: function() {
      return this.isLesser;
    }
  });

  LargeNumeric.prototype.isGreaterOrEqual = function(otherValue) {
    return this.compareValues(otherValue) >= 0;
  };
  Object.defineProperty(SmallNumeric.prototype, 'isGeq', {
    get: function() {
      return this.isGreaterOrEqual;
    }
  });
  SmallNumeric.prototype.isGreaterOrEqual = LargeNumeric.prototype.isGreaterOrEqual;
  Object.defineProperty(LargeNumeric.prototype, 'isGeq', {
    get: function() {
      return this.isGreaterOrEqual;
    }
  });

  LargeNumeric.prototype.isLesserOrEqual = function(otherValue) {
    return this.compareValues(otherValue) <= 0;
  };
  Object.defineProperty(SmallNumeric.prototype, 'isLeq', {
    get: function() {
      return this.isLesserOrEqual;
    }
  });
  SmallNumeric.prototype.isLesserOrEqual = LargeNumeric.prototype.isLesserOrEqual;
  Object.defineProperty(LargeNumeric.prototype, 'isLeq', {
    get: function() {
      return this.isLesserOrEqual;
    }
  });

  // --- Property check methods ---
  LargeNumeric.prototype.isEvenNumber = function() {
    return (this.chunkValues[0] & 1) === 0;
  };
  SmallNumeric.prototype.isEvenNumber = function() {
    return (this.numericValue & 1) === 0;
  };

  LargeNumeric.prototype.isOddNumber = function() {
    return (this.chunkValues[0] & 1) === 1;
  };
  SmallNumeric.prototype.isOddNumber = function() {
    return (this.numericValue & 1) === 1;
  };

  LargeNumeric.prototype.isPositiveNumber = function() {
    return !this.isNegativeFlag;
  };
  SmallNumeric.prototype.isPositiveNumber = function() {
    return this.numericValue > 0;
  };

  LargeNumeric.prototype.isNegativeNumber = function() {
    return this.isNegativeFlag;
  };
  SmallNumeric.prototype.isNegativeNumber = function() {
    return this.numericValue < 0;
  };

  LargeNumeric.prototype.isOneOrMinusOne = function() {
    return false;
  };
  SmallNumeric.prototype.isOneOrMinusOne = function() {
    return Math.abs(this.numericValue) === 1;
  };

  LargeNumeric.prototype.isZeroValue = function() {
    return false;
  };
  SmallNumeric.prototype.isZeroValue = function() {
    return this.numericValue === 0;
  };

  LargeNumeric.prototype.isDivisibleByValue = function(otherValue) {
    const otherNum = parseInputToNumeric(otherValue);
    if (otherNum.isZeroValue()) return false;
    if (otherNum.isOneOrMinusOne()) return true;
    if (otherNum.isEqualTo(NumericEntity.valTwo)) return this.isEvenNumber();
    return this.getRemainder(otherNum).isZeroValue();
  };
  SmallNumeric.prototype.isDivisibleByValue = LargeNumeric.prototype.isDivisibleByValue;

  /**
   * Checks for small prime numbers.
   * @param {NumericEntity} numToCheck - The number to check.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if too large for basic check.
   */
  function isSmallPrime(numToCheck) {
    const absNum = numToCheck.absoluteValue();
    if (absNum.isOneOrMinusOne()) return false;
    if (absNum.isEqualTo(NumericEntity.valTwo) || absNum.isEqualTo(NumericEntity.valThree) || absNum.isEqualTo(NumericEntity.valFive)) return true;
    if (absNum.isEvenNumber() || absNum.isDivisibleByValue(NumericEntity.valThree) || absNum.isDivisibleByValue(NumericEntity.valFive)) return false;
    if (absNum.isLesser(parseInputToNumeric(25))) return true;
  }

  // --- Primality tests ---
  LargeNumeric.prototype.checkPrimality = function() {
    const basicCheckResult = isSmallPrime(this);
    if (basicCheckResult !== void0) return basicCheckResult;

    const currentNum = this.absoluteValue();
    let prevNum = currentNum.decrementValue();

    const testPrimes = [2, 3, 5, 7, 11, 13, 17, 19];
    let d = prevNum;
    while (d.isEvenNumber()) {
      d = d.getQuotient(2);
    }

    for (let i = 0; i < testPrimes.length; i++) {
      const base = largeNum(testPrimes[i]);
      let x = base.modularExponentiation(d, currentNum);

      if (x.isEqualTo(NumericEntity.valOne) || x.isEqualTo(prevNum)) {
        continue;
      }

      let innerTestPassed = false;
      let temp_d = d;
      while (temp_d.isLesser(prevNum)) {
        x = x.square().getRemainder(currentNum);
        if (x.isEqualTo(prevNum)) {
          innerTestPassed = true;
          break;
        }
        temp_d = temp_d.multiply(2);
      }
      if (!innerTestPassed) return false;
    }
    return true;
  };
  SmallNumeric.prototype.checkPrimality = LargeNumeric.prototype.checkPrimality;

  LargeNumeric.prototype.checkProbablePrimality = function(iterations) {
    const basicCheckResult = isSmallPrime(this);
    if (basicCheckResult !== void0) return basicCheckResult;

    const currentNum = this.absoluteValue();
    const numIterations = iterations === void0 ? 5 : iterations;

    for (let i = 0; i < numIterations; i++) {
      const randomBase = largeNum.randomBetween(2, currentNum.minus(2));
      if (!randomBase.modularExponentiation(currentNum.decrementValue(), currentNum).isOneOrMinusOne()) {
        return false;
      }
    }
    return true;
  };
  SmallNumeric.prototype.checkProbablePrimality = LargeNumeric.prototype.checkProbablePrimality;

  LargeNumeric.prototype.modularInverse = function(modulus) {
    let oldT = NumericEntity.valZero,
      newT = NumericEntity.valOne;
    let oldR = parseInputToNumeric(modulus),
      newR = this.absoluteValue();

    let quotient, tempT, tempR;

    while (!newR.isZeroValue()) {
      quotient = oldR.getQuotient(newR);

      tempT = oldT;
      oldT = newT;
      newT = tempT.subtract(quotient.multiply(newT));

      tempR = oldR;
      oldR = newR;
      newR = tempR.subtract(quotient.multiply(newR));
    }

    if (!oldR.isEqualTo(NumericEntity.valOne)) {
      throw new Error(`Numbers ${this.toStringRepresentation()} and ${modulus.toStringRepresentation()} are not coprime.`);
    }

    if (oldT.compareValues(0) === -1) {
      oldT = oldT.add(parseInputToNumeric(modulus));
    }

    if (this.isNegativeNumber()) {
      return oldT.flipSign();
    }
    return oldT;
  };
  SmallNumeric.prototype.modularInverse = LargeNumeric.prototype.modularInverse;

  // --- Increment/Decrement methods ---
  LargeNumeric.prototype.incrementValue = function() {
    const currentVal = this.chunkValues;
    if (this.isNegativeFlag) {
      return subtractNativePart(currentVal, 1, this.isNegativeFlag);
    }
    return new LargeNumeric(addNativePart(currentVal, 1), this.isNegativeFlag);
  };
  SmallNumeric.prototype.incrementValue = function() {
    const currentVal = this.numericValue;
    if (currentVal + 1 < maxSafeJSInt) {
      return new SmallNumeric(currentVal + 1);
    }
    return new LargeNumeric(maxSafeJSArr, false);
  };

  LargeNumeric.prototype.decrementValue = function() {
    const currentVal = this.chunkValues;
    if (this.isNegativeFlag) {
      return new LargeNumeric(addNativePart(currentVal, 1), true);
    }
    return subtractNativePart(currentVal, 1, this.isNegativeFlag);
  };
  SmallNumeric.prototype.decrementValue = function() {
    const currentVal = this.numericValue;
    if (currentVal - 1 > -maxSafeJSInt) {
      return new SmallNumeric(currentVal - 1);
    }
    return new LargeNumeric(maxSafeJSArr, true);
  };

  const powerOfTwoChunks = [1];
  while (2 * powerOfTwoChunks[powerOfTwoChunks.length - 1] <= chunkSize) {
    powerOfTwoChunks.push(2 * powerOfTwoChunks[powerOfTwoChunks.length - 1]);
  }
  const powerChunkCount = powerOfTwoChunks.length;
  const maxPowerChunk = powerOfTwoChunks[powerChunkCount - 1];

  /**
   * Checks if a shift amount is within reasonable bounds for native operations.
   * @param {*} shiftAmount - The value to check.
   * @returns {boolean} True if small, false otherwise.
   */
  function isShiftAmountSmall(shiftAmount) {
    return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= chunkSize || (shiftAmount instanceof LargeNumeric && shiftAmount.chunkValues.length <= 1);
  }

  // --- Bitwise shift methods ---
  LargeNumeric.prototype.bitwiseShiftLeft = function(shiftAmount) {
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
    }
    let actualShift = +shiftAmount;
    if (actualShift < 0) return this.bitwiseShiftRight(-actualShift);

    let currentResult = this;
    if (currentResult.isZeroValue()) return currentResult;

    while (actualShift >= powerChunkCount) {
      currentResult = currentResult.multiply(maxPowerChunk);
      actualShift -= powerChunkCount - 1;
    }
    return currentResult.multiply(powerOfTwoChunks[actualShift]);
  };
  SmallNumeric.prototype.bitwiseShiftLeft = LargeNumeric.prototype.bitwiseShiftLeft;

  LargeNumeric.prototype.bitwiseShiftRight = function(shiftAmount) {
    let divRemainder;
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
    }
    let actualShift = +shiftAmount;
    if (actualShift < 0) return this.bitwiseShiftLeft(-actualShift);

    let currentResult = this;
    if (currentResult.isZeroValue() || (currentResult.isNegativeNumber() && currentResult.isOneOrMinusOne())) {
      return currentResult;
    }

    while (actualShift >= powerChunkCount) {
      divRemainder = flexibleDivisionAndRemainder(currentResult, maxPowerChunk);
      currentResult = divRemainder[1].isNegativeNumber() ? divRemainder[0].decrementValue() : divRemainder[0];
      actualShift -= powerChunkCount - 1;
    }
    divRemainder = flexibleDivisionAndRemainder(currentResult, powerOfTwoChunks[actualShift]);
    return divRemainder[1].isNegativeNumber() ? divRemainder[0].decrementValue() : divRemainder[0];
  };
  SmallNumeric.prototype.bitwiseShiftRight = LargeNumeric.prototype.bitwiseShiftRight;

  /**
   * Generic function for performing bitwise operations on NumericEntities.
   * @param {NumericEntity} numX - First operand.
   * @param {NumericEntity} numY - Second operand.
   * @param {function(number, number): number} bitwiseFunction - The bitwise logic (e.g., `&`, `|`, `^`).
   * @returns {NumericEntity} The result.
   */
  function performBitwiseOp(numX, numY, bitwiseFunction) {
    numY = parseInputToNumeric(numY);
    const xNegative = numX.isNegativeNumber();
    const yNegative = numY.isNegativeNumber();

    let xRemaining = xNegative ? numX.bitwiseNot() : numX;
    let yRemaining = yNegative ? numY.bitwiseNot() : numY;

    let xChunkVal = 0,
      yChunkVal = 0;
    let xDivMod = null,
      yDivMod = null;
    const resultChunks = [];

    while (!xRemaining.isZeroValue() || !yRemaining.isZeroValue()) {
      xDivMod = flexibleDivisionAndRemainder(xRemaining, maxPowerChunk);
      xChunkVal = xDivMod[1].toNativeNumber();
      if (xNegative) {
        xChunkVal = maxPowerChunk - 1 - xChunkVal;
      }

      yDivMod = flexibleDivisionAndRemainder(yRemaining, maxPowerChunk);
      yChunkVal = yDivMod[1].toNativeNumber();
      if (yNegative) {
        yChunkVal = maxPowerChunk - 1 - yChunkVal;
      }

      xRemaining = xDivMod[0];
      yRemaining = yDivMod[0];
      resultChunks.push(bitwiseFunction(xChunkVal, yChunkVal));
    }

    let finalSum = bitwiseFunction(xNegative ? 1 : 0, yNegative ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);

    for (let i = resultChunks.length - 1; i >= 0; i -= 1) {
      finalSum = finalSum.multiply(maxPowerChunk).add(largeNum(resultChunks[i]));
    }
    return finalSum;
  }

  // --- Bitwise operation methods ---
  LargeNumeric.prototype.bitwiseNot = function() {
    return this.flipSign().decrementValue();
  };
  SmallNumeric.prototype.bitwiseNot = LargeNumeric.prototype.bitwiseNot;

  LargeNumeric.prototype.bitwiseAnd = function(otherValue) {
    return performBitwiseOp(this, otherValue, (a, b) => a & b);
  };
  SmallNumeric.prototype.bitwiseAnd = LargeNumeric.prototype.bitwiseAnd;

  LargeNumeric.prototype.bitwiseOr = function(otherValue) {
    return performBitwiseOp(this, otherValue, (a, b) => a | b);
  };
  SmallNumeric.prototype.bitwiseOr = LargeNumeric.prototype.bitwiseOr;

  LargeNumeric.prototype.bitwiseXor = function(otherValue) {
    return performBitwiseOp(this, otherValue, (a, b) => a ^ b);
  };
  SmallNumeric.prototype.bitwiseXor = LargeNumeric.prototype.bitwiseXor;

  const lowOrderBitMaskInt = 1 << 30;
  const lowOrderBitMaskLargeInt = (chunkSize & -chunkSize) * (chunkSize & -chunkSize) | lowOrderBitMaskInt;

  /**
   * Estimates the lowest set bit in a number.
   * @param {NumericEntity} num - The number.
   * @returns {number} The estimated lowest bit.
   */
  function estimateLowestBit(num) {
    const value = num.chunkValues;
    const x = typeof value === "number" ? value | lowOrderBitMaskInt : value[0] + value[1] * chunkSize | lowOrderBitMaskLargeInt;
    return x & -x;
  }

  /**
   * Calculates the integer logarithm of a value to a given base.
   * @param {NumericEntity} value - The number.
   * @param {NumericEntity} base - The logarithm base.
   * @returns {{p: NumericEntity, e: number}} Object containing power and exponent.
   */
  function calcIntegerLog(value, base) {
    if (base.compareToValue(value) <= 0) {
      const {
        p: tempP,
        e: tempE
      } = calcIntegerLog(value, base.square());
      const product = tempP.multiply(base);
      return product.compareToValue(value) <= 0 ? {
        p: product,
        e: tempE * 2 + 1
      } : {
        p: tempP,
        e: tempE * 2
      };
    }
    return {
      p: largeNum(1),
      e: 0
    };
  }

  LargeNumeric.prototype.getBitLength = function() {
    let currentNum = this;
    if (currentNum.isNegativeNumber()) {
      currentNum = currentNum.flipSign().decrementValue();
    }
    if (currentNum.isZeroValue()) {
      return largeNum(0);
    }
    return largeNum(calcIntegerLog(currentNum, largeNum(2)).e).add(largeNum(1));
  };
  SmallNumeric.prototype.getBitLength = LargeNumeric.prototype.getBitLength;

  // --- Utility functions for NumericEntity ---
  function findMaximum(numA, numB) {
    numA = parseInputToNumeric(numA);
    numB = parseInputToNumeric(numB);
    return numA.isGreater(numB) ? numA : numB;
  }

  function findMinimum(numA, numB) {
    numA = parseInputToNumeric(numA);
    numB = parseInputToNumeric(numB);
    return numA.isLesser(numB) ? numA : numB;
  }

  function greatestCommonDivisor(numA, numB) {
    let a = parseInputToNumeric(numA).absoluteValue();
    let b = parseInputToNumeric(numB).absoluteValue();

    if (a.isEqualTo(b)) return a;
    if (a.isZeroValue()) return b;
    if (b.isZeroValue()) return a;

    let commonFactor = NumericEntity.valOne;
    let temp;

    while (a.isEvenNumber() && b.isEvenNumber()) {
      const lowestBitVal = Math.min(estimateLowestBit(a), estimateLowestBit(b));
      a = a.getQuotient(lowestBitVal);
      b = b.getQuotient(lowestBitVal);
      commonFactor = commonFactor.multiply(lowestBitVal);
    }

    while (a.isEvenNumber()) {
      a = a.getQuotient(estimateLowestBit(a));
    }

    do {
      while (b.isEvenNumber()) {
        b = b.getQuotient(estimateLowestBit(b));
      }
      if (a.isGreater(b)) {
        temp = b;
        b = a;
        a = temp;
      }
      b = b.subtract(a);
    } while (!b.isZeroValue());

    return commonFactor.isOneOrMinusOne() ? a : a.multiply(commonFactor);
  }

  function leastCommonMultiple(numA, numB) {
    const a = parseInputToNumeric(numA).absoluteValue();
    const b = parseInputToNumeric(numB).absoluteValue();
    const product = a.multiply(b);
    const commonDivisor = greatestCommonDivisor(a, b);
    return product.getQuotient(commonDivisor);
  }

  function generateRandomBetween(lowerBound, upperBound) {
    const low = findMinimum(parseInputToNumeric(lowerBound), parseInputToNumeric(upperBound));
    const high = findMaximum(parseInputToNumeric(lowerBound), parseInputToNumeric(upperBound));
    const range = high.subtract(low).add(1);

    if (range.isSmall) {
      return low.add(Math.floor(Math.random() * range.numericValue));
    }

    const rangeLen = range.chunkValues.length - 1;
    const resultChunks = [];
    let isRestricted = true;

    for (let i = rangeLen; i >= 0; i--) {
      const topLimit = isRestricted ? range.chunkValues[i] : chunkSize;
      const digit = floorOrCeil(Math.random() * topLimit);
      resultChunks.unshift(digit);
      if (digit < topLimit) isRestricted = false;
    }

    const randomOffset = chunkArrayToNative(resultChunks);
    return low.add(typeof randomOffset === "number" ? new SmallNumeric(randomOffset) : new LargeNumeric(randomOffset, false));
  }

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} numStr - The string to parse.
   * @param {number|NumericEntity} base - The base (radix) for parsing.
   * @returns {NumericEntity} The parsed number.
   */
  const parseStringWithBase = function(numStr, base) {
    let stringLength = numStr.length;
    let i;
    const absoluteBase = Math.abs(base);

    for (i = 0; i < stringLength; i++) {
      const char = numStr[i].toLowerCase();
      if (char === "-") continue;
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absoluteBase) {
          if (char === "1" && absoluteBase === 1) continue;
          throw new Error(`Character '${char}' is not a valid digit in base ${base}.`);
        } else if (char.charCodeAt(0) - 87 >= absoluteBase) {
          throw new Error(`Character '${char}' is not a valid digit in base ${base}.`);
        }
      }
    }

    if (2 <= base && base <= 36) {
      if (base > 1 && stringLength <= logMaxSafeJSInt / Math.log(base)) {
        const result = parseInt(numStr, base);
        if (isNaN(result)) {
          throw new Error(`Invalid number string: '${numStr}' for base ${base}.`);
        }
        return new SmallNumeric(parseInt(numStr, base));
      }
    }

    const parsedBase = parseInputToNumeric(base);
    const digitNumericEntities = [];
    const isNegative = numStr[0] === "-";

    for (i = isNegative ? 1 : 0; i < numStr.length; i++) {
      const char = numStr[i].toLowerCase();
      const charCode = char.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) {
        digitNumericEntities.push(parseInputToNumeric(char));
      } else if (97 <= charCode && charCode <= 122) {
        digitNumericEntities.push(parseInputToNumeric(charCode - 87));
      } else if (char === "<") {
        const startIndex = i;
        do {
          i++;
        } while (numStr[i] !== ">" && i < numStr.length);
        if (numStr[i] !== ">") {
          throw new Error(`Malformed digit sequence: expected '>' but found end of string.`);
        }
        digitNumericEntities.push(parseInputToNumeric(numStr.slice(startIndex + 1, i)));
      } else {
        throw new Error(`Character '${char}' is not a valid character in string '${numStr}'.`);
      }
    }
    return constructFromDigits(digitNumericEntities, parsedBase, isNegative);
  };

  /**
   * Constructs a NumericEntity from an array of NumericEntity digits and a base.
   * @param {NumericEntity[]} digitEntities - Array of digit values.
   * @param {NumericEntity} baseNum - The base.
   * @param {boolean} isNegativeSign - Whether the final number is negative.
   * @returns {NumericEntity} The constructed number.
   */
  function constructFromDigits(digitEntities, baseNum, isNegativeSign) {
    let accumulatedValue = NumericEntity.valZero;
    let currentPower = NumericEntity.valOne;

    for (let i = digitEntities.length - 1; i >= 0; i--) {
      accumulatedValue = accumulatedValue.add(digitEntities[i].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNegativeSign ? accumulatedValue.flipSign() : accumulatedValue;
  }

  /**
   * Converts a single digit to its string representation.
   * @param {number} digitValue - The digit to convert.
   * @returns {string} The string representation.
   */
  function digitToString(digitValue) {
    if (digitValue <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitValue);
    }
    return `<${digitValue}>`;
  }

  /**
   * Converts a NumericEntity to an array of digits in a specified base.
   * @param {NumericEntity} num - The number to convert.
   * @param {NumericEntity} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   */
  function convertToBaseArray(num, base) {
    base = largeNum(base);
    if (base.isZeroValue()) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert non-zero numbers to base 0.");
    }
    if (base.isEqualTo(NumericEntity.valMinusOne)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      let result = [];
      let temp = num.absoluteValue();
      while (temp.isGreater(0)) {
        result.push(1);
        result.push(0);
        temp = temp.subtract(1);
      }
      if (!num.isZeroValue()) result.pop();
      return {
        value: result,
        isNegative: num.isNegativeNumber()
      };
    }

    let isResultNegative = false;
    if (num.isNegativeNumber() && base.isPositiveNumber()) {
      isResultNegative = true;
      num = num.absoluteValue();
    }

    if (base.isEqualTo(NumericEntity.valOne)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      const onesArray = [];
      let counter = num;
      while (counter.isPositiveNumber()) {
        onesArray.push(1);
        counter = counter.decrementValue();
      }
      return {
        value: onesArray,
        isNegative: isResultNegative
      };
    }

    const outputDigits = [];
    let currentLeftover = num;
    let divRemainder;

    while (currentLeftover.isNegativeNumber() || currentLeftover.compareAbsoluteValues(base) >= 0) {
      divRemainder = currentLeftover.getDivRem(base);
      currentLeftover = divRemainder.quotient;
      let digit = divRemainder.remainder;

      if (digit.isNegativeNumber()) {
        digit = base.minus(digit).absoluteValue();
        currentLeftover = currentLeftover.incrementValue();
      }
      outputDigits.push(digit.toNativeNumber());
    }
    outputDigits.push(currentLeftover.toNativeNumber());

    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative
    };
  }

  /**
   * Converts a NumericEntity to its string representation in a specified base.
   * @param {NumericEntity} num - The number to convert.
   * @param {number|NumericEntity} base - The target base.
   * @returns {string} The string representation.
   */
  function convertToBaseString(num, base) {
    const {
      value: digitArr,
      isNegative: isNeg
    } = convertToBaseArray(num, base);
    return (isNeg ? "-" : "") + digitArr.map(digitToString).join("");
  }

  // --- Output and conversion methods ---
  LargeNumeric.prototype.toDigitArray = function(radix) {
    return convertToBaseArray(this, radix);
  };
  SmallNumeric.prototype.toDigitArray = function(radix) {
    return convertToBaseArray(this, radix);
  };

  LargeNumeric.prototype.toStringRepresentation = function(radix) {
    if (radix === void0) radix = 10;
    if (radix !== 10) return convertToBaseString(this, radix);

    const chunkArr = this.chunkValues;
    let currentLen = chunkArr.length;
    let stringResult = String(chunkArr[--currentLen]);
    const zeroPadding = "0000000";
    let currentDigit;

    while (--currentLen >= 0) {
      currentDigit = String(chunkArr[currentLen]);
      stringResult += zeroPadding.slice(currentDigit.length) + currentDigit;
    }
    const signPrefix = this.isNegativeFlag ? "-" : "";
    return signPrefix + stringResult;
  };
  SmallNumeric.prototype.toStringRepresentation = function(radix) {
    if (radix === void0) radix = 10;
    if (radix !== 10) return convertToBaseString(this, radix);
    return String(this.numericValue);
  };

  LargeNumeric.prototype.toJSONString = SmallNumeric.prototype.toJSONString = function() {
    return this.toStringRepresentation();
  };

  LargeNumeric.prototype.toPrimitiveValue = function() {
    return parseInt(this.toStringRepresentation(), 10);
  };
  LargeNumeric.prototype.toNativeNumber = LargeNumeric.prototype.toPrimitiveValue;

  SmallNumeric.prototype.toPrimitiveValue = function() {
    return this.numericValue;
  };
  SmallNumeric.prototype.toNativeNumber = SmallNumeric.prototype.toPrimitiveValue;

  /**
   * Parses a string into a NumericEntity, handling scientific notation.
   * @param {string} inputString - The string to parse.
   * @returns {NumericEntity} The parsed number.
   */
  function parseNumericString(inputString) {
    if (canRepresentAsNative(+inputString)) {
      const parsedNum = +inputString;
      if (parsedNum === floorOrCeil(parsedNum)) {
        return new SmallNumeric(parsedNum);
      }
      throw new Error(`Invalid integer: ${inputString} is not a whole number.`);
    }

    let isNegative = inputString[0] === "-";
    if (isNegative) inputString = inputString.slice(1);

    const scientificNotationParts = inputString.split(/e/i);
    if (scientificNotationParts.length > 2) {
      throw new Error(`Invalid integer: Too many 'e' characters in ${inputString}.`);
    }

    if (scientificNotationParts.length === 2) {
      let exponentPart = scientificNotationParts[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      const exponentValue = +exponentPart;

      if (exponentValue !== floorOrCeil(exponentValue) || !canRepresentAsNative(exponentValue)) {
        throw new Error(`Invalid integer: Exponent '${exponentPart}' is not a valid integer.`);
      }

      let mantissaPart = scientificNotationParts[0];
      const decimalPointIndex = mantissaPart.indexOf(".");
      if (decimalPointIndex >= 0) {
        exponentValue -= (mantissaPart.length - decimalPointIndex - 1);
        mantissaPart = mantissaPart.slice(0, decimalPointIndex) + mantissaPart.slice(decimalPointIndex + 1);
      }

      if (exponentValue < 0) {
        throw new Error("Cannot include negative exponent part for integers.");
      }
      inputString = mantissaPart + "0".repeat(exponentValue);
    }

    const isValidIntegerFormat = /^([0-9][0-9]*)$/.test(inputString);
    if (!isValidIntegerFormat) {
      throw new Error(`Invalid integer format: ${inputString}.`);
    }

    const chunkArray = [];
    let currentMaxIndex = inputString.length;
    const currentChunkDigits = chunkDigits;
    let currentMinIndex = currentMaxIndex - currentChunkDigits;

    while (currentMaxIndex > 0) {
      chunkArray.push(+inputString.slice(Math.max(0, currentMinIndex), currentMaxIndex));
      currentMinIndex -= currentChunkDigits;
      currentMaxIndex -= currentChunkDigits;
    }
    normalizeChunks(chunkArray);
    return new LargeNumeric(chunkArray, isNegative);
  }

  /**
   * Parses a native JavaScript number into a NumericEntity.
   * @param {number} inputNum - The number to parse.
   * @returns {NumericEntity} The parsed number.
   */
  function parseNativeNumber(inputNum) {
    if (canRepresentAsNative(inputNum)) {
      if (inputNum !== floorOrCeil(inputNum)) {
        throw new Error(`${inputNum} is not an integer.`);
      }
      return new SmallNumeric(inputNum);
    }
    return parseNumericString(inputNum.toString());
  }

  /**
   * Universal parser for various input types into NumericEntity.
   * @param {*} inputValue - The value to parse.
   * @returns {NumericEntity} The parsed number.
   */
  function parseInputToNumeric(inputValue) {
    if (typeof inputValue === "number") {
      return parseNativeNumber(inputValue);
    }
    if (typeof inputValue === "string") {
      return parseNumericString(inputValue);
    }
    return inputValue;
  }

  const smallNumericCache = [];
  for (let i = 0; i < 1000; i++) {
    smallNumericCache[i] = new SmallNumeric(i);
    if (i > 0) smallNumericCache[-i] = new SmallNumeric(-i);
  }

  NumericEntity.valOne = smallNumericCache[1];
  NumericEntity.valZero = smallNumericCache[0];
  NumericEntity.valMinusOne = smallNumericCache[-1];
  NumericEntity.valTwo = smallNumericCache[2];
  NumericEntity.valThree = smallNumericCache[3];
  NumericEntity.valFive = smallNumericCache[5];

  NumericEntity.findMaximum = findMaximum;
  NumericEntity.findMinimum = findMinimum;
  NumericEntity.greatestCommonDivisor = greatestCommonDivisor;
  NumericEntity.leastCommonMultiple = leastCommonMultiple;
  NumericEntity.isNumericInstance = function(obj) {
    return obj instanceof LargeNumeric || obj instanceof SmallNumeric;
  };
  NumericEntity.randomBetween = generateRandomBetween;
  NumericEntity.createFromArray = function(digitEntities, base, isNegative) {
    const parsedDigits = digitEntities.map(parseInputToNumeric);
    return constructFromDigits(parsedDigits, parseInputToNumeric(base || 10), isNegative);
  };

  return NumericEntity;
})();


// Utility for reading input data from a stream.
const InputReader = (function() {
  /**
   * Factory function to create a DataReader instance.
   * @param {string} rawInputString - The raw string content to be parsed.
   * @returns {DataReader} A new DataReader instance.
   */
  function createReader(rawInputString) {
    return new DataReader(rawInputString);
  }

  /**
   * DataReader class responsible for parsing input lines.
   * @param {string} rawInputString - The full input string.
   */
  function DataReader(rawInputString) {
    if (typeof rawInputString !== 'string') {
      throw new Error("Input must be a string.");
    }
    this.sourceLines = rawInputString.trim().split("\n");
    this.currentLineIndex = 0;
  }

  /**
   * Reads a single value from the current line, advancing the internal pointer.
   * @param {boolean} [asString=false] - If true, returns value as string; otherwise, as number.
   * @returns {string|number} The parsed value.
   */
  DataReader.prototype.readAtomicValue = function(asString = false) {
    let currentLineData = this.sourceLines[this.currentLineIndex];
    if (typeof currentLineData !== "string") {
      throw new Error(`Attempted to read beyond input or malformed line at index ${this.currentLineIndex}.`);
    }

    if (!Array.isArray(currentLineData) || typeof currentLineData[0] === 'string') {
      this.sourceLines[this.currentLineIndex] = currentLineData.split(" ").reverse();
    }

    const value = this.sourceLines[this.currentLineIndex].pop();
    if (this.sourceLines[this.currentLineIndex].length === 0) {
      this.currentLineIndex++;
    }
    return asString ? value : +value;
  };

  /**
   * Reads all values from the current line.
   * @param {boolean} [asStrings=false] - If true, returns values as strings.
   * @returns {string[]|number[]} An array of values.
   */
  DataReader.prototype.readLineValues = function(asStrings = false) {
    const lineContent = this.sourceLines[this.currentLineIndex++];
    if (typeof lineContent !== "string") {
      throw new Error(`Attempted to read beyond input or malformed line at index ${this.currentLineIndex - 1}.`);
    }
    const values = lineContent.split(" ");
    return asStrings ? values : values.map(val => +val);
  };

  /**
   * Reads a specified number of lines as a matrix.
   * @param {number} numLines - Number of rows to read.
   * @param {boolean} [asStrings=false] - If true, returns string matrix.
   * @returns {string[][]|number[][]} A 2D array (matrix).
   */
  DataReader.prototype.readMatrixValues = function(numLines, asStrings = false) {
    if (numLines <= 0) return [];
    const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
    this.currentLineIndex += numLines;

    return matrixRows.map(line => {
      const rowValues = line.split(" ");
      return asStrings ? rowValues : rowValues.map(val => +val);
    });
  };

  /**
   * Reads a specified number of lines as raw strings or single numbers.
   * @param {number} numLines - Number of lines to read.
   * @param {boolean} [asStrings=false] - If true, returns raw strings.
   * @returns {string[]|number[]} An array of lines.
   */
  DataReader.prototype.readRawLines = function(numLines, asStrings = false) {
    if (numLines <= 0) return [];
    const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
    this.currentLineIndex += numLines;
    return asStrings ? rawLines : rawLines.map(line => +line);
  };

  return createReader;
})();


const inputProcessor = InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This avoids the use of `eval` from the original `xArray` function.
 * @param {*} initialValue - The value to fill array elements with. Can be a primitive or the `largeNum` factory.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function multiDimArray(initialValue, ...dimensions) {
  if (dimensions.length === 0) return initialValue;

  const createDimension = (depth, currentDims) => {
    if (depth === currentDims.length - 1) {
      // Base case: last dimension, fill with initial value or result of factory.
      return Array(currentDims[depth]).fill(0).map(() => {
        if (initialValue === largeNum) {
          return initialValue(0); // If factory, create new instance.
        }
        return initialValue; // Otherwise, use the value directly.
      });
    } else {
      // Recursive step: create nested arrays.
      return Array(currentDims[depth]).fill(0).map(() => createDimension(depth + 1, currentDims));
    }
  };

  return createDimension(0, dimensions);
}


let moduloVal; // Global variable for the modulus.
const numericFactory = largeNum; // Alias for the large number factory.

/**
 * Calculates the modular product of multiple factors: (factor1 * factor2 * ... ) % moduloVal.
 * Uses the `largeNum` library to prevent intermediate overflows.
 * @param {...(number|largeNum)} factors - The numbers to multiply.
 * @returns {number} The final modular product as a native JS number.
 */
function applyModularProduct(...factors) {
  let product = numericFactory(factors[0]);
  for (let i = 1; i < factors.length; i++) {
    product = product.multiply(numericFactory(factors[i])).getRemainder(moduloVal);
  }
  return product.toNativeNumber();
}

/**
 * Computes (base ^ exponent) % moduloVal using modular exponentiation.
 * @param {number|largeNum} base - The base.
 * @param {number|largeNum} exponent - The exponent.
 * @returns {number} The modular power as a native JS number.
 */
function calculateModularPower(base, exponent) {
  let currentResult = numericFactory(1);
  let currentBase = numericFactory(base);
  let currentExponent = numericFactory(exponent);

  while (!currentExponent.isZeroValue()) {
    if (!currentExponent.bitwiseAnd(1).isZeroValue()) {
      currentResult = currentResult.multiply(currentBase).getRemainder(moduloVal);
    }
    currentBase = currentBase.multiply(currentBase).getRemainder(moduloVal);
    currentExponent = currentExponent.bitwiseShiftRight(1);
  }
  return currentResult.toNativeNumber();
}

/**
 * Performs modular matrix multiplication (matrixA * matrixB) % moduloVal.
 * Handles cases where inputs might be row vectors.
 * @param {Array<Array<number>>|Array<number>} matrixA - The first matrix or row vector.
 * @param {Array<Array<number>>|Array<number>} matrixB - The second matrix or row vector.
 * @returns {Array<Array<number>>} The resulting matrix.
 */
function matrixModularMultiplication(matrixA, matrixB) {
  const matA = Array.isArray(matrixA[0]) ? matrixA : [matrixA];
  const matB = Array.isArray(matrixB[0]) ? matrixB : [matrixB];

  const rowsA = matA.length;
  const colsA = matA[0].length;
  const rowsB = matB.length;
  const colsB = matB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }

  const resultMatrix = multiDimArray(0, rowsA, colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum = (sum + applyModularProduct(matA[i][k], matB[k][j])) % moduloVal;
      }
      resultMatrix[i][j] = sum;
    }
  }
  return resultMatrix;
}

/**
 * Calculates (matrix ^ power) % moduloVal using matrix binary exponentiation.
 * @param {Array<Array<number>>} matrix - The base matrix.
 * @param {largeNum} power - The exponent (as a largeNum).
 * @returns {Array<Array<number>>} The resulting matrix.
 */
function matrixModularPower(matrix, power) {
  const matrixSize = matrix.length;
  let resultMatrix = multiDimArray(0, matrixSize, matrixSize);
  for (let i = 0; i < matrixSize; i++) resultMatrix[i][i] = 1; // Initialize as identity matrix.

  let currentBaseMatrix = matrix;
  let currentPower = power;

  while (!currentPower.isZeroValue()) {
    if (!currentPower.bitwiseAnd(1).isZeroValue()) {
      resultMatrix = matrixModularMultiplication(resultMatrix, currentBaseMatrix);
    }
    currentBaseMatrix = matrixModularMultiplication(currentBaseMatrix, currentBaseMatrix);
    currentPower = currentPower.getQuotient(2);
  }
  return resultMatrix;
}


// Main function to perform the calculation.
function executeCalculation() {
  // Read input parameters as strings to preserve precision during initial parsing.
  const lengthParamStr = inputProcessor.readAtomicValue(true);
  const startValParamStr = inputProcessor.readAtomicValue(true);
  const incrementParamStr = inputProcessor.readAtomicValue(true);

  // Convert string parameters to large numeric objects.
  const bigLength = numericFactory(lengthParamStr);
  const bigStart = numericFactory(startValParamStr);
  const bigIncrement = numericFactory(incrementParamStr);

  // Read the modulus value.
  moduloVal = inputProcessor.readAtomicValue();

  // The original `xArray(bi, 19)` for 'd' was unused beyond reassignments. Removed for brevity.

  // Initialize the result accumulator matrix. It's a 1x3 matrix.
  // The initial third element is `(bigIncrement % moduloVal)`.
  let resultAccumulator = [
    [0, 0, bigIncrement.getRemainder(moduloVal).toNativeNumber()]
  ];

  let currentSum = numericFactory(0); // Tracks the accumulated sum.

  // Loop through powers of 10 up to 10^18 or until current sum reaches the target length.
  for (let i = 1; i < 19 && !currentSum.isGreaterOrEqual(bigLength); i++) {
    const powerOfTen_i = numericFactory(10).exponentiate(i); // Calculate 10^i
    const valueBeforePower = powerOfTen_i.decrementValue(); // Calculate (10^i - 1)

    // Calculate the `calculatedDiff` for this step: ( (10^i - 1 - A + B) / B ) - currentSum
    let calculatedDiff = (valueBeforePower.subtract(bigStart).add(bigIncrement)).getQuotient(bigIncrement);
    calculatedDiff = calculatedDiff.subtract(currentSum);

    // Skip if the calculated difference is non-positive.
    if (calculatedDiff.isLesserOrEqual(numericFactory(0))) {
      continue;
    }

    // Adjust `calculatedDiff` if adding it would exceed the `bigLength`.
    const potentialNextSum = currentSum.add(calculatedDiff);
    if (potentialNextSum.isGreater(bigLength)) {
      calculatedDiff = bigLength.subtract(currentSum);
    }

    // Define the base transformation matrix for this iteration.
    const matrixBase = [
      [calculateModularPower(10, i), 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ];
    // Raise the matrix to the power of `calculatedDiff`.
    const transformationMatrix = matrixModularPower(matrixBase, calculatedDiff);

    // Update the second element of the result accumulator: (bigIncrement * currentSum + bigStart) % moduloVal.
    resultAccumulator[0][1] = bigIncrement.multiply(currentSum).add(bigStart).getRemainder(moduloVal).toNativeNumber();

    // Apply the transformation to the result accumulator.
    resultAccumulator = matrixModularMultiplication(resultAccumulator, transformationMatrix);

    // Update the accumulated sum.
    currentSum = currentSum.add(calculatedDiff);
  }

  // The final answer is the first element of the first row of the resulting matrix.
  return resultAccumulator[0][0];
}

// Execute the main calculation and print the final result to console.
console.log(executeCalculation());