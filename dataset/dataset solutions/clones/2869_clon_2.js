// This file implements a JavaScript library for handling arbitrarily large integers.
// It provides arithmetic operations and utility functions for numbers beyond JavaScript's native limits.
var largeNum = function (noValue) {
  "use strict"; // Enforce strict mode for better code quality.

  // Core configuration for large number representation
  const CHUNK_SIZE = 1e7; // Each array element represents a chunk of digits (base 10^7)
  const CHUNK_LOG = 7; // Log base 10 of CHUNK_SIZE
  const MAX_JS_NUM = 9007199254740992; // Maximum safe integer in JavaScript (2^53 - 1)
  const MAX_JS_NUM_ARRAY = nativeToDigitArray(MAX_JS_NUM); // MAX_JS_NUM represented as a digit array
  const LOG_JS_LIMIT = Math.log(MAX_JS_NUM); // Logarithm of MAX_JS_NUM for certain checks

  /**
   * Represents a WholeNumber, the base class for both LargeInteger and TinyInteger.
   * @constructor
   * @param {any} inputVal - The value to parse.
   * @param {number} [baseSystem] - The base of the input string, if applicable.
   * @returns {WholeNumber} A new WholeNumber instance.
   */
  function WholeNumber(inputVal, baseSystem) {
    // If no value is provided, return the cached zero instance
    if (typeof inputVal === "undefined") {
      return WholeNumber[0];
    }
    // If a baseSystem is provided, parse accordingly
    if (typeof baseSystem !== "undefined") {
      return +baseSystem === 10 ? parseTextValue(inputVal) : parseStringWithBase(inputVal, baseSystem);
    }
    // Otherwise, parse the value directly
    return parseTextValue(inputVal);
  }

  /**
   * Represents a LargeInteger (arbitrarily large number).
   * @constructor
   * @param {number[]} digitArray - An array of number chunks.
   * @param {boolean} isNegative - True if the number is negative.
   */
  function LargeInteger(digitArray, isNegative) {
    this.digitArray = digitArray;
    this.isNegative = isNegative;
    this.isCompact = false; // This is not a small, native JS number
  }

  // LargeInteger inherits from WholeNumber
  LargeInteger.prototype = Object.create(WholeNumber.prototype);

  /**
   * Represents a TinyInteger (a number that fits within JavaScript's native safe integer range).
   * @constructor
   * @param {number} numValue - The native JavaScript number.
   */
  function TinyInteger(numValue) {
    this.digitArray = numValue;
    this.isNegative = numValue < 0;
    this.isCompact = true; // This is a small, native JS number
  }

  // TinyInteger inherits from WholeNumber
  TinyInteger.prototype = Object.create(WholeNumber.prototype);

  /**
   * Checks if a number can be precisely represented as a native JavaScript integer.
   * @param {number} n - The number to check.
   * @returns {boolean} True if the number is within the safe integer range.
   */
  function isWithinNativeRange(n) {
    return -MAX_JS_NUM < n && n < MAX_JS_NUM;
  }

  /**
   * Converts a native JavaScript number into an array of number chunks.
   * Each chunk has a maximum value of CHUNK_SIZE - 1.
   * @param {number} n - The native number to convert.
   * @returns {number[]} An array representing the number.
   */
  function nativeToDigitArray(n) {
    if (n < 1e7) {
      return [n];
    }
    if (n < 1e14) {
      return [n % 1e7, Math.floor(n / 1e7)];
    }
    return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }

  /**
   * Converts an array of number chunks back to a native JavaScript number if possible.
   * @param {number[]} digitArray - The array of chunks.
   * @returns {number|number[]} The native number or the original array if too large.
   */
  function digitArrayToNative(digitArray) {
    removeLeadingZeros(digitArray); // Clean up any leading zeros
    let countItems = digitArray.length; // Get the number of chunks

    // If the number of chunks is small and the absolute value is within MAX_JS_NUM
    if (countItems < 4 && compareAbsoluteValues(digitArray, MAX_JS_NUM_ARRAY) < 0) {
      switch (countItems) {
        case 0:
          return 0; // Empty array means zero
        case 1:
          return digitArray[0]; // Single chunk
        case 2:
          return digitArray[0] + digitArray[1] * CHUNK_SIZE; // Two chunks
        default:
          return digitArray[0] + (digitArray[1] + digitArray[2] * CHUNK_SIZE) * CHUNK_SIZE; // Three chunks
      }
    }
    return digitArray; // Too large for native, return array
  }

  /**
   * Removes leading zero chunks from a digit array.
   * Modifies the array in place.
   * @param {number[]} segmentArr - The array of number chunks.
   */
  function removeLeadingZeros(segmentArr) {
    let idx = segmentArr.length;
    while (idx-- > 0 && segmentArr[idx] === 0); // Find the last non-zero chunk
    segmentArr.length = idx + 1; // Trim the array
  }

  /**
   * Creates a new array of a specified length, filled with zeros.
   * @param {number} countItems - The desired length of the array.
   * @returns {number[]} The new array.
   */
  function makeZeroArray(countItems) {
    let newArray = new Array(countItems);
    let idx = -1;
    while (++idx < countItems) {
      newArray[idx] = 0; // Initialize all elements to zero
    }
    return newArray;
  }

  /**
   * Truncates a number towards zero (floor for positive, ceil for negative).
   * @param {number} n - The number to truncate.
   * @returns {number} The integer part of the number.
   */
  function chopDecimal(n) {
    if (n > 0) {
      return Math.floor(n);
    }
    return Math.ceil(n);
  }

  /**
   * Performs addition of two digit arrays. Assumes both are non-negative.
   * The first array (a) must be greater than or equal in length to the second (b).
   * @param {number[]} firstArr - The first digit array.
   * @param {number[]} secondArr - The second digit array.
   * @returns {number[]} The result of the addition.
   */
  function performAddition(firstArr, secondArr) {
    let lenA = firstArr.length,
      lenB = secondArr.length,
      resultArray = new Array(lenA),
      remCarry = 0,
      segmentUnit = CHUNK_SIZE,
      currentSum,
      idx;

    // Add corresponding chunks from both arrays
    for (idx = 0; idx < lenB; idx++) {
      currentSum = firstArr[idx] + secondArr[idx] + remCarry;
      remCarry = currentSum >= segmentUnit ? 1 : 0;
      resultArray[idx] = currentSum - remCarry * segmentUnit;
    }

    // Add remaining chunks from the longer array, considering carry
    while (idx < lenA) {
      currentSum = firstArr[idx] + remCarry;
      remCarry = currentSum === segmentUnit ? 1 : 0;
      resultArray[idx++] = currentSum - remCarry * segmentUnit;
    }

    // If there's a final carry, append it
    if (remCarry > 0) {
      resultArray.push(remCarry);
    }
    return resultArray;
  }

  /**
   * Adds two digit arrays, handling differing lengths by ensuring the longer one is first.
   * @param {number[]} arr1 - The first digit array.
   * @param {number[]} arr2 - The second digit array.
   * @returns {number[]} The sum as a digit array.
   */
  function addAnyLengthArrays(arr1, arr2) {
    if (arr1.length >= arr2.length) {
      return performAddition(arr1, arr2);
    }
    return performAddition(arr2, arr1);
  }

  /**
   * Adds a small native number (carry) to a digit array.
   * @param {number[]} digitArray - The digit array.
   * @param {number} nativeCarry - The native number to add.
   * @returns {number[]} The result as a digit array.
   */
  function addSmallValue(digitArray, nativeCarry) {
    let arrLength = digitArray.length,
      resultArray = new Array(arrLength),
      segmentUnit = CHUNK_SIZE,
      currentSum,
      idx;

    for (idx = 0; idx < arrLength; idx++) {
      currentSum = digitArray[idx] - segmentUnit + nativeCarry;
      nativeCarry = Math.floor(currentSum / segmentUnit);
      resultArray[idx] = currentSum - nativeCarry * segmentUnit;
      nativeCarry += 1; // Adjust carry for next iteration
    }

    // Propagate any remaining carry
    while (nativeCarry > 0) {
      resultArray[idx++] = nativeCarry % segmentUnit;
      nativeCarry = Math.floor(nativeCarry / segmentUnit);
    }
    return resultArray;
  }

  // LargeInteger prototype methods for addition
  LargeInteger.prototype.add = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum); // Normalize input
    // If signs are different, it's a subtraction
    if (this.isNegative !== parsedOperand.isNegative) {
      return this.subtract(parsedOperand.negate());
    }

    let currentVal = this.digitArray,
      otherVal = parsedOperand.digitArray;

    // If the other operand is small, optimize
    if (parsedOperand.isCompact) {
      return new LargeInteger(addSmallValue(currentVal, Math.abs(otherVal)), this.isNegative);
    }
    return new LargeInteger(addAnyLengthArrays(currentVal, otherVal), this.isNegative);
  };
  LargeInteger.prototype.plus = LargeInteger.prototype.add; // Alias

  // TinyInteger prototype methods for addition
  TinyInteger.prototype.add = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum);
    let currentNativeVal = this.digitArray;

    // If signs are different, it's a subtraction
    if (currentNativeVal < 0 !== parsedOperand.isNegative) {
      return this.subtract(parsedOperand.negate());
    }

    let otherNativeVal = parsedOperand.digitArray;

    // If both are small, try native addition
    if (parsedOperand.isCompact) {
      if (isWithinNativeRange(currentNativeVal + otherNativeVal)) {
        return new TinyInteger(currentNativeVal + otherNativeVal);
      }
      // If overflow, convert other to digit array
      otherNativeVal = nativeToDigitArray(Math.abs(otherNativeVal));
    }
    // Perform addition using digit array logic
    return new LargeInteger(addSmallValue(otherNativeVal, Math.abs(currentNativeVal)), currentNativeVal < 0);
  };
  TinyInteger.prototype.plus = TinyInteger.prototype.add; // Alias

  /**
   * Performs subtraction of two digit arrays (a - b). Assumes a >= b and both are non-negative.
   * @param {number[]} firstArr - The first digit array.
   * @param {number[]} secondArr - The second digit array.
   * @returns {number[]} The result of the subtraction.
   */
  function performSubtraction(firstArr, secondArr) {
    let lenOfA = firstArr.length,
      lenOfB = secondArr.length,
      resultArray = new Array(lenOfA),
      remBorrow = 0,
      segmentUnit = CHUNK_SIZE,
      idx,
      currentDiff;

    // Subtract corresponding chunks
    for (idx = 0; idx < lenOfB; idx++) {
      currentDiff = firstArr[idx] - remBorrow - secondArr[idx];
      if (currentDiff < 0) {
        currentDiff += segmentUnit;
        remBorrow = 1;
      } else {
        remBorrow = 0;
      }
      resultArray[idx] = currentDiff;
    }

    // Propagate borrow through remaining chunks of the first array
    for (idx = lenOfB; idx < lenOfA; idx++) {
      currentDiff = firstArr[idx] - remBorrow;
      if (currentDiff < 0) {
        currentDiff += segmentUnit;
      } else {
        resultArray[idx++] = currentDiff;
        break; // No more borrow, can just copy remaining digits
      }
      resultArray[idx] = currentDiff;
    }

    // Copy any remaining chunks from the first array
    for (; idx < lenOfA; idx++) {
      resultArray[idx] = firstArr[idx];
    }
    removeLeadingZeros(resultArray); // Clean up result
    return resultArray;
  }

  /**
   * Performs subtraction between two digit arrays, handling sign and order.
   * @param {number[]} arrA - The first digit array.
   * @param {number[]} arrB - The second digit array.
   * @param {boolean} resultNegative - The initial sign for the result.
   * @returns {WholeNumber} The result as a WholeNumber.
   */
  function subtractAnyLengthArrays(arrA, arrB, resultNegative) {
    let entityVal;
    // Determine which array is larger in absolute value to ensure positive subtraction result
    if (compareAbsoluteValues(arrA, arrB) >= 0) {
      entityVal = performSubtraction(arrA, arrB);
    } else {
      entityVal = performSubtraction(arrB, arrA);
      resultNegative = !resultNegative; // Flip sign if (B - A) was performed
    }

    entityVal = digitArrayToNative(entityVal); // Try to convert to native

    // If it fits native, return TinyInteger
    if (typeof entityVal === "number") {
      if (resultNegative) {
        entityVal = -entityVal;
      }
      return new TinyInteger(entityVal);
    }
    // Otherwise, return LargeInteger
    return new LargeInteger(entityVal, resultNegative);
  }

  /**
   * Subtracts a native number from a digit array, handling sign.
   * @param {number[]} digitArray - The digit array.
   * @param {number} nativeVal - The native number to subtract (absolute value).
   * @param {boolean} resultNegative - The sign of the overall operation.
   * @returns {WholeNumber} The result as a WholeNumber.
   */
  function subtractSmallValue(digitArray, nativeVal, resultNegative) {
    let arrLength = digitArray.length,
      resultArray = new Array(arrLength),
      remCarry = -nativeVal, // Negative carry for subtraction
      segmentUnit = CHUNK_SIZE,
      idx,
      currentDiff;

    for (idx = 0; idx < arrLength; idx++) {
      currentDiff = digitArray[idx] + remCarry;
      remCarry = Math.floor(currentDiff / segmentUnit);
      currentDiff %= segmentUnit;
      resultArray[idx] = currentDiff < 0 ? currentDiff + segmentUnit : currentDiff; // Normalize negative remainder
    }

    resultArray = digitArrayToNative(resultArray); // Try to convert to native

    // If it fits native, return TinyInteger
    if (typeof resultArray === "number") {
      if (resultNegative) {
        resultArray = -resultArray;
      }
      return new TinyInteger(resultArray);
    }
    // Otherwise, return LargeInteger
    return new LargeInteger(resultArray, resultNegative);
  }

  // LargeInteger prototype methods for subtraction
  LargeInteger.prototype.subtract = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum);
    // If signs are different, it's an addition with flipped sign
    if (this.isNegative !== parsedOperand.isNegative) {
      return this.add(parsedOperand.negate());
    }

    let currentVal = this.digitArray,
      otherVal = parsedOperand.digitArray;

    // If the other operand is small, optimize
    if (parsedOperand.isCompact) {
      return subtractSmallValue(currentVal, Math.abs(otherVal), this.isNegative);
    }
    return subtractAnyLengthArrays(currentVal, otherVal, this.isNegative);
  };
  LargeInteger.prototype.minus = LargeInteger.prototype.subtract; // Alias

  // TinyInteger prototype methods for subtraction
  TinyInteger.prototype.subtract = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum);
    let currentNativeVal = this.digitArray;

    // If signs are different, it's an addition with flipped sign
    if (currentNativeVal < 0 !== parsedOperand.isNegative) {
      return this.add(parsedOperand.negate());
    }

    let otherNativeVal = parsedOperand.digitArray;

    // If both are small, try native subtraction
    if (parsedOperand.isCompact) {
      return new TinyInteger(currentNativeVal - otherNativeVal);
    }
    // Otherwise, perform subtraction using digit array logic
    return subtractSmallValue(otherNativeVal, Math.abs(currentNativeVal), currentNativeVal >= 0);
  };
  TinyInteger.prototype.minus = TinyInteger.prototype.subtract; // Alias

  // Negation methods
  LargeInteger.prototype.negate = function () {
    return new LargeInteger(this.digitArray, !this.isNegative);
  };
  TinyInteger.prototype.negate = function () {
    let currentSign = this.isNegative;
    let compactResult = new TinyInteger(-this.digitArray);
    compactResult.isNegative = !currentSign; // Ensure sign is flipped correctly
    return compactResult;
  };

  // Absolute value methods
  LargeInteger.prototype.abs = function () {
    return new LargeInteger(this.digitArray, false);
  };
  TinyInteger.prototype.abs = function () {
    return new TinyInteger(Math.abs(this.digitArray));
  };

  /**
   * Performs standard long multiplication on two digit arrays.
   * @param {number[]} arrA - The first digit array.
   * @param {number[]} arrB - The second digit array.
   * @returns {number[]} The product as a digit array.
   */
  function longMultiplication(arrA, arrB) {
    let lenA = arrA.length,
      lenB = arrB.length,
      productLength = lenA + lenB,
      resultArray = makeZeroArray(productLength),
      segmentUnit = CHUNK_SIZE,
      currentProduct,
      remCarry,
      idx,
      elementA,
      elementB;

    for (idx = 0; idx < lenA; ++idx) {
      elementA = arrA[idx];
      for (let jdx = 0; jdx < lenB; ++jdx) {
        elementB = arrB[jdx];
        currentProduct = elementA * elementB + resultArray[idx + jdx];
        remCarry = Math.floor(currentProduct / segmentUnit);
        resultArray[idx + jdx] = currentProduct - remCarry * segmentUnit;
        resultArray[idx + jdx + 1] += remCarry; // Add carry to the next chunk position
      }
    }
    removeLeadingZeros(resultArray); // Clean up result
    return resultArray;
  }

  /**
   * Multiplies a digit array by a small native number.
   * @param {number[]} digitArray - The digit array.
   * @param {number} nativeFactor - The native number to multiply by.
   * @returns {number[]} The product as a digit array.
   */
  function scaleArrayByNative(digitArray, nativeFactor) {
    let arrLength = digitArray.length,
      resultArray = new Array(arrLength),
      segmentUnit = CHUNK_SIZE,
      remCarry = 0,
      currentProduct,
      idx;

    for (idx = 0; idx < arrLength; idx++) {
      currentProduct = digitArray[idx] * nativeFactor + remCarry;
      remCarry = Math.floor(currentProduct / segmentUnit);
      resultArray[idx] = currentProduct - remCarry * segmentUnit;
    }

    // Propagate any remaining carry
    while (remCarry > 0) {
      resultArray[idx++] = remCarry % segmentUnit;
      remCarry = Math.floor(remCarry / segmentUnit);
    }
    return resultArray;
  }

  /**
   * Prepends zeros to an array to simulate a left shift.
   * @param {number[]} sourceArr - The array to shift.
   * @param {number} zeroCount - The number of zeros to prepend.
   * @returns {number[]} A new array with zeros prepended.
   */
  function padWithZeros(sourceArr, zeroCount) {
    let zeroPad = [];
    while (zeroCount-- > 0) {
      zeroPad.push(0);
    }
    return zeroPad.concat(sourceArr);
  }

  /**
   * Implements Karatsuba multiplication for digit arrays.
   * Efficient for very large numbers.
   * @param {number[]} arrX - The first digit array.
   * @param {number[]} arrY - The second digit array.
   * @returns {number[]} The product as a digit array.
   */
  function karatsubaProduct(arrX, arrY) {
    let currentLength = Math.max(arrX.length, arrY.length);

    // Base case for recursion: fall back to long multiplication for smaller arrays
    if (currentLength <= 30) {
      return longMultiplication(arrX, arrY);
    }

    // Split arrays into two halves
    currentLength = Math.ceil(currentLength / 2); // Split point
    let bPart = arrX.slice(currentLength),
      aPart = arrX.slice(0, currentLength),
      dPart = arrY.slice(currentLength),
      cPart = arrY.slice(0, currentLength);

    // Recursively calculate products
    let productAC = karatsubaProduct(aPart, cPart),
      productBD = karatsubaProduct(bPart, dPart),
      productABCD = karatsubaProduct(addAnyLengthArrays(aPart, bPart), addAnyLengthArrays(cPart, dPart));

    // Combine results using Karatsuba's formula
    let finalProduct = addAnyLengthArrays(
      addAnyLengthArrays(productAC, padWithZeros(subtract(subtract(productABCD, productAC), productBD), currentLength)),
      padWithZeros(productBD, 2 * currentLength)
    );
    removeLeadingZeros(finalProduct); // Clean up result
    return finalProduct;
  }

  /**
   * Determines if Karatsuba multiplication would be more efficient than long multiplication.
   * @param {number} len1 - Length of the first array.
   * @param {number} len2 - Length of the second array.
   * @returns {boolean} True if Karatsuba should be used.
   */
  function shouldUseKaratsuba(len1, len2) {
    // Heuristic formula to decide based on array lengths
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  // LargeInteger prototype methods for multiplication
  LargeInteger.prototype.multiply = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum),
      firstArr = this.digitArray,
      secondArr = parsedOperand.digitArray,
      resultSign = this.isNegative !== parsedOperand.isNegative,
      absoluteVal;

    if (parsedOperand.isCompact) {
      // Handle special cases for small multipliers
      if (secondArr === 0) return WholeNumber[0];
      if (secondArr === 1) return this;
      if (secondArr === -1) return this.negate();

      absoluteVal = Math.abs(secondArr);
      if (absoluteVal < CHUNK_SIZE) {
        return new LargeInteger(scaleArrayByNative(firstArr, absoluteVal), resultSign);
      }
      // Convert the small multiplier to a digit array
      secondArr = nativeToDigitArray(absoluteVal);
    }

    // Decide between Karatsuba and long multiplication
    if (shouldUseKaratsuba(firstArr.length, secondArr.length)) {
      return new LargeInteger(karatsubaProduct(firstArr, secondArr), resultSign);
    }
    return new LargeInteger(longMultiplication(firstArr, secondArr), resultSign);
  };
  LargeInteger.prototype.times = LargeInteger.prototype.multiply; // Alias

  /**
   * Multiplies a native number with a digit array, returning a LargeInteger.
   * @param {number} nativeVal - The native number.
   * @param {number[]} digitArray - The digit array.
   * @param {boolean} resultNegative - The sign of the result.
   * @returns {LargeInteger} The product.
   */
  function multiplyNativeAndDigitArray(nativeVal, digitArray, resultNegative) {
    if (nativeVal < CHUNK_SIZE) {
      return new LargeInteger(scaleArrayByNative(digitArray, nativeVal), resultNegative);
    }
    return new LargeInteger(longMultiplication(digitArray, nativeToDigitArray(nativeVal)), resultNegative);
  }

  // Internal multiplication helper for small operands
  TinyInteger.prototype._multiplyBySmall = function (smallOperand) {
    // If the product fits native, use native multiplication
    if (isWithinNativeRange(smallOperand.digitArray * this.digitArray)) {
      return new TinyInteger(smallOperand.digitArray * this.digitArray);
    }
    // Otherwise, convert and use digit array multiplication
    return multiplyNativeAndDigitArray(
      Math.abs(smallOperand.digitArray),
      nativeToDigitArray(Math.abs(this.digitArray)),
      this.isNegative !== smallOperand.isNegative
    );
  };

  // Internal multiplication helper for large operands
  LargeInteger.prototype._multiplyBySmall = function (smallOperand) {
    // Handle special cases for small multipliers
    if (smallOperand.digitArray === 0) return WholeNumber[0];
    if (smallOperand.digitArray === 1) return this;
    if (smallOperand.digitArray === -1) return this.negate();

    return multiplyNativeAndDigitArray(
      Math.abs(smallOperand.digitArray),
      this.digitArray,
      this.isNegative !== smallOperand.isNegative
    );
  };

  // TinyInteger prototype methods for multiplication
  TinyInteger.prototype.multiply = function (operandNum) {
    // Delegate to the internal helper after parsing
    return coerceInputToNumber(operandNum)._multiplyBySmall(this);
  };
  TinyInteger.prototype.times = TinyInteger.prototype.multiply; // Alias

  /**
   * Calculates the square of a digit array.
   * @param {number[]} digitArray - The array to square.
   * @returns {number[]} The squared value as a digit array.
   */
  function calculateSquare(digitArray) {
    let arrLength = digitArray.length,
      resultArray = makeZeroArray(arrLength + arrLength), // Max length is 2*N
      segmentUnit = CHUNK_SIZE,
      currentProduct,
      remCarry,
      idx,
      elementA,
      elementB;

    for (idx = 0; idx < arrLength; idx++) {
      elementA = digitArray[idx];
      remCarry = 0 - elementA * elementA; // Initialize carry with diagonal term (negative for subtraction)
      for (let jdx = idx; jdx < arrLength; jdx++) {
        elementB = digitArray[jdx];
        currentProduct = 2 * (elementA * elementB) + resultArray[idx + jdx] + remCarry; // 2*a*b term
        remCarry = Math.floor(currentProduct / segmentUnit);
        resultArray[idx + jdx] = currentProduct - remCarry * segmentUnit;
      }
      resultArray[idx + arrLength] = remCarry; // Place final carry
    }
    removeLeadingZeros(resultArray); // Clean up result
    return resultArray;
  }

  // Square methods
  LargeInteger.prototype.square = function () {
    return new LargeInteger(calculateSquare(this.digitArray), false);
  };
  TinyInteger.prototype.square = function () {
    let squaredValue = this.digitArray * this.digitArray;
    // If squared value fits native, return TinyInteger
    if (isWithinNativeRange(squaredValue)) {
      return new TinyInteger(squaredValue);
    }
    // Otherwise, convert to digit array and square
    return new LargeInteger(calculateSquare(nativeToDigitArray(Math.abs(this.digitArray))), false);
  };

  /**
   * Implements Knuth's Algorithm D for division with remainder for large integers.
   * @param {number[]} dividendArr - The dividend as a digit array.
   * @param {number[]} divisorArr - The divisor as a digit array.
   * @returns {[WholeNumber, WholeNumber]} An array containing [quotient, remainder].
   */
  function longDivisionAlgorithm(dividendArr, divisorArr) {
    let dividendLen = dividendArr.length,
      divisorLen = divisorArr.length,
      resultQuo = makeZeroArray(divisorArr.length),
      segmentUnit = CHUNK_SIZE,
      leadingDivisorDigit = divisorArr[divisorLen - 1],
      normFactor = Math.ceil(segmentUnit / (2 * leadingDivisorDigit)), // Normalization factor
      normalizedDividend = scaleArrayByNative(dividendArr, normFactor), // Scale dividend
      normalizedDivisor = scaleArrayByNative(divisorArr, normFactor), // Scale divisor
      quotientDigit,
      posShift,
      remCarry,
      remBorrow,
      idx,
      len,
      tempQ;

    // Adjust dividend length if needed after normalization
    if (normalizedDividend.length <= dividendLen) {
      normalizedDividend.push(0);
    }
    normalizedDivisor.push(0); // Pad divisor for simpler loop conditions

    leadingDivisorDigit = normalizedDivisor[divisorLen - 1]; // Re-get leading digit after normalization

    // Iterate from most significant position down
    for (posShift = dividendLen - divisorLen; posShift >= 0; posShift--) {
      quotientDigit = segmentUnit - 1; // Initial guess for quotient digit
      // Refine initial guess for quotient digit
      if (normalizedDividend[posShift + divisorLen] !== leadingDivisorDigit) {
        quotientDigit = Math.floor(
          (normalizedDividend[posShift + divisorLen] * segmentUnit +
            normalizedDividend[posShift + divisorLen - 1]) /
          leadingDivisorDigit
        );
      }

      remCarry = 0;
      remBorrow = 0;
      len = normalizedDivisor.length;

      // Multiply divisor by quotientDigit and subtract from dividend segment
      for (idx = 0; idx < len; idx++) {
        remCarry += quotientDigit * normalizedDivisor[idx];
        tempQ = Math.floor(remCarry / segmentUnit);
        remBorrow += normalizedDividend[posShift + idx] - (remCarry - tempQ * segmentUnit);
        remCarry = tempQ;
        if (remBorrow < 0) {
          normalizedDividend[posShift + idx] = remBorrow + segmentUnit;
          remBorrow = -1;
        } else {
          normalizedDividend[posShift + idx] = remBorrow;
          remBorrow = 0;
        }
      }

      // Adjust quotientDigit if it was too large (borrow occurred)
      while (remBorrow !== 0) {
        quotientDigit -= 1;
        remCarry = 0;
        for (idx = 0; idx < len; idx++) {
          remCarry += normalizedDividend[posShift + idx] - segmentUnit + normalizedDivisor[idx];
          if (remCarry < 0) {
            normalizedDividend[posShift + idx] = remCarry + segmentUnit;
            remCarry = 0;
          } else {
            normalizedDividend[posShift + idx] = remCarry;
            remCarry = 1;
          }
        }
        remBorrow += remCarry;
      }
      resultQuo[posShift] = quotientDigit; // Store the calculated quotient digit
    }

    // Denormalize the remainder
    let denormalizedRemainder = divideDigitArrayByNative(normalizedDividend, normFactor)[0];
    return [digitArrayToNative(resultQuo), digitArrayToNative(denormalizedRemainder)];
  }

  /**
   * Implements iterative division with remainder for large integers.
   * Useful when dividend is much larger than divisor.
   * @param {number[]} dividendArr - The dividend as a digit array.
   * @param {number[]} divisorArr - The divisor as a digit array.
   * @returns {[WholeNumber, WholeNumber]} An array containing [quotient, remainder].
   */
  function iterativeDivision(dividendArr, divisorArr) {
    let dividendLen = dividendArr.length,
      divisorLen = divisorArr.length,
      resultQuo = [],
      partialDividend = [],
      segmentUnit = CHUNK_SIZE,
      currentGuess,
      segmentXLength,
      topXChunk,
      topYChunk,
      testProduct;

    // Process dividend chunks from most significant to least significant
    while (dividendLen > 0) {
      partialDividend.unshift(dividendArr[--dividendLen]); // Add next chunk to partial dividend
      removeLeadingZeros(partialDividend); // Clean up partial dividend

      // If partial dividend is smaller than divisor, quotient digit is 0
      if (compareAbsoluteValues(partialDividend, divisorArr) < 0) {
        resultQuo.push(0);
        continue;
      }

      segmentXLength = partialDividend.length;
      topXChunk = partialDividend[segmentXLength - 1] * segmentUnit + partialDividend[segmentXLength - 2];
      topYChunk = divisorArr[divisorLen - 1] * segmentUnit + divisorArr[divisorLen - 2];

      // Adjust highXPart if partialDividend is longer than divisor (to avoid underestimation)
      if (segmentXLength > divisorLen) {
        topXChunk = (topXChunk + 1) * segmentUnit;
      }

      currentGuess = Math.ceil(topXChunk / topYChunk); // Initial guess for quotient digit

      // Refine guess by trial subtraction
      do {
        testProduct = scaleArrayByNative(divisorArr, currentGuess);
        if (compareAbsoluteValues(testProduct, partialDividend) <= 0) {
          break; // Guess is good
        }
        currentGuess--;
      } while (currentGuess);

      resultQuo.push(currentGuess); // Store quotient digit
      partialDividend = performSubtraction(partialDividend, testProduct); // Subtract to get new remainder
    }
    resultQuo.reverse(); // Digits were collected in reverse order
    return [digitArrayToNative(resultQuo), digitArrayToNative(partialDividend)];
  }

  /**
   * Divides a digit array by a native number, returning quotient and remainder.
   * @param {number[]} digitArray - The dividend as a digit array.
   * @param {number} nativeDivisor - The native divisor.
   * @returns {[number[], number]} An array containing [quotient digit array, remainder native number].
   */
  function divideDigitArrayByNative(digitArray, nativeDivisor) {
    let arrLength = digitArray.length,
      quotientArray = makeZeroArray(arrLength),
      segmentUnit = CHUNK_SIZE,
      idx,
      tempQ,
      remainderVal,
      currentDivisor;

    remainderVal = 0;
    // Iterate from most significant digit down
    for (idx = arrLength - 1; idx >= 0; --idx) {
      currentDivisor = remainderVal * segmentUnit + digitArray[idx];
      tempQ = chopDecimal(currentDivisor / nativeDivisor);
      remainderVal = currentDivisor - tempQ * nativeDivisor;
      quotientArray[idx] = tempQ | 0; // Ensure integer
    }
    return [quotientArray, remainderVal | 0]; // Ensure integer remainder
  }

  /**
   * Performs division and modulo operation for any WholeNumber inputs.
   * @param {WholeNumber} self - The dividend.
   * @param {any} operandNum - The divisor.
   * @returns {[WholeNumber, WholeNumber]} An array containing [quotient, remainder].
   */
  function flexibleDivRem(self, operandNum) {
    let entityVal,
      parsedOperand = coerceInputToNumber(operandNum);
    let dividendArr = self.digitArray,
      divisorArr = parsedOperand.digitArray;
    let quotientResult;

    // Division by zero check
    if (divisorArr === 0) {
      throw new Error("Cannot divide by zero");
    }

    // Handle cases where dividend is small
    if (self.isCompact) {
      if (parsedOperand.isCompact) {
        // Both small, use native operations
        return [
          new TinyInteger(chopDecimal(dividendArr / divisorArr)),
          new TinyInteger(dividendArr % divisorArr),
        ];
      }
      // Small dividend, large divisor -> quotient is 0, remainder is dividend
      return [WholeNumber[0], self];
    }

    // Handle cases where divisor is small
    if (parsedOperand.isCompact) {
      // Special cases for small divisors
      if (divisorArr === 1) return [self, WholeNumber[0]];
      if (divisorArr === -1) return [self.negate(), WholeNumber[0]];

      let absoluteDivisor = Math.abs(divisorArr);
      if (absoluteDivisor < CHUNK_SIZE) {
        entityVal = divideDigitArrayByNative(dividendArr, absoluteDivisor);
        quotientResult = digitArrayToNative(entityVal[0]);
        let remainderResult = entityVal[1];

        // Adjust remainder sign
        if (self.isNegative) {
          remainderResult = -remainderResult;
        }

        // Return TinyInteger if quotient fits native
        if (typeof quotientResult === "number") {
          if (self.isNegative !== parsedOperand.isNegative) {
            quotientResult = -quotientResult;
          }
          return [new TinyInteger(quotientResult), new TinyInteger(remainderResult)];
        }
        // Otherwise, return LargeInteger for quotient
        return [
          new LargeInteger(quotientResult, self.isNegative !== parsedOperand.isNegative),
          new TinyInteger(remainderResult),
        ];
      }
      // Convert small divisor to digit array if it's larger than CHUNK_SIZE
      divisorArr = nativeToDigitArray(absoluteDivisor);
    }

    // Compare absolute values of dividend and divisor
    let comparison = compareAbsoluteValues(dividendArr, divisorArr);
    if (comparison === -1) {
      return [WholeNumber[0], self]; // Dividend < divisor, quotient 0, remainder dividend
    }
    if (comparison === 0) {
      // Dividend === divisor, quotient 1 (or -1), remainder 0
      return [WholeNumber[self.isNegative === parsedOperand.isNegative ? 1 : -1], WholeNumber[0]];
    }

    // Perform actual division using appropriate algorithm
    if (dividendArr.length + divisorArr.length <= 200) {
      entityVal = longDivisionAlgorithm(dividendArr, divisorArr);
    } else {
      entityVal = iterativeDivision(dividendArr, divisorArr);
    }

    quotientResult = entityVal[0];
    let quotientIsNegative = self.isNegative !== parsedOperand.isNegative,
      remainderResult = entityVal[1],
      remainderIsNegative = self.isNegative;

    // Convert quotient to WholeNumber
    if (typeof quotientResult === "number") {
      if (quotientIsNegative) {
        quotientResult = -quotientResult;
      }
      quotientResult = new TinyInteger(quotientResult);
    } else {
      quotientResult = new LargeInteger(quotientResult, quotientIsNegative);
    }

    // Convert remainder to WholeNumber
    if (typeof remainderResult === "number") {
      if (remainderIsNegative) {
        remainderResult = -remainderResult;
      }
      remainderResult = new TinyInteger(remainderResult);
    } else {
      remainderResult = new LargeInteger(remainderResult, remainderIsNegative);
    }

    return [quotientResult, remainderResult];
  }

  // Division and Modulo methods
  LargeInteger.prototype.divmod = function (operandNum) {
    let result = flexibleDivRem(this, operandNum);
    return {
      quotient: result[0],
      remainder: result[1],
    };
  };
  TinyInteger.prototype.divmod = LargeInteger.prototype.divmod;

  LargeInteger.prototype.divide = function (operandNum) {
    return flexibleDivRem(this, operandNum)[0];
  };
  TinyInteger.prototype.over = TinyInteger.prototype.divide = LargeInteger.prototype.over = LargeInteger.prototype.divide;

  LargeInteger.prototype.mod = function (operandNum) {
    return flexibleDivRem(this, operandNum)[1];
  };
  TinyInteger.prototype.remainder = TinyInteger.prototype.mod = LargeInteger.prototype.remainder = LargeInteger.prototype.mod;

  LargeInteger.prototype.pow = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum),
      dividendArr = this.digitArray,
      exponentVal = parsedOperand.digitArray,
      productValue,
      baseVal,
      resultVal;

    // Handle special cases for exponent
    if (exponentVal === 0) return WholeNumber[1];
    if (dividendArr === 0) return WholeNumber[0];
    if (dividendArr === 1) return WholeNumber[1];
    if (dividendArr === -1) return parsedOperand.isEven() ? WholeNumber[1] : WholeNumber[-1];

    // Negative exponent not supported for integers
    if (parsedOperand.isNegative) {
      return WholeNumber[0];
    }

    // Exponent must be small enough for this method
    if (!parsedOperand.isCompact) {
      throw new Error("The exponent " + parsedOperand.toString() + " is too large.");
    }

    // If base is small, try native Math.pow first
    if (this.isCompact) {
      if (isWithinNativeRange((productValue = Math.pow(dividendArr, exponentVal)))) {
        return new TinyInteger(chopDecimal(productValue));
      }
    }

    // Binary exponentiation (exponentiation by squaring)
    baseVal = this;
    resultVal = WholeNumber[1];
    while (true) {
      if ((exponentVal & 1) === 1) {
        resultVal = resultVal.times(baseVal);
        --exponentVal;
      }
      if (exponentVal === 0) break;
      exponentVal /= 2;
      baseVal = baseVal.square();
    }
    return resultVal;
  };
  TinyInteger.prototype.pow = LargeInteger.prototype.pow;

  LargeInteger.prototype.modPow = function (expNum, modNum) {
    let exponent = coerceInputToNumber(expNum),
      moduloVal = coerceInputToNumber(modNum);

    if (moduloVal.isZero()) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    let result = WholeNumber[1],
      base = this.mod(moduloVal);

    while (exponent.isPositive()) {
      if (base.isZero()) return WholeNumber[0]; // If base is 0, result is 0
      if (exponent.isOdd()) {
        result = result.multiply(base).mod(moduloVal);
      }
      exponent = exponent.divide(2);
      base = base.square().mod(moduloVal);
    }
    return result;
  };
  TinyInteger.prototype.modPow = LargeInteger.prototype.modPow;

  /**
   * Compares the absolute values of two digit arrays.
   * @param {number[]} arrA - The first digit array.
   * @param {number[]} arrB - The second digit array.
   * @returns {number} 1 if arrA > arrB, -1 if arrA < arrB, 0 if equal.
   */
  function compareAbsoluteValues(arrA, arrB) {
    // Compare lengths first
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    // If lengths are equal, compare chunk by chunk from most significant
    for (let idx = arrA.length - 1; idx >= 0; idx--) {
      if (arrA[idx] !== arrB[idx]) {
        return arrA[idx] > arrB[idx] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical
  }

  // Absolute comparison methods
  LargeInteger.prototype.compareAbs = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum),
      firstArr = this.digitArray,
      secondArr = parsedOperand.digitArray;

    // If other operand is small, this (large) is definitely greater
    if (parsedOperand.isCompact) {
      return 1;
    }
    return compareAbsoluteValues(firstArr, secondArr);
  };
  TinyInteger.prototype.compareAbs = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum),
      firstNativeAbs = Math.abs(this.digitArray),
      secondVal = parsedOperand.digitArray;

    // If other operand is also small, use native comparison
    if (parsedOperand.isCompact) {
      secondVal = Math.abs(secondVal);
      return firstNativeAbs === secondVal ? 0 : firstNativeAbs > secondVal ? 1 : -1;
    }
    return -1; // This (small) is definitely smaller than the large operand
  };

  // Full comparison methods
  LargeInteger.prototype.compare = function (operandNum) {
    // Handle Infinity cases
    if (operandNum === Infinity) {
      return -1;
    }
    if (operandNum === -Infinity) {
      return 1;
    }

    let parsedOperand = coerceInputToNumber(operandNum),
      firstArr = this.digitArray,
      secondArr = parsedOperand.digitArray;

    // Compare signs first
    if (this.isNegative !== parsedOperand.isNegative) {
      return parsedOperand.isNegative ? 1 : -1; // If this is positive and other negative, this > other
    }

    // If other operand is small, and signs are same, its value implies comparison
    if (parsedOperand.isCompact) {
      return this.isNegative ? -1 : 1; // If negative, large is smaller; if positive, large is larger
    }

    // Compare absolute values, then adjust by sign
    return compareAbsoluteValues(firstArr, secondArr) * (this.isNegative ? -1 : 1);
  };
  LargeInteger.prototype.compareTo = LargeInteger.prototype.compare; // Alias

  TinyInteger.prototype.compare = function (operandNum) {
    // Handle Infinity cases
    if (operandNum === Infinity) {
      return -1;
    }
    if (operandNum === -Infinity) {
      return 1;
    }

    let parsedOperand = coerceInputToNumber(operandNum),
      firstNativeVal = this.digitArray,
      secondVal = parsedOperand.digitArray;

    // If other operand is also small, use native comparison
    if (parsedOperand.isCompact) {
      return firstNativeVal === secondVal ? 0 : firstNativeVal > secondVal ? 1 : -1;
    }

    // If signs are different, one is positive and other negative
    if (firstNativeVal < 0 !== parsedOperand.isNegative) {
      return firstNativeVal < 0 ? -1 : 1; // If this is negative, it's smaller than positive large
    }
    // If signs are same, but one is small and other large, the large one is further from zero
    return firstNativeVal < 0 ? 1 : -1; // If both negative, small is larger (closer to zero); if both positive, small is smaller
  };
  TinyInteger.prototype.compareTo = TinyInteger.prototype.compare; // Alias

  // Equality and Inequality methods
  LargeInteger.prototype.equals = function (operandNum) {
    return this.compare(operandNum) === 0;
  };
  TinyInteger.prototype.eq = TinyInteger.prototype.equals = LargeInteger.prototype.eq = LargeInteger.prototype.equals;

  LargeInteger.prototype.notEquals = function (operandNum) {
    return this.compare(operandNum) !== 0;
  };
  TinyInteger.prototype.neq = TinyInteger.prototype.notEquals = LargeInteger.prototype.neq = LargeInteger.prototype.notEquals;

  // Comparison operators (greater, lesser, etc.)
  LargeInteger.prototype.greater = function (operandNum) {
    return this.compare(operandNum) > 0;
  };
  TinyInteger.prototype.gt = TinyInteger.prototype.greater = LargeInteger.prototype.gt = LargeInteger.prototype.greater;

  LargeInteger.prototype.lesser = function (operandNum) {
    return this.compare(operandNum) < 0;
  };
  TinyInteger.prototype.lt = TinyInteger.prototype.lesser = LargeInteger.prototype.lt = LargeInteger.prototype.lesser;

  LargeInteger.prototype.greaterOrEquals = function (operandNum) {
    return this.compare(operandNum) >= 0;
  };
  TinyInteger.prototype.geq = TinyInteger.prototype.greaterOrEquals = LargeInteger.prototype.geq = LargeInteger.prototype.greaterOrEquals;

  LargeInteger.prototype.lesserOrEquals = function (operandNum) {
    return this.compare(operandNum) <= 0;
  };
  TinyInteger.prototype.leq = TinyInteger.prototype.lesserOrEquals = LargeInteger.prototype.leq = LargeInteger.prototype.lesserOrEquals;

  // Parity checks
  LargeInteger.prototype.isEven = function () {
    return (this.digitArray[0] & 1) === 0;
  };
  TinyInteger.prototype.isEven = function () {
    return (this.digitArray & 1) === 0;
  };

  LargeInteger.prototype.isOdd = function () {
    return (this.digitArray[0] & 1) === 1;
  };
  TinyInteger.prototype.isOdd = function () {
    return (this.digitArray & 1) === 1;
  };

  // Sign checks
  LargeInteger.prototype.isPositive = function () {
    return !this.isNegative;
  };
  TinyInteger.prototype.isPositive = function () {
    return this.digitArray > 0;
  };

  LargeInteger.prototype.isNegative = function () {
    return this.isNegative;
  };
  TinyInteger.prototype.isNegative = function () {
    return this.digitArray < 0;
  };

  // Special value checks
  LargeInteger.prototype.isUnit = function () {
    return false; // A large integer cannot be a unit (1 or -1) in terms of array representation without checking value
  };
  TinyInteger.prototype.isUnit = function () {
    return Math.abs(this.digitArray) === 1;
  };

  LargeInteger.prototype.isZero = function () {
    return false; // A large integer is never zero by its nature (an array of digits)
  };
  TinyInteger.prototype.isZero = function () {
    return this.digitArray === 0;
  };

  // Divisibility check
  LargeInteger.prototype.isDivisibleBy = function (operandNum) {
    let parsedOperand = coerceInputToNumber(operandNum);
    let divisorVal = parsedOperand.digitArray;

    // Handle special divisor cases
    if (divisorVal === 0) return false;
    if (divisorVal === 1) return true;
    if (divisorVal === 2) return this.isEven();

    return this.mod(parsedOperand).equals(WholeNumber[0]);
  };
  TinyInteger.prototype.isDivisibleBy = LargeInteger.prototype.isDivisibleBy;

  /**
   * Checks if a WholeNumber is a prime number for small values.
   * @param {WholeNumber} numVal - The number to check.
   * @returns {boolean|undefined} True/False if checked, undefined if too large for basic check.
   */
  function isSmallPrime(numVal) {
    let absoluteNum = numVal.abs();
    if (absoluteNum.isUnit()) return false; // 1 and -1 are not prime
    if (absoluteNum.equals(2) || absoluteNum.equals(3) || absoluteNum.equals(5)) return true;
    if (absoluteNum.isEven() || absoluteNum.isDivisibleBy(3) || absoluteNum.isDivisibleBy(5)) return false;
    if (absoluteNum.lesser(25)) return true; // Primes below 25 that pass above checks: 7, 11, 13, 17, 19, 23
  }

  // Primality tests
  LargeInteger.prototype.isPrime = function () {
    let primeCheckResult = isSmallPrime(this);
    if (primeCheckResult !== undefined) {
      return primeCheckResult;
    }

    // Miller-Rabin primality test for larger numbers
    let currentNum = this.abs(),
      numPrevious = currentNum.prev(); // n-1
    let witnesses = [2, 3, 5, 7, 11, 13, 17, 19],
      tempNum = numPrevious,
      divisorCandidate,
      testFlag,
      idx,
      testResult;

    // Find d such that n-1 = d * 2^s (where d is odd)
    while (tempNum.isEven()) {
      tempNum = tempNum.divide(2);
    }

    // Perform Miller-Rabin test for each witness
    for (idx = 0; idx < witnesses.length; idx++) {
      testResult = largeNum(witnesses[idx]).modPow(tempNum, currentNum);
      if (testResult.equals(WholeNumber[1]) || testResult.equals(numPrevious)) {
        continue; // Passes this witness test
      }

      // Check powers of 2 up to n-1
      testFlag = true;
      for (divisorCandidate = tempNum; testFlag && divisorCandidate.lesser(numPrevious); divisorCandidate = divisorCandidate.multiply(2)) {
        testResult = testResult.square().mod(currentNum);
        if (testResult.equals(numPrevious)) {
          testFlag = false; // Passes this round
        }
      }
      if (testFlag) return false; // Failed Miller-Rabin test
    }
    return true; // Likely prime
  };
  TinyInteger.prototype.isPrime = LargeInteger.prototype.isPrime;

  LargeInteger.prototype.isProbablePrime = function (iterations) {
    let primeCheckResult = isSmallPrime(this);
    if (primeCheckResult !== undefined) {
      return primeCheckResult;
    }

    let currentNum = this.abs();
    let testCount = iterations === undefined ? 5 : iterations; // Number of Miller-Rabin iterations

    for (let idx = 0; idx < testCount; idx++) {
      let randomWitness = largeNum.randBetween(2, currentNum.minus(2));
      if (!randomWitness.modPow(currentNum.prev(), currentNum).isUnit()) {
        return false; // Failed Miller-Rabin test
      }
    }
    return true; // Probable prime
  };
  TinyInteger.prototype.isProbablePrime = LargeInteger.prototype.isProbablePrime;

  LargeInteger.prototype.modInv = function (moduloNum) {
    let tCurrent = largeNum.zero,
      tNext = largeNum.one,
      rCurrent = coerceInputToNumber(moduloNum),
      rNext = this.abs(),
      quotientInv,
      tPrev,
      rPrev;

    // Extended Euclidean algorithm to find modular inverse
    while (!rNext.equals(largeNum.zero)) {
      quotientInv = rCurrent.divide(rNext);
      tPrev = tCurrent;
      rPrev = rCurrent;
      tCurrent = tNext;
      rCurrent = rNext;
      tNext = tPrev.subtract(quotientInv.multiply(tNext));
      rNext = rPrev.subtract(quotientInv.multiply(rNext));
    }

    // If rCurrent is not 1, no modular inverse exists
    if (!rCurrent.equals(1)) {
      throw new Error(this.toString() + " and " + moduloNum.toString() + " are not co-prime");
    }

    // Ensure result is positive
    if (tCurrent.compare(0) === -1) {
      tCurrent = tCurrent.add(moduloNum);
    }

    // Adjust sign if original number was negative
    if (this.isNegative()) {
      return tCurrent.negate();
    }
    return tCurrent;
  };
  TinyInteger.prototype.modInv = LargeInteger.prototype.modInv;

  // Increment and Decrement methods
  LargeInteger.prototype.next = function () {
    let currentVal = this.digitArray;
    if (this.isNegative) {
      // For negative numbers, next is subtracting 1 from abs value
      return subtractSmallValue(currentVal, 1, this.isNegative);
    }
    return new LargeInteger(addSmallValue(currentVal, 1), this.isNegative);
  };
  TinyInteger.prototype.next = function () {
    let currentVal = this.digitArray;
    if (currentVal + 1 < MAX_JS_NUM) {
      return new TinyInteger(currentVal + 1);
    }
    // If it overflows native, return LargeInteger
    return new LargeInteger(MAX_JS_NUM_ARRAY, false);
  };

  LargeInteger.prototype.prev = function () {
    let currentVal = this.digitArray;
    if (this.isNegative) {
      // For negative numbers, prev is adding 1 to abs value and keeping negative sign
      return new LargeInteger(addSmallValue(currentVal, 1), true);
    }
    return subtractSmallValue(currentVal, 1, this.isNegative);
  };
  TinyInteger.prototype.prev = function () {
    let currentVal = this.digitArray;
    if (currentVal - 1 > -MAX_JS_NUM) {
      return new TinyInteger(currentVal - 1);
    }
    // If it underflows native, return LargeInteger
    return new LargeInteger(MAX_JS_NUM_ARRAY, true);
  };

  // Precompute powers of two for efficient bit shifting
  const powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= CHUNK_SIZE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  const powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  /**
   * Checks if a shift amount is small enough to be handled directly or as a single chunk.
   * @param {any} shiftMagnitude - The amount to shift.
   * @returns {boolean} True if the shift amount is compact.
   */
  function isShiftAmountNative(shiftMagnitude) {
    return (
      (typeof shiftMagnitude === "number" || typeof shiftMagnitude === "string") &&
      +Math.abs(shiftMagnitude) <= CHUNK_SIZE ||
      (shiftMagnitude instanceof LargeInteger && shiftMagnitude.digitArray.length <= 1)
    );
  }

  // Bit shift methods
  LargeInteger.prototype.shiftLeft = function (shiftMagnitude) {
    if (!isShiftAmountNative(shiftMagnitude)) {
      throw new Error(String(shiftMagnitude) + " is too large for shifting.");
    }
    let moveCount = +shiftMagnitude;
    if (moveCount < 0) return this.shiftRight(-moveCount); // Handle negative shift as right shift

    let currentResult = this;
    if (currentResult.isZero()) return currentResult;

    // Perform shifts in chunks using precomputed powers of two
    while (moveCount >= powers2Length) {
      currentResult = currentResult.multiply(highestPower2);
      moveCount -= powers2Length - 1; // Adjust count for chunk shift
    }
    return currentResult.multiply(powersOfTwo[moveCount]);
  };
  TinyInteger.prototype.shiftLeft = LargeInteger.prototype.shiftLeft;

  LargeInteger.prototype.shiftRight = function (shiftMagnitude) {
    let remQuo;
    if (!isShiftAmountNative(shiftMagnitude)) {
      throw new Error(String(shiftMagnitude) + " is too large for shifting.");
    }
    let moveCount = +shiftMagnitude;
    if (moveCount < 0) return this.shiftLeft(-moveCount); // Handle negative shift as left shift

    let currentResult = this;

    // Perform shifts in chunks using precomputed powers of two
    while (moveCount >= powers2Length) {
      if (currentResult.isZero() || (currentResult.isNegative() && currentResult.isUnit())) {
        return currentResult; // Shifting 0 or -1 right yields itself
      }
      remQuo = flexibleDivRem(currentResult, highestPower2);
      currentResult = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Adjust for negative remainder
      moveCount -= powers2Length - 1; // Adjust count for chunk shift
    }
    remQuo = flexibleDivRem(currentResult, powersOfTwo[moveCount]);
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Adjust for negative remainder
  };
  TinyInteger.prototype.shiftRight = LargeInteger.prototype.shiftRight;

  /**
   * Performs a bitwise operation on two WholeNumbers.
   * @param {WholeNumber} firstOperand - The first operand.
   * @param {any} secondOperand - The second operand.
   * @param {function(number, number): number} bitwiseFn - The bitwise function to apply (e.g., `&`, `|`, `^`).
   * @returns {WholeNumber} The result of the bitwise operation.
   */
  function performBitwiseOp(firstOperand, secondOperand, bitwiseFn) {
    secondOperand = coerceInputToNumber(secondOperand);

    // Get sign and absolute values for iteration
    let firstPolarity = firstOperand.isNegative(),
      secondPolarity = secondOperand.isNegative();
    let firstRemaining = firstPolarity ? firstOperand.not() : firstOperand,
      secondRemaining = secondPolarity ? secondOperand.not() : secondOperand;

    let firstDigitChunk = 0,
      secondDigitChunk = 0;
    let firstDivMod = null,
      secondDivMod = null;
    let resultChunks = [];

    // Process chunks from least significant to most significant
    while (!firstRemaining.isZero() || !secondRemaining.isZero()) {
      firstDivMod = flexibleDivRem(firstRemaining, highestPower2);
      firstDigitChunk = firstDivMod[1].toJSNumber();
      if (firstPolarity) {
        firstDigitChunk = highestPower2 - 1 - firstDigitChunk; // Invert bits for negative numbers
      }

      secondDivMod = flexibleDivRem(secondRemaining, highestPower2);
      secondDigitChunk = secondDivMod[1].toJSNumber();
      if (secondPolarity) {
        secondDigitChunk = highestPower2 - 1 - secondDigitChunk; // Invert bits for negative numbers
      }

      firstRemaining = firstDivMod[0];
      secondRemaining = secondDivMod[0];
      resultChunks.push(bitwiseFn(firstDigitChunk, secondDigitChunk));
    }

    // Determine final sign and apply to accumulated chunks
    let finalSum =
      bitwiseFn(firstPolarity ? 1 : 0, secondPolarity ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);

    // Reconstruct the number from result chunks
    for (let idx = resultChunks.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.multiply(highestPower2).add(largeNum(resultChunks[idx]));
    }
    return finalSum;
  }

  // Bitwise NOT
  LargeInteger.prototype.not = function () {
    return this.negate().prev();
  };
  TinyInteger.prototype.not = LargeInteger.prototype.not;

  // Bitwise AND
  LargeInteger.prototype.and = function (operandNum) {
    return performBitwiseOp(this, operandNum, function (a, b) {
      return a & b;
    });
  };
  TinyInteger.prototype.and = LargeInteger.prototype.and;

  // Bitwise OR
  LargeInteger.prototype.or = function (operandNum) {
    return performBitwiseOp(this, operandNum, function (a, b) {
      return a | b;
    });
  };
  TinyInteger.prototype.or = LargeInteger.prototype.or;

  // Bitwise XOR
  LargeInteger.prototype.xor = function (operandNum) {
    return performBitwiseOp(this, operandNum, function (a, b) {
      return a ^ b;
    });
  };
  TinyInteger.prototype.xor = LargeInteger.prototype.xor;

  // Constants for rough lowest bit (LSB) calculation
  const LOWEST_BIT_MASK_NATIVE = 1 << 30;
  const LOWEST_BIT_MASK_LARGE_INT = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOWEST_BIT_MASK_NATIVE;

  /**
   * Provides a rough estimate of the lowest set bit (LSB) value.
   * Used in GCD calculation for optimization.
   * @param {WholeNumber} numVal - The number to analyze.
   * @returns {number} A rough LSB value.
   */
  function approximateLowestBit(numVal) {
    let digitArr = numVal.digitArray;
    let bitX = typeof digitArr === "number" ? digitArr | LOWEST_BIT_MASK_NATIVE : digitArr[0] + digitArr[1] * CHUNK_SIZE | LOWEST_BIT_MASK_LARGE_INT;
    return bitX & -bitX; // Returns the value of the LSB (e.g., 1, 2, 4, 8...)
  }

  /**
   * Calculates the integer logarithm of a value with a given base.
   * @param {WholeNumber} valueNum - The number for which to calculate the logarithm.
   * @param {WholeNumber} baseNum - The base of the logarithm.
   * @returns {{prodTerm: WholeNumber, exponentTerm: number}} An object containing the product term and exponent.
   */
  function calculateIntegerLog(valueNum, baseNum) {
    if (baseNum.compareTo(valueNum) <= 0) {
      let tempLog = calculateIntegerLog(valueNum, baseNum.square(baseNum)); // Recursive call with squared base
      let prodTerm = tempLog.prodTerm;
      let exponentTerm = tempLog.exponentTerm;
      let multipliedBase = prodTerm.multiply(baseNum);
      // Check if another base factor can be included
      return multipliedBase.compareTo(valueNum) <= 0 ?
        {
          prodTerm: multipliedBase,
          exponentTerm: exponentTerm * 2 + 1,
        } :
        {
          prodTerm: prodTerm,
          exponentTerm: exponentTerm * 2,
        };
    }
    return {
      prodTerm: largeNum(1),
      exponentTerm: 0,
    };
  }

  // Bit length calculation
  LargeInteger.prototype.bitLength = function () {
    let currentNum = this;
    if (currentNum.compareTo(largeNum(0)) < 0) {
      currentNum = currentNum.negate().subtract(largeNum(1)); // For negative numbers, bit length of -(N+1)
    }
    if (currentNum.compareTo(largeNum(0)) === 0) {
      return largeNum(0);
    }
    // Calculate using integer logarithm base 2
    return largeNum(calculateIntegerLog(currentNum, largeNum(2)).exponentTerm).add(largeNum(1));
  };
  TinyInteger.prototype.bitLength = LargeInteger.prototype.bitLength;

  /**
   * Returns the maximum of two WholeNumber values.
   * @param {any} val1 - The first value.
   * @param {any} val2 - The second value.
   * @returns {WholeNumber} The larger of the two values.
   */
  function max(val1, val2) {
    val1 = coerceInputToNumber(val1);
    val2 = coerceInputToNumber(val2);
    return val1.greater(val2) ? val1 : val2;
  }

  /**
   * Returns the minimum of two WholeNumber values.
   * @param {any} val1 - The first value.
   * @param {any} val2 - The second value.
   * @returns {WholeNumber} The smaller of the two values.
   */
  function min(val1, val2) {
    val1 = coerceInputToNumber(val1);
    val2 = coerceInputToNumber(val2);
    return val1.lesser(val2) ? val1 : val2;
  }

  /**
   * Calculates the greatest common divisor (GCD) of two WholeNumbers using binary GCD algorithm.
   * @param {any} val1 - The first value.
   * @param {any} val2 - The second value.
   * @returns {WholeNumber} The GCD.
   */
  function gcd(val1, val2) {
    val1 = coerceInputToNumber(val1).abs();
    val2 = coerceInputToNumber(val2).abs();

    if (val1.equals(val2)) return val1;
    if (val1.isZero()) return val2;
    if (val2.isZero()) return val1;

    let commonFactor = WholeNumber[1],
      lowestBitVal,
      tempSwap;

    // Remove common factors of 2
    while (val1.isEven() && val2.isEven()) {
      lowestBitVal = Math.min(approximateLowestBit(val1), approximateLowestBit(val2));
      val1 = val1.divide(lowestBitVal);
      val2 = val2.divide(lowestBitVal);
      commonFactor = commonFactor.multiply(lowestBitVal);
    }

    // Remove factors of 2 from remaining numbers
    while (val1.isEven()) {
      val1 = val1.divide(approximateLowestBit(val1));
    }

    // Binary GCD algorithm (Knuth's algorithm B)
    do {
      while (val2.isEven()) {
        val2 = val2.divide(approximateLowestBit(val2));
      }
      if (val1.greater(val2)) {
        tempSwap = val2;
        val2 = val1;
        val1 = tempSwap;
      }
      val2 = val2.subtract(val1);
    } while (!val2.isZero());

    return commonFactor.isUnit() ? val1 : val1.multiply(commonFactor);
  }

  /**
   * Calculates the least common multiple (LCM) of two WholeNumbers.
   * @param {any} val1 - The first value.
   * @param {any} val2 - The second value.
   * @returns {WholeNumber} The LCM.
   */
  function lcm(val1, val2) {
    val1 = coerceInputToNumber(val1).abs();
    val2 = coerceInputToNumber(val2).abs();
    return val1.divide(gcd(val1, val2)).multiply(val2);
  }

  /**
   * Generates a random WholeNumber between two specified bounds (inclusive).
   * @param {any} lowerBound - The lower bound.
   * @param {any} upperBound - The upper bound.
   * @returns {WholeNumber} A random WholeNumber within the range.
   */
  function randBetween(lowerBound, upperBound) {
    lowerBound = coerceInputToNumber(lowerBound);
    upperBound = coerceInputToNumber(upperBound);

    let low = min(lowerBound, upperBound),
      high = max(lowerBound, upperBound);
    let valueRange = high.subtract(low).add(1);

    // If range is small, use native Math.random
    if (valueRange.isCompact) {
      return low.add(Math.floor(Math.random() * valueRange.digitArray));
    }

    let arrLength = valueRange.digitArray.length - 1;
    let resultChunks = [],
      isRestricted = true;

    // Generate random chunks, ensuring the number stays within range
    for (let idx = arrLength; idx >= 0; idx--) {
      let topLimit = isRestricted ? valueRange.digitArray[idx] : CHUNK_SIZE;
      let currentDigit = chopDecimal(Math.random() * topLimit);
      resultChunks.unshift(currentDigit);
      if (currentDigit < topLimit) {
        isRestricted = false; // Once a digit is less than its limit, subsequent digits can be anything up to CHUNK_SIZE-1
      }
    }

    let finalResult = digitArrayToNative(resultChunks);
    return low.add(
      typeof finalResult === "number" ? new TinyInteger(finalResult) : new LargeInteger(finalResult, false)
    );
  }

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} textVal - The string to parse.
   * @param {number} numBase - The base of the number (2 to 36).
   * @returns {WholeNumber} The parsed number.
   * @throws {Error} If the string contains invalid digits for the base.
   */
  const parseStringWithBase = function (textVal, numBase) {
    let strLength = textVal.length;
    let idx;
    let absoluteBase = Math.abs(numBase);

    // Validate characters for the given base
    for (idx = 0; idx < strLength; idx++) {
      let currentChart = textVal[idx].toLowerCase();
      if (currentChart === "-") continue; // Skip negative sign
      if (/[a-z0-9]/.test(currentChart)) {
        if (/[0-9]/.test(currentChart) && +currentChart >= absoluteBase) {
          if (currentChart === "1" && absoluteBase === 1) continue; // Special case for base 1
          throw new Error(currentChart + " is not a valid digit in base " + numBase + ".");
        } else if (currentChart.charCodeAt(0) - 87 >= absoluteBase) {
          // 'a' is 97, so 'a'-87 = 10, 'b'-87 = 11, etc.
          throw new Error(currentChart + " is not a valid digit in base " + numBase + ".");
        }
      }
    }

    // Optimization for small bases and numbers that fit native integers
    if (2 <= numBase && numBase <= 36) {
      if (strLength <= LOG_JS_LIMIT / Math.log(numBase)) {
        let result = parseInt(textVal, numBase);
        if (isNaN(result)) {
          throw new Error(textVal + " cannot be parsed as a number in base " + numBase + ".");
        }
        return new TinyInteger(parseInt(textVal, numBase));
      }
    }

    numBase = coerceInputToNumber(numBase); // Convert base to WholeNumber
    let digitList = [];
    let isNegative = textVal[0] === "-";

    // Extract digits and convert to WholeNumber instances
    for (idx = isNegative ? 1 : 0; idx < textVal.length; idx++) {
      let currentChart = textVal[idx].toLowerCase(),
        charAscii = currentChart.charCodeAt(0);
      if (48 <= charAscii && charAscii <= 57) {
        digitList.push(coerceInputToNumber(currentChart)); // 0-9
      } else if (97 <= charAscii && charAscii <= 122) {
        digitList.push(coerceInputToNumber(currentChart.charCodeAt(0) - 87)); // a-z (10-35)
      } else if (currentChart === "<") {
        // Handle custom digits like <123>
        let startIndex = idx;
        do {
          idx++;
        } while (textVal[idx] !== ">");
        digitList.push(coerceInputToNumber(textVal.slice(startIndex + 1, idx)));
      } else {
        throw new Error(currentChart + " is not a valid character");
      }
    }
    return parseDigitsWithBase(digitList, numBase, isNegative);
  };

  /**
   * Parses an array of WholeNumber digits in a given base.
   * @param {WholeNumber[]} digitList - An array of WholeNumber digits.
   * @param {WholeNumber} numBase - The base of the number.
   * @param {boolean} isNegative - True if the number is negative.
   * @returns {WholeNumber} The parsed number.
   */
  function parseDigitsWithBase(digitList, numBase, isNegative) {
    let calculatedVal = WholeNumber[0],
      powerTerm = WholeNumber[1],
      idx;

    // Horner's method (or polynomial evaluation)
    for (idx = digitList.length - 1; idx >= 0; idx--) {
      calculatedVal = calculatedVal.add(digitList[idx].times(powerTerm));
      powerTerm = powerTerm.times(numBase);
    }
    return isNegative ? calculatedVal.negate() : calculatedVal;
  }

  /**
   * Converts a single digit (0-35 or custom) to its string representation.
   * @param {number} digitVal - The digit to convert.
   * @returns {string} The string representation of the digit.
   */
  function digitToStringRep(digitVal) {
    if (digitVal <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitVal);
    }
    return "<" + digitVal + ">"; // For custom digits
  }

  /**
   * Converts a WholeNumber to an array of digits in a specified base.
   * @param {WholeNumber} numVal - The number to convert.
   * @param {WholeNumber} numBase - The target base.
   * @returns {{value: number[], isNegative: boolean}} An object containing the digit array and sign.
   * @throws {Error} For invalid base conversions.
   */
  function convertToBaseArray(numVal, numBase) {
    numBase = largeNum(numBase); // Ensure base is a WholeNumber

    // Handle special base cases
    if (numBase.isZero()) {
      if (numVal.isZero()) return {
        value: [0],
        isNegative: false,
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (numBase.equals(-1)) {
      if (numVal.isZero()) return {
        value: [0],
        isNegative: false,
      };
      if (numVal.isNegative()) {
        // Example: -5 in base -1 is [1,0,1,0,1,0]
        return {
          value: [].concat.apply([], Array.apply(null, Array(-numVal)).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false,
        };
      }
      // Example: 5 in base -1 is [1,0,1,0,1]
      let digitPattern = Array.apply(null, Array(+numVal - 1)).map(Array.prototype.valueOf, [0, 1]);
      digitPattern.unshift([1]);
      return {
        value: [].concat.apply([], digitPattern),
        isNegative: false,
      };
    }

    let isResultNegative = false;
    if (numVal.isNegative() && numBase.isPositive()) {
      isResultNegative = true;
      numVal = numVal.abs(); // Work with absolute value for conversion
    }

    if (numBase.equals(1)) {
      if (numVal.isZero()) return {
        value: [0],
        isNegative: false,
      };
      // Base 1 means N ones (e.g., 5 in base 1 is [1,1,1,1,1])
      return {
        value: Array.apply(null, Array(+numVal)).map(Number.prototype.valueOf, 1),
        isNegative: isResultNegative,
      };
    }

    let outputDigits = [];
    let remainingVal = numVal,
      divisionResult;

    // Repeatedly divide by base and collect remainders
    while (remainingVal.isNegative() || remainingVal.compareAbs(numBase) >= 0) {
      divisionResult = remainingVal.divmod(numBase);
      remainingVal = divisionResult.quotient;
      let currentDigit = divisionResult.remainder;

      // Handle negative remainders for non-standard bases
      if (currentDigit.isNegative()) {
        currentDigit = numBase.minus(currentDigit).abs();
        remainingVal = remainingVal.next(); // Adjust quotient for negative remainder
      }
      outputDigits.push(currentDigit.toJSNumber());
    }
    outputDigits.push(remainingVal.toJSNumber()); // Add the last quotient
    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative,
    };
  }

  /**
   * Converts a WholeNumber to its string representation in a specified base.
   * @param {WholeNumber} numVal - The number to convert.
   * @param {any} numBase - The target base.
   * @returns {string} The string representation.
   */
  function convertToBaseString(numVal, numBase) {
    let resultStruct = convertToBaseArray(numVal, numBase);
    return (resultStruct.isNegative ? "-" : "") + resultStruct.value.map(digitToStringRep).join("");
  }

  // Conversion to array representation in a base
  LargeInteger.prototype.toArray = function (radixVal) {
    return convertToBaseArray(this, radixVal);
  };
  TinyInteger.prototype.toArray = function (radixVal) {
    return convertToBaseArray(this, radixVal);
  };

  // String conversion methods
  LargeInteger.prototype.toString = function (radixVal) {
    if (radixVal === undefined) radixVal = 10;
    if (radixVal !== 10) return convertToBaseString(this, radixVal);

    let digitArr = this.digitArray,
      arrLength = digitArr.length,
      outputString = String(digitArr[--arrLength]), // Start with most significant chunk
      paddingZeros = "0000000", // For padding chunks to CHUNK_LOG digits
      currentDigit;

    // Concatenate chunks, padding with zeros as needed
    while (--arrLength >= 0) {
      currentDigit = String(digitArr[arrLength]);
      outputString += paddingZeros.slice(currentDigit.length) + currentDigit;
    }
    let signPrefix = this.isNegative ? "-" : "";
    return signPrefix + outputString;
  };
  TinyInteger.prototype.toString = function (radixVal) {
    if (radixVal === undefined) radixVal = 10;
    if (radixVal != 10) return convertToBaseString(this, radixVal);
    return String(this.digitArray);
  };

  // JSON serialization
  LargeInteger.prototype.toJSON = TinyInteger.prototype.toJSON = function () {
    return this.toString();
  };

  // ValueOf and JSNumber conversion
  LargeInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };
  LargeInteger.prototype.toJSNumber = LargeInteger.prototype.valueOf;

  TinyInteger.prototype.valueOf = function () {
    return this.digitArray;
  };
  TinyInteger.prototype.toJSNumber = TinyInteger.prototype.valueOf;

  /**
   * Parses a string into a WholeNumber. Handles scientific notation and decimal points.
   * @param {string} textVal - The string to parse.
   * @returns {WholeNumber} The parsed number.
   * @throws {Error} For invalid integer formats.
   */
  function parseTextValue(textVal) {
    // If it fits a native integer, parse directly as TinyInteger
    if (isWithinNativeRange(+textVal)) {
      let nativeX = +textVal;
      if (nativeX === chopDecimal(nativeX)) return new TinyInteger(nativeX);
      throw new Error("Invalid integer: " + textVal);
    }

    let isNegative = textVal[0] === "-";
    if (isNegative) textVal = textVal.slice(1); // Remove sign for parsing

    let parts = textVal.split(/e/i); // Split by 'e' for scientific notation
    if (parts.length > 2) {
      throw new Error("Invalid integer: " + parts.join("e"));
    }

    // Handle scientific notation
    if (parts.length === 2) {
      let exponentPart = parts[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;

      // Validate exponent
      if (exponentPart !== chopDecimal(exponentPart) || !isWithinNativeRange(exponentPart)) {
        throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
      }

      let mantissaText = parts[0];
      let dotPosition = mantissaText.indexOf(".");
      if (dotPosition >= 0) {
        exponentPart -= mantissaText.length - dotPosition - 1; // Adjust exponent for decimal places
        mantissaText = mantissaText.slice(0, dotPosition) + mantissaText.slice(dotPosition + 1); // Remove decimal
      }

      if (exponentPart < 0) {
        throw new Error("Cannot include negative exponent part for integers");
      }
      mantissaText += new Array(exponentPart + 1).join("0"); // Pad with zeros
      textVal = mantissaText;
    }

    // Validate the final string format (only digits)
    let stringIsValid = /^([0-9][0-9]*)$/.test(textVal);
    if (!stringIsValid) {
      throw new Error("Invalid integer: " + textVal);
    }

    let resultChunks = [],
      maxLength = textVal.length,
      chunkSize = CHUNK_LOG,
      minLength = maxLength - chunkSize;

    // Split string into chunks from right to left
    while (maxLength > 0) {
      resultChunks.push(+textVal.slice(minLength, maxLength));
      minLength -= chunkSize;
      if (minLength < 0) minLength = 0;
      maxLength -= chunkSize;
    }
    removeLeadingZeros(resultChunks); // Clean up result
    return new LargeInteger(resultChunks, isNegative);
  }

  /**
   * Parses a native JavaScript number into a WholeNumber.
   * @param {number} nativeVal - The native number to parse.
   * @returns {WholeNumber} The parsed number.
   * @throws {Error} If the number is not an integer.
   */
  function parsePrimitiveNumber(nativeVal) {
    if (isWithinNativeRange(nativeVal)) {
      if (nativeVal !== chopDecimal(nativeVal)) {
        throw new Error(nativeVal + " is not an integer.");
      }
      return new TinyInteger(nativeVal);
    }
    // If too large for native, convert to string and parse
    return parseTextValue(nativeVal.toString());
  }

  /**
   * Coerces various input types into a WholeNumber instance.
   * @param {any} inputVal - The value to coerce.
   * @returns {WholeNumber} A WholeNumber instance.
   */
  function coerceInputToNumber(inputVal) {
    if (typeof inputVal === "number") {
      return parsePrimitiveNumber(inputVal);
    }
    if (typeof inputVal === "string") {
      return parseTextValue(inputVal);
    }
    return inputVal; // Assume it's already a WholeNumber instance
  }

  // Pre-populate cache for small integers (0-999)
  for (let idx = 0; idx < 1e3; idx++) {
    WholeNumber[idx] = new TinyInteger(idx);
    if (idx > 0) WholeNumber[-idx] = new TinyInteger(-idx);
  }

  // Add common constants and utility methods to the WholeNumber namespace
  WholeNumber.one = WholeNumber[1];
  WholeNumber.zero = WholeNumber[0];
  WholeNumber.minusOne = WholeNumber[-1];
  WholeNumber.max = max;
  WholeNumber.min = min;
  WholeNumber.gcd = gcd;
  WholeNumber.lcm = lcm;
  WholeNumber.isInstance = function (candidate) {
    return candidate instanceof LargeInteger || candidate instanceof TinyInteger;
  };
  WholeNumber.randBetween = randBetween;
  WholeNumber.fromArray = function (digitList, numBase, isNegative) {
    return parseDigitsWithBase(
      digitList.map(coerceInputToNumber),
      coerceInputToNumber(numBase || 10),
      isNegative
    );
  };

  return WholeNumber; // Return the constructor function
}(); // End of largeNum (bigInt) module

// --- Start of INPUT_PARSER module clone ---
// This module provides utility functions for reading structured input from a string.
var INPUT_PARSER = (function () {
  /**
   * Factory function to create an input reader.
   * @param {string} inputString - The raw input string.
   * @returns {InputReader} A new InputReader instance.
   */
  function createReader(inputString) {
    return new InputReader(inputString);
  }

  /**
   * Class for reading structured input line by line or token by token.
   * @constructor
   * @param {string} rawInput - The raw input string, typically from stdin.
   */
  function InputReader(rawInput) {
    this._lines = rawInput.trim().split("\n"); // Split into lines and trim whitespace
    this._currentLineIndex = 0; // Track current line being read
  }

  /**
   * Reads a single token from the current line.
   * If the line is exhausted, moves to the next.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The parsed token.
   */
  InputReader.prototype.readToken = function (returnAsString) {
    let lineArray = this._lines,
      currentY = this._currentLineIndex,
      tokenResult;

    // If the current line hasn't been split into tokens yet, do it now (and reverse for pop)
    if (typeof lineArray[currentY] === "string") {
      lineArray[currentY] = lineArray[currentY].split(" ").reverse();
    }

    tokenResult = lineArray[currentY].pop(); // Get the last token

    // If the current line is now empty, advance to the next line
    if (!lineArray[currentY].length) {
      this._currentLineIndex++;
    }

    return returnAsString ? tokenResult : +tokenResult; // Return as string or number
  };

  /**
   * Reads an entire line as an array of tokens.
   * Advances to the next line.
   * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of tokens from the line.
   */
  InputReader.prototype.readLine = function (returnAsString) {
    let lineTokens = this._lines[this._currentLineIndex++].split(" "); // Split and advance line
    return returnAsString ? lineTokens : lineTokens.map((token) => +token); // Convert to numbers if needed
  };

  /**
   * Reads multiple lines as a matrix (2D array of tokens).
   * Advances by 'numLines' lines.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {string[][]|number[][]} A 2D array of tokens.
   */
  InputReader.prototype.readMatrix = function (numLines, returnAsString) {
    let matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((row) => row.split(" ")); // Slice lines and split each into tokens

    return returnAsString ?
      matrixRows :
      matrixRows.map((row) => row.map((token) => +token)); // Convert to numbers if needed
  };

  /**
   * Reads multiple lines as a 1D array of tokens.
   * Advances by 'numLines' lines.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {string[]|number[]} A 1D array of tokens.
   */
  InputReader.prototype.readLinesAsArray = function (numLines, returnAsString) {
    let lineResults = this._lines.slice(this._currentLineIndex, (this._currentLineIndex += numLines));
    return returnAsString ? lineResults : lineResults.map((line) => +line); // Convert to numbers if needed
  };

  return createReader; // Return the factory function
})(); // End of INPUT_PARSER (GET) module

// Initialize the input reader with data from stdin.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {any} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., d1, d2, d3).
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimArray(initialValue, ...dimensions) {
  let args = dimensions; // Dimensions passed as rest parameters
  let numDims = args.length;
  // Construct the array creation string recursively
  let arrayCreationString =
    "Array(args[" +
    --numDims +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";
  while (--numDims >= 0) {
    arrayCreationString =
      "Array(args[" + numDims + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString); // Use eval to dynamically create the array
}

var currentModulus; // Global variable for the current modulus
var hugeNumInstance = largeNum(); // Get a default instance of the large number library

/**
 * Performs modular multiplication of multiple arguments.
 * Assumes arguments are numbers that fit within JS safe integers, but intermediate products might exceed.
 * Uses a trick to split numbers into high/low parts to prevent overflow before modulo.
 * @param {...number} factors - Numbers to multiply. The first argument is the initial product.
 * @returns {number} The product modulo `currentModulus`.
 */
function componentProductMod(...factors) {
  let args = factors;
  let currentProduct = args[0];
  // Iterate through remaining factors
  for (let i = 1; i < args.length; ) {
    // Split currentProduct and factor into 16-bit chunks to prevent overflow during multiplication
    // (r >> 16) * args[i] * 65536 + (r & 65535) * args[i]
    currentProduct =
      ((currentProduct >> 16) * args[i] % currentModulus * 65536 +
        (currentProduct & 65535) * args[i++]) %
      currentModulus;
  }
  return currentProduct;
}

/**
 * Calculates (base^exponent) % modulus using binary exponentiation (exponentiation by squaring).
 * @param {number} baseVal - The base.
 * @param {number} exponentVal - The exponent.
 * @returns {number} (base^exponent) % currentModulus.
 */
function modularExponentiation(baseVal, exponentVal) {
  let result = 1;
  // Iterate while exponent is not zero
  for (; exponentVal; baseVal = componentProductMod(baseVal, baseVal), exponentVal >>= 1) {
    if (exponentVal & 1) {
      result = componentProductMod(baseVal, result); // If exponent is odd, multiply result by base
    }
  }
  return result;
}

// Output the result of the main logic function.
console.log(executeMainLogic());

/**
 * Main application logic for the problem.
 * Calculates a specific value based on input parameters.
 * @returns {number} The final calculated value.
 */
function executeMainLogic() {
  // Read input parameters
  let lengthParam = inputData.readToken(1); // L
  let startParam = inputData.readToken(1); // A
  let stepParam = inputData.readToken(1); // B

  // Convert parameters to LargeInteger instances
  let lenHuge = hugeNumInstance.add(lengthParam);
  let startHuge = hugeNumInstance.add(startParam);
  let stepHuge = hugeNumInstance.add(stepParam);

  // Read the modulus and convert other parameters to native numbers
  currentModulus = inputData.readToken();
  lengthParam = +lengthParam;
  startParam = +startParam;
  stepParam = +stepParam;

  // Initialize a 1D array for difference tracking, max 19 segments (based on 10^18)
  let diffTracker = initializeMultiDimArray(hugeNumInstance, 19);

  // Initialize the result matrix (ans)
  let finalResult = [
    [0, 0, +stepHuge.mod(currentModulus)]
  ]; // Initial state: [sum, count, current_val_mod_modulus]

  let currentSumHuge = hugeNumInstance; // Accumulator for length processed

  // Loop through powers of 10 (up to 10^18, max 18 iterations, plus one for 10^0)
  for (let idx = 1; idx < 19 && !currentSumHuge.minus(lenHuge).isZero(); idx++) {
    // Calculate 10^idx - 1
    let tempHuge = hugeNumInstance.add(10).pow(idx).minus(1);

    // Calculate d[idx] = (10^idx - 1 - A + B) / B - S
    // This represents the number of elements with 'idx' digits
    diffTracker[idx] = tempHuge.minus(startHuge).add(stepHuge).divide(stepHuge).minus(currentSumHuge);

    // If no elements, skip
    if (diffTracker[idx].isZero()) continue;

    // Cap diffTracker[idx] if it would exceed total lengthParam
    if (currentSumHuge.add(diffTracker[idx]).gt(lenHuge)) {
      diffTracker[idx] = lenHuge.minus(currentSumHuge);
    }

    // Define the transformation matrix for this segment
    // [10^i, 0, 0]
    // [1,    1, 0]
    // [0,    1, 1]
    let segmentMatrix = [
      [modularExponentiation(10, idx), 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ];

    // Raise the transformation matrix to the power of diffTracker[idx]
    let powerMatrix = matrixModularPower(segmentMatrix, diffTracker[idx]);

    // Update the second element of the result matrix (ans[0][1])
    // This seems to be `(B*S + A) % mod`
    finalResult[0][1] = +stepHuge.times(currentSumHuge).add(startHuge).mod(currentModulus);

    // Multiply the current result matrix by the powered transformation matrix
    finalResult = matrixModularMultiply(finalResult, powerMatrix);

    // Update the accumulated sum
    currentSumHuge = currentSumHuge.add(diffTracker[idx]);
  }

  return finalResult[0][0]; // Return the final computed value
}

/**
 * Calculates a matrix raised to a power, with all operations modulo `currentModulus`.
 * Uses binary exponentiation (exponentiation by squaring) for matrices.
 * @param {number[][]} baseMatrix - The base matrix.
 * @param {WholeNumber} exponentPower - The exponent as a WholeNumber.
 * @returns {number[][]} The resulting matrix.
 */
function matrixModularPower(baseMatrix, exponentPower) {
  let matrixDim = baseMatrix.length,
    identityMatrix = initializeMultiDimArray(0, matrixDim, matrixDim); // Result matrix, initialized as identity

  // Create an identity matrix
  for (let idx = 0; idx < matrixDim; idx++) {
    identityMatrix[idx][idx] = 1;
  }

  // Binary exponentiation loop
  while (!exponentPower.isZero()) {
    if (!exponentPower.and(1).isZero()) {
      // If exponent is odd, multiply result by base
      identityMatrix = matrixModularMultiply(identityMatrix, baseMatrix);
    }
    baseMatrix = matrixModularMultiply(baseMatrix, baseMatrix); // Square the base matrix
    exponentPower = exponentPower.divide(2); // Halve the exponent
  }
  return identityMatrix;
}

/**
 * Performs modular multiplication of two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The product matrix modulo `currentModulus`.
 */
function matrixModularMultiply(matrixA, matrixB) {
  let parsedMatrixA, parsedMatrixB;

  // Handle single-row/single-column inputs by wrapping them in arrays
  if (typeof matrixA[0] === "object") {
    parsedMatrixA = matrixA;
  } else {
    parsedMatrixA = [matrixA];
  }
  if (typeof matrixB[0] === "object") {
    parsedMatrixB = matrixB;
  } else {
    parsedMatrixB = [matrixB];
  }

  let matrixHeight = parsedMatrixA.length,
    matrixWidth = parsedMatrixB[0].length;
  let resultMatrix = initializeMultiDimArray(0, matrixHeight, matrixWidth); // Initialize result matrix with zeros

  // Standard matrix multiplication loop
  for (let rowIdx = 0; rowIdx < matrixHeight; rowIdx++) {
    for (let colIdx = 0; colIdx < matrixWidth; colIdx++) {
      for (let innerIdx = 0; innerIdx < matrixWidth; innerIdx++) {
        // Accumulate products modulo currentModulus
        resultMatrix[rowIdx][colIdx] += componentProductMod(
          parsedMatrixA[rowIdx][innerIdx],
          parsedMatrixB[innerIdx][colIdx]
        );
      }
      resultMatrix[rowIdx][colIdx] %= currentModulus; // Apply final modulus
    }
  }
  return resultMatrix;
}