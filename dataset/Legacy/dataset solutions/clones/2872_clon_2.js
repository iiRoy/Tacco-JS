// This module provides arbitrary-precision whole number arithmetic.
var largeNum = (function (voidVal) {
  "use strict mode"; // Enforce stricter parsing and error handling.

  // Core configuration for digit array representation.
  var CHUNK_SIZE = 10000000; // Each array element represents a chunk of this size (10^7).
  var CHUNK_DIGITS = 7; // Number of decimal digits in each chunk.
  var MAX_SAFE_JS_VAL = 9007199254740992; // Largest integer representable precisely in JavaScript.
  var MAX_JS_VAL_DIGITS = compactToDigits(MAX_SAFE_JS_VAL); // MAX_SAFE_JS_VAL split into chunks.
  var LOG_MAX_JS_VAL = Math.log(MAX_SAFE_JS_VAL); // Logarithm of MAX_SAFE_JS_VAL for base conversions.

  /**
   * Main constructor for the WholeNumber object.
   * Handles various input types and bases.
   * @param {number|string|WholeNumber} inputVal - The value to parse.
   * @param {number} baseVal - Optional base for string input.
   * @returns {WholeNumber} A WholeNumber instance.
   */
  function WholeNumber(inputVal, baseVal) {
    if (typeof inputVal === "undefined") {
      return WholeNumber[0]; // Return zero if no input is provided.
    }
    if (typeof baseVal !== "undefined") {
      // If a base is specified, handle it.
      return +baseVal === 10 ? interpretInput(inputVal) : interpretBaseString(inputVal, baseVal);
    }
    return interpretInput(inputVal); // Default to base 10 parsing.
  }

  /**
   * Represents a large whole number using an array of digits.
   * @param {number[]} magnitude - Array of number chunks.
   * @param {boolean} polarity - True if negative, false if positive/zero.
   */
  function LargeWholeNumber(magnitude, polarity) {
    this.magnitude = magnitude; // The array of number chunks.
    this.polarity = polarity; // True for negative, false for positive.
    this.isCompact = false; // Flag indicating it's not a small integer.
  }
  // Inherit prototype from WholeNumber.
  LargeWholeNumber.prototype = Object.create(WholeNumber.prototype);

  /**
   * Represents a small whole number that fits within standard JavaScript number limits.
   * @param {number} magnitude - The integer value.
   */
  function CompactWholeNumber(magnitude) {
    this.magnitude = magnitude; // The raw number value.
    this.polarity = magnitude < 0; // True if negative.
    this.isCompact = true; // Flag indicating it's a small integer.
  }
  // Inherit prototype from WholeNumber.
  CompactWholeNumber.prototype = Object.create(WholeNumber.prototype);

  /**
   * Checks if a number can be precisely represented by standard JavaScript numbers.
   * @param {number} n - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function isStandardSafe(n) {
    return -MAX_SAFE_JS_VAL < n && n < MAX_SAFE_JS_VAL;
  }

  /**
   * Converts a compact (small) number into its chunk array representation.
   * @param {number} n - The compact number.
   * @returns {number[]} Array of number chunks.
   */
  function compactToDigits(n) {
    // Splits a number into 10^7 chunks for internal representation.
    if (n < CHUNK_SIZE) return [n];
    if (n < 1e14) return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE)];
    return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(n / 1e14)];
  }

  /**
   * Converts a chunk array back into a compact (small) number if possible.
   * @param {number[]} arr - Array of number chunks.
   * @returns {number|number[]} The small number or the original array if too large.
   */
  function digitsToCompact(arr) {
    normalizeDigits(arr); // Remove leading zeros.
    var currentLength = arr.length;
    // Check if the number fits into a standard JS safe integer.
    if (currentLength < 4 && compareMagnitudes(arr, MAX_JS_VAL_DIGITS) < 0) {
      switch (currentLength) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * CHUNK_SIZE;
        default:
          return arr[0] + (arr[1] + arr[2] * CHUNK_SIZE) * CHUNK_SIZE;
      }
    }
    return arr; // Return array if it's too large for a compact number.
  }

  /**
   * Removes leading zero chunks from a digit array.
   * @param {number[]} digitArr - The array to trim.
   */
  function normalizeDigits(digitArr) {
    var lastIndex = digitArr.length;
    while (lastIndex > 0 && digitArr[--lastIndex] === 0); // Find the last non-zero digit.
    digitArr.length = lastIndex + 1; // Adjust array length.
  }

  /**
   * Creates a new array initialized with zeros.
   * @param {number} length - The desired length of the array.
   * @returns {number[]} A new array filled with zeros.
   */
  function makeZeroArray(length) {
    var newArr = new Array(length);
    var idx = -1;
    while (++idx < length) {
      newArr[idx] = 0;
    }
    return newArr;
  }

  /**
   * Truncates a number (removes decimal part).
   * @param {number} n - The number to truncate.
   * @returns {number} The truncated number.
   */
  function floorOrCeil(n) {
    if (n > 0) return Math.floor(n);
    return Math.ceil(n);
  }

  /**
   * Adds two digit arrays representing non-negative numbers.
   * @param {number[]} arrA - First digit array.
   * @param {number[]} arrB - Second digit array.
   * @returns {number[]} Resulting sum digit array.
   */
  function combineDigits(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      outputArr = new Array(lenA),
      overflow = 0,
      chunkBase = CHUNK_SIZE,
      currentSum,
      idx;
    for (idx = 0; idx < lenB; idx++) {
      currentSum = arrA[idx] + arrB[idx] + overflow;
      overflow = currentSum >= chunkBase ? 1 : 0;
      outputArr[idx] = currentSum - overflow * chunkBase;
    }
    while (idx < lenA) {
      currentSum = arrA[idx] + overflow;
      overflow = currentSum === chunkBase ? 1 : 0;
      outputArr[idx++] = currentSum - overflow * chunkBase;
    }
    if (overflow > 0) outputArr.push(overflow);
    return outputArr;
  }

  /**
   * Adds two digit arrays, ensuring the longer array is first for combineDigits.
   * @param {number[]} arrX - First digit array.
   * @param {number[]} arrY - Second digit array.
   * @returns {number[]} Resulting sum digit array.
   */
  function sumAnyOrder(arrX, arrY) {
    if (arrX.length >= arrY.length) return combineDigits(arrX, arrY);
    return combineDigits(arrY, arrX);
  }

  /**
   * Adds a small integer (carry) to a digit array.
   * Used for adding absolute value of a small number to a large number's magnitude.
   * @param {number[]} arrDigits - The digit array.
   * @param {number} overflowVal - The small integer to add.
   * @returns {number[]} Resulting sum digit array.
   */
  function sumCompactDigit(arrDigits, overflowVal) {
    var currentLen = arrDigits.length,
      outputArr = new Array(currentLen),
      chunkBase = CHUNK_SIZE,
      currentSum,
      idx;
    for (idx = 0; idx < currentLen; idx++) {
      currentSum = arrDigits[idx] - chunkBase + overflowVal;
      overflowVal = Math.floor(currentSum / chunkBase);
      outputArr[idx] = currentSum - overflowVal * chunkBase;
      overflowVal += 1; // Adjust overflow for next iteration.
    }
    while (overflowVal > 0) {
      outputArr[idx++] = overflowVal % chunkBase;
      overflowVal = Math.floor(overflowVal / chunkBase);
    }
    return outputArr;
  }

  // --- Addition operations ---

  LargeWholeNumber.prototype.add = function (inputVal) {
    var numOperand = interpretInput(inputVal);
    // If signs differ, convert to subtraction.
    if (this.polarity !== numOperand.polarity) {
      return this.subtract(numOperand.invertPolarity());
    }
    var currentMagnitude = this.magnitude,
      operandMagnitude = numOperand.magnitude;
    if (numOperand.isCompact) {
      // If adding a compact number, use optimized small addition.
      return new LargeWholeNumber(sumCompactDigit(currentMagnitude, Math.abs(operandMagnitude)), this.polarity);
    }
    return new LargeWholeNumber(sumAnyOrder(currentMagnitude, operandMagnitude), this.polarity);
  };
  LargeWholeNumber.prototype.plus = LargeWholeNumber.prototype.add; // Alias for add.

  CompactWholeNumber.prototype.add = function (inputVal) {
    var numOperand = interpretInput(inputVal);
    var currentVal = this.magnitude;
    // If signs differ, convert to subtraction.
    if (currentVal < 0 !== numOperand.polarity) {
      return this.subtract(numOperand.invertPolarity());
    }
    var operandVal = numOperand.magnitude;
    if (numOperand.isCompact) {
      // If both are compact, try simple JS addition.
      if (isStandardSafe(currentVal + operandVal)) return new CompactWholeNumber(currentVal + operandVal);
      // Fallback to digit array for large compact numbers.
      operandVal = compactToDigits(Math.abs(operandVal));
    }
    // Add the absolute values, then apply the original sign.
    return new LargeWholeNumber(sumCompactDigit(operandVal, Math.abs(currentVal)), currentVal < 0);
  };
  CompactWholeNumber.prototype.plus = CompactWholeNumber.prototype.add; // Alias for add.

  /**
   * Subtracts one digit array from another (arrX - arrY), assuming arrX >= arrY.
   * @param {number[]} arrX - The minuend digit array.
   * @param {number[]} arrY - The subtrahend digit array.
   * @returns {number[]} Resulting difference digit array.
   */
  function deductDigits(arrX, arrY) {
    var lenX = arrX.length,
      lenY = arrY.length,
      outputArr = new Array(lenX),
      underflow = 0,
      chunkBase = CHUNK_SIZE,
      idx,
      currentDiff;
    for (idx = 0; idx < lenY; idx++) {
      currentDiff = arrX[idx] - underflow - arrY[idx];
      if (currentDiff < 0) {
        currentDiff += chunkBase;
        underflow = 1;
      } else underflow = 0;
      outputArr[idx] = currentDiff;
    }
    for (idx = lenY; idx < lenX; idx++) {
      currentDiff = arrX[idx] - underflow;
      if (currentDiff < 0) currentDiff += chunkBase;
      else {
        outputArr[idx++] = currentDiff;
        break;
      }
      outputArr[idx] = currentDiff;
    }
    for (; idx < lenX; idx++) {
      outputArr[idx] = arrX[idx];
    }
    normalizeDigits(outputArr); // Remove leading zeros.
    return outputArr;
  }

  /**
   * Performs subtraction between two digit arrays, handling magnitudes and signs.
   * @param {number[]} arrX - First operand's digit array.
   * @param {number[]} arrY - Second operand's digit array.
   * @param {boolean} resultPolarity - The desired polarity of the result.
   * @returns {CompactWholeNumber|LargeWholeNumber} The result.
   */
  function diffAnyOrder(arrX, arrY, resultPolarity) {
    var resultMagnitude;
    if (compareMagnitudes(arrX, arrY) >= 0) {
      resultMagnitude = deductDigits(arrX, arrY);
    } else {
      resultMagnitude = deductDigits(arrY, arrX);
      resultPolarity = !resultPolarity; // Invert sign if order was swapped.
    }
    resultMagnitude = digitsToCompact(resultMagnitude);
    if (typeof resultMagnitude === "number") {
      if (resultPolarity) resultMagnitude = -resultMagnitude;
      return new CompactWholeNumber(resultMagnitude);
    }
    return new LargeWholeNumber(resultMagnitude, resultPolarity);
  }

  /**
   * Subtracts a small integer from a digit array.
   * @param {number[]} arrDigits - The digit array.
   * @param {number} operandVal - The small integer to subtract.
   * @param {boolean} resultPolarity - The desired polarity of the result.
   * @returns {CompactWholeNumber|LargeWholeNumber} The result.
   */
  function diffCompactDigit(arrDigits, operandVal, resultPolarity) {
    var currentLen = arrDigits.length,
      outputArr = new Array(currentLen),
      underflow = -operandVal, // Negative operand becomes initial underflow.
      chunkBase = CHUNK_SIZE,
      idx,
      currentDiff;
    for (idx = 0; idx < currentLen; idx++) {
      currentDiff = arrDigits[idx] + underflow;
      underflow = Math.floor(currentDiff / chunkBase);
      currentDiff %= chunkBase;
      outputArr[idx] = currentDiff < 0 ? currentDiff + chunkBase : currentDiff; // Ensure positive chunk.
    }
    outputArr = digitsToCompact(outputArr);
    if (typeof outputArr === "number") {
      if (resultPolarity) outputArr = -outputArr;
      return new CompactWholeNumber(outputArr);
    }
    return new LargeWholeNumber(outputArr, resultPolarity);
  }

  // --- Subtraction operations ---

  LargeWholeNumber.prototype.subtract = function (inputVal) {
    var numOperand = interpretInput(inputVal);
    // If signs differ, convert to addition.
    if (this.polarity !== numOperand.polarity) {
      return this.add(numOperand.invertPolarity());
    }
    var currentMagnitude = this.magnitude,
      operandMagnitude = numOperand.magnitude;
    if (numOperand.isCompact)
      return diffCompactDigit(currentMagnitude, Math.abs(operandMagnitude), this.polarity);
    return diffAnyOrder(currentMagnitude, operandMagnitude, this.polarity);
  };
  LargeWholeNumber.prototype.minus = LargeWholeNumber.prototype.subtract; // Alias for subtract.

  CompactWholeNumber.prototype.subtract = function (inputVal) {
    var numOperand = interpretInput(inputVal);
    var currentVal = this.magnitude;
    // If signs differ, convert to addition.
    if (currentVal < 0 !== numOperand.polarity) {
      return this.add(numOperand.invertPolarity());
    }
    var operandVal = numOperand.magnitude;
    if (numOperand.isCompact) {
      return new CompactWholeNumber(currentVal - operandVal); // Simple JS subtraction.
    }
    // Subtract compact from large, or large from compact.
    // Note: The logic here is slightly different from add - it's b - |a| with sign.
    return diffCompactDigit(operandVal, Math.abs(currentVal), currentVal >= 0);
  };
  CompactWholeNumber.prototype.minus = CompactWholeNumber.prototype.subtract; // Alias for subtract.

  // --- Polarity and Absolute Value ---

  LargeWholeNumber.prototype.invertPolarity = function () {
    return new LargeWholeNumber(this.magnitude, !this.polarity);
  };
  CompactWholeNumber.prototype.invertPolarity = function () {
    var originalPolarity = this.polarity;
    var compactResult = new CompactWholeNumber(-this.magnitude);
    compactResult.polarity = !originalPolarity; // Explicitly set polarity.
    return compactResult;
  };

  LargeWholeNumber.prototype.absoluteValue = function () {
    return new LargeWholeNumber(this.magnitude, false);
  };
  CompactWholeNumber.prototype.absoluteValue = function () {
    return new CompactWholeNumber(Math.abs(this.magnitude));
  };

  /**
   * Multiplies two digit arrays using standard long multiplication.
   * @param {number[]} arrX - First digit array.
   * @param {number[]} arrY - Second digit array.
   * @returns {number[]} Resulting product digit array.
   */
  function multiLongDigits(arrX, arrY) {
    var lenX = arrX.length,
      lenY = arrY.length,
      outputLen = lenX + lenY,
      outputArr = makeZeroArray(outputLen),
      chunkBase = CHUNK_SIZE,
      partialProd,
      overflow,
      idx,
      digitX,
      digitY;

    for (idx = 0; idx < lenX; ++idx) {
      digitX = arrX[idx];
      for (var jdx = 0; jdx < lenY; ++jdx) {
        digitY = arrY[jdx];
        partialProd = digitX * digitY + outputArr[idx + jdx];
        overflow = Math.floor(partialProd / chunkBase);
        outputArr[idx + jdx] = partialProd - overflow * chunkBase;
        outputArr[idx + jdx + 1] += overflow; // Add overflow to the next chunk.
      }
    }
    normalizeDigits(outputArr); // Remove leading zeros.
    return outputArr;
  }

  /**
   * Multiplies a digit array by a compact number.
   * @param {number[]} arrX - The digit array.
   * @param {number} compactVal - The compact number multiplier.
   * @returns {number[]} Resulting product digit array.
   */
  function multiCompactDigit(arrX, compactVal) {
    var currentLen = arrX.length,
      outputArr = new Array(currentLen),
      chunkBase = CHUNK_SIZE,
      overflow = 0,
      partialProd,
      idx;
    for (idx = 0; idx < currentLen; idx++) {
      partialProd = arrX[idx] * compactVal + overflow;
      overflow = Math.floor(partialProd / chunkBase);
      outputArr[idx] = partialProd - overflow * chunkBase;
    }
    while (overflow > 0) {
      outputArr[idx++] = overflow % chunkBase;
      overflow = Math.floor(overflow / chunkBase);
    }
    return outputArr;
  }

  /**
   * Prepends zeros to a digit array, effectively shifting left by powers of CHUNK_SIZE.
   * @param {number[]} digits - The digit array.
   * @param {number} numZeros - Number of zero chunks to add.
   * @returns {number[]} The shifted array.
   */
  function padWithZeros(digits, numZeros) {
    var zeroPad = [];
    while (numZeros-- > 0) zeroPad.push(0);
    return zeroPad.concat(digits); // Concatenate zeros at the beginning (lower significance).
  }

  /**
   * Multiplies two digit arrays using Karatsuba algorithm for efficiency with large numbers.
   * @param {number[]} arrX - First digit array.
   * @param {number[]} arrY - Second digit array.
   * @returns {number[]} Resulting product digit array.
   */
  function karatsubaProduct(arrX, arrY) {
    var totalLen = Math.max(arrX.length, arrY.length);
    if (totalLen <= 30) return multiLongDigits(arrX, arrY); // Fallback for small arrays.

    totalLen = Math.ceil(totalLen / 2); // Split point for Karatsuba.

    var xLow = arrX.slice(totalLen),
      xHigh = arrX.slice(0, totalLen),
      yLow = arrY.slice(totalLen),
      yHigh = arrY.slice(0, totalLen);

    // Recursively calculate partial products.
    var prodLL = karatsubaProduct(xHigh, yHigh),
      prodHH = karatsubaProduct(xLow, yLow),
      prodSum = karatsubaProduct(sumAnyOrder(xHigh, xLow), sumAnyOrder(yHigh, yLow));

    // Combine results: prodLL * (BASE^(2*totalLen)) + (prodSum - prodLL - prodHH) * (BASE^totalLen) + prodHH
    var finalProduct = sumAnyOrder(
      sumAnyOrder(prodLL, padWithZeros(deductDigits(deductDigits(prodSum, prodLL), prodHH), totalLen)),
      padWithZeros(prodHH, 2 * totalLen)
    );
    normalizeDigits(finalProduct);
    return finalProduct;
  }

  /**
   * Heuristic to decide if Karatsuba multiplication is beneficial.
   * @param {number} len1 - Length of the first digit array.
   * @param {number} len2 - Length of the second digit array.
   * @returns {boolean} True if Karatsuba should be used.
   */
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
  }

  // --- Multiplication operations ---

  LargeWholeNumber.prototype.multiply = function (inputVal) {
    var numOperand = interpretInput(inputVal),
      currentMagnitude = this.magnitude,
      operandMagnitude = numOperand.magnitude,
      resultPolarity = this.polarity !== numOperand.polarity, // XOR for sign.
      absOperand;

    if (numOperand.isCompact) {
      var compactOperandVal = numOperand.magnitude;
      if (compactOperandVal === 0) return WholeNumber[0];
      if (compactOperandVal === 1) return this;
      if (compactOperandVal === -1) return this.invertPolarity();
      absOperand = Math.abs(compactOperandVal);
      if (absOperand < CHUNK_SIZE) {
        return new LargeWholeNumber(multiCompactDigit(currentMagnitude, absOperand), resultPolarity);
      }
      operandMagnitude = compactToDigits(absOperand); // Convert compact to digits for long multiplication.
    }

    if (shouldUseKaratsuba(currentMagnitude.length, operandMagnitude.length))
      return new LargeWholeNumber(karatsubaProduct(currentMagnitude, operandMagnitude), resultPolarity);
    return new LargeWholeNumber(multiLongDigits(currentMagnitude, operandMagnitude), resultPolarity);
  };
  LargeWholeNumber.prototype.times = LargeWholeNumber.prototype.multiply; // Alias for multiply.

  /**
   * Multiplies a small integer by a digit array.
   * @param {number} smallVal - The small integer.
   * @param {number[]} digitArr - The digit array.
   * @param {boolean} resultPolarity - The polarity of the result.
   * @returns {LargeWholeNumber} The product.
   */
  function productCompactAndDigits(smallVal, digitArr, resultPolarity) {
    if (smallVal < CHUNK_SIZE) {
      return new LargeWholeNumber(multiCompactDigit(digitArr, smallVal), resultPolarity);
    }
    return new LargeWholeNumber(multiLongDigits(digitArr, compactToDigits(smallVal)), resultPolarity);
  }

  // Internal helper for multiplication by a compact number.
  LargeWholeNumber.prototype._multiplyByCompact = function (compactOperand) {
    if (compactOperand.magnitude === 0) return WholeNumber[0];
    if (compactOperand.magnitude === 1) return this;
    if (compactOperand.magnitude === -1) return this.invertPolarity();
    return productCompactAndDigits(Math.abs(compactOperand.magnitude), this.magnitude, this.polarity !== compactOperand.polarity);
  };

  CompactWholeNumber.prototype._multiplyByCompact = function (compactOperand) {
    // If both are compact, try simple JS multiplication.
    if (isStandardSafe(compactOperand.magnitude * this.magnitude)) {
      return new CompactWholeNumber(compactOperand.magnitude * this.magnitude);
    }
    // Fallback to digit array multiplication.
    return productCompactAndDigits(Math.abs(compactOperand.magnitude), compactToDigits(Math.abs(this.magnitude)), this.polarity !== compactOperand.polarity);
  };

  CompactWholeNumber.prototype.multiply = function (inputVal) {
    return interpretInput(inputVal)._multiplyByCompact(this);
  };
  CompactWholeNumber.prototype.times = CompactWholeNumber.prototype.multiply; // Alias for multiply.

  /**
   * Squares a digit array.
   * @param {number[]} digits - The digit array to square.
   * @returns {number[]} The squared digit array.
   */
  function raiseToPowerTwo(digits) {
    var len = digits.length,
      outputArr = makeZeroArray(len + len),
      chunkBase = CHUNK_SIZE,
      partialProd,
      overflow,
      idx,
      elemI,
      elemJ;

    for (idx = 0; idx < len; idx++) {
      elemI = digits[idx];
      overflow = 0 - elemI * elemI; // This is a clever way to handle the first term's overflow.
      for (var jdx = idx; jdx < len; jdx++) {
        elemJ = digits[jdx];
        partialProd = 2 * (elemI * elemJ) + outputArr[idx + jdx] + overflow;
        overflow = Math.floor(partialProd / chunkBase);
        outputArr[idx + jdx] = partialProd - overflow * chunkBase;
      }
      outputArr[idx + len] = overflow; // Add remaining overflow.
    }
    normalizeDigits(outputArr);
    return outputArr;
  }

  LargeWholeNumber.prototype.square = function () {
    return new LargeWholeNumber(raiseToPowerTwo(this.magnitude), false);
  };
  CompactWholeNumber.prototype.square = function () {
    var squaredVal = this.magnitude * this.magnitude;
    if (isStandardSafe(squaredVal)) return new CompactWholeNumber(squaredVal);
    // Convert to digit array and square if result is too large.
    return new LargeWholeNumber(raiseToPowerTwo(compactToDigits(Math.abs(this.magnitude))), false);
  };

  /**
   * Performs long division (algorithm 1, Knuth D. Vol 2) for digit arrays.
   * @param {number[]} dividendDigits - The dividend.
   * @param {number[]} divisorDigits - The divisor.
   * @returns {[number[], number[]]} Array containing [quotient, remainder] digit arrays.
   */
  function divideAndRemainderA(dividendDigits, divisorDigits) {
    var dividendLen = dividendDigits.length,
      divisorLen = divisorDigits.length,
      chunkBase = CHUNK_SIZE,
      quotientDigits = makeZeroArray(divisorDigits.length),
      msdDivisor = divisorDigits[divisorLen - 1], // Most significant digit of divisor.
      scalingFactor = Math.ceil(chunkBase / (2 * msdDivisor)), // Normalization factor.
      remDigits = multiCompactDigit(dividendDigits, scalingFactor), // Normalized dividend.
      divisorScaled = multiCompactDigit(divisorDigits, scalingFactor), // Normalized divisor.
      currentQuotientDigit,
      posShift,
      overflow,
      underflow,
      idx,
      currentLoopLen,
      tempQ;

    // Ensure remainder has enough space for shifted digits.
    if (remDigits.length <= dividendLen) remDigits.push(0);
    divisorScaled.push(0); // Pad divisor for easier comparison.
    msdDivisor = divisorScaled[divisorLen - 1]; // Update MSD after scaling.

    // Iterate from most significant position down.
    for (posShift = dividendLen - divisorLen; posShift >= 0; posShift--) {
      currentQuotientDigit = chunkBase - 1; // Initial guess for quotient digit.
      if (remDigits[posShift + divisorLen] !== msdDivisor) {
        currentQuotientDigit = Math.floor(
          (remDigits[posShift + divisorLen] * chunkBase + remDigits[posShift + divisorLen - 1]) / msdDivisor
        );
      }

      // Subtract (currentQuotientDigit * divisorScaled) from current remainder part.
      overflow = 0;
      underflow = 0;
      currentLoopLen = divisorScaled.length;
      for (idx = 0; idx < currentLoopLen; idx++) {
        overflow += currentQuotientDigit * divisorScaled[idx];
        tempQ = Math.floor(overflow / chunkBase);
        underflow += remDigits[posShift + idx] - (overflow - tempQ * chunkBase);
        overflow = tempQ;
        if (underflow < 0) {
          remDigits[posShift + idx] = underflow + chunkBase;
          underflow = -1;
        } else {
          remDigits[posShift + idx] = underflow;
          underflow = 0;
        }
      }

      // Adjust quotient digit if the subtraction resulted in a negative remainder.
      while (underflow !== 0) {
        currentQuotientDigit -= 1;
        overflow = 0;
        for (idx = 0; idx < currentLoopLen; idx++) {
          overflow += remDigits[posShift + idx] - chunkBase + divisorScaled[idx];
          if (overflow < 0) {
            remDigits[posShift + idx] = overflow + chunkBase;
            overflow = 0;
          } else {
            remDigits[posShift + idx] = overflow;
            overflow = 1;
          }
        }
        underflow += overflow;
      }
      quotientDigits[posShift] = currentQuotientDigit;
    }
    // Un-normalize the remainder.
    remDigits = divideCompactDigit(remDigits, scalingFactor)[0];
    return [digitsToCompact(quotientDigits), digitsToCompact(remDigits)];
  }

  /**
   * Performs division using repeated subtraction (algorithm 2, slower for very large).
   * @param {number[]} dividendDigits - The dividend.
   * @param {number[]} divisorDigits - The divisor.
   * @returns {[number[], number[]]} Array containing [quotient, remainder] digit arrays.
   */
  function divideAndRemainderB(dividendDigits, divisorDigits) {
    var dividendLen = dividendDigits.length,
      divisorLen = divisorDigits.length,
      quotientResult = [],
      currentDividendPart = [],
      chunkBase = CHUNK_SIZE,
      quotientGuess,
      partLen,
      highPart,
      highDivisor,
      testProduct;

    while (dividendLen) {
      currentDividendPart.unshift(dividendDigits[--dividendLen]); // Take one chunk at a time from dividend.
      normalizeDigits(currentDividendPart);
      if (compareMagnitudes(currentDividendPart, divisorDigits) < 0) {
        quotientResult.push(0);
        continue;
      }
      partLen = currentDividendPart.length;
      highPart = currentDividendPart[partLen - 1] * chunkBase + currentDividendPart[partLen - 2];
      highDivisor = divisorDigits[divisorLen - 1] * chunkBase + divisorDigits[divisorLen - 2];
      if (partLen > divisorLen) {
        highPart = (highPart + 1) * chunkBase; // Adjust guess if part is larger.
      }
      quotientGuess = Math.ceil(highPart / highDivisor); // Estimate quotient digit.
      do {
        testProduct = multiCompactDigit(divisorDigits, quotientGuess);
        if (compareMagnitudes(testProduct, currentDividendPart) <= 0) break;
        quotientGuess--;
      } while (quotientGuess); // Refine guess.

      quotientResult.push(quotientGuess);
      currentDividendPart = deductDigits(currentDividendPart, testProduct); // Subtract to get new remainder.
    }
    quotientResult.reverse(); // Digits collected in reverse order.
    return [digitsToCompact(quotientResult), digitsToCompact(currentDividendPart)];
  }

  /**
   * Divides a digit array by a small integer.
   * @param {number[]} digitArr - The digit array.
   * @param {number} smallDivisor - The small integer divisor.
   * @returns {[number[], number]} Array containing [quotient digit array, remainder number].
   */
  function divideCompactDigit(digitArr, smallDivisor) {
    var currentLen = digitArr.length,
      qResult = makeZeroArray(currentLen),
      chunkBase = CHUNK_SIZE,
      idx,
      qVal,
      remVal,
      currentDividendPart;

    remVal = 0;
    for (idx = currentLen - 1; idx >= 0; --idx) {
      currentDividendPart = remVal * chunkBase + digitArr[idx];
      qVal = floorOrCeil(currentDividendPart / smallDivisor);
      remVal = currentDividendPart - qVal * smallDivisor;
      qResult[idx] = qVal | 0; // Ensure integer.
    }
    return [qResult, remVal | 0]; // Ensure integer.
  }

  /**
   * General purpose division and remainder function for WholeNumbers.
   * @param {WholeNumber} self - The dividend.
   * @param {WholeNumber|number|string} operand - The divisor.
   * @returns {[WholeNumber, WholeNumber]} Array containing [quotient, remainder].
   */
  function generalDivideAndRemainder(self, operand) {
    var resultPair,
      numOperand = interpretInput(operand);
    var currentMagnitude = self.magnitude,
      operandMagnitude = numOperand.magnitude;
    var finalQuotient;

    if (operandMagnitude === 0) throw new Error("Cannot divide by zero"); // Division by zero error.

    // Handle small number cases directly.
    if (self.isCompact) {
      if (numOperand.isCompact) {
        return [new CompactWholeNumber(floorOrCeil(currentMagnitude / operandMagnitude)), new CompactWholeNumber(currentMagnitude % operandMagnitude)];
      }
      return [WholeNumber[0], self]; // Small number divided by large number is 0 remainder self.
    }
    if (numOperand.isCompact) {
      var compactOperandVal = numOperand.magnitude;
      if (compactOperandVal === 1) return [self, WholeNumber[0]];
      if (compactOperandVal === -1) return [self.invertPolarity(), WholeNumber[0]];
      var absCompactOperand = Math.abs(compactOperandVal);
      if (absCompactOperand < CHUNK_SIZE) {
        resultPair = divideCompactDigit(currentMagnitude, absCompactOperand);
        finalQuotient = digitsToCompact(resultPair[0]);
        var remainderVal = resultPair[1];
        if (self.polarity) remainderVal = -remainderVal; // Apply original sign to remainder.

        if (typeof finalQuotient === "number") {
          if (self.polarity !== numOperand.polarity) finalQuotient = -finalQuotient; // Apply quotient sign.
          return [new CompactWholeNumber(finalQuotient), new CompactWholeNumber(remainderVal)];
        }
        return [new LargeWholeNumber(finalQuotient, self.polarity !== numOperand.polarity), new CompactWholeNumber(remainderVal)];
      }
      operandMagnitude = compactToDigits(absCompactOperand); // Convert compact to digits.
    }

    // General case: two large numbers.
    var comparison = compareMagnitudes(currentMagnitude, operandMagnitude);
    if (comparison === -1) return [WholeNumber[0], self]; // Dividend < Divisor.
    if (comparison === 0) return [WholeNumber[self.polarity === numOperand.polarity ? 1 : -1], WholeNumber[0]]; // Dividend == Divisor.

    // Choose division algorithm based on length.
    if (currentMagnitude.length + operandMagnitude.length <= 200) resultPair = divideAndRemainderA(currentMagnitude, operandMagnitude);
    else resultPair = divideAndRemainderB(currentMagnitude, operandMagnitude);

    finalQuotient = resultPair[0];
    var quotientPolarity = self.polarity !== numOperand.polarity,
      modResult = resultPair[1],
      remainderPolarity = self.polarity;

    // Convert results back to WholeNumber instances.
    if (typeof finalQuotient === "number") {
      if (quotientPolarity) finalQuotient = -finalQuotient;
      finalQuotient = new CompactWholeNumber(finalQuotient);
    } else finalQuotient = new LargeWholeNumber(finalQuotient, quotientPolarity);

    if (typeof modResult === "number") {
      if (remainderPolarity) modResult = -modResult;
      modResult = new CompactWholeNumber(modResult);
    } else modResult = new LargeWholeNumber(modResult, remainderPolarity);

    return [finalQuotient, modResult];
  }

  // --- Division and Modulo operations ---

  LargeWholeNumber.prototype.divmod = function (inputVal) {
    var result = generalDivideAndRemainder(this, inputVal);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  CompactWholeNumber.prototype.divmod = LargeWholeNumber.prototype.divmod;

  LargeWholeNumber.prototype.getQuotient = function (inputVal) {
    return generalDivideAndRemainder(this, inputVal)[0];
  };
  CompactWholeNumber.prototype.divisionOp = CompactWholeNumber.prototype.getQuotient = LargeWholeNumber.prototype.divisionOp = LargeWholeNumber.prototype.getQuotient;

  LargeWholeNumber.prototype.getRemainder = function (inputVal) {
    return generalDivideAndRemainder(this, inputVal)[1];
  };
  CompactWholeNumber.prototype.moduloOp = CompactWholeNumber.prototype.getRemainder = LargeWholeNumber.prototype.moduloOp = LargeWholeNumber.prototype.getRemainder;

  // --- Exponentiation ---

  LargeWholeNumber.prototype.exponentiate = function (inputVal) {
    var numOperand = interpretInput(inputVal),
      currentMagnitude = this.magnitude,
      operandMagnitude = numOperand.magnitude,
      resultVal,
      baseVal,
      accProduct;

    if (operandMagnitude === 0) return WholeNumber[1]; // x^0 = 1.
    if (currentMagnitude === 0) return WholeNumber[0]; // 0^y = 0 (for y > 0).
    if (currentMagnitude === 1) return WholeNumber[1]; // 1^y = 1.
    if (currentMagnitude === -1) return numOperand.isParityEven() ? WholeNumber[1] : WholeNumber[-1]; // (-1)^y.

    if (numOperand.polarity) {
      return WholeNumber[0]; // Negative exponent implies fractional result, not supported for WholeNumber.
    }
    if (!numOperand.isCompact)
      throw new Error("The exponent " + numOperand.toTextRepresentation() + " is too large.");

    if (this.isCompact) {
      // If base is compact, try direct JS Math.pow.
      if (isStandardSafe((resultVal = Math.pow(currentMagnitude, operandMagnitude))))
        return new CompactWholeNumber(floorOrCeil(resultVal));
    }

    // Binary exponentiation (exponentiation by squaring).
    baseVal = this;
    accProduct = WholeNumber[1];
    while (true) {
      if ((operandMagnitude & 1) === 1) {
        accProduct = accProduct.times(baseVal);
        --operandMagnitude;
      }
      if (operandMagnitude === 0) break;
      operandMagnitude /= 2;
      baseVal = baseVal.square();
    }
    return accProduct;
  };
  CompactWholeNumber.prototype.exponentiate = LargeWholeNumber.prototype.exponentiate;

  LargeWholeNumber.prototype.modularExponentiate = function (exponent, modulus) {
    var expNum = interpretInput(exponent);
    var modNum = interpretInput(modulus);
    if (modNum.isValZero()) throw new Error("Cannot take modular exponentiation with modulus 0");

    var resultAccumulator = WholeNumber[1],
      currentBase = this.moduloOp(modNum);
    while (expNum.hasPositivePolarity()) {
      if (currentBase.isValZero()) return WholeNumber[0]; // Optimization: 0^exp mod M = 0.
      if (expNum.isParityOdd()) resultAccumulator = resultAccumulator.multiply(currentBase).moduloOp(modNum);
      expNum = expNum.getQuotient(2);
      currentBase = currentBase.square().moduloOp(modNum);
    }
    return resultAccumulator;
  };
  CompactWholeNumber.prototype.modularExponentiate = LargeWholeNumber.prototype.modularExponentiate;

  /**
   * Compares the absolute magnitudes of two digit arrays.
   * @param {number[]} arrX - First digit array.
   * @param {number[]} arrY - Second digit array.
   * @returns {number} -1 if arrX < arrY, 0 if arrX == arrY, 1 if arrX > arrY.
   */
  function compareMagnitudes(arrX, arrY) {
    if (arrX.length !== arrY.length) {
      return arrX.length > arrY.length ? 1 : -1;
    }
    for (var idx = arrX.length - 1; idx >= 0; idx--) {
      if (arrX[idx] !== arrY[idx]) return arrX[idx] > arrY[idx] ? 1 : -1;
    }
    return 0; // Magnitudes are equal.
  }

  // --- Comparison operations ---

  LargeWholeNumber.prototype.compareMagnitudes = function (inputVal) {
    var numOperand = interpretInput(inputVal),
      currentMagnitude = this.magnitude,
      operandMagnitude = numOperand.magnitude;
    if (numOperand.isCompact) return 1; // Large number is always greater in magnitude than a compact one.
    return compareMagnitudes(currentMagnitude, operandMagnitude);
  };

  CompactWholeNumber.prototype.compareMagnitudes = function (inputVal) {
    var numOperand = interpretInput(inputVal),
      absCurrentVal = Math.abs(this.magnitude),
      operandMagnitude = numOperand.magnitude;
    if (numOperand.isCompact) {
      operandMagnitude = Math.abs(operandMagnitude);
      return absCurrentVal === operandMagnitude ? 0 : absCurrentVal > operandMagnitude ? 1 : -1;
    }
    return -1; // Compact number is always smaller in magnitude than a large one.
  };

  LargeWholeNumber.prototype.compareValues = function (inputVal) {
    if (inputVal === Infinity) {
      return -1;
    }
    if (inputVal === -Infinity) {
      return 1;
    }
    var numOperand = interpretInput(inputVal),
      currentMagnitude = this.magnitude,
      operandMagnitude = numOperand.magnitude;
    // Handle signs first.
    if (this.polarity !== numOperand.polarity) {
      return numOperand.polarity ? 1 : -1; // If `this` is positive and `operand` is negative, `this` is greater.
    }
    // If one is compact and the other is large, and signs are the same.
    if (numOperand.isCompact) {
      // If `this` is large and `operand` is compact, `this` is generally "further" from zero.
      // E.g., Large positive > Compact positive. Large negative < Compact negative.
      return this.polarity ? -1 : 1;
    }
    // Both large or both compact, with same sign.
    return compareMagnitudes(currentMagnitude, operandMagnitude) * (this.polarity ? -1 : 1); // Invert result if negative.
  };
  LargeWholeNumber.prototype.compareOrder = LargeWholeNumber.prototype.compareValues; // Alias.

  CompactWholeNumber.prototype.compareValues = function (inputVal) {
    if (inputVal === Infinity) {
      return -1;
    }
    if (inputVal === -Infinity) {
      return 1;
    }
    var numOperand = interpretInput(inputVal),
      currentVal = this.magnitude,
      operandVal = numOperand.magnitude;
    if (numOperand.isCompact) {
      return currentVal == operandVal ? 0 : currentVal > operandVal ? 1 : -1; // Direct comparison for compact numbers.
    }
    // Compact vs Large, with same sign.
    if (currentVal < 0 !== numOperand.polarity) {
      // If signs differ, handle based on sign.
      return currentVal < 0 ? -1 : 1;
    }
    // If signs are the same, compact is 'closer' to zero.
    return currentVal < 0 ? 1 : -1; // Compact negative is greater than large negative. Compact positive is less than large positive.
  };
  CompactWholeNumber.prototype.compareOrder = CompactWholeNumber.prototype.compareValues; // Alias.

  LargeWholeNumber.prototype.isEqualTo = function (inputVal) {
    return this.compareValues(inputVal) === 0;
  };
  CompactWholeNumber.prototype.equalOp = CompactWholeNumber.prototype.isEqualTo = LargeWholeNumber.prototype.equalOp = LargeWholeNumber.prototype.isEqualTo;

  LargeWholeNumber.prototype.isNotEqualTo = function (inputVal) {
    return this.compareValues(inputVal) !== 0;
  };
  CompactWholeNumber.prototype.notEqualOp = CompactWholeNumber.prototype.isNotEqualTo = LargeWholeNumber.prototype.notEqualOp = LargeWholeNumber.prototype.isNotEqualTo;

  LargeWholeNumber.prototype.isGreater = function (inputVal) {
    return this.compareValues(inputVal) > 0;
  };
  CompactWholeNumber.prototype.greaterThanOp = CompactWholeNumber.prototype.isGreater = LargeWholeNumber.prototype.greaterThanOp = LargeWholeNumber.prototype.isGreater;

  LargeWholeNumber.prototype.isLesser = function (inputVal) {
    return this.compareValues(inputVal) < 0;
  };
  CompactWholeNumber.prototype.lessThanOp = CompactWholeNumber.prototype.isLesser = LargeWholeNumber.prototype.lessThanOp = LargeWholeNumber.prototype.isLesser;

  LargeWholeNumber.prototype.isGreaterOrEqual = function (inputVal) {
    return this.compareValues(inputVal) >= 0;
  };
  CompactWholeNumber.prototype.greaterEqualOp = CompactWholeNumber.prototype.isGreaterOrEqual = LargeWholeNumber.prototype.greaterEqualOp = LargeWholeNumber.prototype.isGreaterOrEqual;

  LargeWholeNumber.prototype.isLesserOrEqual = function (inputVal) {
    return this.compareValues(inputVal) <= 0;
  };
  CompactWholeNumber.prototype.lessEqualOp = CompactWholeNumber.prototype.isLesserOrEqual = LargeWholeNumber.prototype.lessEqualOp = LargeWholeNumber.prototype.isLesserOrEqual;

  // --- Property Checks ---

  LargeWholeNumber.prototype.isParityEven = function () {
    return (this.magnitude[0] & 1) === 0; // Check least significant chunk.
  };
  CompactWholeNumber.prototype.isParityEven = function () {
    return (this.magnitude & 1) === 0;
  };

  LargeWholeNumber.prototype.isParityOdd = function () {
    return (this.magnitude[0] & 1) === 1;
  };
  CompactWholeNumber.prototype.isParityOdd = function () {
    return (this.magnitude & 1) === 1;
  };

  LargeWholeNumber.prototype.hasPositivePolarity = function () {
    return !this.polarity;
  };
  CompactWholeNumber.prototype.hasPositivePolarity = function () {
    return this.magnitude > 0;
  };

  LargeWholeNumber.prototype.hasNegativePolarity = function () {
    return this.polarity;
  };
  CompactWholeNumber.prototype.hasNegativePolarity = function () {
    return this.magnitude < 0;
  };

  LargeWholeNumber.prototype.isOneOrMinusOne = function () {
    return false; // A large number (array) cannot be 1 or -1 directly unless optimized.
  };
  CompactWholeNumber.prototype.isOneOrMinusOne = function () {
    return Math.abs(this.magnitude) === 1;
  };

  LargeWholeNumber.prototype.isValZero = function () {
    return false; // A large number (array) is not zero directly.
  };
  CompactWholeNumber.prototype.isValZero = function () {
    return this.magnitude === 0;
  };

  LargeWholeNumber.prototype.isFactorOf = function (inputVal) {
    var numOperand = interpretInput(inputVal);
    var operandVal = numOperand.magnitude;
    if (operandVal === 0) return false;
    if (operandVal === 1) return true;
    if (operandVal === 2) return this.isParityEven();
    return this.moduloOp(numOperand).isEqualTo(WholeNumber[0]); // Check if remainder is zero.
  };
  CompactWholeNumber.prototype.isFactorOf = LargeWholeNumber.prototype.isFactorOf;

  // --- Primality Tests ---

  /**
   * Checks for primality of small numbers (up to 25) for optimization.
   * @param {WholeNumber} numToCheck - The number to check.
   * @returns {boolean|undefined} True/false if known, undefined if needs further testing.
   */
  function isSmallPrime(numToCheck) {
    var absNum = numToCheck.absoluteValue();
    if (absNum.isOneOrMinusOne()) return false;
    if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
    if (absNum.isParityEven() || absNum.isFactorOf(3) || absNum.isFactorOf(5)) return false;
    if (absNum.isLesser(25)) return true; // Primes up to 25: 2,3,5,7,11,13,17,19,23 (handled by previous checks).
  }

  LargeWholeNumber.prototype.isPrime = function () {
    var primeCheckResult = isSmallPrime(this);
    if (primeCheckResult !== undefined) return primeCheckResult;

    var currentNum = this.absoluteValue(),
      numMinusOne = currentNum.decrement(); // n-1.
    // Miller-Rabin primality test (deterministic for numbers up to ~3.4e14).
    var testPrimes = [2, 3, 5, 7, 11, 13, 17, 19],
      reducedNum = numMinusOne,
      divisorIter,
      isWitness,
      witnessVal;

    // Find d such that n-1 = d * 2^s, where d is odd.
    while (reducedNum.isParityEven()) reducedNum = reducedNum.getQuotient(2);

    for (var idx = 0; idx < testPrimes.length; idx++) {
      witnessVal = largeNum(testPrimes[idx]).modularExponentiate(reducedNum, currentNum);
      if (witnessVal.isEqualTo(WholeNumber[1]) || witnessVal.isEqualTo(numMinusOne)) continue; // Passes initial test.

      isWitness = true; // Assume it's a composite witness.
      for (divisorIter = reducedNum; isWitness && divisorIter.isLesser(numMinusOne); divisorIter = divisorIter.multiply(2)) {
        witnessVal = witnessVal.square().moduloOp(currentNum);
        if (witnessVal.isEqualTo(numMinusOne)) isWitness = false; // Not a witness, might be prime.
      }
      if (isWitness) return false; // Found a composite witness.
    }
    return true; // Likely prime.
  };
  CompactWholeNumber.prototype.isPrime = LargeWholeNumber.prototype.isPrime;

  LargeWholeNumber.prototype.isLikelyPrime = function (testCount) {
    var primeCheckResult = isSmallPrime(this);
    if (primeCheckResult !== undefined) return primeCheckResult;

    var currentNum = this.absoluteValue();
    var maxTests = testCount === undefined ? 5 : testCount; // Default 5 iterations.
    for (var idx = 0; idx < maxTests; idx++) {
      var randomBase = largeNum.randomBetweenNumbers(2, currentNum.minus(2));
      if (!randomBase.modularExponentiate(currentNum.decrement(), currentNum).isOneOrMinusOne())
        return false; // Fails Fermat's Little Theorem (not necessarily strong pseudoprime).
    }
    return true; // Probable prime.
  };
  CompactWholeNumber.prototype.isLikelyPrime = LargeWholeNumber.prototype.isLikelyPrime;

  // --- Modular Inverse ---

  LargeWholeNumber.prototype.modularInverse = function (modulus) {
    var t0 = largeNum.nullValue,
      t1 = largeNum.unitValue,
      r0 = interpretInput(modulus),
      r1 = this.absoluteValue(),
      quotient,
      prevT,
      prevR;

    // Extended Euclidean Algorithm.
    while (!r1.isEqualTo(largeNum.nullValue)) {
      quotient = r0.getQuotient(r1);
      prevT = t0;
      prevR = r0;
      t0 = t1;
      r0 = r1;
      t1 = prevT.subtract(quotient.multiply(t1));
      r1 = prevR.subtract(quotient.multiply(r1));
    }
    if (!r0.isEqualTo(1))
      throw new Error(
        this.toTextRepresentation() + " and " + modulus.toTextRepresentation() + " are not co-prime"
      );

    if (t0.compareValues(0) === -1) {
      t0 = t0.add(modulus); // Ensure positive result.
    }
    if (this.hasNegativePolarity()) {
      return t0.invertPolarity(); // Adjust sign if original number was negative.
    }
    return t0;
  };
  CompactWholeNumber.prototype.modularInverse = LargeWholeNumber.prototype.modularInverse;

  // --- Increment/Decrement ---

  LargeWholeNumber.prototype.increment = function () {
    var currentMagnitude = this.magnitude;
    if (this.polarity) {
      return diffCompactDigit(currentMagnitude, 1, this.polarity); // If negative, decrease magnitude.
    }
    return new LargeWholeNumber(sumCompactDigit(currentMagnitude, 1), this.polarity);
  };
  CompactWholeNumber.prototype.increment = function () {
    var currentVal = this.magnitude;
    if (currentVal + 1 < MAX_SAFE_JS_VAL) return new CompactWholeNumber(currentVal + 1);
    // If incrementing a compact number makes it exceed safe JS int.
    return new LargeWholeNumber(MAX_JS_VAL_DIGITS, false);
  };

  LargeWholeNumber.prototype.decrement = function () {
    var currentMagnitude = this.magnitude;
    if (this.polarity) {
      return new LargeWholeNumber(sumCompactDigit(currentMagnitude, 1), true); // If negative, increase magnitude.
    }
    return diffCompactDigit(currentMagnitude, 1, this.polarity);
  };
  CompactWholeNumber.prototype.decrement = function () {
    var currentVal = this.magnitude;
    if (currentVal - 1 > -MAX_SAFE_JS_VAL) return new CompactWholeNumber(currentVal - 1);
    // If decrementing a compact number makes it exceed safe JS int.
    return new LargeWholeNumber(MAX_JS_VAL_DIGITS, true);
  };

  // --- Bitwise Operations ---

  // Pre-calculated powers of 2 for efficient shifting.
  var binaryPowerChunks = [1];
  while (2 * binaryPowerChunks[binaryPowerChunks.length - 1] <= CHUNK_SIZE)
    binaryPowerChunks.push(2 * binaryPowerChunks[binaryPowerChunks.length - 1]);
  var binaryPowerCount = binaryPowerChunks.length,
    maxBinaryChunk = binaryPowerChunks[binaryPowerCount - 1];

  /**
   * Checks if a shift amount can be handled by compact number operations.
   * @param {number|string|LargeWholeNumber} shiftAmount - The amount to shift.
   * @returns {boolean} True if compact, false otherwise.
   */
  function canShiftCompactly(shiftAmount) {
    return (
      (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
      +Math.abs(shiftAmount) <= CHUNK_SIZE ||
      (shiftAmount instanceof LargeWholeNumber && shiftAmount.magnitude.length <= 1)
    );
  }

  LargeWholeNumber.prototype.shiftLeft = function (shiftAmount) {
    if (!canShiftCompactly(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Ensure numeric.
    if (shiftAmount < 0) return this.shiftRight(-shiftAmount); // Convert left shift by negative to right shift.

    var shiftedResult = this;
    if (shiftedResult.isValZero()) return shiftedResult;

    // Apply shifts in chunks of maxBinaryChunk.
    while (shiftAmount >= binaryPowerCount) {
      shiftedResult = shiftedResult.multiply(maxBinaryChunk);
      shiftAmount -= binaryPowerCount - 1; // Adjust remaining shift.
    }
    return shiftedResult.multiply(binaryPowerChunks[shiftAmount]); // Apply remaining shift.
  };
  CompactWholeNumber.prototype.shiftLeft = LargeWholeNumber.prototype.shiftLeft;

  LargeWholeNumber.prototype.shiftRight = function (shiftAmount) {
    var remAndQuot;
    if (!canShiftCompactly(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Ensure numeric.
    if (shiftAmount < 0) return this.shiftLeft(-shiftAmount); // Convert right shift by negative to left shift.

    var shiftedResult = this;
    // Apply shifts in chunks of maxBinaryChunk.
    while (shiftAmount >= binaryPowerCount) {
      if (shiftedResult.isValZero() || (shiftedResult.hasNegativePolarity() && shiftedResult.isOneOrMinusOne()))
        return shiftedResult; // Shifting 0 or -1 right results in 0 or -1.
      remAndQuot = generalDivideAndRemainder(shiftedResult, maxBinaryChunk);
      shiftedResult = remAndQuot[1].hasNegativePolarity() ? remAndQuot[0].decrement() : remAndQuot[0]; // Handle negative remainders.
      shiftAmount -= binaryPowerCount - 1;
    }
    remAndQuot = generalDivideAndRemainder(shiftedResult, binaryPowerChunks[shiftAmount]);
    return remAndQuot[1].hasNegativePolarity() ? remAndQuot[0].decrement() : remAndQuot[0]; // Handle negative remainders.
  };
  CompactWholeNumber.prototype.shiftRight = LargeWholeNumber.prototype.shiftRight;

  /**
   * Performs a bitwise operation on two WholeNumbers.
   * @param {WholeNumber} firstNum - First operand.
   * @param {WholeNumber} secondNum - Second operand.
   * @param {function(number, number): number} operationFunc - The bitwise function (e.g., `&`, `|`, `^`).
   * @returns {WholeNumber} The result.
   */
  function performBitwiseOp(firstNum, secondNum, operationFunc) {
    secondNum = interpretInput(secondNum);
    var firstPolarity = firstNum.hasNegativePolarity(),
      secondPolarity = secondNum.hasNegativePolarity();
    var firstRemaining = firstPolarity ? firstNum.not() : firstNum,
      secondRemaining = secondPolarity ? secondNum.not() : secondNum;

    var firstChunk = 0,
      secondChunk = 0;
    var firstDivResult = null,
      secondDivResult = null;
    var resultChunks = [];

    // Process chunks from least significant to most significant.
    while (!firstRemaining.isValZero() || !secondRemaining.isValZero()) {
      firstDivResult = generalDivideAndRemainder(firstRemaining, maxBinaryChunk);
      firstChunk = firstDivResult[1].toJavaScriptNumber();
      if (firstPolarity) {
        firstChunk = maxBinaryChunk - 1 - firstChunk; // Invert bits for negative numbers.
      }

      secondDivResult = generalDivideAndRemainder(secondRemaining, maxBinaryChunk);
      secondChunk = secondDivResult[1].toJavaScriptNumber();
      if (secondPolarity) {
        secondChunk = maxBinaryChunk - 1 - secondChunk; // Invert bits for negative numbers.
      }

      firstRemaining = firstDivResult[0];
      secondRemaining = secondDivResult[0];
      resultChunks.push(operationFunc(firstChunk, secondChunk));
    }

    // Determine the sign of the final result based on the operation on signs.
    var finalResult =
      operationFunc(firstPolarity ? 1 : 0, secondPolarity ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);

    // Reconstruct the number from result chunks.
    for (var idx = resultChunks.length - 1; idx >= 0; idx -= 1) {
      finalResult = finalResult.multiply(maxBinaryChunk).add(largeNum(resultChunks[idx]));
    }
    return finalResult;
  }

  LargeWholeNumber.prototype.not = function () {
    return this.invertPolarity().decrement(); // Bitwise NOT is equivalent to -(N + 1).
  };
  CompactWholeNumber.prototype.not = LargeWholeNumber.prototype.not;

  LargeWholeNumber.prototype.and = function (operand) {
    return performBitwiseOp(this, operand, function (a, b) {
      return a & b;
    });
  };
  CompactWholeNumber.prototype.and = LargeWholeNumber.prototype.and;

  LargeWholeNumber.prototype.or = function (operand) {
    return performBitwiseOp(this, operand, function (a, b) {
      return a | b;
    });
  };
  CompactWholeNumber.prototype.or = LargeWholeNumber.prototype.or;

  LargeWholeNumber.prototype.xor = function (operand) {
    return performBitwiseOp(this, operand, function (a, b) {
      return a ^ b;
    });
  };
  CompactWholeNumber.prototype.xor = LargeWholeNumber.prototype.xor;

  // --- Utility for Bit Length ---

  // Masks to find the lowest set bit.
  var LOW_ORDER_BITS_MASK_SMALL = 1 << 30,
    LOW_ORDER_BITS_MASK_LARGE = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOW_ORDER_BITS_MASK_SMALL;

  /**
   * Estimates the lowest order bit for small numbers or the first chunk.
   * Used in GCD.
   * @param {WholeNumber} num - The number to check.
   * @returns {number} The value of the lowest set bit.
   */
  function estimateLowestBit(num) {
    var numMagnitude = num.magnitude,
      maskedVal =
        typeof numMagnitude === "number"
          ? numMagnitude | LOW_ORDER_BITS_MASK_SMALL
          : numMagnitude[0] + numMagnitude[1] * CHUNK_SIZE | LOW_ORDER_BITS_MASK_LARGE;
    return maskedVal & -maskedVal; // Returns the lowest set bit.
  }

  /**
   * Calculates the integer logarithm (base 2).
   * @param {WholeNumber} value - The number whose logarithm is to be calculated.
   * @param {WholeNumber} base - The base of the logarithm.
   * @returns {{p: WholeNumber, e: number}} Object with power and exponent.
   */
  function wholeNumberLog(value, base) {
    if (base.compareValues(value) <= 0) {
      var tempLogResult = wholeNumberLog(value, base.square()); // Recursively compute log with squared base.
      var powerVal = tempLogResult.p;
      var exponentVal = tempLogResult.e;
      var testProduct = powerVal.multiply(base);
      return testProduct.compareValues(value) <= 0
        ? {
            p: testProduct,
            e: exponentVal * 2 + 1,
          }
        : {
            p: powerVal,
            e: exponentVal * 2,
          };
    }
    return {
      p: largeNum(1),
      e: 0,
    }; // Base case: value < base.
  }

  LargeWholeNumber.prototype.getBitLength = function () {
    var currentNum = this;
    // For negative numbers, bit length is usually defined for the absolute value or (abs(N)-1).
    if (currentNum.compareValues(largeNum(0)) < 0) {
      currentNum = currentNum.invertPolarity().subtract(largeNum(1));
    }
    if (currentNum.compareValues(largeNum(0)) === 0) {
      return largeNum(0);
    }
    // Calculate log base 2 and add 1 for bit count.
    return largeNum(wholeNumberLog(currentNum, largeNum(2)).e).add(largeNum(1));
  };
  CompactWholeNumber.prototype.getBitLength = LargeWholeNumber.prototype.getBitLength;

  // --- Static Math Functions ---

  /**
   * Returns the maximum of two WholeNumber values.
   * @param {WholeNumber|number|string} val1 - First value.
   * @param {WholeNumber|number|string} val2 - Second value.
   * @returns {WholeNumber} The greater value.
   */
  function maximumValue(val1, val2) {
    val1 = interpretInput(val1);
    val2 = interpretInput(val2);
    return val1.isGreater(val2) ? val1 : val2;
  }

  /**
   * Returns the minimum of two WholeNumber values.
   * @param {WholeNumber|number|string} val1 - First value.
   * @param {WholeNumber|number|string} val2 - Second value.
   * @returns {WholeNumber} The lesser value.
   */
  function minimumValue(val1, val2) {
    val1 = interpretInput(val1);
    val2 = interpretInput(val2);
    return val1.isLesser(val2) ? val1 : val2;
  }

  /**
   * Calculates the greatest common divisor (GCD) using binary GCD algorithm.
   * @param {WholeNumber|number|string} val1 - First value.
   * @param {WholeNumber|number|string} val2 - Second value.
   * @returns {WholeNumber} The GCD.
   */
  function greatestCommonDivisor(val1, val2) {
    val1 = interpretInput(val1).absoluteValue();
    val2 = interpretInput(val2).absoluteValue();
    if (val1.isEqualTo(val2)) return val1;
    if (val1.isValZero()) return val2;
    if (val2.isValZero()) return val1;

    var commonFactor = WholeNumber[1],
      powerOfTwoFactor,
      tempSwap;

    // Remove common factors of 2.
    while (val1.isParityEven() && val2.isParityEven()) {
      powerOfTwoFactor = Math.min(estimateLowestBit(val1), estimateLowestBit(val2));
      val1 = val1.getQuotient(powerOfTwoFactor);
      val2 = val2.getQuotient(powerOfTwoFactor);
      commonFactor = commonFactor.multiply(powerOfTwoFactor);
    }
    // Remove factors of 2 from remaining odd number.
    while (val1.isParityEven()) {
      val1 = val1.getQuotient(estimateLowestBit(val1));
    }

    // Main loop of binary GCD.
    do {
      while (val2.isParityEven()) {
        val2 = val2.getQuotient(estimateLowestBit(val2));
      }
      if (val1.isGreater(val2)) {
        tempSwap = val2;
        val2 = val1;
        val1 = tempSwap;
      }
      val2 = val2.subtract(val1);
    } while (!val2.isValZero());

    return commonFactor.isOneOrMinusOne() ? val1 : val1.multiply(commonFactor);
  }

  /**
   * Calculates the least common multiple (LCM).
   * LCM(a,b) = |a*b| / GCD(a,b).
   * @param {WholeNumber|number|string} val1 - First value.
   * @param {WholeNumber|number|string} val2 - Second value.
   * @returns {WholeNumber} The LCM.
   */
  function leastCommonMultiple(val1, val2) {
    val1 = interpretInput(val1).absoluteValue();
    val2 = interpretInput(val2).absoluteValue();
    return val1.getQuotient(greatestCommonDivisor(val1, val2)).multiply(val2);
  }

  /**
   * Generates a random WholeNumber between two bounds (inclusive).
   * @param {WholeNumber|number|string} lower - Lower bound.
   * @param {WholeNumber|number|string} upper - Upper bound.
   * @returns {WholeNumber} A random WholeNumber.
   */
  function randomBetweenNumbers(lower, upper) {
    var lowerBound = minimumValue(interpretInput(lower), interpretInput(upper)),
      upperBound = maximumValue(interpretInput(lower), interpretInput(upper));
    var valueRange = upperBound.subtract(lowerBound).add(1);

    if (valueRange.isCompact)
      return lowerBound.add(Math.floor(Math.random() * valueRange.magnitude));

    var rangeLength = valueRange.magnitude.length - 1;
    var randomChunks = [],
      isRestricted = true; // True if digits are still restricted by the range's digits.

    for (var idx = rangeLength; idx >= 0; idx--) {
      var currentMaxDigit = isRestricted ? valueRange.magnitude[idx] : CHUNK_SIZE;
      var randomDigit = floorOrCeil(Math.random() * currentMaxDigit);
      randomChunks.unshift(randomDigit);
      if (randomDigit < currentMaxDigit) isRestricted = false; // Once a digit is smaller, subsequent can be anything up to CHUNK_SIZE-1.
    }
    randomChunks = digitsToCompact(randomChunks);
    return lowerBound.add(
      typeof randomChunks === "number" ? new CompactWholeNumber(randomChunks) : new LargeWholeNumber(randomChunks, false)
    );
  }

  // --- Parsing Functions ---

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} textInput - The string to parse.
   * @param {number} baseVal - The base (radix).
   * @returns {WholeNumber} The parsed number.
   */
  var parseBaseString = function (textInput, baseVal) {
    var inputLength = textInput.length;
    var idx;
    var absoluteBase = Math.abs(baseVal);

    // Initial validation of digits for the given base.
    for (idx = 0; idx < inputLength; idx++) {
      var currentChar = textInput[idx].toLowerCase();
      if (currentChar === "-") continue;
      if (/[a-z0-9]/.test(currentChar)) {
        if (/[0-9]/.test(currentChar) && +currentChar >= absoluteBase) {
          if (currentChar === "1" && absoluteBase === 1) continue;
          throw new Error(currentChar + " is not a valid digit in base " + baseVal + ".");
        } else if (currentChar.charCodeAt(0) - 87 >= absoluteBase) {
          throw new Error(currentChar + " is not a valid digit in base " + baseVal + ".");
        }
      }
    }

    // Optimized path for common bases that fit into JS numbers.
    if (2 <= baseVal && baseVal <= 36) {
      if (inputLength <= LOG_MAX_JS_VAL / Math.log(baseVal)) {
        var parsedResult = parseInt(textInput, baseVal);
        if (isNaN(parsedResult)) {
          throw new Error(currentChar + " is not a valid digit in base " + baseVal + ".");
        }
        return new CompactWholeNumber(parseInt(textInput, baseVal));
      }
    }

    baseVal = interpretInput(baseVal); // Convert base to WholeNumber.
    var digitChunks = [];
    var isResultNegative = textInput[0] === "-";
    for (idx = isResultNegative ? 1 : 0; idx < textInput.length; idx++) {
      var currentChar = textInput[idx].toLowerCase(),
        charNumericCode = currentChar.charCodeAt(0);
      if (48 <= charNumericCode && charNumericCode <= 57)
        digitChunks.push(interpretInput(currentChar));
      else if (97 <= charNumericCode && charNumericCode <= 122)
        digitChunks.push(interpretInput(currentChar.charCodeAt(0) - 87));
      else if (currentChar === "<") {
        var subStrStart = idx;
        do {
          idx++;
        } while (textInput[idx] !== ">");
        digitChunks.push(interpretInput(textInput.slice(subStrStart + 1, idx))); // Handle custom digits like <10>.
      } else throw new Error(currentChar + " is not a valid character");
    }
    return parseDigitsWithBase(digitChunks, baseVal, isResultNegative);
  };

  /**
   * Constructs a WholeNumber from an array of digit chunks and a base.
   * @param {WholeNumber[]} digitArr - Array of WholeNumber digits.
   * @param {WholeNumber} baseVal - The base.
   * @param {boolean} isNegative - Whether the result should be negative.
   * @returns {WholeNumber} The constructed number.
   */
  function parseDigitsWithBase(digitArr, baseVal, isNegative) {
    var accumulatedValue = WholeNumber[0],
      currentPower = WholeNumber[1],
      idx;
    for (idx = digitArr.length - 1; idx >= 0; idx--) {
      accumulatedValue = accumulatedValue.add(digitArr[idx].times(currentPower));
      currentPower = currentPower.times(baseVal);
    }
    return isNegative ? accumulatedValue.invertPolarity() : accumulatedValue;
  }

  // --- String Conversion Functions ---

  /**
   * Converts a single digit (0-35) to its string representation.
   * @param {number} digitVal - The digit.
   * @returns {string} The string representation.
   */
  function digitToString(digitVal) {
    if (digitVal <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitVal);
    }
    return "<" + digitVal + ">"; // For digits > 35, use custom format.
  }

  /**
   * Converts a WholeNumber to an array of digits in a specified base.
   * @param {WholeNumber} numToConvert - The number.
   * @param {WholeNumber} targetBase - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and polarity.
   */
  function convertToBaseDigits(numToConvert, targetBase) {
    targetBase = largeNum(targetBase);
    if (targetBase.isValZero()) {
      if (numToConvert.isValZero()) return { value: [0], isNegative: false };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (targetBase.isEqualTo(-1)) {
      if (numToConvert.isValZero()) return { value: [0], isNegative: false };
      if (numToConvert.hasNegativePolarity())
        return {
          value: [].concat.apply([], Array.apply(null, Array(-numToConvert.magnitude)).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false,
        };
      var alternatingPattern = Array.apply(null, Array(+numToConvert.magnitude - 1)).map(Array.prototype.valueOf, [0, 1]);
      alternatingPattern.unshift([1]);
      return { value: [].concat.apply([], alternatingPattern), isNegative: false };
    }

    var isResultNegative = false;
    if (numToConvert.hasNegativePolarity() && targetBase.hasPositivePolarity()) {
      isResultNegative = true;
      numToConvert = numToConvert.absoluteValue();
    }
    if (targetBase.isEqualTo(1)) {
      if (numToConvert.isValZero()) return { value: [0], isNegative: false };
      return {
        value: Array.apply(null, Array(+numToConvert.magnitude)).map(Number.prototype.valueOf, 1),
        isNegative: isResultNegative,
      };
    }

    var outputDigits = [];
    var remainingValue = numToConvert,
      divisionResult;
    while (remainingValue.hasNegativePolarity() || remainingValue.compareMagnitudes(targetBase) >= 0) {
      divisionResult = remainingValue.divmod(targetBase);
      remainingValue = divisionResult.quotient;
      var currentDigit = divisionResult.remainder;
      if (currentDigit.hasNegativePolarity()) {
        currentDigit = targetBase.minus(currentDigit).absoluteValue();
        remainingValue = remainingValue.increment();
      }
      outputDigits.push(currentDigit.toJavaScriptNumber());
    }
    outputDigits.push(remainingValue.toJavaScriptNumber());
    return { value: outputDigits.reverse(), isNegative: isResultNegative };
  }

  LargeWholeNumber.prototype.toDigitArray = function (targetBase) {
    return convertToBaseDigits(this, targetBase);
  };
  CompactWholeNumber.prototype.toDigitArray = function (targetBase) {
    return convertToBaseDigits(this, targetBase);
  };

  LargeWholeNumber.prototype.toTextRepresentation = function (targetBase) {
    if (targetBase === undefined) targetBase = 10;
    if (targetBase !== 10) return convertToBaseString(this, targetBase);

    var numDigits = this.magnitude,
      digitCount = numDigits.length,
      textOutput = String(numDigits[--digitCount]),
      zeroPadding = "0000000",
      currentDigit;

    while (--digitCount >= 0) {
      currentDigit = String(numDigits[digitCount]);
      textOutput += zeroPadding.slice(currentDigit.length) + currentDigit; // Pad with leading zeros.
    }
    var currentPolarity = this.polarity ? "-" : "";
    return currentPolarity + textOutput;
  };
  CompactWholeNumber.prototype.toTextRepresentation = function (targetBase) {
    if (targetBase === undefined) targetBase = 10;
    if (targetBase != 10) return convertToBaseString(this, targetBase);
    return String(this.magnitude);
  };

  function convertToBaseString(numToConvert, targetBase) {
    var digitArrayResult = convertToBaseDigits(numToConvert, targetBase);
    return (digitArrayResult.isNegative ? "-" : "") + digitArrayResult.value.map(digitToString).join("");
  }

  LargeWholeNumber.prototype.toJsonFormat = CompactWholeNumber.prototype.toJsonFormat = function () {
    return this.toTextRepresentation();
  };

  LargeWholeNumber.prototype.getValueAsNumber = function () {
    return parseInt(this.toTextRepresentation(), 10);
  };
  LargeWholeNumber.prototype.toJavaScriptNumber = LargeWholeNumber.prototype.getValueAsNumber;

  CompactWholeNumber.prototype.getValueAsNumber = function () {
    return this.magnitude;
  };
  CompactWholeNumber.prototype.toJavaScriptNumber = CompactWholeNumber.prototype.getValueAsNumber;

  /**
   * Parses a string input into a WholeNumber. Handles scientific notation.
   * @param {string} strInput - The string to parse.
   * @returns {WholeNumber} The parsed number.
   * @throws {Error} If the string is not a valid integer.
   */
  function interpretString(strInput) {
    // Attempt to parse as a standard JS number first.
    if (isStandardSafe(+strInput)) {
      var numericAttempt = +strInput;
      if (numericAttempt === floorOrCeil(numericAttempt)) return new CompactWholeNumber(numericAttempt);
      throw new Error("Invalid integer: " + strInput);
    }

    var isNegative = strInput[0] === "-";
    if (isNegative) strInput = strInput.slice(1);

    var parts = strInput.split(/e/i); // Split by 'e' for scientific notation.
    if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));

    if (parts.length === 2) {
      var exponentVal = parts[1];
      if (exponentVal[0] === "+") exponentVal = exponentVal.slice(1);
      exponentVal = +exponentVal; // Convert exponent to number.

      if (exponentVal !== floorOrCeil(exponentVal) || !isStandardSafe(exponentVal))
        throw new Error("Invalid integer: " + exponentVal + " is not a valid exponent.");

      var numericPart = parts[0];
      var dotPosition = numericPart.indexOf(".");
      if (dotPosition >= 0) {
        exponentVal -= numericPart.length - dotPosition - 1; // Adjust exponent for decimal places.
        numericPart = numericPart.slice(0, dotPosition) + numericPart.slice(dotPosition + 1); // Remove decimal.
      }
      if (exponentVal < 0) throw new Error("Cannot include negative exponent part for integers");
      numericPart += new Array(exponentVal + 1).join("0"); // Pad with zeros for exponent.
      strInput = numericPart;
    }

    var isStringValid = /^([0-9][0-9]*)$/.test(strInput);
    if (!isStringValid) throw new Error("Invalid integer: " + strInput);

    var resultChunks = [],
      maxLength = strInput.length,
      chunkSize = CHUNK_DIGITS,
      minLength = maxLength - chunkSize;

    // Split string into chunks.
    while (maxLength > 0) {
      resultChunks.push(+strInput.slice(minLength, maxLength));
      minLength -= chunkSize;
      if (minLength < 0) minLength = 0;
      maxLength -= chunkSize;
    }
    normalizeDigits(resultChunks); // Remove leading zeros if any.
    return new LargeWholeNumber(resultChunks, isNegative);
  }

  /**
   * Parses a number input into a WholeNumber.
   * @param {number} numInput - The number to parse.
   * @returns {WholeNumber} The parsed number.
   * @throws {Error} If the number is not an integer.
   */
  function interpretNumber(numInput) {
    if (isStandardSafe(numInput)) {
      if (numInput !== floorOrCeil(numInput)) throw new Error(numInput + " is not an integer.");
      return new CompactWholeNumber(numInput);
    }
    return interpretString(numInput.toString()); // Fallback to string parsing for very large JS numbers.
  }

  /**
   * Interprets any value (number, string, or existing WholeNumber) into a WholeNumber instance.
   * @param {any} inputVal - The value to interpret.
   * @returns {WholeNumber} A WholeNumber instance.
   */
  function interpretAnyValue(inputVal) {
    if (typeof inputVal === "number") {
      return interpretNumber(inputVal);
    }
    if (typeof inputVal === "string") {
      return interpretString(inputVal);
    }
    return inputVal; // Assume it's already a WholeNumber instance.
  }

  // Pre-populate small integer cache for performance.
  for (var i = 0; i < 1000; i++) {
    WholeNumber[i] = new CompactWholeNumber(i);
    if (i > 0) WholeNumber[-i] = new CompactWholeNumber(-i);
  }

  // --- Static properties and methods of the WholeNumber factory ---
  WholeNumber.unitValue = WholeNumber[1];
  WholeNumber.nullValue = WholeNumber[0];
  WholeNumber.negUnitValue = WholeNumber[-1];
  WholeNumber.maximumValue = maximumValue;
  WholeNumber.minimumValue = minimumValue;
  WholeNumber.greatestCommonDivisor = greatestCommonDivisor;
  WholeNumber.leastCommonMultiple = leastCommonMultiple;
  WholeNumber.isInstanceCheck = function (instance) {
    return instance instanceof LargeWholeNumber || instance instanceof CompactWholeNumber;
  };
  WholeNumber.randomBetweenNumbers = randomBetweenNumbers;
  WholeNumber.createFromDigitArray = function (digitArr, baseVal, isNegative) {
    return parseDigitsWithBase(
      digitArr.map(interpretAnyValue),
      interpretAnyValue(baseVal || 10),
      isNegative
    );
  };
  return WholeNumber;
})();

// --- Input Reader Module ---
var INPUT_READER_FACTORY = (function () {
  /**
   * Creates an InputProcessor instance.
   * @param {string} sourceText - The entire input text.
   * @returns {InputProcessor} A new InputProcessor.
   */
  function createReader(sourceText) {
    return new InputProcessor(sourceText);
  }

  /**
   * Processes input text line by line and token by token.
   * @param {string} sourceText - The input text.
   */
  function InputProcessor(sourceText) {
    this.lineData = sourceText.trim().split("\n"); // Split input into lines.
    this.currentLineIndex = 0; // Current line being processed.
  }

  /**
   * Reads a single token from the current line.
   * @param {boolean} asString - If true, return as string; otherwise, return as number.
   * @returns {string|number} The token.
   */
  InputProcessor.prototype.readSingle = function (asString) {
    var lines = this.lineData,
      lineIdx = this.currentLineIndex,
      tokenResult;
    // If the current line hasn't been tokenized yet, do it (and reverse for pop efficiency).
    if (typeof lines[lineIdx] === "string") lines[lineIdx] = lines[lineIdx].split(" ").reverse();
    tokenResult = lines[lineIdx].pop();
    // If the line is exhausted, move to the next.
    if (!lines[lineIdx].length) this.currentLineIndex++;
    return asString ? tokenResult : +tokenResult; // Convert to number if not explicitly string.
  };

  /**
   * Reads an entire line as a list of tokens.
   * @param {boolean} asString - If true, return tokens as strings; otherwise, as numbers.
   * @returns {string[]|number[]} Array of tokens.
   */
  InputProcessor.prototype.readList = function (asString) {
    var lineTokens = this.lineData[this.currentLineIndex++].split(" ");
    return asString ? lineTokens : lineTokens.map((val) => +val); // Map to numbers.
  };

  /**
   * Reads 'numLines' lines as a matrix of tokens.
   * @param {number} numLines - Number of lines to read.
   * @param {boolean} asString - If true, return tokens as strings; otherwise, as numbers.
   * @returns {string[][]|number[][]} 2D array (matrix) of tokens.
   */
  InputProcessor.prototype.readMatrix = function (numLines, asString) {
    var matrixLines = this.lineData
      .slice(this.currentLineIndex, (this.currentLineIndex += numLines))
      .map((line) => line.split(" "));
    return asString ? matrixLines : matrixLines.map((row) => row.map((val) => +val)); // Map all elements to numbers.
  };

  /**
   * Reads 'numLines' lines as raw strings or numbers.
   * @param {number} numLines - Number of lines to read.
   * @param {boolean} asString - If true, return lines as raw strings; otherwise, as numbers.
   * @returns {string[]|number[]} Array of lines.
   */
  InputProcessor.prototype.readRawLines = function (numLines, asString) {
    var rawLines = this.lineData.slice(this.currentLineIndex, (this.currentLineIndex += numLines));
    return asString ? rawLines : rawLines.map((val) => +val); // Map to numbers.
  };

  return createReader;
})();

// Create an input processor instance, reading from stdin.
var inputProcessor = INPUT_READER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a value.
 * @param {any} initVal - The initial value for all elements.
 * @param {number[]} dimensions - The dimensions of the array.
 * @returns {any} The multi-dimensional array.
 */
function multiDimArray(initVal) {
  var dimensions = arguments,
    dimCount = dimensions.length,
    arrayCreationCode = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initVal + ";})";
  while (--dimCount)
    arrayCreationCode = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationCode + ")";
  return eval(arrayCreationCode); // Use eval to dynamically create nested arrays.
}

var moduloVal; // Global variable for the current modulus.
var zeroLargeNum = largeNum(); // Initialize a LargeNumber instance representing zero.

/**
 * Performs modular multiplication for multiple arguments.
 * (r * a[1] * a[2] * ... ) % moduloVal
 * This implementation is specific to the original code's chunking for intermediate products.
 * @param {number} currentProduct - The initial value (a[0]).
 * @param {...number} factors - Subsequent factors to multiply.
 * @returns {number} The modular product.
 */
function matrixElemMod() {
  var allFactors = arguments,
    accumulatedProduct = allFactors[0],
    factorIndex = 1;
  while (factorIndex < allFactors.length) {
    // This calculation is specific to how the original handles large intermediate products
    // by splitting a number into two 16-bit halves: (high_16 * 65536 + low_16) * factor
    // and then taking modulo.
    accumulatedProduct =
      ((accumulatedProduct >> 16) * allFactors[factorIndex] % moduloVal * 65536 +
        (accumulatedProduct & 65535) * allFactors[factorIndex++]) %
      moduloVal;
  }
  return accumulatedProduct;
}

/**
 * Calculates (baseValue ^ exponentValue) % moduloVal using binary exponentiation.
 * @param {number} baseValue - The base.
 * @param {number} exponentValue - The exponent.
 * @returns {number} The modular power.
 */
function singleValPowerMod(baseValue, exponentValue) {
  var resultAccumulator = 1;
  for (; exponentValue; baseValue = matrixElemMod(baseValue, baseValue), exponentValue >>= 1)
    if (exponentValue & 1) resultAccumulator = matrixElemMod(baseValue, resultAccumulator);
  return resultAccumulator;
}

// Log the result of the main computation.
console.log(computeSolution());

/**
 * Main function to solve the problem.
 * Reads input values L, A, B, and MOD, then performs matrix exponentiation.
 * @returns {number} The final computed value.
 */
function computeSolution() {
  // Read input values.
  var limitValStr = inputProcessor.readSingle(1);
  var startValStr = inputProcessor.readSingle(1);
  var stepValStr = inputProcessor.readSingle(1);

  // Convert to large numbers.
  var limitBig = zeroLargeNum.add(limitValStr);
  var startBig = zeroLargeNum.add(startValStr);
  var stepBig = zeroLargeNum.add(stepValStr);

  // Read modulus and convert initial string values to numbers for other uses.
  moduloVal = inputProcessor.readSingle();
  limitValStr = +limitValStr;
  startValStr = +startValStr;
  stepValStr = +stepValStr;

  // Initialize data structures.
  var segmentCounts = multiDimArray(zeroLargeNum, 19); // Array to store counts for each digit length.
  var finalResultMatrix = [
    [0, 0, 1],
  ]; // Initial matrix for accumulation.
  var currentSumBig = zeroLargeNum; // Current sum of lengths processed.

  // Loop through digit lengths (from 1 to 18).
  for (var lengthIndex = 1; lengthIndex < 19 && !currentSumBig.minus(limitBig).isValZero(); lengthIndex++) {
    // Calculate 10^lengthIndex - 1 (e.g., 9, 99, 999...).
    var powerOfTenMinusOne = largeNum(10).exponentiate(lengthIndex).minus(1);

    // Calculate count of numbers of current length that fit the arithmetic progression.
    segmentCounts[lengthIndex] = powerOfTenMinusOne
      .minus(startBig)
      .add(stepBig)
      .getQuotient(stepBig)
      .minus(currentSumBig);

    if (segmentCounts[lengthIndex].isValZero()) continue; // Skip if no numbers of this length.

    // Adjust count if adding it exceeds the total limit.
    if (currentSumBig.add(segmentCounts[lengthIndex]).isGreater(limitBig))
      segmentCounts[lengthIndex] = limitBig.minus(currentSumBig);

    // Define the transformation matrix for this segment length.
    // [10^L, 0, 0]
    // [1,    1, 0]
    // [0,    B, 1] (B is stepBig.mod(moduloVal))
    var transformMatrix = matrixExponentiation(
      [
        [singleValPowerMod(10, lengthIndex), 0, 0],
        [1, 1, 0],
        [0, +stepBig.moduloOp(moduloVal), 1],
      ],
      segmentCounts[lengthIndex]
    );

    // Update the initial value in the result matrix for modular arithmetic.
    finalResultMatrix[0][1] = +stepBig.times(currentSumBig).add(startBig).moduloOp(moduloVal);

    // Apply the transformation matrix.
    finalResultMatrix = matrixMultiplication(finalResultMatrix, transformMatrix);

    // Update the current sum of lengths.
    currentSumBig = currentSumBig.add(segmentCounts[lengthIndex]);
  }
  return finalResultMatrix[0][0]; // Return the final computed value.
}

/**
 * Computes matrix ^ exponentValue (mod moduloVal) using binary exponentiation.
 * @param {number[][]} baseMatrix - The base matrix.
 * @param {WholeNumber} powerExponent - The exponent (as a WholeNumber).
 * @returns {number[][]} The resulting matrix.
 */
function matrixExponentiation(baseMatrix, powerExponent) {
  var matrixDim = baseMatrix.length,
    identityMatrix = multiDimArray(0, matrixDim, matrixDim);
  // Initialize identity matrix.
  for (var idx = 0; idx < matrixDim; idx++) identityMatrix[idx][idx] = 1;

  // Binary exponentiation loop.
  while (!powerExponent.isValZero()) {
    if (!powerExponent.and(1).isValZero()) identityMatrix = matrixMultiplication(identityMatrix, baseMatrix);
    baseMatrix = matrixMultiplication(baseMatrix, baseMatrix);
    powerExponent = powerExponent.getQuotient(2); // Divide exponent by 2.
  }
  return identityMatrix;
}

/**
 * Multiplies two matrices modulo moduloVal.
 * @param {number[][]|number[]} matrixA - First matrix (or row vector).
 * @param {number[][]|number[]} matrixB - Second matrix (or column vector).
 * @returns {number[][]} The resulting matrix.
 */
function matrixMultiplication(matrixA, matrixB) {
  var processedA, processedB;
  // Ensure matrixA is 2D.
  if (typeof matrixA[0] === "object") processedA = matrixA;
  else processedA = [matrixA]; // Convert row vector to 1xN matrix.
  // Ensure matrixB is 2D.
  if (typeof matrixB[0] === "object") processedB = matrixB;
  else processedB = [matrixB]; // Convert column vector to Nx1 matrix, or row vector if single element.

  var rowsA = processedA.length,
    colsB = processedB[0].length;
  var resultMatrix = multiDimArray(0, rowsA, colsB);

  // Standard matrix multiplication.
  for (var rowIdx = 0; rowIdx < rowsA; rowIdx++) {
    for (var colIdx = 0; colIdx < colsB; colIdx++) {
      for (var innerIdx = 0; innerIdx < processedB.length; innerIdx++) {
        resultMatrix[rowIdx][colIdx] += matrixElemMod(processedA[rowIdx][innerIdx], processedB[innerIdx][colIdx]);
      }
      resultMatrix[rowIdx][colIdx] %= moduloVal; // Apply modulo to each element.
    }
  }
  return resultMatrix;
}