var largeNumProcessor = (function (voidVal) {
  "use strict";

  // The base (radix) for our internal number representation, e.g., 10^7 for 7-digit chunks.
  var CHUNK_RADIX = 1e7;
  // The logarithm (base 10) of the chunk radix, indicating the number of decimal digits per chunk.
  var LOG_CHUNK_RADIX = 7;
  // The maximum safe integer value that JavaScript can precisely represent (2^53 - 1).
  var JS_MAX_SAFE_INTEGER = 9007199254740992;
  // The representation of JS_MAX_SAFE_INTEGER as an array of internal chunks.
  var JS_MAX_SAFE_CHUNKS = convertJsNumToChunkArray(JS_MAX_SAFE_INTEGER);
  // The natural logarithm of the maximum safe integer, used for base conversion checks.
  var LOG_JS_MAX_SAFE = Math.log(JS_MAX_SAFE_INTEGER);

  /**
   * Main constructor function for arbitrary-precision numbers.
   * This function acts as a factory, returning either a SimpleNumber or an ExtendedNumber.
   *
   * @param {number|string|NumBaseType} inputVal - The value to be converted into a large number instance.
   * @param {number} [numBase] - Optional. The base of the input string if `inputVal` is a string and not base 10.
   * @returns {NumBaseType} An instance of either SimpleNumber or ExtendedNumber.
   */
  function NumBaseType(inputVal, numBase) {
    // If no value is provided, return the pre-cached zero instance.
    if (typeof inputVal === "undefined") return NumBaseType[0];

    // If a numerical base is specified, handle it.
    if (typeof numBase !== "undefined") {
      // If the base is 10, parse as a standard number. Otherwise, parse as a string in the given base.
      return +numBase === 10 ? parseInputToNumber(inputVal) : parseStringInBase(inputVal, numBase);
    }

    // Default behavior: parse the input value directly.
    return parseInputToNumber(inputVal);
  }

  /**
   * Represents a large, arbitrary-precision number that exceeds JavaScript's safe integer limits.
   * These numbers are stored as arrays of 'chunks' (digits in a large base).
   *
   * @param {number[]} components - An array of number chunks, representing the magnitude.
   * @param {boolean} isNegative - A boolean flag indicating if the number is negative.
   */
  function ExtendedNumber(components, isNegative) {
    this.components = components; // The array of chunks (e.g., [123, 456, 789] for 789456123).
    this.isNegative = isNegative; // true if the number is negative, false otherwise.
    this.isPrimitive = false; // Flag indicating this is not a standard JS number.
  }
  // Inherit all methods and properties from the NumBaseType prototype.
  ExtendedNumber.prototype = Object.create(NumBaseType.prototype);

  /**
   * Represents a small number that can be precisely and safely stored as a standard JavaScript number.
   *
   * @param {number} primitiveValue - The actual JavaScript number.
   */
  function SimpleNumber(primitiveValue) {
    this.components = primitiveValue; // The raw JavaScript number value.
    this.isNegative = primitiveValue < 0; // Sign derived directly from the primitive value.
    this.isPrimitive = true; // Flag indicating this IS a standard JS number.
  }
  // Inherit all methods and properties from the NumBaseType prototype.
  SimpleNumber.prototype = Object.create(NumBaseType.prototype);

  /**
   * Checks if a given number falls within JavaScript's safe integer range (-(2^53 - 1) to (2^53 - 1)).
   *
   * @param {number} checkNum - The number to check.
   * @returns {boolean} True if the number is within the safe range, false otherwise.
   */
  function isWithinSafeRange(checkNum) {
    return -JS_MAX_SAFE_INTEGER < checkNum && checkNum < JS_MAX_SAFE_INTEGER;
  }

  /**
   * Converts a standard JavaScript number into an array of chunks, suitable for ExtendedNumber representation.
   * This is used when a primitive number needs to be handled as an array of larger digits.
   *
   * @param {number} smallNum - The JavaScript number to convert.
   * @returns {number[]} An array of chunks.
   */
  function convertJsNumToChunkArray(smallNum) {
    if (smallNum < 1e7) return [smallNum]; // If less than 10^7, it's a single chunk.
    if (smallNum < 1e14) return [smallNum % 1e7, Math.floor(smallNum / 1e7)]; // If less than 10^14, two chunks.
    // For larger numbers (up to 10^21, which is beyond safe int limits but demonstrates structure), three chunks.
    return [smallNum % 1e7, Math.floor(smallNum / 1e7) % 1e7, Math.floor(smallNum / 1e14)];
  }

  /**
   * Attempts to convert an array of chunks back into a single JavaScript number if it fits within the safe integer range.
   * If it's too large, the original chunk array is returned.
   *
   * @param {number[]} chunkArr - The array of chunks to convert.
   * @returns {number|number[]} The primitive number or the original chunk array.
   */
  function convertChunksToJsNum(chunkArr) {
    normalizeChunkArray(chunkArr); // Remove any leading zero chunks.
    var currentLength = chunkArr.length;
    // Only attempt conversion if the chunk array is small enough (max 3 chunks for JS_MAX_SAFE_INTEGER).
    if (currentLength < 4 && compareChunkMagnitudes(chunkArr, JS_MAX_SAFE_CHUNKS) < 0) {
      switch (currentLength) {
        case 0:
          return 0; // Empty array means zero.
        case 1:
          return chunkArr[0]; // Single chunk.
        case 2:
          return chunkArr[0] + chunkArr[1] * CHUNK_RADIX; // Two chunks combined.
        default:
          return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_RADIX) * CHUNK_RADIX; // Three chunks combined.
      }
    }
    return chunkArr; // If too large, return the chunk array as is.
  }

  /**
   * Removes leading zero chunks from a number's chunk array representation.
   * This ensures the representation is canonical and avoids unnecessary computations.
   *
   * @param {number[]} chunkVector - The array of chunks to trim.
   */
  function normalizeChunkArray(chunkVector) {
    var vectorIndex = chunkVector.length;
    // Iterate from the end to find the first non-zero chunk.
    while (vectorIndex-- > 0 && chunkVector[vectorIndex] === 0);
    // Adjust the length of the array to exclude trailing zeros.
    chunkVector.length = vectorIndex + 1;
  }

  /**
   * Creates a new array of a specified length, with all elements initialized to zero.
   * This is a helper for various arithmetic operations.
   *
   * @param {number} desiredLength - The desired length of the new array.
   * @returns {number[]} A new array filled with zeros.
   */
  function makeZeroFilledArray(desiredLength) {
    var freshArray = new Array(desiredLength);
    var arrIterator = -1;
    while (++arrIterator < desiredLength) {
      freshArray[arrIterator] = 0;
    }
    return freshArray;
  }

  /**
   * Truncates a floating-point number towards zero.
   * For positive numbers, it's equivalent to Math.floor(). For negative, Math.ceil().
   *
   * @param {number} numToTruncate - The number to truncate.
   * @returns {number} The truncated integer value.
   */
  function floorOrCeil(numToTruncate) {
    if (numToTruncate > 0) return Math.floor(numToTruncate);
    return Math.ceil(numToTruncate);
  }

  /**
   * Adds two chunk arrays, assuming both represent positive numbers.
   * This is a standard elementary school addition algorithm, carrying over digits.
   *
   * @param {number[]} firstArr - The first operand's chunk array.
   * @param {number[]} secondArr - The second operand's chunk array.
   * @returns {number[]} A new chunk array representing the sum.
   */
  function sumChunkArrays(firstArr, secondArr) {
    var lenA = firstArr.length,
      lenB = secondArr.length,
      // Result array size is at most the length of the longer operand + 1 for carry.
      resultArr = new Array(lenA),
      currentCarry = 0,
      baseValue = CHUNK_RADIX,
      currentSum,
      iterator;

    // Add corresponding chunks up to the length of the shorter array.
    for (iterator = 0; iterator < lenB; iterator++) {
      currentSum = firstArr[iterator] + secondArr[iterator] + currentCarry;
      currentCarry = currentSum >= baseValue ? 1 : 0; // Determine if a carry is needed.
      resultArr[iterator] = currentSum - currentCarry * baseValue; // Store the current chunk's digit.
    }
    // Propagate carry through remaining chunks of the longer array.
    while (iterator < lenA) {
      currentSum = firstArr[iterator] + currentCarry;
      currentCarry = currentSum === baseValue ? 1 : 0; // Check if carry is still 1.
      resultArr[iterator++] = currentSum - currentCarry * baseValue;
    }
    // If there's a final carry, push it as a new most significant chunk.
    if (currentCarry > 0) {
      resultArr.push(currentCarry);
    }
    return resultArr;
  }

  /**
   * Adds two chunk arrays, ensuring the first array passed to `sumChunkArrays` is the longer one.
   * This simplifies the logic within `sumChunkArrays`.
   *
   * @param {number[]} arr1 - The first chunk array.
   * @param {number[]} arr2 - The second chunk array.
   * @returns {number[]} A new chunk array representing the sum.
   */
  function sumAnyChunkArrays(arr1, arr2) {
    if (arr1.length >= arr2.length) return sumChunkArrays(arr1, arr2);
    return sumChunkArrays(arr2, arr1);
  }

  /**
   * Adds a small, primitive integer value (effectively a carry) to a chunk array.
   * This is optimized for adding/subtracting 1 or other small numbers.
   *
   * @param {number[]} chunkList - The chunk array to modify.
   * @param {number} smallCarry - The small integer value to add (can be positive or negative).
   * @returns {number[]} A new chunk array with the small value added.
   */
  function sumChunksWithSmallCarry(chunkList, smallCarry) {
    var currentLength = chunkList.length,
      resultList = new Array(currentLength),
      baseValue = CHUNK_RADIX,
      currentSum,
      iterator;

    for (iterator = 0; iterator < currentLength; iterator++) {
      // Logic for adding a small carry (which can be negative for subtraction).
      currentSum = chunkList[iterator] - baseValue + smallCarry; // Subtract base to handle negative results.
      smallCarry = Math.floor(currentSum / baseValue); // Calculate new carry.
      resultList[iterator] = currentSum - smallCarry * baseValue; // Store current chunk.
      smallCarry += 1; // Adjust carry for next iteration (compensate for initial -baseValue).
    }
    // Propagate any remaining carry.
    while (smallCarry > 0) {
      resultList[iterator++] = smallCarry % baseValue;
      smallCarry = Math.floor(smallCarry / baseValue);
    }
    return resultList;
  }

  /**
   * Prototype method for adding another number to an ExtendedNumber instance.
   *
   * @param {number|string|NumBaseType} otherVal - The value to add.
   * @returns {ExtendedNumber} A new ExtendedNumber instance representing the sum.
   */
  ExtendedNumber.prototype.add = function (otherVal) {
    var otherNum = parseInputToNumber(otherVal); // Normalize the other operand.

    // If signs are different, it's effectively a subtraction.
    if (this.isNegative !== otherNum.isNegative) {
      return this.subtract(otherNum.invertSign()); // Subtract the absolute value.
    }

    var currentChunks = this.components,
      otherChunks = otherNum.components;
    // If the other number is a SimpleNumber, use the optimized small carry addition.
    if (otherNum.isPrimitive) {
      return new ExtendedNumber(sumChunksWithSmallCarry(currentChunks, Math.abs(otherChunks)), this.isNegative);
    }
    // Otherwise, perform general chunk array addition.
    return new ExtendedNumber(sumAnyChunkArrays(currentChunks, otherChunks), this.isNegative);
  };
  ExtendedNumber.prototype.plus = ExtendedNumber.prototype.add; // Alias for 'add'.

  /**
   * Prototype method for adding another number to a SimpleNumber instance.
   *
   * @param {number|string|NumBaseType} otherVal - The value to add.
   * @returns {NumBaseType} A new NumBaseType instance (SimpleNumber or ExtendedNumber) representing the sum.
   */
  SimpleNumber.prototype.add = function (otherVal) {
    var otherNum = parseInputToNumber(otherVal); // Normalize the other operand.
    var selfValue = this.components;

    // If signs are different, it's effectively a subtraction.
    if (selfValue < 0 !== otherNum.isNegative) {
      return this.subtract(otherNum.invertSign());
    }

    var otherValue = otherNum.components;
    if (otherNum.isPrimitive) {
      // If both are SimpleNumbers, try primitive addition.
      if (isWithinSafeRange(selfValue + otherValue)) {
        return new SimpleNumber(selfValue + otherValue);
      }
      // If the sum exceeds the safe range, convert the other value to chunks.
      otherValue = convertJsNumToChunkArray(Math.abs(otherValue));
    }
    // Add the current (small) value to the other (potentially chunk array) value.
    return new ExtendedNumber(sumChunksWithSmallCarry(otherValue, Math.abs(selfValue)), selfValue < 0);
  };
  SimpleNumber.prototype.plus = SimpleNumber.prototype.add; // Alias for 'add'.

  /**
   * Subtracts one chunk array from another, assuming the minuend (first array) is greater than or equal to the subtrahend (second array) in magnitude.
   * This is a standard elementary school subtraction algorithm, handling borrows.
   *
   * @param {number[]} minuendArr - The chunk array to subtract from.
   * @param {number[]} subtrahendArr - The chunk array to subtract.
   * @returns {number[]} A new chunk array representing the difference.
   */
  function diffChunkArrays(minuendArr, subtrahendArr) {
    var lenM = minuendArr.length,
      lenS = subtrahendArr.length,
      resultArr = new Array(lenM),
      currentBorrow = 0,
      baseValue = CHUNK_RADIX,
      currentDifference,
      iterator;

    // Subtract chunks up to the length of the subtrahend.
    for (iterator = 0; iterator < lenS; iterator++) {
      currentDifference = minuendArr[iterator] - currentBorrow - subtrahendArr[iterator];
      if (currentDifference < 0) {
        currentDifference += baseValue;
        currentBorrow = 1; // A borrow was needed.
      } else {
        currentBorrow = 0; // No borrow needed.
      }
      resultArr[iterator] = currentDifference;
    }
    // Propagate borrow through remaining chunks of the minuend.
    for (iterator = lenS; iterator < lenM; iterator++) {
      currentDifference = minuendArr[iterator] - currentBorrow;
      if (currentDifference < 0) {
        currentDifference += baseValue;
      } else {
        resultArr[iterator++] = currentDifference; // No more borrow, copy remaining digits.
        break;
      }
      resultArr[iterator] = currentDifference;
    }
    // Copy any remaining higher-order chunks from the minuend.
    for (; iterator < lenM; iterator++) {
      resultArr[iterator] = minuendArr[iterator];
    }
    normalizeChunkArray(resultArr); // Remove leading zeros.
    return resultArr;
  }

  /**
   * Performs subtraction between two chunk arrays, handling magnitude comparison and sign adjustment.
   * This function determines the correct order of subtraction based on absolute values.
   *
   * @param {number[]} arrX - The first chunk array.
   * @param {number[]} arrY - The second chunk array.
   * @param {boolean} currentSign - The sign of the original first operand (used for the result).
   * @returns {NumBaseType} A new NumBaseType instance representing the difference.
   */
  function diffAnyChunkArrays(arrX, arrY, currentSign) {
    var finalMagnitude;
    // Compare absolute magnitudes to determine which array is larger.
    if (compareChunkMagnitudes(arrX, arrY) >= 0) {
      finalMagnitude = diffChunkArrays(arrX, arrY); // arrX is larger or equal.
    } else {
      finalMagnitude = diffChunkArrays(arrY, arrX); // arrY is larger, so swap and flip sign.
      currentSign = !currentSign;
    }
    finalMagnitude = convertChunksToJsNum(finalMagnitude); // Attempt to convert result to SimpleNumber.
    if (typeof finalMagnitude === "number") {
      if (currentSign) finalMagnitude = -finalMagnitude;
      return new SimpleNumber(finalMagnitude);
    }
    return new ExtendedNumber(finalMagnitude, currentSign);
  }

  /**
   * Subtracts a small, primitive integer value from a chunk array, handling borrows.
   * This is an optimized path for `subtract(N, 1)` or similar operations.
   *
   * @param {number[]} chunkList - The chunk array (minuend).
   * @param {number} smallNum - The small integer value to subtract (subtrahend).
   * @param {boolean} currentSign - The sign of the original `chunkList`.
   * @returns {NumBaseType} A new NumBaseType instance representing the difference.
   */
  function diffChunksWithSmallBorrow(chunkList, smallNum, currentSign) {
    var currentLength = chunkList.length,
      resultList = new Array(currentLength),
      currentBorrow = -smallNum, // Start with negative smallNum as an initial 'borrow'.
      baseValue = CHUNK_RADIX,
      currentDifference,
      iterator;

    for (iterator = 0; iterator < currentLength; iterator++) {
      currentDifference = chunkList[iterator] + currentBorrow; // Add borrow (which is negative).
      currentBorrow = Math.floor(currentDifference / baseValue); // Calculate new borrow.
      currentDifference %= baseValue; // Get the current chunk digit.
      resultList[iterator] = currentDifference < 0 ? currentDifference + baseValue : currentDifference; // Ensure positive chunk.
    }
    resultList = convertChunksToJsNum(resultList); // Attempt to convert result to SimpleNumber.
    if (typeof resultList === "number") {
      if (currentSign) resultList = -resultList;
      return new SimpleNumber(resultList);
    }
    return new ExtendedNumber(resultList, currentSign);
  }

  /**
   * Prototype method for subtracting another number from an ExtendedNumber instance.
   *
   * @param {number|string|NumBaseType} otherVal - The value to subtract.
   * @returns {ExtendedNumber} A new ExtendedNumber instance representing the difference.
   */
  ExtendedNumber.prototype.subtract = function (otherVal) {
    var otherNum = parseInputToNumber(otherVal); // Normalize the other operand.

    // If signs are different, it's effectively an addition (e.g., 5 - (-3) = 5 + 3).
    if (this.isNegative !== otherNum.isNegative) {
      return this.add(otherNum.invertSign()); // Add the absolute value of the subtrahend.
    }

    var currentChunks = this.components,
      otherChunks = otherNum.components;
    // If the other number is a SimpleNumber, use the optimized small borrow subtraction.
    if (otherNum.isPrimitive) {
      return diffChunksWithSmallBorrow(currentChunks, Math.abs(otherChunks), this.isNegative);
    }
    // Otherwise, perform general chunk array subtraction.
    return diffAnyChunkArrays(currentChunks, otherChunks, this.isNegative);
  };
  ExtendedNumber.prototype.minus = ExtendedNumber.prototype.subtract; // Alias for 'subtract'.

  /**
   * Prototype method for subtracting another number from a SimpleNumber instance.
   *
   * @param {number|string|NumBaseType} otherVal - The value to subtract.
   * @returns {NumBaseType} A new NumBaseType instance (SimpleNumber or ExtendedNumber) representing the difference.
   */
  SimpleNumber.prototype.subtract = function (otherVal) {
    var otherNum = parseInputToNumber(otherVal); // Normalize the other operand.
    var selfValue = this.components;

    // If signs are different, it's effectively an addition.
    if (selfValue < 0 !== otherNum.isNegative) {
      return this.add(otherNum.invertSign());
    }

    var otherValue = otherNum.components;
    if (otherNum.isPrimitive) {
      // If both are SimpleNumbers, perform primitive subtraction.
      return new SimpleNumber(selfValue - otherValue);
    }
    // If this is a SimpleNumber and other is an ExtendedNumber.
    // The logic is `this - other`. If this is positive and other is positive, this will be negative.
    // If this is negative and other is negative, this will be positive.
    // The `diffChunksWithSmallBorrow` function assumes `chunkList` is the larger one for the initial call,
    // so we need to pass `otherValue` (the larger one) and negate the sign.
    // The `selfValue >= 0` determines the resulting sign if `otherValue` is subtracted from `selfValue`.
    // If `otherValue` is larger, the sign flips.
    return diffChunksWithSmallBorrow(otherValue, Math.abs(selfValue), selfValue >= 0);
  };
  SimpleNumber.prototype.minus = SimpleNumber.prototype.subtract; // Alias for 'subtract'.

  /**
   * Prototype method to invert the sign of an ExtendedNumber.
   *
   * @returns {ExtendedNumber} A new ExtendedNumber instance with the opposite sign.
   */
  ExtendedNumber.prototype.invertSign = function () {
    return new ExtendedNumber(this.components, !this.isNegative);
  };

  /**
   * Prototype method to invert the sign of a SimpleNumber.
   *
   * @returns {SimpleNumber} A new SimpleNumber instance with the opposite sign.
   */
  SimpleNumber.prototype.invertSign = function () {
    var currentSign = this.isNegative;
    var invertedNum = new SimpleNumber(-this.components);
    invertedNum.isNegative = !currentSign; // Ensure the sign property is correctly set.
    return invertedNum;
  };

  /**
   * Prototype method to get the absolute value of an ExtendedNumber.
   *
   * @returns {ExtendedNumber} A new ExtendedNumber instance with a positive sign.
   */
  ExtendedNumber.prototype.absoluteValue = function () {
    return new ExtendedNumber(this.components, false);
  };

  /**
   * Prototype method to get the absolute value of a SimpleNumber.
   *
   * @returns {SimpleNumber} A new SimpleNumber instance with a positive value.
   */
  SimpleNumber.prototype.absoluteValue = function () {
    return new SimpleNumber(Math.abs(this.components));
  };

  /**
   * Performs long multiplication of two chunk arrays (representing positive numbers).
   * This uses the standard grade-school multiplication algorithm.
   *
   * @param {number[]} firstOperand - The first operand's chunk array.
   * @param {number[]} secondOperand - The second operand's chunk array.
   * @returns {number[]} A new chunk array representing the product.
   */
  function longMultiplication(firstOperand, secondOperand) {
    var len1 = firstOperand.length,
      len2 = secondOperand.length,
      // The product can have at most (len1 + len2) chunks.
      productLength = len1 + len2,
      resultChunks = makeZeroFilledArray(productLength),
      baseValue = CHUNK_RADIX,
      currentProduct,
      currentCarry,
      idx1,
      chunkA,
      chunkB;

    for (idx1 = 0; idx1 < len1; ++idx1) {
      chunkA = firstOperand[idx1];
      for (var idx2 = 0; idx2 < len2; ++idx2) {
        chunkB = secondOperand[idx2];
        // Multiply current chunks and add to the corresponding position in the result, plus any previous value.
        currentProduct = chunkA * chunkB + resultChunks[idx1 + idx2];
        currentCarry = Math.floor(currentProduct / baseValue); // Calculate carry.
        resultChunks[idx1 + idx2] = currentProduct - currentCarry * baseValue; // Store current chunk's digit.
        resultChunks[idx1 + idx2 + 1] += currentCarry; // Add carry to the next position.
      }
    }
    normalizeChunkArray(resultChunks); // Clean up any leading zeros.
    return resultChunks;
  }

  /**
   * Multiplies a chunk array by a small, primitive integer factor.
   * This is an optimized multiplication for when one operand is a SimpleNumber.
   *
   * @param {number[]} chunkArr - The chunk array operand.
   * @param {number} smallFactor - The small integer factor.
   * @returns {number[]} A new chunk array representing the product.
   */
  function shortMultiplication(chunkArr, smallFactor) {
    var currentLength = chunkArr.length,
      resultArr = new Array(currentLength),
      baseValue = CHUNK_RADIX,
      currentCarry = 0,
      currentProduct,
      iterator;

    for (iterator = 0; iterator < currentLength; iterator++) {
      currentProduct = chunkArr[iterator] * smallFactor + currentCarry;
      currentCarry = Math.floor(currentProduct / baseValue);
      resultArr[iterator] = currentProduct - currentCarry * baseValue;
    }
    // Propagate any remaining carry.
    while (currentCarry > 0) {
      resultArr[iterator++] = currentCarry % baseValue;
      currentCarry = Math.floor(currentCarry / baseValue);
    }
    return resultArr;
  }

  /**
   * Prepends a specified number of zeros to a chunk array.
   * This is equivalent to multiplying the number by `CHUNK_RADIX` raised to the `zeroCount` power.
   *
   * @param {number[]} chunkSource - The original chunk array.
   * @param {number} zeroCount - The number of zeros (chunks) to prepend.
   * @returns {number[]} A new chunk array with prepended zeros.
   */
  function prependZeros(chunkSource, zeroCount) {
    var newChunks = [];
    while (zeroCount-- > 0) {
      newChunks.push(0);
    }
    return newChunks.concat(chunkSource);
  }

  /**
   * Implements the Karatsuba multiplication algorithm for two chunk arrays.
   * This algorithm is asymptotically faster than long multiplication for very large numbers.
   *
   * @param {number[]} chunkX - The first operand's chunk array.
   * @param {number[]} chunkY - The second operand's chunk array.
   * @returns {number[]} A new chunk array representing the product.
   */
  function karatsubaProduct(chunkX, chunkY) {
    var maxLen = Math.max(chunkX.length, chunkY.length);
    // Base case for recursion: for small arrays, switch to simpler long multiplication.
    if (maxLen <= 30) return longMultiplication(chunkX, chunkY);

    maxLen = Math.ceil(maxLen / 2); // Determine the split point for Karatsuba.

    // Divide chunks into two halves: a_low, b_high for chunkX; c_low, d_high for chunkY.
    var b_high = chunkX.slice(maxLen),
      a_low = chunkX.slice(0, maxLen),
      d_high = chunkY.slice(maxLen),
      c_low = chunkY.slice(0, maxLen);

    // Recursively calculate three sub-products.
    var product_ac = karatsubaProduct(a_low, c_low), // ac
      product_bd = karatsubaProduct(b_high, d_high), // bd
      // (a+b)(c+d)
      product_abcd = karatsubaProduct(sumAnyChunkArrays(a_low, b_high), sumAnyChunkArrays(c_low, d_high));

    // Combine sub-products using the Karatsuba formula:
    // result = bd * R^(2m) + ((a+b)(c+d) - ac - bd) * R^m + ac
    var finalResult = sumAnyChunkArrays(
      sumAnyChunkArrays(product_ac, prependZeros(diffChunkArrays(diffChunkArrays(product_abcd, product_ac), product_bd), maxLen)),
      prependZeros(product_bd, 2 * maxLen)
    );
    normalizeChunkArray(finalResult); // Clean up the result.
    return finalResult;
  }

  /**
   * Heuristic function to determine whether Karatsuba multiplication is more efficient
   * than long multiplication for given operand lengths.
   *
   * @param {number} len1 - Length of the first chunk array.
   * @param {number} len2 - Length of the second chunk array.
   * @returns {boolean} True if Karatsuba should be used, false otherwise.
   */
  function shouldUseKaratsuba(len1, len2) {
    // This is a specific empirical threshold from the original library.
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  /**
   * Prototype method for multiplying an ExtendedNumber instance by another number.
   *
   * @param {number|string|NumBaseType} multiplierVal - The value to multiply by.
   * @returns {ExtendedNumber} A new ExtendedNumber instance representing the product.
   */
  ExtendedNumber.prototype.multiply = function (multiplierVal) {
    var otherNum = parseInputToNumber(multiplierVal), // Normalize the other operand.
      currentChunks = this.components,
      otherChunks = otherNum.components,
      finalSign = this.isNegative !== otherNum.isNegative, // Determine the sign of the product.
      absoluteOther;

    if (otherNum.isPrimitive) {
      var otherPrimitive = otherChunks;
      // Handle special cases for multiplication by 0, 1, or -1.
      if (otherPrimitive === 0) return NumBaseType[0];
      if (otherPrimitive === 1) return this;
      if (otherPrimitive === -1) return this.invertSign();

      absoluteOther = Math.abs(otherPrimitive);
      // If the primitive factor is small enough, use optimized short multiplication.
      if (absoluteOther < CHUNK_RADIX) {
        return new ExtendedNumber(shortMultiplication(currentChunks, absoluteOther), finalSign);
      }
      // Otherwise, convert the primitive factor to chunks.
      otherChunks = convertJsNumToChunkArray(absoluteOther);
    }

    // Decide between Karatsuba and long multiplication based on operand lengths.
    if (shouldUseKaratsuba(currentChunks.length, otherChunks.length)) {
      return new ExtendedNumber(karatsubaProduct(currentChunks, otherChunks), finalSign);
    }
    return new ExtendedNumber(longMultiplication(currentChunks, otherChunks), finalSign);
  };
  ExtendedNumber.prototype.times = ExtendedNumber.prototype.multiply; // Alias for 'multiply'.

  /**
   * Multiplies a small, primitive integer factor by a chunk array.
   * This is a helper function used when one operand is a primitive number.
   *
   * @param {number} smallFactor - The small integer factor.
   * @param {number[]} chunkArr - The chunk array operand.
   * @param {boolean} resultSign - The determined sign of the final product.
   * @returns {ExtendedNumber} A new ExtendedNumber representing the product.
   */
  function multiplyPrimitiveAndChunks(smallFactor, chunkArr, resultSign) {
    if (smallFactor < CHUNK_RADIX) {
      return new ExtendedNumber(shortMultiplication(chunkArr, smallFactor), resultSign);
    }
    // If the small factor is actually large, convert it to chunks and use long multiplication.
    return new ExtendedNumber(longMultiplication(chunkArr, convertJsNumToChunkArray(smallFactor)), resultSign);
  }

  /**
   * Internal method for an ExtendedNumber to multiply itself by a SimpleNumber.
   *
   * @param {SimpleNumber} smallNumObj - The SimpleNumber object to multiply by.
   * @returns {NumBaseType} A new NumBaseType instance (ExtendedNumber or SimpleNumber).
   */
  ExtendedNumber.prototype._multiplyByPrimitive = function (smallNumObj) {
    var smallVal = smallNumObj.components;
    // Handle special cases for 0, 1, -1.
    if (smallVal === 0) return NumBaseType[0];
    if (smallVal === 1) return this;
    if (smallVal === -1) return this.invertSign();
    // Delegate to the helper for multiplication.
    return multiplyPrimitiveAndChunks(Math.abs(smallVal), this.components, this.isNegative !== smallNumObj.isNegative);
  };

  /**
   * Internal method for a SimpleNumber to multiply itself by another SimpleNumber.
   *
   * @param {SimpleNumber} otherSmallNum - The SimpleNumber object to multiply by.
   * @returns {NumBaseType} A new NumBaseType instance (SimpleNumber or ExtendedNumber).
   */
  SimpleNumber.prototype._multiplyByPrimitive = function (otherSmallNum) {
    // If the product of two primitive numbers fits in JS safe integer, return a SimpleNumber.
    if (isWithinSafeRange(otherSmallNum.components * this.components)) {
      return new SimpleNumber(otherSmallNum.components * this.components);
    }
    // Otherwise, convert both to chunk arrays and perform multiplication.
    return multiplyPrimitiveAndChunks(
      Math.abs(otherSmallNum.components),
      convertJsNumToChunkArray(Math.abs(this.components)),
      this.isNegative !== otherSmallNum.isNegative
    );
  };

  /**
   * Prototype method for multiplying a SimpleNumber instance by another number.
   *
   * @param {number|string|NumBaseType} otherVal - The value to multiply by.
   * @returns {NumBaseType} A new NumBaseType instance representing the product.
   */
  SimpleNumber.prototype.multiply = function (otherVal) {
    // Parse the other value and then call the internal multiplication method.
    // The order is `otherVal`._multiplyByPrimitive(this).
    return parseInputToNumber(otherVal)._multiplyByPrimitive(this);
  };
  SimpleNumber.prototype.times = SimpleNumber.prototype.multiply; // Alias for 'multiply'.

  /**
   * Calculates the square of a chunk array.
   * This is an optimized multiplication for `N * N`.
   *
   * @param {number[]} operandChunks - The chunk array to square.
   * @returns {number[]} A new chunk array representing the square.
   */
  function raiseToPowerTwo(operandChunks) {
    var currentLength = operandChunks.length,
      // The square can have at most (2 * length) chunks.
      resultArr = makeZeroFilledArray(currentLength + currentLength),
      baseVal = CHUNK_RADIX,
      currentProduct,
      currentCarry,
      idx_i,
      chunk_i,
      chunk_j;

    for (idx_i = 0; idx_i < currentLength; idx_i++) {
      chunk_i = operandChunks[idx_i];
      currentCarry = 0; // Reset carry for each outer loop iteration.
      // Calculate diagonal (a_i * a_i) and off-diagonal (2 * a_i * a_j) products.
      for (var idx_j = idx_i; idx_j < currentLength; idx_j++) {
        chunk_j = operandChunks[idx_j];
        currentProduct = (idx_i === idx_j ? chunk_i : 2 * chunk_i) * chunk_j + resultArr[idx_i + idx_j] + currentCarry;
        currentCarry = Math.floor(currentProduct / baseVal);
        resultArr[idx_i + idx_j] = currentProduct - currentCarry * baseVal;
      }
      resultArr[idx_i + currentLength] += currentCarry; // Add any remaining carry to the next higher chunk.
    }
    normalizeChunkArray(resultArr); // Clean up leading zeros.
    return resultArr;
  }

  /**
   * Prototype method for squaring an ExtendedNumber instance.
   *
   * @returns {ExtendedNumber} A new ExtendedNumber instance representing the square.
   */
  ExtendedNumber.prototype.square = function () {
    return new ExtendedNumber(raiseToPowerTwo(this.components), false); // Square is always non-negative.
  };

  /**
   * Prototype method for squaring a SimpleNumber instance.
   *
   * @returns {NumBaseType} A new NumBaseType instance representing the square.
   */
  SimpleNumber.prototype.square = function () {
    var squaredValue = this.components * this.components;
    // If the squared value fits in JS safe integer, return a SimpleNumber.
    if (isWithinSafeRange(squaredValue)) {
      return new SimpleNumber(squaredValue);
    }
    // Otherwise, convert to chunks and square.
    return new ExtendedNumber(raiseToPowerTwo(convertJsNumToChunkArray(Math.abs(this.components))), false);
  };

  /**
   * Division and modulo implementation using a normalized divisor (Knuth's D-algorithm).
   * This method is generally efficient for multi-precision division.
   *
   * @param {number[]} dividendChunks - The dividend as a chunk array.
   * @param {number[]} divisorChunks - The divisor as a chunk array.
   * @returns {[NumBaseType, NumBaseType]} An array containing the quotient and remainder as NumBaseType instances.
   */
  function divideAndModuloVariant1(dividendChunks, divisorChunks) {
    var lenDividend = dividendChunks.length,
      lenDivisor = divisorChunks.length,
      // The quotient will have approx. (lenDividend - lenDivisor + 1) chunks.
      quotientResult = makeZeroFilledArray(lenDividend - lenDivisor + 1),
      baseVal = CHUNK_RADIX,
      divisorLeadingDigit = divisorChunks[lenDivisor - 1],
      // Normalization factor (lambda) to make the divisor's most significant digit large.
      // This improves the accuracy of quotient digit estimation.
      normalizationFactor = Math.ceil(baseVal / (2 * divisorLeadingDigit)),
      // Normalize dividend and divisor by multiplying with lambda.
      normalizedRemainder = shortMultiplication(dividendChunks, normalizationFactor),
      normalizedDivisor = shortMultiplication(divisorChunks, normalizationFactor),
      estimatedQuotientDigit,
      currentShift,
      currentCarry,
      currentBorrow,
      loopIdx,
      tempQuotient;

    // Ensure normalized remainder has enough leading zeros for calculations.
    if (normalizedRemainder.length <= lenDividend) normalizedRemainder.push(0);
    normalizedDivisor.push(0); // Add a zero to divisor for easier indexing.
    divisorLeadingDigit = normalizedDivisor[lenDivisor - 1]; // Update leading digit after normalization.

    // Iterate from the most significant possible quotient chunk position downwards.
    for (currentShift = lenDividend - lenDivisor; currentShift >= 0; currentShift--) {
      estimatedQuotientDigit = baseVal - 1; // Initial guess for the quotient digit.
      // Refine the guess if the leading digits don't match (prevents overestimation).
      if (normalizedRemainder[currentShift + lenDivisor] !== divisorLeadingDigit) {
        estimatedQuotientDigit = Math.floor(
          (normalizedRemainder[currentShift + lenDivisor] * baseVal + normalizedRemainder[currentShift + lenDivisor - 1]) /
          divisorLeadingDigit
        );
      }

      currentCarry = 0;
      currentBorrow = 0;
      var currentDivisorLen = normalizedDivisor.length;

      // Multiply divisor by estimatedQuotientDigit and subtract from the current part of the remainder.
      for (loopIdx = 0; loopIdx < currentDivisorLen; loopIdx++) {
        currentCarry += estimatedQuotientDigit * normalizedDivisor[loopIdx];
        tempQuotient = Math.floor(currentCarry / baseVal);
        currentBorrow += normalizedRemainder[currentShift + loopIdx] - (currentCarry - tempQuotient * baseVal);
        currentCarry = tempQuotient;
        if (currentBorrow < 0) {
          normalizedRemainder[currentShift + loopIdx] = currentBorrow + baseVal;
          currentBorrow = -1;
        } else {
          normalizedRemainder[currentShift + loopIdx] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // Adjust the quotient digit if the subtraction resulted in a negative remainder (i.e., guess was too high).
      while (currentBorrow !== 0) {
        estimatedQuotientDigit -= 1;
        currentCarry = 0;
        for (loopIdx = 0; loopIdx < currentDivisorLen; loopIdx++) {
          currentCarry += normalizedRemainder[currentShift + loopIdx] - baseVal + normalizedDivisor[loopIdx];
          if (currentCarry < 0) {
            normalizedRemainder[currentShift + loopIdx] = currentCarry + baseVal;
            currentCarry = 0;
          } else {
            normalizedRemainder[currentShift + loopIdx] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      quotientResult[currentShift] = estimatedQuotientDigit;
    }

    // Denormalize the remainder by dividing it by the normalization factor.
    var finalRemainder = divideAndModuloPrimitive(normalizedRemainder, normalizationFactor)[0];
    return [convertChunksToJsNum(quotientResult), convertChunksToJsNum(finalRemainder)];
  }

  /**
   * Division and modulo implementation using iterative subtraction. (Variant 2)
   * This method is simpler but can be less efficient than Variant 1 for very large numbers.
   * It repeatedly tries to subtract multiples of the divisor from the dividend.
   *
   * @param {number[]} dividendChunks - The dividend as a chunk array.
   * @param {number[]} divisorChunks - The divisor as a chunk array.
   * @returns {[NumBaseType, NumBaseType]} An array containing the quotient and remainder as NumBaseType instances.
   */
  function divideAndModuloVariant2(dividendChunks, divisorChunks) {
    var lenDividend = dividendChunks.length,
      lenDivisor = divisorChunks.length,
      quotientChunks = [],
      currentPartialDividend = [],
      baseVal = CHUNK_RADIX,
      estimatedGuess,
      partialLen,
      highPartial,
      highDivisor,
      checkProduct;

    // Process dividend chunks from most significant to least significant.
    while (lenDividend > 0) {
      currentPartialDividend.unshift(dividendChunks[--lenDividend]); // Prepend next dividend chunk.
      normalizeChunkArray(currentPartialDividend); // Clean up partial dividend.

      // If current partial dividend is smaller than divisor, the quotient digit is 0.
      if (compareChunkMagnitudes(currentPartialDividend, divisorChunks) < 0) {
        quotientChunks.push(0);
        continue;
      }

      partialLen = currentPartialDividend.length;
      highPartial = currentPartialDividend[partialLen - 1] * baseVal + currentPartialDividend[partialLen - 2];
      highDivisor = divisorChunks[lenDivisor - 1] * baseVal + divisorChunks[lenDivisor - 2];

      // Adjust highPartial for estimation if the lengths differ by more than 1.
      if (partialLen > lenDivisor) {
        highPartial = (highPartial + 1) * baseVal;
      }

      estimatedGuess = Math.ceil(highPartial / highDivisor); // Initial guess for the quotient digit.

      // Refine the guess by trial multiplication and subtraction.
      do {
        checkProduct = shortMultiplication(divisorChunks, estimatedGuess);
        if (compareChunkMagnitudes(checkProduct, currentPartialDividend) <= 0) {
          break; // Guess is acceptable (product <= partial dividend).
        }
        estimatedGuess--; // Guess was too high, decrement.
      } while (estimatedGuess);

      quotientChunks.push(estimatedGuess); // Store the determined quotient digit.
      currentPartialDividend = diffChunkArrays(currentPartialDividend, checkProduct); // Update remainder.
    }
    quotientChunks.reverse(); // Quotient chunks were collected in reverse order.
    return [convertChunksToJsNum(quotientChunks), convertChunksToJsNum(currentPartialDividend)];
  }

  /**
   * Divides a chunk array by a small, primitive integer divisor (`lambda`).
   * This is an optimized division for when the divisor is a SimpleNumber.
   *
   * @param {number[]} chunkArr - The dividend as a chunk array.
   * @param {number} smallDivisor - The small integer divisor.
   * @returns {[number[], number]} An array containing the quotient chunks and the primitive remainder.
   */
  function divideAndModuloPrimitive(chunkArr, smallDivisor) {
    var currentLength = chunkArr.length,
      quotientArr = makeZeroFilledArray(currentLength),
      baseVal = CHUNK_RADIX,
      iterator,
      currentQuotient,
      currentRemainder,
      currentDividendChunk;

    currentRemainder = 0; // Initialize remainder from previous chunk.
    // Iterate from most significant chunk downwards.
    for (iterator = currentLength - 1; iterator >= 0; --iterator) {
      currentDividendChunk = currentRemainder * baseVal + chunkArr[iterator]; // Form current dividend part.
      currentQuotient = floorOrCeil(currentDividendChunk / smallDivisor); // Calculate quotient digit.
      currentRemainder = currentDividendChunk - currentQuotient * smallDivisor; // Calculate new remainder.
      quotientArr[iterator] = currentQuotient | 0; // Store quotient digit (ensure integer).
    }
    return [quotientArr, currentRemainder | 0]; // Return quotient chunks and the final primitive remainder.
  }

  /**
   * Performs division and modulo for any two NumBaseType instances.
   * This function orchestrates the choice of division algorithm and handles signs.
   *
   * @param {NumBaseType} selfNum - The dividend object.
   * @param {number|string|NumBaseType} otherVal - The divisor value.
   * @returns {[NumBaseType, NumBaseType]} An array containing the quotient and remainder objects.
   * @throws {Error} If division by zero is attempted.
   */
  function performDivisionAndModulo(selfNum, otherVal) {
    var resultMagnitude,
      otherNum = parseInputToNumber(otherVal); // Normalize divisor.
    var dividendChunks = selfNum.components,
      divisorChunks = otherNum.components;
    var finalQuotient;

    // Handle division by zero.
    if (divisorChunks === 0) throw new Error("Cannot divide by zero");

    // Special handling if the dividend is a SimpleNumber.
    if (selfNum.isPrimitive) {
      if (otherNum.isPrimitive) {
        // Both are SimpleNumbers, perform primitive division.
        return [new SimpleNumber(floorOrCeil(dividendChunks / divisorChunks)), new SimpleNumber(dividendChunks % divisorChunks)];
      }
      // SimpleNumber dividend, ExtendedNumber divisor. Quotient is 0, remainder is the dividend itself.
      return [NumBaseType[0], selfNum];
    }

    // Special handling if the divisor is a SimpleNumber.
    if (otherNum.isPrimitive) {
      var primitiveDivisor = divisorChunks;
      if (primitiveDivisor === 1) return [selfNum, NumBaseType[0]]; // Divide by 1: quotient is self, remainder 0.
      if (primitiveDivisor === -1) return [selfNum.invertSign(), NumBaseType[0]]; // Divide by -1: quotient is negative self, remainder 0.

      var absDivisor = Math.abs(primitiveDivisor);
      if (absDivisor < CHUNK_RADIX) {
        // If the absolute primitive divisor is small enough, use optimized primitive division.
        resultMagnitude = divideAndModuloPrimitive(dividendChunks, absDivisor);
        finalQuotient = convertChunksToJsNum(resultMagnitude[0]);
        var remainderPrimitive = resultMagnitude[1];
        // Adjust remainder sign to match dividend's sign.
        if (selfNum.isNegative) remainderPrimitive = -remainderPrimitive;

        // Convert quotient and remainder to appropriate NumBaseType instances.
        if (typeof finalQuotient === "number") {
          if (selfNum.isNegative !== otherNum.isNegative) finalQuotient = -finalQuotient; // Adjust quotient sign.
          return [new SimpleNumber(finalQuotient), new SimpleNumber(remainderPrimitive)];
        }
        return [new ExtendedNumber(finalQuotient, selfNum.isNegative !== otherNum.isNegative), new SimpleNumber(remainderPrimitive)];
      }
      // If primitive divisor is large, convert it to chunks for general division.
      divisorChunks = convertJsNumToChunkArray(absDivisor);
    }

    // Compare magnitudes to handle cases where dividend < divisor.
    var magnitudeComparison = compareChunkMagnitudes(dividendChunks, divisorChunks);
    if (magnitudeComparison === -1) {
      return [NumBaseType[0], selfNum]; // Dividend is smaller, quotient is 0, remainder is dividend.
    }
    if (magnitudeComparison === 0) {
      // Magnitudes are equal, quotient is 1 (or -1), remainder is 0.
      return [NumBaseType[selfNum.isNegative === otherNum.isNegative ? 1 : -1], NumBaseType[0]];
    }

    // Choose division algorithm based on total length (heuristic).
    if (dividendChunks.length + divisorChunks.length <= 200) {
      resultMagnitude = divideAndModuloVariant1(dividendChunks, divisorChunks);
    } else {
      resultMagnitude = divideAndModuloVariant2(dividendChunks, divisorChunks);
    }

    finalQuotient = resultMagnitude[0];
    var quotientSign = selfNum.isNegative !== otherNum.isNegative; // Quotient sign is XOR of operand signs.
    var finalRemainder = resultMagnitude[1];
    var remainderSign = selfNum.isNegative; // Remainder sign matches dividend sign.

    // Convert quotient to NumBaseType.
    if (typeof finalQuotient === "number") {
      if (quotientSign) finalQuotient = -finalQuotient;
      finalQuotient = new SimpleNumber(finalQuotient);
    } else {
      finalQuotient = new ExtendedNumber(finalQuotient, quotientSign);
    }

    // Convert remainder to NumBaseType.
    if (typeof finalRemainder === "number") {
      if (remainderSign) finalRemainder = -finalRemainder;
      finalRemainder = new SimpleNumber(finalRemainder);
    } else {
      finalRemainder = new ExtendedNumber(finalRemainder, remainderSign);
    }

    return [finalQuotient, finalRemainder];
  }

  /**
   * Prototype method to get both the quotient and remainder of a division.
   *
   * @param {number|string|NumBaseType} otherVal - The divisor.
   * @returns {{quotient: NumBaseType, remainder: NumBaseType}} An object containing the quotient and remainder.
   */
  ExtendedNumber.prototype.divmod = function (otherVal) {
    var divisionResult = performDivisionAndModulo(this, otherVal);
    return {
      quotient: divisionResult[0],
      remainder: divisionResult[1]
    };
  };
  SimpleNumber.prototype.divmod = ExtendedNumber.prototype.divmod; // Share the method.

  /**
   * Prototype method to get only the quotient of a division.
   *
   * @param {number|string|NumBaseType} otherVal - The divisor.
   * @returns {NumBaseType} The quotient.
   */
  ExtendedNumber.prototype.divide = function (otherVal) {
    return performDivisionAndModulo(this, otherVal)[0];
  };
  // Aliases for divide.
  SimpleNumber.prototype.over = SimpleNumber.prototype.divide = ExtendedNumber.prototype.over = ExtendedNumber.prototype.divide;

  /**
   * Prototype method to get only the remainder of a division.
   *
   * @param {number|string|NumBaseType} otherVal - The divisor.
   * @returns {NumBaseType} The remainder.
   */
  ExtendedNumber.prototype.getModulo = function (otherVal) {
    return performDivisionAndModulo(this, otherVal)[1];
  };
  // Aliases for getModulo.
  SimpleNumber.prototype.remainder = SimpleNumber.prototype.getModulo = ExtendedNumber.prototype.remainder = ExtendedNumber.prototype.getModulo;

  /**
   * Prototype method to raise a number to a specified power.
   * Handles various edge cases for exponents and bases.
   *
   * @param {number|string|NumBaseType} exponentVal - The exponent.
   * @returns {NumBaseType} The result of the exponentiation.
   * @throws {Error} If the exponent is too large or negative (for non-zero base).
   */
  ExtendedNumber.prototype.exponentiate = function (exponentVal) {
    var exponentNum = parseInputToNumber(exponentVal),
      baseChunks = this.components,
      expValue = exponentNum.components,
      resultValue,
      currentBase,
      accumulator;

    // Handle base cases for exponentiation.
    if (expValue === 0) return NumBaseType[1]; // x^0 = 1.
    if (baseChunks === 0) return NumBaseType[0]; // 0^x = 0 for x > 0.
    if (baseChunks === 1) return NumBaseType[1]; // 1^x = 1.
    if (baseChunks === -1) return exponentNum.isEvenNumber() ? NumBaseType[1] : NumBaseType[-1]; // (-1)^x.

    // If exponent is negative, for integer results, it becomes 0 (e.g., 2^-1 = 0.5 -> 0).
    if (exponentNum.isNegative) return NumBaseType[0];
    // Exponent must be a SimpleNumber.
    if (!exponentNum.isPrimitive) {
      throw new Error("The exponent " + exponentNum.outputAsString() + " is too large.");
    }

    // Optimize for small bases that can be computed with native Math.pow.
    if (this.isPrimitive) {
      if (isWithinSafeRange(resultValue = Math.pow(baseChunks, expValue))) {
        return new SimpleNumber(floorOrCeil(resultValue));
      }
    }

    currentBase = this;
    accumulator = NumBaseType[1]; // Initialize result to 1.

    // Use binary exponentiation (exponentiation by squaring) for efficiency.
    while (true) {
      if ((expValue & 1) === 1) {
        accumulator = accumulator.times(currentBase); // If current bit of exponent is 1, multiply.
        --expValue;
      }
      if (expValue === 0) break; // If exponent is 0, done.
      expValue /= 2; // Halve the exponent.
      currentBase = currentBase.square(); // Square the base.
    }
    return accumulator;
  };
  SimpleNumber.prototype.exponentiate = ExtendedNumber.prototype.exponentiate; // Share the method.

  /**
   * Prototype method for modular exponentiation (base^exp % mod).
   *
   * @param {number|string|NumBaseType} exponent - The exponent.
   * @param {number|string|NumBaseType} modulus - The modulus.
   * @returns {NumBaseType} The result of the modular exponentiation.
   * @throws {Error} If the modulus is zero.
   */
  ExtendedNumber.prototype.modularExponentiation = function (exponent, modulus) {
    exponent = parseInputToNumber(exponent);
    modulus = parseInputToNumber(modulus);

    if (modulus.isZeroValue()) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var result = NumBaseType[1],
      currentBase = this.getModulo(modulus); // Reduce the base modulo modulus first.

    // Use binary exponentiation with modulo at each step to keep numbers small.
    while (exponent.isPositiveNumber()) {
      if (currentBase.isZeroValue()) return NumBaseType[0]; // If base is 0, result is 0.
      if (exponent.isOddNumber()) {
        result = result.multiply(currentBase).getModulo(modulus); // (result * base) % modulus.
      }
      exponent = exponent.divide(2); // exponent = exponent / 2.
      currentBase = currentBase.square().getModulo(modulus); // base = (base * base) % modulus.
    }
    return result;
  };
  SimpleNumber.prototype.modularExponentiation = ExtendedNumber.prototype.modularExponentiation; // Share the method.

  /**
   * Compares the absolute magnitudes of two chunk arrays.
   *
   * @param {number[]} arrX - The first chunk array.
   * @param {number[]} arrY - The second chunk array.
   * @returns {number} 1 if arrX > arrY, -1 if arrX < arrY, 0 if equal.
   */
  function compareChunkMagnitudes(arrX, arrY) {
    if (arrX.length !== arrY.length) {
      return arrX.length > arrY.length ? 1 : -1; // Longer array implies larger magnitude.
    }
    // If lengths are equal, compare chunk by chunk from most significant to least significant.
    for (var idx = arrX.length - 1; idx >= 0; idx--) {
      if (arrX[idx] !== arrY[idx]) {
        return arrX[idx] > arrY[idx] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical.
  }

  /**
   * Prototype method to compare the absolute value (magnitude) of this ExtendedNumber with another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {number} 1 if |this| > |other|, -1 if |this| < |other|, 0 if equal.
   */
  ExtendedNumber.prototype.compareAbsoluteValue = function (otherVal) {
    var otherNum = parseInputToNumber(otherVal), // Normalize the other operand.
      selfChunks = this.components,
      otherChunks = otherNum.components;
    // An ExtendedNumber (non-zero) is generally larger in magnitude than a SimpleNumber.
    if (otherNum.isPrimitive) return 1;
    return compareChunkMagnitudes(selfChunks, otherChunks);
  };

  /**
   * Prototype method to compare the absolute value (magnitude) of this SimpleNumber with another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {number} 1 if |this| > |other|, -1 if |this| < |other|, 0 if equal.
   */
  SimpleNumber.prototype.compareAbsoluteValue = function (otherVal) {
    var otherNum = parseInputToNumber(otherVal), // Normalize the other operand.
      selfAbsValue = Math.abs(this.components),
      otherAbsValue = otherNum.components;
    if (otherNum.isPrimitive) {
      // If both are primitive, directly compare their absolute values.
      otherAbsValue = Math.abs(otherAbsValue);
      return selfAbsValue === otherAbsValue ? 0 : selfAbsValue > otherAbsValue ? 1 : -1;
    }
    return -1; // A SimpleNumber is always smaller in magnitude than an ExtendedNumber (unless the ExtendedNumber is 0, which would be a SimpleNumber).
  };

  /**
   * Prototype method to compare this ExtendedNumber with another value, considering signs.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {number} 1 if this > other, -1 if this < other, 0 if equal.
   */
  ExtendedNumber.prototype.compareValues = function (otherVal) {
    // Handle comparisons with JavaScript's Infinity.
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;

    var otherNum = parseInputToNumber(otherVal), // Normalize the other operand.
      selfChunks = this.components,
      otherChunks = otherNum.components;

    // First, compare based on signs. Positive numbers are always greater than negative ones.
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1; // If `this` is positive and `other` is negative, `this` is greater (1).
    }

    // If signs are the same, and `other` is a SimpleNumber.
    // An ExtendedNumber (non-zero) is generally larger in magnitude than a SimpleNumber.
    // If both positive: Extended > Simple. If both negative: Extended < Simple (e.g., -100 < -5).
    if (otherNum.isPrimitive) {
      return this.isNegative ? -1 : 1;
    }

    // Both are ExtendedNumbers or `otherNum` became an ExtendedNumber.
    // Compare magnitudes and apply the common sign.
    return compareChunkMagnitudes(selfChunks, otherChunks) * (this.isNegative ? -1 : 1);
  };
  ExtendedNumber.prototype.compareTo = ExtendedNumber.prototype.compareValues; // Alias.

  /**
   * Prototype method to compare this SimpleNumber with another value, considering signs.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {number} 1 if this > other, -1 if this < other, 0 if equal.
   */
  SimpleNumber.prototype.compareValues = function (otherVal) {
    // Handle comparisons with JavaScript's Infinity.
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;

    var otherNum = parseInputToNumber(otherVal), // Normalize the other operand.
      selfValue = this.components,
      otherValue = otherNum.components;

    if (otherNum.isPrimitive) {
      // If both are primitive, directly compare their values.
      return selfValue === otherValue ? 0 : selfValue > otherValue ? 1 : -1;
    }

    // If `this` is a SimpleNumber and `other` is an ExtendedNumber.
    // Compare based on signs first.
    if (selfValue < 0 !== otherNum.isNegative) {
      return selfValue < 0 ? -1 : 1; // If `this` is negative, it's smaller. If `this` is positive, it's larger.
    }
    // If signs are the same, and `this` is primitive, it means `this` is smaller in magnitude.
    // If both are negative, smaller magnitude means larger value (e.g., -5 > -10).
    return selfValue < 0 ? 1 : -1; // If negative, `this` is larger. If positive, `this` is smaller.
  };
  SimpleNumber.prototype.compareTo = SimpleNumber.prototype.compareValues; // Alias.

  /**
   * Prototype method to check if this number is equal to another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {boolean} True if equal, false otherwise.
   */
  ExtendedNumber.prototype.isEqualTo = function (otherVal) {
    return this.compareValues(otherVal) === 0;
  };
  // Aliases for isEqualTo.
  SimpleNumber.prototype.eq = SimpleNumber.prototype.isEqualTo = ExtendedNumber.prototype.eq = ExtendedNumber.prototype.isEqualTo;

  /**
   * Prototype method to check if this number is not equal to another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {boolean} True if not equal, false otherwise.
   */
  ExtendedNumber.prototype.isNotEqualTo = function (otherVal) {
    return this.compareValues(otherVal) !== 0;
  };
  // Aliases for isNotEqualTo.
  SimpleNumber.prototype.neq = SimpleNumber.prototype.isNotEqualTo = ExtendedNumber.prototype.neq = ExtendedNumber.prototype.isNotEqualTo;

  /**
   * Prototype method to check if this number is strictly greater than another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {boolean} True if greater, false otherwise.
   */
  ExtendedNumber.prototype.isGreaterThan = function (otherVal) {
    return this.compareValues(otherVal) > 0;
  };
  // Aliases for isGreaterThan.
  SimpleNumber.prototype.gt = SimpleNumber.prototype.isGreaterThan = ExtendedNumber.prototype.gt = ExtendedNumber.prototype.isGreaterThan;

  /**
   * Prototype method to check if this number is strictly lesser than another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {boolean} True if lesser, false otherwise.
   */
  ExtendedNumber.prototype.isLesserThan = function (otherVal) {
    return this.compareValues(otherVal) < 0;
  };
  // Aliases for isLesserThan.
  SimpleNumber.prototype.lt = SimpleNumber.prototype.isLesserThan = ExtendedNumber.prototype.lt = ExtendedNumber.prototype.isLesserThan;

  /**
   * Prototype method to check if this number is greater than or equal to another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {boolean} True if greater or equal, false otherwise.
   */
  ExtendedNumber.prototype.isGreaterOrEqualTo = function (otherVal) {
    return this.compareValues(otherVal) >= 0;
  };
  // Aliases for isGreaterOrEqualTo.
  SimpleNumber.prototype.geq = SimpleNumber.prototype.isGreaterOrEqualTo = ExtendedNumber.prototype.geq = ExtendedNumber.prototype.isGreaterOrEqualTo;

  /**
   * Prototype method to check if this number is lesser than or equal to another value.
   *
   * @param {number|string|NumBaseType} otherVal - The value to compare against.
   * @returns {boolean} True if lesser or equal, false otherwise.
   */
  ExtendedNumber.prototype.isLesserOrEqualTo = function (otherVal) {
    return this.compareValues(otherVal) <= 0;
  };
  // Aliases for isLesserOrEqualTo.
  SimpleNumber.prototype.leq = SimpleNumber.prototype.isLesserOrEqualTo = ExtendedNumber.prototype.leq = ExtendedNumber.prototype.isLesserOrEqualTo;

  /**
   * Prototype method to check if an ExtendedNumber is even.
   * This is determined by checking the least significant chunk.
   *
   * @returns {boolean} True if even, false otherwise.
   */
  ExtendedNumber.prototype.isEvenNumber = function () {
    return (this.components[0] & 1) === 0;
  };

  /**
   * Prototype method to check if a SimpleNumber is even.
   * This is determined by checking the primitive value.
   *
   * @returns {boolean} True if even, false otherwise.
   */
  SimpleNumber.prototype.isEvenNumber = function () {
    return (this.components & 1) === 0;
  };

  /**
   * Prototype method to check if an ExtendedNumber is odd.
   * This is determined by checking the least significant chunk.
   *
   * @returns {boolean} True if odd, false otherwise.
   */
  ExtendedNumber.prototype.isOddNumber = function () {
    return (this.components[0] & 1) === 1;
  };

  /**
   * Prototype method to check if a SimpleNumber is odd.
   * This is determined by checking the primitive value.
   *
   * @returns {boolean} True if odd, false otherwise.
   */
  SimpleNumber.prototype.isOddNumber = function () {
    return (this.components & 1) === 1;
  };

  /**
   * Prototype method to check if an ExtendedNumber is positive.
   *
   * @returns {boolean} True if positive, false otherwise.
   */
  ExtendedNumber.prototype.isPositiveNumber = function () {
    return !this.isNegative;
  };

  /**
   * Prototype method to check if a SimpleNumber is positive.
   *
   * @returns {boolean} True if positive, false otherwise.
   */
  SimpleNumber.prototype.isPositiveNumber = function () {
    return this.components > 0;
  };

  /**
   * Prototype method to check if an ExtendedNumber is negative.
   *
   * @returns {boolean} True if negative, false otherwise.
   */
  ExtendedNumber.prototype.isNegativeNumber = function () {
    return this.isNegative;
  };

  /**
   * Prototype method to check if a SimpleNumber is negative.
   *
   * @returns {boolean} True if negative, false otherwise.
   */
  SimpleNumber.prototype.isNegativeNumber = function () {
    return this.components < 0;
  };

  /**
   * Prototype method to check if an ExtendedNumber is 1 or -1.
   * (A non-zero ExtendedNumber will usually not be 1 or -1, as those are SimpleNumbers).
   *
   * @returns {boolean} Always false for ExtendedNumber in typical use cases.
   */
  ExtendedNumber.prototype.isOneOrMinusOne = function () {
    return false;
  };

  /**
   * Prototype method to check if a SimpleNumber is 1 or -1.
   *
   * @returns {boolean} True if its absolute value is 1, false otherwise.
   */
  SimpleNumber.prototype.isOneOrMinusOne = function () {
    return Math.abs(this.components) === 1;
  };

  /**
   * Prototype method to check if an ExtendedNumber is zero.
   * (Zero is always represented as a SimpleNumber).
   *
   * @returns {boolean} Always false for ExtendedNumber.
   */
  ExtendedNumber.prototype.isZeroValue = function () {
    return false;
  };

  /**
   * Prototype method to check if a SimpleNumber is zero.
   *
   * @returns {boolean} True if its value is 0, false otherwise.
   */
  SimpleNumber.prototype.isZeroValue = function () {
    return this.components === 0;
  };

  /**
   * Prototype method to check if this number is divisible by another value.
   *
   * @param {number|string|NumBaseType} divisorVal - The value to check divisibility by.
   * @returns {boolean} True if divisible, false otherwise.
   */
  ExtendedNumber.prototype.canBeDividedBy = function (divisorVal) {
    var divisorNum = parseInputToNumber(divisorVal);
    var divisorValue = divisorNum.components;
    if (divisorValue === 0) return false; // Cannot divide by zero.
    if (divisorValue === 1) return true; // Any number is divisible by 1.
    if (divisorValue === 2) return this.isEvenNumber(); // Optimized check for divisibility by 2.
    // For other divisors, check if the remainder is zero.
    return this.getModulo(divisorNum).isEqualTo(NumBaseType[0]);
  };
  SimpleNumber.prototype.canBeDividedBy = ExtendedNumber.prototype.canBeDividedBy; // Share the method.

  /**
   * Checks if a number is a small prime (2, 3, 5) or quickly determined as composite.
   *
   * @param {NumBaseType} numToCheck - The number to check.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if not a small prime (requires further testing).
   */
  function isSmallPrime(numToCheck) {
    var absoluteNum = numToCheck.absoluteValue();
    if (absoluteNum.isOneOrMinusOne()) return false; // 1 and -1 are not prime.
    if (absoluteNum.isEqualTo(2) || absoluteNum.isEqualTo(3) || absoluteNum.isEqualTo(5)) return true; // Smallest primes.
    // Quickly rule out composites divisible by 2, 3, or 5.
    if (absoluteNum.isEvenNumber() || absoluteNum.canBeDividedBy(3) || absoluteNum.canBeDividedBy(5)) return false;
    if (absoluteNum.isLesserThan(25)) return true; // Primes up to 23 not covered above (7, 11, 13, 17, 19, 23).
    // For numbers >= 25, more robust tests are needed.
  }

  /**
   * Prototype method to check if an ExtendedNumber is prime using the Miller-Rabin test for larger numbers.
   *
   * @returns {boolean} True if the number is prime, false otherwise.
   */
  ExtendedNumber.prototype.checkPrime = function () {
    var preCheckResult = isSmallPrime(this);
    if (preCheckResult !== voidVal) return preCheckResult; // Use fast check for small numbers.

    var currentNum = this.absoluteValue(),
      numMinusOne = currentNum.decrementValue();
    // Miller-Rabin primality test (deterministic for numbers up to a certain size with these bases).
    var testBases = [2, 3, 5, 7, 11, 13, 17, 19],
      d_val = numMinusOne,
      isWitness,
      testBase,
      loopIndex,
      exponentResult;

    // Find d and s such that n-1 = d * 2^s, where d is odd.
    while (d_val.isEvenNumber()) {
      d_val = d_val.divide(2);
    }

    for (loopIndex = 0; loopIndex < testBases.length; loopIndex++) {
      testBase = largeNumProcessor(testBases[loopIndex]).modularExponentiation(d_val, currentNum);
      // Check first Miller-Rabin condition: a^d = 1 (mod n) or a^d = n-1 (mod n).
      if (testBase.isEqualTo(NumBaseType[1]) || testBase.isEqualTo(numMinusOne)) continue;

      isWitness = true; // Assume it's a composite (witness found).
      // Check second Miller-Rabin condition: a^(d*2^r) = n-1 (mod n) for 0 <= r < s.
      for (var tempD = d_val; isWitness && tempD.isLesserThan(numMinusOne); tempD = tempD.multiply(2)) {
        exponentResult = testBase.square().getModulo(currentNum);
        if (exponentResult.isEqualTo(numMinusOne)) {
          isWitness = false; // Not a witness, so number might be prime.
        }
        testBase = exponentResult;
      }
      if (isWitness) return false; // If a witness was found, it's definitely composite.
    }
    return true; // Passed all tests, is prime.
  };
  SimpleNumber.prototype.checkPrime = ExtendedNumber.prototype.checkPrime; // Share the method.

  /**
   * Prototype method to check if an ExtendedNumber is a probable prime using the Miller-Rabin test.
   * This test is probabilistic; more iterations increase certainty.
   *
   * @param {number} [numIterations=5] - The number of Miller-Rabin iterations to perform.
   * @returns {boolean} True if probably prime, false otherwise.
   */
  ExtendedNumber.prototype.checkProbablePrime = function (numIterations) {
    var preCheckResult = isSmallPrime(this);
    if (preCheckResult !== voidVal) return preCheckResult;

    var currentNum = this.absoluteValue();
    var iterationsCount = numIterations === voidVal ? 5 : numIterations; // Default to 5 iterations.

    for (var loopIdx = 0; loopIdx < iterationsCount; loopIdx++) {
      // Generate a random base 'a' such that 2 <= a <= n-2.
      var randomBase = largeNumProcessor.generateRandomBetween(2, currentNum.minus(2));
      // Perform the Miller-Rabin test: check if a^(n-1) = 1 (mod n).
      // If not, it's definitely composite.
      if (!randomBase.modularExponentiation(currentNum.decrementValue(), currentNum).isOneOrMinusOne()) {
        return false;
      }
    }
    return true; // Passed all iterations, likely prime.
  };
  SimpleNumber.prototype.checkProbablePrime = ExtendedNumber.prototype.checkProbablePrime; // Share the method.

  /**
   * Prototype method to compute the modular multiplicative inverse using the extended Euclidean algorithm.
   * Finds `x` such that `(this * x) % modulus = 1`.
   *
   * @param {number|string|NumBaseType} modulus - The modulus `n`.
   * @returns {NumBaseType} The modular inverse `x`.
   * @throws {Error} If `this` and `modulus` are not co-prime (GCD is not 1).
   */
  ExtendedNumber.prototype.modularInverse = function (modulus) {
    var tempT = largeNumProcessor.nullValue,
      newTempT = largeNumProcessor.unitValue,
      remainder = parseInputToNumber(modulus),
      newRemainder = this.absoluteValue(), // Use absolute value for calculations.
      quotientVal,
      lastTempT,
      lastRemainder;

    // Extended Euclidean algorithm to find GCD(a, n) and coefficients.
    while (!newRemainder.isEqualTo(largeNumProcessor.nullValue)) {
      quotientVal = remainder.divide(newRemainder);
      lastTempT = tempT;
      lastRemainder = remainder;

      tempT = newTempT;
      remainder = newRemainder;

      newTempT = lastTempT.subtract(quotientVal.multiply(newTempT));
      newRemainder = lastRemainder.subtract(quotientVal.multiply(newRemainder));
    }

    // If GCD is not 1, then no modular inverse exists.
    if (!remainder.isEqualTo(1)) {
      throw new Error(this.outputAsString() + " and " + modulus.outputAsString() + " are not co-prime");
    }

    // Ensure the result is positive and within [0, modulus-1].
    if (tempT.compareValues(0) === -1) {
      tempT = tempT.add(modulus);
    }

    // If the original number was negative, the inverse must also be negated.
    if (this.isNegativeNumber()) {
      return tempT.invertSign();
    }
    return tempT;
  };
  SimpleNumber.prototype.modularInverse = ExtendedNumber.prototype.modularInverse; // Share the method.

  /**
   * Prototype method to get the next integer (this + 1).
   *
   * @returns {NumBaseType} A new NumBaseType instance representing this + 1.
   */
  ExtendedNumber.prototype.incrementValue = function () {
    var currentChunks = this.components;
    if (this.isNegative) {
      // If negative, incrementing means subtracting 1 from its absolute value.
      return diffChunksWithSmallBorrow(currentChunks, 1, this.isNegative);
    }
    // If positive, simply add 1.
    return new ExtendedNumber(sumChunksWithSmallCarry(currentChunks, 1), this.isNegative);
  };

  /**
   * Prototype method to get the next integer (this + 1) for a SimpleNumber.
   *
   * @returns {NumBaseType} A new NumBaseType instance (SimpleNumber or ExtendedNumber).
   */
  SimpleNumber.prototype.incrementValue = function () {
    var currentValue = this.components;
    if (currentValue + 1 < JS_MAX_SAFE_INTEGER) {
      return new SimpleNumber(currentValue + 1);
    }
    // If incrementing makes it exceed the safe integer limit, convert to an ExtendedNumber.
    return new ExtendedNumber(JS_MAX_SAFE_CHUNKS, false);
  };

  /**
   * Prototype method to get the previous integer (this - 1).
   *
   * @returns {NumBaseType} A new NumBaseType instance representing this - 1.
   */
  ExtendedNumber.prototype.decrementValue = function () {
    var currentChunks = this.components;
    if (this.isNegative) {
      // If negative, decrementing means adding 1 to its absolute value and keeping the negative sign.
      return new ExtendedNumber(sumChunksWithSmallCarry(currentChunks, 1), true);
    }
    // If positive, simply subtract 1.
    return diffChunksWithSmallBorrow(currentChunks, 1, this.isNegative);
  };

  /**
   * Prototype method to get the previous integer (this - 1) for a SimpleNumber.
   *
   * @returns {NumBaseType} A new NumBaseType instance (SimpleNumber or ExtendedNumber).
   */
  SimpleNumber.prototype.decrementValue = function () {
    var currentValue = this.components;
    if (currentValue - 1 > -JS_MAX_SAFE_INTEGER) {
      return new SimpleNumber(currentValue - 1);
    }
    // If decrementing makes it fall below the safe integer limit, convert to an ExtendedNumber.
    return new ExtendedNumber(JS_MAX_SAFE_CHUNKS, true);
  };

  // Pre-calculated powers of two for optimized bitwise shifts.
  var powersOfTwoChunks = [1];
  while (2 * powersOfTwoChunks[powersOfTwoChunks.length - 1] <= CHUNK_RADIX) {
    powersOfTwoChunks.push(2 * powersOfTwoChunks[powersOfTwoChunks.length - 1]);
  }
  var p2ChunkCount = powersOfTwoChunks.length, // Number of powers of 2 less than or equal to CHUNK_RADIX.
    largestPowerOfTwoChunk = powersOfTwoChunks[p2ChunkCount - 1]; // The largest power of 2 that fits in a chunk.

  /**
   * Checks if the shift amount is small enough to be handled directly or if it requires special handling.
   *
   * @param {number|string|NumBaseType} shiftAmount - The amount by which to shift.
   * @returns {boolean} True if the shift amount is considered "small", false otherwise.
   */
  function isShiftAmountSmall(shiftAmount) {
    return (
      (typeof shiftAmount === "number" || typeof shiftAmount === "string") && Math.abs(+shiftAmount) <= CHUNK_RADIX ||
      (shiftAmount instanceof ExtendedNumber && shiftAmount.components.length <= 1)
    );
  }

  /**
   * Prototype method for bitwise left shift (effectively multiplication by powers of 2).
   *
   * @param {number|string|NumBaseType} shiftBy - The number of bits to shift left.
   * @returns {NumBaseType} The result of the left shift.
   * @throws {Error} If the shift amount is too large.
   */
  ExtendedNumber.prototype.bitwiseShiftLeft = function (shiftBy) {
    if (!isShiftAmountSmall(shiftBy)) {
      throw new Error(String(shiftBy) + " is too large for shifting.");
    }
    shiftBy = +shiftBy; // Ensure numeric value.
    if (shiftBy < 0) return this.bitwiseShiftRight(-shiftBy); // Negative left shift is a right shift.

    var currentResult = this;
    if (currentResult.isZeroValue()) return currentResult;

    // Apply shifts in chunks of `largestPowerOfTwoChunk` (which is 2^(p2ChunkCount-1)).
    while (shiftBy >= p2ChunkCount) {
      currentResult = currentResult.multiply(largestPowerOfTwoChunk);
      shiftBy -= p2ChunkCount - 1; // Adjust remaining shift amount.
    }
    return currentResult.multiply(powersOfTwoChunks[shiftBy]); // Apply the remaining smaller shift.
  };
  SimpleNumber.prototype.bitwiseShiftLeft = ExtendedNumber.prototype.bitwiseShiftLeft; // Share the method.

  /**
   * Prototype method for bitwise right shift (effectively division by powers of 2).
   *
   * @param {number|string|NumBaseType} shiftBy - The number of bits to shift right.
   * @returns {NumBaseType} The result of the right shift.
   * @throws {Error} If the shift amount is too large.
   */
  ExtendedNumber.prototype.bitwiseShiftRight = function (shiftBy) {
    var divisionRemainderAndQuotient;
    if (!isShiftAmountSmall(shiftBy)) {
      throw new Error(String(shiftBy) + " is too large for shifting.");
    }
    shiftBy = +shiftBy; // Ensure numeric value.
    if (shiftBy < 0) return this.bitwiseShiftLeft(-shiftBy); // Negative right shift is a left shift.

    var currentResult = this;
    while (shiftBy >= p2ChunkCount) {
      // If result is 0 or -1, shifting right doesn't change it.
      if (currentResult.isZeroValue() || (currentResult.isNegativeNumber() && currentResult.isOneOrMinusOne())) {
        return currentResult;
      }
      divisionRemainderAndQuotient = performDivisionAndModulo(currentResult, largestPowerOfTwoChunk);
      // For negative numbers, right shift should effectively be floor division.
      currentResult = divisionRemainderAndQuotient[1].isNegativeNumber() ?
        divisionRemainderAndQuotient[0].decrementValue() :
        divisionRemainderAndQuotient[0];
      shiftBy -= p2ChunkCount - 1; // Adjust remaining shift amount.
    }
    divisionRemainderAndQuotient = performDivisionAndModulo(currentResult, powersOfTwoChunks[shiftBy]);
    // Adjust result for negative numbers (floor division).
    return divisionRemainderAndQuotient[1].isNegativeNumber() ?
      divisionRemainderAndQuotient[0].decrementValue() :
      divisionRemainderAndQuotient[0];
  };
  SimpleNumber.prototype.bitwiseShiftRight = ExtendedNumber.prototype.bitwiseShiftRight; // Share the method.

  /**
   * Performs a generic bitwise operation (`AND`, `OR`, `XOR`) between two NumBaseType instances.
   * This function handles negative numbers by using a two's complement-like approach.
   *
   * @param {NumBaseType} operandX - The first operand.
   * @param {number|string|NumBaseType} operandY - The second operand.
   * @param {function(number, number): number} operationFn - The specific bitwise function (e.g., `(a,b) => a & b`).
   * @returns {NumBaseType} The result of the bitwise operation.
   */
  function performBitwiseOp(operandX, operandY, operationFn) {
    operandY = parseInputToNumber(operandY); // Normalize the second operand.

    var signX = operandX.isNegativeNumber(),
      signY = operandY.isNegativeNumber();
    // For negative numbers, bitwise operations often use a two's complement representation.
    // `bitwiseNOT()` (which is -x - 1) is used here to derive a representation similar to two's complement.
    var remainingX = signX ? operandX.bitwiseNOT() : operandX,
      remainingY = signY ? operandY.bitwiseNOT() : operandY;

    var digitX = 0,
      digitY = 0;
    var divModX = null,
      divModY = null;
    var resultChunks = [];

    // Iterate through chunks, performing the bitwise operation on corresponding parts.
    while (!remainingX.isZeroValue() || !remainingY.isZeroValue()) {
      divModX = performDivisionAndModulo(remainingX, largestPowerOfTwoChunk);
      digitX = divModX[1].getJSNumber();
      if (signX) {
        digitX = largestPowerOfTwoChunk - 1 - digitX; // Invert bits for negative numbers.
      }

      divModY = performDivisionAndModulo(remainingY, largestPowerOfTwoChunk);
      digitY = divModY[1].getJSNumber();
      if (signY) {
        digitY = largestPowerOfTwoChunk - 1 - digitY; // Invert bits for negative numbers.
      }

      remainingX = divModX[0];
      remainingY = divModY[0];
      resultChunks.push(operationFn(digitX, digitY)); // Apply the bitwise operation.
    }

    // Determine the sign of the overall result.
    // This is a simplified logic for bitwise operations on large numbers with signs.
    var finalSum = operationFn(signX ? 1 : 0, signY ? 1 : 0) !== 0 ? largeNumProcessor(-1) : largeNumProcessor(0);

    // Reconstruct the number from the result chunks.
    for (var idx = resultChunks.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.multiply(largestPowerOfTwoChunk).add(largeNumProcessor(resultChunks[idx]));
    }
    return finalSum;
  }

  /**
   * Prototype method for bitwise NOT (~).
   * Implemented as `-(x + 1)` which is the two's complement definition.
   *
   * @returns {NumBaseType} The result of the bitwise NOT operation.
   */
  ExtendedNumber.prototype.bitwiseNOT = function () {
    return this.invertSign().decrementValue();
  };
  SimpleNumber.prototype.bitwiseNOT = ExtendedNumber.prototype.bitwiseNOT; // Share the method.

  /**
   * Prototype method for bitwise AND (&).
   *
   * @param {number|string|NumBaseType} otherNum - The second operand.
   * @returns {NumBaseType} The result of the bitwise AND.
   */
  ExtendedNumber.prototype.bitwiseAND = function (otherNum) {
    return performBitwiseOp(this, otherNum, function (valA, valB) {
      return valA & valB;
    });
  };
  SimpleNumber.prototype.bitwiseAND = ExtendedNumber.prototype.bitwiseAND; // Share the method.

  /**
   * Prototype method for bitwise OR (|).
   *
   * @param {number|string|NumBaseType} otherNum - The second operand.
   * @returns {NumBaseType} The result of the bitwise OR.
   */
  ExtendedNumber.prototype.bitwiseOR = function (otherNum) {
    return performBitwiseOp(this, otherNum, function (valA, valB) {
      return valA | valB;
    });
  };
  SimpleNumber.prototype.bitwiseOR = ExtendedNumber.prototype.bitwiseOR; // Share the method.

  /**
   * Prototype method for bitwise XOR (^).
   *
   * @param {number|string|NumBaseType} otherNum - The second operand.
   * @returns {NumBaseType} The result of the bitwise XOR.
   */
  ExtendedNumber.prototype.bitwiseXOR = function (otherNum) {
    return performBitwiseOp(this, otherNum, function (valA, valB) {
      return valA ^ valB;
    });
  };
  SimpleNumber.prototype.bitwiseXOR = ExtendedNumber.prototype.bitwiseXOR; // Share the method.

  // Masks for rough Lowest One Bit (LOB) calculation.
  var LOB_MASK_JS_INT = 1 << 30; // A mask for standard JavaScript integers (up to 30 bits).
  // A composite mask for big integers, combining the first two chunks.
  var LOB_MASK_BIG_INT = (CHUNK_RADIX & -CHUNK_RADIX) * (CHUNK_RADIX & -CHUNK_RADIX) | LOB_MASK_JS_INT;

  /**
   * Estimates the Lowest One Bit (LOB) for a number.
   * This is a heuristic used in the GCD algorithm to quickly find factors of 2.
   *
   * @param {NumBaseType} numInstance - The number instance.
   * @returns {number} A rough estimate of the LOB (e.g., 1, 2, 4, 8...).
   */
  function estimateLowestBit(numInstance) {
    var rawValue = numInstance.components;
    var lobEstimate = typeof rawValue === "number" ?
      rawValue | LOB_MASK_JS_INT : // For primitive numbers, use the primitive value.
      rawValue[0] + rawValue[1] * CHUNK_RADIX | LOB_MASK_BIG_INT; // For chunk arrays, combine first two chunks.
    return lobEstimate & -lobEstimate; // This trick isolates the lowest set bit.
  }

  /**
   * Calculates the integer logarithm of a value with respect to a given base.
   * Used as a building block for bit length calculation.
   *
   * @param {NumBaseType} targetValue - The number for which to calculate the logarithm.
   * @param {NumBaseType} logBase - The base of the logarithm.
   * @returns {{p: NumBaseType, e: number}} An object containing `p` (power of base) and `e` (exponent).
   */
  function calculateIntegerLog(targetValue, logBase) {
    if (logBase.compareValues(targetValue) <= 0) {
      // Recursive step: log_b(N) = 2 * log_(b^2)(N) or 2 * log_(b^2)(N) + 1.
      var tempResult = calculateIntegerLog(targetValue, logBase.square());
      var currentPower = tempResult.p;
      var currentExponent = tempResult.e;
      var productWithBase = currentPower.multiply(logBase);
      // Determine if an additional factor of 'logBase' is needed.
      return productWithBase.compareValues(targetValue) <= 0 ? {
        p: productWithBase,
        e: currentExponent * 2 + 1
      } : {
        p: currentPower,
        e: currentExponent * 2
      };
    }
    return {
      p: largeNumProcessor(1),
      e: 0
    }; // Base case: If base > value, logarithm is 0 (or 1 if 0-based).
  }

  /**
   * Prototype method to get the bit length of a number (number of bits required to represent it).
   * For negative numbers, it returns the bit length of `-(x+1)` (two's complement representation).
   *
   * @returns {NumBaseType} The bit length as a NumBaseType instance.
   */
  ExtendedNumber.prototype.getBitLength = function () {
    var currentNum = this;
    // For negative numbers, bit length is based on two's complement.
    if (currentNum.compareValues(largeNumProcessor(0)) < 0) {
      currentNum = currentNum.invertSign().subtract(largeNumProcessor(1));
    }
    if (currentNum.compareValues(largeNumProcessor(0)) === 0) {
      return largeNumProcessor(0);
    }
    // Calculate log base 2 and add 1 (e.g., log2(7) is 2.8, so 3 bits needed).
    return largeNumProcessor(calculateIntegerLog(currentNum, largeNumProcessor(2)).e).add(largeNumProcessor(1));
  };
  SimpleNumber.prototype.getBitLength = ExtendedNumber.prototype.getBitLength; // Share the method.

  /**
   * Finds the maximum of two numbers.
   *
   * @param {number|string|NumBaseType} valA - The first value.
   * @param {number|string|NumBaseType} valB - The second value.
   * @returns {NumBaseType} The larger of the two numbers.
   */
  function findMaximum(valA, valB) {
    valA = parseInputToNumber(valA);
    valB = parseInputToNumber(valB);
    return valA.isGreaterThan(valB) ? valA : valB;
  }

  /**
   * Finds the minimum of two numbers.
   *
   * @param {number|string|NumBaseType} valA - The first value.
   * @param {number|string|NumBase